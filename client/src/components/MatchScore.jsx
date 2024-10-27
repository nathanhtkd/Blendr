import React from 'react';
import { motion } from 'framer-motion';

const MatchScore = ({ score }) => {
  // Determine color based on match percentage
  const getScoreColor = () => {
    if (score < 33) return 'bg-red-500';
    if (score < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const waveVariants = {
    animate: {
      y: [0, -2, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const liquidWaveVariants = {
    animate: {
      d: [
        "M 0 50 Q 30 45, 60 50 Q 90 55, 120 50 L 120 120 L 0 120 Z",
        "M 0 50 Q 30 55, 60 50 Q 90 45, 120 50 L 120 120 L 0 120 Z"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const scoreVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }
    }
  };

  return (
    <div className="relative flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2 shadow-sm">
      <div className="relative w-12 h-12 rounded-full border-4 border-blue-100 flex items-center justify-center overflow-hidden">
        <motion.div
          className={`absolute w-full ${getScoreColor()} opacity-80`}
          initial="initial"
          animate="animate"
          style={{ 
            bottom: 0, 
            height: `${score}%`,
          }}
        />
        <motion.div 
          className="relative z-10"
          variants={scoreVariants}
          initial="initial"
          animate="animate"
        >
          <span className="text-lg font-bold text-blue-900">
            {score}
          </span>
        </motion.div>
      </div>
      <motion.div 
        className="flex flex-col"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <span className="text-sm font-medium text-blue-400">Match Score</span>
        <span className="text-xs text-blue-300">/100</span>
      </motion.div>
    </div>
  );
};

export default MatchScore;
