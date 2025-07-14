import { config } from 'dotenv';
config();

import '@/ai/flows/virtual-tutor-chatbot.ts';
import '@/ai/flows/tts-flow.ts';
import '@/ai/flows/ai-calculator-flow.ts';
import '@/ai/flows/ai-course-creator-flow.ts';
import '@/ai/flows/study-plan-flow.ts';
import '@/ai/flows/ai-quiz-generator-flow.ts';
import '@/app/actions/batch.actions';
import '@/app/actions/question-bank.actions';
import '@/app/actions/progress.actions';
import '@/app/actions/quiz.actions';
import '@/app/actions/user.actions';
import '@/app/actions/notice.actions';
