import React from 'react';
import type { PGxGeneReport } from '@/types/genomics';
import { ObservationTable } from './PRSDashboard';

export function PGxDashboard({ pgxReports }: { pgxReports: PGxGeneReport[] }) {
  return <section className="stack">
    <div className="section-heading"><h1>Drug-response markers</h1><p>Raw observations from the bundled pharmacogenetic panels.</p></div>
    <div className="notice"><h2>Drug response not determined</h2><p>These panels cannot reliably establish star alleles, metabolizer status or a medication dose. An absent marker does not mean normal function. Do not change medication based on this view.</p></div>
    <p>Two heterozygous markers may be on the same chromosome or on opposite chromosomes. An unphased export does not resolve that distinction. CYP2C9 and VKORC1 are separate genes and are never merged into one diplotype.</p><p><a href="https://cpicpgx.org/guidelines/" target="_blank" rel="noopener noreferrer">Read the gene-specific CPIC guidelines</a> for allele definitions and study context.</p>
    {pgxReports.map(report => <details key={report.gene}><summary>{report.gene}</summary><p>{report.reason}</p><ObservationTable observations={report.observations} /></details>)}
  </section>;
}
