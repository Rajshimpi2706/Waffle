'use client';

import { createClient } from '@/lib/supabase/client';

type OrderStatusCallback = (status: string) => void;

/**
 * Subscribe to real-time order status updates via Supabase Realtime.
 * Falls back to polling every 15 seconds if WebSocket is unavailable.
 * Returns a cleanup function.
 */
export function subscribeToOrderUpdates(
  orderId: string,
  callback: (order: any) => void
): () => void {
  const supabase = createClient();
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let wsConnected = false;

  // Supabase Realtime channel
  const channel = supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        wsConnected = true;
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        callback(payload.new);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        wsConnected = true;
      }

      // Fallback to polling if WebSocket fails to connect
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        if (!pollInterval) {
          pollInterval = setInterval(async () => {
            const { data } = await supabase
              .from('orders')
              .select('*')
              .eq('id', orderId)
              .single();
            if (data) callback(data);
          }, 15_000);
        }
      }
    });

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
    if (pollInterval) clearInterval(pollInterval);
  };
}
