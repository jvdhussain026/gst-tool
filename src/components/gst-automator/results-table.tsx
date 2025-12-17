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
                <TableHead>Date</TableHead>
                <TableHead>GST No.</TableHead>
                <TableHead>Bill No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead>QTY</TableHead>
                <TableHead className="text-right">Taxable Value</TableHead>
                <TableHead className="text-right">IGST @18%</TableHead>
                <TableHead className="text-right">IGST @28%</TableHead>
                <TableHead className="text-right">CGST @9%</TableHead>
                <TableHead className="text-right">SGST @9%</TableHead>
                <TableHead className="text-right">Total Bill Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice, index) => (
                <TableRow key={`${invoice.billNo}-${index}`}>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell className="font-mono text-xs">{invoice.gstNo}</TableCell>
                  <TableCell className="font-medium">{invoice.billNo}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.saleOrServices === 'Services' ? 'secondary' : 'outline'}>
                      {invoice.saleOrServices}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.hsn}</TableCell>
                  <TableCell>{invoice.qty}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.taxableValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.igst18)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.igst28)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.cgst9)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.sgst9)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(invoice.totalBillValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
