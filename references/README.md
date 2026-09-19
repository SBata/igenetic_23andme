# Reference provenance

Retrieved 2026-09-19. These are public reference variants, not individual genotype data.

## PGS000001

Source: Mavaddat et al., JNCI (2015), doi:10.1093/jnci/djv036, score PRS77_BC. [Catalog record](https://www.pgscatalog.org/score/PGS000001/).

Original compressed files, preserved unchanged:

- [GRCh37](https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/PGS000001/ScoringFiles/Harmonized/PGS000001_hmPOS_GRCh37.txt.gz)
- [GRCh38](https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/PGS000001/ScoringFiles/Harmonized/PGS000001_hmPOS_GRCh38.txt.gz)

The headers report original genome build and weight type as NR. We use the supplied harmonized positions and verify every `effect_weight` equals `ln(OR)` within 1e-14. Evaluation-cohort odds ratios are not converted into personal risk estimates.

Alleles were checked via POST `/variation/human` with the 77 public rsIDs to `https://rest.ensembl.org` (GRCh38) and `https://grch37.rest.ensembl.org` (GRCh37). JSON responses are archived here. Both builds must agree on orientation. Two non-palindromic pairs require complementation; seven palindromic pairs remain unresolved because an allele-set match cannot establish strand. No allele-frequency guessing is used.

`node scripts/build-reference.mjs` regenerates `src/lib/referenceData/score.json`. `--check` verifies it byte-for-byte without network access. All four archived files have SHA-256 hashes in that manifest and exported reports. Reference updates require reviewing source differences and rerunning tests.

## Terms and attribution

PGS Catalog requires appropriate citation and compliance with original authors' restrictions and [EMBL-EBI terms](https://www.ebi.ac.uk/about/terms-of-use/). The catalog record does not specify a standalone SPDX license for this score. EMBL-EBI adds no redistribution restrictions beyond original data-owner terms. These files are not relabeled MIT.

Ensembl-generated data are available without restriction under its [data policy](https://www.ensembl.org/info/about/legal/disclaimer.html), subject to third-party constraints. The archived responses identify their source as dbSNP. No manuscript text, figures or individual-level cohort data are redistributed.

Study-marker summaries are short original descriptions linked to their papers. PGx panels contain only reading-list marker IDs, with no copied guideline tables or dose recommendations.
