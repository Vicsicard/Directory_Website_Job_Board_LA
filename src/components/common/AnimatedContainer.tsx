import React, { forwardRef } from 'react';
import { motion, Variants } from 'framer-motion';

export interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  variants: Variants;
  delay?: number;
}

const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ children, className = '', variants, delay = 0 }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.3, delay }}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedContainer.displayName = 'AnimatedContainer';

export default AnimatedContainer;
