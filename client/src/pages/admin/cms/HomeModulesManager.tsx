import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { LayoutGrid, CheckCircle, Loader2, ImageIcon } from "lucide-react";
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

          {/* URL de imagen */}
          <div className="mt-2 mb-3">
            <label className="block text-[11px] text-muted-foreground mb-1">URL de imagen de fondo</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... o /local-storage/..."
              className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#7ED957]/50"
            />
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
  const { data: blockImages, refetch } = trpc.homeModules.getBlockImages.useQuery(undefined, {
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

        {HOME_BLOCKS.map((block) => (
          <BlockEditor
            key={block.key}
            blockKey={block.key}
            label={block.label}
            description={block.description}
            currentImage={getVal(block.key, "image")}
            currentOpacity={parseFloat(getVal(block.key, "opacity") || "0")}
            onSaved={refetch}
          />
        ))}
      </div>
    </AdminLayout>
  );
}
