import Heading from '@/components/common/Heading';
import MotionDiv from '@/components/common/MotionDiv';
import ShortenUrlForm from '@/components/forms/ShortenUrlForm';

/**
 * Component representing a home page
 */
export default function Page() {
  return (
    <main className='flex flex-col items-center'>
      <MotionDiv>
        <Heading size='xl' className='font-bold text-center mt-44'>
          URL Shortener
        </Heading>
      </MotionDiv>
      <MotionDiv delay={0.1}>
        <p className='text-zinc-700 mt-8 text-center'>
          We <span className='underline font-medium'>do not</span> store any user data when visiting
          the shortened URLs.
          <br />
          Max attempts to shorten URL is <span className='underline font-medium'>five per day</span>
          .
        </p>
      </MotionDiv>
      <ShortenUrlForm />
    </main>
  );
}
