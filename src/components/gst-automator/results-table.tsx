import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { InvoiceData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { exportToExcel } from '@/lib/excel';

interface ResultsTableProps {
  invoices: InvoiceData[];
}

export function ResultsTable({ invoices }: ResultsTableProps) {
  const handleDownload = () => {
    exportToExcel(invoices, `gst_summary_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <CardTitle>Step 3: Download Your Data</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review the extracted data below. When you're ready, download it as an Excel file.
            </p>
          </div>
          <Button onClick={handleDownload}>
            <Icons.excel className="mr-2 h-4 w-4" />
            Download Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inv. Type</TableHead>
                <TableHead>Inv. Number</TableHead>
                <TableHead>Inv. Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Vendor GSTIN</TableHead>
                <TableHead className="text-right">Taxable Amt.</TableHead>
                <TableHead className="text-right">CGST</TableHead>
                <TableHead className="text-right">SGST</TableHead>
                <TableHead className="text-right">IGST</TableHead>
                <TableHead className="text-right">Total Tax</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-center">Valid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice, index) => (
                <TableRow key={`${invoice.invoiceNumber}-${index}`}>
                  <TableCell>
                    <Badge variant={invoice.invoiceType === 'Service' ? 'secondary' : 'outline'}>
                      {invoice.invoiceType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.invoiceDate}</TableCell>
                  <TableCell>{invoice.vendorName}</TableCell>
                  <TableCell className="font-mono text-xs">{invoice.vendorGstin}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.taxableAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.cgstAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.sgstAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.igstAmount)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(invoice.totalTax)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(invoice.totalInvoiceValue)}</TableCell>
                  <TableCell className="text-center">
                    {invoice.isValid ? 
                        <Icons.check className="h-5 w-5 text-green-500 mx-auto" /> : 
                        <Icons.warning className="h-5 w-5 text-yellow-500 mx-auto" />
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
