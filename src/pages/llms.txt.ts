// llms.txt: a short index of the site for AI assistants and answer engines (llmstxt.org).
// Built from the same data and status answers as the pages (src/lib/llms.ts), so it never drifts from them.
import type { APIRoute } from 'astro';
import { llmsIndex } from '../lib/llms';

export const GET: APIRoute = ({ site }) =>
  new Response(llmsIndex((path) => new URL(path, site).toString()), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
