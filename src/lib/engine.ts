import type { FullAnalysisResult, GenotypeSampleQC, PRSResult, RawVariant, VariantObservation } from '@/types/genomics';
import { CURATED_PGX_GENES } from './referenceData/pgx';
import { reference, scoreVariants } from './scoring';
import { CURATED_GWAS_TRAITS } from './referenceData/gwas';
import { isCalledGenotype } from './qc';

export const SCORE_UNAVAILABLE_REASON = 'The raw score sums effect-allele dosage times published weight. A partial subtotal excludes missing or incompatible calls; it is not the complete model score. Neither is a probability or population percentile.';

export function runFullGenomicAnalysis(variants: RawVariant[], qc: GenotypeSampleQC): FullAnalysisResult {
  const variantMap = new Map<string, RawVariant>();
  const chromosomeDensity: FullAnalysisResult['chromosomeDensity'] = {};
  for (const variant of variants) {
    const id = variant.rsid.toLowerCase();
    if (variantMap.has(id)) throw new Error(`Duplicate marker ${id}. Use a single, unmodified export.`);
    variantMap.set(id, variant);
    const chr = variant.chromosome.toUpperCase().replace(/^CHR/, '');
    chromosomeDensity[chr] ??= { variantCount: 0, actionableHits: 0 };
    chromosomeDensity[chr].variantCount++;
  }

  const observe = (rsid: string): VariantObservation => {
    const variant = variantMap.get(rsid.toLowerCase());
    return {
      rsid,
      genotype: variant?.genotype ?? null,
      status: !variant ? 'missing' : isCalledGenotype(variant.genotype, variant.chromosome) ? 'observed' : 'uncalled',
    };
  };

  const calculation = scoreVariants(variantMap, qc.detectedBuild);
  const prs: PRSResult[] = [{
      modelId: reference.id,
      traitName: reference.trait,
      category: 'Oncology',
      source: reference.url,
      citation: reference.citation,
      sourceFiles: reference.sources,
      contributions: calculation.contributions,
      status: calculation.score !== null ? 'complete' : calculation.subtotal !== null ? 'partial' : 'unavailable',
      reason: SCORE_UNAVAILABLE_REASON,
      rawScore: calculation.score,
      observedScore: calculation.subtotal,
      imputedScore: null,
      totalVariantsInModel: reference.variants.length,
      observedVariantsCount: calculation.observedCount,
      imputedVariantsCount: 0,
      coveragePercentage: calculation.observedCount / reference.variants.length * 100,
      reliabilityTier: 'Unvalidated',
      percentiles: {},
      relativeRisk: null,
      riskTier: 'Unavailable',
      variantBreakdown: reference.variants.map(marker => observe(marker.rsid)),
    }];

  return {
    schemaVersion: 3,
    isDemo: false,
    clinicalStatus: 'unavailable',
    qc,
    prs,
    pgx: CURATED_PGX_GENES.map(gene => ({
      gene: gene.gene,
      status: 'unavailable',
      reason: 'A small unphased marker panel cannot establish a complete star-allele diplotype. Missing markers do not establish normal function.',
      diplotype: 'Not determined',
      phenotype: 'Indeterminate',
      drugs: [],
      detectedVariants: [],
      observations: gene.variants.map(rule => observe(rule.rsid)),
    })),
    // Allele orientation, accessions and condition-specific classifications require re-curation.
    clinvar: [],
    gwas: CURATED_GWAS_TRAITS.flatMap(trait => {
      const observation = observe(trait.rsid);
      if (observation.status !== 'observed') return [];
      return [{
        rsid: trait.rsid,
        gene: trait.gene,
        trait: trait.trait,
        patientGenotype: observation.genotype!,
        userInterpretation: trait.summary,
        source: trait.source,
      }];
    }),
    chromosomeDensity,
    rawVariants: variants,
    analyzedAt: new Date().toISOString(),
  };
}
