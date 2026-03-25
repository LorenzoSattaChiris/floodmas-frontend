import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const TEAM = [
  {
    name: 'Valeria Ortega Velarde',
    role: 'AI/ML Research Lead & CEO',
    initials: 'VO',
    expertise: 'Deep learning architectures for hydrology (LSTM, Transformer, PINNs). Academic grounding in flood forecasting. Co-authored research on physics-informed neural networks for flood prediction. Strong managerial and project management experience.',
    color: '#a78bfa',
  },
  {
    name: 'Lorenzo Satta Chiris',
    role: 'Lead Engineer & CTO',
    initials: 'LS',
    expertise: 'Architected the FloodMAS multi-agent system. Published the AURA framework (arXiv:2510.15739). Speaker at DevOpsCon, MLCon 2026, Azure AI Connect 2026, DevFest London 2025, and the Dutch AI Conference 2026.',
    color: '#0ea5e9',
  },
  {
    name: 'Khaleed Arafat Razac',
    role: 'Environmental Engineer',
    initials: 'KR',
    expertise: 'UK flood risk management, surface water hydrology, and regulatory frameworks spanning the Environment Agency, Ofwat, and Flood Re. Led structured interviews with Fathom, Previsico, FloodFlash, and UN experts to validate the competitive landscape.',
    color: '#22c55e',
  },
  {
    name: 'Alex Bailey',
    role: 'Commercial Strategy Lead',
    initials: 'AB',
    expertise: 'Entrepreneurship and market strategy. Customer discovery across 60+ stakeholder interactions. Go-to-market planning, B2B SaaS procurement expertise, and grant/investor communications.',
    color: '#f97316',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function TeamSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="team" className="landing-section">
      <div className="landing-container" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-label">
            The Team
          </motion.p>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="landing-h2">
            Four complementary disciplines, one mission
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-body mt-4 max-w-2xl">
            The founding team combines software engineering, AI/ML research,
            environmental engineering, and commercial strategy, embedded within the
            University of Exeter’s Centre for Water Systems and backed by the £38M
            Flood and Droughts Research Infrastructure programme.
          </motion.p>

          <div className="landing-team-grid mt-10">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="landing-team-card"
              >
                <div
                  className="landing-team-card__avatar"
                  style={{ borderColor: member.color }}
                >
                  <span style={{ color: member.color }}>{member.initials}</span>
                </div>
                <h3 className="landing-team-card__name">{member.name}</h3>
                <p className="landing-team-card__role" style={{ color: member.color }}>
                  {member.role}
                </p>
                <p className="landing-team-card__expertise">{member.expertise}</p>
              </motion.div>
            ))}
          </div>

          {/* Institutional backing */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="landing-backing mt-12"
          >
            <div className="landing-backing__item">
              <span className="landing-backing__label">University of Exeter</span>
              <span className="landing-backing__detail">Department of Engineering</span>
            </div>
            <div className="landing-backing__divider" />
            <div className="landing-backing__item">
              <span className="landing-backing__label">Centre for Water Systems</span>
              <span className="landing-backing__detail">Blue Heart (Defra) · WATERVERSE (Horizon Europe)</span>
            </div>
            <div className="landing-backing__divider" />
            <div className="landing-backing__item">
              <span className="landing-backing__label">iCURE Programme</span>
              <span className="landing-backing__detail">Innovation to Commercialisation of University Research</span>
            </div>
            <div className="landing-backing__divider" />
            <div className="landing-backing__item">
              <span className="landing-backing__label">£38M FDRI</span>
              <span className="landing-backing__detail">Flood &amp; Droughts Research Infrastructure</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
