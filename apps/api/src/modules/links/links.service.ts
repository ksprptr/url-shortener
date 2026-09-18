import {
  BadRequestException,
  ConflictException,
  GoneException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  DailyStat,
  Link as LinkContract,
  LinkPage,
  LinkSource,
  LinkStats,
  LinkStatus,
} from '@url-shortener/types';
import { Prisma } from 'prisma/generated/prisma/client';

import { handlePrismaError } from '@/common/utils/prisma-error.functions';
import { type AppConfig, appConfig } from '@/config/app.config';
import { type JwtConfig, jwtConfig } from '@/config/jwt.config';
import { type LinksConfig, linksConfig } from '@/config/links.config';
import { PrismaService } from '@/prisma/prisma.service';

import { AdminCreateLinkDto } from './dto/admin-create-link.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { ListLinksDto } from './dto/list-links.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  SLUG_GENERATION_ATTEMPTS,
  STATS_WINDOW_DAYS,
  TOP_LINKS_LIMIT,
} from './links.constants';
import {
  generateSlug,
  hashCreator,
  isReservedSlug,
  isSelfReferencing,
  normalizeTargetUrl,
  resolveExpiration,
  toDayKey,
  toLinkContract,
  toUtcDay,
} from './links.functions';

interface CreateLinkParams {
  targetUrl: string;
  expiresAt: Date | null;
  slug?: string;
  note?: string | null;
  source: LinkSource;
  creatorHash?: string | null;
}

/**
 * Owns every short link: creation (public + admin), the redirect lookup and the dashboard numbers.
 **/
@Injectable()
export class LinksService {
  constructor(
    @Inject(appConfig.KEY) private readonly appCfg: AppConfig,
    @Inject(jwtConfig.KEY) private readonly jwtCfg: JwtConfig,
    @Inject(linksConfig.KEY) private readonly linksCfg: LinksConfig,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Creates a link from the public form, enforcing the per-IP daily quota.
   **/
  async createPublic(dto: CreateLinkDto, clientIp: string | null): Promise<LinkContract> {
    // No address = no quota to enforce; refuse rather than hand out an unmetered link.
    if (!clientIp) {
      throw new BadRequestException('Unable to determine the client address.');
    }

    const creatorHash = hashCreator(clientIp, this.jwtCfg.accessSecret);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const usedToday = await this.prismaService.link.count({
      where: { creatorHash, source: 'PUBLIC', createdAt: { gte: since } },
    });

    if (usedToday >= this.linksCfg.publicDailyLimit) {
      throw new HttpException(
        `You have reached the limit of ${this.linksCfg.publicDailyLimit} links per day. Try again later.`,
        429,
      );
    }

    return this.create({
      targetUrl: dto.targetUrl,
      expiresAt: resolveExpiration(dto.expiration),
      source: 'PUBLIC',
      creatorHash,
    });
  }

  /**
   * Creates a link from the admin, with an optional custom slug, note and absolute expiry.
   **/
  async createAsAdmin(dto: AdminCreateLinkDto): Promise<LinkContract> {
    return this.create({
      targetUrl: dto.targetUrl,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : resolveExpiration(dto.expiration),
      slug: dto.slug,
      note: dto.note ?? null,
      source: 'ADMIN',
    });
  }

  /**
   * Resolves a slug to its target and records the visit; expired/disabled links are gone, not missing.
   **/
  async resolve(slug: string): Promise<{ targetUrl: string }> {
    const link = await this.prismaService.link.findUnique({ where: { slug } });

    if (!link) {
      throw new NotFoundException('This short link does not exist.');
    }

    if (link.disabledAt) {
      throw new GoneException('This short link has been disabled.');
    }

    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
      throw new GoneException('This short link has expired.');
    }

    await this.recordVisit(link.id);

    return { targetUrl: link.targetUrl };
  }

