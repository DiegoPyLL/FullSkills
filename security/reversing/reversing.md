---
id: reversing/reversing
tipo: modelo
estabilidad: permanente
consulta_externa: https://ir0nstone.gitbook.io/notes | https://ghidra-sre.org | https://docs.pwntools.com
---

# Reversing y explotación binaria (pwn)

Entender un binario que no tiene fuente, y cuando el reto lo pide, convertir un error de memoria en ejecución controlada. Es la categoría más lenta de aprender y la que más puntúa. En 4 días la meta realista es: resolver reversing fácil/medio y pwn de nivel introductorio (stack overflow básico, ret2win), no heap avanzado.

Frontera con el resto: la **causa raíz** de cada bug está en [../cwe.md](../cwe.md) (CWE-121 stack overflow, CWE-416 use-after-free, CWE-787 OOB write); aquí está el **cómo se explota en un reto**. La teoría de mitigaciones de hardware vive en [../hardware/hardware.md](../hardware/hardware.md); las de SO en [../linux/linux.md](../linux/linux.md).

## Primer triage de un binario

```
file ./bin              # arquitectura, 32/64 bit, static/dynamic, stripped
checksec ./bin          # mitigaciones activas (pwntools): define el ataque posible
strings ./bin           # flags en claro, rutas, pistas
./bin                   # ejecutarlo: ¿qué pide? ¿qué imprime?
```

`checksec` decide todo. Qué significa cada mitigación para el ataque:

| Mitigación | Si está OFF | Si está ON |
|---|---|---|
| **Canary** (stack cookie) | Stack overflow directo a return address | Hay que filtrar o evitar la cookie |
| **NX** (no-execute stack) | Puedes ejecutar shellcode en el stack | No shellcode en stack → ROP / ret2libc |
| **PIE** (base aleatoria del binario) | Direcciones del binario fijas y conocidas | Necesitas un leak para la base |
| **RELRO** | GOT sobrescribible (GOT overwrite) | Full RELRO cierra esa vía |
| **ASLR** (del SO, no del binario) | Libc/stack fijos | Necesitas leak para libc/stack |

## Reversing: entender sin fuente

### Estático

