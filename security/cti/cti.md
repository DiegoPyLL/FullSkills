---
id: cti/cti
tipo: modelo
estabilidad: permanente
consulta_externa: https://stixproject.github.io | https://taxii-spec.oasis-open.org | MISP Project | MITRE ATLAS
---

# Threat Intelligence (CTI)

Metodología de recolección, análisis y diseminación de inteligencia sobre amenazas cibernéticas. No es un listado de IOCs; es un **proceso** que transforma datos en contexto accionable para la toma de decisiones de seguridad.

## Niveles de CTI

| Nivel | Audiencia | Pregunta | Frecuencia |
|---|---|---|---|
| **Estratégica** | Dirección, board | ¿Cuáles son las amenazas relevantes para nuestro sector y nuestra organización? | Mensual/trimestral |
| **Operativa** | SOC, IR, threat hunters | ¿Qué actores, campañas y TTPs nos pueden afectar? | Continuo |
| **Táctica** | Analistas de seguridad, redactores de reglas | ¿Qué IOCs y técnicas debo buscar en nuestra red? | Diaria |
| **Técnica** | Analistas de malware, ingenieros | ¿Cómo opera este malware/actor? | On-demand |

## Frameworks de análisis CTI

### Cicrlo de inteligencia (traducción de datos a inteligencia)

| Fase | Acción | Salida |
|---|---|---|
| 1. Dirección | Definir los requisitos de inteligencia (PIR — Priority Intelligence Requirements) | Preguntas priorizadas |
| 2. Recolección | Extraer datos de fuentes relevantes | Datos crudos en repositorio |
| 3. Procesamiento | Normalizar, filtrar, estructurar | Datos listos para análisis |
| 4. Análisis | Correlacionar, inferir, predecir | Inteligencia accionable |
| 5. Diseminación | Entregar al público correcto, en el formato adecuado | Informe para la audiencia |
| 6. Retroalimentación | Medir utilidad, refinar requisitos | PIR actualizados |

### Análisis competitivo (comparar hipótesis)

| Método | Descripción | Cuándo usar |
|---|---|---|
| Análisis de hipótesis alternativas (ACH) | Listar hipótesis, buscar evidencia que las refute, no que las confirme | Cuando hay múltiples actores plausibles |
| Análisis de indicadores clave | Definir señales de que una hipótesis se confirma o descarta | Cuando se necesita monitoreo continuo |
| Análisis de cadena de suministro | Evaluar riesgos de proveedores y dependencias | Cuando se integran nuevos componentes |
| Análisis de red de actores | Graficar relaciones entre grupos, campañas, infraestructura | Cuando se necesita mapear la campaña |

## Fuentes de inteligencia

### Open Source (OSINT)

| Fuente | Tipo | Contenido |
|---|---|---|
| CISA Alerts & Advisories | Gobierno EE.UU. | Campañas, IOCs, mitigaciones |
| MSRC Security Response | Gobierno/Microsoft | Avisos de seguridad, IOCs |
| NVD | Gobierno EE.UU. | CVE, CVSS, CWE |
| MISP exchanges | Comunidad global | IOCs, TTPs, campañas |
| ISAC sectoriales | Sector específico | Inteligencia del propio sector |
| Blogs de investigación | Vendor/investigador | Análisis técnico detallado |
| Twitter/X security community | Social | Alertas tempranas, IOCs |
| GitHub advisories | Open source | CVE de proyectos de código abierto |
| VirusTotal Intelligence | Comercial/OS | Relación IOC→malware, contexto |
| MalwareBazaar | Comunidad | Samples de malware |
| URLhaus | Comunidad | URLs maliciosas |
| Abuse.ch | Comunidad | IOCs diversos |
| Shodan, Censys | Comercial/OS | Superficie expuesta de activos |

### Comercial

