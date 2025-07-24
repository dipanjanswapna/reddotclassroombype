
'use server';
/**
 * @fileOverview An AI-powered exam preparation planner.
 *
 * - generateExamPrepPlan - Creates a structured revision plan for an upcoming exam.
 * - ExamPrepInput - The input type for the generateExamPrepPlan function.
 * - ExamPrepOutput - The return type for the generateExamPrepPlan function.
 */

import {ai} from '@/ai/genkit';
import {
    ExamPrepInputSchema,
    ExamPrepOutputSchema,
    type ExamPrepInput,
    type ExamPrepOutput
} from '@/ai/schemas/exam-prep-schemas';

export type { ExamPrepInput, ExamPrepOutput };


export async function generateExamPrepPlan(input: ExamPrepInput): Promise<ExamPrepOutput> {
  return generateExamPrepPlanFlow(input);
}

const prompt = ai.definePrompt({
    name: 'examPrepPlanPrompt',
    input: { schema: ExamPrepInputSchema },
    output: { schema: ExamPrepOutputSchema },
    prompt: `You are an expert academic advisor specializing in exam preparation strategies.
    
    Your task is to create a detailed and effective revision plan for a student based on their course syllabus and a specific exam date.

    The exam is on {{examDate}}. The current date is {{currentDate}}.

    Here is the context of the course:
    {{courseContext}}

    Please generate a revision plan with a mix of the following event types:
    - 'study-session': For revising specific topics from the syllabus.
    - 'exam-prep': For general exam preparation like solving past papers or mock tests.
    - 'quiz-reminder': A reminder to take a practice quiz.
    - 'assignment-deadline': A reminder for the actual exam date.

    Spread the study sessions logically across the planning period. Start with foundational or difficult topics earlier. The last few days before the exam should be reserved for mock tests and light revision. Do not schedule any heavy study sessions the day before the exam.

    For each study session, provide a clear, helpful title and a brief description. Make the plan realistic for a student to follow.

    Generate the full study plan as a JSON object that adheres to the provided output schema.`,
});

const generateExamPrepPlanFlow = ai.defineFlow(
    {
        name: 'generateExamPrepPlanFlow',
        inputSchema: ExamPrepInputSchema,
        outputSchema: ExamPrepOutputSchema,
    },
    async (input) => {
        const fullInput = {
            ...input,
            currentDate: new Date().toISOString().split('T')[0],
        }
        const { output } = await prompt(fullInput);
        if (!output) {
          throw new Error('AI model did not return a valid output.');
        }
        return output;
    }
);
