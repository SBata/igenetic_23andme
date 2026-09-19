import React from 'react';
import type { FullAnalysisResult } from '@/types/genomics';
export function ChromosomeIdeogram({ chromosomeDensity }: { chromosomeDensity: FullAnalysisResult['chromosomeDensity'] }) {
  return <section className="stack"><h2>Recorded markers by chromosome</h2><p>Counts reflect the export, not chromosome structure or disease burden.</p><div className="table-scroll"><table><thead><tr><th scope="col">Chromosome</th><th scope="col">Markers</th></tr></thead><tbody>{Object.entries(chromosomeDensity).map(([chr, data]) => <tr key={chr}><th scope="row">{chr}</th><td>{data.variantCount.toLocaleString()}</td></tr>)}</tbody></table></div></section>;
}
