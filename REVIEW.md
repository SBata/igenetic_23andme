# iGenetic architecture, calculations and UI review

Reviewed 2026-09-19. Scope: a personal open-source research notebook. Clinical certification is not a requirement or release gate.

## Five-model restoration and results redesign

The earlier one-model limitation is superseded: source-backed replacements now cover CAD (PGS000011), T2D (PGS000031), Alzheimer's excluding APOE (PGS000025), and AFib (PGS000035), alongside breast cancer. These are different published models from the incorrectly labelled legacy miniature panels, not a reinstatement of their weights or invented population statistics. All 1,376 source rows remain visible; unresolved assignments remain excluded. See `references/README.md` for provenance and maximum eligible counts.

Each usable variant shows its recorded genotype, counted allele, published association direction and signed contribution. Zero dosage is explicitly distinct from protection and from a missing/excluded call. AFib uses score-direction wording because its weight unit is unreported in the Catalog. Model-specific sums are not compared to a population average or combined across diseases. Independent Decimal oracles over archived TSV weights pass for all five models in both builds.

Direction and purpose are recorded in `DESIGN.md`: modern science dashboard, ENERGY 2 / RHYTHM 2 / MOTION 1. A visible model browser replaces the hidden single-option select. Coverage stays beside the subtotal, and diverging bars show the largest observed contributions. Variant tables reflow into readable rows on phones. Search, directional filters and progressive row disclosure support the 1,168-row AFib model. No UI/chart dependencies were added.

Browser evidence: all five trait buttons select their respective model/count/subtotal; all four directional filters update matching counts; exclusions show explanations; an unknown search produces an empty state; Show 30 more increases displayed rows from 30 to 60; both method disclosures open; all seven application views navigate; keyboard Tab moves from search to the labelled select with visible focus. Export opens with Download JSON and closes with Escape. Fixed a React development-mode cleanup/close-event race that dismissed Export immediately. Synthetic data only was used.

Antislop delivery gate:
- Hard gate PASS: built app; desktop and 390px browser review; document width equals 390px and mobile variant rows fit. Changed controls exercised as listed above. Body/muted/higher/lower text contrast is 14.27/5.72/6.77/7.34:1; summary secondary text is 10.65:1. No invented risk statistics or decorative assets.
- Purpose gate PASS: coverage belongs beside arithmetic; diverging bars encode signed magnitude; teal/copper direction is also expressed in words and signs; the model browser exposes the restored content. Reasons recorded in `DESIGN.md`.
- Liveliness PASS: the dark numerical surface provides a focal point; type scale, model selection and quieter provenance establish hierarchy; chart and variant rows vary composition at the declared 2/2/1 dials.
- Craftsmanship PASS: tests, source regeneration, TypeScript and build pass; filters, empty states, responsive rows, keyboard focus and export controls verified. Local computation and absence of genotype network requests remain covered by source checks.

## Earlier one-model implementation update

1. Restored additive calculations with build/coordinate/allele checks, signed contributions, explicit missingness and compensated summation. No cross-disease probability aggregation. Unphased PGx inputs remain observations; CYP2C9 and VKORC1 are separate panels.
2. Replaced mislabeled mini-panels with archived PGS000001 source rows and a reproducible manifest. Checked allele orientation against both Ensembl builds. Corrected two reverse-strand rows and excluded seven unresolved palindromic rows. The UI labels the result an incomplete subtotal, at most 70/77 variants.
3. Added hand-calculated arithmetic tests, an independent Decimal fixture, orientation regressions, cancellation error, both builds and ingestion edge cases. Privacy and full-file-retention checks remain.
4. Added a local worker for file analysis and a native JSON download link. The 700,000-row synthetic fixture processed in approximately 0.8 seconds in Node on the review machine; this is not a browser timing guarantee.
5. Added GitHub Actions, source hashes, data attribution, repository scanning and export/environment ignore rules. Removed unused chart/icon/classname dependencies. Upgraded to Next.js 16.3.5 / React 19; dependency audit reported zero known vulnerabilities.

Tests, reference regeneration, TypeScript and production build passed. The initial history scan checked 40 unique blobs across seven reachable commits and found no raw genotype rows or common secret patterns. This scan is not exhaustive.

Seven unresolved source-strand assignments prevent a complete PGS000001 score. That is a source-evidence limitation, not a certification requirement. Browser review confirmed the synthetic subtotal 1.624445643 and 77 contribution rows. Chrome's extension file chooser lacked permission, so the native OS picker was used successfully without changing settings. The production worker processed 700,077 synthetic rows, displayed progress and retained all rows, with no console errors. The schema-3 JSON report was saved through Chrome's native Save dialog and parsed independently: expected subtotal, 77 contributions, four source hashes, and no full raw file.

