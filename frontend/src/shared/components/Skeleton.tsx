import type { FC } from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);
