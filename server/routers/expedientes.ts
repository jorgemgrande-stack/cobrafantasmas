import { z } from "zod";
import { router, adminProcedure, staffProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, desc, asc, like, or } from "drizzle-orm";
import {
  expedientes,
  accionesOperativas,
  documentCounters,
  monitors,
  expedienteAutomationLogs,
} from "../../drizzle/schema";
import { gte } from "drizzle-orm";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL!, connectionLimit: 3 });
const db = drizzle(pool);

// ─── Numeración automática ────────────────────────────────────────────────────

async function nextExpedienteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const rows = await db
    .select()
    .from(documentCounters)
    .where(
      and(
        eq(documentCounters.documentType, "expediente"),
        eq(documentCounters.year, year),
      ),
    )
    .limit(1);

  let nextNum: number;

  if (rows.length > 0) {
    nextNum = (rows[0].currentNumber ?? 0) + 1;
    await db
      .update(documentCounters)
      .set({ currentNumber: nextNum, updatedAt: new Date() })
      .where(eq(documentCounters.id, rows[0].id));
  } else {
    nextNum = 1;
    await db.insert(documentCounters).values({
      documentType: "expediente",
      year,
      currentNumber: 1,
      prefix: "EXP",
      updatedAt: new Date(),
    });
  }

  return `EXP-${String(nextNum).padStart(6, "0")}`;
}

// ─── Motor de automatizaciones auditables ─────────────────────────────────────

const ESTADO_ACCION_AUTO: Record<string, { titulo: string; tipo: string; descripcion: string }> = {
  estrategia_inicial:   { titulo: "Diseñar estrategia inicial",         tipo: "investigacion", descripcion: "Analizar el perfil del deudor y definir el enfoque operativo." },
  operativo_activo:     { titulo: "Iniciar contacto con el deudor",     tipo: "llamada",       descripcion: "Primer contacto operativo. Registrar resultado." },
  negociacion:          { titulo: "Preparar propuesta de negociación",  tipo: "negociacion",   descripcion: "Elaborar términos de acuerdo viables para ambas partes." },
  acuerdo_parcial:      { titulo: "Documentar acuerdo parcial",         tipo: "acuerdo",       descripcion: "Registrar condiciones del acuerdo y calendario de pagos." },
  recuperacion_parcial: { titulo: "Verificar pago parcial recibido",    tipo: "seguimiento",   descripcion: "Confirmar ingreso y actualizar importe recuperado." },
  recuperado:           { titulo: "Cierre operativo — deuda recuperada",tipo: "hito",          descripcion: "Misión completada. Proceder con factura de éxito." },
  escalada_juridica:    { titulo: "Preparar documentación jurídica",    tipo: "requerimiento", descripcion: "Recopilar evidencias y notificaciones para el proceso judicial." },
  suspendido:           { titulo: "Registrar motivo de suspensión",     tipo: "nota",          descripcion: "Documentar la causa de la suspensión del expediente." },
};

