import { getEnvString } from '@/utils/functions/environments.functions';

import { DependencyService } from '../types/health.types';
import { getDependencyUrl } from '../utils/health.functions';

/**
 * List of dependency services to health check
 */
export const dependencies: DependencyService[] = [
  {
    name: 'central_api',
    url: getDependencyUrl({
      baseUrl: getEnvString({ key: 'NEXT_PUBLIC_API_URL' }),
      healthCheckRoute: getEnvString({ key: 'API_HEALTH_CHECK_ROUTE' }),
    }),
  },
];
