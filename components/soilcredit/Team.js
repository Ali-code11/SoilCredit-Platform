'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Instagram, Facebook, ArrowUpRight, X, Users } from 'lucide-react';

// Replace these values with the final team profiles and local image paths when available.
const TEAM_MEMBERS = [
  {
    name: 'Nazrin Abdullayeva',
    role: 'Founder',
    specialization: 'Sustainable Innovation & Platform Strategy',
    bio: 'Leads SoilCredit\'s mission to make sustainable land management accessible, measurable, and valuable.',
    image: '/team/nazrin.jpeg',
    linkedin: 'https://www.linkedin.com/in/nazrin-abdullayeva-2b01a1334/',
  },
  {
    name: 'Ali Farzalisoy',
    role: 'Co-Founder',
    specialization: 'Business Development & Climate Markets',
    bio: 'Helps shape SoilCredit\'s partnerships and connects regenerative land projects with new opportunities.',
    image: '/team/ali.jpeg',
    linkedin: 'https://www.linkedin.com/in/ali-farzalisoy',
    github: 'https://github.com/Ali-code11',
  },
  {
    name: 'Aysel Baghirova',
    role: 'Full Stack Developer',
    specialization: 'Web Applications & Platform Engineering',
    bio: 'Builds reliable, intuitive product experiences across SoilCredit\'s frontend and backend systems.',
    image: '/team/aysel.jpeg',
    linkedin: 'https://www.linkedin.com/in/aysel-baghirova-0071a8295/',
    github: 'https://github.com/ayselbaghirova',
  },
  {
    name: 'Samangul Seyidzada',
    role: 'UIX Designer',
    specialization: 'Product Design & User Experience',
    bio: 'Creates clear and thoughtful interfaces that make complex climate and land data easier to understand.',
    image: '/team/smngl.jpeg',
    instagram: 'https://www.instagram.com/samangulll?stkn=NW82cWp5YjQzNDUz',
    facebook: 'https://www.facebook.com/share/18qhdhiRiF/',
  },
  {
    name: 'Habib Gasimzada',
    role: 'Head of Marketing',
    specialization: 'Brand Strategy & Communications',
    bio: 'Tells the SoilCredit story and grows a community around practical, measurable climate action.',
    image: '/team/habib.jpeg',
    linkedin: 'https://www.linkedin.com/in/habibqasimzade/',
  },
  {
    name: 'Rauf Rahimli',
    role: 'Full Stack Developer',
    specialization: 'Software Development & Data Systems',
    bio: 'Develops the scalable systems that support secure data, transparent verification, and marketplace workflows.',
    image: '/team/rauf1.png',
    linkedin: 'https://www.linkedin.com/in/rauf-rahimli-05b4a6404/',
    instagram: 'https://www.instagram.com/rauf_sleepy/',
  },
];

export default function Team({ isOpen, onOpen, onClose }) {
  const [activeMember, setActiveMember] = useState(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setActiveMember(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <section id="team" className="relative overflow-hidden bg-slate-50 py-14 md:py-16">
        <div className="absolute inset-0 grid-bg-light opacity-60" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div>
            <span className="chip chip-green mb-3">The people behind the platform</span>
            <h2 className="font-display text-[30px] font-bold leading-tight tracking-tight md:text-[42px]">
              <span className="text-gradient-bg">Our Team</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600">
              Meet the team building the future of sustainable land and carbon markets.
            </p>
          </div>
          <button type="button" onClick={onOpen} className="btn-primary inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-[13.5px] font-semibold">
            <Users className="h-4 w-4" />
            Our Team
          </button>
        </div>
      </section>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:px-6 sm:py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-dialog-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative mx-auto min-h-full max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl sm:min-h-0"
            >
              <div className="absolute inset-0 grid-bg-light opacity-60" />
              <div className="relative p-5 sm:p-8 md:p-10">
                <div className="mb-8 flex items-start justify-between gap-5 md:mb-10">
                  <div className="max-w-2xl">
                    <span className="chip chip-green mb-3">The people behind the platform</span>
                    <h2 id="team-dialog-title" className="font-display text-[34px] font-bold leading-[1.05] tracking-tight md:text-[52px]">
                      <span className="text-gradient-bg">Our Team</span>
                    </h2>
                    <p className="mt-4 text-[15px] leading-relaxed text-slate-600 md:text-[16px]">
                      Meet the team building the future of sustainable land and carbon markets.
                    </p>
                  </div>
                  <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600" aria-label="Close Our Team">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member, index) => {
            const isActive = activeMember === index;
            return (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`card-soft group relative cursor-pointer overflow-hidden p-0 ${isActive ? 'border-blue-200 shadow-[0_20px_40px_-16px_rgba(37,99,235,0.22)]' : ''}`}
                onClick={() => setActiveMember(isActive ? null : index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setActiveMember(isActive ? null : index);
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                aria-label={`View details for ${member.name}`}
              >
                <div className="relative aspect-[4/4.5] overflow-hidden">
                  <img src={member.image} alt={member.name} className={`h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105 ${isActive ? 'scale-105' : ''}`} />
                  <div className={`absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  <div className={`absolute inset-x-0 bottom-0 p-5 text-white transition duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-emerald-300">{member.role}</p>
                    <p className="mt-1 text-[13px] font-medium text-white/80">{member.specialization}</p>
                    <p className="mt-3 text-[13px] leading-relaxed text-white/70">{member.bio}</p>
                    <div className="mt-4 flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on GitHub`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20">
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Instagram`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20">
                          <Instagram className="h-4 w-4" />
                        </a>
                      )}
                      {member.facebook && (
                        <a href={member.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Facebook`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20">
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}
                      <ArrowUpRight className="ml-auto h-4 w-4 text-white/50" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-[18px] font-semibold tracking-tight text-slate-900">{member.name}</h3>
                  <p className="mt-1 text-[13px] text-slate-500">{member.role}</p>
                </div>
              </motion.article>
            );
          })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}