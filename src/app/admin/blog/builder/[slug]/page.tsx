
'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { BlogPost } from '@/lib/types';
import { getBlogPostBySlug } from '@/lib/firebase/firestore';
import { saveBlogPostAction } from '@/app/actions/blog.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import Image from 'next/image';

export default function BlogBuilderPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const isNewPost = slug === 'new';
    
    const [post, setPost] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        excerpt: '',
        imageUrl: 'https://placehold.co/600x400.png',
        dataAiHint: 'blog article',
        content: '',
    });
    
    const [loading, setLoading] = useState(!isNewPost);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isNewPost) return;
        
        async function fetchPost() {
            try {
                const postData = await getBlogPostBySlug(slug);
                if (postData) {
                    setPost(postData);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Failed to fetch blog post:", error);
                toast({ title: 'Error', description: 'Could not load the post data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [slug, isNewPost, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPost(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!post.title) {
            toast({ title: 'Title is required', variant: 'destructive'});
            return;
        }
        setIsSaving(true);
        const result = await saveBlogPostAction(post);
        if (result.success) {
            toast({ title: 'Success', description: 'Blog post saved successfully.' });
            router.push('/admin/blog');
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsSaving(false);
    };

    if (loading) {
        return (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">
                        {isNewPost ? 'Create New Blog Post' : `Edit: ${post.title}`}
                    </h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                        Fill in the details for your blog post.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                    Save Post
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Post Content</CardTitle>
                    <CardDescription>Use Markdown for formatting the main content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={post.title} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input id="slug" name="slug" value={post.slug} onChange={handleInputChange} placeholder="Leave blank to auto-generate from title"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input id="imageUrl" name="imageUrl" value={post.imageUrl} onChange={handleInputChange} />
                         {post.imageUrl && (
                            <div className="mt-2 rounded-lg border overflow-hidden aspect-video relative bg-muted">
                                <Image 
                                    src={post.imageUrl} 
                                    alt="Image Preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dataAiHint">Image AI Hint</Label>
                        <Input id="dataAiHint" name="dataAiHint" value={post.dataAiHint} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt / Short Summary</Label>
                        <Textarea id="excerpt" name="excerpt" value={post.excerpt} onChange={handleInputChange} rows={3} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Main Content (Markdown supported)</Label>
                        <Textarea id="content" name="content" value={post.content} onChange={handleInputChange} rows={20} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
