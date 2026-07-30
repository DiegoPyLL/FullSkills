---
name: seo
description: Base de conocimiento de SEO técnico para auditar y decidir (no para opinar) sobre indexabilidad, códigos de estado y redirecciones, control de rastreo, sitemaps, análisis de logs, trampas de rastreo y facetas, arquitectura y enlazado interno, renderizado y JavaScript, canonicalización, metadatos, contenido, Core Web Vitals, imágenes, móvil, datos estructurados, visibilidad en buscadores con IA, SEO internacional, autoridad off-site, analítica, migraciones y monitoreo. Se invoca cuando hay que auditar un sitio, diagnosticar caídas de tráfico o de indexación, revisar robots.txt, canonicals, hreflang o schema, planificar una migración, o priorizar hallazgos SEO por severidad.
---

# Skill de SEO técnico — índice y protocolo

Este archivo es el enrutador. El conocimiento vive en [seo-master.md](seo-master.md), un manual de ejecución de 25 secciones más cuatro anexos.
Hermano de [../security/SKILL.md](../security/SKILL.md) y [../backend/SKILL.md](../backend/SKILL.md); mismas convenciones, dominio distinto.

## 1. Regla de oro: umbral o no entra

Todo ítem del manual tiene un **criterio de aprobación medible**, un método de medición y una severidad. Si dos auditores no pueden aprobar o reprobar el mismo ítem con el mismo resultado, el ítem no sirve.

Aplicado a las respuestas: nunca decir "mejorar el rendimiento" o "optimizar los títulos". Decir qué se mide, con qué herramienta, cuál es el umbral y qué severidad tiene si falla. Los umbrales están en el [Anexo A](seo-master.md#anexo-a-tabla-maestra-de-umbrales); los comandos y consultas, en el [Anexo B](seo-master.md#anexo-b-comandos-y-consultas-útiles).

Regla dura: **nunca inventar** un umbral, una métrica de un buscador, un comportamiento de rastreo no documentado ni un factor de posicionamiento. Si el dato no está en el manual, se dice y se nombra dónde se verifica.

## 2. Protocolo de respuesta

1. **Clasificar la intención** en uno de estos cinco modos:

| Modo | Pregunta típica | Forma de salida |
|---|---|---|
| `AUDITAR` | "Revisa este sitio" | Recorrido por bloques A→D, tabla priorizada de hallazgos ([sección 25](seo-master.md#25-entregable-y-priorización)) |
| `DIAGNOSTICAR` | "Cayó el tráfico / desindexaron páginas" | Síntoma → qué medir → hipótesis por bloque → confirmación → causa → corrección |
| `VERIFICAR` | "¿Está bien este robots.txt / canonical / hreflang?" | Ítem concreto: criterio de aprobación, método de medición, veredicto, severidad |
| `MIGRAR` | "Cambiamos de dominio o de CMS" | [Protocolo de migración](seo-master.md#23-protocolo-de-migración), con pasos previos, del día y posteriores |
| `PRIORIZAR` | "¿Por dónde empiezo?" | Severidad × URLs con tráfico afectadas × coste de corrección. Nunca un listado plano |

2. **Respetar el orden de bloques.** No se pasa al siguiente si el anterior tiene un P0 abierto: optimizar CLS en un sitio con `noindex` global es trabajo perdido.
3. **Ponderar por valor de negocio.** Ninguna URL vale lo mismo; un fallo sobre URLs sin tráfico ni impresiones en 90 días baja un nivel de severidad, y uno que afecta a más del 20% de las URLs con tráfico sube uno.
4. **Cerrar con entregable**: tabla priorizada con hallazgo, evidencia, severidad, corrección y responsable. Nunca terminar en un documento narrativo.

## 3. Núcleo de razonamiento

**a) La cadena es rastrear → renderizar → indexar → posicionar.** Un problema solo se arregla en el eslabón donde ocurre. Si la página no se rastrea, el título no importa; si no se indexa, el enlazado interno no importa. Diagnosticar siempre desde el eslabón más temprano.

**b) La severidad es consecuencia, no gravedad percibida.** P0 impide indexación o rastreo de URLs con tráfico o ingresos; P1 degrada a escala; P2 reduce CTR o elegibilidad; P3 es higiene. La consecuencia define el SLA, no la incomodidad estética.

**c) El presupuesto de rastreo se gasta.** Toda URL basura rastreada (faceta, parámetro, paginación infinita, redirección encadenada) es una URL valiosa que no se rastrea. Por eso las trampas de rastreo importan más que casi cualquier optimización on-page.

**d) La consolidación es lo que se mide, no lo que se declara.** Canonical, hreflang y sitemap son *señales*, no órdenes. Se verifica qué URL indexó realmente el buscador, no qué se le pidió.

## 4. Mapa de enrutamiento

Todo apunta a [seo-master.md](seo-master.md).

