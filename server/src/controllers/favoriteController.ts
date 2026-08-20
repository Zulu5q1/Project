import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { errorResponse, successResponse } from "../utils/helpers";

const LISTING_SELECT = {
  id: true,
  title: true,
  description: true,
  price: true,
  condition: true,
  status: true,
  location: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: { id: true, firstName: true, lastName: true, username: true, profileImage: true },
  },
  university: {
    select: { id: true, name: true, shortName: true },
  },
  campus: {
    select: { id: true, name: true },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
  images: {
    select: { id: true, url: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
};

export async function addFavorite(req: Request, res: Response): Promise<void> {
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
      select: { id: true },
    });

    if (!listing) {
      errorResponse(res, "Listing not found", 404);
      return;
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: req.user.id, listingId } },
    });

    if (existing) {
      successResponse(res, { isFavorited: true, favoriteId: existing.id });
      return;
    }

    const favorite = await prisma.favorite.create({
      data: { userId: req.user.id, listingId },
      select: { id: true, createdAt: true },
    });

    successResponse(res, { isFavorited: true, favoriteId: favorite.id }, 201);
  } catch (error) {
    console.error("Add favorite error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function removeFavorite(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const listingId = req.params.listingId as string;

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: req.user.id, listingId } },
    });

    if (!existing) {
      errorResponse(res, "Favorite not found", 404);
      return;
    }

    await prisma.favorite.delete({
      where: { userId_listingId: { userId: req.user.id, listingId } },
    });

    successResponse(res, { isFavorited: false });
  } catch (error) {
    console.error("Remove favorite error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function listFavorites(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: req.user.id },
        select: {
          id: true,
          createdAt: true,
          listing: { select: LISTING_SELECT },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.favorite.count({ where: { userId: req.user.id } }),
    ]);

    successResponse(res, {
      favorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List favorites error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function checkFavorite(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const listingId = req.params.listingId as string;

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: req.user.id, listingId } },
      select: { id: true },
    });

    successResponse(res, { isFavorited: !!existing });
  } catch (error) {
    console.error("Check favorite error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}
