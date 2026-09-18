'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

import Icon, { type IconName } from '@/components/common/Icon';
import { appConfig } from '@/configs/app/app.config';

interface Props {
  reason: 'expired' | 'disabled' | 'unavailable';
}

const REASONS: Record<
  Props['reason'],
  { eyebrow: string; title: string; body: string; icon: IconName }
> = {
  expired: {
    eyebrow: 'Link expired',
    title: 'This link has run out',
    body: 'Whoever created it chose a lifetime, and that time has passed. The destination is gone for good — ask them for a fresh link.',
    icon: 'Hourglass',
  },
  disabled: {
    eyebrow: 'Link disabled',
    title: 'This link was switched off',
    body: 'It still exists, but it has been taken offline and no longer resolves.',
    icon: 'Ban',
  },
  unavailable: {
    eyebrow: 'Something went wrong',
    title: 'Could not resolve this link',
    body: 'The service is having a moment. Try again in a few seconds.',
    icon: 'TriangleAlert',
  },
};

/**
 * The page a visitor lands on when a short link exists but no longer sends them anywhere.
 **/
export default function LinkGone({ reason }: Props) {
  const content = REASONS[reason];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className='flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center'>
      <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400'>
        <Icon icon={content.icon} className='h-6 w-6' />
      </span>
      <p className='text-sm font-semibold tracking-widest text-cyan-600 uppercase dark:text-cyan-400'>
        {content.eyebrow}
      </p>
      <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>{content.title}</h1>
      <p className='max-w-md text-zinc-500 dark:text-zinc-400'>{content.body}</p>
      <Link
        href='/'
        className='mt-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-cyan-700'>
        Shorten a link with {appConfig.name}
      </Link>
    </motion.section>
  );
}
