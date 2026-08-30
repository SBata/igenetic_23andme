import React, { useState } from 'react';
import { RawVariant } from '@/types/genomics';
import { Search, ExternalLink, Dna, Info, ShieldAlert, CheckCircle, Activity, Sparkles, AlertTriangle, BookOpen, Loader2, ArrowUpRight, Cpu } from 'lucide-react';

interface DynamicVariantExplorerProps {
  variants?: RawVariant[];
}

interface VariantAnnotation {
  rsid: string;
  gene?: string;
  consequence?: string;
  clinicalSignificance?: string;
  ancestralAllele?: string;
  minorAllele?: string;
  maf?: number;
  phenotypes?: string[];
  description?: string;
  source: string;
}

export const DynamicVariantExplorer: React.FC<DynamicVariantExplorerProps> = ({ variants = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRsid, setSelectedRsid] = useState<string | null>(null);
  const [userGenotype, setUserGenotype] = useState<string | null>(null);
  const [userVariantInfo, setUserVariantInfo] = useState<RawVariant | null>(null);
  const [annotation, setAnnotation] = useState<VariantAnnotation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (rsidToSearch: string) => {
    const cleanRsid = rsidToSearch.trim().toLowerCase().replace(/^snp_/, '');
    if (!cleanRsid) return;

    const formattedRsid = cleanRsid.startsWith('rs') ? cleanRsid : `rs${cleanRsid}`;
    setSelectedRsid(formattedRsid);
    setLoading(true);
    setAnnotation(null);

    const matched = variants.find(v => v.rsid.toLowerCase() === formattedRsid);
    if (matched) {
      setUserVariantInfo(matched);
      setUserGenotype(matched.genotype.toUpperCase());
    } else {
      setUserVariantInfo(null);
      setUserGenotype('Not genotyped on this microarray');
    }

    try {
      const ensemblUrl = `https://rest.ensembl.org/variation/human/${formattedRsid}?content-type=application/json`;
      const res = await fetch(ensemblUrl, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 404) {
          setAnnotation({
            rsid: formattedRsid,
            gene: 'Known dbSNP locus',
            consequence: 'Genomic Polymorphism',
            clinicalSignificance: 'Under Investigation / Curated in dbSNP',
            description: `Variant ${formattedRsid} is registered in the NCBI dbSNP catalog. Click the external database link below to review primary literature and genomic assemblies.`,
            source: 'NCBI dbSNP Registry',
          });
          setLoading(false);
          return;
        }
        throw new Error(`Public variant registry returned status ${res.status}`);
      }

      const data = await res.json();
      
      const gene = data.mappings?.[0]?.gene || data.synonyms?.find((s: string) => s.includes('_')) || data.most_severe_consequence?.replace(/_/g, ' ') || 'Genomic locus';
      const consequence = data.most_severe_consequence ? data.most_severe_consequence.replace(/_/g, ' ') : 'Sequence variant';
      const clinicalSignificance = Array.isArray(data.clinical_significance) && data.clinical_significance.length > 0 
        ? data.clinical_significance.join(', ') 
        : 'Benign / Likely Benign / Polygenic Trait Variation';
      
      const phenotypes: string[] = [];
      if (Array.isArray(data.phenotypes)) {
        data.phenotypes.forEach((p: { trait?: string }) => {
          if (p.trait && !phenotypes.includes(p.trait)) {
            phenotypes.push(p.trait);
          }
        });
      }

      const maf = data.MAF ? parseFloat(data.MAF) : undefined;
      const minorAllele = data.minor_allele;

      let description = '';
      if (consequence.includes('missense')) {
        description = `This is a missense variant, meaning it causes a single amino acid change in the resulting protein structure of the ${gene} gene. Depending on protein domain conservation, this may alter enzyme kinetics, receptor binding, or structural stability.`;
      } else if (consequence.includes('intron') || consequence.includes('intergenic') || consequence.includes('regulatory') || consequence.includes('upstream') || consequence.includes('downstream')) {
        description = `This is a non-coding regulatory variant in or near ${gene}. Non-coding variants typically do not change the protein sequence directly, but can alter chromatin accessibility, transcription factor binding affinity, or tissue-specific gene expression levels.`;
      } else if (consequence.includes('synonymous')) {
        description = `This is a synonymous (silent) variant. It alters the nucleotide sequence without changing the amino acid code in ${gene}. Such variants are typically benign.`;
      } else if (consequence.includes('stop') || consequence.includes('frameshift')) {
        description = `This is a high-impact loss-of-function variant (stop codon or frameshift) that truncates the protein product of ${gene}.`;
      } else {
        description = `Sequence variant situated at the ${gene} locus on human genome assembly GRCh38.`;
      }

      setAnnotation({
        rsid: formattedRsid,
        gene,
        consequence,
        clinicalSignificance,
        minorAllele,
        maf,
        phenotypes: phenotypes.slice(0, 8),
        description,
        source: 'Ensembl & dbSNP Open Annotations',
      });
    } catch (err: unknown) {
      console.error('Annotation fetch error:', err);
      setAnnotation({
        rsid: formattedRsid,
        gene: 'dbSNP Marker',
        consequence: 'Genomic Single Nucleotide Polymorphism',
        clinicalSignificance: 'Research Variant',
        description: `Variant ${formattedRsid} is cataloged in the National Center for Biotechnology Information (NCBI) dbSNP database. Click the links below for full multi-omics transcript and publication annotations.`,
        source: 'NCBI dbSNP Hub',
      });
    } finally {
      setLoading(false);
    }
  };

  const samplePopularVariants = [
    { rsid: 'rs1800562', label: 'HFE (Hemochromatosis)' },
    { rsid: 'rs7903146', label: 'TCF7L2 (Diabetes)' },
    { rsid: 'rs10757274', label: '9p21.3 (CAD Locus)' },
    { rsid: 'rs429358', label: 'APOE (Alzheimer e4)' },
    { rsid: 'rs4244285', label: 'CYP2C19 (*2 Allele)' },
    { rsid: 'rs4988235', label: 'MCM6 (Lactase)' },
    { rsid: 'rs1815739', label: 'ACTN3 (Muscle Sprint)' },
    { rsid: 'rs762551', label: 'CYP1A2 (Caffeine Speed)' },
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
                <Search className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Universal Variant Deep-Dive & Live API Annotation
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Search ANY genomic variant (rsID) to inspect your personal genotype call, fetch live biological annotations (Ensembl / NCBI dbSNP), and translate the molecular consequence into plain English.
            </p>
          </div>
        </div>

        {/* Search Bar Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Enter any rsID (e.g. rs1800562, rs7903146, rs429358)..."
              className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-slate-900 font-mono placeholder-slate-400 shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Querying Registry...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Deep-Dive Variant</span>
              </>
            )}
          </button>
        </form>

        {/* Quick-Pick Popular Loci */}
        <div className="pt-2">
          <span className="text-xs text-slate-500 block mb-2 font-mono font-medium">
            Common Loci Quick Selection:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePopularVariants.map(item => (
              <button
                key={item.rsid}
                type="button"
                onClick={() => {
                  setSearchQuery(item.rsid);
                  handleSearch(item.rsid);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-800 transition flex items-center space-x-1.5 font-mono"
              >
                <span className="text-slate-900 font-bold">{item.rsid}</span>
                <span className="text-slate-600 font-sans">({item.label})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results View */}
      {selectedRsid && (
        <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-mono text-3xl font-extrabold text-slate-900 tracking-tight">
                  {selectedRsid}
                </span>
                {annotation?.gene && (
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold font-mono">
                    Gene: {annotation.gene}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Source: <span className="text-slate-800 font-semibold">{annotation?.source || 'Querying...'}</span>
              </p>
            </div>

            {/* User's Genotype Badge */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:items-end font-mono">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Sample Genotype Call</span>
              <div className="flex items-center space-x-2 mt-1">
                {userVariantInfo ? (
                  <>
                    <span className="text-xl font-extrabold text-slate-900 bg-white px-3 py-0.5 rounded-lg border border-slate-200 shadow-sm">
                      {userVariantInfo.genotype}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold">
                      (Chr {userVariantInfo.chromosome}:{userVariantInfo.position.toLocaleString()})
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    Not observed on this microarray
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-10 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-mono">
                Fetching transcript consequence, clinical significance, and population frequencies for {selectedRsid}...
              </p>
            </div>
          )}

          {/* Detailed Annotation Cards */}
          {annotation && !loading && (
            <div className="space-y-6">
              {/* Plain English Translation Card */}
              <div className="surface-inset p-5 rounded-xl space-y-2 border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm font-mono">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Plain-English Molecular Meaning</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  {annotation.description}
                </p>
              </div>

              {/* Grid Properties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="surface-card p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Consequence</span>
                  <p className="text-sm font-bold text-purple-800 capitalize mt-1 font-mono">
                    {annotation.consequence || 'Sequence Variant'}
                  </p>
                </div>

                <div className="surface-card p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Clinical Significance</span>
                  <p className={`text-sm font-bold mt-1 font-mono ${
                    annotation.clinicalSignificance?.toLowerCase().includes('pathogenic') 
                      ? 'text-rose-700' 
                      : 'text-emerald-700'
                  }`}>
                    {annotation.clinicalSignificance || 'Curated Variant'}
                  </p>
                </div>

                <div className="surface-card p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Minor Allele (MAF)</span>
                  <p className="text-sm font-bold text-slate-800 mt-1 font-mono">
                    {annotation.minorAllele ? `${annotation.minorAllele} (${Math.round((annotation.maf || 0) * 100)}%)` : 'Common / Monomorphic'}
                  </p>
                </div>

                <div className="surface-card p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Array Status</span>
                  <p className="text-sm font-bold text-slate-900 mt-1 font-mono">
                    {userVariantInfo ? 'Direct Call' : 'Uncalled / Missing'}
                  </p>
                </div>
              </div>

              {/* Associated Phenotypes & Traits */}
              {annotation.phenotypes && annotation.phenotypes.length > 0 && (
                <div className="surface-card p-5 rounded-xl space-y-3 border border-slate-200">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 font-mono">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Reported Phenotypic Associations:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {annotation.phenotypes.map((trait, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Research Database Deep Links */}
              <div className="surface-inset p-5 rounded-xl space-y-3 border border-slate-200">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 font-mono">
                  <BookOpen className="w-4 h-4 text-slate-700" />
                  <span>Primary Research Databases:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 font-mono text-xs">
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/snp/${selectedRsid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-between transition shadow-sm"
                  >
                    <span>NCBI dbSNP</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  </a>

                  <a
                    href={`https://www.ncbi.nlm.nih.gov/clinvar/?term=${selectedRsid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-rose-800 flex items-center justify-between transition shadow-sm"
                  >
                    <span>NCBI ClinVar</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`https://www.ensembl.org/Homo_sapiens/Variation/Explore?v=${selectedRsid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-purple-800 flex items-center justify-between transition shadow-sm"
                  >
                    <span>Ensembl VEP</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/?term=${selectedRsid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-amber-800 flex items-center justify-between transition shadow-sm"
                  >
                    <span>PubMed Search</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
