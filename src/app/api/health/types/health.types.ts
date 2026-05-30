export interface HealthCheckResult {
  status: HealthCheckStatus;
  info?: HealthIndicatorResults;
  error?: HealthIndicatorResults;
  details: HealthIndicatorResults;
}

export interface HealthIndicatorResults {
  [serviceName: string]: HealthIndicator;
}

export interface HealthIndicator {
  status: HealthIndicatorStatus;
  statusCode?: number;
  message?: string;
}

export interface DependencyService {
  name: string;
  url: string;
}

export type HealthCheckStatus = 'error' | 'ok';
export type HealthIndicatorStatus = 'up' | 'down';
