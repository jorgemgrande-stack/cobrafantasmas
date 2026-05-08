import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { usePublicPhone } from "@/hooks/usePublicPhone";
import { toast } from "sonner";
import { Phone, Mail, Clock } from "lucide-react";

const NEON = "#7ED957";
const DANGER = "#E41E26";
const BG = "#0A0A0A";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "0.5rem",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,0.6)",
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "0.4rem",
  letterSpacing: "0.04em",
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: "",
  });

  const { data: pageBlocks = [] } = trpc.public.getPublicPageBlocks.useQuery({ slug: "contacto" });
  const heroBlock = (pageBlocks as any[]).find((b: any) => b.blockType === "hero");
  const heroImageUrl: string = heroBlock ? String(heroBlock.data?.imageUrl ?? "") : "";
  const overlayOpacity: number = heroBlock ? Number(heroBlock.data?.overlayOpacity ?? 75) / 100 : 0.75;

  const submitLead = trpc.public.submitLead.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: () => toast.error("Error al enviar el mensaje. Inténtalo de nuevo."),
  });

  const { phone, phoneTel } = usePublicPhone();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLead.mutateAsync({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      message: `Asunto: ${formData.subject}\n\n${formData.message}`,
      source: "web_contacto",
    });
  };

  const onFocusNeon = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "rgba(126,217,87,0.5)";
  };
  const onBlurNeon = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
  };

  return (
    <PublicLayout fullWidthHero>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
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
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Contacto</span>
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
            CONTACTO
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.15rem", maxWidth: "600px" }}>
            ¿Tienes una deuda pendiente? Cuéntanos tu caso. Respondemos en menos de 24 horas.
          </p>
        </div>
      </section>

      {/* ── Contenido principal ───────────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "clamp(3rem, 7vw, 5rem) 0" }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Formulario ──────────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div
                  style={{
                    backgroundColor: "#111",
                    border: `1px solid rgba(126,217,87,0.35)`,
                    borderRadius: "1rem",
                    padding: "clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2.5rem)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(126,217,87,0.1)",
                      border: `1px solid rgba(126,217,87,0.35)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                    }}
                  >
                    <span style={{ color: NEON, fontSize: "1.75rem", lineHeight: 1 }}>✓</span>
                  </div>
                  <h2
                    className="font-display"
                    style={{ color: "#fff", fontSize: "2rem", letterSpacing: "0.06em", marginBottom: "0.75rem" }}
                  >
                    MENSAJE ENVIADO
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: "2rem", lineHeight: 1.7 }}>
                    Nos pondremos en contacto contigo en menos de 24 horas laborables.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                    }}
                    style={{
                      padding: "0.75rem 2rem",
                      borderRadius: "0.5rem",
                      border: `1.5px solid rgba(126,217,87,0.4)`,
                      background: "transparent",
                      color: NEON,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(126,217,87,0.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1rem",
                    padding: "clamp(1.25rem, 4vw, 2.5rem)",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
                  }}
                >
                  <h2
                    className="font-display"
                    style={{ color: "#fff", fontSize: "1.5rem", letterSpacing: "0.06em", marginBottom: "0.5rem" }}
                  >
                    ENVÍANOS UN MENSAJE
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginBottom: "2rem" }}>
                    Los campos marcados con * son obligatorios
                  </p>

                  <form onSubmit={handleSubmit} noValidate>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      {/* Nombre + Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label style={labelStyle}>Nombre *</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Tu nombre completo"
                            style={inputStyle}
                            onFocus={onFocusNeon}
                            onBlur={onBlurNeon}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Email *</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="tu@email.com"
                            style={inputStyle}
                            onFocus={onFocusNeon}
                            onBlur={onBlurNeon}
                          />
                        </div>
                      </div>

                      {/* Teléfono + Asunto */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label style={labelStyle}>Teléfono</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+34 600 000 000"
                            style={inputStyle}
                            onFocus={onFocusNeon}
                            onBlur={onBlurNeon}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Asunto *</label>
                          <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                            placeholder="¿En qué podemos ayudarte?"
                            style={inputStyle}
                            onFocus={onFocusNeon}
                            onBlur={onBlurNeon}
                          />
                        </div>
                      </div>

                      {/* Mensaje */}
                      <div>
                        <label style={labelStyle}>Mensaje *</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          rows={5}
                          placeholder="Cuéntanos el caso o la consulta que tienes..."
                          style={{
                            ...inputStyle,
                            resize: "vertical",
                            minHeight: "120px",
                          }}
                          onFocus={onFocusNeon}
                          onBlur={onBlurNeon}
                        />
                      </div>

                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.25rem" }}>
                        <button
                          type="submit"
                          disabled={submitLead.isPending}
                          style={{
                            width: "100%",
                            padding: "1rem 2rem",
                            backgroundColor: submitLead.isPending ? "rgba(228,30,38,0.5)" : DANGER,
                            border: "none",
                            borderRadius: "0.5rem",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "1rem",
                            cursor: submitLead.isPending ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.6rem",
                            boxShadow: submitLead.isPending ? "none" : "0 8px 24px rgba(228,30,38,0.4)",
                            letterSpacing: "0.04em",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (!submitLead.isPending) {
                              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 32px rgba(228,30,38,0.55)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(228,30,38,0.4)";
                          }}
                        >
                          {submitLead.isPending ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Enviando...
                            </>
                          ) : (
                            "ENVIAR MENSAJE"
                          )}
                        </button>
                        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", marginTop: "0.75rem" }}>
                          Respondemos en menos de 24 horas laborables.
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* ── Info de contacto ─────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3
                className="font-display"
                style={{ color: NEON, fontSize: "0.85rem", letterSpacing: "0.18em", marginBottom: "0.5rem" }}
              >
                CANALES DE CONTACTO
              </h3>

              {/* Teléfono */}
              <a href={phoneTel} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                    transition: "border-color 0.2s, transform 0.2s",
                    cursor: "pointer",
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
                      width: "40px",
                      height: "40px",
                      borderRadius: "0.5rem",
                      backgroundColor: "rgba(126,217,87,0.1)",
                      border: "1px solid rgba(126,217,87,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={18} color={NEON} />
                  </div>
                  <div>
                    <p style={{ color: NEON, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                      Teléfono
                    </p>
                    <p style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.2rem" }}>{phone}</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Lun–Vie: 9:00 – 19:00</p>
                  </div>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:operaciones@cobrafantasmas.es" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                    transition: "border-color 0.2s, transform 0.2s",
                    cursor: "pointer",
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
                      width: "40px",
                      height: "40px",
                      borderRadius: "0.5rem",
                      backgroundColor: "rgba(126,217,87,0.1)",
                      border: "1px solid rgba(126,217,87,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={18} color={NEON} />
                  </div>
                  <div>
                    <p style={{ color: NEON, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                      Email
                    </p>
                    <p style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                      operaciones@cobrafantasmas.es
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Respuesta en menos de 24h</p>
                  </div>
                </div>
              </a>

              {/* Horario */}
              <div
                style={{
                  backgroundColor: "#111",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "0.5rem",
                    backgroundColor: "rgba(126,217,87,0.1)",
                    border: "1px solid rgba(126,217,87,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Clock size={18} color={NEON} />
                </div>
                <div>
                  <p style={{ color: NEON, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                    Horario
                  </p>
                  <p style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.2rem" }}>Lun–Vie: 9:00 – 19:00</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Sáb: 10:00 – 14:00</p>
                </div>
              </div>

              {/* CTA box */}
              <div
                style={{
                  backgroundColor: "rgba(228,30,38,0.07)",
                  border: "1px solid rgba(228,30,38,0.2)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <p style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  ¿Tienes una deuda que reclamar?
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                  Activa un expediente y empieza hoy. Análisis inicial gratuito.
                </p>
                <Link href="/activar-caso">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.65rem 1.25rem",
                      backgroundColor: DANGER,
                      borderRadius: "0.5rem",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      letterSpacing: "0.05em",
                      textDecoration: "none",
                      boxShadow: "0 4px 12px rgba(228,30,38,0.35)",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLSpanElement).style.boxShadow = "0 8px 24px rgba(228,30,38,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLSpanElement).style.boxShadow = "0 4px 12px rgba(228,30,38,0.35)";
                    }}
                  >
                    ACTIVAR CASO →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#111", padding: "clamp(3rem, 7vw, 5rem) 0", textAlign: "center" }}>
        <div className="container">
          <h2
            className="font-display"
            style={{
              color: "#fff",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              letterSpacing: "0.04em",
              marginBottom: "1.25rem",
            }}
          >
            ¿PREFIERES ACTIVAR DIRECTAMENTE?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
            Rellena el formulario de caso y analizamos tu deuda sin coste.
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
              ACTIVAR ANÁLISIS GRATUITO →
            </button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
