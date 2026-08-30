import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  ExternalLink,
  Shield,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  Database,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import { parseAndAnalyze23andMeFile } from '@/lib/parser';
import { generateBenchmarkSampleVariants } from '@/lib/sampleData';
import { detectChipAndBuild, performSampleQC } from '@/lib/qc';
import { runFullGenomicAnalysis } from '@/lib/engine';
import { FullAnalysisResult } from '@/types/genomics';

interface HeroWizardProps {
  onAnalysisComplete: (result: FullAnalysisResult) => void;
}

export const HeroWizard: React.FC<HeroWizardProps> = ({ onAnalysisComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('dragover', preventDefaults);
    window.addEventListener('drop', preventDefaults);
    return () => {
      window.removeEventListener('dragover', preventDefaults);
      window.removeEventListener('drop', preventDefaults);
    };
  }, []);

  const handleFileProcess = async (file: File) => {
    try {
      setErrorMessage(null);
      setLoadingStage(`Reading ${file.name} (${Math.round(file.size / 1024)} KB)...`);
      setProgress(10);

      await new Promise(resolve => setTimeout(resolve, 50));

      const result = await parseAndAnalyze23andMeFile(file, (stage, pct) => {
        setProgress(pct);
        if (stage === 'decompressing') setLoadingStage('Decompressing in-memory archive...');
        else if (stage === 'parsing') setLoadingStage('Parsing 600,000+ genomic markers...');
        else if (stage === 'qc') setLoadingStage('Running sample QC & Ti/Tv ratio tests...');
        else if (stage === 'analyzing') setLoadingStage('Computing PGx diplotypes & multi-ancestry PRS models...');
        else if (stage === 'done') setLoadingStage('Finalizing results...');
      });

      onAnalysisComplete(result);
    } catch (err: unknown) {
      console.error('File parsing error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to parse file.';
      setErrorMessage(msg);
      setLoadingStage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileProcess(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileProcess(file);
    }
  };

  const handleLoadDemoData = () => {
    setLoadingStage('Generating synthetic research benchmark dataset...');
    setProgress(30);
    setTimeout(() => {
      const demo = generateBenchmarkSampleVariants();
      const rsidSet = new Set(demo.variants.map(v => v.rsid.toLowerCase()));
      const { chip, build } = detectChipAndBuild(demo.header, rsidSet);
      const qc = performSampleQC(demo.variants, chip, build, '23andme_v5_benchmark_sample.txt', 15420100);
      setProgress(75);
      const analysis = runFullGenomicAnalysis(demo.variants, qc);
      setProgress(100);
      onAnalysisComplete(analysis);
    }, 300);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Clean Scientific Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Client-Side Privacy • 100% In-Browser Execution</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Upload Custom{' '}
          <span className="text-slate-500">
            23andMe Genotype File
          </span>
        </h1>

        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Parse raw microarray DNA exports directly in your browser. Annotate against curated CPIC pharmacogenomics, ClinVar pathogenic variants, and multi-ancestry Polygenic Risk Scores.
        </p>
      </div>

      {/* Main Intake Solid Enclave */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-5 border border-slate-200 bg-white shadow-sm">
        {/* Dropzone Container */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-slate-900 bg-slate-100'
              : 'border-slate-300 hover:border-slate-500 bg-slate-50'
          }`}
        >
          {/* Transparent Input covering full area */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.zip,.tsv,.csv"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            aria-label="Upload 23andMe raw data file"
          />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-3 pointer-events-none">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
              <UploadCloud className="w-6 h-6 text-slate-700" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-bold text-slate-900 tracking-tight">
                Drop your raw 23andMe file here (<code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">.txt</code> or <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">.zip</code>)
              </p>
              <p className="text-xs text-slate-500">
                Click anywhere in this box to browse your computer. Supports v2, v3, v4, and v5 chip formats.
              </p>
            </div>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Processed 100% in local memory. Your genetic data never leaves your device.</span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Telemetry */}
        {loadingStage && (
          <div className="space-y-2 surface-inset p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-mono text-slate-700">
              <span className="flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-slate-900 animate-spin" />
                <span>{loadingStage}</span>
              </span>
              <span className="font-bold text-slate-900">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-slate-900 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 font-mono">PARSING_ERROR</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <Info className="w-4 h-4" />
            <span>How do I download my raw data from 23andMe?</span>
          </button>

          <button
            onClick={handleLoadDemoData}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition active:scale-95 shadow-sm"
          >
            <Database className="w-4 h-4" />
            <span>Load Curated Benchmark Sample</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Interactive Guide */}
      {showInstructions && (
        <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-5 border border-slate-200 animate-fadeIn bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Step-by-Step 23andMe Download Guide</span>
            </h2>
            <a
              href="https://you.23andme.com/tools/data/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs transition font-semibold"
            >
              <span>Direct Link to 23andMe Download</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="surface-card p-4 rounded-xl space-y-1.5 border border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold font-mono">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Log In & Browse</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Log into 23andMe, click your profile icon in the upper right corner, and select <strong className="text-slate-900">Browse Raw Data</strong>.
              </p>
            </div>

            <div className="surface-card p-4 rounded-xl space-y-1.5 border border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold font-mono">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Request Archive</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Click the <strong className="text-slate-900">Download</strong> tab in the navigation bar. Scroll down and click <strong className="text-slate-900">Submit Request</strong>.
              </p>
            </div>

            <div className="surface-card p-4 rounded-xl space-y-1.5 border border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold font-mono">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">3</span>
                <span>Upload File</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Download the zip archive from the email link and drag the file directly into the intake box above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
