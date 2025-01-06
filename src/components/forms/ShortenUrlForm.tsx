'use client';

import Link from 'next/link';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Heading from '@/components/common/Heading';
import MotionDiv from '@/components/common/MotionDiv';
import InputField from '@/components/common/InputField';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSnackbar } from 'notistack';
import { EXPIRATIONS } from '@/utils/enums/expiration-enums';
import { useHttpClient } from '@/utils/http-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef, useState } from 'react';
import { useOnClickOutside } from '@/utils/hooks/useOnClickOutside';
import { ShortenedUrlFormValues } from '@/utils/types/form-types';
import { Formik, Form, FormikHelpers } from 'formik';
import { shortenedUrlValidationSchema } from '@/utils/validations/shortened-url-validation';
import { formatExpirationDate, getExpirationDate } from '@/utils/functions/expiration-functions';

/**
 * Component representing a form to shorten an URL
 */
export default function ShortenedUrlForm() {
  const { httpPost } = useHttpClient();
  const { enqueueSnackbar } = useSnackbar();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(modalRef, () => setShortenedUrl(null));

  const initialValues: ShortenedUrlFormValues = {
    originUrl: '',
    expirationDate: EXPIRATIONS.DAY,
  };

  const submitHandler = async (
    values: ShortenedUrlFormValues,
    meta: FormikHelpers<ShortenedUrlFormValues>,
  ) => {
    setSubmitting(true);
    enqueueSnackbar('Shortening URL...', { variant: 'info' });

    const expirationDate = getExpirationDate(values.expirationDate);

    const response = await httpPost('/shortened-urls/create', {
      originUrl: values.originUrl,
      ...(expirationDate && { expirationDate: expirationDate.toISOString() }),
    });

    if (response.status === 429) {
      enqueueSnackbar('You reached the limit of shortened URLs per day. Try again later.', {
        variant: 'error',
      });
      setSubmitting(false);
      return;
    }

    if (response.status !== 201) {
      console.error(response.data);
      enqueueSnackbar('There was an error shortening the URL. Check console for more detail.', {
        variant: 'error',
      });
      setSubmitting(false);
      return;
    }

    meta.resetForm();
    setSubmitting(false);
    setShortenedUrl(`${process.env.NEXT_PUBLIC_SITE_URL}/l/${response.data.id}`);

    enqueueSnackbar('URL shortened successfully.', { variant: 'success' });
  };

  return (
    <>
      {shortenedUrl && (
        <Modal ref={modalRef}>
          <div className='bg-zinc-50 border rounded-xl p-12 relative xs:w-auto w-full'>
            <button
              onClick={() => setShortenedUrl(null)}
              className='absolute top-1 right-1 text-zinc-50 text-sm bg-zinc-600 hover:bg-zinc-700 duration-150 w-6 h-6 rounded-full'>
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <Heading size='sm' className='font-semibold text-center'>
              URL shortened!
            </Heading>
            <hr className='my-4 w-1/4 mx-auto' />
            <Link
              href={shortenedUrl}
              target='_blank'
              className='text-zinc-700 hover:underline font-medium text-center'>
              {shortenedUrl}
            </Link>
            <div className='flex justify-center mt-8'>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shortenedUrl);
                  enqueueSnackbar('Copied to clipboard!', { variant: 'success' });
                }}>
                Copy
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={shortenedUrlValidationSchema}
        onSubmit={submitHandler}>
        {({ errors, touched }) => (
          <Form className='mt-12'>
            <MotionDiv delay={0.2}>
              <InputField
                type='text'
                name='originUrl'
                label='Enter URL address'
                placeholder='https://google.com'
                className='md:w-80 w-48'
                error={touched.originUrl && errors.originUrl}
              />
            </MotionDiv>
            <MotionDiv delay={0.3} className='mt-8'>
              <InputField
                as='select'
                type='text'
                name='expirationDate'
                label='Select expiration date'
                placeholder='1 Day'
                options={Object.values(EXPIRATIONS).map((expiration) => {
                  return { value: expiration, label: formatExpirationDate(expiration) };
                })}
                error={touched.expirationDate && errors.expirationDate}
              />
            </MotionDiv>
            <MotionDiv delay={0.4} className='text-center mt-8'>
              <Button type='submit' disabled={submitting}>
                Shorten URL
              </Button>
            </MotionDiv>
          </Form>
        )}
      </Formik>
    </>
  );
}
