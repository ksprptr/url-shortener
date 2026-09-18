'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

/**
 * The 404 body — an unknown route, or a short link that never existed.
 **/
export default function NotFoundContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className='flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center'>
      <p className='text-sm font-semibold tracking-widest text-cyan-600 uppercase dark:text-cyan-400'>
        Error 404
      </p>
      <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>Nothing here</h1>
      <p className='max-w-md text-zinc-500 dark:text-zinc-400'>
        This short link does not exist — check the address, or make one of your own.
      </p>
      <Link
        href='/'
        className='mt-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-cyan-700'>
        Shorten a link
      </Link>
    </motion.div>
  );
}
