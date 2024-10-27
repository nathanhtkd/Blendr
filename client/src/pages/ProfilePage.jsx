import { useRef, useState } from "react";
import { Header } from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";

const ProfilePage = () => {
	const { authUser } = useAuthStore();
	const [name, setName] = useState(authUser?.name || "");
	const [bio, setBio] = useState(authUser?.bio || "");
	const [image, setImage] = useState(authUser?.image || null);

	// Preferences state
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

	// New state for dietary goals in grams
	const [dietaryGoals, setDietaryGoals] = useState({
		protein: authUser?.dietaryGoals?.protein || 0,
		carbs: authUser?.dietaryGoals?.carbs || 0,
		fats: authUser?.dietaryGoals?.fats || 0,
	});

	const [location, setLocation] = useState(authUser?.location || "");

	const fileInputRef = useRef(null);
	const { loading, updateProfile } = useUserStore();

	const handleSubmit = (e) => {
		e.preventDefault();
		updateProfile({
			name,
			bio,
			image,
			location,  // Add this line
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

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col'>
			<Header />
			<div className='flex-grow flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8'>
				<div className='sm:mx-auto sm:w-full sm:max-w-md'>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Your Profile</h2>
				</div>

				<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
					<div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200'>
						<form onSubmit={handleSubmit} className='space-y-6'>
							{/* Name field */}
							<div>
								<label htmlFor='name' className='block text-sm font-medium text-gray-700'>Name</label>
								<input
									type="text"
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm'
								/>
							</div>

							{/* Location field */}
							<div>
								<label htmlFor='location' className='block text-sm font-medium text-gray-700'>Location</label>
								<input
									type="text"
									id="location"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm'
								/>
							</div>

							{/* Bio field */}
							<div>
								<label htmlFor='bio' className='block text-sm font-medium text-gray-700'>Bio</label>
								<textarea
									id="bio"
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									rows={3}
									className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm'
								/>
							</div>

							{/* Image upload */}
							<div>
								<label className='block text-sm font-medium text-gray-700'>Profile Image</label>
								<div className='mt-1 flex items-center'>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
									>
										Upload Image
									</button>
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleImageChange}
										className='hidden'
										accept='image/*'
									/>
								</div>
								{image && (
									<div className='mt-2'>
										<img src={image} alt="Preview" className='w-32 h-32 object-cover rounded-lg' />
									</div>
								)}
							</div>

							{/* Cuisines */}
							<div>
								<label className='block text-sm font-medium text-gray-700'>Preferred Cuisines</label>
								<div className='mt-2 grid grid-cols-2 gap-2'>
									{["American", "Chinese", "Indian", "Italian", "Mexican", "Korean", "Japanese", "Persian", "Jamaican"].map((cuisine) => (
										<label key={cuisine} className='inline-flex items-center'>
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
												className='rounded border-gray-300 text-pink-600 focus:ring-pink-500'
											/>
											<span className='ml-2 text-sm text-gray-700'>{cuisine}</span>
										</label>
									))}
								</div>
							</div>

							{/* Dietary Restrictions */}
							<div>
								<label className='block text-sm font-medium text-gray-700'>Dietary Restrictions</label>
								<div className='mt-2 grid grid-cols-2 gap-2'>
									{Object.keys(dietaryRestrictions).filter(key => key !== 'allergies').map((restriction) => (
										<label key={restriction} className='inline-flex items-center'>
											<input
												type="checkbox"
												checked={dietaryRestrictions[restriction]}
												onChange={(e) => {
													setDietaryRestrictions({
														...dietaryRestrictions,
														[restriction]: e.target.checked
													});
												}}
												className='rounded border-gray-300 text-pink-600 focus:ring-pink-500'
											/>
											<span className='ml-2 text-sm text-gray-700'>
												{restriction.replace(/([A-Z])/g, ' $1').trim()}
											</span>
										</label>
									))}
								</div>
								<div className='mt-2'>
									<label className='block text-sm font-medium text-gray-700'>Allergies (comma-separated)</label>
									<input
										type="text"
										value={allergies}
										onChange={(e) => setAllergies(e.target.value)}
										className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm'
									/>
								</div>
							</div>

							{/* Appliances */}
							<div>
								<label className='block text-sm font-medium text-gray-700'>Available Appliances</label>
								<div className='mt-2 grid grid-cols-2 gap-2'>
									{Object.keys(appliances).map((appliance) => (
										<label key={appliance} className='inline-flex items-center'>
											<input
												type="checkbox"
												checked={appliances[appliance]}
												onChange={(e) => {
													setAppliances({
														...appliances,
														[appliance]: e.target.checked
													});
												}}
												className='rounded border-gray-300 text-pink-600 focus:ring-pink-500'
											/>
											<span className='ml-2 text-sm text-gray-700'>
												{appliance.replace(/([A-Z])/g, ' $1').trim()}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* Dietary Goals Section */}
							<div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
								<h3 className="text-lg font-medium text-gray-900">Dietary Goals</h3>
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
													max="200"
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
											max="100" // Adjusted max value
											value={value}
											onChange={(e) => handleDietaryGoalChange(goal, e.target.value)}
											className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
										/>
									</div>
								))}
							</div>

							<button
								type="submit"
								disabled={loading}
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'
							>
								{loading ? 'Saving...' : 'Save Changes'}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
