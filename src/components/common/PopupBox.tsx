'use client';

import React from 'react';
import MotionDiv from '@/components/common/MotionDiv';

// Props interface
interface Props {
  title: string;
  message: string;
}

/**
 * Component representing a popup box
 */
export default function PopupBox({ title, message }: Props) {
  return (
    <MotionDiv
      initialX={50}
      initialY={0}
      initialOpacity={0}
      animateX={0}
      animateY={0}
      animateOpacity={1}
      duration={0.2}
      className='fixed top-4 ml-4 right-4 text-zinc-900 bg-zinc-50 shadow-sm border font-medium rounded-md z-20'>
      <div className='flex gap-x-4 items-center p-4'>
        <div>
          <h3 className='text-lg'>{title}</h3>
          <p className='text-sm'>{message}</p>
        </div>
      </div>
      <div className='h-1 rounded-b-md bg-purple-600' />
    </MotionDiv>
  );
}
