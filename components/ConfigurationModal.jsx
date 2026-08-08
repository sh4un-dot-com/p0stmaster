import React from 'react';
import { CheckCircle2, Settings, Trash2, X } from 'lucide-react';

const ConfigurationModal = ({
  isOpen,
  theme,
  configTab,
  setConfigTab,
  isSavingConfig,
  state,
  handlers,
  constants,
}) => {
  if (!isOpen) {
    return null;
  }

  const { configDraft, draftClient } = state;
  const {
    setConfigDraft,
    updateConfigDraftClient,
    handleAddClientWorkspace,
    handleAddFeedSource,
    handleRemoveFeedSource,
    handleAddAccount,
    handleRemoveAccount,
    handleAddBrand,
    handleRemoveBrand,
    handleDeleteClientWorkspace,
    saveConfiguration,
    cancelConfiguration,
  } = handlers;
  const { PLATFORMS, WORKSPACE_USER_ROLES } = constants;
  const isAyrshareReady = Boolean(draftClient.socialKeys.ayrshare && draftClient.socialKeys.ayrshare.trim());
  const getToggleCardClass = (isChecked) => (`rounded-2xl border p-3 flex items-center justify-between gap-3 transition-colors ${isChecked
    ? 'border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]'
    : 'border-slate-800 bg-slate-800 hover:border-slate-700'}`);
  const getToggleTextClass = (isChecked) => (isChecked ? 'text-indigo-200' : 'text-slate-400');
  const toggleInputClassName = 'h-4 w-4 shrink-0 rounded border-slate-600 bg-black accent-indigo-500 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0';

  return (
    <div data-overlay="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${theme.card} border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Settings size={20} className={theme.accent} />
            Platform Configuration
          </h3>
          <button onClick={cancelConfiguration} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-800 shrink-0 px-6 pt-2 gap-2">
          <button
            onClick={() => setConfigTab('clients')}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${configTab === 'clients' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >Clients</button>
          <button
            onClick={() => setConfigTab('ai')}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${configTab === 'ai' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >AI Studio</button>
          <button
            onClick={() => setConfigTab('social')}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${configTab === 'social' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >Social APIs</button>
          <button
            onClick={() => setConfigTab('brand')}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${configTab === 'brand' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >Brand & Governance</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Configuration Scope</div>
                <div className="text-[11px] text-slate-500">Edit the active client workspace, live credentials, brands, and account mappings.</div>
              </div>
              <div className="text-[11px] text-slate-400">{configDraft.clients.length} clients</div>
            </div>
            <select
              value={configDraft.selectedClientId}
              onChange={(event) => setConfigDraft((prev) => ({ ...prev, selectedClientId: event.target.value }))}
              className="w-full rounded-xl border border-slate-800 bg-black p-3 text-sm outline-none"
            >
              {configDraft.clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}{client.company ? ` • ${client.company}` : ''}
                </option>
              ))}
            </select>
          </div>

          {configTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Client Workspaces</div>
                  <div className="text-[11px] text-slate-500">Store separate client identities, brands, accounts, and credentials.</div>
                </div>
                <button onClick={handleAddClientWorkspace} className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500">Add client</button>
              </div>
              <div className="space-y-4">
                {configDraft.clients.map((client) => (
                  <div key={client.id} className={`rounded-2xl border p-4 ${client.id === configDraft.selectedClientId ? 'border-indigo-500 bg-slate-900/90' : 'border-slate-800 bg-slate-900'}`}>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{client.name}</div>
                        <div className="text-[11px] text-slate-500">{client.accounts.length} accounts • {client.brands.length} brands</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfigDraft((prev) => ({ ...prev, selectedClientId: client.id }))}
                          className={`rounded-full px-3 py-2 text-xs font-semibold ${client.id === configDraft.selectedClientId ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >{client.id === configDraft.selectedClientId ? 'Editing' : 'Edit client'}</button>
                        <button
                          onClick={() => handleDeleteClientWorkspace(client.id)}
                          className="rounded-full border border-rose-500/50 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20"
                          aria-label={`Delete ${client.name || 'client'}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-[11px] uppercase text-slate-500">Workspace Name</label>
                        <input
                          value={client.name}
                          onChange={(event) => setConfigDraft((prev) => ({
                            ...prev,
                            clients: prev.clients.map((item) => item.id === client.id ? { ...item, name: event.target.value } : item),
                          }))}
                          className="w-full rounded-lg border border-slate-800 bg-black p-2 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase text-slate-500">Company</label>
                        <input
                          value={client.company}
                          onChange={(event) => setConfigDraft((prev) => ({
                            ...prev,
                            clients: prev.clients.map((item) => item.id === client.id ? { ...item, company: event.target.value } : item),
                          }))}
                          className="w-full rounded-lg border border-slate-800 bg-black p-2 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase text-slate-500">Primary Contact</label>
                        <input
                          value={client.contactName}
                          onChange={(event) => setConfigDraft((prev) => ({
                            ...prev,
                            clients: prev.clients.map((item) => item.id === client.id ? { ...item, contactName: event.target.value } : item),
                          }))}
                          className="w-full rounded-lg border border-slate-800 bg-black p-2 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase text-slate-500">Contact Email</label>
                        <input
                          value={client.contactEmail}
                          onChange={(event) => setConfigDraft((prev) => ({
                            ...prev,
                            clients: prev.clients.map((item) => item.id === client.id ? { ...item, contactEmail: event.target.value } : item),
                          }))}
                          className="w-full rounded-lg border border-slate-800 bg-black p-2 text-sm outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-[11px] uppercase text-slate-500">Client Notes</label>
                      <textarea
                        rows={3}
                        value={client.notes}
                        onChange={(event) => setConfigDraft((prev) => ({
                          ...prev,
                          clients: prev.clients.map((item) => item.id === client.id ? { ...item, notes: event.target.value } : item),
                        }))}
                        className="mt-1 w-full rounded-lg border border-slate-800 bg-black p-3 text-sm outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {configTab === 'ai' && (
            <>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Studio Routing</div>
                <div className="text-[11px] text-slate-500">Choose the provider used for Draft, Hooks, Trend Spark, Critique, Adapt, Audiences, and Calendar actions in the composer.</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">AI Studio Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {['gemini', 'chatgpt', 'claude'].map((provider) => (
                    <button
                      key={provider}
                      onClick={() => updateConfigDraftClient((client) => ({ ...client, aiProvider: provider }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all ${draftClient.aiProvider === provider ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  {draftClient.aiProvider} API Key
                </label>
                <input
                  type="password"
                  value={draftClient.apiKeys[draftClient.aiProvider]}
                  onChange={(event) => updateConfigDraftClient((client) => ({
                    ...client,
                    apiKeys: { ...client.apiKeys, [draftClient.aiProvider]: event.target.value },
                  }))}
                  className="w-full p-3 rounded-xl bg-black border border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                />
              </div>
            </>
          )}

          {configTab === 'social' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Provider: Ayrshare</div>
                    <div className="text-[11px] text-slate-500">Publishes to Facebook, Instagram, LinkedIn, Pinterest, X, YouTube, and TikTok using mapped accounts.</div>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${isAyrshareReady ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-black text-slate-400'}`}>
                    {isAyrshareReady ? 'Ready' : 'Needs API key'}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Ayrshare API Key</label>
                  <input
                    type="password"
                    value={draftClient.socialKeys.ayrshare || ''}
                    onChange={(event) => updateConfigDraftClient((client) => ({
                      ...client,
                      socialKeys: { ...client.socialKeys, ayrshare: event.target.value },
                    }))}
                    className="w-full p-2.5 rounded-lg bg-black border border-slate-800 focus:border-slate-600 outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Feed Sources</div>
                    <div className="text-[11px] text-slate-500">Use public RSS, Atom, and YouTube sources to load real content into Live Feed Pulse.</div>
                  </div>
                  <button onClick={handleAddFeedSource} className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700">Add source</button>
                </div>
                {(draftClient.feedSources || []).map((source) => (
                  <div key={source.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{source.enabled ? 'Enabled' : 'Disabled'}</div>
                      <button onClick={() => handleRemoveFeedSource(source.id)} className="rounded-full border border-slate-700 px-3 py-2 text-[11px] font-semibold text-slate-300 hover:bg-slate-800">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Label</label>
                        <input
                          value={source.label}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            feedSources: (client.feedSources || []).map((item) => item.id === source.id ? { ...item, label: event.target.value } : item),
                          }))}
                          className="w-full rounded-lg border border-slate-800 bg-black p-2 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Feed Type</label>
                        <select
                          value={source.platform}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            feedSources: (client.feedSources || []).map((item) => item.id === source.id ? { ...item, platform: event.target.value } : item),
                          }))}
                          className="w-full rounded-lg border border-slate-800 bg-black p-2 text-sm outline-none"
                        >
                          <option value="rss">RSS / Atom</option>
                          <option value="youtube">YouTube Feed</option>
                          <option value="news">News Feed</option>
                        </select>
                      </div>
                      <label className={getToggleCardClass(source.enabled)}>
                        <span className={`text-xs uppercase ${getToggleTextClass(source.enabled)}`}>Enabled</span>
                        <input
                          type="checkbox"
                          checked={source.enabled}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            feedSources: (client.feedSources || []).map((item) => item.id === source.id ? { ...item, enabled: event.target.checked } : item),
                          }))}
                          className={toggleInputClassName}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 uppercase">Feed URL</label>
                      <input
                        value={source.url}
                        onChange={(event) => updateConfigDraftClient((client) => ({
                          ...client,
                          feedSources: (client.feedSources || []).map((item) => item.id === source.id ? { ...item, url: event.target.value } : item),
                        }))}
                        className="w-full rounded-lg border border-slate-800 bg-black p-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                ))}
                {(draftClient.feedSources || []).length === 0 && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-[11px] text-slate-500">No live feed sources configured yet.</div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Managed Accounts for {draftClient.company || draftClient.name}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Add accounts for each platform you want to publish to. Live delivery is enabled only when both provider credentials and a matching account mapping exist.</div>
                </div>
                {draftClient.accounts.length > 0 ? draftClient.accounts.map((account) => (
                  <div key={account.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-300">{account.label || 'Untitled account'}{account.handle ? ` • ${account.handle}` : ''}</span>
                      <button
                        onClick={() => handleRemoveAccount(account.id)}
                        className="rounded-full border border-rose-500/50 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20 transition-colors"
                        aria-label={`Remove ${account.label || 'account'}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Label</label>
                        <input
                          value={account.label}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            accounts: client.accounts.map((item) => item.id === account.id ? { ...item, label: event.target.value } : item),
                          }))}
                          className="w-full p-2 rounded-lg bg-black border border-slate-800 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Handle</label>
                        <input
                          value={account.handle}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            accounts: client.accounts.map((item) => item.id === account.id ? { ...item, handle: event.target.value } : item),
                          }))}
                          className="w-full p-2 rounded-lg bg-black border border-slate-800 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Platform</label>
                        <select
                          value={account.platform}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            accounts: client.accounts.map((item) => item.id === account.id ? { ...item, platform: event.target.value } : item),
                          }))}
                          className="w-full p-2 rounded-lg bg-black border border-slate-800 outline-none text-sm"
                        >
                          {PLATFORMS.map((option) => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Brand</label>
                        <select
                          value={account.brandId}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            accounts: client.accounts.map((item) => item.id === account.id ? { ...item, brandId: event.target.value } : item),
                          }))}
                          className="w-full p-2 rounded-lg bg-black border border-slate-800 outline-none text-sm"
                        >
                          {draftClient.brands.length > 0 ? draftClient.brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>{brand.name || 'Untitled brand'}</option>
                          )) : (
                            <option value="">No brands configured</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Role</label>
                        <input
                          value={account.role}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            accounts: client.accounts.map((item) => item.id === account.id ? { ...item, role: event.target.value } : item),
                          }))}
                          placeholder="creator, reviewer, publisher, admin"
                          className="w-full p-2 rounded-lg bg-black border border-slate-800 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-[11px] text-slate-500">No accounts mapped yet.</div>
                )}
                <button onClick={handleAddAccount} className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700">Add account</button>
              </div>
            </div>
          )}

          {configTab === 'brand' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {draftClient.brands.length > 0 ? draftClient.brands.map((brand) => (
                  <div key={brand.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: brand.primaryColor || '#64748B' }} />
                        <span className="text-xs font-semibold text-slate-300">{brand.name || 'Untitled brand'}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveBrand(brand.id)}
                        className="rounded-full border border-rose-500/50 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20 transition-colors"
                        aria-label={`Remove ${brand.name || 'brand'}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Brand Name</label>
                        <input
                          value={brand.name}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            brands: client.brands.map((item) => item.id === brand.id ? { ...item, name: event.target.value } : item),
                          }))}
                          className="w-full p-2 rounded-lg bg-black border border-slate-800 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Tone</label>
                        <input
                          value={brand.voice}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            brands: client.brands.map((item) => item.id === brand.id ? { ...item, voice: event.target.value } : item),
                          }))}
                          className="w-full p-2 rounded-lg bg-black border border-slate-800 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">Primary Color</label>
                        <input
                          type="color"
                          value={brand.primaryColor}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            brands: client.brands.map((item) => item.id === brand.id ? { ...item, primaryColor: event.target.value } : item),
                          }))}
                          className="w-full h-12 rounded-2xl border border-slate-800 bg-slate-900 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 uppercase">City / Market</label>
                        <input
                          value={brand.city}
                          onChange={(event) => updateConfigDraftClient((client) => ({
                            ...client,
                            brands: client.brands.map((item) => item.id === brand.id ? { ...item, city: event.target.value } : item),
                          }))}
                          className="w-full p-2 rounded-lg bg-black border border-slate-800 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-[11px] text-slate-500 uppercase">Hashtags</label>
                      <input
                        value={brand.hashtags.join(', ')}
                        onChange={(event) => updateConfigDraftClient((client) => ({
                          ...client,
                          brands: client.brands.map((item) => item.id === brand.id ? { ...item, hashtags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) } : item),
                        }))}
                        className="w-full p-2 rounded-lg bg-black border border-slate-800 outline-none text-sm"
                      />
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-[11px] text-slate-500">No brands configured yet.</div>
                )}
              </div>
              <button onClick={handleAddBrand} className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700">Add brand</button>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400" />
                  <div>
                    <div className="text-sm font-semibold">Governance</div>
                    <div className="text-[11px] text-slate-500">Approval workflows and role-based checks.</div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 uppercase">Current Operator Role</label>
                  <select
                    value={draftClient.currentUserRole}
                    onChange={(event) => updateConfigDraftClient((client) => ({
                      ...client,
                      currentUserRole: event.target.value,
                    }))}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-black p-2 text-sm outline-none"
                  >
                    {WORKSPACE_USER_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>{role.label}</option>
                    ))}
                  </select>
                  <div className="mt-2 text-[11px] text-slate-500">This local operator role controls who can approve and publish when role-based access is enabled.</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className={getToggleCardClass(draftClient.governance.approvalRequired)}>
                    <span className={`text-xs uppercase ${getToggleTextClass(draftClient.governance.approvalRequired)}`}>Approval required</span>
                    <input
                      type="checkbox"
                      checked={draftClient.governance.approvalRequired}
                      onChange={(event) => updateConfigDraftClient((client) => ({
                        ...client,
                        governance: { ...client.governance, approvalRequired: event.target.checked },
                      }))}
                      className={toggleInputClassName}
                    />
                  </label>
                  <label className={getToggleCardClass(draftClient.governance.brandSafe)}>
                    <span className={`text-xs uppercase ${getToggleTextClass(draftClient.governance.brandSafe)}`}>Brand-safe mode</span>
                    <input
                      type="checkbox"
                      checked={draftClient.governance.brandSafe}
                      onChange={(event) => updateConfigDraftClient((client) => ({
                        ...client,
                        governance: { ...client.governance, brandSafe: event.target.checked },
                      }))}
                      className={toggleInputClassName}
                    />
                  </label>
                  <label className={getToggleCardClass(draftClient.governance.roleBased)}>
                    <span className={`text-xs uppercase ${getToggleTextClass(draftClient.governance.roleBased)}`}>Role-based access</span>
                    <input
                      type="checkbox"
                      checked={draftClient.governance.roleBased}
                      onChange={(event) => updateConfigDraftClient((client) => ({
                        ...client,
                        governance: { ...client.governance, roleBased: event.target.checked },
                      }))}
                      className={toggleInputClassName}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 shrink-0 border-t border-slate-800 bg-slate-900">
          <div className="flex gap-3">
            <button
              onClick={saveConfiguration}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${isSavingConfig ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-white text-black hover:bg-slate-200'}`}
              disabled={isSavingConfig}
            >
              {isSavingConfig ? 'Saving...' : 'Save Configuration'}
            </button>
            <button onClick={cancelConfiguration} className="flex-1 py-3 rounded-xl border border-slate-700 text-sm font-bold text-slate-300 hover:bg-slate-800">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationModal;
