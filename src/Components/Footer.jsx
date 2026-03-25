// components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import styles from '../Styles/footer.module.css';
import LogoTPME from './Logotpme';

const QUICK_LINKS = [
  { to: '/eligibilite', label: 'Vérifier mon éligibilité' },
  { to: '/simulateur',  label: 'Simulateur de primes' },
  { to: '/dossier',     label: 'Préparer mon dossier' },
  { to: '/etapes',      label: 'Étapes du parcours' },
  { to: '/cri',         label: 'Trouver mon CRI' },
];

const LEGAL_LINKS = [
  { label: 'Loi cadre 03.22', href: '#' },
  { label: 'Décret 2.25.342', href: '#' },
  { label: 'Textes d\'application', href: '#' },
  { label: 'Guide d\'orientation', href: '#' },
];

 function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        {/* Brand */}
        <div className={styles.brand}>
         <div className={styles.brandIcon}>
           <LogoTPME width={42} height={42} />
    
            <div>
              <strong>TPME Invest Maroc</strong>
              <span>Dispositif de Soutien Spécifique</span>
            </div>
          </div>
          <p>
            Plateforme officielle du dispositif de soutien aux très petites, petites
            et moyennes entreprises marocaines, dans le cadre de la Nouvelle Charte
            de l'Investissement.
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}>MICEPP</span>
            <span className={styles.badge}>CRI-INVEST</span>
            <span className={styles.badge}>Loi 03.22</span>
          </div>
        </div>

        {/* Services */}
        <div className={styles.col}>
          <h4>Nos services</h4>
          <ul>
            {QUICK_LINKS.map(({ to, label }) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className={styles.col}>
          <h4>Cadre légal</h4>
          <ul>
            {LEGAL_LINKS.map(({ label, href }) => (
              <li key={label}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4>Contact</h4>
          <div className={styles.contactList}>
            <div className={styles.contactRow}>
              <span>📍</span>
              <span>Complexe Admin. Al Jadid, Tour n°6, Rue Abdelrahim Bouabid, Agdal Riyad, Rabat</span>
            </div>
            <div className={styles.contactRow}>
              <span>📞</span>
              <a href="tel:+2125300613855">+212 530 061 38 55</a>
            </div>
            <div className={styles.contactRow}>
              <span>✉️</span>
              <a href="mailto:contact@micepp.gov.ma">contact@micepp.gov.ma</a>
            </div>
            <div className={styles.contactRow}>
              <span>🌐</span>
              <a href="https://www.micepp.gov.ma" target="_blank" rel="noreferrer">www.micepp.gov.ma</a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>
          © {new Date().getFullYear()} Ministère de l'Investissement, de la Convergence
          et de l'Évaluation des Politiques Publiques. Tous droits réservés.
        </span>
        <span className={styles.stack}>React.js · Spring Boot · MySQL</span>
      </div>
    </footer>
  );
}

export default Footer;