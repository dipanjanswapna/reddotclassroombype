import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getBlogPostBySlug } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { BlogPost } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Calendar, Clock, ChevronLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post: BlogPost | null = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | RDC Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Article Header */}
      <section className="relative pt-12 pb-8 bg-muted/30 border-b border-white/5 overflow-hidden">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" size="sm" className="mb-8 font-black uppercase tracking-widest text-[10px] gap-2 rounded-xl border border-white/10 hover:bg-white/5">
            <Link href="/blog">
              <ChevronLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </Button>
          
          <div className="max-w-4xl mx-auto text-left space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Badge variant="accent" className="rounded-full px-3">Article</Badge>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> 5 May 2024</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> 5 Min Read</span>
            </div>
            <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-6">
              {post.excerpt}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <article className="max-w-4xl mx-auto">
          <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/5 bg-black mb-12">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              priority
              className="object-cover opacity-90"
              data-ai-hint={post.dataAiHint}
            />
          </div>
          
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Sidebar info */}
            <div className="lg:col-span-1 hidden lg:block">
                <div className="sticky top-24 space-y-8">
                    <div className="space-y-4">
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Author</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs">RDC</div>
                            <div>
                                <p className="font-black text-xs uppercase">RDC Editorial</p>
                                <p className="text-[10px] text-muted-foreground">Expert Mentor</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Share Article</h4>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 border-white/10 hover:bg-primary hover:text-white transition-all"><Share2 className="w-4 h-4"/></Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-img:rounded-3xl prose-img:shadow-2xl">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
                </div>
                
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="font-bold text-sm">Was this article helpful?</p>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest h-10 px-6 border-white/10 hover:bg-primary/10">Yes, Thanks!</Button>
                        <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest h-10 px-6 border-white/10">Not really</Button>
                    </div>
                </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
