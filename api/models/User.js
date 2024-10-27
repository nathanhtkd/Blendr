import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		bio: { type: String, default: "" },
		image: { type: String, default: "" },
		preferences: {
			cuisines: [{
				type: String,
				enum: ["American", "Chinese", "Indian", "Italian", "Mexican", "Korean", "Japanese", "Persian", "Jamaican"],
			}],
		},
		dietaryRestrictions: {
			vegetarian: { type: Boolean, default: false },
			vegan: { type: Boolean, default: false },
			kosher: { type: Boolean, default: false },
			glutenFree: { type: Boolean, default: false },
			dairyFree: { type: Boolean, default: false },
			allergies: [{ type: String }],
		},
		availableAppliances: {
			airFryer: { type: Boolean, default: false },
			microwave: { type: Boolean, default: false },
			oven: { type: Boolean, default: false },
			stoveTop: { type: Boolean, default: false },
			sousVide: { type: Boolean, default: false},
			deepFryer: { type: Boolean, default: false},
			blender: { type: Boolean, default: false},
			instantPot: { type: Boolean, default: false},
		},
		ingredientsList: [{
			ingredient: { type: String, required: true },
			quantity: { type: String, required: true },
		}],
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		dislikes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		matches: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
		],
		dietaryGoals: {
			protein: { type: Number, default: 0 },
			carbs: { type: Number, default: 0 },
			fats: { type: Number, default: 0 },
		},
	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
