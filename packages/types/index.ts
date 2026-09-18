// Shared API contract — the API's Swagger entities `implements` these, so the two cannot drift apart.

/** Whether the link was created from the public form or from the admin. */
export type LinkSource = 'PUBLIC' | 'ADMIN';

/** Derived state of a link, computed by the API from `expiresAt` / `disabledAt`. */
export type LinkStatus = 'ACTIVE' | 'EXPIRED' | 'DISABLED';

/** Presets the public form offers; the API turns one into an absolute `expiresAt`. */
export type Expiration = 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'NEVER';

/** Sortable columns of the admin link table. */
export type LinkSortField = 'createdAt' | 'clickCount' | 'expiresAt' | 'lastVisitedAt' | 'slug';

export type SortDirection = 'asc' | 'desc';

/** A short link as the API returns it. */
export interface Link {
  id: string;
  slug: string;
  targetUrl: string;
  /** Free-text admin label; never shown to visitors. */
  note: string | null;
  expiresAt: string | null;
  disabledAt: string | null;
  clickCount: number;
  lastVisitedAt: string | null;
  source: LinkSource;
  createdAt: string;
  updatedAt: string;
  /** Absolute short URL, built by the API from its configured web origin. */
  shortUrl: string;
  status: LinkStatus;
}

/** One page of the admin link table. */
export interface LinkPage {
  items: Link[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** Query of the admin link listing (every field optional; the API applies its defaults). */
export interface ListLinksQuery {
  page?: number;
  pageSize?: number;
  /** Matches the slug, the target URL or the note. */
  search?: string;
  status?: LinkStatus;
  sort?: LinkSortField;
  direction?: SortDirection;
}

/** Body of the public shorten form. */
export interface CreateLinkPayload {
  targetUrl: string;
  expiration: Expiration;
}

/** Body of the admin create form — an absolute expiry and an optional custom slug. */
export interface AdminCreateLinkPayload {
  targetUrl: string;
  slug?: string;
  note?: string;
  expiresAt?: string | null;
}

/** Body of the admin edit form; omitted fields are left untouched. */
export interface UpdateLinkPayload {
  targetUrl?: string;
  slug?: string;
  note?: string | null;
  expiresAt?: string | null;
  disabled?: boolean;
}

/** What the visitor's browser needs after a successful shorten. */
export interface CreatedLink {
  id: string;
  slug: string;
  shortUrl: string;
  targetUrl: string;
  expiresAt: string | null;
}

/** Answer of the redirect lookup — the target, or why there isn't one. */
export interface ResolvedLink {
  targetUrl: string;
}

/** A single day of the admin dashboard chart. */
export interface DailyStat {
  /** `YYYY-MM-DD`, UTC. */
  date: string;
  clicks: number;
  created: number;
}

/** Aggregate numbers behind the admin dashboard. */
export interface LinkStats {
  totalLinks: number;
  activeLinks: number;
  expiredLinks: number;
  disabledLinks: number;
  totalClicks: number;
  clicksLast30Days: number;
  createdLast30Days: number;
  /** Most-visited links, newest tie-break; capped by the API. */
  topLinks: Link[];
  /** One entry per day for the last 30 days, oldest first — gaps filled with zeroes. */
  daily: DailyStat[];
}

/** Body of the operator login form. */
export interface LoginPayload {
  password: string;
}

/** Answer of `GET /auth/me` — there is one operator, so there is nothing else to say. */
export interface AuthUser {
  authenticated: boolean;
}

/** Error shape every failed API call returns (`GlobalExceptionFilter`). */
export interface ApiErrorResponse {
  status: number;
  message: string | string[];
}
