import { useState, useEffect } from 'react';
import { Header } from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import VoiceIngredientInput from '../components/VoiceIngredientInput';
import ImageIngredientInput from '../components/ImageIngredientInput';
import { Refrigerator, Plus, Edit2, Trash2, Save, X, Grid, List } from 'lucide-react';

const FridgePage = () => {
  const { authUser } = useAuthStore();
  const { updateProfile } = useUserStore();
  const [ingredientsList, setIngredientsList] = useState(authUser?.ingredientsList || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState({ ingredient: '', quantity: '' });
  const [newIngredient, setNewIngredient] = useState({ ingredient: '', quantity: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
    <div className="min-h-screen bg-gradient-to-b from-[#e8f0ea] to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Fridge Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Refrigerator className="w-10 h-10 text-[#a2c1a8]" />
              <h1 className="text-4xl font-bold text-gray-900">My Virtual Fridge</h1>
            </div>
            <p className="text-gray-600">Add ingredients using text, voice, or image recognition</p>
          </div>

          {/* Fridge Container */}
          <div className="bg-gradient-to-b from-[#b3d2b9] to-[#a1c5a8] rounded-xl shadow-xl overflow-hidden border-2 border-[#b3d2b9]">
            {/* Fridge Door Handle */}
            <div className="h-6 bg-[#a1c5a8] flex justify-end px-8">
              <div className="w-20 h-8 bg-gray-300 rounded-b-xl shadow-md" />
            </div>
            {/* Fridge Contents */}
            <div className="bg-white m-4 rounded-lg p-6">
              {/* Add New Form */}
              <div className="mb-8 bg-[#f8faf9] rounded-xl p-6 shadow-inner">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Input</h2>
                <form onSubmit={handleAddIngredient} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={newIngredient.ingredient}
                        onChange={(e) => setNewIngredient({ ...newIngredient, ingredient: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:border-[#b3d2b9] focus:ring focus:ring-[#b3d2b9] focus:ring-opacity-50 shadow-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Quantity"
                        value={newIngredient.quantity}
                        onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:border-[#b3d2b9] focus:ring focus:ring-[#b3d2b9] focus:ring-opacity-50 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#a1c5a8] text-white rounded-lg hover:bg-[#91b297] transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                      Add to Fridge
                    </button>
                  </div>
                </form>
              </div>

              {/* Fridge Shelf Divider */}
              <div className="border-t-4 border-[#f0f4f1] my-6" />

              {/* Ingredients List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Fridge Contents</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#b3d2b9] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#b3d2b9] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {ingredientsList.length === 0 ? (
                  <div className="text-center py-8 bg-[#f8faf9] rounded-xl shadow-inner">
                    <Refrigerator className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Your fridge is empty!</p>
                    <p className="text-sm text-gray-400 mt-1">Add ingredients by typing them above, using voice commands, or scanning your groceries</p>
                  </div>
                ) : (
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'}`}>
                    {ingredientsList.map((item, index) => (
                      <div 
                        key={index} 
                        className={`bg-[#f8faf9] rounded-lg border border-gray-100 hover:border-[#b3d2b9] transition-colors shadow-sm
                          ${viewMode === 'grid' ? 'p-3' : 'p-2'}`}
                      >
                        {editingIndex === index ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editingIngredient.ingredient}
                              onChange={(e) => setEditingIngredient({
                                ...editingIngredient,
                                ingredient: e.target.value
                              })}
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editingIngredient.quantity}
                                onChange={(e) => setEditingIngredient({
                                  ...editingIngredient,
                                  quantity: e.target.value
                                })}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm"
                              />
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className="p-1.5 text-[#b3d2b9] hover:bg-[#b3d2b9] hover:text-white rounded-lg transition-colors"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-medium text-gray-900 truncate">{item.ingredient}</span>
                                <span className="text-sm text-gray-500 truncate">{item.quantity}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEditIngredient(index)}
                                className="p-1.5 text-[#b3d2b9] hover:bg-[#b3d2b9] hover:text-white rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteIngredient(index)}
                                className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fridge Shelf Divider */}
              <div className="border-t-4 border-[#f0f4f1] my-6" />

              {/* Voice Input Section */}
              <div className="bg-[#f8faf9] rounded-xl p-6 shadow-inner">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Input</h2>
                <VoiceIngredientInput />
              </div>
              {/* Fridge Shelf Divider */}
              <div className="border-t-4 border-[#f0f4f1] my-6" />

              {/* Image Input Section */}
              <div className="bg-[#f8faf9] rounded-xl p-6 shadow-inner">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Input</h2>
                <div>
                  <ImageIngredientInput />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FridgePage;
