---
id: attacks/network
tipo: catalogo
estabilidad: permanente
tactica: transversal — TA0006 (Credential Access) + TA0009 (Collection) + TA0011 (C2) + TA0040 (Impact)
---

# Tácticas de ataque a redes

La red no es una táctica: es una **posición**. Por eso este catálogo cruza varias tácticas de ATT&CK en vez de mapear una. Tres cosas distintas se confunden bajo «ataque de red» y conviene separarlas desde el principio:

1. **Conseguir la posición on-path** — ponerse en medio del tráfico de otros (sección 1 y 2).
2. **Atacar el dispositivo de red** — el switch, el router, el firewall como objetivo final (sección 4).
3. **Usar la red como canal** — túnel, proxy, exfiltración, denegación (secciones 6 y 7).

Hecho estructural que explica casi todo lo demás: **la capa 2 no tiene autenticación**. ARP, DHCP, LLMNR, NBT-NS, mDNS y los anuncios de router IPv6 se diseñaron para redes de confianza y responden a quien pregunte. No hay un parche que arreglar. Por eso, en esta superficie, **la detección rinde poco y la eliminación rinde mucho**: casi todas las filas de abajo se cierran apagando un protocolo o autenticando el puerto, no escribiendo una regla.

## 1. Conseguir la posición on-path (AiTM)

| Técnica | ATT&CK | Cómo funciona | Detección | Qué la elimina |
|---|---|---|---|---|
| Envenenamiento LLMNR / NBT-NS / mDNS | T1557.001 | La víctima no resuelve un nombre por DNS y pregunta a la difusión; el atacante responde el primero y recibe la autenticación | Respuestas a nombres inexistentes; host que contesta a muchas consultas de difusión | **Desactivar LLMNR y NBT-NS por GPO.** Es el control más rentable de toda esta lista |
| Envenenamiento de caché ARP | T1557.002 | ARP gratuito no solicitado que asocia la IP de la pasarela a la MAC del atacante | Cambios de par IP-MAC; una MAC con varias IP | Dynamic ARP Inspection en el switch, sobre DHCP snooping |
| DHCP falso | T1557.003 | Un servidor DHCP no autorizado responde antes y reparte pasarela y DNS propios | Ofertas DHCP desde un puerto que no es el del servidor | DHCP snooping con puertos de confianza declarados |
| Anuncios de router IPv6 falsos (RA / DHCPv6) | T1557 | IPv6 está activo aunque la red se opere en IPv4; el atacante anuncia ruta y DNS por IPv6 y se lleva todo el tráfico | Nuevos routers IPv6 anunciándose; DNS IPv6 inesperado | RA Guard y DHCPv6 Guard; desactivar IPv6 solo si de verdad no se usa |
| WPAD | T1557 | El cliente busca `wpad` por difusión y acepta un proxy automático del atacante | Consultas a `wpad` y descargas de `wpad.dat` de origen inesperado | Registrar `wpad` en DNS como entrada bloqueante; desactivar la detección automática de proxy |
| Punto de acceso gemelo (evil twin) | T1557 | SSID clonado con mejor señal; el cliente se asocia solo | Mismo SSID desde un BSSID desconocido | 802.1X con validación de certificado de servidor en el cliente |
| Implante físico en la red | T1200 | Dispositivo intercalado en un puerto o en el cableado | Cambios de MAC por puerto; puertos que despiertan fuera de horario | 802.1X con perfilado; puertos no usados apagados administrativamente |

