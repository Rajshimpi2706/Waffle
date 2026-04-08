import { createServiceClient } from '@/lib/supabase/server';
import { getAdminRole } from '@/lib/adminAuth';

export interface AuditLogOptions {
  action_type: string;
  entity_type: string;
  entity_id?: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  actor_user_id?: string;
  actor_role?: string;
  ip_address?: string;
}

/**
 * Securly logs an administrative action to the audit_logs table.
 * Resolves the actor dynamically if not natively provided.
 */
export const logAudit = logAdminAction;

export async function logAdminAction(options: AuditLogOptions) {
  try {
    const supabase = await createServiceClient(); // use service client since audit logging usually bypasses RLS
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('[Audit Logger] Attempted to log action without authenticated user');
      return;
    }

    const role = await getAdminRole();

    await supabase.from('audit_logs').insert({
      actor_user_id: options.actor_user_id ?? user.id,
      actor_role: options.actor_role ?? role ?? 'unknown',
      action_type: options.action_type,
      entity_type: options.entity_type,
      entity_id: options.entity_id,
      previous_value: options.previous_value,
      new_value: options.new_value,
      ip_address: options.ip_address,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    // We don't throw to avoid breaking the main operation if audit logging fails
    console.error('[Audit Logger] Failed to log action:', error);
  }
}
