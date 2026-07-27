---
id: owasp
tipo: taxonomia
estabilidad: permanente
consulta_externa: https://owasp.org/Top10/ — el ranking se revisa cada 3-4 años; confirmar la edición vigente antes de citarla en un informe
---

# OWASP Top 10 — riesgos de aplicación web

Es una **lista de concienciación**, no un estándar de verificación. Para auditar de verdad se usa **ASVS** (requisitos verificables por nivel) y **WSTG** (guía de pruebas). Decir "cumplimos el Top 10" no significa nada; decir "cumplimos ASVS L2" sí.

Explotación técnica y payloads defensivos en [web/web.md](web/web.md). Aquí: qué es cada riesgo, cómo se detecta y qué lo corrige de raíz.

## Edición 2021 (la que mapea la mayoría de herramientas)

| ID | Riesgo | Causa raíz típica | Corrección estructural | CWE núcleo |
|---|---|---|---|---|
| A01 | Broken Access Control | Autorización dispersa por endpoint, confianza en el ID del cliente | Motor de autorización central, deny-by-default, comprobación `(sujeto, acción, objeto)` en cada acceso | 862, 863, 639, 22 |
| A02 | Cryptographic Failures | Datos sensibles en claro, algoritmos obsoletos, claves mal gestionadas | Clasificar el dato primero; TLS 1.3, AEAD, KMS/HSM, KDF lento para contraseñas | 327, 328, 319, 916 |
| A03 | Injection | Concatenación de entrada en un intérprete (incluye XSS) | Parametrización y escapado por contexto en la capa de plantillas | 89, 79, 78, 94, 917 |
| A04 | Insecure Design | Falta de modelado de amenazas y de controles en el diseño | Modelado de amenazas por historia de usuario, casos de abuso, patrones seguros por defecto | 209, 256, 501, 522 |
| A05 | Security Misconfiguration | Defaults inseguros, features de más, cabeceras ausentes, errores verbosos | Baseline reproducible en IaC, hardening automatizado y verificado en CI | 16, 611, 1188 |
| A06 | Vulnerable and Outdated Components | Dependencias sin inventario ni actualización | SBOM + SCA en CI + política de actualización + reducción de dependencias | 1104, 1035 |
| A07 | Identification and Authentication Failures | Sesión propia, sin MFA, credenciales débiles, recuperación insegura | IdP probado, MFA resistente a phishing, rotación de sesión en el login | 287, 384, 307, 613 |
| A08 | Software and Data Integrity Failures | Actualizaciones y CI/CD sin verificación de integridad, deserialización insegura | Firma y verificación de artefactos, SLSA, deserialización solo de formatos de datos | 502, 494, 829 |
| A09 | Security Logging and Monitoring Failures | No hay logs, o los hay y nadie los mira | Eventos de seguridad definidos por diseño, centralizados, con alerta y prueba | 778, 117, 532 |
| A10 | Server-Side Request Forgery | Fetch de URL controlada por el usuario | Allow-list de destino, validar IP tras resolver DNS, bloquear rangos internos y metadata | 918 |

### Cómo se prueba cada uno (mínimo viable)

| ID | Prueba concreta |
|---|---|
| A01 | Con la sesión de A, pedir recursos de B (IDOR); llamar endpoints de admin como usuario normal; forzar métodos HTTP no previstos; alterar campos de rol en el cuerpo |
| A02 | Inspeccionar almacenamiento y tráfico: ¿qué viaja o reposa sin cifrar? Revisar el KDF de contraseñas y la gestión de claves |
| A03 | Fuzzing por sink: SQL, comandos, plantillas, LDAP, XPath, NoSQL; XSS reflejado, almacenado y basado en DOM |
| A04 | Revisar si existe modelo de amenazas; buscar límites de negocio ausentes (cuotas, flujos reversibles, race conditions) |
| A05 | Escanear cabeceras, listado de directorios, endpoints de depuración, consolas de administración, buckets y CORS |
| A06 | `npm audit` / `pip-audit` / `osv-scanner`; contrastar versiones reales en ejecución con el manifiesto |
| A07 | Enumeración de usuarios, spraying, política de bloqueo, fijación de sesión, flujo de recuperación, MFA saltable |
| A08 | Revisar la cadena de build: ¿quién puede modificar el pipeline?, ¿se firman artefactos?, ¿se deserializa entrada externa? |
| A09 | Ejecutar un ataque conocido y comprobar si genera evento, si llega al SIEM y si alerta |
| A10 | Cualquier parámetro que acepte URL: probar `127.0.0.1`, `169.254.169.254`, DNS rebinding, redirects, esquemas alternativos |

## Edición 2025 — cambios estructurales

Confirmar contra owasp.org antes de citar como vigente en un entregable.

| Cambio | Lectura analítica |
|---|---|
| Broken Access Control se mantiene en el primer puesto | Es el riesgo dominante y el que peor detectan las herramientas automáticas |
| **Security Misconfiguration** sube a los primeros puestos | Refleja el peso de la infraestructura declarativa y el cloud mal configurado |
| **Software Supply Chain Failures** entra como categoría propia y amplía a A06:2021 | Ya no basta con "componentes desactualizados": incluye pipeline, dependencias transitivas, registries y artefactos |
| **Mishandling of Exceptional Conditions** entra como categoría nueva | Fail-open, errores no controlados, degradación insegura ante fallo |
| **Logging** pasa a incluir explícitamente alerta y respuesta | Registrar sin alertar deja de contar como control |
| SSRF deja de ser categoría independiente y se absorbe | El riesgo no desaparece: se sigue tratando como en A10:2021 |

## Cómo usar esta lista sin degradarla

- **No** como checklist de auditoría: usar ASVS.
- **No** como priorización: el orden refleja prevalencia global, no el riesgo del sistema concreto.
- **Sí** como marco de comunicación con negocio y desarrollo, y como taxonomía de agrupación de hallazgos.
- **Sí** como entrada para requisitos: cada categoría debe traducirse a un control verificable en CI.

## Complementos OWASP relevantes

| Recurso | Uso |
|---|---|
| ASVS | Requisitos verificables L1/L2/L3. El estándar real de auditoría |
| WSTG | Metodología de pruebas paso a paso |
| Cheat Sheet Series | Referencia de implementación por tema |
| Proactive Controls | Los 10 controles que un desarrollador debe implementar |
| SAMM | Madurez del programa de desarrollo seguro |
| Dependency-Check / Dependency-Track | SCA y gestión de SBOM |
| API Security Top 10 | [owasp_api.md](owasp_api.md) |
| MASVS / MASTG | [mobile/mobile.md](mobile/mobile.md) |
| LLM Top 10 y Agentic Security | [ai/ai.md](ai/ai.md) |
