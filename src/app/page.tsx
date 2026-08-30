'use client';

import React, { useState, useEffect } from 'react';
import { FullAnalysisResult } from '@/types/genomics';
import { Navbar } from '@/components/Navbar';
import { HeroWizard } from '@/components/HeroWizard';
import { QCReportCard } from '@/components/QCReportCard';
import { ChromosomeIdeogram } from '@/components/ChromosomeIdeogram';
import { PGxDashboard } from '@/components/PGxDashboard';
import { PRSDashboard } from '@/components/PRSDashboard';
import { ClinVarDashboard } from '@/components/ClinVarDashboard';
import { GwasTraitsDashboard } from '@/components/GwasTraitsDashboard';
import { DynamicVariantExplorer } from '@/components/DynamicVariantExplorer';
import { MethodsDashboard } from '@/components/MethodsDashboard';
import { ExportReportModal } from '@/components/ExportReportModal';
import { ShieldCheck, Info } from 'lucide-react';

const SESSION_STORAGE_KEY = 'iGenetic_active_analysis';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('prs');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isLoadedFromSession, setIsLoadedFromSession] = useState<boolean>(false);

  // Restore personal uploaded data from client sessionStorage on page refresh
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as FullAnalysisResult;
        setAnalysisResult(parsed);
      }
    } catch (e) {
      console.warn('Could not read analysis from sessionStorage', e);
    } finally {
      setIsLoadedFromSession(true);
    }
  }, []);

  const handleAnalysisComplete = (result: FullAnalysisResult) => {
    setAnalysisResult(result);
    try {
      const toCache: FullAnalysisResult = {
        qc: result.qc,
        pgx: result.pgx,
        prs: result.prs,
        clinvar: result.clinvar,
        gwas: result.gwas,
        chromosomeDensity: result.chromosomeDensity,
        rawVariants: result.rawVariants?.slice(0, 10000) || [],
        analyzedAt: result.analyzedAt,
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toCache));
    } catch (e) {
      console.warn('Could not persist analysis to sessionStorage', e);
    }
  };

  const handleReset = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setAnalysisResult(null);
    setActiveTab('prs');
  };

  if (!isLoadedFromSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
      <Navbar
        hasData={!!analysisResult}
        onReset={handleReset}
        onExport={() => setIsExportOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          <HeroWizard onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <div className="space-y-8">
            {/* Tab: Polygenic Risk Scores */}
            {activeTab === 'prs' && (
              <div className="animate-fadeIn">
                <PRSDashboard prsResults={analysisResult.prs} />
              </div>
            )}

            {/* Tab: Pharmacogenomics */}
            {activeTab === 'pgx' && (
              <div className="animate-fadeIn">
                <PGxDashboard pgxReports={analysisResult.pgx} />
              </div>
            )}

            {/* Tab: ClinVar Rare / High-Impact Findings */}
            {activeTab === 'clinvar' && (
              <div className="animate-fadeIn">
                <ClinVarDashboard findings={analysisResult.clinvar} />
              </div>
            )}

            {/* Tab: GWAS Traits */}
            {activeTab === 'gwas' && (
              <div className="animate-fadeIn">
                <GwasTraitsDashboard traits={analysisResult.gwas} />
              </div>
            )}

            {/* Tab: Dynamic Variant Explorer (Search Any rsID) */}
            {activeTab === 'explorer' && (
              <div className="animate-fadeIn">
                <DynamicVariantExplorer variants={analysisResult.rawVariants} />
              </div>
            )}

            {/* Tab: Overview (QC & Karyotype) */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                <QCReportCard qc={analysisResult.qc} />
                <ChromosomeIdeogram chromosomeDensity={analysisResult.chromosomeDensity} />
              </div>
            )}

            {/* Tab: Scientific Methodology & Mathematical Formulations */}
            {activeTab === 'methods' && (
              <div className="animate-fadeIn">
                <MethodsDashboard />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Export Report Modal */}
      {isExportOpen && analysisResult && (
        <ExportReportModal
          analysis={analysisResult}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-mono text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Knowledge Privacy • 100% Client-Side RAM Execution</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-500 font-mono text-xs">
            <Info className="w-3.5 h-3.5" />
            <span>For computational research exploration. Not a clinical diagnostic device.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
