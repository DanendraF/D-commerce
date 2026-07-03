import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({ price, compareAtPrice, size = 'md', className }: PriceDisplayProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const hasDiscount = compareAtPrice && compareAtPrice > price;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-semibold', sizeClasses[size])}>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className={cn('text-muted-foreground line-through', sizeClasses[size])}>
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
