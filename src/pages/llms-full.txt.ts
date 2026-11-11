// llms-full.txt: every status answer with its grade and source, and every station, in one file
// for AI assistants (llmstxt.org). Built from the same data as the pages (src/lib/llms.ts).
import type { APIRoute } from 'astro';
import { llmsFull } from '../lib/llms';

export const GET: APIRoute = ({ site }) =>
  new Response(llmsFull((path) => new URL(path, site).toString()), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
