'use server';

/**
 * @fileOverview An AI assistant for summarizing dashboard KPIs in natural language.
 *
 * - getDashboardSummary - A function that generates a summary of key dashboard metrics.
 * - DashboardSummaryInput - The input type for the getDashboardSummary function.
 * - DashboardSummaryOutput - The return type for the getDashboardSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DashboardSummaryInputSchema = z.object({
  revenue: z.number().describe('The total revenue for the period in Indian Rupees (₹).'),
  sales: z.number().describe('The total number of sales for the period.'),
  leadConversionRate: z.number().describe('The lead conversion rate for the period (0-1).'),
  customerSatisfaction: z.number().describe('Customer satisfaction score (0-100).'),
  period: z.string().describe('The time period for the data (e.g., "last week", "this month").'),
});
export type DashboardSummaryInput = z.infer<typeof DashboardSummaryInputSchema>;

const DashboardSummaryOutputSchema = z.object({
  summary: z.string().describe('A natural language summary of the dashboard KPIs.'),
});
export type DashboardSummaryOutput = z.infer<typeof DashboardSummaryOutputSchema>;

export async function getDashboardSummary(input: DashboardSummaryInput): Promise<DashboardSummaryOutput> {
  return dashboardSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dashboardSummaryPrompt',
  input: {schema: DashboardSummaryInputSchema},
  output: {schema: DashboardSummaryOutputSchema},
  prompt: `You are a smart dashboard assistant that summarizes key performance indicators (KPIs) for dealer admins in India.

  Provide a concise and informative natural language summary of the following KPIs for the specified period.
  IMPORTANT: All monetary values must be formatted using the Indian Rupee symbol (₹).

  Period: {{{period}}}
  Revenue: {{{revenue}}}
  Sales: {{{sales}}}
  Lead Conversion Rate: {{{leadConversionRate}}}
  Customer Satisfaction: {{{customerSatisfaction}}}

  Focus on the most important trends and insights, and use clear and easy-to-understand language.
  Avoid technical jargon and present the information in a way that is actionable for the dealer admin.
`,
});

const dashboardSummaryFlow = ai.defineFlow(
  {
    name: 'dashboardSummaryFlow',
    inputSchema: DashboardSummaryInputSchema,
    outputSchema: DashboardSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
