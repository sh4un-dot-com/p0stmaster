import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';

const DEFAULT_PORT = 4173;
const DEFAULT_HOST = '127.0.0.1';
const parser = new Parser();
const AYRSHARE_PLATFORM_MAP = {
  facebook: 'facebook',
  instagram: 'instagram',
  linkedin: 'linkedin',
  pinterest: 'pinterest',
  twitter: 'twitter',
  youtube: 'youtube',
  tiktok: 'tiktok',
};
const AYRSHARE_MEDIA_REQUIRED_PLATFORMS = new Set(['instagram', 'pinterest', 'youtube', 'tiktok']);

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const parseProviderStatusTag = (message = '') => {
  const match = String(message).match(/\[status:(\d{3})\]\s*$/);
  return match ? Number(match[1]) : null;
};

const stripProviderStatusTag = (message = '') => String(message).replace(/\s*\[status:\d{3}\]\s*$/, '').trim();

const classifyApiError = (error, fallbackMessage) => {
  const rawMessage = error instanceof Error ? error.message : fallbackMessage;
  const message = stripProviderStatusTag(rawMessage || fallbackMessage);
  const providerStatus = parseProviderStatusTag(rawMessage || '');

  if (providerStatus === 401 || providerStatus === 403) {
    return { statusCode: 400, message };
  }

  if (providerStatus === 429) {
    return { statusCode: 429, message };
  }

  if (providerStatus && providerStatus >= 500) {
    return { statusCode: 502, message };
  }

  if (providerStatus && providerStatus >= 400) {
    return { statusCode: 400, message };
  }

  if (/required|requires|must|invalid|not supported|unexpected|only http and https|too large|empty/i.test(message)) {
    return { statusCode: 400, message };
  }

  if (/timed out/i.test(message)) {
    return { statusCode: 504, message };
  }

  return { statusCode: 500, message: message || fallbackMessage };
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const resolveWithin = (baseDir, requestPath) => {
  const absoluteBaseDir = path.resolve(baseDir);
  const candidatePath = path.resolve(absoluteBaseDir, `.${requestPath}`);
  if (candidatePath === absoluteBaseDir || candidatePath.startsWith(`${absoluteBaseDir}${path.sep}`)) {
    return candidatePath;
  }
  return null;
};

const stripHtml = (value = '') => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const flattenText = (value) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(flattenText).filter(Boolean).join(', ');
  if (!value || typeof value !== 'object') return '';
  if (value.name) return flattenText(value.name);
  return Object.values(value).map(flattenText).filter(Boolean).join(', ');
};

const normalizeFeedItem = (source, item, index) => ({
  id: `${source.id || source.label || 'feed'}-${item.guid || item.link || index}`,
  sourceId: source.id || '',
  sourceLabel: source.label || source.url,
  sourcePlatform: source.platform || 'rss',
  title: item.title || 'Untitled item',
  link: item.link || source.url,
  excerpt: stripHtml(item.contentSnippet || item.content || item.summary || item.description || ''),
  author: flattenText(item.creator || item.author || ''),
  publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
});

const requestJson = async (url, options = {}) => {
  const { timeoutMs = 25000, ...fetchOptions } = options;
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  let response;
  let responseText = '';

  try {
    response = await fetch(url, {
      ...fetchOptions,
      signal: abortController.signal,
    });
    responseText = await response.text();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Provider request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  let payload = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    const errorMessage = typeof payload === 'object' && payload
      ? payload.error || payload.message || payload.error_description
      : payload;
    throw new Error(`${errorMessage || 'Provider request failed'} [status:${response.status}]`);
  }

  return payload;
};

const buildPublishText = ({ content, link }) => [content?.trim(), link?.trim()].filter(Boolean).join('\n\n').trim();

