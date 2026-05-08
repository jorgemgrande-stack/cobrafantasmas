import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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

interface FormData {
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  importe: string;
  antiguedad_deuda: string;
  tipo_deuda: string;
  tiene_documentacion: string;
  descripcion: string;
  privacidad: boolean;
  comunicaciones: boolean;
}

const EMPTY_FORM: FormData = {
  nombre: "",
  empresa: "",
  telefono: "",
  email: "",
  importe: "",
  antiguedad_deuda: "",
  tipo_deuda: "",
  tiene_documentacion: "",
  descripcion: "",
  privacidad: false,
  comunicaciones: false,
};

export default function ActivarCaso() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const { data: pageBlocks = [] } = trpc.public.getPublicPageBlocks.useQuery({ slug: "activar-caso" });
  const heroBlock = (pageBlocks as any[]).find((b: any) => b.blockType === "hero");
  const heroImageUrl: string = heroBlock ? String(heroBlock.data?.imageUrl ?? "") : "";
  const overlayOpacity: number = heroBlock ? Number(heroBlock.data?.overlayOpacity ?? 75) / 100 : 0.75;

  const submitLead = trpc.public.submitLead.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast.error("Error al enviar el formulario. Inténtalo de nuevo.");
    },
  });

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.nombre.trim()) newErrors.nombre = "Campo obligatorio";
    if (!form.telefono.trim()) newErrors.telefono = "Campo obligatorio";
    if (!form.email.trim()) newErrors.email = "Campo obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Email no válido";
    if (!form.importe.trim()) newErrors.importe = "Campo obligatorio";
    if (!form.antiguedad_deuda) newErrors.antiguedad_deuda = "Selecciona una opción";
    if (!form.tipo_deuda) newErrors.tipo_deuda = "Selecciona una opción";
    if (!form.tiene_documentacion) newErrors.tiene_documentacion = "Selecciona una opción";
    if (!form.descripcion.trim()) newErrors.descripcion = "Campo obligatorio";
    if (!form.privacidad) newErrors.privacidad = "Debes aceptar la política de privacidad";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const mensaje = [
      `Importe aproximado: ${form.importe}`,
      `Antigüedad deuda: ${form.antiguedad_deuda}`,
      `Tipo de deuda: ${form.tipo_deuda}`,
      `Documentación: ${form.tiene_documentacion}`,
      form.empresa ? `Empresa: ${form.empresa}` : "",
      `\nDescripción:\n${form.descripcion}`,
      form.comunicaciones ? "\n[Acepta comunicaciones sobre el estado del caso]" : "",
    ]
      .filter(Boolean)
      .join("\n");

    await submitLead.mutateAsync({
      name: form.nombre,
      email: form.email,
      phone: form.telefono || undefined,
      message: mensaje,
      source: "web_activar_caso",
    });
  };

  const fieldBorder = (field: keyof FormData) =>
    errors[field] ? `1px solid ${DANGER}` : "1px solid rgba(255,255,255,0.12)";

  const ErrorMsg = ({ field }: { field: keyof FormData }) =>
    errors[field] ? (
      <p style={{ color: DANGER, fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors[field]}</p>
    ) : null;

  return (
    <PublicLayout fullWidthHero>
      {/* ── Hero interior ─────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: BG,
          borderBottom: `2px solid ${DANGER}`,
          padding: "3.5rem 0 2.5rem",
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
          <div className="flex items-center gap-2 text-sm mb-5" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Link
              href="/"
              style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = NEON)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              Inicio
            </Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Activar caso</span>
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              color: "#fff",
              letterSpacing: "0.04em",
              lineHeight: 1,
              marginBottom: "0.75rem",
            }}
          >
            ACTIVA TU CASO
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.05rem", maxWidth: "560px" }}>
            Análisis inicial gratuito. Sin compromiso. Solo avanzamos si el caso tiene sentido.
          </p>
        </div>
      </section>

      {/* ── Formulario ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "4rem 0 5rem" }}>
        <div className="container">
          <div style={{ maxWidth: "672px", margin: "0 auto" }}>
            {submitted ? (
              /* ── Estado de éxito ── */
              <div
                style={{
                  backgroundColor: "#111",
                  border: `1px solid rgba(126,217,87,0.35)`,
                  borderRadius: "1rem",
                  padding: "4rem 2rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "50%",
                    backgroundColor: "rgba(126,217,87,0.15)",
                    border: `2px solid ${NEON}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    fontSize: "1.75rem",
                  }}
                >
                  ✓
                </div>
                <h2
                  className="font-display"
                  style={{ color: "#fff", fontSize: "2rem", letterSpacing: "0.06em", marginBottom: "1rem" }}
                >
                  CASO REGISTRADO
                </h2>
                <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "2rem" }}>
                  Hemos recibido tu caso. Un gestor analizará la información y te contactará en menos de 24 horas
                  laborables.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm(EMPTY_FORM);
                    setErrors({});
                  }}
                  style={{
                    backgroundColor: "transparent",
                    color: NEON,
                    border: `1px solid rgba(126,217,87,0.4)`,
                    borderRadius: "0.5rem",
                    padding: "0.75rem 1.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(126,217,87,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                >
                  Enviar otro caso
                </button>
              </div>
            ) : (
              /* ── Formulario ── */
              <div
                style={{
                  backgroundColor: "#111",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "2.5rem",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
                }}
              >
                <h2
                  className="font-display"
                  style={{ color: "#fff", fontSize: "1.5rem", letterSpacing: "0.06em", marginBottom: "0.5rem" }}
                >
                  CUÉNTANOS TU CASO
                </h2>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginBottom: "2rem" }}>
                  Los campos marcados con * son obligatorios
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Nombre + Empresa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label style={labelStyle}>Nombre *</label>
                        <input
                          type="text"
                          value={form.nombre}
                          onChange={(e) => set("nombre", e.target.value)}
                          placeholder="Tu nombre completo"
                          style={{ ...inputStyle, border: fieldBorder("nombre") }}
                          onFocus={(e) => {
                            if (!errors.nombre)
                              (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(126,217,87,0.5)";
                          }}
                          onBlur={(e) => {
                            if (!errors.nombre)
                              (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.12)";
                          }}
                        />
                        <ErrorMsg field="nombre" />
                      </div>
                      <div>
                        <label style={labelStyle}>Empresa</label>
                        <input
                          type="text"
                          value={form.empresa}
                          onChange={(e) => set("empresa", e.target.value)}
                          placeholder="Empresa (si aplica)"
                          style={inputStyle}
                          onFocus={(e) => {
                            (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(126,217,87,0.5)";
                          }}
                          onBlur={(e) => {
                            (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.12)";
                          }}
                        />
                      </div>
                    </div>

                    {/* Teléfono + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label style={labelStyle}>Teléfono *</label>
                        <input
                          type="tel"
                          value={form.telefono}
                          onChange={(e) => set("telefono", e.target.value)}
                          placeholder="+34 600 000 000"
                          style={{ ...inputStyle, border: fieldBorder("telefono") }}
                          onFocus={(e) => {
                            if (!errors.telefono)
                              (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(126,217,87,0.5)";
                          }}
                          onBlur={(e) => {
                            if (!errors.telefono)
                              (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.12)";
                          }}
                        />
                        <ErrorMsg field="telefono" />
                      </div>
                      <div>
                        <label style={labelStyle}>Email *</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="tu@email.com"
                          style={{ ...inputStyle, border: fieldBorder("email") }}
                          onFocus={(e) => {
                            if (!errors.email)
                              (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(126,217,87,0.5)";
                          }}
                          onBlur={(e) => {
                            if (!errors.email)
                              (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.12)";
                          }}
                        />
                        <ErrorMsg field="email" />
                      </div>
                    </div>

                    {/* Importe */}
                    <div>
                      <label style={labelStyle}>Importe aproximado *</label>
                      <input
                        type="text"
                        value={form.importe}
                        onChange={(e) => set("importe", e.target.value)}
                        placeholder="Importe aproximado (€)"
                        style={{ ...inputStyle, border: fieldBorder("importe") }}
                        onFocus={(e) => {
                          if (!errors.importe)
                            (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(126,217,87,0.5)";
                        }}
                        onBlur={(e) => {
                          if (!errors.importe)
                            (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.12)";
                        }}
                      />
                      <ErrorMsg field="importe" />
                    </div>

                    {/* Antigüedad + Tipo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label style={labelStyle}>Antigüedad de la deuda *</label>
                        <select
                          value={form.antiguedad_deuda}
                          onChange={(e) => set("antiguedad_deuda", e.target.value)}
                          style={{
                            ...inputStyle,
                            border: fieldBorder("antiguedad_deuda"),
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="" style={{ backgroundColor: "#1a1a1a" }}>Seleccionar...</option>
                          <option value="menos_3m" style={{ backgroundColor: "#1a1a1a" }}>Menos de 3 meses</option>
                          <option value="3_6m" style={{ backgroundColor: "#1a1a1a" }}>3 a 6 meses</option>
                          <option value="6m_1a" style={{ backgroundColor: "#1a1a1a" }}>6 meses a 1 año</option>
                          <option value="mas_1a" style={{ backgroundColor: "#1a1a1a" }}>Más de 1 año</option>
                        </select>
                        <ErrorMsg field="antiguedad_deuda" />
                      </div>
                      <div>
                        <label style={labelStyle}>Tipo de deuda *</label>
                        <select
                          value={form.tipo_deuda}
                          onChange={(e) => set("tipo_deuda", e.target.value)}
                          style={{
                            ...inputStyle,
                            border: fieldBorder("tipo_deuda"),
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="" style={{ backgroundColor: "#1a1a1a" }}>Seleccionar...</option>
                          <option value="factura_b2b" style={{ backgroundColor: "#1a1a1a" }}>Factura impagada</option>
                          <option value="prestamo" style={{ backgroundColor: "#1a1a1a" }}>Préstamo personal</option>
                          <option value="comision" style={{ backgroundColor: "#1a1a1a" }}>Comisión / acuerdo comercial</option>
                          <option value="alquiler" style={{ backgroundColor: "#1a1a1a" }}>Alquiler / inmueble</option>
                          <option value="trabajo" style={{ backgroundColor: "#1a1a1a" }}>Trabajo realizado</option>
                          <option value="otro" style={{ backgroundColor: "#1a1a1a" }}>Otro</option>
                        </select>
                        <ErrorMsg field="tipo_deuda" />
                      </div>
                    </div>

                    {/* Documentación */}
                    <div>
                      <label style={labelStyle}>¿Tienes documentación? *</label>
                      <select
                        value={form.tiene_documentacion}
                        onChange={(e) => set("tiene_documentacion", e.target.value)}
                        style={{
                          ...inputStyle,
                          border: fieldBorder("tiene_documentacion"),
                          appearance: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="" style={{ backgroundColor: "#1a1a1a" }}>Seleccionar...</option>
                        <option value="si_completa" style={{ backgroundColor: "#1a1a1a" }}>Sí, tengo documentación</option>
                        <option value="parcial" style={{ backgroundColor: "#1a1a1a" }}>Tengo algo, no todo</option>
                        <option value="no" style={{ backgroundColor: "#1a1a1a" }}>Sin documentación formal</option>
                      </select>
                      <ErrorMsg field="tiene_documentacion" />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label style={labelStyle}>Descripción del caso *</label>
                      <textarea
                        value={form.descripcion}
                        onChange={(e) => set("descripcion", e.target.value)}
                        rows={4}
                        placeholder="Cuéntanos brevemente la situación: quién debe, por qué y qué ha pasado hasta ahora..."
                        style={{
                          ...inputStyle,
                          border: fieldBorder("descripcion"),
                          resize: "vertical",
                          fontFamily: "inherit",
                          lineHeight: 1.6,
                        }}
                        onFocus={(e) => {
                          if (!errors.descripcion)
                            (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(126,217,87,0.5)";
                        }}
                        onBlur={(e) => {
                          if (!errors.descripcion)
                            (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.12)";
                        }}
                      />
                      <ErrorMsg field="descripcion" />
                    </div>

                    {/* Separador */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.25rem" }} />

                    {/* Checkboxes */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.privacidad}
                          onChange={(e) => set("privacidad", e.target.checked)}
                          style={{
                            marginTop: "0.1rem",
                            width: "1rem",
                            height: "1rem",
                            cursor: "pointer",
                            flexShrink: 0,
                            accentColor: NEON,
                          }}
                        />
                        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                          He leído y acepto la{" "}
                          <Link
                            href="/politica-privacidad"
                            style={{ color: NEON, textDecoration: "underline" }}
                          >
                            política de privacidad
                          </Link>{" "}
                          *
                        </span>
                      </label>
                      {errors.privacidad && (
                        <p style={{ color: DANGER, fontSize: "0.78rem", marginTop: "-0.5rem", marginLeft: "1.75rem" }}>
                          {errors.privacidad}
                        </p>
                      )}

                      <label
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.comunicaciones}
                          onChange={(e) => set("comunicaciones", e.target.checked)}
                          style={{
                            marginTop: "0.1rem",
                            width: "1rem",
                            height: "1rem",
                            cursor: "pointer",
                            flexShrink: 0,
                            accentColor: NEON,
                          }}
                        />
                        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                          Acepto recibir comunicaciones sobre el estado de mi caso
                        </span>
                      </label>
                    </div>

                    {/* Botón de envío */}
                    <button
                      type="submit"
                      disabled={submitLead.isPending}
                      style={{
                        width: "100%",
                        padding: "1.1rem 2rem",
                        backgroundColor: submitLead.isPending ? "rgba(228,30,38,0.5)" : DANGER,
                        border: "none",
                        borderRadius: "0.5rem",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        cursor: submitLead.isPending ? "not-allowed" : "pointer",
                        letterSpacing: "0.08em",
                        boxShadow: submitLead.isPending ? "none" : "0 8px 24px rgba(228,30,38,0.4)",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.6rem",
                        marginTop: "0.5rem",
                      }}
                      onMouseEnter={(e) => {
                        if (!submitLead.isPending) {
                          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                          (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "0 12px 32px rgba(228,30,38,0.55)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(228,30,38,0.4)";
                      }}
                    >
                      {submitLead.isPending ? (
                        <>
                          <svg className="animate-spin" style={{ width: "1.1rem", height: "1.1rem" }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Enviando análisis...
                        </>
                      ) : (
                        "ACTIVAR ANÁLISIS →"
                      )}
                    </button>

                    <p
                      style={{
                        textAlign: "center",
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Respuesta en menos de 24h laborables. Evaluación inicial gratuita.
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* ── 3 garantías ── */}
            {!submitted && (
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                style={{ marginTop: "1.75rem" }}
              >
                {[
                  "Evaluación sin compromiso",
                  "Sin letra pequeña",
                  "Confidencialidad garantizada",
                ].map((g, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: NEON, fontWeight: 700, fontSize: "1rem" }}>✓</span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem" }}>{g}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
