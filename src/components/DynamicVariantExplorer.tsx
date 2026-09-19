import React, { useState } from 'react';
import type { RawVariant } from '@/types/genomics';
import { isCalledGenotype } from '@/lib/qc';

export function DynamicVariantExplorer({ variants = [] }: { variants?: RawVariant[] }) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const match = variants.find(v => v.rsid.toLowerCase() === searched);
  return <section className="stack">
    <div className="section-heading"><h1>Variant search</h1><p>Look up a marker in the full file. Search runs locally and makes no database requests.</p></div>
    <form className="search-form" onSubmit={e => { e.preventDefault(); setSearched(query.trim().toLowerCase()); }}>
      <label className="field">Marker ID<input required pattern="(rs|i)[0-9]+" title="Enter an rsID or 23andMe marker ID, such as rs1800562 or i1234." placeholder="e.g. rs1800562" value={query} onChange={e => setQuery(e.target.value.toLowerCase())} /></label>
      <button className="primary" type="submit">Search file</button>
    </form>
    {searched && <div className="stack" aria-live="polite"><h2><code>{searched}</code></h2>{match ? <>
      <dl className="facts"><div><dt>Genotype in file</dt><dd><code>{match.genotype}</code></dd></div><div><dt>Call status</dt><dd>{isCalledGenotype(match.genotype, match.chromosome) ? 'Recorded call' : 'No usable call'}</dd></div><div><dt>Chromosome</dt><dd>{match.chromosome}</dd></div><div><dt>Position in original file</dt><dd>{match.position.toLocaleString()}</dd></div></dl>
      <p>Coordinates are shown as supplied. No genome-build conversion or clinical interpretation has been applied.</p>
    </> : <p>This marker is not in the file. That does not establish which alleles you carry.</p>}</div>}
  </section>;
}
