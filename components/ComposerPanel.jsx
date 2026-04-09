import React from 'react';
import { Bot, Trash2 } from 'lucide-react';

const ComposerPanel = ({ theme, state, handlers, constants }) => {
  const {
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
  } = state;

  const {
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
  } = handlers;

  const { PLATFORMS } = constants;
  const hasAccounts = activeClient.accounts.length > 0;
  const connectedPlatformLabels = connectedPublishPlatforms
    .map((platformId) => PLATFORMS.find((platform) => platform.id === platformId)?.name || platformId)
    .join(', ');
  const unmappedPlatformLabels = unmappedPublishPlatforms
    .map((platformId) => PLATFORMS.find((platform) => platform.id === platformId)?.name || platformId)
    .join(', ');
  const mediaRequiredPlatforms = ['instagram', 'pinterest', 'youtube', 'tiktok'];
  const selectedMediaRequiredPlatformLabels = sessionDraft.selectedPlatforms
    .filter((platformId) => mediaRequiredPlatforms.includes(platformId))
    .map((platformId) => PLATFORMS.find((platform) => platform.id === platformId)?.name || platformId)
    .join(', ');
  const isPublishDisabled = isPublishing || Boolean(publishDisabledReason);
  const hasConnectedProviders = connectedPublishPlatforms.length > 0;

  return (
    <section className="lg:col-span-5 border-r border-slate-800 min-h-[calc(100vh-64px)] p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Create Content</h1>
        <p className={theme.textDim}>One workspace for planning, adaptation, compliance, and real provider-backed publishing.</p>
      </header>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4">
          <div className={`rounded-3xl border border-slate-800 ${theme.card} p-5 space-y-4`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Client Mode</span>
              <span className="text-xs text-slate-400">Separate workspaces, credentials, brands, and account mappings</span>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Client Workspace</label>
              <select
                value={config.selectedClientId}
                onChange={(event) => handleClientSelection(event.target.value)}
                className={`mt-2 w-full p-3 rounded-2xl ${theme.card} border border-slate-800 text-sm outline-none`}
              >
                {config.clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}{client.company ? ` • ${client.company}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={sessionDraft.selectedAccountId}
              onChange={(event) => handleSelectAccount(event.target.value)}
              disabled={!hasAccounts}
              className={`w-full p-3 rounded-2xl ${theme.card} border border-slate-800 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-500`}
            >
              {hasAccounts ? activeClient.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.label || 'Untitled account'}{account.handle ? ` • ${account.handle}` : ''}
                </option>
              )) : (
                <option value="">No accounts configured</option>
              )}
            </select>
            {!hasAccounts && (
              <div className="rounded-2xl border border-amber-600 bg-amber-500/10 p-4 text-[11px] text-amber-200">
                Add at least one managed account in Platform Configuration before you attempt live publishing.
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 text-slate-400 text-[11px]">
              <div className="rounded-2xl border border-slate-800 p-3 bg-slate-900">
                <div className="text-[10px] uppercase tracking-[0.25em] mb-2">Company</div>
                <div className="text-sm font-semibold">{activeClient.company || 'Not set'}</div>
              </div>
              <div className="rounded-2xl border border-slate-800 p-3 bg-slate-900">
                <div className="text-[10px] uppercase tracking-[0.25em] mb-2">Brand</div>
                <div className="text-sm font-semibold">{selectedBrand.name || 'Not set'}</div>
              </div>
              <div className="rounded-2xl border border-slate-800 p-3 bg-slate-900">
                <div className="text-[10px] uppercase tracking-[0.25em] mb-2">Tone</div>
                <div className="text-sm font-semibold">{selectedBrand.voice || 'Not set'}</div>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border border-slate-800 ${theme.card} p-5 space-y-4`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Campaign Planning</span>
              <div className="flex gap-3 flex-wrap">
                <button onClick={handleGenerateCalendar} className="text-xs text-indigo-400 hover:text-white">Generate plan</button>
                <button onClick={handleBuildCampaign} className="text-xs text-slate-300 hover:text-white">Build campaign</button>
              </div>
            </div>
            {activeClient.governance.approvalRequired && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>Approval status: <span className="font-semibold text-slate-100">{sessionDraft.approvalStatus}</span></span>
                  <div className="flex gap-2 flex-wrap">
                    {sessionDraft.approvalStatus !== 'pending' && sessionDraft.approvalStatus !== 'approved' && (
                      <button onClick={handleRequestApproval} className="rounded-full bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700">Request approval</button>
                    )}
                    {sessionDraft.approvalStatus !== 'approved' && (
                      <button onClick={handleApproveDraft} className="rounded-full bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400">Approve now</button>
                    )}
                  </div>
                </div>
              </div>
            )}
            <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Theme</label>
            <input
              value={sessionDraft.theme}
              onChange={(event) => updateDraft({ theme: event.target.value })}
              className={`w-full p-3 rounded-2xl ${theme.card} border border-slate-800 outline-none text-sm`}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Frequency</label>
                <input
                  value={sessionDraft.frequency}
                  onChange={(event) => updateDraft({ frequency: event.target.value })}
                  className={`w-full p-3 rounded-2xl ${theme.card} border border-slate-800 outline-none text-sm`}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Goal</label>
                <input
                  value={sessionDraft.goal}
                  onChange={(event) => updateDraft({ goal: event.target.value })}
                  className={`w-full p-3 rounded-2xl ${theme.card} border border-slate-800 outline-none text-sm`}
                />
              </div>
            </div>
          </div>

          {campaignPlan.length > 0 && (
            <div className={`rounded-3xl border border-slate-800 ${theme.card} p-5 space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">One-Click Campaign</span>
                <span className="text-xs text-slate-400">{campaignPlan.length} days</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {campaignPlan.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="text-sm font-semibold text-slate-100">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-2">{item.date} • {item.platforms.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-3xl border border-slate-800 ${theme.card} p-5 space-y-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Connected Delivery</div>
                <p className="text-[11px] text-slate-400">Publishing runs only against platforms with a live provider mapping and stored credentials.</p>
              </div>
              <div className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${hasConnectedProviders ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-400'}`}>
                {hasConnectedProviders ? 'Live providers ready' : 'No live providers connected'}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-[11px] text-slate-300">
              <div>Connected now: {connectedPlatformLabels || 'None'}</div>
              {unmappedPublishPlatforms.length > 0 && (
                <div className="mt-2 text-amber-300">Selected without live mapping: {unmappedPlatformLabels}</div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Content Composer</div>
                <p className="text-[11px] text-slate-400">Select channels, write the source draft, and publish only where a real API path exists.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['feed', 'story'].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateDraft({ postType: type })}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${sessionDraft.postType === type ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {type === 'feed' ? 'Feed / Post' : 'Story'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => {
                const isSelected = sessionDraft.selectedPlatforms.includes(platform.id);
                const isLive = connectedPublishPlatforms.includes(platform.id);

                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${isSelected ? 'bg-indigo-500/15 border border-indigo-500 text-indigo-300' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                  >
                    {platform.name}{isLive ? ' • live' : ''}
                  </button>
                );
              })}
            </div>

            <textarea
              rows={5}
              value={sessionDraft.content}
              onChange={(event) => updateDraft({ content: event.target.value })}
              className={`w-full rounded-3xl border border-slate-800 ${theme.card} p-4 text-sm text-slate-100 outline-none resize-none`}
            />

            <div className="grid grid-cols-1 gap-3">
              <label className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col gap-2 text-sm text-slate-300">
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Upload Media</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="text-slate-200 file:rounded-full file:border file:border-slate-700 file:bg-slate-800 file:px-3 file:py-2 file:text-sm"
                />
                <span className="text-[11px] text-slate-500">Add images or videos to build real content variants and previews.</span>
              </label>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Live publish media URL</div>
                <input
                  value={sessionDraft.publishMediaUrl}
                  onChange={(event) => updateDraft({ publishMediaUrl: event.target.value })}
                  className={`mt-2 w-full rounded-2xl border border-slate-800 ${theme.card} p-3 text-sm outline-none`}
                />
                <div className="mt-2 text-[11px] text-slate-500">
                  Local uploads are for preview and planning. Use a public URL for live delivery{selectedMediaRequiredPlatformLabels ? ` (${selectedMediaRequiredPlatformLabels} currently selected)` : ' on media-first platforms'}.
                </div>
              </div>

              {sessionDraft.media.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {sessionDraft.media.map((item) => (
                    <div key={item.id} className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                      <div className="relative aspect-square bg-black">
                        {item.type === 'video' ? (
                          <video src={item.url} className="h-full w-full object-cover" />
                        ) : (
                          <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                        )}
                        <button
                          onClick={() => removeMedia(item.id)}
                          className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="truncate px-3 py-2 text-[11px] text-slate-400">{item.name}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={sessionDraft.link}
                  onChange={(event) => updateDraft({ link: event.target.value })}
                  className={`w-full rounded-2xl border border-slate-800 ${theme.card} p-3 text-sm outline-none`}
                />
                <input
                  value={sessionDraft.notes}
                  onChange={(event) => updateDraft({ notes: event.target.value })}
                  className={`w-full rounded-2xl border border-slate-800 ${theme.card} p-3 text-sm outline-none`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={handleSubmit}
                disabled={isPublishDisabled}
                className={`rounded-2xl px-5 py-4 text-sm font-semibold transition ${isPublishDisabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-400'}`}
              >
                {isPublishing ? 'Publishing...' : 'Publish to selected accounts'}
              </button>
              {(publishStatus || publishDisabledReason) && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300">
                  {publishStatus || publishDisabledReason}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-3xl border border-slate-800 ${theme.card} p-5 space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Auto-Adapted Copy</span>
            <span className="text-xs text-slate-400">Platform-native variants</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {sessionDraft.selectedPlatforms.length > 0 ? sessionDraft.selectedPlatforms.map((platformId) => {
              const platform = PLATFORMS.find((item) => item.id === platformId);
              if (!platform) return null;

              const PlatformIcon = platform.icon;
              return (
                <div key={platformId} className="rounded-2xl border border-slate-800 p-4 bg-slate-900">
                  <div className="flex items-center gap-2 mb-2 text-slate-300">
                    <PlatformIcon size={16} />
                    <span className="text-sm font-semibold">{platform.name}</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-200">
                    {adaptedCaptions[platformId] || 'Add content to preview platform-native copy.'}
                  </p>
                </div>
              );
            }) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-500">Choose one or more platforms to generate native copy adaptations.</div>
            )}
          </div>
        </div>

        {audienceVariants.length > 0 && (
          <div className={`rounded-3xl border border-slate-800 ${theme.card} p-5 space-y-4`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Audience Variants</span>
              <span className="text-xs text-slate-400">Personalized segments</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {audienceVariants.map((variant) => (
                <div key={variant.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="text-sm font-semibold text-slate-100">{variant.segment}</div>
                  <div className="text-[11px] text-slate-400 mt-2">{variant.copy}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleRepurposeAssets}
            disabled={isRepurposing || sessionDraft.media.length === 0}
            className={`flex-1 py-4 rounded-xl border font-bold transition-all ${isRepurposing || sessionDraft.media.length === 0 ? 'border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed' : 'border-indigo-500 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'}`}
          >
            {isRepurposing ? 'Repurposing...' : 'Repurpose Media'}
          </button>
          <button
            onClick={() => setIsAiMenuOpen((prev) => !prev)}
            className="flex-1 py-4 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Bot size={18} className="inline-block mr-2" /> AI Ideas
          </button>
        </div>

        {isAiMenuOpen && (
          <div className={`rounded-3xl border border-slate-800 ${theme.card} p-5 space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">AI Workflow</span>
              <span className="text-xs text-slate-500">Real provider request only</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={() => handleAiAction('generate')}
                disabled={isAiGenerating}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
              >
                <div className="font-semibold">Rewrite for impact</div>
                <div className="text-[11px] text-slate-500">Generate a fresh primary draft.</div>
              </button>
              <button
                onClick={() => handleAiAction('professional')}
                disabled={isAiGenerating}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
              >
                <div className="font-semibold">Brand polish</div>
                <div className="text-[11px] text-slate-500">Tighten tone and positioning.</div>
              </button>
              <button
                onClick={() => handleAiAction('hashtags')}
                disabled={isAiGenerating}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
              >
                <div className="font-semibold">Add hashtags</div>
                <div className="text-[11px] text-slate-500">Append discovery tags from the provider output.</div>
              </button>
            </div>
          </div>
        )}

        {sessionDraft.selectedPlatforms.includes('pinterest') && (
          <div className={`rounded-3xl border border-slate-800 ${theme.card} p-5 space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Pinterest Details</span>
              <span className="text-xs text-slate-500">Board + destination URL</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input
                value={sessionDraft.pinterestBoard}
                onChange={(event) => updateDraft({ pinterestBoard: event.target.value })}
                className={`w-full rounded-2xl ${theme.card} border border-slate-800 p-3 text-sm outline-none`}
              />
              <input
                value={sessionDraft.link}
                onChange={(event) => updateDraft({ link: event.target.value })}
                className={`w-full rounded-2xl ${theme.card} border border-slate-800 p-3 text-sm outline-none`}
              />
            </div>
          </div>
        )}

        {assetVariants.length > 0 && (
          <div className={`rounded-3xl border border-slate-800 ${theme.card} p-5 space-y-4`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Asset Variants</span>
              <span className="text-xs text-slate-400">Derived directly from uploaded media</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {assetVariants.map((variant) => (
                <div key={variant.id} className="rounded-2xl border border-slate-800 p-4 bg-slate-900">
                  <div className="text-sm font-semibold">{variant.label}</div>
                  <div className="text-[11px] text-slate-500">{variant.notes}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ComposerPanel;
