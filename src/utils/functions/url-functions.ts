/**
 * Function to get a project URL based on the environment
 */
export const getProjectUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return 'https://link.ksprptr.dev';
};
