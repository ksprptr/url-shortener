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
        <Heading size='xl' className='mt-44 text-center font-bold'>
          URL Shortener
        </Heading>
      </MotionDiv>
      <MotionDiv delay={0.1}>
        <p className='mt-8 text-center text-zinc-700'>
          We <span className='font-medium underline'>do not</span> store any user data when visiting
          the shortened URLs.
          <br />
          Max attempts to shorten URL is <span className='font-medium underline'>five per day</span>
          .
        </p>
      </MotionDiv>
      <ShortenUrlForm />
    </main>
  );
}
