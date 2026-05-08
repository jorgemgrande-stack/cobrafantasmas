import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

const NEON = "#7ED957";
const DANGER = "#E41E26";
const BG = "#0A0A0A";

const casos = [
  {
    tipo: "Factura impagada B2B",
    importe: "8.400 €",
    protocolo: "Persistente",
    resultado: "Acuerdo de pago en 2 semanas.",
    desc: "Empresa de servicios IT. 6 meses sin respuesta. Protocolo Persistente activado.",
    badge: NEON,
  },
  {
    tipo: "Comisión comercial",
    importe: "12.000 €",
    protocolo: "Intensivo",
    resultado: "Recuperado en 45 días.",
    desc: "Comercial autónomo. Empresa prometía pago tras cierre. Sin respuesta a requerimientos.",
    badge: NEON,
  },
  {
    tipo: "Préstamo entre particulares",
    importe: "3.500 €",
    protocolo: "Radar + Extrajudicial",
    resultado: "Acuerdo extrajudicial.",
    desc: "Acuerdo verbal. Negativas constantes. Protocolo Radar localizó nueva dirección.",
    badge: "rgba(126,217,87,0.6)",
  },
  {
    tipo: "Alquiler impagado",
    importe: "4.200 €",
    protocolo: "Gestión documental",
    resultado: "Acuerdo de salida documentado.",
    desc: "Propietario con 3 meses de impago. Inquilino no respondía.",
    badge: "rgba(126,217,87,0.6)",
  },
  {
    tipo: "Trabajo realizado sin cobrar",
    importe: "6.800 €",
    protocolo: "Intensivo + Localización",
    resultado: "Importe recuperado.",
    desc: "Diseñadora autónoma. Empresa desapareció. Protocolo Intensivo + localización de responsable.",
    badge: DANGER,
  },
  {
    tipo: "Factura sector construcción",
    importe: "22.000 €",
    protocolo: "Negociación",
    resultado: "70% recuperado en negociación.",
    desc: "Subcontrata. Factura pendiente 14 meses. Recuperación parcial acordada.",
    badge: DANGER,
  },
];

export default function Casos() {
  const { data: pageBlocks = [] } = trpc.public.getPublicPageBlocks.useQuery({ slug: "casos" });
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
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Casos</span>
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
            CASOS
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.15rem", maxWidth: "600px" }}>
            Historias reales. Datos anonimizados.
          </p>
        </div>
      </section>

      {/* ── Cards de casos ────────────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "clamp(3rem, 7vw, 5rem) 0" }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casos.map((caso, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#111",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(126,217,87,0.25)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.75rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    {caso.tipo}
                  </span>
                  <span
                    style={{
                      backgroundColor: "rgba(126,217,87,0.1)",
                      color: NEON,
                      fontSize: "0.7rem",
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "0.3rem",
                      border: `1px solid rgba(126,217,87,0.25)`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {caso.protocolo}
                  </span>
                </div>

                {/* Importe */}
                <div>
                  <span
                    className="font-display"
                    style={{ color: "#fff", fontSize: "2.2rem", letterSpacing: "0.04em" }}
                  >
                    {caso.importe}
                  </span>
                </div>

                {/* Descripción */}
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>
                  {caso.desc}
                </p>

                {/* Resultado */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    paddingTop: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: caso.badge,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", fontWeight: 600 }}>
                    {caso.resultado}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Nota */}
          <p
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: "0.8rem",
              marginTop: "3rem",
              fontStyle: "italic",
            }}
          >
            Los datos son ficticios o anonimizados para proteger la privacidad de nuestros clientes.
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#111", padding: "clamp(3rem, 7vw, 5rem) 0", textAlign: "center" }}>
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
            ¿TU CASO PODRÍA SER EL SIGUIENTE?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
            Analizamos tu deuda sin coste. Si tiene viabilidad, te lo decimos.
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
              ANALIZAR MI CASO →
            </button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
