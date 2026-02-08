
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPosts } from "@/lib/firebase/firestore";
import { BlogPost } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Our Blog',
  description: 'Articles, tips, and resources from Red Dot Classroom to help you on your learning journey.',
};

export default async function BlogPage() {
  const blogPosts: BlogPost[] = await getBlogPosts();

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-14 max-w-full">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-black tracking-tight text-green-700 dark:text-green-500 uppercase">Our Blog</h1>
        <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full shadow-md" />
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
          Articles, tips, and resources to help you on your learning journey.
        </p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="flex flex-col overflow-hidden rounded-[2rem] border border-primary/10 hover:border-primary/40 transition-all duration-500 shadow-lg hover:shadow-xl group">
            <CardHeader className="p-0 overflow-hidden relative">
                <Link href={`/blog/${post.slug}`}>
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            data-ai-hint={post.dataAiHint}
                        />
                    </div>
                </Link>
            </CardHeader>
            <CardContent className="p-6 flex flex-col flex-grow">
              <h2 className="font-headline text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-3 text-muted-foreground flex-grow line-clamp-3 text-sm leading-relaxed font-medium">{post.excerpt}</p>
              <Button asChild variant="link" className="p-0 h-auto mt-6 self-start font-black uppercase text-[10px] tracking-widest text-primary hover:no-underline">
                 <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                    Read More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
