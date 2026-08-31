<!-- Generado por indice/scripts/indexar.mjs. No editar a mano: los cambios se pierden. -->
# Índice global del repositorio

Inventario completo de los 169 documentos del repositorio, con su tipo, su estabilidad y los temas que cubre cada uno. Sirve para decidir qué módulo cargar sin abrirlos todos. El enrutamiento con criterio está en [SKILL.md](SKILL.md).

**Generado:** 2026-08-31 · **Regenerar:** `node indice/scripts/indexar.mjs`

## Skills invocables

Cada carpeta con `SKILL.md` es una skill invocable con `/<nombre>` una vez desplegada dentro del `.claude/skills/` del proyecto anfitrión. El nombre de la carpeta y el `name` de la cabecera deben coincidir.

| Skill | Enrutador |
|---|---|
| `/backend` | [backend/SKILL.md](../backend/SKILL.md) |
| `/brainstorming` | [brainstorming/SKILL.md](../brainstorming/SKILL.md) |
| `/cloud` | [cloud/SKILL.md](../cloud/SKILL.md) |
| `/dispatching-parallel-agents` | [dispatching-parallel-agents/SKILL.md](../dispatching-parallel-agents/SKILL.md) |
| `/executing-plans` | [executing-plans/SKILL.md](../executing-plans/SKILL.md) |
| `/finishing-a-development-branch` | [finishing-a-development-branch/SKILL.md](../finishing-a-development-branch/SKILL.md) |
| `/genai` | [genai/SKILL.md](../genai/SKILL.md) |
| `/indice` | [indice/SKILL.md](SKILL.md) |
| `/mobile` | [mobile/SKILL.md](../mobile/SKILL.md) |
| `/receiving-code-review` | [receiving-code-review/SKILL.md](../receiving-code-review/SKILL.md) |
| `/requesting-code-review` | [requesting-code-review/SKILL.md](../requesting-code-review/SKILL.md) |
| `/security` | [security/SKILL.md](../security/SKILL.md) |
| `/seo` | [seo/SKILL.md](../seo/SKILL.md) |
| `/subagent-driven-development` | [subagent-driven-development/SKILL.md](../subagent-driven-development/SKILL.md) |
| `/systematic-debugging` | [systematic-debugging/SKILL.md](../systematic-debugging/SKILL.md) |
| `/test-driven-development` | [test-driven-development/SKILL.md](../test-driven-development/SKILL.md) |
| `/using-git-worktrees` | [using-git-worktrees/SKILL.md](../using-git-worktrees/SKILL.md) |
| `/using-superpowers` | [using-superpowers/SKILL.md](../using-superpowers/SKILL.md) |
| `/verification-before-completion` | [verification-before-completion/SKILL.md](../verification-before-completion/SKILL.md) |
| `/writing-plans` | [writing-plans/SKILL.md](../writing-plans/SKILL.md) |
| `/writing-skills` | [writing-skills/SKILL.md](../writing-skills/SKILL.md) |

## Resumen

| Dominio | Documentos | Enrutador |
|---|---|---|
| Raíz | 2 | — |
| Ciberseguridad | 83 | [security/SKILL.md](../security/SKILL.md) |
| Backend | 18 | [backend/SKILL.md](../backend/SKILL.md) |
| Móvil | 13 | [mobile/SKILL.md](../mobile/SKILL.md) |
| systematic-debugging | 9 | [systematic-debugging/SKILL.md](../systematic-debugging/SKILL.md) |
| using-superpowers | 6 | [using-superpowers/SKILL.md](../using-superpowers/SKILL.md) |
| Cloud | 5 | [cloud/SKILL.md](../cloud/SKILL.md) |
| writing-skills | 5 | [writing-skills/SKILL.md](../writing-skills/SKILL.md) |
| GenAI | 4 | [genai/SKILL.md](../genai/SKILL.md) |
| subagent-driven-development | 4 | [subagent-driven-development/SKILL.md](../subagent-driven-development/SKILL.md) |
| brainstorming | 3 | [brainstorming/SKILL.md](../brainstorming/SKILL.md) |
| requesting-code-review | 2 | [requesting-code-review/SKILL.md](../requesting-code-review/SKILL.md) |
| SEO | 2 | [seo/SKILL.md](../seo/SKILL.md) |
| test-driven-development | 2 | [test-driven-development/SKILL.md](../test-driven-development/SKILL.md) |
| writing-plans | 2 | [writing-plans/SKILL.md](../writing-plans/SKILL.md) |
| IA | 1 | — |
| dispatching-parallel-agents | 1 | [dispatching-parallel-agents/SKILL.md](../dispatching-parallel-agents/SKILL.md) |
| executing-plans | 1 | [executing-plans/SKILL.md](../executing-plans/SKILL.md) |
| finishing-a-development-branch | 1 | [finishing-a-development-branch/SKILL.md](../finishing-a-development-branch/SKILL.md) |
| Frontend UX-UI | 1 | — |
| Índice | 1 | [indice/SKILL.md](SKILL.md) |
| receiving-code-review | 1 | [receiving-code-review/SKILL.md](../receiving-code-review/SKILL.md) |
| using-git-worktrees | 1 | [using-git-worktrees/SKILL.md](../using-git-worktrees/SKILL.md) |
| verification-before-completion | 1 | [verification-before-completion/SKILL.md](../verification-before-completion/SKILL.md) |

