import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({
  children,
  className,
  padding = 'md',
  hover = false,
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'bg-slate-900 rounded-xl shadow-sm border border-slate-800',
        paddingStyles[padding],
        {
          'hover:shadow-md hover:border-slate-700 transition-all duration-200': hover,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
