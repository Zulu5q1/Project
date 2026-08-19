import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:userId", getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
