import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";

const NEON = "#7ED957";
const DANGER = "#E41E26";
const BG = "#0A0A0A";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const faqSections: FaqSection[] = [
  {
    title: "SOBRE EL SERVICIO",
    items: [
      {
        q: "¿Es legal Cobrafantasmas?",
        a: "Sí. Somos una empresa de recuperación extrajudicial de deudas que opera 100% dentro del marco legal español y el RGPD. Todas nuestras acciones están documentadas y respetan la normativa vigente.",
      },
      {
        q: "¿En qué se diferencia de un abogado o una gestoría?",
        a: "No usamos la vía judicial como primera opción. Actuamos con presencia operativa continua, tecnología y equipo humano para resolver antes de llegar a los juzgados.",
      },
      {
        q: "¿Qué tipo de deudas gestionáis?",
        a: "Facturas impagadas B2B, comisiones comerciales, préstamos entre particulares, alquileres, trabajos realizados y cualquier deuda civil o mercantil extrajudicial.",
      },
    ],
  },
  {
    title: "COSTES Y CONDICIONES",
    items: [
      {
        q: "¿Cuánto cuesta el servicio?",
        a: "La evaluación inicial es gratuita. Si aceptamos el caso, hay una cuota de activación que cubre el coste operativo. Además, aplicamos una comisión sobre el importe efectivamente recuperado.",
      },
      {
        q: "¿Solo cobráis comisión si recuperáis?",
        a: "La comisión de éxito solo se aplica cuando hay recuperación real. La cuota de activación cubre el inicio de la operación.",
      },
      {
        q: "¿Hay un importe mínimo de deuda?",
        a: "Trabajamos principalmente con deudas a partir de 1.000€, aunque valoramos cada caso individualmente.",
      },
    ],
  },
  {
    title: "EL PROCESO",
    items: [
      {
        q: "¿Cuánto tiempo tarda?",
        a: "Depende del caso. Deudas simples con deudor localizable pueden resolverse en semanas. Casos complejos pueden llevar meses. Te damos una estimación en la propuesta.",
      },
      {
        q: "¿Qué pasa si el deudor no responde?",
        a: "El protocolo continúa. Exploramos todas las vías de contacto disponibles y documentamos cada acción. Si agotamos las posibilidades extrajudiciales, te lo comunicamos.",
      },
      {
        q: "¿Puedo ver el estado de mi expediente?",
        a: "Sí. Tendrás acceso a un panel donde puedes ver el estado en tiempo real, acciones realizadas y timeline completo.",
      },
      {
        q: "¿Hacéis visitas presenciales?",
        a: "Cuando el caso lo requiere, sí. Contamos con operarios presenciales para gestiones que requieren presencia física, siempre dentro de los límites legales.",
      },
    ],
  },
  {
    title: "LEGAL Y PRIVACIDAD",
    items: [
      {
        q: "¿Cómo protegéis los datos del deudor y del acreedor?",
        a: "Cumplimos íntegramente con el RGPD. Los datos se tratan con las medidas de seguridad requeridas y solo se usan para la gestión del expediente.",
      },
      {
        q: "¿Podéis garantizar la recuperación?",
        a: "No podemos garantizar el resultado, pero sí garantizamos que activaremos todos los mecanismos extrajudiciales disponibles y te informaremos de cada paso.",
      },
    ],
  },
];

export default function PreguntasFrecuentes() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = (key: string) => setOpenKey(openKey === key ? null : key);

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
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Preguntas frecuentes</span>
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
            PREGUNTAS FRECUENTES
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.15rem", maxWidth: "600px" }}>
            Todo lo que necesitas saber antes de activar tu caso.
          </p>
        </div>
      </section>

      {/* ── Acordeón por secciones ────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "5rem 0" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
            {faqSections.map((section) => (
              <div key={section.title}>
                <h2
                  className="font-display"
                  style={{
                    color: NEON,
                    fontSize: "0.85rem",
                    letterSpacing: "0.18em",
                    marginBottom: "1.5rem",
                    paddingBottom: "0.75rem",
                    borderBottom: `1px solid rgba(126,217,87,0.2)`,
                  }}
                >
                  {section.title}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {section.items.map((item, idx) => {
                    const key = `${section.title}-${idx}`;
                    const isOpen = openKey === key;
                    return (
                      <div
                        key={key}
                        style={{
                          backgroundColor: "#111",
                          border: `1px solid ${isOpen ? "rgba(126,217,87,0.3)" : "rgba(255,255,255,0.07)"}`,
                          borderRadius: "0.75rem",
                          overflow: "hidden",
                          transition: "border-color 0.2s",
                        }}
                      >
                        <button
                          onClick={() => toggle(key)}
                          style={{
                            width: "100%",
                            padding: "1.25rem 1.5rem",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "1rem",
                            textAlign: "left",
                          }}
                        >
                          <span
                            style={{
                              color: isOpen ? NEON : "#fff",
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              lineHeight: 1.4,
                              transition: "color 0.2s",
                            }}
                          >
                            {item.q}
                          </span>
                          <span
                            style={{
                              color: NEON,
                              fontSize: "1.25rem",
                              flexShrink: 0,
                              transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                              transition: "transform 0.2s",
                              display: "inline-block",
                              lineHeight: 1,
                            }}
                          >
                            +
                          </span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: "0 1.5rem 1.25rem" }}>
                            <p
                              style={{
                                color: "rgba(255,255,255,0.55)",
                                lineHeight: 1.7,
                                fontSize: "0.95rem",
                                margin: 0,
                              }}
                            >
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#111", padding: "5rem 0", textAlign: "center" }}>
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
            ¿AÚN TIENES DUDAS?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
            Cuéntanos tu caso directamente. Te respondemos en menos de 24h laborables.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
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
                ACTIVAR ANÁLISIS GRATUITO →
              </button>
            </Link>
            <Link href="/contacto">
              <button
                style={{
                  backgroundColor: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "0.5rem",
                  padding: "1rem 2rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.45)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                }}
              >
                Contactar
              </button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