Mobile verification at 375 pixels showed document width 375, with wide tables scrolling inside their container. Desktop layout was inspected in Chrome. Native Escape closes the export dialog; all seven navigation controls and the five PGx disclosures were exercised. Search returned the corrected-strand marker at its input coordinate; clear-data returned to intake. No browser permissions were changed.

### UI direction

Research notebook for personal exploration; ENERGY 1 / RHYTHM 1 / MOTION 1. Georgia headings establish a notebook voice, system sans-serif supports dense data, and monospace is reserved for identifiers. Green marks actions and focus. The off-white reading surface and ruled tables support long contribution lists. Native disclosure controls reveal detail on demand; spacing separates inputs, numerical output and evidence. The existing reading-oriented light theme is retained, with no decorative motion or icons.

### Current Antislop delivery gate

- Hard gate PASS: production build and all seven views exercised; real file import and JSON save verified in Chrome; 375px document width equals viewport; keyboard Enter operates disclosures and Escape closes the dialog; visible focus was inspected. Calculated text contrast is 12.99:1 for body, 6.05:1 for muted text, 7.81:1 for links on white and 5.30:1 for muted text on the tinted surface. Loading, empty and error states are implemented. No invented outcome metrics or testimonials appear.
- Purpose gate PASS: ruled tables compare contribution inputs; native disclosures contain method detail; identifier monospace prevents confusion with prose. No decorative gradients, glows, icon library, floating cards or animations remain. Design reasons are recorded above.
- Liveliness PASS: retained notebook direction and 1/1/1 dials; the subtotal is the result focal point, spacing separates evidence, green identifies actions/focus, and the serif notebook heading repeats across views.
- Craftsmanship PASS: the model source is linked; raw and partial scores remain distinct; original numerical precision is retained in JSON; navigation, search, clear, demo, file picker, disclosures and export have exercised behavior. Tables scroll within their own container rather than widening the page.

The final checks ran in `/Users/seb/Documents/iGenetic`: reference reproducibility, regression tests, TypeScript, production build, repository scan and `git diff --check` passed. No commit, push or deployment was performed.

## Historical first-pass review

The following findings and initial dispositions are retained as review history. The current implementation above supersedes statements below that all numerical scoring remains disabled. The original implementation could not reliably reproduce its claimed calculations.

## Findings and disposition

Locations below identify the original code paths. Those paths have been removed or replaced in the reviewed version.

| Priority | Finding | Evidence and consequence | Disposition |
| --- | --- | --- | --- |
| P0 | Effect alleles and their complements are both counted | `engine.ts`, PRS/PGx/ClinVar loops: `char === allele || char === complement`. For a C/G or A/T locus, every diploid call gets dosage 2 regardless of which allele is present. | Removed these clinical calculation paths. No guessed strand conversion. |
| P0 | The bundled panels are not the named published scores | `referenceData/prs.ts` contains 10 CAD, 8 T2D, 6 breast cancer, 4 AF and 5 Alzheimer markers. Official PGS000013 has 6,630,150 variants; PGS000036 has 171,249; PGS000015 has 5,218. PGS000021 is type 1 diabetes, not AF. | All score/percentile/risk fields are unavailable. Panels receive local `unvalidated-*` identifiers. |
| P0 | Invented risk calibration | `engine.ts` uses `exp(0.4 * z)` for every disease. No per-model source for 0.4, no baseline incidence, time horizon, covariates or validated population distribution. | Removed the calculation. No substitute multiplier. |
| P0 | Missing data produces personal risk | Missing markers receive `2 * referenceAlleleFreqEUR`, then arbitrary population normalization; every population uses the same European substitutions. Entirely missing input still produces elevated CAD and T2D results. | Missing calls stay unknown; no imputation, percentiles or risk labels. |
| P0 | PGx invents normal function and phase | No observed markers defaults to two normal alleles. Multiple variants are flattened into a list and the first two are called a diplotype. CYP2C9 and VKORC1 variants are mixed into the same pair. | All PGx phenotype calls are Indeterminate, with no activity scores or medication recommendations. Raw marker observations remain available. |
| P0 | Clinical interpretation is not defensible | ClinVar definitions lack versioned allele/build and condition-specific provenance. The engine matches a risk base or its complement; the UI declares heterozygotes “healthy” using gene-name/string heuristics. Indels and compound heterozygosity are not resolved. | Pathogenicity and carrier-status output suspended. Empty output explicitly means interpretation unavailable, not a negative screen. |
| P1 | The UI fabricates individualized advice | PRS CAD copy says everyone has homozygous 9p21 risk, and a fixed question asserts the 99th percentile. Negative contributions display as 0.00. Population switching changes the percentile but not the EUR risk tier/RR. GWAS advice makes deterministic diet, sleep and athletic claims. | Removed personalized advice, misleading gauges and risk colors. Added raw observations and explicit limitations. |
| P1 | Privacy claims conflict with behavior | Variant search sends the searched rsID to Ensembl. Results and 10,000 raw variants are persisted in sessionStorage. Restoring the report silently loses all later raw markers. | Removed remote lookup and persistence. Full file stays in page state. Old cached reports are discarded. |
| P1 | Build and chip are conflated | `qc.ts` assumes v5 means GRCh38, defaults unknown files to v5/GRCh38 and relabels build 36 as GRCh37. No liftover exists. | Read explicit chip and build metadata independently; preserve NCBI36 and unknown/conflicting builds. No conversion claim. |
| P1 | Input is silently accepted or overwritten | Parser accepts any row with a parseable position prefix; engine map overwrites duplicate IDs. Invalid calls can count as observations. ZIP decompression has no input/output cap or single-file requirement. | Strict row validation, duplicate rejection, no-call recognition and archive/file limits. |
| P2 | QC is given unwarranted clinical meaning | Zero transversions returns an invented 2.1. A heterozygous array-marker ratio is compared with a universal sequencing-like expectation. Haploid calls count as homozygotes. | Undefined ratio is null, haploid calls excluded from diploid zygosity counts, and no QC certification is shown. |
| P2 | Architecture/documentation diverge | README and Methods claim Web Workers, full PGS models, ancestry-matched reference data, liftover and clinical rigor. None is implemented. | Rewrote both around actual behavior. |
| P2 | UI has accessibility and density defects | Tiny monospace text, many badges/cards, decorative icons, clickable chromosome divs, weak focus states and a non-native modal. | Simplified reading layout, labelled inputs, semantic tables, focus indicators, native details/dialog and responsive navigation. |

