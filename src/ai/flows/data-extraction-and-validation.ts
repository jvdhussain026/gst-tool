'use server';

/**
 * @fileOverview Extracts and validates GST data from invoice PDFs.
 *
 * - extractAndValidateGstData - A function that handles the extraction and validation of GST data.
 * - ExtractAndValidateGstDataInput - The input type for the extractAndValidateGstData function.
 * - ExtractAndValidateGstDataOutput - The return type for the extractAndValidateGstData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractAndValidateGstDataInputSchema = z.object({
  invoiceText: z.string().describe('The text content extracted from the invoice PDF.'),
});
export type ExtractAndValidateGstDataInput = z.infer<typeof ExtractAndValidateGstDataInputSchema>;

const ExtractAndValidateGstDataOutputSchema = z.object({
  invoiceType: z
    .enum(['Service', 'Spares'])
    .describe('The type of invoice (Service or Spares).'),
  referenceNumber: z.string().optional().describe('The reference or CRM number of the invoice.'),
  invoiceDate: z.string().describe('The date of the invoice (normalized format).'),
  invoiceNumber: z.string().describe('The invoice number.'),
  vendorName: z.string().describe('The name of the vendor.'),
  vendorGstin: z.string().describe('The GSTIN of the vendor.'),
  customerGstin: z.string().optional().describe('The GSTIN of the customer.'),
  state: z.string().describe('The state to which the GST applies.'),
  taxableAmount: z.number().describe('The total taxable amount of the invoice.'),
  cgstAmount: z.number().describe('The Central GST amount.'),
  sgstAmount: z.number().describe('The State GST amount.'),
  igstAmount: z.number().describe('The Integrated GST amount.'),
  totalTax: z.number().describe('The total tax amount (CGST + SGST + IGST).'),
  totalInvoiceValue: z.number().describe('The total value of the invoice.'),
  isValid: z
    .boolean()
    .describe('Whether the invoice is valid based on total validation.'),
});
export type ExtractAndValidateGstDataOutput = z.infer<typeof ExtractAndValidateGstDataOutputSchema>;

export async function extractAndValidateGstData(
  input: ExtractAndValidateGstDataInput
): Promise<ExtractAndValidateGstDataOutput> {
  return extractAndValidateGstDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAndValidateGstDataPrompt',
  input: {schema: ExtractAndValidateGstDataInputSchema},
  output: {schema: ExtractAndValidateGstDataOutputSchema},
  prompt: `You are an expert AI assistant for extracting data from Indian GST invoices. Your goal is to extract key information from the given invoice text and return it in a structured JSON format. You must detect the invoice type (Service or Spares) based on the content.

Here's the invoice text:
{{{invoiceText}}}

Follow these rules:

1.  **Invoice Type Detection**: Automatically determine if the invoice is a 'Service' or 'Spares' invoice based on keywords and content.  Spares invoices typically contain multiple HSN codes and part descriptions, while Service invoices have service and labor charges.
2.  **Data Extraction**: Extract the following fields:
    *   Invoice Type (Service / Spares)
    *   Reference / CRM Number (if available)
    *   Invoice Date (normalize to YYYY-MM-DD format)
    *   Invoice Number
    *   Vendor Name
    *   Vendor GSTIN
    *   Customer GSTIN (if available)
    *   State
    *   Taxable Amount
    *   CGST Amount
    *   SGST Amount
    *   IGST Amount
    *   Total Tax
    *   Total Invoice Value
3.  **Validation**: Validate that Taxable Amount + CGST + SGST + IGST = Total Invoice Value. Set isValid to true if the validation passes, otherwise false.
4.  **Exclusion**: Exclude disclaimers, legal text, e-signature notes, SR phone numbers, personal phone numbers, internal audit text, and non-financial descriptions. Only extract financial and GST-relevant data.
5.  **Normalization**: Normalize dates to YYYY-MM-DD format and ensure decimal numbers are correctly formatted.

Return the output as a JSON object matching the ExtractAndValidateGstDataOutputSchema.  If a field is not found, and is optional, leave it blank.

Here is the output schema:
{{json schema=ExtractAndValidateGstDataOutputSchema}}
`,
});

const extractAndValidateGstDataFlow = ai.defineFlow(
  {
    name: 'extractAndValidateGstDataFlow',
    inputSchema: ExtractAndValidateGstDataInputSchema,
    outputSchema: ExtractAndValidateGstDataOutputSchema,
    model: 'googleai/gemini-2.5-flash',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
