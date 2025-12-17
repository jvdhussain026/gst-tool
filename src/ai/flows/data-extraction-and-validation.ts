'use server';

/**
 * @fileOverview Extracts and validates GST data from invoice PDFs, used as a fallback.
 *
 * - extractAndValidateGstData - A function that handles the extraction and validation of GST data.
 * - ExtractAndValidateGstDataInput - The input type for the extractAndValidateGstData function.
 * - ExtractAndValidateGstDataOutput - The return type for the extractAndValidateGstData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { InvoiceData } from '@/lib/types';


const ExtractAndValidateGstDataInputSchema = z.object({
  invoiceText: z.string().describe('The text content extracted from the invoice PDF.'),
  ruleBasedData: z.any().optional().describe('Partially extracted data from the rule-based system to be corrected or completed.'),
});
export type ExtractAndValidateGstDataInput = z.infer<typeof ExtractAndValidateGstDataInputSchema>;

// This schema is based on the OLD schema, as it's what the AI was trained on.
// The main page will map this output to the new, stricter InvoiceData schema.
const AISchema = z.object({
  invoiceType: z
    .enum(['Service', 'Spares'])
    .describe('The type of invoice (Service or Spares).'),
  invoiceDate: z.string().describe('The date of the invoice (normalized to YYYY-MM-DD).'),
  invoiceNumber: z.string().describe('The invoice number.'),
  vendorName: z.string().describe('The name of the vendor.'),
  vendorGstin: z.string().describe('The GSTIN of the vendor.'),
  taxableAmount: z.number().describe('The total taxable amount of the invoice.'),
  cgstAmount: z.number().describe('The Central GST amount.'),
  sgstAmount: z.number().describe('The State GST amount.'),
  igstAmount: z.number().describe('The Integrated GST amount.'),
  totalInvoiceValue: z.number().describe('The total value of the invoice.'),
  hash: z.string().optional().describe('The SHA256 hash of the invoice content (passed through).'),
});
export type AIData = z.infer<typeof AISchema>;

export async function extractAndValidateGstData(
  input: ExtractAndValidateGstDataInput
): Promise<AIData> {
  return extractAndValidateGstDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAndValidateGstDataPrompt',
  input: {schema: ExtractAndValidateGstDataInputSchema},
  output: {schema: AISchema},
  prompt: `You are an AI assistant for correcting and completing extracted data from an Indian GST invoice.
A rule-based system has already attempted to extract the data, but its confidence was low.
Your task is to analyze the raw invoice text and the partial data to return a corrected and complete JSON object.

Here is the full invoice text:
{{{invoiceText}}}

Here is the partial data extracted by the rule-based system:
{{{json ruleBasedData}}}

Please focus on filling in missing fields and correcting obvious errors based on the full text.
Follow these rules:
1.  **Prioritize the Raw Text**: The invoice text is the source of truth.
2.  **Fill Missing Fields**: Identify and fill any fields that the rule-based system missed (e.g., if total is 0).
3.  **Correct Errors**: If the rule-based system extracted something incorrectly (e.g., mistook a phone number for an invoice number), correct it.
4.  **Validate Totals**: Ensure that Taxable Amount + CGST + SGST + IGST equals the Total Invoice Value.
5.  **Output Format**: Return only a valid JSON object matching the requested schema. Do not add any commentary.

Return the final, corrected data as a JSON object matching this schema:
{{json schema=AISchema}}
`,
});

const extractAndValidateGstDataFlow = ai.defineFlow(
  {
    name: 'extractAndValidateGstDataFlow',
    inputSchema: ExtractAndValidateGstDataInputSchema,
    outputSchema: AISchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
