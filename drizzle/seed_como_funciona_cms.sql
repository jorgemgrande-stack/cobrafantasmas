-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Página /como-funciona en el CMS
--
-- Crea el registro en static_pages y los bloques de contenido en page_blocks
-- para que la página aparezca en /admin/cms/paginas con el hero listo para
-- recibir la imagen del fantasma.
--
-- Ejecución: railway run pnpm db:seed:como-funciona
--   o en Railway MySQL web panel: pegar y ejecutar este SQL
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Página base
INSERT INTO static_pages (slug, title, metaTitle, metaDescription, isPublished)
VALUES (
  'como-funciona',
  'Cómo funciona Cobrafantasmas',
  'Cómo funciona | Cobrafantasmas — Recobro extrajudicial',
  'Descubre cómo Cobrafantasmas recupera tus deudas: IA persistente, automatización multicanal y operativa humana. Sin magia. Sin burocracia.'
  , 1
)
ON DUPLICATE KEY UPDATE
  title            = 'Cómo funciona Cobrafantasmas',
  metaTitle        = 'Cómo funciona | Cobrafantasmas — Recobro extrajudicial',
  metaDescription  = 'Descubre cómo Cobrafantasmas recupera tus deudas: IA persistente, automatización multicanal y operativa humana. Sin magia. Sin burocracia.',
  isPublished      = 1;

-- 2. Limpiar bloques anteriores de esta página
DELETE FROM page_blocks WHERE pageSlug = 'como-funciona';

-- 3. Hero — imagen gestionada desde aquí
INSERT INTO page_blocks (pageSlug, blockType, sortOrder, data, isVisible)
VALUES (
  'como-funciona', 'hero', 0,
  JSON_OBJECT(
    'title',          'CÓMO FUNCIONAMOS',
    'subtitle',       'Tecnología, persistencia y operativa humana. Sin magia. Sin burocracia.',
    'imageUrl',       '',
    'overlayOpacity', 75,
    'ctaText',        'Activar caso',
    'ctaUrl',         '/contacto'
  ),
  1
);

-- 4. El proceso — 4 pasos
INSERT INTO page_blocks (pageSlug, blockType, sortOrder, data, isVisible)
VALUES (
  'como-funciona', 'features', 1,
  JSON_OBJECT(
    'title', 'EL PROCESO',
    'items', JSON_ARRAY(
      JSON_OBJECT('icon', '01', 'title', 'SUBES TU CASO',    'description', 'Formulario de análisis. Datos básicos de la deuda, importe y situación. Sin papeleos iniciales.'),
      JSON_OBJECT('icon', '02', 'title', 'ANÁLISIS IA',      'description', 'Sistema evalúa viabilidad, historial, tipo de deuda y probabilidad de recuperación en tiempo real.'),
      JSON_OBJECT('icon', '03', 'title', 'PROPUESTA HUMANA', 'description', 'Gestor especializado revisa el caso y te presenta propuesta personalizada con condiciones claras.'),
      JSON_OBJECT('icon', '04', 'title', 'PROTOCOLO ACTIVO', 'description', 'Tras aceptación, el sistema arranca. Multicanal. Continuo. Documentado. Imparable.')
    )
  ),
  1
);

-- 5. Tecnología
INSERT INTO page_blocks (pageSlug, blockType, sortOrder, data, isVisible)
VALUES (
  'como-funciona', 'features', 2,
  JSON_OBJECT(
    'title', 'TECNOLOGÍA',
    'items', JSON_ARRAY(
      JSON_OBJECT('icon', '⚡', 'title', 'IA PERSISTENTE',           'description', 'Motor de scoring que evalúa cada señal del deudor y adapta la cadencia de contacto en tiempo real.'),
      JSON_OBJECT('icon', '📡', 'title', 'AUTOMATIZACIÓN MULTICANAL', 'description', 'Email, WhatsApp, llamadas y SMS coordinados. Cadencias que se ajustan al comportamiento del deudor.'),
      JSON_OBJECT('icon', '🔒', 'title', 'TRAZABILIDAD LEGAL',        'description', 'Cada acción queda registrada con timestamp, canal e IP. Documentación lista para cualquier requerimiento.')
    )
  ),
  1
);

-- 6. Equipo
INSERT INTO page_blocks (pageSlug, blockType, sortOrder, data, isVisible)
VALUES (
  'como-funciona', 'features', 3,
  JSON_OBJECT(
    'title', 'EQUIPO OPERATIVO',
    'items', JSON_ARRAY(
      JSON_OBJECT('icon', '⚡', 'title', 'GESTORES DE RECOBRO',    'description', 'Especialistas en negociación y seguimiento. Revisan cada expediente, proponen acuerdos y supervisan el protocolo.'),
      JSON_OBJECT('icon', '🎯', 'title', 'OPERARIOS PRESENCIALES', 'description', 'Cuando el caso lo requiere, equipo físico sobre el terreno. Visitas, recogida de firmas y evidencias documentadas.')
    )
  ),
  1
);

-- 7. FAQ
INSERT INTO page_blocks (pageSlug, blockType, sortOrder, data, isVisible)
VALUES (
  'como-funciona', 'accordion', 4,
  JSON_OBJECT(
    'title', 'PREGUNTAS FRECUENTES',
    'items', JSON_ARRAY(
      JSON_OBJECT('question', '¿Necesito contratar a un abogado antes de activar el servicio?',  'answer', 'No. Cobrafantasmas opera de forma extrajudicial. No necesitas abogado para empezar. Si el caso requiere vía judicial, te lo comunicamos.'),
      JSON_OBJECT('question', '¿Cuánto tiempo tarda el análisis inicial?',                        'answer', 'La evaluación inicial se realiza en menos de 24 horas laborables. Recibirás respuesta directa de un gestor.'),
      JSON_OBJECT('question', '¿Qué pasa si el deudor no tiene dinero para pagar?',               'answer', 'El protocolo explora la capacidad real de pago, activos y vías de acuerdo. Negociamos soluciones parciales o fraccionadas.'),
      JSON_OBJECT('question', '¿Puedo cancelar el servicio en cualquier momento?',                'answer', 'Sí. Puedes cancelar el expediente activo comunicándolo a tu gestor. Las condiciones de cancelación están detalladas en la propuesta.')
    )
  ),
  1
);

-- 8. CTA final
INSERT INTO page_blocks (pageSlug, blockType, sortOrder, data, isVisible)
VALUES (
  'como-funciona', 'cta', 5,
  JSON_OBJECT(
    'title',    'ACTIVA TU EXPEDIENTE',
    'subtitle', 'Análisis inicial gratuito. Sin compromiso. Primera respuesta en menos de 24h.',
    'ctaText',  'Activar caso ahora',
    'ctaUrl',   '/contacto',
    'bgColor',  '#0A0A0A'
  ),
  1
);
