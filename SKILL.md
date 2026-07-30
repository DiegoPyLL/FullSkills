---
name: indice
description: Índice maestro del repositorio FullSkills. Enruta cualquier pregunta al skill y al módulo concreto que la responde — ciberseguridad (ofensiva, defensiva, forense, cloud, IA, IR), backend (APIs, datos, concurrencia, fiabilidad, rendimiento, appsec, observabilidad, arquitectura, pruebas, entrega) y SEO técnico — y mantiene el inventario completo en INDICE.md. Se invoca cuando no está claro qué skill aplica, cuando la pregunta cruza varios dominios, cuando hay que localizar dónde vive un tema, o cuando se añade, mueve o renombra un módulo y hay que reindexar.
---

# Skill de Índice — enrutador maestro del repositorio

Este archivo enruta **entre skills**. No contiene conocimiento de dominio y no sustituye a los enrutadores de cada skill: decide a cuál entrar y con qué encuadre.

Dos piezas complementarias:

| Pieza | Qué es | Cuándo usarla |
|---|---|---|
| `SKILL.md` (este archivo) | Enrutador con criterio: qué dominio, qué cruce, qué encuadre | Siempre primero |
| [INDICE.md](INDICE.md) | Inventario generado: todo documento del repositorio con su tipo, estabilidad y temas | Cuando hace falta localizar un tema concreto sin abrir ficheros |

`INDICE.md` es **generado**. Se regenera con `node scripts/indexar.mjs`; editarlo a mano no sirve de nada.

## 1. Protocolo de enrutamiento

1. **Clasificar el dominio** con la tabla de la sección 2. Si la pregunta cae en dos, ver la sección 3: casi siempre hay un dominio dueño y otro consultado, no un empate.
2. **Cargar el enrutador del dominio** (`security/SKILL.md`, `backend/SKILL.md`) y seguir *su* protocolo. Cada uno define sus propios modos de respuesta y su forma de salida; este archivo no los duplica.
3. **Si el enrutador no cubre el tema**, buscar en [INDICE.md](INDICE.md) por título o por la columna *Temas* y cargar el módulo directamente. Un módulo que el enrutador no menciona sigue siendo válido — el índice es el inventario real, el enrutador es la ruta habitual.
4. **Si tampoco aparece**, `grep` sobre el repositorio antes de responder de memoria. Si el conocimiento no está, decirlo: este repositorio es la fuente, no un adorno.
5. **Cargar lo mínimo**. Un módulo bien elegido supera a cinco cargados por si acaso.

Regla común a todos los skills: **nunca inventar** un identificador (CVE, ATT&CK, CWE), un número de rendimiento, un límite de servicio ni una URL. Si el dato no está en el módulo, se dice y se nombra la fuente.

## 2. Mapa de dominios

| Dominio | Enrutador | Entra aquí cuando la pregunta es sobre |
|---|---|---|
| Ciberseguridad | [security/SKILL.md](security/SKILL.md) | Vulnerabilidades y CVEs, técnicas de ataque, detección e ingeniería de reglas, respuesta a incidentes, threat hunting, malware y ransomware, Active Directory, cloud, contenedores, red y perímetro, forense, CTI, pentesting, bug bounty, OT/ICS, IoT, hardware, privacidad, seguridad de IA y agentes |
| Backend | [backend/SKILL.md](backend/SKILL.md) | Diseño de APIs y contratos, modelado de datos y migraciones, concurrencia y colas, fiabilidad y modos de fallo, rendimiento y escalado, seguridad aplicada al desarrollo, observabilidad, arquitectura y límites de servicio, pruebas, entrega continua, calidad de código |
| SEO técnico | [seo/seo-master.md](seo/seo-master.md) | Auditoría técnica: indexabilidad, códigos de estado, rastreo, sitemaps, arquitectura de enlazado, rendimiento y Core Web Vitals, datos estructurados, internacionalización |
| Ataques (anexo) | [attacks/reconnaissance_external.md](attacks/reconnaissance_external.md) | Reconocimiento externo que no está en `security/attacks/discovery.md`. Anexo del catálogo de `security/`, no un dominio propio |

**Carpetas reservadas, todavía sin contenido**: [ai/](ai/README.md), [cloud/](cloud/README.md), [frontend UX-UI/](frontend%20UX-UI/README.md). Mientras estén vacías, enrutar así:

