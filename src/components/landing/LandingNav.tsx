import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Crisis', href: '#crisis' },
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Platform', href: '#platform' },
  { label: 'Market', href: '#market' },
  { label: 'Team', href: '#team' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const container = document.getElementById('landing-scroll');
    if (!container) return;
    const onScroll = () => setScrolled(container.scrollTop > 60);
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}
    >
      <div className="landing-nav__inner">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleAnchor(e, '#hero')}
          className="landing-nav__logo"
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14.5" stroke="url(#nav-logo-gradient)" strokeWidth="1.5" opacity="0.7" />
            <path
              d="M16 4L26 10V22L16 28L6 22V10L16 4Z"
              fill="url(#nav-logo-fill)"
              stroke="url(#nav-logo-gradient)"
              strokeWidth="0.75"
              opacity="0.85"
            />
            <path d="M10 14 Q13 10 16 14 Q19 18 22 14" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.95" />
            <path d="M10 19 Q13 15 16 19 Q19 23 22 19" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
            <circle cx="16" cy="16.5" r="1.5" fill="white" opacity="0.9" />
            <defs>
              <linearGradient id="nav-logo-gradient" x1="4" y1="4" x2="28" y2="28">
                <stop stopColor="#0ea5e9" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="nav-logo-fill" x1="6" y1="4" x2="26" y2="28">
                <stop stopColor="rgba(14,165,233,0.25)" />
                <stop offset="1" stopColor="rgba(99,102,241,0.15)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="landing-nav__logo-text">FloodMAS</span>
        </a>

        {/* Desktop links */}
        <div className="landing-nav__links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchor(e, link.href)}
              className="landing-nav__link"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="landing-nav__actions">
          <Link to="/" className="landing-btn landing-btn--primary landing-btn--sm">
            Launch Platform
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="ml-1.5">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="landing-nav__mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {mobileOpen ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            ) : (
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="landing-nav__mobile-menu"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchor(e, link.href)}
                className="landing-nav__mobile-link"
              >
                {link.label}
              </a>
            ))}
            <Link to="/" className="landing-btn landing-btn--primary landing-btn--sm w-full text-center mt-2">
              Launch Platform →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
