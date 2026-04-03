import { useState, useMemo } from 'react';
import styles from '../Styles/CalculateurPrimes.module.css';

// ─── Données extraites de l'Excel ──────────────────────────────────────────

const SECTEURS_BRANCHES = {
  "Agriculture, sylviculture et pêche": [
    "Aquaculture en mer et zone littorale",
    "Aquaculture en eau douce",
    "Traitement & valorisation des produits aquacoles",
  ],
  "Industries extractives": [
    "Extraction de minerais métalliques",
    "Services de soutien aux industries extractives",
    "Valorisation et transformation des produits miniers",
  ],
  "Industrie manufacturière": [
    "Industries alimentaires",
    "Fabrication de boissons",
    "Fabrication de produits à base de tabac",
    "Fabrication de textiles",
    "Industrie de l'habillement",
    "Industrie du cuir et de la chaussure",
    "Travail du bois et fabrication d'articles en bois, en liège, en vannerie ou sparterie",
    "Industrie du papier et du carton",
    "Imprimerie et reproduction d'enregistrements",
    "Industrie chimique",
    "Industrie pharmaceutique",
    "Industrie de fabrication des dispositifs médicaux et de matériel biomédical",
    "Fabrication de produits en caoutchouc et en plastique",
    "Fabrication d'autres produits minéraux non métalliques",
    "Métallurgie",
    "Fabrication de produits métalliques, à l'exception des machines et des équipements",
    "Fabrication de produits informatiques, électroniques et optiques",
    "Fabrication de produits et d'équipements électriques",
    "Fabrication de machines et équipements non classés ailleurs",
    "Industrie automobile",
    "Fabrication d'autres matériels de transport",
    "Fabrication de meubles",
    "Autres industries manufacturières",
    "Réparation et installation de machines et d'équipements",
    "Industrie des énergies renouvelables",
    "Ingénierie et prestations techniques liées à l'industrie",
    "Services de soutien aux activités industrielles",
  ],
  "Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné": [
    "Production d'électricité à base d'énergie renouvelable",
  ],
  "Production et distribution d'eau, assainissement, gestion des déchets et dépollution": [
    "Recyclage, transformation et valorisation des déchets autres qu'importés",
    "Collecte, traitement et élimination des déchets dangereux",
    "Dépollution et autres services de gestion des déchets non ménagers",
  ],
  "Transports et entreposage": [
    "Entreposage et services auxiliaires des transports",
    "Activités de poste et de courrier",
  ],
  "Hébergement et restauration": [
    "Établissements d'hébergement touristique classés",
    "Restauration touristique",
  ],
  "Artisanat": [
    "Artisanat de production d'art et utilitaire",
  ],
  "Information et communication": [
    "Édition",
    "Production de films cinématographiques, de vidéo et de programmes de télévision",
    "Programmation et diffusion",
    "Installation des infrastructures de télécommunications",
    "Programmation, conseil et autres activités informatiques",
    "Services de l'information : outsourcing, centres d'appels, IA, datacenters",
  ],
  "Activités spécialisées, scientifiques et techniques": [
    "Activités de contrôle et d'analyse technique",
  ],
  "Enseignement": [
    "Formation professionnelle",
  ],
  "Santé humaine et action sociale": [
    "Activités pour la santé humaine",
  ],
  "Arts, spectacles et activités récréatives": [
    "Activités créatives, artistiques et de spectacle",
    "Activités récréatives et de loisirs",
  ],
  "Autres activités de service": [
    "Réparation d'ordinateurs, d'équipements et de biens personnels et domestiques",
  ],
};

