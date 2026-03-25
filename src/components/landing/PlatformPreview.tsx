import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function PlatformPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="platform" className="landing-section">
      <div className="landing-container" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-label">
            See It Live
          </motion.p>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="landing-h2">
            Deployed, live, and publicly accessible
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-body mt-4 max-w-2xl">
            FloodMAS is not a prototype or a concept; it is a working product at TRL 6,
            validated with live flooding data. The unified map eliminates the need to cross-reference
            five separate data portals. Agent briefings compress multi-hour situational assessments
            into a single-query response. Accessible today at{' '}
            <a
              href="https://floodmas.lsattachiris.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flood-accent hover:text-flood-accentHover transition-colors"
            >
              floodmas.lsattachiris.com
            </a>
          </motion.p>

          {/* Dashboard mockup */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="landing-preview mt-12"
          >
            <div className="landing-preview__window">
              {/* Title bar */}
              <div className="landing-preview__titlebar">
                <div className="flex gap-1.5">
                  <span className="landing-preview__dot landing-preview__dot--red" />
                  <span className="landing-preview__dot landing-preview__dot--yellow" />
                  <span className="landing-preview__dot landing-preview__dot--green" />
                </div>
                <span className="landing-preview__url">floodmas.lsattachiris.com</span>
                <div className="w-12" />
              </div>

              {/* Simulated dashboard */}
              <div className="landing-preview__body">
                {/* Header bar */}
                <div className="landing-preview__header">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-flood-accent opacity-80" />
                    <div className="w-16 h-2 rounded bg-flood-text opacity-20" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-flood-safe opacity-60" />
                    <div className="w-2 h-2 rounded-full bg-flood-safe opacity-60" />
                    <div className="w-12 h-2 rounded bg-flood-text opacity-10" />
                  </div>
                </div>

                {/* Main area */}
                <div className="landing-preview__main">
                  {/* Map area */}
                  <div className="landing-preview__map">
                    <div className="landing-preview__map-bg" />
                    {/* Simulated warning pins */}
                    <div className="landing-preview__pin" style={{ top: '30%', left: '45%', background: '#dc2626' }} />
                    <div className="landing-preview__pin" style={{ top: '45%', left: '55%', background: '#f97316' }} />
                    <div className="landing-preview__pin" style={{ top: '25%', left: '60%', background: '#eab308' }} />
                    <div className="landing-preview__pin" style={{ top: '55%', left: '35%', background: '#22c55e' }} />
                    <div className="landing-preview__pin" style={{ top: '40%', left: '70%', background: '#0ea5e9' }} />
                  </div>

                  {/* Chat panel */}
                  <div className="landing-preview__chat">
                    <div className="w-full h-2 rounded bg-flood-text opacity-10 mb-2" />
                    <div className="landing-preview__msg landing-preview__msg--user">
                      <div className="w-3/4 h-1.5 rounded bg-flood-accent opacity-30" />
                    </div>
                    <div className="landing-preview__msg landing-preview__msg--agent">
                      <div className="w-full h-1.5 rounded bg-flood-text opacity-10 mb-1" />
                      <div className="w-5/6 h-1.5 rounded bg-flood-text opacity-10 mb-1" />
                      <div className="w-2/3 h-1.5 rounded bg-flood-text opacity-10" />
                    </div>
                    <div className="landing-preview__msg landing-preview__msg--agent">
                      <div className="w-full h-1.5 rounded bg-flood-text opacity-10 mb-1" />
                      <div className="w-4/5 h-1.5 rounded bg-flood-text opacity-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live badge */}
            <div className="landing-preview__badge">
              <span className="landing-preview__badge-dot" />
              Deployed &amp; Live
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex justify-center mt-8"
          >
            <Link to="/" className="landing-btn landing-btn--primary">
              Try the Live Platform
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-2">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
