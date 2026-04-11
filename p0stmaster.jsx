import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Facebook,
  Instagram,
  Linkedin,
  Layout,
  Sparkles,
  Twitter,
  Youtube,
} from 'lucide-react';
import packageMetadata from './package.json';
import AppHeader from './components/AppHeader.jsx';
import AboutModal from './components/AboutModal.jsx';
import ComposerPanel from './components/ComposerPanel.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import ConfigurationModal from './components/ConfigurationModal.jsx';

const STORAGE_KEY = 'p0stmaster_vault';
const VAULT_PASSPHRASE = 'akita-engineering-strong-vault-2026';
const APP_VERSION = packageMetadata.version || '0.0.0';

const PALETTES = {
  dark: {
    bg: 'bg-black',
    card: 'bg-[#1E293B]',
    accent: 'text-indigo-400',
    primary: 'bg-indigo-600',
    secondary: 'bg-slate-700',
    border: 'border-slate-800',
    textDim: 'text-slate-400',
    textLight: 'text-slate-100',
  },
  light: {
    bg: 'bg-slate-100',
    card: 'bg-white',
    accent: 'text-indigo-600',
    primary: 'bg-indigo-500',
    secondary: 'bg-slate-300',
    border: 'border-slate-200',
    textDim: 'text-slate-500',
    textLight: 'text-slate-900',
  },
  fm: {
    bg: 'bg-black',
    card: 'bg-[#100b16]',
    accent: 'text-fuchsia-400',
    primary: 'bg-purple-700',
    secondary: 'bg-slate-900',
    border: 'border-fuchsia-600',
    textDim: 'text-fuchsia-300',
    textLight: 'text-slate-100',
  },
};

const DEFAULT_THEME = 'dark';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', supportsStories: true },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500', supportsStories: true },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', supportsStories: false },
  { id: 'pinterest', name: 'Pinterest', icon: Layout, color: 'text-red-500', supportsStories: false },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'text-slate-200', supportsStories: false },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', supportsStories: true },
  { id: 'tiktok', name: 'TikTok', icon: Sparkles, color: 'text-fuchsia-400', supportsStories: true },
];

const AYRSHARE_PUBLISH_PLATFORMS = ['facebook', 'instagram', 'linkedin', 'pinterest', 'twitter', 'youtube', 'tiktok'];
const AYRSHARE_MEDIA_REQUIRED_PLATFORMS = ['instagram', 'pinterest', 'youtube', 'tiktok'];
const SUPPORTED_PLATFORM_IDS = new Set(PLATFORMS.map((platform) => platform.id));
const SUPPORTED_FEED_TYPES = new Set(['rss', 'youtube', 'news']);

const EMPTY_BRAND = Object.freeze({
  id: 'brand-empty',
  name: '',
  city: '',
  voice: '',
  hashtags: [],
  primaryColor: '#64748B',
  templates: [],
  fonts: [],
  ctaLibrary: [],
});

const EMPTY_ACCOUNT = Object.freeze({
  id: 'acct-empty',
  platform: 'instagram',
  label: '',
  handle: '',
  brandId: '',
  role: '',
});

const DEFAULT_CLIENT = {
  id: 'client-1',
  name: 'Workspace',
  company: '',
  contactName: '',
  contactEmail: '',
  notes: '',
  aiProvider: 'gemini',
  apiKeys: { chatgpt: '', gemini: '', claude: '' },
  socialKeys: {
    ayrshare: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    pinterest: '',
    twitter: '',
    youtube: '',
  },
  feedSources: [],
  selectedAccountId: '',
  accounts: [],
  brands: [],
  governance: { approvalRequired: true, brandSafe: true, roleBased: true },
};

const DEFAULT_CONFIG = {
  selectedClientId: DEFAULT_CLIENT.id,
  clients: [DEFAULT_CLIENT],
};

const DEFAULT_DRAFT = {
  id: 'draft-0',
  selectedPlatforms: [],
  postType: 'feed',
  content: '',
  media: [],
  link: '',
  publishMediaUrl: '',
  pinterestBoard: '',
  selectedAccountId: '',
  theme: '',
  frequency: '',
  goal: '',
  notes: '',
  approvalStatus: 'draft',
  createdAt: Date.now(),
};

const isLegacySeededDraft = (draft) => {
  if (!draft || typeof draft !== 'object') return false;

  const content = String(draft.content || '').toLowerCase();
  const notes = String(draft.notes || '').toLowerCase();
  const mediaNames = (Array.isArray(draft.media) ? draft.media : [])
    .map((item) => String(item?.name || '').toLowerCase());

  let score = 0;
  if (content.includes('manually edited draft for approval testing')) score += 2;
  if (content.includes('akita engineering is building momentum across instagram')) score += 1;
  if (notes.includes('ai rewrite') && notes.includes('live feed refresh')) score += 1;
  if (mediaNames.some((name) => name.includes('test-brand.svg'))) score += 1;

  return score >= 2;
};

const sanitizeSessionDraft = (draft) => {
  const nextDraft = {
    ...DEFAULT_DRAFT,
    ...(draft || {}),
    selectedPlatforms: (Array.isArray(draft?.selectedPlatforms) ? draft.selectedPlatforms : []).filter((platformId) => SUPPORTED_PLATFORM_IDS.has(platformId)),
    media: [],
  };

  if (!isLegacySeededDraft(nextDraft)) {
    return nextDraft;
  }

  return {
    ...nextDraft,
    selectedPlatforms: [],
    content: '',
    link: '',
    publishMediaUrl: '',
    notes: '',
    theme: '',
    frequency: '',
    goal: '',
    pinterestBoard: '',
    approvalStatus: 'draft',
  };
};

const toBase64 = (arr) => btoa(String.fromCharCode(...new Uint8Array(arr)));
const fromBase64 = (str) => Uint8Array.from(atob(str), (char) => char.charCodeAt(0));
const createId = () => Math.random().toString(36).slice(2, 10);
const cloneValue = (value) => JSON.parse(JSON.stringify(value));
const shortenText = (text = '', max = 140) => (text.length <= max ? text : `${text.slice(0, max - 1)}...`);
const getElectronVersion = () => {
  const match = window.navigator.userAgent.match(/Electron\/(\S+)/i);
  return match ? match[1] : '';
};

const formatPlatformLabel = () => {
  const platform = window.navigator.userAgentData?.platform || window.navigator.platform || 'Unknown';
  if (/^win/i.test(platform)) return 'Windows';
  if (/mac/i.test(platform)) return 'macOS';
  if (/linux/i.test(platform)) return 'Linux';
  return platform;
};

