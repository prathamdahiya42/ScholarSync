import { prisma } from './db';

export async function logAudit(params: {
  actorType: 'student' | 'reviewer' | 'admin' | 'system';
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  meta?: Record<string, any>;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorType: params.actorType,
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metaJson: params.meta ? JSON.stringify(params.meta) : null,
        ip: params.ip || null
      }
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}
