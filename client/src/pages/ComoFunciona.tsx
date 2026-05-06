import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";

const NEON = "#7ED957";
const DANGER = "#E41E26";
const BG = "#0A0A0A";

export default function ComoFunciona() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      num: "01",
      title: "SUBES TU CASO",
      desc: "Formulario de análisis. Datos básicos de la deuda, importe y situación. Sin papeleos iniciales.",
    },
    {
      num: "02",
      title: "ANÁLISIS IA",
      desc: "Sistema evalúa viabilidad, historial, tipo de deuda y probabilidad de recuperación.",
    },
    {
      num: "03",
      title: "PROPUESTA HUMANA",
      desc: "Gestor especializado revisa el caso y te presenta propuesta personalizada con condiciones claras.",
    },
    {
      num: "04",
      title: "PROTOCOLO ACTIVO",
      desc: "Tras aceptación y pago inicial, el sistema arranca. Multicanal. Continuo. Documentado.",
    },
  ];

  const tech = [
    {
      title: "IA PERSISTENTE",
      desc: "Motor de scoring y toma de decisiones que evalúa cada señal del deudor y adapta la cadencia de contacto en tiempo real.",
    },
    {
      title: "AUTOMATIZACIÓN MULTICANAL",
      desc: "Email, WhatsApp, llamadas y SMS coordinados. Cadencias programadas que se ajustan al comportamiento del deudor.",
    },
    {
      title: "TRAZABILIDAD LEGAL",
      desc: "Cada acción queda registrada con timestamp, canal, IP y resultado. Documentación lista para cualquier requerimiento legal.",
    },
  ];

  const team = [
    {
      title: "GESTORES DE RECOBRO",
      desc: "Especialistas en negociación y seguimiento. Revisan cada expediente, proponen acuerdos y supervisan el protocolo activo.",
    },
    {
      title: "OPERARIOS PRESENCIALES",
      desc: "Cuando el caso lo requiere, equipo físico sobre el terreno. Visitas, recogida de firmas y evidencias documentadas.",
    },
  ];

  const faqs = [
    {
      q: "¿Necesito contratar a un abogado antes de activar el servicio?",
      a: "No. Cobrafantasmas opera de forma extrajudicial. No necesitas abogado para empezar. Si el caso requiere vía judicial, te lo comunicamos.",
    },
    {
      q: "¿Cuánto tiempo tarda el análisis inicial?",
      a: "La evaluación inicial se realiza en menos de 24 horas laborables. Recibirás respuesta directa de un gestor.",
    },
    {
      q: "¿Qué pasa si el deudor no tiene dinero para pagar?",
      a: "El protocolo explora la capacidad real de pago, activos y vías de acuerdo. Negociamos soluciones parciales o fraccionadas.",
    },
    {
      q: "¿Puedo cancelar el servicio en cualquier momento?",
      a: "Sí. Puedes cancelar el expediente activo comunicándolo a tu gestor. Las condiciones de cancelación están detalladas en la propuesta.",
    },
  ];

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
            <Link href="/" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = NEON)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
              Inicio
            </Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Cómo funcionamos</span>
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
            CÓMO FUNCIONAMOS
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.15rem", maxWidth: "600px" }}>
            Tecnología, persistencia y operativa humana. Sin magia. Sin burocracia.
          </p>
        </div>
      </section>

      {/* ── Proceso: timeline 4 pasos ─────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "5rem 0" }}>
        <div className="container">
          <h2
            className="font-display"
            style={{ color: NEON, fontSize: "1rem", letterSpacing: "0.15em", marginBottom: "3rem" }}
          >
            EL PROCESO
          </h2>
          <div style={{ position: "relative", maxWidth: "700px" }}>
            {/* Línea vertical */}
            <div
              style={{
                position: "absolute",
                left: "2rem",
                top: "2.5rem",
                bottom: "2.5rem",
                width: "2px",
                backgroundColor: "rgba(126,217,87,0.2)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "2rem",
                    alignItems: "flex-start",
                    paddingBottom: i < steps.length - 1 ? "3rem" : "0",
                    position: "relative",
                  }}
                >
                  {/* Número / nodo */}
                  <div
                    style={{
                      width: "4rem",
                      height: "4rem",
                      borderRadius: "50%",
                      backgroundColor: BG,
                      border: `2px solid ${NEON}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <span
                      className="font-display"
                      style={{ color: NEON, fontSize: "0.85rem", letterSpacing: "0.05em" }}
                    >
                      {step.num}
                    </span>
                  </div>
                  {/* Contenido */}
                  <div style={{ paddingTop: "0.75rem" }}>
                    <h3
                      className="font-display"
                      style={{ color: "#fff", fontSize: "1.4rem", letterSpacing: "0.06em", marginBottom: "0.5rem" }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tecnología ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#111", padding: "5rem 0" }}>
        <div className="container">
          <h2
            className="font-display"
            style={{ color: NEON, fontSize: "1rem", letterSpacing: "0.15em", marginBottom: "2.5rem" }}
          >
            TECNOLOGÍA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tech.map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid rgba(126,217,87,0.2)",
                  borderRadius: "1rem",
                  padding: "2rem",
                }}
              >
                <h3
                  className="font-display"
                  style={{ color: NEON, fontSize: "1.1rem", letterSpacing: "0.1em", marginBottom: "1rem" }}
                >
                  {item.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontSize: "0.95rem" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Equipo humano ─────────────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "5rem 0" }}>
        <div className="container">
          <h2
            className="font-display"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem", letterSpacing: "0.15em", marginBottom: "2.5rem" }}
          >
            EQUIPO HUMANO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: "800px" }}>
            {team.map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#111",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "2rem",
                }}
              >
                <h3
                  className="font-display"
                  style={{ color: "#fff", fontSize: "1.1rem", letterSpacing: "0.08em", marginBottom: "1rem" }}
                >
                  {item.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontSize: "0.95rem" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#111", padding: "5rem 0" }}>
        <div className="container" style={{ maxWidth: "760px" }}>
          <h2
            className="font-display"
            style={{ color: NEON, fontSize: "1rem", letterSpacing: "0.15em", marginBottom: "2.5rem" }}
          >
            PREGUNTAS DEL PROCESO
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: BG,
                  border: `1px solid ${openFaq === i ? "rgba(126,217,87,0.35)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
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
                      color: openFaq === i ? NEON : "#fff",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      transition: "color 0.2s",
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    style={{
                      color: NEON,
                      fontSize: "1.25rem",
                      flexShrink: 0,
                      transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      display: "inline-block",
                    }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 1.5rem 1.25rem" }}>
                    <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontSize: "0.95rem" }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "5rem 0", textAlign: "center" }}>
        <div className="container">
          <h2
            className="font-display"
            style={{ color: "#fff", fontSize: "clamp(2rem,4vw,3.5rem)", letterSpacing: "0.04em", marginBottom: "1.25rem" }}
          >
            ¿LISTO PARA ACTIVAR?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
            Cuéntanos tu caso. El análisis inicial es gratuito y sin compromiso.
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
                boxShadow: `0 8px 24px rgba(228,30,38,0.4)`,
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
              ACTIVAR MI CASO →
            </button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
