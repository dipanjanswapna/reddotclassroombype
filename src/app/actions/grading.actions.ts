
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


export async function submitMcqExamAction(
  courseId: string,
  studentId: string,
  examId: string,
  answers: Record<string, string> // { [questionId]: optionId }
) {
  try {
    const course = await getCourse(courseId);
    if (!course) throw new Error("Course not found.");

    const studentExam = course.exams?.find(e => e.id === examId && e.studentId === studentId);
    if (!studentExam) throw new Error("Exam instance for this student not found.");
    if (studentExam.status === 'Graded') throw new Error("This exam has already been graded.");

    const examTemplateId = examId.split('-')[0];
    const examTemplate = course.examTemplates?.find(et => et.id === examTemplateId);
    if (!examTemplate) throw new Error("Exam template not found.");
    if (examTemplate.examType !== 'MCQ' || !examTemplate.questions) {
      throw new Error("This action is only for MCQ exams with questions.");
    }

    let correctAnswers = 0;
    examTemplate.questions.forEach(question => {
      if (answers[question.id] && answers[question.id] === question.correctAnswerId) {
        correctAnswers++;
      }
    });

    const marksPerQuestion = examTemplate.totalMarks / examTemplate.questions.length;
    const marksObtained = parseFloat((correctAnswers * marksPerQuestion).toFixed(2));
    
    // Simple grading scale
    const percentage = (marksObtained / examTemplate.totalMarks) * 100;
    let grade = 'F';
    if (percentage >= 80) grade = 'A+';
    else if (percentage >= 70) grade = 'A';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const updatedExams = course.exams!.map(e => 
        (e.id === examId && e.studentId === studentId)
        ? { ...e, status: 'Graded' as const, marksObtained, grade }
        : e
    );

    await updateCourse(courseId, { exams: updatedExams });

    await addNotification({
        userId: studentId,
        icon: 'Award',
        title: `Exam Graded: ${examTemplate.title}`,
        description: `You scored ${marksObtained}/${examTemplate.totalMarks} in "${course.title}".`,
        date: Timestamp.now(),
        read: false,
        link: `/student/my-courses/${courseId}/exams`
    });
    
    revalidatePath(`/student/my-courses/${courseId}/exams`);
    revalidatePath(`/teacher/grading`);

    return { 
        success: true, 
        message: 'Exam submitted and graded successfully.',
        score: marksObtained,
        totalMarks: examTemplate.totalMarks
    };

  } catch (error: any) {
    console.error("Error submitting MCQ exam:", error);
    return { success: false, message: error.message };
  }
}

export async function submitWrittenExamAction(
  courseId: string,
  studentId: string,
  examId: string,
  submissionText: string,
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
    
    const studentExam = course.exams[examIndex];
    if (studentExam.status !== 'Pending') {
      throw new Error("This exam cannot be submitted at this time.");
    }

    const updatedExams = [...course.exams];
    updatedExams[examIndex] = {
      ...studentExam,
      submissionText,
      submissionDate: Timestamp.now(),
      status: 'Submitted' as const,
    };

    await updateCourse(courseId, { exams: updatedExams });

    // Notify instructors
    if (course.instructors && course.instructors.length > 0) {
      for (const instructorInfo of course.instructors) {
        const instructor = await getInstructorBySlug(instructorInfo.slug);
        if (instructor?.userId) {
          await addNotification({
            userId: instructor.userId,
            icon: 'FileCheck2',
            title: `New Exam Submission in ${course.title}`,
            description: `${studentExam.studentName} submitted "${studentExam.title}".`,
            date: Timestamp.now(),
            read: false,
            link: `/teacher/grading`
          });
        }
      }
    }

    revalidatePath(`/student/my-courses/${courseId}/exams`);
    revalidatePath(`/teacher/grading`);

    return { success: true, message: 'Exam submitted successfully for grading.' };

  } catch (error: any) {
    console.error("Error submitting written exam:", error);
    return { success: false, message: error.message };
  }
}
