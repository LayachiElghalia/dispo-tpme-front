import { useState, useRef } from "react";
import styles from "../Styles/Visitordashboard.module.css";

const SECTEURS = [
  "Agriculture", "Agroalimentaire", "Artisanat", "BTP & Immobilier",
  "Commerce & Distribution", "Éducation & Formation", "Énergie & Environnement",
  "Industrie manufacturière", "Numérique & Tech", "Santé", "Services", "Tourisme", "Autre",
];

const MONTANTS = [
  "Moins de 100 000 MAD", "100 000 – 500 000 MAD",
  "500 000 – 1 000 000 MAD", "1 000 000 – 5 000 000 MAD", "Plus de 5 000 000 MAD",
];

const DUREES = ["6 mois", "1 an", "2 ans", "3 ans", "5 ans", "Plus de 5 ans"];

const STEPS = [
  { key: "perso",      label: "Informations personnelles" },
  { key: "entreprise", label: "Informations entreprise"   },
  { key: "projet",     label: "Projet & financement"      },
  { key: "recap",      label: "Récapitulatif"             },
];

const EMPTY = {
  // perso
  nom: "", prenom: "", cin: "", email: "", tel: "", ville: "", adresse: "",
  // entreprise
  raisonSociale: "", formeJuridique: "", rc: "", ice: "", secteur: "",
  activite: "", dateCreation: "", effectif: "", ca: "",
  // projet
  titreProjet: "", description: "", montant: "", duree: "",
  objectif: "", garanties: "",
};

function Field({ label, required, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}{required && <span className={styles.req}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ name, value, onChange, type = "text", placeholder, ...rest }) {
  return (
    <input
      className={styles.input}
      type={type} name={name} value={value}
      onChange={onChange} placeholder={placeholder}
      {...rest}
    />
  );
}

function Select({ name, value, onChange, options, placeholder }) {
  return (
    <select className={styles.select} name={name} value={value} onChange={onChange}>
      <option value="">{placeholder || "Sélectionner..."}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Textarea({ name, value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      className={styles.textarea}
      name={name} value={value} onChange={onChange}
      placeholder={placeholder} rows={rows}
    />
  );
}

// ── Recap row ─────────────────────────────────────────────────────────────
function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className={styles.recapRow}>
      <span className={styles.recapLabel}>{label}</span>
      <span className={styles.recapValue}>{value}</span>
    </div>
  );
}

