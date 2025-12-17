import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InvoiceData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface SummarySectionProps {
  invoices: InvoiceData[];
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean;
}

function SummaryCard({ title, value, isLoading }: SummaryCardProps) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-3/4" />
            ) : (
                <div className="text-2xl font-bold font-headline">{value}</div>
            )}
        </CardContent>
      </Card>
    );
  }

export function SummarySection({ invoices }: SummarySectionProps) {
  const summary = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        acc.totalInvoices += 1;
        acc.totalTaxableAmount += invoice.taxableAmount;
        acc.totalCgst += invoice.cgstAmount;
        acc.totalSgst += invoice.sgstAmount;
        acc.totalIgst += invoice.igstAmount;
        acc.totalInvoiceValue += invoice.totalInvoiceValue;
        return acc;
      },
      {
        totalInvoices: 0,
        totalTaxableAmount: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,
        totalInvoiceValue: 0,
      }
    );
  }, [invoices]);

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Step 2: Review Your Summary</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard title="Total Invoices Processed" value={summary.totalInvoices} />
        <SummaryCard title="Total Invoice Value" value={formatCurrency(summary.totalInvoiceValue)} />
        <SummaryCard title="Total Taxable Amount" value={formatCurrency(summary.totalTaxableAmount)} />
        <SummaryCard title="Total CGST" value={formatCurrency(summary.totalCgst)} />
        <SummaryCard title="Total SGST" value={formatCurrency(summary.totalSgst)} />
        <SummaryCard title="Total IGST" value={formatCurrency(summary.totalIgst)} />
      </div>
    </section>
  );
}
