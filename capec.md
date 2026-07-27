---
id: capec
tipo: taxonomia
estabilidad: permanente
consulta_externa: https://capec.mitre.org — confirmar el ID exacto antes de citarlo en un informe formal
---

# CAPEC — patrones de ataque

CAPEC describe el **patrón abstracto** que un atacante emplea, independiente del producto. Es el puente entre la debilidad ([cwe.md](cwe.md)) y el comportamiento observado en campo ([mitre_attack.md](mitre_attack.md)).

| Catálogo | Responde | Nivel |
|---|---|---|
| CWE | Qué se hizo mal en el código | Implementación |
| CAPEC | Cómo se abusa esa debilidad, en abstracto | Patrón |
| ATT&CK | Qué hace el adversario real, en qué fase | Comportamiento observado |

Cuándo usar CAPEC en vez de ATT&CK: al modelar amenazas de un sistema **antes** de que exista un incidente, o al describir un ataque a nivel de aplicación, donde ATT&CK es demasiado grueso (todo cae en T1190).

## Vistas del catálogo

**Mechanisms of Attack (CAPEC-1000)** — organiza por *cómo*:

| Categoría | Idea central | Ejemplos |
|---|---|---|
| Engage in Deceptive Interactions | Hacerse pasar por otra entidad | Phishing, spoofing de contenido, AitM |
| Abuse Existing Functionality | Usar la función legítima más allá de su intención | Agotamiento de recursos, abuso de API, flooding |
| Manipulate Data Structures | Corromper estructuras internas | Overflows de buffer, manipulación de punteros |
| Manipulate System Resources | Alterar archivos, configuración o infraestructura | Modificación de configuración, envenenamiento de infraestructura, supply chain |
| Inject Unexpected Items | Introducir datos que se interpretan como control | SQLi, XSS, inyección de comandos, deserialización |
| Employ Probabilistic Techniques | Fuerza bruta y adivinación | Cracking de contraseñas, fuzzing, colisiones |
| Manipulate Timing and State | Explotar ventanas temporales | Race conditions, TOCTOU, replay |
| Collect and Analyze Information | Obtener información para el siguiente paso | Reconocimiento, análisis de canal lateral, footprinting |
| Subvert Access Control | Saltar la decisión de autorización | Robo de credenciales, escalada, abuso de privilegio |

**Domains of Attack (CAPEC-3000)** — organiza por *dónde*: Software, Hardware, Communications, Supply Chain, Social Engineering, Physical Security. Útil cuando el sistema modelado no es software puro (dispositivos, procesos, personas).

## Patrones de referencia y su cadena

Cadena: `CAPEC → CWE que lo hace posible → ATT&CK donde se observa`.

| CAPEC | Patrón | CWE típico | ATT&CK |
|---|---|---|---|
| CAPEC-66 | SQL Injection | CWE-89 | T1190 |
| CAPEC-63 | Cross-Site Scripting | CWE-79 | T1189, T1059.007 |
| CAPEC-88 | OS Command Injection | CWE-78 | T1190, T1059 |
| CAPEC-126 | Path Traversal | CWE-22 | T1190, T1083 |
| CAPEC-62 | Cross Site Request Forgery | CWE-352 | T1189 |
| CAPEC-664 | Server Side Request Forgery | CWE-918 | T1190, T1552.005 |
| CAPEC-586 | Object Injection (deserialización) | CWE-502 | T1190 |
| CAPEC-242 | Code Injection | CWE-94 | T1190, T1059 |
| CAPEC-100 | Overflow Buffers | CWE-787, CWE-120 | T1203, T1068 |
| CAPEC-98 | Phishing | CWE-1021, factor humano | T1566 |
| CAPEC-49 | Password Brute Forcing | CWE-307, CWE-521 | T1110.001 |
| CAPEC-600 | Credential Stuffing | CWE-307 | T1110.004 |
| CAPEC-509 | Kerberoasting | CWE-262, CWE-522 | T1558.003 |
| CAPEC-644 | Use of Captured Hashes (Pass the Hash) | CWE-522 | T1550.002 |
| CAPEC-645 | Use of Captured Tickets (Pass the Ticket) | CWE-522 | T1550.003 |
| CAPEC-94 | Adversary in the Middle | CWE-300, CWE-295 | T1557 |
| CAPEC-593 | Session Hijacking | CWE-384, CWE-613 | T1550.004, T1563 |
| CAPEC-233 | Privilege Escalation | CWE-269 | T1068, T1548 |
| CAPEC-122 | Privilege Abuse | CWE-862, CWE-863 | T1078 |
| CAPEC-437 | Supply Chain | CWE-1357, CWE-494 | T1195 |
| CAPEC-186 | Malicious Software Update | CWE-494 | T1195.002 |
| CAPEC-441 | Malicious Logic Insertion | CWE-506 | T1195 |

Los IDs anteriores son los de uso más frecuente. Para cualquier otro patrón, verificar el ID en el catálogo oficial antes de citarlo: **inventar un CAPEC invalida el informe entero**.

## Anatomía de una entrada CAPEC (qué campos aprovechar)

| Campo | Uso analítico |
|---|---|
| Likelihood of Attack / Typical Severity | Priorización preliminar en modelado |
| **Prerequisites** | Lo más valioso: si la precondición no se cumple en tu diseño, el patrón no aplica. Aquí es donde se corta el ataque más barato |
| Execution Flow | Explorar → Experimentar → Explotar. Cada fase deja telemetría distinta y ofrece un punto de detección temprana |
| Skills / Resources Required | Discrimina entre amenaza oportunista y actor con recursos |
| Related Weaknesses | Enlace a CWE: qué hay que corregir en el código |
| Mitigations | Controles a nivel de patrón, reutilizables entre productos |
| Indicators | Señales observables durante la fase de exploración |

## Aplicación práctica: modelado de amenazas con CAPEC

1. Descomponer el sistema en componentes y flujos de datos.
2. Por cada flujo, seleccionar el dominio y la categoría de mecanismo aplicables.
3. Para cada patrón candidato, evaluar **Prerequisites** contra el diseño real. Descartar los que no aplican, con justificación escrita.
4. Para los que aplican: registrar CWE asociado, control existente, control faltante.
5. Convertir cada patrón no mitigado en (a) un requisito de seguridad verificable y (b) un caso de abuso para las pruebas.
6. Traducir a ATT&CK los que ya se observan en campo, para pedir la detección correspondiente.

Ventaja frente a partir de una lista de CVEs: el modelo sigue siendo válido cuando cambien los CVEs, porque describe la clase de ataque y no la instancia.
