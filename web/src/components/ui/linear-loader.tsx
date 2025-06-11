// components/GlobalLoader.tsx
import { useLoading } from '@/context/LoadingContext';

export const LinearLoader = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 overflow-hidden">
      <div className="absolute top-0 left-0 h-full w-full bg-black/20">
        <div className="h-full bg-buttonBlue animate-loading-line" />
      </div>
    </div>
  );
};