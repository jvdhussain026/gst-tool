'use client';

import React, { useCallback, useReducer, useMemo } from 'react';
import type { InvoiceFile, InvoiceData } from '@/lib/types';
import { getFileHash, extractTextFromPDF } from '@/lib/pdf';
import { extractAndValidateGstData } from '@/ai/flows/data-extraction-and-validation';
import { useToast } from '@/hooks/use-toast';

import { HeroSection } from '@/components/gst-automator/hero-section';
import { UploadSection } from '@/components/gst-automator/upload-section';
import { SummarySection } from '@/components/gst-automator/summary-section';
import { ResultsTable } from '@/components/gst-automator/results-table';
import { Footer } from '@/components/gst-automator/footer';
import { DuplicateInvoiceDialog } from '@/components/gst-automator/duplicate-invoice-dialog';
import { Card } from '@/components/ui/card';

type State = {
  invoices: InvoiceFile[];
  duplicateCandidate: InvoiceFile | null;
};

type Action =
  | { type: 'ADD_FILES'; files: File[] }
  | { type: 'SET_STATUS'; id: string; status: InvoiceFile['status']; error?: string }
  | { type: 'SET_PROGRESS'; id: string; progress: number }
  | { type: 'SET_SUCCESS'; id: string; data: InvoiceData; textContent: string; hash: string }
  | { type: 'SET_DUPLICATE_CANDIDATE'; file: InvoiceFile | null }
  | { type: 'RESOLVE_DUPLICATE'; keep: boolean }
  | { type: 'REMOVE_FILE'; id: string }
  | { type: 'CLEAR_ALL' };

const initialState: State = {
  invoices: [],
  duplicateCandidate: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_FILES':
      const newInvoices = action.files.map(file => ({
        id: `${file.name}-${file.size}-${Date.now()}`,
        file,
        status: 'pending' as const,
        progress: 0,
      }));
      return { ...state, invoices: [...state.invoices, ...newInvoices] };

    case 'SET_STATUS':
      return {
        ...state,
        invoices: state.invoices.map(invoice =>
          invoice.id === action.id ? { ...invoice, status: action.status, error: action.error } : invoice
        ),
      };
      
    case 'SET_PROGRESS':
        return {
            ...state,
            invoices: state.invoices.map(invoice =>
            invoice.id === action.id ? { ...invoice, progress: action.progress } : invoice
            ),
        };

    case 'SET_SUCCESS':
      return {
        ...state,
        invoices: state.invoices.map(invoice =>
          invoice.id === action.id
            ? { ...invoice, status: 'success', progress: 100, data: action.data, textContent: action.textContent, hash: action.hash }
            : invoice
        ),
      };
      
    case 'SET_DUPLICATE_CANDIDATE':
      return {
        ...state,
        duplicateCandidate: action.file,
        invoices: state.invoices.map(inv => inv.id === action.file?.id ? {...inv, status: 'duplicate'} : inv)
      };

    case 'RESOLVE_DUPLICATE': {
      if (!state.duplicateCandidate) return state;
      const id = state.duplicateCandidate.id;
      if (action.keep) {
        // Mark as pending to be processed
        return {
          ...state,
          duplicateCandidate: null,
          invoices: state.invoices.map(inv => (inv.id === id ? { ...inv, status: 'pending', isDuplicate: false } : inv)),
        };
      } else {
        // Remove the duplicate
        return {
          ...state,
          duplicateCandidate: null,
          invoices: state.invoices.filter(inv => inv.id !== id),
        };
      }
    }

    case 'REMOVE_FILE':
      return {
        ...state,
        invoices: state.invoices.filter(invoice => invoice.id !== action.id),
      };
      
    case 'CLEAR_ALL':
      return initialState;

    default:
      return state;
  }
};


