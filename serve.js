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

const buildAiPrompt = ({ action, content, brandName, goal, theme, notes, postType, platforms, voice, hashtags, city, feedContext }) => {
  const platformNames = Array.isArray(platforms) && platforms.length > 0 ? platforms.join(', ') : 'Instagram';

  const INTENTS = {
    professional: 'Rewrite this as polished, executive-level marketing copy that still feels human and direct.',
    hashtags: 'Append a concise, platform-ready hashtag block to strengthen discoverability without sounding spammy.',
    generate: 'Create a best-in-class source draft for a social campaign that can be adapted to multiple channels.',
    adapt: [
      'Rewrite this draft as platform-optimized posts.',
      'For EACH of the following platforms, write the ideal version respecting its culture, character limits, audience expectations, and best practices.',
      `Platforms to adapt for: ${platformNames}`,
      'Return ONLY a valid JSON object with lowercase platform IDs as keys and the optimized copy as string values.',
      'Example format: {"instagram": "optimized IG copy...", "linkedin": "optimized LinkedIn copy..."}',
      'Platform guidelines:',
      '- Instagram: visual-first, emoji-friendly, 30 hashtags max, strong CTA, 2200 char limit',
      '- Facebook: conversational, longer-form OK, encourage comments/shares, 63206 char limit',
      '- LinkedIn: professional tone, thought-leadership angle, industry insights, 3000 char limit',
      '- Twitter/X: punchy and concise, strong hook, 1-2 hashtags max, 280 char limit',
      '- YouTube: SEO-rich description, timestamps-friendly, subscribe CTA, keyword-heavy',
      '- Pinterest: aspirational, keyword-rich, actionable ("Try this", "Save for later"), 500 char limit',
      '- TikTok: Gen-Z friendly, trend-aware, casual tone, emoji-heavy, 2200 char limit',
      'Do NOT wrap the JSON in markdown code fences. Return raw JSON only.',
    ].join('\n'),
    variants: [
      'Create 3 distinctly different versions of this social media post for A/B testing.',
      'Each variant MUST use a different psychological angle:',
      'Variant A: Lead with curiosity — create an information gap that demands a click.',
      'Variant B: Lead with social proof or authority — use credibility to build trust.',
      'Variant C: Lead with emotion — tap into aspiration, urgency, or a relatable pain point.',
      'Maintain the same core message and brand voice across all three.',
      'Separate each variant with a line containing only three dashes: ---',
      'Do NOT label them or add headers. Just the copy, separated by ---.',
    ].join('\n'),
    critique: [
      'You are a senior social media strategist performing a pre-publish content review.',
      'Analyze this draft and provide a structured critique:',
      '',
      'SCORE: [X/10]',
      'HOOK: [Strong/Medium/Weak] — [one-sentence assessment of scroll-stopping power]',
      'CTA: [Clear/Vague/Missing] — [one-sentence assessment]',
      'PLATFORM FIT: [one-sentence assessment for target platforms]',
      'VOICE: [one-sentence brand voice alignment check]',
      '',
      'TOP 3 FIXES:',
      '1. [specific, actionable improvement]',
      '2. [specific, actionable improvement]',
      '3. [specific, actionable improvement]',
      '',
      'REWRITE: [provide one improved version incorporating all three fixes]',
      '',
      'Be direct and constructive. No filler. Every sentence must be actionable.',
    ].join('\n'),
    hooks: [
      'Generate 5 scroll-stopping opening lines (hooks) for this social media post.',
      'Each hook MUST use a different psychological trigger:',
      '1. CURIOSITY GAP — create an irresistible information gap',
      '2. HOT TAKE — a bold, slightly controversial claim that demands attention',
      '3. QUESTION — a question so specific the reader MUST answer it mentally',
      '4. PAIN POINT — name a frustration the audience feels daily',
      '5. DATA HOOK — a surprising statistic, number, or timeframe',
      '',
      'Rules:',
      '- Each hook must be ONE sentence, max 15 words',
      '- Each hook must be immediately usable as a post opener',
      '- Number them 1-5',
      '- After the 5 hooks, add --- on its own line, then write a full post using the strongest hook',
    ].join('\n'),
    audience: [
      'Rewrite this post for 3 distinct audience segments while keeping the core message intact.',
      '',
      'Segment 1: COLD AUDIENCE — people who have never heard of this brand.',
      'Focus on: establishing credibility, explaining value from scratch, removing friction.',
      '',
      'Segment 2: WARM COMMUNITY — engaged followers who interact regularly.',
      'Focus on: deepening connection, insider language, community belonging, shared values.',
      '',
      'Segment 3: DECISION-MAKERS — buyers, executives, or clients evaluating a purchase.',
      'Focus on: ROI, results, proof points, professional tone, clear next steps.',
      '',
      'Format: Start each segment with its name on the first line, then the tailored copy below.',
      'Separate each segment with a line containing only three dashes: ---',
    ].join('\n'),
    calendar: [
      'Create a 7-day social media content calendar for this brand.',
      'Each day should serve a DIFFERENT strategic purpose:',
      'Day 1: LAUNCH — introduce or announce something',
      'Day 2: EDUCATE — teach the audience something valuable',
      'Day 3: BEHIND THE SCENES — humanize the brand',
      'Day 4: SOCIAL PROOF — share results, testimonials, or milestones',
      'Day 5: ENGAGE — ask questions, run polls, start conversations',
      'Day 6: TREND — tie into a current trend or cultural moment',
      'Day 7: CTA — direct push toward a specific action',
      '',
      `Available platforms: ${platformNames}`,
      '',
      'Format each day EXACTLY as:',
      'DAY [N] | [Post title] | [Platform1, Platform2] | [One-sentence content brief]',
      '',
      'Make it specific to the brand, theme, and goals provided. No generic filler.',
    ].join('\n'),
    trendspark: [
      'You are analyzing live industry feed data to create trend-driven social content.',
      'Based on the following feed items and trending topics, create a ready-to-publish social media post that:',
      '1. Capitalizes on a specific trend or topic from the feed data',
      '2. Ties it naturally back to the brand\'s message and positioning',
      '3. Feels timely, relevant, and adds the brand\'s unique perspective',
      '4. Is NOT a repost — it\'s original content inspired by the trend',
      '',
      'LIVE FEED DATA:',
      feedContext || '[No feed data available — create a trend-aware post based on current industry themes]',
      '',
      'Create one strong draft. After the draft, add --- on its own line, then list 3 more trend-based post ideas as one-line concepts.',
    ].join('\n'),
    thread: [
      'Convert this content into a compelling multi-part thread (Twitter/X thread or Instagram carousel series).',
      'Rules:',
      '- Create 5-8 parts',
      '- Part 1 MUST be a powerful hook that makes people click "Show this thread"',
      '- Each middle part should make exactly ONE key point',
      '- Build momentum — each part should make the next irresistible to read',
      '- Final part must have a clear CTA and a reason to share the thread',
      '- Keep each part under 280 characters (thread-ready)',
      '- Use a writing style natural for threads: short sentences, line breaks, punchy rhythm',
      '',
      'Separate each part with a line containing only three dashes: ---',
      'Do NOT number them or add "Thread 1/8" labels. Just the copy.',
    ].join('\n'),
  };

  const intent = INTENTS[action] || INTENTS.generate;
  const isStructured = action === 'adapt';

  const baseLines = [
    'You are an elite social media strategist and copywriter.',
    intent,
  ];

  if (!isStructured) {
    baseLines.push('Return plain text only. Do not use markdown fences, labels, or bullet lists unless they are natural in the final copy.');
  }

  baseLines.push(
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
  );

  return baseLines.join('\n');
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
