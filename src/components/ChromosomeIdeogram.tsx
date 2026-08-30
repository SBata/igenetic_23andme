import React, { useState } from 'react';
import { GRCH38_CHROMOSOME_LENGTHS } from '@/lib/constants';
import { Layers, Sparkles } from 'lucide-react';

interface ChromosomeIdeogramProps {
  chromosomeDensity: {
    [chr: string]: {
      variantCount: number;
      actionableHits: number;
    };
  };
}

export const ChromosomeIdeogram: React.FC<ChromosomeIdeogramProps> = ({ chromosomeDensity }) => {
  const [selectedChr, setSelectedChr] = useState<string | null>(null);

  const chromosomes = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', 'X', 'Y', 'MT'
  ];

  const maxBp = GRCH38_CHROMOSOME_LENGTHS['1'];

  return (
    <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-slate-700" />
            <span>Karyotype Architecture & Chromosomal Density</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Assembly: GRCh38 • Click chromosome to isolate region
          </p>
        </div>

        {selectedChr && (
          <button
            onClick={() => setSelectedChr(null)}
            className="px-3 py-1 text-xs text-slate-700 hover:text-slate-900 font-mono font-semibold rounded-lg bg-slate-100 border border-slate-200 transition"
          >
            Reset Filter (All Chromosomes)
          </button>
        )}
      </div>

      {/* Chromosome Grid / Visualizer */}
      <div className="space-y-1.5 pt-1">
        {chromosomes.map(chr => {
          const bpLength = GRCH38_CHROMOSOME_LENGTHS[chr] || 50000000;
          const lengthPct = Math.max(10, (bpLength / maxBp) * 100);
          const data = chromosomeDensity[chr] || { variantCount: 0, actionableHits: 0 };
          const isSelected = selectedChr === chr;
          const hasHits = data.actionableHits > 0;

          return (
            <div
              key={chr}
              onClick={() => setSelectedChr(isSelected ? null : chr)}
              className={`flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white font-bold shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {/* Chr Label */}
              <div className="w-10 text-right font-mono text-xs font-bold">
                chr{chr}
              </div>

              {/* Bar track */}
              <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden relative border border-slate-200 flex items-center p-0.5">
                {/* Visual Chromosome Body */}
                <div
                  className={`h-full rounded-full transition-all duration-300 flex items-center justify-between px-2.5 ${
                    hasHits
                      ? (isSelected ? 'bg-white text-slate-900 font-bold' : 'bg-emerald-600 text-white')
                      : (isSelected ? 'bg-slate-700 text-white' : 'bg-slate-300 text-slate-700')
                  }`}
                  style={{ width: `${lengthPct}%` }}
                >
                  <span className="text-[10px] font-mono font-semibold truncate">
                    {Math.round(bpLength / 1000000)} Mb
                  </span>
                </div>
              </div>

              {/* Stats & Badges */}
              <div className="w-40 flex items-center justify-end space-x-2 text-xs font-mono">
                <span className={isSelected ? 'text-white font-bold' : 'text-slate-500'}>
                  {data.variantCount.toLocaleString()} SNPs
                </span>

                {hasHits && (
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    isSelected ? 'bg-white text-slate-900' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  }`}>
                    {data.actionableHits} {data.actionableHits === 1 ? 'hit' : 'hits'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedChr && (
        <div className="surface-inset p-4 rounded-xl text-xs text-slate-700 flex items-center justify-between font-mono border border-slate-200 animate-fadeIn">
          <div>
            <strong className="text-slate-900">Chromosome {selectedChr} Selected:</strong>{' '}
            {(chromosomeDensity[selectedChr]?.variantCount || 0).toLocaleString()} variants identified with{' '}
            <strong className="text-emerald-700 font-bold">{chromosomeDensity[selectedChr]?.actionableHits || 0}</strong> actionable clinical/PGx/GWAS associations.
          </div>
          <span className="text-slate-500">
            Length: {Math.round((GRCH38_CHROMOSOME_LENGTHS[selectedChr] || 0) / 1000000)} Mbp
          </span>
        </div>
      )}
    </div>
  );
};
