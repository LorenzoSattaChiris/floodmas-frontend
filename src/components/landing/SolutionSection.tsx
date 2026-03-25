import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import AgentNetworkScene from './AgentNetworkScene';

const DATA_SOURCES = [
  'EA Flood Monitoring API',
  'Met Office DataHub',
  'Open-Meteo Weather',
  'Copernicus ERA5-Land',
  'Sentinel-1 SAR Imagery',
  'Bluesky Social NLP',
  'OS Names / Postcodes',
  'NRFA River Gauging',
  'ArcGIS FeatureServer',
  'IoT LoRaWAN Sensors',
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function SolutionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="solution" className="landing-section landing-section--dark">
      <div className="landing-container" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-label">
            The Solution
          </motion.p>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="landing-h2">
            FloodMAS doesn't predict flooding;<br className="hidden md:block" />
            it coordinates the response
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-body mt-4 max-w-3xl">
            An end-to-end autonomous platform built on coordinated LLM-based AI agents,
            orchestrated by LangGraph, connected to 20+ live data sources.
            An officer asking <em>"What is the current flood risk for York?"</em> receives
            a structured briefing covering forecast conditions, sensor status, property
            exposure, and recommended actions, in seconds, not hours.
          </motion.p>

          {/* Agent network 3D scene */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="landing-agent-scene mt-12"
          >
            <AgentNetworkScene />
          </motion.div>

          {/* Architecture flow description */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="landing-arch-flow mt-12"
          >
            <div className="landing-arch-card">
              <div className="landing-arch-card__number">1</div>
              <h3 className="landing-arch-card__title">Query or Anomaly Detected</h3>
              <p className="landing-arch-card__text">
                An officer asks a question, or the proactive scanning mode detects an emerging risk across monitored catchments.
              </p>
            </div>
            <div className="landing-arch-arrow">→</div>
            <div className="landing-arch-card">
              <div className="landing-arch-card__number">2</div>
              <h3 className="landing-arch-card__title">Coordinator Delegates to Specialists</h3>
              <p className="landing-arch-card__text">
                The Supervisor Agent analyses the request and routes to Forecasting, Monitoring, Risk Analysis, and Emergency Response agents in parallel.
              </p>
            </div>
            <div className="landing-arch-arrow">→</div>
            <div className="landing-arch-card">
              <div className="landing-arch-card__number">3</div>
              <h3 className="landing-arch-card__title">Actionable Briefing in Seconds</h3>
              <p className="landing-arch-card__text">
                Specialist outputs are synthesised into a structured briefing with property-level risk, sensor data, forecasts, and recommended actions: work that would take hours manually.
              </p>
            </div>
          </motion.div>

          {/* Data sources */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <h3 className="text-sm font-medium text-flood-textMuted tracking-wider uppercase mb-4 text-center">
              Connected Data Sources
            </h3>
            <div className="landing-data-sources">
              {DATA_SOURCES.map((source) => (
                <span key={source} className="landing-data-source-tag">
                  {source}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
