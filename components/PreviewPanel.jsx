import React from 'react';
import {
  AlertCircle,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Monitor,
  Plus,
  Send,
  Smartphone,
  Sparkles,
  Twitter,
} from 'lucide-react';

const PreviewPanel = ({ theme, state, handlers, constants, refs, formatters }) => {
  const {
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
    isBrandKitProcessing,
    platformTrends,
    liveFeedItems,
    liveFeedError,
    isRefreshingFeeds,
    liveFeedUpdatedAt,
    draftHistory,
    actionLog,
  } = state;

  const {
    setPreviewDevice,
    handleBrandKitUpload,
    handleLogoUpload,
    handleRefreshLiveFeeds,
  } = handlers;

  const { PLATFORMS } = constants;
  const { fileInputRef } = refs;
  const { formatTimeAgo, shortenText } = formatters;

  const accountLabel = selectedAccount.label || 'No account configured';
  const accountHandle = selectedAccount.handle || '@connect-account';
  const brandName = selectedBrand.name || 'No brand configured';
  const brandVoice = selectedBrand.voice || 'No brand voice configured';
  const brandHashtags = selectedBrand.hashtags.length > 0 ? selectedBrand.hashtags.join(' ') : 'No hashtags configured';
  const brandCity = selectedBrand.city || 'Market not configured';
  const hasBrandKitImage = Boolean(brandKitImageUrl);

  return (
    <section className={`lg:col-span-7 ${theme.bg} p-8 flex flex-col items-center sticky top-16 h-[calc(100vh-64px)] overflow-y-auto`}>
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Eye size={20} className={theme.accent} />
            p0stmaster Preview
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{previewDevice === 'mobile' ? 'Mobile layout' : 'Desktop layout'}</span>
            <div className="flex bg-slate-800 p-1 rounded-lg">
              <button
                aria-label="Switch to mobile preview"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Smartphone size={18} />
              </button>
              <button
                aria-label="Switch to desktop preview"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-2 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Monitor size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className={`grid ${previewGridClass} gap-8`}>
          <div className={`${previewCardClass} space-y-4`}>
            <div className="flex items-center gap-2 px-1">
              <Instagram size={16} className="text-pink-500" />
              <span className="text-sm font-bold opacity-80 uppercase tracking-tight">Instagram Feed</span>
            </div>
            <div className={`w-full ${theme.card} rounded-2xl border border-slate-800 overflow-hidden shadow-2xl`}>
              <div className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-800 border-2 border-slate-900" />
                </div>
                <span className="text-xs font-bold">{accountLabel}</span>
              </div>
              <div className="aspect-square bg-slate-900 relative flex items-center justify-center">
                {sessionDraft.media.length > 0 ? (
                  sessionDraft.media[0].type === 'video' ? (
                    <video src={sessionDraft.media[0].url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={sessionDraft.media[0].url} className="w-full h-full object-cover" />
                  )
                ) : (
                  <ImageIcon size={48} className="text-slate-800" />
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-sm border-2 border-current" />
                  <div className="w-5 h-5 rounded-sm border-2 border-current" />
                  <div className="w-5 h-5 rounded-sm border-2 border-current ml-auto" />
                </div>
                <p className="text-xs leading-relaxed">
                  <span className="font-bold mr-2">{accountHandle}</span>
                  {sessionDraft.content || <span className="text-slate-600 italic">Draft content appears here as you write.</span>}
                </p>
              </div>
            </div>
          </div>

          <div className={`${previewCardClass} space-y-4`}>
            <div className="flex items-center gap-2 px-1">
              <Linkedin size={16} className="text-blue-600" />
              <span className="text-sm font-bold opacity-80 uppercase tracking-tight">LinkedIn Feed</span>
            </div>
            <div className={`w-full ${theme.card} rounded-sm border border-slate-800 shadow-xl p-4 space-y-3`}>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-sm" />
                <div>
                  <div className="text-xs font-bold">{brandName}</div>
                  <div className="text-[10px] text-slate-500">Brand voice • {sessionDraft.postType}</div>
                </div>
              </div>
              <p className="text-xs text-slate-200 line-clamp-3">
                {sessionDraft.content || 'Your current draft will render here in a LinkedIn-style layout.'}
              </p>
              <div className="aspect-[1.91/1] bg-slate-900 overflow-hidden border border-slate-800 rounded-sm">
                {sessionDraft.media.length > 0 ? (
                  <img src={sessionDraft.media[0].url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-slate-800" />
                  </div>
                )}
              </div>
              <div className="pt-2 flex justify-between border-t border-slate-800 text-slate-400 text-[10px] font-bold">
                <span>Like</span>
                <span>Comment</span>
                <span>Repost</span>
              </div>
            </div>
          </div>

          <div className={`${previewCardClass} space-y-4`}>
            <div className="flex items-center gap-2 px-1">
              <Twitter size={16} className="text-slate-200" />
              <span className="text-sm font-bold opacity-80 uppercase tracking-tight">X Feed</span>
            </div>
            <div className={`w-full ${theme.card} rounded-xl border border-slate-800 shadow-xl p-4 space-y-3`}>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex-shrink-0" />
                <div className="w-full">
                  <div className="text-sm font-bold">{accountHandle} <span className="text-slate-500 font-normal">· {brandCity}</span></div>
                  <p className="text-sm text-slate-200 mt-1">
                    {sessionDraft.content || 'Short-form preview output appears here.'}
                  </p>
                  {sessionDraft.media.length > 0 && (
                    <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 mt-3">
                      {sessionDraft.media[0].type === 'video' ? (
                        <video src={sessionDraft.media[0].url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={sessionDraft.media[0].url} className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`${previewCardClass} space-y-4`}>
            <div className="flex items-center gap-2 px-1">
              <Sparkles size={16} className="text-fuchsia-400" />
              <span className="text-sm font-bold opacity-80 uppercase tracking-tight">TikTok Preview</span>
            </div>
            <div className={`w-full ${theme.card} rounded-xl border border-slate-800 shadow-xl p-4 space-y-3`}>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-fuchsia-500 to-pink-500 rounded-full flex-shrink-0" />
                <div className="w-full">
                  <div className="text-sm font-bold">{accountHandle} <span className="text-slate-500 font-normal">· TikTok</span></div>
                  <p className="text-sm text-slate-200 mt-1">
                    {adaptedCaptions.tiktok || 'Add content and select TikTok to see the native adaptation.'}
                  </p>
                </div>
              </div>
              {sessionDraft.media.length > 0 && (
                <div className="aspect-[9/16] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 mt-3">
                  {sessionDraft.media[0].type === 'video' ? (
                    <video src={sessionDraft.media[0].url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={sessionDraft.media[0].url} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={`${previewCardClass} space-y-4`}>
            <div className="flex items-center gap-2 px-1">
              <Plus size={16} className="text-purple-400" />
              <span className="text-sm font-bold opacity-80 uppercase tracking-tight">Story Preview</span>
            </div>
            <div className={`relative w-full aspect-[9/16] ${previewDevice === 'mobile' ? 'max-w-[280px]' : 'max-w-[360px]'} mx-auto bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-800 overflow-hidden shadow-2xl`}>
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                <div className="flex-1 h-0.5 bg-white/40 rounded-full" />
                <div className="flex-1 h-0.5 bg-white/20 rounded-full" />
              </div>
              {sessionDraft.media.length > 0 ? (
                <div className="w-full h-full">
                  <img src={sessionDraft.media[0].url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-8 left-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-400" />
                    <span className="text-[10px] font-bold text-white">Story Preview</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-8 text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-800 mb-4 flex items-center justify-center">
                    <Plus size={32} />
                  </div>
                  <p className="text-sm font-medium">Add media to see the story preview</p>
                </div>
              )}
              <div className="absolute bottom-6 left-4 right-4 flex gap-3 items-center">
                <div className="flex-1 h-10 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 flex items-center">
                  <span className="text-[10px] text-white/60">Send message...</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                  <Send size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-8">
          <div className={`rounded-3xl ${theme.card} border border-slate-800 p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Compliance Scan</h3>
                <p className="text-[11px] text-slate-500">Automated policy and risk checks against your current draft.</p>
              </div>
              <AlertCircle size={18} className="text-slate-400" />
            </div>
            {complianceWarnings.length > 0 || platformAlerts.length > 0 ? (
              <div className="space-y-2 text-xs text-slate-200">
                {complianceWarnings.map((warning, index) => (
                  <div key={`comp-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900 p-3">{warning}</div>
                ))}
                {platformAlerts.map((alert, index) => (
                  <div key={`platform-${index}`} className="rounded-2xl border border-amber-600 bg-amber-500/10 p-3 text-amber-200">{alert}</div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-400">No compliance issues detected in the current draft.</div>
            )}
          </div>

          <div className={`rounded-3xl ${theme.card} border border-slate-800 p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Content Calendar</h3>
                <p className="text-[11px] text-slate-500">Generated from your theme, goal, and platforms with either Quick Plan or AI Studio Calendar.</p>
              </div>
              <span className="text-xs uppercase text-slate-500">{calendarPlan.length} items</span>
            </div>
            <div className="space-y-3">
              {calendarPlan.length > 0 ? calendarPlan.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center justify-between text-slate-300 text-xs uppercase tracking-[0.2em] mb-2">
                    <span>{item.date}</span>
                    <span>{item.status}</span>
                  </div>
                  <div className="font-semibold text-slate-100">{item.title}</div>
                  <div className="text-[11px] text-slate-500 mt-2">{item.platforms.join(', ')}</div>
                </div>
              )) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-500">Use Quick Plan or AI Studio &gt; Calendar to map the next content batch.</div>
              )}
            </div>
          </div>

          <div className={`rounded-3xl ${theme.card} border border-slate-800 p-5`}>
            <div className="flex items-center justify-between mb-4 gap-4">
              <div>
                <h3 className="text-base font-semibold">Brand Kit</h3>
                <p className="text-[11px] text-slate-500">Extracted directly from uploaded artwork and brand settings.</p>
              </div>
              <div className="flex gap-2">
                {(brandKitExtras?.palette || ['#6366F1', '#0EA5E9', '#14B8A6']).slice(0, 3).map((color) => (
                  <span key={color} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Voice</div>
                <div className="mt-2 font-semibold">{brandVoice}</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Hashtag Set</div>
                <div className="mt-2 text-slate-200">{brandHashtags}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <label className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-2">Upload brand logo or kit</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-slate-200 file:rounded-full file:border file:border-slate-700 file:bg-slate-800 file:px-3 file:py-2 file:text-sm"
                />
              </label>
              <button
                disabled={!hasBrandKitImage || isBrandKitProcessing}
                onClick={handleBrandKitUpload}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${hasBrandKitImage ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                {isBrandKitProcessing ? 'Analyzing brand kit...' : 'Extract brand signals'}
              </button>
              {brandKitImageUrl && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex gap-3 items-center">
                  <img src={brandKitImageUrl} alt="Brand kit preview" className="w-14 h-14 rounded-xl object-cover" />
                  <div className="text-sm text-slate-200">
                    <div className="font-semibold">{brandKitExtras?.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {[brandKitExtras?.size, brandKitExtras?.type, brandKitExtras?.dimensions].filter(Boolean).join(' • ')}
                    </div>
                    {brandKitExtras?.palette && (
                      <div className="mt-2 flex gap-1">
                        {brandKitExtras.palette.map((color) => (
                          <span key={color} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 text-[11px] text-slate-400">Use these extracted brand signals to keep published content on tone across accounts.</div>
          </div>

          <div className={`rounded-3xl ${theme.card} border border-slate-800 p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Trend Intelligence</h3>
                <p className="text-[11px] text-slate-500">Derived from your most recent live feed refresh.</p>
              </div>
              <button onClick={handleRefreshLiveFeeds} className="text-xs text-indigo-400 hover:text-white">{isRefreshingFeeds ? 'Refreshing...' : 'Refresh'}</button>
            </div>
            {platformTrends.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {platformTrends.map((trend) => (
                  <div key={trend.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{trend.type}</div>
                    <div className="mt-2 text-slate-100">{trend.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-500">Refresh live feeds to build real trend signals from configured sources.</div>
            )}
          </div>

          <div className={`rounded-3xl ${theme.card} border border-slate-800 p-5`}>
            <div className="flex items-center justify-between mb-4 gap-4">
              <div>
                <h3 className="text-base font-semibold">Live Feed Pulse</h3>
                <p className="text-[11px] text-slate-500">Real RSS, Atom, and YouTube items from configured sources.</p>
              </div>
              <div className="flex items-center gap-3">
                {liveFeedUpdatedAt && <span className="text-xs uppercase text-slate-500">{formatTimeAgo(liveFeedUpdatedAt)}</span>}
                <button onClick={handleRefreshLiveFeeds} className="text-xs text-indigo-400 hover:text-white">{isRefreshingFeeds ? 'Refreshing...' : 'Refresh feeds'}</button>
              </div>
            </div>
            {liveFeedError && (
              <div className="mb-4 rounded-2xl border border-amber-600 bg-amber-500/10 p-3 text-[11px] text-amber-200">{liveFeedError}</div>
            )}
            {liveFeedItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {liveFeedItems.slice(0, 6).map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:bg-slate-800"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{item.sourceLabel} • {item.sourcePlatform}</div>
                      <ChevronRight size={16} className="text-slate-500" />
                    </div>
                    <div className="mt-2 font-semibold text-slate-100 line-clamp-2">{item.title}</div>
                    <div className="mt-2 text-[11px] text-slate-400 line-clamp-3">{item.excerpt || 'Live feed item.'}</div>
                    <div className="mt-3 text-[10px] text-slate-500">{formatTimeAgo(item.publishedAt)}{item.author ? ` • ${item.author}` : ''}</div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-500">Add live feed sources in Platform Configuration to pull real items into this workspace.</div>
            )}
          </div>

          <div className={`rounded-3xl ${theme.card} border border-slate-800 p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Draft History</h3>
                <p className="text-[11px] text-slate-500">Published posts and provider delivery snapshots.</p>
              </div>
              <span className="text-xs uppercase text-slate-500">{draftHistory.length} items</span>
            </div>
            <div className="space-y-3">
              {draftHistory.length > 0 ? draftHistory.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center justify-between gap-3 text-slate-200">
                    <div>
                      <div className="font-semibold">{item.theme || 'Published post'}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{item.postType} • {item.selectedPlatforms.map((platformId) => PLATFORMS.find((platform) => platform.id === platformId)?.name || platformId).join(', ')}</div>
                    </div>
                    <div className="text-[11px] text-slate-400">{new Date(item.publishedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-3 text-[12px] text-slate-400 line-clamp-3">{shortenText(item.content || item.notes || item.link || 'Live publish snapshot.', 120)}</div>
                </div>
              )) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-500">Published posts will appear here after the first live delivery.</div>
              )}
            </div>
          </div>

          <div className={`rounded-3xl ${theme.card} border border-slate-800 p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Action Log</h3>
                <p className="text-[11px] text-slate-500">Recent workflow events, feed refreshes, approvals, and publish checks.</p>
              </div>
              <span className="text-xs uppercase text-slate-500">{actionLog.length} entries</span>
            </div>
            <div className="space-y-3">
              {actionLog.length > 0 ? actionLog.slice(0, 3).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="text-sm font-semibold text-slate-100">{entry.message}</div>
                  <div className="text-[11px] text-slate-500 mt-2">{new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              )) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-500">Actions will appear here as you generate, approve, refresh, and publish content.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewPanel;
