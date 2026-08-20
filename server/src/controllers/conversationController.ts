import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { errorResponse, successResponse } from "../utils/helpers";

export async function createConversation(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const { listingId } = req.body;

    if (!listingId) {
      errorResponse(res, "listingId is required");
      return;
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true, status: true },
    });

    if (!listing) {
      errorResponse(res, "Listing not found", 404);
      return;
    }

    if (listing.status === "SOLD" || listing.status === "REMOVED") {
      errorResponse(res, "Cannot message about a sold or removed listing", 400);
      return;
    }

    if (listing.sellerId === req.user.id) {
      errorResponse(res, "You cannot message yourself", 400);
      return;
    }

    const existing = await prisma.conversation.findUnique({
      where: { listingId_buyerId: { listingId, buyerId: req.user.id } },
    });

    if (existing) {
      successResponse(res, { conversation: existing });
      return;
    }

    const conversation = await prisma.conversation.create({
      data: {
        listingId,
        buyerId: req.user.id,
        sellerId: listing.sellerId,
      },
    });

    successResponse(res, { conversation }, 201);
  } catch (error) {
    console.error("Create conversation error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function listConversations(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: req.user.id },
          { sellerId: req.user.id },
        ],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: {
              select: { id: true, url: true, sortOrder: true },
              take: 1,
              orderBy: { sortOrder: "asc" as const },
            },
          },
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, username: true, profileImage: true },
        },
        seller: {
          select: { id: true, firstName: true, lastName: true, username: true, profileImage: true },
        },
        messages: {
          orderBy: { createdAt: "desc" as const },
          take: 1,
          select: { id: true, content: true, senderId: true, createdAt: true, isRead: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: req.user!.id },
            isRead: false,
          },
        });

        return {
          id: conv.id,
          listingId: conv.listingId,
          buyerId: conv.buyerId,
          sellerId: conv.sellerId,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          listing: conv.listing,
          buyer: conv.buyer,
          seller: conv.seller,
          lastMessage: conv.messages[0] || null,
          unreadCount,
        };
      })
    );

    successResponse(res, { conversations: result });
  } catch (error) {
    console.error("List conversations error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const conversationId = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        listing: {
          include: {
            images: { orderBy: { sortOrder: "asc" as const } },
          },
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, username: true, profileImage: true },
        },
        seller: {
          select: { id: true, firstName: true, lastName: true, username: true, profileImage: true },
        },
      },
    });

    if (!conversation) {
      errorResponse(res, "Conversation not found", 404);
      return;
    }

    if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    successResponse(res, { conversation });
  } catch (error) {
    console.error("Get conversation error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const conversationId = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, buyerId: true, sellerId: true },
    });

    if (!conversation) {
      errorResponse(res, "Conversation not found", 404);
      return;
    }

    if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, username: true, profileImage: true },
          },
        },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    successResponse(res, {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const conversationId = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, buyerId: true, sellerId: true },
    });

    if (!conversation) {
      errorResponse(res, "Conversation not found", 404);
      return;
    }

    if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      errorResponse(res, "Message content is required");
      return;
    }

    if (content.trim().length > 2000) {
      errorResponse(res, "Message must be 2000 characters or less", 400);
      return;
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: req.user.id,
          content: content.trim(),
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, username: true, profileImage: true },
          },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    successResponse(res, { message }, 201);
  } catch (error) {
    console.error("Send message error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const conversationId = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, buyerId: true, sellerId: true },
    });

    if (!conversation) {
      errorResponse(res, "Conversation not found", 404);
      return;
    }

    if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: req.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    successResponse(res, { message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { buyerId: req.user.id },
            { sellerId: req.user.id },
          ],
        },
        senderId: { not: req.user.id },
        isRead: false,
      },
    });

    successResponse(res, { unreadCount });
  } catch (error) {
    console.error("Get unread count error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}
