---
id: cwe
tipo: taxonomia
estabilidad: permanente
consulta_externa: https://cwe.mitre.org — el ranking Top 25 se recalcula cada año; los IDs y la jerarquía son estables
---

# CWE — causa raíz de la vulnerabilidad

CWE responde **por qué existe** el bug. CVE dice *dónde* está, CAPEC *cómo se ataca*, CWE *qué se hizo mal*. Corregir sin identificar el CWE produce parches que reintroducen la misma clase en otro endpoint.

## Regla de asignación

Asignar el CWE **más específico que la evidencia soporte**. `CWE-20 (Improper Input Validation)` es casi siempre una asignación perezosa: si el sink es una query, es CWE-89; si es un `exec`, CWE-78; si es HTML, CWE-79. La clase se define por el **sink**, no por la fuente.

## Top 25 (edición 2024) con causa y corrección estructural

| # | CWE | Nombre | Corrección estructural (no parche puntual) |
|---|---|---|---|
| 1 | CWE-79 | Cross-Site Scripting | Escapado por contexto en el motor de plantillas + CSP estricta con nonce |
| 2 | CWE-787 | Out-of-bounds Write | Lenguaje con memoria segura; si no, límites verificados y fuzzing continuo |
| 3 | CWE-89 | SQL Injection | Consultas parametrizadas siempre; allow-list para identificadores dinámicos |
| 4 | CWE-352 | CSRF | Cookies `SameSite=Lax/Strict` + token anti-CSRF + validación de `Origin` |
| 5 | CWE-22 | Path Traversal | Resolver la ruta canónica y verificar prefijo; mejor: no usar entrada de usuario como ruta |
| 6 | CWE-125 | Out-of-bounds Read | Igual que CWE-787; alto riesgo de fuga de memoria (patrón Heartbleed) |
| 7 | CWE-78 | OS Command Injection | No invocar shell; API con argumentos como array; allow-list de comandos |
| 8 | CWE-416 | Use After Free | Ownership del lenguaje; smart pointers; hardened allocator |
| 9 | CWE-862 | Missing Authorization | Autorización centralizada y **deny by default** en el borde del dominio |
| 10 | CWE-434 | Unrestricted File Upload | Validar tipo real, renombrar, almacenar fuera del webroot, servir sin ejecución |
| 11 | CWE-94 | Code Injection | Eliminar `eval` y equivalentes; sandbox si es inevitable |
| 12 | CWE-20 | Improper Input Validation | Esquema declarativo en el borde (allow-list, tipos, rangos) |
| 13 | CWE-77 | Command Injection | Ver CWE-78 |
| 14 | CWE-287 | Improper Authentication | Delegar a una librería/IdP probado; nunca lógica propia de sesión |
| 15 | CWE-269 | Improper Privilege Management | Least privilege por defecto; separar plano de administración |
| 16 | CWE-502 | Deserialization of Untrusted Data | Formatos de datos sin capacidad de instanciar tipos (JSON) + allow-list de clases |
| 17 | CWE-200 | Exposure of Sensitive Information | Respuestas de error genéricas; minimización de campos en API |
| 18 | CWE-863 | Incorrect Authorization | Pruebas de autorización por rol × objeto en CI |
| 19 | CWE-918 | SSRF | Allow-list de destinos, resolver DNS una vez y validar la IP, bloquear metadata |
| 20 | CWE-119 | Buffer Errors | Ver CWE-787 |
| 21 | CWE-476 | NULL Pointer Dereference | Chequeo obligatorio o tipos opcionales |
| 22 | CWE-798 | Hard-coded Credentials | Gestor de secretos + escaneo de secretos en CI y en el historial |
| 23 | CWE-190 | Integer Overflow | Aritmética verificada; tipos de tamaño explícito |
| 24 | CWE-400 | Uncontrolled Resource Consumption | Cuotas, timeouts, límites de tamaño, backpressure |
| 25 | CWE-306 | Missing Authentication for Critical Function | Autenticación en todos los planos, incluido el de administración e interno |

## Clases estructurales para razonar (más útiles que el ranking)

### Confusión entre código y datos
CWE-79, 78, 77, 89, 94, 917 (expression language), 611 (XXE), 1336 (template injection), 90 (LDAP), 943 (NoSQL/query genérica).
**Invariante**: la entrada nunca debe poder cambiar la *estructura* de la expresión que se evalúa. Escapar es el remedio débil; separar canal de datos y de código (parametrización) es el fuerte.

### Fallos de control de acceso
CWE-862, 863, 639 (IDOR), 285, 732 (permisos inseguros), 276 (permisos por defecto), 1220 (granularidad insuficiente).
**Invariante**: toda operación se autoriza contra `(sujeto, acción, objeto)`. Autorizar por ruta o por rol sin comprobar el objeto produce IDOR. Es la clase nº 1 en impacto real ([owasp.md](owasp.md)).

### Fallos de memoria
CWE-787, 125, 416, 415 (double free), 122/121 (heap/stack overflow), 190, 191 (underflow), 476, 824.
**Invariante**: en C/C++ se mitigan (ASLR, DEP, CFG/CET, stack canaries, allocator endurecido) pero no se eliminan; la eliminación es cambiar de lenguaje en los componentes que procesan entrada no confiable.

### Fallos criptográficos
CWE-327 (algoritmo roto), 328 (hash débil), 330/338 (aleatoriedad predecible), 331, 759 (hash sin sal), 916 (KDF débil), 295 (validación de certificado), 319 (transmisión en claro), 347 (verificación de firma).
**Invariante**: no diseñar; usar primitivas de alto nivel (AEAD, libsodium, KMS) y verificar la firma **antes** de procesar.

### Fallos de estado y concurrencia
CWE-362 (race condition), 367 (TOCTOU), 384 (fijación de sesión), 613 (expiración de sesión), 841 (flujo de trabajo).
**Invariante**: validar y actuar deben ser atómicos; el estado de autorización se re-evalúa en el momento del uso, no del chequeo.

### Fallos de configuración y exposición
CWE-16, 1188 (inicialización insegura), 798, 532 (secretos en logs), 209 (mensaje de error revelador), 552 (archivos accesibles), 1004 (cookie sin HttpOnly), 614 (cookie sin Secure).

### Cadena de suministro e integridad
CWE-494 (descarga sin verificación de integridad), 829 (inclusión de funcionalidad no confiable), 1104 (componentes no mantenidos), 506 (código malicioso), 915 (asignación masiva de atributos).

## Relación con el resto

| Quiero saber | Voy a |
|---|---|
| Qué patrón de ataque explota este CWE | [capec.md](capec.md) |
| Qué instancia concreta y quién la explota | [cve_database.md](cve_database.md) |
| Cómo se manifiesta en una app web | [web/web.md](web/web.md) |
| Cómo se manifiesta en una API | [owasp_api.md](owasp_api.md) |
| Qué control lo neutraliza | [mitre_d3fend.md](mitre_d3fend.md) |

## Uso en un informe

Formato mínimo por hallazgo: `CWE-### · sink concreto (archivo:línea) · entrada controlada · primitiva obtenida · corrección estructural`. Sin la primitiva, la severidad no es defendible; sin la corrección estructural, el bug reaparece.
