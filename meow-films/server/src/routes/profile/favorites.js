import express from "express";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../../controllers/profile/favorites.js";
import { auth } from "../../middlewares/auth/auth.js";

const router = express.Router();

router.post("/add-favorite", auth, addFavorite);
router.delete("/remove-favorite", auth, removeFavorite);
router.get("/get-favorites", auth, getFavorites);
export default router;
