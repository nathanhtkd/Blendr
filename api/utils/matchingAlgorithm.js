const calculateMatchScore = (currentUser, potentialMatch) => {
  let score = 0;
  
  // Dietary Balance Progress Score (40%)
  const combinedIngredients = [...currentUser.ingredientsList, ...potentialMatch.ingredientsList];
  const nutritionalBalance = calculateNutritionalBalance(combinedIngredients);
  const currentUserBalance = calculateUserDietaryProgress(currentUser, combinedIngredients);
  const matchUserBalance = calculateUserDietaryProgress(potentialMatch, combinedIngredients);
  
  // Higher score if both users benefit from combined ingredients
  score += ((currentUserBalance + matchUserBalance) / 2) * 40;

  // Ingredient Compatibility (30%)
  const currentIngredients = currentUser.ingredientsList.map(i => ({
    ...i,
    category: getNutritionalCategory(i)  // protein, carb, fat, vegetable
  }));
  const matchIngredients = potentialMatch.ingredientsList.map(i => ({
    ...i,
    category: getNutritionalCategory(i)
  }));
  
  // Calculate complementary ingredients score
  const complementaryScore = calculateComplementaryScore(currentIngredients, matchIngredients);
  score += complementaryScore * 30;

  // Cuisine preferences (20%)
  const commonCuisines = currentUser.preferences.cuisines.filter(c => 
    potentialMatch.preferences.cuisines.includes(c)
  );
  score += (commonCuisines.length / Math.max(
    currentUser.preferences.cuisines.length, 
    potentialMatch.preferences.cuisines.length
  )) * 20;

  // Proximity Score (10%)
  const distance = calculateDistance(
    currentUser.location.coordinates,
    potentialMatch.location.coordinates
  );
  const proximityScore = calculateProximityScore(distance);
  score += proximityScore * 10;

  return Math.round(score);
};

// Helper functions
const calculateNutritionalBalance = (ingredients) => {
  const categories = {
    protein: 0,
    carbs: 0,
    fats: 0,
    vegetables: 0
  };
  
  ingredients.forEach(item => {
    const category = getNutritionalCategory(item);
    categories[category]++;
  });
  
  // Ideal ratios: 30% protein, 40% carbs, 20% fats, 10% vegetables
  const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
  return {
    protein: categories.protein / total,
    carbs: categories.carbs / total,
    fats: categories.fats / total,
    vegetables: categories.vegetables / total
  };
};

const calculateUserDietaryProgress = (user, combinedIngredients) => {
  const currentBalance = calculateNutritionalBalance(user.ingredientsList);
  const newBalance = calculateNutritionalBalance(combinedIngredients);
  
  // Calculate how much closer to ideal ratios the new balance gets
  const idealRatios = { protein: 0.3, carbs: 0.4, fats: 0.2, vegetables: 0.1 };
  let improvementScore = 0;
  
  Object.keys(idealRatios).forEach(category => {
    const currentDiff = Math.abs(currentBalance[category] - idealRatios[category]);
    const newDiff = Math.abs(newBalance[category] - idealRatios[category]);
    improvementScore += currentDiff - newDiff;
  });
  
  return Math.max(0, improvementScore);
};

const calculateComplementaryScore = (currentIngredients, matchIngredients) => {
  const currentCategories = getCategoryDistribution(currentIngredients);
  const matchCategories = getCategoryDistribution(matchIngredients);
  
  // Higher score for complementary ingredients that achieve balance
  let complementaryScore = 0;
  Object.keys(currentCategories).forEach(category => {
    if (currentCategories[category] < 0.25 && matchCategories[category] > 0.25) {
      complementaryScore += 0.25;
    }
  });
  
  return complementaryScore;
};

const calculateDistance = (coords1, coords2) => {
  // Haversine formula for calculating distance between coordinates
  // ... implementation here
  return distance; // in kilometers
};

const calculateProximityScore = (distance) => {
  // Example scoring:
  // 0-5km: 1.0
  // 5-10km: 0.8
  // 10-20km: 0.6
  // 20-30km: 0.4
  // 30-50km: 0.2
  // >50km: 0.1
  if (distance <= 5) return 1;
  if (distance <= 10) return 0.8;
  if (distance <= 20) return 0.6;
  if (distance <= 30) return 0.4;
  if (distance <= 50) return 0.2;
  return 0.1;
};

export const sortUsersByMatchScore = (currentUser, users) => {
  return users
    .map(user => ({
      ...user.toObject(),
      matchScore: calculateMatchScore(currentUser, user)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
};
