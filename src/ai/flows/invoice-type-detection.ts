'use server';

/**
 * @fileOverview A flow to automatically detect the type of GST invoice (Service or Spares) based on its content.
 *
 * - detectInvoiceType - A function that handles the invoice type detection process.
 * - DetectInvoiceTypeInput - The input type for the detectInvoiceType function.
 * - DetectInvoiceTypeOutput - The return type for the detectInvoiceType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectInvoiceTypeInputSchema = z.object({
  invoiceText: z
    .string()
    .describe('The text content extracted from the GST invoice PDF.'),
});
export type DetectInvoiceTypeInput = z.infer<typeof DetectInvoiceTypeInputSchema>;

const DetectInvoiceTypeOutputSchema = z.object({
  invoiceType: z
    .enum(['Service', 'Spares'])
    .describe('The detected type of the GST invoice (Service or Spares).'),
});
export type DetectInvoiceTypeOutput = z.infer<typeof DetectInvoiceTypeOutputSchema>;

export async function detectInvoiceType(input: DetectInvoiceTypeInput): Promise<DetectInvoiceTypeOutput> {
  return detectInvoiceTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectInvoiceTypePrompt',
  input: {schema: DetectInvoiceTypeInputSchema},
  output: {schema: DetectInvoiceTypeOutputSchema},
  prompt: `You are an expert in analyzing GST invoices and determining their type based on their content.\

  Given the following text extracted from a GST invoice, determine whether it is a 'Service' invoice or a 'Spares' invoice.\

  Here are some guidelines for determining the invoice type:
  - Spares Payout Invoice: Contains multiple HSN codes, material/part descriptions, a detailed tax table, and usually higher amounts.
  - Service / Non-Standard Payout Invoice: Contains service charges, labor/upcountry charges, fewer line items, and smaller totals.\

  Text from Invoice: {{{invoiceText}}}

  Return the invoice type as either 'Service' or 'Spares'.`,
});

const detectInvoiceTypeFlow = ai.defineFlow(
  {
    name: 'detectInvoiceTypeFlow',
    inputSchema: DetectInvoiceTypeInputSchema,
    outputSchema: DetectInvoiceTypeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
