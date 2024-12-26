import { motion } from 'framer-motion';

const AnimatedSection = ({ title, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <motion.h2 
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"
      >
        {title}
      </motion.h2>
      {children}
    </motion.div>
  );
};

export default AnimatedSection;  