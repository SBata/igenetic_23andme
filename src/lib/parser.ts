import type { FullAnalysisResult, RawVariant } from '@/types/genomics';
import { unzipSync } from 'fflate';
import { detectChipAndBuild, performSampleQC } from './qc';
import { runFullGenomicAnalysis } from './engine';

export interface ParseProgressCallback {
  (stage: 'reading' | 'decompressing' | 'parsing' | 'qc' | 'analyzing' | 'done', percent: number): void;
}
const MAX_INPUT_BYTES = 32 * 1024 * 1024;
const MAX_TEXT_BYTES = 128 * 1024 * 1024;
const MAX_MARKERS = 1_500_000;

export function parse23andMeText(text: string): { headerLines: string[]; variants: RawVariant[] } {
  const headerLines: string[] = [];
  const variants: RawVariant[] = [];
  const ids = new Set<string>();
  for (const [index, source] of text.split(/\r?\n/).entries()) {
    const line = source.trim();
    if (!line) continue;
    if (line.startsWith('#')) { if (headerLines.length < 100) headerLines.push(line); continue; }
    if (/^rsid[\s,]+chromosome[\s,]+position[\s,]+genotype$/i.test(line)) continue;
    const parts = line.split(/[\s,]+/).map(part => part.replace(/^"(.*)"$/, '$1'));
    const [id, chromosome, positionText, genotype] = parts;
    const rsid = id?.toLowerCase();
    const chr = chromosome?.toUpperCase().replace(/^CHR/, '');
    const gt = genotype?.toUpperCase();
    const position = Number(positionText);
    if (parts.length !== 4 || !/^(?:rs\d+|i\d+)$/.test(rsid || '') ||
        !/^(?:[1-9]|1[0-9]|2[0-2]|X|Y|XY|MT|M)$/.test(chr || '') ||
        !/^\d+$/.test(positionText || '') || !Number.isSafeInteger(position) || position <= 0 ||
        !/^(?:[ACGT]{1,2}|[ID]{1,2}|--|__|\?\?|00|NN)$/.test(gt || '')) {
      throw new Error(`Unrecognized genotype row at line ${index + 1}. Select an unmodified 23andMe export.`);
    }
    if (ids.has(rsid)) throw new Error(`Duplicate marker at line ${index + 1}. Use a single, unmodified export.`);
    ids.add(rsid);
    variants.push({ rsid, chromosome: chr === 'M' ? 'MT' : chr, position, genotype: gt });
    if (variants.length > MAX_MARKERS) throw new Error('This file exceeds the supported 1.5 million marker limit.');
  }
  if (!variants.length) throw new Error('No genotype rows found. Select a 23andMe raw data text file or ZIP.');
  return { headerLines, variants };
}

export async function parseAndAnalyze23andMeFile(file: File, onProgress?: ParseProgressCallback): Promise<FullAnalysisResult> {
  if (!file.size || file.size > MAX_INPUT_BYTES) throw new Error('Choose a non-empty file smaller than 32 MB.');
  onProgress?.('reading', 10);
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text: string;
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    onProgress?.('decompressing', 25);
    let totalSize = 0;
    let entries = 0;
    const archive = unzipSync(bytes, { filter: entry => {
      if (++entries > 100) throw new Error('The ZIP contains too many entries. Select the original export.');
      const eligible = !entry.name.startsWith('__MACOSX/') && !entry.name.split('/').some(p => p.startsWith('.')) && /\.(txt|tsv|csv)$/i.test(entry.name);
      if (eligible) totalSize += entry.originalSize;
      if (totalSize > MAX_TEXT_BYTES) throw new Error('The expanded ZIP exceeds the 128 MB limit.');
      return eligible;
    } });
    const files = Object.values(archive);
    if (files.length !== 1) throw new Error('The ZIP must contain exactly one genotype text file. Extract it and select that file.');
    text = new TextDecoder('utf-8', { fatal: true }).decode(files[0]);
  } else {
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) throw new Error('GZIP and TAR archives are not supported. Extract the genotype text file first.');
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  }
  onProgress?.('parsing', 45);
  await new Promise(resolve => setTimeout(resolve, 0));
  const { headerLines, variants } = parse23andMeText(text);
  onProgress?.('qc', 75);
  await new Promise(resolve => setTimeout(resolve, 0));
  const { chip, build } = detectChipAndBuild(headerLines, new Set(variants.map(v => v.rsid)));
  const qc = performSampleQC(variants, chip, build, file.name, file.size);
  onProgress?.('analyzing', 90);
  const result = runFullGenomicAnalysis(variants, qc);
  onProgress?.('done', 100);
  return result;
}
