---
id: firewalls/firewalls
tipo: modelo
estabilidad: permanente
---

# Firewalls y segmentación

Dos temas distintos que se confunden: el **dispositivo** (que es a la vez control y objetivo) y la **política de segmentación** (que es donde está el valor real).

## El firewall como objetivo

Los dispositivos de borde concentran una parte enorme de las vulnerabilidades explotadas en el mundo real ([cisa_kev.md](../cisa_kev.md)).

| Motivo | Consecuencia |
|---|---|
| Expuestos a Internet por definición | Alcanzables por cualquiera |
| Sistemas operativos propietarios sin EDR | Sin visibilidad ni telemetría de endpoint |
| Parcheo con impacto operativo | Ventanas de exposición largas |
| Código heredado en los portales web de administración y de VPN | Vulnerabilidades pre-autenticación recurrentes |
| Guardan credenciales y sesiones | Comprometerlos entrega acceso, no solo el dispositivo |
| Fin de soporte frecuente en producción | Vulnerabilidades sin corrección posible |

Controles específicos para el dispositivo:

1. **Interfaz de administración jamás expuesta a Internet.** Es la causa directa de una parte importante de los compromisos.
2. Parcheo prioritario, tratando estos equipos como sistemas críticos, no como infraestructura estable.
3. MFA en la administración; cuentas nominales, nunca compartidas.
4. Retirada planificada de equipos en fin de soporte.
5. Configuración respaldada, versionada y comparada periódicamente para detectar cambios no aprobados.
6. **Reenvío de logs a un SIEM externo**: los logs locales son limitados y el atacante los borra.
7. Verificación de integridad del firmware tras cualquier incidente; la persistencia en estos equipos es difícil de detectar y sobrevive a la reconfiguración.

## Tipos y qué aporta cada uno

| Tipo | Decide en base a | Limitación |
|---|---|---|
| Filtrado de paquetes | IP, puerto, protocolo | No entiende el contenido ni la sesión |
| Stateful | Estado de la conexión | No inspecciona la aplicación |
| Proxy de aplicación | Contenido del protocolo | Coste y latencia |
| NGFW | Aplicación, usuario, contenido, IPS integrado | Requiere descifrado TLS para ser efectivo |
| WAF | Peticiones HTTP | Capa compensatoria: no corrige la vulnerabilidad |
| Firewall de host | Proceso e identidad local | Requiere gestión centralizada |
| Microsegmentación por identidad de carga | Identidad, no dirección IP | Requiere inventario y madurez |
| Cloud (security groups, NSG, políticas) | Etiquetas e identidades | Semántica distinta por proveedor |

## Diseño de política

Reglas de construcción, en orden:

1. **Deny by default en ambos sentidos.** El egress sin restricción es la causa de que el C2 funcione; es tan importante como el ingress.
2. **Regla mínima**: origen, destino, puerto y protocolo concretos. Un `any` en cualquier campo es una excepción que debe justificarse.
3. **Cada regla con propietario, justificación y fecha de revisión.** Sin esto, la política se degrada hasta ser inútil en pocos años.
4. **Segmentar por función y criticidad**, no solo por ubicación física: usuarios, servidores, gestión, backup, OT, invitados, DMZ.
5. **El plano de gestión en su propia zona**, alcanzable solo desde bastiones.
6. **Registrar los denegados**, no solo los permitidos: ahí está la señal de reconocimiento y de movimiento lateral.
7. **Revisión periódica** de reglas sin uso, reglas sombreadas (nunca alcanzables) y reglas demasiado amplias.

## Segmentación: el control con mejor relación coste/impacto

Frente a ransomware y movimiento lateral, la segmentación es la diferencia entre 20 servidores cifrados y 2.000.

