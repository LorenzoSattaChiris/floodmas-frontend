import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const MARKET_STATS = [
  {
    value: '£104B',
    label: 'Water Sector Investment',
    detail: 'Following the July 2025 abolition of Ofwat and its replacement by an integrated regulator, the largest overhaul since privatisation',
    source: 'Defra, 2025; Ofwat PR24',
  },
  {
    value: '$3.7B',
    label: 'Flood Warning Market by 2030',
    detail: '8.3% CAGR; global flood warning system market expanding rapidly as climate risk escalates',
    source: 'Strategic Market Research',
  },
  {
    value: '$31.2B',
    label: 'Climate Risk Assessment Market',
    detail: '17.5% CAGR for AI-powered climate risk tools, the fastest-growing subsector in climate tech',
    source: 'DAI Magister, 2024',
  },
  {
    value: '152',
    label: 'Target LLFAs in England',
    detail: 'Statutory bodies under the Flood and Water Management Act 2010, most operating with just 2–5 officers',
    source: 'Defra / ADEPT Network',
  },
];

const COMPETITIVE = [
  {
    name: 'Fathom',
    type: 'Static risk mapping',
    gap: 'No real-time data, no operational coordination; model outputs only',
    color: '#94a3b8',
  },
  {
    name: 'Previsico',
    type: 'Surface water forecasting',
    gap: 'Forecasting-only; no monitoring, risk analysis, or emergency response',
    color: '#94a3b8',
  },
  {
    name: 'FloodFlash',
    type: 'Parametric insurance triggers',
    gap: 'Insurance payout automation; no operational or advisory capability',
    color: '#94a3b8',
  },
  {
    name: 'FloodMAS',
    type: 'Autonomous multi-agent coordination',
    gap: 'Forecasting + monitoring + risk + emergency response; no direct competitor exists',
    color: '#0ea5e9',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function MarketSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="market" className="landing-section">
      <div className="landing-container" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-label">
            Market Opportunity
          </motion.p>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="landing-h2">
            A regulatory catalyst has opened a 12–18 month first-mover window
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="mt-4 text-flood-textMuted max-w-3xl mx-auto text-center">
            In July 2025, Ofwat will be abolished and replaced by an integrated water regulator, the largest restructuring since privatisation.
            Every water company must now re-procure under new standards. FloodMAS is positioned to enter before incumbents can re-architect.
          </motion.p>

          {/* Market stats */}
          <div className="landing-market-grid mt-10">
            {MARKET_STATS.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="landing-market-card"
              >
                <div className="landing-market-card__value">{stat.value}</div>
                <div className="landing-market-card__label">{stat.label}</div>
                <div className="landing-market-card__detail">{stat.detail}</div>
                <div className="landing-market-card__source">{stat.source}</div>
              </motion.div>
            ))}
          </div>

          {/* ROI highlight */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="landing-roi-card mt-10"
          >
            <div className="landing-roi-card__value">€400</div>
            <div className="landing-roi-card__text">
              return per €1 invested in early warning systems across Europe
            </div>
            <div className="landing-roi-card__source">Pappenberger et al., Environmental Science &amp; Policy, 2015</div>
          </motion.div>

          {/* Competitive landscape */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mt-14"
          >
            <h3 className="text-sm font-medium text-flood-textMuted tracking-wider uppercase mb-6 text-center">
              Competitive Landscape
            </h3>
            <div className="landing-competitive-grid">
              {COMPETITIVE.map((c) => (
                <div
                  key={c.name}
                  className={`landing-competitive-card ${c.name === 'FloodMAS' ? 'landing-competitive-card--highlight' : ''}`}
                >
                  <div className="landing-competitive-card__name" style={{ color: c.color }}>
                    {c.name}
                  </div>
                  <div className="landing-competitive-card__type">{c.type}</div>
                  <div className="landing-competitive-card__gap">{c.gap}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Traction & timing */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="landing-market-grid mt-10"
          >
            <div className="landing-market-card">
              <div className="landing-market-card__value" style={{ fontSize: '1.1rem' }}>3 LLFAs</div>
              <div className="landing-market-card__label">Expressed Interest in Piloting</div>
              <div className="landing-market-card__detail">Identified through structured interviews and engagement via the ADEPT network, FloodMAS's primary route to market</div>
            </div>
            <div className="landing-market-card">
              <div className="landing-market-card__value" style={{ fontSize: '1.1rem' }}>Live Tenders</div>
              <div className="landing-market-card__label">Active Government Procurement</div>
              <div className="landing-market-card__detail">North Yorkshire, North Hertfordshire, and King's Lynn &amp; West Norfolk have published tenders for flood management platforms, demonstrating immediate demand</div>
            </div>
            <div className="landing-market-card">
              <div className="landing-market-card__value" style={{ fontSize: '1.1rem' }}>Severn Trent</div>
              <div className="landing-market-card__label">AI Procurement Validated</div>
              <div className="landing-market-card__detail">Already procuring AI-driven water management via the Ofwat Innovation Fund, confirming institutional willingness to pay for autonomous systems</div>
            </div>
          </motion.div>

          {/* Pricing indication */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mt-10 text-sm text-flood-textMuted"
          >
            Indicative pricing: £18,000–£25,000 per authority per year, within existing discretionary technology budgets.
            <br />
            ROI demonstrated through avoided flood damage costs averaging £31,000 per property.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