const isHttpUrl = (value) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const requestAyrsharePublish = async ({ apiKey, platform, status, mediaUrl }) => {
  if (!apiKey) {
    throw new Error('Ayrshare API key is required');
  }

  const ayrsharePlatform = AYRSHARE_PLATFORM_MAP[platform];
  if (!ayrsharePlatform) {
    throw new Error('Publish provider not supported');
  }

  const normalizedMediaUrl = (mediaUrl || '').trim();
  if (normalizedMediaUrl && !isHttpUrl(normalizedMediaUrl)) {
    throw new Error('Media URL must be a valid http(s) URL');
  }

  if (AYRSHARE_MEDIA_REQUIRED_PLATFORMS.has(platform) && !normalizedMediaUrl) {
    throw new Error(`${platform} publishing requires a public media URL`);
  }

  if (!status && !normalizedMediaUrl) {
    throw new Error('Post content or media URL is required');
  }

  const published = await requestJson('https://app.ayrshare.com/api/post', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post: status || ' ',
      platforms: [ayrsharePlatform],
      shortenLinks: true,
      ...(normalizedMediaUrl ? { mediaUrls: [normalizedMediaUrl] } : {}),
    }),
  });

  const postResult = Array.isArray(published.postIds) ? published.postIds[0] : null;

  return {
    id: postResult?.id || published.id || published.refId || `${platform}-${Date.now()}`,
    platform,
    url: postResult?.postUrl || published.postUrl || '',
    publishedAt: new Date().toISOString(),
    provider: 'ayrshare',
    accountHandle: '',
  };
};

const handleProviderPublish = async (payload = {}) => {
  const status = buildPublishText(payload);
  const providerNote = payload.postType === 'story'
    ? 'Story content is published as a standard social post through the provider API.'
    : '';

  const result = await requestAyrsharePublish({
    apiKey: payload.ayrshareKey,
    platform: payload.platform,
    status,
    mediaUrl: payload.publishMediaUrl,
  });

  return {
    ...result,
    providerNote,
    textLength: status.length,
  };
};

const requestLiveFeeds = async ({ sources = [] }) => {
  const results = await Promise.all(sources.map(async (source) => {
    try {
      const candidateUrl = new URL(source.url);
      if (!['http:', 'https:'].includes(candidateUrl.protocol)) {
        throw new Error('Only http and https feed URLs are supported');
      }

      const feed = await parser.parseURL(candidateUrl.toString());
      const items = (feed.items || []).slice(0, 3).map((item, index) => normalizeFeedItem(source, item, index));
      return { source, items };
    } catch (error) {
      return {
        source,
        items: [],
        error: error instanceof Error ? error.message : 'Feed request failed',
      };
    }
  }));

  const items = results
    .flatMap((result) => result.items)
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
    .slice(0, 12);

  const failedSources = results
    .filter((result) => result.error)
    .map((result) => ({
      id: result.source.id,
      label: result.source.label || result.source.url,
      error: result.error,
    }));

  return { items, failedSources };
};

const buildAiPrompt = ({ action, content, brandName, goal, theme, notes, postType, platforms, voice, hashtags, city }) => {
  const platformNames = Array.isArray(platforms) && platforms.length > 0 ? platforms.join(', ') : 'Instagram';
  const intent = action === 'professional'
    ? 'Rewrite this as polished, executive-level marketing copy that still feels human and direct.'
    : action === 'hashtags'
      ? 'Append a concise, platform-ready hashtag block to strengthen discoverability without sounding spammy.'
      : 'Create a best-in-class source draft for a social campaign that can be adapted to multiple channels.';

  return [
    'You are an elite social media strategist and copywriter.',
    intent,
    'Return plain text only. Do not use markdown fences, labels, or bullet lists unless they are natural in the final copy.',
    `Brand: ${brandName}`,
    `Voice: ${voice || 'Confident, clear, strategic'}`,
    `Market: ${city || 'Primary market'}`,
    `Goal: ${goal || 'Build awareness'}`,
    `Theme: ${theme || 'Campaign'}`,
    `Post type: ${postType || 'feed'}`,
    `Platforms: ${platformNames}`,
    `Preferred hashtags: ${Array.isArray(hashtags) ? hashtags.join(' ') : ''}`,
    `Extra notes: ${notes || 'None'}`,
    `Current draft: ${content || 'No draft exists yet. Create a strong first draft.'}`,
  ].join('\n');
};

const extractText = (value) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(extractText).filter(Boolean).join('\n');
  if (!value || typeof value !== 'object') return '';
  if (typeof value.text === 'string') return value.text;
  if (Array.isArray(value.parts)) return value.parts.map(extractText).filter(Boolean).join('\n');
  if (Array.isArray(value.content)) return value.content.map(extractText).filter(Boolean).join('\n');
  return '';
};

