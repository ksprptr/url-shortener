import { Body, Controller, HttpCode, Param, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { ResponseEntity } from '@/common/entities/response.entity';
import { RateLimit } from '@/common/services/rate-limit/decorators/rate-limit.decorator';

import { CreateLinkDto } from './dto/create-link.dto';
import { CreatedLinkEntity } from './entities/created-link.entity';
import { ResolvedLinkEntity } from './entities/resolved-link.entity';
import { LinksService } from './links.service';

/**
 * Public link routes — shortening from the landing page and the redirect lookup.
 **/
@ApiTags('Links')
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Public()
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiCreatedResponse({ type: CreatedLinkEntity, description: 'Link created' })
  @ApiBadRequestResponse({ type: ResponseEntity, description: 'Invalid target URL' })
  @ApiTooManyRequestsResponse({ type: ResponseEntity, description: 'Daily limit reached' })
  // A burst cap on top of the persistent per-IP daily quota the service enforces.
  @RateLimit({ points: 10, duration: 60, blockDuration: 300 })
  @Post()
  async create(@Body() dto: CreateLinkDto, @Req() request: Request): Promise<CreatedLinkEntity> {
    const link = await this.linksService.createPublic(dto, request.ip ?? null);

    return {
      id: link.id,
      slug: link.slug,
      shortUrl: link.shortUrl,
      targetUrl: link.targetUrl,
      expiresAt: link.expiresAt,
    };
  }

  @Public()
  @ApiOperation({ summary: 'Resolve a slug and count the visit' })
  @ApiOkResponse({ type: ResolvedLinkEntity, description: 'Target resolved' })
  @ApiNotFoundResponse({ type: ResponseEntity, description: 'Unknown slug' })
  @ApiGoneResponse({ type: ResponseEntity, description: 'Expired or disabled' })
  // POST so a prefetching crawler can't inflate the counter; 200 because nothing is created.
  @RateLimit({ points: 120, duration: 60 })
  @HttpCode(200)
  @Post(':slug/resolve')
  resolve(@Param('slug') slug: string): Promise<ResolvedLinkEntity> {
    return this.linksService.resolve(slug);
  }
}