## Raíz

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [README.md](../README.md) | FullSkills | readme | — | Tabla de contenidos · Qué es esto · Inicio rápido · Dominios · Índice de skills · Skills de proceso · Convenciones · Mantenimiento · Roadmap · Contri… |
| [SKILLS-PROCESO.md](../SKILLS-PROCESO.md) | Skills de proceso (flujo de desarrollo agéntico) | — | — | Qué es esto · Punto de entrada · El flujo principal (camino arquitectónico) · Skills transversales (se usan dentro de los pasos de arriba, no en secu… |

## Ciberseguridad

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [active_directory/active_directory.md](../security/active_directory/active_directory.md) | Active Directory | modelo | permanente | Kerberos: lo mínimo para razonar · Rutas de escalada de dominio · AD CS — la superficie más subestimada · Configuración de referencia · Detecciones p… |
| [ai/agents_mcp.md](../security/ai/agents_mcp.md) | Agentes, herramientas y MCP | catalogo | permanente | El problema estructural: confused deputy · Superficie del agente · Ataques específicos de agentes · MCP (Model Context Protocol) · Diseño seguro de h… |
| [ai/ai.md](../security/ai/ai.md) | Seguridad de IA y LLM | catalogo | permanente | La premisa que lo explica todo · Marcos de referencia · OWASP LLM Top 10 (edición 2025) · Inyección de prompts · Manipulación de datos y del modelo ·… |
| [art/art.md](../security/art/art.md) | Atomic Red Team — validación de detecciones | modelo | permanente | 1. Qué es y qué no es · 2. El modelo atómico · 3. Protocolo de una sesión de validación · 4. Los cuatro resultados posibles · 5. Lo que un atomic no… |
| [attacks/collection_exfiltration.md](../security/attacks/collection_exfiltration.md) | Recolección y exfiltración | catalogo | permanente | Recolección · Preparación de los datos · Canales de exfiltración · Detección: qué buscar realmente · Prevención: qué reduce realmente el impacto · Co… |
| [attacks/command_control.md](../security/attacks/command_control.md) | Command & Control e infraestructura del adversario | catalogo | permanente | Protocolos de canal · Ocultación y resiliencia de la infraestructura · Desarrollo de recursos del adversario (TA0042) · Cómo se detecta el beaconing… |
| [attacks/credential_access.md](../security/attacks/credential_access.md) | Acceso a credenciales | catalogo | permanente | Volcado de credenciales del sistema operativo · Kerberos · Coacción de autenticación y relay · Almacenes de credenciales · Credenciales desprotegidas… |
| [attacks/defense_evasion.md](../security/attacks/defense_evasion.md) | Evasión de defensas | catalogo | permanente | Desactivar o cegar los controles · Borrado y manipulación de evidencia · Ofuscación y empaquetado · Vivir de la tierra (LOLBins) · Inyección y ejecuc… |
| [attacks/discovery.md](../security/attacks/discovery.md) | Reconocimiento y descubrimiento | catalogo | permanente | Reconocimiento externo · Descubrimiento del host · Descubrimiento de red y dominio · Descubrimiento en la nube · Patrones de detección de alto valor… |
| [attacks/execution.md](../security/attacks/execution.md) | Ejecución | catalogo | permanente | Intérpretes de comandos y scripting · Ejecución inducida por el usuario · Explotación para ejecución · Ejecución por servicios y planificadores · Eje… |
| [attacks/impact.md](../security/attacks/impact.md) | Impacto | catalogo | permanente | Destrucción y denegación de datos · Interrupción de servicio · Manipulación y fraude · Impacto físico (OT/ICS) · Secuencia previa al impacto: la vent… |
| [attacks/initial_access.md](../security/attacks/initial_access.md) | Acceso inicial | catalogo | permanente | Phishing e ingeniería social · Explotación de servicios expuestos · Credenciales válidas · Cadena de suministro y relaciones de confianza · Físico y… |
| [attacks/lateral_movement.md](../security/attacks/lateral_movement.md) | Movimiento lateral | catalogo | permanente | Uso de material de autenticación alternativo · Servicios remotos · Herramientas de ejecución remota · Movimiento por infraestructura compartida · Mov… |
| [attacks/network.md](../security/attacks/network.md) | Tácticas de ataque a redes | catalogo | permanente | 1. Conseguir la posición on-path (AiTM) · 2. Manipulación de la conmutación y el enrutamiento · 3. DNS como superficie · 4. El dispositivo de red com… |
| [attacks/persistence.md](../security/attacks/persistence.md) | Persistencia | catalogo | permanente | Windows — arranque y sesión · Linux / Unix · Persistencia de identidad (la que sobrevive al formateo) · Persistencia de bajo nivel · Persistencia en… |
| [attacks/privilege_escalation.md](../security/attacks/privilege_escalation.md) | Escalada de privilegios | catalogo | permanente | Windows — local · Linux — local · Active Directory — de usuario de dominio a Domain Admin · Cloud · Contenedores · Principios defensivos |
| [attacks/reconnaissance_external.md](../security/attacks/reconnaissance_external.md) | Reconocimiento externo — técnicas adicionales | catalogo | permanente | Recolección de información pasiva · Reconocimiento activo · Cómo priorizar defensivamente |
| [aws/aws.md](../security/aws/aws.md) | AWS | modelo | permanente | Modelo de permisos · Rutas de escalada en IAM · Registro y detección · Detecciones de alta prioridad · Configuración base de una cuenta · Servicios c… |
| [azure/azure.md](../security/azure/azure.md) | Azure, Entra ID y Microsoft 365 | modelo | permanente | Dos planos de autorización distintos · Rutas de escalada en el directorio · Acceso condicional: la pieza central · Registro y detección · Detecciones… |
| [blockchain/blockchain.md](../security/blockchain/blockchain.md) | Seguridad Blockchain / Web3 | catalogo | permanente | Premisa · Categorías de riesgo en Web3 · Incidentes notables en Web3 · Herramientas de seguridad Web3 · Fuentes de referencia |
| [bug_bounty/bug_bounty.md](../security/bug_bounty/bug_bounty.md) | Bug Bounty / Vulnerability Disclosure | modelo | permanente | Tipos de programas · Plataformas principales · Estructura de un programa · Severidad y rango de recompensas · Reglas de engagement (ejemplo) · Métric… |
| [capec.md](../security/capec.md) | CAPEC — patrones de ataque | taxonomia | permanente | Vistas del catálogo · Patrones de referencia y su cadena · Anatomía de una entrada CAPEC (qué campos aprovechar) · Aplicación práctica: modelado de a… |
| [cisa_kev.md](../security/cisa_kev.md) | Priorización de vulnerabilidades: KEV, EPSS y SSVC | modelo | volatil | Por qué no se prioriza por CVSS · KEV (CISA Known Exploited Vulnerabilities) · EPSS · SSVC — árbol de decisión · Fórmula operativa de priorización ·… |
| [cloud/cloud.md](../security/cloud/cloud.md) | Seguridad en la nube — modelo transversal | modelo | permanente | Los cuatro cambios de modelo mental · Modelo de responsabilidad compartida · Cadena de ataque característica en la nube · IAM: los errores que causan… |
| [containers/containers.md](../security/containers/containers.md) | Contenedores — modelo de aislamiento y escapes | modelo | permanente | Premisa fundamental · Vías de escape, por causa · Configuración segura de un contenedor · Seguridad de la imagen · Detección en tiempo de ejecución ·… |
| [cti/cti.md](../security/cti/cti.md) | Threat Intelligence (CTI) | modelo | permanente | Niveles de CTI · Frameworks de análisis CTI · Fuentes de inteligencia · Formatos estandarizados · TTP-based intelligence vs IOC-based intelligence ·… |
| [cve_database.md](../security/cve_database.md) | Base de CVEs — esquema y fichas de referencia | referencia | volatil | Esquema canónico · Ficha 1 — Log4Shell · Ficha 2 — Zerologon · Ficha 3 — CitrixBleed · Ficha 4 — ProxyShell · Ficha 5 — MOVEit Transfer · Ficha 6 — B… |
| [cwe.md](../security/cwe.md) | CWE — causa raíz de la vulnerabilidad | taxonomia | permanente | Regla de asignación · Top 25 (edición 2024) con causa y corrección estructural · Clases estructurales para razonar (más útiles que el ranking) · Rela… |
| [databases/databases.md](../security/databases/databases.md) | Seguridad de bases de datos | modelo | permanente | Riesgos transversales · SQL Server · PostgreSQL · MySQL / MariaDB · NoSQL y almacenes en memoria · Detección · Diseño defensivo |
| [detection/detection.md](../security/detection/detection.md) | Ingeniería de detección | modelo | permanente | Jerarquía de valor de una detección · Requisito previo: telemetría · Ciclo de vida de una detección · Detección como código · Reducción de falsos pos… |
| [docker/docker.md](../security/docker/docker.md) | Docker | modelo | permanente | El daemon es la superficie crítica · Alternativas que reducen el riesgo estructural · Configuración del daemon · Ejecución segura de un contenedor ·… |
| [firewalls/firewalls.md](../security/firewalls/firewalls.md) | Firewalls y segmentación | modelo | permanente | El firewall como objetivo · Tipos y qué aporta cada uno · Diseño de política · Segmentación: el control con mejor relación coste/impacto · Egress: lo… |
| [forensics/forensics.md](../security/forensics/forensics.md) | Forense Digital | modelo | permanente | Premisa fundamental · Principios · Fase 1 — Preparación · Fase 2 — Adquisición de evidencia · Fase 3 — Análisis de disco · Fase 4 — Análisis de memor… |
| [frameworks.md](../security/frameworks.md) | Marcos y modelos: cuál usar y cuándo | modelo | permanente | Cyber Kill Chain (Lockheed Martin) · Diamond Model · Pyramid of Pain · NIST CSF 2.0 · CIS Controls v8 · ISO/IEC 27001:2022 · Zero Trust · Modelado de… |
| [gcp/gcp.md](../security/gcp/gcp.md) | Google Cloud | modelo | permanente | Jerarquía y herencia · IAM: rutas de escalada · Políticas de organización (barandillas preventivas) · Registro y detección · Detecciones de alta prio… |
| [glossary.md](../security/glossary.md) | Glosario operativo | referencia | permanente | Riesgo y vulnerabilidad · Métricas · Identidad y criptografía · Defensa · Operación de seguridad · Ecosistema de actores · Web e infraestructura · OT… |
| [hardening/hardening.md](../security/hardening/hardening.md) | Hardening | modelo | permanente | Principios · Los diez controles de mayor impacto · Baselines de referencia · Por plataforma · Correo: el hardening más rentable que se olvida · Estac… |
| [hardware/hardware.md](../security/hardware/hardware.md) | Seguridad de Hardware | catalogo | permanente | Vectores de ataque a nivel de hardware · Seguridad de arranque · Vulnerabilidades de hardware conocidas · Ataques a infraestructura física · Segurida… |
| [hunting/hunting.md](../security/hunting/hunting.md) | Threat hunting | modelo | permanente | Tipos de caza · Método · Catálogo de hipótesis por táctica · Técnicas analíticas · Errores frecuentes · Madurez del programa · Relación con el resto… |
| [hyperv/hyperv.md](../security/hyperv/hyperv.md) | Hyper-V | modelo | permanente | Arquitectura y su implicación · Riesgos y controles · Controles diferenciales de Hyper-V · Hardening del host · Detección · Respuesta |
| [ioc/ioc.md](../security/ioc/ioc.md) | IOC e inteligencia de amenazas | modelo | permanente | Pirámide del dolor · Tipos de inteligencia · Ciclo de inteligencia · Formatos y estándares · Calidad de un IOC · Uso operativo · Recolección desde un… |
| [iot/iot.md](../security/iot/iot.md) | Seguridad de IoT / Dispositivos Embebidos | catalogo | permanente | Premisa IoT · Top 10 de riesgos IoT (OWASP IoT Top 10 2018/2025) · Vulnerabilidades de firmware · Ataques específicos de IoT · Seguridad del ciclo de… |
| [kubernetes/kubernetes.md](../security/kubernetes/kubernetes.md) | Kubernetes | modelo | permanente | Superficies de ataque · RBAC: permisos que equivalen a cluster-admin · Cadena de ataque típica · Controles de admisión · Red · Secretos · Auditoría y… |
| [linux/linux.md](../security/linux/linux.md) | Seguridad de Linux y Unix | modelo | permanente | Modelo de seguridad · Superficie de escalada local · Hardening: los ajustes que más importan · Telemetría · Indicadores de compromiso característicos… |
| [malware/malware.md](../security/malware/malware.md) | Malware | modelo | permanente | Clasificación por función · Cadena típica de una infección moderna · Técnicas de evasión · Análisis de malware: metodología · Qué extraer de un análi… |
| [mitre_attack.md](../security/mitre_attack.md) | MITRE ATT&CK — estructura y uso | taxonomia | permanente | Jerarquía · Matrices · Tácticas Enterprise y ruta al catálogo · Cómo mapear correctamente · Uso 1 — evaluación de cobertura (heat map) · Uso 2 — prio… |
| [mitre_d3fend.md](../security/mitre_d3fend.md) | MITRE D3FEND — contramedidas | taxonomia | permanente | Tácticas defensivas · Cómo se usa realmente · Mapa rápido: técnica ofensiva → familia de contramedida · Deception: la táctica infrautilizada · Errore… |
| [mobile/mobile.md](../security/mobile/mobile.md) | Seguridad móvil | modelo | permanente | Premisa · Categorías MASVS · Riesgos por categoría · Superficie del servidor · Gestión de flota · Amenazas específicas |
| [nist.md](../security/nist.md) | NIST — publicaciones aplicables | referencia | permanente | CSF 2.0 — funciones y categorías · SP 800-53 Rev.5 — familias de control · SP 800-61 — ciclo de respuesta · SP 800-63-4 — niveles de identidad · SSDF… |
| [ot_ics/ot_ics.md](../security/ot_ics/ot_ics.md) | Seguridad OT / ICS | modelo | permanente | Premisa OT · Modelo Purdue (segmentación TI/OT) · Protocolos industriales y sus vulnerabilidades · Tácticas ATT&CK ICS específicas · Arquitectura def… |
| [owasp_api.md](../security/owasp_api.md) | OWASP API Security Top 10 (2023) | taxonomia | permanente | Por qué BOLA domina · Riesgos específicos por estilo de API · Seguridad de JWT (fuente recurrente de API2) · Controles transversales del gateway |
| [owasp.md](../security/owasp.md) | OWASP Top 10 — riesgos de aplicación web | taxonomia | permanente | Edición 2021 (la que mapea la mayoría de herramientas) · Edición 2025 — cambios estructurales · Cómo usar esta lista sin degradarla · Complementos OW… |
| [pentesting/pentesting.md](../security/pentesting/pentesting.md) | Pentesting — Metodología | modelo | permanente | Marcos de referencia · Fases del pentesting (PTES) · Tipos de prueba · Reglas de engagement (SOW) · Fase 1 — Reconocimiento · Fase 2 — Escaneo de vul… |
| [playbooks/active_directory.md](../security/playbooks/active_directory.md) | Playbook — Compromiso de Active Directory | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Cuándo reconstruir el bosque · Recuperación · Preve… |
| [playbooks/cloud.md](../security/playbooks/cloud.md) | Playbook — Incidente en la nube (IaaS/PaaS) | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Recuperación · Prevención |
| [playbooks/docker.md](../security/playbooks/docker.md) | Playbook — Incidente en Docker | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Prevención |
| [playbooks/entra_id.md](../security/playbooks/entra_id.md) | Playbook — Compromiso de Entra ID (tenant) | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Recuperación · Prevención |
| [playbooks/exchange.md](../security/playbooks/exchange.md) | Playbook — Microsoft Exchange (on-premises) | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Prevención |
| [playbooks/firewalls.md](../security/playbooks/firewalls.md) | Playbook — Compromiso de firewall o dispositivo de red | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Recuperación · Prevención |
| [playbooks/hyperv.md](../security/playbooks/hyperv.md) | Playbook — Incidente en Hyper-V | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Recuperación · Prevención |
| [playbooks/ir_base.md](../security/playbooks/ir_base.md) | Playbook base de respuesta a incidentes | playbook | permanente | Principios que se incumplen con más frecuencia · Fase 0 — Preparación (antes del incidente) · Fase 1 — Detección y triaje · Fase 2 — Contención · Fas… |
| [playbooks/kubernetes.md](../security/playbooks/kubernetes.md) | Playbook — Incidente en Kubernetes | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Recuperación · Prevención |
| [playbooks/microsoft365.md](../security/playbooks/microsoft365.md) | Playbook — Compromiso de cuenta en Microsoft 365 | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Prevención |
| [playbooks/ransomware.md](../security/playbooks/ransomware.md) | Playbook — Ransomware | playbook | permanente | Señales de entrada · Primeros 60 minutos · Evidencia específica · Preguntas de la investigación · Erradicación · Recuperación · Decisión sobre el pag… |
| [playbooks/sharepoint.md](../security/playbooks/sharepoint.md) | Playbook — SharePoint Server (on-premises) | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Prevención |
| [playbooks/sql_server.md](../security/playbooks/sql_server.md) | Playbook — SQL Server | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Prevención |
| [playbooks/vmware.md](../security/playbooks/vmware.md) | Playbook — Incidente en VMware vSphere / ESXi | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Recuperación · Prevención |
| [playbooks/vpn.md](../security/playbooks/vpn.md) | Playbook — Compromiso de gateway VPN | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Prevención |
| [playbooks/webshell.md](../security/playbooks/webshell.md) | Playbook — Web shell | playbook | permanente | Señales de entrada · Contención inmediata · Evidencia específica · Investigación · Erradicación · Prevención |
| [privacy/privacy.md](../security/privacy/privacy.md) | Privacidad y Protección de Datos | modelo | permanente | Premisa · Regulaciones principales · Conceptos fundamentales · Bases legales del tratamiento (GDPR Art. 6) · Derechos del interesado (GDPR Arts. 15-2… |
| [ransomware/ransomware.md](../security/ransomware/ransomware.md) | Ransomware | modelo | permanente | El modelo RaaS · Evolución de la extorsión · Cadena de intrusión típica · Objetivos preferentes del atacante · Defensa: lo que realmente cambia el re… |
| [README.md](../security/README.md) | Skills de Ciberseguridad | readme | — | Cómo funciona · Estructura del repositorio · Convenciones de los módulos · Límites · Uso |
| [references/references.md](../security/references/references.md) | Fuentes externas | referencia | volatil | Vulnerabilidades · Taxonomías y marcos · Detección y reglas · Inteligencia de amenazas · Herramientas de análisis · Formación y validación · Cómo cit… |
| [sigma/sigma.md](../security/sigma/sigma.md) | Sigma | referencia | permanente | Estructura · Campos obligatorios y su función · Modificadores de campo · Fuentes de log habituales · Ejemplos de valor alto · Buenas prácticas · Erro… |
| [SKILL.md](../security/SKILL.md) | Skill de Ciberseguridad — índice y protocolo | enrutador | — | 1. Regla de oro: permanente vs. volátil · 2. Protocolo de respuesta · 3. Núcleo de razonamiento · 4. Mapa de enrutamiento · 5. Convenciones de los mó… |
| [snort/snort.md](../security/snort/snort.md) | Snort | referencia | permanente | Anatomía de una regla · Variables · Opciones esenciales · Rendimiento · Ejemplos · Limitaciones · Operación del conjunto de reglas |
| [suricata/suricata.md](../security/suricata/suricata.md) | Suricata | referencia | permanente | Lo que aporta sobre Snort · Palabras clave por protocolo · Ejemplos de valor alto · Análisis con EVE · Despliegue · Errores frecuentes |
| [tls/tls.md](../security/tls/tls.md) | TLS y Protocolos de Red | catalogo | permanente | TLS — conceptos clave · Cipher suites y su seguridad · Ataques a TLS conocidos · TLS 1.3 — Mejoras clave · Hardening de TLS · Protocolos de red y seg… |
| [vmware/vmware.md](../security/vmware/vmware.md) | VMware vSphere y ESXi | modelo | permanente | Por qué es objetivo prioritario · Rutas de compromiso · Hardening · Detección · Ransomware sobre ESXi · Respuesta |
| [vpn/vpn.md](../security/vpn/vpn.md) | VPN y acceso remoto | modelo | permanente | Por qué fallan · Tipos y sus riesgos · Configuración de referencia · Detección · Migración a ZTNA · Respuesta ante compromiso del gateway |
| [web/web.md](../security/web/web.md) | Seguridad web | catalogo | permanente | Inyección: el principio común · XSS · SSRF · Autenticación y sesión · Control de acceso · Otros vectores relevantes · Cabeceras de seguridad · Supply… |
| [windows/windows.md](../security/windows/windows.md) | Seguridad de Windows | modelo | permanente | Modelo de seguridad · Controles de credenciales (los que más reducen riesgo) · Controles de ejecución · Telemetría: qué recoger y por qué · Puntos de… |
| [yara/yara.md](../security/yara/yara.md) | YARA | referencia | permanente | Estructura · Tipos de cadena · Condiciones útiles · Buenas prácticas · Escaneo de memoria · Ejemplos representativos · Errores frecuentes · Cuándo us… |

## Backend

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [antipatterns.md](../backend/antipatterns.md) | Antipatrones transversales | catalogo | permanente | Contrato y datos · Concurrencia y fiabilidad · Rendimiento · Seguridad aplicada · Observabilidad y operación · Cómo se detectan desde fuera |
| [api/api.md](../backend/api/api.md) | Contrato y API | modelo | permanente | Elección de estilo y modelado del contrato · Códigos y semántica de respuesta · Idempotencia · Errores · Evolución sin romper · Colecciones · Caché H… |
| [appsec/appsec.md](../backend/appsec/appsec.md) | Seguridad aplicada al backend | modelo | permanente | Identidad · Autorización · Entrada no confiable · Secretos, configuración sensible y datos sensibles · Rastro auditable y cadena de suministro · Veri… |
| [appsec/authn.md](../backend/appsec/authn.md) | Autenticación: contraseñas, sesiones y tokens | modelo | permanente | Contraseñas: hasheo y almacenamiento · Restablecimiento y protección de la cuenta · Sesiones y credenciales de acceso · Verificación mínima antes de… |
| [ARBOL.md](../backend/ARBOL.md) | Árbol de buenas prácticas de backend | — | — | Núcleo de razonamiento · 1. Contrato y API — `api/` · 2. Datos y persistencia — `data/` · 3. Concurrencia y trabajo diferido — `concurrency/` · 4. Fi… |
| [architecture/architecture.md](../backend/architecture/architecture.md) | Arquitectura y límites | modelo | permanente | Acoplamiento y cohesión · Límites por dominio · Dirección de las dependencias · Monolito modular primero · Comunicación entre servicios y propiedad d… |
| [code/code.md](../backend/code/code.md) | Código y mantenibilidad | modelo | permanente | Errores · Tipos y fronteras · Núcleo puro, efectos en el borde · Dependencias · Legibilidad · Deuda explícita · Errores frecuentes |
| [concurrency/concurrency.md](../backend/concurrency/concurrency.md) | Concurrencia y trabajo diferido | modelo | permanente | Modelo de concurrencia del runtime · Carreras · Sacar trabajo del camino crítico · Semántica de entrega · Colas · Orden · Tareas periódicas · Coordin… |
| [data/data.md](../backend/data/data.md) | Datos y persistencia | modelo | permanente | Elegir el motor por patrón de acceso · Modelado y restricciones · Tipos que se eligen mal una y otra vez · Índices · Transacciones y aislamiento · Co… |
| [data/migrations.md](../backend/data/migrations.md) | Migraciones | modelo | permanente | Gobierno de las migraciones · Expandir → migrar → contraer · Reversibilidad · Regla de diseño ante un fallo parcial de migración |
| [delivery/delivery.md](../backend/delivery/delivery.md) | Entrega y operación | modelo | permanente | Construcción reproducible · Despliegue sin interrupción · Desacoplar despliegue de activación · Reversibilidad · Operación · Aprender del fallo · Lis… |
| [glossary.md](../backend/glossary.md) | Glosario operativo | referencia | permanente | Rendimiento y colas · Fiabilidad · Datos · Concurrencia y mensajería · API · Seguridad aplicada · Arquitectura |
| [observability/observability.md](../backend/observability/observability.md) | Observabilidad | modelo | permanente | Para qué sirve cada señal · Correlación · Registros · Métricas · Trazas · Alertas · Depurabilidad · Métricas que importan y métricas engañosas |
| [performance/performance.md](../backend/performance/performance.md) | Rendimiento, escalado y coste | modelo | permanente | Medir antes de tocar · Distribución, no media · Teoría de colas aplicada · El camino crítico · Caché · Escalado horizontal, particionado y réplicas ·… |
| [README.md](../backend/README.md) | Skill de Backend | readme | — | Cómo funciona · Estructura del repositorio · Convenciones de los módulos · Límites · Uso |
| [reliability/reliability.md](../backend/reliability/reliability.md) | Fiabilidad y modos de fallo | catalogo | permanente | Presupuesto de tiempo · Reintentos · Aislamiento del fallo · Fallo parcial · Ciclo de vida del proceso · Efectos de rebaño · Objetivos explícitos y r… |
| [SKILL.md](../backend/SKILL.md) | Skill de Backend — índice y protocolo | enrutador | — | 1. Alcance: agnóstico de tecnología · 2. Protocolo de respuesta · 3. Núcleo de razonamiento · 4. Mapa de enrutamiento · 5. Convenciones de los módulo… |
| [testing/testing.md](../backend/testing/testing.md) | Pruebas | modelo | permanente | Qué confianza compra cada nivel · Determinismo · Dobles frente a dependencia real · Contratos, datos de prueba e invariantes · Más allá de lo funcion… |

## Móvil

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [android/android_design.md](../mobile/android/android_design.md) | Diseño de interfaz en Android | modelo | permanente | Premisa · Por qué no se copia el diseño de iOS · El retroceso es un contrato, no un botón · Patrones de navegación · Interacción táctil · Cambios de… |
| [android/android_exploits.md](../mobile/android/android_exploits.md) | Campañas y vulnerabilidades explotadas en Android | catalogo | volatil | Cómo leer esta tabla · Fraude masivo sin vulnerabilidad · Lo que no se corrige en el dispositivo · Cronología · Identificadores que circulan mal atri… |
| [android/android_forensics.md](../mobile/android/android_forensics.md) | Playbook — sospecha de compromiso de un Android | playbook | permanente | Premisa · Disparadores · Preservación — antes de tocar nada · Recolección · Artefactos de alto valor · Herramientas · Interpretación · Contención y r… |
| [android/android_platform.md](../mobile/android/android_platform.md) | Restricciones de plataforma en Android | referencia | volatil | Premisa · El nivel de API objetivo: la puerta que caduca · Revisión de Google Play · Permisos y privacidad · Ejecución en segundo plano · Ciclo de ve… |
| [android/android.md](../mobile/android/android.md) | Seguridad de la plataforma Android | modelo | permanente | Premisa · Modelo de amenaza por perfil · Superficie de ataque · La cadena de parcheo · Anatomía de una cadena · Arquitectura de mitigación · Vectores… |
| [ios/ios_design.md](../mobile/ios/ios_design.md) | Diseño de interfaz en iOS | modelo | permanente | Premisa · Por qué no se copia el diseño de Android · Patrones de navegación · Interacción táctil · Estados · Accesibilidad · Adaptación |
| [ios/ios_exploits.md](../mobile/ios/ios_exploits.md) | Campañas y vulnerabilidades explotadas en iOS | catalogo | volatil | Cómo leer esta tabla · Vulnerabilidad de hardware no parcheable · Cronología · Identificadores que circulan mal atribuidos · Correcciones verificadas… |
| [ios/ios_forensics.md](../mobile/ios/ios_forensics.md) | Playbook — sospecha de compromiso de un iPhone | playbook | permanente | Premisa · Disparadores · Preservación — antes de tocar nada · Recolección · Artefactos de alto valor · Herramientas · Interpretación · Contención y r… |
| [ios/ios_platform.md](../mobile/ios/ios_platform.md) | Restricciones de plataforma en iOS | referencia | volatil | Premisa · Revisión de la App Store · Privacidad y permisos · Ejecución en segundo plano · Ciclo de versiones y soporte · Distribución alternativa en… |
| [ios/ios.md](../mobile/ios/ios.md) | Seguridad de la plataforma iOS | modelo | permanente | Premisa · Modelo de amenaza por perfil · Superficie de ataque · Anatomía de una cadena · Arquitectura de mitigación · Vectores · Endurecimiento por p… |
| [practices/practices.md](../mobile/practices/practices.md) | Buenas prácticas de construcción y entrega móvil | modelo | permanente | La diferencia estructural con el backend · Contrato con el servidor · Red y trabajo sin conexión · Rendimiento y energía · Datos locales · Observabil… |
| [SKILL.md](../mobile/SKILL.md) | Skill de Móvil — índice y protocolo | enrutador | — | 1. Alcance: el dispositivo y el producto, no la app por dentro · 2. Protocolo de respuesta · 3. Núcleo de razonamiento · 4. Mapa de enrutamiento · 5.… |
| [trends/trends.md](../mobile/trends/trends.md) | Tendencias de plataforma móvil | referencia | volatil | Cómo se usa este módulo · Direcciones estables · Decisiones que reaparecen · Límite |

## systematic-debugging

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [condition-based-waiting.md](../systematic-debugging/condition-based-waiting.md) | Condition-Based Waiting | — | — | Overview · When to Use · Core Pattern · Quick Patterns · Implementation · Common Mistakes · When Arbitrary Timeout IS Correct · Real-World Impact |
| [CREATION-LOG.md](../systematic-debugging/CREATION-LOG.md) | Creation Log: Systematic Debugging Skill | — | — | Source Material · Extraction Decisions · Structure Following skill-creation/SKILL.md · Bulletproofing Elements · Testing Approach · Iterations · Fina… |
| [defense-in-depth.md](../systematic-debugging/defense-in-depth.md) | Defense-in-Depth Validation | — | — | Overview · Why Multiple Layers · The Four Layers · Applying the Pattern · Example from Session · Key Insight |
| [root-cause-tracing.md](../systematic-debugging/root-cause-tracing.md) | Root Cause Tracing | — | — | Overview · When to Use · The Tracing Process · Adding Stack Traces · Finding Which Test Causes Pollution · Real Example: Empty projectDir · Key Princ… |
| [SKILL.md](../systematic-debugging/SKILL.md) | Systematic Debugging | enrutador | — | Overview · The Iron Law · When to Use · The Four Phases · Red Flags - STOP and Follow Process · your human partner's Signals You're Doing It Wrong ·… |
| [test-academic.md](../systematic-debugging/test-academic.md) | Academic Test: Systematic Debugging Skill | — | — | — |
| [test-pressure-1.md](../systematic-debugging/test-pressure-1.md) | Pressure Test 1: Emergency Production Fix | — | — | Scenario · Your Options · Choose A, B, or C |
| [test-pressure-2.md](../systematic-debugging/test-pressure-2.md) | Pressure Test 2: Sunk Cost + Exhaustion | — | — | Scenario · Your Options · Choose A, B, or C |
| [test-pressure-3.md](../systematic-debugging/test-pressure-3.md) | Pressure Test 3: Authority + Social Pressure | — | — | Scenario · Your Options · Choose A, B, or C |

## using-superpowers

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [references/antigravity-tools.md](../using-superpowers/references/antigravity-tools.md) | Antigravity CLI (`agy`) Tool Mapping | — | — | Task tracking |
| [references/codex-tools.md](../using-superpowers/references/codex-tools.md) | — | — | — | Subagent dispatch requires multi-agent support · Waiting on children · Model routing on spawns · Environment Detection · Codex App Finishing |
| [references/gemini-tools.md](../using-superpowers/references/gemini-tools.md) | Gemini CLI Tool Mapping | — | — | Instructions file · Personal skills directory · Subagent support · Additional Gemini CLI tools |
| [references/hermes-tools.md](../using-superpowers/references/hermes-tools.md) | Hermes Agent Tool Mapping | — | — | Tools · Instructions file · Invoking a skill · Subagent dispatch · Task tracking |
| [references/pi-tools.md](../using-superpowers/references/pi-tools.md) | Pi Tool Mapping | — | — | Subagents · Task lists |
| [SKILL.md](../using-superpowers/SKILL.md) | — | enrutador | — | The Rule · Skill Priority · Red Flags · Platform Adaptation · User Instructions |

## Cloud

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [architecture.md](../cloud/architecture.md) | Arquitectura cloud por restricciones | modelo | permanente | Ficha de decisión · Selección de forma de cómputo · Vertical slice |
| [cost.md](../cloud/cost.md) | Coste cloud como restricción de diseño | modelo | permanente | Modelo antes que cifra · Controles · Forma de salida |
| [operations.md](../cloud/operations.md) | Operación cloud reproducible | modelo | permanente | Identidad y secretos · Infraestructura y despliegue · Señales mínimas · Recuperación verificable |
| [README.md](../cloud/README.md) | Cloud | readme | — | — |
| [SKILL.md](../cloud/SKILL.md) | Skill de Cloud — decisiones y operación | enrutador | — | Protocolo · Enrutamiento · Núcleo de razonamiento · Fronteras |

## writing-skills

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [anthropic-best-practices.md](../writing-skills/anthropic-best-practices.md) | Skill authoring best practices | — | — | Core principles · Skill structure · Workflows and feedback loops · Content guidelines · Common patterns · Executive summary · Key findings · Recommen… |
| [examples/CLAUDE_MD_TESTING.md](../writing-skills/examples/CLAUDE_MD_TESTING.md) | Testing CLAUDE.md Skills Documentation | — | — | Test Scenarios · Documentation Variants to Test · Testing Protocol · Success Criteria · Expected Results · Next Steps |
| [persuasion-principles.md](../writing-skills/persuasion-principles.md) | Persuasion Principles for Skill Design | — | — | Overview · The Seven Principles · Principle Combinations by Skill Type · Why This Works: The Psychology · Ethical Use · Research Citations · Quick Re… |
| [SKILL.md](../writing-skills/SKILL.md) | Writing Skills | enrutador | — | Overview · What is a Skill? · TDD Mapping for Skills · When to Create a Skill · Skill Types · Directory Structure · SKILL.md Structure · Skill Discov… |
| [testing-skills-with-subagents.md](../writing-skills/testing-skills-with-subagents.md) | Testing Skills With Subagents | — | — | Overview · When to Use · TDD Mapping for Skill Testing · RED Phase: Baseline Testing (Watch It Fail) · GREEN Phase: Write Minimal Skill (Make It Pass… |

## GenAI

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [architecture.md](../genai/architecture.md) | Arquitectura de una capacidad GenAI | modelo | permanente | Contrato de tarea · Límite del proveedor · Escalera de complejidad · RAG |
| [evaluation.md](../genai/evaluation.md) | Evaluación orientada a tareas | modelo | permanente | Dataset mínimo útil · Graders · Regresión y lanzamiento |
| [operations.md](../genai/operations.md) | Operación de inferencia | modelo | permanente | Camino crítico · Telemetría mínima · Fallbacks honestos |
| [SKILL.md](../genai/SKILL.md) | Skill de GenAI — producto probabilístico verificable | enrutador | — | Protocolo · Enrutamiento · Núcleo de razonamiento · Fronteras |

## subagent-driven-development

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [implementer-prompt.md](../subagent-driven-development/implementer-prompt.md) | Implementer Subagent Prompt Template | — | — | — |
| [re-review-prompt.md](../subagent-driven-development/re-review-prompt.md) | Scoped Re-Review Prompt Template | — | — | — |
| [SKILL.md](../subagent-driven-development/SKILL.md) | Subagent-Driven Development | enrutador | — | When to Use · The Process · Setup · Model Selection · The Task Loop · Final Review · Finish · Common Rationalizations · Example Workflow |
| [task-reviewer-prompt.md](../subagent-driven-development/task-reviewer-prompt.md) | Task Reviewer Prompt Template | — | — | — |

## brainstorming

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](../brainstorming/SKILL.md) | Brainstorming Ideas Into Designs | enrutador | — | Three Paths · Anti-Pattern: "Too Simple To Need Approval" · Red Flags · Checklist · Process Flow · The Process · After the Design (architectural path… |
| [spec-document-reviewer-prompt.md](../brainstorming/spec-document-reviewer-prompt.md) | Spec Document Reviewer Prompt Template | — | — | — |
| [visual-companion.md](../brainstorming/visual-companion.md) | Visual Companion Guide | — | — | When to Use · How It Works · Starting a Session · The Loop · Writing Content Fragments · CSS Classes Available · Browser Events Format · Design Tips… |

## requesting-code-review

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [code-reviewer.md](../requesting-code-review/code-reviewer.md) | Code Reviewer Prompt Template | — | — | Example Output |
| [SKILL.md](../requesting-code-review/SKILL.md) | Requesting Code Review | enrutador | — | When to Request Review · How to Request · Example · Common Rationalizations · Red Flags |

## SEO

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [seo-master.md](../seo/seo-master.md) | Manual de Auditoría Técnica SEO (2026) | — | — | Índice · 0. Cómo usar este manual · 1. Fase 0, preparación y línea base · 2. Bloque A, indexabilidad (P0) · 3. Bloque A, códigos de estado y redirecc… |
| [SKILL.md](../seo/SKILL.md) | Skill de SEO técnico — índice y protocolo | enrutador | — | 1. Regla de oro: umbral o no entra · 2. Protocolo de respuesta · 3. Núcleo de razonamiento · 4. Mapa de enrutamiento · 5. Cruces con otros skills · 6… |

## test-driven-development

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](../test-driven-development/SKILL.md) | Test-Driven Development (TDD) | enrutador | — | Overview · When to Use · The Iron Law · Red-Green-Refactor · Good Tests · Common Rationalizations · Red Flags - STOP and Start Over · Example: Bug Fi… |
| [writing-good-tests.md](../test-driven-development/writing-good-tests.md) | Writing Good Tests | — | — | Overview · Principle 1: Name the Break · Principle 2: Exercise the Real Thing · Tests Ship With the Implementation · The Mutation Check · Quick Refer… |

## writing-plans

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [plan-document-reviewer-prompt.md](../writing-plans/plan-document-reviewer-prompt.md) | Plan Document Reviewer Prompt Template | — | — | — |
| [SKILL.md](../writing-plans/SKILL.md) | Writing Plans | enrutador | — | Overview · Scope Check · File Structure · Task Right-Sizing · Bite-Sized Task Granularity · Plan Document Header · Task Structure · No Placeholders ·… |

## IA

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [README.md](../ai/README.md) | IA | readme | — | — |

## dispatching-parallel-agents

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](../dispatching-parallel-agents/SKILL.md) | Dispatching Parallel Agents | enrutador | — | Overview · When to Use · The Pattern · Agent Prompt Structure · Common Mistakes · When NOT to Use · Real Example from Session · Verification |

## executing-plans

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](../executing-plans/SKILL.md) | Executing Plans | enrutador | — | Overview · The Process · When to Stop and Ask for Help · When to Revisit Earlier Steps · Remember |

