/**
 * Function to get csrf token and session id from the api
 */
export const getCsrfSession = async (): Promise<{ csrfToken: string; sessionId: string }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf-token`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch csrf token');
    }

    const { csrfToken } = await response.json();
    const sessionId = response.headers.get('set-cookie')?.split('SESSION-ID=')[1].split(';')[0];

    if (!csrfToken || !sessionId) {
      throw new Error('Csrf token or session id is missing');
    }

    return { csrfToken, sessionId };
  } catch (error) {
    console.error('Error fetching csrf token:', error);

    throw error;
  }
};