| Fuente | Contenido |
|---|---|
| Mandiant, CrowdStrike, SentinelOne, Palo Alto Unit42 | Inteligencia de campañas, TTPs, atribución |
| Recorded Future, ThreatConnect, Anomali | Plataformas de aggregación y correlación |
| Fox-IT (NCC Group), Kroll | Inteligencia de amenazas avanzada |
| BlackLotus Labs, Zero Day Initiative (ZDI) | Investigación zero-day y near-zero-day |

### Humana (HUMINT)

| Fuente | Contenido |
|---|---|
| ISAC sectoriales | Experiencia de pares en el mismo sector |
| Conferencias (Black Hat, DEF CON, RECON, RSAC) | Tendencias, técnicas emergentes |
| Contactos de campo (otros equipos de seguridad) | Lecciones aprendidas directas |
| Fuentes encubiertas | Acceso a comunidades de atacantes (legal) |

## Formatos estandarizados

| Formato | Uso | Ventaja |
|---|---|---|
| **STIX 2.x** | Descripción estructurada de amenazas (objetos: indicadores, campañas, TTPs, infraestructura) | Grafo de relaciones entre artefactos |
| **TAXII 2.x** | Transportar STIX sobre HTTP | Estándar de transporte de CTI |
| OpenIOC | Indicadores y artefactos de compromiso | Legacy; sustituir por STIX |
| MISP format | Eventos de inteligencia con múltiples formatos de IOCs | Amigable, rico en metadatos |
| YARA rules | Reglas de detección de malware | Compatible con análisis de malware |
| Sigma rules | Reglas de detección de logs | Compatible con SIEM |
| CSV/JSON/STIX Bundle | Export/import de IOC | Formato plano para ingestión |

## TTP-based intelligence vs IOC-based intelligence

| Característica | IOC-based | TTP-based |
|---|---|---|
| Qué se usa | Hash, IP, dominio, ruta, clave de registro | Comportamiento, técnica de ATT&CK, procedimiento |
| Vida útil | Horas a días (el atacante lo cambia) | Meses a años (cambiar TTP es costoso) |
| Coste de evasión para el atacante | Bajo (cambiar IP = segundos) | Alto (cambiar técnica = reescribir herramienta) |
| Relación con pirámide del dolor | Base (hash) → nivel 2 (IP) | Nivel 5-6 (TTP, herramienta) |
| Formato de entrega | Listas de bloqueo | STIX Cyber Observables + STIX Patterns |
| Ejemplo | Bloquear IP 1.2.3.4 | Alertar si un host realiza DCSync |

## Modelo de consumo de CTI

| Rol | Cómo consume CTI | Acciones que toma |
|---|---|---|
| **Director de seguridad (CISO)** | Resumen ejecutivo con impacto de negocio y riesgo | Aprovechamiento de presupuesto, priorización |
| **Analista de SOC** | IOCs en SIEM, TTPs en reglas Sigma/Suricata | Crear reglas, ajustar alertas |
| **Threat Hunter** | TTPs de actores relevantes al sector | Hipótesis de caza, consultas proactivas |
| **Equipo de IR** | Campañas similares, TTPs, IOCs | Escalar playbook, buscar evidencia |
| **Equipo de hardening** | Técnicas del adversario relevante | Priorizar controles contra esas técnicas |
| **Arquitecto de seguridad** | Vectores de ataque del sector | Diseño de arquitectura que reduce exposición |
| **Legal/Compliance** | Obligaciones de notificación por incidente | Plazos regulatorios, notificaciones |

## Integración de CTI en la organización

### Proceso de ingestion de IOC a detecciones

| Paso | Acción | Control de calidad |
|---|---|---|
| 1. Validación | ¿La IOC es confiable? ¿Fuente verificada? | Mínimo 2 fuentes independientes |
| 2. Filtrado | ¿Afecta a nuestro entorno? | Inventario + topología |
| 3. Correlación | ¿Es parte de una campaña más amplia? | MISP, CTI platforms |
| 4. Conversión | Traducir a reglas Sigma/Suricata/YARA | Prueba en laboratorio |
| 5. Despliegue | SIEM, firewall, proxy, EDR | Revisión por analista |
| 6. Monitoreo | ¿Disparó la regla? | Métricas de disparo y FP |
| 7. Retirada | ¿Sigue siendo relevante? | Revisión periódica cada 30 días |

