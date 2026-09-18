'use client';

import type { CreatedLink, Expiration } from '@url-shortener/types';
import { AnimatePresence, motion } from 'motion/react';
import { type FormEvent, useId, useState } from 'react';

import { shortenAction } from '@/actions/links/links.actions';
import { DEFAULT_EXPIRATION, EXPIRATION_OPTIONS } from '@/common/utils/expiration.functions';
import Button from '@/components/common/Button';
import Field from '@/components/common/Field';
import Icon from '@/components/common/Icon';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import ShortenResult from '@/components/layouts/ShortenResult';
import { useToast } from '@/components/providers/ToastProvider';

/**
 * Cheap client-side check so an obvious typo never costs one of the day's links.
 **/
// The API is the authority — it normalizes the URL and enforces the protocol allowlist.
const looksLikeUrl = (value: string): boolean => /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(value);

/** Mirrors MAX_TARGET_URL_LENGTH in the API; checked here so the refusal reads like a sentence. */
// Deliberately not a `maxLength` on the input: that silently truncates a pasted address, and
// shortening a half-URL is worse than refusing it.
const MAX_TARGET_URL_LENGTH = 2048;

/**
 * The public shorten form, and the result card it swaps itself for.
 **/
export default function ShortenForm() {
  const toast = useToast();
  const urlId = useId();
  const expirationId = useId();

  const [targetUrl, setTargetUrl] = useState('');
  const [expiration, setExpiration] = useState<Expiration>(DEFAULT_EXPIRATION);
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedLink | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const trimmed = targetUrl.trim();
    if (!looksLikeUrl(trimmed)) {
      setError('Enter a valid URL, for example https://example.com.');
      return;
    }

    if (trimmed.length > MAX_TARGET_URL_LENGTH) {
      setError(`That address is too long — keep it under ${MAX_TARGET_URL_LENGTH} characters.`);
      return;
    }

    setError(undefined);
    setSubmitting(true);

    const result = await shortenAction({ targetUrl: trimmed, expiration });
    setSubmitting(false);

    if (result.ok && result.data) {
      setCreated(result.data);
      toast.success('Link shortened.');
      return;
    }

    const message =
      result.error ??
      (result.status === 429
        ? 'You have reached the daily limit. Try again later.'
        : 'Could not shorten that link. Try again in a moment.');

    setError(message);
    toast.error(message);
  };

  const handleReset = () => {
    setCreated(null);
    setTargetUrl('');
    setExpiration(DEFAULT_EXPIRATION);
  };

  return (
    <AnimatePresence mode='wait'>
      {created ? (
        <ShortenResult key='result' link={created} onReset={handleReset} />
      ) : (
        <motion.form
          key='form'
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.15 }}
          className='flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900'>
          <Field
            label='Link to shorten'
            htmlFor={urlId}
            error={error}
            hint='Paste any http(s) address.'>
            <Input
              id={urlId}
              name='targetUrl'
              type='url'
              inputMode='url'
              placeholder='https://example.com/a-rather-long-address'
              autoComplete='url'
              autoFocus
              value={targetUrl}
              onChange={(event) => {
                setTargetUrl(event.target.value);
                setError(undefined);
              }}
            />
          </Field>

          <Field
            label='Expires after'
            htmlFor={expirationId}
            hint='After this the link stops working for everyone.'>
            <Select
              id={expirationId}
              name='expiration'
              value={expiration}
              onChange={(event) => setExpiration(event.target.value as Expiration)}
              options={EXPIRATION_OPTIONS}
            />
          </Field>

          <Button type='submit' variant='primary' fullWidth loading={submitting} className='mt-1'>
            {!submitting && <Icon icon='Zap' className='h-4 w-4' />}
            {submitting ? 'Shortening…' : 'Shorten link'}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
