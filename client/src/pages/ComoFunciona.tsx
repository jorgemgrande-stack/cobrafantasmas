import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

const NEON   = "#7ED957";
const DANGER = "#E41E26";
const BG     = "#0A0A0A";

// ─── Animated counter (IntersectionObserver) ──────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const duration = 1800;
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setCount(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Scoring SVG animado ──────────────────────────────────────────────────────
function ScoringGraph() {
  return (
    <svg viewBox="0 0 280 100" style={{ width: "100%", height: "100px", display: "block" }}>
      {/* grid */}
      {[25, 50, 75].map(y => (
        <line key={y} x1="0" y1={y} x2="280" y2={y}
          stroke="rgba(126,217,87,0.12)" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {/* area */}
      <polygon
        points="0,80 35,70 70,58 105,62 140,38 175,32 210,18 245,22 280,8 280,100 0,100"
        fill="rgba(126,217,87,0.06)" />
      {/* línea */}
      <polyline
        points="0,80 35,70 70,58 105,62 140,38 175,32 210,18 245,22 280,8"
        fill="none" stroke={NEON} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="600" strokeDashoffset="600"
        style={{ animation: "cfDraw 2.4s ease forwards 0.3s" }} />
      {/* puntos */}
      {([[140,38],[210,18],[280,8]] as [number,number][]).map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4.5" fill={BG} stroke={NEON} strokeWidth="2"
          style={{ opacity: 0, animation: `cfFade 0.4s ease forwards ${1.2 + i * 0.25}s` }} />
      ))}
      {/* labels */}
      <text x="4"   y="96" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">DÍA 0</text>
      <text x="224" y="96" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">DÍA 30</text>
      <text x="236" y="14" fill={NEON} fontSize="9" fontFamily="monospace" fontWeight="700">+87%</text>
    </svg>
  );
}

// ─── Radar pulso SVG ──────────────────────────────────────────────────────────
function RadarPulse() {
  return (
    <svg viewBox="0 0 80 80" style={{ width: "64px", height: "64px", flexShrink: 0 }}>
      <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(126,217,87,0.12)" strokeWidth="1" />
      <circle cx="40" cy="40" r="24" fill="none" stroke="rgba(126,217,87,0.18)" strokeWidth="1" />
      <circle cx="40" cy="40" r="12" fill="none" stroke="rgba(126,217,87,0.28)" strokeWidth="1" />
      <circle cx="40" cy="40" r="4"  fill={NEON} style={{ animation: "cfPulse 1.8s ease-in-out infinite" }} />
      <line x1="40" y1="4" x2="40" y2="76" stroke="rgba(126,217,87,0.08)" strokeWidth="1" />
      <line x1="4"  y1="40" x2="76" y2="40" stroke="rgba(126,217,87,0.08)" strokeWidth="1" />
      <line x1="40" y1="40" x2="62" y2="14" stroke={NEON} strokeWidth="1.5" strokeOpacity="0.7"
        style={{ transformOrigin: "40px 40px", animation: "cfSpin 3s linear infinite" }} />
    </svg>
  );
}

// ─── Paso icon ────────────────────────────────────────────────────────────────
const STEP_ICONS = [
  // 01 subir caso
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>,
  // 02 IA análisis
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
    <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
    <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    <line x1="10" y1="6" x2="14" y2="6"/><line x1="10" y1="18" x2="14" y2="18"/>
  </svg>,
  // 03 propuesta humana
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>,
  // 04 protocolo activo
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>,
];

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ComoFunciona() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    { num: "01", title: "SUBES TU CASO",      desc: "Formulario de análisis. Datos básicos de la deuda, importe y situación. Sin papeleos iniciales." },
    { num: "02", title: "ANÁLISIS IA",         desc: "Sistema evalúa viabilidad, historial, tipo de deuda y probabilidad de recuperación en tiempo real." },
    { num: "03", title: "PROPUESTA HUMANA",    desc: "Gestor especializado revisa el caso y te presenta propuesta personalizada con condiciones claras." },
    { num: "04", title: "PROTOCOLO ACTIVO",    desc: "Tras aceptación, el sistema arranca. Multicanal. Continuo. Documentado. Imparable." },
  ];

  const tech = [
    { title: "IA PERSISTENTE",          desc: "Motor de scoring que evalúa cada señal del deudor y adapta la cadencia de contacto en tiempo real.", graph: true },
    { title: "AUTOMATIZACIÓN MULTICANAL", desc: "Email, WhatsApp, llamadas y SMS coordinados. Cadencias que se ajustan al comportamiento del deudor." },
    { title: "TRAZABILIDAD LEGAL",       desc: "Cada acción queda registrada con timestamp, canal e IP. Documentación lista para cualquier requerimiento." },
  ];

  const team = [
    { title: "GESTORES DE RECOBRO",    desc: "Especialistas en negociación y seguimiento. Revisan cada expediente, proponen acuerdos y supervisan el protocolo.", icon: "⚡" },
    { title: "OPERARIOS PRESENCIALES", desc: "Cuando el caso lo requiere, equipo físico sobre el terreno. Visitas, recogida de firmas y evidencias documentadas.", icon: "🎯" },
  ];

  const faqs = [
    { q: "¿Necesito contratar a un abogado antes de activar el servicio?",
      a: "No. Cobrafantasmas opera de forma extrajudicial. No necesitas abogado para empezar. Si el caso requiere vía judicial, te lo comunicamos." },
    { q: "¿Cuánto tiempo tarda el análisis inicial?",
      a: "La evaluación inicial se realiza en menos de 24 horas laborables. Recibirás respuesta directa de un gestor." },
    { q: "¿Qué pasa si el deudor no tiene dinero para pagar?",
      a: "El protocolo explora la capacidad real de pago, activos y vías de acuerdo. Negociamos soluciones parciales o fraccionadas." },
    { q: "¿Puedo cancelar el servicio en cualquier momento?",
      a: "Sí. Puedes cancelar el expediente activo comunicándolo a tu gestor. Las condiciones de cancelación están detalladas en la propuesta." },
  ];

  const ticker = [
    "Expediente #EXP-000312 · Protocolo activo",
    "Caso activado · Análisis completado en 18h",
    "Acuerdo de pago alcanzado · €4.800 recuperados",
    "Nuevo expediente · Deuda empresarial €22.000",
    "Protocolo intensivo iniciado · 3 canales activos",
  ];
  const [tickIdx, setTickIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTickIdx(i => (i + 1) % ticker.length), 3000);
    return () => clearInterval(t);
  }, []);

  const { data: pageBlocks = [] } = trpc.public.getPublicPageBlocks.useQuery({ slug: "como-funciona" });
  const heroBlock = (pageBlocks as any[]).find((b: any) => b.blockType === "hero");
  const heroImageUrl: string = heroBlock ? String(heroBlock.data?.imageUrl ?? "") : "";
  const overlayOpacity: number = heroBlock ? Number(heroBlock.data?.overlayOpacity ?? 75) / 100 : 0.75;

  return (
    <PublicLayout fullWidthHero>

      {/* ── Estilos de animación ── */}
      <style>{`
        @keyframes cfDraw   { to { stroke-dashoffset: 0; } }
        @keyframes cfFade   { to { opacity: 1; } }
        @keyframes cfPulse  { 0%,100%{r:4;opacity:1} 50%{r:7;opacity:0.5} }
        @keyframes cfSpin   { to { transform: rotate(360deg); } }
        @keyframes cfScanY  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes cfBlink  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes cfSlideUp{ from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cfGlow   { 0%,100%{box-shadow:0 0 24px rgba(228,30,38,0.45)} 50%{box-shadow:0 0 48px rgba(228,30,38,0.8)} }
        @keyframes cfTickIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .cf-step-card:hover .cf-step-num  { opacity: 0.12; }
        .cf-step-card:hover                { border-color: rgba(126,217,87,0.35) !important; }
        .cf-faq-btn:hover span:first-child { color: ${NEON} !important; }
      `}</style>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        backgroundColor: BG,
        borderBottom: `1px solid rgba(126,217,87,0.2)`,
        padding: "5rem 0 4rem",
        position: "relative",
        overflow: "hidden",
        ...(heroImageUrl ? {
          backgroundImage: `url('${heroImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          backgroundRepeat: "no-repeat",
        } : {}),
      }}>
        {/* Overlay oscuro sobre la imagen */}
        {heroImageUrl && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundColor: `rgba(10,10,10,${overlayOpacity})`,
          }} />
        )}
        {/* Grid de fondo */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(126,217,87,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(126,217,87,0.04) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />
        {/* Scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(126,217,87,0.15), transparent)",
          animation: "cfScanY 6s linear infinite", pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative" }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
            <span style={{ color: NEON, animation: "cfBlink 2s ease-in-out infinite" }}>▶</span>
            <Link href="/" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = NEON)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
              INICIO
            </Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.55)" }}>CÓMO FUNCIONAMOS</span>
          </div>

          <h1 className="font-display" style={{
            fontSize: "clamp(2.8rem,7vw,6rem)", color: "#fff",
            letterSpacing: "0.04em", lineHeight: 1, marginBottom: "1.25rem",
          }}>
            CÓMO<br />
            <span style={{ color: NEON }}>FUNCIONAMOS</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.1rem", maxWidth: "520px", marginBottom: "3.5rem" }}>
            Tecnología, persistencia y operativa humana. Sin magia. Sin burocracia.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { label: "EXPEDIENTES ACTIVOS",    target: 127, suffix: "" },
              { label: "TASA DE RECUPERACIÓN",   target: 89,  suffix: "%" },
              { label: "HORAS RESPUESTA MEDIA",  target: 18,  suffix: "h" },
              { label: "CANALES OPERATIVOS",      target: 4,   suffix: "" },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display" style={{ fontSize: "2.5rem", color: NEON, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", letterSpacing: "0.15em", marginTop: "0.25rem", fontFamily: "monospace" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESO: 4 pasos en grid ─────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "6rem 0" }}>
        <div className="container">
          <div className="flex items-center gap-3 mb-12">
            <RadarPulse />
            <div>
              <p style={{ color: NEON, fontSize: "0.7rem", letterSpacing: "0.2em", fontFamily: "monospace", marginBottom: "0.25rem" }}>
                PROTOCOLO / 01
              </p>
              <h2 className="font-display" style={{ color: "#fff", fontSize: "2rem", letterSpacing: "0.06em" }}>
                EL PROCESO
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "1px", background: "rgba(126,217,87,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
            {steps.map((step, i) => (
              <div key={i} className="cf-step-card" style={{
                position: "relative", overflow: "hidden",
                backgroundColor: i % 2 === 0 ? BG : "#0d0d0d",
                padding: "2.5rem",
                transition: "border-color 0.3s",
                border: "1px solid transparent",
              }}>
                {/* Número watermark */}
                <div className="cf-step-num font-display" style={{
                  position: "absolute", right: "-0.5rem", bottom: "-1.5rem",
                  fontSize: "9rem", fontWeight: 900, lineHeight: 1,
                  color: "rgba(126,217,87,0.06)", pointerEvents: "none",
                  userSelect: "none", transition: "opacity 0.3s", fontFamily: "monospace",
                }}>
                  {step.num}
                </div>

                {/* Icono + número */}
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: 48, height: 48, borderRadius: "0.5rem",
                    border: `1px solid rgba(126,217,87,0.25)`,
                    background: "rgba(126,217,87,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {STEP_ICONS[i]}
                  </div>
                  <span style={{ color: "rgba(126,217,87,0.5)", fontSize: "0.7rem", letterSpacing: "0.2em", fontFamily: "monospace" }}>
                    PASO {step.num}
                  </span>
                </div>

                <h3 className="font-display" style={{
                  color: "#fff", fontSize: "1.35rem", letterSpacing: "0.08em",
                  marginBottom: "0.75rem", position: "relative",
                }}>
                  {step.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontSize: "0.9rem", position: "relative" }}>
                  {step.desc}
                </p>

                {/* Conector → solo en desktop */}
                {i < 3 && (
                  <div style={{
                    position: "absolute", bottom: "1rem", right: "1rem",
                    color: "rgba(126,217,87,0.25)", fontSize: "1.2rem", fontFamily: "monospace",
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Separador diagonal ───────────────────────────────────────────── */}
      <div style={{ position: "relative", height: "48px", backgroundColor: BG, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <polygon points="0,0 1440,0 1440,48 0,0" fill="#111" />
        </svg>
      </div>

      {/* ─── TECNOLOGÍA — layout asimétrico ───────────────────────────────── */}
      <section style={{ backgroundColor: "#111", padding: "6rem 0" }}>
        <div className="container">
          <div className="flex items-center gap-3 mb-12">
            <div style={{
              width: 40, height: 40, border: `1px solid ${NEON}`, borderRadius: "0.35rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="1.8" style={{ width: 20, height: 20 }}>
                <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
                <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
              </svg>
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.2em", fontFamily: "monospace", marginBottom: "0.25rem" }}>
                PROTOCOLO / 02
              </p>
              <h2 className="font-display" style={{ color: "#fff", fontSize: "2rem", letterSpacing: "0.06em" }}>
                TECNOLOGÍA
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Card protagonista — IA PERSISTENTE */}
            <div style={{
              gridColumn: "span 2", backgroundColor: BG,
              border: `1px solid rgba(126,217,87,0.25)`,
              borderRadius: "1rem", padding: "2.5rem",
              position: "relative", overflow: "hidden",
            }}>
              {/* Glow */}
              <div style={{
                position: "absolute", top: "-40px", right: "-40px",
                width: "200px", height: "200px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(126,217,87,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{
                  backgroundColor: "rgba(126,217,87,0.1)", color: NEON,
                  fontSize: "0.65rem", fontFamily: "monospace", letterSpacing: "0.2em",
                  padding: "0.25rem 0.75rem", borderRadius: "99px",
                  border: `1px solid rgba(126,217,87,0.2)`,
                }}>
                  ● SISTEMA ACTIVO
                </span>
              </div>

              <h3 className="font-display" style={{
                color: NEON, fontSize: "1.6rem", letterSpacing: "0.1em",
                marginBottom: "0.75rem", marginTop: "1rem",
              }}>
                IA PERSISTENTE
              </h3>
              <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontSize: "0.9rem", marginBottom: "2rem", maxWidth: "420px" }}>
                {tech[0].desc}
              </p>

              {/* Gráfico de scoring */}
              <div style={{
                backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "0.5rem",
                border: "1px solid rgba(126,217,87,0.12)", padding: "1rem",
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                    PROBABILIDAD RECUPERACIÓN · EXP-000312
                  </span>
                  <span style={{ color: NEON, fontSize: "0.65rem", fontFamily: "monospace", fontWeight: 700 }}>
                    EN VIVO
                  </span>
                </div>
                <ScoringGraph />
              </div>
            </div>

            {/* Cards secundarias */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {tech.slice(1).map((item, i) => (
                <div key={i} style={{
                  backgroundColor: BG, border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem", padding: "1.75rem", flex: 1,
                  transition: "border-color 0.3s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(126,217,87,0.25)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>
                  <h3 className="font-display" style={{
                    color: "#fff", fontSize: "1rem", letterSpacing: "0.1em", marginBottom: "0.75rem",
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.65, fontSize: "0.88rem" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Separador diagonal inverso ───────────────────────────────────── */}
      <div style={{ position: "relative", height: "48px", backgroundColor: "#111", overflow: "hidden" }}>
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <polygon points="0,48 1440,0 1440,48" fill={BG} />
        </svg>
      </div>

      {/* ─── EQUIPO HUMANO ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "6rem 0" }}>
        <div className="container">
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.2em", fontFamily: "monospace", marginBottom: "0.5rem" }}>
            PROTOCOLO / 03
          </p>
          <h2 className="font-display" style={{ color: "#fff", fontSize: "2rem", letterSpacing: "0.06em", marginBottom: "3rem" }}>
            EQUIPO HUMANO
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ maxWidth: "860px" }}>
            {team.map((item, i) => (
              <div key={i} style={{
                backgroundColor: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "1rem", padding: "2.5rem",
                position: "relative", overflow: "hidden",
                transition: "border-color 0.3s, transform 0.3s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(126,217,87,0.25)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}>
                {/* Icono watermark */}
                <div style={{
                  position: "absolute", right: "1.5rem", top: "1.5rem",
                  fontSize: "3rem", opacity: 0.08,
                }}>
                  {item.icon}
                </div>

                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "2rem", height: "2rem", borderRadius: "50%",
                  backgroundColor: "rgba(126,217,87,0.1)", marginBottom: "1.25rem",
                }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: NEON }} />
                </div>

                <h3 className="font-display" style={{
                  color: "#fff", fontSize: "1.1rem", letterSpacing: "0.08em", marginBottom: "0.75rem",
                }}>
                  {item.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#0d0d0d", padding: "6rem 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container" style={{ maxWidth: "780px" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.2em", fontFamily: "monospace", marginBottom: "0.5rem" }}>
            PROTOCOLO / 04
          </p>
          <h2 className="font-display" style={{ color: "#fff", fontSize: "2rem", letterSpacing: "0.06em", marginBottom: "2.5rem" }}>
            PREGUNTAS DEL PROCESO
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                backgroundColor: BG,
                border: `1px solid ${openFaq === i ? "rgba(126,217,87,0.3)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "0.75rem", overflow: "hidden",
                transition: "border-color 0.25s",
              }}>
                <button className="cf-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", padding: "1.25rem 1.5rem",
                    background: "transparent", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", textAlign: "left",
                  }}>
                  <span style={{
                    color: openFaq === i ? NEON : "#fff",
                    fontWeight: 600, fontSize: "0.9rem", transition: "color 0.2s",
                  }}>
                    {faq.q}
                  </span>
                  <span style={{
                    color: NEON, fontSize: "1.1rem", flexShrink: 0, display: "inline-block",
                    transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                    transition: "transform 0.25s",
                    width: "24px", height: "24px", textAlign: "center", lineHeight: "22px",
                    border: `1px solid rgba(126,217,87,0.3)`, borderRadius: "50%",
                  }}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 1.5rem 1.25rem", animation: "cfSlideUp 0.2s ease" }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontSize: "0.9rem" }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, padding: "7rem 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Grid fondo */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(228,30,38,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(228,30,38,0.04) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }} />
        {/* Glow rojo central */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px", height: "300px",
          background: "radial-gradient(ellipse, rgba(228,30,38,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative" }}>
          <p style={{
            color: "rgba(255,255,255,0.3)", fontSize: "0.7rem",
            letterSpacing: "0.25em", fontFamily: "monospace", marginBottom: "1.5rem",
          }}>
            ▶ SISTEMA OPERATIVO · LISTO PARA ACTIVAR
          </p>

          <h2 className="font-display" style={{
            color: "#fff", fontSize: "clamp(2.5rem,5vw,4.5rem)",
            letterSpacing: "0.04em", lineHeight: 1, marginBottom: "1.25rem",
          }}>
            ¿LISTO PARA<br />
            <span style={{ color: DANGER }}>ACTIVAR?</span>
          </h2>

          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "3rem", fontSize: "1.05rem" }}>
            Cuéntanos tu caso. El análisis inicial es gratuito y sin compromiso.
          </p>

          <Link href="/activar-caso">
            <button style={{
              backgroundColor: DANGER, color: "#fff",
              border: "none", borderRadius: "0.5rem",
              padding: "1.1rem 3rem", fontSize: "1rem",
              fontWeight: 700, cursor: "pointer",
              letterSpacing: "0.08em",
              animation: "cfGlow 2.5s ease-in-out infinite",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px) scale(1.02)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0) scale(1)")}>
              ACTIVAR MI CASO →
            </button>
          </Link>

          {/* Ticker de actividad */}
          <div style={{ marginTop: "3rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.75rem",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "99px", padding: "0.5rem 1.25rem",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                backgroundColor: NEON, display: "inline-block",
                animation: "cfBlink 1.2s ease-in-out infinite",
              }} />
              <span key={tickIdx} style={{
                color: "rgba(255,255,255,0.4)", fontSize: "0.75rem",
                fontFamily: "monospace", letterSpacing: "0.05em",
                animation: "cfTickIn 0.4s ease",
              }}>
                {ticker[tickIdx]}
              </span>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
