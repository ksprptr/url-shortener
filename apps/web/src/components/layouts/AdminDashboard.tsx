'use client';

import type {
  AdminCreateLinkPayload,
  Link as ShortLink,
  LinkPage,
  LinkSortField,
  LinkStats,
  LinkStatus,
  SortDirection,
  UpdateLinkPayload,
} from '@url-shortener/types';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createLinkAction,
  deleteLinkAction,
  listLinksAction,
  statsAction,
  updateLinkAction,
} from '@/actions/links/links.actions';
import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LinkFormModal from '@/components/forms/LinkFormModal';
import AdminHeader from '@/components/layouts/AdminHeader';
import ClicksChart from '@/components/layouts/ClicksChart';
import LinksTable from '@/components/layouts/LinksTable';
import StatCards from '@/components/layouts/StatCards';
import TopLinks from '@/components/layouts/TopLinks';
import { useToast } from '@/components/providers/ToastProvider';

interface Props {
  initialStats: LinkStats;
  initialPage: LinkPage;
}

const SEARCH_DEBOUNCE_MS = 300;

/**
 * The admin: owns the filter/paging state, reloads through the Server Actions and wires the dialogs.
 **/
export default function AdminDashboard({ initialStats, initialPage }: Props) {
  const toast = useToast();

  const [stats, setStats] = useState(initialStats);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LinkStatus | ''>('');
  const [sort, setSort] = useState<LinkSortField>('createdAt');
  const [direction, setDirection] = useState<SortDirection>('desc');
  const [pageNumber, setPageNumber] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ShortLink | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ShortLink | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  // The RSC already delivered the first page; skip the identical refetch on mount.
  const hydrated = useRef(false);

  const loadLinks = useCallback(async () => {
    setLoading(true);

    const result = await listLinksAction({
      page: pageNumber,
      search: debouncedSearch || undefined,
      status: status || undefined,
      sort,
      direction,
    });

    setLoading(false);

    if (result.ok && result.data) {
      setPage(result.data);

      // Deleting the last row of the last page shrinks pageCount below the page being viewed, and
      // the pager only renders above one page — without this the viewer is stranded on an empty
      // table with no control to get back.
      const lastPage = Math.max(1, result.data.pageCount);
      if (pageNumber > lastPage) {
        setPageNumber(lastPage);
      }

      return;
    }

    toast.error(result.error ?? 'Could not load the links.');
    // `toast` is stable (a memoised context value), so only the query state belongs in the deps.
  }, [pageNumber, debouncedSearch, status, sort, direction]);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }

    void loadLinks();
  }, [loadLinks]);

  // A filter change always lands the viewer back on the first page of the new result set.
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch, status, sort, direction]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);

    const [statsResult] = await Promise.all([statsAction(), loadLinks()]);

    setRefreshing(false);

    if (statsResult.ok && statsResult.data) {
      setStats(statsResult.data);
      return;
    }

    toast.error(statsResult.error ?? 'Could not refresh the dashboard.');
  }, [loadLinks]);

  const handleSort = (field: LinkSortField) => {
    if (field === sort) {
      setDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSort(field);
    // Text reads best A→Z; counts and dates read best newest/highest first.
    setDirection(field === 'slug' ? 'asc' : 'desc');
  };

  const handleCreate = async (payload: AdminCreateLinkPayload): Promise<boolean> => {
    const result = await createLinkAction(payload);

    if (!result.ok) {
      toast.error(result.error ?? 'Could not create the link.');
      return false;
    }

    toast.success('Link created.');
    await refreshAll();

    return true;
  };

  const handleUpdate = async (id: string, payload: UpdateLinkPayload): Promise<boolean> => {
    const result = await updateLinkAction(id, payload);

    if (!result.ok) {
      toast.error(result.error ?? 'Could not save the link.');
      return false;
    }

    toast.success('Link saved.');
    await refreshAll();

    return true;
  };

  const handleToggle = async (link: ShortLink) => {
    const disabled = link.disabledAt === null;
    const result = await updateLinkAction(link.id, { disabled });

    if (!result.ok) {
      toast.error(result.error ?? 'Could not change the link.');
      return;
    }

    toast.success(disabled ? 'Link disabled.' : 'Link enabled.');
    await refreshAll();
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setDeleting(true);
    const result = await deleteLinkAction(pendingDelete.id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error ?? 'Could not delete the link.');
      return;
    }

    setPendingDelete(null);
    toast.success('Link deleted.');
    await refreshAll();
  };

  return (
    <>
      <AdminHeader onRefresh={() => void refreshAll()} refreshing={refreshing} />

      <main className='mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6'>
        <StatCards stats={stats} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.1 }}
          className='grid gap-4 lg:grid-cols-[2fr_1fr]'>
          <ClicksChart daily={stats.daily} />
          <TopLinks links={stats.topLinks} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.16 }}>
          <LinksTable
            page={page}
            loading={loading}
            search={search}
            status={status}
            sort={sort}
            direction={direction}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onSortChange={handleSort}
            onPageChange={setPageNumber}
            onCreate={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            onEdit={(link) => {
              setEditing(link);
              setFormOpen(true);
            }}
            onToggle={(link) => void handleToggle(link)}
            onDelete={setPendingDelete}
          />
        </motion.div>
      </main>

      <LinkFormModal
        open={formOpen}
        link={editing}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title='Delete link'
        confirmLabel='Delete'
        loading={deleting}
        onConfirm={() => void handleDelete()}
        message={
          <>
            <span className='font-medium text-zinc-900 dark:text-zinc-100'>
              /{pendingDelete?.slug}
            </span>{' '}
            and its click history will be removed for good. Anyone who still has the short link will
            get a 404.
          </>
        }
      />
    </>
  );
}
