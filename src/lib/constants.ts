// Chromosome lengths for GRCh38 (base pairs) for Ideogram scaling
export const GRCH38_CHROMOSOME_LENGTHS: { [chr: string]: number } = {
  '1': 248956422,
  '2': 242193529,
  '3': 198295559,
  '4': 190214555,
  '5': 181538259,
  '6': 170805979,
  '7': 159345973,
  '8': 145138636,
  '9': 138394717,
  '10': 133797422,
  '11': 135086622,
  '12': 133275309,
  '13': 114364328,
  '14': 107043718,
  '15': 101991189,
  '16': 90338345,
  '17': 83257441,
  '18': 80373285,
  '19': 58617616,
  '20': 64444167,
  '21': 46709983,
  '22': 50818468,
  'X': 156040895,
  'Y': 57227415,
  'MT': 16569,
};

// Distinctive marker fingerprints for chip version identification
export const CHIP_FINGERPRINTS = {
  // Markers predominantly introduced in v5 (Illumina Global Screening Array - GSA)
  v5_specific_snps: ['rs76735552', 'rs143360432', 'rs148418042', 'rs190853081', 'rs187599908'],
  // Markers prevalent on v4 (Custom Illumina OmniExpress-24)
  v4_specific_snps: ['rs28936678', 'rs1800562', 'rs113488022', 'rs61753728'],
  // Markers prevalent on v3 (Illumina OmniExpress)
  v3_specific_snps: ['rs1801133', 'rs1801131', 'rs12979860'],
};

// Transition pairs: A <-> G (Purine <-> Purine), C <-> T (Pyrimidine <-> Pyrimidine)
export const TRANSITIONS = new Set(['AG', 'GA', 'CT', 'TC']);
// Transversion pairs: Purine <-> Pyrimidine
export const TRANSVERSIONS = new Set([
  'AC', 'CA', 'AT', 'TA',
  'GC', 'CG', 'GT', 'TG'
]);

// ACMG 81 Actionable Secondary Findings Genes (v3.2)
export const ACMG_SECONDARY_FINDINGS_GENES = new Set([
  'ACTA2', 'ACTC1', 'APC', 'APOB', 'ATP7B', 'BAG3', 'BMPR1A', 'BRCA1', 'BRCA2', 
  'BTD', 'CACNA1S', 'CALM1', 'CALM2', 'CALM3', 'CASQ2', 'COL3A1', 'DES', 'DSC2', 
  'DSG2', 'DSP', 'ENG', 'FBN1', 'FLNC', 'GAA', 'GLA', 'HFE', 'HNF1A', 'KCNH2', 
  'KCNQ1', 'LDLR', 'LMNA', 'MAX', 'MEN1', 'MLH1', 'MSH2', 'MSH6', 'MUTYH', 
  'MYBPC3', 'MYH11', 'MYH7', 'MYL2', 'MYL3', 'NF2', 'OTC', 'PALB2', 'PCSK9', 
  'PKP2', 'PMS2', 'PRKAG2', 'PTEN', 'RB1', 'RET', 'RIT1', 'RYR1', 'RYR2', 
  'SCN5A', 'SDHAF2', 'SDHB', 'SDHC', 'SDHD', 'SMAD3', 'SMAD4', 'STK11', 'TGFBR1', 
  'TGFBR2', 'TMEM127', 'TMEM43', 'TNNC1', 'TNNI3', 'TNNT2', 'TP53', 'TPM1', 
  'TRDN', 'TSC1', 'TSC2', 'TTN', 'TTR', 'VHL', 'WT1'
]);
