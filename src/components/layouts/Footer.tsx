import Link from 'next/link';

/**
 * Component representing a footer
 */
export default function Footer() {
  return (
    <div className='text-zinc-700 text-center py-4'>
      <p>&copy; URL Shortener {new Date().getFullYear()}</p>
      <p>
        Created by{' '}
        <Link
          href='https://ksprptr.dev/'
          target='_blank'
          className='hover:underline font-medium text-purple-600'>
          Petr Kašpar
        </Link>
      </p>
    </div>
  );
}
