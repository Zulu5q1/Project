import { Router } from "express";
import { listUniversities, listCampusesByUniversity } from "../controllers/universityController";

const router = Router();

router.get("/", listUniversities);
router.get("/:universityId/campuses", listCampusesByUniversity);

export default router;
