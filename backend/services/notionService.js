const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_VERSION = '2022-06-28';

// in-memory cache { key: { data, expiresAt } }
const notionCache = new Map();
const setCache = (key, data, ttlMs = 60 * 1000) => {
  notionCache.set(key, { data, expiresAt: Date.now() + ttlMs });
};
const getCache = (key) => {
  const entry = notionCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    notionCache.delete(key);
    return null;
  }
  return entry.data;
};

class NotionService {
  async checkStatus() {
    if (!NOTION_TOKEN) {
      return { configured: false, message: 'NOTION_TOKEN not set on server' };
    }
    try {
      const resp = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
      });
      const data = await resp.json();
      return { configured: true, ok: resp.ok, data };
    } catch (e) {
      return { configured: false, error: 'Failed to reach Notion', details: String(e) };
    }
  }

  async search(body = {}) {
    if (!NOTION_TOKEN) return { error: 'Notion not configured' };
    const key = `search:${JSON.stringify(body)}`;
    const cached = getCache(key);
    if (cached) return cached;
    try {
      const resp = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      const result = { ok: resp.ok, status: resp.status, data };
      setCache(key, result, 60 * 1000);
      return result;
    } catch (e) {
      return { ok: false, error: 'Search failed', details: String(e) };
    }
  }

  async getPage(id) {
    if (!NOTION_TOKEN) return { error: 'Notion not configured' };
    const key = `page:${id}`;
    const cached = getCache(key);
    if (cached) return cached;
    try {
      const resp = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': NOTION_VERSION,
        },
      });
      const data = await resp.json();
      const result = { ok: resp.ok, status: resp.status, data };
      setCache(key, result, 5 * 60 * 1000);
      return result;
    } catch (e) {
      return { ok: false, error: 'Page fetch failed', details: String(e) };
    }
  }

  async getPageBlocks(id) {
    if (!NOTION_TOKEN) return { error: 'Notion not configured' };
    const key = `blocks:${id}`;
    const cached = getCache(key);
    if (cached) return cached;
    try {
      const resp = await fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': NOTION_VERSION,
        },
      });
      const data = await resp.json();
      const result = { ok: resp.ok, status: resp.status, data };
      setCache(key, result, 60 * 1000);
      return result;
    } catch (e) {
      return { ok: false, error: 'Blocks fetch failed', details: String(e) };
    }
  }
}

export default new NotionService();
