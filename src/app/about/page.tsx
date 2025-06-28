import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | RED DOT CLASSROOM (RDC)',
  description: "Learn more about RED DOT CLASSROOM (RDC)'s mission, vision, and the team behind our online learning platform, powered by PRANGONS ECOSYSTEM.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">About RED DOT CLASSROOM</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Learn more about RED DOT CLASSROOM (RDC)'s mission, vision, and the team behind it, powered by PRANGONS ECOSYSTEM.
        </p>
      </div>
      <div className="mt-12 max-w-4xl mx-auto text-center">
        <h2 className="font-headline text-3xl font-bold">Our Mission</h2>
        <p className="mt-4 text-muted-foreground">
            To provide high-quality, affordable, and interactive online education for students across Bangladesh, empowering them for academic excellence and skill development.
        </p>
        <h2 className="font-headline text-3xl font-bold mt-8">Our Vision</h2>
        <p className="mt-4 text-muted-foreground">
            To create an accessible and effective learning ecosystem inspired by the success of platforms like 10 Minute School, connecting students, teachers, and guardians for a collaborative educational journey.
        </p>
      </div>
    </div>
  );
}
