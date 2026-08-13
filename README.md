
<div align="center">

# FullSkills


## Tabla de contenidos

- [Qué es esto](#qué-es-esto)
- [Inicio rápido](#inicio-rápido)
- [Dominios](#dominios)
- [Índice de skills](#índice-de-skills)
  - [/indice — enrutador maestro](#indice--enrutador-maestro)
  - [/security — ciberseguridad](#security--ciberseguridad)
  - [/backend — ingeniería de backend](#backend--ingeniería-de-backend)
  - [/seo — SEO técnico](#seo--seo-técnico)
  - [/mobile — plataforma móvil](#mobile--plataforma-móvil)
- [Convenciones](#convenciones)
- [Mantenimiento](#mantenimiento)
- [Roadmap](#roadmap)
- [Contribuir](#contribuir)

---

## Qué es esto

`FullSkills` es una biblioteca de **skills de conocimiento** para el [sistema de skills de Claude](https://docs.claude.com). Cada skill es una carpeta con un `SKILL.md` que **enruta y define cómo razonar** sobre un dominio; el conocimiento en sí vive en módulos `.md` que la skill carga solo cuando hacen falta.

La diferencia con un simple montón de notas: los `SKILL.md` no repiten conocimiento, lo **orquestan**. Clasifican la intención de la pregunta, deciden qué módulo abrir, imponen un protocolo de respuesta y obligan a cerrar con acción concreta (una detección, una mitigación, un umbral medible) en lugar de terminar en «depende». Las skills se cargan bajo demanda según el disparador de la conversación, así que no pagas contexto por las que no usas.

**Úsalo para:** diagnosticar y diseñar en seguridad y backend, auditar SEO técnico, analizar un CVE o una técnica de ataque, endurecer un iPhone o responder a una sospecha de spyware, revisar un diseño de API o una migración de datos, y localizar rápido dónde vive un tema entre los 119 documentos del repositorio.

---

## Inicio rápido

Las skills se descubren cuando cada carpeta queda **suelta dentro del `.claude/skills/` del proyecto anfitrión**, es decir en `.claude/skills/<nombre>/SKILL.md` — que es donde Claude Code las busca.

```
proyecto-anfitrion/
└── .claude/skills/
    ├── indice/SKILL.md
    ├── security/SKILL.md
    ├── backend/SKILL.md
    ├── seo/SKILL.md
    └── mobile/SKILL.md
```

### Como submódulo (recomendado)

```bash
# Añadir la biblioteca como submódulo dentro de .claude/skills
git submodule add https://github.com/DiegoPyLL/FullSkills.git .claude/skills

# Traer los cambios más recientes
git submodule update --remote --merge .claude/skills

# Al clonar el anfitrión por primera vez, o si el submódulo aparece vacío
git submodule update --init --recursive
```

### Copiando el contenido

Si prefieres no usar submódulos, copia el contenido de este repositorio dentro de `.claude/skills/` del proyecto anfitrión, respetando que cada carpeta con `SKILL.md` quede en el primer nivel.

> **Por qué «suelto» y no anidado:** un `SKILL.md` en la raíz de este repositorio se desplegaría como `.claude/skills/SKILL.md` y **no se descubriría**. Por eso el enrutador maestro vive en `indice/` y no en la raíz.

Tres condiciones para que una carpeta se descubra como skill (las verifica `--check`):

1. `SKILL.md` en el primer nivel de la carpeta.
2. Cabecera con `name` y `description` — la descripción es lo único que decide la invocación automática, así que nombra temas concretos y dice *cuándo* se usa.
3. Nombre de carpeta idéntico al `name`: minúsculas, dígitos y guiones.

---

## Dominios

| Skill | Documentos | Enfoque |
|---|---:|---|
| [`/indice`](#indice--enrutador-maestro) | 1 + INDICE | Enrutador maestro entre skills e inventario generado del repositorio |
| [`/security`](#security--ciberseguridad) | 80 | Seguridad ofensiva, defensiva, forense, IR, cloud, contenedores, IA — 41 dominios |
| [`/backend`](#backend--ingeniería-de-backend) | 18 | APIs, datos, concurrencia, fiabilidad, rendimiento, appsec, observabilidad, entrega — 11 dominios |
| [`/seo`](#seo--seo-técnico) | 2 | Auditoría de SEO técnico — manual de ejecución de 25 secciones + 4 anexos |
| [`/mobile`](#mobile--plataforma-móvil) | 13 | Seguridad del dispositivo iOS y Android, diseño de app nativa, plataforma y entrega — 4 dominios |

`ai/`, `cloud/` y `frontend UX-UI/` están **reservadas y todavía vacías**: sin `SKILL.md` no se descubren como skill. Ver [Roadmap](#roadmap).

---

## Índice de skills

### /indice — enrutador maestro

`indice/`

| Pieza | Qué es |
|---|---|
| [`SKILL.md`](indice/SKILL.md) | Enrutador **entre skills**: clasifica el dominio, resuelve cruces (qué dominio es dueño y cuál se consulta) y no contiene conocimiento propio. Se invoca cuando no está claro qué skill aplica o la pregunta cruza dominios. |
| [`INDICE.md`](indice/INDICE.md) | Inventario **generado** de los 119 documentos: título, tipo, estabilidad y temas de cada uno, más una sección de salud con enlaces rotos y módulos huérfanos. No se edita a mano. |

### /security — ciberseguridad

`security/` — [`SKILL.md`](security/SKILL.md) · 80 documentos en 41 dominios

Enrutador con seis modos de respuesta (`ANALIZAR_VULN`, `EXPLICAR_TECNICA`, `RESPONDER_INCIDENTE`, `CAZAR`, `DISEÑAR_DEFENSA`, `EVALUAR_RIESGO`) y la **regla de oro permanente vs. volátil**: los CVEs, scores y atribuciones se tratan como snapshots fechados que hay que verificar en la fuente; nunca se inventa un identificador.

| Área | Docs | Dominios |
|---|---:|---|
| Ofensiva | 16 | [`attacks/`](security/attacks/), [`pentesting/`](security/pentesting/), [`bug_bounty/`](security/bug_bounty/), [`web/`](security/web/), [`mobile/`](security/mobile/), [`references/`](security/references/) |
| Identidad e infra | 4 | [`active_directory/`](security/active_directory/), [`windows/`](security/windows/), [`linux/`](security/linux/), [`hardening/`](security/hardening/) |
| Cloud y contenedores | 9 | [`aws/`](security/aws/), [`azure/`](security/azure/), [`gcp/`](security/gcp/), [`cloud/`](security/cloud/), [`kubernetes/`](security/kubernetes/), [`docker/`](security/docker/), [`containers/`](security/containers/), [`vmware/`](security/vmware/), [`hyperv/`](security/hyperv/) |
| Defensa y detección | 7 | [`detection/`](security/detection/), [`hunting/`](security/hunting/), [`sigma/`](security/sigma/), [`yara/`](security/yara/), [`snort/`](security/snort/), [`suricata/`](security/suricata/), [`firewalls/`](security/firewalls/) |
| IR y forense | 21 | [`playbooks/`](security/playbooks/), [`forensics/`](security/forensics/), [`ransomware/`](security/ransomware/), [`malware/`](security/malware/), [`ioc/`](security/ioc/), [`cti/`](security/cti/) |
| Especializados | 10 | [`ai/`](security/ai/), [`iot/`](security/iot/), [`ot_ics/`](security/ot_ics/), [`hardware/`](security/hardware/), [`blockchain/`](security/blockchain/), [`databases/`](security/databases/), [`tls/`](security/tls/), [`vpn/`](security/vpn/), [`privacy/`](security/privacy/) |
| Marcos y referencias | 11 | En la raíz de `security/`: MITRE, OWASP, NIST, CWE/CAPEC, CVE, KEV, glosario |

### /backend — ingeniería de backend

`backend/` — [`SKILL.md`](backend/SKILL.md) · 18 documentos en 11 dominios

Enrutador con siete modos (`DISEÑAR`, `MODELAR_DATOS`, `DIAGNOSTICAR`, `REVISAR`, `ELEGIR`, `EVOLUCIONAR`, `OPERAR`), **agnóstico de framework, ORM y lenguaje**. Razona por invariantes rotas, no por listas de buenas prácticas.

| Dominio | Docs | Enfoque |
|---|---:|---|
| [`api/`](backend/api/) | 1 | Diseño de contratos, versionado, paginación |
| [`data/`](backend/data/) | 2 | Modelado, transacciones, índices, migraciones |
| [`concurrency/`](backend/concurrency/) | 1 | Concurrencia, trabajo diferido, colas y mensajería |
| [`reliability/`](backend/reliability/) | 1 | Modos de fallo, idempotencia, reintentos |
| [`performance/`](backend/performance/) | 1 | Rendimiento y escalado |
| [`appsec/`](backend/appsec/) | 2 | AuthN/AuthZ, hasheo de contraseñas, secretos |
| [`observability/`](backend/observability/) | 1 | Métricas, logs, trazas |
| [`architecture/`](backend/architecture/) | 1 | Límites de servicio y decisiones de arquitectura |
| [`testing/`](backend/testing/) | 1 | Estrategia de pruebas |
| [`delivery/`](backend/delivery/) | 1 | Entrega continua |
| [`code/`](backend/code/) | 1 | Calidad y revisión de código |
| Raíz | 5 | Enrutador, árbol, antipatrones y glosario |

### /seo — SEO técnico

`seo/` — [`SKILL.md`](seo/SKILL.md) · el conocimiento vive en [`seo-master.md`](seo/seo-master.md)

Enrutador con cinco modos (`AUDITAR`, `DIAGNOSTICAR`, `VERIFICAR`, `MIGRAR`, `PRIORIZAR`) sobre la cadena **rastrear → renderizar → indexar → posicionar**. Regla de oro: **umbral o no entra** — cada ítem tiene criterio de aprobación medible, método de medición y severidad (P0–P3). Los umbrales están en el [Anexo A](seo/seo-master.md#anexo-a-tabla-maestra-de-umbrales); los comandos, en el [Anexo B](seo/seo-master.md#anexo-b-comandos-y-consultas-útiles).

### /mobile — plataforma móvil

`mobile/` — [`SKILL.md`](mobile/SKILL.md) · 13 documentos en 4 dominios

Enrutador con seis modos (`ENDURECER`, `ANALIZAR_AMENAZA`, `RESPONDER_COMPROMISO`, `DISEÑAR`, `PUBLICAR`, `EVALUAR_TENDENCIA`). Regla de oro: **la plataforma manda** — la revisión de la tienda, el modelo de permisos y los límites de segundo plano se consultan antes de especificar, no después de construir. Y toda recomendación de endurecimiento lleva **su coste de uso**: un control que el usuario revierte a la semana no es un control.

**Todo lo específico de una plataforma vive en su carpeta** — `ios/` y `android/`; fuera de ellas solo lo transversal. La frontera con `/security` es el objeto, no el verbo: el dispositivo y el sistema son de `/mobile`; la app que se construye es de [`security/mobile/`](security/mobile/). Ambas plataformas tienen cubiertos los dos ejes, seguridad del dispositivo y producto.

| Dominio | Docs | Enfoque |
|---|---:|---|
| [`ios/`](mobile/ios/) | 5 | Modelo de amenaza y superficie del dispositivo, mitigaciones (BlastDoor, PAC, SPTM, MIE), endurecimiento por perfil · catálogo fechado de CVE y campañas de spyware · playbook forense ante sospecha de compromiso · restricciones de App Store, privacidad y segundo plano · convenciones de interfaz, navegación, estados y accesibilidad |
| [`android/`](mobile/android/) | 5 | Modelo de amenaza, cadena de parcheo y nivel de parche real, arranque verificado, superficie y endurecimiento · catálogo fechado de CVE y campañas, con los identificadores que circulan mal atribuidos · playbook de triage y respuesta · nivel de API objetivo, revisión de Play, permisos y segundo plano · retroceso del sistema, navegación, cambios de configuración y accesibilidad |
| [`practices/`](mobile/practices/) | 1 | Contrato con el servidor, red intermitente y sin conexión, rendimiento y energía, datos locales, observabilidad, entrega |
| [`trends/`](mobile/trends/) | 1 | Criterio de adopción y direcciones de plataforma |

---

## Convenciones

- Cada módulo lleva cabecera YAML con `id`, `tipo` y `estabilidad` (`permanente` o `volatil`; los volátiles añaden `consulta_externa` y `snapshot`).
- **El conocimiento vive en un solo lugar**; el resto enlaza. Sin introducciones ni repetición entre módulos.
- Los `SKILL.md` **enrutan y definen el protocolo de razonamiento**; no contienen conocimiento de dominio.
- Nunca se inventa un dato duro (CVE, umbral, número de rendimiento): si no está en el módulo, se dice y se nombra la fuente donde verificarlo.

---

## Mantenimiento

```bash
node indice/scripts/indexar.mjs           # regenera indice/INDICE.md
node indice/scripts/indexar.mjs --check   # falla si está desfasado, hay enlaces rotos
                                          # o alguna skill no se descubriría
```

[`indice/INDICE.md`](indice/INDICE.md) es el inventario generado de todos los documentos. No se edita a mano: los cambios se pierden al regenerar.

---

## Roadmap

Carpetas reservadas, aún sin `SKILL.md`, a la espera de enrutador y módulos:

| Carpeta | Dominio previsto | Estado |
|---|---|---|
| `ai/` | Ingeniería de IA / LLMs / agentes | Reservada |
| `cloud/` | Arquitectura e ingeniería cloud (más allá de la seguridad cloud ya cubierta en `/security`) | Reservada |
| `frontend UX-UI/` | Frontend y UX/UI | Reservada — habrá que **renombrarla**: el espacio y las mayúsculas no son un nombre de skill válido |

---

## Contribuir

- Un cambio de conocimiento va **al módulo `.md`**, no al `SKILL.md`.
- Tras añadir, mover o renombrar un módulo, ejecuta `node indice/scripts/indexar.mjs` y confirma que `--check` pasa.
- Respeta la cabecera YAML y la regla de «una sola fuente»: si el dato ya existe en otro módulo, enlázalo en vez de duplicarlo.

Repositorio: **[github.com/DiegoPyLL/FullSkills](https://github.com/DiegoPyLL/FullSkills)**
