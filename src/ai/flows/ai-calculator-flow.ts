'use server';
/**
 * @fileOverview An AI-powered calculator flow.
 *
 * - aiCalculator - A function that takes a natural language math query and returns the answer.
 * - AiCalculatorInput - The input type for the aiCalculator function.
 * - AiCalculatorOutput - The return type for the aiCalculator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCalculatorInputSchema = z.string().describe('A mathematical question in natural language.');
export type AiCalculatorInput = z.infer<typeof AiCalculatorInputSchema>;

const AiCalculatorOutputSchema = z.string().describe('The numerical or explanatory answer to the math question.');
export type AiCalculatorOutput = z.infer<typeof AiCalculatorOutputSchema>;

export async function aiCalculator(input: AiCalculatorInput): Promise<AiCalculatorOutput> {
  return aiCalculatorFlow(input);
}

const prompt = ai.definePrompt({
    name: 'aiCalculatorPrompt',
    input: { schema: AiCalculatorInputSchema },
    output: { format: 'text' },
    prompt: `You are a helpful AI calculator. Your task is to solve the mathematical question provided by the user.
    Provide only the final numerical answer without any extra explanation, unless the question is ambiguous or requires clarification.

    User Question: "{{prompt}}"

    Answer:`,
});

const aiCalculatorFlow = ai.defineFlow(
  {
    name: 'aiCalculatorFlow',
    inputSchema: AiCalculatorInputSchema,
    outputSchema: AiCalculatorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI model did not return a valid output.');
    }
    return output;
  }
);
