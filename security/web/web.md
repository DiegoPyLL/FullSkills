---
id: web/web
tipo: catalogo
estabilidad: permanente
---

# Seguridad web

Explotación y defensa a nivel de aplicación. La taxonomía está en [owasp.md](../owasp.md), la causa raíz en [cwe.md](../cwe.md) y las APIs en [owasp_api.md](../owasp_api.md).

## Inyección: el principio común

Toda inyección es lo mismo: **la entrada del usuario cruza la frontera entre datos y código**. La defensa fuerte no es escapar, sino separar los canales (parametrizar). Escapar es la defensa débil, correcta solo cuando no existe parametrización.

| Tipo | Sink | Explotación característica | Defensa correcta |
|---|---|---|---|
| SQL | Consulta | `UNION SELECT`, booleana ciega, basada en tiempo, error-based, out-of-band | Consultas parametrizadas; allow-list para nombres de tabla o columna dinámicos |
| NoSQL | Consulta de documento | Operadores inyectados (`$ne`, `$gt`, `$where`) desde JSON | Validar tipos: rechazar objetos donde se espera una cadena |
| Comandos del sistema | `exec`, `system` | `;`, `|`, `` ` ``, `$()`, salto de línea | No invocar shell; API con argumentos como array; allow-list |
| LDAP | Filtro de directorio | `*)(uid=*` | Escapado específico de LDAP; parametrización de la librería |
| XPath | Consulta XML | `' or '1'='1` | Consultas parametrizadas |
| Plantillas del lado servidor (SSTI) | Motor de plantillas | `{{7*7}}`, acceso a objetos internos del lenguaje → RCE | La entrada del usuario nunca es la plantilla, solo el dato |
| Expression language (OGNL, SpEL, JEXL) | Evaluador de expresiones | RCE directa (patrón Struts, Spring, Confluence) | Evitar evaluación dinámica; parchear el framework |
| Cabeceras HTTP (CRLF) | Respuesta | Inyección de cabeceras, división de respuesta | Rechazar CR y LF en valores de cabecera |
| Cabeceras de correo | SMTP | Añadir destinatarios ocultos | API estructurada, validación estricta de dirección |
| Logs | Archivo de log | Falsificar líneas de log; en el peor caso, ejecución (Log4Shell) | Codificar el dato antes de registrarlo; nunca interpolar en un formato interpretado |
| Deserialización | `readObject`, `pickle`, `unserialize`, YAML inseguro | Cadenas de gadgets → RCE | No deserializar entrada externa; formatos de datos puros; allow-list de clases |

## XSS

| Tipo | Dónde ocurre | Defensa |
|---|---|---|
| Reflejado | El servidor devuelve la entrada en la respuesta | Escapado por contexto en la plantilla |
| Almacenado | El dato se guarda y se sirve a otros | Ídem, más saneado en la salida y no en la entrada |
| Basado en DOM | JavaScript del cliente escribe entrada en un sink peligroso | Evitar `innerHTML`, `document.write`, `eval`; usar `textContent` y APIs seguras; Trusted Types |
| Mutation XSS | El navegador reinterpreta el HTML tras sanearlo | Usar un saneador mantenido (DOMPurify) y no uno propio |

**El contexto determina el escapado**: HTML, atributo, JavaScript, URL y CSS requieren codificaciones distintas. Un escapado HTML dentro de un atributo `href` no impide `javascript:`.

Defensa en profundidad: **CSP estricta con nonce o hash**, sin `unsafe-inline` ni `unsafe-eval`, con `object-src 'none'` y `base-uri 'self'`. Convierte un XSS explotable en uno inerte. La CSP basada en lista de dominios permitidos es fácil de saltar; la basada en nonce, no.

## SSRF

Vector creciente por su papel en cloud: una SSRF que alcanza la metadata de la instancia se convierte en credenciales.

| Bypass frecuente | Defensa |
|---|---|
| `127.0.0.1`, `localhost`, `0.0.0.0`, `[::1]` | Bloquear rangos, no cadenas |
| Codificación decimal, octal u hexadecimal de la IP | Resolver y comparar la IP final, no el texto |
| Dominio del atacante que resuelve a IP interna | Resolver antes de conectar y validar la IP resuelta |
| Redirect a destino interno | No seguir redirects, o revalidar en cada salto |
| DNS rebinding | Resolver una vez y **conectar a esa misma IP** (fijar la resolución) |
| Esquemas alternativos (`file://`, `gopher://`, `dict://`) | Allow-list de esquemas: solo `http` y `https` |
| IPv6 y direcciones mapeadas | Cubrir explícitamente en la validación |

Defensa estructural: allow-list de destinos, egress dedicado para las peticiones salientes de la aplicación, IMDSv2, y bloqueo de la IP de metadata en el nivel de red.

## Autenticación y sesión

| Riesgo | Control |
|---|---|
| Fijación de sesión | Regenerar el identificador de sesión al autenticar |
| Sesión sin caducidad | Expiración absoluta y por inactividad; revocación del lado servidor |
| Cookies mal configuradas | `HttpOnly`, `Secure`, `SameSite=Lax` o `Strict`, `__Host-` como prefijo, dominio y ruta mínimos |
| Enumeración de usuarios | Mensajes y **tiempos** de respuesta idénticos en login, registro y recuperación |
| Fuerza bruta | Límite por cuenta y por IP, retraso progresivo, CAPTCHA solo como último recurso |
| Recuperación de contraseña insegura | Token aleatorio de un solo uso y vida corta; no revelar si el correo existe |
| Contraseñas mal almacenadas | Argon2id (o scrypt/bcrypt) con parámetros adecuados; nunca hash rápido |
| MFA evadible | No permitir saltarlo por rutas alternativas; verificar en cada paso sensible |
| Tokens de sesión predecibles | Generador criptográficamente seguro |
| JWT mal validados | Ver [owasp_api.md](../owasp_api.md#seguridad-de-jwt-fuente-recurrente-de-api2) |
| OAuth mal implementado | Validar `state` y `nonce`, `redirect_uri` con coincidencia exacta, PKCE obligatorio, no usar el flujo implícito |

## Control de acceso

Es el riesgo número uno y el peor detectado por herramientas automáticas, porque requiere conocer la intención.

| Fallo | Prueba | Corrección |
|---|---|---|
| IDOR | Con sesión de A, pedir recursos de B | Filtrar por propietario en la propia consulta |
| Escalada vertical | Llamar endpoints de administración con rol bajo | Deny-by-default por ruta y por verbo |
| Verbo no cubierto | `PUT`/`DELETE` sobre una ruta que solo protege `GET` | Política por método |
| Mass assignment | Enviar `role`, `isAdmin`, `price` en el cuerpo | Allow-list de campos escribibles |
| Referencia predecible | Enumerar identificadores secuenciales | Identificadores opacos **más** control de acceso (el UUID solo no es control) |
| Control solo en el cliente | Ocultar un botón en la interfaz | Toda decisión de autorización en el servidor |
| Fuga en respuestas | Devolver campos que la interfaz no muestra | DTO de salida explícito |

## Otros vectores relevantes

| Vector | Mecánica | Defensa |
|---|---|---|
| Request smuggling | Desincronización entre proxy y backend por `Content-Length` y `Transfer-Encoding` | Normalizar en el borde, rechazar peticiones ambiguas, HTTP/2 extremo a extremo |
| Cache poisoning | Entrada no incluida en la clave de caché que afecta a la respuesta | Incluir en la clave todo lo que influya en la respuesta; no cachear respuestas personalizadas |
| Cache deception | Hacer que una respuesta privada se cachee como estática | Validar extensiones y rutas antes de cachear |
| Prototype pollution | `__proto__` en objetos JSON fusionados | `Object.create(null)`, congelar prototipos, librerías seguras |
| XXE | Parser XML con entidades externas habilitadas | Deshabilitar DTD y entidades externas |
| Path traversal | `../` en rutas construidas con entrada de usuario | Canonicalizar y verificar prefijo; mejor, no usar entrada como ruta |
| Subida de archivos | Extensión falsa, contenido ejecutable, ruta controlada | Validar tipo real, renombrar, almacenar fuera del webroot, servir sin ejecución |
| Redirect abierto | Parámetro de retorno no validado | Allow-list de rutas internas; rechazar URLs absolutas |
| CSRF | Petición cross-site con cookies del usuario | `SameSite`, token anti-CSRF, validación de `Origin` |
| Clickjacking | La página en un iframe ajeno | `frame-ancestors 'none'` en CSP |
| CORS mal configurado | Reflejar el `Origin` con credenciales | Allow-list explícita; nunca reflejar el origen con `credentials: true` |
| Race condition | Peticiones simultáneas sobre un mismo recurso | Bloqueo o transacción atómica; idempotencia |
| ReDoS | Expresión regular con retroceso catastrófico | Expresiones lineales, límite de longitud, timeout del motor |
| Zip bomb / decompression bomb | Archivo pequeño que se expande enormemente | Límite de tamaño descomprimido y de número de entradas |
| Business logic | Abuso del flujo legítimo (cupones, reembolsos, precios) | Modelado de casos de abuso, límites, validación del lado servidor |

## Cabeceras de seguridad

| Cabecera | Valor recomendado | Efecto |
|---|---|---|
| `Content-Security-Policy` | Con nonce, `object-src 'none'`, `base-uri 'self'`, sin `unsafe-*` | Principal defensa dura contra XSS |
| `Strict-Transport-Security` | `max-age` largo, `includeSubDomains` | Fuerza HTTPS |
| `X-Content-Type-Options` | `nosniff` | Evita interpretación errónea del tipo |
| `Referrer-Policy` | `strict-origin-when-cross-origin` o más estricta | Evita fuga de URLs internas |
| `Permissions-Policy` | Denegar por defecto | Restringe APIs del navegador |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aislamiento de contexto |
| `Cross-Origin-Resource-Policy` | `same-origin` | Evita inclusión cross-origin |
| `Cache-Control` | `no-store` en respuestas con datos sensibles | Evita persistencia en caché |

`X-Frame-Options` es redundante si se usa `frame-ancestors`, pero se mantiene por compatibilidad con navegadores antiguos.

## Supply chain del front-end

| Riesgo | Control |
|---|---|
| Script de terceros comprometido | Autoalojar lo crítico; SRI para lo externo; CSP que limite los orígenes |
| Dependencia npm maliciosa o secuestrada | Lockfile, versiones fijadas, revisión de dependencias nuevas, `--ignore-scripts` cuando sea posible |
| Dependency confusion | Ámbitos privados, registro con prioridad interna explícita |
| CDN comprometida | SRI con hash; sin él, la CDN puede servir cualquier cosa |
| Etiquetas de analítica y publicidad | Aislamiento, revisión, minimización; cada script de terceros es código ejecutándose con todos los permisos de la página |
| Extensiones del navegador del usuario | Fuera de control del sitio: no confiar en el cliente para nada |

## Verificación mínima antes de publicar

1. Control de acceso probado por rol × objeto, con pruebas automatizadas en CI.
2. Todas las consultas parametrizadas; búsqueda de concatenación en el código como regla de linting.
3. CSP estricta activa y verificada, no en modo solo-reporte indefinido.
4. Cabeceras de seguridad presentes en todas las respuestas, incluidas las de error y las de API.
5. Dependencias escaneadas con umbral que bloquea el despliegue.
6. Secretos fuera del código y del historial, verificado con escaneo.
7. Errores genéricos en producción; sin trazas ni detalles del motor de base de datos.
8. Logging de eventos de seguridad definido y llegando al SIEM.
9. Límites de tasa y de tamaño en todos los endpoints de escritura.
10. Modelado de amenazas hecho para los flujos de negocio críticos, no solo para los técnicos.
