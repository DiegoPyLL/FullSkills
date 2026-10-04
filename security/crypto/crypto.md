---
id: crypto/crypto
tipo: modelo
estabilidad: permanente
consulta_externa: https://cryptohack.org | https://github.com/RsaCtfTool/RsaCtfTool | https://gchq.github.io/CyberChef/
---

# Criptografía aplicada a CTF

Romper, no diseñar. La criptografía segura ya está en [../tls/tls.md](../tls/tls.md) (transporte) y en [../../backend/appsec/authn.md](../../backend/appsec/authn.md) (hasheo de contraseñas). Este módulo trata el lado ofensivo de un reto: **te dan un cifrado y una pista, y la vulnerabilidad está en el mal uso, no en el algoritmo**. El algoritmo casi nunca se rompe; lo que se rompe es un parámetro mal elegido, una reutilización o una fuga de información por el lado del oráculo.

## Premisa de reto

Antes de atacar, clasificar qué te dieron. El 90% del tiempo se pierde atacando lo que no es.

| Tienes | Probable familia | Primer paso |
|---|---|---|
| Texto con letras desplazadas, misma longitud | Clásico (César, Vigenère, sustitución) | Análisis de frecuencia |
| `n`, `e`, `c` grandes | RSA | Factorizar `n` o abusar de `e`/`c` |
| Base64 / hex que decodifica a bytes sin sentido | Codificación, no cifrado | Decodificar en capas |
| Bloques de 16 bytes, mismo prefijo repite | AES-ECB | Byte-at-a-time / cut-and-paste |
| Respuesta del servidor cambia si el padding es válido | Padding oracle | Ataque CBC padding |
| Hash y "firma" concatenada a datos | Length extension | `hashpump` |
| Dos textos cifrados con misma "key stream" | Reutilización de keystream / one-time pad | XOR de los cifrados |

Regla de oro: **si parece ilegible pero la longitud se conserva, es codificación o XOR, no cifrado fuerte.** Prueba decodificar antes de factorizar.

## Codificación ≠ cifrado

No protege nada, pero disfraza. Reconocer de vista:

- **Base64**: `A–Z a–z 0–9 + /`, relleno `=`. Longitud múltiplo de 4.
- **Base32**: `A–Z 2–7`, relleno `=`. Más largo.
- **Hex**: solo `0–9 a–f`, longitud par.
- **Base85 / ascii85**: densidad alta de símbolos.
- **ROT13 / ROT47**: texto legible desplazado.

Herramienta: **CyberChef** con "Magic" detecta capas encadenadas (ej. base64 → gzip → hex). `base64 -d`, `xxd -r -p`, `python3 -c "import base64,sys; ..."` para scripting.

## XOR

El primitivo más frecuente en CTF por lo barato de implementar mal.

- **XOR contra clave de un byte**: 256 claves. Fuerza bruta y puntúa por frecuencia de inglés/español o por aparición de `flag{`/`CTF{`.
- **XOR contra clave repetida (Vigenère binario)**: estima longitud de clave con distancia de Hamming (la longitud real da la menor distancia normalizada), luego trata cada columna como XOR de un byte. Es el reto clásico de *crypto 101*.
- **Reutilización de keystream / OTP**: si `c1 = m1 ⊕ k` y `c2 = m2 ⊕ k` con la **misma** `k`, entonces `c1 ⊕ c2 = m1 ⊕ m2`. Con *crib dragging* (arrastrar una palabra probable como `the ` o `flag`) se recuperan ambos mensajes sin conocer `k`. Nunca se reutiliza un keystream; cuando pasa, es el bug.

Propiedades que se explotan: `a ⊕ a = 0`, `a ⊕ 0 = a`, conmutativo y asociativo.

## Cifrados clásicos

Se resuelven con herramientas, no a mano.

| Cifrado | Señal | Ataque |
|---|---|---|
| César / ROT-n | Desplazamiento fijo | Probar los 25 desplazamientos |
| Vigenère | Clave repetida de texto | Índice de coincidencia → longitud de clave → frecuencia por columna |
| Sustitución monoalfabética | Mapeo 1:1 de símbolos | Análisis de frecuencia + solver (quipqiup) |
| Transposición | Mismas letras, orden distinto | Probar anchos de columna |
| Base/binarios "raros" | Morse, Bacon, Braille, Tap code | Reconocer el alfabeto y mapear |

Herramientas: **dCode** (reconoce y resuelve la mayoría), **quipqiup** (sustitución por diccionario), CyberChef.

## RSA — el rey del CTF de crypto

RSA en sí es sólido. Lo que rompe es el **parámetro mal elegido**. Mapa de ataques por lo que tengas:

