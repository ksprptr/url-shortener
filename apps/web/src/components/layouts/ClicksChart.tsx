'use client';

import type { DailyStat } from '@url-shortener/types';
import { motion } from 'motion/react';
import { useState } from 'react';

import { formatDate, formatNumber } from '@/common/utils/format.functions';

interface Props {
  daily: DailyStat[];
}

const CHART_HEIGHT = 120;
const MIN_BAR_HEIGHT = 2;

/**
 * The 30-day clicks-per-day bars; hovering a column names its day.
 **/
// Inline SVG rather than a charting library: one series of plain bars is not worth the bundle.
export default function ClicksChart({ daily }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const peak = Math.max(...daily.map((day) => day.clicks), 1);
  const active = hovered !== null ? daily[hovered] : null;
  const total = daily.reduce((sum, day) => sum + day.clicks, 0);

  return (
    <section className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <div>
          <h2 className='text-sm font-semibold text-zinc-900 dark:text-zinc-50'>Clicks</h2>
          <p className='text-xs text-zinc-400 dark:text-zinc-500'>Last 30 days, UTC</p>
        </div>
        <p className='text-sm text-zinc-500 tabular-nums dark:text-zinc-400'>
          {active ? (
            <>
              <span className='font-semibold text-cyan-600 dark:text-cyan-400'>
                {formatNumber(active.clicks)}
              </span>{' '}
              on {formatDate(active.date)}
            </>
          ) : (
            <>
              <span className='font-semibold text-zinc-900 dark:text-zinc-50'>
                {formatNumber(total)}
              </span>{' '}
              total
            </>
          )}
        </p>
      </div>

      <div
        className='mt-4 flex items-end gap-[3px]'
        style={{ height: CHART_HEIGHT }}
        onMouseLeave={() => setHovered(null)}>
        {daily.map((day, index) => {
          const height = Math.max(
            day.clicks > 0 ? (day.clicks / peak) * CHART_HEIGHT : 0,
            MIN_BAR_HEIGHT,
          );

          return (
            <motion.div
              key={day.date}
              initial={{ height: MIN_BAR_HEIGHT }}
              animate={{ height }}
              transition={{ type: 'spring', stiffness: 220, damping: 24, delay: index * 0.012 }}
              onMouseEnter={() => setHovered(index)}
              title={`${formatDate(day.date)} · ${formatNumber(day.clicks)} clicks`}
              className={`flex-1 rounded-t-sm transition-colors duration-150 ${
                day.clicks > 0
                  ? hovered === index
                    ? 'bg-cyan-500'
                    : 'bg-cyan-600/70 dark:bg-cyan-500/70'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          );
        })}
      </div>

      <div className='mt-2 flex justify-between text-[0.7rem] text-zinc-400 dark:text-zinc-500'>
        <span>{formatDate(daily[0]?.date)}</span>
        <span>{formatDate(daily[daily.length - 1]?.date)}</span>
      </div>
    </section>
  );
}
