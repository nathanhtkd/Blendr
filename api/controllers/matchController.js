import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";
import axios from "axios";

export const swipeRight = async (req, res) => {
	try {
		const { likedUserId } = req.params;
		const currentUser = await User.findById(req.user.id);
		const likedUser = await User.findById(likedUserId);

		if (!likedUser) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		if (!currentUser.likes.includes(likedUserId)) {
			currentUser.likes.push(likedUserId);
			await currentUser.save();

			// if the other user already liked us, it's a match, so let's update both users
			if (likedUser.likes.includes(currentUser.id)) {
				currentUser.matches.push(likedUserId);
				likedUser.matches.push(currentUser.id);

				await Promise.all([await currentUser.save(), await likedUser.save()]);

				// send notification in real-time with socket.io
				const connectedUsers = getConnectedUsers();
				const io = getIO();

				const likedUserSocketId = connectedUsers.get(likedUserId);

				if (likedUserSocketId) {
					io.to(likedUserSocketId).emit("newMatch", {
						_id: currentUser._id,
						name: currentUser.name,
						image: currentUser.image,
					});
				}

				const currentSocketId = connectedUsers.get(currentUser._id.toString());
				if (currentSocketId) {
					io.to(currentSocketId).emit("newMatch", {
						_id: likedUser._id,
						name: likedUser.name,
						image: likedUser.image,
					});
				}
			}
		}

		res.status(200).json({
			success: true,
			user: currentUser,
		});
	} catch (error) {
		console.log("Error in swipeRight: ", error);

		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const swipeLeft = async (req, res) => {
	try {
		const { dislikedUserId } = req.params;
		const currentUser = await User.findById(req.user.id);

		if (!currentUser.dislikes.includes(dislikedUserId)) {
			currentUser.dislikes.push(dislikedUserId);
			await currentUser.save();
		}

		res.status(200).json({
			success: true,
			user: currentUser,
		});
	} catch (error) {
		console.log("Error in swipeLeft: ", error);

		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const getMatches = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).populate("matches", "name image");

		res.status(200).json({
			success: true,
			matches: user.matches,
		});
	} catch (error) {
		console.log("Error in getMatches: ", error);

		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const getUserProfiles = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user.id);

		// Get all users in the same location, excluding current user, likes, dislikes, and matches
		const users = await User.find({
			$and: [
				{ _id: { $ne: currentUser.id } },
				{ _id: { $nin: currentUser.likes } },
				{ _id: { $nin: currentUser.dislikes } },
				{ _id: { $nin: currentUser.matches } },
				{ location: currentUser.location } // Add location filter
			],
		});

		if (!users.length) {
			return res.status(200).json({
				success: true,
				users: [], // Return empty array if no users found
			});
		}

		// Calculate compatibility scores for all users
		const usersWithScores = await Promise.all(
			users.map(async (user) => {
				const compatibility = await calculateCompatibilityScore(currentUser, user);
				return {
					...user.toObject(),
					compatibilityScore: compatibility.score,
					goalCompletion: compatibility.goalCompletion
				};
			})
		);
		usersWithScores.sort((a, b) => a.compatibilityScore - b.compatibilityScore);
		res.status(200).json({
			success: true,
			users: usersWithScores,
		});
	} catch (error) {
		console.log("Error in getUserProfiles: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Helper function to calculate compatibility score
async function calculateCompatibilityScore(currentUser, otherUser) {
	console.log('\n========== CALCULATING COMPATIBILITY SCORE ==========');
	console.log(`Comparing ${currentUser.name} with ${otherUser.name}\n`);
	
	let totalScore = 0;
	
	// 1. Ingredients Compatibility (40 points max)
	console.log('--- Starting Ingredients Compatibility Check ---');
	const ingredientsResult = await calculateIngredientsCompatibility(currentUser, otherUser);
	console.log(`Ingredients Score: ${ingredientsResult.score.toFixed(2)} * 40 = ${(ingredientsResult.score * 40).toFixed(2)} points\n`);
	totalScore += ingredientsResult.score * 40;

	// 2. Dietary Restrictions Compatibility (30 points max)
	console.log('--- Starting Dietary Restrictions Compatibility Check ---');
	const dietaryRestrictionsScore = calculateDietaryRestrictionsCompatibility(currentUser, otherUser);
	console.log(`Dietary Restrictions Score: ${dietaryRestrictionsScore.toFixed(2)} * 30 = ${(dietaryRestrictionsScore * 30).toFixed(2)} points\n`);
	totalScore += dietaryRestrictionsScore * 30;

	// 3. Cuisines Compatibility (30 points max)
	console.log('--- Starting Cuisines Compatibility Check ---');
	const cuisinesScore = calculateCuisinesCompatibility(currentUser, otherUser);
	console.log(`Cuisines Score: ${cuisinesScore.toFixed(2)} * 30 = ${(cuisinesScore * 30).toFixed(2)} points\n`);
	totalScore += cuisinesScore * 30;

	console.log(`FINAL TOTAL SCORE: ${Math.round(totalScore)}/100`);
	console.log('================================================\n');

	return {
		score: Math.round(totalScore),
		goalCompletion: ingredientsResult.goalCompletion
	};
}

async function calculateIngredientsCompatibility(currentUser, otherUser) {
	try {
		const combinedIngredients = [
			...currentUser.ingredientsList.map(i => `${i.quantity} ${i.ingredient}`),
			...otherUser.ingredientsList.map(i => `${i.quantity} ${i.ingredient}`)
		].join(', ');

		const response = await axios.get('https://api.calorieninjas.com/v1/nutrition', {
			params: { query: combinedIngredients },
			headers: {
				'X-Api-Key': process.env.CALORIE_NINJA_API_KEY
			}
		});

		if (!response.data.items?.length) return { score: 0, goalCompletion: { protein: 0, carbs: 0, fats: 0 } };

		// Calculate total macronutrients
		const totalNutrients = response.data.items.reduce((acc, item) => ({
			protein: acc.protein + (item.protein_g || 0),
			carbs: acc.carbs + (item.carbohydrates_total_g || 0),
			fats: acc.fats + (item.fat_total_g || 0)
		}), { protein: 0, carbs: 0, fats: 0 });

		// Compare with dietary goals
		const dietaryGoals = currentUser.dietaryGoals;
	
		// Calculate how close we are to meeting each goal (as percentages)
		const goalCompletion = {
			protein: dietaryGoals.protein === 0 ? 100 : Math.min((totalNutrients.protein / dietaryGoals.protein) * 100, 100),
			carbs: dietaryGoals.carbs === 0 ? 100 : Math.min((totalNutrients.carbs / dietaryGoals.carbs) * 100, 100),
			fats: dietaryGoals.fats === 0 ? 100 : Math.min((totalNutrients.fats / dietaryGoals.fats) * 100, 100)
		};

		// Calculate average completion ratio (as decimal for the score)
		const avgCompletion = (goalCompletion.protein + goalCompletion.carbs + goalCompletion.fats) / 300;

		console.log({
			totalNutrients,
			dietaryGoals,
			goalCompletion,
			score: avgCompletion
		});

		return {
			score: avgCompletion,
			goalCompletion: {
				protein: Math.round(goalCompletion.protein),
				carbs: Math.round(goalCompletion.carbs),
				fats: Math.round(goalCompletion.fats)
			}
		};
		
	} catch (error) {
		console.error('Error calculating ingredients compatibility:', error);
		return { score: 0, goalCompletion: { protein: 0, carbs: 0, fats: 0 } };
	}
}

// Function to calculate dietary restrictions compatibility
function calculateDietaryRestrictionsCompatibility(currentUser, otherUser) {
	try {
		console.log('\nChecking dietary restrictions compatibility...');
		let score = 1.0;
		
		console.log(`\n${currentUser.name}'s restrictions:`, currentUser.dietaryRestrictions);
		console.log(`${otherUser.name}'s restrictions:`, otherUser.dietaryRestrictions);

		const restrictions = ['vegetarian', 'vegan', 'kosher', 'glutenFree', 'dairyFree'];
		
		for (const restriction of restrictions) {
			if (currentUser.dietaryRestrictions[restriction] && !otherUser.dietaryRestrictions[restriction]) {
				console.log(`\nMismatch found for ${restriction} (-0.3)`);
				score -= 0.3;
			}
		}

		const currentUserAllergies = new Set(currentUser.dietaryRestrictions.allergies || []);
		const otherUserAllergies = new Set(otherUser.dietaryRestrictions.allergies || []);
		
		console.log('\nChecking allergies compatibility...');
		console.log(`${currentUser.name}'s allergies:`, [...currentUserAllergies]);
		console.log(`${otherUser.name}'s allergies:`, [...otherUserAllergies]);

		const conflictingAllergies = [...currentUserAllergies].filter(allergy =>
			otherUser.ingredientsList.some(item => item.ingredient === allergy)
		);

		if (conflictingAllergies.length > 0) {
			console.log(`Found ${conflictingAllergies.length} conflicting allergies (-0.5)`);
			score -= 0.5;
		}

		console.log(`Final dietary compatibility score: ${Math.max(0, score).toFixed(2)}`);
		return Math.max(0, score);
	} catch (error) {
		console.error('Error calculating dietary restrictions compatibility:', error);
		return 0;
	}
}

// Function to calculate cuisine compatibility
function calculateCuisinesCompatibility(currentUser, otherUser) {
	try {
		console.log('\nCalculating cuisines compatibility...');
		const currentUserCuisines = new Set(currentUser.preferences.cuisines || []);
		const otherUserCuisines = new Set(otherUser.preferences.cuisines || []);

		console.log(`${currentUser.name}'s cuisines:`, [...currentUserCuisines]);
		console.log(`${otherUser.name}'s cuisines:`, [...otherUserCuisines]);

		if (currentUserCuisines.size === 0 || otherUserCuisines.size === 0) {
			console.log('One or both users have no cuisine preferences');
			return 0;
		}

		const sharedCuisines = [...currentUserCuisines].filter(cuisine =>
			otherUserCuisines.has(cuisine)
		);

		console.log('Shared cuisines:', sharedCuisines);

		const score = sharedCuisines.length / 
			Math.min(currentUserCuisines.size, otherUserCuisines.size);

		console.log(`Final cuisine compatibility score: ${Math.min(1, score).toFixed(2)}`);
		return Math.min(1, score);
	} catch (error) {
		console.error('Error calculating cuisines compatibility:', error);
		return 0;
	}
}
