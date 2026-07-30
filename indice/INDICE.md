<!-- Generado por indice/scripts/indexar.mjs. No editar a mano: los cambios se pierden. -->
# Índice global del repositorio

Inventario completo de los 106 documentos del repositorio, con su tipo, su estabilidad y los temas que cubre cada uno. Sirve para decidir qué módulo cargar sin abrirlos todos. El enrutamiento con criterio está en [SKILL.md](SKILL.md).

**Generado:** 2026-07-30 · **Regenerar:** `node indice/scripts/indexar.mjs`

## Skills invocables

Cada carpeta con `SKILL.md` es una skill invocable con `/<nombre>` una vez desplegada dentro del `.claude/skills/` del proyecto anfitrión. El nombre de la carpeta y el `name` de la cabecera deben coincidir.

| Skill | Enrutador |
|---|---|
| `/backend` | [backend/SKILL.md](../backend/SKILL.md) |
| `/indice` | [indice/SKILL.md](SKILL.md) |
| `/security` | [security/SKILL.md](../security/SKILL.md) |
| `/seo` | [seo/SKILL.md](../seo/SKILL.md) |

## Resumen

| Dominio | Documentos | Enrutador |
|---|---|---|
| Raíz | 1 | — |
| Ciberseguridad | 80 | [security/SKILL.md](../security/SKILL.md) |
| Backend | 18 | [backend/SKILL.md](../backend/SKILL.md) |
| SEO | 2 | [seo/SKILL.md](../seo/SKILL.md) |
| IA | 1 | — |
| Ataques (fuera de security/) | 1 | — |
| Cloud | 1 | — |
| Frontend UX-UI | 1 | — |
| Índice | 1 | [indice/SKILL.md](SKILL.md) |

## Raíz

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [README.md](../README.md) | FullSkills | readme | — | Despliegue · Mantenimiento · Convenciones |

## Ciberseguridad

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [active_directory/active_directory.md](../security/active_directory/active_directory.md) | Active Directory | modelo | permanente | Kerberos: lo mínimo para razonar · Rutas de escalada de dominio · AD CS — la superficie más subestimada · Configuración de referencia · Detecciones p… |
| [ai/agents_mcp.md](../security/ai/agents_mcp.md) | Agentes, herramientas y MCP | catalogo | permanente | El problema estructural: confused deputy · Superficie del agente · Ataques específicos de agentes · MCP (Model Context Protocol) · Diseño seguro de h… |
| [ai/ai.md](../security/ai/ai.md) | Seguridad de IA y LLM | catalogo | permanente | La premisa que lo explica todo · Marcos de referencia · OWASP LLM Top 10 (edición 2025) · Inyección de prompts · Manipulación de datos y del modelo ·… |
| [attacks/collection_exfiltration.md](../security/attacks/collection_exfiltration.md) | Recolección y exfiltración | catalogo | permanente | Recolección · Preparación de los datos · Canales de exfiltración · Detección: qué buscar realmente · Prevención: qué reduce realmente el impacto · Co… |
| [attacks/command_control.md](../security/attacks/command_control.md) | Command & Control e infraestructura del adversario | catalogo | permanente | Protocolos de canal · Ocultación y resiliencia de la infraestructura · Desarrollo de recursos del adversario (TA0042) · Cómo se detecta el beaconing… |
| [attacks/credential_access.md](../security/attacks/credential_access.md) | Acceso a credenciales | catalogo | permanente | Volcado de credenciales del sistema operativo · Kerberos · Coacción de autenticación y relay · Almacenes de credenciales · Credenciales desprotegidas… |
| [attacks/defense_evasion.md](../security/attacks/defense_evasion.md) | Evasión de defensas | catalogo | permanente | Desactivar o cegar los controles · Borrado y manipulación de evidencia · Ofuscación y empaquetado · Vivir de la tierra (LOLBins) · Inyección y ejecuc… |
| [attacks/discovery.md](../security/attacks/discovery.md) | Reconocimiento y descubrimiento | catalogo | permanente | Reconocimiento externo · Descubrimiento del host · Descubrimiento de red y dominio · Descubrimiento en la nube · Patrones de detección de alto valor… |
| [attacks/execution.md](../security/attacks/execution.md) | Ejecución | catalogo | permanente | Intérpretes de comandos y scripting · Ejecución inducida por el usuario · Explotación para ejecución · Ejecución por servicios y planificadores · Eje… |
| [attacks/impact.md](../security/attacks/impact.md) | Impacto | catalogo | permanente | Destrucción y denegación de datos · Interrupción de servicio · Manipulación y fraude · Impacto físico (OT/ICS) · Secuencia previa al impacto: la vent… |
| [attacks/initial_access.md](../security/attacks/initial_access.md) | Acceso inicial | catalogo | permanente | Phishing e ingeniería social · Explotación de servicios expuestos · Credenciales válidas · Cadena de suministro y relaciones de confianza · Físico y… |
| [attacks/lateral_movement.md](../security/attacks/lateral_movement.md) | Movimiento lateral | catalogo | permanente | Uso de material de autenticación alternativo · Servicios remotos · Herramientas de ejecución remota · Movimiento por infraestructura compartida · Mov… |
| [attacks/persistence.md](../security/attacks/persistence.md) | Persistencia | catalogo | permanente | Windows — arranque y sesión · Linux / Unix · Persistencia de identidad (la que sobrevive al formateo) · Persistencia de bajo nivel · Persistencia en… |
| [attacks/privilege_escalation.md](../security/attacks/privilege_escalation.md) | Escalada de privilegios | catalogo | permanente | Windows — local · Linux — local · Active Directory — de usuario de dominio a Domain Admin · Cloud · Contenedores · Principios defensivos |
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

