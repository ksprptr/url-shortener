'use server';

import type {
  AdminCreateLinkPayload,
  CreatedLink,
  CreateLinkPayload,
  Link,
  LinkPage,
  LinkStats,
  ListLinksQuery,
  UpdateLinkPayload,
} from '@url-shortener/types';
import { revalidatePath } from 'next/cache';

import {
  createAdminLink,
  createLink,
  deleteLink,
  getStats,
  listLinks,
  updateLink,
} from '@/common/services/api/links.api';
import { type ActionResult, runAction } from '@/common/utils/action.functions';

/**
 * Shortens a URL from the public form.
 **/
export async function shortenAction(
  payload: CreateLinkPayload,
): Promise<ActionResult<CreatedLink>> {
  return runAction(() => createLink(payload));
}

/**
 * Loads a page of the admin link table.
 **/
export async function listLinksAction(query: ListLinksQuery): Promise<ActionResult<LinkPage>> {
  return runAction(() => listLinks(query));
}

/**
 * Loads the admin dashboard numbers.
 **/
export async function statsAction(): Promise<ActionResult<LinkStats>> {
  return runAction(() => getStats());
}

/**
 * Creates a link from the admin.
 **/
export async function createLinkAction(
  payload: AdminCreateLinkPayload,
): Promise<ActionResult<Link>> {
  const result = await runAction(() => createAdminLink(payload));

  if (result.ok) {
    revalidatePath('/admin');
  }

  return result;
}

/**
 * Updates a link (edit, or the enable/disable toggle).
 **/
export async function updateLinkAction(
  id: string,
  payload: UpdateLinkPayload,
): Promise<ActionResult<Link>> {
  const result = await runAction(() => updateLink(id, payload));

  if (result.ok) {
    revalidatePath('/admin');
  }

  return result;
}

/**
 * Deletes a link and its counters.
 **/
export async function deleteLinkAction(id: string): Promise<ActionResult> {
  const result = await runAction(() => deleteLink(id));

  if (result.ok) {
    revalidatePath('/admin');
  }

  return result;
}
