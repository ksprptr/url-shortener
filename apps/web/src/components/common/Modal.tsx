'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId } from 'react';

import type { ExtendedProps } from '@/common/types/global.types';
import Icon from '@/components/common/Icon';

interface Props extends ExtendedProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: string;
}

/**
 * Animated modal dialog with a backdrop and optional title.
 **/
export default function Modal({ open, onClose, title, maxWidth = 'max-w-md', children }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm'>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
            role='dialog'
            aria-modal='true'
            aria-label={title ? undefined : 'Dialog'}
            aria-labelledby={title ? titleId : undefined}
            className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900`}>
            {title && (
              <div className='flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800'>
                <h2 id={titleId} className='text-base font-semibold'>
                  {title}
                </h2>
                <button
                  type='button'
                  aria-label='Close dialog'
                  onClick={onClose}
                  className='rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'>
                  <Icon icon='X' className='h-5 w-5' />
                </button>
              </div>
            )}
            <div className='px-6 py-5'>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