- IA/LLM/agentes → [security/ai/ai.md](security/ai/ai.md) y [security/ai/agents_mcp.md](security/ai/agents_mcp.md) (encuadre de seguridad; no hay material de construcción de sistemas de IA).
- Cloud → [security/cloud/cloud.md](security/cloud/cloud.md) más el módulo del proveedor ([aws](security/aws/aws.md), [azure](security/azure/azure.md), [gcp](security/gcp/gcp.md)); la arquitectura cloud no de seguridad no está cubierta.
- Frontend/UX/UI → no cubierto salvo la parte de rendimiento y marcado que toca [seo/seo-master.md](seo/seo-master.md) y la superficie web de [security/web/web.md](security/web/web.md). Decirlo en vez de improvisar.

## 3. Preguntas que cruzan dominios

Cuando dos skills tocan el mismo tema, la diferencia es el **encuadre**, no el tema. Regla: quien *construye* manda en `backend/`; quien *ataca, detecta o responde* manda en `security/`.

| Tema | Construir / operar | Atacar / detectar / responder |
|---|---|---|
| Autenticación, sesiones, tokens | [backend/appsec/authn.md](backend/appsec/authn.md) | [security/attacks/credential_access.md](security/attacks/credential_access.md) |
| Autorización y permisos | [backend/appsec/appsec.md](backend/appsec/appsec.md) | [security/attacks/privilege_escalation.md](security/attacks/privilege_escalation.md) |
| Superficie web de la aplicación | [backend/api/api.md](backend/api/api.md) | [security/web/web.md](security/web/web.md) · [security/owasp.md](security/owasp.md) · [security/owasp_api.md](security/owasp_api.md) |
| Bases de datos | [backend/data/data.md](backend/data/data.md) | [security/databases/databases.md](security/databases/databases.md) |
| Telemetría y registros | [backend/observability/observability.md](backend/observability/observability.md) | [security/detection/detection.md](security/detection/detection.md) |
| Despliegue y cadena de suministro | [backend/delivery/delivery.md](backend/delivery/delivery.md) | [security/attacks/initial_access.md](security/attacks/initial_access.md) |
| Contenedores y orquestación | [backend/architecture/architecture.md](backend/architecture/architecture.md) | [security/containers/containers.md](security/containers/containers.md) · [security/kubernetes/kubernetes.md](security/kubernetes/kubernetes.md) |
| Caída en producción | [backend/reliability/reliability.md](backend/reliability/reliability.md) | [security/playbooks/ir_base.md](security/playbooks/ir_base.md) si hay sospecha de intrusión |
| Rendimiento web | [backend/performance/performance.md](backend/performance/performance.md) (servidor) | [seo/seo-master.md](seo/seo-master.md) (Core Web Vitals y rastreo) |

Caso frecuente: *"¿es un incidente o es un bug?"*. Si hay indicio de actor (persistencia, credenciales usadas fuera de patrón, borrado de evidencia), se trata como incidente y manda `security/` — contener primero, entender después. Si no lo hay, manda `backend/`.

## 4. Estabilidad: lo que caduca y lo que no

Cada módulo declara `estabilidad` en su cabecera y hay que tratarlas distinto. `permanente` se afirma con confianza; `volatil` se presenta como snapshot fechado y se verifica antes de usarlo en algo operativo. La lista viva de módulos volátiles, con su fecha y su fuente de verificación, está en [INDICE.md](INDICE.md#material-volátil) — hoy son tres, todos de `security/`.

## 5. Mantener el índice

```
node scripts/indexar.mjs           # regenera INDICE.md
node scripts/indexar.mjs --check   # falla si INDICE.md está desfasado o hay enlaces rotos
```

El generador recorre todo `.md` (excepto `.git/`, `node_modules/` y `scripts/`), lee la cabecera YAML y los títulos, y produce: inventario por dominio, tabla de material volátil y una sección **Salud** con enlaces internos rotos y módulos que ningún documento enlaza.

Al añadir, mover o renombrar un módulo:

1. Escribirlo con las convenciones del skill al que pertenece — cabecera YAML con `id`, `tipo`, `estabilidad` (y `consulta_externa` + `snapshot` si es volátil), un `#` como título, `##` autodescriptivos.
2. Enlazarlo desde el enrutador de su dominio. Si no, aparecerá como huérfano en `INDICE.md`.
3. Regenerar el índice y revisar la sección Salud: cero enlaces rotos, huérfanos solo si son deliberados.

Los huérfanos y enlaces rotos actuales están listados en [INDICE.md](INDICE.md#salud); son deuda conocida, no un fallo del generador.

## 6. Límites

- Este skill no responde preguntas de dominio. Si ya se sabe que es una pregunta de seguridad o de backend, entrar directo en su enrutador: pasar por aquí solo añade un salto.
- No inventa cobertura. Si un tema no está en el índice, la respuesta correcta es que el repositorio no lo cubre.
- No mantiene el contenido de los módulos, solo su inventario y su enrutamiento.
