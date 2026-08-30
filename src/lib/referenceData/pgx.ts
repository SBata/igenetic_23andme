import { MetabolizerStatus, PGxDrugRecommendation } from '@/types/genomics';

export interface StarAlleleVariantRule {
  rsid: string;
  starAllele: string;
  variantAllele: string;
  referenceAllele: string;
  functionCategory: 'No Function' | 'Decreased Function' | 'Normal Function' | 'Increased Function';
  description: string;
}

export interface PGxGeneDefinition {
  gene: string;
  variants: StarAlleleVariantRule[];
  defaultAllele: string; // e.g. "*1"
  diplotypeToPhenotype: (alleles: [string, string]) => {
    phenotype: MetabolizerStatus;
    activityScore?: number;
  };
  drugs: PGxDrugRecommendation[];
}

export const CURATED_PGX_GENES: PGxGeneDefinition[] = [
  {
    gene: 'CYP2C19',
    defaultAllele: '*1',
    variants: [
      {
        rsid: 'rs4244285',
        starAllele: '*2',
        variantAllele: 'A',
        referenceAllele: 'G',
        functionCategory: 'No Function',
        description: 'c.681G>A (Aberrant splice site)',
      },
      {
        rsid: 'rs4986893',
        starAllele: '*3',
        variantAllele: 'A',
        referenceAllele: 'G',
        functionCategory: 'No Function',
        description: 'p.Trp212Ter (Premature stop)',
      },
      {
        rsid: 'rs12248560',
        starAllele: '*17',
        variantAllele: 'T',
        referenceAllele: 'C',
        functionCategory: 'Increased Function',
        description: 'c.-806C>T (Promoter gain of function)',
      },
    ],
    diplotypeToPhenotype: (alleles) => {
      const isLoss = (a: string) => a === '*2' || a === '*3';
      const isGain = (a: string) => a === '*17';
      const isNormal = (a: string) => a === '*1';

      if (isGain(alleles[0]) && isGain(alleles[1])) return { phenotype: 'Ultra-Rapid Metabolizer', activityScore: 3.0 };
      if ((isGain(alleles[0]) && isNormal(alleles[1])) || (isNormal(alleles[0]) && isGain(alleles[1]))) return { phenotype: 'Rapid Metabolizer', activityScore: 2.5 };
      if (isNormal(alleles[0]) && isNormal(alleles[1])) return { phenotype: 'Normal Metabolizer', activityScore: 2.0 };
      if ((isLoss(alleles[0]) && isGain(alleles[1])) || (isGain(alleles[0]) && isLoss(alleles[1]))) return { phenotype: 'Intermediate Metabolizer', activityScore: 1.5 };
      if ((isLoss(alleles[0]) && isNormal(alleles[1])) || (isNormal(alleles[0]) && isLoss(alleles[1]))) return { phenotype: 'Intermediate Metabolizer', activityScore: 1.0 };
      if (isLoss(alleles[0]) && isLoss(alleles[1])) return { phenotype: 'Poor Metabolizer', activityScore: 0.0 };
      return { phenotype: 'Normal Metabolizer', activityScore: 2.0 };
    },
    drugs: [
      {
        drugName: 'Clopidogrel (Plavix)',
        therapeuticArea: 'Cardiology',
        cpicLevel: 'A',
        clinicalSummary: 'Prodrug requiring CYP2C19 bioactivation to inhibit platelet aggregation.',
        recommendation: 'In Poor and Intermediate metabolizers, significantly reduced active metabolite formation leads to higher residual platelet reactivity and increased cardiovascular ischemic risk. Alternative antiplatelet agents (e.g. Prasugrel, Ticagrelor) recommended by CPIC.',
        guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/',
      },
      {
        drugName: 'Escitalopram & Citalopram',
        therapeuticArea: 'Psychiatry',
        cpicLevel: 'A',
        clinicalSummary: 'SSRI antidepressants metabolized primarily by CYP2C19.',
        recommendation: 'In Poor metabolizers, plasma levels are markedly elevated, increasing risk of QT prolongation and side effects; 50% dose reduction recommended. In Ultra-Rapid metabolizers, lower therapeutic efficacy may require alternative agent.',
        guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/',
      },
      {
        drugName: 'Omeprazole & Pantoprazole',
        therapeuticArea: 'Infectious Disease',
        cpicLevel: 'A',
        clinicalSummary: 'Proton pump inhibitors (PPIs) cleared by CYP2C19.',
        recommendation: 'In Ultra-Rapid/Rapid metabolizers, lower drug exposure may cause H. pylori eradication failure; consider increasing daily dose by 100%. In Poor metabolizers, standard doses achieve superior acid suppression.',
        guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/',
      },
    ],
  },
  {
    gene: 'SLCO1B1',
    defaultAllele: '*1A',
    variants: [
      {
        rsid: 'rs4149056',
        starAllele: '*5',
        variantAllele: 'C',
        referenceAllele: 'T',
        functionCategory: 'Decreased Function',
        description: 'p.Val174Ala (c.521T>C) - Hepatic influx transporter impairment',
      },
    ],
    diplotypeToPhenotype: (alleles) => {
      const cCount = (alleles[0] === '*5' ? 1 : 0) + (alleles[1] === '*5' ? 1 : 0);
      if (cCount === 2) return { phenotype: 'Poor Metabolizer', activityScore: 0.0 };
      if (cCount === 1) return { phenotype: 'Intermediate Metabolizer', activityScore: 1.0 };
      return { phenotype: 'Normal Metabolizer', activityScore: 2.0 };
    },
    drugs: [
      {
        drugName: 'Simvastatin',
        therapeuticArea: 'Cardiology',
        cpicLevel: 'A',
        clinicalSummary: 'HMG-CoA reductase inhibitor for dyslipidemia.',
        recommendation: 'Decreased SLCO1B1 transport (*5 allele) markedly raises systemic simvastatin acid plasma concentrations, significantly escalating risk of statin-associated myopathy and rhabdomyolysis. Prescribe lower dose or alternate statin (Pravastatin/Rosuvastatin).',
        guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-statins-and-slco1b1-abcg2-cyp2c9/',
      },
      {
        drugName: 'Atorvastatin',
        therapeuticArea: 'Cardiology',
        cpicLevel: 'A',
        clinicalSummary: 'High-intensity statin.',
        recommendation: 'Moderate risk of increased exposure with *5 homozygous carriers. Monitor CK levels and consider lower initial dosing in poor transporter phenotypes.',
        guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-statins-and-slco1b1-abcg2-cyp2c9/',
      },
    ],
  },
  {
    gene: 'CYP2C9 & VKORC1',
    defaultAllele: '*1',
    variants: [
      {
        rsid: 'rs1799853',
        starAllele: '*2',
        variantAllele: 'T',
        referenceAllele: 'C',
        functionCategory: 'Decreased Function',
        description: 'CYP2C9 p.Arg144Cys (c.430C>T)',
      },
      {
        rsid: 'rs1057910',
        starAllele: '*3',
        variantAllele: 'C',
        referenceAllele: 'A',
        functionCategory: 'No Function',
        description: 'CYP2C9 p.Ile359Leu (c.1075A>C)',
      },
      {
        rsid: 'rs9923231',
        starAllele: '-1639G>A (VKORC1)',
        variantAllele: 'T', // on 23andMe usually reported as T or A
        referenceAllele: 'C',
        functionCategory: 'Decreased Function',
        description: 'VKORC1 promoter sensitivity allele',
      },
    ],
    diplotypeToPhenotype: (alleles) => {
      const countDecreased = alleles.filter(a => a === '*2' || a === '*3').length;
      if (countDecreased >= 2) return { phenotype: 'Poor Metabolizer', activityScore: 0.5 };
      if (countDecreased === 1) return { phenotype: 'Intermediate Metabolizer', activityScore: 1.0 };
      return { phenotype: 'Normal Metabolizer', activityScore: 2.0 };
    },
    drugs: [
      {
        drugName: 'Warfarin (Coumadin)',
        therapeuticArea: 'Cardiology',
        cpicLevel: 'A',
        clinicalSummary: 'Vitamin K antagonist oral anticoagulant with narrow therapeutic index.',
        recommendation: 'Patients with CYP2C9 *2 or *3 alleles clear S-warfarin slowly, while VKORC1 -1639A carriers have lower enzyme expression. Dose reductions of 30-70% required to prevent life-threatening bleeding episodes during initiation.',
        guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/',
      },
      {
        drugName: 'Celecoxib & NSAIDs',
        therapeuticArea: 'Pain & Anesthesia',
        cpicLevel: 'A',
        clinicalSummary: 'COX-2 selective NSAID metabolized by CYP2C9.',
        recommendation: 'In Poor Metabolizers (*3/*3), celecoxib clearance is reduced by over 70%, doubling systemic exposure. Initiate treatment with 50% of the lowest recommended starting dose.',
        guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-nsaids-and-cyp2c9/',
      },
    ],
  },
  {
    gene: 'DPYD',
    defaultAllele: '*1',
    variants: [
      {
        rsid: 'rs3918290',
        starAllele: '*2A',
        variantAllele: 'A',
        referenceAllele: 'G',
        functionCategory: 'No Function',
        description: 'c.1905+1G>A (Splice donor mutation causing exon 14 skipping)',
      },
      {
        rsid: 'rs67376798',
        starAllele: 'c.2846A>T',
        variantAllele: 'T',
        referenceAllele: 'A',
        functionCategory: 'Decreased Function',
        description: 'p.Asp949Val (c.2846A>T)',
      },
    ],
    diplotypeToPhenotype: (alleles) => {
      const hasNoFunc = alleles.includes('*2A');
      const hasDecFunc = alleles.includes('c.2846A>T');
      if (hasNoFunc && alleles.filter(a => a === '*2A').length > 1) return { phenotype: 'Poor Metabolizer', activityScore: 0.0 };
      if (hasNoFunc || hasDecFunc) return { phenotype: 'Intermediate Metabolizer', activityScore: 1.0 };
      return { phenotype: 'Normal Metabolizer', activityScore: 2.0 };
    },
    drugs: [
      {
        drugName: 'Fluorouracil (5-FU) & Capecitabine',
        therapeuticArea: 'Oncology',
        cpicLevel: 'A',
        clinicalSummary: 'Pyrimidine analog chemotherapy agents.',
        recommendation: 'DPYD inactivates >80% of 5-FU. In Intermediate/Poor metabolizers, standard doses cause fatal myelosuppression, mucositis, and neurotoxicity. DPYD *2A requires minimum 50% dose reduction or complete drug avoidance.',
        guidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/',
      },
    ],
  },
];
