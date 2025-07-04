/**
 * @fileOverview Schemas for the AI Quiz Generator flow.
 */
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
