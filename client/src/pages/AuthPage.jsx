import { useState } from "react";

import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";

const AuthPage = () => {
	const [isLogin, setIsLogin] = useState(true);

	return (
		<div
    	className='min-h-screen flex items-center justify-center bg-[#d1e6d9] p-4'
		>
			<div className='w-full max-w-md'>
				<h2 className='text-center text-3xl font-extrabold text-[#2f3331] mb-2'>
					{isLogin ? "Sign in to Blendr" : "Create a Blendr account"}
				</h2>
				<p className='text-center text-sm text-gray-600 mb-8'>
				Taste together in one perfect blend!
				</p>

				<div className='bg-white shadow-xl rounded-lg p-8'>
					{isLogin ? <LoginForm /> : <SignUpForm />}

					<div className='mt-8 text-center'>
						<p className='text-sm text-gray-600'>
							{isLogin ? "New to Blendr?" : "Already have an account?"}
						</p>

						<button
							onClick={() => setIsLogin((prevIsLogin) => !prevIsLogin)}
							className='mt-2 text-[#f0c1b4] hover:text-[#e0b1a5] font-medium transition-colors duration-300'
						>
							{isLogin ? "Create a new account" : "Sign in to your account"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
export default AuthPage;
