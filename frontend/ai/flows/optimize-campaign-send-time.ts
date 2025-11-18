'use server';

/**
 * @fileOverview Optimizes the send time for promotional campaigns using AI to maximize open rates and conversions.
 *
 * - optimizeCampaignSendTime - A function that optimizes the send time for a promotional campaign.
 * - OptimizeCampaignSendTimeInput - The input type for the optimizeCampaignSendTime function.
 * - OptimizeCampaignSendTimeOutput - The return type for the optimizeCampaignSendTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeCampaignSendTimeInputSchema = z.object({
  campaignType: z
    .string()
    .describe('The type of campaign, e.g., festival greetings, service reminders.'),
  historicalData: z
    .string()
    .describe(
      'Historical data on campaign performance, including send times, open rates, and conversions.'
    ),
  targetAudience: z.string().describe('Description of the target audience.'),
  dealerId: z.string().describe('The ID of the dealer.'),
});
export type OptimizeCampaignSendTimeInput = z.infer<
  typeof OptimizeCampaignSendTimeInputSchema
>;

const OptimizeCampaignSendTimeOutputSchema = z.object({
  optimizedSendTime: z
    .string()
    .describe(
      'The optimized send time for the campaign, in ISO 8601 format (e.g., 2024-11-26T10:00:00Z).'
    ),
  rationale:
    z.string().describe('The AI rationale behind the optimized send time.'),
});
export type OptimizeCampaignSendTimeOutput = z.infer<
  typeof OptimizeCampaignSendTimeOutputSchema
>;

export async function optimizeCampaignSendTime(
  input: OptimizeCampaignSendTimeInput
): Promise<OptimizeCampaignSendTimeOutput> {
  return optimizeCampaignSendTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeCampaignSendTimePrompt',
  input: {schema: OptimizeCampaignSendTimeInputSchema},
  output: {schema: OptimizeCampaignSendTimeOutputSchema},
  prompt: `You are an AI marketing assistant specializing in optimizing send times for promotional campaigns to maximize open rates and conversions.

  Given the following information, determine the optimal send time for the campaign:

  Campaign Type: {{{campaignType}}}
  Historical Data: {{{historicalData}}}
  Target Audience: {{{targetAudience}}}
  Dealer ID: {{{dealerId}}}

  Consider factors such as:
    - The type of campaign and its relevance to the target audience.
    - Historical performance data, including send times, open rates, and conversions.
    - The target audience's demographics, preferences, and online behavior.
    - Any relevant external factors, such as holidays or special events.

  Return the optimized send time in ISO 8601 format (e.g., 2024-11-26T10:00:00Z) and provide a brief rationale for your recommendation.

  Optimized Send Time: {{optimizedSendTime}}
  Rationale: {{rationale}}`,
});

const optimizeCampaignSendTimeFlow = ai.defineFlow(
  {
    name: 'optimizeCampaignSendTimeFlow',
    inputSchema: OptimizeCampaignSendTimeInputSchema,
    outputSchema: OptimizeCampaignSendTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
