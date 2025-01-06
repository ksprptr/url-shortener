import Link from 'next/link';
import Button from '@/components/common/Button';
import Heading from '@/components/common/Heading';
import CenterLayout from '@/components/layouts/CenterLayout';

/**
 * Component representing a not found page
 */
export default function NotFoundPage() {
  return (
    <CenterLayout>
      <Heading size='lg' className='font-semibold text-center'>
        404 | Page not found
      </Heading>
      <Link href='/' className='mt-12'>
        <Button>Return to home</Button>
      </Link>
    </CenterLayout>
  );
}
