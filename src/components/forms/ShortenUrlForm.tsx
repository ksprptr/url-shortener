'use client';

import * as expirationHelpers from '@/utils/functions/expiration.functions';

import Link from 'next/link';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Heading from '@/components/common/Heading';
import MotionDiv from '@/components/common/MotionDiv';
import InputField from '@/components/common/InputField';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useSnackbar } from 'notistack';
import { EXPIRATIONS } from '@/utils/enums/expiration.enums';
import { useHttpClient } from '@/utils/http.client';
import { useRef, useState } from 'react';
import { useOnClickOutside } from '@/utils/hooks/useOnClickOutside';
import { ShortenedUrlFormValues } from '@/utils/types/form.types';
import { Formik, Form, FormikHelpers } from 'formik';
import { shortenedUrlValidationSchema } from '@/utils/validations/shortened-url.validation';

/**
 * Component representing a form to shorten an URL
 */
export default function ShortenedUrlForm() {
  const { httpPost } = useHttpClient();
  const { enqueueSnackbar } = useSnackbar();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [shortenedUrl, setShortenedUrl] = useState<{
    url: string;
    expirationDate: Date | null;
  } | null>(null);

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

    const expirationDate = expirationHelpers.getExpirationDate(values.expirationDate);

    const response = await httpPost('/shortened-urls', {
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
    setShortenedUrl({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/l/${response.data.id}`,
      expirationDate,
    });

    enqueueSnackbar('URL shortened successfully.', { variant: 'success' });
  };

  return (
    <>
      <Modal visible={shortenedUrl !== null} onClose={() => setShortenedUrl(null)}>
        <button
          onClick={() => setShortenedUrl(null)}
          className='absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-400 text-sm text-zinc-50 duration-150 hover:cursor-pointer hover:bg-zinc-500'>
          <XMarkIcon className='h-5 w-5' />
        </button>

        <Heading size='sm' className='text-center font-semibold'>
          URL shortened!
        </Heading>

        <hr className='mx-auto my-4 w-1/4 text-black opacity-10' />

        <div className='space-y-2 text-center'>
          <p className='text-zinc-500'>
            {shortenedUrl?.expirationDate ? (
              <>
                Your shortened URL will expire on
                <br />
                <span className='text-lg font-medium'>
                  {shortenedUrl?.expirationDate
                    ? shortenedUrl.expirationDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Never'}
                </span>
              </>
            ) : (
              <>
                Your shortened URL will <span className='font-medium'>never</span> expire.
              </>
            )}
          </p>

          <Link
            href={shortenedUrl ? shortenedUrl.url : {}}
            target='_blank'
            className='font-medium text-purple-600 hover:underline'>
            {shortenedUrl?.url}
          </Link>
        </div>

        <div className='mt-8 flex justify-center'>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(shortenedUrl ? shortenedUrl.url : '');
              enqueueSnackbar('Copied to clipboard!', { variant: 'success' });
            }}>
            Copy
          </Button>
        </div>
      </Modal>

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
                className='w-48 md:w-80'
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
                  return {
                    value: expiration,
                    label: expirationHelpers.formatExpirationDate(expiration),
                  };
                })}
                error={touched.expirationDate && errors.expirationDate}
              />
            </MotionDiv>
            <MotionDiv delay={0.4} className='mt-8 text-center'>
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
