import Recipe from '../models/Recipe.js';

const recipeController = {
  // Store a newly generated recipe
  storeGeneratedRecipe: async (req, res) => {
    try {
      const { matchedUsers, ...recipeData } = req.body;
      const recipe = new Recipe({
        ...recipeData,
        matchedUsers: matchedUsers || [], // Ensure matchedUsers is handled
        generatedAt: new Date()
      });
      const newRecipe = await recipe.save();
      res.status(201).json(newRecipe);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get recipe for matched users
  getMatchedRecipe: async (req, res) => {
    try {
      const { userId, matchedUserId } = req.params;
      
      // Find recipes where both users are in matchedUsers array
      const recipe = await Recipe.findOne({
        matchedUsers: { 
          $all: [userId, matchedUserId] 
        }
      });

      if (!recipe) {
        return res.status(404).json({ message: 'No shared recipe found' });
      }

      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export default recipeController;
