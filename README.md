# iGenetic

A browser-based notebook for inspecting 23andMe raw genotype exports. Files are processed locally; the app makes no live annotation requests and does not persist genotypes or results in browser storage.

This is a personal research project, not a diagnosis, prognosis, risk-stratification or treatment tool. Clinical certification is not a project requirement. The app now calculates traceable observed contributions to PGS000001; it does not turn them into personal disease probabilities. See [REVIEW.md](REVIEW.md) for the review history and current verification notes.

## What works

- Read an uncompressed TXT, TSV or CSV export, or a ZIP containing exactly one genotype text file.
- Inspect raw genotypes, missing calls and per-variant weights, dosages and signed score contributions.
- Search the full file locally by rsID or a 23andMe `i` marker identifier.
- Inspect call counts and genome-build metadata as supplied in the header.
- Export a JSON observation report that excludes the full raw genotype file.
- Try explicitly labelled synthetic data. It is not a scientific benchmark.

Limits: 32 MB input; 128 MB total expanded genotype text in ZIP; 1.5 million rows; 100 ZIP entries. GZIP and TAR archives must be extracted first. Malformed rows and duplicate marker IDs cause an error rather than silent partial analysis. Arbitrary CSV schemas and other DNA providers are not supported.

## Analysis status

| Analysis | Current behavior |
| --- | --- |
| Polygenic calculation | Observed PGS000001 weighted subtotal; incomplete, at most 70 of 77 rows |
| Percentile, relative or cumulative risk | Not calculated; no population calibration or baseline model is bundled |
| Missing genotypes | Remain unknown; no frequency substitution or imputation |
| PGx diplotypes, activity scores and dosing | Unavailable; raw panel observations only |
| ClinVar pathogenicity and carrier status | Unavailable; an empty result is not a negative screen |
| Study markers | Raw observations with source-linked study summaries, not personal predictions |
| Genome build / chip | Separate metadata from explicit headers; otherwise unknown |
| Liftover and ancestry inference | Not implemented |

The legacy score panels, invented population statistics and unsupported clinical table have been removed. All 77 PGS000001 rows are archived with GRCh37/38 positions and independent Ensembl allele evidence. Two reverse-strand rows are explicitly complemented; seven palindromic rows lack independent source-strand evidence and are excluded. Thus the output is an incomplete observed subtotal, not a reproduced complete model. Missing calls are never zero-filled, and subtotals with different coverage cannot be compared.

Each usable contribution is effect-allele dosage multiplied by published weight, retaining negative values. Compensated summation reduces floating-point accumulation error; JSON retains unrounded IEEE-754 numbers. This is not a guarantee of exact decimal arithmetic or scientific correctness. [Reference provenance](references/README.md) records sources, transformations, checksums and terms. The reproducible source manifest is included in exported reports.

## Architecture and privacy

`File → local Web Worker → parser → file QC → reference matching and scoring → React views / optional JSON export`

The Next.js server serves application assets. File reading, decompression, parsing and scoring execute in a local Web Worker. The small synthetic demo runs directly. This is a bounded in-memory parser, not a streaming parser.

Results live in React state and are discarded on refresh or Clear data. The previous version's `iGenetic_active_analysis` session-storage entry is removed on load and is never restored. Downloaded reports remain on the device. Browser memory cleanup is not a guarantee of forensic erasure.

Variant search makes no network requests. External reference/download links open third-party sites only when clicked; those visits are subject to the destination's privacy policy. A Content Security Policy limits connections to the app's own origin, and external links suppress referrer information. The hosting server still receives ordinary page/asset requests. No claim is made about browser extensions, a compromised device or a modified deployment.

## Development

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm start
node scripts/check-repository.mjs
```

The regression checks use TypeScript and Node assertions. They cover hand-calculated dosage sums, an independent Python Decimal result, signed contributions, cancellation error, strand corrections, palindromic uncertainty, both builds, parser/ZIP errors, QC, phase ambiguity, 700,000 synthetic rows and privacy boundaries. CI checks source reproducibility, tests, TypeScript, build and repository hygiene. Passing tests does not establish a predictive risk model.

Keep personal files outside Git or in ignored `private-data/`. Common export/report filenames and environment files are ignored. The repository scan checks reachable Git history and publishable working files for common secrets and raw genotype rows; it is not exhaustive. Do not attach personal reports to public issues.

## Scientific references

The bundled calculation uses Mavaddat et al. (2015), *Prediction of breast cancer risk based on profiling with common genetic variants*, [doi:10.1093/jnci/djv036](https://doi.org/10.1093/jnci/djv036), [PGS000001](https://www.pgscatalog.org/score/PGS000001/). The resources below provide methodological context, not blanket validation of this app.

1. Lambert et al. *The Polygenic Score Catalog as an open database for reproducibility and systematic evaluation.* Nature Genetics 53, 420–425 (2021). [Paper](https://www.nature.com/articles/s41588-021-00783-5), [PGS Catalog](https://www.pgscatalog.org/).
2. Relling & Klein. *CPIC: Clinical Pharmacogenetics Implementation Consortium of the Pharmacogenomics Research Network.* Clinical Pharmacology & Therapeutics 89, 464–467 (2011). [CPIC guidelines](https://cpicpgx.org/).
3. Landrum et al. *ClinVar: improving access to variant interpretations and supporting evidence.* Nucleic Acids Research 46, D1062–D1067 (2018). [Paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC5753237/).
4. 1000 Genomes Project Consortium. *A global reference for human genetic variation.* Nature 526, 68–74 (2015). [Paper](https://www.nature.com/articles/nature15393).
5. Cunningham et al. *Ensembl 2022.* Nucleic Acids Research 50, D988–D995 (2022). [Ensembl](https://www.ensembl.org/). Live Ensembl lookups have been removed from the app.

## Medical use and license

This software does not diagnose, rule out disease or provide medication recommendations. See [DISCLAIMER.md](DISCLAIMER.md). Code is licensed under [MIT](LICENSE); third-party data retain their own terms and are not relicensed by the code license.
