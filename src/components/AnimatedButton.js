// src/components/AnimatedButton.js
import { motion } from 'framer-motion';

const AnimatedButton = ({ children, onClick, className = '' }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`
                bg-green-950 text-green-400 border border-green-400 border-b-4 
                font-medium overflow-hidden relative px-4 py-2 rounded-md 
                hover:brightness-150 hover:border-t-4 hover:border-b 
                active:opacity-75 outline-none duration-300 group
                ${className}
            `}
        >
            <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            {children}
        </motion.button>
    );
};

export default AnimatedButton;