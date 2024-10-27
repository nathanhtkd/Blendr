import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import Groq from 'groq-sdk';
import Recipe from "./models/Recipe.js";
import mongoose from "mongoose";
import User from "./models/User.js";
import { protectRoute } from "./middleware/protectRoute.js";
import { Toolhouse } from '@toolhouseai/sdk';

// routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import { connectDB } from "./config/db.js";
import { initializeSocket } from "./socket/socket.server.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4999;

const __dirname = path.resolve();

initializeSocket(httpServer);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

// Add favorites endpoints
app.post('/api/users/favorites', protectRoute, async (req, res) => {
	try {
		const { id, title, cuisine, description } = req.body;
		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Check if recipe already exists in favorites
		const existingFavorite = user.favorites.find(fav => fav.id === id);
		if (existingFavorite) {
			return res.status(400).json({ error: "Recipe already in favorites" });
		}

		user.favorites.push({
			id,
			title,
			cuisine,
			description,
		});

		await user.save();
		res.status(200).json(user.favorites);
	} catch (error) {
		console.error("Error adding favorite:", error);
		res.status(500).json({ error: "Error adding favorite" });
	}
});

app.delete('/api/users/favorites/:id', protectRoute, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		user.favorites = user.favorites.filter(fav => fav.id !== id);
		await user.save();

		res.status(200).json(user.favorites);
	} catch (error) {
		console.error("Error removing favorite:", error);
		res.status(500).json({ error: "Error removing favorite" });
	}
});

app.get('/api/users/favorites', protectRoute, async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json(user.favorites);
	} catch (error) {
		console.error("Error fetching favorites:", error);
		res.status(500).json({ error: "Error fetching favorites" });
	}
});

app.post('/api/groq/recipes', async (req, res) => {
	try {
		const { currentUser, selectedUser } = req.body;
		
		const currentUserId = currentUser._id;
		const selectedUserId = selectedUser._id;

		console.log('currentUser ID', currentUserId);
		console.log('selectedUser ID', selectedUserId);

		// Check for existing recipes first
		const existingRecipe = await Recipe.findOne({
			users: { 
				$all: [currentUserId, selectedUserId]
			}
		});

		if (existingRecipe) {
			return res.json({ 
				success: true,
				markdown: existingRecipe.markdown,
				recipes: existingRecipe.recipes
			});
		}

		const combinedIngredients = [
			...(currentUser.ingredientsList || []),
			...(selectedUser.ingredientsList || [])
		].map(i => `${i.ingredient} (${i.quantity})`);

		const combinedCuisines = [...new Set([
			...(currentUser.preferences?.cuisines || []),
			...(selectedUser.preferences?.cuisines || [])
		])];

		const combinedDietaryRestrictions = {
			vegetarian: currentUser.dietaryRestrictions?.vegetarian || selectedUser.dietaryRestrictions?.vegetarian,
			vegan: currentUser.dietaryRestrictions?.vegan || selectedUser.dietaryRestrictions?.vegan,
			kosher: currentUser.dietaryRestrictions?.kosher || selectedUser.dietaryRestrictions?.kosher,
			glutenFree: currentUser.dietaryRestrictions?.glutenFree || selectedUser.dietaryRestrictions?.glutenFree,
			dairyFree: currentUser.dietaryRestrictions?.dairyFree || selectedUser.dietaryRestrictions?.dairyFree,
			allergies: [...new Set([
				...(currentUser.dietaryRestrictions?.allergies || []),
				...(selectedUser.dietaryRestrictions?.allergies || [])
			])]
		};

		// Convert dietary restrictions object to array of active restrictions
		const restrictionsArray = [
			...Object.entries(combinedDietaryRestrictions)
				.filter(([key, value]) => value && key !== 'allergies')
				.map(([key]) => key),
			...combinedDietaryRestrictions.allergies
		];

		const recipePrompt = `Generate 3 recipes that:
1. Use these ingredients: ${combinedIngredients.join(', ')}
2. Match these cuisine preferences: ${combinedCuisines.join(', ')}
3. Follow these dietary restrictions: ${restrictionsArray.join(', ')}

Format each recipe exactly like this:

## [Recipe Name]
### [Cuisine Type]

[2-3 sentence description of the dish explaining what makes it special and how it uses the available ingredients and bold the ingredients used]

---`;

		const completion = await groq.chat.completions.create({
			messages: [{ role: 'user', content: recipePrompt }],
			model: 'llama-3.1-70b-versatile',
			temperature: 0.7,
			max_tokens: 1000,
		});

		const markdownRecipes = completion.choices[0].message.content;

		// Add this new prompt to structure the data
		const structuringPrompt = `Convert these markdown recipes into a JSON array where each recipe has:
- title: The recipe name without brackets
- cuisine: The cuisine type without brackets
- description: The description paragraph

Input markdown:
${markdownRecipes}

Return ONLY a raw JSON array with no markdown formatting, no backticks, and no 'json' prefix. The response should start with '[' and end with ']'.`;

		const completion2 = await groq.chat.completions.create({
			messages: [{ role: 'user', content: structuringPrompt }],
			model: 'llama-3.1-70b-versatile',
			temperature: 0.1,
			max_tokens: 1000,
		});

		const structuredRecipes = JSON.parse(completion2.choices[0].message.content);

		// Save the recipe to the database
		const newRecipe = new Recipe({
			users: [currentUserId, selectedUserId],
			markdown: markdownRecipes,
			recipes: structuredRecipes
		});

		await newRecipe.save();

		res.json({ 
			success: true,
			markdown: markdownRecipes,
			recipes: structuredRecipes
		});

	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ 
			success: false,
			message: 'Error processing recipes',
			error: error.message 
		});
	}
});

app.post('/api/generate-image', async (req, res) => {
	try {
		const { recipe, width = 512, height = 384 } = req.body;
		
		if (!recipe || !recipe.title || !recipe.cuisine || !recipe.description) {
			return res.status(400).json({
				error: 'Invalid recipe data',
				details: 'Recipe must include title, cuisine, and description'
			});
		}

		const toolhouse = new Toolhouse({
			apiKey: process.env.TOOLHOUSE_API_KEY
		});

		const prompt = `Generate an appetizing, professional food photography style image of ${recipe.title}, 
                   a ${recipe.cuisine} dish. The image should be well-lit, with beautiful plating and styling.
                   Description: ${recipe.description}`;

		const response = await toolhouse.generateImage({
			prompt,
			width: Math.min(Math.max(width, 64), 2048),
			height: Math.min(Math.max(height, 64), 2048)
		});

		res.json({ 
			imageUrl: response.url,
			prompt,
			settings: { width, height }
		});
	} catch (error) {
		console.error('Error generating image:', error);
		res.status(500).json({ 
			error: 'Failed to generate image',
			details: error.message 
		});
	}
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/client/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
	});
}

httpServer.listen(PORT, () => {
	console.log("Server started at this port:" + PORT);
	connectDB();
});
