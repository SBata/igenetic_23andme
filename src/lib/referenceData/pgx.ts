// These are reading-list markers, not complete allele definitions or dosing rules.
export const CURATED_PGX_GENES = [
  { gene: 'CYP2C19', variants: ['rs4244285', 'rs4986893', 'rs12248560'] },
  { gene: 'SLCO1B1', variants: ['rs4149056'] },
  { gene: 'CYP2C9', variants: ['rs1799853', 'rs1057910'] },
  { gene: 'VKORC1', variants: ['rs9923231'] },
  { gene: 'DPYD', variants: ['rs3918290', 'rs67376798'] },
].map(panel => ({ ...panel, variants: panel.variants.map(rsid => ({ rsid })) }));
