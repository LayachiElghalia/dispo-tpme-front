import { useEffect, useMemo, useState } from "react";
import styles from "../Styles/Dashboard.module.css";
import LogoTPME from "./Logotpme.jsx";

// ── Mock Data for dossiers only ────────────────────────────────────────────
const MOCK_DOSSIERS = [
  { id: 1, nom: "Sara El Idrissi",  matricule: "CRI-0063", fichier: "dossier_elidrissi.pdf",  date: "2025-04-01", statut: "validé" },
  { id: 2, nom: "Omar Benjelloun",  matricule: "CRI-0091", fichier: "dossier_benjelloun.pdf", date: "2025-04-01", statut: "en attente" },
  { id: 3, nom: "Karim Tazi",       matricule: "CRI-0042", fichier: "dossier_tazi.pdf",       date: "2025-03-31", statut: "validé" },
  { id: 4, nom: "Fatima Zohra",     matricule: "CRI-0028", fichier: "dossier_zohra.pdf",      date: "2025-03-31", statut: "rejeté" },
  { id: 5, nom: "Nadia Cherkaoui",  matricule: "CRI-0079", fichier: "dossier_cherkaoui.pdf",  date: "2025-03-30", statut: "en attente" },
  { id: 6, nom: "Amina Belhaj",     matricule: "CRI-0017", fichier: "dossier_belhaj.pdf",     date: "2025-03-29", statut: "validé" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMad(value) {
  return `${toNumber(value).toLocaleString("fr-FR")} MAD`;
}

function calcPct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

// ── Donut Chart Component ──────────────────────────────────────────────────
function DonutChart({ segments, size = 140, strokeWidth = 22 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;

  let offset = 0;
  const arcs = segments.map((s) => {
    const dash = (s.pct / 100) * circ;
    const arc = { ...s, dash, gap: circ - dash, offset: circ - offset };
    offset += dash;
    return arc;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={a.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${a.dash} ${a.gap}`}
          strokeDashoffset={a.offset}
          strokeLinecap="butt"
          style={{ transition: "stroke-dasharray .6s ease, stroke-dashoffset .6s ease" }}
        />
      ))}
    </svg>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, delta, color }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statDot} style={{ background: color }} />
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {delta && <span className={styles.statDelta}>{delta}</span>}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("connexions");
  const [search, setSearch] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Admin CRI"}');
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    "";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:8080/api/employee/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Non authentifié. Veuillez vous reconnecter.");
          }
          if (response.status === 403) {
            throw new Error("Accès refusé. Ce dashboard est réservé aux employés.");
          }
          throw new Error("Erreur lors du chargement du dashboard.");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message || "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const connexionStats = dashboardData?.connexionStats || {
    totalConnexions: 0,
    actifs: 0,
    inactifs: 0,
  };

  const primeStats = dashboardData?.primeStats || {
    totalCalculs: 0,
    totalDistribue: 0,
    moyennePrime: 0,
  };

  const connexionsData = dashboardData?.connexions || [];
  const primesData = dashboardData?.primes || [];
  const dossiersData = MOCK_DOSSIERS;

  const tabs = [
    { key: "connexions", label: "Connexions", icon: "⬡" },
    { key: "primes", label: "Calculs Prime", icon: "◈" },
    { key: "dossiers", label: "Dossiers", icon: "◉" },
  ];

  const filterFn = (row) =>
    !search ||
    row.nom?.toLowerCase().includes(search.toLowerCase()) ||
    (row.email || row.matricule || "").toLowerCase().includes(search.toLowerCase());

  const connexions = connexionsData.filter(filterFn);
  const primes = primesData.filter(filterFn);
  const dossiers = dossiersData.filter(filterFn);

  const connexionStatuts = useMemo(() => {
    const total = toNumber(connexionStats.totalConnexions);
    const actifs = toNumber(connexionStats.actifs);
    const inactifs = toNumber(connexionStats.inactifs);

    return [
      { label: "Actifs", pct: calcPct(actifs, total), color: "#10b981" },
      { label: "Inactifs", pct: calcPct(inactifs, total), color: "#94a3b8" },
    ];
  }, [connexionStats]);

  const primeTypes = useMemo(() => {
    const counts = primesData.reduce((acc, p) => {
      const type = p.type || "Autre";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const total = primesData.length;

    return [
      { label: "Performance", pct: calcPct(counts["Performance"] || 0, total), color: "#2563eb" },
      { label: "Ancienneté", pct: calcPct(counts["Ancienneté"] || 0, total), color: "#8b5cf6" },
      { label: "Transport", pct: calcPct(counts["Transport"] || 0, total), color: "#0ea5e9" },
    ];
  }, [primesData]);

  const dossierStatuts = useMemo(() => {
    const total = dossiersData.length;
    const valides = dossiersData.filter((d) => d.statut === "validé").length;
    const attente = dossiersData.filter((d) => d.statut === "en attente").length;
    const rejetes = dossiersData.filter((d) => d.statut === "rejeté").length;

    return [
      { label: "Validés", pct: calcPct(valides, total), color: "#10b981" },
      { label: "En attente", pct: calcPct(attente, total), color: "#f59e0b" },
      { label: "Rejetés", pct: calcPct(rejetes, total), color: "#ef4444" },
    ];
  }, [dossiersData]);

  if (loading) {
    return <div className={styles.shell}>Chargement du dashboard...</div>;
  }

  if (error) {
    return <div className={styles.shell}>Erreur : {error}</div>;
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogo}>
            <LogoTPME width={42} height={42} />
          </div>
          <span className={styles.sidebarTitle}>TPME Invest</span>
        </div>

        <p className={styles.sideNavLabel}>NAVIGATION</p>
        <nav className={styles.sideNav}>
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`${styles.navItem} ${activeTab === t.key ? styles.navActive : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              <span className={styles.navIcon}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarUser}>
          <div className={styles.avatar}>
            {(user?.name || user?.email || "A")[0].toUpperCase()}
          </div>
          <div>
            <p className={styles.userName}>{user?.name || "Administrateur"}</p>
            <p className={styles.userRole}>CRI — Employé</p>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>
              {tabs.find((t) => t.key === activeTab)?.label}
            </h1>
            <p className={styles.pageDate}>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className={styles.searchWrap}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {activeTab === "connexions" && (
          <div className={styles.content}>
            <div className={styles.statsRow}>
              <StatCard label="Total connexions" value={connexionStats.totalConnexions} color="#10b981" />
              <StatCard label="Actifs" value={connexionStats.actifs} color="#10b981" />
              <StatCard label="Inactifs" value={connexionStats.inactifs} color="#94a3b8" />
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Répartition des sessions</p>
                <div className={styles.donutWrap}>
                  <DonutChart segments={connexionStatuts} />
                  <div className={styles.donutCenter}>
                    <span className={styles.donutBig}>{connexionStats.totalConnexions}</span>
                    <span className={styles.donutSub}>sessions</span>
                  </div>
                </div>
                <div className={styles.legend}>
                  {connexionStatuts.map((s) => (
                    <div key={s.label} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: s.color }} />
                      <span>{s.label}</span>
                      <span className={styles.legendPct}>{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${styles.chartCard} ${styles.chartCardWide}`}>
                <p className={styles.chartTitle}>Activité récente</p>
                <div className={styles.activityList}>
                  {connexionsData.slice(0, 5).map((c) => (
                    <div key={c.id} className={styles.activityItem}>
                      <div className={styles.activityAvatar}>{c.nom?.[0] || "?"}</div>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityName}>{c.nom}</p>
                        <p className={styles.activityMeta}>{c.email}</p>
                      </div>
                      <div className={styles.activityRight}>
                        <span className={`${styles.badge} ${c.statut === "actif" ? styles.badgeGreen : styles.badgeGray}`}>
                          {c.statut}
                        </span>
                        <p className={styles.activityDate}>{c.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.tableCard}>
              <p className={styles.tableTitle}>Historique complet des connexions</p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Date & Heure</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {connexions.map((c, i) => (
                    <tr key={c.id}>
                      <td className={styles.tdMuted}>{String(i + 1).padStart(2, "0")}</td>
                      <td className={styles.tdBold}>{c.nom}</td>
                      <td className={styles.tdMuted}>{c.email}</td>
                      <td>{c.date}</td>
                      <td>
                        <span className={`${styles.badge} ${c.statut === "actif" ? styles.badgeGreen : styles.badgeGray}`}>
                          {c.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {connexions.length === 0 && (
                    <tr>
                      <td colSpan="5" className={styles.tdMuted} style={{ textAlign: "center", padding: "18px" }}>
                        Aucune connexion trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "primes" && (
          <div className={styles.content}>
            <div className={styles.statsRow}>
              <StatCard label="Calculs effectués" value={primeStats.totalCalculs} color="#2563eb" />
              <StatCard label="Total distribué" value={formatMad(primeStats.totalDistribue)} color="#8b5cf6" />
              <StatCard label="Moyenne prime" value={formatMad(primeStats.moyennePrime)} color="#0ea5e9" />
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Répartition par type</p>
                <div className={styles.donutWrap}>
                  <DonutChart segments={primeTypes} />
                  <div className={styles.donutCenter}>
                    <span className={styles.donutBig}>{primeStats.totalCalculs}</span>
                    <span className={styles.donutSub}>calculs</span>
                  </div>
                </div>
                <div className={styles.legend}>
                  {primeTypes.map((s) => (
                    <div key={s.label} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: s.color }} />
                      <span>{s.label}</span>
                      <span className={styles.legendPct}>{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${styles.chartCard} ${styles.chartCardWide}`}>
                <p className={styles.chartTitle}>Primes les plus récentes</p>
                <div className={styles.activityList}>
                  {primesData.slice(0, 5).map((p) => (
                    <div key={p.id} className={styles.activityItem}>
                      <div
                        className={styles.activityAvatar}
                        style={{ background: "#ede9fe", color: "#7c3aed" }}
                      >
                        {p.nom?.[0] || "?"}
                      </div>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityName}>{p.nom}</p>
                        <p className={styles.activityMeta}>
                          {p.matricule} · {p.type}
                        </p>
                      </div>
                      <div className={styles.activityRight}>
                        <span className={styles.primeMontant}>{formatMad(p.montant)}</span>
                        <p className={styles.activityDate}>{p.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.tableCard}>
              <p className={styles.tableTitle}>Historique des calculs de prime</p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom</th>
                    <th>Matricule</th>
                    <th>Type</th>
                    <th>Montant</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {primes.map((p, i) => (
                    <tr key={p.id}>
                      <td className={styles.tdMuted}>{String(i + 1).padStart(2, "0")}</td>
                      <td className={styles.tdBold}>{p.nom}</td>
                      <td className={styles.tdMuted}>{p.matricule}</td>
                      <td>
                        <span className={styles.typeTag}>{p.type}</span>
                      </td>
                      <td className={styles.tdBlue}>{formatMad(p.montant)}</td>
                      <td>{p.date}</td>
                    </tr>
                  ))}
                  {primes.length === 0 && (
                    <tr>
                      <td colSpan="6" className={styles.tdMuted} style={{ textAlign: "center", padding: "18px" }}>
                        Aucune prime trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "dossiers" && (
          <div className={styles.content}>
            <div className={styles.statsRow}>
              <StatCard label="Dossiers soumis" value={MOCK_DOSSIERS.length} color="#0ea5e9" delta="total" />
              <StatCard label="Validés" value={MOCK_DOSSIERS.filter((d) => d.statut === "validé").length} color="#10b981" />
              <StatCard label="En attente" value={MOCK_DOSSIERS.filter((d) => d.statut === "en attente").length} color="#f59e0b" />
              <StatCard label="Rejetés" value={MOCK_DOSSIERS.filter((d) => d.statut === "rejeté").length} color="#ef4444" />
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Statut des dossiers</p>
                <div className={styles.donutWrap}>
                  <DonutChart segments={dossierStatuts} />
                  <div className={styles.donutCenter}>
                    <span className={styles.donutBig}>{MOCK_DOSSIERS.length}</span>
                    <span className={styles.donutSub}>dossiers</span>
                  </div>
                </div>
                <div className={styles.legend}>
                  {dossierStatuts.map((s) => (
                    <div key={s.label} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: s.color }} />
                      <span>{s.label}</span>
                      <span className={styles.legendPct}>{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${styles.chartCard} ${styles.chartCardWide}`}>
                <p className={styles.chartTitle}>Derniers dossiers soumis</p>
                <div className={styles.activityList}>
                  {MOCK_DOSSIERS.slice(0, 5).map((d) => (
                    <div key={d.id} className={styles.activityItem}>
                      <div
                        className={styles.activityAvatar}
                        style={{ background: "#e0f2fe", color: "#0369a1" }}
                      >
                        {d.nom[0]}
                      </div>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityName}>{d.nom}</p>
                        <p className={styles.activityMeta}>{d.fichier}</p>
                      </div>
                      <div className={styles.activityRight}>
                        <span
                          className={`${styles.badge} ${
                            d.statut === "validé"
                              ? styles.badgeGreen
                              : d.statut === "rejeté"
                              ? styles.badgeRed
                              : styles.badgeAmber
                          }`}
                        >
                          {d.statut}
                        </span>
                        <p className={styles.activityDate}>{d.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.tableCard}>
              <p className={styles.tableTitle}>Historique des dossiers</p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom</th>
                    <th>Matricule</th>
                    <th>Fichier</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dossiers.map((d, i) => (
                    <tr key={d.id}>
                      <td className={styles.tdMuted}>{String(i + 1).padStart(2, "0")}</td>
                      <td className={styles.tdBold}>{d.nom}</td>
                      <td className={styles.tdMuted}>{d.matricule}</td>
                      <td className={styles.tdFile}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {d.fichier}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            d.statut === "validé"
                              ? styles.badgeGreen
                              : d.statut === "rejeté"
                              ? styles.badgeRed
                              : styles.badgeAmber
                          }`}
                        >
                          {d.statut}
                        </span>
                      </td>
                      <td>{d.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}