import { useState, useEffect } from 'react';
import { Header } from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import VoiceIngredientInput from '../components/VoiceIngredientInput';
import ImageIngredientInput from '../components/ImageIngredientInput';
import { Refrigerator, Plus, Edit2, Trash2, Save, X, Grid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Add animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 }
    }
  };

  // Add new variants for edit mode
  const editModeVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 overflow-hidden'>
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23065f46' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <Header />
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
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
                  <motion.div 
                    className="text-center py-8 bg-[#f8faf9] rounded-xl shadow-inner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Refrigerator className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Your fridge is empty!</p>
                    <p className="text-sm text-gray-400 mt-1">Add ingredients by typing them above, using voice commands, or scanning your groceries</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'}`}
                    variants={listVariants}
                  >
                    <AnimatePresence mode="popLayout">
                      {ingredientsList.map((item, index) => (
                        <motion.div 
                          key={index}
                          layout
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`bg-[#f8faf9] rounded-lg border border-gray-100 hover:border-[#b3d2b9] transition-colors shadow-sm
                            ${viewMode === 'grid' ? 'p-3' : 'p-2'}`}
                        >
                          {editingIndex === index ? (
                            <motion.div 
                              className="flex flex-col gap-2 w-full"
                              variants={editModeVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                            >
                              <div className="flex flex-col gap-2 w-full">
                                <input
                                  type="text"
                                  value={editingIngredient.ingredient}
                                  onChange={(e) => setEditingIngredient({
                                    ...editingIngredient,
                                    ingredient: e.target.value
                                  })}
                                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm"
                                />
                                <div className="flex gap-2 items-center w-full">
                                  <input
                                    type="text"
                                    value={editingIngredient.quantity}
                                    onChange={(e) => setEditingIngredient({
                                      ...editingIngredient,
                                      quantity: e.target.value
                                    })}
                                    className="min-w-0 flex-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm"
                                  />
                                  <div className="flex-shrink-0 flex gap-2">
                                    <button
                                      onClick={() => handleSaveEdit(index)}
                                      className="p-1.5 text-[#b3d2b9] hover:bg-[#b3d2b9] hover:text-white rounded-lg transition-all duration-200"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingIndex(null)}
                                      className="p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-lg transition-all duration-200"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
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
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* Fridge Shelf Divider */}
              <div className="border-t-4 border-[#f0f4f1] my-6" />

              {/* Voice Input Section */}
              <motion.div 
                className="bg-[#f8faf9] rounded-xl p-6 shadow-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Input</h2>
                <VoiceIngredientInput />
              </motion.div>
              {/* Fridge Shelf Divider */}
              <div className="border-t-4 border-[#f0f4f1] my-6" />

              {/* Image Input Section */}
              <motion.div 
                className="bg-[#f8faf9] rounded-xl p-6 shadow-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Input</h2>
                <div>
                  <ImageIngredientInput />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FridgePage;
