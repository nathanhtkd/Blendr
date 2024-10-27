import express from 'express';
import recipeController from '../controllers/recipeController.js';

const router = express.Router();

// Store AI generated recipe
router.post('/generated', recipeController.storeGeneratedRecipe);

// Get recipe for matched users
router.get('/matched/:userId/:matchedUserId', recipeController.getMatchedRecipe);

export default router;
