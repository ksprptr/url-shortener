'use client';

import { motion } from 'motion/react';

interface Props {
  subtitle: string;
}

/**
 * Landing hero: the wordmark and the one-line promise.
 **/
// The wordmark is split literally rather than sliced out of the app name — the accent belongs to
// this one heading, and a generic "colour the last word" rule would break on a renamed instance.
export default function Hero({ subtitle }: Props) {
  return (
    <div className='text-center'>
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className='text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50'>
        URL <span className='text-cyan-600 dark:text-cyan-400'>Shortener</span>
      </motion.h1>

      <motion.p
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.05 }}
        className='mx-auto mt-4 max-w-xl text-base text-zinc-500 sm:text-lg dark:text-zinc-400'>
        {subtitle}
      </motion.p>
    </div>
  );
}
