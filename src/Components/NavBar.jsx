// components/layout/Navbar.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../Styles/navbar.module.css';
import LogoTPME from './Logotpme';

const NAV_ITEMS = [
  { to: '/',            label: 'Accueil' },
  { to: '/eligibilite', label: 'Éligibilité' },
  { to: '/simulateur',  label: 'Simulateur' },
  { to: '/dossier',     label: 'Dossier' },
 /* { to: '/etapes',      label: 'Étapes' }, */
  { to: 'https://laayouneinvest.ma/',         label: 'CRI' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Top strip */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <span>Ministère de l'Investissement, de la Convergence et de l'Évaluation des Politiques Publiques</span>
          <div className={styles.topbarLinks}>
            <a href="https://www.micepp.gov.ma" target="_blank" rel="noreferrer">micepp.gov.ma</a>
            <a href="https://www.cri-invest.ma"  target="_blank" rel="noreferrer">cri-invest.ma</a>
            <span className={styles.langGroup}>
              <button className={styles.langBtn}>FR</button>
              <button className={styles.langBtn}>AR</button>
            </span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className={styles.nav}>
        <div className={styles.inner}>
          {/* Brand */}
          <button className={styles.brand} onClick={() => navigate('/')}>
           <div className={styles.brandIcon}>
                 <LogoTPME width={42} height={42} />
           </div>
            <div className={styles.brandText}>
              <strong>TPME Invest</strong>
              <span>Dispositif de Soutien Spécifique</span>
            </div>
          </button>

          {/* Desktop links */}
          <div className={styles.links}>
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActive : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/espace"
              className={({ isActive }) =>
                `${styles.link} ${styles.linkCta} ${isActive ? styles.linkActive : ''}`
              }
            >
              Mon espace
            </NavLink>
          </div>

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <span className={open ? styles.barOpen : ''} />
            <span className={open ? styles.barOpen : ''} />
            <span className={open ? styles.barOpen : ''} />
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className={styles.drawer}>
            {[...NAV_ITEMS, { to: '/espace', label: 'Mon espace' }].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`
                }
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;