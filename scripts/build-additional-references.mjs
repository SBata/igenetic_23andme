import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const complement = { A: 'T', T: 'A', C: 'G', G: 'C' };
const read = filename => readFileSync(new URL(`../references/${filename}`, import.meta.url));
const manifest = (filename, build) => ({ filename, build, sha256: createHash('sha256').update(read(filename)).digest('hex') });
const evidence = [37, 38].map(build => JSON.parse(gunzipSync(read(`additional-ensembl-GRCh${build}.json.gz`))));
const definitions = [
  ['PGS000011', 'Cardiovascular', 50, 'Published 50-variant CAD model. Replaces the former 10-marker panel labelled PGS000013.'],
  ['PGS000031', 'Metabolic', 62, 'Published 62-variant diabetes model. Replaces the former 8-marker panel labelled PGS000036.'],
  ['PGS000025', 'Neurology', 19, 'Published 19-variant model excluding APOE. It does not determine APOE status or reproduce the former 5-marker panel.'],
  ['PGS000035', 'Cardiovascular', 1168, 'Published AFib model. Replaces the former 4-marker panel; its PGS000021 identifier referred to type 1 diabetes.'],
];
const models = definitions.map(([id, category, count, description]) => {
  const metadata = JSON.parse(read(`${id}.json`));
  const sources = [37, 38].map(build => {
    const filename = `${id}_hmPOS_GRCh${build}.txt.gz`;
    const content = gunzipSync(read(filename)).toString('utf8').split('\n').filter(line => line && !line.startsWith('#'));
    const keys = content.shift().split('\t');
    const rows = content.map(line => Object.fromEntries(line.split('\t').map((value, i) => [keys[i], value])));
    assert.equal(rows.length, count);
    assert.equal(new Set(rows.map(row => row.rsID)).size, count);
    return { ...manifest(filename, `GRCh${build}`), rows };
  });
  const variants = sources[0].rows.map((row, i) => {
    const other = sources[1].rows[i];
    for (const key of ['rsID', 'effect_allele', 'effect_weight', 'hm_chr']) assert.equal(row[key], other[key]);
    assert.ok(Number.isFinite(Number(row.effect_weight)));
    // Preserve the archived decimal weight, including the source's rounding.
    if (row.OR) assert.ok(Math.abs(Number(row.effect_weight) - Math.log(Number(row.OR))) < 1e-8);
    const marker = { rsid: row.rsID, chromosome: row.hm_chr, positions: { GRCh37: Number(row.hm_pos), GRCh38: Number(other.hm_pos) }, effectAllele: row.effect_allele, otherAllele: row.other_allele || row.hm_inferOtherAllele || '', weight: Number(row.effect_weight), gene: row.locus_name || '', sourceEffectAllele: row.effect_allele, sourceOtherAllele: row.other_allele || '', strandAmbiguous: false, orientation: 'unresolved', referenceIssue: '' };
    const fail = reason => { marker.referenceIssue = reason; return marker; };
    if (![marker.effectAllele, marker.otherAllele].every(a => /^[ACGT]$/.test(a)) || marker.effectAllele === marker.otherAllele) return fail('Source allele pair is incomplete, multiallelic or not a single-base substitution.');
    if (!Object.values(marker.positions).every(p => Number.isSafeInteger(p) && p > 0)) return fail('No unique position in both supported builds.');
    const orientations = evidence.map((data, j) => {
      const build = j === 0 ? 'GRCh37' : 'GRCh38';
      const maps = data[marker.rsid]?.mappings?.filter(m => m.assembly_name === build && m.seq_region_name === marker.chromosome && m.start === marker.positions[build] && m.end === m.start && m.strand === 1) ?? [];
      if (maps.length !== 1) return 'unresolved';
      const alleles = maps[0].allele_string.split('/');
      const direct = [marker.effectAllele, marker.otherAllele].every(a => alleles.includes(a));
      const reverse = [marker.effectAllele, marker.otherAllele].every(a => alleles.includes(complement[a]));
      if (direct && reverse && complement[marker.effectAllele] !== marker.otherAllele) return 'unresolved';
      if (direct) return 'direct';
      if (reverse) return 'complement';
      return 'unresolved';
    });
    if (orientations[0] === 'unresolved' || orientations[0] !== orientations[1]) return fail('Source alleles cannot be uniquely reconciled with both Ensembl builds.');
    marker.strandAmbiguous = complement[marker.effectAllele] === marker.otherAllele;
    marker.orientation = marker.strandAmbiguous ? 'unresolved-palindromic' : orientations[0];
    if (marker.orientation === 'complement') {
      marker.effectAllele = complement[marker.effectAllele];
      marker.otherAllele = complement[marker.otherAllele];
    }
    return marker;
  });
  const pub = metadata.publication;
  console.log(`${id}: ${variants.filter(v => !v.referenceIssue && !v.strandAmbiguous).length}/${count} reference rows eligible; all ${count} retained.`);
  return { id, name: metadata.name, trait: metadata.trait_reported, category, description, citation: `${pub.firstauthor} et al. (${pub.date_publication.slice(0, 4)}), doi:${pub.doi}`, url: `https://www.pgscatalog.org/score/${id}/`, weightType: id === 'PGS000035' ? 'Published additive weight (Catalog unit not reported)' : 'log odds (source effect_weight)', effectMeasure: id === 'PGS000035' ? 'score' : 'log-odds', sources: [...sources.map(({ rows, ...source }) => source), manifest(`${id}.json`, 'Metadata'), ...[37, 38].map(b => manifest(`additional-ensembl-GRCh${b}.json.gz`, `GRCh${b}`))], variants };
});
const output = JSON.stringify(models, null, 2) + '\n';
const destination = new URL('../src/lib/referenceData/additional-scores.json', import.meta.url);
if (process.argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), output);
else writeFileSync(destination, output);
