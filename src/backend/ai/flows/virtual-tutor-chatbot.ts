// VirtualTutorChatbot Flow
'use server';

/**
 * @fileOverview A virtual tutor chatbot for answering student questions about course material.
 *
 * - virtualTutorChatbot - A function that handles the chatbot interaction.
 * - VirtualTutorChatbotInput - The input type for the virtualTutorChatbot function.
 * - VirtualTutorChatbotOutput - The return type for the virtualTutorChatbot function.
 */

import {ai} from '@/backend/ai/genkit';
import {z} from 'genkit';

const VirtualTutorChatbotInputSchema = z.object({
  question: z.string().describe('The student\u2019s question about the course material.'),
  courseMaterial: z
    .string()
    .describe('The course material relevant to the student\u2019s question.'),
});
export type VirtualTutorChatbotInput = z.infer<typeof VirtualTutorChatbotInputSchema>;

const VirtualTutorChatbotOutputSchema = z.object({
  answer: z.string().describe('The chatbot\u2019s answer to the student\u2019s question.'),
});
export type VirtualTutorChatbotOutput = z.infer<typeof VirtualTutorChatbotOutputSchema>;

export async function virtualTutorChatbot(input: VirtualTutorChatbotInput): Promise<VirtualTutorChatbotOutput> {
  return virtualTutorChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'virtualTutorChatbotPrompt',
  input: {schema: VirtualTutorChatbotInputSchema},
  output: {schema: VirtualTutorChatbotOutputSchema},
  prompt: `You are a virtual tutor chatbot helping students with their course material.

  You are provided with the course material and the student's question.  Answer the question using the course material.

  Course Material: {{{courseMaterial}}}

  Question: {{{question}}}

  Answer: `,
});

const virtualTutorChatbotFlow = ai.defineFlow(
  {
    name: 'virtualTutorChatbotFlow',
    inputSchema: VirtualTutorChatbotInputSchema,
    outputSchema: VirtualTutorChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
