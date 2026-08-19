import { Router, Request, Response } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { successResponse } from "../utils/helpers";

const router = Router();

router.get("/stats", authenticate, requireRole("ADMIN"), (req: Request, res: Response) => {
  successResponse(res, {
    message: "Admin access granted",
    user: { id: req.user!.id, email: req.user!.email, role: req.user!.role },
  });
});

export default router;
