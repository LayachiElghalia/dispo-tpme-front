// pages/Eligibilite.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SectionHeader, Breadcrumb, Button,
  FormGroup, Input, Select, Alert,
} from '../Components/Index.jsx';
import styles from '../Styles/Eligibilite.module.css';

const SECTEURS = [
  'Industrie manufacturière', 'Agriculture, sylviculture et pêche',
  'Hébergement et restauration', 'Tourisme', 'Information et communication',
  'Artisanat', 'Énergies renouvelables', 'Autre',
];

function CheckItem({ ok, warn, label }) {
  const icon = ok ? '✓' : warn ? '!' : '✗';
  const cls  = ok ? styles.iconOk : warn ? styles.iconWarn : styles.iconKo;
  return (
    <div className={styles.checkItem}>
      <span className={`${styles.checkIcon} ${cls}`}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

 function Eligibilite() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    isNew: 'non', ca: '', cap: '0', hasPub: 'non',
    invest: '', fp: '', emplois: '', secteur: '',
  });
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function verifier() {
    const isNew  = form.isNew === 'oui';
    const ca     = parseFloat(form.ca)     || 0;
    const cap    = parseFloat(form.cap)    || 0;
    const invest = parseFloat(form.invest) || 0;
    const fp     = parseFloat(form.fp)     || 0;
    const emplois = parseInt(form.emplois) || 0;
    const isTourisme = form.secteur.toLowerCase() === 'tourisme';

    const checks = [];

    // 1. CA
    if (!isNew) {
      const ok = ca >= 1_000_000 && ca <= 200_000_000;
      checks.push({ ok, label: `CA annuel HT : ${ca.toLocaleString()} MAD (doit être entre 1M et 200M MAD)` });
    } else {
      checks.push({ ok: true, warn: false, label: 'Entreprise nouvellement créée — condition CA non applicable' });
    }

    // 2. Capital
    const capOk = cap <= 25;
    checks.push({ ok: capOk, label: `Capital détenu par grande société : ${cap}% (max 25%)` });

    // 3. Personne publique
    const pubOk = form.hasPub === 'non';
    checks.push({ ok: pubOk, label: `Actionnaires de droit public : ${pubOk ? 'Aucun ✓' : 'Présents — non éligible ✗'}` });

    // 4. Montant invest
    const invOk = invest >= 1_000_000 && invest < 50_000_000;
    checks.push({ ok: invOk, label: `Montant d'investissement : ${invest.toLocaleString()} MAD (doit être ≥ 1M et < 50M MAD)` });

    // 5. Financement propre
    const fpPct = invest > 0 ? (fp / invest) * 100 : 0;
    const fpOk  = fpPct >= 10;
    checks.push({ ok: fpOk, label: `Financement propre : ${fpPct.toFixed(1)}% (minimum 10%)` });

    // 6. Ratio emplois
    const ratio    = invest > 0 ? emplois / (invest / 1_000_000) : 0;
    const seuil    = isTourisme ? 1 : 1.5;
    const ratioOk  = ratio >= seuil;
    checks.push({ ok: ratioOk, label: `Ratio emplois stables : ${ratio.toFixed(2)} (minimum ${seuil} pour ${isTourisme ? 'tourisme' : 'secteur général'})` });

    const eligible = checks.every((c) => c.ok);
    setResult({ checks, eligible });
  }

  return (
    <div>
      <Breadcrumb items={[{ to: '/', label: 'Accueil' }, { label: 'Éligibilité' }]} />

      <div className={styles.page}>
        <div className={styles.inner}>
          <SectionHeader
            tag="Dispositif TPME"
            title="Vérifier l'éligibilité de mon entreprise"
            subtitle="Renseignez les informations de votre entreprise et de votre projet pour savoir si vous pouvez bénéficier du dispositif."
          />

          <div className={styles.layout}>
            {/* ── Form ── */}
            <div className={styles.formWrap}>
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Informations de l'entreprise</h3>
                <div className={styles.grid2}>
                  <FormGroup label="Forme juridique" required>
                    <Select value={form.forme} onChange={set('forme')}>
                      <option value="">Sélectionner...</option>
                      {['SA','SARL','SNC','Auto-entrepreneur','Autre'].map(f => (
                        <option key={f}>{f}</option>
                      ))}
                    </Select>
                  </FormGroup>
                  <FormGroup label="Entreprise nouvellement créée ?" required>
                    <Select value={form.isNew} onChange={set('isNew')}>
                      <option value="non">Non (plus de 3 ans)</option>
                      <option value="oui">Oui (moins de 3 ans)</option>
                    </Select>
                  </FormGroup>
                  {form.isNew === 'non' && (
                    <FormGroup label="Chiffre d'affaires annuel HT (MAD)" required>
                      <Input type="number" placeholder="Ex: 5000000" value={form.ca} onChange={set('ca')} min="0" />
                    </FormGroup>
                  )}
                  <FormGroup label="% capital détenu par société CA > 200M MAD">
                    <Input type="number" placeholder="0" value={form.cap} onChange={set('cap')} min="0" max="100" />
                  </FormGroup>
                  <FormGroup label="Actionnaire de droit public ?" required>
                    <Select value={form.hasPub} onChange={set('hasPub')}>
                      <option value="non">Non</option>
                      <option value="oui">Oui</option>
                    </Select>
                  </FormGroup>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Informations du projet</h3>
                <div className={styles.grid2}>
                  <FormGroup label="Montant total d'investissement (MAD)" required>
                    <Input type="number" placeholder="Ex: 8000000" value={form.invest} onChange={set('invest')} min="0" />
                  </FormGroup>
                  <FormGroup label="Financement propre (MAD)" required>
                    <Input type="number" placeholder="Ex: 800000" value={form.fp} onChange={set('fp')} min="0" />
                  </FormGroup>
                  <FormGroup label="Emplois stables prévus" required>
                    <Input type="number" placeholder="Ex: 15" value={form.emplois} onChange={set('emplois')} min="0" />
                  </FormGroup>
                  <FormGroup label="Secteur d'activité" required>
                    <Select value={form.secteur} onChange={set('secteur')}>
                      <option value="">Sélectionner...</option>
                      {SECTEURS.map(s => <option key={s}>{s}</option>)}
                    </Select>
                  </FormGroup>
                </div>
              </div>

              <Button variant="primary" size="lg" fullWidth onClick={verifier}>
                Vérifier l'éligibilité →
              </Button>

              {/* Result */}
              {result && (
                <div className={`${styles.resultBox} ${result.eligible ? styles.resultOk : styles.resultKo}`}>
                  <h3>{result.eligible ? '✅ Votre entreprise est éligible !' : '❌ Conditions non remplies'}</h3>
                  <p>{result.eligible
                    ? 'Vous pouvez déposer une demande d\'appui auprès du CRI de votre région.'
                    : 'Veuillez corriger les points ci-dessous avant de soumettre votre demande.'
                  }</p>
                  <div className={styles.checkList}>
                    {result.checks.map((c, i) => <CheckItem key={i} {...c} />)}
                  </div>
                  {result.eligible && (
                    <Button variant="primary" size="md" onClick={() => navigate('/simulateur')}>
                      Simuler mes primes →
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* ── Conditions sidebar ── */}
            <div className={styles.sidebar}>
              <div className={styles.sideCard} style={{ background: 'var(--navy-700)' }}>
                <h4 className={styles.sideTitle} style={{ color: 'white' }}>🏢 Conditions entreprise</h4>
                {[
                  'CA annuel HT entre 1M et 200M MAD',
                  'Capital par société > 200M MAD : max 25%',
                  'Aucun actionnaire de droit public',
                  'Entreprise nouvelle : exemptée de la condition CA',
                ].map((t) => (
                  <div key={t} className={styles.sideItem} style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)' }}>
                    {t}
                  </div>
                ))}
              </div>

              <div className={styles.sideCard}>
                <h4 className={styles.sideTitle}>📋 Conditions projet</h4>
                {[
                  'Investissement ≥ 1M MAD et < 50M MAD',
                  'Financement propre ≥ 10% du montant total',
                  'Ratio emplois stables ≥ 1,5 (≥ 1 tourisme)',
                  'Activité dans une branche éligible par région',
                ].map((t) => (
                  <div key={t} className={styles.sideItem}>{t}</div>
                ))}
              </div>

              <Alert type="info" title="Emploi stable">
                Tout nouvel emploi objet d'un contrat de travail d'au moins{' '}
                <strong>18 mois consécutifs</strong>, par des salariés de{' '}
                <strong>nationalité marocaine</strong> immatriculés à la CNSS.
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Eligibilite;