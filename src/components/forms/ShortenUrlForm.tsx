'use client';

import * as Yup from 'yup';
import Link from 'next/link';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import ModalWindow from '@/components/common/ModalWindow';
import { useState } from 'react';
import { shortenUrl } from '@/utils/functions/shorten-url-functions';
import { getProjectUrl } from '@/utils/functions/url-functions';
import { Formik, Form, FormikHelpers } from 'formik';
import { Option, ShortenUrlFormValues } from '@/utils/types/form-types';

// Validation schema
const validaitonSchema = Yup.object({
  originUrl: Yup.string().url('Enter a valid URL address.').required('URL address is required.'),
  expiration: Yup.string().required('Expiration date is required.').nullable(),
});

// Initial values
const initialValues: ShortenUrlFormValues = {
  originUrl: '',
  expiration: 'DAY',
};

// Expiration options
const expirationOptions: Option[] = [
  { value: 'DAY', label: '1 Day' },
  { value: 'WEEK', label: '1 Week' },
  { value: 'MONTH', label: '1 Month' },
  { value: 'NEVER', label: 'Never' },
];

/**
 * Component representing a form to shorten an URL
 */
export default function ShortenUrlForm() {
  const [copied, setCopied] = useState<boolean>(false);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);

  const submitHandler = async (
    values: ShortenUrlFormValues,
    actions: FormikHelpers<ShortenUrlFormValues>,
  ) => {
    const newShortenedUrl = await shortenUrl(values);

    setShortenedUrl(getProjectUrl() + '/' + newShortenedUrl.id);
    actions.resetForm();
  };

  return (
    <>
      {shortenedUrl && (
        <ModalWindow>
          <div className='bg-zinc-50 border rounded-xl p-12 xs:w-96 w-full'>
            <h2 className='text-green-600 font-bold text-3xl'>Link shortened!</h2>
            <hr className='my-4' />
            <p className='mt-2 text-gray-600 font-medium'>
              Your link:
              <br />
              <Link href={shortenedUrl} target='_blank' className='text-green-600 hover:underline'>
                {shortenedUrl}
              </Link>
            </p>
            <div className='flex items-center justify-between mt-8'>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shortenedUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1000);
                }}
                disabled={copied}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant='danger' onClick={() => setShortenedUrl(null)}>
                Close
              </Button>
            </div>
          </div>
        </ModalWindow>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validaitonSchema}
        onSubmit={submitHandler}>
        {({ errors, touched }) => (
          <Form className='mt-12'>
            <InputField
              type='text'
              name='originUrl'
              label='Enter URL address'
              placeholder='https://google.com'
              className='md:w-80 w-48'
              error={touched.originUrl && errors.originUrl}
            />
            <div className='mt-8'>
              <InputField
                as='select'
                type='text'
                name='expiration'
                label='Select expiration date'
                placeholder='1 Day'
                options={expirationOptions}
                error={touched.expiration && errors.expiration}
              />
            </div>
            <div className='text-center mt-8'>
              <Button type='submit'>Shorten URL</Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
