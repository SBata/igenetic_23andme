import type { Build, RawVariant } from '../types/genomics';
import reference from './referenceData/score.json';
import additionalModels from './referenceData/additional-scores.json';

export const scoreModels = [{ ...reference, category: 'Oncology', effectMeasure: 'log-odds', description: 'Published 77-variant common-variant model. This is not a BRCA1/BRCA2 mutation screen.' }, ...additionalModels];

export interface ScoreVariant {
  rsid: string;
  chromosome: string;
  positions: { GRCh37: number; GRCh38: number };
  effectAllele: string;
  otherAllele: string;
  weight: number;
  gene: string;
  strandAmbiguous?: boolean;
  referenceIssue?: string;
}
export type Contribution = ScoreVariant & {
  genotype: string | null;
  status: 'scored' | 'missing' | 'uncalled' | 'unsupported-build' | 'coordinate-mismatch' | 'allele-mismatch' | 'ambiguous-strand' | 'unresolved-reference';
  dosage: number | null;
  contribution: number | null;
};

export function scoreVariants(variants: Map<string, RawVariant>, build: Build, model: ScoreVariant[] = reference.variants) {
  const ids = new Set<string>();
  const contributions: Contribution[] = model.map(marker => {
    if (ids.has(marker.rsid) || !Number.isFinite(marker.weight) || (!marker.referenceIssue && (marker.effectAllele === marker.otherAllele || !/^[ACGT]$/.test(marker.effectAllele) || !/^[ACGT]$/.test(marker.otherAllele)))) throw new Error('Invalid or duplicate scoring marker.');
    ids.add(marker.rsid);
    const call = variants.get(marker.rsid);
    let status: Contribution['status'] = 'scored';
    if (!call) status = 'missing';
    else if (marker.referenceIssue) status = 'unresolved-reference';
    else if (build !== 'GRCh37' && build !== 'GRCh38') status = 'unsupported-build';
    else if (call.chromosome !== marker.chromosome || call.position !== marker.positions[build]) status = 'coordinate-mismatch';
    else if (!/^[ACGT]{2}$/.test(call.genotype)) status = 'uncalled';
    else if ([...call.genotype].some(allele => allele !== marker.effectAllele && allele !== marker.otherAllele)) status = 'allele-mismatch';
    else if (marker.strandAmbiguous) status = 'ambiguous-strand';
    // 23andMe exports are forward-strand calls. Never add complement matches.
    const dosage = status === 'scored' ? [...call!.genotype].filter(a => a === marker.effectAllele).length : null;
    return { ...marker, genotype: call?.genotype ?? null, status, dosage, contribution: dosage === null ? null : dosage * marker.weight };
  });
  let sum = 0;
  let correction = 0;
  const observed = contributions.filter(row => row.contribution !== null);
  for (const row of observed) {
    const value = row.contribution!;
    const next = sum + value;
    correction += Math.abs(sum) >= Math.abs(value) ? (sum - next) + value : (value - next) + sum;
    sum = next;
  }
  const subtotal = observed.length ? sum + correction : null;
  return { contributions, observedCount: observed.length, subtotal, score: observed.length === model.length && model.length > 0 ? subtotal : null };
}

export { reference };

export function contributionDirection(row: Contribution) {
  if (row.contribution === null) return 'unscored';
  if (row.contribution === 0) return 'zero';
  return row.contribution > 0 ? 'higher' : 'lower';
}
