import { createClient } from '@/lib/supabase/server';
import type { AuditLog } from '@/types';

type AuditPayload = Omit<AuditLog, 'id' | 'created_at'>;

/**
 * Write a structured audit log record.
 * Uses service role via server client — RLS permits inserts via service role only.
 * Does NOT throw; logs errors silently to avoid breaking primary flows.
 */
export async function writeAuditLog(payload: AuditPayload): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('audit_logs').insert(payload);
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err);
  }
}

export const logAudit = writeAuditLog;

// Convenience factory helpers
export function productAudit(
  action: 'created' | 'updated' | 'deleted' | 'price_changed' | 'inventory_changed',
  productId: string,
  actorId: string,
  actorRole: string,
  previous?: Record<string, unknown>,
  next?: Record<string, unknown>,
  ip?: string
): AuditPayload {
  return {
    actor_user_id: actorId,
    actor_role: actorRole,
    action_type: `product_${action}`,
    entity_type: 'product',
    entity_id: productId,
    previous_value: previous,
    new_value: next,
    ip_address: ip,
  };
}

export function orderStatusAudit(
  orderId: string,
  previousStatus: string,
  newStatus: string,
  actorId: string,
  actorRole: string,
  ip?: string
): AuditPayload {
  return {
    actor_user_id: actorId,
    actor_role: actorRole,
    action_type: 'order_status_changed',
    entity_type: 'order',
    entity_id: orderId,
    previous_value: { status: previousStatus },
    new_value: { status: newStatus },
    ip_address: ip,
  };
}

export function couponAudit(
  action: 'created' | 'updated' | 'deactivated',
  couponId: string,
  actorId: string,
  actorRole: string,
  previous?: Record<string, unknown>,
  next?: Record<string, unknown>
): AuditPayload {
  return {
    actor_user_id: actorId,
    actor_role: actorRole,
    action_type: `coupon_${action}`,
    entity_type: 'coupon',
    entity_id: couponId,
    previous_value: previous,
    new_value: next,
  };
}

export function adminLoginAudit(
  actorId: string,
  success: boolean,
  ip?: string
): AuditPayload {
  return {
    actor_user_id: actorId,
    actor_role: 'unknown',
    action_type: success ? 'admin_login_success' : 'admin_login_failed',
    entity_type: 'admin_user',
    entity_id: actorId,
    ip_address: ip,
  };
}
