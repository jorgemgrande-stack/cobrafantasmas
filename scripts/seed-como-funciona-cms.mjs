/**
 * seed-como-funciona-cms.mjs
 * Crea la página /como-funciona en el CMS (static_pages + page_blocks).
 * Ejecutar: node scripts/seed-como-funciona-cms.mjs
 * En Railway: railway run node scripts/seed-como-funciona-cms.mjs
 */
import mysql from "mysql2/promise";
import { config } from "dotenv";
config();

const pool = mysql.createPool(process.env.DATABASE_URL);

async function run() {
  const conn = await pool.getConnection();
  try {
    // 1. Página base
    await conn.execute(
      `INSERT INTO static_pages (slug, title, metaTitle, metaDescription, isPublished)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         title           = VALUES(title),
         metaTitle       = VALUES(metaTitle),
         metaDescription = VALUES(metaDescription),
         isPublished     = 1`,
      [
        "como-funciona",
        "Cómo funciona Cobrafantasmas",
        "Cómo funciona | Cobrafantasmas — Recobro extrajudicial",
        "Descubre cómo Cobrafantasmas recupera tus deudas: IA persistente, automatización multicanal y operativa humana. Sin magia. Sin burocracia.",
      ]
    );
    console.log("✓ static_pages upserted");

    // 2. Limpiar bloques anteriores
    await conn.execute(`DELETE FROM page_blocks WHERE pageSlug = 'como-funciona'`);
    console.log("✓ page_blocks limpiados");

    const blocks = [
      {
        blockType: "hero",
        sortOrder: 0,
        data: {
          title: "CÓMO FUNCIONAMOS",
          subtitle: "Tecnología, persistencia y operativa humana. Sin magia. Sin burocracia.",
          imageUrl: "",
          overlayOpacity: 75,
          ctaText: "Activar caso",
          ctaUrl: "/contacto",
        },
      },
      {
        blockType: "features",
        sortOrder: 1,
        data: {
          title: "EL PROCESO",
          items: [
            { icon: "01", title: "SUBES TU CASO",    description: "Formulario de análisis. Datos básicos de la deuda, importe y situación. Sin papeleos iniciales." },
            { icon: "02", title: "ANÁLISIS IA",      description: "Sistema evalúa viabilidad, historial, tipo de deuda y probabilidad de recuperación en tiempo real." },
            { icon: "03", title: "PROPUESTA HUMANA", description: "Gestor especializado revisa el caso y te presenta propuesta personalizada con condiciones claras." },
            { icon: "04", title: "PROTOCOLO ACTIVO", description: "Tras aceptación, el sistema arranca. Multicanal. Continuo. Documentado. Imparable." },
          ],
        },
      },
      {
        blockType: "features",
        sortOrder: 2,
        data: {
          title: "TECNOLOGÍA",
          items: [
            { icon: "⚡", title: "IA PERSISTENTE",            description: "Motor de scoring que evalúa cada señal del deudor y adapta la cadencia de contacto en tiempo real." },
            { icon: "📡", title: "AUTOMATIZACIÓN MULTICANAL", description: "Email, WhatsApp, llamadas y SMS coordinados. Cadencias que se ajustan al comportamiento del deudor." },
            { icon: "🔒", title: "TRAZABILIDAD LEGAL",         description: "Cada acción queda registrada con timestamp, canal e IP. Documentación lista para cualquier requerimiento." },
          ],
        },
      },
      {
        blockType: "features",
        sortOrder: 3,
        data: {
          title: "EQUIPO OPERATIVO",
          items: [
            { icon: "⚡", title: "GESTORES DE RECOBRO",    description: "Especialistas en negociación y seguimiento. Revisan cada expediente, proponen acuerdos y supervisan el protocolo." },
            { icon: "🎯", title: "OPERARIOS PRESENCIALES", description: "Cuando el caso lo requiere, equipo físico sobre el terreno. Visitas, recogida de firmas y evidencias documentadas." },
          ],
        },
      },
      {
        blockType: "accordion",
        sortOrder: 4,
        data: {
          title: "PREGUNTAS FRECUENTES",
          items: [
            { question: "¿Necesito contratar a un abogado antes de activar el servicio?", answer: "No. Cobrafantasmas opera de forma extrajudicial. No necesitas abogado para empezar. Si el caso requiere vía judicial, te lo comunicamos." },
            { question: "¿Cuánto tiempo tarda el análisis inicial?",                       answer: "La evaluación inicial se realiza en menos de 24 horas laborables. Recibirás respuesta directa de un gestor." },
            { question: "¿Qué pasa si el deudor no tiene dinero para pagar?",              answer: "El protocolo explora la capacidad real de pago, activos y vías de acuerdo. Negociamos soluciones parciales o fraccionadas." },
            { question: "¿Puedo cancelar el servicio en cualquier momento?",               answer: "Sí. Puedes cancelar el expediente activo comunicándolo a tu gestor. Las condiciones de cancelación están detalladas en la propuesta." },
          ],
        },
      },
      {
        blockType: "cta",
        sortOrder: 5,
        data: {
          title:    "ACTIVA TU EXPEDIENTE",
          subtitle: "Análisis inicial gratuito. Sin compromiso. Primera respuesta en menos de 24h.",
          ctaText:  "Activar caso ahora",
          ctaUrl:   "/contacto",
          bgColor:  "#0A0A0A",
        },
      },
    ];

    for (const block of blocks) {
      await conn.execute(
        `INSERT INTO page_blocks (pageSlug, blockType, sortOrder, data, isVisible)
         VALUES (?, ?, ?, ?, 1)`,
        ["como-funciona", block.blockType, block.sortOrder, JSON.stringify(block.data)]
      );
    }
    console.log(`✓ ${blocks.length} bloques insertados`);
    console.log("\n✅ Seed completado. Ve a /admin/cms/paginas para ver la página.");
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
