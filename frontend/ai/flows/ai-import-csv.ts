'use server';

/**
 * @fileOverview A flow for importing data from CSV files using AI to map columns.
 *
 * - aiImportCsv - A function that handles the CSV import process.
 * - AIImportCsvInput - The input type for the aiImportCsv function.
 * - AIImportCsvOutput - The return type for the aiImportCsv function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIImportCsvInputSchema = z.object({
  csvDataUri: z
    .string()
    .describe(
      "A CSV file's data, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  dataType: z
    .enum(['customer', 'vehicle'])
    .describe('The type of data contained in the CSV file.'),
});
export type AIImportCsvInput = z.infer<typeof AIImportCsvInputSchema>;

const AIImportCsvOutputSchema = z.object({
  fieldMapping: z
    .record(z.string(), z.string())
    .describe('A mapping of CSV column headers to database fields.'),
  validationReport: z.string().describe('A report of any validation errors found in the CSV data.'),
  importSummary: z.string().describe('A summary of the number of records imported successfully.'),
});
export type AIImportCsvOutput = z.infer<typeof AIImportCsvOutputSchema>;

export async function aiImportCsv(input: AIImportCsvInput): Promise<AIImportCsvOutput> {
  return aiImportCsvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiImportCsvPrompt',
  input: {schema: AIImportCsvInputSchema},
  output: {schema: AIImportCsvOutputSchema},
  prompt: `You are an AI assistant that helps import data from CSV files into a database.

You will receive a CSV file as a data URI and the type of data it contains (customer or vehicle).

Your task is to:

1.  Analyze the CSV file and map the column headers to the corresponding database fields.
2.  Generate a validation report that identifies any errors in the data, such as duplicates, incorrect formats, or missing values.
3.  Provide a summary of the number of records that can be imported successfully.

Here is the CSV data:

{{csvDataUri}}

Here is the data type:

{{dataType}}

Ensure that the output is a JSON object that adheres to the AIImportCsvOutputSchema, particularly the fieldMapping and validationReport fields.
`,
});

const aiImportCsvFlow = ai.defineFlow(
  {
    name: 'aiImportCsvFlow',
    inputSchema: AIImportCsvInputSchema,
    outputSchema: AIImportCsvOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
