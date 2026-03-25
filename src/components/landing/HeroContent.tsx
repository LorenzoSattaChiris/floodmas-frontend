import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function HeroContent() {
  return (
    <div className="landing-hero__content">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="landing-hero__inner"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="landing-hero__badge">
          <span className="landing-hero__badge-dot" />
          University of Exeter Spinout · iCURE 2025–26
        </motion.div>

        {/* Title */}
        <motion.h1 variants={fadeUp} className="landing-hero__title">
          Flood<span className="text-flood-accent">MAS</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={fadeUp} className="landing-hero__subtitle">
          The UK's first autonomous multi-agent AI platform
          <br className="hidden sm:block" />
          for real-time flood management and emergency response
        </motion.p>

        {/* Tagline */}
        <motion.p variants={fadeUp} className="landing-hero__tagline">
          Other systems predict flooding. FloodMAS coordinates the response to it.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="landing-hero__ctas">
          <Link to="/" className="landing-btn landing-btn--primary">
            Explore Platform
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-2">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a href="#solution" className="landing-btn landing-btn--ghost" onClick={(e) => {
            e.preventDefault();
            document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Learn More
          </a>
        </motion.div>

        {/* Credentials */}
        <motion.div variants={fadeUp} className="landing-hero__credentials">
          <div className="landing-hero__credential-item">
            <span className="landing-hero__credential-label">TRL 6</span>
            <span className="text-flood-textMuted text-xs">Validated with Live Data</span>
          </div>
          <div className="landing-hero__credential-divider" />
          <div className="landing-hero__credential-item">
            <span className="landing-hero__credential-label">20+</span>
            <span className="text-flood-textMuted text-xs">Live Data Sources</span>
          </div>
          <div className="landing-hero__credential-divider" />
          <div className="landing-hero__credential-item">
            <span className="landing-hero__credential-label">5</span>
            <span className="text-flood-textMuted text-xs">Coordinated AI Agents</span>
          </div>
          <div className="landing-hero__credential-divider" />
          <div className="landing-hero__credential-item">
            <span className="landing-hero__credential-label">Live</span>
            <span className="text-flood-textMuted text-xs">Deployed &amp; Accessible</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="landing-hero__scroll"
      >
        <span className="text-xs text-flood-textMuted tracking-widest uppercase">Scroll</span>
        <motion.svg
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          width="16" height="16" viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="var(--flood-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
      </motion.div>
    </div>
  );
}
