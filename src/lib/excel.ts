import * as xlsx from 'xlsx';
import type { InvoiceData } from './types';

export function exportToExcel(invoices: InvoiceData[], fileName: string = 'gst_summary.xlsx') {
  if (invoices.length === 0) {
    console.warn("No data to export.");
    return;
  }

  // The order of keys here is critical and must match the required schema.
  const dataForSheet = invoices.map(invoice => ({
    'Date': invoice.date,
    'GST No.': invoice.gstNo,
    'BILL': invoice.billNo,
    'Sale / Services': invoice.saleOrServices,
    'HSN': invoice.hsn,
    'QTY': invoice.qty,
    'Taxable Value': invoice.taxableValue,
    'IGST 18%': invoice.igst18,
    'IGST 28%': invoice.igst28,
    'CGST %': invoice.cgstRate,
    'SGST %': invoice.sgstRate,
    'CGST 9%': invoice.cgst9,
    'SGST 9%': invoice.sgst9,
    'Total Bill Value': invoice.totalBillValue,
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
