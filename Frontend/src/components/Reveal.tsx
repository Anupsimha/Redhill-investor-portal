import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical travel distance in px */
  y?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}

/**
 * Restrained scroll reveal (fade + gentle rise) driven by IntersectionObserver
 * via motion's whileInView. Runs once, never scroll-jacks, and is disabled
 * entirely for users who prefer reduced motion.
 */
export default function Reveal({ children, className = '', delay = 0, y = 24, as = 'div' }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