| Condición observable | Ataque | Herramienta |
|---|---|---|
| `n` pequeño (< ~512 bits) | Factorizar directo | `factordb`, `yafu`, `msieve` |
| `n` ya está en FactorDB | Lookup, no factorizar | factordb.com |
| `p` y `q` muy cercanos | Fermat | `RsaCtfTool --attack fermat` |
| `e` muy pequeño (3) y mensaje corto | Raíz cúbica del cifrado (sin módulo efectivo) | `gmpy2.iroot(c, 3)` |
| `e` pequeño, mismo `m` con `k` módulos distintos | Håstad broadcast (CRT) | RsaCtfTool |
| `e` muy grande, cercano a `n` | Wiener (clave privada pequeña `d`) | `RsaCtfTool --attack wiener` |
| Dos claves comparten un factor `p` | `gcd(n1, n2)` | una línea de `math.gcd` |
| Te dan `p`, `q`, `e` | Calcular `d` y descifrar | script directo |
| Factorización parcial, mismo `n` y `d` conocido | Recuperar factores desde `d` | RsaCtfTool |

Cálculo base cuando ya tienes `p`, `q`, `e`:

```python
from Crypto.Util.number import inverse, long_to_bytes
phi = (p-1)*(q-1)
d = inverse(e, phi)
m = pow(c, d, n)
print(long_to_bytes(m))
```

Atajo: **RsaCtfTool** prueba la mayoría de estos ataques en automático dado un `.pub` o los parámetros. Empieza por ahí, luego razona el caso concreto.

## AES y modos de bloque

El algoritmo no se rompe; el **modo** sí.

- **ECB**: cada bloque de 16 bytes se cifra igual. Bloques de texto plano idénticos → bloques de cifrado idénticos (el "pingüino ECB"). Si controlas parte de la entrada, **byte-at-a-time**: alineas un byte desconocido en el límite de bloque y lo recuperas probando 256 valores. También *cut-and-paste* para reordenar bloques (ej. forjar un rol `admin`).
- **CBC + padding oracle**: si el servidor responde distinto ante padding válido/ inválido, descifras **sin la clave** manipulando el bloque anterior byte a byte (PKCS#7). Herramienta: `padbuster`, o script propio. Reconocible porque hay un endpoint que acepta cifrado y devuelve error de padding.
- **CBC bit-flipping**: un flip en un byte del bloque `i` produce un flip controlado en el mismo byte del texto plano del bloque `i+1`. Permite alterar un plaintext conocido sin la clave.
- **Nonce/IV reutilizado en CTR/GCM**: convierte el flujo en reutilización de keystream (ver XOR). En GCM además permite forjar etiquetas.

## Hashing

Dos usos distintos, no confundirlos.

**Romper un hash (recuperar la preimagen)**: solo viable si el espacio es pequeño o el hash es débil.

| Caso | Herramienta |
|---|---|
| Identificar el tipo | `hashid`, `hash-identifier`, longitud y charset |
| Hash de contraseña con diccionario | `hashcat -m <modo> hash.txt rockyou.txt`, `john --wordlist=` |
| Hash en bases públicas | crackstation.net, hashes.com (solo lookup) |
| MD5/SHA1 de dato corto | fuerza bruta acotada |

MD5 y SHA1 están rotos para **colisión** (dos entradas con el mismo hash), no para preimagen. En CTF aparecen retos de colisión con prefijos controlados (`UNICORN`/fastcoll para MD5).

**Length extension**: con MD5/SHA1/SHA256 (Merkle–Damgård), si conoces `H(secreto ‖ dato)` y la longitud del secreto, puedes calcular `H(secreto ‖ dato ‖ padding ‖ extra)` sin conocer el secreto. Rompe los MAC caseros del tipo `hash(secreto ‖ mensaje)`. Herramienta: **hashpump** / `hlextend`. La defensa real es HMAC, que no es vulnerable.

## Protocolo de trabajo

1. **Identificar** la familia con la tabla de premisa. No factorices lo que es base64.
2. **Decodificar capas** antes que nada (CyberChef Magic).
3. **Automatizar primero**: RsaCtfTool para RSA, hashcat para hashes, dCode para clásicos. Resuelven el caso fácil en segundos.
4. **Razonar el parámetro** si lo automático falla: ¿qué eligieron mal? `e`, `n`, nonce, modo, reutilización.
5. **Scriptear con `pycryptodome` y `gmpy2`**: son el estándar. `SageMath` para lo que necesite álgebra (curvas, retículos, DLP).
6. **La bandera suele tener formato** (`flag{...}`, `CTF{...}`): úsalo como oráculo de "lo resolví".

## Herramientas a tener instaladas y probadas antes del evento

- `pycryptodome`, `gmpy2`, `sympy` (Python)
- **RsaCtfTool** (clonado y funcionando)
- **CyberChef** (local o web)
- `hashcat` + wordlist `rockyou.txt`, `john`
- `hashpump` / `hlextend`
- **SageMath** (opcional, para retos duros de álgebra)
- Acceso a **FactorDB**, **dCode**, **quipqiup**

## Errores que cuestan tiempo

- Atacar RSA a fuerza bruta cuando `n` ya está en FactorDB.
- No notar que el "cifrado" era base64 en tres capas.
- Ignorar que `e=3` con mensaje corto se resuelve con una raíz cúbica.
- No probar RsaCtfTool antes de scriptear a mano.
- Confundir romper colisión (viable en MD5) con romper preimagen (no viable).
