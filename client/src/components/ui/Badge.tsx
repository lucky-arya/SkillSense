import clsx from 'clsx';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-500/20 text-gray-300',
    primary: 'bg-primary-500/20 text-primary-300',
    secondary: 'bg-secondary-500/20 text-secondary-300',
    success: 'bg-green-500/20 text-green-300',
    warning: 'bg-yellow-500/20 text-yellow-300',
    danger: 'bg-red-500/20 text-red-300',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