### Priorización de inteligencia

| Criterio | Ponderación |
|---|---|
| Relevancia al sector | Alta — un actor que no ataca a tu sector no es prioridad |
| Relevancia a activos propios | Alta — ¿tiene la capacidad de afectar lo que tenemos? |
| Credibilidad de la fuente | Alta — ¿cuántas fuentes confirman? |
| Inmediatez | Alta — ¿hay explotación activa? |
| Capacidad de respuesta | Media — ¿podemos hacer algo con esto? |

## Mapeo de CTI a tácticas ATT&CK

El análisis de inteligencia debe mapearse a ATT&CK para cuantificar cobertura y priorizar:

| TTP → ATT&CK | Acción de seguridad |
|---|---|
| Actor usa T1566 (phishing) | Mejorar filtrado de correo, MFA, formación |
| Actor usa T1059.001 (PowerShell) | ScriptBlock logging, EDR, application control |
| Actor usa T1003.001 (LSASS dump) | Credential Guard, LSA Protection, detección de acceso |
| Actor usa T1078 (credenciales válidas) | Acceso condicional, UEBA, MFA resistente a phishing |
| Actor usa T1486 (ransomware) | Backups inmutables, segmentación, detección de preparación |
| Actor usa T1553 (subdomain takeover) | Inventario de dominios, monitoreo de DNS |
| Actor usa T1071.001 (web protocol C2) | Proxy con inspección, egress filtering |
| Actor usa T1048.003 (exfiltración sobre DNS) | Monitoreo de longitud y frecuencia de DNS queries |
| Actor usa T1078.004 (cloud accounts) | CloudTrail, IAM monitoring, detección de acceso anómalo |
| Actor usa T1055 (process injection) | EDR, detección de memoria RX, Sysmon E8/E10 |
| Actor usa T1562 (evasion) | Alerta sobre desactivación de seguridad, logs externos |
| Actor usa T1105 (external remote services) | Egress filtering, allow-list de dominios |
| Actor usa T1490 (vss delete) | Alerta inmediata, respuesta automatizada |
| Actor usa T1021 (remote services) | Segmentación, firewall entre estaciones |
| Actor usa T1098 (account manipulation) | Auditoría de IdP, alertas sobre cambios en cuentas |
| Actor usa T1078.001 (default accounts) | Inventario de cuentas, desactivación de por defecto |
| Actor usa T1136 (create account) | Auditoría de creación de cuentas, MFA |
| Actor usa T1550 (use alternate auth) | Detección de relay, SMB signing |
| Actor usa T1526 (cloud service discovery) | CloudTrail, detección de enumeration |
| Actor usa T1528 (steal cloud credential) | Token protection, MFA, MFA fatigue prevention |
| Actor usa T1530 (data from cloud storage) | Logs de acceso a storage, alertas sobre descarga masiva |
| Actor usa T1552 (unauthorized access to credentials) | Credential Guard, LAPS, LSA Protection |
| Actor usa T1005 (data from local system) | DLP, monitoreo de acceso a archivos |
| Actor usa T1020 (automated exfiltration) | DLP, monitoreo de flujo de salida |
| Actor usa T1041 (exfil over C2 channel) | Proxy con inspección, egress filtering |
| Actor usa T1048.001 (exfil over symmetric enc) | Monitoreo de tráfico cifrado inusual |
| Actor usa T1048.002 (exfil over asymmetric enc) | Monitoreo de tráfico cifrado inusual |
| Actor usa T1071.001 (web protocol) | Proxy con inspección, egress filtering |
| Actor usa T1071.002 (email protocol) | Filtrado de correo, DMARC |
| Actor usa T1071.003 (file transfer) | MFT monitoring, DLP |
| Actor usa T1071.004 (DNS) | DNS monitoring, query length alert |
| Actor usa T1071.005 (SMTP) | Filtrado de correo, DMARC |
| Actor uses T1080 (tethered exfiltration) | Monitoreo de dispositivos USB |
| Actor uses T1090.001 (proxy) | Proxy monitoring, allow-list de proxies |
| Actor uses T1090.002 (multi-hop proxy) | Monitoreo de tráfico enmascarado |
| Actor uses T1090.003 (external proxy) | DNS monitoring, allow-list |
| Actor uses T1102 (web staging) | Proxy con inspección, URL categorización |
| Actor uses T1104 (multi-channel) | Monitoreo de múltiples canales de salida |
| Actor uses T1105 (infiltration via C2) | Egress filtering, allow-list de dominios |
| Actor uses T1110.001 (brute force) | Conteo de intentos, lockout policies |
| Actor uses T1110.003 (password spraying) | Detección de múltiples intentos desde una IP |
| Actor uses T1110.004 (credential stuffing) | Listas de contraseñas comprometidas, MFA |
| Actor uses T1110.007 (web form phishing) | Filtrado de formularios, honeypots |
| Actor uses T1113 (screen capture) | DLP, monitoreo de capturas de pantalla |
| Actor uses T1115 (clipboard data) | DLP, monitoreo de portapapeles |
| Actor uses T1119 (automated collection) | DLP, monitoreo de acceso a archivos |
| Actor uses T1120 (direct hardware access) | Control de acceso físico, inventario de hardware |
| Actor uses T1123 (audio capture) | DLP, monitoreo de dispositivos de audio |
| Actor uses T1124 (system location discovery) | Detección de geolocalización por procesos |
| Actor uses T1125 (video capture) | DLP, monitoreo de cámaras |
| Actor uses T1132 (data encoding) | Análisis de contenido, sandbox |
| Actor uses T1134 (access token manipulation) | Detección de token abuse, privilegios |
| Actor uses T1137 (office application extension) | Detección de add-ins maliciosas, control de extensiones |
| Actor uses T1140 (decode obfuscated files) | Análisis de contenido, sandbox, entropy analysis |
| Actor uses T1143 (deception/anti-analysis) | Análisis de VM, anti-sandbox |
| Actor uses T1144 (command and script interception) | Detección de interceptación de comandos |
| Actor uses T1150 (redirect traffic) | Monitoreo de tráfico de red, DNS |
| Actor uses T1155 (HIP hooking) | Detección de hooks en APIs de red |
| Actor uses T1176 (browser extensions) | Inventario de extensiones, control de extensión |
| Actor uses T1185 (browser session hijacking) | Monitoreo de sesiones, cookie monitoring |
| Actor uses T1187 (forced authentication) | SMB signing, LDAP signing, bloquear SMB saliente |
| Actor uses T1189 (drive-by compromise) | Sandbox de adjuntos, filtrado de URL, application control |
| Actor uses T1190 (exploit public app) | Reducir exposición, parcheo priorizado por KEV |
| Actor uses T1195 (supply chain compromise) | SBOM, SCA, revisión de dependencias |
| Actor uses T1197 (bitsadmin for staging) | Detección de bitsadmin con argumentos de red |
| Actor uses T1199 (trusting relationship) | Acceso JIT para terceros, MFA propio, segmentación |
| Actor uses T1200 (hardware addition) | Control de puertos, seguridad física, 802.1X |
| Actor uses T1201 (password discovery) | Detección de password spraying, credential stuffing |
| Actor uses T1202 (indirect command execution) | Detección de LOLBins, control de ejecución |
| Actor uses T1203 (software exploitation) | Patching, WAF, ASR, DEP, CFG |
| Actor uses T1204 (user execution) | Bloqueo de macros, educación, ASR |
| Actor uses T1205 (traffic signaling) | Detección de beaconing, C2 channel |
| Actor uses T1207 (rogue domain controller) | Detección de DCs no autorizados, DNS monitoring |
| Actor uses T1208 (privileged account) | Least privilege, LAPS, tiering |
| Actor uses T1210 (exploitation of remote services) | Reducir exposición, parcheo, WAF |
| Actor uses T1211 (vulnerability management) | No aplica — es una práctica defensiva |
| Actor uses T1212 (exploitation of vulnerability) | Patching, WAF, ASR, DEP, CFG |
| Actor uses T1213 (data from info repos) | Control de acceso a repositorios, DLP |
| Actor uses T1214 (tools transfer) | Detección de transferencias de herramientas |
| Actor uses T1215 (credential dumping) | Credential Guard, LSA Protection, detección de acceso |
| Actor uses T1216 (system firmware) | Verificación de arranque, FIM en firmware |
| Actor uses T1217 (browser information) | Detección de fingerprinting de navegador |
| Actor uses T1218 (signed binary proxy) | Detección de LOLBins, control de ejecución |
| Actor uses T1219 (remote access software) | Detección de RMM, allow-list de herramientas |
| Actor uses T1220 (x11 forwarding) | Detección de X11 forwarding no autorizado |
| Actor uses T1221 (template injection) | Análisis de templates, validación de entrada |
| Actor uses T1222 (file and directory permissions) | Detección de cambio de permisos, auditoría |
| Actor uses T1223 (translated technical data) | Análisis de contenido, sandbox |
| Actor uses T1224 (unsecured credentials) | Gestión de secretos, escaneo de secretos |
| Actor uses T1225 (bootkit) | Verificación de arranque, EDR |
| Actor uses T1226 (information sensitivity) | Clasificación de datos, DLP |
| Actor uses T1227 (security software discovery) | Detección de descubrimiento de seguridad |
| Actor uses T1228 (defense evasion) | Detección de evasión, logging externo |
| Actor uses T1230 (data sanitized) | Detección de limpieza de datos |
| Actor uses T1231 (data manipulation) | Detección de manipulación de datos |
| Actor uses T1232 (data corruption) | Detección de corrupción de datos |
| Actor uses T1233 (password guessing) | Conteo de intentos, lockout policies |
| Actor uses T1234 (password cracking) | Detección de hash cracking, Credential Guard |
| Actor uses T1235 (password spraying) | Detección de múltiples intentos desde una IP |
| Actor uses T1236 (credential stuffing) | Listas de contraseñas comprometidas, MFA |
| Actor uses T1237 (web form phishing) | Filtrado de formularios, honeypots |
| Actor uses T1238 (drive-by compromise) | Sandbox de adjuntos, filtrado de URL |
| Actor uses T1239 (exploit public app) | Reducir exposición, parcheo, WAF |
| Actor uses T1240 (supply chain compromise) | SBOM, SCA, revisión de dependencias |
| Actor uses T1241 (bitsadmin for staging) | Detección de bitsadmin con argumentos de red |
| Actor uses T1242 (trusting relationship) | Acceso JIT para terceros, MFA propio |
| Actor uses T1243 (hardware addition) | Control de puertos, seguridad física |
| Actor uses T1244 (password discovery) | Detección de password spraying |
| Actor uses T1245 (indirect command execution) | Detección de LOLBins, control de ejecución |
| Actor uses T1246 (software exploitation) | Patching, WAF, ASR, DEP, CFG |
| Actor uses T1247 (privileged account) | Least privilege, LAPS, tiering |
| Actor uses T1248 (exploit remote services) | Reducir exposición, parcheo, WAF |
| Actor uses T1249 (vulnerability management) | No aplica — práctica defensiva |
| Actor uses T1250 (exploitation of vulnerability) | Patching, WAF, ASR, DEP, CFG |
| Actor uses T1251 (data from info repos) | Control de acceso a repositorios, DLP |
| Actor uses T1252 (tools transfer) | Detección de transferencias de herramientas |
| Actor uses T1253 (credential dumping) | Credential Guard, LSA Protection |
| Actor uses T1254 (system firmware) | Verificación de arranque, FIM |
| Actor uses T1255 (browser info) | Detección de fingerprinting |
| Actor uses T1256 (signed binary proxy) | Detección de LOLBins, control de ejecución |
| Actor uses T1257 (remote access software) | Detección de RMM, allow-list |
| Actor uses T1258 (x11 forwarding) | Detección de X11 forwarding |
| Actor uses T1259 (template injection) | Análisis de templates |
| Actor uses T1260 (file and dir permissions) | Detección de cambio de permisos |
| Actor uses T1261 (data sanitized) | Detección de limpieza de datos |
| Actor uses T1262 (data manipulation) | Detección de manipulación de datos |
| Actor uses T1263 (data corruption) | Detección de corrupción de datos |
| Actor uses T1264 (password guessing) | Conteo de intentos |
| Actor uses T1265 (password cracking) | Detección de hash cracking |
| Actor uses T1266 (password spraying) | Detección de múltiples intentos |
| Actor uses T1267 (credential stuffing) | Listas de contraseñas comprometidas |
| Actor uses T1268 (web form phishing) | Filtrado de formularios |
| Actor uses T1269 (drive-by compromise) | Sandbox de adjuntos |
| Actor uses T1270 (exploit public app) | Reducir exposición, parcheo |
| Actor uses T1271 (supply chain compromise) | SBOM, SCA |
| Actor uses T1272 (bitsadmin for staging) | Detección de bitsadmin |
| Actor uses T1273 (trusting relationship) | Acceso JIT para terceros |
| Actor uses T1274 (hardware addition) | Control de puertos |
| Actor uses T1275 (password discovery) | Detección de password spraying |
| Actor uses T1276 (indirect command execution) | Detección de LOLBins |
| Actor uses T1277 (software exploitation) | Patching, WAF |
| Actor uses T1278 (privileged account) | Least privilege, LAPS |
| Actor uses T1279 (exploit remote services) | Reducir exposición, parcheo |
| Actor uses T1280 (vulnerability management) | No aplica — práctica defensiva |
| Actor uses T1281 (exploitation of vulnerability) | Patching, WAF |

