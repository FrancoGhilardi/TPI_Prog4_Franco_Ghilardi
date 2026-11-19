import type { FC, HTMLAttributes } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card: FC<CardProps> = ({ className = '', children, ...rest }) => (
  <div {...rest} className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
    {children}
  </div>
);
