import { useState, useEffect } from 'react';
import { Header } from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import VoiceIngredientInput from '../components/VoiceIngredientInput';

const FridgePage = () => {
  const { authUser } = useAuthStore();
  const { updateProfile } = useUserStore();
  const [ingredientsList, setIngredientsList] = useState(authUser?.ingredientsList || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState({ ingredient: '', quantity: '' });
  const [newIngredient, setNewIngredient] = useState({ ingredient: '', quantity: '' });

  useEffect(() => {
    setIngredientsList(authUser?.ingredientsList || []);
  }, [authUser]);

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (newIngredient.ingredient && newIngredient.quantity) {
      const updatedIngredients = [...ingredientsList, newIngredient];
      setIngredientsList(updatedIngredients);
      updateProfile({ ingredientsList: updatedIngredients });
      setNewIngredient({ ingredient: '', quantity: '' });
    }
  };

  const handleDeleteIngredient = (index) => {
    const updatedIngredients = ingredientsList.filter((_, i) => i !== index);
    setIngredientsList(updatedIngredients);
    updateProfile({ ingredientsList: updatedIngredients });
  };

  const handleEditIngredient = (index) => {
    setEditingIndex(index);
    setEditingIngredient(ingredientsList[index]);
  };

  const handleSaveEdit = (index) => {
    const updatedIngredients = [...ingredientsList];
    updatedIngredients[index] = editingIngredient;
    setIngredientsList(updatedIngredients);
    updateProfile({ ingredientsList: updatedIngredients });
    setEditingIndex(null);
    setEditingIngredient({ ingredient: '', quantity: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">My Virtual Fridge</h1>
            <p className="mt-2 text-gray-600">Manage your ingredients and use voice commands to add new ones</p>
          </div>

          {/* Manual Input Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Ingredient</h2>
            <form onSubmit={handleAddIngredient} className="flex gap-4">
              <input
                type="text"
                placeholder="Ingredient name"
                value={newIngredient.ingredient}
                onChange={(e) => setNewIngredient({ ...newIngredient, ingredient: e.target.value })}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
              <input
                type="text"
                placeholder="Quantity"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Add
              </button>
            </form>
          </div>

          {/* Ingredients List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Ingredients</h2>
            <div className="divide-y divide-gray-200">
              {ingredientsList.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No ingredients added yet. Add some above or use voice input below.</p>
              ) : (
                ingredientsList.map((item, index) => (
                  <div key={index} className="py-4 flex items-center justify-between">
                    {editingIndex === index ? (
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="text"
                          value={editingIngredient.ingredient}
                          onChange={(e) => setEditingIngredient({
                            ...editingIngredient,
                            ingredient: e.target.value
                          })}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        />
                        <input
                          type="text"
                          value={editingIngredient.quantity}
                          onChange={(e) => setEditingIngredient({
                            ...editingIngredient,
                            quantity: e.target.value
                          })}
                          className="w-32 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        />
                        <button
                          onClick={() => handleSaveEdit(index)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{item.ingredient}</span>
                          <span className="ml-4 text-sm text-gray-500">{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleEditIngredient(index)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteIngredient(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Voice Input Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Input</h2>
            <VoiceIngredientInput />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FridgePage;

