'use server';
/**
 * @fileOverview An AI-powered course creator flow.
 *
 * - generateCourseContent - A function that takes a course topic and generates a title, description, outcomes, syllabus, and FAQs.
 * - AiCourseCreatorInput - The input type for the generateCourseContent function.
 * - AiCourseCreatorOutput - The return type for the generateCourseContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCourseCreatorInputSchema = z.string().describe('The topic for the course to be generated.');
export type AiCourseCreatorInput = z.infer<typeof AiCourseCreatorInputSchema>;

const AiCourseCreatorOutputSchema = z.object({
  title: z.string().describe('A catchy and descriptive title for the course.'),
  description: z.string().describe('A detailed and engaging description of the course.'),
  outcomes: z.array(z.string()).describe('A list of 5-7 key learning outcomes for the students.'),
  syllabus: z.array(z.object({
    title: z.string().describe('The title of the module.'),
    lessons: z.array(z.object({
      title: z.string().describe('The title of the lesson.'),
    })).describe('A list of lessons within this module.'),
  })).describe('A detailed syllabus with 4-6 modules, each with 3-5 lessons.'),
  faqs: z.array(z.object({
    question: z.string().describe('A frequently asked question.'),
    answer: z.string().describe('The answer to the question.'),
  })).describe('A list of 3-5 frequently asked questions (FAQs) about the course.'),
});
export type AiCourseCreatorOutput = z.infer<typeof AiCourseCreatorOutputSchema>;

export async function generateCourseContent(input: AiCourseCreatorInput): Promise<AiCourseCreatorOutput> {
  return generateCourseContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCourseCreatorPrompt',
  input: { schema: AiCourseCreatorInputSchema },
  output: { schema: AiCourseCreatorOutputSchema },
  prompt: `You are an expert curriculum designer for an online learning platform. Your task is to generate the content for a new course based on the provided topic.

  Topic: "{{prompt}}"

  Please generate the following based on the topic:
  1.  **Course Title:** A compelling and clear title.
  2.  **Course Description:** A detailed paragraph explaining what the course is about, who it's for, and what students will learn.
  3.  **Learning Outcomes:** A list of 5 to 7 specific things students will be able to do after completing the course.
  4.  **Syllabus:** A structured course syllabus with 4 to 6 modules. Each module should have a title and contain 3 to 5 lesson titles.
  5.  **FAQs:** A list of 3 to 5 frequently asked questions that potential students might have, along with concise answers.

  Structure your entire response according to the provided JSON schema.`,
});

const generateCourseContentFlow = ai.defineFlow(
  {
    name: 'generateCourseContentFlow',
    inputSchema: AiCourseCreatorInputSchema,
    outputSchema: AiCourseCreatorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI model did not return a valid output.');
    }
    return output;
  }
);
