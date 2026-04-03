// pages/Dossier.jsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCUMENTS_REQUIS } from '../data/index.js';
import { SectionHeader, Breadcrumb, Button, Alert } from '../Components/Index.jsx';
import styles from '../Styles/Dossier.module.css';
{/*import pin from '../Assets/pin.png';
import money from '../Assets/money-bag.png';
import planning from '../Assets/planning.png';
import location from '../Assets/location.png';
import factory from '../Assets/factory.png';
import building from '../Assets/building.png';*/}

 function Dossier() {
  const navigate  = useNavigate();
  const [checked, setChecked] = useState(new Set());
  const [files,   setFiles]   = useState([]);
  const [dragging, setDragging] = useState(false);

  const toggleDoc = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const handleFiles = (e) => setFiles((prev) => [...prev, ...Array.from(e.target.files)]);

  const progress = Math.round((checked.size / DOCUMENTS_REQUIS.length) * 100);

  return (
    <div>
      <Breadcrumb items={[{ to: '/', label: 'Accueil' }, { label: 'Préparer mon dossier' }]} />

      <div className={styles.page}>
        <div className={styles.inner}>
          <SectionHeader
            tag="Dossier de demande"
            title="Pièces nécessaires à la demande d'appui"
            subtitle="Préparez l'ensemble des documents requis. Cochez chaque document une fois qu'il est prêt."
          />

          {/* Progress bar */}
          <div className={styles.progressWrap}>
            <div className={styles.progressTop}>
              <span className={styles.progressLabel}>
                {checked.size} / {DOCUMENTS_REQUIS.length} documents prêts
              </span>
              <span className={styles.progressPct}>{progress}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%`, background: progress === 100 ? 'var(--green-600)' : 'var(--navy-700)' }}
              />
            </div>
          </div>

          <Alert type="info" title="Téléchargement">
              La déclaration est disponible sur{' '}
              <a href="https://www.cri-invest.ma" target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                www.cri-invest.ma
              </a>
            </Alert>

          {/* Document checklist */}
          <div className={styles.docGrid}>
            {DOCUMENTS_REQUIS.map((doc) => {
              const done = checked.has(doc.id);
              return (
                <button
                  key={doc.id}
                  className={`${styles.docCard} ${done ? styles.docCardDone : ''}`}
                  onClick={() => toggleDoc(doc.id)}
                >
                  <div className={`${styles.docIcon} ${done ? styles.docIconDone : ''}`}>
                    {done ? '✓' : '📄'}
                  </div>
                  <div className={styles.docInfo}>
                    <h4>{doc.label}</h4>
                   {doc.fileUrl ? (
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // IMPORTANT
              className={styles.link}
            >
              {doc.desc}
            </a>
          ) : (
            <p>{doc.desc}</p>
          )}
        </div>
      </button>
    );
  })}
</div>

          {/* Declaration note */}
          <div className={styles.declarationBox}>
            <h3>La déclaration doit contenir :</h3>
            <div className={styles.declarationGrid}>
              {[
                ['📌', 'Nature du projet d\'investissement'],
                ['💰', 'Montant et ventilation en rubriques'],
                ['📅', 'Planning de réalisation'],
                ['📍', 'Lieu de réalisation'],
                ['👷', 'Nombre d\'emplois stables prévus'],
                ['🏭', 'Branche d\'activité'],
                ['🏦', 'Mode de financement'],
              ].map(([icon, text]) => (
                <div key={text} className={styles.declarationItem}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
            
          </div>

          {/* Upload zone */}
          {/* <div
            className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <div className={styles.dropIcon}>📎</div>
            <h4>Glisser-déposer vos fichiers ici</h4>
            <p>ou cliquez pour parcourir (PDF, JPG, PNG — max 10 Mo par fichier)</p>
            <input
              id="file-input" type="file" multiple
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={handleFiles}
            />
          </div> */}

          {files.length > 0 && (
            <div className={styles.fileList}>
              <h4>Fichiers sélectionnés ({files.length})</h4>
              {files.map((f, i) => (
                <div key={i} className={styles.fileRow}>
                  <span>📄 {f.name}</span>
                  <span className={styles.fileSize}>{(f.size / 1024).toFixed(0)} Ko</span>
                </div>
              ))}
            </div>
          )}

         {/*} <div className={styles.actions}>
            <Button variant="ghost" onClick={() => navigate('/etapes')}>Voir les étapes</Button>
            <Button variant="primary" onClick={() => navigate('/espace')}>
              Déposer ma demande →
            </Button>
          </div>*/}
        </div>
      </div>
    </div>
  );
}

export default Dossier;