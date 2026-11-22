import type { APIRoute } from 'astro';
import published from '../../data/kaerimichi/register.json';
import { parseRegister, exportRegister } from '../../lib/kaerimichi/register';

export const prerender = true;
export const GET: APIRoute = () => new Response(exportRegister(parseRegister(published)), {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
