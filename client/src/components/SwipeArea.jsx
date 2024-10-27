import { useState, useRef, useEffect } from 'react';
import TinderCard from "react-tinder-card";
import { useMatchStore } from "../store/useMatchStore";
import { useAuthStore } from '../store/useAuthStore';
import MatchScore from './MatchScore';
import React from 'react';
import loadingGif from '../assets/pan.gif'; // Import the loading GIF
import { motion, AnimatePresence } from 'framer-motion'; // Add this import
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Heart } from 'lucide-react';
import { useUserStore } from "../store/useUserStore";
import { toast } from 'react-toastify';

const SwipeArea = () => {
	const { authUser } = useAuthStore();
	const { userProfiles, swipeRight, swipeLeft } = useMatchStore();
	const [expandedUser, setExpandedUser] = useState(null);
	const swipeStartTime = useRef(null);
	const swipeThreshold = 300; // milliseconds
	const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
	const [recipes, setRecipes] = useState(null);
	const { updateProfile } = useUserStore();

	const handleSwipe = (dir, user) => {
		if (dir === "right") swipeRight(user);
		else if (dir === "left") swipeLeft(user);
		setExpandedUser(null); // Close expanded view on swipe
	};

	const handleCardClick = async (user) => {
		const swipeDuration = Date.now() - swipeStartTime.current;
		if (swipeDuration < swipeThreshold) {
			setExpandedUser(user);
			setIsLoadingRecipes(true);
			try {
				const response = await fetch('http://localhost:4999/api/groq/recipes', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({ 
						currentUser: authUser,
						selectedUser: user
					}),
				});
				const data = await response.json();
				setRecipes(data.recipes); // Store the structured array instead of markdown
			} catch (error) {
				console.error('Error fetching recipes:', error);
			} finally {
				setIsLoadingRecipes(false);
			}
		}
	};

	const handleSwipeStart = () => {
		swipeStartTime.current = Date.now();
	};

	const DietaryGoalBar = ({ value, icon, label }) => {
		// Function to determine color based on percentage
		const getColor = (percentage) => {
			if (percentage < 33) return 'bg-red-400';
			if (percentage < 66) return 'bg-yellow-400';
			return 'bg-green-500';
		};

		return (
			<div className="flex items-center w-full mb-2">
				<span className="mr-2">{icon}</span>
				<div className="w-full bg-gray-200 rounded-full h-2.5">
					<div 
						className={`h-2.5 rounded-full ${getColor(value)}`}
						style={{ width: `${value}%` }}
					></div>
				</div>
				<span className="ml-2 text-sm">{value}%</span>
			</div>
		);
	};

	const ExpandedView = ({ user }) => {
		const phrases = [
		"Blending up something delicious...",
		"Mixing flavors with a touch of Blendr magic...",
		"Your recipe in the mix!",
		"Stirring things up just for you...",
		"Cooking up a Blendr masterpiece...",
		"Whisking up a little flavor magic...",
		"A pinch of this, a blend of that...",
		"Your taste adventure starts here..."
		];

		const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

		useEffect(() => {
			const intervalId = setInterval(() => {
				setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
			}, 14000);

			return () => clearInterval(intervalId);
		}, []);

		const dietaryRestrictions = Object.entries(user.dietaryRestrictions || {})
			.filter(([key, value]) => value && key !== 'allergies');

		const appliances = [
			'air Fryer', 'microwave', 'oven', 'stove Top', 
			'sous Vide', 'deep Fryer', 'blender', 'instant Pot'
		];

		const availableAppliances = appliances.filter(appliance => 
			user.appliances && user.appliances[appliance]
		);

		const bubbleStyle = "px-4 py-2 rounded-full text-base bg-green-50 text-green-800 border-2 border-green-600";

		// Add animation variants for staggered children
		const containerVariants = {
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					when: "beforeChildren",
					staggerChildren: 0.1
				}
			}
		};

		const itemVariants = {
			hidden: { opacity: 0, y: 10 },
			visible: {
				opacity: 1,
				y: 0,
				transition: { duration: 0.3 }
			}
		};

		return (
			<div className="bg-gray-600 bg-opacity-50 overflow-y-auto h-screen w-screen flex items-center justify-center">
				<motion.div 
					className="relative p-8 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 h-5/6 shadow-lg rounded-2xl bg-white overflow-y-auto"
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					<motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
						<div className="flex items-center">
							<h2 className='text-4xl font-semibold text-gray-800 mr-4'>{user.name}</h2>
							<MatchScore score={user.compatibilityScore} />
						</div>
						<button 
							onClick={() => setExpandedUser(null)}
							className="text-gray-500 hover:text-gray-700 text-2xl"
						>
							×
						</button>
					</motion.div>
					
					<motion.div variants={itemVariants} className="mb-6">
						<p className='text-xl text-gray-600'>📍 {user.location || "Location not specified"}</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Combined Macros */}
						<motion.div variants={itemVariants}>
							<h3 className="text-2xl font-medium mb-4">Combined Macros</h3>
							<DietaryGoalBar value={user.goalCompletion?.protein || 0} icon="🥩" label="Protein" />
							<DietaryGoalBar value={user.goalCompletion?.carbs || 0} icon="🍞" label="Carbs" />
							<DietaryGoalBar value={user.goalCompletion?.fats || 0} icon="🥑" label="Fats" />
						</motion.div>

						{/* Cuisine Preferences */}
						<motion.div variants={itemVariants}>
							<h3 className="text-2xl font-medium mb-4">Cuisine Preferences</h3>
							<div className="flex flex-wrap gap-2">
								{user.preferences?.cuisines?.map((cuisine, index) => (
									<span key={index} className={bubbleStyle}>
										{cuisine}
									</span>
								))}
							</div>
						</motion.div>

						{/* Available Appliances section */}
						<motion.div variants={itemVariants}>
							<h3 className="text-2xl font-medium mb-4">Available Appliances</h3>
							<div className="flex flex-wrap gap-2">
								{availableAppliances.length > 0 ? (
									availableAppliances.map((appliance) => (
										<span key={appliance} className={bubbleStyle}>
											{appliance}
										</span>
									))
								) : (
									<span className={bubbleStyle}>
										No appliances found
									</span>
								)}
							</div>
						</motion.div>

						{/* Dietary Restrictions */}
						<motion.div variants={itemVariants}>
							<h3 className="text-2xl font-medium mb-4">Dietary Restrictions</h3>
							<div className="flex flex-wrap gap-2">
								{dietaryRestrictions.length > 0 ? (
									dietaryRestrictions.map(([key]) => (
										<span key={key} className={bubbleStyle}>
											{key}
										</span>
									))
								) : (
									<span className={bubbleStyle}>
										None
									</span>
								)}
							</div>
						</motion.div>

						{/* Recipe section */}
						<motion.div variants={itemVariants} className="col-span-1 md:col-span-2 mt-8">
							<h3 className="text-2xl font-medium mb-4">Recipes</h3>
							<div className="space-y-6">
								{recipes?.map((recipe, index) => {
									// Check if recipe is already in favorites
									const isInFavorites = authUser?.favorites?.some(
										fav => fav.title === recipe.title && fav.description === recipe.description
									);

									return (
										<div key={index} className="bg-white rounded-lg p-6 shadow-sm">
											<div className="flex justify-between items-start mb-4">
												<div>
													<h4 className="text-xl font-semibold text-gray-900">{recipe.title}</h4>
													<p className="text-sm text-gray-500">{recipe.cuisine}</p>
												</div>
												<button
													onClick={async () => {
														if (isInFavorites) {
															toast.info('Recipe is already in favorites!');
															return;
														}
														const currentFavorites = authUser?.favorites || [];
														const newFavorite = {
															id: `${Date.now()}-${index}`,
															title: recipe.title,
															cuisine: recipe.cuisine,
															description: recipe.description,
														};
														const updatedFavorites = [...currentFavorites, newFavorite];
														await updateProfile({ favorites: updatedFavorites });
														toast.success('Recipe added to favorites!');
													}}
													className="p-2 hover:bg-red-50 rounded-lg transition-colors"
												>
													<Heart 
														className={`w-6 h-6 ${isInFavorites ? 'fill-red-500' : 'fill-none'} text-red-500`}
													/>
												</button>
											</div>
											<p className="text-gray-600">{recipe.description}</p>
										</div>
									);
								})}
							</div>
						</motion.div>
					</div>
				</motion.div>
			</div>
		);
	};

	// Add these animation variants
	const cardVariants = {
		initial: { 
			opacity: 0,
			y: 20,
		},
		animate: (index) => ({
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.3,
				delay: index * 0.1, // Stagger the cards
			}
		})
	};

	const contentVariants = {
		initial: { opacity: 0 },
		animate: { 
			opacity: 1,
			transition: { duration: 0.2 }
		}
	};

	return (
		<div className='relative w-full max-w-md h-[40rem] mx-auto left-0 right-0 z-[20]'>
			<AnimatePresence>
				{userProfiles.map((user, index) => (
					<TinderCard
						className='absolute'
						key={user._id}
						onSwipe={(dir) => handleSwipe(dir, user)}
						onCardLeftScreen={() => setExpandedUser(null)}
						swipeRequirementType='position'
						swipeThreshold={100}
						preventSwipe={["up", "down"]}
					>
						<motion.div 
							className='card bg-white w-96 h-[40rem] rounded-2xl overflow-hidden shadow-lg overflow-y-scroll'
							onClick={() => handleCardClick(user)}
							onMouseDown={handleSwipeStart}
							onTouchStart={handleSwipeStart}
							variants={cardVariants}
							initial="initial"
							animate="animate"
							custom={index}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<motion.div 
								className="p-4"
								variants={contentVariants}
							>
								<div className="flex justify-between items-start mb-4">
									<div className="flex items-center">
										<div className="w-16 h-16 bg-gray-300 rounded-full mr-4 flex items-center justify-center overflow-hidden">
											{console.log('User image:', user.image)}
											{user.image ? (
												<img 
													src={user.image} 
													alt={user.name} 
													className="w-full h-full object-cover"
													onError={(e) => {
														console.log('Image failed to load, using default');
														e.target.onerror = null; 
														e.target.src = "/avatar.png";
													}}
												/>
											) : (
												<img 
													src="/avatar.png" 
													alt="Default profile" 
														className="w-full h-full object-cover" 
													onError={(e) => console.log('Default avatar failed to load')}
												/>
											)}
										</div>
										<div>
											<h2 className='text-2xl font-semibold text-gray-800'>{user.name}</h2>
											<p className='text-sm text-gray-600'>📍 {user.location || "Location not specified"}</p>
										</div>
									</div>
									<MatchScore score={user.compatibilityScore} />
								</div>

								<div className="mb-4">
									<h3 className="text-lg font-medium mb-2">Ingredients</h3>
									<div className="flex flex-wrap gap-2">
										{user.ingredientsList?.slice(0, 4).map((item, index) => (
											<span key={index} className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
												{item.ingredient} ({item.quantity})
											</span>
										))}
									</div>
								</div>

								<div className="mb-4">
									<h3 className="text-lg font-medium mb-2">Combined Macros</h3>
									<DietaryGoalBar value={user.goalCompletion?.protein || 0} icon="🥩" label="Protein" />
									<DietaryGoalBar value={user.goalCompletion?.carbs || 0} icon="🍞" label="Carbs" />
									<DietaryGoalBar value={user.goalCompletion?.fats || 0} icon="🥑" label="Fats" />
								</div>

								<div className="mb-4">
									<h3 className="text-lg font-medium mb-2">Dietary Restrictions</h3>
									<div className="flex flex-wrap gap-2">
										{Object.entries(user.dietaryRestrictions || {})
											.filter(([key, value]) => value && key !== 'allergies').length > 0 ? (
											Object.entries(user.dietaryRestrictions || {})
												.filter(([key, value]) => value && key !== 'allergies')
												.map(([key]) => (
													<span key={key} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
														{key}
													</span>
												))
										) : (
											<span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
												N/A
											</span>
										)}
									</div>
								</div>

								<div className="mb-4">
									<h3 className="text-lg font-medium mb-2">Cuisine Preferences</h3>
									<div className="flex flex-wrap gap-2">
										{user.preferences?.cuisines?.map((cuisine, index) => (
											<span key={index} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
												{cuisine}
											</span>
										))}
									</div>
								</div>

								{/* Appliances section */}
								<div>
									<h3 className="text-lg font-medium mb-2">Available Appliances</h3>
									<div className="flex flex-wrap gap-2">
										{Object.entries(user.appliances || {}).filter(([_, value]) => value).length > 0 ? (
											Object.entries(user.appliances || {})
												.filter(([_, value]) => value)
												.map(([appliance]) => (
													<span key={appliance} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
														{appliance}
													</span>
												))
										) : (
											<span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
												N/A
											</span>
										)}
									</div>
								</div>
							</motion.div>
						</motion.div>
					</TinderCard>
				))}
			</AnimatePresence>
			
			<AnimatePresence>
				{expandedUser && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full"
					>
						<ExpandedView user={expandedUser} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default SwipeArea;
