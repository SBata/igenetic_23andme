import React, { useState } from 'react';
import { PGxGeneReport } from '@/types/genomics';
import { Pill, ExternalLink, Activity, AlertTriangle, ShieldCheck, CheckCircle2, ArrowUpRight, Stethoscope, Dna, Info } from 'lucide-react';

interface PGxDashboardProps {
  pgxReports: PGxGeneReport[];
}

export const PGxDashboard: React.FC<PGxDashboardProps> = ({ pgxReports }) => {
  const [filterArea, setFilterArea] = useState<string>('All');

  const areas = ['All', 'Cardiology', 'Oncology', 'Psychiatry', 'Pain & Anesthesia', 'Infectious Disease'];

  const getPhenotypeBadge = (phenotype: string) => {
    switch (phenotype) {
      case 'Poor Metabolizer':
        return 'bg-rose-50 border-rose-200 text-rose-800 font-bold';
      case 'Intermediate Metabolizer':
        return 'bg-amber-50 border-amber-200 text-amber-800 font-bold';
      case 'Rapid Metabolizer':
      case 'Ultra-Rapid Metabolizer':
        return 'bg-purple-50 border-purple-200 text-purple-800 font-bold';
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold';
    }
  };

  const filteredReports = pgxReports.filter(report => {
    if (filterArea === 'All') return true;
    return report.drugs.some(d => d.therapeuticArea === filterArea);
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
                <Pill className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Pharmacogenomics (CPIC / PharmGKB Guidelines)
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Star-allele diplotype calling for actionable pharmacogenes. Mapped against Clinical Pharmacogenetics Implementation Consortium (CPIC Level A/B) guidelines to guide drug efficacy and adverse reaction prevention.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">CPIC Level A/B Validated</span>
          </div>
        </div>

        {/* Filter Area Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
          {areas.map(area => (
            <button
              key={area}
              onClick={() => setFilterArea(area)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                filterArea === area
                  ? 'bg-slate-900 text-white font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Gene & Drug Cards Grid */}
      <div className="space-y-6">
        {filteredReports.map(report => {
          const isAtypical = report.phenotype !== 'Normal Metabolizer';
          const displayedDrugs = report.drugs.filter(
            d => filterArea === 'All' || d.therapeuticArea === filterArea
          );

          if (displayedDrugs.length === 0) return null;

          return (
            <div
              key={report.gene}
              className={`surface-base rounded-2xl p-6 sm:p-8 space-y-6 ${
                isAtypical ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              {/* Gene Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-900 text-base shadow-sm">
                    {report.gene}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-extrabold text-slate-900">{report.gene}</h3>
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                        Diplotype: <strong className="text-slate-900 font-bold">{report.diplotype}</strong>
                      </span>
                    </div>
                    {report.activityScore !== undefined && (
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        Calculated Activity Score: <span className="text-slate-900 font-semibold">{report.activityScore.toFixed(1)}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border font-mono ${getPhenotypeBadge(report.phenotype)}`}>
                    {report.phenotype}
                  </span>
                </div>
              </div>

              {/* Detected Variants / Star Alleles */}
              {report.detectedVariants.length > 0 && (
                <div className="surface-inset p-4 rounded-xl space-y-2 border border-slate-200">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
                    Observed Star-Allele Variants:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {report.detectedVariants.map(v => (
                      <div key={v.rsid} className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-mono">
                        <div className="flex justify-between items-center">
                          <a
                            href={`https://www.ncbi.nlm.nih.gov/snp/${v.rsid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-900 font-bold hover:underline flex items-center space-x-1"
                          >
                            <span>{v.rsid}</span>
                            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                          </a>
                          <span className="text-amber-700 font-semibold">{v.starAllele} ({v.genotype})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-sans">{v.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Drug Recommendations */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Drug Guidelines ({displayedDrugs.length} medications)</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedDrugs.map(drug => (
                    <div
                      key={drug.drugName}
                      className="surface-card p-5 rounded-xl space-y-3.5 flex flex-col justify-between border border-slate-200 bg-white"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-base text-slate-900">{drug.drugName}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">
                              {drug.therapeuticArea}
                            </span>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono font-bold shadow-sm">
                            CPIC {drug.cpicLevel}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {drug.clinicalSummary}
                        </p>
                      </div>

                      {/* Clinical Action Recommendation */}
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                          {isAtypical ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                          <span>Clinical Recommendation:</span>
                        </p>
                        <p className="text-xs leading-relaxed text-slate-700">
                          {drug.recommendation}
                        </p>
                      </div>

                      {/* Protocol Link */}
                      <div className="pt-1 flex justify-end">
                        <a
                          href={drug.guidelineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs text-slate-900 hover:underline font-semibold font-mono"
                        >
                          <span>Official CPIC Guideline</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
