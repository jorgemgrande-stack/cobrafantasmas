import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EstadoExpediente =
  | "pendiente_activacion" | "estrategia_inicial" | "operativo_activo"
  | "negociacion" | "acuerdo_parcial" | "recuperacion_parcial"
  | "recuperado" | "incobrable" | "suspendido" | "escalada_juridica" | "finalizado";

type TipoAccion =
  | "llamada" | "whatsapp" | "email" | "visita" | "negociacion"
  | "acuerdo" | "seguimiento" | "investigacion" | "requerimiento"
  | "accion_sorpresa" | "escalada" | "hito" | "nota";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_META: Record<EstadoExpediente, { label: string; color: string; glow: string; progress: number }> = {
  pendiente_activacion: { label: "Pendiente de activación", color: "text-slate-300",  glow: "shadow-slate-500/20",  progress: 5  },
  estrategia_inicial:   { label: "Diseñando estrategia",    color: "text-blue-300",   glow: "shadow-blue-500/30",   progress: 15 },
  operativo_activo:     { label: "Operación en curso",      color: "text-cyan-300",   glow: "shadow-cyan-500/40",   progress: 35 },
  negociacion:          { label: "En negociación",          color: "text-yellow-300", glow: "shadow-yellow-500/30", progress: 55 },
  acuerdo_parcial:      { label: "Acuerdo parcial",         color: "text-orange-300", glow: "shadow-orange-500/30", progress: 65 },
  recuperacion_parcial: { label: "Recuperación en proceso", color: "text-lime-300",   glow: "shadow-lime-500/30",   progress: 75 },
  recuperado:           { label: "Misión completada",       color: "text-green-300",  glow: "shadow-green-500/40",  progress: 100 },
  incobrable:           { label: "Expediente cerrado",      color: "text-red-300",    glow: "shadow-red-500/20",    progress: 0  },
  suspendido:           { label: "Operación suspendida",    color: "text-gray-300",   glow: "shadow-gray-500/20",   progress: 0  },
  escalada_juridica:    { label: "Escalada jurídica",       color: "text-purple-300", glow: "shadow-purple-500/30", progress: 80 },
  finalizado:           { label: "Expediente finalizado",   color: "text-zinc-300",   glow: "shadow-zinc-500/20",   progress: 100 },
};

const TIPO_ACCION_META: Record<TipoAccion, { label: string; icon: string }> = {
  llamada:         { label: "Contacto telefónico",  icon: "📞" },
  whatsapp:        { label: "Mensaje enviado",       icon: "💬" },
  email:           { label: "Comunicación escrita",  icon: "📧" },
  visita:          { label: "Visita presencial",     icon: "🚶" },
  negociacion:     { label: "Negociación",           icon: "🤝" },
  acuerdo:         { label: "Acuerdo alcanzado",     icon: "✅" },
  seguimiento:     { label: "Seguimiento activo",    icon: "👁" },
  investigacion:   { label: "Investigación",         icon: "🔍" },
  requerimiento:   { label: "Requerimiento formal",  icon: "📋" },
  accion_sorpresa: { label: "Acción ejecutada",      icon: "⚡" },
  escalada:        { label: "Escalada",              icon: "⬆" },
  hito:            { label: "Hito alcanzado",        icon: "🏁" },
  nota:            { label: "Actualización",         icon: "📝" },
};

function fmtEuro(val: string | number | null | undefined): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })
    .format(parseFloat(String(val ?? "0")));
}

