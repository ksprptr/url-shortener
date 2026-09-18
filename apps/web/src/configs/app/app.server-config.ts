import 'server-only';

interface AppServerConfig {
  nodeEnv: {
    isProduction: boolean;
  };
  urls: {
    /** API base for server-to-server calls. */
    apiUrl: string;
    /** Public origin of this web app (canonical / OpenGraph / robots / sitemap / short links). */
    appUrl: string;
  };
}

export const appServerConfig: AppServerConfig = {
  nodeEnv: {
    isProduction: process.env.NODE_ENV === 'production',
  },
  urls: {
    apiUrl: (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, ''),
    appUrl: (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  },
};
