/** Fixed locale so the server render and the hydrated client agree on every date string. */
const LOCALE = 'en-GB';

const DATE_FORMAT = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

const RELATIVE_FORMAT = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

const NUMBER_FORMAT = new Intl.NumberFormat(LOCALE);

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * `17 Sep 2026`, or a dash for a missing date.
 **/
export const formatDate = (value: string | Date | null | undefined): string =>
  value ? DATE_FORMAT.format(new Date(value)) : '—';

/**
 * `17 Sep 2026, 14:05` (UTC), or a dash for a missing date.
 **/
export const formatDateTime = (value: string | Date | null | undefined): string =>
  value ? DATE_TIME_FORMAT.format(new Date(value)) : '—';

/**
 * Human distance to a timestamp — `in 3 days`, `2 hours ago`.
 **/
export const formatRelative = (value: string | Date): string => {
  const deltaMs = new Date(value).getTime() - Date.now();
  const absMs = Math.abs(deltaMs);

  if (absMs >= DAY_MS) {
    return RELATIVE_FORMAT.format(Math.round(deltaMs / DAY_MS), 'day');
  }

  if (absMs >= HOUR_MS) {
    return RELATIVE_FORMAT.format(Math.round(deltaMs / HOUR_MS), 'hour');
  }

  return RELATIVE_FORMAT.format(Math.round(deltaMs / MINUTE_MS), 'minute');
};

/**
 * How a link's expiry reads in the UI — `Never`, `Expired` or the distance to it.
 **/
export const formatExpiry = (expiresAt: string | null): string => {
  if (!expiresAt) {
    return 'Never';
  }

  return new Date(expiresAt).getTime() <= Date.now() ? 'Expired' : formatRelative(expiresAt);
};

/**
 * Thousands-separated integer.
 **/
export const formatNumber = (value: number): string => NUMBER_FORMAT.format(value);

/**
 * A URL without its scheme, truncated in the middle so both ends stay readable.
 **/
export const formatUrlForDisplay = (url: string, maxLength = 48): string => {
  const stripped = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (stripped.length <= maxLength) {
    return stripped;
  }

  const head = Math.ceil((maxLength - 1) / 2);
  const tail = Math.floor((maxLength - 1) / 2);

  return `${stripped.slice(0, head)}…${stripped.slice(-tail)}`;
};

/**
 * `YYYY-MM-DDTHH:mm` for a `datetime-local` input, in the viewer's own timezone.
 **/
export const toDateTimeLocalValue = (value: string | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * MINUTE_MS;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};
