/**
 * @fileOverview Schemas for the AI Exam Preparation Planner flow.
 */
import {z} from 'genkit';
import { StudyPlanEventSchema } from './study-plan-schemas';


export const ExamPrepInputSchema = z.object({
  courseContext: z.string().describe('The context of the course, including title and syllabus topics.'),
  examDate: z.string().describe('The date of the exam in YYYY-MM-DD format.'),
  currentDate: z.string().describe('The current date in YYYY-MM-DD format.'),
});
export type ExamPrepInput = z.infer<typeof ExamPrepInputSchema>;


export const ExamPrepOutputSchema = z.object({
    events: z.array(StudyPlanEventSchema).describe('A list of scheduled revision and preparation events leading up to the exam.'),
});
export type ExamPrepOutput = z.infer<typeof ExamPrepOutputSchema>;
