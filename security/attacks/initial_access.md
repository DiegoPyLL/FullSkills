---
id: attacks/initial_access
tipo: catalogo
estabilidad: permanente
tactica: TA0001
---

# Acceso inicial

Cómo entra el adversario. En la práctica, la inmensa mayoría de las intrusiones empieza por una de tres puertas: **credencial válida**, **servicio expuesto sin parchear** o **phishing**. Todo lo demás es minoría estadística.

Formato: `Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación`.

## Phishing e ingeniería social

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Phishing con adjunto | T1566.001 | Correo entra al buzón | Ejecución al abrir | Adjunto ejecutable o con macro; proceso hijo de Office | Bloqueo de macros con MOTW, sandbox de adjuntos, ASR |
| Phishing con enlace | T1566.002 | Usuario hace clic | Credencial robada o descarga | Dominio recién registrado, look-alike, proxy con categorización | MFA resistente a phishing, aislamiento de navegador |
| Phishing vía servicio | T1566.003 | Contacto por LinkedIn, Teams, WhatsApp, SMS | Evita el filtro de correo corporativo | Telemetría del cliente de chat; DLP en Teams | Restringir chat externo, formación específica |
| Spearphishing dirigido | T1566 | OSINT previo sobre la víctima | Alta tasa de éxito | Baja tasa de reporte, alto contexto | Verificación fuera de banda de peticiones sensibles |
| AitM de credenciales (Evilginx, Tycoon) | T1557 + T1566 | Proxy inverso que retransmite el login real | Roba **la cookie de sesión**: derrota TOTP y push | Sesión sin evento de dispositivo; IP/ASN anómalos; discrepancia de user-agent | **FIDO2/WebAuthn** (la única defensa real: la credencial está ligada al origen) |
| MFA fatigue / push bombing | T1621 | Credencial ya robada | Aprobación por agotamiento | Ráfaga de push denegados seguida de una aprobación | Number matching, límite de intentos, alerta ante ráfaga |
| Vishing / falso soporte técnico | T1566 | Llamada o Teams simulando helpdesk | Instalación de RMM o entrega de MFA | Instalación de AnyDesk/Quick Assist tras una llamada | Verificación de identidad del helpdesk, allow-list de herramientas de soporte |
| Callback phishing (TOAD) | T1566 | Correo sin enlace que pide llamar | Salta filtros por no contener URL | Correos con solo un teléfono; llamadas salientes correlacionadas | Formación, bloqueo de RMM no autorizados |
| Falsa actualización de navegador / ClickFix | T1189 + T1204 | Web comprometida o anuncio malicioso | El usuario pega y ejecuta un comando en `Win+R` | Ejecución de PowerShell desde `RunMRU`; portapapeles como origen | Bloquear ejecución desde la caja de diálogo Ejecutar; ASR |
| SEO poisoning / malvertising | T1189 | Búsqueda de software popular | Descarga de instalador troyanizado | Descarga de instalador desde dominio no oficial | Application control, allow-list de fuentes de software |
| Drive-by compromise | T1189 | Visita a sitio con exploit kit | Ejecución sin interacción | Navegador que lanza procesos hijo | Navegador actualizado, aislamiento, EDR |
| Watering hole | T1189 | Sitio de nicho que la víctima frecuenta | Ataque dirigido de bajo ruido | Difícil; depende del EDR en el endpoint | Aislamiento de navegación, parcheo |
| Spearphishing por voz (vishing dirigido) | T1566.004 | Número o identidad suplantados por el atacante | Entrega credenciales o instala software por teléfono | Correlación de llamada entrante con instalación o login posterior | Verificación de identidad fuera de banda, formación específica a roles expuestos |
| Inyección de contenido en tránsito | T1659 | Posición de red (AitM) sobre tráfico no cifrado | Inserta script, redirección o payload en una respuesta legítima | Contenido de respuesta distinto entre rutas de red; TLS ausente donde debería existir | HSTS y HTTPS estricto, DNS cifrado, detección de AitM en la red |

