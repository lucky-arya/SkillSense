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
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: Info,
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
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
