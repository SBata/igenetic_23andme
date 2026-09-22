import React, { useState } from 'react';
import type { PRSResult, VariantObservation } from '@/types/genomics';
import { contributionDirection, type Contribution } from '@/lib/scoring';

export function ObservationTable({ observations }: { observations: VariantObservation[] }) {
  return <div className="table-scroll"><table>
    <thead><tr><th scope="col">Marker</th><th scope="col">Genotype in file</th><th scope="col">Availability</th></tr></thead>
    <tbody>{observations.map(v => <tr key={v.rsid}>
      <th scope="row"><code>{v.rsid}</code></th><td><code>{v.genotype ?? 'Not in file'}</code></td>
      <td>{v.status === 'observed' ? 'Recorded call' : v.status === 'missing' ? 'Missing' : 'No usable call'}</td>
    </tr>)}</tbody>
  </table></div>;
}

const signed = (value: number) => `${value > 0 ? '+' : ''}${Number(value.toPrecision(6))}`;
const exclusion: Record<Contribution['status'], string> = {
  scored: '', missing: 'Not present in this file', uncalled: 'No usable diploid call',
  'unsupported-build': 'Genome build is unknown or unsupported', 'coordinate-mismatch': 'Position differs from the model',
  'allele-mismatch': 'Alleles differ from the model', 'ambiguous-strand': 'Source strand is unresolved (A/T or C/G)',
  'unresolved-reference': 'Reference allele assignment is unresolved',
};

