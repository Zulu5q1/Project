import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { errorResponse, successResponse } from "../utils/helpers";

export async function listCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: { select: { listings: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { name: "asc" },
    });

    successResponse(res, { categories });
  } catch (error) {
    console.error("List categories error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}