**Qué se hace con la posición, una vez obtenida**, está en [credential_access.md](credential_access.md#coaccion-de-autenticacion-y-relay): la coacción de autenticación y el relay NTLM son el destino habitual del envenenamiento de nombres. Aquí está cómo se llega; allí, qué se consigue.

## 2. Manipulación de la conmutación y el enrutamiento

| Técnica | ATT&CK | Cómo funciona | Detección | Qué la elimina |
|---|---|---|---|---|
| Salto de VLAN por negociación | — | El puerto negocia trunk automáticamente y el atacante habla con todas las VLAN | Trunks que aparecen en puertos de acceso | Desactivar la negociación automática; modo acceso explícito |
| Salto de VLAN por doble etiqueta | — | Dos etiquetas 802.1Q; el primer switch quita una y reenvía a otra VLAN | Tramas con doble etiqueta | VLAN nativa dedicada y sin uso; nunca la VLAN 1 |
| Toma del raíz de STP | — | El atacante anuncia prioridad mejor y se convierte en raíz del árbol: el tráfico pasa por él | Cambios de raíz de STP no planificados | Root Guard y BPDU Guard en puertos de acceso |
| Inyección de rutas en IGP (OSPF, EIGRP, RIP) | — | Vecindad sin autenticar; se anuncia una ruta mejor hacia el destino que interesa | Vecinos nuevos; cambios de tabla de rutas | Autenticación de vecino en el protocolo; interfaces pasivas donde no hay routers |
| Secuestro de BGP y fuga de rutas | — | Anuncio de un prefijo ajeno, o más específico, desde otro sistema autónomo | Monitorización externa de anuncios del propio prefijo | RPKI con validación de origen, filtros por IRR, límites de prefijos |
| Cruce del límite de red | T1599 · T1599.001 | Un dispositivo con pata en dos zonas se usa como puente entre ellas | Tráfico entre zonas que no debería existir | Segmentación real: ver [../firewalls/firewalls.md](../firewalls/firewalls.md#segmentacion-el-control-con-mejor-relacion-costeimpacto) |

Estas técnicas casi no aparecen en ATT&CK Enterprise, que modela sobre todo hosts. Que no tengan identificador **no las hace menos reales**: son de las pocas que dan acceso lateral sin tocar un endpoint, y por eso no las ve el EDR.

## 3. DNS como superficie

| Técnica | ATT&CK | Qué consigue | Detección | Mitigación |
|---|---|---|---|---|
| Envenenamiento de caché del resolver | — | Redirigir un dominio legítimo para todos los clientes del resolver | Respuestas con TTL anómalo; discrepancia con un resolver de control | DNSSEC en validación, puerto de origen aleatorio, resolvers propios y actualizados |
| Secuestro de registrador o de zona | T1584.002 | Control del dominio sin tocar la red de la víctima | Cambios de NS o de registro A no planificados; vigilancia de CT logs | Bloqueo en el registrador, MFA en la cuenta, alerta sobre cambios de zona |
| Toma de subdominio | — | Un CNAME apunta a un servicio dado de baja y el atacante lo reclama | Inventario periódico de CNAME sin destino vivo | Retirar el registro DNS *antes* que el recurso, no después |
| Túnel DNS para C2 | T1071.004 · T1572 | Canal de mando por un protocolo que casi nunca se bloquea | Entropía y longitud de etiqueta altas, volumen de TXT/NULL, muchos subdominios únicos por dominio padre | Resolver interno obligatorio, salida al 53 bloqueada, análisis de dominios de alta cardinalidad |
| Exfiltración por DNS | T1048 | Sacar datos sin abrir una conexión de salida | Volumen de consultas por host muy por encima de su línea base | Igual que arriba, más límite de tasa |
| Inundación NXDOMAIN | T1498 | Agotar el resolver autoritativo de la víctima | Pico de consultas a nombres inexistentes bajo un mismo dominio | Limitación de tasa por cliente, caché de respuestas negativas |

El túnel DNS es el ejemplo canónico de por qué **el egress importa más que el ingress**: casi ninguna organización bloquea el 53 de salida, y esa es exactamente la razón por la que se usa. Ver [../firewalls/firewalls.md](../firewalls/firewalls.md#egress-lo-que-mas-se-descuida).

## 4. El dispositivo de red como objetivo

Un router o un firewall comprometido es peor que un servidor comprometido: **no tiene EDR, casi nadie mira sus logs, sobrevive al reinicio y ve todo el tráfico**.

| Técnica | ATT&CK | Qué implica | Detección |
|---|---|---|---|
| Modificación de la imagen del sistema | T1601 | Firmware alterado que persiste a la actualización | Verificación de la imagen contra el hash del fabricante, desde fuera del propio equipo |
| Parcheo de la imagen en memoria | T1601.001 | Cambio de comportamiento sin tocar el disco | Comparación de la imagen en ejecución con la almacenada |
| Degradación de la imagen | T1601.002 | Volver a una versión vulnerable manteniendo apariencia normal | Inventario de versiones y alerta ante retroceso |
| Volcado de configuración por SNMP | T1602.001 | Rutas, ACL, comunidades, topología completa | Consultas SNMP desde origen no autorizado; comunidades por defecto en uso |
| Volcado de configuración del dispositivo | T1602.002 | Igual, por la vía de administración | Comandos de exportación de configuración fuera de ventana |
| Arranque por TFTP | T1542.005 | Cargar una imagen controlada por el atacante en el arranque | Cambios en la configuración de arranque |
| Señalización de tráfico y port knocking | T1205 · T1205.001 | Puerta trasera que solo abre ante una secuencia concreta | Conexiones a puertos cerrados en secuencia; reglas que aparecen sin ticket |

Complementos: el firewall como objetivo, en [../firewalls/firewalls.md](../firewalls/firewalls.md#el-firewall-como-objetivo); la pasarela VPN, en [../vpn/vpn.md](../vpn/vpn.md#respuesta-ante-compromiso-del-gateway).

## 5. Escucha y manipulación del tráfico

| Técnica | ATT&CK | Nota |
|---|---|---|
| Sniffing de red | T1040 | Pasivo y sin firma en la red. Se detecta en el host (interfaz en modo promiscuo, drivers de captura), no en el cable |
| Abuso de SPAN, TAP y espejo de puerto | T1040 | La infraestructura de monitorización es un objetivo: da copia legítima de todo el tráfico sin estar on-path |
| Manipulación del dato en tránsito | T1565.002 | Alterar en vuelo en lugar de leer. Más difícil de advertir que el robo, porque nada desaparece |

El cifrado **reduce** esta sección, no la elimina: quedan expuestos los metadatos (quién habla con quién, cuándo y cuánto), el SNI en la mayoría de despliegues, y todo lo que se degrade a texto claro. Qué protege realmente cada versión de TLS y qué ataques siguen vivos está en [../tls/tls.md](../tls/tls.md#ataques-a-tls-conocidos); no se repite aquí.

## 6. La red como canal

| Técnica | ATT&CK | Nota |
|---|---|---|
| Proxy interno | T1090.001 | Un host comprometido enruta a los demás; solo uno habla con el exterior y el resto parece tráfico interno |
| Proxy externo | T1090.002 | Salto intermedio para ocultar el destino real |
| Proxy multisalto | T1090.003 | Cadena de saltos; complica la atribución |
| Domain fronting | T1090.004 | SNI de un dominio legítimo, `Host` distinto, ambos en el mismo CDN |
| Tunelización de protocolo | T1572 | Encapsular un protocolo dentro de otro permitido (SSH, DNS, HTTPS, ICMP, WebSocket) |
| Exfiltración por protocolo alternativo | T1048 | Sacar los datos por un canal distinto del de mando |

La mecánica de C2, el beaconing y su detección viven en [command_control.md](command_control.md); aquí solo se enumeran como usos de la red.

## 7. Denegación de servicio

| Técnica | ATT&CK | Nota |
|---|---|---|
| Inundación directa | T1498.001 | Volumen bruto desde muchos orígenes |
| Reflexión y amplificación | T1498.002 | Consultas con origen falsificado a servicios que responden mucho más de lo que se les pregunta (DNS, NTP, memcached, SSDP). El factor de amplificación es lo que la hace viable |
| Denegación sobre el endpoint | T1499 | Agotar la aplicación en vez del enlace; mucho menos tráfico para el mismo efecto |

Dos consecuencias que se olvidan: **el filtrado de origen (BCP 38) en el borde del proveedor es lo que haría inviable la reflexión**, y una denegación es a veces la **cortina** de otra cosa — conviene no consumir toda la capacidad de respuesta en el ruido. La denegación como objetivo final se trata en [impact.md](impact.md).

## 8. Por qué la detección de capa 2 casi nunca funciona

En una red plana de tamaño real, el ARP legítimo cambia constantemente: portátiles que despiertan, VMs que migran, conmutaciones de alta disponibilidad. Cualquier regla sobre «cambio de par IP-MAC» produce más ruido del que un turno puede revisar, y el atacante solo necesita minutos. Es la superficie donde **más claramente conviene invertir en control y no en alerta**:

1. **Apagar LLMNR y NBT-NS por GPO.** Cierra de golpe el vector inicial más usado en redes Windows.
2. **Firma SMB obligatoria y vinculación de canal en LDAP.** Convierte el relay obtenido en inútil aunque el envenenamiento funcione.
3. **DHCP snooping, Dynamic ARP Inspection y RA Guard** en el switch de acceso, en este orden: los dos últimos dependen del primero.
4. **802.1X en puertos de acceso** y puertos sin uso apagados administrativamente.
5. **Segmentar**, para que la posición on-path valga solo dentro de un segmento pequeño.
6. **Controlar el egress por destino y protocolo**, que es lo que corta túnel y exfiltración.
7. **Tratar los dispositivos de red como activos críticos**: administración fuera de banda, configuración versionada, versiones inventariadas y logs recogidos de verdad.

Regla de lectura: si una fila de este catálogo se cierra con una casilla de configuración, esa es la respuesta. La detección se reserva para lo que no se puede apagar.

## Fuentes de referencia

| Recurso | Uso |
|---|---|
| [credential_access.md](credential_access.md) | Coacción de autenticación y relay: el destino del envenenamiento de nombres |
| [lateral_movement.md](lateral_movement.md) | Qué se hace después, ya con credenciales |
| [discovery.md](discovery.md) | Escaneo y mapeo previos a todo lo anterior |
| [command_control.md](command_control.md) | Canal de mando, beaconing y su detección |
| [impact.md](impact.md) | La denegación como objetivo final |
| [../firewalls/firewalls.md](../firewalls/firewalls.md) | Segmentación, política y egress |
| [../tls/tls.md](../tls/tls.md) | Qué protege el cifrado y qué ataques siguen vivos |
| [../vpn/vpn.md](../vpn/vpn.md) | Pasarelas de acceso remoto |
| [../hardening/hardening.md](../hardening/hardening.md) | Endurecimiento de sistemas y servicios |
| [../mitre_attack.md](../mitre_attack.md) | Tácticas y técnicas de ATT&CK |
| [../detection/detection.md](../detection/detection.md) | Cómo se construye y se afina una detección |
