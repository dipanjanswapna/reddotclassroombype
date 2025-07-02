
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBlogPosts } from '@/lib/firebase/firestore';
import { BlogPostsClient } from './blog-posts-client';

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Blog Management
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Create, edit, and manage all blog posts.
                </p>
            </div>
            <Button asChild>
                <Link href="/admin/blog/builder/new">
                    <PlusCircle className="mr-2" />
                    Create New Post
                </Link>
            </Button>
        </div>
        <BlogPostsClient initialPosts={posts} />
    </div>
  );
}
