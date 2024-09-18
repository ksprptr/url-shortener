import prisma from '@/utils/prisma/prisma-client';

/**
 * Route handler to get the shortened URL by the shortened URL ID
 */
export async function GET(request: Request, { params }: { params: { shortenedUrlId: string } }) {
  const shortenedUrlId = params.shortenedUrlId;
  const shortenedUrl = await prisma.shortenedUrl.findUnique({
    where: {
      id: shortenedUrlId,
    },
  });

  if (!shortenedUrl) {
    return Response.json({
      status: 404,
      message: 'ksprptr.dev | 404 - Shortened URL not found',
    });
  }

  const expirated = shortenedUrl.expirationDate
    ? !(new Date(shortenedUrl.expirationDate) > new Date())
    : false;

  if (expirated) {
    await prisma.shortenedUrl.delete({
      where: {
        id: shortenedUrlId,
      },
    });

    return Response.json({
      status: 404,
      message: 'ksprptr.dev | 404 - Shortened URL not found',
    });
  }

  return Response.json({
    status: 302,
    message: 'ksprptr.dev | 302 - Shortened URL found',
    redirectUrl: shortenedUrl.originUrl,
  });
}
