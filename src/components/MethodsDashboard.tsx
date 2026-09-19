import React from 'react';
export function MethodsDashboard() {
  return <section className="stack prose"><div className="section-heading"><h1>Methods and limits</h1><p>What this version does, and what its results cannot establish.</p></div>
    <h2>Local processing</h2><p>The browser reads a text file or a ZIP containing one text file, validates its rows and matches marker IDs against bundled panels. File processing runs in a local worker. There is no genotype upload, live annotation request or persistent result storage.</p>
    <h2>Polygenic and cumulative risk</h2><p>The bundled model is the complete 77-variant PGS000001 score from Mavaddat et al. (2015). Weights and GRCh37/38 positions come from the archived PGS Catalog files. Each contribution is forward-strand effect-allele dosage (0, 1 or 2) multiplied by the published weight. Negative contributions are retained. Compensated summation reduces floating-point accumulation error.</p><p>Missing calls, unsupported builds, mismatched coordinates and unexpected alleles are excluded with a visible reason. The observed subtotal is incomplete until every model variant is scored. No missing value is imputed or treated as zero. JSON retains numerical precision; the table rounds only for reading.</p><p>A weighted sum is not a disease probability. Odds ratios, relative risks and hazard ratios are different measures. No population percentiles or cumulative disease probabilities are calculated. This personal project does not require clinical certification.</p>
    <h2>Drug response and clinical variants</h2><p>Star-allele calls, medication recommendations, pathogenicity and carrier-status assignments are withheld. These require verified allele definitions, adequate coverage, phasing where relevant and condition-specific evidence. A missing result does not mean a normal or negative result.</p>
    <h2>Genome coordinates</h2><p>Genome build and chip version are separate metadata. Unknown or conflicting build information stays unknown. No liftover, ancestry inference or genotype imputation is performed.</p>
    <h2>References</h2><p>These resources describe methods and data standards; citing them does not validate this app. Links open external websites.</p><ul>
      <li><a href="https://www.pgscatalog.org/" target="_blank" rel="noopener noreferrer">PGS Catalog</a>: complete scoring files and study-specific evaluations.</li>
      <li><a href="https://cpicpgx.org/" target="_blank" rel="noopener noreferrer">CPIC</a>: gene- and drug-specific guidelines.</li>
      <li><a href="https://www.ncbi.nlm.nih.gov/clinvar/" target="_blank" rel="noopener noreferrer">ClinVar</a>: variant- and condition-specific classifications.</li>
    </ul>
  </section>;
}
