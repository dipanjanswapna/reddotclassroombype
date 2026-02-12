import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPosts } from "@/lib/firebase/firestore";
import { BlogPost } from "@/lib/types";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: 'Academic Insights | RDC Blog',
  description: 'Articles, tips, and resources from Red Dot Classroom to help you on your learning journey.',
};

export default async function BlogPage() {
  const blogPosts: BlogPost[] = await getBlogPosts();

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Modern Header Section */}
      <section className="relative py-16 md:py-24 bg-muted/30 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20 shadow-sm">
            <Newspaper className="w-3.5 h-3.5" />
            RDC Academic Insights
          </div>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight max-w-4xl mx-auto">
            Our <span className="text-primary">Blog</span> & Resources
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Stay ahead with the latest academic tips, exam strategies, and educational trends curated by our elite faculty.
          </p>
        </div>
      </section>

      {/* Blog Grid Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <Card key={post.slug} className="group flex flex-col glassmorphism-card border-white/20 bg-white/40 dark:bg-card/40 overflow-hidden rounded-[20px] shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
              <CardHeader className="p-0 relative aspect-video overflow-hidden">
                <Link href={`/blog/${post.slug}`}>
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint={post.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
                <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md border-white/10 font-black text-[9px] uppercase tracking-widest">
                  Insight
                </Badge>
              </CardHeader>
              <CardContent className="p-6 flex flex-col flex-grow text-left">
                <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> 5 May 2024</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> 5 Min Read</span>
                </div>
                <h2 className="font-headline text-xl md:text-2xl font-black leading-tight group-hover:text-primary transition-colors text-left">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed line-clamp-3 font-medium flex-grow">
                  {post.excerpt}
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <Button asChild variant="link" className="p-0 h-auto self-start text-primary font-black uppercase tracking-widest text-[10px] group-hover:gap-3 transition-all">
                    <Link href={`/blog/${post.slug}`} className="flex items-center">
                      Read Article <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-white/10 rounded-[20px]">
            <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground text-lg font-bold">No blog posts found at the moment.</p>
            <Button variant="link" asChild className="mt-2 text-primary font-black uppercase">
              <Link href="/">Back to Homepage</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
