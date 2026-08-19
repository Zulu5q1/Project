import { Router } from "express";
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  changeListingStatus,
} from "../controllers/listingController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", getListings);
router.get("/:id", getListing);
router.post("/", authenticate, createListing);
router.patch("/:id", authenticate, updateListing);
router.delete("/:id", authenticate, deleteListing);
router.patch("/:id/status", authenticate, changeListingStatus);

export default router;