export function PRSDashboard({ prsResults }: { prsResults: PRSResult[] }) {
  const [selected, setSelected] = useState(prsResults[0]?.modelId ?? '');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(30);
  const result = prsResults.find(r => r.modelId === selected);
  if (!result) return <section className="stack"><h1>Polygenic scores</h1><p>No published models are bundled.</p></section>;
  const scored = result.contributions.filter(r => r.contribution !== null);
  const ranked = [...scored].sort((a, b) => Math.abs(b.contribution!) - Math.abs(a.contribution!));
  const leading = ranked.filter(r => r.contribution !== 0).slice(0, 6);
  const max = Math.max(...leading.map(r => Math.abs(r.contribution!)), 1e-12);
  const higher = scored.filter(r => r.contribution! > 0).length;
  const lower = scored.filter(r => r.contribution! < 0).length;
  const rows = [...result.contributions].sort((a, b) => Number(b.contribution !== null) - Number(a.contribution !== null) || Math.abs(b.contribution ?? 0) - Math.abs(a.contribution ?? 0)).filter(row =>
    `${row.rsid} ${row.gene}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || contributionDirection(row) === filter));
  return <section className="stack prs-workspace">
    <div className="workspace-heading"><div><h1>Polygenic scores</h1><p className="muted">See which variants contribute, in which direction, and why.</p></div><span className="library-count">{prsResults.length} published models</span></div>
    <div className="score-layout">
      <aside className="model-browser" aria-label="Published models">
        <h2>Choose a trait</h2>
        {prsResults.map(model => <button key={model.modelId} aria-pressed={model.modelId === selected} onClick={() => { setSelected(model.modelId); setQuery(''); setFilter('all'); setLimit(30); }}>
          <span className="model-category">{model.category}</span><strong>{model.traitName}</strong>
          <span>{model.observedVariantsCount.toLocaleString()} / {model.totalVariantsInModel.toLocaleString()} scored</span>
          <span className="mini-coverage" aria-hidden="true"><span style={{ width: `${model.coveragePercentage}%` }} /></span>
        </button>)}
        <details className="library-note"><summary>What changed?</summary><p>The old miniature panels did not reproduce their cited models. These replacements use archived published weights. Model identifiers and variant counts have changed; earlier numbers are not comparable.</p></details>
      </aside>
      <div className="stack score-content">
        <div className="trait-heading"><span className="model-id">{result.modelId}</span><h2>{result.traitName}</h2><p>{result.description}</p><a href={result.source} target="_blank" rel="noopener noreferrer">{result.citation}</a></div>
        <section className="score-summary" aria-label="Score and coverage">
          <div className="subtotal"><h3>{result.rawScore !== null ? 'Complete raw sum' : 'Observed subtotal'}</h3><p className="score-value">{result.observedScore === null ? 'Not available' : signed(result.observedScore)}</p><p>{result.observedScore === null ? 'No compatible calls to calculate.' : 'Sum of the usable variant contributions.'}</p></div>
          <div className="coverage"><div className="coverage-heading"><strong>{result.observedVariantsCount.toLocaleString()} <span>/ {result.totalVariantsInModel.toLocaleString()}</span></strong><span>variants scored</span></div><progress aria-label="Model variant coverage" value={result.observedVariantsCount} max={result.totalVariantsInModel} /><p>{result.status === 'complete' ? 'All model variants are included.' : `${(result.totalVariantsInModel - result.observedVariantsCount).toLocaleString()} missing or excluded. This is an incomplete sum.`}</p></div>
        </section>
        <p className="interpretation-note">A positive or negative sum does not mean your risk is above or below average. That requires a matched population reference. This view shows published associations and arithmetic, not a personal disease probability.</p>
        <section className="contribution-overview">
          <div className="section-heading"><h2>What moves this score?</h2><p><span className="effect higher">{higher} raise it</span> · <span className="effect lower">{lower} lower it</span> · {scored.length - higher - lower} add zero. These are counts, not effect sizes.</p></div>
          {leading.length ? <div className="contribution-plot"><div className="plot-legend"><span>Lower contribution</span><span>Higher contribution</span></div>{leading.map(row => <div className="plot-row" key={row.rsid}>
            <span><code>{row.rsid}</code><small>{row.genotype} · {row.dosage} {row.effectAllele} {row.dosage === 1 ? 'copy' : 'copies'}</small></span>
            <div className="plot-track" aria-hidden="true"><span className={`plot-bar ${contributionDirection(row)}`} style={{ width: `${Math.abs(row.contribution!) / max * 48}%`, left: row.contribution! < 0 ? `${50 - Math.abs(row.contribution!) / max * 48}%` : '50%' }} /></div>
            <strong className={`effect ${contributionDirection(row)}`}>{signed(row.contribution!)}</strong>
          </div>)}<p className="plot-caption">Up to six largest nonzero contributions in this file, on this model’s scale. Bar length shows magnitude; the centre is zero.</p></div> : <p className="empty-state">{scored.length ? 'All usable calls have zero contribution. This does not mean no genetic risk.' : 'No usable contributions yet. Check the excluded rows below for missing calls, build or allele issues.'}</p>}
        </section>
        <section className="stack variant-section">
          <div className="section-heading"><h2>Read your variants</h2><p>“Higher” or “lower” describes the counted allele’s association in the published model, relative to the other allele. It does not establish a biological mechanism.</p></div>
          <div className="variant-filters"><label className="field">Marker or locus<input type="search" placeholder="e.g. rs6733839 or BIN1" value={query} onChange={e => { setQuery(e.target.value); setLimit(30); }} /></label><label className="field">Show<select value={filter} onChange={e => { setFilter(e.target.value); setLimit(30); }}><option value="all">All variants</option><option value="higher">Raises score</option><option value="lower">Lowers score</option><option value="zero">Zero contribution</option><option value="unscored">Missing or excluded</option></select></label></div>
          <p className="muted" role="status">{rows.length.toLocaleString()} matching variants · largest contributions first</p>
          {rows.length ? <div className="table-scroll"><table className="variant-table"><thead><tr><th scope="col">Variant / your call</th><th scope="col">What it means here</th><th scope="col">Your contribution</th></tr></thead><tbody>{rows.slice(0, limit).map(row => {
            const direction = contributionDirection(row);
            return <tr key={row.rsid}>
              <th scope="row"><code>{row.rsid}</code><span className="variant-gene">{row.gene || `Chromosome ${row.chromosome}`}</span><span className="genotype-call">{row.genotype ?? 'Not in file'}</span></th>
              <td>{direction === 'unscored' ? <><strong>Not interpreted</strong><p className="cell-note">{row.referenceIssue || exclusion[row.status]}</p></> : <><strong className={`effect ${row.weight > 0 ? 'higher' : row.weight < 0 ? 'lower' : 'zero'}`}>{row.effectAllele}: {row.weight === 0 ? 'no weighted association' : `${row.weight > 0 ? 'higher' : 'lower'} ${result.effectMeasure === 'log-odds' ? 'odds in the study' : 'score association'}`}</strong><p className="cell-note">{row.dosage} {row.dosage === 1 ? 'copy' : 'copies'} of {row.effectAllele}, compared with {row.otherAllele}. {row.dosage === 0 ? 'No counted effect allele; this is not a protective result.' : `Each copy changes this score by ${signed(row.weight)}.`}</p></>}</td>
              <td><strong className={`effect ${direction}`}>{row.contribution === null ? 'Excluded' : signed(row.contribution)}</strong><span className="cell-note block">{row.contribution === null ? 'Not counted as zero' : `${row.dosage} × ${signed(row.weight)}`}</span></td>
            </tr>;
          })}</tbody></table></div> : <p className="empty-state">No variants match. Change the filter or clear your search.</p>}
          {rows.length > limit && <button className="more-variants" onClick={() => setLimit(limit + 30)}>Show 30 more variants ({rows.length - limit} remaining)</button>}
        </section>
        <details><summary>Calculation, source data and limits</summary><p>{result.reason}</p><p>Weight scale: {result.weightType}. Input calls must match chromosome, build-specific position and allele pair. Unresolved strand or reference assignments are excluded. No genotypes are imputed.</p><p>The table rounds for readability. Export JSON for unrounded weights and contributions. Different models and files with different coverage cannot be compared by their raw sums. Separate disease scores cannot be added into cumulative risk.</p><p>{result.sourceFiles.length} archived source files are identified by SHA-256 in the export.</p></details>
      </div>
    </div>
  </section>;
}
