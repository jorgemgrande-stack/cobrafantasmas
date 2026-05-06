import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Shield,
  Zap,
  Users,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Target,
  Radio,
  RefreshCw,
  Eye,
  BarChart3,
  Bot,
  MapPin,
  Clock,
  Check,
} from "lucide-react";

// ─── Slides del hero ──────────────────────────────────────────────────────────
const SLIDES = [
  {
    claim: "DONDE TERMINA\nEL BUROFAX...",
    claimHighlight: "...EMPEZAMOS\nNOSOTROS.",
    subclaim: "Cobrafantasmas. Recobro de nueva generación.",
    cta: "Activar mi caso",
    ctaHref: "/activar-caso",
    label: "[PROTOCOLO INICIADO]",
  },
  {
    claim: "HACEMOS VISIBLE",
    claimHighlight: "LO PENDIENTE.",
    subclaim: "Tecnología, persistencia y creatividad aplicada al cobro.",
    cta: "Solicitar análisis gratuito",
    ctaHref: "/activar-caso",
    label: "[SEÑAL DETECTADA]",
  },
  {
    claim: "RECUPERAMOS",
    claimHighlight: "LO QUE TE PERTENECE.",
    subclaim: "Solo cobramos si conseguimos recuperar tu dinero.",
    cta: "Quiero recuperar una deuda",
    ctaHref: "/activar-caso",
    label: "[OBJETIVO LOCALIZADO]",
  },
  {
    claim: "NO ES UNA DEUDA.",
    claimHighlight: "ES UN FANTASMA.",
    subclaim: "Cuando desaparecen, activamos protocolo.",
    cta: "Detectar mi caso",
    ctaHref: "/activar-caso",
    label: "[RASTREO ACTIVO]",
  },
];

// ─── Formulario Hero ──────────────────────────────────────────────────────────
interface LeadForm {
  nombre: string;
  telefono: string;
  email: string;
  importe: string;
  tipo_deuda: string;
  descripcion: string;
  privacidad: boolean;
}

const EMPTY_FORM: LeadForm = {
  nombre: "",
  telefono: "",
  email: "",
  importe: "",
  tipo_deuda: "",
  descripcion: "",
  privacidad: false,
};

