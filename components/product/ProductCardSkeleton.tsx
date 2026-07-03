import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={cn('block', className)}>
      <div className="aspect-[3/4] animate-pulse bg-muted" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-1/4 animate-pulse bg-muted" />
        <div className="h-4 w-3/4 animate-pulse bg-muted" />
        <div className="h-4 w-1/3 animate-pulse bg-muted" />
      </div>
    </div>
  );
}
