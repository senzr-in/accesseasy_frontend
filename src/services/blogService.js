export const BASE_URL = 'https://patrol.accesseasy.in';
export const S3_CENTRAL_URL = 'https://fieldseaymarketingwebsite-production-assets.s3.ap-south-1.amazonaws.com';
export const S3_HOSTING_URL = 'https://accesseasy-patrol-assets.s3.ap-south-1.amazonaws.com';
export const DIRECTUS_PATROL_URL = 'https://appv1.fieldseasy.com/directus/items/marketing_executions?filter[tenantId][_eq]=3e67e01c-96b3-415c-a7f6-97ffcab1cfee&filter[channel][_in]=website,blog,wordpress&filter[status][_eq]=published&sort=-id&limit=100&access_token=p2pJHhZAjca6jQea0RbPVwNWRyrJG29X';

async function fetchDirectusPatrolPosts() {
  try {
    const res = await fetch(DIRECTUS_PATROL_URL);
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data || []).map(exec => {
      const bj = exec.blog_json || {};
      const title = bj.website_title || bj.title || exec.title || 'AccessEasy Patrol Article';
      const rawSlug = bj.slug || (exec.meta_post_id && !exec.meta_post_id.startsWith('http') ? exec.meta_post_id : null) || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 45);
      const slug = rawSlug || `post-${exec.id}`;
      const body = bj.website_body || bj.body || bj.content || exec.caption || '';
      const summary = bj.meta_description || exec.caption || bj.excerpt || body.replace(/<[^>]+>/g, '').substring(0, 160);
      return {
        id: slug,
        slug: slug,
        title: title,
        excerpt: summary,
        summary: summary,
        content: body,
        body: body,
        category: 'Security Patrol & Operations',
        author: bj.author_name || 'AccessEasy Patrol Team',
        date: exec.published_date ? exec.published_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        image: exec.image_url || bj.featured_image || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
        read_time: '4 min read'
      };
    });
  } catch {
    return [];
  }
}

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
  const directusPosts = await fetchDirectusPatrolPosts();
  if (directusPosts && directusPosts.length > 0) {
    return directusPosts;
  }

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
