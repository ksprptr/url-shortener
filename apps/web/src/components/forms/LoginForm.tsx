'use client';

import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, type KeyboardEvent, useEffect, useId, useState } from 'react';

import { login } from '@/actions/auth/auth.actions';
import Button from '@/components/common/Button';
import Field from '@/components/common/Field';
import Icon from '@/components/common/Icon';
import Input from '@/components/common/Input';
import Logo from '@/components/common/Logo';
import { useToast } from '@/components/providers/ToastProvider';
import { appConfig } from '@/configs/app/app.config';

/**
 * Operator sign-in — posts the password via the `login` action, then opens the admin.
 **/
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const passwordId = useId();

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sessionExpired = searchParams.get('reason') === 'session-expired';

  useEffect(() => {
    if (sessionExpired) {
      toast.error('Your session expired. Sign in again.');
    }
    // `toast` is stable; listing it in the deps would re-run this every render and stack toasts.
  }, [sessionExpired]);

  // Submit explicitly on Enter — some password managers swallow the implicit submit.
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }
    event.preventDefault();
    event.currentTarget.requestSubmit();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (submitting || !password) {
      return;
    }

    setSubmitting(true);
    const result = await login(password);

    if (result.ok) {
      router.replace('/admin');
      router.refresh();
      return;
    }

    toast.error(result.error ?? 'Invalid password.');
    setSubmitting(false);
  };

  return (
    <section className='flex min-h-screen items-center justify-center py-16'>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className='w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='mb-6 flex flex-col items-center text-center'>
          <Logo className='h-11 w-11 rounded-xl shadow-sm' label={appConfig.name} />
          <h1 className='mt-3 text-lg font-semibold'>{appConfig.name} admin</h1>
          <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
            Enter your password to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDownCapture={handleKeyDown}
          className='flex flex-col gap-y-4'>
          <Field label='Password' htmlFor={passwordId}>
            <Input
              id={passwordId}
              name='password'
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete='current-password'
              autoFocus
            />
          </Field>
          <Button
            type='submit'
            variant='primary'
            fullWidth
            loading={submitting}
            disabled={!password}
            className='mt-1'>
            {!submitting && <Icon icon='Lock' className='h-4 w-4' />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </motion.div>
    </section>
  );
}
