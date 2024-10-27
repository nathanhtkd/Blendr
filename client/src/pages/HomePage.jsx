import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Header } from "../components/Header";
import { useMatchStore } from "../store/useMatchStore";
import { Frown } from "lucide-react";

import SwipeArea from "../components/SwipeArea";
import SwipeFeedback from "../components/SwipeFeedback";
import { useAuthStore } from "../store/useAuthStore";

const HomePage = () => {
	const { isLoadingUserProfiles, getUserProfiles, userProfiles, subscribeToNewMatches, unsubscribeFromNewMatches } =
		useMatchStore();

	const { authUser } = useAuthStore();

	useEffect(() => {
		getUserProfiles();
	}, [getUserProfiles]);

	useEffect(() => {
		authUser && subscribeToNewMatches();

		return () => {
			unsubscribeFromNewMatches();
		};
	}, [subscribeToNewMatches, unsubscribeFromNewMatches, authUser]);

	return (
		<div
			className='flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-green-50 to-green-50
		 overflow-hidden
		'
		>
			<Sidebar />
			<div className='flex-grow flex flex-col overflow-hidden'>
				<Header />
				<main className='flex-grow flex flex-col gap-10 items-center justify-center p-4 relative overflow-hidden mx-auto w-full'>
					{userProfiles.length > 0 && !isLoadingUserProfiles && (
						<>
							<SwipeArea />
							<SwipeFeedback />
						</>
					)}

					{userProfiles.length === 0 && !isLoadingUserProfiles && <NoMoreProfiles />}

					{isLoadingUserProfiles && <LoadingUI />}
				</main>
			</div>
		</div>
	);
};
export default HomePage;

const NoMoreProfiles = () => (
	<div className='flex flex-col items-center justify-center h-full text-center p-8'>
		<Frown className='text-pink-200 mb-6' size={80} /> {/* this changed the frown color */	}
		<h2 className='text-3xl font-bold text-gray-800 mb-4'>Hunger for more?</h2>
		<p className='text-xl text-gray-600 mb-6'>Maybe it&apos;s time to try new things. Be adventurous!</p>
	</div>
);

const LoadingUI = () => {
	return (
		<div className='relative w-full max-w-sm h-[32rem]'>
			<div className='card bg-white w-80 h-[32rem] rounded-2xl overflow-hidden border border-gray-200 shadow-lg p-6 space-y-6'>
				{/* Profile Header */}
				<div className='flex items-center gap-4'>
					<div className='w-20 h-20 bg-gray-200 rounded-full animate-pulse' />
					<div className='space-y-2'>
						<div className='h-6 bg-gray-200 rounded w-32 animate-pulse' />
						<div className='h-4 bg-gray-200 rounded w-24 animate-pulse' />
					</div>
				</div>
  
				{/* Ingredients Section */}
				<div className='space-y-3'>
					<div className='h-6 bg-gray-200 rounded w-32 animate-pulse' />
					<div className='flex flex-wrap gap-2'>
						<div className='h-8 bg-gray-200 rounded-full w-24 animate-pulse' />
						<div className='h-8 bg-gray-200 rounded-full w-32 animate-pulse' />
						<div className='h-8 bg-gray-200 rounded-full w-28 animate-pulse' />
					</div>
				</div>
  
				{/* Macros Section */}
				<div className='space-y-3'>
					<div className='h-6 bg-gray-200 rounded w-40 animate-pulse' />
					<div className='space-y-2'>
						<div className='h-4 bg-gray-200 rounded w-full animate-pulse' />
						<div className='h-4 bg-gray-200 rounded w-full animate-pulse' />
						<div className='h-4 bg-gray-200 rounded w-full animate-pulse' />
					</div>
				</div>
  
				{/* Dietary Restrictions */}
				<div className='space-y-3'>
					<div className='h-6 bg-gray-200 rounded w-36 animate-pulse' />
					<div className='flex flex-wrap gap-2'>
						<div className='h-8 bg-gray-200 rounded-full w-24 animate-pulse' />
						<div className='h-8 bg-gray-200 rounded-full w-24 animate-pulse' />
						<div className='h-8 bg-gray-200 rounded-full w-24 animate-pulse' />
					</div>
				</div>
  
				{/* Cuisine Preferences */}
				<div className='space-y-3'>
					<div className='h-6 bg-gray-200 rounded w-40 animate-pulse' />
					<div className='flex flex-wrap gap-2'>
						<div className='h-8 bg-gray-200 rounded-full w-24 animate-pulse' />
						<div className='h-8 bg-gray-200 rounded-full w-28 animate-pulse' />
					</div>
				</div>
			</div>
		</div>
	);
};
