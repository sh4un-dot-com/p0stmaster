import React, { useEffect } from 'react';
import { Globe, Info, Mail, MapPin, Package2, Wifi, X } from 'lucide-react';

const AboutModal = ({ isOpen, theme, themeMode, aboutInfo, onClose }) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sectionClass = themeMode === 'light'
    ? 'rounded-2xl border border-slate-200 bg-slate-50 p-4'
    : 'rounded-2xl border border-slate-800 bg-slate-900/80 p-4';
  const metaLabelClass = themeMode === 'light' ? 'text-slate-500' : 'text-slate-400';
  const linkClass = themeMode === 'light'
    ? 'text-indigo-700 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-900'
    : 'text-indigo-300 underline decoration-indigo-500/50 underline-offset-4 hover:text-indigo-200';

  return (
    <div
      data-overlay="true"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className={`${theme.card} w-full max-w-xl rounded-2xl border ${theme.border} shadow-2xl animate-in zoom-in-95 duration-200`}
      >
        <div className={`flex items-center justify-between border-b ${theme.border} p-6`}>
          <div>
            <h3 id="about-title" className="flex items-center gap-2 text-lg font-bold">
              <Info size={20} className={theme.accent} />
              About p0stmaster
            </h3>
            <p className="mt-1 text-sm text-slate-500">Desktop build notes, credits, and support details.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 transition-colors hover:text-slate-300" aria-label="Close about dialog">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <section className={sectionClass}>
            <div className="flex items-start gap-3">
              <Package2 size={18} className={`mt-0.5 ${theme.accent}`} />
              <div>
                <div className="text-sm font-semibold">Self-contained desktop runtime</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  The packaged desktop build bundles Electron, Chromium, the local app server, and the compiled app assets.
                  You do not need a separate Node.js install, npm, or browser server after install.
                </p>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="flex items-start gap-3">
              <Wifi size={18} className={`mt-0.5 ${theme.accent}`} />
              <div>
                <div className="text-sm font-semibold">Still network-dependent for live features</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  AI Studio actions, live feed refresh, and social publishing still call external services.
                  Those features need internet access plus your configured provider keys.
                </p>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="space-y-3">
              <div className="text-sm font-semibold">Version and build</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-black/20 p-3">
                  <div className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${metaLabelClass}`}>App version</div>
                  <div className="text-sm">{aboutInfo.appVersion}</div>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <div className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${metaLabelClass}`}>Mode</div>
                  <div className="text-sm">{aboutInfo.runtimeLabel}</div>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <div className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${metaLabelClass}`}>Platform</div>
                  <div className="text-sm">{aboutInfo.platformLabel}</div>
                </div>
              </div>
              <div className="rounded-xl bg-black/20 p-3">
                <div className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${metaLabelClass}`}>Runtime details</div>
                <div className="text-sm">{aboutInfo.runtimeDetails}</div>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-semibold">Credits</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">Built by Akita Engineering.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-black/20 p-3">
                  <div className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${metaLabelClass}`}>Support</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={15} className={theme.accent} />
                    <a href="mailto:support@akitaengineering.com" target="_blank" rel="noreferrer" className={linkClass}>
                      support@akitaengineering.com
                    </a>
                  </div>
                </div>

                <div className="rounded-xl bg-black/20 p-3">
                  <div className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${metaLabelClass}`}>Website</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={15} className={theme.accent} />
                    <a href="https://www.akitaengineering.com" target="_blank" rel="noreferrer" className={linkClass}>
                      www.akitaengineering.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-black/20 p-3">
                <div className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${metaLabelClass}`}>Origin</div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={15} className={theme.accent} />
                  <span>Made in Niagara Falls, Canada</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;