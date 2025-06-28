import { LoadingSpinner } from '@/components/loading-spinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
      <LoadingSpinner className="w-12 h-12" />
    </div>
  );
}
