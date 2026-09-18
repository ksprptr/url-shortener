'use client';

import type {
  AdminCreateLinkPayload,
  Link as ShortLink,
  UpdateLinkPayload,
} from '@url-shortener/types';
import { type FormEvent, useEffect, useId, useState } from 'react';

import { toDateTimeLocalValue } from '@/common/utils/format.functions';
import Button from '@/components/common/Button';
import Field from '@/components/common/Field';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';

interface Props {
  open: boolean;
  /** The link being edited, or null when creating a new one. */
  link: ShortLink | null;
  onClose: () => void;
  onCreate: (payload: AdminCreateLinkPayload) => Promise<boolean>;
  onUpdate: (id: string, payload: UpdateLinkPayload) => Promise<boolean>;
}

interface FormState {
  targetUrl: string;
  slug: string;
  note: string;
  expiresAt: string;
  neverExpires: boolean;
}

const EMPTY: FormState = {
  targetUrl: '',
  slug: '',
  note: '',
  expiresAt: '',
  neverExpires: true,
};

/**
 * Builds the form state a link edit starts from.
 **/
const fromLink = (link: ShortLink): FormState => ({
  targetUrl: link.targetUrl,
  slug: link.slug,
  note: link.note ?? '',
  expiresAt: toDateTimeLocalValue(link.expiresAt),
  neverExpires: link.expiresAt === null,
});

/**
 * The create/edit dialog behind the admin table's "New link" and row edit buttons.
 **/
export default function LinkFormModal({ open, link, onClose, onCreate, onUpdate }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const targetId = useId();
  const slugId = useId();
  const noteId = useId();
  const expiresId = useId();

  // Reseed whenever the dialog opens, so a reopened form never shows the previous link.
  useEffect(() => {
    if (open) {
      setForm(link ? fromLink(link) : EMPTY);
    }
  }, [open, link]);

  const patch = (next: Partial<FormState>) => setForm((current) => ({ ...current, ...next }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const expiresAt =
      form.neverExpires || !form.expiresAt ? null : new Date(form.expiresAt).toISOString();
    const slug = form.slug.trim();
    const note = form.note.trim();

    setSubmitting(true);

    const ok = link
      ? await onUpdate(link.id, {
          targetUrl: form.targetUrl.trim(),
          ...(slug !== link.slug ? { slug } : {}),
          note: note || null,
          expiresAt,
        })
      : await onCreate({
          targetUrl: form.targetUrl.trim(),
          ...(slug ? { slug } : {}),
          ...(note ? { note } : {}),
          expiresAt,
        });

    setSubmitting(false);

    if (ok) {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={link ? 'Edit link' : 'New link'}>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <Field label='Target URL' htmlFor={targetId}>
          <Input
            id={targetId}
            name='targetUrl'
            type='url'
            required
            placeholder='https://example.com'
            value={form.targetUrl}
            onChange={(event) => patch({ targetUrl: event.target.value })}
          />
        </Field>

        <Field
          label='Slug'
          htmlFor={slugId}
          hint={link ? 'Changing it breaks the old short link.' : 'Leave empty to generate one.'}>
          <Input
            id={slugId}
            name='slug'
            placeholder='my-link'
            pattern='[A-Za-z0-9_-]{3,64}'
            value={form.slug}
            onChange={(event) => patch({ slug: event.target.value })}
          />
        </Field>

        <Field label='Note' htmlFor={noteId} hint='Only you ever see this.'>
          <Input
            id={noteId}
            name='note'
            maxLength={200}
            placeholder='Campaign, where it was shared, …'
            value={form.note}
            onChange={(event) => patch({ note: event.target.value })}
          />
        </Field>

        <Field label='Expires at' htmlFor={expiresId}>
          <div className='flex flex-col gap-2'>
            <Input
              id={expiresId}
              name='expiresAt'
              type='datetime-local'
              disabled={form.neverExpires}
              value={form.expiresAt}
              onChange={(event) => patch({ expiresAt: event.target.value })}
            />
            <label className='flex items-center gap-x-2 text-sm text-zinc-600 dark:text-zinc-400'>
              <input
                type='checkbox'
                checked={form.neverExpires}
                onChange={(event) => patch({ neverExpires: event.target.checked })}
                className='h-4 w-4 rounded border-zinc-300 text-cyan-600 accent-cyan-600 dark:border-zinc-600'
              />
              Never expires
            </label>
          </div>
        </Field>

        <div className='mt-1 flex justify-end gap-x-2'>
          <Button variant='transparent' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' variant='primary' loading={submitting}>
            {link ? 'Save changes' : 'Create link'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
