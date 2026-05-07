import { z } from "zod";
import { router, adminProcedure, staffProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, desc, asc, like, or } from "drizzle-orm";
import {
  expedientes,
  accionesOperativas,
  documentCounters,
  monitors,
} from "../../drizzle/schema";

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
      return created;
    }),

  update: staffProcedure
    .input(expedienteUpdateInput)
    .mutation(async ({ input }) => {
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
    .mutation(async ({ input }) => {
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
});
