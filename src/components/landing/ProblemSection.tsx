import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const FRAGMENTS = [
  { label: 'Environment Agency', abbr: 'EA', color: '#0ea5e9' },
  { label: 'Lead Local Flood Authorities', abbr: 'LLFA', color: '#38bdf8' },
  { label: 'Water Utilities', abbr: 'WU', color: '#22c55e' },
  { label: 'Insurers', abbr: 'INS', color: '#f97316' },
  { label: 'Met Office', abbr: 'MO', color: '#a78bfa' },
];

const PAIN_POINTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2v8l4.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Reactive, Not Proactive',
    text: 'Systems respond to crises after they occur. The last full National Flood Risk Assessment was in 2018, eight years ago.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Fragmented Responsibility',
    text: '152 LLFAs, the Environment Agency, water utilities, and insurers, each managing flood risk in silos with no unified coordination layer.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 17l4-6 3 3 4-7 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Under-Resourced Authorities',
    text: 'Most LLFAs operate with teams of just 2–5 officers managing significant geographical areas: a structural gap between statutory obligation and operational capacity.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: '350,000 Uninsurable Properties',
    text: 'Excluded from Flood Re with no path to coverage: a direct institutional failure affecting hundreds of thousands of UK households.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="problem" className="landing-section">
      <div className="landing-container" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-label">
            The Problem
          </motion.p>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="landing-h2">
            Not a technical gap, but a coordination failure
          </motion.h2>

          {/* Expert quote */}
          <motion.blockquote
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="landing-quote mt-8"
          >
            <p>"[FloodMAS] would be a total game changer for LLFA"</p>
            <cite>Independent Flood Risk Expert</cite>
          </motion.blockquote>

          {/* Institutional quote */}
          <motion.blockquote
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="landing-quote landing-quote--secondary mt-4"
          >
            <p>"Surface water modelling [is] underdeveloped relative to fluvial systems"</p>
            <cite>Environmental Audit Committee, Flood Resilience in England, 2025</cite>
          </motion.blockquote>

          {/* Fragmented nodes visual */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="landing-fragments mt-10"
          >
            {FRAGMENTS.map((f, i) => (
              <motion.div
                key={f.abbr}
                className="landing-fragment"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5, type: 'spring' }}
              >
                <div
                  className="landing-fragment__dot"
                  style={{ background: f.color }}
                />
                <span className="landing-fragment__abbr">{f.abbr}</span>
                <span className="landing-fragment__label">{f.label}</span>
              </motion.div>
            ))}
            {/* Dashed "disconnected" lines between them */}
            <svg className="landing-fragments__lines" viewBox="0 0 600 40" preserveAspectRatio="none">
              <line x1="80" y1="20" x2="180" y2="20" stroke="var(--flood-border)" strokeWidth="1" strokeDasharray="6 4" />
              <line x1="220" y1="20" x2="320" y2="20" stroke="var(--flood-border)" strokeWidth="1" strokeDasharray="6 4" />
              <line x1="360" y1="20" x2="460" y2="20" stroke="var(--flood-border)" strokeWidth="1" strokeDasharray="6 4" />
              <line x1="500" y1="20" x2="580" y2="20" stroke="var(--flood-border)" strokeWidth="1" strokeDasharray="6 4" />
            </svg>
          </motion.div>

          {/* Pain points grid */}
          <div className="landing-pain-grid mt-12">
            {PAIN_POINTS.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                className="landing-pain-card"
              >
                <div className="landing-pain-card__icon">{point.icon}</div>
                <h3 className="landing-pain-card__title">{point.title}</h3>
                <p className="landing-pain-card__text">{point.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
