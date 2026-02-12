import { cn } from '@/lib/utils';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { PageProgressLoader } from '@/components/page-progress-loader';
import { Suspense } from 'react';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
        <Suspense fallback={null}>
          <PageProgressLoader />
        </Suspense>
        <LayoutWrapper>
            {children}
        </LayoutWrapper>
    </>
  );
}
