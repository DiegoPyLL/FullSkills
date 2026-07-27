---
id: attacks/command_control
tipo: catalogo
estabilidad: permanente
tactica: TA0011 (Command and Control) + TA0042 (Resource Development)
---

# Command & Control e infraestructura del adversario

El C2 es el punto de estrangulamiento defensivo más rentable: **si el canal de control no sale, la intrusión se detiene aunque el código ya se ejecute**. Por eso una política de egress restrictivo vale más que muchas detecciones.

## Protocolos de canal

| Técnica | ATT&CK | Cómo se camufla | Detección | Mitigación |
|---|---|---|---|---|
| HTTP/HTTPS | T1071.001 | El 90 % del tráfico legítimo es igual | Beaconing (intervalo regular + jitter), JA3/JA4 anómalo, User-Agent inconsistente, URI larga y aleatoria | Proxy obligatorio con inspección TLS y categorización; allow-list de destinos para servidores |
| DNS | T1071.004 | Casi siempre permitido, rara vez inspeccionado | Subdominios largos y de alta entropía, volumen de TXT/NULL, muchos NXDOMAIN, un cliente que consulta un solo dominio miles de veces | Resolver interno obligatorio, bloqueo de DNS directo saliente, análisis de entropía |
| DNS over HTTPS / TLS | T1071.004 | Cifra la consulta y evita el resolver corporativo | Conexiones a resolvers DoH públicos conocidos | Bloquear DoH externo; forzar el resolver de la organización |
| Correo | T1071.003 | Comandos y respuestas dentro de mensajes | Cuenta que envía y recibe mensajes automatizados | DLP, inspección de correo |
| ICMP | T1095 | Datos en el payload de eco | Paquetes ICMP grandes o frecuentes | Limitar ICMP saliente |
| Protocolos no estándar en puertos estándar | T1571 | Protocolo binario sobre 443 | El tráfico en 443 no es TLS válido | Proxy que exija TLS bien formado |
| WebSocket / gRPC | T1071.001 | Sesión larga y bidireccional | Conexión persistente hacia destino no habitual | Categorización de destinos |
| Servicio web legítimo como C2 | T1102 | Slack, Discord, Telegram, Pastebin, GitHub, Google Drive, Trello | Servidores que hablan con SaaS de mensajería; API de un servicio no usado por la organización | Allow-list de SaaS por rol; los servidores no necesitan acceso a redes sociales |
| Servicios cloud del proveedor | T1102 | Blob storage, funciones, CDN con dominio legítimo | Dominio de confianza con patrón de beaconing | Inspección por comportamiento, no por reputación de dominio |
| Domain fronting | T1090.004 | SNI legítimo, cabecera `Host` distinta | Discrepancia entre SNI y `Host` | Inspección TLS; muchos proveedores ya lo impiden |

## Ocultación y resiliencia de la infraestructura

| Técnica | ATT&CK | Descripción | Detección |
|---|---|---|---|
| Cifrado del canal | T1573 | TLS o cifrado propio sobre el payload | JA3/JA4 y JARM del servidor; certificados autofirmados o con campos por defecto |
| Proxy multi-salto | T1090.003 | Cadena de nodos comprometidos o Tor | Tráfico a nodos de salida de Tor o a VPS conocidos |
| Proxy interno | T1090.001 | Un host comprometido enruta a los demás | Un equipo interno con muchas conexiones entrantes de otros equipos |
| Resolución dinámica / DGA | T1568.002 | Miles de dominios generados algorítmicamente | Alta tasa de NXDOMAIN, dominios de alta entropía y vida corta |
| Fast flux | T1568.001 | La IP del dominio rota constantemente | TTL muy bajo y muchas IP por dominio |
| Dead drop resolver | T1102.001 | La dirección del C2 está publicada en un perfil o repositorio público | Acceso a un perfil concreto seguido de conexión nueva |
| Canales escalonados | T1104 | Un canal para baliza, otro para carga y exfiltración | Correlación entre conexiones aparentemente independientes |
| Túnel de protocolo | T1572 | SSH, SOCKS, HTTP CONNECT | Sesiones SSH salientes desde servidores; herramientas como `chisel`, `ngrok`, `frp` |
| Túnel comercial (ngrok, Cloudflare Tunnel, Tailscale) | T1572 | Expone servicios internos desde dentro hacia fuera | **Alta señal**: uso no autorizado de estos servicios en la red corporativa |
| Software de acceso remoto | T1219 | RMM legítimo como canal de control | Herramienta RMM no corporativa instalada |
| Puerto de escucha entrante | T1205 | Backdoor que escucha, no llama | Puerto abierto no justificado; port knocking |
| Ejecución sin C2 (air-gapped) | T1029 | Ejecución programada y exfiltración por medio extraíble | Control de dispositivos |

