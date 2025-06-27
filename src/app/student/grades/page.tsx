
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockGrades } from "@/lib/mock-data";

function getGradeColor(grade: string) {
    if (grade.startsWith('A')) return 'bg-green-500 text-white';
    if (grade.startsWith('B')) return 'bg-yellow-500 text-white';
    if (grade.startsWith('C')) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
}

export default function GradesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Grades & Feedback</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          View your grades and feedback from instructors for all your assignments and quizzes.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Grade Report</CardTitle>
            <CardDescription>Summary of your performance across all enrolled courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Assignment/Quiz</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockGrades.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.courseName}</TableCell>
                  <TableCell>{item.assignmentName}</TableCell>
                  <TableCell className="text-center">{item.score}%</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getGradeColor(item.grade)}>{item.grade}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
