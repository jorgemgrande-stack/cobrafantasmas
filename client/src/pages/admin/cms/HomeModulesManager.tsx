import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { LayoutGrid, CheckCircle, Loader2, ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

// ─── Secciones de la home de Cobrafantasmas ──────────────────────────────────
const HOME_BLOCKS = [
  { key: "problemas",     label: "El problema",         description: "Sección '¿Cuál es tu problema?'" },
  { key: "que-es",        label: "Qué es Cobrafantasmas", description: "Sección de presentación de la empresa" },
  { key: "como-funciona", label: "Cómo funciona",        description: "Timeline de 4 pasos del proceso" },
  { key: "protocolos",    label: "Protocolos",           description: "Tarjetas de protocolos disponibles" },
  { key: "ia",            label: "IA y tecnología",      description: "Sección de capacidades de IA" },
  { key: "precios",       label: "Modelo de precios",    description: "Sección de tarifas y comisiones" },
  { key: "faq",           label: "FAQ",                  description: "Preguntas frecuentes" },
  { key: "cta-final",     label: "CTA final",            description: "Bloque de cierre con botón de acción" },
];

// ─── Editor de imagen de fondo para un bloque ────────────────────────────────
function BlockEditor({
  blockKey,
  label,
  description,
  currentImage,
  currentOpacity,
  onSaved,
}: {
  blockKey: string;
  label: string;
  description: string;
  currentImage: string;
  currentOpacity: number;
  onSaved: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(currentImage);
  const [opacity, setOpacity] = useState(currentOpacity);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setBlockImage = trpc.homeModules.setBlockImage.useMutation({
    onSuccess: () => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    },
    onError: (e) => {
      setSaving(false);
      toast.error("Error al guardar: " + e.message);
    },
  });

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    setBlockImage.mutate({ blockKey, imageUrl, opacity });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Error al subir");
      const { url } = await res.json();
      setImageUrl(url);
      toast.success("Imagen subida correctamente");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const opacityPct = Math.round(opacity * 100);

  return (
    <div className="bg-muted/20 border border-border/50 rounded-xl p-5 mb-4">
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div
          className="w-24 h-16 rounded-lg border border-border shrink-0 overflow-hidden bg-[#0A0A0A] flex items-center justify-center"
          style={{ position: "relative" }}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity }}
              />
              <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.4)" }} />
            </>
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
          )}
        </div>

        {/* Controles */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              <p className="text-[11px] text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              {saving && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Guardando…
                </span>
              )}
              {saved && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> Guardado
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#7ED957] hover:bg-[#6bc948] disabled:opacity-50 text-black text-xs font-bold px-4 py-1.5 rounded-md transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>

          {/* Subida de imagen */}
          <div className="mt-2 mb-3">
            <label className="block text-[11px] text-muted-foreground mb-1">Imagen de fondo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={handleFileChange}
            />
            {imageUrl ? (
              <div className="flex items-center gap-2">
                <span className="flex-1 text-xs text-foreground/70 truncate bg-background border border-border rounded-md px-3 py-1.5">
                  {imageUrl.split("/").pop()}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="shrink-0 flex items-center gap-1 bg-background border border-border hover:border-[#7ED957]/60 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="shrink-0 p-1.5 rounded-md border border-border hover:border-red-500/60 text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-[#7ED957]/50 rounded-md py-3 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Subir imagen</>
                )}
              </button>
            )}
          </div>

          {/* Slider de opacidad */}
          <div className="flex items-center gap-3">
            <label className="text-[11px] text-muted-foreground whitespace-nowrap">
              Opacidad: <span className="font-semibold text-foreground">{opacityPct}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={opacityPct}
              onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              className="flex-1 h-1.5 accent-[#7ED957]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function HomeModulesManager() {
  const { data: blockImages, refetch, isLoading } = trpc.homeModules.getBlockImages.useQuery(undefined, {
    staleTime: 0,
  });

  const getVal = (blockKey: string, field: "image" | "opacity") => {
    const key = `home_block__${blockKey}__${field}`;
    return blockImages?.[key] ?? "";
  };

  return (
    <AdminLayout title="Fondos de secciones">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/50">
          <div className="p-2.5 rounded-xl bg-[#7ED957]/15 border border-[#7ED957]/25">
            <LayoutGrid className="w-5 h-5 text-[#7ED957]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-none">Fondos de secciones</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Configura la imagen de fondo y su transparencia para cada sección de la página principal.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          HOME_BLOCKS.map((block) => (
            <BlockEditor
              key={block.key}
              blockKey={block.key}
              label={block.label}
              description={block.description}
              currentImage={getVal(block.key, "image")}
              currentOpacity={parseFloat(getVal(block.key, "opacity") || "0")}
              onSaved={refetch}
            />
          ))
        )}
      </div>
    </AdminLayout>
  );
}