| Zona | Regla característica |
|---|---|
| Usuarios → Usuarios | **Bloqueado**: SMB, RPC y RDP entre estaciones no tienen uso legítimo en la mayoría de organizaciones. Es la medida más rentable que existe |
| Usuarios → Servidores | Solo los puertos de aplicación necesarios |
| Servidores → Internet | Denegado por defecto; salida solo por proxy y hacia destinos declarados |
| Servidores → Servidores | Solo los flujos documentados de la aplicación |
| Cualquiera → Gestión | Solo desde bastiones, con MFA |
| Gestión → Cualquiera | Permitido pero registrado exhaustivamente |
| Backup | Zona propia, con credenciales e identidad separadas, inalcanzable desde producción |
| OT/ICS | Separación estricta según el modelo Purdue; nunca tráfico directo desde TI |
| Invitados / BYOD | Sin acceso a la red interna |

## Egress: lo que más se descuida

Un firewall que solo filtra la entrada no impide nada una vez que el atacante está dentro.

| Control | Efecto |
|---|---|
| Servidores sin salida directa a Internet | Elimina la mayor parte de los canales de C2 en la parte más crítica de la red |
| Proxy obligatorio con categorización y bloqueo de dominios recién registrados | Corta el C2 más común |
| DNS solo por el resolver interno; DoH externo bloqueado | Elimina el túnel DNS directo y da visibilidad |
| Bloqueo de SMB, RDP y SSH salientes | Corta coacción de autenticación y túneles |
| Bloqueo de servicios de túnel y de almacenamiento personal | Cierra vías de C2 y de exfiltración que ninguna firma detecta |
| Allow-list de destinos para servidores críticos | El máximo nivel: solo se habla con lo declarado |

## Inspección TLS

Sin descifrado, el NGFW ve poco más que metadatos. Con descifrado, aparecen consideraciones legales y de privacidad.

| Aspecto | Consideración |
|---|---|
| Alcance | Excluir banca, salud y categorías sensibles por política documentada |
| Cumplimiento | Informar a los usuarios; puede requerir consentimiento o negociación laboral según jurisdicción |
| Pinning de certificado | Algunas aplicaciones fallan: mantener una lista de excepciones |
| Rendimiento | El descifrado es costoso; dimensionar |
| Alternativas cuando no es viable | Análisis de metadatos: JA3/JA4, JARM, SNI, tamaño y temporización de flujos, reputación del destino |

## Detección desde el firewall

| Señal | Interpretación |
|---|---|
| Denegaciones masivas desde un host interno hacia muchos destinos | Escaneo interno: movimiento lateral en preparación |
| Conexiones periódicas y regulares a un mismo destino externo | Beaconing de C2 ([attacks/command_control.md](../attacks/command_control.md)) |
| Volumen saliente anómalo frente a la línea base del host | Exfiltración |
| Tráfico hacia países o ASN sin relación con el negocio | Indicio, no prueba |
| Conexiones a nodos de salida de Tor o a VPS conocidos | C2 o exfiltración |
| Cambios de configuración fuera de la ventana de cambios | Manipulación del control |
| Nueva regla que abre un servicio al exterior | Persistencia del atacante o error operativo grave |
| Túnel establecido desde dentro hacia un servicio de exposición (ngrok y similares) | Puerta trasera |
| Autenticación administrativa desde un origen inusual | Compromiso del dispositivo |

## Errores frecuentes

| Error | Consecuencia |
|---|---|
| Confiar en la red interna | Un solo host comprometido alcanza todo |
| Reglas `any-any` "temporales" | Se vuelven permanentes y nadie recuerda por qué |
| No filtrar la salida | El C2 funciona sin obstáculos |
| Interfaz de administración accesible desde la red de usuarios | Un phishing acaba en control del perímetro |
| Confundir NAT con seguridad | NAT no es un control de acceso |
| WAF como sustituto del parche | Compra tiempo; no corrige nada |
| No registrar denegados | Se pierde la señal más útil |
| No revisar reglas nunca | La política se degrada hasta perder sentido |
| Dispositivo en fin de soporte en producción | Vulnerabilidades sin corrección posible |

Respuesta ante compromiso del dispositivo en [playbooks/firewalls.md](../playbooks/firewalls.md).
