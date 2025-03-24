'use client';

import { motion } from 'framer-motion';
import { ExtendedProps } from '@/utils/types/global.types';

// Props interface
interface Props extends ExtendedProps {
  delay?: number;
  duration?: number;
  initialX?: number;
  initialY?: number;
  initialOpacity?: number;
  initialWidth?: number | string;
  initialHeight?: number | string;
  animateX?: number;
  animateY?: number;
  animateOpacity?: number;
  animateWidth?: number | string;
  animateHeight?: number | string;
}

/**
 * Component representing a motion div
 */
export default function MotionDiv({
  delay = 0,
  duration = 0.2,
  initialX = 0,
  initialY = -25,
  initialOpacity = 0,
  initialWidth = 'auto',
  initialHeight = 'auto',
  animateX = 0,
  animateY = 0,
  animateOpacity = 1,
  animateWidth = 'auto',
  animateHeight = 'auto',
  children,
  ...props
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: initialOpacity,
        y: initialY,
        x: initialX,
        height: initialHeight,
        width: initialWidth,
      }}
      animate={{
        opacity: animateOpacity,
        y: animateY,
        x: animateX,
        height: animateHeight,
        width: animateWidth,
      }}
      transition={{ duration: duration, delay: delay }}
      {...props}>
      {children}
    </motion.div>
  );
}