async function runAutomation(params: {
  expedienteId: number;
  trigger: string;
  triggerData: Record<string, unknown>;
  executedBy: string;
}): Promise<void> {
  const { expedienteId, trigger, triggerData, executedBy } = params;

  // Anti-duplicado: no ejecutar el mismo trigger sobre el mismo expediente en los últimos 10s
  const since = new Date(Date.now() - 10_000);
  const recent = await db
    .select({ id: expedienteAutomationLogs.id })
    .from(expedienteAutomationLogs)
    .where(
      and(
        eq(expedienteAutomationLogs.expedienteId, expedienteId),
        eq(expedienteAutomationLogs.trigger, trigger),
        gte(expedienteAutomationLogs.createdAt, since),
      )
    )
    .limit(1);

  if (recent.length > 0) {
    // Registrar skip sin crear nada
    await db.insert(expedienteAutomationLogs).values({
      expedienteId,
      trigger,
      triggerData: JSON.stringify(triggerData),
      actionType: "skip_duplicate",
      actionData: JSON.stringify({ reason: "duplicate within 10s" }),
      executedBy,
    });
    return;
  }

  // ── Trigger: expediente_created ──────────────────────────────────────────
  if (trigger === "expediente_created") {
    const modoOperacion = triggerData.modoOperacion as string;
    if (modoOperacion === "manual") {
      await db.insert(expedienteAutomationLogs).values({
        expedienteId, trigger,
        triggerData: JSON.stringify(triggerData),
        actionType: "skip_manual",
        actionData: JSON.stringify({ reason: "modo manual, sin automatización" }),
        executedBy,
      });
      return;
    }
    const [result] = await db.insert(accionesOperativas).values({
      expedienteId,
      tipo: "investigacion" as any,
      titulo: "Analizar perfil del deudor",
      descripcion: "Acción automática inicial. Investigar solvencia, localización y activos del deudor.",
      prioridad: "alta" as any,
      estado: "pendiente" as any,
      visibleCliente: false,
      notasInternas: "[AUTO] Creada automáticamente al abrir expediente.",
    });
    await db.insert(expedienteAutomationLogs).values({
      expedienteId, trigger,
      triggerData: JSON.stringify(triggerData),
      actionType: "create_accion",
      actionData: JSON.stringify({ accionId: (result as any).insertId, titulo: "Analizar perfil del deudor" }),
      executedBy,
    });
    return;
  }

  // ── Trigger: estado_changed ──────────────────────────────────────────────
  if (trigger === "estado_changed") {
    const nuevoEstado = triggerData.nuevoEstado as string;
    const autoAccion = ESTADO_ACCION_AUTO[nuevoEstado];

    if (!autoAccion) {
      await db.insert(expedienteAutomationLogs).values({
        expedienteId, trigger,
        triggerData: JSON.stringify(triggerData),
        actionType: "skip_no_rule",
        actionData: JSON.stringify({ reason: `sin regla para estado: ${nuevoEstado}` }),
        executedBy,
      });
      return;
    }

    const [result] = await db.insert(accionesOperativas).values({
      expedienteId,
      tipo: autoAccion.tipo as any,
      titulo: autoAccion.titulo,
      descripcion: autoAccion.descripcion,
      prioridad: (nuevoEstado === "escalada_juridica" ? "critica" : "alta") as any,
      estado: "pendiente" as any,
      visibleCliente: ["negociacion", "acuerdo_parcial", "recuperado"].includes(nuevoEstado),
      notasInternas: `[AUTO] Generada por cambio de estado → ${nuevoEstado}`,
    });
    await db.insert(expedienteAutomationLogs).values({
      expedienteId, trigger,
      triggerData: JSON.stringify(triggerData),
      actionType: "create_accion",
      actionData: JSON.stringify({ accionId: (result as any).insertId, titulo: autoAccion.titulo, estado: nuevoEstado }),
      executedBy,
    });
    return;
  }

  // ── Trigger: accion_completada ───────────────────────────────────────────
  if (trigger === "accion_completada") {
    const tipo = triggerData.tipo as string;

    // Si se completa una negociación → crear hito
    if (tipo === "negociacion") {
      const [result] = await db.insert(accionesOperativas).values({
        expedienteId,
        tipo: "hito" as any,
        titulo: "Negociación completada",
        descripcion: "Hito automático: se ha completado una acción de negociación.",
        prioridad: "alta" as any,
        estado: "completada" as any,
        visibleCliente: true,
        notasInternas: "[AUTO] Hito generado al completar negociación.",
      });
      await db.insert(expedienteAutomationLogs).values({
        expedienteId, trigger,
        triggerData: JSON.stringify(triggerData),
        actionType: "create_hito",
        actionData: JSON.stringify({ accionId: (result as any).insertId, titulo: "Negociación completada" }),
        executedBy,
      });
    }

    // Si se completa un acuerdo → crear acción de seguimiento de pago
    if (tipo === "acuerdo") {
      const [result] = await db.insert(accionesOperativas).values({
        expedienteId,
        tipo: "seguimiento" as any,
        titulo: "Seguimiento de pago acordado",
        descripcion: "Verificar que el pago se realiza según lo pactado.",
        prioridad: "alta" as any,
        estado: "pendiente" as any,
        visibleCliente: false,
        notasInternas: "[AUTO] Generada al completar acuerdo.",
      });
      await db.insert(expedienteAutomationLogs).values({
        expedienteId, trigger,
        triggerData: JSON.stringify(triggerData),
        actionType: "create_accion",
        actionData: JSON.stringify({ accionId: (result as any).insertId, titulo: "Seguimiento de pago acordado" }),
        executedBy,
      });
    }
    return;
  }
}

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const expedienteCreateInput = z.object({
  deudorNombre: z.string().min(2),
  deudorTelefono: z.string().optional(),
  deudorEmail: z.string().optional(),
  deudorDireccion: z.string().optional(),
  deudorNif: z.string().optional(),
  importeDeuda: z.number().min(0),
  porcentajeExito: z.number().min(0).max(100).default(20),
  tipoDeuda: z.string().optional(),
  clienteId: z.number().optional(),
  clienteNombre: z.string().optional(),
  cazadorId: z.number().optional(),
  modoOperacion: z.enum(["manual", "semi-automatico", "automatico"]).default("manual"),
  probabilidadRecuperacion: z.number().min(0).max(100).default(50),
  intensidadOperativa: z.number().min(1).max(5).default(1),
  fechaApertura: z.string().optional(),
  observacionesInternas: z.string().optional(),
});

