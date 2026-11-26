import express from "express";
import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/messages/inbox — messages received by the logged-in user
// ADMIN sees ALL messages in the system
router.get("/inbox", protect, async (req, res) => {
  try {
    const where = req.user.role === "ADMIN"
      ? {}  // admin sees everything
      : { recipientId: Number(req.user.id) };

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender:    { select: { id: true, fullName: true, email: true, role: true } },
        recipient: { select: { id: true, fullName: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return success(res, messages, "Inbox fetched");
  } catch (err) {
    return error(res, err.message);
  }
});

// PUT /api/messages/:id/read — mark a message as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const msg = await prisma.message.update({
      where: { id: Number(req.params.id) },
      data: { isRead: true, readAt: new Date() },
    });
    return success(res, msg, "Message marked as read");
  } catch (err) {
    return error(res, err.message);
  }
});

// POST /api/messages/reply — teacher replies to a parent
router.post("/reply", protect, async (req, res) => {
  try {
    const { recipientId, subject, content } = req.body;
    if (!recipientId || !subject || !content) {
      return error(res, "recipientId, subject, and content are required", 400);
    }
    const msg = await prisma.message.create({
      data: {
        senderId: Number(req.user.id),
        recipientId: Number(recipientId),
        subject,
        content,
        messageType: "GENERAL",
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        recipient: { select: { id: true, fullName: true, role: true } },
      },
    });
    return success(res, msg, "Reply sent");
  } catch (err) {
    return error(res, err.message);
  }
});

export default router;