| Tema | Sección |
|---|---|
| Cómo usar el manual, principios, bloques y severidad | [0](seo-master.md#0-cómo-usar-este-manual) |
| Preparación, línea base, inventario de URLs por valor | [1](seo-master.md#1-fase-0-preparación-y-línea-base) |
| **Bloque A** — indexabilidad | [2](seo-master.md#2-bloque-a-indexabilidad-p0) |
| **Bloque A** — códigos de estado y redirecciones | [3](seo-master.md#3-bloque-a-códigos-de-estado-y-redirecciones-p0) |
| **Bloque A** — control de rastreo, robots.txt | [4](seo-master.md#4-bloque-a-control-de-rastreo-p0) |
| **Bloque B** — sitemaps | [5](seo-master.md#5-bloque-b-sitemaps) |
| **Bloque B** — análisis de logs y eficiencia de rastreo | [6](seo-master.md#6-bloque-b-análisis-de-logs-y-eficiencia-de-rastreo) |
| **Bloque B** — trampas de rastreo, facetas, paginación | [7](seo-master.md#7-bloque-b-trampas-de-rastreo-facetas-y-paginación) |
| **Bloque B** — arquitectura y enlazado interno | [8](seo-master.md#8-bloque-b-arquitectura-y-enlazado-interno) |
| **Bloque B** — renderizado y JavaScript | [9](seo-master.md#9-bloque-b-renderizado-y-javascript) |
| **Bloque B** — calidad de indexación y canibalización | [10](seo-master.md#10-bloque-b-calidad-de-indexación-y-canibalización) |
| **Bloque C** — URLs y canonicalización | [11](seo-master.md#11-bloque-c-urls-y-canonicalización) |
| **Bloque C** — metadatos y encabezados | [12](seo-master.md#12-bloque-c-metadatos-y-encabezados) |
| **Bloque C** — contenido | [13](seo-master.md#13-bloque-c-contenido) |
| **Bloque C** — rendimiento y Core Web Vitals | [14](seo-master.md#14-bloque-c-rendimiento-y-core-web-vitals) |
| **Bloque C** — imágenes y media | [15](seo-master.md#15-bloque-c-imágenes-y-media) |
| **Bloque C** — móvil y experiencia de usuario | [16](seo-master.md#16-bloque-c-móvil-y-experiencia-de-usuario) |
| **Bloque C** — datos estructurados y entidad | [17](seo-master.md#17-bloque-c-datos-estructurados-y-entidad) |
| **Bloque C** — visibilidad en búsqueda con IA | [18](seo-master.md#18-bloque-c-visibilidad-en-búsqueda-con-ia) |
| **Bloque C** — seguridad | [19](seo-master.md#19-bloque-c-seguridad) |
| **Bloque C** — SEO internacional, hreflang | [20](seo-master.md#20-bloque-c-seo-internacional) |
| **Bloque D** — autoridad off-site | [21](seo-master.md#21-bloque-d-autoridad-off-site) |
| Analítica y medición | [22](seo-master.md#22-analítica-y-medición) |
| Migraciones | [23](seo-master.md#23-protocolo-de-migración) |
| Monitoreo continuo | [24](seo-master.md#24-monitoreo-continuo) |
| Entregable y priorización | [25](seo-master.md#25-entregable-y-priorización) |
| Umbrales · comandos · herramientas · criterios de descarte | [Anexos A–D](seo-master.md#anexo-a-tabla-maestra-de-umbrales) |

## 5. Cruces con otros skills

| Tema | Aquí | El otro lado |
|---|---|---|
| Rendimiento | Core Web Vitals medidos en campo, [sección 14](seo-master.md#14-bloque-c-rendimiento-y-core-web-vitals) | Latencia de servidor y caché: [../backend/performance/performance.md](../backend/performance/performance.md) |
| Códigos de estado y caché HTTP | Efecto sobre rastreo e indexación, [sección 3](seo-master.md#3-bloque-a-códigos-de-estado-y-redirecciones-p0) | Semántica del contrato: [../backend/api/api.md](../backend/api/api.md) |
| Seguridad del sitio | HTTPS, cabeceras, spam inyectado, [sección 19](seo-master.md#19-bloque-c-seguridad) | Superficie de ataque real: [../security/web/web.md](../security/web/web.md) |
| Migración sin romper nada | [Sección 23](seo-master.md#23-protocolo-de-migración) | Expandir/contraer y compatibilidad: [../backend/delivery/delivery.md](../backend/delivery/delivery.md) |

## 6. Límites

- No se prometen posiciones ni plazos de recuperación: se corrigen causas verificables y se mide el efecto.
- No se recomiendan tácticas de manipulación de enlaces ni de contenido generado a escala para engañar al buscador.
- Las herramientas y sus límites de uso cambian; verificar en el [Anexo C](seo-master.md#anexo-c-herramientas-por-función) antes de citarlos en un entregable.
- El manual está fechado (2026-07). Los umbrales de Core Web Vitals y las funciones de los buscadores caducan: confirmar antes de auditar con ellos.
