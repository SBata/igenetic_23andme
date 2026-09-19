import React, { useState } from 'react';
import type { GWASTraitResult } from '@/types/genomics';

export function GwasTraitsDashboard({ traits }: { traits: GWASTraitResult[] }) {
  const [query, setQuery] = useState('');
  const results = traits.filter(t => `${t.rsid} ${t.gene} ${t.trait}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="stack">
    <div className="section-heading"><h1>Study markers</h1><p>Markers in your file that also appear in the bundled reading list. These associations do not predict your abilities, symptoms or dietary needs.</p></div>
    <label className="field">Filter by marker, gene or topic<input value={query} onChange={e => setQuery(e.target.value)} type="search" /></label>
    <p>Each study link opens the original paper. Study findings describe groups, not a prediction about you.</p>
    {results.length ? <div className="table-scroll"><table><thead><tr><th scope="col">Marker</th><th scope="col">Genotype</th><th scope="col">Study topic</th></tr></thead><tbody>{results.map(t => <tr key={t.rsid}><th scope="row"><code>{t.rsid}</code></th><td><code>{t.patientGenotype}</code></td><td><a href={t.source} target="_blank" rel="noopener noreferrer">{t.trait}</a><span className="muted block">{t.gene}</span><p>{t.userInterpretation}</p></td></tr>)}</tbody></table></div> : <p role="status">{traits.length ? 'No matching markers. Clear or change the filter.' : 'No called markers from the bundled reading list were found in this file.'}</p>}
  </section>;
}
