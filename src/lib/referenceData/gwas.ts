import { GWASTrait } from '@/types/genomics';

export const CURATED_GWAS_TRAITS: GWASTrait[] = [
  {
    rsid: 'rs762551',
    trait: 'Caffeine Metabolism Speed',
    category: 'Nutrition & Diet',
    gene: 'CYP1A2',
    effectAllele: 'A',
    effectSize: 'Beta +1.28 (Inducibility)',
    pValue: 1.2e-28,
    pubmedId: '16522833',
    studyTitle: 'Coffee, CYP1A2 genotype, and risk of myocardial infarction. JAMA 2006.',
    interpretationSummary: {
      'AA': 'Fast Caffeine Metabolizer: High CYP1A2 enzyme activity. Moderate-to-high coffee consumption does not increase cardiovascular risk and provides antioxidant benefit.',
      'AC': 'Slow Caffeine Metabolizer: Intermediate enzyme activity. Slower clearance of caffeine from circulation.',
      'CC': 'Slow Caffeine Metabolizer: Low CYP1A2 activity. High coffee intake (>2-3 cups/day) is associated with prolonged caffeine half-life and elevated blood pressure.',
    },
  },
  {
    rsid: 'rs4988235',
    trait: 'Lactase Persistence (Adult Lactose Tolerance)',
    category: 'Nutrition & Diet',
    gene: 'MCM6 / LCT',
    effectAllele: 'A', // often reported as A (or T on reverse)
    effectSize: 'OR 18.5',
    pValue: 1e-150,
    pubmedId: '11788828',
    studyTitle: 'Identification of a variant associated with adult-type hypolactasia. Nat Genet 2002.',
    interpretationSummary: {
      'AA': 'Lactase Persistent (Tolerant): Continued production of the lactase enzyme into adulthood. Full ability to digest lactose in dairy products.',
      'AG': 'Lactase Persistent (Tolerant): Carrier of one persistence allele; capable of digesting lactose normally.',
      'GG': 'Lactase Non-Persistent (Intolerant): Typical mammalian down-regulation of intestinal lactase expression in adulthood, causing bloating, gas, or GI discomfort upon consuming milk.',
      'TT': 'Lactase Persistent (Tolerant): Full ability to digest lactose.',
      'CT': 'Lactase Persistent (Tolerant): Capable of digesting lactose normally.',
      'CC': 'Lactase Non-Persistent (Intolerant): Predisposed to adult lactose malabsorption.',
    },
  },
  {
    rsid: 'rs671',
    trait: 'Alcohol Flush Reaction & Acetaldehyde Toxicity',
    category: 'Metabolism',
    gene: 'ALDH2',
    effectAllele: 'A', // Glu504Lys
    effectSize: 'OR 48.0',
    pValue: 1e-200,
    pubmedId: '19278272',
    studyTitle: 'The alcohol flushing response: an unrecognized risk factor for esophageal cancer. PLoS Med 2009.',
    interpretationSummary: {
      'GG': 'Normal Alcohol Metabolism: Active ALDH2 aldehyde dehydrogenase enzyme efficiently oxidizes toxic acetaldehyde to acetate.',
      'AG': 'Atypical Alcohol Flush Reaction: Marked deficiency in ALDH2 activity (~10-20% normal). Rapid accumulation of carcinogenic acetaldehyde causes facial flushing, tachycardia, and nausea.',
      'AA': 'Severe ALDH2 Deficiency: Near zero enzymatic activity. Severe adverse reactions to small amounts of alcohol.',
    },
  },
  {
    rsid: 'rs1815739',
    trait: 'Alpha-Actinin-3 Muscle Fiber Composition (Power vs. Endurance)',
    category: 'Fitness & Performance',
    gene: 'ACTN3',
    effectAllele: 'C', // R577 (C) vs X577 (T)
    effectSize: 'OR 2.1 (Sprint athlete enrichment)',
    pValue: 4.5e-14,
    pubmedId: '12879006',
    studyTitle: 'ACTN3 genotype is associated with human elite athletic performance. Am J Hum Genet 2003.',
    interpretationSummary: {
      'CC': 'Power / Sprint Advantage (R/R): Normal alpha-actinin-3 expression in fast-twitch (Type II) muscle fibers. Optimized for explosive power, sprinting, and force generation.',
      'CT': 'Mixed Muscle Profile (R/X): Intermediate fast-twitch force generation with good metabolic endurance adaptation.',
      'TT': 'Endurance Optimized (X/X): Complete lack of alpha-actinin-3 in fast-twitch fibers without muscle pathology. Increased slow-twitch oxidative efficiency favoring endurance sports.',
    },
  },
  {
    rsid: 'rs713598',
    trait: 'Bitter Taste Sensitivity (PROP / Glucosinolates in Cruciferous Veggies)',
    category: 'Nutrition & Diet',
    gene: 'TAS2R38',
    effectAllele: 'G', // Pro49Ala (PAV taster vs AVI non-taster)
    effectSize: 'OR 8.4',
    pValue: 1.1e-45,
    pubmedId: '12595690',
    studyTitle: 'Natural variation in human bitter taste perception. Science 2003.',
    interpretationSummary: {
      'GG': 'Super-Taster (PAV/PAV): High sensitivity to bitter glucosinolates in broccoli, Brussels sprouts, kale, and coffee.',
      'CG': 'Medium Taster (PAV/AVI): Moderate sensitivity to bitter compounds.',
      'CC': 'Non-Taster (AVI/AVI): Low sensitivity to bitter tasting compounds; less likely to find cruciferous vegetables unpleasantly bitter.',
    },
  },
  {
    rsid: 'rs1801260',
    trait: 'Circadian Preference (Morning Lark vs. Night Owl)',
    category: 'Sleep & Chronotype',
    gene: 'CLOCK',
    effectAllele: 'C', // 3111T>C
    effectSize: 'OR 1.35',
    pValue: 8.8e-10,
    pubmedId: '9845347',
    studyTitle: 'Association of a human CLOCK gene polymorphism with evening preference. Sleep 1998.',
    interpretationSummary: {
      'TT': 'Morning Chronotype ("Lark"): Natural predisposition for earlier sleep onset, spontaneous early morning waking, and peak cognitive performance in the first half of the day.',
      'TC': 'Intermediate / Evening Tendency: Slight shift toward later bedtimes.',
      'CC': 'Evening Chronotype ("Night Owl"): Predisposition for delayed sleep phase, higher alertness during evening hours, and difficulty with very early schedules.',
    },
  },
  {
    rsid: 'rs5082',
    trait: 'Saturated Fat Intake & Weight Sensitivity',
    category: 'Nutrition & Diet',
    gene: 'APOA2',
    effectAllele: 'C', // -265T>C
    effectSize: 'Beta +1.84 BMI units under high-fat diet',
    pValue: 3.1e-12,
    pubmedId: '19820098',
    studyTitle: 'APOA2 -265T>C is associated with obesity in interaction with saturated fat intake. Arch Intern Med 2009.',
    interpretationSummary: {
      'TT': 'Low Saturated Fat Sensitivity: Saturated fat intake has standard population-level impact on BMI.',
      'TC': 'Low Saturated Fat Sensitivity: Standard metabolic response to dietary fats.',
      'CC': 'High Saturated Fat Sensitivity: High saturated fat intake (>22g/day) is strongly linked to elevated BMI, increased visceral adiposity, and insulin resistance. Low saturated fat diet is particularly effective for weight management.',
    },
  },
];
