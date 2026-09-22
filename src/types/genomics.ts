export type Build = 'NCBI36' | 'GRCh37' | 'GRCh38' | 'Unknown';

export type ChipVersion = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'Unknown';

export interface RawVariant {
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string;
}

export interface GenotypeSampleQC {
  totalVariants: number;
  validAutosomalCalls: number;
  sexChromosomeCalls: number;
  mitochondrialCalls: number;
  noCallCount: number;
  callRate: number; // percentage (0 - 100)
  heterozygousCount: number;
  homozygousCount: number;
  hetHomRatio: number;
  transitionsCount: number;
  transversionsCount: number;
  titvRatio: number | null;
  detectedChip: ChipVersion;
  detectedBuild: Build;
  parsedAt: string;
  fileName: string;
  fileSizeBytes: number;
}

export interface HarmonizedVariant {
  rsid: string;
  chr: string;
  posGRCh38: number;
  genotype: string;
  allele1: string;
  allele2: string;
  isHeterozygous: boolean;
  isHomozygousRef?: boolean;
}

// Pharmacogenomics (PGx) Types
export type MetabolizerStatus = 
  | 'Ultra-Rapid Metabolizer'
  | 'Rapid Metabolizer'
  | 'Normal Metabolizer'
  | 'Intermediate Metabolizer'
  | 'Poor Metabolizer'
  | 'Indeterminate';

export interface PGxGeneReport {
  status: 'unavailable';
  reason: string;
  observations: VariantObservation[];
  gene: string;
  diplotype: string;
  phenotype: MetabolizerStatus;
  activityScore?: number;
  drugs: PGxDrugRecommendation[];
  detectedVariants: {
    rsid: string;
    starAllele: string;
    genotype: string;
    definition: string;
  }[];
}

export interface PGxDrugRecommendation {
  drugName: string;
  therapeuticArea: 'Cardiology' | 'Oncology' | 'Psychiatry' | 'Pain & Anesthesia' | 'Immunology' | 'Infectious Disease';
  cpicLevel: 'A' | 'B';
  clinicalSummary: string;
  recommendation: string;
  guidelineUrl: string;
}

// Polygenic Risk Score (PRS) Types
export interface PRSCatalogModel {
  id: string;
  traitName: string;
  category: 'Cardiovascular' | 'Metabolic' | 'Oncology' | 'Neurology' | 'Immune';
  publication: string;
  pubmedId: string;
  referenceWeights: {
    rsid: string;
    chr: string;
    pos: number;
    gene: string;
    consequence: string;
    biologicalMechanism: string;
    effectAllele: string;
    otherAllele: string;
    weight: number;
    referenceAlleleFreqEUR: number;
  }[];
  populationStats: {
    [population in 'EUR' | 'AFR' | 'EAS' | 'SAS' | 'AMR']: {
      mean: number;
      sd: number;
    };
  };
}

export interface PRSResult {
  description: string;
  weightType: string;
  effectMeasure: string;
  status: 'complete' | 'partial' | 'unavailable';
  reason: string;
  modelId: string;
  traitName: string;
  category: string;
  rawScore: number | null;
  observedScore: number | null;
  contributions: import('../lib/scoring').Contribution[];
  source: string;
  citation: string;
  sourceFiles: { build: string; filename: string; sha256: string }[];
  imputedScore: null;
  totalVariantsInModel: number;
  observedVariantsCount: number;
  imputedVariantsCount: number;
  coveragePercentage: number;
  reliabilityTier: 'Unvalidated';
  percentiles: {
    [population: string]: number;
  };
  relativeRisk: null;
  riskTier: 'Unavailable';
  variantBreakdown: VariantObservation[];
}

export interface VariantObservation {
  rsid: string;
  genotype: string | null;
  status: 'observed' | 'missing' | 'uncalled';
}

// ClinVar Types
export interface ClinVarRecord {
  rsid: string;
  gene: string;
  variantDescription: string;
  clinicalSignificance: 'Pathogenic' | 'Likely Pathogenic' | 'Pathogenic/Likely Pathogenic';
  reviewStars: number; // >= 2
  reviewStatus: string;
  associatedCondition: string;
  acmgClassification?: 'Tier 1' | 'Tier 2' | 'ACMG Secondary Finding';
  pubmedIds: string[];
  clinvarId: string;
  riskAllele: string;
}

export interface ClinVarFinding extends ClinVarRecord {
  patientGenotype: string;
  patientAlleles: string[];
  copiesOfRiskAllele: number;
}

// GWAS Trait Types
export interface GWASTrait {
  rsid: string;
  trait: string;
  category: 'Nutrition & Diet' | 'Physical Traits' | 'Sleep & Chronotype' | 'Fitness & Performance' | 'Metabolism';
  gene: string;
  effectAllele: string;
  effectSize: string;
  pValue: number;
  pubmedId: string;
  studyTitle: string;
  interpretationSummary: {
    [genotype: string]: string;
  };
}

export interface GWASTraitResult {
  source: string;
  rsid: string;
  gene: string;
  trait: string;
  patientGenotype: string;
  userInterpretation: string;
}

export interface FullAnalysisResult {
  schemaVersion: 3;
  isDemo: boolean;
  clinicalStatus: 'unavailable';
  qc: GenotypeSampleQC;
  pgx: PGxGeneReport[];
  prs: PRSResult[];
  clinvar: ClinVarFinding[];
  gwas: GWASTraitResult[];
  chromosomeDensity: {
    [chr: string]: {
      variantCount: number;
      actionableHits: number;
    };
  };
  rawVariants?: RawVariant[];
  analyzedAt: string;
}
