import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Refrigerator, User, LogOut, Menu, UtensilsCrossed, Heart } from "lucide-react";

export const Header = () => {
	const { authUser, logout } = useAuthStore();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<header className='bg-[#b3d2b9] shadow-lg'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center py-4'>
					<div className='flex items-center'>
						<Link to='/' className='flex items-center space-x-2'>
							<UtensilsCrossed className='w-8 h-8 text-white' />
							<span className='text-2xl font-bold text-white hidden sm:inline'>Blendr</span>
						</Link>
					</div>

					<div className='hidden md:flex items-center space-x-4'>
						{authUser ? (
							<div className='relative' ref={dropdownRef}>
								<button
									onClick={() => setDropdownOpen(!dropdownOpen)}
									className='flex items-center space-x-2 focus:outline-none'
								>
									<img
										src={authUser.image || "/avatar.png"}
										className='h-8 w-8 object-cover rounded-full border-2 border-white'
										alt='User image'
									/>
									<span className='text-white font-medium'>{authUser.name}</span>
								</button>
								{dropdownOpen && (
									<div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10'>
										<Link
											to='/profile'
											className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
											onClick={() => setDropdownOpen(false)}
										>
											<User className='mr-2' size={16} />
											Profile
										</Link>
										<Link
											to='/favorites'
											className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
											onClick={() => setDropdownOpen(false)}
										>
											<Heart className='mr-2' size={16} />
											Favorites
										</Link>
										<Link
											to='/fridge'
											className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
											onClick={() => setDropdownOpen(false)}
										>
											<Refrigerator className='mr-2' size={16} />
											My Fridge
										</Link>
										<button
											onClick={logout}
											className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
										>
											<LogOut className='mr-2' size={16} />
											Logout
										</button>
									</div>
								)}
							</div>
						) : (
							<>
								<Link
									to='/auth'
									className='text-white hover:text-pink-200 transition duration-150 ease-in-out'
								>
									Login
								</Link>
								<Link
									to='/auth'
									className='bg-white text-pink-600 px-4 py-2 rounded-full font-medium hover:bg-pink-100 transition duration-150 ease-in-out'
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					<div className='md:hidden'>
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className='text-white focus:outline-none'
						>
							<Menu className='size-6' />
						</button>
					</div>
				</div>
			</div>

			{/* MOBILE MENU */}
			{mobileMenuOpen && (
				<div className='md:hidden bg-[#abcab3]'>
					<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
						{authUser ? (
							<>
								<Link
									to='/profile'
									className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a3bfa9]'
									onClick={() => setMobileMenuOpen(false)}
								>
									<div className='flex items-center'>
										<User className='mr-2' size={16} />
										Profile
									</div>
								</Link>
								<Link
									to='/favorites'
									className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a3bfa9]'
									onClick={() => setMobileMenuOpen(false)}
								>
									<div className='flex items-center'>
										<Heart className='mr-2' size={16} />
										Favorites
									</div>
								</Link>
								<Link
									to='/fridge'
									className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a3bfa9]'
									onClick={() => setMobileMenuOpen(false)}
								>
									<div className='flex items-center'>
										<Refrigerator className='mr-2' size={16} />
										My Fridge
									</div>
								</Link>
								<button
									onClick={() => {
										logout();
										setMobileMenuOpen(false);
									}}
									className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a3bfa9]'
								>
									<div className='flex items-center'>
										<LogOut className='mr-2' size={16} />
										Logout
									</div>
								</button>
							</>
						) : (
							<>
								<Link
									to='/auth'
									className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#9fc3a6]'
									onClick={() => setMobileMenuOpen(false)}
								>
									Login
								</Link>
								<Link
									to='/auth'
									className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#9fc3a6]'
									onClick={() => setMobileMenuOpen(false)}
								>
									Sign Up
								</Link>
							</>
							)}
					</div>
				</div>
			)}
		</header>
	);
};
