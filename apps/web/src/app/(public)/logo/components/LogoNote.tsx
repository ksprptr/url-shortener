'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

import { LOGO_ICON_SOURCE } from '@/configs/logo.config';

const linkClassName =
  'underline decoration-dotted underline-offset-2 transition-colors duration-150 ease-out hover:text-cyan-600 dark:hover:text-cyan-400';

/**
 * The note under the logo card — the icon credit and the way back.
 **/
export default function LogoNote() {
  return (
    <motion.p
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.42 }}
      className='text-center text-xs text-zinc-400 dark:text-zinc-500'>
      The mark is built from the{' '}
      <Link
        href={LOGO_ICON_SOURCE.url}
        target='_blank'
        rel='noopener noreferrer'
        className={linkClassName}>
        lucide <code>{LOGO_ICON_SOURCE.name}</code> icon
      </Link>{' '}
      (ISC licensed). Need a short link instead?{' '}
      <Link href='/' className={linkClassName}>
        Back to the shortener
      </Link>
      .
    </motion.p>
  );
}
