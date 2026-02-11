import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export default function Alert({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const typeStyles = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-400',
      icon: Info,
    },
    success: {
      bg: 'bg-green-500/10 border-green-500/30',
      text: 'text-green-400',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      text: 'text-yellow-400',
      icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-400',
      icon: XCircle,
    },
  };

  const { bg, text, icon: Icon } = typeStyles[type];

  return (
    <div className={clsx('rounded-lg border p-4', bg)}>
      <div className="flex">
        <Icon className={clsx('h-5 w-5 flex-shrink-0', text)} />
        <div className="ml-3 flex-1">
          {title && <h3 className={clsx('text-sm font-medium', text)}>{title}</h3>}
          <p className={clsx('text-sm', text, { 'mt-1': title })}>{message}</p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={clsx('flex-shrink-0 ml-3 p-1 rounded hover:bg-black/5', text)}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
