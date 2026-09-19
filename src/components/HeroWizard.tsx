import React, { useRef, useState } from 'react';
import { analyzeFile } from '@/lib/analyzeFile';
import { generateBenchmarkSampleVariants } from '@/lib/sampleData';
import { detectChipAndBuild, performSampleQC } from '@/lib/qc';
import { runFullGenomicAnalysis } from '@/lib/engine';
import type { FullAnalysisResult } from '@/types/genomics';

export function HeroWizard({ onAnalysisComplete }: { onAnalysisComplete: (result: FullAnalysisResult) => void }) {
  const busy = useRef(false);
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  async function load(file?: File) {
    if (busy.current) return;
    busy.current = true;
    setError(''); setStage('Reading file'); setProgress(0);
    try {
      if (file) {
        const labels = { reading: 'Reading file', decompressing: 'Opening ZIP', parsing: 'Reading genotype rows', qc: 'Checking calls', analyzing: 'Matching local marker panels', done: 'Ready' };
        onAnalysisComplete(await analyzeFile(file, (step, percent) => { setStage(labels[step]); setProgress(percent); }));
      } else {
        await new Promise(resolve => setTimeout(resolve, 0));
        const demo = generateBenchmarkSampleVariants();
        const { chip, build } = detectChipAndBuild(demo.header, new Set(demo.variants.map(v => v.rsid)));
        const qc = performSampleQC(demo.variants, chip, build, 'Synthetic demo', 0);
        onAnalysisComplete({ ...runFullGenomicAnalysis(demo.variants, qc), isDemo: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to read this file. Select an unmodified 23andMe export.');
    } finally { busy.current = false; setStage(''); }
  }

  return <section className="intake stack">
    <div className="section-heading"><h1>Read your DNA file.<br />Keep it on your device.</h1><p>Open a 23andMe export to inspect recorded genotypes and compare marker availability across research panels.</p></div>
    <div className="notice"><h2>A personal research notebook</h2><p>Explore recorded variants and published score contributions. Results are for learning, not diagnosis, prognosis, risk stratification or treatment decisions.</p></div>
    <div className={`file-picker ${dragging ? 'dragging' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) void load(e.dataTransfer.files[0]); }}>
      <label htmlFor="genotype-file">Choose your 23andMe file</label>
      <p>Drop a TXT, TSV, CSV or ZIP here, or choose a file below. Maximum 32 MB.</p>
      <input id="genotype-file" type="file" accept=".txt,.tsv,.csv,.zip" disabled={!!stage} onChange={e => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; if (file) void load(file); }} />
    </div>
    {stage && <div role="status"><p>{stage}</p><progress aria-label={stage} value={progress} max={100}>{progress}%</progress></div>}
    {error && <p className="notice" role="alert">{error}</p>}
    <div className="intake-actions"><button disabled={!!stage} onClick={() => void load()}>Try synthetic demo</button><p className="muted">Demo calls are invented and are not a scientific benchmark.</p></div>
    <details><summary>Get your raw data file</summary><p>Sign in to 23andMe and request your raw data download. Select the downloaded ZIP or extract its text file. Do not use a health report PDF.</p><p><a href="https://you.23andme.com/tools/data/download/" target="_blank" rel="noopener noreferrer">Open 23andMe downloads</a> (opens an external site).</p></details>
    <p className="muted">The app does not upload or save your file in browser storage. Refreshing or clearing the page removes it from the app. Any report you download remains on your device.</p>
  </section>;
}
