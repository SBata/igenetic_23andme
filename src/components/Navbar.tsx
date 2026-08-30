import React from 'react';
import { Dna, Download, RefreshCw, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  hasData: boolean;
  onReset: () => void;
  onExport: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasData,
  onReset,
  onExport,
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'prs', label: 'Polygenic Risk' },
    { id: 'pgx', label: 'Pharmacogenomics' },
    { id: 'clinvar', label: 'ClinVar Mutations' },
    { id: 'gwas', label: 'GWAS Traits' },
    { id: 'explorer', label: 'Variant Search' },
    { id: 'overview', label: 'Telemetry & QC' },
    { id: 'methods', label: 'Scientific Methodology' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Dna className="w-4 h-4 text-white" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  iGenetic
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono font-semibold">
                  Research Pro
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-emerald-700 font-semibold">100% In-Browser Execution</span>
                <span>•</span>
                <span>Zero Server Upload</span>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-2.5">
            {hasData && (
              <>
                <button
                  onClick={onExport}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition active:scale-95 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
                <button
                  onClick={onReset}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New File</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Row */}
        {hasData && (
          <div className="pb-3 pt-1">
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto scrollbar-none">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
