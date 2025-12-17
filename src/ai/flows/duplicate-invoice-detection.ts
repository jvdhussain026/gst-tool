'use server';

/**
 * @fileOverview Duplicate invoice detection flow.
 *
 * This flow takes a PDF content as input and returns whether it is a duplicate of any of the existing invoices.
 * It uses content hashing to identify duplicates.
 *
 * @ExportedFunction
 * async function detectDuplicateInvoice(input: DetectDuplicateInvoiceInput): Promise<DetectDuplicateInvoiceOutput>
 *
 * @ExportedType DetectDuplicateInvoiceInput
 * @ExportedType DetectDuplicateInvoiceOutput
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import crypto from 'crypto';

const DetectDuplicateInvoiceInputSchema = z.object({
  pdfContent: z.string().describe('The content of the PDF invoice.'),
  existingInvoiceHashes: z
    .array(z.string())
    .describe('Array of SHA256 hashes of existing invoices.'),
});

export type DetectDuplicateInvoiceInput = z.infer<typeof DetectDuplicateInvoiceInputSchema>;

const DetectDuplicateInvoiceOutputSchema = z.object({
  isDuplicate: z.boolean().describe('Whether the invoice is a duplicate.'),
});

export type DetectDuplicateInvoiceOutput = z.infer<typeof DetectDuplicateInvoiceOutputSchema>;

export async function detectDuplicateInvoice(
  input: DetectDuplicateInvoiceInput
): Promise<DetectDuplicateInvoiceOutput> {
  return detectDuplicateInvoiceFlow(input);
}

const detectDuplicateInvoiceFlow = ai.defineFlow(
  {
    name: 'detectDuplicateInvoiceFlow',
    inputSchema: DetectDuplicateInvoiceInputSchema,
    outputSchema: DetectDuplicateInvoiceOutputSchema,
  },
  async input => {
    const hash = crypto
      .createHash('sha256')
      .update(input.pdfContent)
      .digest('hex');

    const isDuplicate = input.existingInvoiceHashes.includes(hash);

    return {isDuplicate};
  }
);