function VisitorDashboard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ── Validation per step
  const validate = () => {
    const err = {};
    if (step === 0) {
      if (!form.nom)    err.nom    = "Requis";
      if (!form.prenom) err.prenom = "Requis";
      if (!form.email)  err.email  = "Requis";
      if (!form.tel)    err.tel    = "Requis";
    }
    if (step === 1) {
      if (!form.raisonSociale) err.raisonSociale = "Requis";
      if (!form.secteur)       err.secteur       = "Requis";
      if (!form.activite)      err.activite      = "Requis";
    }
    if (step === 2) {
      if (!form.titreProjet)  err.titreProjet  = "Requis";
      if (!form.description)  err.description  = "Requis";
      if (!form.montant)      err.montant      = "Requis";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, 3)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // ── PDF export using print dialog (no external lib needed)
  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"),
        import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"),
      ]);
      const el = printRef.current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#fff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgH = pageW / ratio;
      let posY = 0;
      if (imgH <= pageH) {
        pdf.addImage(imgData, "PNG", 0, 0, pageW, imgH);
      } else {
        let remaining = imgH;
        while (remaining > 0) {
          pdf.addImage(imgData, "PNG", 0, posY, pageW, imgH);
          remaining -= pageH;
          posY -= pageH;
          if (remaining > 0) pdf.addPage();
        }
      }
      pdf.save(`dossier_${form.nom || "visiteur"}_${form.prenom || ""}.pdf`);
    } catch {
      // Fallback: print dialog
      window.print();
    } finally {
      setPdfLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Dossier soumis avec succès !</h2>
          <p className={styles.successSub}>
            Merci {form.prenom} {form.nom}. Notre équipe vous contactera sous 48h à l'adresse <strong>{form.email}</strong>.
          </p>
          <button className={styles.btn} onClick={() => { setForm(EMPTY); setStep(0); setSubmitted(false); }}>
            Nouveau dossier
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Print/PDF area ── */}
      <style>{`
        @media print {
          body > *:not(#print-area) { display: none !important; }
          #print-area { display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className={`${styles.header} no-print`}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#fff2"/>
              <path d="M8 22L13 10L18 17L21 13L24 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.brandName}>TPME Invest</span>
        </div>
        <p className={styles.headerSub}>Formulaire d'inscription & prise de contact</p>
      </header>

      {/* ── Stepper ── */}
      <div className={`${styles.stepper} no-print`}>
        {STEPS.map((s, i) => (
          <div key={s.key} className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${i < step ? styles.stepDone : i === step ? styles.stepActive : ""}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ""}`}>{s.label}</span>
            {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ""}`} />}
          </div>
        ))}
      </div>

      {/* ── Form card ── */}
      <div className={`${styles.card} no-print`}>

        {/* Step 0 — Infos personnelles */}
        {step === 0 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Informations personnelles</h2>
            <div className={styles.grid2}>
              <Field label="Nom" required><Input name="nom" value={form.nom} onChange={handleChange} placeholder="Ex : Belhaj" />{errors.nom && <p className={styles.err}>{errors.nom}</p>}</Field>
              <Field label="Prénom" required><Input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Ex : Amina" />{errors.prenom && <p className={styles.err}>{errors.prenom}</p>}</Field>
              <Field label="CIN"><Input name="cin" value={form.cin} onChange={handleChange} placeholder="Ex : AB123456" /></Field>
              <Field label="Téléphone" required><Input name="tel" value={form.tel} onChange={handleChange} placeholder="Ex : 06 12 34 56 78" />{errors.tel && <p className={styles.err}>{errors.tel}</p>}</Field>
              <Field label="Email" required><Input name="email" value={form.email} onChange={handleChange} type="email" placeholder="vous@exemple.com" />{errors.email && <p className={styles.err}>{errors.email}</p>}</Field>
              <Field label="Ville"><Input name="ville" value={form.ville} onChange={handleChange} placeholder="Ex : Casablanca" /></Field>
            </div>
            <Field label="Adresse complète"><Input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Rue, quartier, code postal..." /></Field>
          </div>
        )}

        {/* Step 1 — Infos entreprise */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Informations entreprise</h2>
            <div className={styles.grid2}>
              <Field label="Raison sociale" required>
                <Input name="raisonSociale" value={form.raisonSociale} onChange={handleChange} placeholder="Nom de votre entreprise" />
                {errors.raisonSociale && <p className={styles.err}>{errors.raisonSociale}</p>}
              </Field>
              <Field label="Forme juridique">
                <Select name="formeJuridique" value={form.formeJuridique} onChange={handleChange}
                  options={["Auto-entrepreneur","SARL","SA","SNC","SCS","Autre"]} />
              </Field>
              <Field label="RC (N° registre)"><Input name="rc" value={form.rc} onChange={handleChange} placeholder="Ex : 12345" /></Field>
              <Field label="ICE"><Input name="ice" value={form.ice} onChange={handleChange} placeholder="Ex : 001234567000012" /></Field>
              <Field label="Secteur d'activité" required>
                <Select name="secteur" value={form.secteur} onChange={handleChange} options={SECTEURS} />
                {errors.secteur && <p className={styles.err}>{errors.secteur}</p>}
              </Field>
              <Field label="Date de création"><Input name="dateCreation" value={form.dateCreation} onChange={handleChange} type="date" /></Field>
              <Field label="Effectif (employés)">
                <Select name="effectif" value={form.effectif} onChange={handleChange}
                  options={["1 (Auto-entrepreneur)","2 – 5","6 – 10","11 – 50","51 – 200","200+"]} />
              </Field>
              <Field label="Chiffre d'affaires annuel (MAD)">
                <Input name="ca" value={form.ca} onChange={handleChange} placeholder="Ex : 500 000" />
              </Field>
            </div>
            <Field label="Description de l'activité" required>
              <Textarea name="activite" value={form.activite} onChange={handleChange}
                placeholder="Décrivez brièvement votre activité principale..." />
              {errors.activite && <p className={styles.err}>{errors.activite}</p>}
            </Field>
          </div>
        )}

        {/* Step 2 — Projet & financement */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Projet & financement</h2>
            <Field label="Titre du projet" required>
              <Input name="titreProjet" value={form.titreProjet} onChange={handleChange} placeholder="Ex : Extension de l'atelier de production" />
              {errors.titreProjet && <p className={styles.err}>{errors.titreProjet}</p>}
            </Field>
            <div className={styles.grid2}>
              <Field label="Montant demandé" required>
                <Select name="montant" value={form.montant} onChange={handleChange} options={MONTANTS} />
                {errors.montant && <p className={styles.err}>{errors.montant}</p>}
              </Field>
              <Field label="Durée de remboursement souhaitée">
                <Select name="duree" value={form.duree} onChange={handleChange} options={DUREES} />
              </Field>
            </div>
            <Field label="Description du projet" required>
              <Textarea name="description" value={form.description} onChange={handleChange} rows={4}
                placeholder="Décrivez votre projet, ses objectifs, et comment le financement sera utilisé..." />
              {errors.description && <p className={styles.err}>{errors.description}</p>}
            </Field>
            <Field label="Objectifs & retombées attendues">
              <Textarea name="objectif" value={form.objectif} onChange={handleChange} rows={3}
                placeholder="Emplois créés, croissance du CA, nouveaux marchés..." />
            </Field>
            <Field label="Garanties proposées">
              <Textarea name="garanties" value={form.garanties} onChange={handleChange} rows={3}
                placeholder="Biens immobiliers, matériels, cautions personnelles..." />
            </Field>
          </div>
        )}

        {/* Step 3 — Récapitulatif */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Récapitulatif de votre dossier</h2>
            <p className={styles.stepSub}>Vérifiez vos informations avant de soumettre ou d'exporter.</p>

            {/* Action buttons */}
            <div className={styles.exportRow}>
              <button className={styles.btnOutline} onClick={handlePrint}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                Imprimer
              </button>
              <button className={styles.btnOutline} onClick={handleDownloadPDF} disabled={pdfLoading}>
                {pdfLoading ? <span className={styles.spinner} /> : (
                  <>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger PDF
                  </>
                )}
              </button>
            </div>

            {/* Printable recap */}
            <div ref={printRef} id="print-area" className={styles.printArea}>
              <div className={styles.printHeader}>
                <div className={styles.printLogo}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="#0A1230"/>
                    <path d="M8 22L13 10L18 17L21 13L24 22" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={styles.printBrandName}>TPME Invest</span>
                </div>
                <div className={styles.printMeta}>
                  <p className={styles.printDocTitle}>Dossier d'inscription & prise de contact</p>
                  <p className={styles.printDate}>Date : {new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}</p>
                </div>
              </div>

              <div className={styles.printSection}>
                <p className={styles.printSectionTitle}>1. Informations personnelles</p>
                <div className={styles.printGrid}>
                  <Row label="Nom complet"    value={`${form.prenom} ${form.nom}`} />
                  <Row label="CIN"            value={form.cin} />
                  <Row label="Email"          value={form.email} />
                  <Row label="Téléphone"      value={form.tel} />
                  <Row label="Ville"          value={form.ville} />
                  <Row label="Adresse"        value={form.adresse} />
                </div>
              </div>

              <div className={styles.printSection}>
                <p className={styles.printSectionTitle}>2. Informations entreprise</p>
                <div className={styles.printGrid}>
                  <Row label="Raison sociale"   value={form.raisonSociale} />
                  <Row label="Forme juridique"  value={form.formeJuridique} />
                  <Row label="RC"               value={form.rc} />
                  <Row label="ICE"              value={form.ice} />
                  <Row label="Secteur"          value={form.secteur} />
                  <Row label="Date création"    value={form.dateCreation} />
                  <Row label="Effectif"         value={form.effectif} />
                  <Row label="CA annuel (MAD)"  value={form.ca} />
                </div>
                {form.activite && (
                  <div className={styles.printBlock}>
                    <p className={styles.printBlockLabel}>Description de l'activité</p>
                    <p className={styles.printBlockText}>{form.activite}</p>
                  </div>
                )}
              </div>

              <div className={styles.printSection}>
                <p className={styles.printSectionTitle}>3. Projet & financement</p>
                <div className={styles.printGrid}>
                  <Row label="Titre du projet"   value={form.titreProjet} />
                  <Row label="Montant demandé"   value={form.montant} />
                  <Row label="Durée souhaitée"   value={form.duree} />
                </div>
                {form.description && (
                  <div className={styles.printBlock}>
                    <p className={styles.printBlockLabel}>Description du projet</p>
                    <p className={styles.printBlockText}>{form.description}</p>
                  </div>
                )}
                {form.objectif && (
                  <div className={styles.printBlock}>
                    <p className={styles.printBlockLabel}>Objectifs & retombées</p>
                    <p className={styles.printBlockText}>{form.objectif}</p>
                  </div>
                )}
                {form.garanties && (
                  <div className={styles.printBlock}>
                    <p className={styles.printBlockLabel}>Garanties proposées</p>
                    <p className={styles.printBlockText}>{form.garanties}</p>
                  </div>
                )}
              </div>

              <div className={styles.printFooter}>
                <div className={styles.printSigBox}>
                  <p className={styles.printSigLabel}>Signature du demandeur</p>
                  <div className={styles.printSigLine} />
                  <p className={styles.printSigName}>{form.prenom} {form.nom}</p>
                </div>
                <div className={styles.printSigBox}>
                  <p className={styles.printSigLabel}>Cachet & visa CRI</p>
                  <div className={styles.printSigLine} />
                  <p className={styles.printSigName}>Responsable CRI</p>
                </div>
              </div>

              <p className={styles.printDisclaimer}>
                Document généré via TPME Invest — CRI Casablanca-Settat · Ce document est confidentiel et destiné à usage interne uniquement.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={styles.navRow}>
          {step > 0 && (
            <button className={styles.btnGhost} onClick={prev}>← Précédent</button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button className={styles.btn} onClick={next}>
              Suivant →
            </button>
          ) : (
            <button className={styles.btnGreen} onClick={() => setSubmitted(true)}>
              ✓ Soumettre le dossier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisitorDashboard;