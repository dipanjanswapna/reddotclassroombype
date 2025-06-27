import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/lib/mock-data";

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
