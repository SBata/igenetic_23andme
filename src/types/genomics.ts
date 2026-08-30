export type Build = 'GRCh37' | 'GRCh38';

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
  titvRatio: number;
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
  modelId: string;
  traitName: string;
  category: string;
  publication: string;
  pubmedId: string;
  rawScore: number;
  observedScore: number;
  imputedScore: number;
  totalVariantsInModel: number;
  observedVariantsCount: number;
  imputedVariantsCount: number;
  coveragePercentage: number;
  reliabilityTier: 'High' | 'Moderate' | 'Caution - Low Coverage';
  percentiles: {
    [population: string]: number;
  };
  relativeRisk: number;
  riskTier: 'Below Average' | 'Average' | 'Elevated' | 'Significantly Elevated';
  variantBreakdown: {
    rsid: string;
    gene: string;
    consequence: string;
    biologicalMechanism: string;
    genotype: string;
    effectAllele: string;
    weight: number;
    isObserved: boolean;
    imputedValue?: number;
    contribution: number;
  }[];
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

export interface GWASTraitResult extends GWASTrait {
  patientGenotype: string;
  userInterpretation: string;
  hasEffectAllele: boolean;
}

export interface FullAnalysisResult {
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
