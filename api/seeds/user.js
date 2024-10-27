import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const cuisineTypes = ["American", "Chinese", "Indian", "Italian", "Mexican", "Korean", "Japanese", "Persian", "Jamaican"];

const names = [
	"Alex", "Jordan", "Sam", "Taylor", "Morgan",
	"Jamie", "Casey", "Riley", "Avery", "Quinn"
];

const bioDescriptors = [
	"Coffee addict",
	"Cat lover",
	"Dog person",
	"Foodie",
	"Gym rat",
	"Bookworm",
	"Movie buff",
	"Music lover",
	"Travel junkie",
	"Beach bum",
	"City slicker",
	"Outdoor enthusiast",
	"Netflix binger",
	"Yoga enthusiast",
	"Craft beer connoisseur",
	"Sushi fanatic",
	"Adventure seeker",
	"Night owl",
	"Early bird",
	"Aspiring chef",
];

const generateBio = () => {
	const descriptors = bioDescriptors.sort(() => 0.5 - Math.random()).slice(0, 3);
	return descriptors.join(" | ");
};

const shuffleArray = (array) => {
	return array.sort(() => 0.5 - Math.random());
};

const generateRandomUser = (index) => {
	const name = names[index];
	const age = Math.floor(Math.random() * (45 - 21 + 1) + 21);
	return {
		name,
		email: `${name.toLowerCase()}${age}@example.com`,
		password: bcrypt.hashSync("password123", 10),
		bio: generateBio(),
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
