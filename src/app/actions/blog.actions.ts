
'use server';
import { config } from 'dotenv';
config();

import { revalidatePath } from 'next/cache';
import { addBlogPost, deleteBlogPost, updateBlogPost } from '@/lib/firebase/firestore';
import { BlogPost } from '@/lib/types';

export async function saveBlogPostAction(postData: Partial<BlogPost>) {
  try {
    const { id, ...data } = postData;
    
    if (!data.slug) {
        data.slug = (data.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    if (id) {
      await updateBlogPost(id, data);
    } else {
      await addBlogPost(data as Omit<BlogPost, 'id'>);
    }
    
    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    if (data.slug) {
        revalidatePath(`/blog/${data.slug}`);
    }

    return { success: true, message: 'Blog post saved successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteBlogPostAction(id: string) {
    try {
        await deleteBlogPost(id);
        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        return { success: true, message: 'Blog post deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
