// Shorts thumbnails vary: oardefault is the true vertical frame but only exists for
// some videos; maxresdefault beats hqdefault everywhere. Probed at build time.
export async function bestThumb(id: string) {
  for (const variant of ['oardefault', 'maxresdefault']) {
    try {
      const r = await fetch(`https://i.ytimg.com/vi/${id}/${variant}.jpg`, { method: 'HEAD' });
      if (r.ok) return `https://i.ytimg.com/vi/${id}/${variant}.jpg`;
    } catch {}
  }
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export const videoIdOf = (embed?: string) => (embed ? embed.split('/').pop()! : null);
