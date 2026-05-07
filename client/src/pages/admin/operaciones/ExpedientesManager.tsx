import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Search, Loader2, Trash2, Edit2, FileText, Phone,
  Mail, MapPin, User, X, Zap, Target, TrendingUp, Shield,
  AlertTriangle, CheckCircle2, Clock, ChevronRight, Flag,
  Star, Activity, BarChart3, Crosshair, Eye, EyeOff,
  Link2, Copy, Check, RefreshCw,
} from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────────────────────

type EstadoExpediente =
  | "pendiente_activacion" | "estrategia_inicial" | "operativo_activo"
  | "negociacion" | "acuerdo_parcial" | "recuperacion_parcial"
  | "recuperado" | "incobrable" | "suspendido" | "escalada_juridica" | "finalizado";

type TipoAccion =
  | "llamada" | "whatsapp" | "email" | "visita" | "negociacion"
  | "acuerdo" | "seguimiento" | "investigacion" | "requerimiento"
  | "accion_sorpresa" | "escalada" | "hito" | "nota";

type EstadoAccion = "pendiente" | "en_progreso" | "completada" | "cancelada";

const ESTADO_META: Record<EstadoExpediente, { label: string; color: string; dot: string }> = {
  pendiente_activacion: { label: "Pendiente",        color: "text-slate-400  border-slate-500/40  bg-slate-500/10",  dot: "bg-slate-400" },
  estrategia_inicial:   { label: "Estrategia",       color: "text-blue-400   border-blue-500/40   bg-blue-500/10",   dot: "bg-blue-400" },
  operativo_activo:     { label: "Activo",            color: "text-cyan-400   border-cyan-500/40   bg-cyan-500/10",   dot: "bg-cyan-400" },
  negociacion:          { label: "Negociación",       color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10", dot: "bg-yellow-400" },
  acuerdo_parcial:      { label: "Acuerdo parcial",   color: "text-orange-400 border-orange-500/40 bg-orange-500/10", dot: "bg-orange-400" },
  recuperacion_parcial: { label: "Recuperación",      color: "text-lime-400   border-lime-500/40   bg-lime-500/10",   dot: "bg-lime-400" },
  recuperado:           { label: "Recuperado",        color: "text-green-400  border-green-500/40  bg-green-500/10",  dot: "bg-green-400" },
  incobrable:           { label: "Incobrable",        color: "text-red-400    border-red-500/40    bg-red-500/10",    dot: "bg-red-400" },
  suspendido:           { label: "Suspendido",        color: "text-gray-400   border-gray-500/40   bg-gray-500/10",   dot: "bg-gray-400" },
  escalada_juridica:    { label: "Escalada jurídica", color: "text-purple-400 border-purple-500/40 bg-purple-500/10", dot: "bg-purple-400" },
  finalizado:           { label: "Finalizado",        color: "text-zinc-400   border-zinc-500/40   bg-zinc-500/10",   dot: "bg-zinc-400" },
};

const INTENSIDAD_META = [
  { nivel: 1, label: "Contacto amistoso",    color: "text-sky-400",    bg: "bg-sky-400",    glow: "shadow-sky-500/20" },
  { nivel: 2, label: "Presión activa",       color: "text-yellow-400", bg: "bg-yellow-400", glow: "shadow-yellow-500/20" },
  { nivel: 3, label: "Apariciones frecuentes", color: "text-orange-400", bg: "bg-orange-400", glow: "shadow-orange-500/20" },
  { nivel: 4, label: "Operación Fantasma",   color: "text-red-400",    bg: "bg-red-400",    glow: "shadow-red-500/30" },
  { nivel: 5, label: "Expediente crítico",   color: "text-rose-300",   bg: "bg-rose-500",   glow: "shadow-rose-500/40" },
];

const TIPO_ACCION_META: Record<TipoAccion, { label: string; icon: string; color: string }> = {
  llamada:         { label: "Llamada",          icon: "📞", color: "text-green-400" },
  whatsapp:        { label: "WhatsApp",         icon: "💬", color: "text-emerald-400" },
  email:           { label: "Email",            icon: "📧", color: "text-blue-400" },
  visita:          { label: "Visita",           icon: "🚶", color: "text-cyan-400" },
  negociacion:     { label: "Negociación",      icon: "🤝", color: "text-yellow-400" },
  acuerdo:         { label: "Acuerdo",          icon: "✅", color: "text-green-300" },
  seguimiento:     { label: "Seguimiento",      icon: "👁", color: "text-sky-400" },
  investigacion:   { label: "Investigación",    icon: "🔍", color: "text-purple-400" },
  requerimiento:   { label: "Requerimiento",    icon: "📋", color: "text-orange-400" },
  accion_sorpresa: { label: "Acción sorpresa",  icon: "⚡", color: "text-yellow-300" },
  escalada:        { label: "Escalada",         icon: "⬆",  color: "text-red-400" },
  hito:            { label: "Hito",             icon: "🏁", color: "text-amber-300" },
  nota:            { label: "Nota",             icon: "📝", color: "text-zinc-400" },
};

const ESTADO_ACCION_META: Record<EstadoAccion, { label: string; color: string }> = {
  pendiente:   { label: "Pendiente",   color: "text-yellow-400 bg-yellow-400/10" },
  en_progreso: { label: "En progreso", color: "text-blue-400 bg-blue-400/10" },
  completada:  { label: "Completada",  color: "text-green-400 bg-green-400/10" },
  cancelada:   { label: "Cancelada",   color: "text-red-400 bg-red-400/10" },
};

const HITOS_SISTEMA = [
  { key: "localizado",     label: "Deudor localizado",     icon: "🎯" },
  { key: "primer_contacto", label: "Primer contacto",      icon: "📡" },
  { key: "primera_respuesta", label: "Primera respuesta",  icon: "💬" },
  { key: "negociacion",    label: "Negociación iniciada",  icon: "🤝" },
  { key: "acuerdo",        label: "Acuerdo propuesto",     icon: "📋" },
  { key: "pago_parcial",   label: "Pago parcial",          icon: "💰" },
  { key: "recuperado",     label: "Recuperación completa", icon: "🏆" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtEuro(val: string | number | null | undefined): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })
    .format(parseFloat(String(val ?? "0")));
}

