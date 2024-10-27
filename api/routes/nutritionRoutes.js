import express from "express";
import { getNutritionInfo } from "../controllers/nutritionController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.get("/analyze", protectRoute, getNutritionInfo);

export default router;