const isHttpUrl = (value = '') => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const rgbToHex = ([red, green, blue]) => `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

const loadImageFromUrl = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Unable to load image for brand analysis'));
  image.src = src;
});

const extractPaletteFromImage = async (src, swatchCount = 4) => {
  const image = await loadImageFromUrl(src);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    throw new Error('Canvas context is unavailable in this browser');
  }

  const naturalWidth = image.naturalWidth || 1;
  const naturalHeight = image.naturalHeight || 1;
  const maxDimension = 96;
  const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));

  canvas.width = Math.max(1, Math.round(naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(naturalHeight * scale));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = new Map();

  for (let index = 0; index < data.length; index += 16) {
    const alpha = data[index + 3];
    if (alpha < 160) continue;

    const red = Math.min(255, Math.round(data[index] / 32) * 32);
    const green = Math.min(255, Math.round(data[index + 1] / 32) * 32);
    const blue = Math.min(255, Math.round(data[index + 2] / 32) * 32);

    if (red > 240 && green > 240 && blue > 240) continue;
    if (red < 16 && green < 16 && blue < 16) continue;

    const key = `${red},${green},${blue}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const palette = [...buckets.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, swatchCount)
    .map(([key]) => rgbToHex(key.split(',').map(Number)));

  return {
    width: naturalWidth,
    height: naturalHeight,
    palette: palette.length > 0 ? palette : ['#64748B'],
  };
};

const revokeObjectUrl = (url) => {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

const revokeMediaUrls = (mediaItems = []) => {
  mediaItems.forEach((item) => revokeObjectUrl(item.url));
};

const buildBlankBrand = (overrides = {}) => ({
  id: overrides.id || `brand-${createId()}`,
  name: overrides.name ?? '',
  city: overrides.city ?? '',
  voice: overrides.voice ?? '',
  hashtags: Array.isArray(overrides.hashtags) ? overrides.hashtags : [],
  primaryColor: overrides.primaryColor || '#64748B',
  templates: Array.isArray(overrides.templates) ? overrides.templates : [],
  fonts: Array.isArray(overrides.fonts) ? overrides.fonts : [],
  ctaLibrary: Array.isArray(overrides.ctaLibrary) ? overrides.ctaLibrary : [],
});

const buildBlankAccount = (brandId = '', overrides = {}) => ({
  id: overrides.id || `acct-${createId()}`,
  platform: overrides.platform || 'instagram',
  label: overrides.label ?? '',
  handle: overrides.handle ?? '',
  brandId: overrides.brandId || brandId,
  role: overrides.role ?? '',
});

const sanitizeSocialKeys = (socialKeys = {}) => {
  const nextKeys = { ...DEFAULT_CLIENT.socialKeys, ...(socialKeys || {}) };
  return {
    ayrshare: nextKeys.ayrshare || '',
    facebook: nextKeys.facebook || '',
    instagram: nextKeys.instagram || '',
    linkedin: nextKeys.linkedin || '',
    pinterest: nextKeys.pinterest || '',
    twitter: nextKeys.twitter || '',
    youtube: nextKeys.youtube || '',
  };
};

const buildBlankFeedSource = (overrides = {}) => ({
  id: overrides.id || `feed-${createId()}`,
  label: overrides.label ?? '',
  platform: overrides.platform || 'rss',
  url: overrides.url ?? '',
  enabled: overrides.enabled ?? true,
});

const getPublishingAccountForPlatform = (client, selectedAccountId, platformId) => {
  const selectedAccount = client.accounts.find((account) => account.id === selectedAccountId);
  if (selectedAccount?.platform === platformId) {
    return selectedAccount;
  }

  return client.accounts.find((account) => account.platform === platformId) || null;
};

const buildBlankClient = (overrides = {}) => {
  const brands = Array.isArray(overrides.brands) ? overrides.brands : [];
  const accounts = Array.isArray(overrides.accounts) ? overrides.accounts : [];
  const feedSources = Array.isArray(overrides.feedSources) ? overrides.feedSources : [];

  return {
    ...cloneValue(DEFAULT_CLIENT),
    id: overrides.id || `client-${createId()}`,
    name: overrides.name || 'Workspace',
    company: overrides.company ?? '',
    contactName: overrides.contactName ?? '',
    contactEmail: overrides.contactEmail ?? '',
    notes: overrides.notes ?? '',
    aiProvider: overrides.aiProvider || DEFAULT_CLIENT.aiProvider,
    apiKeys: { ...DEFAULT_CLIENT.apiKeys, ...(overrides.apiKeys || {}) },
    socialKeys: sanitizeSocialKeys(overrides.socialKeys),
    feedSources,
    selectedAccountId: overrides.selectedAccountId || accounts[0]?.id || '',
    accounts,
    brands,
    governance: { ...DEFAULT_CLIENT.governance, ...(overrides.governance || {}) },
  };
};

const isLegacySeededClient = (client) => {
  if (!client || typeof client !== 'object') return false;

  const name = String(client.name || '').toLowerCase();
  const company = String(client.company || '').toLowerCase();
  const notes = String(client.notes || '').toLowerCase();
  const feedUrls = (Array.isArray(client.feedSources) ? client.feedSources : [])
    .map((source) => String(source?.url || '').toLowerCase());
  const accountLabels = (Array.isArray(client.accounts) ? client.accounts : [])
    .map((account) => `${account?.label || ''} ${account?.handle || ''}`.toLowerCase());
  const brandNames = (Array.isArray(client.brands) ? client.brands : [])
    .map((brand) => String(brand?.name || '').toLowerCase());

  let score = 0;
  if (name.includes('akita engineering workspace')) score += 2;
  if (company.includes('akita engineering')) score += 1;
  if (notes.includes('primary client workspace')) score += 1;
  if (feedUrls.some((url) => url.includes('techcrunch.com/feed'))) score += 1;
  if (feedUrls.some((url) => url.includes('blog.google/technology/ai/rss'))) score += 1;
  if (accountLabels.some((label) => label.includes('akita ig') || label.includes('@akitaengineering'))) score += 1;
  if (brandNames.some((brandName) => brandName === 'akita engineering' || brandName === 'your brand')) score += 1;

  return score >= 3;
};

const normalizeClient = (client, index = 0) => {
  const sourceClient = isLegacySeededClient(client)
    ? {
        id: client?.id,
        name: 'Workspace',
        company: '',
        contactName: '',
        contactEmail: '',
        notes: '',
        aiProvider: client?.aiProvider || DEFAULT_CLIENT.aiProvider,
        apiKeys: client?.apiKeys || {},
        socialKeys: client?.socialKeys || {},
        feedSources: [],
        selectedAccountId: '',
        accounts: [],
        brands: [],
        governance: client?.governance || {},
      }
    : client;

  const baseClient = buildBlankClient({
    id: sourceClient?.id || `client-${index + 1}`,
    name: sourceClient?.name || 'Workspace',
    company: sourceClient?.company ?? '',
    contactName: sourceClient?.contactName ?? '',
    contactEmail: sourceClient?.contactEmail ?? '',
    notes: sourceClient?.notes ?? '',
    aiProvider: sourceClient?.aiProvider || DEFAULT_CLIENT.aiProvider,
    apiKeys: sourceClient?.apiKeys || {},
    socialKeys: sourceClient?.socialKeys || {},
    governance: sourceClient?.governance || {},
  });

  const normalizedBrands = (Array.isArray(sourceClient?.brands) ? sourceClient.brands : []).map((brand, brandIndex) => ({
    ...buildBlankBrand({ id: brand?.id || `brand-${index + 1}-${brandIndex + 1}` }),
    ...brand,
    id: brand?.id || `brand-${index + 1}-${brandIndex + 1}`,
    hashtags: Array.isArray(brand?.hashtags) ? brand.hashtags.filter(Boolean) : [],
    templates: Array.isArray(brand?.templates) ? brand.templates.filter(Boolean) : [],
    fonts: Array.isArray(brand?.fonts) ? brand.fonts.filter(Boolean) : [],
    ctaLibrary: Array.isArray(brand?.ctaLibrary) ? brand.ctaLibrary.filter(Boolean) : [],
  }));

  const primaryBrandId = normalizedBrands[0]?.id || '';

  const normalizedAccounts = (Array.isArray(sourceClient?.accounts) ? sourceClient.accounts : [])
    .filter((account) => SUPPORTED_PLATFORM_IDS.has(account?.platform))
    .map((account, accountIndex) => ({
    ...buildBlankAccount(account?.brandId || primaryBrandId, { id: account?.id || `acct-${index + 1}-${accountIndex + 1}` }),
    ...account,
    id: account?.id || `acct-${index + 1}-${accountIndex + 1}`,
    brandId: account?.brandId || primaryBrandId,
  }));

  const normalizedFeedSources = (Array.isArray(sourceClient?.feedSources) ? sourceClient.feedSources : [])
    .filter((source) => SUPPORTED_FEED_TYPES.has(source?.platform || 'rss'))
    .map((source, sourceIndex) => ({
    ...buildBlankFeedSource({ id: source?.id || `feed-${index + 1}-${sourceIndex + 1}` }),
    ...source,
    id: source?.id || `feed-${index + 1}-${sourceIndex + 1}`,
    enabled: source?.enabled ?? true,
  }));

  return {
    ...baseClient,
    ...sourceClient,
    brands: normalizedBrands,
    accounts: normalizedAccounts,
    feedSources: normalizedFeedSources,
    selectedAccountId: normalizedAccounts.find((account) => account.id === sourceClient?.selectedAccountId)?.id
      || normalizedAccounts[0]?.id
      || '',
    governance: { ...DEFAULT_CLIENT.governance, ...(sourceClient?.governance || {}) },
    apiKeys: { ...DEFAULT_CLIENT.apiKeys, ...(sourceClient?.apiKeys || {}) },
    socialKeys: sanitizeSocialKeys(sourceClient?.socialKeys),
  };
};

const normalizeConfig = (value) => {
  if (!value) {
    return cloneValue(DEFAULT_CONFIG);
  }

  if (Array.isArray(value.clients) && value.clients.length > 0) {
    const clients = value.clients.map((client, index) => normalizeClient(client, index));
    return {
      selectedClientId: clients.find((client) => client.id === value.selectedClientId)?.id || clients[0]?.id || DEFAULT_CLIENT.id,
      clients,
    };
  }

  const migratedClient = normalizeClient({
    name: value.name || 'Workspace',
    company: value.company ?? '',
    contactName: value.contactName ?? '',
    contactEmail: value.contactEmail ?? '',
    notes: value.notes ?? '',
    aiProvider: value.aiProvider,
    apiKeys: value.apiKeys,
    socialKeys: value.socialKeys,
    selectedAccountId: value.selectedAccountId,
    accounts: value.accounts,
    brands: value.brands,
    feedSources: value.feedSources,
    governance: value.governance,
  });

  return {
    selectedClientId: migratedClient.id,
    clients: [migratedClient],
  };
};

const deriveKey = async (passphrase, salt) => {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);

  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

const encryptPayload = async (payload) => {
  const text = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(VAULT_PASSPHRASE, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

  return JSON.stringify({
    salt: toBase64(salt),
    iv: toBase64(iv),
    cipher: toBase64(encrypted),
  });
};

const decryptPayload = async (encryptedPayload) => {
  const { salt, iv, cipher } = JSON.parse(encryptedPayload);
  const key = await deriveKey(VAULT_PASSPHRASE, fromBase64(salt));
  const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, key, fromBase64(cipher));
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted));
};

