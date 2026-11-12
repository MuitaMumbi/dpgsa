// Vercel serverless function: GET /api/medium
// Reads the DPGSA Medium feed and returns the latest posts as JSON for the website.
// Vercel caches the response for an hour, so Medium is asked at most once an hour.

const FEED = 'https://medium.com/feed/@datapgsa';
const PROFILE = 'https://medium.com/@datapgsa';

const entities = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
   .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
const unCdata = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
const field = (xml, name) => {
  const m = xml.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>'));
  return m ? unCdata(m[1]).trim() : '';
};
const plain = (html) => entities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n)) + '…');

function parseItem(item) {
  const html = field(item, 'content:encoded');
  const heading = plain((html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/) || [, ''])[1]);
  let title = entities(field(item, 'title'));
  // Medium cuts long titles in the feed; use the full heading from the article body instead.
  if (title.endsWith('…') && heading.startsWith(title.slice(0, -1))) title = heading;

  const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => plain(m[1])).filter(Boolean);
  const byline = paras.find((p) => /^written by\b/i.test(p)) || '';
  const excerpt = paras.find((p) => p !== byline && p.length > 60) || '';

  return {
    title,
    link: field(item, 'link').split('?')[0],
    date: new Date(field(item, 'pubDate')).toISOString(),
    author: byline.replace(/^written by\s*/i, '') || entities(field(item, 'dc:creator')),
    excerpt: clip(excerpt, 200),
    image: (html.match(/<img[^>]+src="([^"]+)"/) || [, ''])[1],
    tags: [...item.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((m) => unCdata(m[1]).trim()),
  };
}

module.exports = async (req, res) => {
  try {
    const r = await fetch(FEED, { headers: { 'User-Agent': 'dpgsa-website (+https://dpgsa.vercel.app)' } });
    if (!r.ok) throw new Error('Medium returned ' + r.status);
    const xml = await r.text();
    const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6).map((m) => parseItem(m[1]));
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ profile: PROFILE, posts });
  } catch (err) {
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(502).json({ profile: PROFILE, posts: [], error: String(err.message || err) });
  }
};