function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function ProgressBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/50">{label}</span>
        <span className="text-white/80 font-medium">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SeguimientoCliente() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";

  const { data, isLoading, error } = trpc.expedientes.publicLanding.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-white/40 text-sm">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  // ── Error / Not found ──────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#070a0f] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-6">👻</div>
          <h1 className="text-2xl font-bold text-white mb-2">Enlace no válido</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Este enlace de seguimiento no existe o ha expirado.<br />
            Contacta con tu gestor para obtener uno nuevo.
          </p>
        </div>
      </div>
    );
  }

  const estado = ESTADO_META[data.estado as EstadoExpediente] ?? ESTADO_META.pendiente_activacion;
  const importeDeuda = parseFloat(data.importeDeuda ?? "0");
  const importeRecuperado = parseFloat(data.importeRecuperado ?? "0");
  const recupeRate = importeDeuda > 0 ? (importeRecuperado / importeDeuda) * 100 : 0;
  const comision = importeRecuperado * (parseFloat(data.porcentajeExito ?? "20") / 100);
  const hitos = (data.acciones as any[]).filter((a) => a.tipo === "hito");
  const timeline = (data.acciones as any[]).filter((a) => a.tipo !== "hito");
  const esFinalizado = ["recuperado", "finalizado", "incobrable"].includes(data.estado);

  return (
    <div className="min-h-screen bg-[#070a0f] text-white">

      {/* Fondo ambiental */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5">
            <span className="text-lg">👻</span>
            <span className="text-xs font-semibold tracking-widest uppercase text-white/60">Cobrafantasmas</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de seguimiento</h1>
          <p className="text-white/40 text-sm font-mono">{data.numeroExpediente}</p>
        </div>

        {/* Estado principal */}
        <div className={`bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 text-center shadow-2xl ${estado.glow}`}>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Estado actual</p>
          <p className={`text-2xl font-bold ${estado.color}`}>{estado.label}</p>
          {data.fechaApertura && (
            <p className="text-xs text-white/30 mt-2">Expediente abierto el {fmtDate(data.fechaApertura)}</p>
          )}
          {esFinalizado && data.fechaCierre && (
            <p className="text-xs text-white/30">Cerrado el {fmtDate(data.fechaCierre)}</p>
          )}
        </div>

        {/* Métricas financieras */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xs text-white/40 mb-1">Deuda gestionada</p>
            <p className="text-lg font-bold">{fmtEuro(data.importeDeuda)}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xs text-white/40 mb-1">Recuperado</p>
            <p className="text-lg font-bold text-green-400">{fmtEuro(data.importeRecuperado)}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xs text-white/40 mb-1">Comisión éxito</p>
            <p className="text-lg font-bold text-cyan-400">{fmtEuro(comision)}</p>
          </div>
        </div>

        {/* Barras de progreso */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Progreso de la operación</p>
          <ProgressBar value={recupeRate} color="bg-gradient-to-r from-green-600 to-green-400" label="Recuperación financiera" />
          <ProgressBar value={data.progresoOperativo ?? 0} color="bg-gradient-to-r from-cyan-600 to-cyan-400" label="Avance operativo" />
          <ProgressBar value={data.probabilidadRecuperacion ?? 0} color="bg-gradient-to-r from-yellow-600 to-yellow-400" label="Probabilidad de éxito" />
        </div>

        {/* Hitos */}
        {hitos.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Hitos alcanzados</p>
            <div className="space-y-2">
              {hitos.map((h: any) => (
                <div key={h.id} className="flex items-center gap-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-3">
                  <span className="text-xl">🏁</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-200">{h.titulo}</p>
                    {h.descripcion && <p className="text-xs text-white/40 mt-0.5">{h.descripcion}</p>}
                    <p className="text-xs text-white/30 mt-0.5">{fmtDate(h.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Registro de actividad</p>
            <div className="relative">
              {/* Línea vertical */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-white/[0.06]" />

              <div className="space-y-3">
                {timeline.map((a: any, i: number) => {
                  const meta = TIPO_ACCION_META[a.tipo as TipoAccion] ?? { label: a.tipo, icon: "•" };
                  const isCompletada = a.estado === "completada";
                  return (
                    <div key={a.id} className="relative flex items-start gap-4 pl-12">
                      {/* Dot en la línea */}
                      <div className={`absolute left-3.5 top-3.5 w-3 h-3 rounded-full border-2 transition-all ${
                        isCompletada
                          ? "bg-cyan-400 border-cyan-400 shadow-sm shadow-cyan-400/40"
                          : "bg-transparent border-white/20"
                      }`} />

                      <div className={`flex-1 rounded-xl border p-4 transition-all ${
                        isCompletada
                          ? "bg-white/[0.04] border-white/[0.08]"
                          : "bg-white/[0.02] border-white/[0.04]"
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{meta.icon}</span>
                            <div>
                              <p className="text-sm font-semibold">{a.titulo}</p>
                              <p className="text-xs text-white/40">{meta.label}</p>
                            </div>
                          </div>
                          <span className="text-xs text-white/30 shrink-0">
                            {fmtDate(a.createdAt)}
                          </span>
                        </div>
                        {a.descripcion && (
                          <p className="text-sm text-white/50 mt-2 leading-relaxed">{a.descripcion}</p>
                        )}
                        {isCompletada && (
                          <span className="inline-block mt-2 text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                            Completado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {timeline.length === 0 && hitos.length === 0 && (
          <div className="text-center py-12 text-white/20">
            <p className="text-4xl mb-3">👻</p>
            <p className="text-sm">La operación acaba de iniciarse.</p>
            <p className="text-sm">Pronto habrá actividad que consultar.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-white/[0.05] space-y-1">
          <p className="text-xs text-white/20">
            Este panel es confidencial y de uso exclusivo para el acreedor.
          </p>
          <p className="text-xs text-white/15">
            Cobrafantasmas · Recuperación extrajudicial de deuda
          </p>
        </div>

      </div>
    </div>
  );
}
