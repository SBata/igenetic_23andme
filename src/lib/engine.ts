import {
  ClinVarFinding,
  FullAnalysisResult,
  GenotypeSampleQC,
  GWASTraitResult,
  PGxGeneReport,
  PRSResult,
  RawVariant
} from '@/types/genomics';
import { complementAllele, complementGenotype } from './qc';
import { CURATED_CLINVAR_RECORDS } from './referenceData/clinvar';
import { CURATED_PGX_GENES } from './referenceData/pgx';
import { CURATED_PRS_MODELS } from './referenceData/prs';
import { CURATED_GWAS_TRAITS } from './referenceData/gwas';

// Standard normal cumulative distribution function (approximation)
function normalCDF(z: number): number {
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const erf = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * erf);
}

export function runFullGenomicAnalysis(
  variants: RawVariant[],
  qc: GenotypeSampleQC
): FullAnalysisResult {
  // Build fast O(1) hash map of rsID -> Genotype
  const variantMap = new Map<string, RawVariant>();
  const chromosomeDensity: { [chr: string]: { variantCount: number; actionableHits: number } } = {};

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    variantMap.set(v.rsid.toLowerCase(), v);

    const chr = v.chromosome.replace(/^CHR/, '').toUpperCase();
    if (!chromosomeDensity[chr]) {
      chromosomeDensity[chr] = { variantCount: 0, actionableHits: 0 };
    }
    chromosomeDensity[chr].variantCount++;
  }

  // 1. Pharmacogenomics (PGx) Star-Allele Calling
  const pgxReports: PGxGeneReport[] = [];

  for (const geneDef of CURATED_PGX_GENES) {
    const detectedVariantsList: PGxGeneReport['detectedVariants'] = [];
    const calledAlleles: string[] = [];

    for (const rule of geneDef.variants) {
      const patientVariant = variantMap.get(rule.rsid.toLowerCase());
      if (patientVariant) {
        const gt = patientVariant.genotype.toUpperCase();
        if (gt && gt !== '--' && gt !== '__' && gt !== '00') {
          const varAllele = rule.variantAllele.toUpperCase();
          const compVarAllele = complementAllele(varAllele);

          // Check how many copies of variant allele
          let copies = 0;
          for (const char of gt) {
            if (char === varAllele || char === compVarAllele) {
              copies++;
            }
          }

          if (copies > 0) {
            for (let c = 0; c < copies; c++) {
              calledAlleles.push(rule.starAllele);
            }
            detectedVariantsList.push({
              rsid: rule.rsid,
              starAllele: rule.starAllele,
              genotype: gt,
              definition: rule.description,
            });

            const chr = patientVariant.chromosome.replace(/^CHR/, '').toUpperCase();
            if (chromosomeDensity[chr]) {
              chromosomeDensity[chr].actionableHits++;
            }
          }
        }
      }
    }

    // Resolve diplotype
    let alleleA = geneDef.defaultAllele;
    let alleleB = geneDef.defaultAllele;

    if (calledAlleles.length === 1) {
      alleleA = geneDef.defaultAllele;
      alleleB = calledAlleles[0];
    } else if (calledAlleles.length >= 2) {
      alleleA = calledAlleles[0];
      alleleB = calledAlleles[1];
    }

    const diplotype = `${alleleA}/${alleleB}`;
    const phenotypeResult = geneDef.diplotypeToPhenotype([alleleA, alleleB]);

    pgxReports.push({
      gene: geneDef.gene,
      diplotype,
      phenotype: phenotypeResult.phenotype,
      activityScore: phenotypeResult.activityScore,
      drugs: geneDef.drugs,
      detectedVariants: detectedVariantsList,
    });
  }

  // 2. ClinVar Pathogenic / ACMG Findings
  const clinvarFindings: ClinVarFinding[] = [];

  for (const cv of CURATED_CLINVAR_RECORDS) {
    const patientVariant = variantMap.get(cv.rsid.toLowerCase());
    if (patientVariant) {
      const gt = patientVariant.genotype.toUpperCase();
      if (gt && gt !== '--' && gt !== '__' && gt !== '00') {
        const riskAllele = cv.riskAllele.toUpperCase();
        const compRiskAllele = complementAllele(riskAllele);

        let count = 0;
        for (const char of gt) {
          if (char === riskAllele || char === compRiskAllele) {
            count++;
          }
        }

        if (count > 0) {
          clinvarFindings.push({
            ...cv,
            patientGenotype: gt,
            patientAlleles: gt.split(''),
            copiesOfRiskAllele: count,
          });

          const chr = patientVariant.chromosome.replace(/^CHR/, '').toUpperCase();
          if (chromosomeDensity[chr]) {
            chromosomeDensity[chr].actionableHits++;
          }
        }
      }
    }
  }

  // 3. Polygenic Risk Scores (PRS) with Frequency Imputation & Missingness Accounting
  const prsResults: PRSResult[] = [];

  for (const model of CURATED_PRS_MODELS) {
    let observedScore = 0;
    let imputedScore = 0;
    let observedCount = 0;
    let imputedCount = 0;
    const variantBreakdown: PRSResult['variantBreakdown'] = [];

    for (const snp of model.referenceWeights) {
      const patientVariant = variantMap.get(snp.rsid.toLowerCase());
      const effAllele = snp.effectAllele.toUpperCase();
      const compEffAllele = complementAllele(effAllele);

      if (patientVariant && patientVariant.genotype && patientVariant.genotype !== '--' && patientVariant.genotype !== '__') {
        const gt = patientVariant.genotype.toUpperCase();
        let dosage = 0;
        for (const char of gt) {
          if (char === effAllele || char === compEffAllele) {
            dosage++;
          }
        }
        const contribution = dosage * snp.weight;
        observedScore += contribution;
        observedCount++;

        variantBreakdown.push({
          rsid: snp.rsid,
          gene: snp.gene,
          consequence: snp.consequence,
          biologicalMechanism: snp.biologicalMechanism,
          genotype: gt,
          effectAllele: snp.effectAllele,
          weight: snp.weight,
          isObserved: true,
          contribution: Math.round(contribution * 1000) / 1000,
        });
      } else {
        // Frequency-based imputation for missing array variant
        const imputedDosage = 2 * snp.referenceAlleleFreqEUR;
        const contribution = imputedDosage * snp.weight;
        imputedScore += contribution;
        imputedCount++;

        variantBreakdown.push({
          rsid: snp.rsid,
          gene: snp.gene,
          consequence: snp.consequence,
          biologicalMechanism: snp.biologicalMechanism,
          genotype: 'Uncalled/Missing (Imputed)',
          effectAllele: snp.effectAllele,
          weight: snp.weight,
          isObserved: false,
          imputedValue: Math.round(imputedDosage * 100) / 100,
          contribution: Math.round(contribution * 1000) / 1000,
        });
      }
    }

    const totalVariants = model.referenceWeights.length;
    const coveragePercentage = Math.round((observedCount / totalVariants) * 1000) / 10;
    const rawScore = observedScore + imputedScore;

    let reliabilityTier: PRSResult['reliabilityTier'] = 'High';
    if (coveragePercentage < 70) {
      reliabilityTier = 'Caution - Low Coverage';
    } else if (coveragePercentage < 85) {
      reliabilityTier = 'Moderate';
    }

    // Population normalizations
    const percentiles: { [pop: string]: number } = {};
    for (const [pop, stats] of Object.entries(model.populationStats)) {
      const z = (rawScore - stats.mean) / stats.sd;
      const pct = normalCDF(z) * 100;
      percentiles[pop] = Math.round(Math.min(99.9, Math.max(0.1, pct)) * 10) / 10;
    }

    const primaryPercentile = percentiles['EUR'] ?? 50;
    let riskTier: PRSResult['riskTier'] = 'Average';
    if (primaryPercentile >= 95) riskTier = 'Significantly Elevated';
    else if (primaryPercentile >= 80) riskTier = 'Elevated';
    else if (primaryPercentile < 20) riskTier = 'Below Average';

    const relativeRisk = Math.round(Math.exp((rawScore - model.populationStats.EUR.mean) / model.populationStats.EUR.sd * 0.4) * 100) / 100;

    prsResults.push({
      modelId: model.id,
      traitName: model.traitName,
      category: model.category,
      publication: model.publication,
      pubmedId: model.pubmedId,
      rawScore: Math.round(rawScore * 1000) / 1000,
      observedScore: Math.round(observedScore * 1000) / 1000,
      imputedScore: Math.round(imputedScore * 1000) / 1000,
      totalVariantsInModel: totalVariants,
      observedVariantsCount: observedCount,
      imputedVariantsCount: imputedCount,
      coveragePercentage,
      reliabilityTier,
      percentiles,
      relativeRisk,
      riskTier,
      variantBreakdown,
    });
  }

  // 4. Curated GWAS Traits & Wellness
  const gwasResults: GWASTraitResult[] = [];

  for (const trait of CURATED_GWAS_TRAITS) {
    const patientVariant = variantMap.get(trait.rsid.toLowerCase());
    if (patientVariant) {
      const gt = patientVariant.genotype.toUpperCase();
      if (gt && gt !== '--' && gt !== '__' && gt !== '00') {
        const sortedGt = gt.split('').sort().join('');
        const compSortedGt = complementGenotype(sortedGt).split('').sort().join('');

        const interpretation = 
          trait.interpretationSummary[sortedGt] || 
          trait.interpretationSummary[gt] || 
          trait.interpretationSummary[compSortedGt] || 
          `Genotype ${gt} observed at ${trait.rsid}.`;

        const hasEffect = gt.includes(trait.effectAllele) || gt.includes(complementAllele(trait.effectAllele));

        gwasResults.push({
          ...trait,
          patientGenotype: gt,
          userInterpretation: interpretation,
          hasEffectAllele: hasEffect,
        });

        const chr = patientVariant.chromosome.replace(/^CHR/, '').toUpperCase();
        if (chromosomeDensity[chr]) {
          chromosomeDensity[chr].actionableHits++;
        }
      }
    }
  }

  return {
    qc,
    pgx: pgxReports,
    prs: prsResults,
    clinvar: clinvarFindings,
    gwas: gwasResults,
    chromosomeDensity,
    rawVariants: variants,
    analyzedAt: new Date().toISOString(),
  };
}
