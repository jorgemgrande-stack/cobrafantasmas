import { useState } from "react";
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
  Plus,
  Search,
  ChevronRight,
  Loader2,
  Trash2,
  Edit2,
  FileText,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type EstadoExpediente =
  | "pendiente_activacion"
  | "estrategia_inicial"
  | "operativo_activo"
  | "negociacion"
  | "acuerdo_parcial"
  | "recuperacion_parcial"
  | "recuperado"
  | "incobrable"
  | "suspendido"
  | "escalada_juridica"
  | "finalizado";

type TipoAccion =
  | "llamada" | "whatsapp" | "email" | "visita" | "negociacion"
  | "acuerdo" | "seguimiento" | "investigacion" | "requerimiento"
  | "accion_sorpresa" | "escalada" | "hito" | "nota";

type EstadoAccion = "pendiente" | "en_progreso" | "completada" | "cancelada";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_META: Record<EstadoExpediente, { label: string; color: string }> = {
  pendiente_activacion: { label: "Pendiente activación", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  estrategia_inicial:   { label: "Estrategia inicial",   color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  operativo_activo:     { label: "Operativo activo",      color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  negociacion:          { label: "Negociación",           color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  acuerdo_parcial:      { label: "Acuerdo parcial",       color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  recuperacion_parcial: { label: "Recuperación parcial",  color: "bg-lime-500/20 text-lime-300 border-lime-500/30" },
  recuperado:           { label: "Recuperado",            color: "bg-green-500/20 text-green-300 border-green-500/30" },
  incobrable:           { label: "Incobrable",            color: "bg-red-500/20 text-red-300 border-red-500/30" },
  suspendido:           { label: "Suspendido",            color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  escalada_juridica:    { label: "Escalada jurídica",     color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  finalizado:           { label: "Finalizado",            color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
};

const TIPO_ACCION_META: Record<TipoAccion, { label: string; icon: string }> = {
  llamada:        { label: "Llamada",         icon: "📞" },
  whatsapp:       { label: "WhatsApp",        icon: "💬" },
  email:          { label: "Email",           icon: "📧" },
  visita:         { label: "Visita",          icon: "🚶" },
  negociacion:    { label: "Negociación",     icon: "🤝" },
  acuerdo:        { label: "Acuerdo",         icon: "✅" },
  seguimiento:    { label: "Seguimiento",     icon: "👁" },
  investigacion:  { label: "Investigación",   icon: "🔍" },
  requerimiento:  { label: "Requerimiento",   icon: "📋" },
  accion_sorpresa:{ label: "Acción sorpresa", icon: "⚡" },
  escalada:       { label: "Escalada",        icon: "⬆" },
  hito:           { label: "Hito",            icon: "🏁" },
  nota:           { label: "Nota",            icon: "📝" },
};

const ESTADOS_ACCION_META: Record<EstadoAccion, { label: string; color: string }> = {
  pendiente:    { label: "Pendiente",    color: "bg-yellow-500/20 text-yellow-300" },
  en_progreso:  { label: "En progreso",  color: "bg-blue-500/20 text-blue-300" },
  completada:   { label: "Completada",   color: "bg-green-500/20 text-green-300" },
  cancelada:    { label: "Cancelada",    color: "bg-red-500/20 text-red-300" },
};

function fmtEuro(val: string | number | null | undefined): string {
  const n = parseFloat(String(val ?? "0"));
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-muted/50 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ─── Create / Edit Expediente Modal ───────────────────────────────────────────

interface ExpedienteFormData {
  deudorNombre: string;
  deudorTelefono: string;
  deudorEmail: string;
  deudorDireccion: string;
  deudorNif: string;
  importeDeuda: string;
  porcentajeExito: string;
  tipoDeuda: string;
  clienteNombre: string;
  cazadorId: string;
  modoOperacion: "manual" | "semi-automatico" | "automatico";
  probabilidadRecuperacion: string;
  intensidadOperativa: string;
  observacionesInternas: string;
  estado?: EstadoExpediente;
  importeRecuperado?: string;
  progresoOperativo?: string;
  progresoFinanciero?: string;
  progresoPsicologico?: string;
}

const defaultForm = (): ExpedienteFormData => ({
  deudorNombre: "",
  deudorTelefono: "",
  deudorEmail: "",
  deudorDireccion: "",
  deudorNif: "",
  importeDeuda: "",
  porcentajeExito: "20",
  tipoDeuda: "",
  clienteNombre: "",
  cazadorId: "",
  modoOperacion: "manual",
  probabilidadRecuperacion: "50",
  intensidadOperativa: "1",
  observacionesInternas: "",
});

function ExpedienteModal({
  open,
  onClose,
  expediente,
  cazadores,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  expediente: any | null;
  cazadores: { id: number; fullName: string }[];
  onSaved: () => void;
}) {
  const isEdit = !!expediente;
  const [form, setForm] = useState<ExpedienteFormData>(() =>
    expediente
      ? {
          deudorNombre: expediente.deudorNombre ?? "",
          deudorTelefono: expediente.deudorTelefono ?? "",
          deudorEmail: expediente.deudorEmail ?? "",
          deudorDireccion: expediente.deudorDireccion ?? "",
          deudorNif: expediente.deudorNif ?? "",
          importeDeuda: expediente.importeDeuda ?? "",
          porcentajeExito: expediente.porcentajeExito ?? "20",
          tipoDeuda: expediente.tipoDeuda ?? "",
          clienteNombre: expediente.clienteNombre ?? "",
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
        }
      : defaultForm(),
  );

  const createMut = trpc.expedientes.create.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const updateMut = trpc.expedientes.update.useMutation({ onSuccess: () => { onSaved(); onClose(); } });

  const set = (key: keyof ExpedienteFormData) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

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
      cazadorId: form.cazadorId ? parseInt(form.cazadorId) : undefined,
      modoOperacion: form.modoOperacion,
      probabilidadRecuperacion: parseInt(form.probabilidadRecuperacion) || 50,
      intensidadOperativa: parseInt(form.intensidadOperativa) || 1,
      observacionesInternas: form.observacionesInternas || undefined,
    };

    if (isEdit) {
      updateMut.mutate({
        id: expediente.id,
        ...payload,
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

  const saving = createMut.isPending || updateMut.isPending;
  const error = createMut.error?.message || updateMut.error?.message;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar ${expediente.numeroExpediente}` : "Nuevo Expediente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Deudor */}
          <div className="space-y-3 border border-border/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deudor</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Nombre completo *</Label>
                <Input value={form.deudorNombre} onChange={(e) => set("deudorNombre")(e.target.value)} required />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={form.deudorTelefono} onChange={(e) => set("deudorTelefono")(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.deudorEmail} onChange={(e) => set("deudorEmail")(e.target.value)} />
              </div>
              <div>
                <Label>NIF / CIF</Label>
                <Input value={form.deudorNif} onChange={(e) => set("deudorNif")(e.target.value)} />
              </div>
              <div>
                <Label>Tipo de deuda</Label>
                <Input value={form.tipoDeuda} onChange={(e) => set("tipoDeuda")(e.target.value)} placeholder="Ej: Impago alquiler" />
              </div>
              <div className="col-span-2">
                <Label>Dirección</Label>
                <Input value={form.deudorDireccion} onChange={(e) => set("deudorDireccion")(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Financiero */}
          <div className="space-y-3 border border-border/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Financiero</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Importe deuda (€) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.importeDeuda}
                  onChange={(e) => set("importeDeuda")(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>% Comisión éxito</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.porcentajeExito}
                  onChange={(e) => set("porcentajeExito")(e.target.value)}
                />
              </div>
              {isEdit && (
                <div>
                  <Label>Importe recuperado (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.importeRecuperado ?? ""}
                    onChange={(e) => set("importeRecuperado")(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Acreedor + Operativa */}
          <div className="space-y-3 border border-border/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Operativa</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Acreedor (cliente)</Label>
                <Input value={form.clienteNombre} onChange={(e) => set("clienteNombre")(e.target.value)} />
              </div>
              <div>
                <Label>Cazador asignado</Label>
                <Select value={form.cazadorId} onValueChange={set("cazadorId")}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {cazadores.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Modo operación</Label>
                <Select value={form.modoOperacion} onValueChange={(v) => set("modoOperacion")(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="semi-automatico">Semi-automático</SelectItem>
                    <SelectItem value="automatico">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Intensidad operativa (1-5)</Label>
                <Select value={form.intensidadOperativa} onValueChange={set("intensidadOperativa")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Probabilidad recuperación (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.probabilidadRecuperacion}
                  onChange={(e) => set("probabilidadRecuperacion")(e.target.value)}
                />
              </div>
              {isEdit && (
                <div>
                  <Label>Estado</Label>
                  <Select value={form.estado} onValueChange={(v) => set("estado")(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ESTADO_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {isEdit && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <Label>Progreso operativo (%)</Label>
                  <Input type="number" min="0" max="100" value={form.progresoOperativo ?? ""} onChange={(e) => set("progresoOperativo")(e.target.value)} />
                </div>
                <div>
                  <Label>Progreso financiero (%)</Label>
                  <Input type="number" min="0" max="100" value={form.progresoFinanciero ?? ""} onChange={(e) => set("progresoFinanciero")(e.target.value)} />
                </div>
                <div>
                  <Label>Progreso psicológico (%)</Label>
                  <Input type="number" min="0" max="100" value={form.progresoPsicologico ?? ""} onChange={(e) => set("progresoPsicologico")(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <Label>Observaciones internas</Label>
            <Textarea
              value={form.observacionesInternas}
              onChange={(e) => set("observacionesInternas")(e.target.value)}
              rows={3}
              placeholder="Notas privadas del expediente..."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
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
  open,
  onClose,
  expedienteId,
  accion,
  cazadores,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  expedienteId: number;
  accion: any | null;
  cazadores: { id: number; fullName: string }[];
  onSaved: () => void;
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const base = {
      tipo,
      titulo,
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

  const saving = addMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar acción" : "Nueva acción operativa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoAccion)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_ACCION_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridad</Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} />
          </div>

          {isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Estado</Label>
                <Select value={estado} onValueChange={(v) => setEstado(v as EstadoAccion)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ESTADOS_ACCION_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cazador</Label>
                <Select value={cazadorId} onValueChange={setCazadorId}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {cazadores.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isEdit && (
            <div>
              <Label>Resultado</Label>
              <Textarea value={resultado} onChange={(e) => setResultado(e.target.value)} rows={2} />
            </div>
          )}

          <div>
            <Label>Notas internas</Label>
            <Textarea value={notasInternas} onChange={(e) => setNotasInternas(e.target.value)} rows={2} />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visibleCliente"
              checked={visibleCliente}
              onChange={(e) => setVisibleCliente(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="visibleCliente" className="text-sm text-muted-foreground">Visible para el acreedor</label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {isEdit ? "Guardar" : "Añadir acción"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function ExpedienteDetail({
  expedienteId,
  cazadores,
  onClose,
  onEdited,
}: {
  expedienteId: number;
  cazadores: { id: number; fullName: string }[];
  onClose: () => void;
  onEdited: () => void;
}) {
  const [accionModal, setAccionModal] = useState<{ open: boolean; accion: any | null }>({
    open: false,
    accion: null,
  });
  const [deleteAccionId, setDeleteAccionId] = useState<number | null>(null);
  const [editExpediente, setEditExpediente] = useState(false);

  const { data, isLoading, refetch } = trpc.expedientes.get.useQuery({ id: expedienteId });
  const deleteAccionMut = trpc.expedientes.deleteAccion.useMutation({ onSuccess: () => refetch() });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  if (!data) return null;

  const estadoMeta = ESTADO_META[data.estado as EstadoExpediente] ?? { label: data.estado, color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
  const recupeRate = parseFloat(data.importeDeuda ?? "0") > 0
    ? (parseFloat(data.importeRecuperado ?? "0") / parseFloat(data.importeDeuda)) * 100
    : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border/50 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">{data.numeroExpediente}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${estadoMeta.color}`}>{estadoMeta.label}</span>
          </div>
          <h2 className="font-semibold text-lg">{data.deudorNombre}</h2>
          {data.clienteNombre && <p className="text-sm text-muted-foreground">Acreedor: {data.clienteNombre}</p>}
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditExpediente(true)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Financiero */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Deuda total</p>
            <p className="text-xl font-bold">{fmtEuro(data.importeDeuda)}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Recuperado</p>
            <p className="text-xl font-bold text-green-400">{fmtEuro(data.importeRecuperado)}</p>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Recuperación financiera</span>
              <span className="font-medium">{recupeRate.toFixed(0)}%</span>
            </div>
            <ProgressBar value={recupeRate} color="bg-green-500" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progreso operativo</span>
              <span className="font-medium">{data.progresoOperativo ?? 0}%</span>
            </div>
            <ProgressBar value={data.progresoOperativo ?? 0} color="bg-cyan-500" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progreso psicológico</span>
              <span className="font-medium">{data.progresoPsicologico ?? 0}%</span>
            </div>
            <ProgressBar value={data.progresoPsicologico ?? 0} color="bg-purple-500" />
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 text-sm">
          {data.deudorTelefono && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{data.deudorTelefono}</span>
            </div>
          )}
          {data.deudorEmail && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{data.deudorEmail}</span>
            </div>
          )}
          {data.deudorDireccion && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{data.deudorDireccion}</span>
            </div>
          )}
          {data.deudorNif && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{data.deudorNif}</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Probabilidad: </span>
            <span className="font-medium">{data.probabilidadRecuperacion ?? 0}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Intensidad: </span>
            <span className="font-medium">{data.intensidadOperativa ?? 1}/5</span>
          </div>
          <div>
            <span className="text-muted-foreground">Modo: </span>
            <span className="font-medium capitalize">{data.modoOperacion}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Comisión: </span>
            <span className="font-medium">{data.porcentajeExito}%</span>
          </div>
          {data.tipoDeuda && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Tipo deuda: </span>
              <span className="font-medium">{data.tipoDeuda}</span>
            </div>
          )}
          {data.fechaApertura && (
            <div>
              <span className="text-muted-foreground">Apertura: </span>
              <span className="font-medium">{data.fechaApertura}</span>
            </div>
          )}
        </div>

        {data.observacionesInternas && (
          <div className="bg-muted/20 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="text-xs font-semibold uppercase tracking-wide mb-1">Observaciones</p>
            <p>{data.observacionesInternas}</p>
          </div>
        )}

        {/* Acciones */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Registro operativo</h3>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setAccionModal({ open: true, accion: null })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Nueva acción
            </Button>
          </div>

          {data.acciones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin acciones registradas</p>
          ) : (
            <div className="space-y-2">
              {data.acciones.map((accion: any) => {
                const tipoMeta = TIPO_ACCION_META[accion.tipo as TipoAccion] ?? { label: accion.tipo, icon: "•" };
                const estadoA = ESTADOS_ACCION_META[accion.estado as EstadoAccion];
                return (
                  <div
                    key={accion.id}
                    className="border border-border/50 rounded-lg p-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-base leading-none mt-0.5">{tipoMeta.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{accion.titulo}</p>
                          {accion.descripcion && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{accion.descripcion}</p>
                          )}
                          {accion.resultado && (
                            <p className="text-xs text-green-400 mt-0.5">→ {accion.resultado}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            {estadoA && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${estadoA.color}`}>
                                {estadoA.label}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(accion.createdAt).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => setAccionModal({ open: true, accion })}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteAccionId(accion.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {accionModal.open && (
        <AccionModal
          open
          onClose={() => setAccionModal({ open: false, accion: null })}
          expedienteId={expedienteId}
          accion={accionModal.accion}
          cazadores={cazadores}
          onSaved={() => refetch()}
        />
      )}

      {editExpediente && (
        <ExpedienteModal
          open
          onClose={() => setEditExpediente(false)}
          expediente={data}
          cazadores={cazadores}
          onSaved={() => { refetch(); onEdited(); }}
        />
      )}

      <AlertDialog open={deleteAccionId !== null} onOpenChange={(o) => !o && setDeleteAccionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar acción?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteAccionId) deleteAccionMut.mutate({ id: deleteAccionId });
                setDeleteAccionId(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
  const deleteMut = trpc.expedientes.delete.useMutation({ onSuccess: () => { refetch(); setSelectedId(null); } });

  const expedientes = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <AdminLayout title="Expedientes Operativos">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* List */}
        <div className={`flex flex-col border-r border-border/50 ${selectedId ? "w-96 shrink-0" : "flex-1"}`}>
          {/* Toolbar */}
          <div className="p-4 border-b border-border/50 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Expedientes Operativos</h1>
              <Button size="sm" onClick={() => setCreateModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Nuevo
              </Button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-sm"
                  placeholder="Buscar deudor, expediente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {Object.entries(ESTADO_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isLoading && (
              <p className="text-xs text-muted-foreground">{total} expediente{total !== 1 ? "s" : ""}</p>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : expedientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                <FileText className="w-8 h-8 opacity-40" />
                <p className="text-sm">Sin expedientes</p>
                <Button size="sm" variant="outline" onClick={() => setCreateModal(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Crear primero
                </Button>
              </div>
            ) : (
              expedientes.map((exp) => {
                const meta = ESTADO_META[exp.estado as EstadoExpediente] ?? { label: exp.estado, color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
                const isSelected = selectedId === exp.id;
                const recupe = parseFloat(exp.importeDeuda ?? "0") > 0
                  ? (parseFloat(exp.importeRecuperado ?? "0") / parseFloat(exp.importeDeuda)) * 100
                  : 0;

                return (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedId(isSelected ? null : exp.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border/30 hover:bg-muted/30 transition-colors ${isSelected ? "bg-muted/50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono text-muted-foreground">{exp.numeroExpediente}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                        </div>
                        <p className="font-medium text-sm truncate">{exp.deudorNombre}</p>
                        {exp.clienteNombre && (
                          <p className="text-xs text-muted-foreground truncate">{exp.clienteNombre}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-sm font-semibold">{fmtEuro(exp.importeDeuda)}</span>
                          {recupe > 0 && (
                            <span className="text-xs text-green-400">{recupe.toFixed(0)}% rec.</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                    {exp.progresoOperativo != null && exp.progresoOperativo > 0 && (
                      <div className="mt-2">
                        <ProgressBar value={exp.progresoOperativo} color="bg-cyan-500/60" />
                      </div>
                    )}
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

      {/* Create modal */}
      {createModal && (
        <ExpedienteModal
          open
          onClose={() => setCreateModal(false)}
          expediente={null}
          cazadores={cazadores}
          onSaved={() => refetch()}
        />
      )}

      {/* Delete confirm */}
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
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMut.mutate({ id: deleteId });
                setDeleteId(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
