'use client';

import React, { useCallback, useReducer, useMemo } from 'react';
import type { InvoiceFile, InvoiceData } from '@/lib/types';
import { getFileHash, extractTextFromPDF } from '@/lib/pdf';
import { extractAndValidateGstData } from '@/ai/flows/data-extraction-and-validation';
import { extractWithRules, calculateConfidence } from '@/lib/rule-based-extractor';
import { useToast } from '@/hooks/use-toast';

import { Header } from '@/components/gst-automator/header';
import { HeroSection, HeroDescription } from '@/components/gst-automator/hero-section';
import { UploadSection } from '@/components/gst-automator/upload-section';
import { SummarySection } from '@/components/gst-automator/summary-section';
import { ResultsTable } from '@/components/gst-automator/results-table';
import { Footer } from '@/components/gst-automator/footer';
import { DuplicateInvoiceDialog } from '@/components/gst-automator/duplicate-invoice-dialog';
import { HowItWorksSection } from '@/components/gst-automator/how-it-works-section';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
      dispatch({ type: 'SET_PROGRESS', id: invoiceFile.id, progress: 20 });

      const existingHashes = state.invoices
        .filter(inv => inv.status === 'success' && inv.hash)
        .map(inv => inv.hash!);
      
      if (existingHashes.includes(hash)) {
        dispatch({ type: 'SET_DUPLICATE_CANDIDATE', file: {...invoiceFile, hash} });
        return;
      }

      const textContent = await extractTextFromPDF(invoiceFile.file);
      dispatch({ type: 'SET_PROGRESS', id: invoiceFile.id, progress: 40 });

      if (!textContent.trim()) {
        throw new Error('Could not extract text from PDF. The file might be empty or scanned.');
      }
      
      let extractedData = extractWithRules(textContent);
      dispatch({ type: 'SET_PROGRESS', id: invoiceFile.id, progress: 70 });
      
      const confidence = calculateConfidence(extractedData);

      // If confidence is low, fallback to AI
      if (confidence < 90) {
        console.log(`Low confidence (${confidence}) for ${invoiceFile.file.name}, falling back to AI.`);
        dispatch({ type: 'SET_PROGRESS', id: invoiceFile.id, progress: 80 });
        const aiData = await extractAndValidateGstData({ 
          invoiceText: textContent,
          ruleBasedData: extractedData,
         });

        // The AI schema is different, we need to map it to our target schema.
        extractedData = {
          date: aiData.invoiceDate,
          gstNo: aiData.vendorGstin,
          billNo: aiData.invoiceNumber,
          saleOrServices: aiData.invoiceType === 'Spares' ? 'Sale' : 'Services',
          hsn: 'N/A', // AI doesn't provide HSN in this schema
          qty: 1, // Default
          taxableValue: aiData.taxableAmount,
          igst18: aiData.igstAmount > 0 ? aiData.igstAmount : 0,
          igst28: 0,
          cgstRate: aiData.cgstAmount > 0 ? 9 : 0,
          sgstRate: aiData.sgstAmount > 0 ? 9 : 0,
          cgst9: aiData.cgstAmount,
          sgst9: aiData.sgstAmount,
          totalBillValue: aiData.totalInvoiceValue,
        };
      }
      
      dispatch({ type: 'SET_PROGRESS', id: invoiceFile.id, progress: 95 });
      dispatch({ type: 'SET_SUCCESS', id: invoiceFile.id, data: extractedData, textContent, hash });

    } catch (error) {
      console.error('Failed to process file:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      dispatch({ type: 'SET_STATUS', id: invoiceFile.id, status: 'error', error: errorMessage });
      toast({
        variant: "destructive",
        title: `Error processing ${invoiceFile.file.name}`,
        description: `Could not process invoice. It was skipped. Error: ${errorMessage}`,
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
  
  const failedInvoices = useMemo(() => state.invoices.filter(inv => inv.status === 'error'), [state.invoices]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-2">
              {/* Left Ad Space */}
            </div>

            <div className="lg:col-span-8 space-y-8 flex flex-col">
              <HeroSection />
              <div className="lg:hidden">
                <UploadSection
                    files={state.invoices}
                    onFilesAdded={handleFilesAdded}
                    onRemoveFile={handleRemoveFile}
                    onClearAll={handleClearAll}
                />
              </div>
              <HeroDescription />
               <div className="hidden lg:block">
                <UploadSection
                    files={state.invoices}
                    onFilesAdded={handleFilesAdded}
                    onRemoveFile={handleRemoveFile}
                    onClearAll={handleClearAll}
                />
              </div>
              {failedInvoices.length > 0 && (
                 <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive text-lg">Processing Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-destructive/90">
                            {failedInvoices.length} invoice(s) could not be processed and were skipped. This can happen with scanned images, password-protected files, or unusual formats.
                        </p>
                    </CardContent>
                </Card>
              )}
              {successfulInvoices.length > 0 && (
                <>
                  <SummarySection invoices={successfulInvoices.map(i => i.data)} />
                  <ResultsTable invoices={successfulInvoices.map(i => i.data)} />
                </>
              )}
              <HowItWorksSection />
            </div>

            <div className="hidden lg:block lg:col-span-2">
              {/* Right Ad Space */}
            </div>
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
