import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { errorResponse, successResponse } from "../utils/helpers";

const VALID_CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "USED"];
const VALID_STATUSES = ["ACTIVE", "RESERVED", "SOLD", "REMOVED"];

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

export async function getListings(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status: { in: ["ACTIVE", "RESERVED", "SOLD"] } };

    if (req.query.universityId) {
      where.universityId = req.query.universityId as string;
    }
    if (req.query.campusId) {
      where.campusId = req.query.campusId as string;
    }
    if (req.query.categoryId) {
      where.categoryId = req.query.categoryId as string;
    }
    if (req.query.sellerId) {
      where.sellerId = req.query.sellerId as string;
    }
    if (req.query.status) {
      const requestedStatus = req.query.status as string;
      if (requestedStatus === "REMOVED") {
        where.status = { notIn: ["ACTIVE", "RESERVED", "SOLD"] };
      } else {
        where.status = requestedStatus;
      }
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: LISTING_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    successResponse(res, {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List listings error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function getListing(req: Request, res: Response): Promise<void> {
  try {
    const listingId = req.params.id as string;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: LISTING_SELECT,
    });

    if (!listing) {
      errorResponse(res, "Listing not found", 404);
      return;
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { viewCount: { increment: 1 } },
    });

    successResponse(res, { listing: { ...listing, viewCount: listing.viewCount + 1 } });
  } catch (error) {
    console.error("Get listing error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function createListing(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const { title, description, price, condition, categoryId, universityId, campusId, location, images } = req.body;

    if (!title || !description || price === undefined || !condition || !categoryId || !universityId || !campusId) {
      errorResponse(res, "Title, description, price, condition, category, university, and campus are required");
      return;
    }

    if (typeof price !== "number" || price < 0) {
      errorResponse(res, "Price must be a non-negative number");
      return;
    }

    if (!VALID_CONDITIONS.includes(condition)) {
      errorResponse(res, `Invalid condition. Must be one of: ${VALID_CONDITIONS.join(", ")}`);
      return;
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || !category.isActive) {
      errorResponse(res, "Invalid category");
      return;
    }

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university || !university.isActive) {
      errorResponse(res, "Invalid university");
      return;
    }

    const campus = await prisma.campus.findUnique({ where: { id: campusId } });
    if (!campus || !campus.isActive) {
      errorResponse(res, "Invalid campus");
      return;
    }

    if (campus.universityId !== universityId) {
      errorResponse(res, "Campus does not belong to the selected university");
      return;
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        condition,
        sellerId: req.user.id,
        universityId,
        campusId,
        categoryId,
        location: location || null,
        images: images && Array.isArray(images) && images.length > 0
          ? { create: images.map((img: { url: string; sortOrder?: number }, i: number) => ({ url: img.url, sortOrder: img.sortOrder ?? i })) }
          : undefined,
      },
      select: LISTING_SELECT,
    });

    successResponse(res, { listing }, 201);
  } catch (error) {
    console.error("Create listing error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function updateListing(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const listingId = req.params.id as string;

    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true },
    });

    if (!existing) {
      errorResponse(res, "Listing not found", 404);
      return;
    }

    if (existing.sellerId !== req.user.id && req.user.role !== "ADMIN") {
      errorResponse(res, "You can only edit your own listings", 403);
      return;
    }

    const { title, description, price, condition, categoryId, universityId, campusId, location, images } = req.body;

    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      errorResponse(res, "Price must be a non-negative number");
      return;
    }

    if (condition && !VALID_CONDITIONS.includes(condition)) {
      errorResponse(res, `Invalid condition. Must be one of: ${VALID_CONDITIONS.join(", ")}`);
      return;
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || !category.isActive) {
        errorResponse(res, "Invalid category");
        return;
      }
    }

    if (universityId) {
      const university = await prisma.university.findUnique({ where: { id: universityId } });
      if (!university || !university.isActive) {
        errorResponse(res, "Invalid university");
        return;
      }
    }

    if (campusId) {
      const campus = await prisma.campus.findUnique({ where: { id: campusId } });
      if (!campus || !campus.isActive) {
        errorResponse(res, "Invalid campus");
        return;
      }
      if (universityId && campus.universityId !== universityId) {
        errorResponse(res, "Campus does not belong to the selected university");
        return;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (condition !== undefined) updateData.condition = condition;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (universityId !== undefined) updateData.universityId = universityId;
    if (campusId !== undefined) updateData.campusId = campusId;
    if (location !== undefined) updateData.location = location || null;

    if (images !== undefined && Array.isArray(images)) {
      await prisma.listingImage.deleteMany({ where: { listingId } });
      if (images.length > 0) {
        await prisma.listingImage.createMany({
          data: images.map((img: { url: string; sortOrder?: number }, i: number) => ({
            listingId,
            url: img.url,
            sortOrder: img.sortOrder ?? i,
          })),
        });
      }
    }

    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
      select: LISTING_SELECT,
    });

    successResponse(res, { listing });
  } catch (error) {
    console.error("Update listing error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function deleteListing(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const listingId = req.params.id as string;

    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true },
    });

    if (!existing) {
      errorResponse(res, "Listing not found", 404);
      return;
    }

    if (existing.sellerId !== req.user.id && req.user.role !== "ADMIN") {
      errorResponse(res, "You can only delete your own listings", 403);
      return;
    }

    await prisma.listing.delete({ where: { id: listingId } });

    successResponse(res, { message: "Listing deleted" });
  } catch (error) {
    console.error("Delete listing error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function changeListingStatus(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const listingId = req.params.id as string;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      errorResponse(res, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
      return;
    }

    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true },
    });

    if (!existing) {
      errorResponse(res, "Listing not found", 404);
      return;
    }

    if (existing.sellerId !== req.user.id && req.user.role !== "ADMIN") {
      errorResponse(res, "You can only modify your own listings", 403);
      return;
    }

    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: { status },
      select: LISTING_SELECT,
    });

    successResponse(res, { listing });
  } catch (error) {
    console.error("Change listing status error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}
