import React from 'react';
import { FullAnalysisResult } from '@/types/genomics';
import { X, Download, FileText, Printer, Shield, CheckCircle, ExternalLink } from 'lucide-react';

interface ExportReportModalProps {
  analysis: FullAnalysisResult;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ analysis, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `iGenetic_Research_Report_${analysis.qc.fileName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="surface-base rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Export Genomic Health Summary</h2>
              <p className="text-xs text-slate-500 font-mono">Zero-Knowledge Offline Document Generation</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 font-sans">
          {/* Executive Header Banner */}
          <div className="p-4 rounded-xl surface-inset border border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <span className="font-bold text-sm text-slate-900">iGenetic Genomic Audit Report</span>
              <p className="text-slate-500 mt-0.5">Sample ID: {analysis.qc.fileName}</p>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-600">
              <div>Chip: <strong className="text-slate-900">{analysis.qc.detectedChip} ({analysis.qc.detectedBuild})</strong></div>
              <div>Call Rate: <strong className="text-emerald-700">{analysis.qc.callRate}%</strong></div>
            </div>
          </div>

          {/* Section 1: Pharmacogenomics */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-mono">1. Actionable Pharmacogenomics (CPIC)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.pgx.map(g => (
                <div key={g.gene} className="p-3 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-slate-900 font-bold">{g.gene}</span>
                    <span className="text-slate-500 ml-2 font-mono">{g.diplotype}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    g.phenotype.includes('Poor') ? 'bg-rose-50 border-rose-200 text-rose-800' :
                    g.phenotype.includes('Intermediate') ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {g.phenotype}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Polygenic Risk Scores */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-mono">2. Polygenic Risk Stratification</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-50 text-slate-600 text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">TRAIT</th>
                    <th className="p-2.5">PERCENTILE</th>
                    <th className="p-2.5">RELATIVE RISK</th>
                    <th className="p-2.5">SCORE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {analysis.prs.map(p => (
                    <tr key={p.modelId}>
                      <td className="p-2.5 text-slate-900 font-semibold">{p.traitName}</td>
                      <td className="p-2.5 font-bold text-slate-900">{p.percentiles.EUR}%ile</td>
                      <td className="p-2.5 text-slate-700">{p.relativeRisk}x</td>
                      <td className="p-2.5 text-emerald-700 font-bold">+{p.observedScore.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: High-Tier ClinVar */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-mono">3. ClinVar Pathogenic Findings</h3>
            {analysis.clinvar.length === 0 ? (
              <p className="text-slate-500 italic">No high-confidence Pathogenic variants detected.</p>
            ) : (
              <div className="space-y-2">
                {analysis.clinvar.map(c => (
                  <div key={c.rsid} className="p-3 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">{c.gene}</span>
                      <span className="text-slate-500 ml-2 font-mono">{c.rsid} ({c.variantDescription})</span>
                      <span className="block text-slate-600 mt-0.5">{c.associatedCondition}</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[10px] font-bold">
                        {c.copiesOfRiskAllele} copy carried
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer Footer */}
          <div className="p-4 rounded-lg surface-inset flex items-start space-x-2 text-[11px] text-slate-600 border border-slate-200 bg-slate-50">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              This computational report was rendered locally inside the client web browser. No identifiable genomic information was transmitted over the network. For research and personal exploration purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
