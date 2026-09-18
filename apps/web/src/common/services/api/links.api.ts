import 'server-only';
import type {
  AdminCreateLinkPayload,
  CreatedLink,
  CreateLinkPayload,
  Link,
  LinkPage,
  LinkStats,
  ListLinksQuery,
  ResolvedLink,
  UpdateLinkPayload,
} from '@url-shortener/types';

import { getHttp } from '@/common/services/axios/axios.instance';

// Server-side link API — reached via getHttp(), never from the browser.

/**
 * Shortens a URL from the public form.
 **/
export const createLink = async (payload: CreateLinkPayload): Promise<CreatedLink> => {
  const http = await getHttp();
  const { data } = await http.post<CreatedLink>('/links', payload);

  return data;
};

/**
 * Resolves a slug to its target and counts the visit.
 **/
export const resolveLink = async (slug: string): Promise<ResolvedLink> => {
  const http = await getHttp();
  const { data } = await http.post<ResolvedLink>(`/links/${encodeURIComponent(slug)}/resolve`);

  return data;
};

/**
 * Lists links for the admin table.
 **/
export const listLinks = async (query: ListLinksQuery = {}): Promise<LinkPage> => {
  const http = await getHttp();
  const { data } = await http.get<LinkPage>('/admin/links', { params: query });

  return data;
};

/**
 * Creates a link from the admin.
 **/
export const createAdminLink = async (payload: AdminCreateLinkPayload): Promise<Link> => {
  const http = await getHttp();
  // The admin always sends an absolute expiry, so the preset the API also accepts is pinned to NEVER.
  const { data } = await http.post<Link>('/admin/links', { ...payload, expiration: 'NEVER' });

  return data;
};

/**
 * Updates a link.
 **/
export const updateLink = async (id: string, payload: UpdateLinkPayload): Promise<Link> => {
  const http = await getHttp();
  const { data } = await http.patch<Link>(`/admin/links/${encodeURIComponent(id)}`, payload);

  return data;
};

/**
 * Deletes a link.
 **/
export const deleteLink = async (id: string): Promise<void> => {
  const http = await getHttp();
  await http.delete(`/admin/links/${encodeURIComponent(id)}`);
};

/**
 * Fetches the admin dashboard numbers.
 **/
export const getStats = async (): Promise<LinkStats> => {
  const http = await getHttp();
  const { data } = await http.get<LinkStats>('/admin/stats');

  return data;
};
