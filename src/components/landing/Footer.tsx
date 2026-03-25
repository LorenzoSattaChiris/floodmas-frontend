import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer__grid">
          {/* Brand */}
          <div className="landing-footer__brand">
            <div className="flex items-center gap-2 mb-3">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="6" fill="var(--flood-accent)" opacity="0.9" />
                <circle cx="16" cy="8" r="2.5" fill="currentColor" opacity="0.6" />
                <circle cx="22" cy="20" r="2.5" fill="currentColor" opacity="0.6" />
                <circle cx="10" cy="20" r="2.5" fill="currentColor" opacity="0.6" />
              </svg>
              <span className="text-base font-semibold text-flood-text">FloodMAS</span>
            </div>
            <p className="text-sm text-flood-textMuted leading-relaxed">
              Multi-Agent AI System for Real-Time UK Flood Management
              and Autonomous Emergency Response.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="landing-footer__heading">Platform</h4>
            <ul className="landing-footer__list">
              <li><Link to="/" className="landing-footer__link">Live Dashboard</Link></li>
              <li><a href="#solution" className="landing-footer__link">Architecture</a></li>
              <li><a href="#tech" className="landing-footer__link">Technology</a></li>
              <li><a href="#market" className="landing-footer__link">Market</a></li>
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h4 className="landing-footer__heading">Open Source</h4>
            <ul className="landing-footer__list">
              <li>
                <a
                  href="https://github.com/LorenzoSattaChiris/floodmas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-footer__link"
                >
                  Backend Repository
                </a>
              </li>
              <li>
                <a
                  href="https://floodmas.lsattachiris.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-footer__link"
                >
                  Live Deployment
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p className="text-sm text-flood-textMuted">
            © {new Date().getFullYear()} FloodMAS Technologies · University of Exeter Spinout · Company No. 19462837
          </p>
          <p className="text-xs text-flood-textMuted opacity-60 mt-1">
            iCURE: Innovation to Commercialisation of University Research · ENG3010 Industrial Awareness and Problem Solving
          </p>
        </div>
      </div>
    </footer>
  );
}
