import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { zipSync, strToU8 } from 'fflate';
import { parse23andMeText, parseAndAnalyze23andMeFile } from './parser';
import { detectChipAndBuild, isCalledGenotype, performSampleQC } from './qc';
import { runFullGenomicAnalysis } from './engine';
import { scoreVariants, reference, scoreModels, contributionDirection, type ScoreVariant } from './scoring';
import { generateBenchmarkSampleVariants } from './sampleData';
import type { RawVariant } from '../types/genomics';

const variant = (rsid: string, genotype: string, chromosome = '1'): RawVariant => ({ rsid, genotype, chromosome, position: 1 });
const analyze = (variants: RawVariant[]) => runFullGenomicAnalysis(variants, performSampleQC(variants, 'Unknown', 'Unknown', 'test', 0));

async function main() {
  const parsed = parse23andMeText('\uFEFF# build 37\r\nrs123\t1\t100\tac\r\ni123  X 200 A\r\nrs456,MT,300,G\r\nrs789 2 500 --');
  assert.equal(parsed.variants.length, 4);
  assert.equal(parsed.variants[0].genotype, 'AC');
  for (const bad of ['', '# only comments', 'rs1 1 12x AA', 'rs1 1 -1 AA', 'rs1 1 1 NaN', 'rs1 1 1 AX', 'rs1 99 1 AA', 'rs1 1 1 AA extra', 'rs1 1 1 AA\nRS1 1 1 GG']) {
    assert.throws(() => parse23andMeText(bad));
  }
  assert.throws(() => analyze([variant('rs1', 'AA'), variant('RS1', 'GG')]), /Duplicate/);
  assert.deepEqual(detectChipAndBuild(['# chip v5', '# build 37'], new Set()), { chip: 'v5', build: 'GRCh37' });
  assert.equal(detectChipAndBuild(['# build 36'], new Set()).build, 'NCBI36');
  assert.equal(detectChipAndBuild([], new Set(['rs76735552', 'rs143360432'])).build, 'Unknown');
  assert.equal(detectChipAndBuild(['# build 37', '# build 38'], new Set()).build, 'Unknown');
  assert.equal(detectChipAndBuild(['# build 38'], new Set()).chip, 'Unknown');
  for (const gt of ['AA', 'CG', 'AT', 'II', 'DD', 'ID']) assert.ok(isCalledGenotype(gt, '1'));
  for (const gt of ['--', '__', '00', 'NN', '??', 'AX', '', 'A', 'I', 'AAA']) assert.equal(isCalledGenotype(gt, '1'), false);
  assert.ok(isCalledGenotype('A', 'X'));
  assert.ok(isCalledGenotype('G', 'MT'));
  const qc = performSampleQC([variant('rs1', 'AG'), variant('rs2', 'AC'), variant('rs3', 'AA'), variant('rs4', '--'), variant('rs5', 'A', 'X')], 'Unknown', 'Unknown', 'test', 0);
  assert.equal(qc.callRate, 80);
  assert.equal(qc.titvRatio, 1);
  assert.equal(qc.homozygousCount, 1);
  assert.equal(qc.heterozygousCount, 2);
  assert.equal(analyze([variant('rs1', 'AA')]).qc.titvRatio, null);

  const markerIds = reference.variants.map(v => v.rsid);
  for (const genotype of ['AA', 'AC', 'AG', 'AT', 'CC', 'CG', 'CT', 'GG', 'GT', 'TT', '--', '00', 'NN', '??', 'A']) {
    const result = analyze(markerIds.map(id => variant(id, genotype)));
    for (const score of result.prs) {
      assert.equal(score.status, 'unavailable');
      assert.equal(score.rawScore, null);
      assert.equal(score.observedScore, null);
      assert.equal(score.imputedScore, null);
      assert.equal(score.relativeRisk, null);
      assert.deepEqual(score.percentiles, {});
      assert.equal(score.riskTier, 'Unavailable');
      assert.equal(score.imputedVariantsCount, 0);
      assert.equal(score.observedVariantsCount, 0); // Unknown build cannot be scored.
    }
  }
  const empty = analyze([]);
  assert.ok(empty.prs.every(p => p.observedVariantsCount === 0 && p.rawScore === null));
  assert.ok(empty.pgx.every(p => p.phenotype === 'Indeterminate' && !p.drugs.length && p.diplotype === 'Not determined'));
  const multi = analyze([variant('rs4244285', 'AG'), variant('rs4986893', 'AG'), variant('rs12248560', 'CT'), variant('rs67376798', 'AA'), variant('rs1799945', 'CC')]);
  assert.ok(multi.pgx.every(p => p.phenotype === 'Indeterminate' && p.activityScore === undefined));
  assert.equal(multi.clinicalStatus, 'unavailable');
  assert.deepEqual(multi.clinvar, []);
  assert.ok(!JSON.stringify(multi).includes('Pathogenic'));
  const large = analyze(Array.from({ length: 10002 }, (_, i) => variant(`rs${i + 1}`, 'AA')));
  assert.equal(large.rawVariants?.length, 10002);
  assert.equal(large.rawVariants?.at(-1)?.rsid, 'rs10002');

  const model: ScoreVariant[] = [
    { rsid: 'rs1', chromosome: '1', positions: { GRCh37: 1, GRCh38: 11 }, effectAllele: 'A', otherAllele: 'T', weight: 0.25, gene: '' },
    { rsid: 'rs2', chromosome: '1', positions: { GRCh37: 1, GRCh38: 12 }, effectAllele: 'C', otherAllele: 'G', weight: -0.5, gene: '' },
  ];
  const score = (calls: RawVariant[], build: 'GRCh37' | 'GRCh38' | 'Unknown' = 'GRCh37', markers = model) => scoreVariants(new Map(calls.map(v => [v.rsid, v])), build, markers);
  // Hand-computed oracle: 1 × 0.25 + 2 × (-0.5) = -0.75.
  assert.equal(score([variant('rs1', 'AT'), variant('rs2', 'CC')]).score, -0.75);
  assert.equal(score([variant('rs1', 'TA'), variant('rs2', 'CC')]).score, -0.75);
  for (const [call, expected] of [['TT', 0], ['AT', 0.25], ['AA', 0.5]] as const) assert.equal(score([variant('rs1', call)], 'GRCh37', [model[0]]).score, expected);
  for (const [call, expected] of [['GG', 0], ['CG', -0.5], ['CC', -1]] as const) assert.equal(score([variant('rs2', call)], 'GRCh37', [model[1]]).score, expected);
  assert.equal(score([]).subtotal, null);
  const partial = score([variant('rs1', 'AA')]);
  assert.equal(partial.score, null);
  assert.equal(partial.subtotal, 0.5);
  assert.equal(score([variant('rs1', 'CC')]).contributions[0].status, 'allele-mismatch');
  assert.equal(score([variant('rs1', '--')]).contributions[0].status, 'uncalled');
  assert.equal(score([variant('rs1', 'A')]).contributions[0].status, 'uncalled');
  assert.equal(score([variant('rs1', 'AA')], 'GRCh38').contributions[0].status, 'coordinate-mismatch');
  assert.equal(score([{ ...variant('rs1', 'AA'), position: 11 }], 'GRCh38').subtotal, 0.5);
  assert.equal(score([variant('rs1', 'AA', '2')]).subtotal, null);
  assert.throws(() => score([], 'GRCh37', [model[0], model[0]]), /duplicate/);
  assert.throws(() => score([], 'GRCh37', [{ ...model[0], weight: NaN }]), /Invalid/);
  const cancellation = [1e16, 1, -1e16].map((weight, i) => ({ ...model[0], rsid: `rs${i + 1}`, weight }));
  assert.equal(score(cancellation.map(m => variant(m.rsid, 'AT')), 'GRCh37', cancellation).score, 1);
  const calls = reference.variants.map(m => ({ rsid: m.rsid, chromosome: m.chromosome, position: m.positions.GRCh37, genotype: m.otherAllele.repeat(2) }));
  assert.equal(score(calls, 'GRCh37', reference.variants).subtotal, 0);
  assert.equal(score(calls, 'GRCh37', reference.variants).score, null);
  assert.ok(score(calls, 'GRCh37', reference.variants).contributions.some(row => row.status === 'ambiguous-strand'));
  assert.equal(score([variant('rs1', 'AT')], 'GRCh37', [{ ...model[0], strandAmbiguous: true }]).subtotal, null);
  assert.equal(score([variant('rs1', 'AT')], 'GRCh37', [{ ...model[0], referenceIssue: 'Unresolved source' }]).contributions[0].status, 'unresolved-reference');
  assert.deepEqual(score([variant('rs1', 'AT'), variant('rs2', 'CC')]).contributions.map(contributionDirection), ['higher', 'lower']);
  assert.equal(contributionDirection(score([variant('rs1', 'TT')]).contributions[0]), 'zero');
  assert.equal(contributionDirection(score([]).contributions[0]), 'unscored');
  assert.deepEqual(scoreModels.map(m => m.variants.length), [77, 50, 62, 19, 1168]);
  // Independent Python Decimal sums over archived TSV weights with repeating 0/1/2 dosages.
  const decimalSubtotals: Record<string, number> = { PGS000001: 1.624445643430843162, PGS000011: 3.101764440512624150, PGS000031: 3.008759171302229152, PGS000025: 1.725744316, PGS000035: 140.3257 };
  for (const published of scoreModels) {
    for (const build of ['GRCh37', 'GRCh38'] as const) {
      const eligible = published.variants.filter((m: ScoreVariant) => !m.strandAmbiguous && !m.referenceIssue);
      const calls = eligible.map(m => ({ rsid: m.rsid, chromosome: m.chromosome, position: m.positions[build], genotype: m.effectAllele + m.otherAllele }));
      const actual = score(calls, build, published.variants);
      assert.equal(actual.observedCount, eligible.length);
      assert.equal(actual.contributions.length, published.variants.length);
      assert.ok(Math.abs(actual.subtotal! - eligible.reduce((sum, m) => sum + m.weight, 0)) < 1e-11);
      assert.equal(actual.score, null);
      assert.ok(actual.contributions.every(row => row.dosage === null || row.dosage === 1));
      const patterned = published.variants.filter((m: ScoreVariant) => !m.referenceIssue).map(m => {
        const dosage = published.variants.indexOf(m) % 3;
        return { rsid: m.rsid, chromosome: m.chromosome, position: m.positions[build], genotype: m.effectAllele.repeat(dosage) + m.otherAllele.repeat(2 - dosage) };
      });
      assert.ok(Math.abs(score(patterned, build, published.variants).subtotal! - decimalSubtotals[published.id]) < 1e-12, published.id);
    }
  }
  assert.equal(score(calls.slice(1), 'GRCh37', reference.variants).score, null);
  // Python Decimal over original TSV weights, independently computed with repeating dosages 0/1/2.
  assert.ok(Math.abs(score(generateBenchmarkSampleVariants().variants, 'GRCh37', reference.variants).subtotal! - 1.624445643430843162) < 1e-14);
  for (const rsid of ['rs1432679', 'rs17529111']) {
    const marker = reference.variants.find(v => v.rsid === rsid)!;
    assert.equal(marker.effectAllele, 'C');
    assert.equal(marker.sourceEffectAllele, 'G');
    const call = { rsid, chromosome: marker.chromosome, position: marker.positions.GRCh37, genotype: 'CC' };
    assert.equal(score([call], 'GRCh37', [marker]).score, 2 * marker.weight);
    assert.equal(score([{ ...call, genotype: 'GG' }], 'GRCh37', [marker]).score, null);
  }
  const started = performance.now();
  const fullSize = '# build 37\n' + Array.from({ length: 700000 }, (_, i) => `rs${i + 100000000} 1 ${i + 1} AG`).join('\n');
  const fullResult = await parseAndAnalyze23andMeFile(new File([fullSize], 'synthetic-performance.txt'));
  assert.equal(fullResult.rawVariants?.length, 700000);
  console.log(`700,000 synthetic rows parsed and analyzed in ${((performance.now() - started) / 1000).toFixed(2)} seconds.`);

  const text = '# build 37\nrs1 1 1 AA\nrs2 2 2 --';
  const zip = zipSync({ 'genome.txt': strToU8(text) });
  const fromText = await parseAndAnalyze23andMeFile(new File([text], 'genome.txt'));
  const fromZip = await parseAndAnalyze23andMeFile(new File([new Uint8Array(zip).buffer], 'genome.zip'));
  assert.deepEqual(fromText.rawVariants, fromZip.rawVariants);
  assert.equal(fromZip.qc.detectedBuild, 'GRCh37');
  assert.equal(fromZip.qc.callRate, 50);
  const multiple = zipSync({ 'a.txt': strToU8(text), 'b.txt': strToU8(text) });
  await assert.rejects(parseAndAnalyze23andMeFile(new File([new Uint8Array(multiple).buffer], 'multiple.zip')), /exactly one/);
  await assert.rejects(parseAndAnalyze23andMeFile(new File([], 'empty.txt')), /non-empty/);
  await assert.rejects(parseAndAnalyze23andMeFile(new File([new Uint8Array([0x1f, 0x8b]).buffer], 'genome.gz')), /not supported/);
  await assert.rejects(parseAndAnalyze23andMeFile(new File([new Uint8Array(33 * 1024 * 1024).buffer], 'large.txt')), /32 MB/);

  // Guard the private local-processing boundary against accidental reintroduction.
  function checkSource(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) checkSource(path);
      else if (/\.tsx?$/.test(path) && !path.endsWith('test-runner.ts')) {
        const source = readFileSync(path, 'utf8');
        assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|new WebSocket|(?:localStorage|sessionStorage)\.setItem/.test(source), `Network/storage boundary: ${path}`);
      }
    }
  }
  checkSource('src');
  console.log('PASS: arithmetic oracles, both builds, missingness, allele orientation, parsing, ZIPs, QC, phase ambiguity, full-file retention and privacy source checks.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
