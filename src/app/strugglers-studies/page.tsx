
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, BookOpen, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How We Help Students | RDC',
  description: 'Learn how Red Dot Classroom provides personalized support and resources to help students overcome their study challenges and succeed.',
};

export default function StrugglersStudiesPage() {
  const helpPoints = [
    {
      icon: Lightbulb,
      title: 'Personalized Mentorship',
      description: 'Our experienced mentors provide one-on-one guidance to identify weak points and create a customized study plan that works for you.'
    },
    {
      icon: BookOpen,
      title: 'Interactive Learning',
      description: 'Move beyond traditional methods with our engaging live classes, interactive quizzes, and practical assignments that make learning enjoyable.'
    },
    {
      icon: Users,
      title: 'Supportive Community',
      description: "You're not alone. Join our community of fellow students and supportive instructors to ask questions, share knowledge, and stay motivated."
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Struggling in Studies? Let Us Help.</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Every student learns differently, and it's okay to face challenges. At Red Dot Classroom, we believe in providing the right support to turn those struggles into strengths. Here's how we do it.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {helpPoints.map((point, index) => {
          const Icon = point.icon;
          return (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">{point.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{point.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