## Desarrollo de recursos del adversario (TA0042)

Fase previa que ocurre fuera de la red de la víctima. Solo se contrarresta con inteligencia y con monitorización de la propia marca.

| Técnica | ATT&CK | Contramedida realista |
|---|---|---|
| Adquisición de dominios | T1583.001 | Monitorización de dominios similares al propio; registro defensivo de variantes |
| Compromiso de infraestructura de terceros | T1584 | Ninguna directa; refuerza la necesidad de detección por comportamiento |
| Adquisición de certificados TLS | T1588.004 | Monitorización de CT logs para el propio nombre |
| Compra de exploits o accesos | T1588.005/.006 | Inteligencia sobre foros; asumir que existen |
| Desarrollo de capacidades | T1587 | — |
| Creación de cuentas y personas falsas | T1585 | Monitorización de suplantación en redes sociales |
| Compromiso de cuentas legítimas | T1586 | MFA en cuentas corporativas públicas |

## Cómo se detecta el beaconing

Patrón: conexiones repetidas al mismo destino con **intervalo regular** más un jitter porcentual, tamaño de respuesta pequeño y constante mientras no hay tareas.

Método de análisis sobre logs de proxy o de flujo de red:

1. Agrupar por `(origen, destino)`.
2. Calcular los deltas de tiempo entre conexiones.
3. Medir la dispersión: baja desviación relativa = beaconing. Un jitter alto la aumenta, pero la distribución sigue siendo mucho más regular que la navegación humana.
4. Complementar con: tamaño de respuesta casi constante, sesión activa fuera de horario, destino sin referer y sin actividad de navegador asociada.
5. Descartar falsos positivos conocidos: telemetría de software, actualizaciones, comprobaciones de certificado, monitorización. Requiere una lista base mantenida.

Señales complementarias de alto valor: **JA3/JA4** (huella del cliente TLS) que no corresponde a ningún navegador ni software instalado, y **JARM** del servidor coincidente con perfiles de frameworks de C2 conocidos.

## Frameworks de C2 y sus huellas

Contexto para reconocerlos en un incidente; el detalle de familias está en [malware/malware.md](../malware/malware.md).

| Framework | Uso típico | Artefactos característicos |
|---|---|---|
| Cobalt Strike | Estándar de facto en intrusiones criminales y estatales | Named pipes con patrón `msagent_*`/`postex_*`, `rundll32` sin argumentos, inyección en `dllhost`/`werfault`, perfiles Malleable C2, valores por defecto en el certificado |
| Metasploit / Meterpreter | Pentesting y ataques oportunistas | Named pipes por defecto, patrones de stager conocidos |
| Sliver | Alternativa de código abierto, en auge | Binarios Go grandes, mTLS, DNS C2 |
| Brute Ratel, Havoc, Mythic | Evasión avanzada | Poca firma estática; detectar por comportamiento e inyección |
| Empire / PoshC2 | Post-explotación en PowerShell | 4104 con módulos característicos |
| Herramientas legítimas como C2 | RMM, ngrok, Tailscale, AnyDesk | Instalación no aprobada; tráfico a la nube del proveedor |

Regla práctica: **no perseguir el framework, perseguir el comportamiento**. La inyección en proceso, el named pipe anómalo y el beaconing existen en todos ellos; el nombre del producto cambia cada temporada.

## Controles de egress, en orden de eficacia

| Control | Efecto |
|---|---|
| **Denegar por defecto la salida de los servidores** | Un servidor solo debe hablar con lo que necesita. Elimina la mayoría de los C2 en la parte más crítica de la red |
| **Proxy obligatorio para estaciones**, con categorización y bloqueo de dominios recién registrados | Corta el C2 basado en dominios nuevos y en categorías innecesarias |
| **DNS solo por el resolver interno**, con registro y análisis; bloqueo de DoH externo | Elimina el túnel DNS directo y da visibilidad |
| **Bloquear SMB, RDP y SSH salientes al exterior** | Corta la coacción de autenticación y los túneles |
| **Inspección TLS** en el perímetro (con excepciones legales y de privacidad definidas) | Habilita la detección de contenido; sin ella, gran parte del análisis es a ciegas |
| **Allow-list de herramientas de acceso remoto y de túnel** | Elimina una vía de C2 que ninguna firma de malware detecta |
| **Alerta sobre destinos de baja reputación o recién registrados** | Los dominios de C2 suelen tener días de antigüedad |
