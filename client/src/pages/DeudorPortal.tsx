import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle2, MessageSquarePlus, ChevronDown } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  pendiente_activacion: { label: "Gestión en curso",      color: "text-zinc-400"  },
  estrategia_inicial:   { label: "Gestión en curso",      color: "text-zinc-400"  },
  operativo_activo:     { label: "Proceso activo",        color: "text-cyan-400"  },
  negociacion:          { label: "En negociación",        color: "text-blue-400"  },
  acuerdo_parcial:      { label: "Acuerdo en progreso",   color: "text-indigo-400"},
  recuperacion_parcial: { label: "Pago parcial recibido", color: "text-emerald-400"},
  recuperado:           { label: "Deuda saldada",         color: "text-green-400" },
  incobrable:           { label: "Cerrado",               color: "text-zinc-500"  },
  suspendido:           { label: "Suspendido",            color: "text-zinc-400"  },
  escalada_juridica:    { label: "Proceso legal activo",  color: "text-red-400"   },
  finalizado:           { label: "Finalizado",            color: "text-zinc-400"  },
};

function fmtEuro(v: string | number | null | undefined) {
  if (v == null) return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? "—" : new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Formulario de propuesta ──────────────────────────────────────────────────

function PropuestaForm({ token, onSuccess }: { token: string; onSuccess: () => void }) {
  const [nombre,   setNombre]   = useState("");
  const [email,    setEmail]    = useState("");
  const [telefono, setTelefono] = useState("");
  const [importe,  setImporte]  = useState("");
  const [texto,    setTexto]    = useState("");
  const [error,    setError]    = useState("");

  const mut = trpc.expedientes.deudorProponerPago.useMutation({
    onSuccess: () => { onSuccess(); },
    onError: (e) => setError(e.message),
  });

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (!nombre.trim() || !texto.trim()) {
      setError("El nombre y la propuesta son obligatorios.");
      return;
    }
    mut.mutate({
      token,
      nombre:    nombre.trim(),
      email:     email.trim() || undefined,
      telefono:  telefono.trim() || undefined,
      propuesta: texto.trim(),
      importe:   importe ? parseFloat(importe) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Nombre completo *</label>
          <Input
            value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre" required
            className="bg-white/[0.04] border-white/[0.08] text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Importe que propones (€)</label>
          <Input
            type="number" step="0.01" min="0"
            value={importe} onChange={e => setImporte(e.target.value)}
            placeholder="0.00"
            className="bg-white/[0.04] border-white/[0.08] text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Email de contacto</label>
          <Input
            type="email"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="bg-white/[0.04] border-white/[0.08] text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Teléfono</label>
          <Input
            value={telefono} onChange={e => setTelefono(e.target.value)}
            placeholder="+34 600 000 000"
            className="bg-white/[0.04] border-white/[0.08] text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Tu propuesta *</label>
        <Textarea
          value={texto} onChange={e => setTexto(e.target.value)}
          placeholder="Explica tu situación y propón un plan de pago: plazos, importes, fechas..."
          rows={5}
          className="bg-white/[0.04] border-white/[0.08] text-sm resize-none"
          required
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}

      <Button
        type="submit" disabled={mut.isPending}
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
      >
        {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquarePlus className="w-4 h-4 mr-2" />}
        Enviar propuesta
      </Button>
    </form>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function DeudorPortal() {
  const [, params] = useRoute("/deudor/:token");
  const token = params?.token ?? "";

  const [showForm,    setShowForm]    = useState(false);
  const [enviado,     setEnviado]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data, isLoading, isError } = trpc.expedientes.publicDeudorLanding.useQuery(
    { token },
    { enabled: !!token, retry: false },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">👻</div>
          <h1 className="text-xl font-bold text-white mb-2">Enlace no válido</h1>
          <p className="text-sm text-zinc-400">
            Este enlace no existe o ha sido revocado. Si crees que es un error,
            contacta con nosotros a través de los datos que te proporcionamos.
          </p>
        </div>
      </div>
    );
  }

  const estadoInfo = ESTADO_LABEL[data.estado ?? ""] ?? { label: data.estado, color: "text-zinc-400" };
  const importeDeuda      = parseFloat(String(data.importeDeuda ?? "0"));
  const importeRecuperado = parseFloat(String(data.importeRecuperado ?? "0"));
  const pendiente = Math.max(0, importeDeuda - importeRecuperado);
  const porcentaje = importeDeuda > 0 ? Math.min(100, Math.round((importeRecuperado / importeDeuda) * 100)) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
              👻
            </div>
            <span className="font-semibold text-sm">Cobrafantasmas</span>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{data.numeroExpediente}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* Estado */}
        <div className="text-center space-y-2">
          <p className={`text-sm font-medium ${estadoInfo.color}`}>{estadoInfo.label}</p>
          <h1 className="text-3xl font-bold">Tu expediente de deuda</h1>
          <p className="text-sm text-zinc-400">
            Tienes acceso a la información de tu deuda y puedes enviarnos una propuesta de pago.
          </p>
        </div>

        {/* Tarjetas métricas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">Deuda total</p>
            <p className="text-lg font-bold text-red-400">{fmtEuro(data.importeDeuda)}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">Ya saldado</p>
            <p className="text-lg font-bold text-green-400">{fmtEuro(data.importeRecuperado)}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">Pendiente</p>
            <p className="text-lg font-bold text-amber-400">{fmtEuro(pendiente)}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        {importeDeuda > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Progreso de pago</span>
              <span>{porcentaje}%</span>
            </div>
            <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        )}

        {/* Info extra */}
        {(data.tipoDeuda || data.fechaApertura) && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {data.tipoDeuda && (
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-0.5">Tipo de deuda</p>
                <p className="font-medium capitalize">{data.tipoDeuda}</p>
              </div>
            )}
            {data.fechaApertura && (
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-0.5">Expediente abierto</p>
                <p className="font-medium">{fmtDate(data.fechaApertura)}</p>
              </div>
            )}
          </div>
        )}

        {/* Historial de acuerdos */}
        {data.pagosAcordados.length > 0 && (
          <div className="border border-white/[0.06] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowHistory(h => !h)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/[0.02] transition-colors"
            >
              <span>Historial de negociaciones ({data.pagosAcordados.length})</span>
              <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showHistory ? "rotate-180" : ""}`} />
            </button>
            {showHistory && (
              <div className="divide-y divide-white/[0.04] border-t border-white/[0.06]">
                {data.pagosAcordados.map((p: any) => (
                  <div key={p.id} className="px-4 py-3 text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium">{p.titulo}</span>
                      <span className={`px-1.5 py-0.5 rounded-full border text-[10px] ${
                        p.estado === "completada" ? "text-green-400 bg-green-400/10 border-green-400/20" :
                        p.estado === "cancelada"  ? "text-red-400 bg-red-400/10 border-red-400/20" :
                        "text-zinc-400 bg-zinc-400/10 border-zinc-400/20"
                      }`}>
                        {p.estado === "completada" ? "Completado" : p.estado === "cancelada" ? "Cancelado" : "Pendiente"}
                      </span>
                    </div>
                    <p className="text-zinc-500">{fmtDate(p.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección propuesta */}
        <div className="border border-cyan-500/20 bg-cyan-500/[0.03] rounded-xl p-6 space-y-4">
          {enviado ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
              <h2 className="font-semibold text-lg">Propuesta enviada</h2>
              <p className="text-sm text-zinc-400">
                Hemos recibido tu propuesta. Nos pondremos en contacto contigo en los próximos días.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-white/[0.1] text-zinc-400 hover:text-white"
                onClick={() => { setEnviado(false); setShowForm(false); }}
              >
                Enviar otra propuesta
              </Button>
            </div>
          ) : showForm ? (
            <>
              <h2 className="font-semibold">Proponer un acuerdo de pago</h2>
              <p className="text-xs text-zinc-400">
                Cuéntanos tu situación y lo que puedes pagar. Estudiaremos tu caso.
              </p>
              <PropuestaForm token={token} onSuccess={() => setEnviado(true)} />
            </>
          ) : (
            <div className="text-center space-y-3">
              <h2 className="font-semibold text-lg">¿Quieres resolver esta deuda?</h2>
              <p className="text-sm text-zinc-400">
                Si deseas negociar un acuerdo de pago, puedes enviarnos una propuesta directamente desde aquí.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Proponer un acuerdo
              </Button>
            </div>
          )}
        </div>

        {/* Aviso legal */}
        <p className="text-center text-xs text-zinc-600">
          Este portal es gestionado por Cobrafantasmas en nombre del acreedor. Los datos tratados están
          protegidos conforme al RGPD (UE) 2016/679 y la LOPDGDD. Puedes ejercer tus derechos de
          acceso, rectificación y supresión escribiéndonos.
        </p>
      </main>
    </div>
  );
}
