---
name: backend
description: Base de conocimiento de backend para razonar (no solo listar) sobre diseño de APIs, modelado de datos, transacciones e índices, concurrencia y trabajo diferido, colas y mensajería, fiabilidad y modos de fallo, rendimiento y escalado, seguridad aplicada al desarrollo (autenticación, autorización, hasheo de contraseñas, gestión de secretos), observabilidad, arquitectura y límites de servicio, pruebas y entrega continua. Se invoca cuando hay que diseñar un contrato de API, modelar un esquema o una migración, diagnosticar latencia o un fallo intermitente, revisar un diseño o una decisión de arquitectura, o decidir entre dos formas de resolver un problema de backend.
---

# Skill de Backend — índice y protocolo

Este archivo es el enrutador. No contiene conocimiento de dominio: decide qué módulo cargar y cómo razonar con él.
Hermana de [../security/SKILL.md](../security/SKILL.md); mismas convenciones de formato, dominio distinto.

## 1. Alcance: agnóstico de tecnología

Todo módulo es agnóstico de framework, ORM y lenguaje. Se nombran algoritmos y patrones (cubo de fichas, Argon2id, ETag, expandir/contraer); no se nombra producto ni versión.

Regla dura: **nunca inventar** un número de rendimiento, un límite de un servicio, un parámetro de coste concreto o un valor por defecto de configuración. Si no se sabe, se dice y se nombra dónde se verifica. Única excepción admitida: recomendaciones de algoritmo (qué función de derivación de clave, con qué parámetros de coste) — el algoritmo es agnóstico pero la recomendación caduca, así que se marca con `consulta_externa` a la guía vigente.

## 2. Protocolo de respuesta

1. **Clasificar la intención** en uno de estos siete modos y responder con la forma de salida que le corresponde:

| Modo | Pregunta típica | Forma de salida |
|---|---|---|
| `DISEÑAR` | "¿Cómo estructuro X?" | Requisitos → invariantes en juego → opciones con coste → recomendación → qué se rompe primero |
| `MODELAR_DATOS` | "¿Cómo guardo esto?" | Patrón de acceso → motor → esquema y restricciones → índices → plan de migración ([data/data.md](data/data.md)) |
| `DIAGNOSTICAR` | "Va lento / falla a veces" | Síntoma → qué medir → hipótesis → confirmación → causa → arreglo y prevención |
| `REVISAR` | "Revisa este diseño o este código" | Invariantes en riesgo, por severidad, cada una con escenario de fallo concreto |
| `ELEGIR` | "¿A o B?" | Restricciones reales → criterio de decisión → recomendación. Nunca un catálogo neutral |
| `EVOLUCIONAR` | "Cambiar esto sin romper nada" | Estado actual → pasos de expandir y contraer → compatibilidad → punto de retorno |
| `OPERAR` | "Está caído en producción" | Mitigar antes que entender: estabilizar → contener → causa raíz después |

2. **Enrutar** con la tabla de la sección 4. Cargar solo los módulos necesarios.
3. **Razonar con el núcleo**, no con la lista: identificar qué invariante está en juego y cuál de los cinco modelos de la sección 3 aplica.
4. **Anclar** cada práctica a su invariante y a la señal que demuestra que está rota. Eso hace la respuesta verificable, no dogmática.
5. **Cerrar con acción**: recomendación concreta, qué medir y qué verificar. Nunca terminar en "depende".

## 3. Núcleo de razonamiento

**a) Contrato → invariante → violación.** Todo componente publica un contrato y sostiene invariantes que el contrato no dice en voz alta ("un pedido no se cobra dos veces", "el saldo nunca es negativo"). Un bug de backend es casi siempre una invariante rota, no un error de sintaxis. Pregunta permanente: *¿qué invariante sostiene esto, y qué la rompe — concurrencia, fallo parcial, reintento, entrada hostil?*

**b) Todo I/O falla, y falla de cinco formas.** Lento · agotado el tiempo · error · duplicado · desordenado. Un diseño no está terminado hasta que responde qué pasa en cada caso. El caso que siempre se olvida es *"funcionó, pero el cliente no se enteró"* — de ahí sale toda la teoría de idempotencia y reintentos.

**c) El estado es lo caro; el cómputo es barato.** Lo sin estado escala solo. Cada pieza de estado (sesión, caché, cola, tabla, índice) obliga a decidir dueño, durabilidad, consistencia y qué pasa cuando se pierde. Escalar es casi siempre mover, particionar o eliminar estado, no añadir máquinas.

