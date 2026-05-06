import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Cómo funciona", href: "/como-funciona" },
  { label: "Protocolos", href: "/protocolos" },
  { label: "El sistema", href: "/el-sistema" },
  { label: "Casos", href: "/casos" },
  { label: "FAQ", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" },
];

export default function PublicNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background-color 0.3s ease, border-color 0.3s ease",
        backgroundColor: scrolled ? "#0A0A0A" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(126,217,87,0.15)" : "1px solid transparent",
      }}
    >
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={{ lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: "1.75rem",
                  letterSpacing: "0.04em",
                  color: "#FFFFFF",
                  lineHeight: 1,
                }}
              >
                COBRA
              </span>
              <span
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: "1.75rem",
                  letterSpacing: "0.04em",
                  color: "#7ED957",
                  lineHeight: 1,
                }}
              >
                FANTASMAS
              </span>
            </div>
            <span
              className="hidden lg:block"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.65rem",
                color: "#666",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                maxWidth: "100px",
                lineHeight: 1.3,
              }}
            >
              Servicio de recuperación de deudas
            </span>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden lg:flex" style={{ alignItems: "center", gap: "4px" }}>
            {NAV_LINKS.map((link) => {
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      letterSpacing: "0.03em",
                      color: isActive ? "#7ED957" : "#CCCCCC",
                      borderBottom: isActive ? "1px solid #7ED957" : "1px solid transparent",
                      transition: "color 0.2s ease, border-color 0.2s ease",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLSpanElement).style.color = "#FFFFFF";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLSpanElement).style.color = "#CCCCCC";
                      }
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* CTAs desktop */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: "8px" }}>
            <Link href="/login">
              <span
                style={{
                  display: "inline-block",
                  padding: "7px 16px",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, color 0.2s ease",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLSpanElement).style.borderColor = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLSpanElement).style.borderColor = "rgba(255,255,255,0.35)";
                }}
              >
                Acceso clientes
              </span>
            </Link>
            <Link href="/activar-caso">
              <span
                style={{
                  display: "inline-block",
                  padding: "7px 18px",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  backgroundColor: "#E41E26",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s ease, background-color 0.2s ease",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  border: "1px solid transparent",
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
                Activar caso
              </span>
            </Link>
          </div>

          {/* Hamburguesa mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden"
            style={{
              padding: "8px",
              background: "none",
              border: "none",
              color: "#FFFFFF",
              cursor: "pointer",
            }}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      <div
        className="lg:hidden"
        style={{
          backgroundColor: "#0A0A0A",
          borderTop: "1px solid rgba(126,217,87,0.12)",
          overflow: "hidden",
          maxHeight: isOpen ? "100vh" : "0",
          transition: "max-height 0.3s ease",
        }}
      >
        <div className="container" style={{ paddingTop: "16px", paddingBottom: "20px" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "16px" }}>
            {NAV_LINKS.map((link) => {
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}>
                  <span
                    style={{
                      display: "block",
                      padding: "12px 16px",
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: isActive ? "#7ED957" : "#CCCCCC",
                      borderLeft: isActive ? "2px solid #7ED957" : "2px solid transparent",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/login">
              <span
                style={{
                  display: "block",
                  padding: "11px 16px",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "6px",
                  textAlign: "center",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Acceso clientes
              </span>
            </Link>
            <Link href="/activar-caso">
              <span
                style={{
                  display: "block",
                  padding: "11px 16px",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  backgroundColor: "#E41E26",
                  borderRadius: "6px",
                  textAlign: "center",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Activar caso
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
