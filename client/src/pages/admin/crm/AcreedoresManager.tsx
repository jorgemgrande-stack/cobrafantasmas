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
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Search, Loader2, Edit2, Trash2, Building2, Mail, Phone, User, MapPin,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AcreedorFormData {
  nombre: string;
  nif: string;
  email: string;
  telefono: string;
  direccion: string;
  organizacion: string;
  notas: string;
}

const defaultForm = (): AcreedorFormData => ({
  nombre: "", nif: "", email: "", telefono: "",
  direccion: "", organizacion: "", notas: "",
});

// ─── Modal ────────────────────────────────────────────────────────────────────

function AcreedorModal({
  open, onClose, acreedor, onSaved,
}: {
  open: boolean; onClose: () => void; acreedor: any | null; onSaved: () => void;
}) {
  const isEdit = !!acreedor;
  const [form, setForm] = useState<AcreedorFormData>(() =>
    acreedor ? {
      nombre:       acreedor.nombre ?? "",
      nif:          acreedor.nif ?? "",
      email:        acreedor.email ?? "",
      telefono:     acreedor.telefono ?? "",
      direccion:    acreedor.direccion ?? "",
      organizacion: acreedor.organizacion ?? "",
      notas:        acreedor.notas ?? "",
    } : defaultForm()
  );

  const set = (key: keyof AcreedorFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const createMut = trpc.expedientes.createAcreedor.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const updateMut = trpc.expedientes.updateAcreedor.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const saving = createMut.isPending || updateMut.isPending;
  const error = createMut.error?.message || updateMut.error?.message;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nombre:       form.nombre,
      nif:          form.nif || undefined,
      email:        form.email || undefined,
      telefono:     form.telefono || undefined,
      direccion:    form.direccion || undefined,
      organizacion: form.organizacion || undefined,
      notas:        form.notas || undefined,
    };
    if (isEdit) {
      updateMut.mutate({ id: acreedor.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-[#0d0f14] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? `Editar acreedor — ${acreedor.nombre}` : "Nuevo acreedor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Nombre / Razón social *</Label>
              <Input value={form.nombre} onChange={set("nombre")} required className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Organización / Empresa</Label>
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
              {isEdit ? "Guardar cambios" : "Crear acreedor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AcreedoresManager() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; acreedor: any | null }>({ open: false, acreedor: null });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data = [], isLoading, refetch } = trpc.expedientes.listAcreedores.useQuery(
    { search: search || undefined },
    { refetchOnWindowFocus: false }
  );

  const deleteMut = trpc.expedientes.deleteAcreedor.useMutation({
    onSuccess: () => { refetch(); setDeleteId(null); },
  });

  const filtered = data;

  return (
    <AdminLayout title="Acreedores">
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#080a0e]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <div>
            <h1 className="text-lg font-bold">Acreedores</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.length} acreedor{data.length !== 1 ? "es" : ""} registrado{data.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setModal({ open: true, acreedor: null })}>
            <Plus className="w-3.5 h-3.5" /> Nuevo acreedor
          </Button>
        </div>

        {/* Buscador */}
        <div className="px-6 py-3 border-b border-white/[0.06] shrink-0">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Nombre, NIF, email, organización..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm bg-white/[0.03]"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Building2 className="w-10 h-10 text-white/10 mb-3" />
              <p className="text-muted-foreground text-sm">
                {search ? "Sin resultados para esa búsqueda" : "Aún no hay acreedores registrados"}
              </p>
              {!search && (
                <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setModal({ open: true, acreedor: null })}>
                  <Plus className="w-3.5 h-3.5" /> Crear el primero
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((a: any) => (
                <div key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group">

                  {/* Icono */}
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>

                  {/* Datos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{a.nombre}</p>
                      {a.organizacion && (
                        <span className="text-xs text-muted-foreground">{a.organizacion}</span>
                      )}
                      {a.nif && (
                        <span className="text-[10px] font-mono text-muted-foreground/60 bg-white/[0.04] px-1.5 py-0.5 rounded">
                          {a.nif}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {a.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />{a.email}
                        </span>
                      )}
                      {a.telefono && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />{a.telefono}
                        </span>
                      )}
                      {a.direccion && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-xs">
                          <MapPin className="w-3 h-3 shrink-0" />{a.direccion}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {new Date(a.createdAt).toLocaleDateString("es-ES")}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={() => setModal({ open: true, acreedor: a })}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                      onClick={() => setDeleteId(a.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal.open && (
        <AcreedorModal
          open
          onClose={() => setModal({ open: false, acreedor: null })}
          acreedor={modal.acreedor}
          onSaved={() => refetch()}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar acreedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Se desvinculará de todos los expedientes asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteMut.mutate({ id: deleteId }); }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