Official model metadata: [PGS000013](https://www.pgscatalog.org/score/PGS000013/), [PGS000036](https://www.pgscatalog.org/score/PGS000036/), [PGS000015](https://www.pgscatalog.org/score/PGS000015/), [PGS000021](https://www.pgscatalog.org/score/PGS000021/). PGS000015 is sourced to Khera et al., not the Mavaddat citation in the original panel. PGS000042 could not be retrieved during this review; its identity is not certified here.

23andMe documents the reference assembly and strand separately in [its support documentation](https://support.23andme.org/hc/en-us/articles/42965348688279-Which-Reference-Genome-and-Strand-Does-23andMe-Use). ClinVar review status is attached to classification records, not a guarantee of the individual's genotype or diagnosis: [NCBI documentation](https://www.ncbi.nlm.nih.gov/clinvar/docs/review_status/).

## Reproduced failures in the original engine

These examples used only synthetic input, before applying changes.

| Synthetic input | Original output |
| --- | --- |
| No variants supplied to the engine | CAD 93.5th percentile, 1.83× “relative risk,” Elevated; T2D 94.1th percentile, 1.87×, Elevated |
| No PGx variants | All four panels called Normal Metabolizer |
| rs1801282 = GG, panel effect allele C | 0.284 contribution, equivalent to two C alleles; direct C dosage is zero |
| rs1799945 = CC, panel risk allele G | Two copies of the alleged risk allele |
| rs67376798 = AA, panel variant allele T | c.2846A>T/c.2846A>T; Intermediate Metabolizer |

The empty-input example exercises the engine directly. A parsed file containing only unrelated markers reaches the same missing-panel behavior. These failures are not floating-point rounding errors.

## Requirements before restoring scores

1. Choose one specific published score for one defined outcome. Obtain its complete scoring file, exact build, license, version/checksum and primary publication. Verify each allele, weight type and dosage convention. A small hand-picked subset is a new, unvalidated model.
2. Harmonize the input to that model. Verify chromosome/position, plus/minus orientation and allowed allele pair; resolve or reject duplicate/multiallelic/indel records. For A/T and C/G loci, allele letters alone cannot establish strand. Preserve no-calls. Model ploidy explicitly.
3. Reproduce the published calculation and preprocessing, including linkage disequilibrium treatment and any non-additive or haplotype terms. Nearby SNPs are not independent observations by default. APOE isoforms cannot be inferred by treating two SNPs as independent risk statements in all genotypes.
4. Follow a validated missing-data policy. A population mean dosage is not recovery of the person's missing genotype. It changes the score distribution and uncertainty; it cannot justify “unbiased individual risk.” No-call and low-coverage cases need a specified failure threshold and validation evidence.
5. Calibrate against a documented, compatible reference cohort using the same variant set and preprocessing. Validate ancestry/population transfer, centering, scale, percentile distribution and uncertainty. Variant-count coverage alone is not reliability; a missing high-weight locus can dominate error.
6. Keep score, odds ratio, hazard ratio, relative risk and absolute risk separate. A standardization coefficient must be model-specific and supported by validation. A disease probability requires a baseline model and defined period. Scores for different diseases cannot simply be added or multiplied into “cumulative risk.”
7. Establish independent expected-output fixtures. Compare against a trusted implementation on known genotypes, including reverse strands, palindromic pairs, protective effects, missing high-weight loci, duplicate records, multiple variants in one gene and ancestry/calibration boundaries. Report numeric tolerances before choosing the arithmetic representation. Rounding belongs only in display formatting.
8. Have a qualified statistical geneticist and clinical domain reviewer review the selected model and user-facing interpretation before using the results for health decisions.

The [PGS Catalog scoring-file specification](https://www.pgscatalog.org/downloads/) defines effect/other alleles and weight metadata. [Its evaluation metadata](https://www.pgscatalog.org/docs/) distinguishes standardized effects, odds/hazard ratios, covariates and cohort-specific performance. [CPIC's CYP2C19/clopidogrel guideline](https://files.cpicpgx.org/data/guideline/publication/clopidogrel/2022/35034351.pdf) is a gene/drug-specific source, not validation of the app's generic diplotype construction.

## Architecture decision

Retained Next.js, React and the existing archive dependency. No new production dependency, server-side DNA pipeline or speculative scoring framework was added. The shortest reliable fix was to stop returning unvalidated clinical numbers at the engine boundary, not add UI disclaimers around them.

The current parser is synchronous after reading/decompression. It can block rendering and uses several in-memory representations. Input caps reduce exposure but do not prove every supported device can process the largest file. A dedicated Worker with cancellation and bounded streaming decompression should precede full genome-wide scoring. No hosted service or live ancestry reference lookup is needed for a private design; any curated models/reference data should be versioned, bundled and validated separately.

No deployment, dependency upgrade or Git commit was performed. The existing dependency versions remain and require a separate supported-version/advisory review before public deployment.

## Validation evidence

- `npm test`: passed parser, duplicate, malformed/no-call, archive, size-limit, explicit/conflicting build, QC and full-file-retention checks. Tested unavailable score outputs across all ten unordered diploid SNP genotypes plus missing/haploid input, and ambiguous/multi-marker PGx inputs.
- `npm run typecheck`: passed.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: passed. Route `/` prerendered; approximately 110 kB first-load JavaScript.
- Browser: synthetic demo opens with a persistent demo label; panel selection changes observed counts; all four PGx disclosure rows open; Clinical variants clearly reports unavailable; Study markers filter produces a useful empty state; local search returns a recorded genotype and a distinct missing-marker message.
- Browser: Export opens a native modal; Escape dismisses it. Download was clicked without console errors, but the in-app browser did not return a download event. File save is not certified by this test.
- Browser: File quality and its additional-count disclosure render; Methods opens; Clear data returns to the file picker; malformed synthetic input displays a line-specific error and allows retry.
- Browser: 375 px layout checked; document and body scroll widths both equal the viewport width. Navigation scrolls within its own row. Default viewport and mobile intake were inspected visually. Broader device/browser testing remains outstanding.
- No real user genotype file was opened or transmitted. Runtime packet capture and forensic storage verification were not performed. Source checks guard against fetch/XHR/WebSocket/beacon calls and storage writes; the app's response sets same-origin connection restrictions.

## Antislop UI / Ponytail notes

Applied the requested cleanup while fixing existing views. Kept the light reading context, removed “PRO,” “research-grade,” “zero-knowledge” claims, decorative icons, risk gauges and individualized advice. Labels now name the actual action and unavailable states identify their cause.

There was no owner-supplied DESIGN.md. The visual styling is a **draft without direction**, ENERGY 1 / RHYTHM 1 / MOTION 1, not a certified final brand design. Serif headings distinguish the notebook's reading hierarchy; system sans-serif supports long explanations; monospace is limited to genotype/marker values. The muted green identifies the file action and notice surfaces; it never encodes medical safety. Tables support direct marker comparison; disclosures keep methodological detail accessible. The page stays light for reading/export continuity. No decorative motion or visual assets were added.

Delivery gate evidence: copy claims and controls were inspected; source contains no decorative emoji or risk verdicts; native inputs/disclosures/dialog support keyboard interaction and visible focus. The automated checks/build passed and the browser flows above were exercised. The full design gate remains **incomplete** because brand direction, exhaustive keyboard/contrast/device coverage and saved-download verification are outstanding. This is a safety/correctness patch and review, not a claim of clinical or final design readiness.
