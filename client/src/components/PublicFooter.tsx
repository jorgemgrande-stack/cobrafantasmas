import { Link } from "wouter";

const colNavegacion = [
  { label: "Inicio", href: "/" },
  { label: "Cómo funciona", href: "/como-funciona" },
  { label: "Protocolos", href: "/protocolos" },
  { label: "El sistema", href: "/el-sistema" },
  { label: "Casos", href: "/casos" },
  { label: "FAQ", href: "/preguntas-frecuentes" },
];

const colServicios = [
  { label: "Activar un caso", href: "/activar-caso" },
  { label: "Consulta inicial gratuita", href: "/contacto" },
  { label: "Panel de acreedores", href: "/login" },
];

const colLegal = [
  { label: "Política de privacidad", href: "/politica-privacidad" },
  { label: "Términos y condiciones", href: "/terminos-condiciones" },
  { label: "Política de cookies", href: "/politica-cookies" },
  { label: "Contacto", href: "/contacto" },
];

const linkStyle: React.CSSProperties = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "0.85rem",
  color: "#888",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 0.2s ease",
  display: "inline-block",
};

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href}>
        <span
          style={linkStyle}
          onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = "#7ED957"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = "#888"; }}
        >
          {children}
        </span>
      </Link>
    </li>
  );
}

export default function PublicFooter() {
  return (
    <footer
      style={{
        backgroundColor: "#0A0A0A",
        borderTop: "1px solid rgba(126,217,87,0.2)",
        color: "#FFFFFF",
      }}
    >
      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#141414",
          borderBottom: "1px solid rgba(126,217,87,0.1)",
          padding: "48px 0",
          textAlign: "center",
        }}
      >
        <div className="container">
          <p
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
              letterSpacing: "0.03em",
              color: "#FFFFFF",
              marginBottom: "24px",
              lineHeight: 1.25,
            }}
          >
            Las deudas desaparecen cuando nadie insiste.{" "}
            <span style={{ color: "#7ED957" }}>Nosotros sí insistimos.</span>
          </p>
          <Link href="/activar-caso">
            <span
              style={{
                display: "inline-block",
                padding: "13px 32px",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#FFFFFF",
                backgroundColor: "#E41E26",
                borderRadius: "6px",
                cursor: "pointer",
                textDecoration: "none",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "box-shadow 0.2s ease, background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLSpanElement).style.boxShadow = "0 0 20px rgba(228,30,38,0.4), 0 0 40px rgba(228,30,38,0.15)";
                (e.currentTarget as HTMLSpanElement).style.backgroundColor = "#ff2a33";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLSpanElement).style.boxShadow = "none";
                (e.currentTarget as HTMLSpanElement).style.backgroundColor = "#E41E26";
              }}
            >
              Activar mi caso
            </span>
          </Link>
        </div>
      </div>

      {/* ── Footer Grid ────────────────────────────────────────────── */}
      <div className="container" style={{ padding: "56px 1rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(1, 1fr)",
            gap: "40px",
          }}
          className="footer-grid"
        >
          {/* Col 1 — Marca */}
          <div>
            <Link href="/">
              <span
                style={{
                  display: "inline-block",
                  marginBottom: "16px",
                  cursor: "pointer",
                  textDecoration: "none",
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "1.6rem",
                    letterSpacing: "0.04em",
                    color: "#FFFFFF",
                  }}
                >
                  COBRA
                </span>
                <span
                  style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "1.6rem",
                    letterSpacing: "0.04em",
                    color: "#7ED957",
                  }}
                >
                  FANTASMAS
                </span>
              </span>
            </Link>
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.82rem",
                color: "#7ED957",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Presencia operativa continua.
            </p>
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.82rem",
                color: "#666",
                lineHeight: 1.6,
                maxWidth: "260px",
              }}
            >
              Tecnología, persistencia y creatividad aplicada al cobro.
            </p>
          </div>

          {/* Col 2 — Navegación */}
          <div>
            <h4
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: "0.9rem",
                letterSpacing: "0.15em",
                color: "#7ED957",
                marginBottom: "16px",
                textTransform: "uppercase",
              }}
            >
              Navegación
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {colNavegacion.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Col 3 — Servicios */}
          <div>
            <h4
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: "0.9rem",
                letterSpacing: "0.15em",
                color: "#7ED957",
                marginBottom: "16px",
                textTransform: "uppercase",
              }}
            >
              Servicios
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {colServicios.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* Col 4 — Legal */}
          <div>
            <h4
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: "0.9rem",
                letterSpacing: "0.15em",
                color: "#7ED957",
                marginBottom: "16px",
                textTransform: "uppercase",
              }}
            >
              Legal
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {colLegal.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="container"
          style={{
            padding: "20px 1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.75rem",
              color: "#444",
              textAlign: "center",
            }}
          >
            © 2025 Cobrafantasmas. Todos los derechos reservados.
          </p>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.72rem",
              color: "#333",
              textAlign: "center",
              maxWidth: "600px",
            }}
          >
            Servicio de recuperación extrajudicial de deudas. Actuamos dentro del marco legal español y RGPD.
          </p>
        </div>
      </div>

      {/* Grid responsive styles */}
      <style>{`
        @media (min-width: 640px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </footer>
  );
}
