import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const blogPosts = [
    {
        slug: "study-tips-for-hsc",
        title: "Effective Study Tips for HSC Candidates",
        excerpt: "Discover proven strategies to boost your preparation for the upcoming HSC exams and achieve your desired results.",
        imageUrl: "https://placehold.co/600x400",
        dataAiHint: "student studying",
    },
    {
        slug: "choosing-university-subject",
        title: "How to Choose the Right University Subject for You",
        excerpt: "A comprehensive guide to help you navigate the difficult decision of choosing a subject for your university studies.",
        imageUrl: "https://placehold.co/600x400",
        dataAiHint: "university campus",
    },
    {
        slug: "importance-of-skills-development",
        title: "The Importance of Skill Development Beyond Academics",
        excerpt: "Learn why developing practical skills is crucial for your career and how you can get started today.",
        imageUrl: "https://placehold.co/600x400",
        dataAiHint: "person coding",
    },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Our Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Articles, tips, and resources to help you on your learning journey.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="flex flex-col">
            <CardHeader className="p-0">
                <Link href={`/blog/${post.slug}`}>
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={600}
                        height={400}
                        className="rounded-t-lg object-cover"
                        data-ai-hint={post.dataAiHint}
                    />
                </Link>
            </CardHeader>
            <CardContent className="p-6 flex flex-col flex-grow">
              <h2 className="font-headline text-xl font-bold">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-2 text-muted-foreground flex-grow">{post.excerpt}</p>
              <Button asChild variant="link" className="p-0 h-auto mt-4 self-start">
                 <Link href={`/blog/${post.slug}`}>
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
