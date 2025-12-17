'use server';

/**
 * @fileOverview Duplicate invoice detection flow.
 *
 * This flow takes a content hash and compares it against a list of existing hashes.
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
  hash: z.string().describe('The SHA256 hash of the new invoice content.'),
  existingInvoiceHashes: z
    .array(z.string())
    .describe('Array of SHA256 hashes of existing invoices.'),
});

export type DetectDuplicateInvoiceInput = z.infer<typeof DetectDuplicateInvoiceInputSchema>;

const DetectDuplicateInvoiceOutputSchema = z.object({
  isDuplicate: z.boolean().describe('Whether the invoice is a duplicate.'),
  hash: z.string().describe('The SHA256 hash of the invoice content (passed through).'),
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
  async ({ hash, existingInvoiceHashes }) => {
    const isDuplicate = existingInvoiceHashes.includes(hash);
    return { isDuplicate, hash };
  }
);
