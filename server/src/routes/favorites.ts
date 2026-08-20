import { Router } from "express";
import {
  addFavorite,
  removeFavorite,
  listFavorites,
  checkFavorite,
} from "../controllers/favoriteController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, listFavorites);
router.post("/", authenticate, addFavorite);
router.get("/check/:listingId", authenticate, checkFavorite);
router.delete("/:listingId", authenticate, removeFavorite);

export default router;
