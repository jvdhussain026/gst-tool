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

const DetectDuplicateInvoiceInputSchema = z.object({
  pdfContent: z.string().describe('The content of the PDF invoice.'),
  existingInvoiceHashes: z
    .array(z.string())
    .describe('Array of SHA256 hashes of existing invoices.'),
});

export type DetectDuplicateInvoiceInput = z.infer<typeof DetectDuplicateInvoiceInputSchema>;

const DetectDuplicateInvoiceOutputSchema = z.object({
  isDuplicate: z.boolean().describe('Whether the invoice is a duplicate.'),
  hash: z.string().describe('The SHA256 hash of the invoice content.'),
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
  async ({ pdfContent, existingInvoiceHashes }) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pdfContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const isDuplicate = existingInvoiceHashes.includes(hashHex);

    return { isDuplicate, hash: hashHex };
  }
);
