interface GetDependencyUrlParams {
  baseUrl: string;
  healthCheckRoute: string;
}

/**
 * Function to get formatted url of the specified dependency service
 */
export const getDependencyUrl = ({ baseUrl, healthCheckRoute }: GetDependencyUrlParams): string => {
  const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  try {
    const url = new URL(formattedBaseUrl);
    const origin = url.origin;

    const formattedHealthCheckRoute = healthCheckRoute.startsWith('/')
      ? healthCheckRoute
      : `/${healthCheckRoute}`;

    return `${origin}${formattedHealthCheckRoute}`;
  } catch {
    throw new Error(`Invalid base URL: ${baseUrl}`);
  }
};
