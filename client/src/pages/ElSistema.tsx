import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

const NEON = "#7ED957";
const DANGER = "#E41E26";
const BG = "#0A0A0A";

const features = [
  {
    title: "EXPEDIENTES ACTIVOS",
    desc: "Estado visual en tiempo real de cada caso. Indicadores de avance y semáforo de actividad.",
  },
  {
    title: "TIMELINE OPERATIVO",
    desc: "Cada acción documentada con fecha, canal y resultado. Historial completo accesible siempre.",
  },
  {
    title: "ALERTAS IA",
    desc: "Notificaciones cuando hay movimiento: contacto del deudor, cambio de estado, acuerdo propuesto.",
  },
  {
    title: "SCORING DE CASO",
    desc: "Probabilidad de recuperación actualizada. Dificultad, riesgo y estimación de plazos.",
  },
  {
    title: "TRAZABILIDAD LEGAL",
    desc: "Logs con IP, hora y canal de cada acción. Documentación lista para cualquier requerimiento.",
  },
  {
    title: "PANEL ACREEDOR",
    desc: "Acceso directo al estado de tu expediente. Sin depender de llamadas ni emails de seguimiento.",
  },
];

export default function ElSistema() {
  const { data: pageBlocks = [] } = trpc.public.getPublicPageBlocks.useQuery({ slug: "el-sistema" });
  const heroBlock = (pageBlocks as any[]).find((b: any) => b.blockType === "hero");
  const heroImageUrl: string = heroBlock ? String(heroBlock.data?.imageUrl ?? "") : "";
  const overlayOpacity: number = heroBlock ? Number(heroBlock.data?.overlayOpacity ?? 75) / 100 : 0.75;

  return (
    <PublicLayout fullWidthHero>
      {/* ── Hero interior ─────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: BG,
          borderBottom: `2px solid ${NEON}`,
          padding: "4rem 0 3rem",
          position: "relative",
          overflow: "hidden",
          ...(heroImageUrl ? {
            backgroundImage: `url('${heroImageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            backgroundRepeat: "no-repeat",
          } : {}),
        }}
      >
        {heroImageUrl && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundColor: `rgba(10,10,10,${overlayOpacity})` }} />
        )}
        <div className="container" style={{ position: "relative" }}>
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
            <span style={{ color: "rgba(255,255,255,0.6)" }}>El Sistema</span>
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
            EL SISTEMA
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.15rem", maxWidth: "600px" }}>
            No es una web. Es un centro de control operativo.
          </p>
        </div>
      </section>

      {/* ── Panel del cliente: descripción ───────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "5rem 0" }}>
        <div className="container">
          <div
            style={{
              maxWidth: "820px",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "2rem",
            }}
          >
            <div>
              <h2
                className="font-display"
                style={{ color: NEON, fontSize: "1rem", letterSpacing: "0.15em", marginBottom: "1.5rem" }}
              >
                TU PANEL CUANDO ACTIVAS UN EXPEDIENTE
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "1.1rem",
                  lineHeight: 1.75,
                  borderLeft: `3px solid ${NEON}`,
                  paddingLeft: "1.5rem",
                }}
              >
                Cuando activas un expediente, tienes acceso a un panel donde ves en tiempo real: estado del protocolo
                activo, acciones realizadas, timeline documentado, alertas del sistema e importes recuperados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 características ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#111", padding: "5rem 0" }}>
        <div className="container">
          <h2
            className="font-display"
            style={{ color: "rgba(255,255,255,0.35)", fontSize: "1rem", letterSpacing: "0.15em", marginBottom: "2.5rem" }}
          >
            CAPACIDADES DEL SISTEMA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: BG,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "2rem",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(126,217,87,0.3)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2px",
                    backgroundColor: NEON,
                    marginBottom: "1.25rem",
                  }}
                />
                <h3
                  className="font-display"
                  style={{ color: "#fff", fontSize: "1rem", letterSpacing: "0.1em", marginBottom: "0.75rem" }}
                >
                  {f.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para el equipo gestor ─────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "5rem 0" }}>
        <div className="container">
          <div
            style={{
              maxWidth: "820px",
              backgroundColor: "#111",
              border: `1px solid rgba(228,30,38,0.2)`,
              borderRadius: "1rem",
              padding: "3rem",
            }}
          >
            <h2
              className="font-display"
              style={{ color: DANGER, fontSize: "1rem", letterSpacing: "0.15em", marginBottom: "1.5rem" }}
            >
              PARA EL EQUIPO GESTOR
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.75, fontSize: "1rem", marginBottom: "1.25rem" }}>
              El panel interno es el centro de mando operativo: vista global de todos los expedientes activos, scoring IA
              en tiempo real, asignación de protocolos, gestión de tareas por gestor y acceso al historial completo de
              cada caso.
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontSize: "0.95rem", margin: 0 }}>
              Los operarios presenciales tienen su propia interfaz mobile-first con agenda, rutas, check-ins y subida
              de evidencias desde el terreno.
            </p>
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
            ¿QUIERES VER CÓMO FUNCIONA?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
            Activa un expediente y accede al sistema desde el primer día.
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
              QUIERO VER CÓMO FUNCIONA →
            </button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
