import React from 'react';
import type { GenotypeSampleQC } from '@/types/genomics';
export function QCReportCard({ qc }: { qc: GenotypeSampleQC }) {
  return <section className="stack"><div className="section-heading"><h1>File quality</h1><p className="break-words">{qc.fileName}</p></div>
    <dl className="facts"><div><dt>Rows read</dt><dd>{qc.totalVariants.toLocaleString()}</dd></div><div><dt>Call rate</dt><dd>{qc.callRate.toFixed(2)}%</dd></div><div><dt>No usable call</dt><dd>{qc.noCallCount.toLocaleString()}</dd></div><div><dt>Genome build in header</dt><dd>{qc.detectedBuild}</dd></div><div><dt>Chip in header</dt><dd>{qc.detectedChip}</dd></div><div><dt>Autosomal calls</dt><dd>{qc.validAutosomalCalls.toLocaleString()}</dd></div></dl>
    <p>These are file-level counts, not a certification of genotype accuracy. Build and chip are reported only when stated in the header. Coordinates are not converted.</p>
    <details><summary>Additional call counts</summary><p>{qc.heterozygousCount.toLocaleString()} heterozygous and {qc.homozygousCount.toLocaleString()} homozygous two-letter calls. Haploid calls are excluded from these two counts.</p><p>Autosomal heterozygous transition/transversion ratio: {qc.titvRatio === null ? 'not defined (no transversions)' : qc.titvRatio.toFixed(2)}. This marker subset has no universal pass/fail threshold.</p></details>
  </section>;
}
