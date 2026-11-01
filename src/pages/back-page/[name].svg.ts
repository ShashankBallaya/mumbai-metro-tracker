import type { APIRoute, GetStaticPaths } from 'astro';
import { LAYER_FILES, layerFile } from '../../lib/back-page-art';

/** The back page drawing's static layers, one SVG file per edition (src/lib/back-page-art.ts). */
export const getStaticPaths: GetStaticPaths = () => LAYER_FILES.map((name) => ({ params: { name } }));

export const GET: APIRoute = ({ params }) =>
  new Response(layerFile(params.name as (typeof LAYER_FILES)[number]), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
