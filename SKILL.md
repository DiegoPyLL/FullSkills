---
name: ciberseguridad
description: Base de conocimiento de ciberseguridad para razonar (no solo listar) sobre vulnerabilidades, CVEs, threat intelligence, respuesta a incidentes, blue/red team, threat hunting, malware, Active Directory, cloud, contenedores, firewalls, VPN, sistemas operativos, seguridad de IA/LLM/agentes, supply chain, web, mobile, OT/ICS, Zero Trust y MITRE ATT&CK. Se invoca cuando la pregunta es de seguridad ofensiva, defensiva, forense o de arquitectura, o cuando hay que analizar un CVE, una técnica de ataque, una detección o un incidente.
---

# Skill de Ciberseguridad — índice y protocolo

Este archivo es el enrutador. No contiene conocimiento de dominio: decide qué módulo cargar y cómo razonar con él.
Rol equivalente a `security.md` del diseño; el nombre `SKILL.md` lo impone el runtime de skills.

## 1. Regla de oro: permanente vs. volátil

Todo módulo declara `estabilidad` en su cabecera. El agente **debe** tratarlas distinto.

| Estabilidad | Qué contiene | Cómo usarla |
|---|---|---|
| `permanente` | Modelos, taxonomías, técnicas, primitivas de ataque, lógica de detección, controles | Afirmar con confianza. No caduca. |
| `volatil` | CVEs concretos, CVSS/EPSS, KEV, versiones parcheadas, atribución a actores, campañas | Presentar como **snapshot fechado**. Antes de afirmar operativamente, verificar en la fuente indicada en `consulta_externa`. |

Regla dura: **nunca inventar** un identificador CVE, un score EPSS, una entrada KEV, un hash o una IP. Si el dato no está en el módulo, decir que hay que consultarlo y nombrar la fuente. Un CVE inventado es peor que ninguna respuesta.

## 2. Protocolo de respuesta

1. **Clasificar la intención** en uno de estos seis modos y responder con la forma de salida que le corresponde:

| Modo | Pregunta típica | Forma de salida |
|---|---|---|
| `ANALIZAR_VULN` | "¿Qué implica CVE-X?" | Ficha de [cve_database.md](cve_database.md#esquema-canonico) + explotabilidad real en el entorno del usuario |
| `EXPLICAR_TECNICA` | "¿Cómo funciona Kerberoasting?" | Precondiciones → mecánica → señal que deja → detección → mitigación |
| `RESPONDER_INCIDENTE` | "Tengo un servidor cifrado" | [playbooks/ir_base.md](playbooks/ir_base.md) + playbook específico. Contención primero. |
| `CAZAR` | "¿Cómo detecto esto?" | Hipótesis → fuente de datos → consulta → criterio de falso positivo ([hunting/hunting.md](hunting/hunting.md)) |
| `DISEÑAR_DEFENSA` | "¿Cómo protejo X?" | Modelo de amenaza → controles priorizados por reducción de riesgo ([hardening/hardening.md](hardening/hardening.md)) |
| `EVALUAR_RIESGO` | "¿Es grave para nosotros?" | Explotabilidad × exposición × impacto en **este** activo, no CVSS a secas |

2. **Enrutar** con la tabla de la sección 4. Cargar solo los módulos necesarios.
3. **Razonar con la cadena de ataque**, no con la lista: `precondición → primitiva → efecto → siguiente paso posible`. Ver sección 3.
4. **Anclar** cada afirmación a taxonomía: ATT&CK (técnica), CWE (causa raíz), D3FEND (contramedida). Eso hace la respuesta verificable.
5. **Cerrar con acción**: detección concreta, mitigación concreta y qué verificar. Nunca terminar en "depende".

## 3. Núcleo de razonamiento

Un agente que solo lista CVEs falla. Estos cuatro modelos son lo que hay que aplicar:

**a) Precondición → primitiva → efecto.** Toda técnica requiere un estado previo (acceso de red, credencial, ejecución local) y entrega una *primitiva* (leer archivo arbitrario, escribir archivo arbitrario, ejecutar código, forjar token). El impacto se deriva de la primitiva, no del nombre del bug. Un "solo lectura de archivo" en un dispositivo perimetral que guarda sesiones en disco equivale a RCE por robo de sesión (patrón CitrixBleed).

