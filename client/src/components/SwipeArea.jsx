import TinderCard from "react-tinder-card";
import { useMatchStore } from "../store/useMatchStore";

const SwipeArea = () => {
	const { userProfiles, swipeRight, swipeLeft } = useMatchStore();

	const handleSwipe = (dir, user) => {
		if (dir === "right") swipeRight(user);
		else if (dir === "left") swipeLeft(user);
	};

	const DietaryGoalBar = ({ value, icon, label }) => (
		<div className="flex items-center w-full mb-2">
			<span className="mr-2">{icon}</span>
			<div className="w-full bg-gray-200 rounded-full h-2.5">
				<div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
			</div>
			<span className="ml-2 text-sm">{value}%</span>
		</div>
	);

	return (
		<div className='relative w-full max-w-sm h-[28rem]'>
			{userProfiles.map((user) => (
				<TinderCard
					className='absolute'
					key={user._id}
					onSwipe={(dir) => handleSwipe(dir, user)}
					swipeRequirementType='position'
					swipeThreshold={100}
					preventSwipe={["up", "down"]}
				>
					<div className='card bg-white w-80 h-[28rem] rounded-lg overflow-hidden shadow-lg'>
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
								</div>
							</div>

							<div className="mb-4">
								<h3 className="text-lg font-medium mb-2">Top Ingredients</h3>
								<div className="flex flex-wrap gap-2">
									{user.topIngredients?.slice(0, 4).map((ingredient, index) => (
										<span key={index} className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
											{ingredient}
										</span>
									))}
								</div>
							</div>

							<div className="mb-4">
								<h3 className="text-lg font-medium mb-2">Dietary Goals</h3>
								<DietaryGoalBar value={user.dietaryGoals?.protein || 0} icon="🍗" label="Protein" />
								<DietaryGoalBar value={user.dietaryGoals?.carbs || 0} icon="🍞" label="Carbs" />
								<DietaryGoalBar value={user.dietaryGoals?.fats || 0} icon="🧈" label="Fats" />
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
		</div>
	);
};

export default SwipeArea;
