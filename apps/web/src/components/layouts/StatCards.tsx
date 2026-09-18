'use client';

import type { LinkStats } from '@url-shortener/types';
import { motion } from 'motion/react';

import { formatNumber } from '@/common/utils/format.functions';
import Icon, { type IconName } from '@/components/common/Icon';

interface Props {
  stats: LinkStats;
}

interface Card {
  label: string;
  value: string;
  hint: string;
  icon: IconName;
}

/**
 * The four headline numbers above the dashboard chart.
 **/
export default function StatCards({ stats }: Props) {
  const cards: Card[] = [
    {
      label: 'Links',
      value: formatNumber(stats.totalLinks),
      hint: `${formatNumber(stats.activeLinks)} active`,
      icon: 'Link',
    },
    {
      label: 'Clicks',
      value: formatNumber(stats.totalClicks),
      hint: `${formatNumber(stats.clicksLast30Days)} in 30 days`,
      icon: 'Click',
    },
    {
      label: 'Created',
      value: formatNumber(stats.createdLast30Days),
      hint: 'in the last 30 days',
      icon: 'Plus',
    },
    {
      label: 'Retired',
      value: formatNumber(stats.expiredLinks + stats.disabledLinks),
      hint: `${formatNumber(stats.expiredLinks)} expired · ${formatNumber(stats.disabledLinks)} off`,
      icon: 'Hourglass',
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26, delay: index * 0.04 }}
          className='rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
          <div className='flex items-center gap-x-2 text-zinc-400 dark:text-zinc-500'>
            <Icon icon={card.icon} className='h-3.5 w-3.5' />
            <span className='text-xs font-medium tracking-wide uppercase'>{card.label}</span>
          </div>
          <p className='mt-2 text-2xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-50'>
            {card.value}
          </p>
          <p className='mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500'>{card.hint}</p>
        </motion.div>
      ))}
    </div>
  );
}
