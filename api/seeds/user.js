import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const cuisineTypes = ["American", "Chinese", "Indian", "Italian", "Mexican", "Korean", "Japanese", "Persian", "Jamaican"];

const names = [
	"Nathan", 
	"Chris",  // Add Chris as second name
	"Alex", "Jordan", "Sam", "Taylor", "Morgan",
	"Jamie", "Casey", "Riley", "Avery"
];


const shuffleArray = (array) => {
	return array.sort(() => 0.5 - Math.random());
};

const generateRandomUser = (index) => {
	const name = names[index];
	
	// Special case for Nathan
	if (name === "Nathan") {
		return {
			name: "Nathan",
			email: "nathan1@example.com",
			password: bcrypt.hashSync("password123", 10),
			image: `/avatars/${index + 1}.jpg`,
			preferences: {
				cuisines: ["American", "Chinese"],
			},
			dietaryRestrictions: {
				vegetarian: false,
				vegan: false,
				kosher: false,
				glutenFree: false,
				dairyFree: false,
				allergies: ["peanuts"],
			},
			availableAppliances: {
				airFryer: true,
				microwave: true,
				oven: true,
				stoveTop: true,
				sousVide: false,
				deepFryer: false,
				blender: true,
				instantPot: true,
			},
			ingredientsList: [
				{ ingredient: "Cabbage", quantity: "500g" },
				{ ingredient: "Pepper", quantity: "200g" },
				{ ingredient: "Olive Oil", quantity: "0.25L" },
			],
			likes: [],
			dislikes: [],
			matches: [],
			dietaryGoals: {
				protein: 40,
				carbs: 30,
				fats: 30,
			},
			location: "Houston, TX",
		};
	}

	// Special case for Chris
	if (name === "Chris") {
		return {
			name: "Chris",
			email: "chris1@example.com",
			password: bcrypt.hashSync("password123", 10),
			image: `/avatars/${index + 1}.jpg`,
			preferences: {
				cuisines: ["American", "Chinese"],
			},
			dietaryRestrictions: {
				vegetarian: false,
				vegan: false,
				kosher: false,
				glutenFree: false,
				dairyFree: false,
				allergies: ["peanuts"],
			},
			availableAppliances: {
				airFryer: true,
				microwave: true,
				oven: true,
				stoveTop: true,
				sousVide: false,
				deepFryer: false,
				blender: true,
				instantPot: true,
			},
			ingredientsList: [
				{ ingredient: "Chicken Breast", quantity: "300g" },
				{ ingredient: "Quinoa", quantity: "200g" },
				{ ingredient: "Sweet Potato", quantity: "300g" }
			],
			likes: [],
			dislikes: [],
			matches: [],
			dietaryGoals: {
				protein: 40,
				carbs: 30,
				fats: 30,
			},
			location: "Houston, TX",
		};
	}

	// Original random user generation for other users
	const age = Math.floor(Math.random() * (45 - 21 + 1) + 21);
	return {
		name,
		email: `${name.toLowerCase()}${age}@example.com`,
		password: bcrypt.hashSync("password123", 10),
		image: `/avatars/${index + 1}.jpg`,
		preferences: {
			cuisines: shuffleArray(cuisineTypes).slice(0, Math.floor(Math.random() * 4) + 2),
		},
		dietaryRestrictions: {
			vegetarian: Math.random() < 0.2,
			vegan: Math.random() < 0.1,
			kosher: Math.random() < 0.1,
			glutenFree: Math.random() < 0.15,
			dairyFree: Math.random() < 0.15,
			allergies: Math.random() < 0.2 ? ["peanuts", "shellfish"] : [],
		},
		availableAppliances: {
			airFryer: Math.random() < 0.7,
			microwave: Math.random() < 0.9,
			oven: Math.random() < 0.95,
			stoveTop: Math.random() < 0.95,
			sousVide: Math.random() < 0.2,
			deepFryer: Math.random() < 0.3,
			blender: Math.random() < 0.8,
			instantPot: Math.random() < 0.6,
		},
		ingredientsList: [
			{ ingredient: "Salt", quantity: "500g" },
			{ ingredient: "Pepper", quantity: "200g" },
			{ ingredient: "Olive Oil", quantity: "1L" },
		],
		likes: [],
		dislikes: [],
		matches: [],
		dietaryGoals: {
			protein: Math.floor(Math.random() * (200 - 120 + 1) + 120), // Random protein goal between 120-200g
			carbs: Math.floor(Math.random() * (300 - 200 + 1) + 200),   // Random carbs goal between 200-300g
			fats: Math.floor(Math.random() * (80 - 40 + 1) + 40),       // Random fats goal between 40-80g
		},
		location: ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Dallas, TX"][Math.floor(Math.random() * 5)],
	};
};

const seedUsers = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);

		await User.deleteMany({});

		const users = Array.from({ length: 10 }, (_, i) => generateRandomUser(i));

		await User.insertMany(users);

		console.log("Database seeded successfully with 10 users");
	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		mongoose.disconnect();
	}
};

seedUsers();
