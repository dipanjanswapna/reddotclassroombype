

'use server';

import { revalidatePath } from 'next/cache';
import { addNotification, getCourse, getInstructorBySlug, updateCourse } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Exam, ExamTemplate, Question } from '@/lib/types';

export async function gradeAssignmentAction(
    courseId: string, 
    studentId: string,
    assignmentId: string, 
    grade: string,
    feedback: string
) {
    try {
        const course = await getCourse(courseId);
        if (!course || !course.assignments) {
            throw new Error("Course or assignments not found.");
        }

        const assignment = course.assignments.find(a => a.id === assignmentId && a.studentId === studentId);
        if (!assignment) {
            throw new Error("Assignment not found for this student.");
        }

        const updatedAssignments = course.assignments.map(a => {
            if (a.id === assignmentId && a.studentId === studentId) {
                return {
                    ...a,
                    status: 'Graded' as const,
                    grade,
                    feedback
                };
            }
            return a;
        });

        await updateCourse(courseId, { assignments: updatedAssignments });

        await addNotification({
            userId: studentId,
            icon: 'Award',
            title: `Assignment Graded: ${assignment.title}`,
            description: `You received a grade of ${grade} for your submission in "${course.title}".`,
            date: Timestamp.now(),
            read: false,
            link: `/student/my-courses/${courseId}/assignments`
        });

        revalidatePath(`/teacher/grading`);
        revalidatePath(`/student/my-courses/${courseId}/assignments`);
        return { success: true, message: 'Assignment graded successfully.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function gradeExamAction(
    courseId: string, 
    studentId: string,
    examId: string, 
    marksObtained: number,
    grade: string,
    feedback: string
) {
    try {
        const course = await getCourse(courseId);
        if (!course || !course.exams) {
            throw new Error("Course or exams not found.");
        }

        const examIndex = course.exams.findIndex(e => e.id === examId && e.studentId === studentId);
        if (examIndex === -1) {
            throw new Error("Exam not found for this student.");
        }
        
        const exam = course.exams[examIndex];

        const updatedExams = [...course.exams];
        updatedExams[examIndex] = {
            ...exam,
            status: 'Graded' as const,
            marksObtained,
            grade,
            feedback
        };

        await updateCourse(courseId, { exams: updatedExams });

        await addNotification({
            userId: studentId,
            icon: 'Award',
            title: `Exam Graded: ${exam.title}`,
            description: `You scored ${marksObtained}/${exam.totalMarks} in "${course.title}".`,
            date: Timestamp.now(),
            read: false,
            link: `/student/my-courses/${courseId}/exams`
        });

        revalidatePath(`/teacher/grading`);
        revalidatePath(`/student/my-courses/${courseId}/exams`);
        return { success: true, message: 'Exam graded successfully.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function submitExamAction(
  courseId: string,
  studentId: string,
  examId: string,
  answers: Record<string, any> // { [questionId]: answerValue }
) {
  try {
    const course = await getCourse(courseId);
    if (!course) throw new Error("Course not found.");

    const studentExam = course.exams?.find(e => e.id === examId && e.studentId === studentId);
    if (!studentExam) throw new Error("Exam instance for this student not found.");
    if (studentExam.status === 'Graded' || studentExam.status === 'Submitted') {
      throw new Error("This exam has already been submitted.");
    }

    const examTemplateId = examId.split('-')[0];
    const examTemplate = course.examTemplates?.find(et => et.id === examTemplateId);
    if (!examTemplate || !examTemplate.questions) {
      throw new Error("Exam template or questions not found.");
    }

    let totalMarksObtained = 0;
    let hasManualGrading = false;

    examTemplate.questions.forEach(question => {
      const studentAnswer = answers[question.id!];
      let isCorrect = false;

      switch (question.type) {
        case 'MCQ': {
          const correctOptionIds = new Set(question.options?.filter(o => o.isCorrect).map(o => o.id));
          const selectedOptionIds = new Set(studentAnswer || []);
          isCorrect = correctOptionIds.size === selectedOptionIds.size && [...correctOptionIds].every(id => selectedOptionIds.has(id));
          break;
        }
        case 'True/False':
          isCorrect = studentAnswer === question.correctAnswer;
          break;
        case 'Short Answer':
        case 'Essay':
        default:
          hasManualGrading = true;
          break;
      }
      
      if (isCorrect) {
        totalMarksObtained += question.points || 0;
      }
    });
    
    // Simple grading scale
    const percentage = examTemplate.totalMarks > 0 ? (totalMarksObtained / examTemplate.totalMarks) * 100 : 0;
    let grade = 'F';
    if (percentage >= 80) grade = 'A+';
    else if (percentage >= 70) grade = 'A';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const finalStatus: Exam['status'] = hasManualGrading ? 'Submitted' : 'Graded';

    const updatedExams = course.exams!.map(e => 
        (e.id === examId && e.studentId === studentId)
        ? { 
            ...e, 
            status: finalStatus,
            marksObtained: totalMarksObtained, 
            grade: hasManualGrading ? '' : grade,
            answers, 
            submissionDate: Timestamp.now(),
            submissionText: hasManualGrading ? Object.values(answers).join('\n\n---\n\n') : ''
          }
        : e
    );

    await updateCourse(courseId, { exams: updatedExams });

    const notificationTitle = finalStatus === 'Graded' ? `Exam Graded: ${examTemplate.title}` : `Exam Submitted: ${examTemplate.title}`;
    const notificationDescription = finalStatus === 'Graded' 
      ? `You scored ${totalMarksObtained}/${examTemplate.totalMarks} in "${course.title}".`
      : `Your exam "${examTemplate.title}" has been submitted for manual review.`;

    await addNotification({
        userId: studentId,
        icon: 'Award',
        title: notificationTitle,
        description: notificationDescription,
        date: Timestamp.now(),
        read: false,
        link: `/student/my-courses/${courseId}/exams/${examId}`
    });
    
    if (finalStatus === 'Submitted') {
        if (course.instructors && course.instructors.length > 0) {
            for (const instructorInfo of course.instructors) {
                const instructor = await getInstructorBySlug(instructorInfo.slug);
                if (instructor?.userId) {
                await addNotification({
                    userId: instructor.userId,
                    icon: 'FileCheck2',
                    title: `New Exam Submission in ${course.title}`,
                    description: `${studentExam.studentName} submitted "${examTemplate.title}" for manual grading.`,
                    date: Timestamp.now(),
                    read: false,
                    link: `/teacher/grading`
                });
                }
            }
        }
    }
    
    revalidatePath(`/student/my-courses/${courseId}/exams`);
    revalidatePath(`/teacher/grading`);

    return { 
        success: true, 
        message: 'Exam submitted successfully.',
        score: totalMarksObtained,
        totalMarks: examTemplate.totalMarks,
        finalStatus: finalStatus,
    };

  } catch (error: any) {
    console.error("Error submitting exam:", error);
    return { success: false, message: error.message };
  }
}
