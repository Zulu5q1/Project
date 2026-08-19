import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { generateToken } from "../middleware/auth";
import {
  errorResponse,
  successResponse,
  validateEmail,
  validatePassword,
  validateUsername,
  validateRequired,
} from "../utils/helpers";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, username, universityId, campusId } = req.body;

    const missingFieldError = validateRequired({ email, password, firstName, lastName, username });
    if (missingFieldError) {
      errorResponse(res, missingFieldError);
      return;
    }

    if (!validateEmail(email)) {
      errorResponse(res, "Invalid email format");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      errorResponse(res, passwordError);
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      errorResponse(res, usernameError);
      return;
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
      if (universityId && campus.universityId !== universityId) {
        errorResponse(res, "Campus does not belong to the selected university");
        return;
      }
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      errorResponse(res, "An account with this email already exists", 409);
      return;
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      errorResponse(res, "This username is already taken", 409);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        username,
        universityId: universityId || null,
        campusId: campusId || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        universityId: true,
        campusId: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    successResponse(res, { user, token }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      errorResponse(res, "Email and password are required");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        university: { select: { id: true, name: true, shortName: true } },
        campus: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      errorResponse(res, "Invalid email or password", 401);
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      errorResponse(res, "Invalid email or password", 401);
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    successResponse(res, { user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, "Authentication required", 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    if (!user) {
      errorResponse(res, "User not found", 404);
      return;
    }

    successResponse(res, { user });
  } catch (error) {
    console.error("Get me error:", error);
    errorResponse(res, "Internal server error", 500);
  }
}