  /**
   * One page of the admin link table, filtered/sorted by the query.
   **/
  async list(query: ListLinksDto): Promise<LinkPage> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const where = this.buildWhere(query);

    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.link.count({ where }),
      this.prismaService.link.findMany({
        where,
        orderBy: this.buildOrderBy(query),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: items.map((link) => toLinkContract(link, this.appCfg.webAppUrl)),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  /**
   * A single link by id.
   **/
  async findOne(id: string): Promise<LinkContract> {
    const link = await this.prismaService.link.findUnique({ where: { id } });

    if (!link) {
      throw new NotFoundException('Link not found.');
    }

    return toLinkContract(link, this.appCfg.webAppUrl);
  }

  /**
   * Applies an admin edit; omitted fields are left untouched.
   **/
  async update(id: string, dto: UpdateLinkDto): Promise<LinkContract> {
    const data: Prisma.LinkUpdateInput = {};

    if (dto.targetUrl !== undefined) {
      data.targetUrl = this.assertTargetUrl(dto.targetUrl);
    }

    if (dto.slug !== undefined) {
      this.assertSlugAvailable(dto.slug);
      data.slug = dto.slug;
    }

    if (dto.note !== undefined) {
      data.note = dto.note || null;
    }

    if (dto.expiresAt !== undefined) {
      data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    if (dto.disabled !== undefined) {
      data.disabledAt = dto.disabled ? new Date() : null;
    }

    try {
      const link = await this.prismaService.link.update({ where: { id }, data });

      return toLinkContract(link, this.appCfg.webAppUrl);
    } catch (error) {
      handlePrismaError(error, {
        P2002: 'That slug is already taken.',
        P2025: 'Link not found.',
      });
    }
  }

  /**
   * Deletes a link and, by cascade, its per-day counters.
   **/
  async remove(id: string): Promise<void> {
    try {
      await this.prismaService.link.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, { P2025: 'Link not found.' });
    }
  }

  /**
   * Everything the admin dashboard shows: the totals, the most-visited links and the daily series.
   **/
  async stats(): Promise<LinkStats> {
    const now = new Date();
    const windowStart = toUtcDay(now);
    windowStart.setUTCDate(windowStart.getUTCDate() - (STATS_WINDOW_DAYS - 1));

    const [totalLinks, activeLinks, expiredLinks, disabledLinks, clickSum, topLinks] =
      await this.prismaService.$transaction([
        this.prismaService.link.count(),
        this.prismaService.link.count({ where: this.statusWhere('ACTIVE') }),
        this.prismaService.link.count({ where: this.statusWhere('EXPIRED') }),
        this.prismaService.link.count({ where: this.statusWhere('DISABLED') }),
        this.prismaService.link.aggregate({ _sum: { clickCount: true } }),
        this.prismaService.link.findMany({
          where: { clickCount: { gt: 0 } },
          orderBy: [{ clickCount: 'desc' }, { createdAt: 'desc' }],
          take: TOP_LINKS_LIMIT,
        }),
      ]);

    const [clickRows, createdRows] = await Promise.all([
      this.prismaService.linkDailyStat.groupBy({
        by: ['date'],
        where: { date: { gte: windowStart } },
        _sum: { clicks: true },
      }),
      this.prismaService.link.findMany({
        where: { createdAt: { gte: windowStart } },
        select: { createdAt: true },
      }),
    ]);

    const daily = this.buildDailySeries(windowStart, clickRows, createdRows);

    return {
      totalLinks,
      activeLinks,
      expiredLinks,
      disabledLinks,
      totalClicks: clickSum._sum.clickCount ?? 0,
      clicksLast30Days: daily.reduce((sum, day) => sum + day.clicks, 0),
      createdLast30Days: createdRows.length,
      topLinks: topLinks.map((link) => toLinkContract(link, this.appCfg.webAppUrl)),
      daily,
    };
  }

  /**
   * Shared creation path: validates the target, settles on a slug and writes the row.
   **/
  private async create(params: CreateLinkParams): Promise<LinkContract> {
    const targetUrl = this.assertTargetUrl(params.targetUrl);

    if (params.slug) {
      this.assertSlugAvailable(params.slug);
    }

    const data = {
      targetUrl,
      expiresAt: params.expiresAt,
      note: params.note ?? null,
      source: params.source,
      creatorHash: params.creatorHash ?? null,
    };

    if (params.slug) {
      try {
        const link = await this.prismaService.link.create({ data: { ...data, slug: params.slug } });

        return toLinkContract(link, this.appCfg.webAppUrl);
      } catch (error) {
        handlePrismaError(error, { P2002: 'That slug is already taken.' });
      }
    }

    // Generated slugs collide only by chance, so retry on the unique violation instead of pre-checking.
    for (let attempt = 0; attempt < SLUG_GENERATION_ATTEMPTS; attempt += 1) {
      const slug = generateSlug(this.linksCfg.slugLength);

      try {
        // eslint-disable-next-line no-await-in-loop -- each attempt depends on the previous one failing
        const link = await this.prismaService.link.create({ data: { ...data, slug } });

        return toLinkContract(link, this.appCfg.webAppUrl);
      } catch (error) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          error.code !== 'P2002' ||
          attempt === SLUG_GENERATION_ATTEMPTS - 1
        ) {
          throw error;
        }
      }
    }

    throw new ConflictException('Could not allocate a free slug. Try again.');
  }

