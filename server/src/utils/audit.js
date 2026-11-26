import prisma from "../../prisma/client.js";

export const logAudit = async ({ userId, action, entity, entityId, before, after }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ? Number(userId) : null,
        action,
        entity,
        entityId: entityId ? Number(entityId) : null,
        before: before ?? undefined,
        after: after ?? undefined,
      },
    });
  } catch (err) {
    console.error("[AuditLog]", err.message);
  }
};
