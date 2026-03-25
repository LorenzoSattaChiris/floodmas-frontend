import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="landing-section landing-section--cta">
      <div className="landing-container" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="text-center"
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-label">
            Ready Now
          </motion.p>
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="landing-h2 landing-h2--large"
          >
            When the next flood hits, the question<br className="hidden sm:block" />
            won't be whether we saw it coming.<br className="hidden sm:block" />
            It will be whether anyone coordinated the response.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-xl text-flood-accent font-medium mt-4"
          >
            FloodMAS coordinates the response.
          </motion.p>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="landing-body mt-4 max-w-2xl mx-auto"
          >
            The July 2025 regulatory restructuring, with Ofwat abolished and replaced by an integrated
            regulator backed by £104 billion, has opened a procurement window that is time-sensitive.
            FloodMAS does not predict flooding. It coordinates the response to it.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-4 justify-center mt-8"
          >
            <Link to="/" className="landing-btn landing-btn--primary landing-btn--lg">
              Launch Platform
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="ml-2">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="https://floodmas.lsattachiris.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-btn landing-btn--ghost landing-btn--lg"
            >
              Live Deployment
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="ml-2">
                <path d="M4 12L12 4M12 4H6M12 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </motion.div>

          {/* Credentials */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="landing-cta-badges mt-12"
          >
            <div className="landing-cta-badge">
              <span className="text-xs text-flood-textMuted">University of Exeter</span>
              <span className="text-xs text-flood-textMuted opacity-50">Department of Engineering</span>
            </div>
            <div className="landing-cta-badge">
              <span className="text-xs text-flood-textMuted">iCURE Programme</span>
              <span className="text-xs text-flood-textMuted opacity-50">ENG3010 · 2025–26</span>
            </div>
            <div className="landing-cta-badge">
              <span className="text-xs text-flood-textMuted">Company No.</span>
              <span className="text-xs text-flood-textMuted opacity-50">19462837</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
