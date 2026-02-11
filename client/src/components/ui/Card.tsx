import { ReactNode, MouseEventHandler } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export default function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e as any); } : undefined}
      className={clsx(
        'bg-slate-900 rounded-xl shadow-sm border border-slate-800',
        paddingStyles[padding],
        {
          'hover:shadow-md hover:border-slate-700 transition-all duration-200': hover,
          'cursor-pointer': !!onClick,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
