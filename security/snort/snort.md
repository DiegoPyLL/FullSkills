---
id: snort/snort
tipo: referencia
estabilidad: permanente
---

# Snort

IDS/IPS basado en firmas. Sintaxis histórica y base del ecosistema; [suricata](../suricata/suricata.md) es compatible con ella y añade capacidades. Este módulo cubre la **sintaxis común**; lo específico y moderno está en el de Suricata.

## Anatomía de una regla

```
acción protocolo origen puerto dirección destino puerto (opciones)
```

```
alert tcp $HOME_NET any -> $EXTERNAL_NET 443 ( \
    msg:"POSIBLE C2 - Beaconing a dominio de baja reputacion"; \
    flow:established,to_server; \
    content:"|16 03|"; depth:2; \
    threshold:type both, track by_src, count 10, seconds 300; \
    classtype:trojan-activity; \
    sid:1000001; rev:1; \
    metadata:attack_target Client_Endpoint; \
)
```

| Elemento | Valores | Nota |
|---|---|---|
| Acción | `alert`, `log`, `pass`, `drop`, `reject`, `sdrop` | `drop` y `reject` solo en modo IPS |
| Protocolo | `tcp`, `udp`, `icmp`, `ip` | Suricata añade protocolos de aplicación |
| Origen y destino | IP, CIDR, variable, lista, negación con `!` | Usar variables, no literales |
| Dirección | `->` o `<>` | `<-` no existe |
| `sid` | Identificador único | 1000000+ para reglas propias |
| `rev` | Revisión | Incrementar en cada cambio |

## Variables

Definidas en la configuración; usarlas siempre en lugar de direcciones literales para que la regla sea portable.

| Variable | Contenido |
|---|---|
| `$HOME_NET` | Redes propias |
| `$EXTERNAL_NET` | Normalmente `!$HOME_NET` |
| `$HTTP_SERVERS`, `$SQL_SERVERS`, `$DNS_SERVERS` | Servidores por rol |
| `$HTTP_PORTS`, `$SHELLCODE_PORTS` | Puertos por servicio |

## Opciones esenciales

| Opción | Función |
|---|---|
| `msg` | Texto de la alerta: debe ser accionable |
| `content` | Cadena o bytes a buscar; `|41 42|` para hexadecimal |
| `nocase` | Sin distinguir mayúsculas |
| `depth` | Buscar solo en los primeros N bytes |
| `offset` | Empezar en el byte N |
| `distance` / `within` | Relativo al `content` anterior: base de las firmas precisas |
| `pcre` | Expresión regular; **costosa**, usar tras un `content` que filtre |
| `flow` | `established`, `to_server`, `to_client`, `stateless` |
| `flowbits` | Estado entre paquetes de la misma sesión |
| `threshold` | Límite de alertas: `limit`, `threshold`, `both` |
| `dsize` | Tamaño del payload |
| `flags` | Banderas TCP |
| `ttl`, `id`, `itype` | Campos de cabecera |
| `classtype` | Clasificación y prioridad por defecto |
| `reference` | CVE, URL o informe de origen |
| `metadata` | Información adicional para la gestión |

## Rendimiento

El orden de las opciones importa: el motor descarta paquetes lo antes posible.

| Regla | Motivo |
|---|---|
| `content` antes que `pcre` | El primero es rápido y filtra la mayoría |
| Usar `depth` y `offset` | Evita recorrer todo el payload |
| Especificar puertos concretos | Reduce el número de reglas evaluadas por paquete |
| Incluir `flow` | Descarta tráfico irrelevante y evita alertas por paquetes sueltos |
| `content` de al menos 4 bytes y poco frecuente | El motor optimiza por el patrón más largo |
| Evitar `pcre` sin ancla | Coste desproporcionado |
| Evitar reglas con `any any -> any any` | Se evalúan contra todo el tráfico |

Una firma mal escrita no solo genera ruido: degrada el rendimiento del sensor y provoca pérdida de paquetes, con lo que se dejan de detectar **otras** cosas.

## Ejemplos

**Descarga de ejecutable por HTTP sin cifrar hacia estaciones**:

```
alert tcp $EXTERNAL_NET $HTTP_PORTS -> $HOME_NET any ( \
    msg:"DESCARGA - Ejecutable PE por HTTP en claro"; \
    flow:established,to_client; \
    content:"|4D 5A|"; depth:2; \
    content:"This program cannot be run in DOS mode"; within:256; \
    classtype:policy-violation; \
    sid:1000010; rev:1; \
)
```

**Consulta DNS con subdominio de longitud anómala** (indicio de túnel):

```
alert udp $HOME_NET any -> any 53 ( \
    msg:"C2 - Posible tunel DNS por longitud de etiqueta"; \
    content:"|01 00 00 01|"; offset:2; depth:4; \
    pcre:"/[a-z0-9]{40,}/i"; \
    threshold:type threshold, track by_src, count 20, seconds 60; \
    classtype:trojan-activity; \
    sid:1000011; rev:1; \
)
```

**Autenticación SMB saliente hacia Internet** (coacción de autenticación y fuga de NetNTLM):

```
alert tcp $HOME_NET any -> $EXTERNAL_NET 445 ( \
    msg:"POLITICA - SMB saliente a Internet, posible fuga de hash NTLM"; \
    flow:established,to_server; \
    classtype:policy-violation; \
    sid:1000012; rev:1; \
)
```

Esta última no busca contenido: la sola existencia del flujo es la anomalía. **Las mejores reglas de red suelen ser políticas, no firmas de contenido**.

## Limitaciones

| Limitación | Consecuencia | Mitigación |
|---|---|---|
| Tráfico cifrado | La mayoría del tráfico moderno es opaco al contenido | Inspección TLS, o análisis de metadatos (JA3/JA4, SNI, tamaños, temporización) |
| Evasión por fragmentación y solapamiento | Se elude la firma | Normalización y reensamblado correctos en el preprocesador |
| Firmas por contenido literal | Se evaden cambiando el payload | Combinar con reglas de política y con análisis de comportamiento |
| Rendimiento en enlaces rápidos | Pérdida de paquetes y detección incompleta | Dimensionar, afinar el conjunto de reglas, distribuir por sensores |
| Posición del sensor | Solo ve lo que pasa por él | Cobertura de norte-sur y de este-oeste; sin visibilidad interna no se ve movimiento lateral |

## Operación del conjunto de reglas

| Práctica | Motivo |
|---|---|
| Partir de un conjunto mantenido (comunitario o comercial) y **desactivar lo irrelevante** | Cargar todo degrada el rendimiento y genera ruido |
| Reglas propias con `sid` ≥ 1000000 y en repositorio versionado | Evita colisiones y permite revisión |
| Revisión periódica de las reglas más ruidosas | Suelen ser el 1 % de las reglas y el 90 % de las alertas |
| Modo IDS antes que IPS | Medir el impacto antes de bloquear |
| Bloqueo solo con reglas de altísima confianza | Un falso positivo en modo `drop` es una interrupción del servicio |
| Correlacionar con logs de host | Una alerta de red sin contexto de endpoint rara vez es concluyente |
