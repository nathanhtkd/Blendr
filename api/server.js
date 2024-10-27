import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import Groq from 'groq-sdk';
import Recipe from "./models/Recipe.js";
import mongoose from "mongoose";

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

[2-3 sentence description of the dish explaining what makes it special and how it uses the available ingredients]

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

		const structuredCompletion = await groq.chat.completions.create({
			messages: [{ role: 'user', content: structuringPrompt }],
			model: 'llama-3.1-70b-versatile',
			temperature: 0,
			max_tokens: 1000,
		});

		const recipes = JSON.parse(structuredCompletion.choices[0].message.content.trim());

		// Create new recipe document with structured data
		await Recipe.create({
			users: [currentUserId, selectedUserId],
			recipes: recipes,
			markdown: markdownRecipes
		});

		res.json({ 
			success: true,
			markdown: markdownRecipes,
			recipes: recipes
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
