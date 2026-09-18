'use client';

import type {
  Link as ShortLink,
  LinkPage,
  LinkSortField,
  LinkStatus,
  SortDirection,
} from '@url-shortener/types';
import { AnimatePresence, motion } from 'motion/react';

import {
  formatDate,
  formatExpiry,
  formatNumber,
  formatUrlForDisplay,
} from '@/common/utils/format.functions';
import Button from '@/components/common/Button';
import CopyButton from '@/components/common/CopyButton';
import Icon from '@/components/common/Icon';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingIndicator from '@/components/loadings/LoadingIndicator';

interface Props {
  page: LinkPage;
  loading: boolean;
  search: string;
  status: LinkStatus | '';
  sort: LinkSortField;
  direction: SortDirection;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: LinkStatus | '') => void;
  onSortChange: (field: LinkSortField) => void;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onEdit: (link: ShortLink) => void;
  onToggle: (link: ShortLink) => void;
  onDelete: (link: ShortLink) => void;
}

interface Column {
  field: LinkSortField | null;
  label: string;
  className?: string;
}

const COLUMNS: Column[] = [
  { field: 'slug', label: 'Link', className: 'w-full' },
  { field: null, label: 'Status', className: 'whitespace-nowrap' },
  { field: 'clickCount', label: 'Clicks', className: 'text-right whitespace-nowrap' },
  { field: 'expiresAt', label: 'Expires', className: 'hidden whitespace-nowrap md:table-cell' },
  { field: 'createdAt', label: 'Created', className: 'hidden whitespace-nowrap lg:table-cell' },
  { field: null, label: '', className: 'text-right' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'DISABLED', label: 'Disabled' },
];

/**
 * The admin link table: search, status filter, sortable columns, row actions and paging.
 **/
export default function LinksTable({
  page,
  loading,
  search,
  status,
  sort,
  direction,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onPageChange,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  return (
    <section className='rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='flex flex-wrap items-end gap-3 border-b border-zinc-200 p-5 dark:border-zinc-800'>
        <div className='mr-auto'>
          <h2 className='text-sm font-semibold text-zinc-900 dark:text-zinc-50'>Links</h2>
          <p className='text-xs text-zinc-400 dark:text-zinc-500'>
            {formatNumber(page.total)} {page.total === 1 ? 'link' : 'links'}
          </p>
        </div>

        <div className='relative w-full sm:w-64'>
          <Icon
            icon='Search'
            className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400'
          />
          <Input
            type='search'
            placeholder='Search slug, URL or note'
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className='pl-9'
            aria-label='Search links'
          />
        </div>

        <Select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as LinkStatus | '')}
          options={STATUS_OPTIONS}
          aria-label='Filter by status'
          className='w-full sm:w-44'
        />

        <Button variant='primary' onClick={onCreate} className='w-full sm:w-auto'>
          <Icon icon='Plus' className='h-4 w-4' />
          New link
        </Button>
      </div>

      <div className='relative overflow-x-auto'>
        {loading && (
          <div className='absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-10 dark:bg-zinc-900/60'>
            <LoadingIndicator className='h-5 w-5 text-cyan-600' />
          </div>
        )}

        <table className='w-full min-w-[40rem] text-left text-sm'>
          <thead className='text-xs text-zinc-400 dark:text-zinc-500'>
            <tr className='border-b border-zinc-200 dark:border-zinc-800'>
              {COLUMNS.map((column) => (
                <th
                  key={column.label || 'actions'}
                  scope='col'
                  className={`px-5 py-3 font-medium ${column.className ?? ''}`}>
                  {column.field ? (
                    <button
                      type='button'
                      onClick={() => onSortChange(column.field as LinkSortField)}
                      className={`inline-flex items-center gap-x-1 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 ${
                        sort === column.field ? 'text-zinc-900 dark:text-zinc-100' : ''
                      }`}>
                      {column.label}
                      {sort === column.field && (
                        <Icon
                          icon={direction === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                          className='h-3 w-3'
                        />
                      )}
                    </button>
                  ) : (
                    <span className={column.label ? '' : 'sr-only'}>
                      {column.label || 'Actions'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {page.items.map((link) => (
                <motion.tr
                  key={link.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className='border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/70 dark:hover:bg-zinc-800/40'>
                  <td className='w-full max-w-0 px-5 py-3'>
                    <div className='flex items-center gap-x-1'>
                      <a
                        href={link.shortUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='truncate font-medium text-zinc-900 hover:text-cyan-600 dark:text-zinc-100 dark:hover:text-cyan-400'>
                        /{link.slug}
                      </a>
                      <CopyButton value={link.shortUrl} label='Short link copied.' />
                    </div>
                    <p
                      className='truncate text-xs text-zinc-400 dark:text-zinc-500'
                      title={link.targetUrl}>
                      {link.note ? `${link.note} · ` : ''}
                      {formatUrlForDisplay(link.targetUrl, 52)}
                    </p>
                  </td>

                  <td className='px-5 py-3 whitespace-nowrap'>
                    <StatusBadge status={link.status} />
                  </td>

                  <td className='px-5 py-3 text-right whitespace-nowrap tabular-nums'>
                    {formatNumber(link.clickCount)}
                  </td>

                  <td className='hidden px-5 py-3 whitespace-nowrap text-zinc-500 md:table-cell dark:text-zinc-400'>
                    {formatExpiry(link.expiresAt)}
                  </td>

                  <td className='hidden px-5 py-3 whitespace-nowrap text-zinc-500 lg:table-cell dark:text-zinc-400'>
                    {formatDate(link.createdAt)}
                  </td>

                  <td className='px-5 py-3 whitespace-nowrap'>
                    <div className='flex items-center justify-end gap-x-1'>
                      <Button
                        variant='transparent'
                        size='sm'
                        onClick={() => onToggle(link)}
                        ariaLabel={link.disabledAt ? 'Enable link' : 'Disable link'}
                        title={link.disabledAt ? 'Enable link' : 'Disable link'}>
                        <Icon icon={link.disabledAt ? 'Play' : 'Ban'} className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        variant='transparent'
                        size='sm'
                        onClick={() => onEdit(link)}
                        ariaLabel='Edit link'
                        title='Edit link'>
                        <Icon icon='Pencil' className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        variant='transparent'
                        size='sm'
                        onClick={() => onDelete(link)}
                        ariaLabel='Delete link'
                        title='Delete link'
                        className='hover:bg-red-500/10 hover:text-red-500'>
                        <Icon icon='Trash' className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {page.items.length === 0 && !loading && (
          <div className='flex flex-col items-center gap-2 px-5 py-14 text-center'>
            <Icon icon='Link' className='h-6 w-6 text-zinc-300 dark:text-zinc-600' />
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              {search || status ? 'No links match this filter.' : 'No links yet.'}
            </p>
          </div>
        )}
      </div>

      {page.pageCount > 1 && (
        <div className='flex items-center justify-between gap-3 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800'>
          <p className='text-xs text-zinc-400 dark:text-zinc-500'>
            Page {page.page} of {page.pageCount}
          </p>
          <div className='flex gap-x-2'>
            <Button
              variant='normal'
              size='sm'
              disabled={page.page <= 1}
              onClick={() => onPageChange(page.page - 1)}>
              <Icon icon='ChevronLeft' className='h-3.5 w-3.5' />
              Previous
            </Button>
            <Button
              variant='normal'
              size='sm'
              disabled={page.page >= page.pageCount}
              onClick={() => onPageChange(page.page + 1)}>
              Next
              <Icon icon='ChevronRight' className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