**d) Todo cambio convive con la versión anterior.** No existe el despliegue atómico. Durante la ventana de cambio hay dos versiones de código contra un esquema, y clientes viejos llamando a servidores nuevos. De aquí salen expandir/contraer, compatibilidad N-1, cambios aditivos y banderas de funcionalidad. Es el modelo que más se ignora y el que más incidentes causa.

**e) El coste real no es el big-O.** Está en los viajes de red, en la espera en cola y en la cola de la distribución. Un `O(n²)` sobre 50 elementos en memoria es gratis; un `O(n)` con una consulta por elemento es un incidente. Y la media miente: el usuario que se queja vive en el p99.

## 4. Mapa de enrutamiento

**Contrato y superficie**

| Tema | Módulo |
|---|---|
| Diseño de API: estilo, códigos de estado, idempotencia, paginación, caché HTTP, límites de tasa, webhooks | [api/api.md](api/api.md) |

**Datos**

| Tema | Módulo |
|---|---|
| Modelado, tipos, índices, transacciones y aislamiento, concurrencia, consultas, conexiones, ciclo de vida | [data/data.md](data/data.md) |
| Migraciones: expandir/contraer, relleno por lotes, reversibilidad | [data/migrations.md](data/migrations.md) |

**Ejecución**

| Tema | Módulo |
|---|---|
| Concurrencia, colas, semántica de entrega, coordinación distribuida, consistencia entre servicios | [concurrency/concurrency.md](concurrency/concurrency.md) |
| Fiabilidad: tiempos de espera, reintentos, interruptor, mamparo, fallo parcial, ciclo de vida del proceso | [reliability/reliability.md](reliability/reliability.md) |
| Rendimiento: percentiles, teoría de colas, caché, escalado horizontal, particionado, coste | [performance/performance.md](performance/performance.md) |

**Seguridad aplicada**

| Tema | Módulo |
|---|---|
| Identidad, autorización, entrada no confiable, secretos, datos sensibles, cadena de suministro | [appsec/appsec.md](appsec/appsec.md) |
| Autenticación: hasheo de contraseñas, sesiones, tokens | [appsec/authn.md](appsec/authn.md) |
| Mecánica de ataque y detección (fuera de este skill) | [../security/web/web.md](../security/web/web.md) · [../security/owasp_api.md](../security/owasp_api.md) · [../security/databases/databases.md](../security/databases/databases.md) |

**Operación**

| Tema | Módulo |
|---|---|
| Observabilidad: registros, métricas, trazas, alertas | [observability/observability.md](observability/observability.md) |
| Arquitectura: acoplamiento, límites de dominio, monolito modular, configuración | [architecture/architecture.md](architecture/architecture.md) |
| Pruebas: determinismo, dobles, contratos, invariantes | [testing/testing.md](testing/testing.md) |
| Entrega: construcción reproducible, despliegue, banderas, reversibilidad | [delivery/delivery.md](delivery/delivery.md) |
| Código y mantenibilidad: errores, tipos, dependencias | [code/code.md](code/code.md) |

**Transversal**

| Tema | Módulo |
|---|---|
| Vocabulario y métricas | [glossary.md](glossary.md) |
| Antipatrones que cruzan varias ramas | [antipatterns.md](antipatterns.md) |

## 5. Convenciones de los módulos

- Cabecera YAML con `id`, `tipo`, `estabilidad`, y `consulta_externa` si el contenido depende de una guía externa.
- Prácticas en tabla con columnas fijas: `Práctica | Por qué | Cómo se viola | Cómo se verifica`. Una fila = una unidad recuperable por sí sola.
- Títulos `##` autodescriptivos: el heading debe bastar para saber si el bloque responde la pregunta.
- Sin introducciones, sin marketing, sin repetir lo que ya dice otro módulo: se enlaza.
- El conocimiento vive en un solo lugar; los demás módulos referencian.

## 6. Límites

- No genera código de producción sin que el usuario aporte las restricciones reales del sistema (volumen, presupuesto de latencia, equipo, motor ya elegido).
- No recomienda una arquitectura de microservicios sin que el coste organizativo esté justificado explícitamente.
- No decide algoritmos criptográficos de propósito general fuera de lo cubierto en [appsec/authn.md](appsec/authn.md); para eso, [../security/](../security/).
- La mecánica de ataque, detección y respuesta a incidentes no es tarea de este skill: para eso está [../security/](../security/).
- Auditar el código de este propio repositorio no es tarea de este skill.
