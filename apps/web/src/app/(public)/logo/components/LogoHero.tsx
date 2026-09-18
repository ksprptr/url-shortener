'use client';

import { motion } from 'motion/react';

interface Props {
  description: string;
}

/**
 * Logo page hero.
 **/
export default function LogoHero({ description }: Props) {
  return (
    <div className='text-center'>
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className='text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50'>
        The <span className='text-cyan-600 dark:text-cyan-400'>logo</span>
      </motion.h1>

      <motion.p
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.05 }}
        className='mx-auto mt-4 max-w-md text-base text-zinc-500 dark:text-zinc-400'>
        {description}
      </motion.p>
    </div>
  );
}
