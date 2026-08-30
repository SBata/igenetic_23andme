import { FullAnalysisResult, RawVariant } from '@/types/genomics';
import { unzipSync, gunzipSync, strFromU8 } from 'fflate';
import { detectChipAndBuild, performSampleQC } from './qc';
import { runFullGenomicAnalysis } from './engine';

export interface ParseProgressCallback {
  (stage: 'reading' | 'decompressing' | 'parsing' | 'qc' | 'analyzing' | 'done', percent: number): void;
}

export async function parseAndAnalyze23andMeFile(
  file: File,
  onProgress?: ParseProgressCallback
): Promise<FullAnalysisResult> {
  onProgress?.('reading', 10);
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  let textContent = '';

  // 1. Check if file is a zip archive (Magic bytes: PK\x03\x04 -> 0x50, 0x4B, 0x03, 0x04)
  if (uint8.length >= 4 && uint8[0] === 0x50 && uint8[1] === 0x4b && uint8[2] === 0x03 && uint8[3] === 0x04) {
    onProgress?.('decompressing', 25);
    await new Promise(resolve => setTimeout(resolve, 10));
    const unzipped = unzipSync(uint8);
    // Find first text file inside zip
    const textFileName = Object.keys(unzipped).find(name => 
      !name.startsWith('__MACOSX') && 
      !name.startsWith('.') &&
      (name.endsWith('.txt') || name.endsWith('.tsv') || name.endsWith('.csv') || !name.includes('.'))
    );
    if (!textFileName || !unzipped[textFileName]) {
      throw new Error('No valid 23andMe genotype text file found inside the zip archive.');
    }
    textContent = strFromU8(unzipped[textFileName]);
  } 
  // 2. Check if file is a GZIP archive (Magic bytes: 0x1F, 0x8B)
  else if (uint8.length >= 2 && uint8[0] === 0x1f && uint8[1] === 0x8b) {
    onProgress?.('decompressing', 25);
    await new Promise(resolve => setTimeout(resolve, 10));
    const decompressed = gunzipSync(uint8);
    textContent = strFromU8(decompressed);
  } 
  // 3. Raw text file
  else {
    onProgress?.('reading', 25);
    const decoder = new TextDecoder('utf-8');
    textContent = decoder.decode(uint8);
  }

  onProgress?.('parsing', 45);
  await new Promise(resolve => setTimeout(resolve, 10));

  const lines = textContent.split(/\r?\n/);
  const headerLines: string[] = [];
  const variants: RawVariant[] = [];
  const rsidSet = new Set<string>();

  const totalLines = lines.length;

  for (let i = 0; i < totalLines; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#')) {
      if (headerLines.length < 100) {
        headerLines.push(line);
      }
      continue;
    }

    // Split on whitespace or tab or comma
    const parts = line.split(/[\s,\t]+/);
    if (parts.length >= 4) {
      const rsid = parts[0];
      const chromosome = parts[1];
      const position = parseInt(parts[2], 10);
      const genotype = parts[3];

      if (rsid && !isNaN(position)) {
        variants.push({ rsid, chromosome, position, genotype });
        rsidSet.add(rsid.toLowerCase());
      }
    }
  }

  if (variants.length === 0) {
    throw new Error('No genomic variant lines could be parsed from this file. Ensure it is an authentic 23andMe raw data export.');
  }

  onProgress?.('qc', 75);
  await new Promise(resolve => setTimeout(resolve, 10));

  const { chip, build } = detectChipAndBuild(headerLines, rsidSet);
  const qc = performSampleQC(variants, chip, build, file.name, file.size);

  onProgress?.('analyzing', 90);
  await new Promise(resolve => setTimeout(resolve, 10));

  const analysis = runFullGenomicAnalysis(variants, qc);

  onProgress?.('done', 100);
  return analysis;
}
