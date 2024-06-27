'use client';

import * as Yup from 'yup';
import InputField from '@/components/common/InputField';
import { useState } from 'react';
import { shortenUrl } from '@/utils/functions/shorten-url-functions';
import { Formik, Form } from 'formik';
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
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);

  const submitHandler = async (values: ShortenUrlFormValues) => {
    const newShortenedUrl = await shortenUrl(values);

    setShortenedUrl('http://localhost:3000/' + newShortenedUrl.id);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validaitonSchema}
      onSubmit={submitHandler}>
      {({ errors, touched }) => (
        <Form>
          {shortenedUrl && <p>Shortened URL: {shortenedUrl}</p>}
          <InputField
            type='text'
            name='originUrl'
            placeholder='https://google.com'
            error={touched.originUrl && errors.originUrl}
          />
          <InputField
            as='select'
            type='text'
            name='expiration'
            placeholder='1 Day'
            options={expirationOptions}
            error={touched.expiration && errors.expiration}
          />
          <button type='submit'>Create</button>
        </Form>
      )}
    </Formik>
  );
}