function IntensidadBadge({ nivel }: { nivel: number }) {
  const meta = INTENSIDAD_META[(nivel ?? 1) - 1] ?? INTENSIDAD_META[0];
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`h-1.5 w-4 rounded-full transition-all ${n <= nivel ? meta.bg : "bg-white/10"}`}
        />
      ))}
      <span className={`text-xs ${meta.color} ml-1`}>{meta.label}</span>
    </div>
  );
}

function ProgressBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold ${color ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Formulario Expediente ────────────────────────────────────────────────────

interface ExpedienteFormData {
  deudorNombre: string; deudorTelefono: string; deudorEmail: string;
  deudorDireccion: string; deudorNif: string; importeDeuda: string;
  porcentajeExito: string; tipoDeuda: string; clienteNombre: string;
  acreedorId: string; deudorId: string;
  cazadorId: string; modoOperacion: "manual" | "semi-automatico" | "automatico";
  probabilidadRecuperacion: string; intensidadOperativa: string;
  observacionesInternas: string; estado?: EstadoExpediente;
  importeRecuperado?: string; progresoOperativo?: string;
  progresoFinanciero?: string; progresoPsicologico?: string;
}

const defaultForm = (): ExpedienteFormData => ({
  deudorNombre: "", deudorTelefono: "", deudorEmail: "",
  deudorDireccion: "", deudorNif: "", importeDeuda: "",
  porcentajeExito: "20", tipoDeuda: "", clienteNombre: "",
  acreedorId: "", deudorId: "",
  cazadorId: "", modoOperacion: "manual",
  probabilidadRecuperacion: "50", intensidadOperativa: "1",
  observacionesInternas: "",
});

function ExpedienteModal({
  open, onClose, expediente, cazadores, onSaved,
}: {
  open: boolean; onClose: () => void; expediente: any | null;
  cazadores: { id: number; fullName: string }[]; onSaved: () => void;
}) {
  const isEdit = !!expediente;
  const { data: acreedoresList = [] } = trpc.expedientes.listAcreedores.useQuery({});
  const { data: deudoresList = [] } = trpc.expedientes.listDeudores.useQuery({});

  const [form, setForm] = useState<ExpedienteFormData>(() =>
    expediente ? {
      deudorNombre: expediente.deudorNombre ?? "",
      deudorTelefono: expediente.deudorTelefono ?? "",
      deudorEmail: expediente.deudorEmail ?? "",
      deudorDireccion: expediente.deudorDireccion ?? "",
      deudorNif: expediente.deudorNif ?? "",
      importeDeuda: expediente.importeDeuda ?? "",
      porcentajeExito: expediente.porcentajeExito ?? "20",
      tipoDeuda: expediente.tipoDeuda ?? "",
      clienteNombre: expediente.clienteNombre ?? "",
      acreedorId: expediente.acreedorId ? String(expediente.acreedorId) : "",
      deudorId: expediente.deudorId ? String(expediente.deudorId) : "",
      cazadorId: expediente.cazadorId ? String(expediente.cazadorId) : "",
      modoOperacion: expediente.modoOperacion ?? "manual",
      probabilidadRecuperacion: String(expediente.probabilidadRecuperacion ?? 50),
      intensidadOperativa: String(expediente.intensidadOperativa ?? 1),
      observacionesInternas: expediente.observacionesInternas ?? "",
      estado: expediente.estado,
      importeRecuperado: expediente.importeRecuperado ?? "0",
      progresoOperativo: String(expediente.progresoOperativo ?? 0),
      progresoFinanciero: String(expediente.progresoFinanciero ?? 0),
      progresoPsicologico: String(expediente.progresoPsicologico ?? 0),
    } : defaultForm()
  );

  const set = (key: keyof ExpedienteFormData) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const createMut = trpc.expedientes.create.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const updateMut = trpc.expedientes.update.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const saving = createMut.isPending || updateMut.isPending;
  const error = createMut.error?.message || updateMut.error?.message;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      deudorNombre: form.deudorNombre,
      deudorTelefono: form.deudorTelefono || undefined,
      deudorEmail: form.deudorEmail || undefined,
      deudorDireccion: form.deudorDireccion || undefined,
      deudorNif: form.deudorNif || undefined,
      importeDeuda: parseFloat(form.importeDeuda) || 0,
      porcentajeExito: parseFloat(form.porcentajeExito) || 20,
      tipoDeuda: form.tipoDeuda || undefined,
      clienteNombre: form.clienteNombre || undefined,
      acreedorId: form.acreedorId ? parseInt(form.acreedorId) : undefined,
      deudorId: form.deudorId ? parseInt(form.deudorId) : undefined,
      cazadorId: form.cazadorId ? parseInt(form.cazadorId) : undefined,
      modoOperacion: form.modoOperacion,
      probabilidadRecuperacion: parseInt(form.probabilidadRecuperacion) || 50,
      intensidadOperativa: parseInt(form.intensidadOperativa) || 1,
      observacionesInternas: form.observacionesInternas || undefined,
    };
    if (isEdit) {
      updateMut.mutate({
        id: expediente.id, ...payload,
        estado: form.estado,
        importeRecuperado: form.importeRecuperado ? parseFloat(form.importeRecuperado) : undefined,
        progresoOperativo: form.progresoOperativo ? parseInt(form.progresoOperativo) : undefined,
        progresoFinanciero: form.progresoFinanciero ? parseInt(form.progresoFinanciero) : undefined,
        progresoPsicologico: form.progresoPsicologico ? parseInt(form.progresoPsicologico) : undefined,
      });
    } else {
      createMut.mutate(payload);
    }
  }

  const intensidadNum = parseInt(form.intensidadOperativa) || 1;
  const intensidadMeta = INTENSIDAD_META[intensidadNum - 1];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0f14] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? `Editar — ${expediente.numeroExpediente}` : "Nuevo Expediente Operativo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">

          {/* Deudor */}
          <section className="border border-white/[0.06] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Datos del deudor</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Nombre completo *</Label>
                <Input value={form.deudorNombre} onChange={(e) => set("deudorNombre")(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Teléfono</Label>
                <Input value={form.deudorTelefono} onChange={(e) => set("deudorTelefono")(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={form.deudorEmail} onChange={(e) => set("deudorEmail")(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">NIF / CIF</Label>
                <Input value={form.deudorNif} onChange={(e) => set("deudorNif")(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Tipo de deuda</Label>
                <Input value={form.tipoDeuda} onChange={(e) => set("tipoDeuda")(e.target.value)} placeholder="Impago alquiler, factura..." className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Dirección</Label>
                <Input value={form.deudorDireccion} onChange={(e) => set("deudorDireccion")(e.target.value)} className="mt-1" />
              </div>
            </div>
          </section>

          {/* Financiero */}
          <section className="border border-white/[0.06] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Financiero</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Importe deuda (€) *</Label>
                <Input type="number" min="0" step="0.01" value={form.importeDeuda}
                  onChange={(e) => set("importeDeuda")(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">% Comisión por éxito</Label>
                <Input type="number" min="0" max="100" step="0.1" value={form.porcentajeExito}
                  onChange={(e) => set("porcentajeExito")(e.target.value)} className="mt-1" />
              </div>
              {isEdit && (
                <div>
                  <Label className="text-xs">Importe recuperado (€)</Label>
                  <Input type="number" min="0" step="0.01" value={form.importeRecuperado ?? ""}
                    onChange={(e) => set("importeRecuperado")(e.target.value)} className="mt-1" />
                </div>
              )}
            </div>
          </section>

          {/* Operativa */}
          <section className="border border-white/[0.06] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Configuración operativa</p>
            <div className="grid grid-cols-2 gap-3">
              {acreedoresList.length > 0 && (
                <div>
                  <Label className="text-xs">Acreedor (entidad registrada)</Label>
                  <Select
                    value={form.acreedorId || "none"}
                    onValueChange={(v) => set("acreedorId")(v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sin acreedor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin acreedor</SelectItem>
                      {acreedoresList.map((a: any) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.nombre}{a.organizacion ? ` (${a.organizacion})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-xs">Acreedor (texto libre)</Label>
                <Input value={form.clienteNombre} onChange={(e) => set("clienteNombre")(e.target.value)} className="mt-1" placeholder="Nombre del acreedor" />
              </div>
              {deudoresList.length > 0 && (
                <div>
                  <Label className="text-xs">Vincular deudor existente</Label>
                  <Select
                    value={form.deudorId || "none"}
                    onValueChange={(v) => set("deudorId")(v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sin deudor vinculado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin deudor vinculado</SelectItem>
                      {deudoresList.map((d: any) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.nombre}{d.nif ? ` — ${d.nif}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-xs">Cazador asignado</Label>
                <Select
                  value={form.cazadorId || "none"}
                  onValueChange={(v) => set("cazadorId")(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {cazadores.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Modo operación</Label>
                <Select value={form.modoOperacion} onValueChange={(v) => set("modoOperacion")(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="semi-automatico">Semi-automático</SelectItem>
                    <SelectItem value="automatico">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Probabilidad recuperación (%)</Label>
                <Input type="number" min="0" max="100" value={form.probabilidadRecuperacion}
                  onChange={(e) => set("probabilidadRecuperacion")(e.target.value)} className="mt-1" />
              </div>
              {isEdit && (
                <div>
                  <Label className="text-xs">Estado</Label>
                  <Select value={form.estado} onValueChange={(v) => set("estado")(v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ESTADO_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Intensidad operativa */}
            <div>
              <Label className="text-xs">Intensidad operativa</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {INTENSIDAD_META.map((m) => (
                  <button
                    key={m.nivel}
                    type="button"
                    onClick={() => set("intensidadOperativa")(String(m.nivel))}
                    className={`rounded-lg border p-2 text-center transition-all ${
                      intensidadNum === m.nivel
                        ? `border-current ${m.color} bg-white/5`
                        : "border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    <div className="text-lg font-bold">{m.nivel}</div>
                    <div className="text-[9px] leading-tight mt-0.5">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {isEdit && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <Label className="text-xs">Progreso operativo (%)</Label>
                  <Input type="number" min="0" max="100" value={form.progresoOperativo ?? ""}
                    onChange={(e) => set("progresoOperativo")(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Progreso financiero (%)</Label>
                  <Input type="number" min="0" max="100" value={form.progresoFinanciero ?? ""}
                    onChange={(e) => set("progresoFinanciero")(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Progreso psicológico (%)</Label>
                  <Input type="number" min="0" max="100" value={form.progresoPsicologico ?? ""}
                    onChange={(e) => set("progresoPsicologico")(e.target.value)} className="mt-1" />
                </div>
              </div>
            )}
          </section>

          <div>
            <Label className="text-xs">Observaciones internas</Label>
            <Textarea value={form.observacionesInternas}
              onChange={(e) => set("observacionesInternas")(e.target.value)}
              rows={3} placeholder="Notas privadas..." className="mt-1 text-sm" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} size="sm">Cancelar</Button>
            <Button type="submit" disabled={saving} size="sm">
              {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear expediente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Acción Modal ─────────────────────────────────────────────────────────────

function AccionModal({
  open, onClose, expedienteId, accion, cazadores, onSaved,
}: {
  open: boolean; onClose: () => void; expedienteId: number;
  accion: any | null; cazadores: { id: number; fullName: string }[]; onSaved: () => void;
}) {
  const isEdit = !!accion;
  const [tipo, setTipo] = useState<TipoAccion>(accion?.tipo ?? "nota");
  const [titulo, setTitulo] = useState(accion?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(accion?.descripcion ?? "");
  const [prioridad, setPrioridad] = useState(accion?.prioridad ?? "media");
  const [estado, setEstado] = useState<EstadoAccion>(accion?.estado ?? "pendiente");
  const [cazadorId, setCazadorId] = useState(accion?.cazadorId ? String(accion.cazadorId) : "");
  const [visibleCliente, setVisibleCliente] = useState(accion?.visibleCliente ?? false);
  const [notasInternas, setNotasInternas] = useState(accion?.notasInternas ?? "");
  const [resultado, setResultado] = useState(accion?.resultado ?? "");

  const addMut = trpc.expedientes.addAccion.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const updateMut = trpc.expedientes.updateAccion.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const saving = addMut.isPending || updateMut.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const base = {
      tipo, titulo,
      descripcion: descripcion || undefined,
      prioridad: prioridad as any,
      visibleCliente,
      cazadorId: cazadorId ? parseInt(cazadorId) : undefined,
      notasInternas: notasInternas || undefined,
    };
    if (isEdit) {
      updateMut.mutate({ id: accion.id, ...base, estado, resultado: resultado || undefined });
    } else {
      addMut.mutate({ expedienteId, ...base });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-[#0d0f14] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base">{isEdit ? "Editar acción" : "Nueva acción operativa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          <div className="grid grid-cols-5 gap-1.5">
            {(Object.keys(TIPO_ACCION_META) as TipoAccion[]).map((t) => {
              const m = TIPO_ACCION_META[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`rounded-lg border p-2 text-center transition-all ${
                    tipo === t ? `border-white/30 bg-white/10` : "border-white/8 hover:border-white/20"
                  }`}
                >
                  <div className="text-lg">{m.icon}</div>
                  <div className="text-[9px] text-muted-foreground leading-tight mt-0.5 truncate">{m.label}</div>
                </button>
              );
            })}
          </div>

          <div>
            <Label className="text-xs">Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Prioridad</Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">⚠ Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEdit && (
              <div>
                <Label className="text-xs">Estado</Label>
                <Select value={estado} onValueChange={(v) => setEstado(v as EstadoAccion)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ESTADO_ACCION_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">Descripción</Label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className="mt-1 text-sm" />
          </div>

          {isEdit && (
            <div>
              <Label className="text-xs">Resultado</Label>
              <Textarea value={resultado} onChange={(e) => setResultado(e.target.value)} rows={2} className="mt-1 text-sm" />
            </div>
          )}

          <div>
            <Label className="text-xs">Notas internas</Label>
            <Textarea value={notasInternas} onChange={(e) => setNotasInternas(e.target.value)} rows={2} className="mt-1 text-sm" />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={visibleCliente} onChange={(e) => setVisibleCliente(e.target.checked)} className="rounded" />
              {visibleCliente ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              Visible para el acreedor
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={saving} size="sm">
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                {isEdit ? "Guardar" : "Añadir"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Panel de detalle ─────────────────────────────────────────────────────────

function ExpedienteDetail({
  expedienteId, cazadores, onClose, onEdited,
}: {
  expedienteId: number;
  cazadores: { id: number; fullName: string }[];
  onClose: () => void;
  onEdited: () => void;
}) {
  const [accionModal, setAccionModal] = useState<{ open: boolean; accion: any | null }>({ open: false, accion: null });
  const [deleteAccionId, setDeleteAccionId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState<"registro" | "hitos" | "automatizaciones">("registro");
  const [linkCopied, setLinkCopied] = useState(false);

  const { data, isLoading, refetch } = trpc.expedientes.get.useQuery({ id: expedienteId });
  const deleteAccionMut = trpc.expedientes.deleteAccion.useMutation({ onSuccess: () => refetch() });
  const { data: autoLogs = [], refetch: refetchLogs } = trpc.expedientes.automationLogs.useQuery(
    { expedienteId },
    { enabled: tab === "automatizaciones" }
  );
  const revertMut = trpc.expedientes.revertAutomation.useMutation({ onSuccess: () => { refetchLogs(); refetch(); } });
  const generateTokenMut = trpc.expedientes.generateLandingToken.useMutation({
    onSuccess: () => refetch(),
  });

  function copyLandingLink(token: string) {
    const url = `${window.location.origin}/seguimiento/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
  if (!data) return null;

  const estado = ESTADO_META[data.estado as EstadoExpediente] ?? ESTADO_META.pendiente_activacion;
  const intensidad = INTENSIDAD_META[(data.intensidadOperativa ?? 1) - 1];
  const importeDeuda = parseFloat(data.importeDeuda ?? "0");
  const importeRecuperado = parseFloat(data.importeRecuperado ?? "0");
  const recupeRate = importeDeuda > 0 ? (importeRecuperado / importeDeuda) * 100 : 0;
  const comision = importeRecuperado * (parseFloat(data.porcentajeExito ?? "20") / 100);

  const hitos = (data.acciones as any[]).filter((a) => a.tipo === "hito");
  const registro = (data.acciones as any[]).filter((a) => a.tipo !== "hito");

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0a0c10]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono text-muted-foreground tracking-wider">{data.numeroExpediente}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${estado.color}`}>{estado.label}</span>
              {data.modoOperacion !== "manual" && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 capitalize">
                  {data.modoOperacion}
                </span>
              )}
            </div>
            <h2 className="font-bold text-lg leading-tight">{data.deudorNombre}</h2>
            {data.clienteNombre && (
              <p className="text-xs text-muted-foreground mt-0.5">Acreedor: {data.clienteNombre}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditOpen(true)}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <IntensidadBadge nivel={data.intensidadOperativa ?? 1} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.06]">
          <div className="bg-[#0a0c10] px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Deuda total</p>
            <p className="text-base font-bold">{fmtEuro(data.importeDeuda)}</p>
          </div>
          <div className="bg-[#0a0c10] px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Recuperado</p>
            <p className="text-base font-bold text-green-400">{fmtEuro(data.importeRecuperado)}</p>
          </div>
          <div className="bg-[#0a0c10] px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Comisión est.</p>
            <p className="text-base font-bold text-cyan-400">{fmtEuro(comision)}</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Barras de progreso */}
          <div className="space-y-3">
            <ProgressBar value={recupeRate} color="bg-green-500" label="Recuperación financiera" />
            <ProgressBar value={data.progresoOperativo ?? 0} color="bg-cyan-500" label="Progreso operativo" />
            <ProgressBar value={data.progresoPsicologico ?? 0} color="bg-purple-500" label="Presión psicológica" />
            <ProgressBar value={data.probabilidadRecuperacion ?? 0} color="bg-yellow-500" label="Probabilidad recuperación" />
          </div>

          {/* Contacto */}
          {(data.deudorTelefono || data.deudorEmail || data.deudorDireccion || data.deudorNif) && (
            <div className="space-y-1.5">
              {data.deudorTelefono && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-green-400" />{data.deudorTelefono}
                </div>
              )}
              {data.deudorEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-blue-400" />{data.deudorEmail}
                </div>
              )}
              {data.deudorDireccion && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-orange-400" />{data.deudorDireccion}
                </div>
              )}
              {data.deudorNif && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3.5 h-3.5 shrink-0 text-zinc-400" />{data.deudorNif}
                </div>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {data.tipoDeuda && <><span className="text-muted-foreground">Tipo deuda</span><span className="font-medium">{data.tipoDeuda}</span></>}
            <span className="text-muted-foreground">Comisión</span><span className="font-medium">{data.porcentajeExito}%</span>
            <span className="text-muted-foreground">Modo</span><span className="font-medium capitalize">{data.modoOperacion}</span>
            {data.fechaApertura && <><span className="text-muted-foreground">Apertura</span><span className="font-medium">{data.fechaApertura}</span></>}
          </div>

          {data.observacionesInternas && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-xs text-muted-foreground">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5">Observaciones internas</p>
              <p className="leading-relaxed">{data.observacionesInternas}</p>
            </div>
          )}

          {/* Tabs registro / hitos / automatizaciones */}
          <div>
            <div className="flex gap-1 mb-4 bg-white/[0.03] rounded-lg p-1 w-fit flex-wrap">
              {(["registro", "hitos", "automatizaciones"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    tab === t ? "bg-white/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "registro" ? `Registro (${registro.length})`
                    : t === "hitos" ? `Hitos (${hitos.length})`
                    : "Automatizaciones"}
                </button>
              ))}
            </div>

            {tab === "registro" && (
              <>
                <div className="flex justify-end mb-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                    onClick={() => setAccionModal({ open: true, accion: null })}>
                    <Plus className="w-3.5 h-3.5" /> Nueva acción
                  </Button>
                </div>
                {registro.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Sin acciones registradas</p>
                ) : (
                  <div className="space-y-2">
                    {registro.map((accion: any) => {
                      const t = TIPO_ACCION_META[accion.tipo as TipoAccion] ?? { label: accion.tipo, icon: "•", color: "" };
                      const ea = ESTADO_ACCION_META[accion.estado as EstadoAccion];
                      return (
                        <div key={accion.id}
                          className="border border-white/[0.06] rounded-xl p-3 hover:bg-white/[0.02] transition-colors group">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="text-base mt-0.5 shrink-0">{t.icon}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-medium">{accion.titulo}</p>
                                  {accion.visibleCliente && (
                                    <Eye className="w-3 h-3 text-cyan-400 shrink-0" />
                                  )}
                                </div>
                                {accion.descripcion && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{accion.descripcion}</p>
                                )}
                                {accion.resultado && (
                                  <p className="text-xs text-green-400 mt-1">→ {accion.resultado}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {ea && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ea.color}`}>{ea.label}</span>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(accion.createdAt).toLocaleDateString("es-ES")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0"
                                onClick={() => setAccionModal({ open: true, accion })}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => setDeleteAccionId(accion.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {tab === "hitos" && (
              <>
                <div className="flex justify-end mb-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                    onClick={() => setAccionModal({ open: true, accion: { tipo: "hito" } })}>
                    <Flag className="w-3.5 h-3.5" /> Añadir hito
                  </Button>
                </div>
                {/* Hitos del sistema */}
                <div className="space-y-2 mb-4">
                  {HITOS_SISTEMA.map((h) => {
                    const completado = hitos.some((a: any) =>
                      a.titulo.toLowerCase().includes(h.label.toLowerCase()) ||
                      a.notasInternas?.includes(h.key)
                    );
                    return (
                      <div key={h.key}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                          completado
                            ? "border-amber-500/30 bg-amber-500/[0.05] text-foreground"
                            : "border-white/[0.04] text-muted-foreground"
                        }`}>
                        <span className="text-xl">{h.icon}</span>
                        <span className="text-sm">{h.label}</span>
                        {completado && <CheckCircle2 className="w-4 h-4 text-amber-400 ml-auto" />}
                      </div>
                    );
                  })}
                </div>

                {hitos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Hitos registrados</p>
                    {hitos.map((h: any) => (
                      <div key={h.id}
                        className="border border-amber-500/20 bg-amber-500/[0.04] rounded-xl p-3 group">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-amber-300">🏁 {h.titulo}</p>
                            {h.descripcion && <p className="text-xs text-muted-foreground mt-0.5">{h.descripcion}</p>}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(h.createdAt).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                            onClick={() => setDeleteAccionId(h.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "automatizaciones" && (
              <div className="space-y-3">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Reglas activas</p>
                  {[
                    { trigger: "Expediente creado",  action: "Crear acción inicial de análisis" },
                    { trigger: "Estado cambiado",    action: "Crear acción de seguimiento correspondiente" },
                    { trigger: "Acción completada",  action: "Crear hito o acción de seguimiento" },
                  ].map((r) => (
                    <div key={r.trigger} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span className="text-muted-foreground">{r.trigger}</span>
                      <span className="text-white/20 mx-1">→</span>
                      <span className="text-cyan-300/70">{r.action}</span>
                    </div>
                  ))}
                </div>

                {(autoLogs as any[]).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Sin automatizaciones ejecutadas</p>
                ) : (
                  <div className="space-y-2">
                    {(autoLogs as any[]).map((log: any) => {
                      const isReverted = !!log.revertedAt;
                      const isRevertible = (log.actionType === "create_accion" || log.actionType === "create_hito") && !isReverted;
                      const actionData = (() => { try { return JSON.parse(log.actionData ?? "{}"); } catch { return {}; } })();
                      const ACTION_LABEL: Record<string, string> = {
                        create_accion:    "Acción creada",
                        create_hito:      "Hito creado",
                        skip_duplicate:   "Omitida (duplicado)",
                        skip_manual:      "Omitida (modo manual)",
                        skip_no_rule:     "Omitida (sin regla)",
                      };
                      const TRIGGER_LABEL: Record<string, string> = {
                        expediente_created: "Apertura de expediente",
                        estado_changed:     "Cambio de estado",
                        accion_completada:  "Acción completada",
                      };
                      return (
                        <div key={log.id} className={`border rounded-xl p-3 text-xs transition-all ${
                          isReverted
                            ? "border-white/[0.04] opacity-40"
                            : log.actionType.startsWith("skip")
                            ? "border-white/[0.04] bg-white/[0.01]"
                            : "border-cyan-500/20 bg-cyan-500/[0.03]"
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`font-medium ${log.actionType.startsWith("skip") ? "text-muted-foreground" : "text-cyan-300"}`}>
                                  {ACTION_LABEL[log.actionType] ?? log.actionType}
                                </span>
                                {isReverted && <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 rounded-full">Revertido</span>}
                              </div>
                              <p className="text-muted-foreground">
                                Trigger: {TRIGGER_LABEL[log.trigger] ?? log.trigger}
                              </p>
                              {actionData.titulo && (
                                <p className="text-white/50 mt-0.5">"{actionData.titulo}"</p>
                              )}
                              <p className="text-white/20 mt-1">
                                {new Date(log.createdAt).toLocaleString("es-ES")}
                              </p>
                            </div>
                            {isRevertible && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[10px] text-red-400 hover:text-red-300 shrink-0 px-2"
                                onClick={() => revertMut.mutate({ logId: log.id })}
                                disabled={revertMut.isPending}
                              >
                                Revertir
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enlace de seguimiento para el acreedor */}
          <div className="border border-white/[0.06] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Portal del acreedor</p>
            </div>
            {data.landingToken ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                  <span className="text-xs text-muted-foreground font-mono truncate flex-1">
                    {window.location.origin}/seguimiento/{data.landingToken}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs gap-1.5"
                    onClick={() => copyLandingLink(data.landingToken!)}
                  >
                    {linkCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {linkCopied ? "¡Copiado!" : "Copiar enlace"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground"
                    title="Regenerar enlace"
                    onClick={() => generateTokenMut.mutate({ id: expedienteId })}
                    disabled={generateTokenMut.isPending}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generateTokenMut.isPending ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Genera un enlace privado para que el acreedor consulte el estado de su expediente.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs gap-1.5"
                  onClick={() => generateTokenMut.mutate({ id: expedienteId })}
                  disabled={generateTokenMut.isPending}
                >
                  {generateTokenMut.isPending
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Link2 className="w-3.5 h-3.5" />}
                  Generar enlace de seguimiento
                </Button>
              </div>
            )}
          </div>

          {/* Próximamente */}
          <div className="border border-white/[0.04] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Próximamente</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "🤖", label: "IA Operativa", sub: "Scoring y sugerencias automáticas" },
                { icon: "📎", label: "Evidencias", sub: "Audios, fotos, documentos" },
              ].map((item) => (
                <div key={item.label} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 opacity-50">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-xs font-medium mt-1">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {accionModal.open && (
        <AccionModal
          open onClose={() => setAccionModal({ open: false, accion: null })}
          expedienteId={expedienteId}
          accion={accionModal.accion?.id ? accionModal.accion : null}
          cazadores={cazadores}
          onSaved={() => refetch()}
        />
      )}

      {editOpen && (
        <ExpedienteModal
          open onClose={() => setEditOpen(false)}
          expediente={data} cazadores={cazadores}
          onSaved={() => { refetch(); onEdited(); }}
        />
      )}

      <AlertDialog open={deleteAccionId !== null} onOpenChange={(o) => !o && setDeleteAccionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar acción?</AlertDialogTitle>
            <AlertDialogDescription>Esta operación no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteAccionId) { deleteAccionMut.mutate({ id: deleteAccionId }); setDeleteAccionId(null); } }}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ExpedientesManager() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.expedientes.list.useQuery({
    search: search || undefined,
    estado: estadoFilter || undefined,
    limit: 100,
    offset: 0,
  });

  const { data: cazadores = [] } = trpc.expedientes.listCazadores.useQuery();
  const deleteMut = trpc.expedientes.delete.useMutation({
    onSuccess: () => { refetch(); setSelectedId(null); setDeleteId(null); },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const stats = useMemo(() => {
    const activos = items.filter((e) => e.estado === "operativo_activo").length;
    const totalDeuda = items.reduce((s, e) => s + parseFloat(e.importeDeuda ?? "0"), 0);
    const totalRecuperado = items.reduce((s, e) => s + parseFloat(e.importeRecuperado ?? "0"), 0);
    const recuperados = items.filter((e) => e.estado === "recuperado").length;
    return { activos, totalDeuda, totalRecuperado, recuperados };
  }, [items]);

  return (
    <AdminLayout title="Expedientes Operativos">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#080a0e]">

        {/* Lista */}
        <div className={`flex flex-col border-r border-white/[0.06] transition-all ${selectedId ? "w-[380px] shrink-0" : "flex-1"}`}>

          {/* Stats */}
          {!selectedId && (
            <div className="grid grid-cols-4 gap-px bg-white/[0.04] border-b border-white/[0.06] shrink-0">
              <div className="bg-[#080a0e] px-4 py-3">
                <p className="text-xs text-muted-foreground">Total expedientes</p>
                <p className="text-2xl font-bold mt-0.5">{total}</p>
              </div>
              <div className="bg-[#080a0e] px-4 py-3">
                <p className="text-xs text-muted-foreground">Operativos activos</p>
                <p className="text-2xl font-bold mt-0.5 text-cyan-400">{stats.activos}</p>
              </div>
              <div className="bg-[#080a0e] px-4 py-3">
                <p className="text-xs text-muted-foreground">Deuda gestionada</p>
                <p className="text-2xl font-bold mt-0.5">{fmtEuro(stats.totalDeuda)}</p>
              </div>
              <div className="bg-[#080a0e] px-4 py-3">
                <p className="text-xs text-muted-foreground">Total recuperado</p>
                <p className="text-2xl font-bold mt-0.5 text-green-400">{fmtEuro(stats.totalRecuperado)}</p>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="p-4 border-b border-white/[0.06] space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Expedientes Operativos
              </h1>
              <Button size="sm" onClick={() => setCreateModal(true)} className="h-7 text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Nuevo
              </Button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
                <Input className="pl-8 h-8 text-xs bg-white/[0.03] border-white/[0.08]"
                  placeholder="Deudor, expediente, acreedor..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select
                value={estadoFilter || "all"}
                onValueChange={(v) => setEstadoFilter(v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-8 w-36 text-xs bg-white/[0.03] border-white/[0.08]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(ESTADO_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground p-4">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Crosshair className="w-6 h-6 opacity-30" />
                </div>
                <p className="text-sm">Sin expedientes</p>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setCreateModal(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Crear expediente
                </Button>
              </div>
            ) : (
              items.map((exp) => {
                const meta = ESTADO_META[exp.estado as EstadoExpediente] ?? ESTADO_META.pendiente_activacion;
                const intensidad = INTENSIDAD_META[(exp.intensidadOperativa ?? 1) - 1];
                const isSelected = selectedId === exp.id;
                const importeDeuda = parseFloat(exp.importeDeuda ?? "0");
                const importeRec = parseFloat(exp.importeRecuperado ?? "0");
                const recupe = importeDeuda > 0 ? (importeRec / importeDeuda) * 100 : 0;

                return (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedId(isSelected ? null : exp.id)}
                    className={`w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-colors ${
                      isSelected ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                          <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{exp.numeroExpediente}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                        </div>
                        <p className="font-semibold text-sm truncate">{exp.deudorNombre}</p>
                        {exp.clienteNombre && (
                          <p className="text-xs text-muted-foreground truncate">{exp.clienteNombre}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold">{fmtEuro(exp.importeDeuda)}</span>
                          {recupe > 0 && (
                            <span className="text-xs text-green-400 font-medium">{recupe.toFixed(0)}% rec.</span>
                          )}
                        </div>
                        {exp.intensidadOperativa && exp.intensidadOperativa > 1 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {[1,2,3,4,5].map((n) => (
                              <div key={n} className={`h-1 w-3 rounded-full ${n <= (exp.intensidadOperativa ?? 1) ? intensidad.bg : "bg-white/10"}`} />
                            ))}
                            <span className={`text-[10px] ml-1 ${intensidad.color}`}>{intensidad.label}</span>
                          </div>
                        )}
                        {recupe > 0 && (
                          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500/60 rounded-full" style={{ width: `${Math.min(100, recupe)}%` }} />
                          </div>
                        )}
                      </div>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground/40 shrink-0 mt-1 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detail */}
        {selectedId && (
          <div className="flex-1 overflow-hidden">
            <ExpedienteDetail
              expedienteId={selectedId}
              cazadores={cazadores}
              onClose={() => setSelectedId(null)}
              onEdited={() => refetch()}
            />
          </div>
        )}
      </div>

      {createModal && (
        <ExpedienteModal
          open onClose={() => setCreateModal(false)}
          expediente={null} cazadores={cazadores}
          onSaved={() => refetch()}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar expediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán también todas las acciones operativas. Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteMut.mutate({ id: deleteId }); }}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
