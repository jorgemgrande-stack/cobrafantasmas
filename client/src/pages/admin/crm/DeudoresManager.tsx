import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Search, Loader2, Edit2, Trash2, UserX, Mail, Phone, MapPin,
  X, ChevronRight, AlertTriangle, ShieldCheck, ShieldOff, Shield,
} from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────────────────────

type NivelCooperacion = "desconocido" | "colaborador" | "evasivo" | "hostil" | "bloqueado";
type TipoContacto = "telefono" | "email" | "whatsapp" | "direccion" | "linkedin" | "otro";

const COOPERACION_META: Record<NivelCooperacion, { label: string; color: string; icon: React.ReactNode }> = {
  desconocido: { label: "Desconocido",  color: "text-slate-400 border-slate-500/30 bg-slate-500/10",  icon: <Shield className="w-3 h-3" /> },
  colaborador: { label: "Colaborador",  color: "text-green-400 border-green-500/30 bg-green-500/10",  icon: <ShieldCheck className="w-3 h-3" /> },
  evasivo:     { label: "Evasivo",      color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", icon: <AlertTriangle className="w-3 h-3" /> },
  hostil:      { label: "Hostil",       color: "text-orange-400 border-orange-500/30 bg-orange-500/10", icon: <ShieldOff className="w-3 h-3" /> },
  bloqueado:   { label: "Bloqueado",    color: "text-red-400 border-red-500/30 bg-red-500/10",         icon: <ShieldOff className="w-3 h-3" /> },
};

const TIPO_CONTACTO_META: Record<TipoContacto, { label: string; icon: React.ReactNode }> = {
  telefono:  { label: "Teléfono",  icon: <Phone className="w-3.5 h-3.5" /> },
  email:     { label: "Email",     icon: <Mail className="w-3.5 h-3.5" /> },
  whatsapp:  { label: "WhatsApp",  icon: <Phone className="w-3.5 h-3.5 text-emerald-400" /> },
  direccion: { label: "Dirección", icon: <MapPin className="w-3.5 h-3.5" /> },
  linkedin:  { label: "LinkedIn",  icon: <span className="text-xs font-bold text-blue-400">in</span> },
  otro:      { label: "Otro",      icon: <span className="text-xs">•</span> },
};

function fmtEuro(v: string | number | null | undefined) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })
    .format(parseFloat(String(v ?? "0")));
}

function RiesgoBar({ nivel }: { nivel: number }) {
  const color = nivel >= 80 ? "bg-red-500" : nivel >= 60 ? "bg-orange-500" : nivel >= 40 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${nivel}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-7 text-right">{nivel}%</span>
    </div>
  );
}

// ─── Modal deudor ─────────────────────────────────────────────────────────────

interface DeudorFormData {
  nombre: string; nif: string; email: string; telefono: string;
  direccion: string; organizacion: string; notas: string;
  nivelCooperacion: NivelCooperacion; nivelRiesgo: string;
  totalDeudaAcumulada: string;
}

const defaultForm = (): DeudorFormData => ({
  nombre: "", nif: "", email: "", telefono: "",
  direccion: "", organizacion: "", notas: "",
  nivelCooperacion: "desconocido", nivelRiesgo: "50", totalDeudaAcumulada: "0",
});

