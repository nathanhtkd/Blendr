import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";

const LoginForm = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { login, loading } = useAuthStore();

	const formVariants = {
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
		hidden: { opacity: 0, x: -20 },
		visible: {
			opacity: 1,
			x: 0,
			transition: { duration: 0.3 }
		}
	};

	return (
		<motion.form
			className="space-y-6"
			variants={formVariants}
			initial="hidden"
			animate="visible"
			onSubmit={(e) => {
				e.preventDefault();
				login({ email, password });
			}}
		>
			<motion.div variants={itemVariants}>
				<label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
					<Mail size={16} className="mr-2 text-emerald-600" />
					Email address
				</label>
				<div className="mt-1">
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="appearance-none block w-full px-4 py-3 border border-gray-200 
							rounded-lg shadow-sm placeholder-gray-400 
							focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
							transition-colors duration-200"
						placeholder="you@example.com"
					/>
				</div>
			</motion.div>

			<motion.div variants={itemVariants}>
				<label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700 mb-1">
					<Lock size={16} className="mr-2 text-emerald-600" />
					Password
				</label>
				<div className="mt-1">
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="appearance-none block w-full px-4 py-3 border border-gray-200 
							rounded-lg shadow-sm placeholder-gray-400 
							focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
							transition-colors duration-200"
						placeholder="Enter your password"
					/>
				</div>
			</motion.div>

			<motion.button
				type="submit"
				disabled={loading}
				className={`w-full flex justify-center items-center gap-2 py-3 px-4 
					border border-transparent rounded-lg shadow-md text-sm font-medium 
					text-white transition-all duration-200 ${
						loading
							? "bg-emerald-400 cursor-not-allowed"
							: "bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
					}`}
				variants={itemVariants}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
			>
				{loading ? (
					<>
						<Loader2 size={20} className="animate-spin" />
						<span>Signing in...</span>
					</>
				) : (
					<span>Sign in</span>
				)}
			</motion.button>
		</motion.form>
	);
};

export default LoginForm;
