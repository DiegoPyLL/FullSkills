---
id: suricata/suricata
tipo: referencia
estabilidad: permanente
---

# Suricata

IDS/IPS y motor de monitorización de red. Compatible con la sintaxis de [snort](../snort/snort.md) y con capacidades adicionales que lo hacen más útil en redes modernas: multihilo, parseo de protocolos de aplicación, extracción de archivos, huellas TLS y salida estructurada en JSON (EVE).

## Lo que aporta sobre Snort

| Capacidad | Valor defensivo |
|---|---|
| Detección automática de protocolo, independiente del puerto | Detecta HTTP en 8443 o SSH en 443 |
| Palabras clave por protocolo (`http.uri`, `dns.query`, `tls.sni`, `ja3.hash`) | Reglas mucho más precisas y baratas |
| **Salida EVE en JSON** con eventos de flujo, HTTP, DNS, TLS, SSH y archivos | Convierte el sensor en fuente de telemetría, no solo en generador de alertas |
| Extracción y hash de archivos en tránsito | Permite aplicar YARA e inteligencia sobre lo transferido |
| Datasets y `datarep` | Listas grandes de indicadores con reputación, evaluadas eficientemente |
| Lua scripting | Lógica compleja cuando la sintaxis no basta |
| Multihilo real | Rendimiento en enlaces rápidos |

**El mayor valor de Suricata no son sus alertas, sino los logs EVE**: registro de todas las conexiones, consultas DNS, peticiones HTTP y sesiones TLS. Esa telemetría alimenta la caza y la investigación aunque ninguna firma dispare.

## Palabras clave por protocolo

| Protocolo | Palabras clave |
|---|---|
| HTTP | `http.method`, `http.uri`, `http.host`, `http.user_agent`, `http.request_body`, `http.response_body`, `http.stat_code`, `http.header` |
| DNS | `dns.query`, `dns.opcode`, `dns.answer.name` |
| TLS | `tls.sni`, `tls.cert_subject`, `tls.cert_issuer`, `tls.cert_fingerprint`, `tls.version`, `ja3.hash`, `ja3s.hash` |
| SSH | `ssh.proto`, `ssh.software` |
| SMB | `smb.named_pipe`, `smb.share` |
| Archivos | `file.name`, `file.magic`, `filesize`, `filemd5`, `filesha256` |
| Genéricas | `flow`, `flowbits`, `flowint`, `threshold`, `dataset`, `xbits` |

## Ejemplos de valor alto

**Certificado TLS autofirmado con campos por defecto** — patrón de infraestructura de C2:

```
alert tls $HOME_NET any -> $EXTERNAL_NET any ( \
    msg:"C2 - Certificado TLS con emisor por defecto de framework de post-explotacion"; \
    flow:established,to_server; \
    tls.cert_issuer; content:"O=Internet Widgits Pty Ltd"; \
    classtype:trojan-activity; \
    sid:2000001; rev:1; \
)
```

**Huella JA3 contra un dataset de clientes conocidos de C2**:

```
alert tls any any -> any any ( \
    msg:"C2 - Huella JA3 en dataset de clientes maliciosos"; \
    ja3.hash; dataset:isset,ja3-malicioso,type string,load ja3-malicioso.lst; \
    classtype:trojan-activity; \
    sid:2000002; rev:1; \
)
```

**Consulta DNS con entropía y longitud propias de tunelización**:

```
alert dns $HOME_NET any -> any any ( \
    msg:"C2 - Consulta DNS con etiqueta larga, posible tunel"; \
    dns.query; content:"."; pcre:"/^[a-z0-9\-]{45,}\./i"; \
    threshold:type threshold, track by_src, count 15, seconds 60; \
    classtype:trojan-activity; \
    sid:2000003; rev:1; \
)
```

**Descarga de ejecutable con extensión que no corresponde al contenido**:

```
alert http $EXTERNAL_NET any -> $HOME_NET any ( \
    msg:"ENTREGA - PE servido con extension no ejecutable"; \
    flow:established,to_client; \
    file.magic; content:"PE32"; \
    file.name; pcre:"/\.(jpg|png|gif|txt|pdf|css)$/i"; \
    classtype:trojan-activity; \
    sid:2000004; rev:1; \
)
```

**Servidor que inicia conexión saliente a Internet** — regla de política, de altísimo valor:

```
alert tcp $SERVER_NET any -> $EXTERNAL_NET any ( \
    msg:"POLITICA - Servidor inicia conexion saliente a Internet"; \
    flow:established,to_server; \
    classtype:policy-violation; \
    sid:2000005; rev:1; \
)
```

Esta última no busca nada malicioso: detecta una **violación de la política de egress**. En una red donde los servidores no deben salir a Internet, es una de las detecciones más fiables de C2 que existen, y no depende de ninguna firma.

## Análisis con EVE

Eventos disponibles en el log JSON y qué permiten:

| Tipo de evento | Uso analítico |
|---|---|
| `flow` | Volumen por conexión, duración, relación subida/bajada: base para detectar exfiltración |
| `dns` | Dominios consultados, entropía, NXDOMAIN masivos, dominios de vida corta |
| `http` | URI, host, user-agent, códigos de respuesta; detección de web shells y de escaneo |
| `tls` | SNI, certificados, JA3/JA3S: identificación de cliente y servidor incluso con tráfico cifrado |
| `alert` | Coincidencias de reglas |
| `fileinfo` | Hashes de archivos transferidos: correlación con inteligencia y con YARA |
| `anomaly` | Tráfico malformado o evasivo |
| `ssh` | Versiones de cliente y servidor |

Consulta característica para beaconing: agrupar `flow` por par origen-destino, calcular los deltas temporales entre conexiones y buscar dispersión baja. Ver [attacks/command_control.md](../attacks/command_control.md#como-se-detecta-el-beaconing).

## Despliegue

| Aspecto | Recomendación |
|---|---|
| Posición | Norte-sur en el perímetro **y** este-oeste en los segmentos internos: sin visibilidad interna no se ve movimiento lateral |
| Captura | TAP o puerto espejo; verificar que no se pierden paquetes bajo carga |
| Rendimiento | AF_PACKET o DPDK, afinidad de CPU, dimensionar según ancho de banda real |
| Conjunto de reglas | Partir de uno mantenido y **desactivar lo irrelevante**; cargar todo degrada el rendimiento |
| Modo | IDS primero; IPS solo con reglas validadas y con impacto medido |
| Salida | EVE a un recolector centralizado; es telemetría, no solo alertas |
| Tráfico cifrado | Sin descifrado, apoyarse en metadatos: JA3/JA4, SNI, tamaños, temporización, reputación |
| Almacenamiento | Los logs de flujo y DNS son la fuente de caza más útil: dimensionar retención |

## Errores frecuentes

| Error | Consecuencia |
|---|---|
| Cargar todos los conjuntos de reglas disponibles | Pérdida de paquetes y ruido inasumible |
| Solo perímetro, sin visibilidad interna | El movimiento lateral es invisible |
| Ignorar los eventos EVE y mirar solo `alert` | Se desperdicia la capacidad más valiosa del motor |
| No medir la pérdida de paquetes | Un sensor saturado no detecta y nadie se entera |
| IPS con reglas no validadas | Interrupción del servicio por falso positivo |
| Usar Suricata para lo que corresponde al endpoint | La red no ve lo que ocurre dentro de un host |
| No correlacionar red y endpoint | Una alerta de red sin contexto rara vez es concluyente |
