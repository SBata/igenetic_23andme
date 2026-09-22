import React, { useEffect, useRef, useState } from 'react';
import type { FullAnalysisResult } from '@/types/genomics';

export function ExportReportModal({ analysis, onClose }: { analysis: FullAnalysisResult; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useEffect(() => {
    const { rawVariants: _raw, ...report } = analysis;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [analysis]);
  return <dialog ref={dialog} aria-labelledby="export-title" onCancel={onClose}>
    <div className="stack"><div className="dialog-heading"><h2 id="export-title">Export observations</h2><button onClick={onClose}>Close</button></div>
      <p>The JSON report includes score inputs, unrounded weights and contributions, model source, panel genotypes and file metadata. It excludes the full raw genotype file.</p>
      <p>This download contains genetic information and remains on your device after you clear the app.</p>
      {analysis.isDemo && <p className="demo-note">Synthetic demo data</p>}
      <p>Risk estimates, clinical variant interpretation and medication recommendations: unavailable.</p>
      {downloadUrl && <a href={downloadUrl} download="igenetic-observations.json">Download JSON</a>}
    </div>
  </dialog>;
}
