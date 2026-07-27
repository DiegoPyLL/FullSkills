# Skills de Ciberseguridad

Base de conocimiento de ciberseguridad estructurada como **Skill** para agentes (Claude Code y compatibles). No es un simple compendio de referencia: está diseñada para que un agente *razone* sobre vulnerabilidades, técnicas de ataque, detección y respuesta a incidentes, en lugar de limitarse a listar información.

## Cómo funciona

El punto de entrada es [SKILL.md](SKILL.md), que actúa como enrutador: no contiene conocimiento de dominio, sino que define el protocolo de razonamiento y decide qué módulos cargar según la pregunta.

- **Regla permanente vs. volátil**: cada módulo declara su estabilidad. Lo `permanente` (modelos, taxonomías, técnicas) se puede afirmar con confianza; lo `volatil` (CVEs, CVSS/EPSS, KEV, atribución) se trata como snapshot fechado y se verifica en la fuente antes de darlo por válido. Nunca se inventan CVEs, scores, hashes o IPs.
- **Seis modos de respuesta**: `ANALIZAR_VULN`, `EXPLICAR_TECNICA`, `RESPONDER_INCIDENTE`, `CAZAR`, `DISEÑAR_DEFENSA`, `EVALUAR_RIESGO`, cada uno con su forma de salida esperada.
- **Núcleo de razonamiento**: cadena precondición → primitiva → efecto, riesgo real (explotabilidad × exposición × valor del activo) en vez de CVSS a secas, grafo de ataque en vez de lista de hallazgos, y coste asimétrico de la detección (comportamiento vs. IOC estático).
- **Anclaje a taxonomías**: toda afirmación se referencia contra ATT&CK, CWE y D3FEND para que sea verificable.

## Estructura del repositorio

| Carpeta / archivo | Contenido |
|---|---|
| `SKILL.md` | Enrutador y protocolo de razonamiento (léelo primero) |
| `glossary.md`, `frameworks.md`, `mitre_attack.md`, `mitre_d3fend.md`, `cwe.md`, `capec.md`, `owasp.md`, `owasp_api.md`, `nist.md` | Taxonomías y marcos permanentes |
| `cisa_kev.md`, `cve_database.md` | Vulnerabilidades (volátil): priorización, KEV/EPSS, esquema canónico de CVE |
| `attacks/` | Catálogo de técnicas por táctica ATT&CK (acceso inicial, ejecución, persistencia, escalada, evasión, credenciales, descubrimiento, movimiento lateral, C2, exfiltración, impacto) |
| `windows/`, `linux/`, `active_directory/`, `databases/` | Seguridad por plataforma |
| `cloud/`, `aws/`, `azure/`, `gcp/` | Seguridad cloud, transversal y por proveedor |
| `containers/`, `docker/`, `kubernetes/`, `vmware/`, `hyperv/` | Contenedores y virtualización |
| `firewalls/`, `vpn/` | Red y perímetro |
| `web/`, `mobile/`, `ai/` | Seguridad de aplicaciones, mobile e IA/LLM/agentes |
| `malware/`, `ransomware/` | Adversario: familias de malware y ransomware |
| `detection/`, `hunting/`, `hardening/`, `ioc/` | Defensa: ingeniería de detección, threat hunting, hardening, IOC |
| `yara/`, `sigma/`, `snort/`, `suricata/` | Firmas y reglas de detección |
| `playbooks/` | Respuesta a incidentes (base común + específicos por tecnología) |
| `references/` | Fuentes externas |

## Convenciones de los módulos

- Cabecera YAML con `id`, `tipo`, `estabilidad`, y `consulta_externa` si el contenido es volátil.
- Las técnicas se documentan en tablas con columnas fijas: `Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación`.
- Sin introducciones ni repetición entre módulos: el conocimiento vive en un solo lugar y el resto enlaza a él.

## Límites

- No genera exploits funcionales ni payloads listos para usar contra terceros; sí explica mecánica, detección, mitigación y código defensivo o de laboratorio autorizado.
- No atribuye incidentes a actores concretos solo por solapamiento de TTPs.
- No inventa datos de contacto legales ni plazos de notificación, que varían por jurisdicción.
- Auditar el código de este propio repositorio no es su función (para eso existe el skill `security-audit`, que vive en otro repositorio, no en este).

## Uso

Este repositorio está pensado para usarse como Skill dentro de un agente compatible (p. ej. Claude Code): el agente carga `SKILL.md` y, según la intención detectada, navega al módulo correspondiente siguiendo el mapa de enrutamiento de la sección 4.
