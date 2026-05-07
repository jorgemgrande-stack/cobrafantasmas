import { useMemo } from "react";
import { Link } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Target, Zap, AlertTriangle, CheckCircle2, Clock, ChevronRight, BarChart3, Shield, Activity } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtEuro(v: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

function fmtPct(v: number) {
  return `${Math.round(v * 10) / 10}%`;
}

// ─── Constantes de estado ─────────────────────────────────────────────────────

const ESTADO_META: Record<string, { label: string; color: string; dot: string; group: "activo" | "cerrado" | "inactivo" }> = {
  pendiente_activacion: { label: "Pendiente",        color: "bg-slate-500",   dot: "bg-slate-400",   group: "inactivo" },
  estrategia_inicial:   { label: "Estrategia",       color: "bg-blue-500",    dot: "bg-blue-400",    group: "activo" },
  operativo_activo:     { label: "Activo",            color: "bg-cyan-500",    dot: "bg-cyan-400",    group: "activo" },
  negociacion:          { label: "Negociación",       color: "bg-yellow-500",  dot: "bg-yellow-400",  group: "activo" },
  acuerdo_parcial:      { label: "Acuerdo parcial",   color: "bg-orange-500",  dot: "bg-orange-400",  group: "activo" },
  recuperacion_parcial: { label: "Recuperación",      color: "bg-lime-500",    dot: "bg-lime-400",    group: "activo" },
  recuperado:           { label: "Recuperado",        color: "bg-green-500",   dot: "bg-green-400",   group: "cerrado" },
  incobrable:           { label: "Incobrable",        color: "bg-red-500",     dot: "bg-red-400",     group: "cerrado" },
  suspendido:           { label: "Suspendido",        color: "bg-gray-600",    dot: "bg-gray-400",    group: "inactivo" },
  escalada_juridica:    { label: "Jurídica",          color: "bg-purple-500",  dot: "bg-purple-400",  group: "activo" },
  finalizado:           { label: "Finalizado",        color: "bg-zinc-500",    dot: "bg-zinc-400",    group: "cerrado" },
};

const INTENSIDAD_COLOR = ["", "text-sky-400", "text-yellow-400", "text-orange-400", "text-red-400", "text-rose-300"];
const INTENSIDAD_LABEL = ["", "Amistoso", "Presión activa", "Frecuente", "Fantasma", "Crítico"];

// ─── Componentes ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub?: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color} bg-opacity-10`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold leading-none ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function AlertaCard({ exp }: { exp: any }) {
  const intensidadColor = INTENSIDAD_COLOR[exp.intensidadOperativa ?? 1] ?? "text-sky-400";
  const meta = ESTADO_META[exp.estado ?? ""] ?? ESTADO_META.pendiente_activacion;
  return (
    <Link href={`/admin/operaciones/expedientes`}>
      <div className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/[0.08] transition-colors cursor-pointer group">
        <div className="w-1.5 h-10 rounded-full bg-red-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-muted-foreground">{exp.numeroExpediente}</span>
            <span className={`text-[10px] font-bold ${intensidadColor}`}>{INTENSIDAD_LABEL[exp.intensidadOperativa ?? 1]}</span>
          </div>
          <p className="text-sm font-medium truncate">{exp.deudorNombre}</p>
          <p className="text-xs text-muted-foreground">{meta.label} — sin actualizar</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-mono text-red-400">{fmtEuro(parseFloat(exp.importeDeuda ?? "0"))}</p>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ControlCentro() {
  const { data: rankings, isLoading: loadingRankings } = trpc.expedientes.rankings.useQuery();
  const { data: listData, isLoading: loadingList } = trpc.expedientes.list.useQuery(
    { limit: 100, offset: 0 },
    { refetchOnWindowFocus: false }
  );

  const isLoading = loadingRankings || loadingList;
  const items = listData?.items ?? [];

  const stats = useMemo(() => {
    if (!items.length) return null;

    const total = items.length;
    const activos = items.filter(e => ["estrategia_inicial","operativo_activo","negociacion","acuerdo_parcial","recuperacion_parcial","escalada_juridica"].includes(e.estado ?? "")).length;
    const recuperados = items.filter(e => e.estado === "recuperado").length;
    const incobrables = items.filter(e => e.estado === "incobrable").length;
    const pendientes = items.filter(e => e.estado === "pendiente_activacion").length;

    const deudaTotal = items.reduce((s, e) => s + parseFloat(e.importeDeuda ?? "0"), 0);
    const recuperadoTotal = items.reduce((s, e) => s + parseFloat(e.importeRecuperado ?? "0"), 0);
    const tasaRecuperacion = deudaTotal > 0 ? (recuperadoTotal / deudaTotal) * 100 : 0;

    // Comisión estimada sobre lo recuperado (promedio porcentajeExito)
    const comisionEstimada = items.reduce((s, e) => {
      const rec = parseFloat(e.importeRecuperado ?? "0");
      const pct = parseFloat(e.porcentajeExito ?? "20");
      return s + rec * (pct / 100);
    }, 0);

    // Breakdown por estado
    const byEstado: Record<string, number> = {};
    for (const e of items) {
      const est = e.estado ?? "pendiente_activacion";
      byEstado[est] = (byEstado[est] ?? 0) + 1;
    }

    // Expedientes que requieren atención: intensidad >= 3 + estado activo
    const alertas = items
      .filter(e => (e.intensidadOperativa ?? 1) >= 3 && ["operativo_activo","negociacion","acuerdo_parcial"].includes(e.estado ?? ""))
      .sort((a, b) => (b.intensidadOperativa ?? 1) - (a.intensidadOperativa ?? 1))
      .slice(0, 5);

    return { total, activos, recuperados, incobrables, pendientes, deudaTotal, recuperadoTotal, tasaRecuperacion, comisionEstimada, byEstado, alertas };
  }, [items]);

  const global = rankings?.global;
  const cazadorRanking = rankings?.cazadorRanking ?? [];
  const ultimasRecuperaciones = rankings?.ultimasRecuperaciones ?? [];

  if (isLoading) {
    return (
      <AdminLayout title="Centro de Control">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Centro de Control">
      <div className="min-h-[calc(100vh-4rem)] bg-[#080a0e] p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Centro de Control Operativo</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>Sistema operativo</span>
          </div>
        </div>

        {/* KPI principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Expedientes activos"
            value={String(stats?.activos ?? 0)}
            sub={`de ${stats?.total ?? 0} total`}
            color="text-cyan-400"
            icon={Target}
          />
          <MetricCard
            label="Deuda en gestión"
            value={fmtEuro(stats?.deudaTotal ?? 0)}
            sub="importe total reclamado"
            color="text-orange-400"
            icon={AlertTriangle}
          />
          <MetricCard
            label="Total recuperado"
            value={fmtEuro(stats?.recuperadoTotal ?? 0)}
            sub={`tasa ${fmtPct(stats?.tasaRecuperacion ?? 0)}`}
            color="text-green-400"
            icon={TrendingUp}
          />
          <MetricCard
            label="Comisión estimada"
            value={fmtEuro(stats?.comisionEstimada ?? 0)}
            sub="sobre importes recuperados"
            color="text-yellow-400"
            icon={Zap}
          />
        </div>

        {/* Fila media: Estado + Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Breakdown por estado */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Distribución por estado</p>
            </div>
            <div className="space-y-2.5">
              {Object.entries(stats?.byEstado ?? {})
                .sort((a, b) => b[1] - a[1])
                .map(([estado, count]) => {
                  const meta = ESTADO_META[estado] ?? { label: estado, color: "bg-slate-500", dot: "bg-slate-400", group: "inactivo" };
                  const total = stats?.total ?? 1;
                  const pct = (count / total) * 100;
                  return (
                    <div key={estado}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          <span className="text-muted-foreground">{meta.label}</span>
                        </div>
                        <span className="font-mono text-foreground/80">{count}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${meta.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Resumen grupos */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.06]">
              {[
                { label: "Activos", value: stats?.activos ?? 0, color: "text-cyan-400" },
                { label: "Recuperados", value: stats?.recuperados ?? 0, color: "text-green-400" },
                { label: "Pendientes", value: stats?.pendientes ?? 0, color: "text-slate-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas: expedientes de alta intensidad */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Requieren atención</p>
              </div>
              {(stats?.alertas ?? []).length > 0 && (
                <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full border border-red-500/20">
                  {stats?.alertas.length} activos
                </span>
              )}
            </div>
            {(stats?.alertas ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-400/30 mb-2" />
                <p className="text-sm text-muted-foreground">Sin alertas activas</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Todos los expedientes en seguimiento normal</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.alertas.map((exp) => <AlertaCard key={exp.id} exp={exp} />)}
              </div>
            )}
          </div>
        </div>

        {/* Fila baja: Cazadores + Últimas recuperaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Ranking cazadores */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cazadores — rendimiento</p>
              </div>
              <Link href="/admin/operaciones/rankings">
                <span className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer">Ver ranking completo →</span>
              </Link>
            </div>

            {cazadorRanking.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Sin datos de cazadores</p>
            ) : (
              <div className="space-y-3">
                {cazadorRanking.slice(0, 5).map((c, idx) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className={`text-xs font-mono w-4 text-center ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{c.fullName}</p>
                        <span className="text-xs font-mono text-green-400">{fmtEuro(c.recuperado)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{c.total} exp.</span>
                        <span className="text-[10px] text-cyan-400">{c.activos} activos</span>
                        <span className="text-[10px] text-green-400">{c.efectividad}% efectividad</span>
                        {c.velocidadMedia !== null && (
                          <span className="text-[10px] text-muted-foreground">{c.velocidadMedia}d media</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Últimas recuperaciones */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Últimas recuperaciones</p>
            </div>

            {ultimasRecuperaciones.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Aún sin expedientes recuperados</p>
            ) : (
              <div className="space-y-3">
                {ultimasRecuperaciones.map((e) => (
                  <div key={e.id} className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full bg-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">{e.numeroExpediente}</span>
                        <span className="text-xs text-green-400 font-medium">{fmtEuro(parseFloat(String(e.importeRecuperado ?? "0")))}</span>
                      </div>
                      <p className="text-sm truncate">{e.deudorNombre}</p>
                      <p className="text-[10px] text-muted-foreground">{e.cazadorNombre}{e.fechaCierre ? ` — ${e.fechaCierre}` : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground">
                        {fmtPct(parseFloat(String(e.importeRecuperado ?? "0")) / parseFloat(String(e.importeDeuda ?? "1")) * 100)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">recuperado</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Expedientes", sub: "Gestión operativa", href: "/admin/operaciones/expedientes", color: "border-cyan-500/20 hover:border-cyan-500/40", icon: Target },
            { label: "Acreedores", sub: "Clientes registrados", href: "/admin/crm/acreedores", color: "border-blue-500/20 hover:border-blue-500/40", icon: Shield },
            { label: "Deudores", sub: "Base de deudores", href: "/admin/crm/deudores", color: "border-orange-500/20 hover:border-orange-500/40", icon: AlertTriangle },
            { label: "Rankings", sub: "Rendimiento cazadores", href: "/admin/operaciones/rankings", color: "border-yellow-500/20 hover:border-yellow-500/40", icon: TrendingUp },
          ].map(({ label, sub, href, color, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className={`bg-white/[0.02] border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.04] transition-all ${color}`}>
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto shrink-0" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}
