'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import GitHubIcon from '@/components/icons/GitHubIcon';
import { repositoryConfig } from '@/configs/repository.config';

/**
 * The repository pill in the corner that expands to the repo name on hover.
 **/
export default function GitHubLink() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={repositoryConfig.url}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={`${repositoryConfig.slug} on GitHub`}
      className='fixed right-4 bottom-4 z-40 rounded-full'>
      <motion.div
        layout
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className='flex items-center rounded-full border border-zinc-200 bg-white p-2 text-sm text-zinc-900 shadow-sm hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700'
        transition={{ type: 'spring', stiffness: 480, damping: 34 }}>
        <GitHubIcon className='h-5 w-5 fill-zinc-900 dark:fill-zinc-100' />
        <AnimatePresence initial={false}>
          {hovered && (
            <motion.span
              key='label'
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: 'auto', marginLeft: 6 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{ type: 'spring', stiffness: 480, damping: 34 }}
              className='overflow-hidden font-medium whitespace-nowrap'>
              {repositoryConfig.slug}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}
