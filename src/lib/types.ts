import { type extractAndValidateGstData } from '@/ai/flows/data-extraction-and-validation';

// This is just to get the type, it won't be imported at runtime on client.
type ExtractAndValidateGstDataOutput = Awaited<ReturnType<typeof extractAndValidateGstData>>;

export type InvoiceData = ExtractAndValidateGstDataOutput;

export interface InvoiceFile {
  id: string; // unique id for the file in the session
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error' | 'duplicate';
  progress: number; // 0-100
  data?: InvoiceData;
  textContent?: string;
  hash?: string;
  error?: string;
  isDuplicate?: boolean;
}
