import { parseAndAnalyze23andMeFile } from './parser';

self.onmessage = async (event: MessageEvent<File>) => {
  try {
    const result = await parseAndAnalyze23andMeFile(event.data, (stage, percent) => self.postMessage({ stage, percent }));
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'Unable to analyze file.' });
  }
};