## Explotación de servicios expuestos

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Explotación de aplicación pública | T1190 | Servicio alcanzable y vulnerable | RCE o acceso a datos | Proceso hijo del servidor web; petición anómala en logs | Parcheo por KEV ([cisa_kev.md](../cisa_kev.md)), WAF, reducción de exposición |
| Explotación de dispositivo de borde (VPN, firewall) | T1190 | Appliance sin parchear | Acceso a red interna, robo de sesión | Logs del appliance, sesiones sin login correspondiente | [vpn/vpn.md](../vpn/vpn.md); retirar EOL |
| Web shell tras explotación | T1505.003 | RCE en servidor web | Persistencia inmediata | Archivo nuevo en webroot; proceso hijo de `w3wp`/`httpd` | Integridad de archivos; ejecución denegada en directorios de subida |
| Servicios remotos externos (RDP, Citrix, VPN sin MFA) | T1133 | Servicio expuesto + credencial | Acceso directo, sin malware | Login desde ASN/geografía inusual | MFA obligatorio, ZTNA, nunca RDP a Internet |
| Deserialización en servicio expuesto | T1190 | Endpoint que deserializa entrada | RCE | Patrones de gadget en el cuerpo; proceso hijo anómalo | Ver [web/web.md](../web/web.md#deserializacion) |
| Explotación de API mal autorizada | T1190 | API pública con BOLA/BFLA | Acceso a datos ajenos | Un usuario accede a muchos IDs distintos | [owasp_api.md](../owasp_api.md) |

## Credenciales válidas

Es el vector con **mejor relación coste/beneficio** para el atacante: no genera alertas de malware.

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Cuentas válidas compradas a un IAB | T1078 | Credencial obtenida por un tercero | Acceso legítimo | Comportamiento inconsistente con el perfil del usuario | MFA, acceso condicional, UEBA |
| Password spraying | T1110.003 | Lista de usuarios | Una contraseña débil entre muchas cuentas | Muchos 4625 con una misma contraseña, distribuidos en el tiempo | Contraseñas con lista de prohibidas, bloqueo inteligente, MFA |
| Credential stuffing | T1110.004 | Volcado de otra brecha | Acceso por reutilización | Alta tasa de fallo desde IP distribuidas | MFA, detección de bots, contraseñas comprometidas bloqueadas |
| Credenciales de infostealer | T1078 | Malware en un equipo personal o BYOD | Cookies de sesión + contraseñas del navegador | Sesión reutilizada desde otro dispositivo | Token protection, dispositivos gestionados, MFA por sesión |
| Cuentas por defecto | T1078.001 | Dispositivo o software sin configurar | Acceso administrativo | Escaneo de credenciales por defecto | Cambio obligatorio en el despliegue |
| Cuentas de dominio | T1078.002 | Credencial de AD/Entra ID obtenida | Acceso con los privilegios y el alcance de la cuenta de dominio | Login fuera del patrón habitual del usuario; uso desde host no gestionado | MFA en todo acceso de dominio, acceso condicional, segmentación de cuentas admin vs. estándar |
| Secretos filtrados en repositorios | T1552.001 | Commit con clave | Acceso a API o nube | Escaneo de secretos, alertas del proveedor | Escaneo en pre-commit y en el historial, rotación automática |

## Cadena de suministro y relaciones de confianza

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Compromiso de software de terceros | T1195.002 | Proveedor comprometido | Acceso masivo simultáneo | Comportamiento anómalo de un binario firmado y legítimo | SBOM, egress restringido incluso para software confiable, detección conductual |
| Compromiso de dependencia | T1195.001 | Paquete o librería comprometida | Ejecución en build o en runtime | Cambio de mantenedor, versión nueva anómala, script de instalación | Lockfiles, versiones fijadas, revisión de dependencias nuevas |
| Dependency confusion | T1195.001 | Nombre interno resoluble en el registro público | El build descarga el paquete del atacante | Descarga desde registro público de un paquete que debería ser interno | Ámbitos privados, registro con prioridad interna explícita, nombres reservados |
| Typosquatting | T1195.001 | Error tipográfico en el nombre del paquete | Ejecución en el desarrollador o en CI | Paquete de baja reputación y alta similitud | Allow-list de paquetes, proxy de repositorio |
| Compromiso del CI/CD | T1195 | Acceso al pipeline o a un secreto de build | Firma de artefactos maliciosos | Cambios en la definición del pipeline, runners nuevos | Pipeline como código con revisión, runners efímeros, OIDC sin secretos de larga vida |
| Relación de confianza (MSP, proveedor) | T1199 | Acceso legítimo del proveedor | Entrada por la puerta lateral | Acceso del proveedor fuera de horario o de alcance | Acceso JIT para terceros, MFA propio, segmentación por proveedor |
| Compromiso de imagen de contenedor | T1195.002 | Imagen base o de registro alterada | Ejecución en todos los despliegues | Firma ausente, escaneo, drift respecto al Dockerfile | Firma de imágenes (cosign), registro propio, imágenes mínimas |
| Actualización maliciosa | T1195.002 | Canal de actualización comprometido | Ejecución con privilegios de instalación | Actualización desde un origen inesperado | Verificación de firma, pinning de certificado |
| Compromiso de la cadena de suministro de hardware | T1195.003 | Manipulación durante fabricación, envío o mantenimiento del equipo | Implante persistente a nivel de firmware/hardware, difícil de erradicar con reinstalación | Comportamiento anómalo desde el arranque; discrepancia de hash de firmware frente al fabricante | Cadena de custodia verificable, atestación de firmware, adquisición por canales de confianza |

## Físico y periférico

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Medio extraíble | T1091 | USB conectado | Ejecución o robo de datos | Eventos de montaje de dispositivo; ejecución desde unidad extraíble | Control de dispositivos, bloqueo de autorun |
| Hardware añadido | T1200 | Acceso físico | Implante de red o teclado | Inventario de dispositivos USB/red | Control de puertos, seguridad física, 802.1X |
| Acceso físico a consola | T1200 | Acceso al equipo | Arranque desde medio externo, extracción de disco | Registro de acceso físico | Cifrado de disco con TPM+PIN, contraseña de firmware, arranque seguro |
| Wi-Fi corporativo comprometido | T1078 | PSK compartida o EAP mal configurado | Acceso a la red interna | Dispositivos no gestionados en la red | 802.1X con certificados, red de invitados aislada |
| Ataque a redes Wi-Fi (evil twin, deauth, captura de handshake) | T1669 | Alcance de radiofrecuencia del SSID objetivo | Acceso a la red o captura de credenciales por punto de acceso falso | WIDS: SSID duplicado, ráfaga de tramas de deauth | WIDS/WIPS, 802.11w (PMF), EAP-TLS en vez de PSK |

## Cómo priorizar defensivamente

Orden de retorno de inversión para cerrar el acceso inicial:

1. **MFA resistente a phishing** en todo acceso externo y en todas las cuentas privilegiadas. Cierra o degrada la mayoría de los vectores de credencial.
2. **Reducir la superficie expuesta**: inventario de lo alcanzable desde Internet y retirada de lo que no debe estar. No se explota lo que no existe.
3. **Parcheo priorizado por KEV** en dispositivos de borde, con la ventana más corta posible.
4. **Bloqueo de macros y de ejecución desde rutas de usuario** (ASR, WDAC).
5. **Egress restringido**: aunque entren, el C2 no sale.
6. **Detección de identidad anómala** (UEBA) para cuando entren con credencial válida y no haya malware que detectar.
