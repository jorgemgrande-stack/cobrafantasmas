import { z } from "zod";
import { router, adminProcedure, staffProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, desc } from "drizzle-orm";
import {
  protocolos,
  expedienteProtocolos,
  accionesOperativas,
  expedientes,
  type ProtocoloPaso,
} from "../../drizzle/schema";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL!, connectionLimit: 3 });
const db   = drizzle(pool);

// ─── Schemas de validación ────────────────────────────────────────────────────

const pasoSchema = z.object({
  titulo:          z.string().min(1),
  tipo:            z.string().default("nota"),
  diasDesdeInicio: z.number().min(0).default(0),
  descripcion:     z.string().optional(),
  prioridad:       z.enum(["baja","media","alta","critica"]).default("media"),
});

const protocoloInput = z.object({
  nombre:                z.string().min(2),
  tipo:                  z.enum(["persistente","radar","reactivacion","intensivo","presencial"]),
  descripcion:           z.string().optional(),
  pasos:                 z.array(pasoSchema).min(1),
  intensidadRecomendada: z.number().min(1).max(5).default(2),
  duracionDias:          z.number().min(1).default(30),
  activo:                z.boolean().default(true),
});

// ─── Router ───────────────────────────────────────────────────────────────────

export const protocolosRouter = router({

  // ── CRUD de plantillas (admin) ────────────────────────────────────────────

  list: staffProcedure.query(async () => {
    return db
      .select({
        id:                    protocolos.id,
        nombre:                protocolos.nombre,
        tipo:                  protocolos.tipo,
        descripcion:           protocolos.descripcion,
        intensidadRecomendada: protocolos.intensidadRecomendada,
        duracionDias:          protocolos.duracionDias,
        activo:                protocolos.activo,
        createdAt:             protocolos.createdAt,
        numPasos:              db.$count(protocolos, eq(protocolos.id, protocolos.id)),
      })
      .from(protocolos)
      .orderBy(protocolos.tipo, protocolos.nombre);
  }),

  get: staffProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [p] = await db.select().from(protocolos).where(eq(protocolos.id, input.id));
      if (!p) throw new TRPCError({ code: "NOT_FOUND" });
      return p;
    }),

  create: adminProcedure
    .input(protocoloInput)
    .mutation(async ({ input }) => {
      const [result] = await db.insert(protocolos).values({
        nombre:                input.nombre,
        tipo:                  input.tipo,
        descripcion:           input.descripcion ?? null,
        pasos:                 input.pasos as ProtocoloPaso[],
        intensidadRecomendada: input.intensidadRecomendada,
        duracionDias:          input.duracionDias,
        activo:                input.activo,
      });
      return { id: (result as any).insertId };
    }),

  update: adminProcedure
    .input(z.object({ id: z.number() }).merge(protocoloInput.partial()))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(protocolos).set({
        ...data,
        pasos: data.pasos as ProtocoloPaso[] | undefined,
      }).where(eq(protocolos.id, id));
      return { ok: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const [active] = await db
        .select({ id: expedienteProtocolos.id })
        .from(expedienteProtocolos)
        .where(and(
          eq(expedienteProtocolos.protocoloId, input.id),
          eq(expedienteProtocolos.estado, "activo")
        ));
      if (active) throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Este protocolo tiene expedientes activos. Cancélalos antes de eliminarlo.",
      });
      await db.delete(protocolos).where(eq(protocolos.id, input.id));
      return { ok: true };
    }),

  toggleActivo: adminProcedure
    .input(z.object({ id: z.number(), activo: z.boolean() }))
    .mutation(async ({ input }) => {
      await db.update(protocolos).set({ activo: input.activo }).where(eq(protocolos.id, input.id));
      return { ok: true };
    }),

  // ── Asignación a expedientes ──────────────────────────────────────────────

  asignar: staffProcedure
    .input(z.object({
      expedienteId: z.number(),
      protocoloId:  z.number(),
      notas:        z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Cancelar cualquier protocolo activo previo en este expediente
      await db
        .update(expedienteProtocolos)
        .set({ estado: "cancelado", completadoAt: new Date() })
        .where(and(
          eq(expedienteProtocolos.expedienteId, input.expedienteId),
          eq(expedienteProtocolos.estado, "activo"),
        ));

      // Obtener protocolo
      const [p] = await db.select().from(protocolos).where(eq(protocolos.id, input.protocoloId));
      if (!p || !p.activo) throw new TRPCError({ code: "NOT_FOUND", message: "Protocolo no encontrado o inactivo." });

      // Crear asignación
      const ahora = new Date();
      const [ins] = await db.insert(expedienteProtocolos).values({
        expedienteId: input.expedienteId,
        protocoloId:  input.protocoloId,
        estado:       "activo",
        pasoActual:   0,
        notas:        input.notas ?? null,
        asignadoPor:  ctx.user.id,
        iniciadoAt:   ahora,
      });
      const asignacionId = (ins as any).insertId;

      // Obtener expediente para cazadorId
      const [exp] = await db
        .select({ cazadorId: expedientes.cazadorId })
        .from(expedientes)
        .where(eq(expedientes.id, input.expedienteId));

      // Crear acciones planificadas para cada paso
      const pasos = p.pasos as ProtocoloPaso[];
      for (const paso of pasos) {
        const fechaProgramada = new Date(ahora);
        fechaProgramada.setDate(fechaProgramada.getDate() + paso.diasDesdeInicio);

        await db.insert(accionesOperativas).values({
          expedienteId:   input.expedienteId,
          tipo:           (paso.tipo as any) ?? "nota",
          titulo:         paso.titulo,
          descripcion:    paso.descripcion ?? null,
          estado:         "pendiente",
          prioridad:      (paso.prioridad as any) ?? "media",
          fechaProgramada,
          visibleCliente: false,
          cazadorId:      exp?.cazadorId ?? null,
          notasInternas:  `Protocolo: ${p.nombre}`,
        });
      }

      return { asignacionId, accionesCreadas: pasos.length };
    }),

  // ── Consultas por expediente ──────────────────────────────────────────────

  listExpedienteProtocolos: staffProcedure
    .input(z.object({ expedienteId: z.number() }))
    .query(async ({ input }) => {
      const rows = await db
        .select({
          id:           expedienteProtocolos.id,
          estado:       expedienteProtocolos.estado,
          pasoActual:   expedienteProtocolos.pasoActual,
          notas:        expedienteProtocolos.notas,
          iniciadoAt:   expedienteProtocolos.iniciadoAt,
          completadoAt: expedienteProtocolos.completadoAt,
          protocolo: {
            id:                    protocolos.id,
            nombre:                protocolos.nombre,
            tipo:                  protocolos.tipo,
            pasos:                 protocolos.pasos,
            intensidadRecomendada: protocolos.intensidadRecomendada,
            duracionDias:          protocolos.duracionDias,
          },
        })
        .from(expedienteProtocolos)
        .innerJoin(protocolos, eq(expedienteProtocolos.protocoloId, protocolos.id))
        .where(eq(expedienteProtocolos.expedienteId, input.expedienteId))
        .orderBy(desc(expedienteProtocolos.iniciadoAt));
      return rows;
    }),

  cancelarProtocolo: staffProcedure
    .input(z.object({ asignacionId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(expedienteProtocolos)
        .set({ estado: "cancelado", completadoAt: new Date() })
        .where(eq(expedienteProtocolos.id, input.asignacionId));
      return { ok: true };
    }),
});