## finishing-a-development-branch

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](../finishing-a-development-branch/SKILL.md) | Finishing a Development Branch | enrutador | — | Overview · Step 1: Verify Tests · Step 2: Detect Environment · Step 3: Determine Base Branch · Step 4: Present Options · Step 5: Execute Choice · Ste… |

## Frontend UX-UI

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [README.md](../frontend-ux-ui/README.md) | Frontend UX-UI | readme | — | — |

## Índice

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](SKILL.md) | Skill de Índice — enrutador maestro del repositorio | enrutador | — | 0. Skills invocables y despliegue · 1. Protocolo de enrutamiento · 2. Mapa de dominios · 3. Preguntas que cruzan dominios · 4. Estabilidad: lo que ca… |

## receiving-code-review

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](../receiving-code-review/SKILL.md) | Code Review Reception | enrutador | — | Overview · The Response Pattern · Forbidden Responses · Handling Unclear Feedback · Source-Specific Handling · YAGNI Check for "Professional" Feature… |

## using-git-worktrees

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](../using-git-worktrees/SKILL.md) | Using Git Worktrees | enrutador | — | Overview · Step 0: Detect Existing Isolation · Step 1: Create Isolated Workspace · Step 2: Project Setup · Step 3: Verify Clean Baseline · Quick Refe… |

