import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const METRICS = [
  {
    value: '20+',
    label: 'Data Sources',
    detail: 'EA, Met Office, Copernicus, Sentinel-1, Bluesky NLP, IoT sensors and more',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 12h20M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10c-2.5-3-4-6.5-4-10s1.5-7 4-10z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: '5',
    label: 'AI Agents',
    detail: 'Coordinator, Forecasting, Monitoring, Risk Analysis, Emergency Response',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6v3M14.5 13.5l3 1.5M9.5 13.5l-3 1.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  },
  {
    value: '13',
    label: 'Specialist Tools',
    detail: 'Weather forecasts, sensor reads, risk scoring, evacuation planning, resource allocation',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: '48h',
    label: 'Flood Forecasting',
    detail: 'Property-level surface water prediction using LSTM and Physics-Informed Neural Networks',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 'TRL 6',
    label: 'Technology Readiness',
    detail: 'Validated in a real environment with live flooding data and 20+ active data sources',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: '24/7',
    label: 'Autonomous Scanning',
    detail: 'Continuous proactive monitoring of high-risk catchments without officer intervention',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M2 12a10 10 0 0118-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 12a10 10 0 01-18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function MetricsGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="landing-section landing-section--dark">
      <div className="landing-container" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-label">
            Platform Capabilities
          </motion.p>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="landing-h2">
            Built for institutional-grade flood intelligence
          </motion.h2>

          <div className="landing-metrics-grid mt-10">
            {METRICS.map((m, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="landing-metric-card"
              >
                <div className="landing-metric-card__icon">{m.icon}</div>
                <div className="landing-metric-card__value">{m.value}</div>
                <div className="landing-metric-card__label">{m.label}</div>
                <div className="landing-metric-card__detail">{m.detail}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
