// VirtualTutorChatbot Flow
'use server';

/**
 * @fileOverview A virtual tutor chatbot for answering student questions about course material.
 *
 * - virtualTutorChatbot - A function that handles the chatbot interaction.
 * - VirtualTutorChatbotInput - The input type for the virtualTutorChatbot function.
 * - VirtualTutorChatbotOutput - The return type for the virtualTutorChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getCourse } from '@/lib/firebase/firestore'; // Import getCourse

// Updated Input Schema
const VirtualTutorChatbotInputSchema = z.object({
  courseId: z.string().describe('The ID of the course the question is about.'),
  question: z.string().describe('The student\u2019s question about the course material.'),
});
export type VirtualTutorChatbotInput = z.infer<typeof VirtualTutorChatbotInputSchema>;

const VirtualTutorChatbotOutputSchema = z.object({
  answer: z.string().describe('The chatbot\u2019s answer to the student\u2019s question.'),
});
export type VirtualTutorChatbotOutput = z.infer<typeof VirtualTutorChatbotOutputSchema>;

// The schema for the data we'll pass to the prompt template
const PromptInputSchema = z.object({
  courseContext: z.string().describe("The course material to use as context."),
  question: z.string().describe('The student\u2019s question about the course material.'),
});

export async function virtualTutorChatbot(input: VirtualTutorChatbotInput): Promise<VirtualTutorChatbotOutput> {
  return virtualTutorChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'virtualTutorChatbotPrompt',
  input: {schema: PromptInputSchema}, // Use the new internal schema
  output: {schema: VirtualTutorChatbotOutputSchema},
  prompt: `You are a virtual tutor chatbot helping students with their course material.

  You are provided with the course material and the student's question. Answer the question using ONLY the course material provided. If the answer cannot be found in the material, say "I'm sorry, I can't answer that based on the provided course material."

  Course Material: {{{courseContext}}}

  Question: {{{question}}}

  Answer: `,
});

const virtualTutorChatbotFlow = ai.defineFlow(
  {
    name: 'virtualTutorChatbotFlow',
    inputSchema: VirtualTutorChatbotInputSchema, // The flow takes courseId and question
    outputSchema: VirtualTutorChatbotOutputSchema,
  },
  async input => {
    // Fetch the course content
    const course = await getCourse(input.courseId);
    if (!course) {
        throw new Error('Course not found.');
    }

    // Create a text context from the course data
    let courseContext = `Course Title: ${course.title}\nCourse Description: ${course.description}\n\n`;
    
    if (course.syllabus) {
        courseContext += "Syllabus:\n";
        course.syllabus.forEach(module => {
            courseContext += `- Module: ${module.title}\n`;
            module.lessons.forEach(lesson => {
                courseContext += `  - Lesson: ${lesson.title}\n`;
            });
        });
    }

    // Call the prompt with the constructed context
    const {output} = await prompt({
        courseContext: courseContext,
        question: input.question,
    });
    
    return output!;
  }
);
