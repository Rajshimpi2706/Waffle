import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try Again' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-2xl border border-red-100 min-h-[250px]">
      <div className="w-14 h-14 mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-red-700 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
