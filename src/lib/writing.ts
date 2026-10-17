import { getCollection, type CollectionEntry } from 'astro:content';

export type WritingEntry = CollectionEntry<'writing'>;

function newestFirst(entries: WritingEntry[]): WritingEntry[] {
  return entries.sort((a, b) =>
    b.data.publishDate.valueOf() - a.data.publishDate.valueOf() || a.id.localeCompare(b.id),
  );
}

/** Public content only. Use for RSS, recent writing, and article navigation. */
export async function getPublishedWriting(): Promise<WritingEntry[]> {
  return newestFirst(await getCollection('writing', ({ data }) => !data.draft));
}

/** Drafts are available for local authoring only; production never includes them. */
export async function getWriting(): Promise<WritingEntry[]> {
  return newestFirst(await getCollection('writing', ({ data }) => !data.draft || import.meta.env.DEV));
}

export function articleHref(entry: WritingEntry): string {
  return `/writing/${entry.id.split('/').map(encodeURIComponent).join('/')}/`;
}

export function topicSlug(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function topicHref(topic: string): string {
  return `/writing/topics/${topicSlug(topic)}/`;
}

export async function getTopics(): Promise<string[]> {
  return [...new Set((await getPublishedWriting()).flatMap((entry) => entry.data.tags))].sort();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** A rough estimate, including code: technical articles are read at different speeds. */
export function readingTime(body = ''): string {
  const words = body.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
