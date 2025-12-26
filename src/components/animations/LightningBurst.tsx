'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

export function LightningBurst({ isActivated, tierColor = 'yellow' }) {
  // Variants for animation
  const variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, type: 'spring' } },
    burst: { scale: [1, 1.2, 1], opacity: [1, 0.8, 1], transition: { duration: 0.3, repeat: 2 } },
  };

  const lightningVariants = {
    flash: { strokeWidth: [1, 3, 1], opacity: [0, 1, 0], transition: { duration: 0.2, delay: 0.5, repeat: Infinity, repeatDelay: 1 } },
  };

  useEffect(() => {
    if (isActivated) {
      // Trigger burst on activation
    }
  }, [isActivated]);

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
      initial="hidden"
      animate={isActivated ? "burst" : "hidden"}
      variants={variants}
    >
      {/* Football */}
      <motion.div className="w-32 h-32 bg-orange-600 rounded-full flex items-center justify-center">
        <motion.svg 
          width="100" 
          height="100" 
          viewBox="0 0 100 100"
          animate={isActivated ? "flash" : "hidden"}
          variants={lightningVariants}
        >
          {/* Lightning bolt SVG path — customize in Adobe Illustrator and paste */}
          <path d="M 10 90 L 50 10 L 50 50 L 90 10" stroke={tierColor} strokeWidth="2" fill="none" />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}