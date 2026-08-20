import { Router } from "express";
import {
  createConversation,
  listConversations,
  getConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} from "../controllers/conversationController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/unread-count", authenticate, getUnreadCount);
router.get("/", authenticate, listConversations);
router.post("/", authenticate, createConversation);
router.get("/:id", authenticate, getConversation);
router.get("/:id/messages", authenticate, getMessages);
router.post("/:id/messages", authenticate, sendMessage);
router.patch("/:id/read", authenticate, markAsRead);

export default router;