## Ciclo de vida de una detección basada en inteligencia

1. Recepción de IOC/TTP de fuente verificada.
2. Validación cruzada: 2+ fuentes independientes.
3. Relevancia: ¿afecta a nuestro entorno?
4. Conversión a regla: Sigma/Suricata/YARA.
5. Prueba en laboratorio con Atomic Red Team.
6. Despliegue en producción.
7. Monitoreo de disparos y ajuste de ruido.
8. Actualización/retirada según evolución del TTP.

## Métricas de CTI

| Métrica | Qué mide |
|---|---|
| Tiempo de detección con CTI | Cuánto redujo el CTI el MTTD |
| Reglas activadas por CTI | Cuántas reglas se crearon y dispararon |
| TTP cubiertos por CTI | Cobertura de tácticas relevantes |
| Fuente accuracy | % de IOCs de la fuente que resultaron válidos |
| Tiempo de ingestión | Desde la recepción hasta la regla en producción |
| FP rate de reglas de CTI | Falsos positivos por regla |

## Fuentes y recursos

| Recurso | Uso |
|---|---|
| [mitre_attack.md](../mitre_attack.md) | Tácticas y técnicas del adversario |
| [ioc/ioc.md](../ioc/ioc.md) | Formato y pirámide del dolor |
| [hunting/hunting.md](../hunting/hunting.md) | Hipótesis de caza basadas en TTPs |
| [detection/detection.md](../detection/detection.md) | Ciclo de vida de detecciones |
| [attacks/](../attacks/) | Catálogo de técnicas por táctica |
| [references/references.md](../references/references.md) | Fuentes de CTI y herramientas |
| [cisa_kev.md](../cisa_kev.md) | Priorización de vulnerabilidades |
| MITRE ATLAS | Tácticas y técnicas de IA adversarial |
| MISP Project | Plataforma de intercambio de IOCs |
| STIX/TAXII | Formatos estándar de CTI |
| Enrichment (vt, AbuseIPDB, etc.) | Enriquecimiento de IOC |
