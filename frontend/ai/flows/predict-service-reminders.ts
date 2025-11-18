'use server';
/**
 * @fileOverview Predicts the next service reminder date for a vehicle using AI.
 *
 * - predictServiceReminder - A function that predicts the next service reminder date.
 * - PredictServiceReminderInput - The input type for the predictServiceReminder function.
 * - PredictServiceReminderOutput - The return type for the predictServiceReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictServiceReminderInputSchema = z.object({
  lastServiceDate: z.string().describe('The date of the last service.'),
  currentMileage: z.number().describe('The current mileage of the vehicle.'),
  typicalUsagePattern: z
    .string()
    .describe('The typical usage pattern of the vehicle (e.g., daily commute, weekend trips).'),
  vehicleModel: z.string().describe('The model of the vehicle.'),
});
export type PredictServiceReminderInput = z.infer<typeof PredictServiceReminderInputSchema>;

const PredictServiceReminderOutputSchema = z.object({
  predictedServiceDate: z
    .string()
    .describe('The predicted date for the next service.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the predicted service date.'),
});
export type PredictServiceReminderOutput = z.infer<typeof PredictServiceReminderOutputSchema>;

export async function predictServiceReminder(
  input: PredictServiceReminderInput
): Promise<PredictServiceReminderOutput> {
  return predictServiceReminderFlow(input);
}

const predictServiceReminderPrompt = ai.definePrompt({
  name: 'predictServiceReminderPrompt',
  input: {schema: PredictServiceReminderInputSchema},
  output: {schema: PredictServiceReminderOutputSchema},
  prompt: `You are an expert AI assistant specializing in predicting vehicle service dates.

  Given the following information about a vehicle, predict the date for its next service and the reasoning behind your prediction.

  Last Service Date: {{{lastServiceDate}}}
  Current Mileage: {{{currentMileage}}}
  Typical Usage Pattern: {{{typicalUsagePattern}}}
  Vehicle Model: {{{vehicleModel}}}

  Consider factors such as the vehicle model's service schedule, the typical usage pattern, and the mileage since the last service.

  Return your prediction in the format specified in the output schema.
  `,
});

const predictServiceReminderFlow = ai.defineFlow(
  {
    name: 'predictServiceReminderFlow',
    inputSchema: PredictServiceReminderInputSchema,
    outputSchema: PredictServiceReminderOutputSchema,
  },
  async input => {
    const {output} = await predictServiceReminderPrompt(input);
    return output!;
  }
);
