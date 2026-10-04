---
id: stego/stego
tipo: modelo
estabilidad: permanente
consulta_externa: https://github.com/RickdeJager/stegseek | https://0xrick.github.io/lists/stego/ | https://aperisolve.com
---

# Esteganografía y datos ocultos

Encontrar lo que no se ve. En CTF "forense/misc" la bandera está **dentro** de un archivo: en metadatos, en bytes anexados después del fin lógico, en los bits menos significativos de una imagen, o en un segundo archivo concatenado. El reto no es criptográfico: es saber dónde mira la gente y dónde no.

Diferencia con [../forensics/forensics.md](../forensics/forensics.md): aquel es adquisición y análisis de evidencia para un incidente o proceso legal; esto es extracción de un payload escondido a propósito en un único archivo. El carving y el análisis de red de pcaps se comparten; aquí viven las técnicas específicas de ocultación.

## Regla de oro: identificar antes de abrir

La extensión miente. Lo primero, **siempre**:

```
file archivo            # tipo real por magic bytes
xxd archivo | head      # cabecera: ¿coincide con la extensión?
exiftool archivo        # metadatos: autor, comentario, GPS, campos custom
strings -n 8 archivo    # cadenas legibles: flags en claro, pistas, otras firmas
binwalk archivo         # ¿hay archivos embebidos / anexados?
```

Magic bytes clave: PNG `89 50 4E 47`, JPG `FF D8 FF`, GIF `47 49 46 38`, PDF `25 50 44 46`, ZIP/Office/JAR `50 4B 03 04`, PK anexado al final de un PNG es el patrón más común de todos.

## Mapa de técnicas por portador

| Portador | Dónde se esconde | Herramienta / método |
|---|---|---|
| Cualquiera | Cadenas en claro | `strings`, `grep -a flag` |
| Cualquiera | Metadatos | `exiftool` (mira Comment, Artist, campos XMP custom) |
| Cualquiera | Archivo anexado tras el EOF | `binwalk -e`, `foremost`, buscar firma `PK`/`FFD9` |
| Cualquiera | Polyglot (válido como 2 formatos) | `file` da uno, `binwalk` revela el otro |
| PNG/BMP | LSB (bits menos significativos) | `zsteg`, `stegsolve` |
| PNG | Canales/planos de color, paleta | `stegsolve` (recorre planos), `convert -separate` |
| PNG | Dimensiones falseadas (CRC no cuadra) | editar alto/ancho en IHDR para revelar zona oculta |
| JPG | Payload con contraseña | `steghide extract`, `stegseek` (bruteforce) |
| JPG | Datos tras el marcador `FFD9` | `binwalk`, recorte manual |
| GIF | Frames ocultos | separar frames, `identify -verbose` |
| WAV/MP3 | Espectrograma, LSB de audio | `Audacity`/`Sonic Visualiser` (ver espectro), `WavSteg` |
| Texto/Unicode | Zero-width chars, whitespace | detectores de zero-width, `stegsnow` |
| PDF | Objetos, capas, texto oculto | `pdf-parser`, `pdfdetach`, `mutool` |

## Imágenes — el caso que más pediste

Orden de ataque sobre una imagen sospechosa:

1. **`exiftool`** — el comentario o un campo custom trae la flag en el 30% de los retos fáciles.
2. **`binwalk archivo.png`** — detecta un ZIP/archivo anexado tras los datos de imagen. `binwalk -e` lo extrae; si falla, recorta desde la firma `PK` con `dd`.
3. **`strings -n 8`** — flag en claro o pista.
4. **`zsteg -a archivo.png`** (solo PNG/BMP) — recorre todas las combinaciones de LSB, orden de bits y canales. Es la herramienta reina para LSB.
5. **`stegsolve`** (Java) — visor que recorre planos de bits y canales RGBA de a uno; revela texto escondido en un solo plano. También hace XOR/suma entre imágenes.
6. **`steghide extract -sf archivo.jpg`** (JPG/BMP/WAV/AU) — si pide contraseña, prueba vacía, luego **`stegseek archivo.jpg rockyou.txt`** que crackea el pass por diccionario en segundos.
7. **CRC/dimensiones del PNG**: si una herramienta se queja del CRC del chunk IHDR, probablemente alteraron alto/ancho para esconder la parte baja de la imagen; corrige las dimensiones y aparece.
8. **Online como barrido rápido**: **Aperi'Solve** corre exiftool, binwalk, zsteg, steghide y planos de una pasada. Útil para no olvidar un paso bajo presión.

## Audio

- Abrir en **Audacity** o **Sonic Visualiser** y mirar el **espectrograma**: el texto dibujado en el espectro es el reto de audio más común.
- DTMF (tonos de teléfono) → decodificar los dígitos.
- LSB de muestras → `WavSteg` / `stego-lsb`.
- Morse en el propio sonido.

## Texto y Unicode

- **Zero-width characters** (`U+200B`, `U+200C`, `U+FEFF`) entre caracteres visibles: copian y pegan sin verse. Detectores online o `grep -P`.
- **Whitespace stego** (`stegsnow`): mensaje en espacios y tabs al final de líneas.
- Diferencias de homoglifos (cirílico vs latino).

## Archivos comprimidos y anexados

- **ZIP con contraseña**: `zip2john archivo.zip > h && john h --wordlist=rockyou.txt`. Known-plaintext si conoces un archivo contenido (`bkcrack`).
- **Polyglots**: un archivo válido como PNG y como ZIP a la vez. `file` miente; `binwalk` y `unzip` revelan la otra cara. Muy usado para esconder un `flag.txt` dentro de una imagen abrible.
- **Matrioska**: extraer, repetir `file`/`binwalk` sobre lo extraído. Las banderas se anidan.

## Protocolo de trabajo

1. **`file` + `exiftool` + `strings` + `binwalk`** sobre todo, siempre, antes de teorizar.
2. **Barrer con Aperi'Solve** (o el equivalente local) para no saltarte una técnica obvia.
3. **Específico del portador** según la tabla: zsteg/stegsolve para PNG, steghide/stegseek para JPG, espectrograma para audio.
4. **Si hay contraseña, crackear con diccionario** (`stegseek`, `john`) antes de rendirse.
5. **Recursar**: todo lo extraído vuelve al paso 1.

## Herramientas a tener instaladas y probadas antes del evento

- `binwalk`, `foremost`, `exiftool`, `strings`, `xxd`, `file` (base del sistema)
- `zsteg` (Ruby), `steghide`, **`stegseek`** + `rockyou.txt`
- **`stegsolve`** (JAR, requiere Java)
- `zip2john` / `john`, `bkcrack`
- `Audacity` o `Sonic Visualiser` para audio
- `pdf-parser`, `pdfdetach` (poppler)
- Acceso a **Aperi'Solve** como red de seguridad

## Errores que cuestan tiempo

- Confiar en la extensión en vez de correr `file`.
- No correr `binwalk` y perderse un ZIP anexado tras el EOF.
- Olvidar `exiftool` (la flag estaba en el comentario todo el tiempo).
- Pelear LSB a mano cuando `zsteg -a` lo barre todo.
- No crackear el pass de steghide con `stegseek` + rockyou.
- Dejar de recursar: el archivo extraído escondía otro.
