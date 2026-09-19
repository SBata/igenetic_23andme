import type { FullAnalysisResult } from '../types/genomics';
import type { ParseProgressCallback } from './parser';

export function analyzeFile(file: File, onProgress: ParseProgressCallback): Promise<FullAnalysisResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./analysis.worker.ts', import.meta.url));
    worker.onmessage = ({ data }) => {
      if (data.error) { worker.terminate(); reject(new Error(data.error)); }
      else if (data.result) { worker.terminate(); resolve(data.result); }
      else onProgress(data.stage, data.percent);
    };
    worker.onerror = () => { worker.terminate(); reject(new Error('The local analysis worker stopped. Reload the page and try again.')); };
    worker.postMessage(file);
  });
}
