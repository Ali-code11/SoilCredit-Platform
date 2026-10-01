'use client';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const progressStops = [0, 0.14, 0.3, 0.46, 0.62, 0.78, 1];

export default function ScrollLeaf() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, progressStops, ['52vw', '11vw', '84vw', '16vw', '85vw', '12vw', '58vw']);
  const y = useTransform(scrollYProgress, progressStops, ['19vh', '28vh', '38vh', '48vh', '58vh', '68vh', '79vh']);
  const rotate = useTransform(scrollYProgress, progressStops, [-12, 14, -8, 16, -13, 10, -6]);
  const opacity = useTransform(scrollYProgress, [0, 0.04, 0.94, 1], [0.32, 0.24, 0.24, 0.08]);

  return (
    <motion.div
      aria-hidden="true"
      className="scroll-leaf"
      style={{
        x: reducedMotion ? '52vw' : x,
        y: reducedMotion ? '19vh' : y,
        rotate: reducedMotion ? -12 : rotate,
        opacity: reducedMotion ? 0.2 : opacity,
      }}
    >
      <svg className="scroll-leaf-mark" viewBox="0 0 32 32" fill="none">
        <path d="M26.5 5.5C17.2 5.8 9.2 8.1 6.4 14.4c-2 4.5.5 9.3 5.2 9.5 7.7.4 13.8-8.4 14.9-18.4Z" />
        <path d="M5.5 28c3.5-7.4 8.8-12.8 16.6-18.4M12.8 20.2l-1-6.4m5.3 1.6 5.4.7" />
      </svg>
    </motion.div>
  );
}