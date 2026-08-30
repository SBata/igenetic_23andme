import React, { useState } from 'react';
import { ClinVarFinding } from '@/types/genomics';
import { ShieldAlert, Star, ExternalLink, CheckCircle, Search, FileText, Info, AlertTriangle, Stethoscope, ArrowUpRight, HelpCircle } from 'lucide-react';

interface ClinVarDashboardProps {
  findings: ClinVarFinding[];
}

export const ClinVarDashboard: React.FC<ClinVarDashboardProps> = ({ findings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState<number>(2);

  const filteredFindings = findings.filter(f => {
    const matchesSearch =
      f.gene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.associatedCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.rsid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStars = f.reviewStars >= starFilter;
    return matchesSearch && matchesStars;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                High-Impact Monogenic Variants (ClinVar)
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Filtered for peer-reviewed medical mutations (2+ stars in the NIH ClinVar database). These are specific single-gene variants tied to hereditary health conditions.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600 font-mono pl-2">Review Level:</span>
            <select
              value={starFilter}
              onChange={e => setStarFilter(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-1.5 focus:outline-none font-mono shadow-sm"
            >
              <option value={2}>⭐ 2+ Stars (Multiple Submitters)</option>
              <option value={3}>⭐⭐ 3+ Stars (Expert Panel)</option>
              <option value={4}>⭐⭐⭐ 4 Stars (Practice Guideline)</option>
            </select>
          </div>
        </div>

        {/* Plain English "Joe the Plumber" Guide */}
        <div className="surface-inset p-5 rounded-xl text-xs space-y-3 border border-slate-200">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
            <HelpCircle className="w-4 h-4 text-slate-700" />
            <span>How to Read These Findings (Without Panicking)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700 text-xs leading-relaxed">
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold text-xs">1. "Am I sick right now?"</strong>
              <p className="text-slate-600">
                Most common findings (like <em>HFE</em> iron overload or <em>SERPINA1</em>) require <strong className="text-slate-900">two mutated copies</strong> to cause disease. If you carry only 1 copy, you are an <strong>asymptomatic healthy carrier</strong>—you do not have the condition.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold text-xs">2. "Could this be a false alarm?"</strong>
              <p className="text-slate-600">
                Yes. Direct-to-consumer microarrays have known false-positive rates on rare variants. Doctors <strong>always</strong> run a hospital-grade diagnostic test to double check before making clinical decisions.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold text-xs">3. "What should I actually do?"</strong>
              <p className="text-slate-600">
                No need to panic. Simply print or save this report and show it to your primary care doctor at your next regular checkup. They can order a simple routine blood test if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4.5" />
          <input
            type="text"
            placeholder="Search by gene (e.g. HFE, BRCA1, F5), condition, or rsID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800 font-mono placeholder-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Findings List */}
      {filteredFindings.length === 0 ? (
        <div className="surface-base rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No High-Risk Mutations Detected</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your sample does not carry any high-confidence Pathogenic variants in the evaluated {starFilter}+ star ClinVar health panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredFindings.map(finding => {
            const isCarrier = finding.copiesOfRiskAllele === 1;
            const isRecessive = finding.associatedCondition.toLowerCase().includes('recessive') || finding.gene === 'HFE' || finding.gene === 'SERPINA1' || finding.gene === 'CFTR';

            return (
              <div
                key={finding.rsid}
                className="surface-base rounded-2xl p-6 sm:p-7 space-y-5 border-rose-200"
              >
                {/* Header Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center space-x-3.5">
                    <span className="font-mono font-bold text-base text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                      {finding.gene}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{finding.associatedCondition}</h3>
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/snp/${finding.rsid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs font-mono text-slate-900 hover:underline"
                      >
                        <span>{finding.rsid} ({finding.variantDescription})</span>
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-amber-600 text-xs font-mono">
                      {Array.from({ length: finding.reviewStars }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      ))}
                      <span className="ml-1 text-xs text-slate-500">({finding.reviewStatus})</span>
                    </div>

                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-900 text-white shadow-sm">
                      {isCarrier && isRecessive ? 'CARRIER ONLY' : 'PATHOGENIC'}
                    </span>
                  </div>
                </div>

                {/* Plain English "What This Means for Joe" Box */}
                <div className="p-4 rounded-xl surface-inset space-y-1.5 text-xs border border-slate-200">
                  <span className="text-slate-900 font-bold font-mono text-xs uppercase block">
                    What this means in plain English:
                  </span>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    {isCarrier && isRecessive ? (
                      <>
                        You carry <strong>1 copy</strong> of the {finding.gene} mutation for {finding.associatedCondition}. Because this condition is recessive (requires 2 copies), you are an <strong>asymptomatic healthy carrier</strong> and not sick with this condition. You have a 50% chance of passing this single copy to any biological children.
                      </>
                    ) : (
                      <>
                        This variant is classified in ClinVar as Pathogenic. Discuss with your doctor at your next regular checkup to see if any routine health monitoring is recommended.
                      </>
                    )}
                  </p>
                </div>

                {/* Technical Genotype Summary */}
                <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500 block uppercase font-semibold">Your Genotype</span>
                    <span className="font-bold text-slate-900 text-sm">{finding.patientGenotype}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block uppercase font-semibold">Mutated Allele</span>
                    <span className="font-bold text-rose-600 text-sm">{finding.riskAllele}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block uppercase font-semibold">Copies Carried</span>
                    <span className="font-bold text-amber-700 text-sm">{finding.copiesOfRiskAllele} copy</span>
                  </div>
                </div>

                {/* Citations & Links */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600 font-mono">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>PubMed Papers:</span>
                    {finding.pubmedIds.map(pmid => (
                      <a
                        key={pmid}
                        href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-800 hover:underline font-semibold"
                      >
                        {pmid}
                      </a>
                    ))}
                  </div>

                  <a
                    href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${finding.clinvarId.replace('VCV', '')}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 transition font-mono shadow-sm"
                  >
                    <span>ClinVar Record ({finding.clinvarId})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
