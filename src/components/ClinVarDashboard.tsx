import React from 'react';
import type { ClinVarFinding } from '@/types/genomics';

export function ClinVarDashboard(_props: { findings: ClinVarFinding[] }) {
  return <section className="stack">
    <div className="section-heading"><h1>Clinical variants</h1><p>Clinical interpretation is unavailable in this version.</p></div>
    <div className="notice"><h2>This is not a negative screening result</h2><p>This version has no curated clinical annotation dataset. No pathogenicity or carrier-status conclusions are generated.</p></div>
    <p>You can inspect a marker in Variant search. A raw genotype alone cannot diagnose or rule out a condition. Health-related findings need appropriate clinical confirmation.</p>
  </section>;
}