- **Ghidra** (gratis, NSA): descompila a pseudo-C. El flujo normal: localizar `main`, seguir la lógica de validación, renombrar variables a medida que entiendes. El reto típico es una función `check()` que compara tu input contra algo derivado.
- **Binary Ninja / IDA**: alternativas (IDA Free limitado). radare2/**Cutter** para quien prefiere open source con GUI.
- Patrones de reto: comparación directa con una cadena (sale en `strings`), input transformado (XOR/suma/aritmética) y comparado contra una constante — se revierte la operación, o checks encadenados que forman la flag carácter a carácter.

### Dinámico

- **gdb + GEF o pwndbg**: breakpoints, inspección de registros y memoria en vivo. `b *main+N`, `r`, `info registers`, `x/20x $rsp`.
- Útil cuando la lógica estática es ofuscada: pones un breakpoint justo antes de la comparación y lees el valor esperado directamente de memoria (`strcmp`, `memcmp`).
- **ltrace/strace**: ver llamadas a libc y syscalls; un `strcmp(user, "s3cr3t")` cantado.
- **angr** (ejecución simbólica): para resolver checks complejos automáticamente planteando "qué input lleva a la rama de éxito". Potente pero con curva; úsalo cuando el input-space es grande y la lógica es pura.

## Pwn: de bug a shell

### Stack buffer overflow (el 101)

`gets()`, `read()` con tamaño excesivo, `strcpy()` sin límite → escribes más allá del buffer y pisas la dirección de retorno.

1. **Encontrar el offset** hasta el return address: patrón cíclico de pwntools (`cyclic 200`), ver qué valor crashea `$rip`, `cyclic_find`.
2. **Decidir el objetivo** según `checksec`:
   - **ret2win**: existe una función ganadora (ej. `win()` que imprime la flag). Sobrescribe el return con su dirección. El pwn más fácil y común en CTF introductorio.
   - **NX off**: inyecta shellcode en el buffer y retorna a él.
   - **NX on**: **ret2libc** — retorna a `system("/bin/sh")` con `/bin/sh` de libc, o cadena **ROP** con gadgets del binario para preparar registros y llamar a `execve`/`system`.
3. **Resolver ASLR/PIE** si están on: necesitas un **leak** (una fuga que imprima una dirección) para calcular la base de libc o del binario, y de ahí los offsets.

### Format string

`printf(user_input)` sin formato → lees stack (`%p %p %p`) y, con `%n`, **escribes** en memoria arbitraria. Permite filtrar el canary o sobrescribir la GOT.

### Conceptos de ataque

- **ROP (Return Oriented Programming)**: cuando NX impide shellcode, encadenas "gadgets" (secuencias que terminan en `ret`) ya presentes en el binario/libc para ejecutar lo que quieras. `ROPgadget`, `ropper` listan gadgets; pwntools `ROP()` arma la cadena.
- **ret2libc**: caso de ROP que llama a `system("/bin/sh")`. Necesitas la base de libc (leak) y la versión exacta (**libc-database** identifica la libc por offsets filtrados).
- **GOT overwrite**: con RELRO parcial, reescribes una entrada de la GOT para redirigir una función de libc a otra (ej. `free`→`system`).

## pwntools — el estándar de explotación

Automatiza interacción local/remota, empaquetado y ROP. Esqueleto mínimo:

```python
from pwn import *

context.binary = elf = ELF('./bin')        # arch, bits automáticos
# p = process('./bin')                       # local
p = remote('host.ctf', 1337)                # remoto

offset = 40                                  # hallado con cyclic
payload = flat(b'A'*offset, elf.symbols['win'])
p.sendlineafter(b'> ', payload)
p.interactive()                              # shell / lee la flag
```

`cyclic`/`cyclic_find` para offsets, `p64()/u64()` para empaquetar, `ELF` para símbolos y GOT/PLT, `ROP(elf)` para cadenas. `context.log_level='debug'` para ver los bytes que viajan.

## Protocolo de trabajo

1. **`file` + `checksec` + `strings`**: arquitectura y mitigaciones antes que nada. Decide si es reversing o pwn, y qué ataque es posible.
2. **Reversing**: descompilar en Ghidra, localizar la lógica de validación, revertir la transformación o leer el valor esperado en gdb.
3. **Pwn**: identificar el bug (overflow, format string), hallar offset con `cyclic`, elegir objetivo según checksec (ret2win → shellcode → ROP/ret2libc).
4. **Probar local, luego remoto** con el mismo script de pwntools; la diferencia suele ser solo ASLR y la libc del servidor.
5. **Si la lógica es pura y compleja**, considerar **angr** antes de romperte la cabeza a mano.

## Herramientas a tener instaladas y probadas antes del evento

- **Ghidra** (requiere Java) — descompilador principal
- **pwntools** (`pip install pwntools`) + `checksec`
- **gdb** con **GEF** o **pwndbg**
- `ROPgadget` / `ropper`
- **libc-database** (identificar libc remota) y `one_gadget`
- `ltrace`, `strace`
- **angr** (opcional, ejecución simbólica)
- `radare2`/`Cutter` o IDA Free como alternativa de descompilación

## Realismo para 4 días

- **Sí alcanzable**: reversing fácil/medio (lógica lineal en Ghidra), stack overflow ret2win, format string para leak básico.
- **Difícil de improvisar**: ROP encadenado complejo, ret2libc con resolución fina de offsets, cualquier cosa de **heap** (tcache, fastbin, UAF). No es realista dominarlo en el plazo; reconócelo y prioriza las otras categorías.
- Dónde practicar: **pwn.college**, **ROP Emporium** (pwn por niveles), **picoCTF** (reversing y binary exploitation), las notas de **ir0nstone**.
