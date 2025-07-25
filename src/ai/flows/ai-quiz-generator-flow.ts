
'use server';
/**
 * @fileOverview An AI-powered quiz generator flow.
 *
 * - generateQuizForLesson - A function that takes a lesson topic and generates a short quiz.
 * - AiQuizGeneratorInput - The input type for the function.
 * - AiQuizGeneratorOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {
    AiQuizGeneratorInputSchema,
    AiQuizGeneratorOutputSchema,
    type AiQuizGeneratorInput,
    type AiQuizGeneratorOutput
} from '@/ai/schemas/quiz-generator-schemas';

export type { AiQuizGeneratorInput, AiQuizGeneratorOutput };

export async function generateQuizForLesson(input: AiQuizGeneratorInput): Promise<AiQuizGeneratorOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiQuizGeneratorPrompt',
  input: { schema: AiQuizGeneratorInputSchema },
  output: { schema: AiQuizGeneratorOutputSchema },
  prompt: `You are an expert curriculum designer and quiz creator.
  
  Your task is to create a short, effective multiple-choice quiz based on a given lesson title and the course context.

  Course Context: {{courseContext}}
  Lesson Title: {{lessonTitle}}

  Please generate the following:
  1.  A short, relevant title for the quiz.
  2.  A set of 3 to 5 multiple-choice questions that test understanding of the lesson topic.
  3.  For each question, provide 4 distinct answer options.
  4.  Clearly identify the correct answer for each question.

  Ensure the questions are clear, concise, and relevant to the lesson title. The options should be plausible but with only one correct answer.

  Structure your entire response according to the provided JSON schema. Ensure all IDs are unique strings.`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: AiQuizGeneratorInputSchema,
    outputSchema: AiQuizGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
