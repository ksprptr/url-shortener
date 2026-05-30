interface GetEnvParams {
  key: string;
}

/**
 * Function to get a string environment variable
 */
export const getEnvString = ({ key }: GetEnvParams): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`[ENV] Config value for key "${key}" is not set`);
  }

  return value;
};

/**
 * Function to get a number environment variable
 */
export const getEnvNumber = ({ key }: GetEnvParams): number => {
  const value = getEnvString({ key });
  const numberValue = Number(value);

  if (isNaN(numberValue)) {
    throw new Error(`[ENV] Config value for key "${key}" is not a number`);
  }

  return numberValue;
};

/**
 * Function to get array of string from comma separated environment variable
 */
export const getEnvStringArray = ({ key }: GetEnvParams): string[] => {
  const value = getEnvString({ key });

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};
