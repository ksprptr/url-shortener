interface AppConfig {
  /** Display name of the app — the wordmarks, the titles, the manifest and the OG image. */
  name: string;
}

// Static on purpose: a single instance, one name. No `server-only` here, so client components and
// `metadataConfig` can read it directly instead of having it threaded down as a prop.
export const appConfig: AppConfig = {
  name: 'URL Shortener',
};
