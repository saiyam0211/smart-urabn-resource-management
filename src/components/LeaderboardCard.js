import { motion } from 'framer-motion';

const LeaderboardCard = ({ rank, name, score, isCurrentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg mb-2 flex items-center justify-between ${
        isCurrentUser ? 'bg-emerald-50 border-2 border-emerald-500' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className={`text-2xl font-bold ${
          rank <= 3 ? 'text-emerald-500' : 'text-gray-400'
        }`}>
          #{rank}
        </span>
        <span className="font-semibold text-gray-700">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-emerald-600">{score}</span>
        <span className="text-sm text-gray-500">points</span>
      </div>
    </motion.div>
  );
};