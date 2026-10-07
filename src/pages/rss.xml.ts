import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { articleHref, getPublishedWriting } from '../lib/writing';

export async function GET(context: APIContext) {
  const entries = await getPublishedWriting();
  return rss({
    title: 'After Bedtime Labs — Writing',
    description: 'Field notes by Isaac on software, AI, developer tools, games, and experiments.',
    site: context.site!,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishDate,
      link: articleHref(entry),
      categories: entry.data.tags,
    })),
    customData: '<language>en-us</language>',
  });
}
