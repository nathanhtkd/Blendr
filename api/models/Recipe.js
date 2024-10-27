import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [{
    item: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  }],
  cuisineType: {
    type: String,
    enum: ["American", "Chinese", "Indian", "Italian", "Mexican", "Korean", "Japanese", "Persian", "Jamaican"],
    required: true
  },
  // Reference to the users who matched on this recipe
  matchedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // If the recipe was AI-generated, store the timestamp
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Recipe', recipeSchema);
