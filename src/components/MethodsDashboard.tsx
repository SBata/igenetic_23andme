import React from 'react';
import { 
  BookOpen, 
  Dna, 
  Activity, 
  ShieldCheck, 
  HelpCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers, 
  Pill, 
  TrendingUp, 
  FileText, 
  Binary,
  Cpu,
  Lock,
  ExternalLink
} from 'lucide-react';

export const MethodsDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Scientific Methodology & Algorithmic Architecture
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">
              Mathematical formulations, CPIC guidelines, imputation protocols, and differences from direct-to-consumer apps
            </p>
          </div>
        </div>
      </div>

      {/* Comparison: iGenetic vs Standard 23andMe App */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-5 border border-slate-200 bg-white">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
          <Layers className="w-5 h-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            Why Re-Analyze? (iGenetic vs. Standard 23andMe App)
          </h2>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          Direct-to-consumer (DTC) genetic testing platforms like 23andMe operate under stringent <strong>FDA 510(k) / Premarket Approval</strong> regulatory constraints. To achieve mass-market clearance, their consumer app is legally restricted from showing polygenic risk scores across unapproved common diseases, full star-allele drug dosing protocols, or comprehensive carrier annotations across adult-onset conditions.
        </p>

        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-mono text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Analysis Dimension</th>
                <th className="p-3.5">Standard 23andMe App</th>
                <th className="p-3.5 bg-slate-900 text-white">iGenetic Research Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="p-3.5 font-bold text-slate-900">Polygenic Risk Scores (PRS)</td>
                <td className="p-3.5 text-slate-500">Limited to select traits behind subscription paywalls; opaque proprietary black-box algorithms.</td>
                <td className="p-3.5 font-medium bg-slate-50 text-slate-900">
                  Full multi-ancestry PGS Catalog models with explicit log-odds weights, 1000 Genomes imputation, and Z-score distributions.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900">Pharmacogenomics (PGx)</td>
                <td className="p-3.5 text-slate-500">Only 2–3 FDA-cleared genes (e.g. CYP2C19) with restricted high-level descriptions.</td>
                <td className="p-3.5 font-medium bg-slate-50 text-slate-900">
                  Full CPIC Level A/B star-allele calling across CYP2C19, SLCO1B1, VKORC1, and DPYD with clinical actionability guidelines.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900">ClinVar Pathogenic Mutations</td>
                <td className="p-3.5 text-slate-500">Hidden or filtered out due to FDA monogenic liability regulations.</td>
                <td className="p-3.5 font-medium bg-slate-50 text-slate-900">
                  Surgically queries 2+ star peer-reviewed ClinVar mutations with clear asymptomatic carrier vs. affected status.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900">Universal Variant Search</td>
                <td className="p-3.5 text-slate-500">Raw Data viewer shows only base letters (e.g. "AA") with zero biological interpretation.</td>
                <td className="p-3.5 font-medium bg-slate-50 text-slate-900">
                  Live Ensembl & NCBI dbSNP REST integration translating ANY typed rsID into transcript consequence, MAF, and literature.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900">Data Privacy & Airgap</td>
                <td className="p-3.5 text-slate-500">Data stored on corporate cloud servers subject to commercial terms.</td>
                <td className="p-3.5 font-medium bg-slate-50 text-emerald-800 font-semibold">
                  100% Zero-Knowledge in-browser Web Workers. DNA never leaves device RAM.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 1: Polygenic Risk Scores Methodology */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 bg-white">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
          <TrendingUp className="w-5 h-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            1. Polygenic Risk Score (PRS) Calculation Protocol
          </h2>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Polygenic Risk Scores aggregate the cumulative effects of hundreds of common Single Nucleotide Polymorphisms (SNPs) across the genome, each contributing a small, additive change to baseline disease susceptibility.
          </p>

          {/* Mathematical Formula Box */}
          <div className="surface-inset p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 font-mono text-xs uppercase tracking-wider">
              A. Log-Additive Raw Score Formulation:
            </h3>
            <div className="p-4 rounded-lg bg-white border border-slate-200 font-mono text-xs sm:text-sm text-slate-900 text-center overflow-x-auto">
              PRS_raw = ∑ (β_j · G_j) [j ∈ Observed] + ∑ (β_k · 2 · f_k) [k ∈ Missing]
            </div>
            <p className="text-xs text-slate-600">
              Where <strong>G_j ∈ {'{0, 1, 2}'}</strong> is the individual's count of effect alleles at directly genotyped variant <em>j</em>, <strong>β_j</strong> is the per-allele effect size (log odds ratio ln(OR) or regression beta) derived from discovery GWAS, and <strong>f_k</strong> is the population reference effect-allele frequency from the <strong>1000 Genomes Project (Phase 3)</strong> used to impute missing microarray probes.
            </p>
          </div>

          {/* Z-Score and Percentile Box */}
          <div className="surface-inset p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 font-mono text-xs uppercase tracking-wider">
              B. Population Standardization & Percentile Mapping:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-center">
                <span className="text-slate-500 block mb-1">Standardized Z-Score</span>
                <strong className="text-slate-900 text-sm">Z = (PRS_raw - μ_pop) / σ_pop</strong>
              </div>
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-center">
                <span className="text-slate-500 block mb-1">Percentile Rank</span>
                <strong className="text-slate-900 text-sm">Percentile = Φ(Z) × 100</strong>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Where <strong>μ_pop</strong> and <strong>σ_pop</strong> are the ancestry-matched reference distribution parameters (EUR, AFR, EAS, SAS, AMR) from the 1000 Genomes cohort, and <strong>Φ(Z)</strong> is the cumulative distribution function (CDF) of the standard normal distribution calculated via the Chebyshev polynomial error function approximation.
            </p>
          </div>

          {/* Risk Tiers */}
          <div className="surface-inset p-5 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 font-mono text-xs uppercase tracking-wider">
              C. Clinical Risk Stratification Thresholds:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold block text-sm">≥ 90th %ile</span>
                <span className="text-[11px]">Significantly Elevated</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold block text-sm">75th – 89th %ile</span>
                <span className="text-[11px]">Elevated Risk</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="font-bold block text-sm">25th – 74th %ile</span>
                <span className="text-[11px]">Average Population Risk</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-900">
                <span className="font-bold block text-sm">&lt; 25th %ile</span>
                <span className="text-[11px]">Below Average Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Pharmacogenomics Star-Allele Calling */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 bg-white">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
          <Pill className="w-5 h-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            2. Pharmacogenomic (PGx) Star-Allele Calling & Dosing
          </h2>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            iGenetic translates observed SNP genotypes in key phase I/II drug-metabolizing enzymes and transporters into standard star (*)-allele diplotypes following guidelines from the <strong>Clinical Pharmacogenetics Implementation Consortium (CPIC)</strong> and <strong>PharmGKB</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="surface-inset p-4 rounded-xl border border-slate-200 space-y-2">
              <strong className="text-slate-900 font-bold font-mono text-sm block">CYP2C19 (Clopidogrel & Antidepressants)</strong>
              <p className="text-slate-600">
                Calls *1 (wild type), *2 (rs4244285 loss-of-function 681G&gt;A), *3 (rs4986893 stop codon), and *17 (rs12248560 promoter gain-of-function -806C&gt;T). Sums activity scores to categorize Poor (0), Intermediate (0.5–1.0), Normal (1.5–2.0), Rapid (2.5), or Ultra-Rapid (3.0) metabolizers.
              </p>
            </div>

            <div className="surface-inset p-4 rounded-xl border border-slate-200 space-y-2">
              <strong className="text-slate-900 font-bold font-mono text-sm block">SLCO1B1 (Statin Myopathy Risk)</strong>
              <p className="text-slate-600">
                Calls the *5 allele (rs4149056 521T&gt;C Val174Ala). Carrying 1 or 2 copies reduces hepatic OATP1B1 transporter function, causing elevated systemic statin concentrations (Simvastatin / Atorvastatin) and significantly increasing risk of statin-induced rhabdomyolysis and myopathy.
              </p>
            </div>

            <div className="surface-inset p-4 rounded-xl border border-slate-200 space-y-2">
              <strong className="text-slate-900 font-bold font-mono text-sm block">VKORC1 (Warfarin Sensitivity)</strong>
              <p className="text-slate-600">
                Calls the -1639G&gt;A promoter polymorphism (rs9923231). The 'A' allele reduces VKORC1 enzyme transcription, requiring significantly lower maintenance warfarin doses to avoid life-threatening bleeding episodes.
              </p>
            </div>

            <div className="surface-inset p-4 rounded-xl border border-slate-200 space-y-2">
              <strong className="text-slate-900 font-bold font-mono text-sm block">DPYD (Fluoropyrimidine Toxicity)</strong>
              <p className="text-slate-600">
                Screens for DPYD *2A (rs3918290 c.1905+1G&gt;A splice site) and c.2846A&gt;T (rs67376798). Deficiency in dihydropyrimidine dehydrogenase causes lethal systemic accumulation of 5-Fluorouracil (5-FU) and Capecitabine chemotherapy agents.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: ClinVar Pathogenic Variant Filtration */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 bg-white">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
          <ShieldCheck className="w-5 h-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            3. ClinVar Mutation Screening & Carrier Disambiguation
          </h2>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Direct-to-consumer microarrays have documented false-positive rates on rare mutations. To eliminate false alarms, iGenetic applies two strict computational filters:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="surface-inset p-4 rounded-xl border border-slate-200 space-y-2">
              <strong className="text-slate-900 font-bold font-mono block">1. Strict ≥2 Star Review Consensus</strong>
              <p className="text-slate-600">
                Only variants with 2+ stars in the NIH ClinVar database are evaluated. This guarantees that findings have consensus across multiple major clinical genetic testing laboratories, expert panels (e.g. ClinGen), or published clinical practice guidelines with zero conflicting interpretations.
              </p>
            </div>

            <div className="surface-inset p-4 rounded-xl border border-slate-200 space-y-2">
              <strong className="text-slate-900 font-bold font-mono block">2. Autosomal Recessive Carrier Disambiguation</strong>
              <p className="text-slate-600">
                Most pathogenic variants in general populations (such as <em>HFE</em> C282Y Hemochromatosis or <em>SERPINA1</em> Pi*Z) are autosomal recessive. Carrying 1 copy means you are an <strong>asymptomatic healthy carrier</strong> and not sick. iGenetic clearly distinguishes carrier status from active disease to prevent unwarranted alarm.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Sample QC and Assembly Harmonization */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 bg-white">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
          <Binary className="w-5 h-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            4. Microarray QC Audit & Assembly Liftover
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="surface-card p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <strong className="text-slate-900 font-bold font-mono block">Ti / Tv Transition Ratio</strong>
            <p className="text-slate-600">
              Evaluates the ratio of Transitions (A↔G, C↔T) to Transversions (A↔C, A↔T, C↔G, G↔T). Whole-genome microarrays should exhibit a Ti/Tv of ~2.05–2.20. Skewed ratios flag batch hybridization or barcode reading errors.
            </p>
          </div>

          <div className="surface-card p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <strong className="text-slate-900 font-bold font-mono block">Probe Call Rate</strong>
            <p className="text-slate-600">
              Calculates the percentage of array probes yielding a clean diploid call vs. uncalled ('--' or '00') markers. Samples with call rates below 98.0% are flagged for DNA degradation or low input concentration.
            </p>
          </div>

          <div className="surface-card p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <strong className="text-slate-900 font-bold font-mono block">GRCh38 Liftover Harmonization</strong>
            <p className="text-slate-600">
              Older 23andMe files (v2/v3/v4) are anchored to NCBI36 or GRCh37. iGenetic detects header signatures and dynamically maps probe rsIDs to current canonical GRCh38 (hg38) chromosomal coordinates.
            </p>
          </div>
        </div>
      </div>

      {/* References & Primary Literature */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200 bg-white">
        <h2 className="text-base font-bold text-slate-900">
          Primary Scientific References & Data Sources
        </h2>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
          <li><strong>PGS Catalog:</strong> Polygenic Score (PGS) Catalog — EMBL-EBI & University of Cambridge (<a href="https://www.pgscatalog.org/" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline">pgscatalog.org</a>).</li>
          <li><strong>CPIC Guidelines:</strong> Clinical Pharmacogenetics Implementation Consortium (<a href="https://cpicpgx.org/" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline">cpicpgx.org</a>) / PharmGKB (<a href="https://www.pharmgkb.org/" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline">pharmgkb.org</a>).</li>
          <li><strong>NIH ClinVar:</strong> National Center for Biotechnology Information (NCBI) ClinVar database (<a href="https://www.ncbi.nlm.nih.gov/clinvar/" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline">ncbi.nlm.nih.gov/clinvar</a>).</li>
          <li><strong>1000 Genomes Project:</strong> 1000 Genomes Project Consortium (Phase 3) multi-ancestry allele frequency distributions.</li>
          <li><strong>Ensembl REST API:</strong> EMBL-EBI Ensembl Human Variation Database (Release 110, GRCh38).</li>
        </ul>
      </div>
    </div>
  );
};
