/**
 * seed-contacto-cms.mjs
 * Añade /contacto a static_pages y un bloque hero a page_blocks.
 * Ejecutar en Railway: railway run node scripts/seed-contacto-cms.mjs
 */
import mysql from "mysql2/promise";
import { config } from "dotenv";
config();

const pool = mysql.createPool(process.env.DATABASE_URL);

async function run() {
  const conn = await pool.getConnection();
  try {
    // 1. Página
    await conn.execute(
      `INSERT INTO static_pages (slug, title, metaTitle, metaDescription, isPublished)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         title           = VALUES(title),
         metaTitle       = VALUES(metaTitle),
         metaDescription = VALUES(metaDescription),
         isPublished     = 1`,
      [
        "contacto",
        "Contacto",
        "Contacto | Cobrafantasmas — Recuperación de deudas",
        "Contacta con Cobrafantasmas. Cuéntanos tu caso y te respondemos en menos de 24 horas.",
      ]
    );
    console.log("✓ static_pages: contacto");

    // 2. Bloque hero (permite añadir imagen desde el CMS)
    await conn.execute(`DELETE FROM page_blocks WHERE pageSlug = 'contacto'`);
    await conn.execute(
      `INSERT INTO page_blocks (pageSlug, blockType, sortOrder, data, isVisible)
       VALUES (?, ?, ?, ?, 1)`,
      [
        "contacto",
        "hero",
        0,
        JSON.stringify({
          title: "CONTACTO",
          subtitle: "¿Tienes una deuda pendiente? Cuéntanos tu caso. Respondemos en menos de 24 horas.",
          imageUrl: "",
          overlayOpacity: 75,
          ctaText: "Activar caso",
          ctaUrl: "/activar-caso",
        }),
      ]
    );
    console.log("✓ page_blocks: contacto hero");
    console.log("\n✅ Listo. La página /contacto ya aparece en /admin/cms/paginas.");
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
