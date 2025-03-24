import Link from 'next/link';

/**
 * Component representing a footer
 */
export default function Footer() {
  return (
    <div className='py-4 text-center text-zinc-700'>
      <p>&copy; URL Shortener {new Date().getFullYear()}</p>
      <p>
        Created by{' '}
        <Link
          href='https://ksprptr.dev/'
          target='_blank'
          className='font-medium text-purple-600 hover:underline'>
          Petr Kašpar
        </Link>
      </p>
    </div>
  );
}
