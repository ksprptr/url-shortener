'use client';

import type { Link as ShortLink } from '@url-shortener/types';

import { formatNumber, formatUrlForDisplay } from '@/common/utils/format.functions';
import Icon from '@/components/common/Icon';

interface Props {
  links: ShortLink[];
}

/**
 * The most-visited links, next to the dashboard chart.
 **/
export default function TopLinks({ links }: Props) {
  return (
    <section className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      <h2 className='text-sm font-semibold text-zinc-900 dark:text-zinc-50'>Most visited</h2>
      <p className='text-xs text-zinc-400 dark:text-zinc-500'>All time</p>

      {links.length === 0 ? (
        <p className='mt-6 text-sm text-zinc-400 dark:text-zinc-500'>
          Nothing has been clicked yet.
        </p>
      ) : (
        <ol className='mt-4 flex flex-col gap-3'>
          {links.map((link, index) => (
            <li key={link.id} className='flex items-center gap-x-3'>
              <span className='w-4 shrink-0 text-xs font-semibold text-zinc-300 tabular-nums dark:text-zinc-600'>
                {index + 1}
              </span>
              <div className='min-w-0 flex-1'>
                <a
                  href={link.shortUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block truncate text-sm font-medium text-zinc-900 hover:text-cyan-600 dark:text-zinc-100 dark:hover:text-cyan-400'>
                  /{link.slug}
                </a>
                <p
                  className='truncate text-xs text-zinc-400 dark:text-zinc-500'
                  title={link.targetUrl}>
                  {formatUrlForDisplay(link.targetUrl, 34)}
                </p>
              </div>
              <span className='flex shrink-0 items-center gap-x-1 text-sm text-zinc-500 tabular-nums dark:text-zinc-400'>
                <Icon icon='Click' className='h-3.5 w-3.5' />
                {formatNumber(link.clickCount)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