const BRANCHES_PRIORITAIRES = new Set([
  "Aquaculture en mer et zone littorale",
  "Aquaculture en eau douce",
  "Traitement & valorisation des produits aquacoles",
  "Industries alimentaires",
  "Fabrication de boissons",
  "Fabrication de textiles",
  "Industrie de l'habillement",
  "Industrie du cuir et de la chaussure",
  "Travail du bois et fabrication d'articles en bois, en liège, en vannerie ou sparterie",
  "Industrie du papier et du carton",
  "Imprimerie et reproduction d'enregistrements",
  "Industrie chimique",
  "Industrie pharmaceutique",
  "Fabrication de produits en caoutchouc et en plastique",
  "Fabrication d'autres produits minéraux non métalliques",
  "Métallurgie",
  "Fabrication de produits métalliques, à l'exception des machines et des équipements",
  "Fabrication de produits informatiques, électroniques et optiques",
  "Fabrication de produits et d'équipements électriques",
  "Fabrication de machines et équipements non classés ailleurs",
  "Industrie automobile",
  "Fabrication de meubles",
  "Autres industries manufacturières",
  "Industrie des énergies renouvelables",
  "Recyclage, transformation et valorisation des déchets autres qu'importés",
  "Entreposage et services auxiliaires des transports",
  "Établissements d'hébergement touristique classés",
  "Restauration touristique",
  "Artisanat de production d'art et utilitaire",
  "Services de l'information : outsourcing, centres d'appels, IA, datacenters",
  "Formation professionnelle",
  "Activités créatives, artistiques et de spectacle",
  "Activités récréatives et de loisirs",
]);

const SECTEURS_TOURISME = new Set(["Hébergement et restauration"]);

const PROVINCES_LSH = {
  "Laâyoune": "A",
  "Boujdour": "B",
  "Es-Semara": "B",
  "Tarfaya": "B",
};

// ─── Utilitaires ───────────────────────────────────────────────────────────

function formatMAD(n) {
  if (!n && n !== 0) return '—';
  return Math.round(n).toLocaleString('fr-MA') + ' MAD';
}

function calcPrimes({ investissement, emplois, province, branche, secteur, activitePrioritaire }) {
  const inv = parseFloat(investissement) || 0;
  const emp = parseInt(emplois) || 0;
  if (inv <= 0) return null;

  const primable = Math.min(inv, 50_000_000);
  const ratio = inv > 0 ? emp / (inv / 1_000_000) : 0;
  const isTourisme = SECTEURS_TOURISME.has(secteur);
  const seuilMin = isTourisme ? 1 : 1.5;
  const ratioEligible = ratio >= seuilMin;

  let pctEmploi = 0;
  if (ratioEligible) {
    if (ratio >= 2  && ratio <= 5)  pctEmploi = 5;
    if (ratio > 5   && ratio <= 10) pctEmploi = 7;
    if (ratio > 10)                  pctEmploi = 10;
  }

  const categorie = PROVINCES_LSH[province] || null;
  const pctTerrit = categorie === 'A' ? 10 : categorie === 'B' ? 15 : 0;
  const pctPrio   = activitePrioritaire && BRANCHES_PRIORITAIRES.has(branche) ? 10 : 0;
  const pctTotal  = Math.min(pctEmploi + pctTerrit + pctPrio, 30);
  const montantTotal = (primable * pctTotal) / 100;

  return {
    primable, ratio: Math.round(ratio * 100) / 100,
    ratioEligible, seuilMin, categorie,
    pctEmploi, pctTerrit, pctPrio, pctTotal,
    montantEmploi: (primable * pctEmploi) / 100,
    montantTerrit: (primable * pctTerrit) / 100,
    montantPrio:   (primable * pctPrio)   / 100,
    montantTotal,
    estPrioritaire: BRANCHES_PRIORITAIRES.has(branche),
  };
}

// ─── Composant ─────────────────────────────────────────────────────────────

