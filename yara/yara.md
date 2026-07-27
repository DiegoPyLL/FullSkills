---
id: yara/yara
tipo: referencia
estabilidad: permanente
---

# YARA

Reglas de coincidencia sobre **archivos y memoria**. Su valor real está en el escaneo de memoria: el malware moderno se descifra en RAM y solo ahí es reconocible.

## Estructura

```yara
import "pe"

rule Nombre_Descriptivo
{
    meta:
        author      = "equipo"
        date        = "2026-07-27"
        description = "Qué detecta y por qué"
        reference   = "informe o incidente de origen"
        severity    = "high"
        mitre_attack = "T1055.012"
        false_positives = "instaladores empaquetados con el mismo packer"

    strings:
        $texto  = "cadena literal" ascii wide nocase
        $hex    = { 4D 5A 90 00 03 ?? ?? 00 [4-8] FF }
        $regex  = /https?:\/\/[a-z0-9]{16}\.(top|xyz)\// nocase

    condition:
        uint16(0) == 0x5A4D and
        filesize < 5MB and
        2 of ($texto, $hex, $regex)
}
```

## Tipos de cadena

| Tipo | Sintaxis | Uso |
|---|---|---|
| Texto | `"cadena"` | Literales |
| Ancho | `wide` | UTF-16, habitual en Windows |
| Ambas codificaciones | `ascii wide` | Cubrir los dos casos |
| Sin distinguir mayúsculas | `nocase` | Cuidado: aumenta el coste y los falsos positivos |
| Hexadecimal | `{ 4D 5A ?? ?? }` | Código, cabeceras, estructuras binarias |
| Comodín de nibble | `{ 4D 5? }` | Tolerancia parcial |
| Salto | `{ 90 [4-10] C3 }` | Distancia variable entre patrones |
| Alternativa | `{ ( 74 | 75 ) 05 }` | Variantes de instrucción |
| Expresión regular | `/patrón/` | Potente y **costosa**: usar con moderación |
| `xor` | `"cadena" xor` | Cadenas ofuscadas con XOR de un byte |
| `base64` | `"cadena" base64` | Cadenas codificadas |
| `fullword` | `"admin" fullword` | Evita coincidencias parciales |
| `private` | `$x = "..." private` | No aparece en la salida del match |

## Condiciones útiles

| Expresión | Significado |
|---|---|
| `uint16(0) == 0x5A4D` | Ejecutable PE (cabecera `MZ`) |
| `uint32(0) == 0x464C457F` | ELF |
| `filesize < 2MB` | Limita el coste; **incluir siempre** |
| `all of them` / `any of them` | Todas o alguna de las cadenas |
| `3 of ($a*)` | N de un grupo |
| `for any i in (0..#a) : (@a[i] < 0x1000)` | Posición de las coincidencias |
| `$a at 0` | Coincidencia en un desplazamiento exacto |
| `$a in (0..1024)` | Coincidencia dentro de un rango |
| `pe.imports("advapi32.dll", "CryptEncrypt")` | Importación concreta |
| `pe.number_of_sections > 8` | Anomalía estructural |
| `math.entropy(0, filesize) > 7.5` | Alta entropía: empaquetado o cifrado |
| `pe.characteristics & pe.DLL` | Tipo de imagen |
| `hash.sha256(0, filesize) == "..."` | Hash exacto (último recurso) |

Módulos habituales: `pe`, `elf`, `math`, `hash`, `magic`, `dotnet`, `console`.

## Buenas prácticas

| Práctica | Motivo |
|---|---|
| Incluir `filesize` en la condición | Sin ello, el escaneo de un sistema completo se vuelve inviable |
| Poner primero las condiciones baratas | El motor evalúa en orden: `uint16(0)` antes que una expresión regular |
| Evitar cadenas de menos de 4 bytes | Coinciden en todas partes |
| Evitar expresiones regulares cuando basta una cadena | Coste muy superior |
| Detectar **capacidad**, no una muestra concreta | Una regla por hash es un IOC disfrazado |
| Combinar varias condiciones débiles | Más robusto que una fuerte y frágil |
| Documentar los falsos positivos conocidos | El analista de guardia lo agradecerá |
| Probar contra un corpus de software legítimo | Un solo falso positivo en un binario común genera un incidente operativo |
| Versionar en repositorio con pruebas | Igual que cualquier otro código |

