import type { APIRoute } from 'astro';
import geography from '../../data/kaerimichi/geography.json';

export const prerender = true;

export const GET: APIRoute = () => new Response(JSON.stringify(geography), {
  headers: { 'Content-Type': 'application/geo+json; charset=utf-8' },
});
