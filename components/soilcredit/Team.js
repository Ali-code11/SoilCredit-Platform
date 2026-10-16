'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Facebook, Github, Instagram, Linkedin } from 'lucide-react';
import { useLang } from '@/lib/providers';

const TEAM_MEMBERS = [
  {
    image: '/team/nazrin.jpeg',
    linkedin: 'https://www.linkedin.com/in/nazrin-abdullayeva-2b01a1334/',
  },
  {
    image: '/team/ali.jpeg',
    linkedin: 'https://www.linkedin.com/in/ali-farzalisoy',
    github: 'https://github.com/Ali-code11',
  },
  {
    image: '/team/aysel.jpeg',
    linkedin: 'https://www.linkedin.com/in/aysel-baghirova-0071a8295/',
    github: 'https://github.com/ayselbaghirova',
  },
  {
    image: '/team/smngl.jpeg',
    instagram: 'https://www.instagram.com/samangulll?stkn=NW82cWp5YjQzNDUz',
    facebook: 'https://www.facebook.com/share/18qhdhiRiF/',
  },
  {
    image: '/team/habib.jpeg',
    linkedin: 'https://www.linkedin.com/in/habibqasimzade/',
  },
  {
    image: '/team/rauf1.png',
    linkedin: 'https://www.linkedin.com/in/rauf-rahimli-05b4a6404/',
    instagram: 'https://www.instagram.com/rauf_sleepy/',
  },
];

const SOCIAL_LINKS = [
  ['linkedin', Linkedin, 'LinkedIn'],
  ['github', Github, 'GitHub'],
  ['instagram', Instagram, 'Instagram'],
  ['facebook', Facebook, 'Facebook'],
];

export default function Team() {
  const { t } = useLang();
  const team = t('team');

  return (
    <section id="team" aria-labelledby="team-title" className="relative scroll-mt-24 overflow-hidden bg-slate-50 py-20 md:py-24">
      <div className="absolute inset-0 grid-bg-light opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="chip chip-green mb-3">{team.tag}</span>
          <h2 id="team-title" className="font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
            <span className="text-gradient-bg">{team.title}</span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{team.subtitle}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member, index) => {
            const memberText = team.members[index];
            return (
              <motion.article
                key={memberText.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="card-soft group overflow-hidden p-0"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={member.image}
                    alt={memberText.name}
                    loading={index > 2 ? 'lazy' : 'eager'}
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center gap-2 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    {SOCIAL_LINKS.map(([key, Icon, label]) => member[key] ? (
                      <a
                        key={key}
                        href={member[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${memberText.name} on ${label}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white transition hover:bg-white/25"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : null)}
                    <ArrowUpRight className="ml-auto h-4 w-4 text-white/70" aria-hidden="true" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900">{memberText.name}</h3>
                  <p className="mt-1 text-sm font-medium text-blue-800 dark:text-blue-300">{memberText.role}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-700">{memberText.specialization}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{memberText.bio}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
