import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { errorResponse, successResponse, validateEmail } from "../utils/helpers";

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        profileImage: true,
        bio: true,
        department: true,
        role: true,
        createdAt: true,
        university: { select: { id: true, name: true, shortName: true } },
        campus: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      errorResponse(res, "User not found", 404);
      return;
    }

    successResponse(res, { user });
  } catch (error) {
    console.error("Get profile error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const { firstName, lastName, bio, department, universityId, campusId, profileImage, email } = req.body;

    if (email && email !== req.user.email) {
      if (!validateEmail(email)) {
        errorResponse(res, "Invalid email format");
        return;
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        errorResponse(res, "This email is already in use", 409);
        return;
      }
    }

    if (universityId) {
      const university = await prisma.university.findUnique({ where: { id: universityId } });
      if (!university || !university.isActive) {
        errorResponse(res, "Invalid university selected");
        return;
      }
    }

    if (campusId) {
      const campus = await prisma.campus.findUnique({ where: { id: campusId } });
      if (!campus || !campus.isActive) {
        errorResponse(res, "Invalid campus selected");
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(department !== undefined && { department }),
        ...(email !== undefined && { email }),
        ...(profileImage !== undefined && { profileImage }),
        ...(universityId !== undefined && { universityId: universityId || null }),
        ...(campusId !== undefined && { campusId: campusId || null }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        profileImage: true,
        bio: true,
        department: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        university: { select: { id: true, name: true, shortName: true } },
        campus: { select: { id: true, name: true } },
      },
    });

    successResponse(res, { user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}
