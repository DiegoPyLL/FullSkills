# Manual de Auditoría Técnica SEO (2026)

> Documento de ejecución, no de lectura. Cada verificación tiene un criterio de aprobación medible, un método de medición y una severidad. Si un ítem no puede aprobarse o reprobarse sin discusión, no pertenece a este manual.

**Versión:** 1.0
**Última revisión:** 2026-07

---

## Índice

- [0. Cómo usar este manual](#0-cómo-usar-este-manual)
- [1. Fase 0, preparación y línea base](#1-fase-0-preparación-y-línea-base)
- [2. Bloque A, indexabilidad (P0)](#2-bloque-a-indexabilidad-p0)
- [3. Bloque A, códigos de estado y redirecciones (P0)](#3-bloque-a-códigos-de-estado-y-redirecciones-p0)
- [4. Bloque A, control de rastreo (P0)](#4-bloque-a-control-de-rastreo-p0)
- [5. Bloque B, sitemaps](#5-bloque-b-sitemaps)
- [6. Bloque B, análisis de logs y eficiencia de rastreo](#6-bloque-b-análisis-de-logs-y-eficiencia-de-rastreo)
- [7. Bloque B, trampas de rastreo, facetas y paginación](#7-bloque-b-trampas-de-rastreo-facetas-y-paginación)
- [8. Bloque B, arquitectura y enlazado interno](#8-bloque-b-arquitectura-y-enlazado-interno)
- [9. Bloque B, renderizado y JavaScript](#9-bloque-b-renderizado-y-javascript)
- [10. Bloque B, calidad de indexación y canibalización](#10-bloque-b-calidad-de-indexación-y-canibalización)
- [11. Bloque C, URLs y canonicalización](#11-bloque-c-urls-y-canonicalización)
- [12. Bloque C, metadatos y encabezados](#12-bloque-c-metadatos-y-encabezados)
- [13. Bloque C, contenido](#13-bloque-c-contenido)
- [14. Bloque C, rendimiento y Core Web Vitals](#14-bloque-c-rendimiento-y-core-web-vitals)
- [15. Bloque C, imágenes y media](#15-bloque-c-imágenes-y-media)
- [16. Bloque C, móvil y experiencia de usuario](#16-bloque-c-móvil-y-experiencia-de-usuario)
- [17. Bloque C, datos estructurados y entidad](#17-bloque-c-datos-estructurados-y-entidad)
- [18. Bloque C, visibilidad en búsqueda con IA](#18-bloque-c-visibilidad-en-búsqueda-con-ia)
- [19. Bloque C, seguridad](#19-bloque-c-seguridad)
- [20. Bloque C, SEO internacional](#20-bloque-c-seo-internacional)
- [21. Bloque D, autoridad off-site](#21-bloque-d-autoridad-off-site)
- [22. Analítica y medición](#22-analítica-y-medición)
- [23. Protocolo de migración](#23-protocolo-de-migración)
- [24. Monitoreo continuo](#24-monitoreo-continuo)
- [25. Entregable y priorización](#25-entregable-y-priorización)
- [Anexo A. Tabla maestra de umbrales](#anexo-a-tabla-maestra-de-umbrales)
- [Anexo B. Comandos y consultas útiles](#anexo-b-comandos-y-consultas-útiles)
- [Anexo C. Herramientas por función](#anexo-c-herramientas-por-función)
- [Anexo D. Criterios de descarte](#anexo-d-criterios-de-descarte)

---

## 0. Cómo usar este manual

### 0.1 Principios

1. **Todo ítem tiene umbral.** Si el criterio de aprobación no es verificable por dos auditores distintos con el mismo resultado, el ítem se elimina o se reformula.
2. **La ejecución es secuencial por bloques.** No se pasa al siguiente bloque si el anterior tiene un P0 abierto. Optimizar CLS en un sitio con `noindex` global es trabajo perdido.
3. **Ninguna URL vale lo mismo.** Toda verificación se pondera por el valor de negocio de las URLs afectadas (ver 1.2).
4. **La salida es una tabla priorizada**, no un documento narrativo (ver sección 25).

### 0.2 Bloques y severidad

| Bloque | Contenido | Consecuencia si falla |
|---|---|---|
| **A** | Indexabilidad, estados HTTP, control de rastreo | El sitio desaparece o nunca entra al índice |
| **B** | Rastreo eficiente, arquitectura, renderizado, calidad de índice | Páginas correctas nunca se descubren, se rastrean o se consolidan |
| **C** | Metadatos, contenido, rendimiento, schema, IA, seguridad, i18n | Pérdida de CTR, elegibilidad y competitividad marginal |
| **D** | Autoridad off-site | Techo de competitividad a mediano plazo |

| Severidad | Definición operativa | SLA de corrección |
|---|---|---|
| **P0** | Impide indexación o rastreo de URLs con tráfico o ingresos | 24 a 48 horas |
| **P1** | Degrada indexación, consolidación o descubrimiento a escala | 2 semanas |
| **P2** | Reduce rendimiento, CTR o elegibilidad de features | Próximo ciclo (30 días) |
| **P3** | Higiene, deuda técnica, mejora incremental | Backlog |

**Regla de escalado:** cualquier ítem P1 o P2 que afecte a más del 20% de las URLs con tráfico sube un nivel de severidad. Cualquier ítem que afecte solo a URLs sin tráfico ni impresiones en 90 días baja un nivel.

### 0.3 Alcance y muestreo por tamaño de sitio

| Tamaño (URLs canónicas) | Estrategia de rastreo | Logs | Duración estimada |
|---|---|---|---|
| < 1.000 | Crawl completo, revisión manual de plantillas | Opcional | 4 a 8 horas |
| 1.000 a 50.000 | Crawl completo, muestreo manual por plantilla | Recomendado | 2 a 4 días |
| 50.000 a 500.000 | Crawl completo con límites, muestreo estratificado por plantilla | Obligatorio | 1 a 2 semanas |
| > 500.000 | Muestreo estratificado (mínimo 500 URLs por plantilla), sin crawl completo | Obligatorio y prioritario | 2 a 4 semanas |

**Muestreo estratificado:** identificar cada plantilla (home, categoría, listado filtrado, detalle, artículo, paginación, autor, tag, búsqueda interna). Auditar mínimo 30 URLs por plantilla, seleccionadas al azar, más las 20 URLs de mayor tráfico de cada plantilla.

### 0.4 Requisitos previos

Sin esto, la auditoría no arranca:

- [ ] Acceso a Google Search Console (propiedad de dominio, no de prefijo de URL)
- [ ] Acceso a Bing Webmaster Tools
- [ ] Acceso a la analítica (GA4 u otra) con al menos 12 meses de datos
- [ ] Logs de servidor crudos, mínimo 30 días (idealmente 90), en formato combinado
- [ ] Acceso al CMS o al repositorio
- [ ] Lista de plantillas y tecnologías (framework, SSR/CSR/ISR, CDN, WAF)
- [ ] Whitelist de IP o user-agent para el crawler, si hay WAF o rate limiting
- [ ] Definición de conversión y su valor monetario aproximado

### 0.5 Configuración del crawler (referencia)

| Parámetro | Valor por defecto |
|---|---|
| User-Agent | Googlebot Smartphone |
| Renderizado | JavaScript activado, y una segunda pasada sin JS para comparar |
| Velocidad | 5 URLs/s (bajar a 1 si el servidor devuelve 5xx o 429) |
| Respetar robots.txt | Sí en la pasada 1, no en la pasada 2 (para ver qué se está bloqueando) |
| Profundidad máxima | Sin límite en pasada 1 |
| Fuentes de URL | Crawl + sitemap + GSC + analítica + logs (crawl híbrido obligatorio para detectar huérfanas) |

---

## 1. Fase 0, preparación y línea base

Ninguna recomendación tiene sentido sin saber qué páginas importan y qué pasó antes.

### 1.1 Línea base histórica

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| 0.1 | Tendencia de clics e impresiones a 16 meses | Documentada, con caídas anotadas | GSC, exportación de rendimiento | Info |
| 0.2 | Correlación de caídas con actualizaciones de algoritmo | Cada caída >15% tiene hipótesis asociada | GSC + calendario de updates | Info |
| 0.3 | Correlación de caídas con releases o migraciones | Cada caída >15% cruzada con el changelog | Git log o registro de despliegues | Info |
| 0.4 | Tendencia de páginas indexadas | Sin variación >10% sin causa identificada | GSC, informe Páginas | Info |
| 0.5 | Tendencia de estadísticas de rastreo | Sin caída sostenida de solicitudes | GSC, Estadísticas de rastreo | Info |

### 1.2 Clasificación de URLs por valor

Genera un inventario único con esta estructura. Es la columna vertebral de toda la priorización posterior.

| Campo | Fuente |
|---|---|
| URL | Crawl |
| Plantilla | Clasificación manual o por patrón de ruta |
| Clics 90 días | GSC |
| Impresiones 90 días | GSC |
| Sesiones orgánicas 90 días | Analítica |
| Conversiones 90 días | Analítica |
| Ingreso atribuido | Analítica |
| Enlaces internos entrantes | Crawl |
| Dominios de referencia | Ahrefs, Semrush |
| Hits de Googlebot 30 días | Logs |
| Estado en índice | GSC, API de inspección de URL |

**Niveles resultantes:**

- **Tier 1:** URLs que generan >80% acumulado de ingresos o conversiones. Cualquier fallo aquí es como mínimo P1.
- **Tier 2:** URLs con tráfico pero sin conversión directa (informacionales, soporte de embudo).
- **Tier 3:** URLs con impresiones pero sin clics.
- **Tier 4:** URLs sin impresiones ni clics en 90 días. Candidatas a poda o a no-indexación.

---

## 2. Bloque A, indexabilidad (P0)

### 2.1 Accesibilidad base

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| A1.1 | Resolución DNS estable | 100% de éxito en 20 consultas consecutivas | `dig`, monitoreo externo | P0 |
| A1.2 | Home responde 200 a Googlebot | 200 en 10/10 intentos | `curl -A "Googlebot"` | P0 |
| A1.3 | Sin bloqueo por WAF o rate limiting a bots legítimos | 0 respuestas 403/429 a Googlebot en logs | Logs, filtro por UA verificado | P0 |
| A1.4 | Sin restricción por geolocalización de IP | Respuesta 200 desde IP de EEUU y de la región objetivo | Proxy o herramienta multi-región | P0 |
| A1.5 | Sin autenticación en URLs públicas | 0 URLs Tier 1 o 2 detrás de login | Crawl sin cookies | P0 |
| A1.6 | Verificación inversa de Googlebot | 100% de los hits atribuidos a Googlebot pasan rDNS | rDNS + forward DNS sobre logs | P1 |

### 2.2 Directivas de indexación

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| A2.1 | Sin `noindex` en URLs Tier 1 a 3 | 0 casos | Crawl, columna meta robots | P0 |
| A2.2 | Sin `X-Robots-Tag: noindex` en cabecera | 0 casos en URLs indexables | `curl -I`, crawl con captura de cabeceras | P0 |
| A2.3 | Coherencia entre meta robots y cabecera HTTP | 0 conflictos (si hay conflicto, gana la más restrictiva) | Crawl | P0 |
| A2.4 | Sin `noindex` inyectado por JavaScript | HTML renderizado y crudo coinciden en directivas | Crawl con y sin JS | P0 |
| A2.5 | `nofollow` a nivel de página solo donde es intencional | Lista de excepciones documentada | Crawl | P1 |
| A2.6 | Sin combinación `noindex` + `Disallow` en robots.txt | 0 casos (impide que Google vea el noindex) | Cruce crawl + robots.txt | P1 |
| A2.7 | Sin uso de la directiva obsoleta `noarchive`/`nosnippet` no intencional | Documentado o eliminado | Crawl | P3 |
| A2.8 | `max-image-preview:large` presente donde interesa aparecer con imagen | Presente en plantillas de artículo y producto | Crawl | P3 |

### 2.3 Entornos y duplicación de dominio

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| A3.1 | Staging, dev, QA no indexados | 0 resultados en `site:` para subdominios internos | Búsqueda `site:`, GSC | P0 |
| A3.2 | Staging protegido por autenticación HTTP, no solo por robots.txt | 401/403 sin credenciales | `curl` | P0 |
| A3.3 | Una sola versión canónica de dominio accesible | 3 de 4 variantes (http, https, www, no-www) redirigen 301 a la canónica en un solo salto | `curl -IL` sobre las 4 variantes | P0 |
| A3.4 | Sin dominios espejo o de prueba indexados | 0 duplicados detectados | Búsqueda por fragmento exacto de contenido | P0 |
| A3.5 | Sin CDN o subdominio sirviendo copia completa | 0 casos | Crawl externo, Ahrefs | P1 |

### 2.4 Soft 404 y contenido vacío

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| A4.1 | Páginas de error devuelven 404 o 410, no 200 | 0 soft 404 en el informe de GSC | GSC, informe Páginas | P1 |
| A4.2 | Resultados de búsqueda interna vacíos no devuelven 200 indexable | 404 o `noindex` | Prueba manual con término inexistente | P1 |
| A4.3 | Categorías o listados sin ítems no devuelven 200 indexable | 404, 410 o `noindex` | Crawl, filtro por conteo de palabras bajo | P1 |
| A4.4 | Páginas con menos de 50 palabras de contenido único | 0 en Tier 1 a 3 | Crawl, columna word count | P2 |
| A4.5 | Página 404 personalizada útil, con enlaces de recuperación | Existe, con navegación y buscador | Revisión manual | P3 |

---

## 3. Bloque A, códigos de estado y redirecciones (P0)

### 3.1 Inventario de estados

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| B1.1 | Proporción de 5xx en logs | < 0,1% de las solicitudes de bot | Logs, agrupado por código | P0 |
| B1.2 | Proporción de 4xx en logs | < 2% de las solicitudes de bot | Logs | P1 |
| B1.3 | Enlaces internos apuntando a 404 | 0 desde plantillas, < 0,5% del total | Crawl, informe de enlaces rotos | P1 |
| B1.4 | Enlaces internos apuntando a redirecciones | < 1% del total de enlaces internos | Crawl | P2 |
| B1.5 | Sin 503 permanentes o mal usados | 503 solo durante mantenimiento planificado, con `Retry-After` | Logs, monitoreo | P1 |
| B1.6 | Sin 429 a bots verificados | 0 casos | Logs | P1 |
| B1.7 | Sin códigos 999, 418 u otros no estándar | 0 casos | Logs, crawl | P2 |

### 3.2 Redirecciones

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| B2.1 | Cadenas de redirección | 0 cadenas con más de 1 salto | Crawl, informe de cadenas | P2 |
| B2.2 | Bucles de redirección | 0 casos | Crawl | P0 |
| B2.3 | Uso correcto de 301 vs 302 | 302 solo en casos temporales documentados | Crawl | P2 |
| B2.4 | Redirecciones no gestionadas por JavaScript o meta refresh | 0 casos en rutas Tier 1 a 3 | Crawl, comparación con y sin JS | P1 |
| B2.5 | Redirecciones apuntan a página equivalente, no a la home | > 95% a destino temáticamente equivalente | Muestreo manual de 50 redirecciones | P1 |
| B2.6 | Sin redirecciones en el sitemap | 0 URLs del sitemap devuelven 3xx | Crawl del sitemap | P2 |
| B2.7 | Redirecciones preservan protocolo, host y parámetros relevantes | Muestreo sin pérdidas | `curl -IL` | P2 |

---

## 4. Bloque A, control de rastreo (P0)

### 4.1 robots.txt

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| C1.1 | Existe y responde 200 | 200, `text/plain`, < 500 KB | `curl` | P0 |
| C1.2 | Sin `Disallow: /` global | 0 casos para user-agents de buscadores | Lectura directa | P0 |
| C1.3 | Sintaxis válida, sin reglas contradictorias | 0 errores en el validador | Probador de robots.txt de GSC | P1 |
| C1.4 | CSS, JS e imágenes rastreables | 0 recursos bloqueados que afecten al renderizado | Prueba de URL en vivo de GSC, sección de recursos | P0 |
| C1.5 | Bloqueos intencionales documentados | Cada `Disallow` tiene justificación escrita | Revisión del archivo | P2 |
| C1.6 | Referencia absoluta al sitemap index | Presente, URL absoluta y funcional | Lectura directa | P2 |
| C1.7 | Sin uso de `Crawl-delay` para Googlebot (lo ignora) | 0 casos, o ajuste vía GSC | Lectura directa | P3 |
| C1.8 | Directivas por user-agent en el orden correcto | El grupo más específico gana, verificado | Probador de robots.txt | P2 |
| C1.9 | Política explícita para crawlers de IA | Decisión documentada (ver sección 18) | Lectura directa | P2 |
| C1.10 | robots.txt no bloquea URLs que además llevan `noindex` | 0 casos | Cruce con el crawl | P1 |

### 4.2 Otros mecanismos de control

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| C2.1 | Sin `Disallow` aplicado a parámetros necesarios para renderizar | 0 casos | Prueba de URL en vivo | P1 |
| C2.2 | Uso de IndexNow para Bing y Yandex | Implementado si el sitio publica con frecuencia diaria | Bing Webmaster Tools | P3 |
| C2.3 | Sin dependencia de la herramienta de parámetros de URL (deprecada) | 0 dependencia | Revisión de configuración | P3 |

---

## 5. Bloque B, sitemaps

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| D1.1 | Sitemap index presente si hay más de 50.000 URLs | Presente | `curl` | P2 |
| D1.2 | Límites por archivo | ≤ 50.000 URLs y ≤ 50 MB sin comprimir | Conteo con script | P2 |
| D1.3 | Solo URLs canónicas, 200, indexables | 100%, tolerancia 0 | Crawl en modo lista sobre el sitemap | P1 |
| D1.4 | Sin URLs con `noindex`, 3xx, 4xx, 5xx | 0 casos | Crawl en modo lista | P1 |
| D1.5 | Cobertura de URLs Tier 1 a 3 | 100% presentes en el sitemap | Diferencia entre inventario y sitemap | P1 |
| D1.6 | `lastmod` refleja cambios reales de contenido | Muestreo de 20 URLs, 100% coherente | Comparación con historial del CMS | P2 |
| D1.7 | Sin `priority` ni `changefreq` (ignorados por Google) | Ausentes o irrelevantes | Lectura del XML | P3 |
| D1.8 | Generación automática al publicar o despublicar | Latencia < 24 horas | Prueba: publicar y verificar | P2 |
| D1.9 | Sitemap de imágenes cuando la búsqueda de imágenes aporta tráfico | Presente si imágenes > 5% de clics | GSC, informe por tipo de búsqueda | P3 |
| D1.10 | Sitemap de video con `VideoObject` coherente | Presente si hay video propio | GSC | P3 |
| D1.11 | Sitemap de noticias solo con contenido de últimas 48 horas | Cumple si aplica Google News | Validación | P3 |
| D1.12 | Enviado y sin errores en GSC y Bing | 0 errores, 0 advertencias críticas | GSC, BWT | P2 |
| D1.13 | URLs del sitemap coinciden exactamente con la canónica (protocolo, slash final, mayúsculas) | 100% | Comparación exacta de cadenas | P2 |

**Métrica clave:** ratio de indexación del sitemap = URLs indexadas / URLs enviadas. Objetivo ≥ 90% para Tier 1 a 3. Por debajo de 70% es un problema de calidad de contenido o de selección de URLs, no de configuración.

---

## 6. Bloque B, análisis de logs y eficiencia de rastreo

Obligatorio en sitios de más de 50.000 URLs. Es la única fuente que dice qué hace Google de verdad, en lugar de qué debería hacer.

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| E1.1 | Logs disponibles y completos | ≥ 30 días, sin muestreo, incluye UA, estado, tiempo de respuesta, bytes | Inspección del archivo | P1 |
| E1.2 | Bots verificados por rDNS antes de analizar | 100% de hits atribuidos verificados | Script de verificación inversa | P1 |
| E1.3 | Desperdicio de rastreo | < 20% de hits de Googlebot a URLs no canónicas, no indexables o de parámetros | Logs agrupados por patrón | P1 |
| E1.4 | Cobertura de rastreo de Tier 1 | 100% de URLs Tier 1 rastreadas al menos 1 vez en 30 días | Cruce logs vs inventario | P1 |
| E1.5 | Frecuencia de rastreo de Tier 1 | Coherente con la frecuencia de actualización del contenido | Logs, hits por URL | P2 |
| E1.6 | URLs huérfanas rastreadas | Identificadas y clasificadas (redirigir, canonicalizar o bloquear) | Logs vs crawl | P2 |
| E1.7 | Tiempo medio de respuesta a Googlebot | < 600 ms, p95 < 1.500 ms | Logs, campo de tiempo | P1 |
| E1.8 | Distribución de estados a Googlebot | ≥ 95% de 200 y 304 | Logs agrupados por código | P1 |
| E1.9 | Rastreo de recursos estáticos vs HTML | Estáticos < 30% de los hits (si es mayor, revisar caché y `304`) | Logs por tipo de contenido | P2 |
| E1.10 | Detección de picos de rastreo en patrones basura | 0 patrones con crecimiento no explicado | Logs, series de tiempo | P1 |
| E1.11 | Rastreo por crawlers de IA cuantificado | Volumen y coste conocidos | Logs filtrados por UA de IA | P3 |

---

## 7. Bloque B, trampas de rastreo, facetas y paginación

Esta es la sección que decide el destino de cualquier ecommerce, marketplace o agregador de listados.

### 7.1 Trampas de rastreo

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| F1.1 | Sin espacios de URL infinitos (calendarios, paginación sin límite, filtros combinables) | 0 patrones que generen URLs ilimitadas | Crawl con límite de profundidad + logs | P0 |
| F1.2 | Ratio URLs rastreables / URLs canónicas | ≤ 3:1 | Conteo del crawl vs inventario canónico | P1 |
| F1.3 | Sin rutas relativas mal resueltas que generen anidamiento infinito | 0 casos (`/a/b/a/b/a/...`) | Crawl, análisis de profundidad | P0 |
| F1.4 | Sin IDs de sesión ni tracking en URLs internas | 0 casos | Crawl, filtro por parámetros | P1 |
| F1.5 | Búsqueda interna no rastreable | `Disallow` o `noindex` en la ruta de búsqueda | robots.txt, crawl | P1 |
| F1.6 | Ordenamientos (`?sort=`, `?order=`) no indexables | Canonical a la versión sin parámetro, o `Disallow` | Crawl | P1 |

### 7.2 Navegación facetada

Define y documenta una matriz de decisión por combinación de filtros. Sin esta matriz escrita, el sitio no está auditado.

| Combinación | Tratamiento | Criterio |
|---|---|---|
| Filtro único con demanda de búsqueda comprobada | Indexable, canonical autorreferencial, enlazada en HTML | Volumen de búsqueda > umbral definido y contenido diferenciado |
| Filtro único sin demanda | Canonical a la categoría padre | Sin volumen relevante |
| Dos o más filtros combinados | `noindex, follow` o bloqueo en robots.txt | Combinatoria explosiva |
| Filtros de ordenamiento y vista | Nunca indexables | No cambian el conjunto de resultados |
| Filtros de rango (precio, año) | Nunca indexables salvo excepción documentada | Cardinalidad alta |

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| F2.1 | Matriz de facetas documentada y aplicada | Existe y el crawl la refleja al 100% | Documento + crawl | P1 |
| F2.2 | Enlaces a facetas no indexables sin `<a href>` rastreable, o bloqueados | 0 fugas de rastreo | Crawl, análisis de enlaces salientes | P1 |
| F2.3 | Sin canonical desde faceta indexable a otra página | 0 casos | Crawl | P1 |
| F2.4 | Facetas indexables tienen title, H1 y contenido diferenciados | 100% | Crawl, muestreo | P2 |

### 7.3 Paginación

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| F3.1 | Páginas 2+ con canonical autorreferencial, no a la página 1 | 100% | Crawl | P1 |
| F3.2 | Páginas 2+ indexables (`index, follow`) salvo decisión documentada | Coherente en 100% de las plantillas | Crawl | P2 |
| F3.3 | Enlaces de paginación en HTML crudo, no solo por JS | 100% descubribles sin JS | Crawl sin JS | P1 |
| F3.4 | Sin scroll infinito como único mecanismo de acceso | Existe paginación paralela rastreable | Revisión manual | P1 |
| F3.5 | Profundidad máxima de paginación acotada | Ninguna URL a más de 5 clics vía paginación | Crawl, columna de profundidad | P2 |
| F3.6 | Títulos de páginas 2+ diferenciados | Incluyen indicador de página | Crawl | P3 |
| F3.7 | Sin `rel=next/prev` como única señal (Google ya no la usa como directiva de indexación) | No se depende de ella | Crawl | P3 |

---

## 8. Bloque B, arquitectura y enlazado interno

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| G1.1 | Profundidad de clic de URLs Tier 1 | ≤ 3 clics desde la home | Crawl, columna de profundidad | P1 |
| G1.2 | Profundidad máxima del sitio | ≤ 5 clics para el 95% de URLs indexables | Crawl | P2 |
| G1.3 | Páginas huérfanas | 0 en Tier 1 a 3 | Crawl híbrido (crawl + sitemap + GSC + analítica + logs) | P1 |
| G1.4 | Enlaces internos entrantes por URL Tier 1 | ≥ 10 desde páginas distintas | Crawl, informe inlinks | P2 |
| G1.5 | Enlaces internos entrantes por URL indexable | ≥ 1, ideal ≥ 3 | Crawl | P2 |
| G1.6 | Anchor text descriptivo | < 5% de anchors genéricos ("aquí", "leer más") en enlaces contextuales | Crawl, informe de anchors | P2 |
| G1.7 | Diversidad de anchor hacia una misma URL | Sin un único anchor exacto en más del 80% de los enlaces | Crawl | P3 |
| G1.8 | Enlaces en HTML crudo con `<a href>` | 100% de los enlaces de navegación principal | Crawl sin JS | P1 |
| G1.9 | Sin `nofollow` interno para esculpir PageRank | 0 casos | Crawl | P2 |
| G1.10 | Breadcrumbs presentes y coherentes con la jerarquía de URL | 100% de plantillas de detalle | Crawl, revisión manual | P2 |
| G1.11 | Breadcrumbs con `BreadcrumbList` en JSON-LD | 100% de las páginas con breadcrumb visible | Validador de resultados enriquecidos | P2 |
| G1.12 | Sin ciclos de navegación redundantes | Cada URL alcanzable por al menos una ruta lógica | Crawl, análisis de grafo | P3 |
| G1.13 | Correspondencia entre jerarquía de URL y jerarquía de navegación | > 90% de coherencia | Muestreo | P3 |
| G1.14 | Distribución de enlaces internos correlacionada con valor de negocio | Tier 1 recibe más enlaces que Tier 4 | Cruce inlinks vs inventario | P2 |
| G1.15 | Sin más de 300 enlaces por página en plantillas clave | Cumple, o justificado | Crawl, conteo de outlinks | P3 |

---

## 9. Bloque B, renderizado y JavaScript

Fase de mayor riesgo en stacks modernos. Se audita comparando tres estados: HTML crudo, DOM renderizado y lo que ve Google.

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| H1.1 | Contenido principal presente en el HTML crudo | ≥ 90% del texto del cuerpo | `curl` vs DOM renderizado, comparación de conteo de palabras | P1 |
| H1.2 | Title, meta description, canonical y meta robots en HTML crudo | 100% | `curl` | P1 |
| H1.3 | Enlaces internos en HTML crudo | ≥ 95% de los enlaces del DOM final | Crawl con y sin JS, diferencia | P1 |
| H1.4 | Sin discrepancia de canonical entre crudo y renderizado | 0 casos | Comparación | P0 |
| H1.5 | Sin discrepancia de meta robots entre crudo y renderizado | 0 casos | Comparación | P0 |
| H1.6 | Contenido no depende de interacción (clic, scroll, hover) | 100% del contenido indexable visible sin interacción | Prueba manual con JS activo y sin interacción | P1 |
| H1.7 | Sin navegación exclusiva por `onclick`, `router.push` o `<div>` clicable | 0 casos en navegación principal | Inspección del DOM | P1 |
| H1.8 | Prueba de URL en vivo de GSC muestra el contenido completo | 100% en muestreo de 10 URLs por plantilla | GSC, captura renderizada | P1 |
| H1.9 | Tiempo hasta contenido renderizado | < 5 s en conexión simulada 4G | Lighthouse, WebPageTest | P2 |
| H1.10 | Sin errores de JS que bloqueen el render | 0 errores en consola en carga inicial | DevTools, crawl con captura de consola | P2 |
| H1.11 | Recursos críticos no bloqueados por robots.txt ni por CORS | 0 bloqueos | Prueba de URL en vivo, sección de recursos | P0 |
| H1.12 | Sin dependencia de cookies, localStorage o sesión para mostrar contenido | 100% accesible en contexto sin estado | Navegación en incógnito sin JS de terceros | P1 |
| H1.13 | Estrategia de renderizado documentada por plantilla (SSR, SSG, ISR, CSR) | Documento existe y coincide con la realidad | Revisión de código + verificación | P2 |
| H1.14 | Sin cloaking accidental (respuesta distinta a bot y a usuario) | Contenido equivalente para Googlebot y Chrome | Comparación de respuestas por UA | P0 |
| H1.15 | Fallback de contenido si la API de datos falla | Página devuelve 5xx, no un 200 vacío | Prueba con API caída o simulada | P1 |
| H1.16 | Hidratación no altera contenido indexable | Texto pre y post hidratación equivalente | Comparación de DOM en dos momentos | P2 |

---

## 10. Bloque B, calidad de indexación y canibalización

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| I1.1 | Ratio de indexación global | Indexadas / canónicas indexables ≥ 90% | GSC informe Páginas vs inventario | P1 |
| I1.2 | "Descubierta, actualmente sin indexar" | < 5% del total, y 0 en Tier 1 a 2 | GSC | P1 |
| I1.3 | "Rastreada, actualmente sin indexar" | < 10%, con causa diagnosticada por plantilla | GSC | P1 |
| I1.4 | "Duplicada, Google eligió otra canónica" | < 5%, y 0 en Tier 1 | GSC | P1 |
| I1.5 | "Alternativa con etiqueta canónica correcta" coherente con lo esperado | Volumen explicable | GSC | P2 |
| I1.6 | URLs indexadas no presentes en el sitemap | 0 en Tier 1 a 3 | Cruce GSC vs sitemap | P2 |
| I1.7 | Canibalización de consultas | 0 consultas Tier 1 con más de 1 URL alternando en el top 20 | GSC, exportación consulta + página | P2 |
| I1.8 | Contenido duplicado interno | 0 grupos con similitud ≥ 90% sin canonical | Crawl con detección de near-duplicates | P2 |
| I1.9 | Contenido duplicado externo (sindicación, scraping) | Casos identificados y con estrategia (canonical cross-domain o retirada) | Búsqueda por fragmento exacto, Copyscape | P3 |
| I1.10 | Contenido delgado en Tier 3 y 4 | Plan de poda o consolidación documentado | Inventario, filtro por palabras y rendimiento | P2 |
| I1.11 | Contenido generado automáticamente sin valor añadido | 0 páginas de plantilla vacía indexables | Muestreo por plantilla | P1 |
| I1.12 | Índice de Bing coherente con el de Google | Diferencia < 20% | BWT vs GSC | P3 |

**Criterio de poda:** URL con 0 clics, < 50 impresiones y 0 conversiones en 180 días, sin enlaces externos, y sin función de navegación. Acción: consolidar con 301 hacia el equivalente más fuerte, o eliminar con 410.

---

## 11. Bloque C, URLs y canonicalización

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| J1.1 | Canonical presente en el 100% de las páginas indexables | 100% | Crawl | P1 |
| J1.2 | Canonical autorreferencial salvo excepción documentada | > 95% | Crawl | P1 |
| J1.3 | Canonical absoluto, con protocolo y host correctos | 100% | Crawl | P2 |
| J1.4 | Canonical apunta a URL 200 e indexable | 100% | Crawl | P1 |
| J1.5 | Sin cadenas de canonical (A→B→C) | 0 casos | Crawl | P1 |
| J1.6 | Un solo elemento canonical por página | 0 duplicados en el HTML | Crawl | P1 |
| J1.7 | Sin conflicto entre canonical y `hreflang` | 0 casos | Crawl, validador hreflang | P1 |
| J1.8 | Sin conflicto entre canonical y sitemap | 100% coincidencia | Comparación | P2 |
| J1.9 | Consistencia de slash final | Una sola forma, la otra redirige 301 | `curl -IL` | P2 |
| J1.10 | Consistencia de mayúsculas | Solo minúsculas, variantes redirigen | Crawl, logs | P2 |
| J1.11 | Longitud de URL | ≤ 100 caracteres para el 95% | Crawl | P3 |
| J1.12 | Sin caracteres especiales, espacios o acentos sin codificar | 0 casos | Crawl | P3 |
| J1.13 | Estructura descriptiva y estable | Sin IDs numéricos como único identificador en Tier 1 | Revisión manual | P3 |
| J1.14 | Parámetros de tracking no generan URLs indexables | Canonical a la versión limpia, 100% | Crawl con parámetros de prueba | P2 |

---

## 12. Bloque C, metadatos y encabezados

### 12.1 Title

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| K1.1 | Presente en el 100% de las páginas indexables | 100% | Crawl | P2 |
| K1.2 | Único | 0 duplicados en Tier 1 a 3 | Crawl, informe de duplicados | P2 |
| K1.3 | Longitud | 30 a 60 caracteres, o ≤ 580 px | Crawl, columna de píxeles | P3 |
| K1.4 | Un solo elemento `<title>` en el `<head>` | 100% | Crawl | P2 |
| K1.5 | No reescrito por Google en más del 30% de las consultas relevantes | Muestreo de 20 URLs Tier 1 en SERP | Comparación manual o herramienta | P3 |
| K1.6 | Contiene el término principal de la intención de la página | > 90% en muestreo | Revisión manual | P2 |

### 12.2 Meta description

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| K2.1 | Presente en Tier 1 a 3 | 100% | Crawl | P3 |
| K2.2 | Única | 0 duplicados en Tier 1 | Crawl | P3 |
| K2.3 | Longitud | 110 a 160 caracteres | Crawl | P3 |
| K2.4 | CTR por debajo de la media de su posición | Páginas identificadas y reescritas | GSC, CTR vs curva esperada por posición | P2 |

### 12.3 Encabezados

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| K3.1 | Un solo H1 por página | 100% | Crawl | P3 |
| K3.2 | H1 presente | 100% en Tier 1 a 3 | Crawl | P2 |
| K3.3 | Jerarquía sin saltos (H1→H2→H3) | > 95% de las páginas | Crawl, auditoría de accesibilidad | P3 |
| K3.4 | Encabezados descriptivos, no genéricos | Muestreo manual aprobado | Revisión | P3 |
| K3.5 | Encabezados no usados solo por estilo visual | 0 casos de H2 usados como texto destacado | Inspección del DOM | P3 |

### 12.4 Social y previsualización

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| K4.1 | `og:title`, `og:description`, `og:image`, `og:url`, `og:type` | Presentes en el 100% de Tier 1 a 3 | Crawl | P3 |
| K4.2 | `og:image` accesible, ≥ 1200x630 px, < 5 MB | 100% | Validador de enlaces | P3 |
| K4.3 | `twitter:card` y campos asociados | Presentes | Crawl | P3 |
| K4.4 | Previsualización correcta en las plataformas objetivo | Muestreo aprobado | Validadores oficiales | P3 |
| K4.5 | `lang` declarado en `<html>` y correcto | 100% | Crawl | P2 |

---

## 13. Bloque C, contenido

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| L1.1 | Intención de búsqueda cubierta por tipo de página | Muestreo de 20 consultas Tier 1, el formato coincide con el de los top 10 | Análisis manual de SERP | P2 |
| L1.2 | Contenido original, no reescritura de la competencia | 0 casos de similitud alta con fuente externa | Detector de plagio | P2 |
| L1.3 | Cobertura de subtemas frente a los competidores del top 10 | Sin ausencias críticas | Análisis de brechas | P2 |
| L1.4 | Actualización de contenido sensible al tiempo | 0 contenidos con datos de más de 24 meses en Tier 1 | Inventario con fecha | P2 |
| L1.5 | Fecha de publicación y actualización visibles y coherentes con el schema | 100% en plantillas de artículo | Crawl | P3 |
| L1.6 | Sin keyword stuffing | Densidad del término principal < 3% | Análisis de texto | P3 |
| L1.7 | Legibilidad adecuada al público | Definida y medida por plantilla | Índice de legibilidad | P3 |
| L1.8 | Contenido único por página frente a plantilla | ≥ 60% del texto es único respecto de otras páginas de la misma plantilla | Detección de near-duplicates | P2 |
| L1.9 | Sin contenido oculto detrás de pestañas o acordeones sin equivalente en el DOM | Presente en el DOM en 100% de los casos | Inspección | P3 |
| L1.10 | Autoría identificable y verificable en contenido YMYL | 100% con biografía y `sameAs` | Revisión + schema | P2 |
| L1.11 | Fuentes y referencias en contenido de datos | Presentes y enlazadas | Revisión manual | P3 |
| L1.12 | Contenido generado por usuarios moderado | 0 spam indexable | Muestreo, búsqueda de patrones de spam | P1 |

---

## 14. Bloque C, rendimiento y Core Web Vitals

**Regla base:** lo que decide es el dato de campo (CrUX, percentil 75 de sesiones en 28 días), no Lighthouse. Lighthouse solo sirve para diagnosticar la causa.

### 14.1 Core Web Vitals

| Métrica | Bueno | Mejorable | Malo |
|---|---|---|---|
| LCP | ≤ 2,5 s | 2,5 a 4,0 s | > 4,0 s |
| INP | ≤ 200 ms | 200 a 500 ms | > 500 ms |
| CLS | ≤ 0,1 | 0,1 a 0,25 | > 0,25 |

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| M1.1 | CWV en campo, móvil, por grupo de URL | 100% de grupos en "Bueno" | GSC informe de experiencia, CrUX | P2 |
| M1.2 | CWV en campo, escritorio | 100% de grupos en "Bueno" | GSC, CrUX | P2 |
| M1.3 | CWV segmentados por plantilla, no solo global | Análisis por plantilla existe | CrUX API, RUM propio | P2 |
| M1.4 | Datos RUM propios instrumentados | Presentes, con segmentación por dispositivo y país | `web-vitals` JS + endpoint | P3 |
| M1.5 | Elemento LCP identificado por plantilla | Documentado en 100% de las plantillas Tier 1 | DevTools, PageSpeed Insights | P2 |
| M1.6 | Imagen LCP con `fetchpriority="high"`, sin lazy loading | 100% | Inspección del HTML | P2 |
| M1.7 | Sin regresión de CWV tras releases | Alerta configurada, umbral 10% | RUM + CI | P3 |

### 14.2 Métricas de servidor y red

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| M2.1 | TTFB | ≤ 800 ms en p75 de campo | CrUX, RUM, logs | P2 |
| M2.2 | Peso total de la página, móvil | ≤ 1,5 MB, ideal ≤ 1 MB | WebPageTest | P2 |
| M2.3 | Número de solicitudes | ≤ 80 | WebPageTest | P3 |
| M2.4 | Compresión activa | Brotli o gzip en 100% de recursos de texto | Cabecera `content-encoding` | P2 |
| M2.5 | Cabeceras de caché en estáticos | `max-age` ≥ 1 año con hash en el nombre de archivo | `curl -I` | P2 |
| M2.6 | HTTP/2 o HTTP/3 activo | Sí | `curl --http3`, DevTools | P3 |
| M2.7 | CDN con presencia en la región de la audiencia | Sí, latencia < 50 ms desde el mercado objetivo | Prueba multi-región | P2 |
| M2.8 | Minificación de CSS y JS | 100% en producción | Inspección | P3 |
| M2.9 | JS sin usar en la carga inicial | < 30% del bundle | Cobertura de DevTools | P3 |
| M2.10 | CSS crítico en línea, resto diferido | Implementado en plantillas Tier 1 | Inspección | P3 |
| M2.11 | Fuentes con `font-display: swap` y precarga | 100% de fuentes propias | Inspección | P3 |
| M2.12 | Scripts de terceros auditados | Cada uno con dueño y justificación, ninguno bloqueante | Inventario + WebPageTest | P2 |
| M2.13 | Sin bloqueo de render por CSS o JS en el `<head>` | 0 recursos bloqueantes no críticos | Lighthouse | P2 |

---

## 15. Bloque C, imágenes y media

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| N1.1 | Formato moderno | WebP o AVIF en ≥ 90% de las imágenes de contenido | Crawl, columna de tipo MIME | P2 |
| N1.2 | Peso de la imagen LCP | ≤ 150 KB | WebPageTest | P2 |
| N1.3 | Peso del resto de imágenes | ≤ 100 KB cada una | Crawl | P3 |
| N1.4 | Dimensiones servidas coherentes con las mostradas | Sin imágenes más de 2x el tamaño de display | Lighthouse, auditoría de imágenes | P2 |
| N1.5 | `width` y `height` o `aspect-ratio` declarados | 100% (previene CLS) | Crawl | P2 |
| N1.6 | `loading="lazy"` en imágenes bajo el pliegue, nunca en la LCP | 100% correcto | Inspección | P2 |
| N1.7 | `srcset` y `sizes` para imágenes responsivas | Presentes en plantillas Tier 1 | Inspección | P3 |
| N1.8 | Atributo `alt` descriptivo en imágenes de contenido | 100%, `alt=""` en decorativas | Crawl | P2 |
| N1.9 | Nombres de archivo descriptivos | > 80% | Crawl | P3 |
| N1.10 | Imágenes accesibles a Googlebot (no bloqueadas, no hotlink protegido) | 100% | Crawl del recurso | P1 |
| N1.11 | Imágenes en el sitemap si aportan tráfico | Presentes | GSC | P3 |
| N1.12 | Video con transcripción y `VideoObject` | 100% del video propio | Validador | P3 |
| N1.13 | Video sin autoplay que degrade INP o consumo | Cumple | Revisión | P3 |

---

## 16. Bloque C, móvil y experiencia de usuario

Indexación mobile-first: la versión móvil es la versión que se indexa. Todo lo que no esté en móvil, no existe.

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| O1.1 | Paridad de contenido entre móvil y escritorio | 100% del contenido indexable presente en móvil | Comparación de DOM por UA | P0 |
| O1.2 | Paridad de enlaces internos | ≥ 95% | Crawl con UA móvil y escritorio | P1 |
| O1.3 | Paridad de datos estructurados | 100% | Comparación | P2 |
| O1.4 | Paridad de metadatos | 100% | Comparación | P2 |
| O1.5 | `viewport` declarado correctamente | 100% | Crawl | P2 |
| O1.6 | Sin scroll horizontal | 0 casos a 360 px de ancho | Prueba en DevTools | P2 |
| O1.7 | Tamaño de fuente del cuerpo | ≥ 16 px | Inspección | P3 |
| O1.8 | Objetivos táctiles | ≥ 48x48 px CSS, separación ≥ 8 px | Lighthouse | P3 |
| O1.9 | Intersticiales intrusivos | 0 en la carga inicial desde búsqueda | Revisión manual | P2 |
| O1.10 | Contraste de texto | ≥ 4,5:1 normal, ≥ 3:1 grande | Auditoría de accesibilidad | P3 |
| O1.11 | Navegación por teclado y foco visible | 100% de los elementos interactivos | axe, revisión manual | P3 |
| O1.12 | Formularios con etiquetas asociadas y errores accesibles | 100% | axe | P3 |
| O1.13 | Sin dependencia de hover para acceder a navegación | 0 casos | Prueba táctil | P2 |

---

## 17. Bloque C, datos estructurados y entidad

Ya no es un adorno. Es cómo las máquinas, incluidos los sistemas generativos, deciden qué entidad eres y qué pueden citar de ti.

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| P1.1 | Formato JSON-LD (no microdatos ni RDFa) | 100% | Crawl | P3 |
| P1.2 | Sin errores en el validador | 0 errores | Schema Markup Validator | P2 |
| P1.3 | Sin advertencias en tipos que afectan elegibilidad | 0 advertencias críticas | Prueba de resultados enriquecidos | P2 |
| P1.4 | Coherencia entre el schema y el contenido visible | 100% en muestreo de 20 URLs | Comparación manual | P1 |
| P1.5 | `Organization` en la home con `name`, `url`, `logo`, `sameAs`, datos de contacto | Presente y completo | Validador | P2 |
| P1.6 | `WebSite` con `SearchAction` si hay búsqueda interna | Presente | Validador | P3 |
| P1.7 | `BreadcrumbList` en todas las páginas con breadcrumb | 100% | Validador | P2 |
| P1.8 | `Product` con `offers`, `price`, `availability`, `aggregateRating` reales | 100% en plantillas de producto | Validador + Merchant Center | P2 |
| P1.9 | `Article` o `NewsArticle` con `author` (tipo `Person` con `sameAs`), `datePublished`, `dateModified` | 100% en artículos | Validador | P2 |
| P1.10 | `LocalBusiness` con NAP idéntico al de las fichas externas | 100% coincidencia | Comparación con Google Business Profile | P2 |
| P1.11 | `FAQPage` solo donde sigue siendo elegible (restringido desde 2023) | Sin uso especulativo | Prueba de resultados enriquecidos | P3 |
| P1.12 | `@id` estables para construir un grafo de entidades enlazadas | Implementado en Tier 1 | Revisión del JSON-LD | P3 |
| P1.13 | Sin marcado engañoso o de contenido inexistente | 0 casos (riesgo de acción manual) | Revisión | P1 |
| P1.14 | Errores de resultados enriquecidos en GSC | 0 elementos no válidos | GSC, informes de mejoras | P2 |
| P1.15 | Consistencia de entidad, NAP y descripción entre sitio, Wikidata, LinkedIn y directorios | 100% coincidencia en nombre y datos clave | Auditoría manual | P3 |

---

## 18. Bloque C, visibilidad en búsqueda con IA

El tráfico ya no viene solo de la SERP azul. Esta sección se audita por separado porque las decisiones son de negocio, no técnicas.

### 18.1 Política de acceso para crawlers de IA

Decisión explícita y documentada por cada agente. No decidir es decidir por omisión.

| User-Agent | Función | Decisión |
|---|---|---|
| `Google-Extended` | Entrenamiento de Gemini, no afecta indexación en Búsqueda | A definir |
| `GPTBot` | Entrenamiento de OpenAI | A definir |
| `OAI-SearchBot` | Indexación para búsqueda de ChatGPT | A definir |
| `ChatGPT-User` | Recuperación en tiempo real por petición del usuario | A definir |
| `ClaudeBot` / `Claude-User` | Entrenamiento y recuperación de Anthropic | A definir |
| `PerplexityBot` | Indexación de Perplexity | A definir |
| `CCBot` | Common Crawl, alimenta a múltiples modelos | A definir |
| `Bytespider`, `Amazonbot`, `Applebot-Extended` | Otros | A definir |

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| Q1.1 | Política documentada para cada agente de la tabla | 100% con decisión escrita y justificada | robots.txt + documento | P2 |
| Q1.2 | Bloqueo de entrenamiento no bloquea, por error, la recuperación que genera citaciones y tráfico | Distinción aplicada correctamente | robots.txt | P1 |
| Q1.3 | Coste de infraestructura del rastreo de IA cuantificado | Conocido | Logs, ancho de banda | P3 |
| Q1.4 | Sin bloqueo accidental de `OAI-SearchBot` o `PerplexityBot` si se busca visibilidad | Coherente con la estrategia | robots.txt | P2 |

### 18.2 Extractabilidad y citabilidad

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| Q2.1 | Respuesta directa a la pregunta principal en los primeros 200 caracteres del contenido | 100% en páginas informacionales Tier 1 | Revisión manual | P2 |
| Q2.2 | Estructura semántica con encabezados que replican preguntas reales | Muestreo aprobado | Revisión | P3 |
| Q2.3 | Datos clave en tablas o listas, no enterrados en párrafos | Aplicado en contenido comparativo | Revisión | P3 |
| Q2.4 | Contenido accesible sin JS (los crawlers de IA generalmente no renderizan) | ≥ 90% del texto en HTML crudo | `curl` | P1 |
| Q2.5 | Sin muros de pago o de registro en contenido que se quiere citado | Coherente con la estrategia | Revisión | P2 |
| Q2.6 | Consistencia factual entre páginas (precios, cifras, nombres) | 0 contradicciones internas | Auditoría de contenido | P2 |
| Q2.7 | Señales de autoría y experiencia verificables | Presentes en contenido YMYL | Revisión + schema | P2 |
| Q2.8 | `llms.txt` evaluado | Decisión documentada, con expectativa realista de que la adopción por parte de los grandes proveedores sigue siendo limitada | Documento | P3 |

### 18.3 Medición

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| Q3.1 | Tráfico de referencia desde asistentes de IA segmentado | Segmento creado en la analítica | Analítica, filtro por referrer | P2 |
| Q3.2 | Seguimiento de citaciones en AI Overviews para consultas Tier 1 | Medición periódica establecida | Herramienta de seguimiento o muestreo manual | P3 |
| Q3.3 | Caída de CTR en consultas con AI Overview cuantificada | Análisis realizado | GSC, comparación por consulta | P2 |
| Q3.4 | Impacto en conversión del tráfico de IA vs orgánico clásico | Medido | Analítica | P3 |

---

## 19. Bloque C, seguridad

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| R1.1 | HTTPS en el 100% de las URLs | 100% | Crawl | P0 |
| R1.2 | Certificado válido, no expirado, cadena completa | Grado A en SSL Labs | SSL Labs | P0 |
| R1.3 | Alerta de expiración de certificado | Configurada, 30 días de antelación | Monitoreo | P1 |
| R1.4 | Sin contenido mixto | 0 recursos por HTTP | Crawl, consola del navegador | P1 |
| R1.5 | HSTS con `max-age` ≥ 31536000 | Presente | `curl -I` | P2 |
| R1.6 | `X-Content-Type-Options: nosniff` | Presente | `curl -I` | P3 |
| R1.7 | `X-Frame-Options` o CSP `frame-ancestors` | Presente | `curl -I` | P3 |
| R1.8 | Content-Security-Policy definida | Presente y sin romper recursos | `curl -I` + consola | P3 |
| R1.9 | `Referrer-Policy` definida | Presente | `curl -I` | P3 |
| R1.10 | Sin páginas inyectadas o contenido hackeado | 0 resultados anómalos en `site:` | `site:` + búsqueda de términos típicos de spam | P0 |
| R1.11 | Sin cloaking hacia bots por compromiso de seguridad | Respuesta idéntica por UA | Comparación por UA | P0 |
| R1.12 | Sin advertencias en el informe de Seguridad de GSC | 0 problemas | GSC | P0 |
| R1.13 | Sin enlaces salientes a sitios comprometidos | 0 casos | Crawl de outlinks + revisión | P2 |
| R1.14 | Dependencias sin vulnerabilidades conocidas críticas | 0 críticas | `npm audit`, Dependabot | P2 |

---

## 20. Bloque C, SEO internacional

Aplica solo si hay más de un idioma o región. Si no aplica, se marca N/A y se documenta.

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| S1.1 | Estrategia de estructura definida (ccTLD, subdominio, subdirectorio) | Documentada y coherente | Revisión | P2 |
| S1.2 | `hreflang` presente en todas las versiones | 100% | Crawl | P1 |
| S1.3 | Reciprocidad de `hreflang` | 100% de los pares se referencian mutuamente | Validador de hreflang | P1 |
| S1.4 | Autorreferencia en cada conjunto de `hreflang` | 100% | Crawl | P1 |
| S1.5 | `x-default` definido | Presente | Crawl | P2 |
| S1.6 | Códigos válidos (ISO 639-1 idioma, ISO 3166-1 alpha-2 región) | 100% válidos | Validador | P1 |
| S1.7 | `hreflang` apunta a URLs 200, indexables y canónicas | 100% | Crawl | P1 |
| S1.8 | Sin conflicto entre `hreflang` y canonical | 0 casos | Crawl | P1 |
| S1.9 | Sin redirección automática por IP que impida el rastreo | 0 redirecciones forzadas, se ofrece selector | Prueba multi-región | P1 |
| S1.10 | Contenido realmente traducido, no solo con parámetros de idioma | Muestreo aprobado | Revisión | P2 |
| S1.11 | Moneda, formatos de fecha y unidades localizados | 100% | Revisión | P3 |
| S1.12 | Errores de hreflang en GSC | 0 | GSC (si el informe está disponible) o validador externo | P2 |

---

## 21. Bloque D, autoridad off-site

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| T1.1 | Perfil de dominios de referencia frente a los 3 competidores directos | Brecha cuantificada | Ahrefs, Semrush | P3 |
| T1.2 | Tendencia de dominios de referencia | Crecimiento neto positivo a 12 meses | Ahrefs | P3 |
| T1.3 | Distribución de anchor text | < 20% de anchors de coincidencia exacta | Ahrefs | P3 |
| T1.4 | Enlaces rotos entrantes (404 con enlaces externos) | 0 URLs con ≥ 3 dominios de referencia devolviendo 404 | Ahrefs + crawl | P2 |
| T1.5 | Redirecciones de enlaces históricos preservadas | 100% de URLs con backlinks redirigen a equivalente | Cruce Ahrefs + crawl | P1 |
| T1.6 | Perfil sin patrones manipulativos evidentes | Auditoría manual sin hallazgos | Revisión de los 100 dominios principales | P2 |
| T1.7 | Menciones de marca sin enlace identificadas | Lista generada | Alertas, Ahrefs | P3 |
| T1.8 | Sin acciones manuales en GSC | 0 | GSC | P0 |

---

## 22. Analítica y medición

Sin medición fiable no se puede demostrar el impacto de nada de lo anterior, y la auditoría se vuelve incomprobable.

| ID | Verificación | Criterio de aprobación | Cómo medir | Sev. |
|---|---|---|---|---|
| U1.1 | GSC configurado como propiedad de dominio | Sí | GSC | P1 |
| U1.2 | Bing Webmaster Tools configurado | Sí | BWT | P3 |
| U1.3 | Analítica instalada en el 100% de las páginas | 0 páginas sin etiqueta | Crawl con detección de etiquetas | P1 |
| U1.4 | Sin doble etiquetado | 0 casos | Crawl | P2 |
| U1.5 | Conversiones definidas y con valor monetario | 100% de las conversiones clave | Configuración de la analítica | P1 |
| U1.6 | Segmento de tráfico orgánico correctamente definido | Verificado contra GSC (desviación < 15%) | Comparación | P2 |
| U1.7 | Consentimiento implementado sin perder toda la medición | Modo consentimiento o equivalente activo | Revisión | P2 |
| U1.8 | Exportación de GSC a BigQuery o almacenamiento propio | Activa (evita el límite de 16 meses) | Configuración | P3 |
| U1.9 | Medición server-side considerada donde el bloqueo de scripts es alto | Evaluada | Documento | P3 |
| U1.10 | Panel de seguimiento de las métricas de esta auditoría | Existe y se revisa | Looker Studio u otro | P2 |
| U1.11 | Filtrado de bots y tráfico interno | Activo | Configuración | P3 |

---

## 23. Protocolo de migración

Se ejecuta como auditoría independiente, antes y después de cualquier cambio de dominio, CMS, estructura de URLs, plataforma o rediseño mayor. Es el escenario de mayor pérdida potencial de tráfico.

### 23.1 Antes del lanzamiento

- [ ] Crawl completo del sitio actual guardado como referencia (URLs, títulos, canonicals, estados, enlaces internos)
- [ ] Exportación completa de GSC (16 meses de rendimiento por consulta y página)
- [ ] Exportación de backlinks por URL de destino
- [ ] Inventario de URLs con tráfico, conversiones y enlaces externos (todas deben tener destino asignado)
- [ ] Mapa de redirección 1 a 1 completo, sin destinos por defecto a la home para URLs Tier 1 a 3
- [ ] Mapa validado en entorno de staging con crawl en modo lista
- [ ] Verificación de que el staging no es indexable y que el bloqueo se eliminará en producción
- [ ] Plantillas nuevas auditadas contra los bloques A y B de este manual
- [ ] Paridad de contenido verificada entre sitio antiguo y nuevo
- [ ] `hreflang`, canonicals y datos estructurados reconstruidos, no heredados a ciegas
- [ ] Plan de reversión documentado con criterios de activación
- [ ] Congelación de otros cambios (contenido, diseño) durante la ventana de migración

### 23.2 Día del lanzamiento

- [ ] Retirar `noindex` y `Disallow` de producción, verificado con `curl`
- [ ] Crawl de verificación en la primera hora
- [ ] Verificación manual de 20 redirecciones críticas
- [ ] Sitemap nuevo generado y enviado
- [ ] Sitemap antiguo mantenido temporalmente para acelerar el descubrimiento de redirecciones
- [ ] Cambio de dirección declarado en GSC si cambia el dominio
- [ ] Monitoreo de 5xx en tiempo real

### 23.3 Después del lanzamiento

| Plazo | Acción |
|---|---|
| 48 horas | Comparación de crawl antiguo vs nuevo, verificación de estados e indexación de la home y de Tier 1 |
| 7 días | Revisión de cobertura en GSC, estadísticas de rastreo, errores 404 en logs |
| 30 días | Comparación de rendimiento por URL, identificación de pérdidas superiores al 20% |
| 90 días | Evaluación final, decisión sobre mantener o revertir elementos concretos |

---

## 24. Monitoreo continuo

| Frecuencia | Verificación | Umbral de alerta |
|---|---|---|
| Tiempo real | Disponibilidad del sitio | Cualquier caída > 1 minuto |
| Tiempo real | Tasa de 5xx | > 0,5% en 5 minutos |
| Diaria | Accesibilidad de robots.txt y ausencia de `Disallow: /` | Cualquier cambio |
| Diaria | Presencia de `noindex` en URLs Tier 1 | Cualquier aparición |
| Diaria | Estado 200 de las 50 URLs principales | Cualquier cambio |
| Diaria | Validez del certificado | < 30 días para expirar |
| Semanal | Cobertura de indexación en GSC | Variación > 5% |
| Semanal | Estadísticas de rastreo | Caída > 20% |
| Semanal | Errores 404 nuevos con enlaces entrantes | Cualquier caso nuevo |
| Semanal | Clics e impresiones orgánicas | Caída > 15% interanual ajustada por estacionalidad |
| Mensual | Core Web Vitals de campo | Cualquier grupo que salga de "Bueno" |
| Mensual | Crawl completo o muestreado | Nuevas incidencias P0 o P1 |
| Mensual | Errores de datos estructurados | Cualquier elemento no válido nuevo |
| Mensual | Backlinks perdidos de dominios relevantes | Pérdida de dominios de autoridad alta |
| Trimestral | Auditoría completa con este manual | Ejecución íntegra |
| Trimestral | Análisis de logs | Desperdicio de rastreo > 20% |
| Semestral | Revisión de canibalización y poda de contenido | Ejecución |
| Ad hoc | Tras cada release, rediseño, migración o actualización de algoritmo | Ejecución de los bloques A y B |

---

## 25. Entregable y priorización

### 25.1 Estructura obligatoria del informe

1. **Resumen ejecutivo**, máximo 1 página: los 5 hallazgos que mueven el negocio, con impacto estimado en tráfico o ingresos.
2. **Tabla de hallazgos priorizada** (formato abajo).
3. **Plan de 30, 60 y 90 días** con responsables.
4. **Anexo técnico** con la evidencia por hallazgo.

Nada de narrativa antes de la tabla. Si el cliente o el equipo no puede empezar a trabajar leyendo solo el punto 2, el informe falló.

### 25.2 Formato de la tabla de hallazgos

| Campo | Descripción |
|---|---|
| ID | Referencia al ítem de este manual |
| Hallazgo | Una frase, con el problema, no con el síntoma |
| Evidencia | URL de la captura, exportación o consulta |
| URLs afectadas | Cantidad y tier predominante |
| Impacto estimado | Alto / Medio / Bajo, con razonamiento en una línea |
| Severidad | P0 a P3 |
| Esfuerzo | XS (< 1h), S (< 1d), M (< 1 semana), L (> 1 semana) |
| Área responsable | Dev backend, dev frontend, contenido, infraestructura, negocio |
| Dependencias | Otros hallazgos que deben resolverse antes |
| Estado | Abierto, en curso, resuelto, aceptado como riesgo |

### 25.3 Fórmula de orden

```
Prioridad = (Impacto x Confianza) / Esfuerzo
```

Donde impacto y confianza van de 1 a 5, y esfuerzo de 1 (XS) a 8 (L). Los P0 se ejecutan antes de aplicar la fórmula, sin discusión.

### 25.4 Criterios de cierre de la auditoría

La auditoría se considera entregada cuando:

- [ ] Todos los ítems de los bloques A y B tienen resultado (aprobado, reprobado o N/A justificado)
- [ ] Todo ítem reprobado tiene evidencia adjunta
- [ ] Todo hallazgo tiene severidad, esfuerzo y responsable asignados
- [ ] El plan de 30 días cabe en la capacidad real del equipo
- [ ] Existe una métrica de éxito por cada hallazgo P0 y P1

---

## Anexo A. Tabla maestra de umbrales

| Ámbito | Métrica | Umbral |
|---|---|---|
| Rendimiento | LCP (campo, p75) | ≤ 2,5 s |
| Rendimiento | INP (campo, p75) | ≤ 200 ms |
| Rendimiento | CLS (campo, p75) | ≤ 0,1 |
| Rendimiento | TTFB | ≤ 800 ms |
| Rendimiento | Peso de página móvil | ≤ 1,5 MB |
| Rendimiento | Solicitudes | ≤ 80 |
| Servidor | Tiempo de respuesta a Googlebot | < 600 ms medio, < 1.500 ms p95 |
| Servidor | Tasa de 5xx en logs | < 0,1% |
| Servidor | Tasa de 4xx en logs | < 2% |
| Indexación | Ratio de indexación (Tier 1 a 3) | ≥ 90% |
| Indexación | "Descubierta, sin indexar" | < 5% |
| Indexación | "Rastreada, sin indexar" | < 10% |
| Rastreo | Desperdicio de rastreo | < 20% |
| Rastreo | Ratio URLs rastreables / canónicas | ≤ 3:1 |
| Arquitectura | Profundidad de clic Tier 1 | ≤ 3 |
| Arquitectura | Profundidad máxima (p95) | ≤ 5 |
| Arquitectura | Enlaces internos entrantes Tier 1 | ≥ 10 |
| Arquitectura | Enlaces por página | ≤ 300 |
| Redirecciones | Saltos por cadena | 1 |
| Sitemap | URLs por archivo | ≤ 50.000 |
| Sitemap | Tamaño por archivo | ≤ 50 MB |
| Metadatos | Longitud de title | 30 a 60 caracteres, ≤ 580 px |
| Metadatos | Longitud de meta description | 110 a 160 caracteres |
| Contenido | Contenido único por página | ≥ 60% respecto de su plantilla |
| Contenido | Umbral de contenido delgado | < 50 palabras únicas |
| Contenido | Densidad de término principal | < 3% |
| Imágenes | Peso de imagen LCP | ≤ 150 KB |
| Imágenes | Peso del resto | ≤ 100 KB |
| Imágenes | Cobertura de `alt` | 100% en imágenes de contenido |
| Móvil | Tamaño de fuente | ≥ 16 px |
| Móvil | Objetivo táctil | ≥ 48x48 px, separación ≥ 8 px |
| Accesibilidad | Contraste | ≥ 4,5:1 |
| Seguridad | HSTS max-age | ≥ 31.536.000 |
| Seguridad | Grado SSL Labs | A o superior |
| Off-site | Anchors de coincidencia exacta | < 20% |
| Poda | Criterio de eliminación | 0 clics, < 50 impresiones, 0 conversiones en 180 días, 0 backlinks |

---

## Anexo B. Comandos y consultas útiles

**Verificar canonicalización de dominio (las 4 variantes):**

```bash
for u in http://ejemplo.cl https://ejemplo.cl http://www.ejemplo.cl https://www.ejemplo.cl; do
  echo "== $u"
  curl -sIL -A "Mozilla/5.0 (compatible; Googlebot/2.1)" "$u" | grep -Ei "^(HTTP|location)"
done
```

**Comparar HTML crudo contra DOM renderizado (conteo de palabras):**

```bash
curl -s -A "Googlebot" https://ejemplo.cl/pagina | \
  sed -e 's/<[^>]*>//g' | tr -s '[:space:]' '\n' | grep -c .
```

**Extraer directivas clave de una URL:**

```bash
curl -s -A "Googlebot" https://ejemplo.cl/pagina | \
  grep -Ei '<title>|canonical|name="robots"|hreflang'
curl -sI -A "Googlebot" https://ejemplo.cl/pagina | grep -i "x-robots-tag"
```

**Contar URLs y validar límites de un sitemap:**

```bash
curl -s https://ejemplo.cl/sitemap.xml | grep -c "<loc>"
curl -s https://ejemplo.cl/sitemap.xml | wc -c
```

**Distribución de códigos de estado para Googlebot en logs (formato combinado):**

```bash
grep -i "googlebot" access.log | awk '{print $9}' | sort | uniq -c | sort -rn
```

**Top de URLs rastreadas por Googlebot:**

```bash
grep -i "googlebot" access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -50
```

**Verificación inversa de Googlebot (evita UA falsificados):**

```bash
ip=203.0.113.10
host=$(dig +short -x $ip)
echo "$host"; dig +short "$host"
```

**Detectar cloaking por user-agent:**

```bash
a=$(curl -s -A "Googlebot" https://ejemplo.cl/pagina | md5sum)
b=$(curl -s -A "Mozilla/5.0" https://ejemplo.cl/pagina | md5sum)
echo "$a"; echo "$b"
```

**Crawl en modo lista con Screaming Frog por línea de comandos:**

```bash
screamingfrogseospider --crawl-list urls.txt --headless \
  --save-crawl --output-folder ./salida \
  --export-tabs "Internal:All,Response Codes:Client Error (4xx)" \
  --bulk-export "Canonicals:Canonicalised Inlinks"
```

**Consulta de CrUX por origen (requiere clave de API):**

```bash
curl -s "https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"origin":"https://ejemplo.cl","formFactor":"PHONE"}'
```

---

## Anexo C. Herramientas por función

| Función | Herramientas |
|---|---|
| Datos del buscador | Google Search Console, Bing Webmaster Tools |
| Rastreo | Screaming Frog, Sitebulb, Lumar, JetOctopus |
| Rastreo a escala y logs | JetOctopus, Botify, OnCrawl, o `awk` sobre logs crudos |
| Rendimiento de campo | CrUX Dashboard, CrUX API, PageSpeed Insights, RUM propio con `web-vitals` |
| Rendimiento de laboratorio | Lighthouse, WebPageTest, DevTools Performance |
| Renderizado | Prueba de URL en vivo de GSC, Puppeteer, comparación crawl con y sin JS |
| Datos estructurados | Schema Markup Validator, Prueba de resultados enriquecidos, informes de mejoras de GSC |
| Internacional | Validador de hreflang, Screaming Frog |
| Seguridad | SSL Labs, securityheaders.com, `npm audit` |
| Accesibilidad | axe DevTools, Lighthouse, WAVE |
| Backlinks | Ahrefs, Semrush, Majestic |
| Disponibilidad | UptimeRobot, Better Stack, monitoreo propio |
| Analítica | GA4 u otra, BigQuery, Looker Studio |
| Visibilidad en IA | Muestreo manual, herramientas de seguimiento de AI Overviews, segmentación de referrers |

---

## Anexo D. Criterios de descarte

Este manual se poda con la misma lógica que un sitio. Reglas de mantenimiento:

1. Un ítem que no se haya usado para generar un hallazgo en 3 auditorías consecutivas se elimina.
2. Un ítem cuyo umbral no pueda medirse con las herramientas disponibles se elimina o se cambia el umbral.
3. Un ítem que dependa de una directiva o feature deprecada se elimina, no se marca como "opcional".
4. Cada trimestre se revisa el Anexo A contra la documentación oficial de Google y Bing.
5. Un manual que crece indefinidamente deja de ejecutarse. Si supera los umbrales de tiempo de la sección 0.3, hay que recortar, no ampliar el plazo.

**Fuera de alcance de este manual, de forma deliberada:** investigación de palabras clave, estrategia de contenido, construcción de enlaces, SEO local operativo (gestión de fichas y reseñas), CRO. Son disciplinas contiguas, y mezclarlas aquí es lo que convierte una auditoría en un documento imposible de ejecutar.