import type { RawVariant } from '../types/genomics';
import { reference } from './scoring';

export function generateBenchmarkSampleVariants(): { header: string[]; variants: RawVariant[] } {
  return {
    header: ['# Synthetic demonstration, not a real person', '# build 37'],
    variants: reference.variants.map((marker, i) => ({
      rsid: marker.rsid,
      chromosome: marker.chromosome,
      position: marker.positions.GRCh37,
      genotype: i % 3 === 0 ? marker.otherAllele.repeat(2) : i % 3 === 1 ? marker.effectAllele + marker.otherAllele : marker.effectAllele.repeat(2),
    })),
  };
}