## verification-before-completion

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](../verification-before-completion/SKILL.md) | Verification Before Completion | enrutador | — | Overview · The Iron Law · The Gate Function · Common Failures · Red Flags - STOP · Rationalization Prevention · Key Patterns · When To Apply |

## Material volátil

Estos módulos caducan. Verificar en la fuente antes de afirmar nada operativo.

| Módulo | Snapshot | Fuente de verificación |
|---|---|---|
| [mobile/android/android_exploits.md](../mobile/android/android_exploits.md) | 2026-08 | https://source.android.com/docs/security/bulletin |
| [mobile/android/android_platform.md](../mobile/android/android_platform.md) | 2026-08 | https://support.google.com/googleplay/android-developer |
| [mobile/ios/ios_exploits.md](../mobile/ios/ios_exploits.md) | 2026-08 | https://support.apple.com/en-us/100100 |
| [mobile/ios/ios_platform.md](../mobile/ios/ios_platform.md) | 2026-08 | https://developer.apple.com/app-store/review/guidelines/ |
| [mobile/trends/trends.md](../mobile/trends/trends.md) | 2026-08 | Notas de versión y documentación del fabricante de cada plataforma · https://developer.apple.com/documentation/ · https://developer.android.com/ |
| [security/cisa_kev.md](../security/cisa_kev.md) | 2026-07 | KEV: https://www.cisa.gov/known-exploited-vulnerabilities-catalog (JSON/CSV actualizado varias veces por semana) · EPSS: https://api.first.org/data/v1/epss (recalculado a diario) · NVD: https://services.nvd.nist.gov/rest/json/cves/2.0 |
| [security/cve_database.md](../security/cve_database.md) | 2026-07 | NVD https://nvd.nist.gov · KEV https://www.cisa.gov/known-exploited-vulnerabilities-catalog · EPSS https://api.first.org/data/v1/epss · Aviso del fabricante (fuente autoritativa de versiones) |
| [security/references/references.md](../security/references/references.md) | — | Las URL y los nombres de producto cambian; verificar antes de citar en un entregable |

## Salud

- Enlaces internos rotos: **0**
- Módulos que ningún documento enlaza: **17**
  - `brainstorming/spec-document-reviewer-prompt.md`
  - `brainstorming/visual-companion.md`
  - `systematic-debugging/condition-based-waiting.md`
  - `systematic-debugging/CREATION-LOG.md`
  - `systematic-debugging/defense-in-depth.md`
  - `systematic-debugging/root-cause-tracing.md`
  - `systematic-debugging/test-academic.md`
  - `systematic-debugging/test-pressure-1.md`
  - `systematic-debugging/test-pressure-2.md`
  - `systematic-debugging/test-pressure-3.md`
  - `using-superpowers/references/antigravity-tools.md`
  - `using-superpowers/references/hermes-tools.md`
  - `using-superpowers/references/pi-tools.md`
  - `writing-plans/plan-document-reviewer-prompt.md`
  - `writing-skills/anthropic-best-practices.md`
  - `writing-skills/examples/CLAUDE_MD_TESTING.md`
  - `writing-skills/persuasion-principles.md`

