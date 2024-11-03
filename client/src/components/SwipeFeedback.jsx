import { useMatchStore } from "../store/useMatchStore";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Sparkles } from "lucide-react";

const getFeedbackConfig = (swipeFeedback) => {
	const configs = {
		liked: {
			icon: Heart,
			text: "Liked!",
			className: "text-green-500 bg-green-50",
			iconClassName: "fill-green-500"
		},
		passed: {
			icon: X,
			text: "Passed",
			className: "text-red-500 bg-red-50",
			iconClassName: ""
		},
		matched: {
			icon: Sparkles,
			text: "It's a Match!",
			className: "text-pink-500 bg-pink-50",
			iconClassName: "fill-pink-500"
		}
	};
	
	return configs[swipeFeedback] || { icon: null, text: "", className: "", iconClassName: "" };
};

const SwipeFeedback = () => {
	const { swipeFeedback } = useMatchStore();
	const config = getFeedbackConfig(swipeFeedback);

	return (
		<AnimatePresence>
			{swipeFeedback && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ 
						type: "spring",
						stiffness: 500,
						damping: 30
					}}
					className={`
						absolute top-10 left-1/2 transform -translate-x-1/2
						px-6 py-3 rounded-full shadow-lg
						flex items-center gap-2
						${config.className}
						backdrop-blur-sm bg-opacity-90
						border border-opacity-20
					`}
				>
					{config.icon && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ 
								type: "spring",
								stiffness: 500,
								delay: 0.1
							}}
						>
							<config.icon 
								className={`w-6 h-6 ${config.iconClassName}`}
								strokeWidth={2.5}
							/>
						</motion.div>
					)}
					<motion.span 
						className="text-xl font-bold"
						initial={{ x: 10, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						{config.text}
					</motion.span>
					
					{/* Particle effects for match */}
					{swipeFeedback === "matched" && (
						<motion.div 
							className="absolute inset-0 -z-10"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							{[...Array(12)].map((_, i) => (
								<motion.div
									key={i}
									className="absolute w-1 h-1 bg-pink-500 rounded-full"
									initial={{ 
										x: "50%",
										y: "50%",
										scale: 0
									}}
									animate={{ 
										x: `${50 + (Math.random() - 0.5) * 100}%`,
										y: `${50 + (Math.random() - 0.5) * 100}%`,
										scale: Math.random() * 2,
										opacity: 0
									}}
									transition={{
										duration: 0.8,
										delay: i * 0.02,
										ease: "easeOut"
									}}
								/>
							))}
						</motion.div>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default SwipeFeedback;
