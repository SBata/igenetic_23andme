'use client';
import React, { useEffect, useState } from 'react';
import type { FullAnalysisResult } from '@/types/genomics';
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

export default function Home() {
  const [result, setResult] = useState<FullAnalysisResult | null>(null);
  const [tab, setTab] = useState('prs');
  const [exportOpen, setExportOpen] = useState(false);
  useEffect(() => {
    // Discard reports produced by the previous, unvalidated scoring engine.
    try { sessionStorage.removeItem('iGenetic_active_analysis'); } catch { /* Storage may be disabled. */ }
  }, []);
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <Navbar hasData={!!result} activeTab={tab} setActiveTab={setTab} onExport={() => setExportOpen(true)} onReset={() => { setResult(null); setTab('prs'); setExportOpen(false); }} />
    <main id="main" tabIndex={-1}>
      {!result ? <HeroWizard onAnalysisComplete={setResult} /> : <>
        {result.isDemo && <p className="demo-note" role="status">Synthetic demo: these invented genotypes are not your results.</p>}
        {tab === 'prs' && <PRSDashboard prsResults={result.prs} />}
        {tab === 'pgx' && <PGxDashboard pgxReports={result.pgx} />}
        {tab === 'clinvar' && <ClinVarDashboard findings={result.clinvar} />}
        {tab === 'gwas' && <GwasTraitsDashboard traits={result.gwas} />}
        {tab === 'explorer' && <DynamicVariantExplorer variants={result.rawVariants} />}
        {tab === 'overview' && <div className="stack"><QCReportCard qc={result.qc} /><ChromosomeIdeogram chromosomeDensity={result.chromosomeDensity} /></div>}
        {tab === 'methods' && <MethodsDashboard />}
      </>}
    </main>
    {exportOpen && result && <ExportReportModal analysis={result} onClose={() => setExportOpen(false)} />}
    <footer>iGenetic · Personal genetic research · Your file stays on this device</footer>
  </div>;
}
