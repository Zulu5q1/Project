import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/helpers";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

export async function uploadImage(req: Request, res: Response): Promise<void> {
  try {
    if (!isCloudinaryConfigured()) {
      errorResponse(
        res,
        "Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
        501
      );
      return;
    }

    const { imageUrl } = req.body;

    if (!imageUrl || typeof imageUrl !== "string") {
      errorResponse(res, "imageUrl is required");
      return;
    }

    successResponse(res, {
      url: imageUrl,
      message: "In development mode, pass image URLs directly. Configure Cloudinary for production uploads.",
    });
  } catch (error) {
    console.error("Upload image error:", error);
    errorResponse(res, "Image upload failed", 500);
  }
}
