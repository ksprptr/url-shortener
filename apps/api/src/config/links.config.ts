import { registerAs } from '@nestjs/config';

export const linksConfig = registerAs('links', () => ({
  // Links one IP may create from the public form per rolling day.
  publicDailyLimit: parseInt(process.env['PUBLIC_LINK_DAILY_LIMIT'] ?? '5', 10),
  // Generated slug length; 7 base62 characters is ~3.5e12 combinations.
  slugLength: parseInt(process.env['SLUG_LENGTH'] ?? '7', 10),
}));

export type LinksConfig = ReturnType<typeof linksConfig>;
