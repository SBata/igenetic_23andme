import React, { useState } from 'react';
import type { PRSResult, VariantObservation } from '@/types/genomics';

export function ObservationTable({ observations }: { observations: VariantObservation[] }) {
  return <div className="table-scroll"><table>
    <thead><tr><th scope="col">Marker</th><th scope="col">Genotype in file</th><th scope="col">Availability</th></tr></thead>
    <tbody>{observations.map(v => <tr key={v.rsid}>
      <th scope="row"><code>{v.rsid}</code></th><td><code>{v.genotype ?? 'Not in file'}</code></td>
      <td>{v.status === 'observed' ? 'Recorded call' : v.status === 'missing' ? 'Missing' : 'No usable call'}</td>
    </tr>)}</tbody>
  </table></div>;
}

export function PRSDashboard({ prsResults }: { prsResults: PRSResult[] }) {
  const [selected, setSelected] = useState(prsResults[0]?.modelId ?? '');
  const result = prsResults.find(r => r.modelId === selected);
  return <section className="stack">
    <div className="section-heading"><h1>Polygenic scores</h1><p>Follow the arithmetic from each genotype to the published weighted sum.</p></div>
    <p>This is a personal research calculation. A score is not a disease probability, diagnosis or prognosis. No ancestry calibration, imputation or cumulative risk is applied.</p>
    {!result ? <p>No marker panels are available.</p> : <>
      <label className="field">Published model<select value={selected} onChange={e => setSelected(e.target.value)}>{prsResults.map(r => <option key={r.modelId} value={r.modelId}>{r.modelId}: {r.traitName}</option>)}</select></label>
      <div className="section-heading"><h2>{result.rawScore !== null ? 'Complete raw score' : 'Observed subtotal'}</h2><p className="score-value">{result.observedScore === null ? 'No compatible calls' : result.observedScore.toPrecision(10)}</p><p>{result.observedVariantsCount} of {result.totalVariantsInModel} variants scored. {result.status === 'partial' && 'This subtotal is incomplete and cannot be compared with complete scores.'}</p><p><a href={result.source} target="_blank" rel="noopener noreferrer">{result.citation}</a></p></div>
      <details open><summary>Variant contributions</summary><div className="table-scroll"><table><thead><tr><th>Marker</th><th>Call</th><th>Effect / other</th><th>Weight</th><th>Dosage</th><th>Contribution</th><th>Status</th></tr></thead><tbody>{result.contributions.map(row => <tr key={row.rsid}><th scope="row"><code>{row.rsid}</code></th><td>{row.genotype ?? 'Missing'}</td><td>{row.effectAllele} / {row.otherAllele}</td><td>{row.weight.toPrecision(8)}</td><td>{row.dosage ?? 'Unknown'}</td><td>{row.contribution === null ? 'Unknown' : row.contribution.toPrecision(8)}</td><td>{row.status.replaceAll('-', ' ')}</td></tr>)}</tbody></table></div></details>
      <details><summary>Calculation and interpretation</summary><p>{result.reason}</p><p>Inputs must match the model chromosome, build-specific position and allele pair. Source alleles are oriented to the forward strand using archived Ensembl evidence. A/T and C/G sites with unresolved source orientation are excluded. Export JSON to retain unrounded numbers and every contribution.</p><p>Adding separate disease scores together does not give an overall chance of illness. Absolute risk requires a baseline and time horizon.</p></details>
    </>}
  </section>;
}
