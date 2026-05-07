import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAMPO_LABEL: Record<string, { label: string; color: string }> = {
  estado:               { label: "Estado",             color: "text-cyan-400   bg-cyan-400/10   border-cyan-400/20"   },
  importeRecuperado:    { label: "Importe recuperado",  color: "text-green-400  bg-green-400/10  border-green-400/20"  },
  cobro_registrado:     { label: "Cobro registrado",    color: "text-green-400  bg-green-400/10  border-green-400/20"  },
  cazadorId:            { label: "Cazador",             color: "text-blue-400   bg-blue-400/10   border-blue-400/20"   },
  acreedorId:           { label: "Acreedor",            color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  deudorId:             { label: "Deudor",              color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  modoOperacion:        { label: "Modo operación",      color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  intensidadOperativa:  { label: "Intensidad",          color: "text-red-400    bg-red-400/10    border-red-400/20"    },
  progresoOperativo:    { label: "Prog. operativo",     color: "text-sky-400    bg-sky-400/10    border-sky-400/20"    },
  progresoFinanciero:   { label: "Prog. financiero",    color: "text-lime-400   bg-lime-400/10   border-lime-400/20"   },
  progresoPsicologico:  { label: "Presión psicológica", color: "text-pink-400   bg-pink-400/10   border-pink-400/20"   },
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente_activacion: "Pendiente",     estrategia_inicial: "Estrategia",
  operativo_activo:     "Activo",        negociacion:        "Negociación",
  acuerdo_parcial:      "Acuerdo parc.", recuperacion_parcial: "Recuperación",
  recuperado:           "Recuperado",    incobrable:         "Incobrable",
  suspendido:           "Suspendido",    escalada_juridica:  "Escalada",
  finalizado:           "Finalizado",
};

function fmtEuro(v: string) {
  const n = parseFloat(v);
  return isNaN(n) ? v : new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

function formatVal(campo: string, val: string | null | undefined): string {
  if (!val) return "—";
  if (campo === "estado") return ESTADO_LABEL[val] ?? val;
  if (campo === "importeRecuperado" || campo === "cobro_registrado") return fmtEuro(val);
  if (campo === "modoOperacion") return { manual: "Manual", "semi-automatico": "Semi-auto", automatico: "Auto" }[val] ?? val;
  return val;
}

function fmtDatetime(d: string | Date) {
  return new Date(d).toLocaleString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AuditoriaManager() {
  const [searchExp, setSearchExp] = useState("");
  const [filterCampo, setFilterCampo] = useState("all");
  const [filterUser,  setFilterUser]  = useState("all");

  const { data: entries = [], isLoading } = trpc.expedientes.auditLogGlobal.useQuery({
    limit:  300,
    campo:  filterCampo !== "all" ? filterCampo : undefined,
    userId: filterUser  !== "all" ? parseInt(filterUser) : undefined,
  });

  const { data: usuarios = [] } = trpc.expedientes.auditLogUsuarios.useQuery();

  const filtered = searchExp.trim()
    ? (entries as any[]).filter((e: any) =>
        e.numeroExpediente?.toLowerCase().includes(searchExp.toLowerCase()) ||
        e.deudorNombre?.toLowerCase().includes(searchExp.toLowerCase())
      )
    : (entries as any[]);

  const campos = Array.from(new Set((entries as any[]).map((e: any) => e.campo))).sort();

  return (
    <AdminLayout title="Auditoría y Trazabilidad">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Auditoría y trazabilidad</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registro completo de cambios en todos los expedientes
          </p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Cambios totales",  value: String((entries as any[]).length) },
            { label: "Expedientes afect.", value: String(new Set((entries as any[]).map((e: any) => e.expedienteId)).size) },
            { label: "Operadores activos", value: String(new Set((entries as any[]).filter((e: any) => e.changedBy).map((e: any) => e.changedBy)).size) },
            { label: "Campos auditados",  value: String(campos.length) },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs bg-white/[0.03] border-white/[0.08]"
              placeholder="Buscar expediente o deudor..."
              value={searchExp}
              onChange={(e) => setSearchExp(e.target.value)}
            />
          </div>
          <Select value={filterCampo} onValueChange={setFilterCampo}>
            <SelectTrigger className="h-8 w-44 text-xs bg-white/[0.03] border-white/[0.08]">
              <SelectValue placeholder="Todos los campos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los campos</SelectItem>
              {campos.map((c) => (
                <SelectItem key={c} value={c}>
                  {CAMPO_LABEL[c]?.label ?? c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="h-8 w-44 text-xs bg-white/[0.03] border-white/[0.08]">
              <SelectValue placeholder="Todos los usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              {(usuarios as any[]).map((u: any) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.name ?? `Usuario #${u.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de entradas */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">Sin resultados</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((entry: any) => {
              const meta = CAMPO_LABEL[entry.campo] ?? { label: entry.campo, color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" };
              const isCobro = entry.campo === "cobro_registrado";
              return (
                <div key={entry.id}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-xs transition-colors hover:bg-white/[0.02] ${
                    isCobro ? "border-green-500/20 bg-green-500/[0.03]" : "border-white/[0.05]"
                  }`}>

                  {/* Campo badge */}
                  <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border font-medium mt-0.5 ${meta.color}`}>
                    {meta.label}
                  </span>

                  {/* Expediente */}
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-muted-foreground text-[10px] mr-1.5">
                      {entry.numeroExpediente ?? `#${entry.expedienteId}`}
                    </span>
                    {entry.deudorNombre && (
                      <span className="font-medium">{entry.deudorNombre}</span>
                    )}
                    <div className="mt-0.5 text-muted-foreground">
                      {isCobro ? (
                        <span className="text-green-400 font-bold">+{formatVal(entry.campo, entry.valorNuevo)}</span>
                      ) : (
                        <>
                          <span>{formatVal(entry.campo, entry.valorAnterior)}</span>
                          <span className="mx-1.5 text-white/20">→</span>
                          <span className="text-foreground font-medium">{formatVal(entry.campo, entry.valorNuevo)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-muted-foreground">{fmtDatetime(entry.changedAt)}</p>
                    {entry.userName && (
                      <p className="text-muted-foreground/50">{entry.userName}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer legal */}
        <div className="border-t border-white/[0.05] pt-4 text-center">
          <p className="text-xs text-muted-foreground/40">
            Registro de trazabilidad conforme a RGPD · Cobrafantasmas
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
