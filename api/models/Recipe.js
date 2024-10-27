import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    recipes: [{
        title: {
            type: String,
            required: true
        },
        cuisine: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    }],
    markdown: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