function DeudorModal({
  open, onClose, deudor, onSaved,
}: {
  open: boolean; onClose: () => void; deudor: any | null; onSaved: () => void;
}) {
  const isEdit = !!deudor;
  const [form, setForm] = useState<DeudorFormData>(() =>
    deudor ? {
      nombre:              deudor.nombre ?? "",
      nif:                 deudor.nif ?? "",
      email:               deudor.email ?? "",
      telefono:            deudor.telefono ?? "",
      direccion:           deudor.direccion ?? "",
      organizacion:        deudor.organizacion ?? "",
      notas:               deudor.notas ?? "",
      nivelCooperacion:    deudor.nivelCooperacion ?? "desconocido",
      nivelRiesgo:         String(deudor.nivelRiesgo ?? 50),
      totalDeudaAcumulada: String(deudor.totalDeudaAcumulada ?? "0"),
    } : defaultForm()
  );

  const set = (key: keyof DeudorFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const createMut = trpc.expedientes.createDeudor.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const updateMut = trpc.expedientes.updateDeudor.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const saving = createMut.isPending || updateMut.isPending;
  const error = createMut.error?.message || updateMut.error?.message;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nombre:              form.nombre,
      nif:                 form.nif || undefined,
      email:               form.email || undefined,
      telefono:            form.telefono || undefined,
      direccion:           form.direccion || undefined,
      organizacion:        form.organizacion || undefined,
      notas:               form.notas || undefined,
      nivelCooperacion:    form.nivelCooperacion,
      nivelRiesgo:         parseInt(form.nivelRiesgo) || 50,
      totalDeudaAcumulada: parseFloat(form.totalDeudaAcumulada) || 0,
    };
    if (isEdit) {
      updateMut.mutate({ id: deudor.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-[#0d0f14] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? `Editar deudor — ${deudor.nombre}` : "Nuevo deudor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Nombre completo / Razón social *</Label>
              <Input value={form.nombre} onChange={set("nombre")} required className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Organización</Label>
              <Input value={form.organizacion} onChange={set("organizacion")} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">NIF / CIF</Label>
              <Input value={form.nif} onChange={set("nif")} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={set("email")} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Teléfono</Label>
              <Input value={form.telefono} onChange={set("telefono")} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Dirección</Label>
              <Input value={form.direccion} onChange={set("direccion")} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Nivel de cooperación</Label>
              <Select
                value={form.nivelCooperacion}
                onValueChange={(v) => setForm((f) => ({ ...f, nivelCooperacion: v as NivelCooperacion }))}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(COOPERACION_META) as [NivelCooperacion, any][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Nivel de riesgo (0–100)</Label>
              <Input
                type="number" min="0" max="100"
                value={form.nivelRiesgo} onChange={set("nivelRiesgo")} className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Deuda total acumulada (€)</Label>
              <Input
                type="number" min="0" step="0.01"
                value={form.totalDeudaAcumulada} onChange={set("totalDeudaAcumulada")} className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Notas internas</Label>
              <Textarea value={form.notas} onChange={set("notas")} rows={3} className="mt-1 resize-none text-sm" />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear deudor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Panel de detalle del deudor ──────────────────────────────────────────────

function DeudorDetail({
  deudorId, onClose,
}: {
  deudorId: number; onClose: () => void;
}) {
  const { data, isLoading, refetch } = trpc.expedientes.getDeudor.useQuery({ id: deudorId });
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ tipo: "telefono" as TipoContacto, valor: "", isPrimary: false });

  const addContactMut = trpc.expedientes.addDeudorContacto.useMutation({
    onSuccess: () => { refetch(); setAddContactOpen(false); setContactForm({ tipo: "telefono", valor: "", isPrimary: false }); },
  });
  const deleteContactMut = trpc.expedientes.deleteDeudorContacto.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
  if (!data) return null;

  const coop = COOPERACION_META[data.nivelCooperacion as NivelCooperacion] ?? COOPERACION_META.desconocido;

  return (
    <div className="flex flex-col h-full bg-[#0a0c10]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-base leading-tight">{data.nombre}</h2>
            {data.organizacion && (
              <p className="text-xs text-muted-foreground mt-0.5">{data.organizacion}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${coop.color}`}>
                {coop.icon}{coop.label}
              </span>
              {data.nif && (
                <span className="text-[10px] font-mono text-muted-foreground/60 bg-white/[0.04] px-1.5 py-0.5 rounded">{data.nif}</span>
              )}
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Deuda acumulada</p>
            <p className="text-base font-bold text-red-400 mt-0.5">{fmtEuro(data.totalDeudaAcumulada)}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Nivel de riesgo</p>
            <div className="mt-1.5">
              <RiesgoBar nivel={data.nivelRiesgo ?? 50} />
            </div>
          </div>
        </div>

        {/* Datos de contacto primario */}
        {(data.email || data.telefono || data.direccion) && (
          <div className="space-y-1.5">
            {data.telefono && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-green-400" />{data.telefono}
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-blue-400" />{data.email}
              </div>
            )}
            {data.direccion && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />{data.direccion}
              </div>
            )}
          </div>
        )}

        {/* Contactos adicionales */}
        <div className="border border-white/[0.06] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contactos adicionales</p>
            <Button
              size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2"
              onClick={() => setAddContactOpen(!addContactOpen)}
            >
              <Plus className="w-3 h-3" /> Añadir
            </Button>
          </div>

          {addContactOpen && (
            <div className="border border-white/[0.06] rounded-lg p-3 space-y-2 bg-white/[0.02]">
              <div className="grid grid-cols-2 gap-2">
                <Select value={contactForm.tipo} onValueChange={(v) => setContactForm((f) => ({ ...f, tipo: v as TipoContacto }))}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(TIPO_CONTACTO_META) as [TipoContacto, any][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Valor..."
                  value={contactForm.valor}
                  onChange={(e) => setContactForm((f) => ({ ...f, valor: e.target.value }))}
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setAddContactOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  size="sm" className="h-6 text-xs px-2"
                  disabled={!contactForm.valor || addContactMut.isPending}
                  onClick={() => addContactMut.mutate({ deudorId: data.id, tipo: contactForm.tipo, valor: contactForm.valor })}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}

          {(data as any).contactos?.length > 0 ? (
            <div className="space-y-1.5">
              {(data as any).contactos.map((c: any) => {
                const meta = TIPO_CONTACTO_META[c.tipo as TipoContacto] ?? TIPO_CONTACTO_META.otro;
                return (
                  <div key={c.id} className="flex items-center gap-2 text-sm text-muted-foreground group">
                    <span className="text-muted-foreground/60 shrink-0">{meta.icon}</span>
                    <span className="text-[10px] text-muted-foreground/60 uppercase shrink-0 w-16">{meta.label}</span>
                    <span className="flex-1 truncate">{c.valor}</span>
                    <Button
                      size="sm" variant="ghost"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                      onClick={() => deleteContactMut.mutate({ id: c.id })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/50">Sin contactos adicionales</p>
          )}
        </div>

        {/* Notas */}
        {data.notas && (
          <div className="border border-white/[0.06] rounded-xl p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Notas internas</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.notas}</p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/40 text-center">
          Registrado: {new Date(data.createdAt).toLocaleString("es-ES")}
        </p>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function DeudoresManager() {
  const [search, setSearch] = useState("");
  const [cooperacionFilter, setCooperacionFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modal, setModal] = useState<{ open: boolean; deudor: any | null }>({ open: false, deudor: null });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data = [], isLoading, refetch } = trpc.expedientes.listDeudores.useQuery(
    { search: search || undefined },
    { refetchOnWindowFocus: false }
  );

  const filtered = cooperacionFilter
    ? data.filter((d: any) => d.nivelCooperacion === cooperacionFilter)
    : data;

  return (
    <AdminLayout title="Deudores">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#080a0e]">

        {/* Lista */}
        <div className={`flex flex-col border-r border-white/[0.06] transition-all ${selectedId ? "w-[400px] shrink-0" : "flex-1"}`}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
            <div>
              <h1 className="text-lg font-bold">Deudores</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filtered.length} de {data.length} deudor{data.length !== 1 ? "es" : ""}
              </p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => setModal({ open: true, deudor: null })}>
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.06] shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Nombre, NIF, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm bg-white/[0.03]"
              />
            </div>
            <Select value={cooperacionFilter || "all"} onValueChange={(v) => setCooperacionFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Cooperación" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(Object.entries(COOPERACION_META) as [NivelCooperacion, any][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <UserX className="w-10 h-10 text-white/10 mb-3" />
                <p className="text-muted-foreground text-sm">
                  {search || cooperacionFilter ? "Sin resultados" : "Aún no hay deudores registrados"}
                </p>
                {!search && !cooperacionFilter && (
                  <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setModal({ open: true, deudor: null })}>
                    <Plus className="w-3.5 h-3.5" /> Registrar el primero
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filtered.map((d: any) => {
                  const coop = COOPERACION_META[d.nivelCooperacion as NivelCooperacion] ?? COOPERACION_META.desconocido;
                  const isSelected = selectedId === d.id;
                  return (
                    <div
                      key={d.id}
                      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors group ${
                        isSelected ? "bg-white/[0.04] border-l-2 border-l-orange-500" : "hover:bg-white/[0.02]"
                      }`}
                      onClick={() => setSelectedId(isSelected ? null : d.id)}
                    >
                      {/* Icono cooperación */}
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${coop.color}`}>
                        {coop.icon}
                      </div>

                      {/* Datos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{d.nombre}</p>
                          {d.nif && (
                            <span className="text-[10px] font-mono text-muted-foreground/60 bg-white/[0.04] px-1.5 py-0.5 rounded">{d.nif}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`text-[10px] font-medium ${coop.color.split(" ")[0]}`}>{coop.label}</span>
                          {parseFloat(d.totalDeudaAcumulada ?? "0") > 0 && (
                            <span className="text-xs text-red-400">{fmtEuro(d.totalDeudaAcumulada)}</span>
                          )}
                          <div className="flex-1 max-w-[80px]">
                            <RiesgoBar nivel={d.nivelRiesgo ?? 50} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            size="sm" variant="ghost" className="h-7 w-7 p-0"
                            onClick={(e) => { e.stopPropagation(); setModal({ open: true, deudor: d }); }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(d.id); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel detalle */}
        {selectedId !== null && (
          <div className="flex-1 overflow-hidden">
            <DeudorDetail deudorId={selectedId} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>

      {modal.open && (
        <DeudorModal
          open
          onClose={() => setModal({ open: false, deudor: null })}
          deudor={modal.deudor}
          onSaved={() => refetch()}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar deudor?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará junto con todos sus contactos adicionales. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
