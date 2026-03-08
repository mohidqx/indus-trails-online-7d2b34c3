import { activityLogsApi } from '@/lib/api';

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    await activityLogsApi.log({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  } catch {
    // Silently fail - don't block UI for logging
  }
}
