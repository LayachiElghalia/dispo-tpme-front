import { useNavigate } from 'react-router-dom';
import { Button, SectionHeader } from './Index.jsx';
import styles from '../Styles/Accueil.module.css';
import CalculateurPrimes from './CalculateurPrimes.jsx';

const DISPOSITIFS = [
  { num: 1, title: 'Soutien principal', desc: 'Pour les grands projets nationaux et étrangers.', accent: '' },
  { num: 2, title: 'Projets stratégiques', desc: 'Dédié aux projets à caractère stratégique.', accent: '' },
  { num: 3, title: 'Soutien spécifique TPME', desc: 'Primes ciblées pour les TPME marocaines.', accent: 'highlight', to: '/eligibilite' },
  { num: 4,  title: "Développement à l'international", desc: 'Encourage la présence des entreprises marocaines à l\'étranger.', accent: '' },
];

const PRIMES = [
  {
    color: 'navy',
    title: 'Prime emploi stable',
    rows: [
      { label: 'Ratio ≥ 2 et ≤ 5',  pct: '5%' },
      { label: 'Ratio > 5 et ≤ 10', pct: '7%' },
      { label: 'Ratio > 10',         pct: '10%', highlight: true },
    ],
  },
  {
    color: 'blue',
    title: 'Prime territoriale',
    rows: [
      { label: 'Province catégorie A', pct: '10%' },
      { label: 'Province catégorie B', pct: '15%', highlight: true },
    ],
  },
  {
    color: 'red',
    icon: '⚡',
    title: 'Prime activités prioritaires',
    rows: [
      { label: 'Activité prioritaire éligible', pct: '10%', highlight: true },
    ],
    note: 'Industrie, TIC, tourisme, artisanat, énergies renouvelables…',
  },
];

const QUICK_ACCESS = [
  { to: '/eligibilite',  label: 'Vérifier éligibilité' },
  { to: '/simulateur',  label: 'Simuler les primes' },
  { to: '/dossier',     label: 'Préparer dossier' },
  { to: '/etapes',      label: 'Parcours investisseur' },
  { to: '/cri',          label: 'Trouver mon CRI' },
  { to: '/espace',       label: 'Mon espace' },
];

function Acceuil() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>

      {/* ── Hero avec vidéo de fond ── */}
      <section className={styles.hero}>

  <video
    className={styles.heroVideo}
    autoPlay
    muted
    loop
    playsInline
    controls
  >
    <source src="/videos/hero-bg.mp4" type="video/mp4" />
  </video>

  <div className={styles.heroOverlay}></div>

        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Nouvelle Charte de l'Investissement — Loi cadre 03.22
            </div>
            <h1 className={styles.heroTitle}>
              Soutien spécifique dédié aux{' '}
              <em className={styles.heroEm}>TPME Laayoune Sakia ELHAMRA</em>
            </h1>
            <p className={styles.heroSubtitle}>
              Des primes à l'investissement pouvant atteindre <strong>30%</strong> du montant primable pour
               les TPME implantées dans la région de Laâyoune-Sakia El Hamra.
               Développez votre projet dans les secteurs et branches d’activité éligibles de la région.
            </p>
            <div className={styles.heroCta}>
              <Button variant="danger" size="lg" onClick={() => navigate('/eligibilite')}>
                ✓ Vérifier mon éligibilité
              </Button>
              <Button variant="white" size="lg" onClick={() => navigate('/simulateur')}>
                ⚡ Simuler mes primes
              </Button>
            </div>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <strong>30%</strong>
              <span>Prime max. cumulable</span>
            </div>
            <div className={styles.heroStat}>
              <strong>1 – 50 MDH</strong>
              <span>Montant total d’investissement éligible</span>
            </div>
            <div className={styles.heroStat}>
              <strong>4 provinces</strong>
              <span>Laâyoune, Boujdour, Es-Smara, Tarfaya</span>
            </div>
          </div>
        </div>

      </section>

      {/* ── Info strip ── */}
      <div className={styles.infoStrip}>
        <div className={styles.infoStripInner}>
          <span>📢</span>
          <span>
            <strong>Nouveau :</strong> Le décret n°2.25.342 relatif au dispositif de soutien
            aux TPME est entré en vigueur.{' '}
            <a href="#consulter">Consulter le texte →</a>
          </span>
        </div>
      </div>

    

      {/* ── 3 Primes ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader
            tag="Dispositif TPME"
            title="Trois primes à l'investissement"
          />
          <div className={styles.primesGrid}>
            {PRIMES.map((p) => (
              <div key={p.title} className={`${styles.primeCard} ${styles[`primeCard_${p.color}`]}`}>
                <div className={styles.primeCardHeader}>
                  <span className={styles.primeCardIcon}>{p.icon}</span>
                  <h3>{p.title}</h3>
                </div>
                <div className={styles.primeCardBody}>
                  {p.rows.map((r) => (
                    <div
                      key={r.label}
                      className={`${styles.primeRow} ${r.highlight ? styles.primeRowHighlight : ''}`}
                    >
                      <span>{r.label}</span>
                      <strong>{r.pct}</strong>
                    </div>
                  ))}
                  {p.note && <p className={styles.primeNote}>{p.note}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.plafondBanner}>
            <div>
              <div className={styles.plafondLabel}>Plafond cumulé des primes</div>
              <div className={styles.plafondVal}>
                30% <span>du montant d'investissement primable</span>
              </div>
            </div>
            <Button variant="gold" size="lg" onClick={() => navigate('/simulateur')}>
              Simuler mes primes →
            </Button>
          </div>
        </div>
      </section>

       <CalculateurPrimes />

      {/* ── Accès rapide ── */}
      <section className={styles.quickAccess}>
        <div className={styles.sectionInner}>
          <div className={styles.quickHeader}>
            <p className={styles.quickTag}>Accès rapide</p>
            <h2>Nos services en ligne</h2>
          </div>
          <div className={styles.quickGrid}>
            {QUICK_ACCESS.map(({ to, icon, label }) => (
              <button key={to} className={styles.quickBtn} onClick={() => navigate(to)}>
                <span className={styles.quickIcon}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Acceuil;