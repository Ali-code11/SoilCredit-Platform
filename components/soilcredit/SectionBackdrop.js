'use client';
import { motion, useReducedMotion } from 'framer-motion';

export default function SectionBackdrop({ Icon, className = '' }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reducedMotion ? 0 : 1.1, ease: 'easeOut' }}
      className={`section-backdrop ${className}`}
    >
      <Icon strokeWidth={0.7} />
    </motion.div>
  );
}