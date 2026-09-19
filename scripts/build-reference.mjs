import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const sources = [37, 38].map(build => {
  const filename = `PGS000001_hmPOS_GRCh${build}.txt.gz`;
  const bytes = readFileSync(new URL(`../references/${filename}`, import.meta.url));
  const lines = gunzipSync(bytes).toString('utf8').split('\n');
  const content = lines.filter(line => line && !line.startsWith('#'));
  const keys = content.shift().split('\t');
  const rows = content.map(line => Object.fromEntries(line.split('\t').map((value, i) => [keys[i], value])));
  assert.equal(rows.length, 77);
  assert.equal(new Set(rows.map(row => row.rsID)).size, 77);
  for (const row of rows) {
    assert.match(row.effect_allele, /^[ACGT]$/);
    assert.match(row.other_allele, /^[ACGT]$/);
    assert.ok(Math.abs(Number(row.effect_weight) - Math.log(Number(row.OR))) < 1e-14);
    assert.ok(Number.isSafeInteger(Number(row.hm_pos)) && Number(row.hm_pos) > 0);
  }
  return { build: `GRCh${build}`, filename, sha256: createHash('sha256').update(bytes).digest('hex'), rows };
});
const variants = sources[0].rows.map((row, i) => {
  const other = sources[1].rows[i];
  for (const key of ['rsID', 'effect_allele', 'other_allele', 'effect_weight', 'hm_chr']) assert.equal(row[key], other[key]);
  return { rsid: row.rsID, chromosome: row.hm_chr, positions: { GRCh37: Number(row.hm_pos), GRCh38: Number(other.hm_pos) }, effectAllele: row.effect_allele, otherAllele: row.other_allele, weight: Number(row.effect_weight), gene: row.locus_name };
});
const complement = { A: 'T', T: 'A', C: 'G', G: 'C' };
const alleleEvidence = [
  { build: 'GRCh37', filename: 'PGS000001-ensembl-GRCh37.json' },
  { build: 'GRCh38', filename: 'PGS000001-ensembl-alleles.json' },
].map(source => {
  const bytes = readFileSync(new URL(`../references/${source.filename}`, import.meta.url));
  return { ...source, sha256: createHash('sha256').update(bytes).digest('hex'), data: JSON.parse(bytes) };
});
for (const marker of variants) {
  marker.sourceEffectAllele = marker.effectAllele;
  marker.sourceOtherAllele = marker.otherAllele;
  marker.strandAmbiguous = complement[marker.effectAllele] === marker.otherAllele;
  const orientations = alleleEvidence.map(({ build, data }) => {
    const mappings = data[marker.rsid].mappings.filter(m => m.assembly_name === build && m.seq_region_name === marker.chromosome && m.start === marker.positions[build] && m.end === m.start && m.strand === 1);
    assert.equal(mappings.length, 1);
    const alleles = mappings[0].allele_string.split('/');
    if ([marker.effectAllele, marker.otherAllele].every(a => alleles.includes(a))) return 'direct';
    assert.ok([marker.effectAllele, marker.otherAllele].every(a => alleles.includes(complement[a])));
    return 'complement';
  });
  assert.equal(orientations[0], orientations[1]);
  marker.orientation = marker.strandAmbiguous ? 'unresolved-palindromic' : orientations[0];
  if (marker.orientation === 'complement') {
    marker.effectAllele = complement[marker.effectAllele];
    marker.otherAllele = complement[marker.otherAllele];
  }
}
const result = { id: 'PGS000001', name: 'PRS77_BC', trait: 'Breast cancer', citation: 'Mavaddat et al. (2015), doi:10.1093/jnci/djv036', url: 'https://www.pgscatalog.org/score/PGS000001/', weightType: 'log odds (effect_weight = ln(OR) in the source file)', sources: [...sources.map(({ rows, ...source }) => source), ...alleleEvidence.map(({ data, ...source }) => source)], variants };
const output = JSON.stringify(result, null, 2) + '\n';
const destination = new URL('../src/lib/referenceData/score.json', import.meta.url);
if (process.argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), output);
else writeFileSync(destination, output);
console.log('Verified 77 source rows, two builds, ln(OR) weights and reference checksums.');
