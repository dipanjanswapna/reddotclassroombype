'use server';
/**
 * @fileOverview An AI-powered study planner flow.
 *
 * - generateStudyPlan - Creates a structured study plan for a student.
 * - StudyPlanInput - The input type for the generateStudyPlan function.
 * - StudyPlanOutput - The return type for the generateStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CourseInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  // A simplified syllabus for the prompt
  topics: z.array(z.string()).describe('A list of major topics or modules in the course.'),
});

const DeadlineInfoSchema = z.object({
  courseTitle: z.string(),
  assignmentTitle: z.string(),
  deadline: z.string().describe('The due date in YYYY-MM-DD format.'),
});

export const StudyPlanInputSchema = z.object({
  courses: z.array(CourseInfoSchema).describe('A list of courses the student is enrolled in.'),
  deadlines: z.array(DeadlineInfoSchema).describe('A list of upcoming assignment deadlines.'),
  startDate: z.string().describe('The start date for the study plan in YYYY-MM-DD format.'),
  endDate: z.string().describe('The end date for the study plan in YYYY-MM-DD format.'),
});
export type StudyPlanInput = z.infer<typeof StudyPlanInputSchema>;

export const StudyPlanEventSchema = z.object({
    date: z.string().describe('The date of the event in YYYY-MM-DD format.'),
    title: z.string().describe('A concise title for the study event.'),
    type: z.enum(['study-session', 'assignment-deadline', 'quiz-reminder', 'exam-prep']).describe('The type of event.'),
    courseTitle: z.string().optional().describe('The course this event is related to.'),
    description: z.string().optional().describe('A brief description of the study session or reminder.'),
});

export const StudyPlanOutputSchema = z.object({
    events: z.array(StudyPlanEventSchema).describe('A list of scheduled study events.'),
});
export type StudyPlanOutput = z.infer<typeof StudyPlanOutputSchema>;

export async function generateStudyPlan(input: StudyPlanInput): Promise<StudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
    name: 'studyPlanPrompt',
    input: { schema: StudyPlanInputSchema },
    output: { schema: StudyPlanOutputSchema },
    prompt: `You are an expert academic advisor. Your task is to create a balanced and effective study plan for a student based on their enrolled courses and assignment deadlines.

The study plan should be for the period between {{startDate}} and {{endDate}}.

Here are the student's courses and their main topics:
{{#each courses}}
- **{{title}}**: Topics include {{#each topics}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/each}}

Here are the upcoming deadlines:
{{#each deadlines}}
- **{{assignmentTitle}}** for "{{courseTitle}}" is due on {{deadline}}.
{{/each}}

Please generate a study plan with a mix of the following event types:
- 'study-session': For studying specific topics.
- 'assignment-deadline': A reminder for the actual due date.
- 'quiz-reminder': A reminder to take a quiz for a specific course/topic.
- 'exam-prep': General exam preparation sessions.

Spread the study sessions evenly across the planning period. Avoid scheduling too many heavy topics on the same day. Ensure that deadline reminders are placed on the exact due date. For each study session, provide a clear title and a brief, helpful description.

Generate the full study plan as a JSON object that adheres to the provided output schema.`,
});

const generateStudyPlanFlow = ai.defineFlow(
    {
        name: 'generateStudyPlanFlow',
        inputSchema: StudyPlanInputSchema,
        outputSchema: StudyPlanOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
