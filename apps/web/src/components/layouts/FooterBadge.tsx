'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { authorConfig } from '@/configs/author.config';

/**
 * The small copyright pill in the corner that expands on hover.
 **/
export default function FooterBadge() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={authorConfig.url}
      target='_blank'
      rel='noopener noreferrer'
      className='fixed bottom-4 left-4 z-40 rounded-full'>
      <motion.div
        layout
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className='flex items-center rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-sm text-zinc-900 shadow-sm hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700'
        transition={{ type: 'spring', stiffness: 480, damping: 34 }}>
        <span className='text-2xl'>&copy;</span>
        <AnimatePresence initial={false}>
          {hovered && (
            <motion.span
              key='label'
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: 'auto', marginLeft: 6 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{ type: 'spring', stiffness: 480, damping: 34 }}
              className='overflow-hidden font-medium whitespace-nowrap'>
              {new Date().getFullYear()} {authorConfig.name}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}