const expedienteUpdateInput = expedienteCreateInput.partial().extend({
  id: z.number(),
  estado: z
    .enum([
      "pendiente_activacion",
      "estrategia_inicial",
      "operativo_activo",
      "negociacion",
      "acuerdo_parcial",
      "recuperacion_parcial",
      "recuperado",
      "incobrable",
      "suspendido",
      "escalada_juridica",
      "finalizado",
    ])
    .optional(),
  importeRecuperado: z.number().min(0).optional(),
  progresoOperativo: z.number().min(0).max(100).optional(),
  progresoFinanciero: z.number().min(0).max(100).optional(),
  progresoPsicologico: z.number().min(0).max(100).optional(),
  fechaCierre: z.string().optional(),
});

const accionCreateInput = z.object({
  expedienteId: z.number(),
  tipo: z.enum([
    "llamada",
    "whatsapp",
    "email",
    "visita",
    "negociacion",
    "acuerdo",
    "seguimiento",
    "investigacion",
    "requerimiento",
    "accion_sorpresa",
    "escalada",
    "hito",
    "nota",
  ]),
  titulo: z.string().min(1),
  descripcion: z.string().optional(),
  prioridad: z.enum(["baja", "media", "alta", "critica"]).default("media"),
  fechaProgramada: z.string().optional(),
  visibleCliente: z.boolean().default(false),
  cazadorId: z.number().optional(),
  notasInternas: z.string().optional(),
});

const accionUpdateInput = accionCreateInput.partial().extend({
  id: z.number(),
  estado: z
    .enum(["pendiente", "en_progreso", "completada", "cancelada"])
    .optional(),
  resultado: z.string().optional(),
  fechaCompletada: z.string().optional(),
});

// ─── Router ───────────────────────────────────────────────────────────────────