// ─── Problemas identificados ──────────────────────────────────────────────────
const PROBLEMAS = [
  {
    label: "[NO RESPONDE]",
    text: "No coge el teléfono ni contesta mensajes.",
  },
  {
    label: "[DA LARGAS]",
    text: "Siempre hay una excusa para no pagar.",
  },
  {
    label: "[SE ESCONDE]",
    text: "Desaparece cuando se le reclama.",
  },
  {
    label: "[PROMETE Y NO PAGA]",
    text: "Acuerdos que nunca se cumplen.",
  },
  {
    label: "[CAMBIA DE NÚMERO]",
    text: "Nuevas líneas para el mismo problema.",
  },
  {
    label: "[NADIE INSISTE]",
    text: "Sin seguimiento, la deuda prescribe.",
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "¿Es legal Cobrafantasmas?",
    a: "Sí. Operamos 100% dentro del marco legal español y el RGPD. Nunca realizamos acciones que puedan interpretarse como acoso o coacción.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "La evaluación inicial es gratuita. Si aceptamos el caso, hay una cuota de activación y una comisión sobre lo recuperado. Te lo explicamos todo antes de activar.",
  },
  {
    q: "¿Qué tipo de deudas gestionáis?",
    a: "Facturas impagadas, comisiones comerciales, préstamos entre particulares, alquileres y cualquier deuda de naturaleza civil o mercantil.",
  },
  {
    q: "¿Qué pasa si el deudor no responde?",
    a: "El protocolo continúa. Exploramos todas las vías de contacto disponibles y documentamos cada acción.",
  },
  {
    q: "¿Puedo ver el seguimiento?",
    a: "Sí. Tienes acceso a un panel donde ves el estado de tu expediente, acciones realizadas y timeline completo.",
  },
  {
    q: "¿Solo cobráis si recuperáis?",
    a: "La comisión sobre el importe recuperado solo se aplica cuando hay recuperación real. La cuota de activación cubre el coste operativo inicial.",
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Home() {
  // Hero slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Formulario
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // FAQ acordeón
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // CMS slideshow
  const { data: cmsSlides } = trpc.public.getSlideshowItems.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const slides = (cmsSlides && cmsSlides.length > 0)
    ? cmsSlides.map((s) => ({
        label: s.badge || "[PROTOCOLO ACTIVO]",
        claim: s.title || "",
        claimHighlight: s.subtitle || "",
        subclaim: s.description || "",
        cta: s.ctaText || "Activar mi caso",
        ctaHref: s.ctaUrl || "/activar-caso",
        imageUrl: s.imageUrl,
      }))
    : SLIDES.map((s) => ({ ...s, imageUrl: undefined as string | undefined }));

  // tRPC mutation
  const submitLeadMutation = trpc.public.submitLead.useMutation({
    onSuccess: () => {
      toast.success("Caso recibido. Te contactamos pronto.");
      setForm(EMPTY_FORM);
      setSubmitting(false);
    },
    onError: () => {
      toast.error("Error al enviar el caso. Inténtalo de nuevo.");
      setSubmitting(false);
    },
  });

  // Autoavance slides
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      changeSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  const changeSlide = (getNext: (prev: number) => number) => {
    setSlideVisible(false);
    setTimeout(() => {
      setCurrentSlide(getNext);
      setSlideVisible(true);
    }, 300);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const goToSlide = (idx: number) => {
    startTimer();
    setSlideVisible(false);
    setTimeout(() => {
      setCurrentSlide(idx);
      setSlideVisible(true);
    }, 300);
  };

  const prevSlide = () => {
    startTimer();
    changeSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    startTimer();
    changeSlide((prev) => (prev + 1) % slides.length);
  };

  // Submit formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.privacidad) {
      toast.error("Debes aceptar la política de privacidad.");
      return;
    }
    if (!form.nombre || !form.email) {
      toast.error("Nombre y email son obligatorios.");
      return;
    }
    setSubmitting(true);
    submitLeadMutation.mutate({
      name: form.nombre,
      email: form.email,
      phone: form.telefono || undefined,
      budget: form.importe || undefined,
      selectedCategory: form.tipo_deuda || undefined,
      message: form.descripcion || undefined,
      source: "web_home",
    });
  };

  const slide = slides[currentSlide] ?? slides[0];

  return (
    <PublicLayout fullWidthHero>
      {/* ═══════════════════════════════════════════════════════════════════════
          MÓDULO 1 — HERO
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        {/* Imagen/GIF de fondo del slide (CMS) — img tag para que los GIFs animen */}
        {slide?.imageUrl && (
          <>
            <img
              key={slide.imageUrl}
              src={slide.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full transition-opacity duration-500 pointer-events-none"
              style={{
                objectFit: "cover",
                objectPosition: "center",
                opacity: slideVisible ? 0.75 : 0,
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to right, rgba(10,10,10,0.85) 55%, rgba(10,10,10,0.4) 100%)" }}
            />
          </>
        )}
        {/* Humo verde sutil en esquinas inferiores */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(126,217,87,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(126,217,87,0.04) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Columna izquierda — Texto y claims */}
            <div className="w-full lg:w-3/5 flex flex-col gap-8">
              {/* Slide content */}
              <div
                className="flex flex-col gap-4 transition-all duration-300"
                style={{
                  opacity: slideVisible ? 1 : 0,
                  transform: slideVisible
                    ? "translateY(0)"
                    : "translateY(16px)",
                }}
              >
                <span className="hud-label">{slide.label}</span>
                <h1
                  className="font-display text-6xl md:text-8xl text-white leading-none"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {slide.claim}
                  {"\n"}
                  <span className="text-neon">{slide.claimHighlight}</span>
                </h1>
                <p className="text-lg md:text-xl text-white/60 max-w-lg">
                  {slide.subclaim}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Link href={slide.ctaHref}>
                    <Button
                      className="bg-danger hover:bg-red-700 text-white font-semibold px-8 py-3 text-base rounded-md transition-colors"
                      style={{ backgroundColor: "#E41E26" }}
                    >
                      {slide.cta}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Controles del slideshow */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-neon hover:text-neon transition-colors"
                  aria-label="Slide anterior"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: idx === currentSlide ? "24px" : "8px",
                        height: "8px",
                        backgroundColor:
                          idx === currentSlide
                            ? "#7ED957"
                            : "rgba(255,255,255,0.2)",
                      }}
                      aria-label={`Ir al slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-neon hover:text-neon transition-colors"
                  aria-label="Slide siguiente"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Columna derecha — Formulario */}
            <div className="w-full lg:w-2/5">
              <div
                className="p-6 md:p-8 rounded-xl"
                style={{
                  background: "rgba(15,15,15,0.9)",
                  border: "1px solid rgba(126,217,87,0.3)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h2 className="font-display text-2xl text-white mb-1">
                  ¿Te deben dinero?
                </h2>
                <p className="text-sm text-white/40 mb-6">
                  Análisis de viabilidad sin compromiso.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="nombre" className="text-white/70 text-xs">
                      Nombre *
                    </Label>
                    <Input
                      id="nombre"
                      type="text"
                      value={form.nombre}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nombre: e.target.value }))
                      }
                      placeholder="Tu nombre"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon focus-visible:ring-0"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="telefono" className="text-white/70 text-xs">
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, telefono: e.target.value }))
                      }
                      placeholder="+34 600 000 000"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon focus-visible:ring-0"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="text-white/70 text-xs">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="tu@email.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon focus-visible:ring-0"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="importe" className="text-white/70 text-xs">
                      Importe aproximado
                    </Label>
                    <Input
                      id="importe"
                      type="text"
                      value={form.importe}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, importe: e.target.value }))
                      }
                      placeholder="Importe aproximado (€)"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon focus-visible:ring-0"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="tipo_deuda"
                      className="text-white/70 text-xs"
                    >
                      Tipo de deuda
                    </Label>
                    <Select
                      value={form.tipo_deuda}
                      onValueChange={(val) =>
                        setForm((f) => ({ ...f, tipo_deuda: val }))
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-neon focus:ring-0">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-white/10 text-white">
                        <SelectItem value="factura_impagada">
                          Factura impagada
                        </SelectItem>
                        <SelectItem value="prestamo_personal">
                          Préstamo personal
                        </SelectItem>
                        <SelectItem value="comision_comercial">
                          Comisión / acuerdo comercial
                        </SelectItem>
                        <SelectItem value="alquiler_inmueble">
                          Alquiler / inmueble
                        </SelectItem>
                        <SelectItem value="trabajo_realizado">
                          Trabajo realizado
                        </SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="descripcion"
                      className="text-white/70 text-xs"
                    >
                      Descripción del caso
                    </Label>
                    <Textarea
                      id="descripcion"
                      rows={3}
                      value={form.descripcion}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, descripcion: e.target.value }))
                      }
                      placeholder="Describe brevemente el caso"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-neon focus-visible:ring-0 resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-3 mt-1">
                    <Checkbox
                      id="privacidad"
                      checked={form.privacidad}
                      onCheckedChange={(checked) =>
                        setForm((f) => ({
                          ...f,
                          privacidad: checked === true,
                        }))
                      }
                      className="border-white/20 data-[state=checked]:bg-neon data-[state=checked]:border-neon mt-0.5"
                    />
                    <Label
                      htmlFor="privacidad"
                      className="text-xs text-white/50 leading-relaxed cursor-pointer"
                    >
                      Acepto la{" "}
                      <Link
                        href="/politica-de-privacidad"
                        className="text-neon hover:underline"
                      >
                        política de privacidad
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full font-semibold text-white py-3 mt-2 rounded-md transition-colors"
                    style={{
                      backgroundColor: submitting ? "#a01218" : "#E41E26",
                    }}
                  >
                    {submitting ? "Enviando..." : "Analizar mi caso"}
                  </Button>
                </form>

                <p className="text-center text-xs text-white/30 mt-4">
                  Evaluación inicial gratuita. Sin compromiso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MÓDULO 2 — Identificación del problema
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 md:py-28"
        style={{ backgroundColor: "#050505" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="font-display text-4xl md:text-5xl text-white mb-12 text-center leading-tight"
            style={{ whiteSpace: "pre-line" }}
          >
            {"Cuando el deudor desaparece,\ncomienza el verdadero problema."}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {PROBLEMAS.map((p) => (
              <div
                key={p.label}
                className="p-5 rounded-lg transition-all duration-200 cursor-default group"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #222",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "#7ED957";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "#222";
                }}
              >
                <span
                  className="block text-xs font-bold mb-2"
                  style={{
                    fontFamily: "monospace",
                    color: "#7ED957",
                    letterSpacing: "0.1em",
                  }}
                >
                  {p.label}
                </span>
                <p className="text-sm text-white/50 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-white/40 mt-12 text-base max-w-xl mx-auto">
            No es solo una deuda. Es una señal perdida.{" "}
            <span className="text-white/70">
              Y para eso existe Cobrafantasmas.
            </span>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MÓDULO 3 — Qué es Cobrafantasmas
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 md:py-28"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="font-display text-4xl md:text-5xl text-white mb-16 text-center leading-tight"
            style={{ whiteSpace: "pre-line" }}
          >
            {"No somos un burofax.\nSomos un sistema en operación."}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 text-center md:text-left">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto md:mx-0"
                style={{ backgroundColor: "rgba(126,217,87,0.1)" }}
              >
                <Zap className="text-neon w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl text-white">Tecnología</h3>
              <p className="text-white/50 leading-relaxed">
                IA, automatización y seguimiento multicanal. El sistema trabaja
                sin descanso.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-center md:text-left">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto md:mx-0"
                style={{ backgroundColor: "rgba(126,217,87,0.1)" }}
              >
                <Target className="text-neon w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl text-white">Persistencia</h3>
              <p className="text-white/50 leading-relaxed">
                Secuencias programadas, recordatorios, llamadas y trazabilidad
                completa.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-center md:text-left">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto md:mx-0"
                style={{ backgroundColor: "rgba(126,217,87,0.1)" }}
              >
                <Users className="text-neon w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl text-white">
                Equipo humano
              </h3>
              <p className="text-white/50 leading-relaxed">
                Gestores especializados y operarios presenciales cuando el caso
                lo requiere.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/como-funciona"
              className="inline-flex items-center gap-2 text-neon hover:underline text-base font-medium"
            >
              Conoce cómo trabajamos{" "}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MÓDULO 4 — Cómo funciona (timeline 4 pasos)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 md:py-28"
        style={{ backgroundColor: "#111111" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4 text-center">
            4 pasos. Sin complicaciones.
          </h2>
          <p className="text-center text-white/40 mb-16 text-sm">
            Evaluación inicial gratuita. Solo avanzamos si el caso tiene
            sentido.
          </p>

          {/* Timeline desktop: horizontal / mobile: vertical */}
          <div className="relative">
            {/* Línea conectora horizontal (solo desktop) */}
            <div
              className="hidden md:block absolute top-8 left-0 right-0 h-px"
              style={{ backgroundColor: "rgba(126,217,87,0.2)" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
              {[
                {
                  num: "01",
                  title: "SUBES TU CASO",
                  desc: "Formulario rápido con los datos de la deuda.",
                },
                {
                  num: "02",
                  title: "ANALIZAMOS CON IA",
                  desc: "Evaluación inicial de viabilidad y estrategia.",
                },
                {
                  num: "03",
                  title: "PROPUESTA HUMANA",
                  desc: "Un gestor te contacta con la propuesta personalizada.",
                },
                {
                  num: "04",
                  title: "PROTOCOLO ACTIVO",
                  desc: "Activamos la operación tras aprobación y pago inicial.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="flex flex-col gap-3 relative md:text-center"
                >
                  {/* Dot */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center md:mx-auto relative z-10"
                    style={{
                      backgroundColor: "#0A0A0A",
                      border: "2px solid #7ED957",
                    }}
                  >
                    <span
                      className="font-display text-xl text-neon"
                    >
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MÓDULO 5 — Protocolos
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 md:py-28"
        style={{ backgroundColor: "#050505" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="font-display text-4xl md:text-5xl text-white mb-12 text-center leading-tight"
            style={{ whiteSpace: "pre-line" }}
          >
            {"Protocolos diseñados\npara no desaparecer."}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Radio className="w-6 h-6 text-neon" />,
                title: "Protocolo Radar",
                desc: "Detectamos señales, datos y posibilidades de contacto con el deudor.",
              },
              {
                icon: <RefreshCw className="w-6 h-6 text-neon" />,
                title: "Protocolo Persistente",
                desc: "Seguimiento multicanal programado y continuo. Email, WhatsApp, llamadas, SMS.",
              },
              {
                icon: <Zap className="w-6 h-6 text-neon" />,
                title: "Protocolo Reactivación",
                desc: "Cuando el deudor vuelve a dar señales de vida, el sistema responde de inmediato.",
              },
              {
                icon: <Users className="w-6 h-6 text-neon" />,
                title: "Protocolo Presencial",
                desc: "Equipo humano para gestiones presenciales cuando la situación lo requiere.",
              },
            ].map((proto) => (
              <div
                key={proto.title}
                className="p-6 rounded-xl flex flex-col gap-4"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #1e1e1e",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(126,217,87,0.08)" }}
                >
                  {proto.icon}
                </div>
                <h3 className="font-display text-xl text-white">
                  {proto.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {proto.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/protocolos"
              className="inline-flex items-center gap-2 text-neon hover:underline text-base font-medium"
            >
              Ver todos los protocolos{" "}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MÓDULO 6 — IA constante
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 md:py-28"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="font-display text-4xl md:text-5xl text-white mb-4 text-center leading-tight"
            style={{ whiteSpace: "pre-line" }}
          >
            {"Mientras tú duermes,\nel sistema sigue trabajando."}
          </h2>
          <p className="text-center text-white/40 mb-12 max-w-xl mx-auto">
            Automatización inteligente en todos los canales, sin interrupciones.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: <Phone className="w-4 h-4" />, label: "Llamadas automáticas IA" },
              { icon: <Bot className="w-4 h-4" />, label: "WhatsApp automatizado" },
              { icon: <Mail className="w-4 h-4" />, label: "Email inteligente" },
              { icon: <Clock className="w-4 h-4" />, label: "SMS programados" },
              { icon: <RefreshCw className="w-4 h-4" />, label: "Recordatorios adaptativos" },
              { icon: <Eye className="w-4 h-4" />, label: "Trazabilidad completa" },
              { icon: <Zap className="w-4 h-4" />, label: "Acciones programadas" },
              { icon: <BarChart3 className="w-4 h-4" />, label: "Alertas en tiempo real" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #1e1e1e",
                }}
              >
                <span className="text-neon flex-shrink-0">{item.icon}</span>
                <span className="text-white/60 text-sm leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-white/25 mt-10 text-xs max-w-2xl mx-auto leading-relaxed">
            La persistencia siempre opera dentro de límites configurables,
            horarios permitidos y normativa RGPD.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MÓDULO 7 — Modelo de cobro
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 md:py-28"
        style={{ backgroundColor: "#111111" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-12 text-center">
            Recuperas o no pagas comisión.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                title: "Evaluación inicial",
                desc: "Análisis gratuito de tu caso.",
              },
              {
                num: "02",
                title: "Propuesta clara",
                desc: "Cuota inicial si aceptamos el caso.",
              },
              {
                num: "03",
                title: "Protocolo activo",
                desc: "Operación en marcha.",
              },
              {
                num: "04",
                title: "Comisión por éxito",
                desc: "Solo cobramos cuando recuperamos.",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className="p-6 rounded-xl flex flex-col gap-3 relative"
                style={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #1e1e1e",
                }}
              >
                {i < 3 && (
                  <ChevronRight
                    className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 z-10"
                    aria-hidden="true"
                  />
                )}
                <span className="hud-label">{step.num}</span>
                <h3 className="font-display text-xl text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {step.desc}
                </p>
                {step.num === "04" && (
                  <div
                    className="mt-2 px-3 py-1.5 rounded-md text-xs font-semibold text-white inline-block w-fit"
                    style={{ backgroundColor: "#E41E26" }}
                  >
                    Solo si hay resultado
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MÓDULO 8 — FAQ
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 md:py-28"
        style={{ backgroundColor: "#050505" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-12 text-center">
            Preguntas frecuentes
          </h2>

          <div className="flex flex-col gap-2">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #1e1e1e",
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left text-white hover:text-neon transition-colors"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span className="font-medium text-base pr-4">{faq.q}</span>
                  <ChevronDown
                    className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                    style={{
                      transform:
                        openFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                      color: openFaq === idx ? "#7ED957" : "rgba(255,255,255,0.3)",
                    }}
                    aria-hidden="true"
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5">
                    <p className="text-white/50 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/preguntas-frecuentes"
              className="inline-flex items-center gap-2 text-neon hover:underline text-base font-medium"
            >
              Ver todas las preguntas{" "}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MÓDULO 9 — CTA final
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-24 md:py-36 relative overflow-hidden"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        {/* Gradiente verde sutil */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(126,217,87,0.06) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <h2
            className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-tight"
          >
            Si te deben dinero,{" "}
            <span className="text-neon">no desaparezcas tú también.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl">
            Activa tu caso. Analizamos la viabilidad y te decimos cómo podemos
            ayudarte.
          </p>
          <Link href="/activar-caso">
            <Button
              className="font-semibold text-white px-10 py-4 text-lg rounded-md transition-colors"
              style={{ backgroundColor: "#E41E26" }}
            >
              Analizar mi caso
            </Button>
          </Link>
          <p className="text-white/25 text-xs">
            Evaluación inicial gratuita. Sin compromiso. Solo avanzamos si
            tiene sentido.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
