import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface CountUpProps {
  end: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  inView: boolean;
}

function CountUp({ end, suffix = '', prefix = '', decimals = 0, duration = 2, inView }: CountUpProps) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return (
    <span>
      {prefix}{decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString()}{suffix}
    </span>
  );
}

const STATS = [
  {
    value: 6.3,
    decimals: 1,
    suffix: 'M',
    label: 'Properties at Flood Risk',
    detail: 'Projected to reach ~8 million by mid-century under UKCP18 climate modelling',
    source: 'Environment Agency, National Assessment 2024',
  },
  {
    value: 1.3,
    decimals: 1,
    prefix: '£',
    suffix: 'B',
    label: 'Annual Flood Damage',
    detail: 'Rising to £3.6 billion per year by 2050, a near-tripling of economic loss',
    source: 'Climate Change Risk Assessment / Sayers et al.',
  },
  {
    value: 3.61,
    decimals: 2,
    suffix: 'M hrs',
    label: 'Sewage Discharged in 2024',
    detail: 'A record figure intersecting directly with surface water flood risk across England',
    source: 'Rivers Trust, Event Duration Monitoring 2024',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function CrisisSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="crisis" className="landing-section landing-section--dark">
      <div className="landing-container" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-label">
            The Crisis
          </motion.p>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="landing-h2">
            Flooding is the UK's most damaging natural hazard
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="landing-body mt-4 max-w-2xl">
            Yet flood management systems remain structurally inadequate: reactive, fragmented,
            and reliant on surface water models the Environmental Audit Committee formally
            identified as underdeveloped.
          </motion.p>

          {/* Stats grid */}
          <div className="landing-stats-grid mt-12">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                className="landing-stat-card"
              >
                <div className="landing-stat-card__value">
                  <CountUp
                    end={stat.value}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    inView={isInView}
                  />
                </div>
                <div className="landing-stat-card__label">{stat.label}</div>
                <div className="landing-stat-card__detail">{stat.detail}</div>
                <div className="landing-stat-card__source">{stat.source}</div>
              </motion.div>
            ))}
          </div>

          {/* Additional context */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-6 justify-center"
          >
            <div className="landing-mini-stat">
              <span className="landing-mini-stat__value">6–7×</span>
              <span className="landing-mini-stat__label">higher risk of depression or PTSD within 12 months of flooding</span>
            </div>
            <div className="landing-mini-stat">
              <span className="landing-mini-stat__value">20%</span>
              <span className="landing-mini-stat__label">of at-risk homeowners enrolled in any flood alert system</span>
            </div>
            <div className="landing-mini-stat">
              <span className="landing-mini-stat__value">£710M/yr</span>
              <span className="landing-mini-stat__label">investment deficit vs. National Infrastructure Commission target</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
