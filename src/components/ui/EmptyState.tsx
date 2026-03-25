import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-[#E5D5C0] min-h-[300px]">
      {Icon && (
        <div className="w-16 h-16 mb-4 rounded-full bg-[#F5E6CC] flex items-center justify-center text-[#C17839]">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-xl font-serif font-semibold text-[#3B1F0A] mb-2">{title}</h3>
      {description && <p className="text-[#8B5E3C] max-w-sm mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
