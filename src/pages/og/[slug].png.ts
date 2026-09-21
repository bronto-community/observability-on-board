import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOg } from '../../lib/og';
import { bestThumb, videoIdOf } from '../../lib/thumb';

export async function getStaticPaths() {
  return (await getCollection('episodes')).map((e) => ({ params: { slug: e.id }, props: { entry: e } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { data } = props.entry;
  const id = videoIdOf(data.video);
  const png = await renderOg({
    title: data.title,
    tool: data.tool,
    episode: data.episode,
    card: data.card,
    thumb: data.card === 'night' && id ? await bestThumb(id) : null,
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
