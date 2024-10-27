import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const SignUpForm = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [dietaryRestrictions, setDietaryRestrictions] = useState({
		vegetarian: false,
		vegan: false,
		kosher: false,
		glutenFree: false,
		dairyFree: false,
	});
	const [allergies, setAllergies] = useState("");
	const [availableAppliances, setAvailableAppliances] = useState({
		airFryer: false,
		microwave: false,
		oven: false,
		stoveTop: false,
		sousVide: false,
		deepFryer: false,
		blender: false,
		instantPot: false,
	});
	const [cuisinePreferences, setCuisinePreferences] = useState({
		American: false,
		Chinese: false,
		Indian: false,
		Italian: false,
		Mexican: false,
		Korean: false,
		Japanese: false,
		Persian: false,
		Jamaican: false,
	});
	const [dietaryGoals, setDietaryGoals] = useState({
		protein: 0,
		carbs: 0,
		fats: 0
	});
	const [location, setLocation] = useState("");

	const { signup, loading } = useAuthStore();

	const handleSubmit = (e) => {
		e.preventDefault();
		signup({
			name,
			email,
			password,
			location,
			preferences: { 
				cuisines: Object.keys(cuisinePreferences).filter(cuisine => cuisinePreferences[cuisine]) 
			},
			dietaryRestrictions: { ...dietaryRestrictions, allergies: allergies.split(',').map(a => a.trim()) },
			availableAppliances,
			dietaryGoals,
		});
	};

	const handleDietaryGoalChange = (goal, value) => {
		const numValue = parseInt(value);
		if (!isNaN(numValue) && numValue >= 0 && numValue <= 300) {
			setDietaryGoals(prev => ({ ...prev, [goal]: numValue }));
		}
	};

	return (
		<form className='space-y-6' onSubmit={handleSubmit}>
			{/* NAME */}
			<div>
				<label htmlFor='name' className='block text-sm font-medium text-gray-700'>
					Name
				</label>
				<div className='mt-1'>
					<input
						id='name'
						name='name'
						type='text'
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm'
					/>
				</div>
			</div>

			{/* EMAIL */}
			<div>
				<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
					Email address
				</label>
				<div className='mt-1'>
					<input
						id='email'
						name='email'
						type='email'
						autoComplete='email'
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm'
					/>
				</div>
			</div>

			{/* PASSWORD */}
			<div>
				<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
					Password
				</label>
				<div className='mt-1'>
					<input
						id='password'
						name='password'
						type='password'
						autoComplete='new-password'
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm'
					/>
				</div>
			</div>

			{/* CUISINE PREFERENCES */}
			<div>
				<label className="block text-sm font-medium text-gray-700">Cuisine Preferences</label>
				<div className="mt-2 space-y-2">
					{Object.keys(cuisinePreferences).map((cuisine) => (
						<div key={cuisine} className="flex items-center">
							<input
								id={`cuisine-${cuisine}`}
								name={`cuisine-${cuisine}`}
								type="checkbox"
								checked={cuisinePreferences[cuisine]}
								onChange={(e) => setCuisinePreferences({ ...cuisinePreferences, [cuisine]: e.target.checked })}
								className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
							/>
							<label htmlFor={`cuisine-${cuisine}`} className="ml-2 block text-sm text-gray-900">
								{cuisine}
							</label>
						</div>
					))}
				</div>
			</div>

			{/* DIETARY RESTRICTIONS */}
			<div>
				<label className="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
				<div className="mt-2 space-y-2">
					{Object.keys(dietaryRestrictions).map((restriction) => (
						<div key={restriction} className="flex items-center">
							<input
								id={restriction}
								name={restriction}
								type="checkbox"
								checked={dietaryRestrictions[restriction]}
								onChange={(e) => setDietaryRestrictions({ ...dietaryRestrictions, [restriction]: e.target.checked })}
								className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
							/>
							<label htmlFor={restriction} className="ml-2 block text-sm text-gray-900">
								{restriction.charAt(0).toUpperCase() + restriction.slice(1)}
							</label>
						</div>
					))}
				</div>
			</div>

			{/* ALLERGIES */}
			<div>
				<label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
					Allergies (comma-separated)
				</label>
				<input
					id="allergies"
					name="allergies"
					type="text"
					value={allergies}
					onChange={(e) => setAllergies(e.target.value)}
					className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
				/>
			</div>

			{/* AVAILABLE APPLIANCES */}
			<div>
				<label className="block text-sm font-medium text-gray-700">Available Appliances</label>
				<div className="mt-2 space-y-2">
					{Object.keys(availableAppliances).map((appliance) => (
						<div key={appliance} className="flex items-center">
							<input
								id={appliance}
								name={appliance}
								type="checkbox"
								checked={availableAppliances[appliance]}
								onChange={(e) => setAvailableAppliances({ ...availableAppliances, [appliance]: e.target.checked })}
								className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
							/>
							<label htmlFor={appliance} className="ml-2 block text-sm text-gray-900">
								{/* Replace with space-separated words and proper capitalization */}
								{appliance.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => 
									word.charAt(0).toUpperCase() + word.slice(1)
								).join(' ')}
							</label>
						</div>
					))}
				</div>
			</div>

			{/* DIETARY GOALS */}
			<div className="py-4 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
				<label className="block text-sm font-medium text-gray-700">Dietary Goals</label>
				{Object.entries(dietaryGoals).map(([goal, value]) => (
					<div key={goal} className="flex flex-col space-y-2">
						<div className="flex justify-between items-center">
							<label htmlFor={goal} className="block text-sm font-medium text-gray-700">
								{goal.charAt(0).toUpperCase() + goal.slice(1)}
							</label>
							<div className="flex items-center">
								<input
									type="number"
									id={`${goal}-input`}
									name={`${goal}-input`}
									min="0"
									max="300"
									value={value}
									onChange={(e) => handleDietaryGoalChange(goal, e.target.value)}
									className="w-16 text-right rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
								/>
								<span className="ml-1 text-sm text-gray-500">g</span>
							</div>
						</div>
						<input
							type="range"
							id={`${goal}-slider`}
							name={`${goal}-slider`}
							min="0"
							max="200"
							value={value}
							onChange={(e) => handleDietaryGoalChange(goal, e.target.value)}
							className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
						/>
					</div>
				))}
			</div>

			{/* LOCATION */}
			<div>
				<label htmlFor='location' className='block text-sm font-medium text-gray-700'>
					Location (City, State)
				</label>
				<div className='mt-1'>
					<input
						id='location'
						name='location'
						type='text'
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm'
					/>
				</div>
			</div>

			<div>
				<button
					type='submit'
					className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
						loading
							? "bg-pink-400 cursor-not-allowed"
							: "bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
					}`}
					disabled={loading}
				>
					{loading ? "Signing up..." : "Sign up"}
				</button>
			</div>
		</form>
	);
};

export default SignUpForm;
