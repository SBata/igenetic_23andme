import { detectChipAndBuild, performSampleQC } from './qc';
import { runFullGenomicAnalysis } from './engine';
import { generateBenchmarkSampleVariants } from './sampleData';

export function runAutomatedVerification() {
  console.log('--- RUNNING IGENETIC SCIENTIFIC & QC PIPELINE TESTS ---');

  // Test 1: Benchmark sample generation & QC
  const benchmark = generateBenchmarkSampleVariants();
  const rsidSet = new Set(benchmark.variants.map(v => v.rsid.toLowerCase()));
  const { chip, build } = detectChipAndBuild(benchmark.header, rsidSet);
  console.log(`[TEST 1] Chip Detection: Expected v5, Detected ${chip} (${build})`);
  if (chip !== 'v5' || build !== 'GRCh38') throw new Error('Chip detection failed');

  const qc = performSampleQC(benchmark.variants, chip, build, 'benchmark.txt', 1024000);
  console.log(`[TEST 2] Sample QC: Total = ${qc.totalVariants}, Call Rate = ${qc.callRate}%, Ti/Tv = ${qc.titvRatio}`);
  if (qc.callRate < 90) throw new Error('Sample QC call rate unexpected');

  // Test 3: Re-analysis execution
  const results = runFullGenomicAnalysis(benchmark.variants, qc);
  console.log(`[TEST 3] PGx: Evaluated ${results.pgx.length} pharmacogenes.`);
  const cyp2c19 = results.pgx.find(g => g.gene === 'CYP2C19');
  console.log(`[TEST 3.1] CYP2C19 Diplotype: ${cyp2c19?.diplotype}, Phenotype: ${cyp2c19?.phenotype}`);
  if (cyp2c19?.diplotype !== '*1/*2' || cyp2c19?.phenotype !== 'Intermediate Metabolizer') {
    throw new Error('CYP2C19 star allele calling failure');
  }

  // Test 4: PRS with frequency imputation
  console.log(`[TEST 4] PRS: Evaluated ${results.prs.length} polygenic models.`);
  for (const p of results.prs) {
    console.log(`  - ${p.traitName}: RawScore=${p.rawScore} (Observed=${p.observedScore}, Imputed=${p.imputedScore}), Coverage=${p.coveragePercentage}%, EUR=${p.percentiles.EUR}%ile (${p.riskTier})`);
    if (p.coveragePercentage < 0 || p.coveragePercentage > 100) {
      throw new Error(`Invalid coverage percentage for ${p.traitName}`);
    }
  }

  // Test 5: ClinVar findings
  console.log(`[TEST 5] ClinVar: Detected ${results.clinvar.length} pathogenic mutations with >=2 stars.`);
  const hfe = results.clinvar.find(c => c.gene === 'HFE' && c.rsid === 'rs1800562');
  if (!hfe || hfe.patientGenotype !== 'GA' || hfe.copiesOfRiskAllele !== 1) {
    throw new Error('ClinVar HFE C282Y detection failure');
  }

  // Test 6: GWAS traits
  console.log(`[TEST 6] GWAS: Evaluated ${results.gwas.length} functional trait associations.`);
  const cyp1a2 = results.gwas.find(g => g.gene === 'CYP1A2');
  if (!cyp1a2 || cyp1a2.patientGenotype !== 'AA') {
    throw new Error('GWAS CYP1A2 evaluation failure');
  }

  console.log('✅ ALL SCIENTIFIC & QC PIPELINE TESTS PASSED.');
}

runAutomatedVerification();
