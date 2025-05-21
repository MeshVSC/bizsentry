// The `use server` directive is required for Server Actions used in the Next.js App Router.
'use server';

/**
 * @fileOverview Extracts product information from a receipt image.
 *
 * - receiptDataExtraction - A function that handles the receipt data extraction process.
 * - ReceiptDataExtractionInput - The input type for the receiptDataExtraction function.
 * - ReceiptDataExtractionOutput - The return type for the receiptDataExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceiptDataExtractionInputSchema = z.object({
  receiptImage: z
    .string()
    .describe(
      "A receipt image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReceiptDataExtractionInput = z.infer<typeof ReceiptDataExtractionInputSchema>;

const ReceiptDataExtractionOutputSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe('The name of the product.'),
      description: z.string().optional().describe('A description of the product.'),
      quantity: z.number().optional().describe('The quantity of the product purchased.'),
      price: z.number().optional().describe('The price of the product.'),
    })
  ).describe('An array of items extracted from the receipt.'),
});
export type ReceiptDataExtractionOutput = z.infer<typeof ReceiptDataExtractionOutputSchema>;

export async function receiptDataExtraction(input: ReceiptDataExtractionInput): Promise<ReceiptDataExtractionOutput> {
  return receiptDataExtractionFlow(input);
}

const receiptDataExtractionPrompt = ai.definePrompt({
  name: 'receiptDataExtractionPrompt',
  input: {schema: ReceiptDataExtractionInputSchema},
  output: {schema: ReceiptDataExtractionOutputSchema},
  prompt: `You are an AI assistant specialized in extracting item information from receipt images.

  Analyze the provided receipt image and extract all products, quantities, prices and descriptions of the items listed on the receipt.

  Return the data in JSON format.

  Receipt Image: {{media url=receiptImage}}
  `, 
  //Safety settings can be configured here as well if needed
});

const receiptDataExtractionFlow = ai.defineFlow(
  {
    name: 'receiptDataExtractionFlow',
    inputSchema: ReceiptDataExtractionInputSchema,
    outputSchema: ReceiptDataExtractionOutputSchema,
  },
  async input => {
    const {output} = await receiptDataExtractionPrompt(input);
    return output!;
  }
);
