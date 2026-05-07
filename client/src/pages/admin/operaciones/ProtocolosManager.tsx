import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Trash2, Edit2, Loader2, GripVertical, ChevronDown, ChevronUp,
  Zap, Eye, EyeOff,
} from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────────────────────

type ProtocoloTipo = "persistente" | "radar" | "reactivacion" | "intensivo" | "presencial";

const TIPO_META: Record<ProtocoloTipo, { label: string; color: string; icon: string; desc: string }> = {
  persistente:  { label: "Persistente",  color: "text-blue-400   border-blue-500/30   bg-blue-500/10",   icon: "🔁", desc: "Contacto regular sostenido en el tiempo" },
  radar:        { label: "Radar",        color: "text-cyan-400   border-cyan-500/30   bg-cyan-500/10",   icon: "📡", desc: "Vigilancia y recopilación de información" },
  reactivacion: { label: "Reactivación", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", icon: "⚡", desc: "Despertar casos dormidos o bloqueados" },
  intensivo:    { label: "Intensivo",    color: "text-orange-400 border-orange-500/30 bg-orange-500/10", icon: "🔥", desc: "Alta frecuencia de contacto y presión" },
  presencial:   { label: "Presencial",   color: "text-red-400    border-red-500/30    bg-red-500/10",    icon: "🚶", desc: "Visitas y operaciones en campo" },
};

const TIPOS_ACCION = [
  "llamada","whatsapp","email","visita","negociacion",
  "acuerdo","seguimiento","investigacion","requerimiento",
  "accion_sorpresa","escalada","hito","nota",
] as const;

type PasoForm = {
  titulo:          string;
  tipo:            string;
  diasDesdeInicio: string;
  descripcion:     string;
  prioridad:       "baja" | "media" | "alta" | "critica";
};

const defaultPaso = (): PasoForm => ({
  titulo: "", tipo: "llamada", diasDesdeInicio: "0",
  descripcion: "", prioridad: "media",
});

// ─── Modal ────────────────────────────────────────────────────────────────────

function ProtocoloModal({
  open, onClose, protocolo, onSaved,
}: {
  open: boolean; onClose: () => void; protocolo: any | null; onSaved: () => void;
}) {
  const isEdit = !!protocolo;
  const [nombre,   setNombre]   = useState(protocolo?.nombre   ?? "");
  const [tipo,     setTipo]     = useState<ProtocoloTipo>(protocolo?.tipo ?? "persistente");
  const [desc,     setDesc]     = useState(protocolo?.descripcion ?? "");
  const [intensidad, setIntensidad] = useState(String(protocolo?.intensidadRecomendada ?? "2"));
  const [duracion,   setDuracion]   = useState(String(protocolo?.duracionDias ?? "30"));
  const [pasos,    setPasos]    = useState<PasoForm[]>(() =>
    protocolo?.pasos?.map((p: any) => ({
      titulo:          p.titulo ?? "",
      tipo:            p.tipo   ?? "nota",
      diasDesdeInicio: String(p.diasDesdeInicio ?? 0),
      descripcion:     p.descripcion ?? "",
      prioridad:       p.prioridad   ?? "media",
    })) ?? [defaultPaso()]
  );

  const createMut = trpc.protocolos.create.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const updateMut = trpc.protocolos.update.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const saving = createMut.isPending || updateMut.isPending;
  const err = createMut.error?.message || updateMut.error?.message;

  function addPaso() { setPasos((p) => [...p, defaultPaso()]); }
  function removePaso(i: number) { setPasos((p) => p.filter((_, idx) => idx !== i)); }
  function movePaso(i: number, dir: -1 | 1) {
    setPasos((p) => {
      const arr = [...p];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }
  function setPaso(i: number, key: keyof PasoForm, val: string) {
    setPasos((p) => p.map((paso, idx) => idx === i ? { ...paso, [key]: val } : paso));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nombre,
      tipo,
      descripcion:           desc || undefined,
      intensidadRecomendada: parseInt(intensidad) || 2,
      duracionDias:          parseInt(duracion)   || 30,
      activo:                true,
      pasos: pasos.map((p) => ({
        titulo:          p.titulo,
        tipo:            p.tipo,
        diasDesdeInicio: parseInt(p.diasDesdeInicio) || 0,
        descripcion:     p.descripcion || undefined,
        prioridad:       p.prioridad,
      })),
    };
    if (isEdit) {
      updateMut.mutate({ id: protocolo.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  }

  const tipoMeta = TIPO_META[tipo];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0f14] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? `Editar — ${protocolo.nombre}` : "Nuevo protocolo de recobro"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">

          {/* Info básica */}
          <section className="border border-white/[0.06] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Definición</p>
            <div>
              <Label className="text-xs">Nombre *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required className="mt-1" placeholder="Protocolo Persistente 30d" />
            </div>

            {/* Tipo */}
            <div>
              <Label className="text-xs">Tipo de protocolo</Label>
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {(Object.keys(TIPO_META) as ProtocoloTipo[]).map((t) => {
                  const m = TIPO_META[t];
                  return (
                    <button key={t} type="button" onClick={() => setTipo(t)}
                      className={`rounded-lg border p-2 text-center transition-all ${
                        tipo === t ? `border-current ${m.color}` : "border-white/10 text-muted-foreground hover:border-white/20"
                      }`}>
                      <div className="text-xl">{m.icon}</div>
                      <div className="text-[9px] leading-tight mt-0.5">{m.label}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{tipoMeta.desc}</p>
            </div>

            <div>
              <Label className="text-xs">Descripción</Label>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className="mt-1 text-sm resize-none" placeholder="Qué hace este protocolo..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Intensidad recomendada (1-5)</Label>
                <Input type="number" min="1" max="5" value={intensidad} onChange={(e) => setIntensidad(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Duración estimada (días)</Label>
                <Input type="number" min="1" value={duracion} onChange={(e) => setDuracion(e.target.value)} className="mt-1" />
              </div>
            </div>
          </section>

          {/* Pasos */}
          <section className="border border-white/[0.06] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pasos del protocolo ({pasos.length})</p>
              <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addPaso}>
                <Plus className="w-3 h-3" /> Añadir paso
              </Button>
            </div>
            {pasos.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Sin pasos. Añade al menos uno.</p>
            )}
            <div className="space-y-2">
              {pasos.map((paso, i) => (
                <div key={i} className="border border-white/[0.06] rounded-lg p-3 space-y-2 bg-white/[0.01]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono w-5 shrink-0">{i + 1}</span>
                    <Input
                      value={paso.titulo}
                      onChange={(e) => setPaso(i, "titulo", e.target.value)}
                      placeholder="Título del paso *"
                      required
                      className="flex-1 h-7 text-xs"
                    />
                    <div className="flex gap-0.5 shrink-0">
                      <Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => movePaso(i, -1)} disabled={i === 0}>
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => movePaso(i, 1)} disabled={i === pasos.length - 1}>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => removePaso(i)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pl-7">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Tipo acción</Label>
                      <Select value={paso.tipo} onValueChange={(v) => setPaso(i, "tipo", v)}>
                        <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TIPOS_ACCION.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Día desde inicio</Label>
                      <Input type="number" min="0" value={paso.diasDesdeInicio}
                        onChange={(e) => setPaso(i, "diasDesdeInicio", e.target.value)}
                        className="h-7 text-xs mt-0.5" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Prioridad</Label>
                      <Select value={paso.prioridad} onValueChange={(v) => setPaso(i, "prioridad", v as any)}>
                        <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">⚠ Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pl-7">
                    <Input value={paso.descripcion} onChange={(e) => setPaso(i, "descripcion", e.target.value)}
                      placeholder="Descripción opcional..." className="h-7 text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {err && <p className="text-sm text-destructive">{err}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving || pasos.length === 0} size="sm">
              {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear protocolo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ProtocolosManager() {
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing,   setEditing]     = useState<any | null>(null);
  const [deleteId,  setDeleteId]    = useState<number | null>(null);
  const [expanded,  setExpanded]    = useState<number | null>(null);

  const { data: lista = [], isLoading, refetch } = trpc.protocolos.list.useQuery();
  const { data: detail } = trpc.protocolos.get.useQuery(
    { id: expanded! },
    { enabled: expanded !== null }
  );

  const deleteMut = trpc.protocolos.delete.useMutation({
    onSuccess: () => { refetch(); setDeleteId(null); },
  });
  const toggleMut = trpc.protocolos.toggleActivo.useMutation({ onSuccess: () => refetch() });

  function openEdit(p: any) {
    setExpanded(p.id);
    setEditing(p);
    setModalOpen(true);
  }

  return (
    <AdminLayout title="Protocolos de Recobro">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Protocolos de recobro</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Plantillas de secuencias operativas reutilizables
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4" /> Nuevo protocolo
          </Button>
        </div>

        {/* Tipos overview */}
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(TIPO_META) as ProtocoloTipo[]).map((t) => {
            const m = TIPO_META[t];
            const count = lista.filter((p: any) => p.tipo === t).length;
            return (
              <div key={t} className={`rounded-xl border p-3 text-center ${m.color}`}>
                <div className="text-2xl mb-1">{m.icon}</div>
                <p className="text-xs font-bold">{m.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{count} protocolo{count !== 1 ? "s" : ""}</p>
              </div>
            );
          })}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm">Sin protocolos definidos</p>
            <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Crear primer protocolo
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {lista.map((p: any) => {
              const meta = TIPO_META[p.tipo as ProtocoloTipo] ?? TIPO_META.persistente;
              const isExpanded = expanded === p.id;
              const pasos = (detail && detail.id === p.id ? detail.pasos : null) as any[] | null;

              return (
                <div key={p.id} className={`border rounded-xl overflow-hidden transition-all ${p.activo ? "border-white/[0.07]" : "border-white/[0.03] opacity-50"}`}>
                  <div className="flex items-center gap-3 p-4">
                    <span className="text-2xl shrink-0">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{p.nombre}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${meta.color}`}>{meta.label}</span>
                        {!p.activo && <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-zinc-500/30 text-zinc-400 bg-zinc-500/10">Inactivo</span>}
                      </div>
                      {p.descripcion && <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.descripcion}</p>}
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>Intensidad {p.intensidadRecomendada}/5</span>
                        <span>{p.duracionDias}d estimados</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground"
                        title={isExpanded ? "Ocultar pasos" : "Ver pasos"}
                        onClick={() => setExpanded(isExpanded ? null : p.id)}>
                        {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        onClick={() => toggleMut.mutate({ id: p.id, activo: !p.activo })}>
                        <Zap className={`w-3.5 h-3.5 ${p.activo ? "text-yellow-400" : "text-muted-foreground"}`} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(p)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Pasos expandidos */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.05] bg-white/[0.01] px-4 py-3">
                      {!pasos ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando pasos...
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {pasos.map((paso: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 text-xs">
                              <span className="w-5 h-5 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 text-[10px] font-bold text-muted-foreground mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium">{paso.titulo}</span>
                                {paso.descripcion && <span className="text-muted-foreground ml-1.5">{paso.descripcion}</span>}
                              </div>
                              <span className="text-muted-foreground shrink-0">Día {paso.diasDesdeInicio}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <ProtocoloModal
          open
          onClose={() => { setModalOpen(false); setEditing(null); }}
          protocolo={editing && detail?.id === editing.id ? detail : editing}
          onSaved={() => refetch()}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar protocolo?</AlertDialogTitle>
            <AlertDialogDescription>
              Solo se puede eliminar si no tiene expedientes activos asignados.
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
