import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { 
  User, MapPin, Mail, Lock, ChefHat, 
  AlertTriangle, Utensils,
  ArrowRight, ArrowLeft, CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    title: "Account Details",
    icon: User,
    description: "Let's start with the basics",
    status: "current" // or "complete" or "upcoming"
  },
  {
    title: "Dietary Preferences",
    icon: AlertTriangle,
    description: "Tell us about your dietary needs",
    status: "upcoming"
  },
  {
    title: "Kitchen Setup",
    icon: Utensils,
    description: "What equipment do you have?",
    status: "upcoming"
  },
  {
    title: "Cuisine Preferences",
    icon: ChefHat,
    description: "What types of food do you enjoy?",
    status: "upcoming"
  }
];

const StepIndicator = ({ step, index, currentStep }) => {
  const isActive = index === currentStep;
  const isCompleted = index < currentStep;

  return (
    <div className="flex flex-col items-center flex-1">
      {index < steps.length - 1 && (
        <motion.div 
          className={`hidden md:block h-0.5 w-full absolute top-1/2 left-1/2 -z-10`}
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: isCompleted ? 1 : 0,
            backgroundColor: isCompleted ? '#10b981' : '#e5e7eb'
          }}
          transition={{ duration: 0.5 }}
        />
      )}
      
      <motion.div 
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
          ${isActive ? 'bg-emerald-500 text-white' : 
            isCompleted ? 'bg-emerald-500 text-white' : 
            'bg-gray-200 text-gray-500'}`}
        initial={false}
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <step.icon className="w-5 h-5" />
        )}
      </motion.div>

      {/* Text */}
      <div className="text-center">
        <p className={`text-sm font-medium mb-0.5
          ${isActive || isCompleted ? 'text-emerald-500' : 'text-gray-500'}`}>
          {step.title}
        </p>
        <p className="text-xs text-gray-400 hidden md:block">
          {step.description}
        </p>
      </div>
    </div>
  );
};

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    dietaryRestrictions: {
      vegetarian: false,
      vegan: false,
      kosher: false,
      glutenFree: false,
      dairyFree: false,
    },
    allergies: "",
    availableAppliances: {
      airFryer: false,
      microwave: false,
      oven: false,
      stoveTop: false,
      sousVide: false,
      deepFryer: false,
      blender: false,
      instantPot: false,
    },
    cuisinePreferences: {
      American: false,
      Chinese: false,
      Indian: false,
      Italian: false,
      Mexican: false,
      Korean: false,
      Japanese: false,
      Persian: false,
      Jamaican: false,
    },
    dietaryGoals: {
      protein: 0,
      carbs: 0,
      fats: 0
    },
    favorites: [], // Array to store favorite recipes
  });

  const [currentStep, setCurrentStep] = useState(0);
  const { signup, loading } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup({
      ...formData,
      preferences: { 
        cuisines: Object.keys(formData.cuisinePreferences).filter(cuisine => formData.cuisinePreferences[cuisine]) 
      },
      dietaryRestrictions: { 
        ...formData.dietaryRestrictions, 
        allergies: formData.allergies.split(',').map(a => a.trim()) 
      },
    });
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatLabel = (str) => {
    return str
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const renderStep = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            switch (currentStep) {
              case 0:
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <User size={16} className="mr-2" />
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <Mail size={16} className="mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <Lock size={16} className="mr-2" />
                        Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <MapPin size={16} className="mr-2" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => updateFormData('location', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                );
              case 1:
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      {Object.keys(formData.dietaryRestrictions).map((restriction) => (
                        <label
                          key={restriction}
                          className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer
                            ${formData.dietaryRestrictions[restriction] 
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                              : 'border-gray-200 hover:border-emerald-200'}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.dietaryRestrictions[restriction]}
                            onChange={(e) => updateFormData('dietaryRestrictions', {
                              ...formData.dietaryRestrictions,
                              [restriction]: e.target.checked
                            })}
                            className="sr-only"
                          />
                          <span className="text-center text-sm md:text-base">{formatLabel(restriction)}</span>
                        </label>
                      ))}
                    </div>
                    <div className="max-w-2xl mx-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Any allergies?
                      </label>
                      <input
                        type="text"
                        value={formData.allergies}
                        onChange={(e) => updateFormData('allergies', e.target.value)}
                        placeholder="e.g., peanuts, shellfish, dairy"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                );
              case 2:
                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.keys(formData.availableAppliances).map((appliance) => (
                      <label
                        key={appliance}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer
                          ${formData.availableAppliances[appliance] 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-gray-200 hover:border-emerald-200'}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.availableAppliances[appliance]}
                          onChange={(e) => updateFormData('availableAppliances', {
                            ...formData.availableAppliances,
                            [appliance]: e.target.checked
                          })}
                          className="sr-only"
                        />
                        <span className="text-center">
                          {formatLabel(appliance)}
                        </span>
                      </label>
                    ))}
                  </div>
                );
              case 3:
                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.keys(formData.cuisinePreferences).map((cuisine) => (
                      <label
                        key={cuisine}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer
                          ${formData.cuisinePreferences[cuisine] 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-gray-200 hover:border-emerald-200'}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.cuisinePreferences[cuisine]}
                          onChange={(e) => updateFormData('cuisinePreferences', {
                            ...formData.cuisinePreferences,
                            [cuisine]: e.target.checked
                          })}
                          className="sr-only"
                        />
                        <span>{cuisine}</span>
                      </label>
                    ))}
                  </div>
                );
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <motion.div 
      className="max-w-3xl mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Progress Steps */}
      <div className="mb-12 relative">
        <div className="flex justify-between items-start relative">
          {steps.map((step, index) => (
            <StepIndicator
              key={step.title}
              step={step}
              index={index}
              currentStep={currentStep}
            />
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              {steps[currentStep].icon && React.createElement(steps[currentStep].icon, {
                className: "w-5 h-5 text-emerald-500"
              })}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-500">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className={`flex items-center px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100
                  ${currentStep === 0 ? 'invisible' : ''}`}
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
              
              {currentStep === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 rounded-lg bg-emerald-500 text-white
                    hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Complete Setup"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();  // Add this line
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="flex items-center px-6 py-2 rounded-lg bg-emerald-500 text-white
                    hover:bg-emerald-600"
                >
                  Next
                  <ArrowRight size={20} className="ml-2" />
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SignUpForm;