  /**
   * Normalizes and validates a target URL, or rejects it.
   **/
  private assertTargetUrl(rawUrl: string): string {
    const targetUrl = normalizeTargetUrl(rawUrl);

    if (!targetUrl) {
      throw new BadRequestException('Enter a valid http(s) URL.');
    }

    if (isSelfReferencing(targetUrl, this.appCfg.webAppUrl)) {
      throw new BadRequestException('A short link cannot point back at this app.');
    }

    return targetUrl;
  }

  /**
   * Rejects a custom slug that would be shadowed by one of the web app's own routes.
   **/
  private assertSlugAvailable(slug: string): void {
    if (isReservedSlug(slug)) {
      throw new ConflictException('That slug is reserved by the app.');
    }
  }

  /**
   * Bumps the link's counters and its bucket in the per-day series.
   **/
  // No address, agent or referrer is recorded — an aggregate per UTC day is the whole history.
  private async recordVisit(linkId: string): Promise<void> {
    const now = new Date();
    const date = toUtcDay(now);

    await this.prismaService.$transaction([
      this.prismaService.link.update({
        where: { id: linkId },
        data: { clickCount: { increment: 1 }, lastVisitedAt: now },
      }),
      this.prismaService.linkDailyStat.upsert({
        where: { linkId_date: { linkId, date } },
        update: { clicks: { increment: 1 } },
        create: { linkId, date, clicks: 1 },
      }),
    ]);
  }

  /**
   * Prisma filter for a derived status — `DISABLED` wins, so the other two exclude it.
   **/
  private statusWhere(status: LinkStatus): Prisma.LinkWhereInput {
    const now = new Date();

    switch (status) {
      case 'DISABLED':
        return { disabledAt: { not: null } };
      case 'EXPIRED':
        return { disabledAt: null, expiresAt: { not: null, lte: now } };
      case 'ACTIVE':
      default:
        return { disabledAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
    }
  }

  /**
   * Turns the listing query into a Prisma filter.
   **/
  private buildWhere(query: ListLinksDto): Prisma.LinkWhereInput {
    const filters: Prisma.LinkWhereInput[] = [];

    if (query.status) {
      filters.push(this.statusWhere(query.status));
    }

    const search = query.search?.trim();
    if (search) {
      filters.push({
        OR: [
          { slug: { contains: search, mode: 'insensitive' } },
          { targetUrl: { contains: search, mode: 'insensitive' } },
          { note: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    return filters.length > 0 ? { AND: filters } : {};
  }

  /**
   * Turns the listing query into a Prisma ordering, tie-broken by id so paging is stable.
   **/
  private buildOrderBy(query: ListLinksDto): Prisma.LinkOrderByWithRelationInput[] {
    const direction = query.direction ?? 'desc';
    const field = query.sort ?? 'createdAt';

    // Nullable columns: keep "never expires" / "never visited" out of the way of real values.
    const primary: Prisma.LinkOrderByWithRelationInput =
      field === 'expiresAt' || field === 'lastVisitedAt'
        ? { [field]: { sort: direction, nulls: 'last' } }
        : { [field]: direction };

    return [primary, { id: 'desc' }];
  }

  /**
   * Fills the 30-day window with one entry per day, zeroes included, oldest first.
   **/
  private buildDailySeries(
    windowStart: Date,
    clickRows: { date: Date; _sum: { clicks: number | null } }[],
    createdRows: { createdAt: Date }[],
  ): DailyStat[] {
    const clicksByDay = new Map(clickRows.map((row) => [toDayKey(row.date), row._sum.clicks ?? 0]));

    const createdByDay = new Map<string, number>();
    for (const row of createdRows) {
      const key = toDayKey(row.createdAt);
      createdByDay.set(key, (createdByDay.get(key) ?? 0) + 1);
    }

    return Array.from({ length: STATS_WINDOW_DAYS }, (_value, index) => {
      const day = new Date(windowStart);
      day.setUTCDate(day.getUTCDate() + index);
      const key = toDayKey(day);

      return { date: key, clicks: clicksByDay.get(key) ?? 0, created: createdByDay.get(key) ?? 0 };
    });
  }
}
