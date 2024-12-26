// src/components/Leaderboard.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LeaderboardCard = ({ user, rank, isCurrentUser }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`relative overflow-hidden ${
            isCurrentUser 
                ? 'bg-emerald-50 border-2 border-emerald-500' 
                : 'bg-white hover:bg-gray-50'
        } rounded-xl p-4 transition-all duration-300 transform hover:scale-[1.02] shadow-md`}
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`
                    ${rank <= 3 ? 'bg-emerald-500' : 'bg-gray-200'} 
                    w-8 h-8 rounded-full flex items-center justify-center
                    text-white font-bold
                `}>
                    {rank}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-500">
                        {user.contributions !== undefined
                            ? `${user.contributions} reports` 
                            : `${user.points} points`}
                    </p>
                </div>
            </div>
            {rank <= 3 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                >
                    {rank === 1 ? '🏆' : rank === 2 ? '🥈' : '🥉'}
                </motion.div>
            )}
        </div>
    </motion.div>
);

const Leaderboard = ({ data = { users: [], volunteers: [] } }) => {
    const [activeTab, setActiveTab] = useState('users');
    const userId = localStorage.getItem('userId');

    const tabVariants = {
        active: {
            backgroundColor: '#10B981',
            color: 'white',
            scale: 1.05
        },
        inactive: {
            backgroundColor: '#F3F4F6',
            color: '#374151',
            scale: 1
        }
    };

    // Get the current data array based on active tab with fallback
    const currentData = activeTab === 'users' ? data.users || [] : data.volunteers || [];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex gap-4 mb-6">
                <motion.button
                    variants={tabVariants}
                    animate={activeTab === 'users' ? 'active' : 'inactive'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('users')}
                    className="px-6 py-2 rounded-full font-semibold transition-colors duration-300"
                >
                    Top Contributors
                </motion.button>
                <motion.button
                    variants={tabVariants}
                    animate={activeTab === 'volunteers' ? 'active' : 'inactive'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('volunteers')}
                    className="px-6 py-2 rounded-full font-semibold transition-colors duration-300"
                >
                    Top Volunteers
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                >
                    {currentData.length > 0 ? (
                        currentData.map((user, index) => (
                            <LeaderboardCard
                                key={user._id || index}
                                user={user}
                                rank={index + 1}
                                isCurrentUser={user._id === userId}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 text-gray-500"
                        >
                            No data available
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Leaderboard;