export default function GstAutomatorPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toast } = useToast();

  const processFile = useCallback(async (invoiceFile: InvoiceFile) => {
    dispatch({ type: 'SET_STATUS', id: invoiceFile.id, status: 'processing' });
    dispatch({ type: 'SET_PROGRESS', id: invoiceFile.id, progress: 10 });
    
    try {
      const hash = await getFileHash(invoiceFile.file);
      dispatch({ type: 'SET_PROGRESS', id: invoiceFile.id, progress: 25 });

      const existingHashes = state.invoices
        .filter(inv => inv.status === 'success' && inv.hash)
        .map(inv => inv.hash!);
      
      if (existingHashes.includes(hash)) {
        dispatch({ type: 'SET_DUPLICATE_CANDIDATE', file: {...invoiceFile, hash} });
        return;
      }

      const textContent = await extractTextFromPDF(invoiceFile.file);
      dispatch({ type: 'SET_PROGRESS', id: invoiceFile.id, progress: 50 });

      if (!textContent.trim()) {
        throw new Error('Could not extract text from PDF. The file might be empty or scanned.');
      }
      
      const extractedData = await extractAndValidateGstData({ invoiceText: textContent });
      dispatch({ type: 'SET_PROGRESS', id: invoiceFile.id, progress: 90 });

      if (!extractedData.isValid) {
        toast({
          variant: "destructive",
          title: "Validation Warning",
          description: `Invoice ${extractedData.invoiceNumber} has a validation mismatch. Please double check totals.`,
        });
      }

      dispatch({ type: 'SET_SUCCESS', id: invoiceFile.id, data: extractedData, textContent, hash });

    } catch (error) {
      console.error('Failed to process file:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      dispatch({ type: 'SET_STATUS', id: invoiceFile.id, status: 'error', error: errorMessage });
      toast({
        variant: "destructive",
        title: `Error processing ${invoiceFile.file.name}`,
        description: errorMessage,
      });
    }
  }, [state.invoices, toast]);

  React.useEffect(() => {
    const pendingFile = state.invoices.find(inv => inv.status === 'pending');
    if (pendingFile) {
      processFile(pendingFile);
    }
  }, [state.invoices, processFile]);

  const handleFilesAdded = (files: File[]) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    if(pdfFiles.length !== files.length){
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Only PDF files are accepted. Non-PDF files have been ignored.",
      });
    }
    dispatch({ type: 'ADD_FILES', files: pdfFiles });
  };
  
  const handleRemoveFile = (id: string) => dispatch({ type: 'REMOVE_FILE', id });
  const handleClearAll = () => dispatch({ type: 'CLEAR_ALL' });

  const successfulInvoices = useMemo(
    () => state.invoices.filter((inv): inv is Required<InvoiceFile> => inv.status === 'success' && !!inv.data),
    [state.invoices]
  );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <HeroSection />
              <UploadSection
                files={state.invoices}
                onFilesAdded={handleFilesAdded}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
              />
              {successfulInvoices.length > 0 && (
                <>
                  <SummarySection invoices={successfulInvoices.map(i => i.data)} />
                  <ResultsTable invoices={successfulInvoices.map(i => i.data)} />
                </>
              )}
            </div>
            <aside className="hidden lg:block lg:col-span-4 space-y-6">
                <Card className="h-96 flex items-center justify-center text-muted-foreground border-dashed">
                    <div className='text-center'>
                        <p className="text-sm">Ad Space</p>
                        <p className='text-xs'>Supports the free tool</p>
                    </div>
                </Card>
                 <Card className="h-96 flex items-center justify-center text-muted-foreground border-dashed">
                    <div className='text-center'>
                        <p className="text-sm">Ad Space</p>
                        <p className='text-xs'>Supports the free tool</p>
                    </div>
                </Card>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <DuplicateInvoiceDialog
        isOpen={!!state.duplicateCandidate}
        onClose={() => dispatch({ type: 'SET_DUPLICATE_CANDIDATE', file: null })}
        onResolve={(keep) => dispatch({ type: 'RESOLVE_DUPLICATE', keep })}
        fileName={state.duplicateCandidate?.file.name}
      />
    </div>
  );
}
