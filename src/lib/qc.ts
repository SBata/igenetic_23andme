import type { Build, ChipVersion, GenotypeSampleQC, RawVariant } from '@/types/genomics';
import { TRANSITIONS, TRANSVERSIONS } from './constants';

export function isCalledGenotype(genotype: string, chromosome: string): boolean {
  const gt = genotype.toUpperCase().trim();
  const chr = chromosome.toUpperCase().replace(/^CHR/, '');
  return /^(?:[ACGT]{2}|[ID]{2})$/.test(gt) ||
    (/^(X|Y|MT|M)$/.test(chr) && /^[ACGTID]$/.test(gt));
}

export function detectChipAndBuild(headerLines: string[], _variantRsids: Set<string>): { chip: ChipVersion; build: Build } {
  const header = headerLines.join('\n').toLowerCase();
  const chipMatch = header.match(/\b(?:chip|array)(?:\s+version)?\s*[:=]?\s*v?([1-5])\b/);
  const chip: ChipVersion = chipMatch ? `v${chipMatch[1]}` as ChipVersion : 'Unknown';
  const builds: Build[] = [];
  if (/\b(?:build\s*38|grch38|hg38)\b/.test(header)) builds.push('GRCh38');
  if (/\b(?:build\s*37|grch37|hg19)\b/.test(header)) builds.push('GRCh37');
  if (/\b(?:build\s*36|ncbi36|hg18)\b/.test(header)) builds.push('NCBI36');
  return { chip, build: builds.length === 1 ? builds[0] : 'Unknown' };
}

export function performSampleQC(variants: RawVariant[], detectedChip: ChipVersion, detectedBuild: Build, fileName: string, fileSizeBytes: number): GenotypeSampleQC {
  let validAutosomalCalls = 0, sexChromosomeCalls = 0, mitochondrialCalls = 0, noCallCount = 0;
  let heterozygousCount = 0, homozygousCount = 0, transitionsCount = 0, transversionsCount = 0;
  for (const v of variants) {
    const gt = v.genotype.toUpperCase().trim();
    const chr = v.chromosome.toUpperCase().replace(/^CHR/, '');
    if (!isCalledGenotype(gt, chr)) { noCallCount++; continue; }
    const autosomal = /^(?:[1-9]|1[0-9]|2[0-2])$/.test(chr);
    if (autosomal) validAutosomalCalls++;
    else if (chr === 'X' || chr === 'Y' || chr === 'XY') sexChromosomeCalls++;
    else if (chr === 'MT' || chr === 'M') mitochondrialCalls++;
    if (gt.length !== 2) continue;
    if (gt[0] === gt[1]) homozygousCount++;
    else {
      heterozygousCount++;
      if (autosomal && TRANSITIONS.has(gt)) transitionsCount++;
      else if (autosomal && TRANSVERSIONS.has(gt)) transversionsCount++;
    }
  }
  return {
    totalVariants: variants.length, validAutosomalCalls, sexChromosomeCalls, mitochondrialCalls, noCallCount,
    callRate: variants.length ? (variants.length - noCallCount) / variants.length * 100 : 0,
    heterozygousCount, homozygousCount,
    hetHomRatio: homozygousCount ? heterozygousCount / homozygousCount : 0,
    transitionsCount, transversionsCount,
    titvRatio: transversionsCount ? transitionsCount / transversionsCount : null,
    detectedChip, detectedBuild, parsedAt: new Date().toISOString(), fileName, fileSizeBytes,
  };
}
