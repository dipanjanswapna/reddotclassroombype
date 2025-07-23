
'use server';
/**
 * @fileOverview An AI-powered study planner flow.
 *
 * - generateStudyPlan - Creates a structured study plan for a student.
 * - StudyPlanInput - The input type for the generateStudyPlan function.
 * - StudyPlanOutput - The return type for the generateStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {
    StudyPlanInputSchema,
    StudyPlanOutputSchema,
    type StudyPlanInput,
    type StudyPlanOutput
} from '@/ai/schemas/study-plan-schemas';

export type { StudyPlanInput, StudyPlanOutput } from '@/ai/schemas/study-plan-schemas';


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

Spread the study sessions evenly across the planning period. Avoid scheduling too many heavy topics on the same day. Ensure that deadline reminders are placed on the exact due date. For each study session, provide a clear, helpful description.

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
        if (!output) {
          throw new Error('AI model did not return a valid output.');
        }
        return output;
    }
);
