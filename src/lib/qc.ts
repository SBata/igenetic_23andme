import { Build, ChipVersion, GenotypeSampleQC, RawVariant } from '@/types/genomics';
import { CHIP_FINGERPRINTS, TRANSITIONS, TRANSVERSIONS } from './constants';

export function detectChipAndBuild(
  headerLines: string[],
  variantRsids: Set<string>
): { chip: ChipVersion; build: Build } {
  const headerCombined = headerLines.join('\n').toLowerCase();

  // 1. Header-based detection
  if (headerCombined.includes('build 38') || headerCombined.includes('grch38') || headerCombined.includes('hg38')) {
    return { chip: 'v5', build: 'GRCh38' };
  }
  if (headerCombined.includes('build 37') || headerCombined.includes('grch37') || headerCombined.includes('hg19')) {
    if (headerCombined.includes('v4') || variantRsids.has('rs28936678')) {
      return { chip: 'v4', build: 'GRCh37' };
    }
    return { chip: 'v3', build: 'GRCh37' };
  }
  if (headerCombined.includes('build 36') || headerCombined.includes('hg18')) {
    return { chip: 'v2', build: 'GRCh37' };
  }

  // 2. Probe set fingerprinting fallback
  const v5Hits = CHIP_FINGERPRINTS.v5_specific_snps.filter(rs => variantRsids.has(rs)).length;
  const v4Hits = CHIP_FINGERPRINTS.v4_specific_snps.filter(rs => variantRsids.has(rs)).length;
  const v3Hits = CHIP_FINGERPRINTS.v3_specific_snps.filter(rs => variantRsids.has(rs)).length;

  if (v5Hits >= 2) {
    return { chip: 'v5', build: 'GRCh38' };
  }
  if (v4Hits >= 2) {
    return { chip: 'v4', build: 'GRCh37' };
  }
  if (v3Hits >= 1) {
    return { chip: 'v3', build: 'GRCh37' };
  }

  // Default assumption for 23andMe modern exports
  return { chip: 'v5', build: 'GRCh38' };
}

export function performSampleQC(
  variants: RawVariant[],
  detectedChip: ChipVersion,
  detectedBuild: Build,
  fileName: string,
  fileSizeBytes: number
): GenotypeSampleQC {
  let validAutosomalCalls = 0;
  let sexChromosomeCalls = 0;
  let mitochondrialCalls = 0;
  let noCallCount = 0;
  let heterozygousCount = 0;
  let homozygousCount = 0;
  let transitionsCount = 0;
  let transversionsCount = 0;

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const gt = v.genotype.toUpperCase().trim();
    const chr = v.chromosome.toUpperCase().replace(/^CHR/, '');

    // Check for no-calls
    if (!gt || gt === '--' || gt === '__' || gt === '??' || gt === '00' || gt === 'NN' || gt === 'D' || gt === 'I' && gt.length === 1) {
      noCallCount++;
      continue;
    }

    // Chromosome categorization
    const isAutosomal = !isNaN(Number(chr)) && Number(chr) >= 1 && Number(chr) <= 22;
    const isSex = chr === 'X' || chr === 'Y';
    const isMT = chr === 'MT' || chr === 'M';

    if (isAutosomal) {
      validAutosomalCalls++;
    } else if (isSex) {
      sexChromosomeCalls++;
    } else if (isMT) {
      mitochondrialCalls++;
    }

    // Heterozygosity check for bi-allelic calls
    if (gt.length === 2) {
      const a1 = gt[0];
      const a2 = gt[1];
      if (a1 === a2) {
        homozygousCount++;
      } else {
        heterozygousCount++;
        // Ti/Tv calculation on autosomal heterozygous/polymorphic calls
        if (isAutosomal) {
          const pair = `${a1}${a2}`;
          if (TRANSITIONS.has(pair)) {
            transitionsCount++;
          } else if (TRANSVERSIONS.has(pair)) {
            transversionsCount++;
          }
        }
      }
    } else if (gt.length === 1) {
      // Hemizygous call (e.g. male X / Y / MT)
      homozygousCount++;
    }
  }

  const total = variants.length;
  const validCalls = total - noCallCount;
  const callRate = total > 0 ? (validCalls / total) * 100 : 0;
  const hetHomRatio = homozygousCount > 0 ? heterozygousCount / homozygousCount : 0;
  const titvRatio = transversionsCount > 0 ? transitionsCount / transversionsCount : 2.1;

  return {
    totalVariants: total,
    validAutosomalCalls,
    sexChromosomeCalls,
    mitochondrialCalls,
    noCallCount,
    callRate: Math.round(callRate * 100) / 100,
    heterozygousCount,
    homozygousCount,
    hetHomRatio: Math.round(hetHomRatio * 100) / 100,
    transitionsCount,
    transversionsCount,
    titvRatio: Math.round(titvRatio * 100) / 100,
    detectedChip,
    detectedBuild,
    parsedAt: new Date().toISOString(),
    fileName,
    fileSizeBytes,
  };
}

export function complementAllele(allele: string): string {
  switch (allele.toUpperCase()) {
    case 'A': return 'T';
    case 'T': return 'A';
    case 'C': return 'G';
    case 'G': return 'C';
    default: return allele;
  }
}

export function complementGenotype(genotype: string): string {
  return genotype.split('').map(complementAllele).join('');
}
