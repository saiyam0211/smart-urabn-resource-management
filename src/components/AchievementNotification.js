// src/components/AchievementNotification.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const AchievementNotification = ({ achievement, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed bottom-4 right-4 bg-green-100 border border-green-500 rounded-lg p-4 shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-green-500 rounded-full p-2">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-green-800">Achievement Unlocked!</h3>
            <p className="text-green-700">{achievement.title}</p>
            <p className="text-sm text-green-600">
              +{achievement.points} points
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementNotification;
