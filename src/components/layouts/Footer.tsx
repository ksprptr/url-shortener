import Link from 'next/link';
import React from 'react';

/**
 * Component representing a footer
 */
export default function Footer() {
  return (
    <div className='text-center pb-4'>
      <p>&copy; URL Shortener {new Date().getFullYear()}</p>
      <p>
        Created by{' '}
        <Link
          href='https://ksprptr.dev/'
          target='_blank'
          className='hover:underline font-medium text-purple-600'>
          Petr Kaspar
        </Link>
      </p>
    </div>
  );
}