export const expedientesRouter = router({
  // ── Expedientes ────────────────────────────────────────────────────────────

  list: staffProcedure
    .input(
      z.object({
        search: z.string().optional(),
        estado: z.string().optional(),
        cazadorId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      let rows = await db
        .select()
        .from(expedientes)
        .orderBy(desc(expedientes.createdAt));

      if (input.estado) {
        rows = rows.filter((r) => r.estado === input.estado);
      }
      if (input.cazadorId) {
        rows = rows.filter((r) => r.cazadorId === input.cazadorId);
      }
      if (input.search) {
        const q = input.search.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.deudorNombre.toLowerCase().includes(q) ||
            r.numeroExpediente.toLowerCase().includes(q) ||
            (r.clienteNombre ?? "").toLowerCase().includes(q) ||
            (r.deudorNif ?? "").toLowerCase().includes(q),
        );
      }

      const total = rows.length;
      const paginated = rows.slice(input.offset, input.offset + input.limit);
      return { items: paginated, total };
    }),

  get: staffProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [exp] = await db
        .select()
        .from(expedientes)
        .where(eq(expedientes.id, input.id));
      if (!exp) throw new TRPCError({ code: "NOT_FOUND", message: "Expediente no encontrado" });

      const acciones = await db
        .select()
        .from(accionesOperativas)
        .where(eq(accionesOperativas.expedienteId, input.id))
        .orderBy(desc(accionesOperativas.createdAt));

      return { ...exp, acciones };
    }),

  create: staffProcedure
    .input(expedienteCreateInput)
    .mutation(async ({ input, ctx }) => {
      const numeroExpediente = await nextExpedienteNumber();
      const today = new Date().toISOString().slice(0, 10);

      const [result] = await db.insert(expedientes).values({
        numeroExpediente,
        estado: "pendiente_activacion",
        deudorNombre: input.deudorNombre,
        deudorTelefono: input.deudorTelefono,
        deudorEmail: input.deudorEmail,
        deudorDireccion: input.deudorDireccion,
        deudorNif: input.deudorNif,
        importeDeuda: String(input.importeDeuda),
        importeRecuperado: "0",
        porcentajeExito: String(input.porcentajeExito),
        tipoDeuda: input.tipoDeuda,
        clienteId: input.clienteId,
        clienteNombre: input.clienteNombre,
        cazadorId: input.cazadorId,
        modoOperacion: input.modoOperacion,
        probabilidadRecuperacion: input.probabilidadRecuperacion,
        intensidadOperativa: input.intensidadOperativa,
        progresoOperativo: 0,
        progresoFinanciero: 0,
        progresoPsicologico: 0,
        fechaApertura: input.fechaApertura ?? today,
        observacionesInternas: input.observacionesInternas,
      });

      const insertId = (result as any).insertId as number;
      const [created] = await db
        .select()
        .from(expedientes)
        .where(eq(expedientes.id, insertId));

      // Automatización: expediente creado
      runAutomation({
        expedienteId: insertId,
        trigger: "expediente_created",
        triggerData: { modoOperacion: input.modoOperacion, numeroExpediente: created?.numeroExpediente },
        executedBy: String(ctx.user.id),
      }).catch(() => {}); // fire-and-forget, no bloquea la respuesta

      return created;
    }),

  update: staffProcedure
    .input(expedienteUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const updateData: Record<string, unknown> = {};

      if (rest.deudorNombre !== undefined) updateData.deudorNombre = rest.deudorNombre;
      if (rest.deudorTelefono !== undefined) updateData.deudorTelefono = rest.deudorTelefono;
      if (rest.deudorEmail !== undefined) updateData.deudorEmail = rest.deudorEmail;
      if (rest.deudorDireccion !== undefined) updateData.deudorDireccion = rest.deudorDireccion;
      if (rest.deudorNif !== undefined) updateData.deudorNif = rest.deudorNif;
      if (rest.importeDeuda !== undefined) updateData.importeDeuda = String(rest.importeDeuda);
      if (rest.importeRecuperado !== undefined) updateData.importeRecuperado = String(rest.importeRecuperado);
      if (rest.porcentajeExito !== undefined) updateData.porcentajeExito = String(rest.porcentajeExito);
      if (rest.tipoDeuda !== undefined) updateData.tipoDeuda = rest.tipoDeuda;
      if (rest.clienteId !== undefined) updateData.clienteId = rest.clienteId;
      if (rest.clienteNombre !== undefined) updateData.clienteNombre = rest.clienteNombre;
      if (rest.cazadorId !== undefined) updateData.cazadorId = rest.cazadorId;
      if (rest.modoOperacion !== undefined) updateData.modoOperacion = rest.modoOperacion;
      if (rest.probabilidadRecuperacion !== undefined) updateData.probabilidadRecuperacion = rest.probabilidadRecuperacion;
      if (rest.intensidadOperativa !== undefined) updateData.intensidadOperativa = rest.intensidadOperativa;
      if (rest.estado !== undefined) updateData.estado = rest.estado;
      if (rest.progresoOperativo !== undefined) updateData.progresoOperativo = rest.progresoOperativo;
      if (rest.progresoFinanciero !== undefined) updateData.progresoFinanciero = rest.progresoFinanciero;
      if (rest.progresoPsicologico !== undefined) updateData.progresoPsicologico = rest.progresoPsicologico;
      if (rest.fechaApertura !== undefined) updateData.fechaApertura = rest.fechaApertura;
      if (rest.fechaCierre !== undefined) updateData.fechaCierre = rest.fechaCierre;
      if (rest.observacionesInternas !== undefined) updateData.observacionesInternas = rest.observacionesInternas;

      if (Object.keys(updateData).length === 0) return { success: true };

      await db
        .update(expedientes)
        .set(updateData)
        .where(eq(expedientes.id, id));

      const [updated] = await db
        .select()
        .from(expedientes)
        .where(eq(expedientes.id, id));

      // Automatización: cambio de estado
      if (rest.estado !== undefined) {
        runAutomation({
          expedienteId: id,
          trigger: "estado_changed",
          triggerData: { nuevoEstado: rest.estado, numeroExpediente: updated?.numeroExpediente },
          executedBy: String(ctx.user.id),
        }).catch(() => {});
      }

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .delete(accionesOperativas)
        .where(eq(accionesOperativas.expedienteId, input.id));
      await db.delete(expedientes).where(eq(expedientes.id, input.id));
      return { success: true };
    }),

  // ── Acciones operativas ────────────────────────────────────────────────────

  addAccion: staffProcedure
    .input(accionCreateInput)
    .mutation(async ({ input, ctx }) => {
      const fechaProgramada = input.fechaProgramada
        ? new Date(input.fechaProgramada)
        : null;

      const [result] = await db.insert(accionesOperativas).values({
        expedienteId: input.expedienteId,
        tipo: input.tipo,
        titulo: input.titulo,
        descripcion: input.descripcion,
        prioridad: input.prioridad,
        estado: "pendiente",
        fechaProgramada,
        visibleCliente: input.visibleCliente,
        cazadorId: input.cazadorId,
        notasInternas: input.notasInternas,
        createdBy: ctx.user.id,
      });

      const insertId = (result as any).insertId as number;
      const [created] = await db
        .select()
        .from(accionesOperativas)
        .where(eq(accionesOperativas.id, insertId));
      return created;
    }),

  updateAccion: staffProcedure
    .input(accionUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const updateData: Record<string, unknown> = {};

      if (rest.tipo !== undefined) updateData.tipo = rest.tipo;
      if (rest.titulo !== undefined) updateData.titulo = rest.titulo;
      if (rest.descripcion !== undefined) updateData.descripcion = rest.descripcion;
      if (rest.prioridad !== undefined) updateData.prioridad = rest.prioridad;
      if (rest.estado !== undefined) updateData.estado = rest.estado;
      if (rest.resultado !== undefined) updateData.resultado = rest.resultado;
      if (rest.visibleCliente !== undefined) updateData.visibleCliente = rest.visibleCliente;
      if (rest.cazadorId !== undefined) updateData.cazadorId = rest.cazadorId;
      if (rest.notasInternas !== undefined) updateData.notasInternas = rest.notasInternas;
      if (rest.fechaProgramada !== undefined)
        updateData.fechaProgramada = rest.fechaProgramada ? new Date(rest.fechaProgramada) : null;
      if (rest.fechaCompletada !== undefined)
        updateData.fechaCompletada = rest.fechaCompletada ? new Date(rest.fechaCompletada) : null;

      if (Object.keys(updateData).length > 0) {
        await db
          .update(accionesOperativas)
          .set(updateData)
          .where(eq(accionesOperativas.id, id));
      }

      const [updated] = await db
        .select()
        .from(accionesOperativas)
        .where(eq(accionesOperativas.id, id));

      // Automatización: acción completada
      if (rest.estado === "completada" && updated) {
        runAutomation({
          expedienteId: updated.expedienteId,
          trigger: "accion_completada",
          triggerData: { accionId: id, tipo: updated.tipo, titulo: updated.titulo },
          executedBy: String(ctx.user.id),
        }).catch(() => {});
      }

      return updated;
    }),

  deleteAccion: staffProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .delete(accionesOperativas)
        .where(eq(accionesOperativas.id, input.id));
      return { success: true };
    }),

  // ── Cazadores (monitors) para selector ────────────────────────────────────

  listCazadores: staffProcedure.query(async () => {
    return db
      .select({ id: monitors.id, fullName: monitors.fullName })
      .from(monitors)
      .where(eq(monitors.isActive, true))
      .orderBy(asc(monitors.fullName));
  }),

  // ── Landing token: generar enlace para el acreedor ───────────────────────

  generateLandingToken: staffProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const token = crypto.randomUUID().replace(/-/g, "");
      await db
        .update(expedientes)
        .set({ landingToken: token })
        .where(eq(expedientes.id, input.id));
      return { token };
    }),

  // ── Landing pública: vista del acreedor (sin auth) ────────────────────────

  publicLanding: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const [exp] = await db
        .select()
        .from(expedientes)
        .where(eq(expedientes.landingToken, input.token));

      if (!exp) throw new TRPCError({ code: "NOT_FOUND", message: "Expediente no encontrado" });

      // Solo acciones visibles para el cliente, sin notas internas ni cazador
      const acciones = await db
        .select({
          id:              accionesOperativas.id,
          tipo:            accionesOperativas.tipo,
          titulo:          accionesOperativas.titulo,
          descripcion:     accionesOperativas.descripcion,
          estado:          accionesOperativas.estado,
          fechaProgramada: accionesOperativas.fechaProgramada,
          fechaCompletada: accionesOperativas.fechaCompletada,
          createdAt:       accionesOperativas.createdAt,
        })
        .from(accionesOperativas)
        .where(
          and(
            eq(accionesOperativas.expedienteId, exp.id),
            eq(accionesOperativas.visibleCliente, true),
          )
        )
        .orderBy(asc(accionesOperativas.createdAt));

      // Datos seguros para el cliente — sin cazadorId, sin observacionesInternas, sin landingToken
      return {
        numeroExpediente:        exp.numeroExpediente,
        estado:                  exp.estado,
        deudorNombre:            exp.deudorNombre,
        importeDeuda:            exp.importeDeuda,
        importeRecuperado:       exp.importeRecuperado,
        porcentajeExito:         exp.porcentajeExito,
        probabilidadRecuperacion: exp.probabilidadRecuperacion,
        progresoOperativo:       exp.progresoOperativo,
        progresoFinanciero:      exp.progresoFinanciero,
        progresoPsicologico:     exp.progresoPsicologico,
        intensidadOperativa:     exp.intensidadOperativa,
        modoOperacion:           exp.modoOperacion,
        tipoDeuda:               exp.tipoDeuda,
        fechaApertura:           exp.fechaApertura,
        fechaCierre:             exp.fechaCierre,
        createdAt:               exp.createdAt,
        acciones,
      };
    }),

  // ── Audit log de automatizaciones ────────────────────────────────────────

  automationLogs: staffProcedure
    .input(z.object({ expedienteId: z.number(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(expedienteAutomationLogs)
        .where(eq(expedienteAutomationLogs.expedienteId, input.expedienteId))
        .orderBy(desc(expedienteAutomationLogs.createdAt))
        .limit(input.limit);
    }),

  revertAutomation: staffProcedure
    .input(z.object({ logId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const [log] = await db
        .select()
        .from(expedienteAutomationLogs)
        .where(eq(expedienteAutomationLogs.id, input.logId));

      if (!log) throw new TRPCError({ code: "NOT_FOUND", message: "Log no encontrado" });
      if (log.revertedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Ya fue revertido" });
      if (log.actionType !== "create_accion" && log.actionType !== "create_hito") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este tipo de acción no es reversible" });
      }

      const actionData = JSON.parse(log.actionData ?? "{}");
      if (actionData.accionId) {
        await db.delete(accionesOperativas).where(eq(accionesOperativas.id, actionData.accionId));
      }

      await db
        .update(expedienteAutomationLogs)
        .set({ revertedAt: new Date(), revertedBy: ctx.user.id })
        .where(eq(expedienteAutomationLogs.id, input.logId));

      return { success: true };
    }),

  // ── Agenda: acciones del día (para Actividades del Día) ───────────────────

  accionesForDate: staffProcedure
    .input(z.object({ date: z.string() })) // YYYY-MM-DD
    .query(async ({ input }) => {
      const dateStart = new Date(input.date + "T00:00:00");
      const dateEnd   = new Date(input.date + "T23:59:59");

      const rows = await db
        .select({
          id:              accionesOperativas.id,
          tipo:            accionesOperativas.tipo,
          titulo:          accionesOperativas.titulo,
          descripcion:     accionesOperativas.descripcion,
          prioridad:       accionesOperativas.prioridad,
          estado:          accionesOperativas.estado,
          fechaProgramada: accionesOperativas.fechaProgramada,
          visibleCliente:  accionesOperativas.visibleCliente,
          notasInternas:   accionesOperativas.notasInternas,
          expedienteId:    expedientes.id,
          numeroExpediente: expedientes.numeroExpediente,
          deudorNombre:    expedientes.deudorNombre,
          estadoExpediente: expedientes.estado,
          cazadorId:       accionesOperativas.cazadorId,
        })
        .from(accionesOperativas)
        .innerJoin(expedientes, eq(accionesOperativas.expedienteId, expedientes.id))
        .where(
          and(
            // @ts-ignore — drizzle timestamp comparison
            accionesOperativas.fechaProgramada >= dateStart,
            // @ts-ignore
            accionesOperativas.fechaProgramada <= dateEnd,
          )
        )
        .orderBy(asc(accionesOperativas.fechaProgramada));

      return rows;
    }),

  // ── Agenda: acciones por rango (para Calendario) ─────────────────────────

  accionesForRange: staffProcedure
    .input(z.object({ from: z.string(), to: z.string() })) // YYYY-MM-DD
    .query(async ({ input }) => {
      const dateStart = new Date(input.from + "T00:00:00");
      const dateEnd   = new Date(input.to   + "T23:59:59");

      const rows = await db
        .select({
          id:              accionesOperativas.id,
          tipo:            accionesOperativas.tipo,
          titulo:          accionesOperativas.titulo,
          fechaProgramada: accionesOperativas.fechaProgramada,
          estado:          accionesOperativas.estado,
          prioridad:       accionesOperativas.prioridad,
          expedienteId:    expedientes.id,
          numeroExpediente: expedientes.numeroExpediente,
          deudorNombre:    expedientes.deudorNombre,
          estadoExpediente: expedientes.estado,
        })
        .from(accionesOperativas)
        .innerJoin(expedientes, eq(accionesOperativas.expedienteId, expedientes.id))
        .where(
          and(
            // @ts-ignore
            accionesOperativas.fechaProgramada >= dateStart,
            // @ts-ignore
            accionesOperativas.fechaProgramada <= dateEnd,
          )
        )
        .orderBy(asc(accionesOperativas.fechaProgramada));

      // Agrupar por fecha YYYY-MM-DD para consumo del calendario
      const byDate: Record<string, typeof rows> = {};
      for (const row of rows) {
        if (!row.fechaProgramada) continue;
        const key = new Date(row.fechaProgramada).toISOString().slice(0, 10);
        if (!byDate[key]) byDate[key] = [];
        byDate[key].push(row);
      }
      return byDate;
    }),

  // ── Rankings y estadísticas globales ──────────────────────────────────────

  rankings: staffProcedure.query(async () => {
    const allExps = await db
      .select({
        id:               expedientes.id,
        cazadorId:        expedientes.cazadorId,
        estado:           expedientes.estado,
        importeDeuda:     expedientes.importeDeuda,
        importeRecuperado:expedientes.importeRecuperado,
        fechaApertura:    expedientes.fechaApertura,
        fechaCierre:      expedientes.fechaCierre,
        deudorNombre:     expedientes.deudorNombre,
        numeroExpediente: expedientes.numeroExpediente,
      })
      .from(expedientes)
      .orderBy(desc(expedientes.createdAt));

    const allCazadores = await db
      .select({ id: monitors.id, fullName: monitors.fullName })
      .from(monitors)
      .where(eq(monitors.isActive, true));

    const ESTADOS_ACTIVOS = [
      "pendiente_activacion", "estrategia_inicial", "operativo_activo",
      "negociacion", "acuerdo_parcial", "recuperacion_parcial", "escalada_juridica",
    ];

    type CazadorStats = {
      id: number; fullName: string;
      total: number; activos: number; cerrados: number;
      deudaTotal: number; recuperado: number;
      velocidades: number[];
    };

    const cazadorMap: Record<number, CazadorStats> = {};
    for (const c of allCazadores) {
      cazadorMap[c.id] = { id: c.id, fullName: c.fullName, total: 0, activos: 0, cerrados: 0, deudaTotal: 0, recuperado: 0, velocidades: [] };
    }
    cazadorMap[0] = { id: 0, fullName: "Sin asignar", total: 0, activos: 0, cerrados: 0, deudaTotal: 0, recuperado: 0, velocidades: [] };

    const estadoBreakdown: Record<string, number> = {};
    for (const exp of allExps) {
      const cid = exp.cazadorId ?? 0;
      const c = cazadorMap[cid] ?? cazadorMap[0];
      c.total++;
      c.deudaTotal += parseFloat(exp.importeDeuda ?? "0");
      c.recuperado += parseFloat(exp.importeRecuperado ?? "0");

      if (exp.estado === "recuperado") {
        c.cerrados++;
        if (exp.fechaApertura && exp.fechaCierre) {
          const days = Math.round(
            (new Date(exp.fechaCierre).getTime() - new Date(exp.fechaApertura).getTime()) / 86400000
          );
          if (days >= 0) c.velocidades.push(days);
        }
      } else if (ESTADOS_ACTIVOS.includes(exp.estado ?? "")) {
        c.activos++;
      }

      const est = exp.estado ?? "desconocido";
      estadoBreakdown[est] = (estadoBreakdown[est] ?? 0) + 1;
    }

    const cazadorRanking = Object.values(cazadorMap)
      .filter(c => c.total > 0)
      .map(c => ({
        id: c.id,
        fullName: c.fullName,
        total: c.total,
        activos: c.activos,
        cerrados: c.cerrados,
        deudaTotal: Math.round(c.deudaTotal * 100) / 100,
        recuperado: Math.round(c.recuperado * 100) / 100,
        efectividad: c.deudaTotal > 0 ? Math.round((c.recuperado / c.deudaTotal) * 10000) / 100 : 0,
        velocidadMedia: c.velocidades.length > 0
          ? Math.round(c.velocidades.reduce((a, b) => a + b, 0) / c.velocidades.length)
          : null,
      }))
      .sort((a, b) => b.recuperado - a.recuperado);

    const totalDeuda     = allExps.reduce((s, e) => s + parseFloat(e.importeDeuda ?? "0"), 0);
    const totalRecuperado = allExps.reduce((s, e) => s + parseFloat(e.importeRecuperado ?? "0"), 0);

    const ultimasRecuperaciones = allExps
      .filter(e => e.estado === "recuperado")
      .sort((a, b) => (b.fechaCierre ?? b.fechaApertura ?? "").localeCompare(a.fechaCierre ?? a.fechaApertura ?? ""))
      .slice(0, 5)
      .map(e => ({
        id:               e.id,
        numeroExpediente: e.numeroExpediente,
        deudorNombre:     e.deudorNombre,
        importeRecuperado:e.importeRecuperado,
        importeDeuda:     e.importeDeuda,
        fechaCierre:      e.fechaCierre,
        cazadorNombre:    cazadorMap[e.cazadorId ?? 0]?.fullName ?? "Sin asignar",
      }));

    return {
      global: {
        totalExpedientes:  allExps.length,
        totalActivos:      allExps.filter(e => ESTADOS_ACTIVOS.includes(e.estado ?? "")).length,
        totalCerrados:     allExps.filter(e => e.estado === "recuperado").length,
        totalDeuda:        Math.round(totalDeuda * 100) / 100,
        totalRecuperado:   Math.round(totalRecuperado * 100) / 100,
        tasaExito:         totalDeuda > 0 ? Math.round((totalRecuperado / totalDeuda) * 10000) / 100 : 0,
        cazadoresActivos:  allCazadores.length,
      },
      estadoBreakdown,
      cazadorRanking,
      ultimasRecuperaciones,
    };
  }),
});
