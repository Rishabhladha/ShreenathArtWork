import prisma from '@/lib/prisma';

export async function logAuditAction(params: {
  adminUserId?: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId: params.adminUserId,
        adminEmail: params.adminEmail,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details ? JSON.stringify(params.details) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

