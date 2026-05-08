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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
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
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img
                src="/logo_cobrafantasmas_web.png"
                alt="Cobrafantasmas"
                style={{ height: "48px", width: "auto", objectFit: "contain" }}
              />
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
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                color: "#FFFFFF",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className="lg:hidden"
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 55,
          backgroundColor: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Panel mobile — slide in from right */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(85vw, 320px)",
          zIndex: 60,
          backgroundColor: "#0D0D0D",
          borderLeft: "1px solid rgba(126,217,87,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            height: "64px",
            borderBottom: "1px solid rgba(126,217,87,0.1)",
            flexShrink: 0,
          }}
        >
          <img src="/logo_cobrafantasmas_web.png" alt="Cobrafantasmas" style={{ height: "40px", width: "auto" }} />
          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              color: "#FFFFFF",
              cursor: "pointer",
            }}
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV_LINKS.map((link) => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 24px",
                    height: "52px",
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "1rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#7ED957" : "#CCCCCC",
                    borderLeft: isActive ? "2px solid #7ED957" : "2px solid transparent",
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "color 0.15s",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* CTAs */}
        <div
          style={{
            padding: "16px 20px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <Link href="/login">
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "48px",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "8px",
                textDecoration: "none",
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Acceso clientes
            </span>
          </Link>
          <Link href="/activar-caso">
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "52px",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#FFFFFF",
                backgroundColor: "#E41E26",
                borderRadius: "8px",
                textDecoration: "none",
                cursor: "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                boxShadow: "0 4px 20px rgba(228,30,38,0.35)",
              }}
            >
              ACTIVAR CASO →
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