const persistVault = async (state) => {
  try {
    const encrypted = await encryptPayload(state);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Vault save failed', error);
  }
};

const loadVault = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return await decryptPayload(raw);
  } catch (error) {
    console.warn('Vault load failed, using blank workspace state.', error);
    return null;
  }
};

const generateHashtags = (platformId) => {
  const common = ['#SocialMedia', '#ContentStrategy'];
  if (platformId === 'instagram') return [...common, '#InstaGrowth', '#CreatorEconomy'];
  if (platformId === 'linkedin') return ['#Leadership', '#B2B', '#ThoughtLeadership'];
  if (platformId === 'twitter') return ['#ShortForm', '#TrendAlert'];
  if (platformId === 'youtube') return ['#WatchNow', '#VideoMarketing'];
  if (platformId === 'pinterest') return ['#VisualInspo', '#SaveForLater'];
  if (platformId === 'facebook') return ['#Community', '#BrandStory'];
  if (platformId === 'tiktok') return ['#ForYou', '#Trending', '#Creator'];
  return common;
};

const adaptCaption = (platformId, content, postType, brandName) => {
  const normalizedBrandName = brandName || 'your brand';
  const base = content.trim() || `Share the latest update from ${normalizedBrandName}.`;
  const short = shortenText(base, platformId === 'twitter' || platformId === 'tiktok' ? 180 : 220);
  const cta = postType === 'story' ? 'Tap to learn more.' : 'Save this for later.';
  const tagSegment = platformId === 'instagram'
    ? generateHashtags('instagram').join(' ')
    : platformId === 'tiktok'
      ? '#ForYou #Creator'
      : '';

  switch (platformId) {
    case 'instagram':
      return `${short}\n\n${tagSegment}\n${cta}`;
    case 'facebook':
      return `${short}\n\nWe would love to hear what you think. ${generateHashtags('facebook').join(' ')}`;
    case 'linkedin':
      return `${short}\n\nInsight: ${normalizedBrandName} is helping teams move faster with better execution. ${generateHashtags('linkedin').join(' ')}`;
    case 'twitter':
      if (base.length > 220) {
        const firstLine = shortenText(base, 220);
        return `${firstLine}\n\n1/ More context below\n2/ Why it matters\n#ThreadStarter`;
      }
      return `${short} ${generateHashtags('twitter').join(' ')}`;
    case 'youtube':
      return `New video from ${normalizedBrandName}: ${short} Watch now and subscribe. ${generateHashtags('youtube').join(' ')}`;
    case 'pinterest':
      return `Need fresh ideas? ${short} Save it for later. ${generateHashtags('pinterest').join(' ')}`;
    case 'tiktok':
      return `Hook: ${short}\n\nUse a fast opener, trending audio, and a direct CTA. ${cta}\n${tagSegment}`;
    default:
      return `${short} ${cta}`;
  }
};

const scanCompliance = (text, link, selectedPlatforms) => {
  const warnings = [];
  const normalized = text.toLowerCase();
  const bannedTerms = ['scam', 'illegal', 'gambling', 'nsfw', 'sex', 'drugs'];

  bannedTerms.forEach((item) => {
    if (normalized.includes(item)) {
      warnings.push(`Potential policy risk: '${item}' found in content.`);
    }
  });

  if (selectedPlatforms.includes('instagram') && link && !link.startsWith('https://')) {
    warnings.push('Instagram Story links require a secure https:// URL.');
  }

  if (/guarantee|free money|no risk/.test(normalized)) {
    warnings.push('Advertising claims should be verified against legal and platform policies.');
  }

  if (/competitor|their product/.test(normalized)) {
    warnings.push('Competitor language detected. Check for brand-safe compliance.');
  }

  if (normalized.includes('#ad') && !normalized.includes('disclosure')) {
    warnings.push('Marketing disclosure missing for sponsored or promotional content.');
  }

  return warnings;
};

