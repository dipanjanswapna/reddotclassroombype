import { LoadingSpinner } from '@/components/loading-spinner';

export default function Loading() {
  return (
    <div className="flex flex-grow items-center justify-center h-full w-full p-8">
      <LoadingSpinner className="w-12 h-12" />
    </div>
  );
}
