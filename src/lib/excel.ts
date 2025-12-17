import * as xlsx from 'xlsx';
import type { InvoiceData } from './types';

export function exportToExcel(invoices: InvoiceData[], fileName: string = 'gst_invoices.xlsx') {
  if (invoices.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const dataForSheet = invoices.map(invoice => ({
    'Invoice Type': invoice.invoiceType,
    'Reference / CRM Number': invoice.referenceNumber || 'N/A',
    'Invoice Date': invoice.invoiceDate,
    'Invoice Number': invoice.invoiceNumber,
    'Vendor Name': invoice.vendorName,
    'Vendor GSTIN': invoice.vendorGstin,
    'Customer GSTIN': invoice.customerGstin || 'N/A',
    'State': invoice.state,
    'Taxable Amount': invoice.taxableAmount,
    'CGST Amount': invoice.cgstAmount,
    'SGST Amount': invoice.sgstAmount,
    'IGST Amount': invoice.igstAmount,
    'Total Tax': invoice.totalTax,
    'Total Invoice Value': invoice.totalInvoiceValue,
    'Is Valid': invoice.isValid ? 'Yes' : 'No'
  }));

  const worksheet = xlsx.utils.json_to_sheet(dataForSheet);

  // Auto-fit columns
  const colWidths = Object.keys(dataForSheet[0] || {}).map(key => ({
    wch: Math.max(
        key.length, 
        ...dataForSheet.map(row => String(row[key as keyof typeof row] ?? '').length)
    ) + 2
  }));
  worksheet['!cols'] = colWidths;

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Invoices');

  xlsx.writeFile(workbook, fileName);
}
