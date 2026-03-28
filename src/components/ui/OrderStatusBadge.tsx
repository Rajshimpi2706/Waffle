import React from 'react';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Waiting for confirmation', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed: { label: 'Order confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  preparing: { label: 'Preparing your order', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  ready: { label: 'Ready for pickup / dispatch', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  out_for_delivery: { label: 'On the way', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  delivered: { label: 'Delivered successfully', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Order cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_MAP[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-colors",
      config.color,
      className
    )}>
      {config.label}
    </span>
  );
}
