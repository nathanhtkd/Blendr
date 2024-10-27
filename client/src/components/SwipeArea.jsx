import { useState, useRef, useEffect } from 'react';
import TinderCard from "react-tinder-card";
import { useMatchStore } from "../store/useMatchStore";
import React from 'react';
import loadingGif from '../assets/loading.gif'; 
import { useAuthStore } from "../store/useAuthStore";
import ReactMarkdown from 'react-markdown';




const SwipeArea = () => {
	const { user: currentUser } = useAuthStore();
	const { userProfiles, swipeRight, swipeLeft } = useMatchStore();
	const [expandedUser, setExpandedUser] = useState(null);
	const swipeStartTime = useRef(null);
	const swipeThreshold = 300; // milliseconds
	// const [recipes, setRecipes] = useState(null);
	const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
	const [response, setResponse] = useState('');

	const handleSwipe = (dir, user) => {
		if (dir === "right") swipeRight(user);
		else if (dir === "left") swipeLeft(user);
		setExpandedUser(null); // Close expanded view on swipe
	};

	const generateRecipePrompt = (selectedUser) => {
		return `Generate 3 recipe suggestions based on the following user preferences:
		  - Ingredients available: ${selectedUser.ingredientsList?.map(i => `${i.ingredient} (${i.quantity})`).join(', ')}
		  - Dietary restrictions: ${Object.entries(selectedUser.dietaryRestrictions || {})
			.filter(([key, value]) => value && key !== 'allergies')
			.map(([key]) => key)
			.join(', ')}
		  - Preferred cuisines: ${selectedUser.preferences?.cuisines?.join(', ')}
		  Please format each recipe with a title, cuisine type, and brief description.`;
	};

	const handleCardClick = async (user) => {
		const swipeDuration = Date.now() - swipeStartTime.current;
		if (swipeDuration < swipeThreshold) {
			setExpandedUser(user);  // First set the expanded user
			setIsLoadingRecipes(true);
			try {
				const response = await fetch('http://localhost:4999/api/groq', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ messages: [{ role: 'user', content: generateRecipePrompt(user) }] }),
				});
				const data = await response.json();
				setResponse(data.response);
				console.log("Response received from API:", data.response);
			} catch (error) {
				console.error('Error calling backend:', error);
				setResponse("Failed to fetch recipes.");
			} finally {
				setIsLoadingRecipes(false);
			}
		}
	};
	  

	const handleSwipeStart = () => {
		swipeStartTime.current = Date.now();
	};

	const DietaryGoalBar = ({ value, icon, label }) => {
		return (
			<div className="flex items-center w-full mb-2">
				<span className="mr-2">{icon}</span>
				<div className="w-full bg-gray-200 rounded-full h-2.5">
					<div 
						className="bg-blue-600 h-2.5 rounded-full" 
						style={{ width: `${value}%` }}
					></div>
				</div>
				<span className="ml-2 text-sm">{value}%</span>
			</div>
		);
	};

	const ExpandedView = ({ user: selectedUser }) => {
		useEffect(() => {
			// Simulate loading delay
			const timer = setTimeout(() => {

				setIsLoadingRecipes(false);
			}, 2000); // 2 second delay to show loading state
			
			// Cleanup timer
			return () => clearTimeout(timer);
		}, []);

		const RecipeSection = () => (
			<div className="col-span-1 md:col-span-2 mt-8">
			  <h3 className="text-2xl font-medium mb-4">Suggested Recipes</h3>
			  {isLoadingRecipes ? (
				<div className="flex flex-col justify-center items-center h-64 bg-green-50 rounded-lg">
				  <img src={loadingGif} alt="Loading..." className="w-20 h-20 object-contain" />
				</div>
			  ) : (
				<div className="bg-gray-100 rounded-lg p-4">
				  <ReactMarkdown>{response}</ReactMarkdown>
				</div>
			  )}
			</div>
		  );
		  

		return (
			<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
					<div className="relative p-8 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 h-5/6 shadow-lg rounded-lg bg-white overflow-y-auto">
						<div className="flex justify-between items-center mb-6">
							<div className="flex items-center">
								<h2 className='text-4xl font-semibold text-gray-800 mr-4'>{selectedUser.name}</h2>
								<span className="text-lg font-medium text-blue-600">
									{selectedUser.compatibilityScore}/100 Match
								</span>
							</div>
							<button 
								onClick={() => {
									console.log('close clicked');
									setExpandedUser(null)
								}}
								className="text-gray-500 hover:text-gray-700 text-2xl"
								>
							×
						</button>
					</div>
					
					<div className="mb-6">
						<p className='text-xl text-gray-600'>📍 {selectedUser.location || "Location not specified"}</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Ingredients section - full width */}
						<div className="col-span-1 md:col-span-2">
							<h3 className="text-2xl font-medium mb-4">Ingredients</h3>
							<div className="flex flex-wrap gap-2">
								{selectedUser.ingredientsList?.map((item, index) => (
									<span key={index} className="px-4 py-2 rounded-full text-base bg-green-100 text-green-800">
										{item.ingredient} ({item.quantity})
									</span>
								))}
							</div>
						</div>

						{/* Combined Macros - moved up */}
						<div>
							<h3 className="text-2xl font-medium mb-4">Combined Macros</h3>
							<DietaryGoalBar value={selectedUser.goalCompletion?.protein || 0} icon="🍗" label="Protein" />
							<DietaryGoalBar value={selectedUser.goalCompletion?.carbs || 0} icon="🍞" label="Carbs" />
							<DietaryGoalBar value={selectedUser.goalCompletion?.fats || 0} icon="🧈" label="Fats" />
						</div>

						{/* Cuisine Preferences */}
						<div>
							<h3 className="text-2xl font-medium mb-4">Cuisine Preferences</h3>
							<div className="flex flex-wrap gap-2">
								{selectedUser.preferences?.cuisines?.map((cuisine, index) => (
									<span key={index} className="px-4 py-2 rounded-full text-base bg-gray-200 text-gray-800">
										{cuisine}
									</span>
								))}
							</div>
						</div>

						{/* Dietary Restrictions - moved down */}
						<div>
							<h3 className="text-2xl font-medium mb-4">Dietary Restrictions</h3>
							<div className="flex flex-wrap gap-2">
								{Object.entries(selectedUser.dietaryRestrictions || {})
									.filter(([key, value]) => value && key !== 'allergies')
											.map(([key]) => (
													<span key={key} className="px-4 py-2 rounded-full text-base bg-gray-200 text-gray-800">
														{key}
													</span>
											))}
							</div>
						</div>

						{/* Recipe section */}
						<RecipeSection />
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className='relative w-full max-w-sm h-[32rem]'>
			{userProfiles.map((user) => (
				<TinderCard
					className='absolute'
					key={user._id}
					onSwipe={(dir) => handleSwipe(dir, user)}
					onCardLeftScreen={() => setExpandedUser(null)}
					swipeRequirementType='position'
					swipeThreshold={100}
					preventSwipe={["up", "down"]}
				>
					<div 
						className='card bg-white w-80 h-[32rem] rounded-lg overflow-hidden shadow-lg overflow-y-scroll'
						onClick={() => handleCardClick(user)}
						onMouseDown={handleSwipeStart}
						onTouchStart={handleSwipeStart}
					>
						<div className="p-4">
							<div className="flex items-center mb-4">
								<div className="w-16 h-16 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
									{user.image ? (
										<img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
									) : (
										<span className="text-3xl">👤</span>
									)}
								</div>
								<div>
									<h2 className='text-2xl font-semibold text-gray-800'>{user.name}</h2>
									<p className='text-sm text-gray-600'>📍 {user.location || "Location not specified"}</p>
									<div className="mt-1 flex items-center">
										<span className="text-sm font-medium text-blue-600">
											{user.compatibilityScore}/100 Match
										</span>
									</div>
								</div>
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
								<DietaryGoalBar value={user.goalCompletion?.protein || 0} icon="🍗" label="Protein" />
								<DietaryGoalBar value={user.goalCompletion?.carbs || 0} icon="🍞" label="Carbs" />
								<DietaryGoalBar value={user.goalCompletion?.fats || 0} icon="🧈" label="Fats" />
							</div>

							<div className="mb-4">
								<h3 className="text-lg font-medium mb-2">Dietary Restrictions</h3>
								<div className="flex flex-wrap gap-2">
									{Object.entries(user.dietaryRestrictions || {})
										.filter(([key, value]) => value && key !== 'allergies')
										.map(([key]) => (
											<span key={key} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
												{key}
											</span>
										))}
								</div>
							</div>

							<div>
								<h3 className="text-lg font-medium mb-2">Cuisine Preferences</h3>
								<div className="flex flex-wrap gap-2">
									{user.preferences?.cuisines?.slice(0, 2).map((cuisine, index) => (
										<span key={index} className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
											{cuisine}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>
				</TinderCard>
			))}
			{expandedUser && <ExpandedView user={expandedUser} />}
		</div>
	);
};

export default SwipeArea;