## SEO

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [seo-master.md](../seo/seo-master.md) | Manual de Auditoría Técnica SEO (2026) | — | — | Índice · 0. Cómo usar este manual · 1. Fase 0, preparación y línea base · 2. Bloque A, indexabilidad (P0) · 3. Bloque A, códigos de estado y redirecc… |
| [SKILL.md](../seo/SKILL.md) | Skill de SEO técnico — índice y protocolo | enrutador | — | 1. Regla de oro: umbral o no entra · 2. Protocolo de respuesta · 3. Núcleo de razonamiento · 4. Mapa de enrutamiento · 5. Cruces con otros skills · 6… |

## IA

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [README.md](../ai/README.md) | AI | readme | — | — |

## Ataques (fuera de security/)

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [reconnaissance_external.md](../attacks/reconnaissance_external.md) | Reconocimiento externo — técnicas adicionales | catalogo | permanente | Recolección de información pasiva · Reconocimiento activo · Cómo priorizar defensivamente |

## Cloud

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [README.md](../cloud/README.md) | Cloud | readme | — | — |

## Frontend UX-UI

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [README.md](../frontend%20UX-UI/README.md) | Frontend UX-UI | readme | — | — |

## Índice

| Documento | Título | Tipo | Estabilidad | Temas |
|---|---|---|---|---|
| [SKILL.md](SKILL.md) | Skill de Índice — enrutador maestro del repositorio | enrutador | — | 0. Skills invocables y despliegue · 1. Protocolo de enrutamiento · 2. Mapa de dominios · 3. Preguntas que cruzan dominios · 4. Estabilidad: lo que ca… |

## Material volátil

Estos módulos caducan. Verificar en la fuente antes de afirmar nada operativo.

| Módulo | Snapshot | Fuente de verificación |
|---|---|---|
| [security/cisa_kev.md](../security/cisa_kev.md) | 2026-07 | KEV: https://www.cisa.gov/known-exploited-vulnerabilities-catalog (JSON/CSV actualizado varias veces por semana) · EPSS: https://api.first.org/data/v1/epss (recalculado a diario) · NVD: https://services.nvd.nist.gov/rest/json/cves/2.0 |
| [security/cve_database.md](../security/cve_database.md) | 2026-07 | NVD https://nvd.nist.gov · KEV https://www.cisa.gov/known-exploited-vulnerabilities-catalog · EPSS https://api.first.org/data/v1/epss · Aviso del fabricante (fuente autoritativa de versiones) |
| [security/references/references.md](../security/references/references.md) | — | Las URL y los nombres de producto cambian; verificar antes de citar en un entregable |

## Salud

- Enlaces internos rotos: **5**
  - `attacks/reconnaissance_external.md` → `discovery.md`
  - `security/blockchain/blockchain.md` → `../attacks/network.md`
  - `security/hardware/hardware.md` → `../attacks/physical.md`
  - `security/SKILL.md` → `art/art.md`
  - `security/tls/tls.md` → `../attacks/network.md`
- Módulos que ningún documento enlaza: **1**
  - `backend/ARBOL.md`

