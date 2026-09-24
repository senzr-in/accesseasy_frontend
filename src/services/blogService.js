export const BASE_URL = 'https://patrol.accesseasy.in';
export const S3_CENTRAL_URL = 'https://fieldseaymarketingwebsite-production-assets.s3.ap-south-1.amazonaws.com';
export const S3_HOSTING_URL = 'https://accesseasy-patrol-assets.s3.ap-south-1.amazonaws.com';

async function fetchJsonSafe(url) {
  try {
    const res = await fetch(`${url}?t=${Date.now()}`);
    if (!res.ok) return null;
    const text = await res.text();
    // Guard against HTML error pages or SPA fallbacks
    if (!text.trim().startsWith('[') && !text.trim().startsWith('{')) return null;
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function fetchAllPatrolPosts() {
  const sources = [
    `${BASE_URL}/posts.json`,
    `${S3_CENTRAL_URL}/patrol/posts.json`,
    `${S3_HOSTING_URL}/posts.json`,
  ];

  for (const url of sources) {
    const posts = await fetchJsonSafe(url);
    if (posts && posts.length > 0) {
      return posts.map(p => ({
        id: p.id || p.slug,
        slug: p.slug || p.id,
        title: p.title || 'Untitled Post',
        excerpt: p.excerpt || p.summary || '',
        content: p.content || p.body || '',
        category: p.category || 'Security Patrol & Operations',
        author: p.author || 'AccessEasy Patrol Team',
        date: p.date || p.published_at || new Date().toISOString().substring(0, 10),
        image: p.image || p.image_url || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
        read_time: p.read_time || '4 min read'
      }));
    }
  }

  return [];
}

export async function fetchPostBySlug(slug) {
  const all = await fetchAllPatrolPosts();
  return all.find(p => p.slug === slug || p.id === slug) || null;
}
