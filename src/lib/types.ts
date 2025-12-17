export interface InvoiceData {
  date: string;
  gstNo: string;
  billNo: string;
  saleOrServices: 'Sale' | 'Services' | 'N/A';
  hsn: string;
  qty: number;
  taxableValue: number;
  igst18: number;
  igst28: number;
  cgstRate: number;
  sgstRate: number;
  cgst9: number;
  sgst9: number;
  totalBillValue: number;
}

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
