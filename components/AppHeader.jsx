import React from 'react';
import { ChevronRight, MoreHorizontal, Settings } from 'lucide-react';

const AppHeader = ({
  theme,
  themeMode,
  isQuickActionsOpen,
  saveBanner,
  onThemeChange,
  onOpenConfig,
  onToggleQuickActions,
  onRefreshLiveFeeds,
  onDismissBanner,
}) => (
  <>
    <nav className={`h-16 border-b ${theme.border} flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-md ${themeMode === 'light' ? 'bg-white/70' : 'bg-black/80'}`}>
      <div>
        <span className="font-bold text-xl tracking-tight">p0stmaster</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">Vault: Encrypted</span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 p-1">
          {['dark', 'light', 'fm'].map((mode) => (
            <button
              key={mode}
              onClick={() => onThemeChange(mode)}
              className={`theme-pill rounded-full px-3 py-1 text-[11px] font-semibold transition ${themeMode === mode ? 'theme-pill--active bg-white text-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >{mode.toUpperCase()}</button>
          ))}
        </div>
        <div className="relative flex items-center gap-2">
          <button aria-label="Open configuration" onClick={onOpenConfig} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <Settings size={20} />
          </button>
          <button
            aria-label="Open quick actions"
            onClick={onToggleQuickActions}
            className={`p-2 rounded-full transition-colors ${isQuickActionsOpen ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
          >
            <MoreHorizontal size={20} />
          </button>
          {isQuickActionsOpen && (
            <div className={`absolute right-0 top-12 w-64 rounded-2xl border border-slate-800 ${theme.card} p-2 shadow-2xl`}>
              <button
                onClick={onRefreshLiveFeeds}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                <span>Refresh live feeds</span>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
              <button
                onClick={onOpenConfig}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                <span>Open configuration</span>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
              <button
                onClick={onDismissBanner}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                <span>Dismiss banner</span>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>

    {saveBanner && (
      <div data-overlay="true" className="fixed inset-x-0 top-20 z-[110] flex justify-center px-4 pointer-events-none">
        <div className="max-w-xl rounded-2xl border border-emerald-300/70 bg-emerald-500/18 px-5 py-3 text-sm font-semibold text-emerald-100 shadow-2xl backdrop-blur-md">
          {saveBanner}
        </div>
      </div>
    )}
  </>
);

export default AppHeader;