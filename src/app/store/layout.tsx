
import React from 'react';
import { StoreHeader } from '@/components/store-header';
import { StoreFooter } from '@/components/store-footer';
import { getStoreCategories } from '@/lib/firebase/firestore';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getStoreCategories();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
        <StoreHeader categories={categories} />
        <main className="flex-grow">
            {children}
        </main>
        <StoreFooter categories={categories} />
    </div>
  );
}
