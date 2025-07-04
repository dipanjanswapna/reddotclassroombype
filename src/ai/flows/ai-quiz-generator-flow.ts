'use server';
/**
 * @fileOverview An AI-powered quiz generator flow.
 *
 * - generateQuizForLesson - A function that takes a lesson topic and generates a short quiz.
 * - AiQuizGeneratorInput - The input type for the function.
 * - AiQuizGeneratorOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AiQuizGeneratorInputSchema = z.object({
  lessonTitle: z.string().describe('The title of the lesson to generate a quiz for.'),
  courseContext: z.string().describe('The broader context of the course, such as its title and description.'),
});
export type AiQuizGeneratorInput = z.infer<typeof AiQuizGeneratorInputSchema>;

const QuizQuestionSchema = z.object({
    id: z.string().describe("A unique ID for the question, e.g., 'q1'."),
    text: z.string().describe('The text of the quiz question.'),
    options: z.array(z.object({
        id: z.string().describe("A unique ID for the option, e.g., 'opt1'."),
        text: z.string().describe('The text for this answer option.'),
    })).describe('An array of 4 possible answer options.'),
    correctAnswerId: z.string().describe("The ID of the correct option."),
});

export const AiQuizGeneratorOutputSchema = z.object({
  title: z.string().describe("A concise title for the quiz, based on the lesson title."),
  questions: z.array(QuizQuestionSchema).describe("An array of 3-5 multiple-choice questions for the quiz."),
});
export type AiQuizGeneratorOutput = z.infer<typeof AiQuizGeneratorOutputSchema>;

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
