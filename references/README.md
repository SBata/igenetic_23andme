# Reference provenance

Retrieved 2026-09-19. These are public reference variants, not individual genotype data.

## Additional published models

The redesigned model browser restores four traits using actual published models rather than the old miniature panels:

- [PGS000011](https://www.pgscatalog.org/score/PGS000011/): Tada et al., 50 CAD variants, [doi:10.1093/eurheartj/ehv462](https://doi.org/10.1093/eurheartj/ehv462).
- [PGS000031](https://www.pgscatalog.org/score/PGS000031/): Vassy et al., 62 type 2 diabetes variants, [doi:10.2337/db13-1663](https://doi.org/10.2337/db13-1663).
- [PGS000025](https://www.pgscatalog.org/score/PGS000025/): Chouraki et al., 19 Alzheimer's variants excluding APOE, [doi:10.3233/JAD-150749](https://doi.org/10.3233/JAD-150749).
- [PGS000035](https://www.pgscatalog.org/score/PGS000035/): Weng et al., 1,168 AFib variants, [doi:10.1161/CIRCULATIONAHA.117.031431](https://doi.org/10.1161/CIRCULATIONAHA.117.031431).

Each `PGS*.json` archives the public Catalog metadata. Each pair of harmonized score files comes from `https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/{ID}/ScoringFiles/Harmonized/{ID}_hmPOS_GRCh{37|38}.txt.gz`. The two `additional-ensembl-*.json.gz` archives contain public variation responses for 1,299 unique reference IDs, requested in batches from `/variation/human` on `grch37.rest.ensembl.org` and `rest.ensembl.org`. No user genotypes are involved.

`node scripts/build-additional-references.mjs` regenerates the bundled model JSON; `--check` verifies reproducibility without writing. It checks row counts, unique IDs, cross-build agreement and finite weights, and compares the three OR-bearing models' weights to ln(OR), allowing their published rounding. AFib's weight unit is unreported in the Catalog and is not relabelled as log odds.

Known source allele pairs are reconciled with a unique forward-strand position in both Ensembl builds. Missing source other alleles are accepted only when the Catalog's inferred allele is a single base and the evidence agrees. Multi-allelic inferred pairs, incompatible assignments, non-SNP rows and unresolved palindromic strand assignments remain in the model with an exclusion reason. No frequency-based strand guessing is used. Eligible reference rows: CAD 39/50, T2D 42/62, Alzheimer's 16/19, AFib 747/1,168. This is a conservative observed-subtotal implementation, not a reproduction of the studies' calibrated predictions.

All archived inputs have SHA-256 hashes in the generated manifest and JSON exports. Published weights are preserved, not recomputed from rounded ORs. Independent Python Decimal oracles over source TSV weights (repeating dosages 0/1/2, eligible rows only) are 3.101764440512624150, 3.008759171302229152, 1.725744316 and 140.3257 respectively; the regression suite checks both builds against these values. Source metadata retains the Catalog's license statement; authors' restrictions and EBI terms apply. The app code's MIT license does not relicense reference data.

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
