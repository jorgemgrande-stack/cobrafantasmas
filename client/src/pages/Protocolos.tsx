import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";

const NEON = "#7ED957";
const DANGER = "#E41E26";
const BG = "#0A0A0A";

const protocols = [
  {
    num: "01",
    name: "RADAR",
    tagline: "Detección y localización.",
    desc: "Fase de detección. Localizamos señales, datos de contacto y estado real del deudor antes de actuar.",
    color: "rgba(126,217,87,0.12)",
    borderColor: "rgba(126,217,87,0.3)",
  },
  {
    num: "02",
    name: "PERSISTENTE",
    tagline: "Presencia continua multicanal.",
    desc: "Seguimiento continuo multicanal. Email, WhatsApp, llamadas, SMS. Cadencias programadas y adaptativas.",
    color: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  {
    num: "03",
    name: "REACTIVACIÓN",
    tagline: "Respuesta inteligente en tiempo real.",
    desc: "Cuando el deudor da señales de vida, el sistema reacciona en tiempo real con la acción adecuada.",
    color: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  {
    num: "04",
    name: "INTENSIVO",
    tagline: "Escalada coordinada.",
    desc: "Escalada de frecuencia y canales. Gestor humano asignado. Acuerdos de pago negociados.",
    color: "rgba(228,30,38,0.08)",
    borderColor: "rgba(228,30,38,0.25)",
  },
  {
    num: "05",
    name: "PRESENCIAL",
    tagline: "Operativa física sobre el terreno.",
    desc: "Cuando es necesario, equipo físico sobre el terreno. Visitas, recogida de firmas y acuerdos documentados.",
    color: "rgba(228,30,38,0.08)",
    borderColor: "rgba(228,30,38,0.25)",
  },
];

export default function Protocolos() {
  return (
    <PublicLayout fullWidthHero>
      {/* ── Hero interior ─────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: BG,
          borderBottom: `2px solid ${NEON}`,
          padding: "4rem 0 3rem",
        }}
      >
        <div className="container">
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Link
              href="/"
              style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = NEON)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              Inicio
            </Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Protocolos</span>
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              color: "#fff",
              letterSpacing: "0.04em",
              lineHeight: 1,
              marginBottom: "1rem",
            }}
          >
            LOS PROTOCOLOS
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.15rem", maxWidth: "600px" }}>
            Cada caso activa el protocolo adecuado. Escalable, documentado, dentro de la ley.
          </p>
        </div>
      </section>

      {/* ── Protocol cards ────────────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "5rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
            {protocols.map((p, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: p.color,
                  border: `1px solid ${p.borderColor}`,
                  borderRadius: "1rem",
                  padding: "2.5rem",
                  display: "grid",
                  gridTemplateColumns: "5rem 1fr",
                  gap: "2rem",
                  alignItems: "start",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
                }}
              >
                {/* Número */}
                <div>
                  <span
                    className="font-display"
                    style={{
                      fontSize: "3rem",
                      color: i < 3 ? NEON : DANGER,
                      lineHeight: 1,
                      letterSpacing: "0.04em",
                      display: "block",
                      opacity: 0.7,
                    }}
                  >
                    {p.num}
                  </span>
                </div>
                {/* Contenido */}
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    <h3
                      className="font-display"
                      style={{
                        color: "#fff",
                        fontSize: "1.6rem",
                        letterSpacing: "0.1em",
                        margin: 0,
                      }}
                    >
                      PROTOCOLO {p.num} — {p.name}
                    </h3>
                    <span
                      style={{
                        color: i < 3 ? NEON : DANGER,
                        fontSize: "0.8rem",
                        letterSpacing: "0.12em",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {p.tagline}
                    </span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, fontSize: "1rem", margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nota legal ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#111", padding: "3rem 0" }}>
        <div className="container">
          <div
            style={{
              maxWidth: "800px",
              border: `1px solid rgba(126,217,87,0.2)`,
              borderRadius: "0.75rem",
              padding: "1.75rem 2rem",
              backgroundColor: "rgba(126,217,87,0.05)",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              <span style={{ color: NEON, fontWeight: 700, marginRight: "0.5rem" }}>NOTA LEGAL</span>
              Todos los protocolos operan dentro de límites horarios permitidos, sin lenguaje coercitivo y respetando
              íntegramente el RGPD y la normativa española.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "5rem 0", textAlign: "center" }}>
        <div className="container">
          <h2
            className="font-display"
            style={{
              color: "#fff",
              fontSize: "clamp(1.8rem,4vw,3rem)",
              letterSpacing: "0.04em",
              marginBottom: "1.25rem",
            }}
          >
            ¿TU DEUDA TIENE PROTOCOLO?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
            Analizamos tu caso y te decimos qué protocolo activar. Sin coste.
          </p>
          <Link href="/activar-caso">
            <button
              style={{
                backgroundColor: DANGER,
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                padding: "1rem 2.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.06em",
                boxShadow: "0 8px 24px rgba(228,30,38,0.4)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 32px rgba(228,30,38,0.55)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(228,30,38,0.4)";
              }}
            >
              ANALIZAR SI MI DEUDA TIENE PROTOCOLO →
            </button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