const scanPlatformRules = (text, link, selectedPlatforms) => {
  const alerts = [];
  const normalized = text.toLowerCase();

  selectedPlatforms.forEach((platform) => {
    if (platform === 'instagram' && normalized.includes('@everyone')) {
      alerts.push('Instagram does not support @everyone mentions in captions.');
    }
    if (platform === 'linkedin' && normalized.includes('#blessed')) {
      alerts.push('LinkedIn prefers professional language over casual meme phrasing like #blessed.');
    }
    if (platform === 'tiktok' && link && !link.startsWith('https://')) {
      alerts.push('TikTok requires secure https:// links for profile and ad landing pages.');
    }
    if (platform === 'twitter' && normalized.length > 280) {
      alerts.push('X post exceeds the 280 character limit and should be threaded.');
    }
    if (platform === 'pinterest' && !link) {
      alerts.push('Pinterest posts perform better with a destination link.');
    }
  });

  return alerts;
};

const buildAssetVariants = (mediaItems) => {
  if (!mediaItems.length) return [];

  const base = mediaItems[0].type === 'video' ? 'Video' : 'Image';
  return [
    { id: createId(), label: `${base} Reel / Short`, format: 'vertical', notes: 'Sized for Reels and TikTok' },
    { id: createId(), label: `${base} Story Cut`, format: '9:16', notes: 'Story-safe framing with CTA space' },
    { id: createId(), label: `${base} Feed Post`, format: '1:1', notes: 'Square layout for feed placement' },
    { id: createId(), label: `${base} Cover Image`, format: 'horizontal', notes: 'Landscape crop for web or video headers' },
  ];
};

const buildCalendarPlan = (draft) => {
  const theme = draft.theme || 'Campaign';
  const goal = draft.goal || 'growth';
  const themes = [
    `Launch ${theme}`,
    `Behind the scenes of ${goal}`,
    'Customer success story',
    'Trend-led creative prompt',
    'Community Q&A post',
  ];

  return themes.map((title, index) => ({
    id: `plan-${index + 1}`,
    date: `Apr ${12 + index}`,
    title,
    platforms: draft.selectedPlatforms.slice(0, 3).map((id) => PLATFORMS.find((platform) => platform.id === id)?.name || id),
    status: index === 0 ? 'Draft' : 'Planned',
  }));
};

const buildAudienceVariants = (content, brandName) => {
  if (!content) return [];

  const normalizedBrandName = brandName || 'your brand';
  return [
    { id: createId(), segment: 'New followers', copy: `Welcome in. ${shortenText(content, 140)} Discover how ${normalizedBrandName} can help you move faster.` },
    { id: createId(), segment: 'Loyal followers', copy: `Thanks for staying with us. ${shortenText(content, 140)} We are sharing something built for your next step.` },
    { id: createId(), segment: 'Customers', copy: `Your success matters. ${shortenText(content, 140)} Here is how ${normalizedBrandName} keeps delivering value.` },
  ];
};

const buildCampaignPlan = (draft) => {
  const theme = draft.theme || 'Campaign';

  return Array.from({ length: 10 }, (_, index) => ({
    id: `campaign-${index + 1}`,
    date: `Apr ${12 + index}`,
    title: `${theme} - ${index === 0 ? 'Launch' : index === 1 ? 'Behind the scenes' : index === 2 ? 'Customer story' : index === 3 ? 'Trend update' : 'Engagement post'}`,
    platforms: draft.selectedPlatforms.slice(0, 3).map((id) => PLATFORMS.find((platform) => platform.id === id)?.name || id),
    status: index === 0 ? 'Draft' : 'Planned',
  }));
};

const buildTrendSignalsFromFeeds = (items) => {
  const stopWords = new Set(['this', 'that', 'with', 'from', 'your', 'into', 'about', 'their', 'will', 'have', 'they', 'them', 'what', 'when', 'where', 'which', 'while', 'more', 'than', 'over', 'under', 'across', 'after', 'before', 'because', 'being', 'been', 'would', 'could', 'should', 'there', 'here', 'also', 'only']);
  const keywordCounts = new Map();

  items.forEach((item) => {
    const text = `${item.title || ''} ${item.excerpt || ''}`.toLowerCase();
    const words = text.match(/[a-z0-9][a-z0-9-]{3,}/g) || [];

    words.forEach((word) => {
      if (stopWords.has(word) || /^\d+$/.test(word)) return;
      keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
    });
  });

  return [...keywordCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([word], index) => ({
      label: `#${word.replace(/[^a-z0-9-]/g, '')}`,
      type: index === 0 ? 'Live topic' : index === 1 ? 'Keyword' : 'Signal',
    }));
};

const formatTimeAgo = (value) => {
  if (!value) return 'moments ago';

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return 'moments ago';

  const diffMs = Date.now() - dateValue.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

const requestAiDraft = async ({ provider, apiKey, action, sessionDraft, selectedBrand }) => {
  if (!provider || !apiKey?.trim()) {
    throw new Error('Configure an AI provider and API key before requesting AI copy');
  }

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider,
      apiKey,
      action,
      content: sessionDraft.content,
      brandName: selectedBrand.name,
      goal: sessionDraft.goal,
      theme: sessionDraft.theme,
      notes: sessionDraft.notes,
      postType: sessionDraft.postType,
      platforms: sessionDraft.selectedPlatforms.map((platformId) => PLATFORMS.find((platform) => platform.id === platformId)?.name || platformId),
      voice: selectedBrand.voice,
      hashtags: selectedBrand.hashtags,
      city: selectedBrand.city,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'AI request failed');
  }

  const text = typeof payload.text === 'string' ? payload.text.trim() : '';
  if (!text) {
    throw new Error('AI provider returned an empty draft');
  }

  return {
    text,
    mode: payload.mode || 'provider',
  };
};

const requestPlatformPublish = async ({ platform, sessionDraft, activeClient, account }) => {
  const response = await fetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform,
      content: sessionDraft.content,
      link: sessionDraft.link,
      publishMediaUrl: sessionDraft.publishMediaUrl,
      postType: sessionDraft.postType,
      ayrshareKey: activeClient.socialKeys.ayrshare,
      account,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Publish request failed');
  }

  return payload;
};

