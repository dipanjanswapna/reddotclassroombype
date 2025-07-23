

import {z} from 'genkit';

const CourseInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
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
    id: z.string().optional(),
    date: z.string().describe('The date of the event in YYYY-MM-DD format.'),
    time: z.string().optional().describe('The start time of the event in HH:mm format.'),
    title: z.string().describe('A concise title for the study event.'),
    type: z.enum(['study-session', 'assignment-deadline', 'quiz-reminder', 'exam-prep']).describe('The type of event.'),
    courseTitle: z.string().optional().describe('The course this event is related to.'),
    description: z.string().optional().describe('A brief description of the study session or reminder.'),
    priority: z.enum(['High', 'Medium', 'Low']).optional().describe('The priority of the task.'),
});
export type StudyPlanEvent = z.infer<typeof StudyPlanEventSchema>;


export const StudyPlanOutputSchema = z.object({
    events: z.array(StudyPlanEventSchema).describe('A list of scheduled study events.'),
});
export type StudyPlanOutput = z.infer<typeof StudyPlanOutputSchema>;