**b) Riesgo real ≠ CVSS.** Prioridad ≈ `explotabilidad (EPSS/KEV/PoC público) × exposición (¿alcanzable desde Internet? ¿requiere auth?) × valor del activo × ausencia de compensatorio`. Un CVSS 9.8 en un servicio no expuesto y segmentado puede ser menos urgente que un 7.5 en el borde con exploit masivo. Detalle en [cisa_kev.md](cisa_kev.md).

**c) Grafo de ataque, no lista de hallazgos.** Preguntar siempre: *¿qué habilita esto a continuación?* Ejecución local → volcado de credenciales → movimiento lateral → DA → ransomware. La mitigación más barata suele estar en cortar una arista intermedia, no en parchear el nodo inicial.

**d) Coste asimétrico de la detección.** Una detección se juzga por cobertura × resistencia a evasión × ruido. Detectar el *comportamiento* (padre-hijo anómalo, acceso LSASS) sobrevive al cambio de herramienta; detectar el *hash* no. Ver "pirámide del dolor" en [ioc/ioc.md](ioc/ioc.md).

## 4. Mapa de enrutamiento

**Taxonomías y marcos** (siempre `permanente`)

| Tema | Módulo |
|---|---|
| Vocabulario, siglas, métricas | [glossary.md](glossary.md) |
| Elegir marco: NIST CSF, ISO 27001, CIS, Zero Trust, Kill Chain, Diamond, Pyramid of Pain | [frameworks.md](frameworks.md) |
| Tácticas y técnicas del adversario | [mitre_attack.md](mitre_attack.md) |
| Contramedidas mapeadas a técnicas | [mitre_d3fend.md](mitre_d3fend.md) |
| Causa raíz de una vulnerabilidad | [cwe.md](cwe.md) |
| Patrón de ataque abstracto | [capec.md](capec.md) |
| Riesgos de aplicación web | [owasp.md](owasp.md) |
| Riesgos de API | [owasp_api.md](owasp_api.md) |
| Controles, SP 800-53/61/171, SSDF, CSF 2.0 | [nist.md](nist.md) |

**Vulnerabilidades** (`volatil`)

| Tema | Módulo |
|---|---|
| Priorización, KEV, EPSS, SLA de parcheo | [cisa_kev.md](cisa_kev.md) |
| Esquema canónico de CVE + fichas de referencia | [cve_database.md](cve_database.md) |

**Catálogo de técnicas por táctica** — `attacks/`

| Táctica | Módulo |
|---|---|
| Acceso inicial | [attacks/initial_access.md](attacks/initial_access.md) |
| Ejecución | [attacks/execution.md](attacks/execution.md) |
| Persistencia | [attacks/persistence.md](attacks/persistence.md) |
| Escalada de privilegios | [attacks/privilege_escalation.md](attacks/privilege_escalation.md) |
| Evasión de defensas | [attacks/defense_evasion.md](attacks/defense_evasion.md) |
| Acceso a credenciales | [attacks/credential_access.md](attacks/credential_access.md) |
| Descubrimiento | [attacks/discovery.md](attacks/discovery.md) |
| Movimiento lateral | [attacks/lateral_movement.md](attacks/lateral_movement.md) |
| Command & Control | [attacks/command_control.md](attacks/command_control.md) |
| Recolección y exfiltración | [attacks/collection_exfiltration.md](attacks/collection_exfiltration.md) |
| Impacto | [attacks/impact.md](attacks/impact.md) |

**Plataformas**

| Tema | Módulo |
|---|---|
| Windows: seguridad interna, LSA, tokens, UAC, LOLBins | [windows/windows.md](windows/windows.md) |
| Linux/Unix: SUID, capabilities, systemd, namespaces | [linux/linux.md](linux/linux.md) |
| Active Directory, Kerberos, ADCS, delegaciones | [active_directory/active_directory.md](active_directory/active_directory.md) |
| Bases de datos: SQL Server, PostgreSQL, MySQL, Mongo, Redis | [databases/databases.md](databases/databases.md) |

**Cloud**

| Tema | Módulo |
|---|---|
| Modelo transversal, IAM, metadata, multicloud | [cloud/cloud.md](cloud/cloud.md) |
| AWS | [aws/aws.md](aws/aws.md) |
| Azure + Entra ID + Microsoft 365 | [azure/azure.md](azure/azure.md) |
| GCP | [gcp/gcp.md](gcp/gcp.md) |

**Contenedores y virtualización**

