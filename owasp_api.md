---
id: owasp_api
tipo: taxonomia
estabilidad: permanente
consulta_externa: https://owasp.org/API-Security/ — edición vigente 2023
---

# OWASP API Security Top 10 (2023)

Las APIs fallan distinto que las webs: no hay navegador que aporte defensas, el cliente es hostil por definición y el endpoint expone objetos de dominio directamente. Por eso **7 de los 10 riesgos son de autorización o de abuso de la lógica expuesta**, no de inyección.

| ID | Riesgo | Qué falla exactamente | Detección | Corrección |
|---|---|---|---|---|
| API1 | Broken Object Level Authorization (BOLA/IDOR) | El endpoint valida la sesión pero no que el objeto pertenezca al sujeto | Con sesión de A, iterar IDs de B en cada ruta con parámetro | Comprobación de propiedad en la capa de datos, no en el controlador. IDs opacos (UUID) reducen enumeración pero **no** son el control |
| API2 | Broken Authentication | Tokens sin expiración o sin firma verificada, JWT con `alg=none`, recuperación de credenciales débil, endpoints de auth sin rate limit | Pruebas de manipulación de token, spraying, replay | Verificar firma y `aud`/`iss`/`exp` siempre; vidas cortas + refresh revocable; MFA en el flujo |
| API3 | Broken Object Property Level Authorization | Exceso de datos en la respuesta (excessive data exposure) o aceptación de campos no permitidos en la petición (mass assignment) | Comparar la respuesta con lo que la UI muestra; enviar `isAdmin`, `role`, `balance` en el cuerpo | DTO explícito de entrada y de salida; nunca serializar la entidad completa; allow-list de campos escribibles |
| API4 | Unrestricted Resource Consumption | Sin límites de tamaño, paginación, profundidad de consulta ni coste | Peticiones grandes, paginación abusiva, consultas GraphQL anidadas, subidas masivas | Rate limit por identidad y por IP, cuotas, timeouts, límite de payload, análisis de coste de consulta, límite de gasto en servicios de pago |
| API5 | Broken Function Level Authorization | Endpoints administrativos alcanzables por usuarios normales; verbo HTTP no cubierto por la política | Enumerar rutas de admin y probar todos los verbos con rol bajo | Deny-by-default por ruta **y** por verbo; roles definidos en un solo lugar; tests automáticos rol × endpoint |
| API6 | Unrestricted Access to Sensitive Business Flows | La API permite automatizar un flujo pensado para humanos: reservas, compras, votos, registros | Analizar flujos de valor y su tasa de uso automatizable | Modelar el abuso, no solo la seguridad: límites por cuenta, detección de automatización, verificación de dispositivo, fricción progresiva |
| API7 | Server Side Request Forgery | La API descarga una URL entregada por el cliente (webhooks, importadores, previsualizadores) | Parámetros con URL: apuntar a red interna y a metadata cloud | Allow-list de host y esquema, resolver DNS y validar la IP resultante, prohibir redirects, egress restringido, IMDSv2 |
| API8 | Security Misconfiguration | CORS permisivo, TLS mal configurado, verbos de más, mensajes de error verbosos, cabeceras ausentes, cloud abierto | Escaneo de configuración y de cabeceras | Baseline en IaC, verificación en CI, entornos idénticos |
| API9 | Improper Inventory Management | APIs zombis, versiones antiguas vivas (`/v1` sin parches), entornos de staging expuestos, documentación desactualizada | Descubrimiento activo desde tráfico real y desde DNS/certificados | Inventario automático desde el gateway, versionado con fecha de retirada, staging sin datos reales ni acceso público |
| API10 | Unsafe Consumption of APIs | Confiar en la respuesta de un tercero: sin validar, sin timeout, siguiendo redirects, deserializando | Revisar cada cliente HTTP saliente | Tratar la respuesta de terceros como entrada hostil: validar esquema, timeouts, circuit breaker, sin redirects automáticos |

## Por qué BOLA domina

El controlador comprueba "¿hay sesión válida?" y asume que el ID de la ruta pertenece al usuario. La comprobación correcta es `¿este sujeto puede ejecutar esta acción sobre este objeto?` y debe estar donde se recupera el dato, no en el borde. Patrón robusto: que la consulta incluya siempre el propietario (`WHERE id = :id AND owner_id = :sujeto`), de modo que sea **imposible** obtener el objeto ajeno aunque falte la comprobación explícita.

## Riesgos específicos por estilo de API

| Estilo | Riesgo propio | Mitigación |
|---|---|---|
| REST | BOLA por parámetros de ruta; verbos no cubiertos | Autorización a nivel de recurso; política por verbo |
| GraphQL | Consultas anidadas (DoS por profundidad), introspección abierta, autorización por resolver olvidada, batching que salta el rate limit | Límite de profundidad y complejidad, introspección off en producción, autorización en cada resolver, límite de operaciones por lote |
| gRPC | Reflexión habilitada, ausencia de mTLS, mensajes sin límite de tamaño | Desactivar reflexión, mTLS, `max_receive_message_length` |
| WebSocket | Sin validación de `Origin` (Cross-Site WebSocket Hijacking), autorización solo en el handshake | Validar `Origin`, reautorizar por mensaje, tokens de vida corta |
| Webhooks entrantes | Falsificación de origen, replay | Firma HMAC con timestamp, ventana de tolerancia, idempotencia |
| Webhooks salientes | SSRF hacia red interna | Allow-list de destino, egress dedicado, sin redirects |

## Seguridad de JWT (fuente recurrente de API2)

| Fallo | Consecuencia | Control |
|---|---|---|
| `alg: none` aceptado | Suplantación total | Algoritmo fijado en servidor; nunca leerlo del token |
| Confusión RS256→HS256 | La clave pública se usa como secreto HMAC | Aceptar un solo algoritmo por clave |
| `kid` con path traversal o inyección | Elección de clave controlada por el atacante | `kid` validado contra un mapa cerrado de claves |
| `jku`/`x5u` no restringidos | El atacante indica dónde está la clave | Deshabilitar o restringir a un host propio |
| Sin `exp`, `aud`, `iss` | Replay y uso cruzado entre servicios | Validar las tres siempre |
| Datos sensibles en el payload | Exposición: el JWT solo está firmado, no cifrado | No poner PII; usar JWE si es imprescindible |
| Sin revocación | Un token robado vive hasta expirar | Vidas cortas + lista de revocación + rotación de refresh con detección de reuso |

## Controles transversales del gateway

Un API gateway aporta: autenticación centralizada, rate limiting, límite de payload, validación de esquema OpenAPI, mTLS, inventario y observabilidad. **No** aporta autorización a nivel de objeto: eso solo puede vivir en el servicio, porque solo él conoce la propiedad del dato. Confiar el control de acceso al gateway es la causa arquitectónica de API1 y API5.