## Escaneo de memoria

Donde YARA aporta más valor. El binario en disco puede estar empaquetado y ser irreconocible; en memoria está descifrado.

| Objetivo | Cómo |
|---|---|
| Proceso en vivo | `yara -p N reglas.yar <pid>` |
| Volcado de memoria | Escanear el archivo de volcado |
| Análisis forense de memoria | Integración con el framework de análisis (por ejemplo, el plugin de YARA de Volatility) |
| Integración con EDR | La mayoría admite reglas YARA propias sobre memoria |
| Escaneo de flota | Herramientas de respuesta en vivo con distribución de reglas |

Consideraciones: escanear memoria es costoso en CPU; limitar el alcance a procesos de interés. Las cadenas `wide` son más frecuentes en memoria de Windows. Las direcciones absolutas cambian entre ejecuciones: no fijar patrones que dependan de ellas.

## Ejemplos representativos

**Web shell genérica en ASPX** — detecta capacidad, no una muestra:

```yara
rule WebShell_ASPX_Generic
{
    meta:
        description = "ASPX con ejecución de comandos o compilación dinámica"
        mitre_attack = "T1505.003"
        false_positives = "herramientas legítimas de administración web"

    strings:
        $tag        = "<%@ Page" nocase
        $eval       = "eval(" nocase
        $request    = /Request(\.(Item|QueryString|Form))?\[/ nocase
        $process    = "System.Diagnostics.Process" nocase
        $compile    = "System.CodeDom.Compiler" nocase
        $cmd        = "cmd.exe" nocase
        $shell      = "/c " nocase

    condition:
        filesize < 200KB and
        $tag and
        $request and
        2 of ($eval, $process, $compile, $cmd, $shell)
}
```

**Binario empaquetado con pocas importaciones** — heurística estructural:

```yara
import "pe"
import "math"

rule PE_Packed_Suspicious
{
    meta:
        description = "PE con alta entropía y tabla de importaciones mínima"
        false_positives = "instaladores y software protegido comercialmente"

    condition:
        uint16(0) == 0x5A4D and
        filesize < 20MB and
        pe.number_of_imported_functions < 15 and
        math.entropy(0, filesize) > 7.2
}
```

**Cadena de exfiltración por DNS** — patrón de comportamiento en el binario:

```yara
rule DNS_Tunneling_Capability
{
    meta:
        description = "Capacidad de tunelización DNS: resolución manual y codificación"
        mitre_attack = "T1071.004"

    strings:
        $api1 = "DnsQuery_A" ascii
        $api2 = "DnsQuery_W" ascii
        $api3 = "getaddrinfo" ascii
        $enc1 = "base32" ascii nocase
        $enc2 = "0123456789abcdefghijklmnopqrstuv" ascii
        $rec1 = "TXT" ascii fullword
        $rec2 = "NULL" ascii fullword

    condition:
        uint16(0) == 0x5A4D and
        filesize < 10MB and
        any of ($api*) and any of ($enc*) and any of ($rec*)
}
```

## Errores frecuentes

| Error | Consecuencia |
|---|---|
| Regla basada en un hash o en una cadena única de la muestra | Caduca con la siguiente compilación |
| Sin `filesize` ni comprobación de tipo | Escaneo lentísimo e inviable en producción |
| Cadenas genéricas (`"http"`, `"error"`) | Falsos positivos masivos |
| Expresiones regulares complejas sin necesidad | Coste desproporcionado |
| No probar contra software legítimo | Incidente operativo al desplegar |
| Copiar reglas públicas sin revisarlas | Se heredan sus falsos positivos y su obsolescencia |
| Usar YARA para lo que debería ser Sigma | YARA mira contenido; el comportamiento se detecta en logs ([sigma/sigma.md](../sigma/sigma.md)) |

## Cuándo usar YARA y cuándo no

| Objetivo | Herramienta |
|---|---|
| Identificar una familia de malware en archivo o memoria | **YARA** |
| Clasificar muestras y agrupar campañas | **YARA** |
| Buscar artefactos en una flota tras un incidente | **YARA** |
| Detectar un comportamiento (proceso hijo anómalo, comando) | Sigma |
| Detectar tráfico de red | Suricata o Snort |
| Bloquear un hash concreto | La lista de bloqueo del EDR, no una regla YARA |
