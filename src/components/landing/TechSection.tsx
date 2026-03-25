import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const TECH_ITEMS = [
  {
    label: 'LangGraph Orchestration',
    detail: 'State-graph architecture with auditable decision logs for multi-agent coordination',
    category: 'Architecture',
  },
  {
    label: 'LSTM + PINN Models',
    detail: 'Physics-Informed Neural Networks embedding Saint-Venant equations for physically consistent flood forecasts',
    category: 'ML / AI',
  },
  {
    label: 'XGBoost Risk Ensemble',
    detail: 'Gradient-boosted decision trees for 5-dimensional risk scoring: property, infrastructure, life, economic, overall',
    category: 'ML / AI',
  },
  {
    label: 'Sentinel-1 SAR',
    detail: 'Satellite radar imagery for flood extent mapping at scale, independent of cloud cover',
    category: 'Remote Sensing',
  },
  {
    label: 'IoT Sensor Fusion',
    detail: 'LoRaWAN sensor networks ingesting river level, rainfall, soil moisture, and groundwater data',
    category: 'Data Ingestion',
  },
  {
    label: 'NLP Social Analysis',
    detail: 'Real-time processing of Bluesky and news data for ground-truth situational awareness signals',
    category: 'Data Ingestion',
  },
  {
    label: 'A2A / MCP / AURA Protocols',
    detail: 'Agent-to-Agent communication, Model Context Protocol, and the published AURA approval workflow framework (arXiv:2510.15739)',
    category: 'Architecture',
  },
  {
    label: 'TensorFlow.js Runtime',
    detail: 'Server-side ML inference for real-time flood level prediction and risk assessment',
    category: 'ML / AI',
  },
];

const RESEARCH_STREAMS = [
  {
    title: 'Physics-Informed Neural Networks',
    source: 'Feng et al. (2023), Tian et al. (2025)',
    text: 'Embedding Saint-Venant equations directly into neural architectures for physically consistent forecasts.',
  },
  {
    title: 'IoT & NLP Situational Awareness',
    source: 'Zhang et al. (2019), Alam et al. (2018)',
    text: 'Real-time social media and sensor data processing demonstrated for disaster response.',
  },
  {
    title: 'Multi-Agent Flood Systems',
    source: 'Zhuo & Han (2020), 61-agent review',
    text: 'Agent-based modelling validated for heterogeneous decision-making in human-flood interaction.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function TechSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="tech" className="landing-section landing-section--dark">
      <div className="landing-container" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-label">
            Technology
          </motion.p>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="landing-h2">
            Three validated research streams, one deployable system
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="mt-4 text-flood-textMuted max-w-3xl mx-auto text-center">
            Built on peer-reviewed research and backed by institutional programmes including
            Blue Heart (Defra), WATERVERSE (Horizon Europe), and the £38M Flood and Droughts
            Research Infrastructure initiative.
          </motion.p>

          {/* Research streams */}
          <div className="landing-research-grid mt-10">
            {RESEARCH_STREAMS.map((r, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="landing-research-card"
              >
                <div className="landing-research-card__number">{i + 1}</div>
                <h3 className="landing-research-card__title">{r.title}</h3>
                <p className="landing-research-card__text">{r.text}</p>
                <p className="landing-research-card__source">{r.source}</p>
              </motion.div>
            ))}
          </div>

          {/* Tech stack */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="mt-14">
            <h3 className="text-sm font-medium text-flood-textMuted tracking-wider uppercase mb-6 text-center">
              Technical Stack
            </h3>
            <div className="landing-tech-grid">
              {TECH_ITEMS.map((item) => (
                <div key={item.label} className="landing-tech-card">
                  <span className="landing-tech-card__category">{item.category}</span>
                  <h4 className="landing-tech-card__label">{item.label}</h4>
                  <p className="landing-tech-card__detail">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* TRL badge */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex justify-center mt-10"
          >
            <div className="landing-trl-badge">
              <span className="landing-trl-badge__level">TRL 6</span>
              <span className="landing-trl-badge__text">
                Technology validated in a real environment: live data from 20+ sources, deployed product at floodmas.lsattachiris.com, full documentation
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
