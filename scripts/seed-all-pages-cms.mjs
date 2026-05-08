/**
 * seed-all-pages-cms.mjs
 * Crea el contenido CMS de todas las landing pages de Cobrafantasmas.
 * Ejecutar: node scripts/seed-all-pages-cms.mjs
 * En Railway: railway run node scripts/seed-all-pages-cms.mjs
 */
import mysql from "mysql2/promise";
import { config } from "dotenv";
config();

const pool = mysql.createPool(process.env.DATABASE_URL);

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function upsertPage(conn, slug, title, metaTitle, metaDesc) {
  await conn.execute(
    `INSERT INTO static_pages (slug, title, metaTitle, metaDescription, isPublished)
     VALUES (?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       title           = VALUES(title),
       metaTitle       = VALUES(metaTitle),
       metaDescription = VALUES(metaDescription),
       isPublished     = 1`,
    [slug, title, metaTitle, metaDesc]
  );
}

async function seedBlocks(conn, slug, blocks) {
  await conn.execute(`DELETE FROM page_blocks WHERE pageSlug = ?`, [slug]);
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    await conn.execute(
      `INSERT INTO page_blocks (pageSlug, blockType, sortOrder, data, isVisible)
       VALUES (?, ?, ?, ?, 1)`,
      [slug, b.type, i, JSON.stringify(b.data)]
    );
  }
  console.log(`  ✓ ${slug}: ${blocks.length} bloques`);
}