const requestOpenAI = async (apiKey, prompt) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [
        { role: 'system', content: 'You write high-performing social media marketing copy. Return plain text only.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || 'OpenAI request failed');
  }

  return payload.choices?.[0]?.message?.content?.trim() || '';
};

const requestGemini = async (apiKey, prompt) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || 'Gemini request failed');
  }

  return extractText(payload.candidates?.[0]?.content?.parts)?.trim() || '';
};

const requestClaude = async (apiKey, prompt) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 500,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || 'Claude request failed');
  }

  return extractText(payload.content)?.trim() || '';
};

const requestAiDraft = async (payload = {}) => {
  if (!payload.provider) {
    throw new Error('AI provider is required');
  }

  if (!payload.apiKey) {
    throw new Error('AI API key is required');
  }

  const prompt = buildAiPrompt(payload);
  let text = '';

  if (payload.provider === 'chatgpt') {
    text = await requestOpenAI(payload.apiKey, prompt);
  } else if (payload.provider === 'gemini') {
    text = await requestGemini(payload.apiKey, prompt);
  } else if (payload.provider === 'claude') {
    text = await requestClaude(payload.apiKey, prompt);
  } else {
    throw new Error('AI provider not supported');
  }

  if (!text.trim()) {
    throw new Error('AI provider returned an empty response');
  }

  return { text: text.trim(), mode: 'provider' };
};

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) {
      reject(new Error('Request body too large'));
      req.destroy();
    }
  });

  req.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {});
    } catch (error) {
      reject(error);
    }
  });

  req.on('error', reject);
});

const createRequestHandler = ({ rootDir }) => {
  const publicDir = path.resolve(rootDir, 'dist');
  const rootStaticDir = path.resolve(rootDir);

  const serveFile = async (res, filePath) => {
    try {
      const data = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  };

  return async (req, res) => {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = requestUrl.pathname;

    if (req.method === 'POST' && pathname === '/api/ai') {
      try {
        const payload = await readJsonBody(req);
        const result = await requestAiDraft(payload);
        sendJson(res, 200, result);
      } catch (error) {
        const apiError = classifyApiError(error, 'AI request failed');
        sendJson(res, apiError.statusCode, { error: apiError.message });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/feeds') {
      try {
        const payload = await readJsonBody(req);
        const result = await requestLiveFeeds({ sources: Array.isArray(payload.sources) ? payload.sources : [] });
        sendJson(res, 200, result);
      } catch (error) {
        const apiError = classifyApiError(error, 'Feed request failed');
        sendJson(res, apiError.statusCode, { error: apiError.message });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/publish') {
      try {
        const payload = await readJsonBody(req);
        const result = await handleProviderPublish(payload);
        sendJson(res, 200, result);
      } catch (error) {
        const apiError = classifyApiError(error, 'Publish request failed');
        sendJson(res, apiError.statusCode, { error: apiError.message });
      }
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }

    const staticPath = pathname === '/' ? '/index.html' : pathname;
    const distCandidate = resolveWithin(publicDir, staticPath);
    const rootCandidate = staticPath === '/index.html' ? resolveWithin(rootStaticDir, staticPath) : null;

    if (distCandidate && await fileExists(distCandidate)) {
      await serveFile(res, distCandidate);
      return;
    }

    if (rootCandidate && await fileExists(rootCandidate)) {
      await serveFile(res, rootCandidate);
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  };
};

export const startServer = ({ port = DEFAULT_PORT, host = DEFAULT_HOST, rootDir = process.cwd(), silent = false } = {}) => new Promise((resolve, reject) => {
  const server = http.createServer(createRequestHandler({ rootDir }));

  server.once('error', reject);
  server.listen(port, host, () => {
    server.removeListener('error', reject);
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : port;
    const url = `http://${host === DEFAULT_HOST ? 'localhost' : host}:${actualPort}`;
    if (!silent) {
      console.log(`Serving at ${url}`);
    }
    resolve({
      server,
      port: actualPort,
      url,
      close: () => new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose())),
    });
  });
});

const currentFilePath = fileURLToPath(import.meta.url);
const directRunPath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (directRunPath === currentFilePath) {
  startServer({ port: DEFAULT_PORT }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
