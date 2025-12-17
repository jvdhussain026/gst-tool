import type { InvoiceData } from './types';

// Helper function to safely parse numbers
const parseNumber = (text: string | undefined | null): number => {
  if (!text) return 0;
  return parseFloat(text.replace(/,/g, '')) || 0;
};

// Regex patterns for common fields
const patterns = {
  gstin: /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/g,
  invoiceNumber: /(?:Invoice (?:No|Number)|Bill No)[:\s]*([A-Z0-9/-]+)/i,
  invoiceDate: /(?:Invoice Date|Date)[:\s]*(\d{2}[-./]\d{2}[-./]\d{4}|\d{2}-\w{3}-\d{4})/i,
  taxableValue: /(?:Taxable Value|Total Amount)[\s:]+₹?([\d,]+\.\d{2})/i,
  totalBillValue: /(?:Total Invoice Value|Grand Total|TOTAL)[\s:]+₹?([\d,]+\.\d{2})/i,
  cgst: /CGST\s*(?:@\s*(\d+\.?\d*)\s*%)?[\s:]+₹?([\d,]+\.\d{2})/i,
  sgst: /SGST\s*(?:@\s*(\d+\.?\d*)\s*%)?[\s:]+₹?([\d,]+\.\d{2})/i,
  igst: /IGST\s*(?:@\s*(\d+\.?\d*)\s*%)?[\s:]+₹?([\d,]+\.\d{2})/i,
  hsn: /HSN\/SAC\s+(\d{4,8})/i,
};

function normalizeDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        // Handles DD-MM-YYYY, DD.MM.YYYY, DD/MM/YYYY
        const parts = dateStr.match(/(\d{2})[-./](\d{2})[-./](\d{4})/);
        if (parts) {
            return `${parts[3]}-${parts[2]}-${parts[1]}`;
        }
        // Handles DD-Mon-YYYY
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        // ignore
    }
    return dateStr;
}

export function extractWithRules(text: string): InvoiceData {
  const get = (pattern: RegExp) => text.match(pattern);

  const gstinMatches = text.match(patterns.gstin) || [];
  const vendorGstin = gstinMatches[0] || '';

  const dateMatch = get(patterns.invoiceDate);
  const invoiceDate = normalizeDate(dateMatch?.[1] || '');

  const billNoMatch = get(patterns.invoiceNumber);
  const billNo = billNoMatch?.[1] || 'N/A';
  
  const taxableValueMatch = get(patterns.taxableValue);
  const taxableValue = parseNumber(taxableValueMatch?.[1]);

  const totalBillValueMatch = get(patterns.totalBillValue);
  const totalBillValue = parseNumber(totalBillValueMatch?.[1]);

  const cgstMatch = get(patterns.cgst);
  const cgstRate = parseNumber(cgstMatch?.[1]);
  const cgst9 = parseNumber(cgstMatch?.[2]);
  
  const sgstMatch = get(patterns.sgst);
  const sgstRate = parseNumber(sgstMatch?.[1]);
  const sgst9 = parseNumber(sgstMatch?.[2]);

  const igstMatch = get(patterns.igst);
  const igstRate = parseNumber(igstMatch?.[1]);
  const igstAmount = parseNumber(igstMatch?.[2]);

  const hsnMatch = get(patterns.hsn);
  const hsn = hsnMatch?.[1] || 'N/A';

  const isService = /labour|service charge/i.test(text);
  const isSale = /part|spare/i.test(text);

  let saleOrServices: InvoiceData['saleOrServices'] = 'N/A';
  if (isService && !isSale) saleOrServices = 'Services';
  if (isSale) saleOrServices = 'Sale';

  return {
    date: invoiceDate,
    gstNo: vendorGstin,
    billNo: billNo,
    saleOrServices: saleOrServices,
    hsn: hsn,
    qty: saleOrServices === 'Services' ? 1 : 0, // Placeholder, needs better logic
    taxableValue: taxableValue,
    igst18: igstRate === 18 ? igstAmount : 0,
    igst28: igstRate === 28 ? igstAmount : 0,
    cgstRate: cgstRate,
    sgstRate: sgstRate,
    cgst9: cgst9,
    sgst9: sgst9,
    totalBillValue: totalBillValue,
  };
}


export function calculateConfidence(data: InvoiceData): number {
    let score = 0;
    const MAX_SCORE = 100;
    const fieldWeight = {
        date: 10,
        gstNo: 15,
        billNo: 15,
        taxableValue: 10,
        totalBillValue: 10,
        taxValidation: 30,
        saleOrServices: 5,
        hsn: 5,
    };

    if (data.date) score += fieldWeight.date;
    if (data.gstNo && data.gstNo.match(patterns.gstin)) score += fieldWeight.gstNo;
    if (data.billNo !== 'N/A') score += fieldWeight.billNo;
    if (data.taxableValue > 0) score += fieldWeight.taxableValue;
    if (data.totalBillValue > 0) score += fieldWeight.totalBillValue;
    if (data.saleOrServices !== 'N/A') score += fieldWeight.saleOrServices;
    if (data.hsn !== 'N/A') score += fieldWeight.hsn;

    // Tax validation
    const hasCgstSgst = data.cgst9 > 0 && data.sgst9 > 0;
    const hasIgst = data.igst18 > 0 || data.igst28 > 0;
    const calculatedTotal = data.taxableValue + data.cgst9 + data.sgst9 + data.igst18 + data.igst28;
    
    // Allow a small tolerance for rounding differences
    const isTotalValid = Math.abs(calculatedTotal - data.totalBillValue) < 1;

    if ((hasCgstSgst || hasIgst) && isTotalValid) {
        score += fieldWeight.taxValidation;
    }

    return Math.min(score, MAX_SCORE);
}
