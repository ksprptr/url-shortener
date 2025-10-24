/**
 * Function to get csrf token and session id from the api
 */
export const getCsrfSession = async (): Promise<{ csrfToken: string; sessionId: string }> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf-token`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch CSRF token');

  const { csrfToken } = await response.json();

  const setCookie = response.headers.get('set-cookie');
  const sessionId = setCookie?.match(/SESSION-ID=([^;]+)/)?.[1];

  if (!csrfToken || !sessionId) throw new Error('CSRF token or SESSION-ID is missing');

  return { csrfToken, sessionId };
};
