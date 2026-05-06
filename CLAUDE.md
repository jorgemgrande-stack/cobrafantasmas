# COBRAFANTASMAS — Guía de proyecto para Claude

## ¿QUÉ ES ESTE PROYECTO?

Cobrafantasmas es una plataforma operativa de recuperación extrajudicial de deudas basada en
persistencia, automatización IA y seguimiento continuo. NO es una empresa de recobro tradicional
ni un despacho jurídico.

**Filosofía:** "Presencia operativa continua" — mantener seguimiento constante, generar sensación
de movimiento, hacer imposible el olvido de la deuda. Sin acoso, sin coacción. 100% dentro del
marco legal español y RGPD.

**Identidad visual:** Tactical tech / cyber-retro moderado. Inspiración ligera en Ghostbusters.
Tecnológica, operativa, emocional, diferencial. Sin copiar IP ni parecer intimidatoria.

---

## ORIGEN DEL CÓDIGO

**Cobrafantasmas es una reinterpretación operativa de Nayade Experiences Platform.**

Estrategia: reutilizar el stack, CRM, CMS, automatizaciones, paneles, usuarios, dashboards,
pagos, operaciones, timelines y estructura SaaS.
NO hacer refactors destructivos ni reescribir arquitectura.

---

## EQUIVALENCIAS CONCEPTUALES NAYADE → COBRAFANTASMAS

| Nayade | Cobrafantasmas |
|---|---|
| Leads | Casos detectados |
| Presupuestos | Propuestas operativas |
| Reservas | Expedientes activos |
| Operaciones | Protocolos activos |
| Timeline | Registro operativo |
| Dashboard | Centro de control |
| Packs / Experiencias | Protocolos de recobro |
| TPV / Cobros | Cobros / comisiones |
| Clientes | Acreedores |
| CRM | CRM operativo (expedientes, deudores, scoring) |

---

## STACK TÉCNICO

Idéntico a Nayade (no cambiar):

- **Frontend:** React 19 + Vite 7 + Tailwind 4 + shadcn/ui + tRPC client + TanStack Query + Wouter
- **Backend:** Express 4 + tRPC 11 + Drizzle ORM + MySQL 8
- **Auth:** JWT local (bcrypt + jose) — `LOCAL_AUTH=true`
- **Storage:** S3 / MinIO
- **IA:** Vapi (llamadas), WhatsApp, email, SMS
- **Pagos:** Redsys + TPV
- **Infra:** Docker + Railway
- **Package manager:** pnpm

---

## USUARIOS Y ROLES

1. **Administrador general** — control total: configuración, protocolos, IA, scoring, CMS, contabilidad
2. **Gestores de recobro** — expedientes, scoring IA, negociación, seguimiento, protocolos
3. **Operarios presenciales** — interfaz mobile-first: agenda, rutas, check-ins, evidencias, firma
4. **Acreedores (clientes)** — panel: actividad, expedientes, timeline, acuerdos, pagos, estado
5. **Deudores** — portal activable manualmente: negociar, pagar, subir documentación, firmar

---

## MÓDULOS

### Reutilizar de Nayade (adaptar conceptualmente)
- CRM → expedientes, acreedores, deudores, scoring
- CMS web pública → captación, funnels, SEO, landings
- Dashboard → Centro de control táctico
- Timeline → Registro operativo
- Pagos (Redsys + TPV)
- Automatizaciones multicanal (email, WhatsApp, Vapi)
- Gestión de usuarios y roles
- Panel cliente → Panel acreedor / Panel deudor

### Nuevos módulos a construir
- **Motor de protocolos** — protocolos de recobro: persistente, radar, reactivación, intensivo, presencial
- **Scoring IA** — probabilidad recuperación, dificultad, colaboración, riesgo, actividad, silencio
- **Compliance / trazabilidad** — logs, consentimientos, grabaciones, IPs, horarios, límites RGPD
- **Operativa presencial** — rutas, agenda, visitas, check-ins, evidencias, firma digital

### Módulos Nayade que NO aplican (desactivar, no eliminar)
- Hotel y habitaciones
- SPA
- Restaurantes
- Lego Packs
- Actividades turísticas

---

## PROTOCOLO DE DESARROLLO SEGURO

### Reglas de rama y commits
- Trabajar SIEMPRE en rama `feature/*`. Nunca tocar `main` directamente.
- Un commit por cambio (pequeños e aislados).

### Análisis previo obligatorio antes de cualquier cambio
1. Punto de entrada del servidor (`server/_core/index.ts`)
2. Registro de routers (`server/routers.ts`)
3. Schema y migraciones (`drizzle/schema.ts`, `drizzle/`)
4. Variables de entorno requeridas

### Prohibido en cada iteración sin staging previo
- Añadir / registrar routers nuevos en `server/routers.ts`
- Modificar `drizzle/schema.ts` o migraciones
- Tocar `server/_core/index.ts` o jobs

### Solo se implementa sin confirmación
- Cambios de frontend (`client/`)
- Pure functions no críticas

### Feature flags
Toda feature nueva lleva flag OFF por defecto.

### Entrega obligatoria tras cada cambio
- Diff exacto
- Cómo probar local
- Checklist de verificación de arranque

---

## ARCHIVOS CRÍTICOS (NO TOCAR SIN CONFIRMACIÓN EXPLÍCITA)

- `server/_core/index.ts` — arranque del servidor
- `server/routers.ts` — registro de routers tRPC
- `drizzle/schema.ts` + archivos de migración

---

## PRINCIPIOS INNEGOCIABLES

1. NO romper arquitectura existente
2. NO hacer refactors masivos innecesarios
3. Mantener compatibilidad progresiva y estabilidad
4. Priorizar trazabilidad legal (RGPD, legislación española)
5. Priorizar experiencia de uso real sobre estética
6. Tono cinematográfico elegante y MODERADO — no convertir el CRM en un videojuego
7. NUNCA implementar funcionalidades que puedan interpretarse como acoso o coacción
8. Pensar siempre en escalabilidad

---

## PRIORIDADES DE DESARROLLO

1. Base operativa estable (reutilizar Nayade)
2. Reconversión conceptual y UX
3. IA persistente
4. Operativa humana presencial
5. Narrativa cinematográfica avanzada

---

## ARRANQUE LOCAL

```bash
# Requisitos: Node.js 22.x, pnpm, Docker
docker-compose up -d          # MySQL 8 + MinIO
cp env.example.txt .env       # Configurar variables
pnpm install
pnpm db:migrate
pnpm dev
```

**Variables mínimas requeridas:**
- `DATABASE_URL` — conexión MySQL
- `LOCAL_AUTH=true` — auth local JWT
- `JWT_SECRET` — mínimo 32 caracteres
- `PORT=3000`
- `NODE_ENV=development`
