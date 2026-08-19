import { Router } from "express";
import { uploadImage } from "../controllers/imageController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, uploadImage);

export default router;
