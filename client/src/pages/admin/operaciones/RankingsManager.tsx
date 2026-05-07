import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const ESTADO_LABEL: Record<string, string> = {
  pendiente_activacion:  "Pendiente activación",
  estrategia_inicial:    "Estrategia inicial",
  operativo_activo:      "Operativo activo",
  negociacion:           "Negociación",
  acuerdo_parcial:       "Acuerdo parcial",
  recuperacion_parcial:  "Recuperación parcial",
  recuperado:            "Recuperado",
  escalada_juridica:     "Escalada jurídica",
  anulado:               "Anulado",
  insoluble:             "Insoluble",
  suspendido:            "Suspendido",
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente_activacion:  "bg-slate-500",
  estrategia_inicial:    "bg-blue-500",
  operativo_activo:      "bg-cyan-500",
  negociacion:           "bg-yellow-500",
  acuerdo_parcial:       "bg-amber-500",
  recuperacion_parcial:  "bg-orange-400",
  recuperado:            "bg-emerald-500",
  escalada_juridica:     "bg-rose-500",
  anulado:               "bg-slate-400",
  insoluble:             "bg-red-700",
  suspendido:            "bg-neutral-500",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingsManager() {
  const { data, isLoading, isError } = trpc.expedientes.rankings.useQuery(
    undefined as any,
    { refetchInterval: 60_000 },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Error cargando rankings.
      </div>
    );
  }

  const { global: g, estadoBreakdown, cazadorRanking, ultimasRecuperaciones } = data;
  const totalEstados = Object.values(estadoBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Rankings Operativos</h1>
          <p className="text-slate-400 text-sm mt-0.5">Rendimiento de cazadores y estadísticas globales</p>
        </div>
        <Link href="/admin/operaciones/expedientes">
          <span className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">
            ← Ver expedientes
          </span>
        </Link>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Expedientes totales" value={String(g.totalExpedientes)} sub={`${g.totalActivos} activos`} accent="cyan" />
        <StatCard label="Deuda gestionada" value={fmt(g.totalDeuda)} sub={`${g.cazadoresActivos} cazadores`} accent="blue" />
        <StatCard label="Total recuperado" value={fmt(g.totalRecuperado)} sub={`${g.totalCerrados} cerrados`} accent="emerald" />
        <StatCard label="Tasa de éxito" value={`${g.tasaExito}%`} sub="sobre deuda gestionada" accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking de cazadores */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-white">Ranking de Cazadores</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ordenado por importe recuperado</p>
          </div>
          {cazadorRanking.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">Sin datos de cazadores aún</div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {cazadorRanking.map((c, i) => (
                <div key={c.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-700/20 transition-colors">
                  {/* Posición */}
                  <div className="w-8 text-center text-lg shrink-0">
                    {i < 3 ? MEDALS[i] : <span className="text-slate-500 font-mono text-sm">#{i + 1}</span>}
                  </div>

                  {/* Nombre */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.fullName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {c.total} exp. · {c.activos} activos · {c.cerrados} cerrados
                    </p>
                  </div>

                  {/* Métricas */}
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400">Gestionado</p>
                      <p className="text-sm font-mono text-slate-300">{fmt(c.deudaTotal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Recuperado</p>
                      <p className="text-sm font-mono text-emerald-400 font-semibold">{fmt(c.recuperado)}</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-slate-400">Efect.</p>
                      <p className={`text-sm font-mono font-semibold ${c.efectividad >= 60 ? "text-emerald-400" : c.efectividad >= 30 ? "text-yellow-400" : "text-slate-400"}`}>
                        {c.efectividad}%
                      </p>
                    </div>
                    <div className="text-right hidden lg:block">
                      <p className="text-xs text-slate-400">Vel. media</p>
                      <p className="text-sm font-mono text-slate-300">
                        {c.velocidadMedia != null ? `${c.velocidadMedia}d` : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Barra de efectividad */}
                  <div className="w-16 shrink-0 hidden xl:block">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(c.efectividad, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="space-y-5">
          {/* Desglose por estado */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50">
              <h2 className="text-sm font-semibold text-white">Distribución por Estado</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {Object.entries(estadoBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([estado, count]) => {
                  const pct = Math.round((count / totalEstados) * 100);
                  return (
                    <div key={estado}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-300">{ESTADO_LABEL[estado] ?? estado}</span>
                        <span className="text-xs font-mono text-slate-400">{count} · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${ESTADO_COLOR[estado] ?? "bg-slate-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(estadoBreakdown).length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">Sin expedientes aún</p>
              )}
            </div>
          </div>

          {/* Últimas recuperaciones */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50">
              <h2 className="text-sm font-semibold text-white">Últimas Recuperaciones</h2>
            </div>
            <div className="divide-y divide-slate-700/30">
              {ultimasRecuperaciones.length === 0 ? (
                <p className="px-5 py-6 text-xs text-slate-500 text-center">Sin recuperaciones aún</p>
              ) : (
                ultimasRecuperaciones.map(r => (
                  <div key={r.id} className="px-5 py-3 hover:bg-slate-700/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-cyan-400">{r.numeroExpediente}</p>
                        <p className="text-sm text-white truncate mt-0.5">{r.deudorNombre ?? "—"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{r.cazadorNombre}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-emerald-400">
                          {fmt(parseFloat(r.importeRecuperado ?? "0"))}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{r.fechaCierre ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, accent,
}: { label: string; value: string; sub: string; accent: "cyan" | "blue" | "emerald" | "amber" }) {
  const accents = {
    cyan:    "border-cyan-500/30 from-cyan-500/10",
    blue:    "border-blue-500/30 from-blue-500/10",
    emerald: "border-emerald-500/30 from-emerald-500/10",
    amber:   "border-amber-500/30 from-amber-500/10",
  };
  const valueColors = {
    cyan:    "text-cyan-300",
    blue:    "text-blue-300",
    emerald: "text-emerald-300",
    amber:   "text-amber-300",
  };
  return (
    <div className={`bg-gradient-to-b ${accents[accent]} to-transparent border rounded-xl p-4`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColors[accent]}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}
