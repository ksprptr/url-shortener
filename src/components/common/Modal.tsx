'use client';

import { createPortal } from 'react-dom';
import { ExtendedProps } from '@/utils/types/global.types';
import { useOnClickOutside } from '@/utils/hooks/useOnClickOutside';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Props interface
interface Props extends ExtendedProps {
  visible: boolean;
  onClose: () => void;
  disableBlur?: boolean;
}

/**
 * Component representing a modal
 */
export default function Modal({
  visible,
  onClose,
  disableBlur = false,
  children,
  className,
}: Props) {
  const [mounted, setMounted] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, () => onClose());

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [visible]);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {visible && !disableBlur && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-30 bg-black/10 backdrop-blur-xs'
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <div className='fixed inset-0 z-40 flex items-center justify-center px-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className='relative my-32 overflow-auto'>
              {/* Modal */}
              <div
                ref={modalRef}
                className={`relative max-w-5xl overflow-auto rounded-xl bg-zinc-50 p-12 ${className}`}>
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.getElementById('modal-root') as HTMLElement,
  );
}
