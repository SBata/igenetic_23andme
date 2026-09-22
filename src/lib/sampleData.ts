import type { RawVariant } from '../types/genomics';
import { reference, scoreModels, type ScoreVariant } from './scoring';

export function generateBenchmarkSampleVariants(allModels = false): { header: string[]; variants: RawVariant[] } {
  const markers: ScoreVariant[] = allModels ? [...new Map(scoreModels.flatMap(m => m.variants).filter(m => /^[ACGT]$/.test(m.effectAllele) && /^[ACGT]$/.test(m.otherAllele) && m.positions.GRCh37 > 0).map(m => [m.rsid, m])).values()] : reference.variants;
  return {
    header: ['# Synthetic demonstration, not a real person', '# build 37'],
    variants: markers.map((marker, i) => ({
      rsid: marker.rsid,
      chromosome: marker.chromosome,
      position: marker.positions.GRCh37,
      genotype: i % 3 === 0 ? marker.otherAllele.repeat(2) : i % 3 === 1 ? marker.effectAllele + marker.otherAllele : marker.effectAllele.repeat(2),
    })),
  };
}
