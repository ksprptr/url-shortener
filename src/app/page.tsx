import Heading from '@/components/common/Heading';
import ShortenUrlForm from '@/components/forms/ShortenUrlForm';

/**
 * Component representing a home page
 */
export default function Home() {
  return (
    <main className='flex flex-col items-center'>
      <Heading size='xl' className='!font-bold text-center mt-44'>
        URL Shortener
      </Heading>
      <p className='text-zinc-600 mt-8 text-center'>
        We <span className='underline font-medium'>do not</span> store any user data when visiting
        the shortened URLs.
      </p>
      <ShortenUrlForm />
    </main>
  );
}