const App = () => {
  const [config, setConfig] = useState(() => cloneValue(DEFAULT_CONFIG));
  const [configDraft, setConfigDraft] = useState(() => cloneValue(DEFAULT_CONFIG));
  const [sessionDraft, setSessionDraft] = useState(() => ({ ...DEFAULT_DRAFT }));
  const [draftHistory, setDraftHistory] = useState([]);
  const [actionLog, setActionLog] = useState([]);
  const [calendarPlan, setCalendarPlan] = useState([]);
  const [campaignPlan, setCampaignPlan] = useState([]);
  const [platformTrends, setPlatformTrends] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [brandKitImageUrl, setBrandKitImageUrl] = useState('');
  const [brandKitExtras, setBrandKitExtras] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configTab, setConfigTab] = useState('ai');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [saveBanner, setSaveBanner] = useState('');
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [assetVariants, setAssetVariants] = useState([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);
  const [isBrandKitProcessing, setIsBrandKitProcessing] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('mobile');
  const [themeMode, setThemeMode] = useState(DEFAULT_THEME);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [liveFeedItems, setLiveFeedItems] = useState([]);
  const [liveFeedError, setLiveFeedError] = useState('');
  const [isRefreshingFeeds, setIsRefreshingFeeds] = useState(false);
  const [liveFeedUpdatedAt, setLiveFeedUpdatedAt] = useState('');

  const fileInputRef = useRef(null);
  const feedRequestRef = useRef(0);
  const theme = useMemo(() => PALETTES[themeMode] || PALETTES.dark, [themeMode]);
  const aboutInfo = useMemo(() => {
    const electronVersion = getElectronVersion();
    const runtimeLabel = electronVersion ? 'Desktop build' : 'Browser preview';

    return {
      appVersion: APP_VERSION,
      runtimeLabel,
      platformLabel: formatPlatformLabel(),
      runtimeDetails: electronVersion
        ? `Electron ${electronVersion}`
        : 'Running in a standard browser session',
    };
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      if (!window.crypto?.subtle) return;

      const saved = await loadVault();
      if (!saved) return;

      if (saved.config) setConfig(normalizeConfig(saved.config));
      if (saved.sessionDraft) setSessionDraft(sanitizeSessionDraft(saved.sessionDraft));
      if (Array.isArray(saved.draftHistory)) setDraftHistory(saved.draftHistory);
      if (Array.isArray(saved.actionLog)) setActionLog(saved.actionLog);
      if (Array.isArray(saved.calendarPlan)) setCalendarPlan(saved.calendarPlan);
      if (Array.isArray(saved.campaignPlan)) setCampaignPlan(saved.campaignPlan);
      if (Array.isArray(saved.platformTrends)) setPlatformTrends(saved.platformTrends);
      if (Array.isArray(saved.liveFeedItems)) setLiveFeedItems(saved.liveFeedItems);
      if (saved.liveFeedUpdatedAt) setLiveFeedUpdatedAt(saved.liveFeedUpdatedAt);
      if (saved.themeMode) setThemeMode(saved.themeMode);
    };

    void hydrate();
  }, []);

  useEffect(() => {
    const persist = async () => {
      if (!window.crypto?.subtle) return;

      await persistVault({
        config,
        sessionDraft,
        draftHistory,
        actionLog,
        calendarPlan,
        campaignPlan,
        platformTrends,
        liveFeedItems,
        liveFeedUpdatedAt,
        themeMode,
      });
    };

    void persist();
  }, [config, sessionDraft, draftHistory, actionLog, calendarPlan, campaignPlan, platformTrends, liveFeedItems, liveFeedUpdatedAt, themeMode]);

  useEffect(() => {
    if (!saveBanner) return undefined;

    const timer = window.setTimeout(() => setSaveBanner(''), 2600);
    return () => window.clearTimeout(timer);
  }, [saveBanner]);

  useEffect(() => () => {
    revokeMediaUrls(sessionDraft.media);
    revokeObjectUrl(brandKitImageUrl);
  }, [sessionDraft.media, brandKitImageUrl]);

  const activeClient = useMemo(
    () => config.clients.find((client) => client.id === config.selectedClientId) || config.clients[0] || DEFAULT_CLIENT,
    [config.clients, config.selectedClientId],
  );

  const draftClient = useMemo(
    () => configDraft.clients.find((client) => client.id === configDraft.selectedClientId) || configDraft.clients[0] || DEFAULT_CLIENT,
    [configDraft.clients, configDraft.selectedClientId],
  );

  useEffect(() => {
    const accounts = activeClient.accounts || [];

    setSessionDraft((prev) => {
      const nextAccountId = accounts.some((account) => account.id === prev.selectedAccountId)
        ? prev.selectedAccountId
        : activeClient.selectedAccountId || accounts[0]?.id || '';

      if (nextAccountId === prev.selectedAccountId) {
        return prev;
      }

      return { ...prev, selectedAccountId: nextAccountId };
    });
  }, [activeClient]);

  const selectedAccount = useMemo(
    () => activeClient.accounts.find((account) => account.id === sessionDraft.selectedAccountId) || activeClient.accounts[0] || EMPTY_ACCOUNT,
    [activeClient.accounts, sessionDraft.selectedAccountId],
  );

  const selectedBrand = useMemo(
    () => activeClient.brands.find((brand) => brand.id === selectedAccount?.brandId) || activeClient.brands[0] || EMPTY_BRAND,
    [activeClient.brands, selectedAccount],
  );

  const complianceWarnings = useMemo(
    () => scanCompliance(sessionDraft.content, sessionDraft.link, sessionDraft.selectedPlatforms),
    [sessionDraft.content, sessionDraft.link, sessionDraft.selectedPlatforms],
  );

  const platformAlerts = useMemo(
    () => scanPlatformRules(sessionDraft.content, sessionDraft.link, sessionDraft.selectedPlatforms),
    [sessionDraft.content, sessionDraft.link, sessionDraft.selectedPlatforms],
  );

  const adaptedCaptions = useMemo(
    () => sessionDraft.selectedPlatforms.reduce((accumulator, platformId) => {
      accumulator[platformId] = adaptCaption(platformId, sessionDraft.content, sessionDraft.postType, selectedBrand.name);
      return accumulator;
    }, {}),
    [sessionDraft.content, sessionDraft.selectedPlatforms, sessionDraft.postType, selectedBrand.name],
  );

  const audienceVariants = useMemo(
    () => buildAudienceVariants(sessionDraft.content, selectedBrand.name),
    [sessionDraft.content, selectedBrand.name],
  );

  const connectedPublishPlatforms = useMemo(
    () => {
      const connected = new Set();

      if (activeClient.socialKeys.ayrshare?.trim()) {
        const mappedPlatforms = new Set((activeClient.accounts || []).map((account) => account.platform));
        AYRSHARE_PUBLISH_PLATFORMS.forEach((platformId) => {
          if (mappedPlatforms.has(platformId)) {
            connected.add(platformId);
          }
        });
      }

      return [...connected];
    },
    [activeClient.accounts, activeClient.socialKeys.ayrshare],
  );

  const unmappedPublishPlatforms = useMemo(
    () => sessionDraft.selectedPlatforms.filter((platformId) => !connectedPublishPlatforms.includes(platformId)),
    [connectedPublishPlatforms, sessionDraft.selectedPlatforms],
  );

  const publishDisabledReason = useMemo(() => {
    if (sessionDraft.selectedPlatforms.length === 0) {
      return 'Select at least one platform';
    }

    if (!sessionDraft.content.trim() && sessionDraft.media.length === 0 && !sessionDraft.link.trim() && !sessionDraft.publishMediaUrl.trim()) {
      return 'Add content, media, destination link, or public media URL';
    }

    if (sessionDraft.publishMediaUrl.trim() && !isHttpUrl(sessionDraft.publishMediaUrl.trim())) {
      return 'Publish media URL must use http:// or https://';
    }

    const selectedMediaRequiredPlatforms = sessionDraft.selectedPlatforms.filter((platformId) => AYRSHARE_MEDIA_REQUIRED_PLATFORMS.includes(platformId));
    if (selectedMediaRequiredPlatforms.length > 0 && !sessionDraft.publishMediaUrl.trim()) {
      const labels = selectedMediaRequiredPlatforms.map((platformId) => PLATFORMS.find((platform) => platform.id === platformId)?.name || platformId);
      return `Public media URL required for ${labels.join(', ')}`;
    }

    if (activeClient.governance.approvalRequired && sessionDraft.approvalStatus !== 'approved') {
      return 'Approval required before live publishing';
    }

    if (unmappedPublishPlatforms.length > 0) {
      const labels = unmappedPublishPlatforms.map((platformId) => PLATFORMS.find((platform) => platform.id === platformId)?.name || platformId);
      return `Live provider mapping required for ${labels.join(', ')}`;
    }

    return '';
  }, [activeClient.governance.approvalRequired, sessionDraft, unmappedPublishPlatforms]);

  const previewGridClass = previewDevice === 'mobile' ? 'grid-cols-1 justify-items-center' : 'md:grid-cols-2 items-start';
  const previewCardClass = previewDevice === 'mobile' ? 'w-full max-w-[360px]' : 'w-full';

  const logAction = (type, message) => {
    setActionLog((prev) => ([
      { id: createId(), type, message, at: new Date().toISOString() },
      ...prev,
    ].slice(0, 20)));
  };

  const updateConfigDraftClient = (updater) => {
    setConfigDraft((prev) => ({
      ...prev,
      clients: prev.clients.map((client) => (client.id === prev.selectedClientId ? updater(client) : client)),
    }));
  };

  const handleClientSelection = (clientId) => {
    const nextClient = config.clients.find((client) => client.id === clientId) || config.clients[0] || DEFAULT_CLIENT;

    setConfig((prev) => ({ ...prev, selectedClientId: nextClient.id }));
    setSessionDraft((prev) => ({
      ...prev,
      selectedAccountId: nextClient.selectedAccountId || nextClient.accounts[0]?.id || '',
    }));
    logAction('client', `Switched to ${nextClient.name || 'workspace'}`);
  };

  const handleSelectAccount = (accountId) => {
    setSessionDraft((prev) => ({ ...prev, selectedAccountId: accountId }));
    setConfig((prev) => ({
      ...prev,
      clients: prev.clients.map((client) => (
        client.id === prev.selectedClientId ? { ...client, selectedAccountId: accountId } : client
      )),
    }));
    const accountLabel = activeClient.accounts.find((account) => account.id === accountId)?.label || 'selected account';
    logAction('account', `Switched publishing account to ${accountLabel}`);
  };

  const handleAddClientWorkspace = () => {
    setConfigDraft((prev) => {
      const newClient = buildBlankClient({ name: `Workspace ${prev.clients.length + 1}` });
      return {
        ...prev,
        selectedClientId: newClient.id,
        clients: [...prev.clients, newClient],
      };
    });
  };

  const handleDeleteClientWorkspace = (clientId) => {
    setConfigDraft((prev) => {
      const remainingClients = prev.clients.filter((client) => client.id !== clientId);
      if (remainingClients.length === 0) {
        const fallbackClient = buildBlankClient({ name: 'Workspace 1' });
        return {
          ...prev,
          selectedClientId: fallbackClient.id,
          clients: [fallbackClient],
        };
      }

      return {
        ...prev,
        selectedClientId: prev.selectedClientId === clientId ? remainingClients[0].id : prev.selectedClientId,
        clients: remainingClients,
      };
    });
  };

  const handleAddAccount = () => {
    updateConfigDraftClient((client) => {
      const brands = client.brands.length > 0
        ? client.brands
        : [buildBlankBrand({ name: client.company || client.name || '' })];
      const primaryBrandId = brands[0]?.id || '';
      const newAccount = buildBlankAccount(primaryBrandId);

      return {
        ...client,
        brands,
        selectedAccountId: client.selectedAccountId || newAccount.id,
        accounts: [...client.accounts, newAccount],
      };
    });
  };

  const handleAddBrand = () => {
    updateConfigDraftClient((client) => ({
      ...client,
      brands: [...client.brands, buildBlankBrand({ name: client.company || client.name || '' })],
    }));
  };

  const handleAddFeedSource = () => {
    updateConfigDraftClient((client) => ({
      ...client,
      feedSources: [...client.feedSources, buildBlankFeedSource()],
    }));
  };

  const handleRemoveFeedSource = (sourceId) => {
    updateConfigDraftClient((client) => ({
      ...client,
      feedSources: client.feedSources.filter((source) => source.id !== sourceId),
    }));
  };

  const applyTrendSignals = (items) => {
    setPlatformTrends(buildTrendSignalsFromFeeds(items));
  };

  const handleRefreshLiveFeeds = async ({ silent = false, client = activeClient } = {}) => {
    const sources = (client.feedSources || []).filter((source) => source.enabled && source.url.trim());

    if (sources.length === 0) {
      setLiveFeedItems([]);
      setLiveFeedUpdatedAt('');
      setLiveFeedError('');
      applyTrendSignals([]);
      if (!silent) {
        setSaveBanner('Add a live feed source to load real feed items');
      }
      setIsQuickActionsOpen(false);
      return [];
    }

    const requestId = feedRequestRef.current + 1;
    feedRequestRef.current = requestId;

    setIsRefreshingFeeds(true);
    setLiveFeedError('');

    try {
      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: sources.map((source) => ({
            id: source.id,
            label: source.label,
            platform: source.platform,
            url: source.url,
          })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Live feed refresh failed');
      }

      if (feedRequestRef.current !== requestId) {
        return [];
      }

      const items = Array.isArray(payload.items) ? payload.items : [];
      const refreshedAt = new Date().toISOString();
      const partialError = Array.isArray(payload.failedSources) && payload.failedSources.length > 0
        ? `Some sources failed: ${payload.failedSources.map((item) => item.label).join(', ')}`
        : '';

      setLiveFeedItems(items);
      setLiveFeedUpdatedAt(refreshedAt);
      setLiveFeedError(partialError);
      applyTrendSignals(items);

      if (!silent) {
        logAction('feeds', `Loaded ${items.length} live feed item${items.length === 1 ? '' : 's'} for ${client.name || 'workspace'}`);
        setSaveBanner(items.length > 0 ? 'Live feeds refreshed' : 'No live items returned from current feed sources');
      }

      return items;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Live feed refresh failed';

      if (feedRequestRef.current === requestId) {
        setLiveFeedError(message);
        setLiveFeedItems([]);
        setLiveFeedUpdatedAt('');
        applyTrendSignals([]);
      }

      if (!silent) {
        setSaveBanner(message);
      }

      return [];
    } finally {
      if (feedRequestRef.current === requestId) {
        setIsRefreshingFeeds(false);
      }
      setIsQuickActionsOpen(false);
    }
  };

  useEffect(() => {
    void handleRefreshLiveFeeds({ silent: true, client: activeClient });
  }, [activeClient]);

  const openConfig = () => {
    setIsQuickActionsOpen(false);
    setIsAboutOpen(false);
    setConfigDraft(cloneValue(config));
    setIsConfigOpen(true);
  };

  const openAbout = () => {
    setIsQuickActionsOpen(false);
    setIsConfigOpen(false);
    setIsAboutOpen(true);
  };

  useEffect(() => {
    const handleOpenAbout = () => {
      openAbout();
    };

    window.addEventListener('p0stmaster:open-about', handleOpenAbout);
    return () => window.removeEventListener('p0stmaster:open-about', handleOpenAbout);
  }, []);

  const saveConfiguration = async () => {
    setIsSavingConfig(true);
    const normalizedConfig = normalizeConfig(configDraft);
    setConfig(normalizedConfig);
    setIsConfigOpen(false);

    await persistVault({
      config: normalizedConfig,
      sessionDraft,
      draftHistory,
      actionLog,
      calendarPlan,
      campaignPlan,
      platformTrends,
      liveFeedItems,
      liveFeedUpdatedAt,
      themeMode,
    });

    setIsSavingConfig(false);
    setSaveBanner('Configuration saved securely');
  };

  const cancelConfiguration = () => {
    setConfigDraft(cloneValue(config));
    setIsConfigOpen(false);
    setSaveBanner('Configuration canceled');
  };

  const updateDraft = (changes) => {
    setSessionDraft((prev) => ({
      ...prev,
      ...changes,
      approvalStatus: activeClient.governance.approvalRequired && Object.prototype.hasOwnProperty.call(changes, 'content')
        ? 'pending'
        : prev.approvalStatus,
    }));
  };

  const togglePlatform = (platformId) => {
    setSessionDraft((prev) => {
      const selectedPlatforms = prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter((item) => item !== platformId)
        : [...prev.selectedPlatforms, platformId];
      return { ...prev, selectedPlatforms };
    });
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newMedia = files.map((file) => ({
      id: createId(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      name: file.name,
    }));

    setSessionDraft((prev) => ({ ...prev, media: [...prev.media, ...newMedia] }));
    logAction('media', `Added ${newMedia.length} media item${newMedia.length > 1 ? 's' : ''} to the draft`);
    setSaveBanner('Media uploaded');
    event.target.value = '';
  };

  const removeMedia = (mediaId) => {
    setSessionDraft((prev) => {
      const removedMedia = prev.media.find((item) => item.id === mediaId);
      revokeObjectUrl(removedMedia?.url);
      return { ...prev, media: prev.media.filter((item) => item.id !== mediaId) };
    });
    logAction('media', 'Removed a media item from the draft');
  };

  const handleAiAction = async (action) => {
    setIsAiGenerating(true);
    setIsAiMenuOpen(false);

    try {
      const result = await requestAiDraft({
        provider: activeClient.aiProvider,
        apiKey: activeClient.apiKeys[activeClient.aiProvider],
        action,
        sessionDraft,
        selectedBrand,
      });

      setSessionDraft((prev) => ({ ...prev, content: result.text || prev.content }));
      logAction('ai', `${activeClient.aiProvider} generated a ${action} draft`);
      setSaveBanner(`AI draft updated via ${activeClient.aiProvider}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI request failed';
      logAction('ai', `AI request failed: ${message}`);
      setSaveBanner(message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    revokeObjectUrl(brandKitImageUrl);

    const nextImageUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setBrandKitImageUrl(nextImageUrl);
    setBrandKitExtras({
      name: file.name,
      type: file.type,
      size: `${Math.round(file.size / 1024)} KB`,
    });
    setSaveBanner('Brand kit image uploaded');
    event.target.value = '';
  };

  const handleBrandKitUpload = async () => {
    if (!logoFile || !brandKitImageUrl) return;

    setIsBrandKitProcessing(true);

    try {
      const analysis = await extractPaletteFromImage(brandKitImageUrl);
      setBrandKitExtras((prev) => ({
        ...(prev || {}),
        analyzed: true,
        palette: analysis.palette,
        dimensions: `${analysis.width} x ${analysis.height}`,
      }));
      logAction('brand', 'Extracted brand kit signals from uploaded artwork');
      setSaveBanner('Brand kit extracted from uploaded artwork');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Brand kit analysis failed';
      logAction('brand', `Brand kit analysis failed: ${message}`);
      setSaveBanner(message);
    } finally {
      setIsBrandKitProcessing(false);
    }
  };

  const handleRepurposeAssets = () => {
    if (!sessionDraft.media.length) return;

    setIsRepurposing(true);
    const variants = buildAssetVariants(sessionDraft.media);
    setAssetVariants(variants);
    logAction('assets', 'Created asset variation plan from uploaded media');
    setSaveBanner('Asset variants ready');
    setIsRepurposing(false);
  };

  const handleGenerateCalendar = () => {
    const calendar = buildCalendarPlan(sessionDraft);
    setCalendarPlan(calendar);
    logAction('calendar', 'Generated a content calendar');
    setSaveBanner('Content calendar generated');
  };

  const handleBuildCampaign = () => {
    const campaign = buildCampaignPlan(sessionDraft);
    setCampaignPlan(campaign);
    logAction('campaign', 'Built a campaign plan');
    setSaveBanner('Campaign plan created');
  };

  const handleRequestApproval = () => {
    setSessionDraft((prev) => ({ ...prev, approvalStatus: 'pending' }));
    logAction('approval', 'Requested approval for the current draft');
    setSaveBanner('Approval requested');
  };

  const handleApproveDraft = () => {
    setSessionDraft((prev) => ({ ...prev, approvalStatus: 'approved' }));
    logAction('approval', 'Approved the current draft for publishing');
    setSaveBanner('Draft approved');
  };

  const handleSubmit = async () => {
    if (publishDisabledReason) {
      setSaveBanner(publishDisabledReason);
      return;
    }

    const deliveryPlan = sessionDraft.selectedPlatforms.map((platformId) => {
      const account = getPublishingAccountForPlatform(activeClient, sessionDraft.selectedAccountId, platformId);
      const platformLabel = PLATFORMS.find((platform) => platform.id === platformId)?.name || platformId;

      if (AYRSHARE_PUBLISH_PLATFORMS.includes(platformId)) {
        const missingRequirements = [];
        if (!activeClient.socialKeys.ayrshare?.trim()) missingRequirements.push('Ayrshare API key');
        if (!account) missingRequirements.push('a mapped account');
        if (AYRSHARE_MEDIA_REQUIRED_PLATFORMS.includes(platformId) && !sessionDraft.publishMediaUrl.trim()) {
          missingRequirements.push('a public media URL');
        }

        if (missingRequirements.length === 0) {
          return { platformId, mode: 'provider', account };
        }

        return {
          platformId,
          mode: 'error',
          account,
          reason: `${platformLabel} requires ${missingRequirements.join(' and ')}`,
        };
      }

      return {
        platformId,
        mode: 'error',
        account,
        reason: `${platformLabel} does not have a live publish provider wired in this build`,
      };
    });

    const blockingErrors = deliveryPlan.filter((step) => step.mode === 'error');
    if (blockingErrors.length > 0) {
      const message = blockingErrors
        .map((step) => `${PLATFORMS.find((platform) => platform.id === step.platformId)?.name || step.platformId}: ${step.reason}`)
        .join(' | ');
      logAction('publish', `Publish blocked: ${message}`);
      setSaveBanner(message);
      return;
    }

    setIsPublishing(true);
    setPublishStatus('Publishing through connected providers...');

    const publishResults = [];

    try {
      for (const step of deliveryPlan) {
        const platformLabel = PLATFORMS.find((platform) => platform.id === step.platformId)?.name || step.platformId;
        setPublishStatus(`Publishing to ${platformLabel} via connected provider...`);

        try {
          const result = await requestPlatformPublish({
            platform: step.platformId,
            sessionDraft,
            activeClient,
            account: step.account,
          });

          publishResults.push({
            platform: step.platformId,
            mode: 'provider',
            accountLabel: step.account?.label || platformLabel,
            url: result.url,
            provider: result.provider,
            providerNote: result.providerNote,
            publishedAt: result.publishedAt,
          });
        } catch (error) {
          publishResults.push({
            platform: step.platformId,
            mode: 'error',
            accountLabel: step.account?.label || platformLabel,
            error: error instanceof Error ? error.message : 'Provider publish failed',
          });
        }
      }

      const providerCount = publishResults.filter((result) => result.mode === 'provider').length;
      const failureCount = publishResults.filter((result) => result.mode === 'error').length;

      if (providerCount === 0) {
        const failureSummary = publishResults
          .filter((result) => result.mode === 'error')
          .map((result) => `${PLATFORMS.find((platform) => platform.id === result.platform)?.name || result.platform}: ${result.error}`)
          .join(' | ');
        logAction('publish', `No posts were delivered. ${failureSummary}`);
        setSaveBanner(failureSummary || 'No posts were delivered');
        return;
      }

      const publishedDraft = {
        ...sessionDraft,
        id: `draft-${createId()}`,
        publishedAt: new Date().toISOString(),
        status: failureCount > 0 ? 'partial' : 'published',
        delivery: publishResults,
      };

      setDraftHistory((prev) => [publishedDraft, ...prev].slice(0, 12));
      logAction(
        'publish',
        failureCount > 0
          ? `Published live with ${failureCount} provider issue${failureCount > 1 ? 's' : ''}`
          : `Published live to ${providerCount} platform${providerCount > 1 ? 's' : ''}`,
      );

      revokeMediaUrls(sessionDraft.media);
      setSessionDraft((prev) => ({
        ...DEFAULT_DRAFT,
        id: `draft-${createId()}`,
        selectedPlatforms: prev.selectedPlatforms,
        postType: prev.postType,
        selectedAccountId: prev.selectedAccountId,
        theme: prev.theme,
        frequency: prev.frequency,
        goal: prev.goal,
        createdAt: Date.now(),
      }));

      if (failureCount > 0) {
        setSaveBanner(`Published live with ${failureCount} provider issue${failureCount > 1 ? 's' : ''}`);
      } else {
        setSaveBanner(`Published live to ${providerCount} platform${providerCount > 1 ? 's' : ''}`);
      }
    } finally {
      setIsPublishing(false);
      setPublishStatus(null);
    }
  };

  return (
    <div className={`app-shell app-shell--${themeMode} min-h-screen ${theme.bg} ${theme.textLight} font-sans selection:bg-indigo-500/30`}>
      <AppHeader
        theme={theme}
        themeMode={themeMode}
        isAboutOpen={isAboutOpen}
        isQuickActionsOpen={isQuickActionsOpen}
        saveBanner={saveBanner}
        onThemeChange={(mode) => {
          setThemeMode(mode);
          setIsQuickActionsOpen(false);
        }}
        onOpenAbout={openAbout}
        onOpenConfig={openConfig}
        onToggleQuickActions={() => setIsQuickActionsOpen((prev) => !prev)}
        onRefreshLiveFeeds={() => handleRefreshLiveFeeds()}
        onDismissBanner={() => {
          setSaveBanner('');
          setIsQuickActionsOpen(false);
        }}
      />

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
        <ComposerPanel
          theme={theme}
          state={{
            config,
            activeClient,
            selectedBrand,
            sessionDraft,
            campaignPlan,
            adaptedCaptions,
            audienceVariants,
            assetVariants,
            isRepurposing,
            isAiGenerating,
            isAiMenuOpen,
            isPublishing,
            publishStatus,
            connectedPublishPlatforms,
            unmappedPublishPlatforms,
            publishDisabledReason,
          }}
          handlers={{
            handleClientSelection,
            handleSelectAccount,
            handleGenerateCalendar,
            handleBuildCampaign,
            handleRequestApproval,
            handleApproveDraft,
            updateDraft,
            togglePlatform,
            handleMediaUpload,
            removeMedia,
            handleSubmit,
            handleRepurposeAssets,
            setIsAiMenuOpen,
            handleAiAction,
          }}
          constants={{ PLATFORMS }}
        />

        <PreviewPanel
          theme={theme}
          state={{
            previewDevice,
            previewGridClass,
            previewCardClass,
            selectedAccount,
            selectedBrand,
            sessionDraft,
            adaptedCaptions,
            complianceWarnings,
            platformAlerts,
            calendarPlan,
            brandKitImageUrl,
            brandKitExtras,
            logoFile,
            isBrandKitProcessing,
            platformTrends,
            liveFeedItems,
            liveFeedError,
            isRefreshingFeeds,
            liveFeedUpdatedAt,
            draftHistory,
            actionLog,
          }}
          handlers={{
            setPreviewDevice,
            handleBrandKitUpload,
            handleLogoUpload,
            handleRefreshLiveFeeds,
          }}
          constants={{ PLATFORMS }}
          refs={{ fileInputRef }}
          formatters={{ formatTimeAgo, shortenText }}
        />
      </main>

      <footer className="mx-auto flex w-full max-w-[1600px] items-center justify-between border-t border-slate-800 px-6 py-5 text-[11px] uppercase tracking-[0.24em] text-slate-500">
        <span>Akita Engineering</span>
        <span>© {new Date().getFullYear()} p0stmaster</span>
      </footer>

      <AboutModal
        isOpen={isAboutOpen}
        theme={theme}
        themeMode={themeMode}
        aboutInfo={aboutInfo}
        onClose={() => setIsAboutOpen(false)}
      />

      <ConfigurationModal
        isOpen={isConfigOpen}
        theme={theme}
        configTab={configTab}
        setConfigTab={setConfigTab}
        isSavingConfig={isSavingConfig}
        state={{ configDraft, draftClient }}
        handlers={{
          setConfigDraft,
          updateConfigDraftClient,
          handleAddClientWorkspace,
          handleAddFeedSource,
          handleRemoveFeedSource,
          handleAddAccount,
          handleAddBrand,
          handleDeleteClientWorkspace,
          saveConfiguration,
          cancelConfiguration,
        }}
        constants={{ PLATFORMS }}
      />
    </div>
  );
};

export default App;