// ─── PÁGINAS ─────────────────────────────────────────────────────────────────
async function run() {
  const conn = await pool.getConnection();
  try {

    // ── 1. PROTOCOLOS (/protocolos) ──────────────────────────────────────────
    await upsertPage(conn,
      "protocolos",
      "Protocolos de recobro",
      "Protocolos | Cobrafantasmas — Recobro extrajudicial",
      "Cinco protocolos de recobro escalables: Radar, Persistente, Reactivación, Intensivo y Presencial. Cada caso activa el adecuado."
    );
    await seedBlocks(conn, "protocolos", [
      { type: "hero", data: {
        title: "LOS PROTOCOLOS",
        subtitle: "Cada caso activa el protocolo adecuado. Escalable, documentado, dentro de la ley.",
        imageUrl: "", overlayOpacity: 75, ctaText: "Activar caso", ctaUrl: "/activar-caso",
      }},
      { type: "features", data: {
        title: "PROTOCOLOS OPERATIVOS",
        items: [
          { icon: "01", title: "PROTOCOLO RADAR",        description: "Fase de detección. Localizamos señales, datos de contacto y estado real del deudor antes de actuar." },
          { icon: "02", title: "PROTOCOLO PERSISTENTE",  description: "Seguimiento continuo multicanal. Email, WhatsApp, llamadas, SMS. Cadencias programadas y adaptativas." },
          { icon: "03", title: "PROTOCOLO REACTIVACIÓN", description: "Cuando el deudor da señales de vida, el sistema reacciona en tiempo real con la acción adecuada." },
          { icon: "04", title: "PROTOCOLO INTENSIVO",    description: "Escalada de frecuencia y canales. Gestor humano asignado. Acuerdos de pago negociados." },
          { icon: "05", title: "PROTOCOLO PRESENCIAL",   description: "Cuando es necesario, equipo físico sobre el terreno. Visitas, recogida de firmas y acuerdos documentados." },
        ],
      }},
      { type: "text", data: {
        title: "NOTA LEGAL",
        body: "Todos los protocolos operan dentro de límites horarios permitidos, sin lenguaje coercitivo y respetando íntegramente el RGPD y la normativa española.",
        align: "left",
      }},
      { type: "cta", data: {
        title: "¿TU DEUDA TIENE PROTOCOLO?",
        subtitle: "Analizamos tu caso y te decimos qué protocolo activar. Sin coste.",
        ctaText: "ANALIZAR SI MI DEUDA TIENE PROTOCOLO →", ctaUrl: "/activar-caso", bgColor: "dark",
      }},
    ]);

    // ── 2. EL SISTEMA (/el-sistema) ──────────────────────────────────────────
    await upsertPage(conn,
      "el-sistema",
      "El sistema Cobrafantasmas",
      "El sistema | Cobrafantasmas — Centro de control operativo",
      "Panel de control en tiempo real: expedientes, scoring IA, timeline operativo, alertas y trazabilidad legal. Tu centro de mando."
    );
    await seedBlocks(conn, "el-sistema", [
      { type: "hero", data: {
        title: "EL SISTEMA",
        subtitle: "No es una web. Es un centro de control operativo.",
        imageUrl: "", overlayOpacity: 75, ctaText: "Activar caso", ctaUrl: "/activar-caso",
      }},
      { type: "text", data: {
        title: "TU PANEL CUANDO ACTIVAS UN EXPEDIENTE",
        body: "Cuando activas un expediente, tienes acceso a un panel donde ves en tiempo real: estado del protocolo activo, acciones realizadas, timeline documentado, alertas del sistema e importes recuperados.",
        align: "left",
      }},
      { type: "features", data: {
        title: "CAPACIDADES DEL SISTEMA",
        items: [
          { icon: "📋", title: "EXPEDIENTES ACTIVOS",  description: "Estado visual en tiempo real de cada caso. Indicadores de avance y semáforo de actividad." },
          { icon: "📅", title: "TIMELINE OPERATIVO",   description: "Cada acción documentada con fecha, canal y resultado. Historial completo accesible siempre." },
          { icon: "🔔", title: "ALERTAS IA",           description: "Notificaciones cuando hay movimiento: contacto del deudor, cambio de estado, acuerdo propuesto." },
          { icon: "📊", title: "SCORING DE CASO",      description: "Probabilidad de recuperación actualizada. Dificultad, riesgo y estimación de plazos." },
          { icon: "🔒", title: "TRAZABILIDAD LEGAL",   description: "Logs con IP, hora y canal de cada acción. Documentación lista para cualquier requerimiento." },
          { icon: "👤", title: "PANEL ACREEDOR",       description: "Acceso directo al estado de tu expediente. Sin depender de llamadas ni emails de seguimiento." },
        ],
      }},
      { type: "text", data: {
        title: "PARA EL EQUIPO GESTOR",
        body: "El panel interno es el centro de mando operativo: vista global de todos los expedientes activos, scoring IA en tiempo real, asignación de protocolos, gestión de tareas por gestor y acceso al historial completo de cada caso.\n\nLos operarios presenciales tienen su propia interfaz mobile-first con agenda, rutas, check-ins y subida de evidencias desde el terreno.",
        align: "left",
      }},
      { type: "cta", data: {
        title: "¿QUIERES VER CÓMO FUNCIONA?",
        subtitle: "Activa un expediente y accede al sistema desde el primer día.",
        ctaText: "QUIERO VER CÓMO FUNCIONA →", ctaUrl: "/activar-caso", bgColor: "dark",
      }},
    ]);

    // ── 3. CASOS (/casos) ────────────────────────────────────────────────────
    await upsertPage(conn,
      "casos",
      "Casos de éxito",
      "Casos de éxito | Cobrafantasmas — Resultados reales",
      "Casos reales de recuperación de deudas. Datos anonimizados. Facturas B2B, préstamos, comisiones, alquileres."
    );
    await seedBlocks(conn, "casos", [
      { type: "hero", data: {
        title: "CASOS",
        subtitle: "Historias reales. Datos anonimizados.",
        imageUrl: "", overlayOpacity: 75, ctaText: "Activar mi caso", ctaUrl: "/activar-caso",
      }},
      { type: "features", data: {
        title: "EXPEDIENTES RESUELTOS",
        items: [
          { icon: "€", title: "Factura impagada B2B — 8.400 €",       description: "Empresa de servicios IT. 6 meses sin respuesta. Protocolo Persistente. Resultado: acuerdo de pago en 2 semanas." },
          { icon: "€", title: "Comisión comercial — 12.000 €",         description: "Comercial autónomo. Empresa prometía pago tras cierre. Sin respuesta. Resultado: recuperado en 45 días." },
          { icon: "€", title: "Préstamo entre particulares — 3.500 €", description: "Acuerdo verbal. Negativas constantes. Protocolo Radar localizó nueva dirección. Resultado: acuerdo extrajudicial." },
          { icon: "€", title: "Alquiler impagado — 4.200 €",           description: "Propietario con 3 meses de impago. Inquilino no respondía. Resultado: acuerdo de salida documentado." },
          { icon: "€", title: "Trabajo realizado sin cobrar — 6.800 €", description: "Diseñadora autónoma. Empresa desapareció. Protocolo Intensivo + localización de responsable. Resultado: importe recuperado." },
          { icon: "€", title: "Factura construcción — 22.000 €",        description: "Subcontrata. Factura pendiente 14 meses. Resultado: 70% recuperado en negociación." },
        ],
      }},
      { type: "text", data: {
        title: "",
        body: "Los datos son ficticios o anonimizados para proteger la privacidad de nuestros clientes.",
        align: "center",
      }},
      { type: "cta", data: {
        title: "¿TU CASO PODRÍA SER EL SIGUIENTE?",
        subtitle: "Analizamos tu deuda sin coste. Si tiene viabilidad, te lo decimos.",
        ctaText: "ANALIZAR MI CASO →", ctaUrl: "/activar-caso", bgColor: "dark",
      }},
    ]);

    // ── 4. PREGUNTAS FRECUENTES (/preguntas-frecuentes) ──────────────────────
    await upsertPage(conn,
      "preguntas-frecuentes",
      "Preguntas frecuentes",
      "FAQ | Cobrafantasmas — Preguntas frecuentes",
      "Todo lo que necesitas saber antes de activar tu caso: costes, proceso, plazos, legal y privacidad."
    );
    await seedBlocks(conn, "preguntas-frecuentes", [
      { type: "hero", data: {
        title: "PREGUNTAS FRECUENTES",
        subtitle: "Todo lo que necesitas saber antes de activar tu caso.",
        imageUrl: "", overlayOpacity: 75, ctaText: "Activar caso", ctaUrl: "/activar-caso",
      }},
      { type: "accordion", data: {
        title: "SOBRE EL SERVICIO",
        items: [
          { question: "¿Es legal Cobrafantasmas?",
            answer: "Sí. Somos una empresa de recuperación extrajudicial de deudas que opera 100% dentro del marco legal español y el RGPD. Todas nuestras acciones están documentadas y respetan la normativa vigente." },
          { question: "¿En qué se diferencia de un abogado o una gestoría?",
            answer: "No usamos la vía judicial como primera opción. Actuamos con presencia operativa continua, tecnología y equipo humano para resolver antes de llegar a los juzgados." },
          { question: "¿Qué tipo de deudas gestionáis?",
            answer: "Facturas impagadas B2B, comisiones comerciales, préstamos entre particulares, alquileres, trabajos realizados y cualquier deuda civil o mercantil extrajudicial." },
        ],
      }},
      { type: "accordion", data: {
        title: "COSTES Y CONDICIONES",
        items: [
          { question: "¿Cuánto cuesta el servicio?",
            answer: "La evaluación inicial es gratuita. Si aceptamos el caso, hay una cuota de activación que cubre el coste operativo. Además, aplicamos una comisión sobre el importe efectivamente recuperado." },
          { question: "¿Solo cobráis comisión si recuperáis?",
            answer: "La comisión de éxito solo se aplica cuando hay recuperación real. La cuota de activación cubre el inicio de la operación." },
          { question: "¿Hay un importe mínimo de deuda?",
            answer: "Trabajamos principalmente con deudas a partir de 1.000€, aunque valoramos cada caso individualmente." },
        ],
      }},
      { type: "accordion", data: {
        title: "EL PROCESO",
        items: [
          { question: "¿Cuánto tiempo tarda?",
            answer: "Depende del caso. Deudas simples con deudor localizable pueden resolverse en semanas. Casos complejos pueden llevar meses. Te damos una estimación en la propuesta." },
          { question: "¿Qué pasa si el deudor no responde?",
            answer: "El protocolo continúa. Exploramos todas las vías de contacto disponibles y documentamos cada acción. Si agotamos las posibilidades extrajudiciales, te lo comunicamos." },
          { question: "¿Puedo ver el estado de mi expediente?",
            answer: "Sí. Tendrás acceso a un panel donde puedes ver el estado en tiempo real, acciones realizadas y timeline completo." },
          { question: "¿Hacéis visitas presenciales?",
            answer: "Cuando el caso lo requiere, sí. Contamos con operarios presenciales para gestiones que requieren presencia física, siempre dentro de los límites legales." },
        ],
      }},
      { type: "accordion", data: {
        title: "LEGAL Y PRIVACIDAD",
        items: [
          { question: "¿Cómo protegéis los datos del deudor y del acreedor?",
            answer: "Cumplimos íntegramente con el RGPD. Los datos se tratan con las medidas de seguridad requeridas y solo se usan para la gestión del expediente." },
          { question: "¿Podéis garantizar la recuperación?",
            answer: "No podemos garantizar el resultado, pero sí garantizamos que activaremos todos los mecanismos extrajudiciales disponibles y te informaremos de cada paso." },
        ],
      }},
      { type: "cta", data: {
        title: "¿AÚN TIENES DUDAS?",
        subtitle: "Cuéntanos tu caso directamente. Te respondemos en menos de 24h laborables.",
        ctaText: "ACTIVAR ANÁLISIS GRATUITO →", ctaUrl: "/activar-caso", bgColor: "dark",
      }},
    ]);

    // ── 5. ACTIVAR CASO (/activar-caso) ──────────────────────────────────────
    await upsertPage(conn,
      "activar-caso",
      "Activar un caso",
      "Activar caso | Cobrafantasmas — Análisis gratuito",
      "Activa tu caso ahora. Análisis inicial gratuito. Sin compromiso. Solo avanzamos si el caso tiene sentido. Respuesta en menos de 24h."
    );
    await seedBlocks(conn, "activar-caso", [
      { type: "hero", data: {
        title: "ACTIVA TU CASO",
        subtitle: "Análisis inicial gratuito. Sin compromiso. Solo avanzamos si el caso tiene sentido.",
        imageUrl: "", overlayOpacity: 75, ctaText: "", ctaUrl: "",
      }},
      { type: "features", data: {
        title: "GARANTÍAS",
        items: [
          { icon: "✓", title: "Evaluación sin compromiso", description: "Analizamos tu caso gratuitamente. Solo avanzamos si tiene viabilidad real." },
          { icon: "✓", title: "Sin letra pequeña",         description: "Las condiciones son claras desde el primer momento. Sin sorpresas." },
          { icon: "✓", title: "Confidencialidad",          description: "Toda la información es tratada con la máxima discreción y conforme al RGPD." },
        ],
      }},
    ]);

    // ── 6. POLÍTICA DE PRIVACIDAD (/privacidad) ──────────────────────────────
    await upsertPage(conn,
      "privacidad",
      "Política de privacidad",
      "Política de privacidad | Cobrafantasmas",
      "Información sobre el tratamiento de tus datos personales conforme al RGPD y la LOPDGDD."
    );
    await seedBlocks(conn, "privacidad", [
      { type: "text", data: {
        title: "Política de Privacidad",
        body: "Última actualización: mayo 2026\n\nDe conformidad con lo dispuesto en el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), se informa al usuario que los datos personales que facilite a través de este sitio web serán tratados por Iron Elephant Consulting S.L.",
        align: "left",
      }},
      { type: "text", data: {
        title: "1. Responsable del tratamiento",
        body: "Denominación social: Iron Elephant Consulting S.L.\nCIF: B26987875\nDomicilio: C/ Corazón de María 57, 1º D · 28002 Madrid\nEmail: administracion@cobrafantasmas.com\nTeléfono: +34 911 67 51 89",
        align: "left",
      }},
      { type: "text", data: {
        title: "2. Finalidad del tratamiento",
        body: "Los datos personales recogidos se tratarán para:\n\n— Gestionar la relación contractual derivada de la contratación de los servicios de recobro extrajudicial.\n— Dar respuesta a consultas o solicitudes de información recibidas a través de los formularios del sitio web.\n— Gestionar expedientes, seguimientos y la prestación de los servicios contratados.\n— Mejorar la experiencia del usuario y la calidad de los servicios prestados.",
        align: "left",
      }},
      { type: "text", data: {
        title: "3. Conservación de los datos",
        body: "Los datos se conservarán mientras se mantenga la relación comercial o el usuario no solicite su supresión, y durante los plazos necesarios para cumplir con obligaciones legales o atender posibles responsabilidades. Los datos fiscales y de facturación se conservarán durante el plazo mínimo exigido por la normativa tributaria vigente (5 años).",
        align: "left",
      }},
      { type: "text", data: {
        title: "4. Legitimación",
        body: "El tratamiento se basa en:\n\n— La ejecución de un contrato: cuando el usuario contrata servicios a través del sitio web.\n— El consentimiento expreso del usuario: al aceptar esta política, al marcar casillas habilitadas o al enviar formularios.\n— Interés legítimo: para el envío de comunicaciones sobre el estado del expediente activo.",
        align: "left",
      }},
      { type: "text", data: {
        title: "5. Destinatarios",
        body: "Los datos no se comunicarán a terceros salvo obligación legal o cuando sea necesario para la prestación del servicio (proveedores de alojamiento web, plataformas de comunicación, servicios administrativos). En ningún caso se cederán datos a terceros con fines de marketing sin el consentimiento expreso del usuario.",
        align: "left",
      }},
      { type: "text", data: {
        title: "6. Derechos del usuario",
        body: "El usuario puede ejercer en cualquier momento los derechos de acceso, rectificación, supresión, limitación, oposición y portabilidad enviando una solicitud a administracion@cobrafantasmas.com adjuntando documento de identidad. También tiene derecho a presentar reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).",
        align: "left",
      }},
      { type: "text", data: {
        title: "7. Seguridad y cookies",
        body: "Iron Elephant Consulting S.L. adopta las medidas técnicas y organizativas necesarias para garantizar la seguridad, integridad y confidencialidad de los datos personales. Para más información sobre el uso de cookies consulte nuestra Política de Cookies.",
        align: "left",
      }},
    ]);

    // ── 7. TÉRMINOS Y CONDICIONES (/terminos) ─────────────────────────────────
    await upsertPage(conn,
      "terminos",
      "Términos y condiciones",
      "Términos y condiciones | Cobrafantasmas",
      "Condiciones generales de contratación de los servicios de recobro extrajudicial de Cobrafantasmas."
    );
    await seedBlocks(conn, "terminos", [
      { type: "text", data: {
        title: "Términos y Condiciones",
        body: "Última actualización: mayo 2026\n\nEn cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE), se informa que el presente sitio web es titularidad de Iron Elephant Consulting S.L., CIF B26987875, con domicilio en C/ Corazón de María 57, 1º D · 28002 Madrid.",
        align: "left",
      }},
      { type: "text", data: {
        title: "1. Objeto y ámbito",
        body: "Las presentes Condiciones Generales regulan el acceso y uso del sitio web de Cobrafantasmas, así como la contratación de los servicios de recobro extrajudicial de deudas. El acceso al sitio web implica la aceptación plena de estas condiciones.",
        align: "left",
      }},
      { type: "text", data: {
        title: "2. Contratación de servicios",
        body: "La contratación se formaliza mediante:\n\n1. Envío del formulario de análisis con los datos de la deuda.\n2. Evaluación y propuesta personalizada por parte del gestor asignado.\n3. Aceptación de la propuesta y pago de la cuota de activación.\n4. Confirmación por correo electrónico con los datos del expediente.\n\nEl contrato se perfecciona en el momento en que Cobrafantasmas confirma la aceptación del caso.",
        align: "left",
      }},
      { type: "text", data: {
        title: "3. Precios y forma de pago",
        body: "Los precios incluyen el IVA vigente y están expresados en euros (€). La estructura de honorarios se compone de una cuota de activación (fija, cubre el inicio de la operación) y una comisión de éxito aplicada únicamente sobre el importe efectivamente recuperado.\n\nCobrafantasmas se reserva el derecho a modificar los precios, sin que los cambios afecten a expedientes ya confirmados.",
        align: "left",
      }},
      { type: "text", data: {
        title: "4. Obligaciones del cliente",
        body: "El cliente se compromete a proporcionar información veraz y completa sobre la deuda, facilitar la documentación disponible (facturas, contratos, emails, etc.), comunicar cualquier contacto directo del deudor durante el proceso y no realizar actuaciones paralelas que puedan interferir con el protocolo activo sin comunicarlo previamente al gestor.",
        align: "left",
      }},
      { type: "text", data: {
        title: "5. Limitación de responsabilidad",
        body: "Cobrafantasmas no puede garantizar la recuperación de la deuda, ya que el resultado depende de factores ajenos al operador (solvencia del deudor, documentación disponible, antigüedad). Nos comprometemos a activar todos los mecanismos extrajudiciales disponibles e informar de cada paso.",
        align: "left",
      }},
      { type: "text", data: {
        title: "6. Propiedad intelectual y legislación aplicable",
        body: "Todos los contenidos del sitio web son propiedad de Iron Elephant Consulting S.L. y están protegidos por la legislación española e internacional sobre propiedad intelectual.\n\nLas presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales de Madrid.",
        align: "left",
      }},
    ]);

    // ── 8. POLÍTICA DE COOKIES (/cookies) ────────────────────────────────────
    await upsertPage(conn,
      "cookies",
      "Política de cookies",
      "Política de cookies | Cobrafantasmas",
      "Información sobre las cookies utilizadas en cobrafantasmas.com conforme al RGPD."
    );
    await seedBlocks(conn, "cookies", [
      { type: "text", data: {
        title: "Política de Cookies",
        body: "Última actualización: mayo 2026\n\nLas cookies son pequeños archivos de texto que los sitios web almacenan en el dispositivo del usuario. Permiten que el sitio recuerde preferencias y acciones durante un período de tiempo.",
        align: "left",
      }},
      { type: "text", data: {
        title: "1. Cookies técnicas (necesarias)",
        body: "Son imprescindibles para el correcto funcionamiento del sitio. Permiten la navegación y el uso de funciones básicas como la gestión de sesión de usuario. Sin estas cookies, el sitio no puede funcionar correctamente.\n\n— session_token: mantiene la sesión del usuario autenticado (duración: sesión)\n— csrf_token: protección contra ataques CSRF en formularios (duración: sesión)\n— cookie_consent: registra si el usuario ha aceptado el uso de cookies (duración: 1 año)",
        align: "left",
      }},
      { type: "text", data: {
        title: "2. Cookies analíticas",
        body: "Permiten analizar el comportamiento de navegación para mejorar los servicios. Los datos recogidos son anónimos.\n\n— _ga (Google Analytics): distingue usuarios únicos (duración: 2 años)\n— _ga_* (Google Analytics): mantiene el estado de la sesión analítica (duración: 2 años)\n— _gid (Google Analytics): análisis de tráfico diario (duración: 24 horas)",
        align: "left",
      }},
      { type: "text", data: {
        title: "3. Cómo gestionar las cookies",
        body: "El usuario puede configurar su navegador para aceptar, rechazar o eliminar las cookies:\n\n— Google Chrome: support.google.com/chrome/answer/95647\n— Mozilla Firefox: support.mozilla.org/kb/habilitar-y-deshabilitar-cookies\n— Apple Safari: support.apple.com/guide/safari/sfri11471\n— Microsoft Edge: support.microsoft.com/microsoft-edge\n\nDeshabilitar determinadas cookies puede afectar al correcto funcionamiento del sitio.",
        align: "left",
      }},
      { type: "text", data: {
        title: "4. Base legal y transferencias internacionales",
        body: "El uso de cookies técnicas se basa en el interés legítimo para garantizar el correcto funcionamiento del sitio (art. 6.1.f RGPD). El uso de cookies analíticas se basa en el consentimiento del usuario (art. 6.1.a RGPD).\n\nAlgunos proveedores (Google Analytics) pueden transferir datos fuera del Espacio Económico Europeo. Dichas transferencias están amparadas por las cláusulas contractuales tipo aprobadas por la Comisión Europea.",
        align: "left",
      }},
    ]);

    // ── 9. CONDICIONES DE CANCELACIÓN (/condiciones-cancelacion) ─────────────
    await upsertPage(conn,
      "condiciones-cancelacion",
      "Condiciones de cancelación",
      "Condiciones de cancelación | Cobrafantasmas",
      "Condiciones para la cancelación o modificación de expedientes activos en Cobrafantasmas."
    );
    await seedBlocks(conn, "condiciones-cancelacion", [
      { type: "text", data: {
        title: "Condiciones de Cancelación",
        body: "Última actualización: mayo 2026\n\nEl cliente puede cancelar un expediente activo en cualquier momento comunicándolo por escrito a su gestor asignado o a través del email administracion@cobrafantasmas.com.",
        align: "left",
      }},
      { type: "text", data: {
        title: "1. Cuota de activación",
        body: "La cuota de activación abonada al inicio del expediente no es reembolsable una vez que el protocolo ha sido puesto en marcha, dado que cubre los costes operativos iniciales ya ejecutados (análisis, configuración de protocolo, primera batería de contactos).",
        align: "left",
      }},
      { type: "text", data: {
        title: "2. Comisión de éxito",
        body: "La comisión de éxito solo se aplica sobre importes efectivamente recuperados. Si el expediente se cancela antes de que se produzca recuperación, no se aplica ninguna comisión adicional.",
        align: "left",
      }},
      { type: "text", data: {
        title: "3. Cancelación por el cliente",
        body: "Para cancelar un expediente activo:\n\n— Comunícalo por escrito a tu gestor asignado o a administracion@cobrafantasmas.com\n— Indica el número de expediente y el motivo\n— El expediente quedará suspendido en un plazo de 48 horas\n\nToda la documentación generada durante el proceso estará disponible para el cliente.",
        align: "left",
      }},
      { type: "text", data: {
        title: "4. Cancelación por Cobrafantasmas",
        body: "Cobrafantasmas puede cancelar un expediente en los siguientes casos: imposibilidad de localizar al deudor tras agotar todos los canales disponibles, falta de documentación suficiente para continuar el protocolo, o instrucciones contradictorias por parte del cliente que impidan la operación normal.\n\nEn estos casos, se informará al cliente con antelación.",
        align: "left",
      }},
      { type: "text", data: {
        title: "5. Contacto",
        body: "Para cualquier consulta sobre cancelaciones:\n\nEmail: administracion@cobrafantasmas.com\nTeléfono: +34 911 67 51 89\n\nConsulta también los Términos y Condiciones y la Política de Privacidad en el pie de página del sitio.",
        align: "left",
      }},
    ]);

    console.log("\n✅ Seed completado. Todas las páginas creadas en /admin/cms/paginas.");
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
