import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { errorResponse, successResponse } from "../utils/helpers";

export async function listUniversities(_req: Request, res: Response): Promise<void> {
  try {
    const universities = await prisma.university.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        shortName: true,
        logo: true,
        description: true,
        location: true,
        website: true,
        _count: { select: { campuses: true } },
      },
      orderBy: { name: "asc" },
    });

    successResponse(res, { universities });
  } catch (error) {
    console.error("List universities error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function listCampusesByUniversity(req: Request, res: Response): Promise<void> {
  try {
    const universityId = req.params.universityId as string;

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university || !university.isActive) {
      errorResponse(res, "University not found", 404);
      return;
    }

    const campuses = await prisma.campus.findMany({
      where: { universityId, isActive: true },
      select: {
        id: true,
        name: true,
        location: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });

    successResponse(res, { campuses });
  } catch (error) {
    console.error("List campuses error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}
