import { useRef, useState, useEffect } from "react";
import { Header } from "../components/Header";
import React from 'react';

import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { 
  Camera, 
  ChefHat, 
  MapPin, 
  User, 
  ScrollText,
  Utensils, 
  AlertTriangle,
  KanbanSquare,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const { authUser } = useAuthStore();
  const [name, setName] = useState(authUser?.name || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [image, setImage] = useState(authUser?.image || null);
  const [location, setLocation] = useState(authUser?.location || "");
  
  // Other state management remains the same as your original code
  const [cuisines, setCuisines] = useState(authUser?.preferences?.cuisines || []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState({
    vegetarian: authUser?.dietaryRestrictions?.vegetarian || false,
    vegan: authUser?.dietaryRestrictions?.vegan || false,
    kosher: authUser?.dietaryRestrictions?.kosher || false,
    glutenFree: authUser?.dietaryRestrictions?.glutenFree || false,
    dairyFree: authUser?.dietaryRestrictions?.dairyFree || false,
    allergies: authUser?.dietaryRestrictions?.allergies || [],
  });
  const [allergies, setAllergies] = useState(
    authUser?.dietaryRestrictions?.allergies?.join(", ") || ""
  );
  const [appliances, setAppliances] = useState({
    airFryer: authUser?.availableAppliances?.airFryer || false,
    microwave: authUser?.availableAppliances?.microwave || false,
    oven: authUser?.availableAppliances?.oven || false,
    stoveTop: authUser?.availableAppliances?.stoveTop || false,
    sousVide: authUser?.availableAppliances?.sousVide || false,
    deepFryer: authUser?.availableAppliances?.deepFryer || false,
    blender: authUser?.availableAppliances?.blender || false,
    instantPot: authUser?.availableAppliances?.instantPot || false,
  });
  
  const [dietaryGoals, setDietaryGoals] = useState({
    protein: authUser?.dietaryGoals?.protein || 0,
    carbs: authUser?.dietaryGoals?.carbs || 0,
    fats: authUser?.dietaryGoals?.fats || 0,
  });

  const fileInputRef = useRef(null);
  const { loading, updateProfile } = useUserStore();

  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    setShouldAnimate(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      bio,
      image,
      location,
      preferences: { cuisines },
      dietaryRestrictions: {
        ...dietaryRestrictions,
        allergies: allergies.split(",").map(a => a.trim()).filter(Boolean)
      },
      availableAppliances: appliances,
      dietaryGoals,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDietaryGoalChange = (goal, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 300) {
      setDietaryGoals(prev => ({ ...prev, [goal]: numValue }));
    }
  };

  const formatLabel = (str) => {
    return str
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Add these animation variants before the return statement
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
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
        className="max-w-4xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate={shouldAnimate ? "visible" : "hidden"}
      >
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Culinary Profile</h1>
          <p className="text-gray-600">Customize your cooking experience</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Header Section */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            variants={itemVariants}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                {image ? (
                  <img
                    src={image}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={40} className="text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full shadow-lg 
                           transform transition-transform duration-200 hover:scale-110"
                >
                  <Camera size={20} className="text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <User size={16} className="mr-2" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <MapPin size={16} className="mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Your location"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio Section */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            variants={itemVariants}
          >
            <h2 className="flex items-center text-xl font-semibold mb-4">
              <ScrollText size={24} className="mr-2 text-emerald-500" />
              About You
            </h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Tell us about yourself and your cooking journey..."
            />
          </motion.div>

          {/* Cuisines Section */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            variants={itemVariants}
          >
            <h2 className="flex items-center text-xl font-semibold mb-4">
              <ChefHat size={24} className="mr-2 text-emerald-500" />
              Preferred Cuisines
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["American", "Chinese", "Indian", "Italian", "Mexican", "Korean", "Japanese", "Persian", "Jamaican"].map((cuisine) => (
                <label
                  key={cuisine}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${cuisines.includes(cuisine) 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 hover:border-emerald-200'}`}
                >
                  <input
                    type="checkbox"
                    checked={cuisines.includes(cuisine)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCuisines([...cuisines, cuisine]);
                      } else {
                        setCuisines(cuisines.filter(c => c !== cuisine));
                      }
                    }}
                    className="sr-only"
                  />
                  <span className="text-center">{cuisine}</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Dietary Restrictions Section */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            variants={itemVariants}
          >
            <h2 className="flex items-center text-xl font-semibold mb-4">
              <AlertTriangle size={24} className="mr-2 text-emerald-500" />
              Dietary Restrictions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {Object.keys(dietaryRestrictions)
                .filter(key => key !== 'allergies')
                .map((restriction) => (
                  <label
                    key={restriction}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer
                      ${dietaryRestrictions[restriction] 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-200 hover:border-emerald-200'}`}
                  >
                    <input
                      type="checkbox"
                      checked={dietaryRestrictions[restriction]}
                      onChange={(e) => {
                        setDietaryRestrictions({
                          ...dietaryRestrictions,
                          [restriction]: e.target.checked
                        });
                      }}
                      className="sr-only"
                    />
                    <span className="text-center">{formatLabel(restriction)}</span>
                  </label>
                ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., peanuts, shellfish, dairy"
              />
            </div>
          </motion.div>

          {/* Kitchen Equipment Section */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            variants={itemVariants}
          >
            <h2 className="flex items-center text-xl font-semibold mb-4">
              <Utensils size={24} className="mr-2 text-emerald-500" />
              Kitchen Equipment
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(appliances).map((appliance) => (
                <label
                  key={appliance}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${appliances[appliance] 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 hover:border-emerald-200'}`}
                >
                  <input
                    type="checkbox"
                    checked={appliances[appliance]}
                    onChange={(e) => {
                      setAppliances({
                        ...appliances,
                        [appliance]: e.target.checked
                      });
                    }}
                    className="sr-only"
                  />
                  <span className="text-center">{formatLabel(appliance)}</span>
                </label>
              ))}
            </div>
          </motion.div>
          {/* Dietary Goals Section */}
          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-lg"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-8">
              <KanbanSquare className="text-emerald-700 w-6 h-6" />
              <h2 className="text-2xl font-semibold text-gray-800">Dietary Goals</h2>
            </div>

            <div className="space-y-8">
              {Object.entries(dietaryGoals).map(([goal, value]) => (
                <div key={goal} className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 text-lg capitalize">{goal}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleDietaryGoalChange(goal, e.target.value)}
                        className="w-16 h-8 rounded border-gray-200 text-right px-2 
                                 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        min="0"
                        max="300"
                      />
                      <span className="text-gray-500 text-lg">g</span>
                    </div>
                  </div>
                  
                  <div className="relative h-3">
                    <div className="absolute w-full h-full bg-gray-100 rounded-full" />
                    <div 
                      className="absolute h-full bg-emerald-200 rounded-full"
                      style={{ width: `${(value / 300) * 100}%` }}
                    />
                    <input
                      type="range"
                      value={value}
                      onChange={(e) => handleDietaryGoalChange(goal, e.target.value)}
                      className="absolute w-full h-full opacity-0 cursor-pointer"
                      min="0"
                      max="300"
                    />
                    <div 
                      className="absolute h-6 w-6 bg-white rounded-full shadow-md border-2 border-emerald-500 top-1/2 -mt-3 -ml-3 cursor-pointer"
                      style={{ left: `${(value / 300) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-300 to-emerald-600 text-white rounded-xl 
                     py-4 font-medium text-lg shadow-lg transform transition-all duration-200 
                     hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed 
                     disabled:hover:scale-100 flex items-center justify-center gap-2"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <span>Save Profile</span>
              </>
            )}
          </motion.button>

          <motion.div 
            className="text-center mt-4"
            variants={itemVariants}
          >
            <p className="text-sm text-gray-600">
              All changes are saved automatically
            </p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
