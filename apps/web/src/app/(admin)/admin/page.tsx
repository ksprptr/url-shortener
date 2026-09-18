import type { LinkPage, LinkStats } from '@url-shortener/types';
import type { Metadata } from 'next';

import { getStats, listLinks } from '@/common/services/api/links.api';
import { getCurrentUser } from '@/common/services/auth/current-user';
import AdminDashboard from '@/components/layouts/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/** The dashboard reads live counters, so it must never be served from a cache. */
export const dynamic = 'force-dynamic';

const EMPTY_PAGE: LinkPage = { items: [], total: 0, page: 1, pageSize: 20, pageCount: 1 };

/**
 * Admin route — the session gate plus the first render's data, so the client mounts with no waterfall.
 **/
export default async function AdminPage() {
  await getCurrentUser();

  // One failing panel shouldn't blank the whole admin; each falls back to an empty shape.
  const [statsResult, pageResult] = await Promise.allSettled([getStats(), listLinks()]);

  const stats: LinkStats =
    statsResult.status === 'fulfilled'
      ? statsResult.value
      : {
          totalLinks: 0,
          activeLinks: 0,
          expiredLinks: 0,
          disabledLinks: 0,
          totalClicks: 0,
          clicksLast30Days: 0,
          createdLast30Days: 0,
          topLinks: [],
          daily: [],
        };

  return (
    <AdminDashboard
      initialStats={stats}
      initialPage={pageResult.status === 'fulfilled' ? pageResult.value : EMPTY_PAGE}
    />
  );
}
