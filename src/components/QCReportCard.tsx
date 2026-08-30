import React from 'react';
import { GenotypeSampleQC } from '@/types/genomics';
import { CheckCircle, AlertCircle, Cpu, FileSpreadsheet, Activity, Layers, ShieldCheck } from 'lucide-react';

interface QCReportCardProps {
  qc: GenotypeSampleQC;
}

export const QCReportCard: React.FC<QCReportCardProps> = ({ qc }) => {
  const isHighCallRate = qc.callRate >= 98.0;
  const isGoodTiTv = qc.titvRatio >= 1.8 && qc.titvRatio <= 2.4;

  return (
    <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Genotype Sample Telemetry & QC Audit</h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono bg-slate-900 text-white font-bold shadow-sm">
              {qc.detectedChip.toUpperCase()} • {qc.detectedBuild}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            File: <span className="text-slate-800 font-semibold">{qc.fileName}</span> ({Math.round(qc.fileSizeBytes / (1024 * 1024) * 10) / 10} MB)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isHighCallRate ? (
            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>QC PASS ({qc.callRate}% Call Rate)</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>QC WARN ({qc.callRate}% Call Rate)</span>
            </span>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Variants */}
        <div className="surface-card p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-mono font-semibold">
            <span>TOTAL SNPS</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
            {qc.totalVariants.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Array Probes</p>
        </div>

        {/* Call Rate */}
        <div className="surface-card p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-mono font-semibold">
            <span>CALL RATE</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-700 tracking-tight">
            {qc.callRate}%
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">{qc.noCallCount.toLocaleString()} uncalled</p>
        </div>

        {/* Ti/Tv Ratio */}
        <div className="surface-card p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-mono font-semibold">
            <span>TI / TV RATIO</span>
            <Layers className="w-3.5 h-3.5 text-purple-700" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-purple-800 tracking-tight">
            {qc.titvRatio}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {isGoodTiTv ? 'Expected ~2.1' : 'Minor Skew'}
          </p>
        </div>

        {/* Het / Hom Ratio */}
        <div className="surface-card p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-mono font-semibold">
            <span>HET / HOM</span>
            <Activity className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-amber-800 tracking-tight">
            {qc.hetHomRatio}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {qc.heterozygousCount.toLocaleString()} het
          </p>
        </div>

        {/* Autosomal Calls */}
        <div className="surface-card p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-mono font-semibold">
            <span>AUTOSOMAL</span>
            <Cpu className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-800 tracking-tight">
            {qc.validAutosomalCalls.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Chr 1 - 22</p>
        </div>

        {/* Sex & MT Calls */}
        <div className="surface-card p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-mono font-semibold">
            <span>SEX & MT</span>
            <Cpu className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-800 tracking-tight">
            {(qc.sexChromosomeCalls + qc.mitochondrialCalls).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {qc.sexChromosomeCalls} sex / {qc.mitochondrialCalls} MT
          </p>
        </div>
      </div>
    </div>
  );
};