export default function CalculateurPrimes() {
  const [form, setForm] = useState({
    secteur: '', branche: '', province: '',
    investissement: '', emplois: '', activitePrioritaire: false,
  });
  const [errors,     setErrors]     = useState({});
  const [calculated, setCalculated] = useState(false);

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      ...(key === 'secteur' ? { branche: '' } : {}),
    }));

  const branches       = form.secteur ? SECTEURS_BRANCHES[form.secteur] || [] : [];
  const estPrioritaire = BRANCHES_PRIORITAIRES.has(form.branche);

  // ── Validation ──────────────────────────────────────────────────────────
  const handleCalculer = () => {
    const newErrors = {};
    const inv = parseFloat(form.investissement) || 0;
    const emp = parseInt(form.emplois)          || 0;

    if (!form.secteur)
      newErrors.secteur = "Veuillez sélectionner un secteur d'activité.";

    if (!form.branche)
      newErrors.branche = "Veuillez sélectionner une branche d'activité.";

    if (!form.province)
      newErrors.province = "Veuillez sélectionner une province.";

    if (!form.investissement || inv <= 0)
      newErrors.investissement = "Veuillez saisir un montant d'investissement.";
    else if (inv < 1_000_000)
      newErrors.investissement = "Le montant minimum est 1 000 000 MAD.";
    else if (inv >= 50_000_000)
      newErrors.investissement = "Le montant doit être inférieur à 50 000 000 MAD.";

    if (!form.emplois || emp < 1)
      newErrors.emplois = "Veuillez saisir au moins 1 emploi stable prévu.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setCalculated(true);
    } else {
      setCalculated(false);
    }
  };

  const handleReset = () => {
    setForm({ secteur: '', branche: '', province: '', investissement: '', emplois: '', activitePrioritaire: false });
    setErrors({});
    setCalculated(false);
  };

  const result = useMemo(() => {
    if (!calculated) return null;
    return calcPrimes(form);
  }, [form, calculated]);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.tag}>Outil de simulation</span>
          <h2 className={styles.title}>Calculateur de primes TPME</h2>
          <div className={styles.divider} />
          <p className={styles.subtitle}>
            Sélectionnez votre secteur et votre branche d'activité, renseignez les paramètres
            de votre projet et obtenez une estimation instantanée de vos primes.
          </p>
        </div>

        <div className={styles.layout}>

          {/* ── Formulaire ── */}
          <div className={styles.formCard}>

            {/* Étape 1 — Activité */}
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNum}>1</span>
                <h3>Votre activité</h3>
              </div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label>Secteur d'activité <span className={styles.req}>*</span></label>
                  <select
                    value={form.secteur}
                    onChange={set('secteur')}
                    className={errors.secteur ? styles.inputError : ''}
                  >
                    <option value="">-- Sélectionner --</option>
                    {Object.keys(SECTEURS_BRANCHES).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.secteur && <span className={styles.errorMsg}>⚠ {errors.secteur}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Branche d'activité <span className={styles.req}>*</span></label>
                  <select
                    value={form.branche}
                    onChange={set('branche')}
                    disabled={!form.secteur}
                    className={errors.branche ? styles.inputError : ''}
                  >
                    <option value="">-- Sélectionner --</option>
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {errors.branche && <span className={styles.errorMsg}>⚠ {errors.branche}</span>}
                </div>
              </div>

              {form.branche && (
                <div className={`${styles.prioritaireBadge} ${estPrioritaire ? styles.prioritaireOui : styles.prioritaireNon}`}>
                  {estPrioritaire ? (
                    <><span className={styles.badgeIcon}>⚡</span> Cette branche est une <strong>activité prioritaire</strong> — prime supplémentaire de 10% éligible</>
                  ) : (
                    <><span className={styles.badgeIcon}>ℹ️</span> Cette branche n'est pas classée activité prioritaire</>
                  )}
                </div>
              )}

              {estPrioritaire && (
                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={form.activitePrioritaire}
                    onChange={set('activitePrioritaire')}
                  />
                  <span>Inclure la prime activités prioritaires (+10%)</span>
                </label>
              )}
            </div>

            {/* Étape 2 — Localisation */}
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNum}>2</span>
                <h3>Localisation du projet</h3>
              </div>
              <div className={styles.formGroup}>
                <label>Province / Préfecture (Région Laâyoune-Sakia El Hamra) <span className={styles.req}>*</span></label>
                <select
                  value={form.province}
                  onChange={set('province')}
                  className={errors.province ? styles.inputError : ''}
                >
                  <option value="">-- Sélectionner --</option>
                  {Object.entries(PROVINCES_LSH).map(([p, cat]) => (
                    <option key={p} value={p}>{p} — Catégorie {cat} ({cat === 'A' ? '+10%' : '+15%'})</option>
                  ))}
                </select>
                {errors.province && <span className={styles.errorMsg}>⚠ {errors.province}</span>}
              </div>

              {form.province && (
                <div className={`${styles.categorieBadge} ${PROVINCES_LSH[form.province] === 'A' ? styles.catA : styles.catB}`}>
                  Province <strong>{form.province}</strong> — Catégorie territoriale{' '}
                  <strong>{PROVINCES_LSH[form.province]}</strong> →{' '}
                  Prime territoriale de <strong>{PROVINCES_LSH[form.province] === 'A' ? '10%' : '15%'}</strong>
                </div>
              )}
            </div>

            {/* Étape 3 — Projet */}
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNum}>3</span>
                <h3>Paramètres du projet</h3>
              </div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label>Montant d'investissement (MAD) <span className={styles.req}>*</span></label>
                  <input
                    type="number"
                    placeholder="Ex: 5 000 000"
                    min="1000000"
                    max="49999999"
                    value={form.investissement}
                    onChange={set('investissement')}
                    className={errors.investissement ? styles.inputError : ''}
                  />
                  <span className={styles.hint}>Entre 1 000 000 et 50 000 000 MAD</span>
                  {errors.investissement && <span className={styles.errorMsg}>⚠ {errors.investissement}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Emplois stables prévus <span className={styles.req}>*</span></label>
                  <input
                    type="number"
                    placeholder="Ex: 15"
                    min="1"
                    value={form.emplois}
                    onChange={set('emplois')}
                    className={errors.emplois ? styles.inputError : ''}
                  />
                  <span className={styles.hint}>CDI ≥ 18 mois, salariés marocains immatriculés CNSS</span>
                  {errors.emplois && <span className={styles.errorMsg}>⚠ {errors.emplois}</span>}
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={handleReset}>
                Réinitialiser
              </button>
              <button className={styles.btnPrimary} onClick={handleCalculer}>
                Calculer mes primes →
              </button>
            </div>
          </div>

          {/* ── Résultats ── */}
          <div className={styles.resultPanel}>
            {!result ? (
              <div className={styles.resultEmpty}>
                <div className={styles.emptyIcon}>🧮</div>
                <p>Remplissez le formulaire et cliquez sur<br /><strong>« Calculer mes primes »</strong></p>
                <p className={styles.emptyNote}>
                  Simulation basée sur la Nouvelle Charte de l'Investissement — Décret n°2.25.342
                </p>
              </div>
            ) : (
              <div className={styles.resultContent}>

                {/* Total */}
                <div className={styles.totalBox}>
                  <div className={styles.totalLabel}>Prime totale estimée</div>
                  <div className={styles.totalAmount}>{formatMAD(result.montantTotal)}</div>
                  <div className={styles.totalPct}>{result.pctTotal}% du montant primable</div>
                  <div className={styles.totalBar}>
                    <div className={styles.totalBarFill} style={{ width: `${(result.pctTotal / 30) * 100}%` }} />
                  </div>
                  <div className={styles.totalMax}>Plafond : 30%</div>
                </div>

                {/* Détail 3 primes */}
                <div className={styles.primesDetail}>

                  <div className={`${styles.primeItem} ${result.pctEmploi > 0 ? styles.primeItemActive : styles.primeItemInactive}`}>
                    <div className={styles.primeItemHeader}>
                      <span className={styles.primeItemIcon}>👷</span>
                      <div>
                        <div className={styles.primeItemTitle}>Prime création d'emplois stables</div>
                        <div className={styles.primeItemSub}>
                          Ratio : {result.ratio} emplois/MMAD —{' '}
                          {result.ratioEligible
                            ? <span className={styles.ok}>✓ Éligible</span>
                            : <span className={styles.ko}>✗ Ratio insuffisant (min {result.seuilMin})</span>
                          }
                        </div>
                      </div>
                      <div className={styles.primeItemPct}>{result.pctEmploi}%</div>
                    </div>
                    <div className={styles.primeItemBar}>
                      <div style={{ width: `${(result.pctEmploi / 10) * 100}%` }} />
                    </div>
                    <div className={styles.primeItemAmount}>{formatMAD(result.montantEmploi)}</div>
                  </div>

                  <div className={`${styles.primeItem} ${result.pctTerrit > 0 ? styles.primeItemActive : styles.primeItemInactive}`}>
                    <div className={styles.primeItemHeader}>
                      <span className={styles.primeItemIcon}>🗺️</span>
                      <div>
                        <div className={styles.primeItemTitle}>Prime territoriale</div>
                        <div className={styles.primeItemSub}>
                          Province {form.province} —{' '}
                          {result.categorie
                            ? <span className={styles.ok}>Catégorie {result.categorie} ✓</span>
                            : <span className={styles.ko}>Hors catégorie</span>
                          }
                        </div>
                      </div>
                      <div className={styles.primeItemPct}>{result.pctTerrit}%</div>
                    </div>
                    <div className={styles.primeItemBar}>
                      <div style={{ width: `${(result.pctTerrit / 15) * 100}%` }} />
                    </div>
                    <div className={styles.primeItemAmount}>{formatMAD(result.montantTerrit)}</div>
                  </div>

                  <div className={`${styles.primeItem} ${result.pctPrio > 0 ? styles.primeItemActive : styles.primeItemInactive}`}>
                    <div className={styles.primeItemHeader}>
                      <span className={styles.primeItemIcon}>⚡</span>
                      <div>
                        <div className={styles.primeItemTitle}>Prime activités prioritaires</div>
                        <div className={styles.primeItemSub}>
                          {result.estPrioritaire
                            ? form.activitePrioritaire
                              ? <span className={styles.ok}>Branche prioritaire — incluse ✓</span>
                              : <span className={styles.warn}>Branche prioritaire — non cochée</span>
                            : <span className={styles.ko}>Branche non prioritaire</span>
                          }
                        </div>
                      </div>
                      <div className={styles.primeItemPct}>{result.pctPrio}%</div>
                    </div>
                    <div className={styles.primeItemBar}>
                      <div style={{ width: `${(result.pctPrio / 10) * 100}%` }} />
                    </div>
                    <div className={styles.primeItemAmount}>{formatMAD(result.montantPrio)}</div>
                  </div>
                </div>

                {/* Récap */}
                <div className={styles.recap}>
                  <div className={styles.recapTitle}>Paramètres utilisés</div>
                  <div className={styles.recapGrid}>
                    <div className={styles.recapItem}>
                      <span>Montant primable</span>
                      <strong>{formatMAD(result.primable)}</strong>
                    </div>
                    <div className={styles.recapItem}>
                      <span>Secteur</span>
                      <strong>{form.secteur}</strong>
                    </div>
                    <div className={styles.recapItem}>
                      <span>Branche</span>
                      <strong>{form.branche}</strong>
                    </div>
                    <div className={styles.recapItem}>
                      <span>Province</span>
                      <strong>{form.province} (cat. {result.categorie || 'Aucune'})</strong>
                    </div>
                  </div>
                </div>

                <p className={styles.disclaimer}>
                  ⚠️ Simulation indicative. Le montant définitif est arrêté après approbation de la CRUI.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}