| Tema | Módulo |
|---|---|
| Modelo de aislamiento y catálogo de escapes | [containers/containers.md](containers/containers.md) |
| Docker / daemon / imágenes | [docker/docker.md](docker/docker.md) |
| Kubernetes | [kubernetes/kubernetes.md](kubernetes/kubernetes.md) |
| VMware vSphere / ESXi | [vmware/vmware.md](vmware/vmware.md) |
| Hyper-V | [hyperv/hyperv.md](hyperv/hyperv.md) |

**Red y perímetro**

| Tema | Módulo |
|---|---|
| Firewalls, NGFW, segmentación, reglas | [firewalls/firewalls.md](firewalls/firewalls.md) |
| VPN, SSL-VPN, IPsec, ZTNA | [vpn/vpn.md](vpn/vpn.md) |

**Aplicaciones**

| Tema | Módulo |
|---|---|
| Web: inyección, SSRF, deserialización, smuggling, supply chain de front | [web/web.md](web/web.md) |
| Mobile: Android/iOS, MASVS | [mobile/mobile.md](mobile/mobile.md) |
| IA/LLM: prompt injection, RAG poisoning, model supply chain | [ai/ai.md](ai/ai.md) |
| Agentes, tools, MCP, memoria, autonomía | [ai/agents_mcp.md](ai/agents_mcp.md) |

**Adversario**

| Tema | Módulo |
|---|---|
| Familias de malware, loaders, RATs, análisis | [malware/malware.md](malware/malware.md) |
| Ransomware, RaaS, doble extorsión, negociación | [ransomware/ransomware.md](ransomware/ransomware.md) |

**Defensa**

| Tema | Módulo |
|---|---|
| Ingeniería de detección, telemetría, SIEM/EDR | [detection/detection.md](detection/detection.md) |
| Threat hunting, hipótesis, TTP-based | [hunting/hunting.md](hunting/hunting.md) |
| Hardening por plataforma, baselines | [hardening/hardening.md](hardening/hardening.md) |
| IOC, pirámide del dolor, formatos, TIP | [ioc/ioc.md](ioc/ioc.md) |

**Firmas y reglas**

| Formato | Módulo |
|---|---|
| YARA (archivos, memoria) | [yara/yara.md](yara/yara.md) |
| Sigma (logs) | [sigma/sigma.md](sigma/sigma.md) |
| Snort (IDS clásico) | [snort/snort.md](snort/snort.md) |
| Suricata (IDS/IPS moderno, EVE) | [suricata/suricata.md](suricata/suricata.md) |

**Respuesta a incidentes** — `playbooks/`

Base común obligatoria: [playbooks/ir_base.md](playbooks/ir_base.md). Específicos:
[ransomware](playbooks/ransomware.md) ·
[webshell](playbooks/webshell.md) ·
[exchange](playbooks/exchange.md) ·
[sharepoint](playbooks/sharepoint.md) ·
[active directory](playbooks/active_directory.md) ·
[sql server](playbooks/sql_server.md) ·
[cloud](playbooks/cloud.md) ·
[microsoft 365](playbooks/microsoft365.md) ·
[entra id](playbooks/entra_id.md) ·
[vpn](playbooks/vpn.md) ·
[firewalls](playbooks/firewalls.md) ·
[docker](playbooks/docker.md) ·
[kubernetes](playbooks/kubernetes.md) ·
[vmware](playbooks/vmware.md) ·
[hyper-v](playbooks/hyperv.md)

**Fuentes externas**: [references/references.md](references/references.md)

## 5. Convenciones de los módulos

- Cabecera YAML con `id`, `tipo`, `estabilidad`, y `consulta_externa` si es volátil.
- Técnicas en tabla con columnas fijas: `Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación`. Una fila = una unidad recuperable por embedding.
- Títulos `##`/`###` autodescriptivos: el heading debe bastar para saber si el bloque responde la pregunta.
- Sin introducciones, sin marketing, sin repetir lo que ya dice otro módulo: se enlaza.
- El conocimiento vive en un solo lugar; los demás módulos referencian.

## 6. Límites

- No generar exploits funcionales ni payloads listos para usar contra sistemas de terceros. Sí explicar mecánica, detectar, mitigar y escribir código defensivo o de laboratorio autorizado.
- No afirmar atribución de un incidente a un actor concreto por solapamiento de TTPs; hablar de "consistente con" y exigir evidencia.
- Datos de contacto de autoridades, plazos legales y obligaciones de notificación varían por jurisdicción: no inventarlos.
- Auditar el código de **este** repositorio no es tarea de este skill: para eso está el skill `security-audit`.
