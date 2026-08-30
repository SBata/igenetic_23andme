import React, { useState } from 'react';
import { PRSResult } from '@/types/genomics';
import { 
  TrendingUp, 
  ExternalLink, 
  FileText, 
  HeartHandshake, 
  ShieldCheck, 
  Stethoscope, 
  AlertTriangle, 
  Lightbulb, 
  Activity, 
  ArrowUpRight,
  ChevronRight,
  Copy,
  Check,
  Dna,
  Zap,
  Gauge,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface PRSDashboardProps {
  prsResults: PRSResult[];
}

export const PRSDashboard: React.FC<PRSDashboardProps> = ({ prsResults }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(prsResults[0]?.modelId || '');
  const [selectedPopulation, setSelectedPopulation] = useState<string>('EUR');
  const [selectedVariantRsid, setSelectedVariantRsid] = useState<string | null>(null);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  const currentResult = prsResults.find(r => r.modelId === selectedModelId) || prsResults[0];

  if (!currentResult) return null;

  const currentPercentile = currentResult.percentiles[selectedPopulation] ?? 50;

  const getTierColorClass = (tier: string) => {
    switch (tier) {
      case 'Significantly Elevated':
        return {
          text: 'text-rose-700 font-bold',
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
        };
      case 'Elevated':
        return {
          text: 'text-amber-700 font-bold',
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
        };
      case 'Below Average':
        return {
          text: 'text-slate-700 font-bold',
          bg: 'bg-slate-100 border-slate-200 text-slate-800',
        };
      default:
        return {
          text: 'text-emerald-700 font-bold',
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        };
    }
  };

  const tierStyles = getTierColorClass(currentResult.riskTier);

  const getInsights = (modelId: string, percentile: number, rr: number) => {
    if (modelId.includes('CAD')) {
      return {
        summary: `Your polygenic score places you in the ${percentile}th percentile of European reference populations (~${rr}x relative risk compared to population median). This elevated baseline is primarily driven by carrying homozygous risk alleles at the 9p21.3 coronary artery disease locus.`,
        actionables: [
          { title: 'Lipid Particle Testing', desc: 'Ask your doctor for an ApoB, LDL-P, and baseline Lipoprotein(a) [Lp(a)] blood test.' },
          { title: 'Coronary Calcium (CAC) Scan', desc: 'Discuss with a cardiologist if a low-dose CT CAC scan is appropriate to evaluate existing calcification.' },
          { title: 'Blood Pressure Control', desc: 'Maintain blood pressure below 120/80 mmHg through regular exercise and sodium management.' },
          { title: 'Cardioprotective Nutrition', desc: 'Adopt a Mediterranean-style dietary pattern rich in soluble fiber and omega-3 fatty acids.' },
        ],
        questions: [
          'Given my high genetic risk (99th percentile), should we target an ApoB < 60 mg/dL?',
          'Would a Coronary Artery Calcium (CAC) scan help quantify my actual plaque burden?',
          'Should we measure my Lipoprotein(a) and high-sensitivity CRP levels?'
        ]
      };
    } else if (modelId.includes('T2D')) {
      return {
        summary: `You carry susceptibility variants in TCF7L2 and KCNJ11, which lower the pancreas's insulin secretion capacity under high glycemic loads.`,
        actionables: [
          { title: 'Annual Metabolic Screening', desc: 'Test fasting insulin, blood glucose, and HbA1c every 6-12 months.' },
          { title: 'Resistance Training', desc: 'Build and preserve muscle mass to stimulate insulin-independent glucose uptake.' },
          { title: 'Low Glycemic Load', desc: 'Minimize refined carbohydrates and increase dietary fiber and protein.' },
        ],
        questions: [
          'Should we check a baseline HOMA-IR and fasting insulin level?',
          'What lifestyle modifications will best preserve my beta-cell function?'
        ]
      };
    } else if (modelId.includes('BRCA')) {
      return {
        summary: `Additive common non-coding polymorphisms modify baseline lifetime breast tissue estrogen sensitivity.`,
        actionables: [
          { title: 'Tailored Screening', desc: 'Discuss personalized mammography and MRI screening intervals with your physician.' },
          { title: 'Lifestyle Mitigation', desc: 'Limit alcohol consumption and maintain physical activity.' },
        ],
        questions: [
          'Does this polygenic score modify my recommended mammogram timetable?',
          'Should we integrate this score into a comprehensive risk model like Tyrer-Cuzick?'
        ]
      };
    } else if (modelId.includes('AFIB')) {
      return {
        summary: `Polygenic variant burden near PITX2 and ZFHX3 predisposes to left atrial electrical irritability under stress or hypertension.`,
        actionables: [
          { title: 'Blood Pressure Control', desc: 'Hypertension is the single largest modifiable trigger for atrial enlargement.' },
          { title: 'Sleep Apnea Check', desc: 'Screen for obstructive sleep apnea if you experience loud snoring or daytime sleepiness.' },
          { title: 'Rhythm Monitoring', desc: 'Use smartwatch ECG tools to record rhythm if you feel unexplained palpitations.' },
        ],
        questions: [
          'Should we monitor for intermittent asymptomatic atrial arrhythmias?',
          'How strictly should we manage blood pressure to protect my heart rhythm?'
        ]
      };
    } else {
      return {
        summary: `Evaluates APOE isoform variants and common regulatory loci in BIN1 and CLU influencing neural lipid clearance.`,
        actionables: [
          { title: 'Vascular Brain Health', desc: 'Controlling cardiovascular risk factors directly prevents vascular neurodegeneration.' },
          { title: 'Aerobic Exercise', desc: 'Cardiovascular fitness triggers BDNF and supports glymphatic waste clearance.' },
          { title: 'Sleep Hygiene', desc: 'Ensure 7-8 hours of quality sleep for nightly brain metabolic waste clearance.' },
        ],
        questions: [
          'What preventative lifestyle interventions best support lifelong cognitive health?',
          'Should we aggressively manage my metabolic and vascular markers?'
        ]
      };
    }
  };

  const insights = getInsights(currentResult.modelId, currentPercentile, currentResult.relativeRisk);

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Plain English Primer */}
      <div className="surface-base rounded-2xl p-6 sm:p-7 space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
            What is a Polygenic Risk Score? (In Plain English)
          </h2>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          Think of your DNA like a hand of cards dealt at birth. Instead of one single "broken gene" that causes an illness, a <strong>Polygenic Risk Score (PRS)</strong> adds up hundreds of tiny, normal genetic differences you were born with and combines them into one score.
        </p>

        <div className="surface-inset p-4 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed border border-slate-200">
          <strong className="text-slate-900 block mb-0.5 font-semibold">Key takeaway:</strong>
          Being in a high percentile does <strong>NOT</strong> mean you have a disease or are guaranteed to get sick. It just means your inherited baseline risk is higher than average. Clinical research proves that healthy daily habits (like regular exercise, nutrition, and blood pressure checks) cut your actual disease risk by approximately 50%.
        </div>
      </div>

      {/* Disease Model Selector Tabs */}
      <div className="surface-base rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
          {prsResults.map(res => {
            const isSelected = selectedModelId === res.modelId;
            return (
              <button
                key={res.modelId}
                onClick={() => {
                  setSelectedModelId(res.modelId);
                  setSelectedVariantRsid(null);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {res.traitName}
              </button>
            );
          })}
        </div>

        {/* Population Selector */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
          <span className="text-slate-600">Reference:</span>
          <select
            value={selectedPopulation}
            onChange={e => setSelectedPopulation(e.target.value)}
            className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
          >
            <option value="EUR">EUR (European)</option>
            <option value="AFR">AFR (African)</option>
            <option value="EAS">EAS (East Asian)</option>
            <option value="SAS">SAS (South Asian)</option>
            <option value="AMR">AMR (Admixed American)</option>
          </select>
        </div>
      </div>

      {/* Main Cockpit Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Radial Arc & Methodology (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Radial Arc Gauge Card */}
          <div className="surface-base rounded-2xl p-7 text-center space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-600">
              <span className="flex items-center space-x-1.5">
                <Gauge className="w-4 h-4 text-slate-800" />
                <span className="text-slate-900 font-semibold">Polygenic Risk Stratification</span>
              </span>
              <span className="text-slate-500">{currentResult.modelId}</span>
            </div>

            {/* Arc Gauge Visual */}
            <div className="relative w-60 h-44 mx-auto flex items-center justify-center mt-2">
              <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gaugeGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>

                {/* Track Arc */}
                <path
                  d="M 25 130 A 75 75 0 1 1 175 130"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {/* Value Arc */}
                <path
                  d="M 25 130 A 75 75 0 1 1 175 130"
                  fill="none"
                  stroke="url(#gaugeGradientLight)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="295"
                  strokeDashoffset={295 - (295 * (currentPercentile / 100))}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Digital Telemetry Readout */}
              <div className="absolute top-14 left-0 right-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
                  {currentPercentile}
                  <span className="text-lg text-slate-500 font-normal">%</span>
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider font-mono mt-1 ${tierStyles.text}`}>
                  {currentResult.riskTier}
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 text-center font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Relative Risk</span>
                <span className="text-sm font-bold text-slate-900">{currentResult.relativeRisk}x</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Raw Score</span>
                <span className="text-sm font-bold text-slate-900">{currentResult.rawScore.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Coverage</span>
                <span className="text-sm font-bold text-emerald-700">{currentResult.coveragePercentage}%</span>
              </div>
            </div>

            {/* Citation Link */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="truncate max-w-[200px]">{currentResult.publication}</span>
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${currentResult.pubmedId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-800 hover:underline flex items-center space-x-1 flex-shrink-0 font-semibold"
              >
                <span>PMID:{currentResult.pubmedId}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              </a>
            </div>
          </div>

          {/* Direct vs Imputed Breakdown Card */}
          <div className="surface-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-700">
              <span className="flex items-center space-x-1.5 font-bold text-slate-900">
                <Dna className="w-4 h-4 text-slate-800" />
                <span>Genotype Scoring Split</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold font-mono">
                {currentResult.reliabilityTier}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-mono block font-medium">Directly Genotyped</span>
                <span className="text-base font-mono font-bold text-emerald-700">
                  +{currentResult.observedScore.toFixed(3)}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {currentResult.observedVariantsCount} SNPs on chip
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-mono block font-medium">1000G Imputed</span>
                <span className="text-base font-mono font-bold text-slate-800">
                  +{currentResult.imputedScore.toFixed(3)}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {currentResult.imputedVariantsCount} missing SNPs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Intelligence & Prompts (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive Summary Pod */}
          <div className="surface-base rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Clinical Synthesis & Actionability
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Molecular Risk Interpretation
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${tierStyles.bg}`}>
                {currentResult.riskTier}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed surface-inset p-4 rounded-xl border border-slate-200">
              {insights.summary}
            </p>

            {/* Actionable Counter-Measures */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
                Evidence-Based Actionable Steps:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.actionables.map((act, idx) => (
                  <div
                    key={idx}
                    className="surface-card p-4 rounded-xl space-y-1.5 border border-slate-200 bg-white"
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-6">
                      {act.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Script for Physician Consultation */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <HeartHandshake className="w-4 h-4 text-slate-700" />
                  <span>Questions to Bring to Your Doctor:</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">Click to Copy</span>
              </div>

              <div className="space-y-2">
                {insights.questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopyQuestion(q, idx)}
                    className="w-full text-left p-3.5 rounded-xl surface-inset hover:bg-slate-100 transition flex items-center justify-between group font-mono text-xs text-slate-800 border border-slate-200"
                  >
                    <span className="pr-4">{q}</span>
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 flex items-center justify-center flex-shrink-0 transition">
                      {copiedQuestionIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Variant Matrix Chips */}
          <div className="surface-base rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-800 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <span>Genotyped Variant Architecture ({currentResult.variantBreakdown.length} SNPs)</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">Click SNP to inspect</span>
            </div>

            {/* Variant Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {currentResult.variantBreakdown.map(v => {
                const isSelected = selectedVariantRsid === v.rsid;
                return (
                  <button
                    key={v.rsid}
                    onClick={() => setSelectedVariantRsid(isSelected ? null : v.rsid)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center space-x-2 border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span className={isSelected ? 'text-white font-bold' : 'text-slate-900 font-bold'}>{v.rsid}</span>
                    <span className={`text-xs px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {v.gene}
                    </span>
                    <span className={`text-xs font-bold ${
                      v.contribution > 0 
                        ? (isSelected ? 'text-rose-300' : 'text-rose-600') 
                        : (isSelected ? 'text-slate-400' : 'text-slate-400')
                    }`}>
                      {v.contribution > 0 ? `+${v.contribution}` : '0.00'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected SNP Drawer */}
            {selectedVariantRsid && (() => {
              const v = currentResult.variantBreakdown.find(item => item.rsid === selectedVariantRsid);
              if (!v) return null;
              return (
                <div className="mt-4 p-5 rounded-xl surface-inset space-y-3 border border-slate-200 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-sm font-bold text-slate-900">{v.rsid}</span>
                      <span className="text-xs text-slate-500">({v.gene})</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800 font-bold">
                        {v.consequence}
                      </span>
                    </div>

                    <a
                      href={`https://www.ncbi.nlm.nih.gov/snp/${v.rsid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-900 hover:underline flex items-center space-x-1 font-mono font-semibold"
                    >
                      <span>NCBI dbSNP</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {v.biologicalMechanism}
                  </p>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs pt-2 border-t border-slate-200">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">Genotype</span>
                      <span className="font-bold text-amber-700">{v.genotype}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">Effect</span>
                      <span className="font-bold text-slate-900">{v.effectAllele}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">Weight</span>
                      <span className="font-bold text-slate-700">+{v.weight}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">Score Add</span>
                      <span className="font-bold text-rose-600">+{v.contribution}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
