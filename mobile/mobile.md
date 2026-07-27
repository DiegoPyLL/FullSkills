---
id: mobile/mobile
tipo: modelo
estabilidad: permanente
---

# Seguridad móvil

Android e iOS. Referencia de verificación: **OWASP MASVS** (requisitos) y **MASTG** (pruebas).

## Premisa

El dispositivo del usuario es un entorno **no confiable**: puede estar rooteado, instrumentado o emulado. Toda decisión de seguridad debe tomarse en el servidor. Las protecciones del cliente (ofuscación, detección de root, anti-debug) elevan el coste del atacante; no son controles de seguridad y no deben sustituir a ninguno del servidor.

## Categorías MASVS

| Categoría | Contenido |
|---|---|
| MASVS-STORAGE | Almacenamiento de datos sensibles |
| MASVS-CRYPTO | Uso correcto de criptografía y gestión de claves |
| MASVS-AUTH | Autenticación y autorización |
| MASVS-NETWORK | Comunicación de red |
| MASVS-PLATFORM | Interacción con la plataforma y con otras apps |
| MASVS-CODE | Calidad del código y dependencias |
| MASVS-RESILIENCE | Resistencia a la manipulación y a la ingeniería inversa |
| MASVS-PRIVACY | Tratamiento y minimización de datos personales |

## Riesgos por categoría

### Almacenamiento

| Riesgo | Detalle | Control |
|---|---|---|
| Secretos en el binario | Claves de API y credenciales extraíbles con descompilar y buscar cadenas | Ningún secreto en el cliente; los que existan, tratarlos como públicos |
| Datos sensibles en almacenamiento inseguro | `SharedPreferences`, `NSUserDefaults`, SQLite sin cifrar, archivos externos | Keystore/Keychain; cifrado con claves respaldadas por hardware |
| Fuga por logs | Datos personales o tokens en `logcat` o en la consola | Sin logs de datos sensibles en compilaciones de producción |
| Caché y capturas de pantalla | Teclado, portapapeles, imagen de la app en el conmutador de tareas | Ocultar la vista al pasar a segundo plano, deshabilitar el autocompletado en campos sensibles |
| Copias de seguridad | La copia del dispositivo incluye datos de la app | Excluir de backup los datos sensibles |
| Datos en tarjeta externa | Legibles por otras apps | Almacenamiento interno o con ámbito |

### Criptografía y claves

| Riesgo | Control |
|---|---|
| Algoritmos obsoletos o modos inseguros | AEAD (AES-GCM, ChaCha20-Poly1305); nunca ECB |
| Claves embebidas o derivadas de datos predecibles | Android Keystore / iOS Keychain con respaldo hardware; claves no exportables |
| Aleatoriedad insegura | Generadores criptográficos del sistema |
| Criptografía propia | Usar las APIs de la plataforma |
| Biometría mal integrada | Vincular la operación biométrica a una clave del enclave, no a un booleano de resultado |

### Red

| Riesgo | Control |
|---|---|
| Tráfico sin cifrar | TLS obligatorio; en Android, Network Security Config que prohíba texto claro |
| Validación de certificado deshabilitada | Nunca aceptar certificados inválidos, ni siquiera en depuración compilada para producción |
| Interceptación por CA instalada por el usuario | Certificate pinning (con plan de rotación y de recuperación para evitar dejar la app inservible) |
| Datos sensibles en la URL | Enviarlos en el cuerpo; las URLs quedan en logs y proxies |
| Configuración de depuración en producción | Comprobación en el pipeline de release |

### Plataforma

| Riesgo | Plataforma | Control |
|---|---|---|
| Componentes exportados (Activities, Services, Broadcast Receivers, Content Providers) | Android | `exported=false` salvo necesidad; permisos propios; validar el llamante |
| Deep links y esquemas personalizados sin validar | Ambas | Validar origen y parámetros; usar App Links / Universal Links verificados |
| WebView insegura | Android | Deshabilitar JavaScript si no se necesita, no exponer interfaces nativas, validar la URL cargada |
| Intent redirection | Android | Validar el destino antes de reenviar |
| Pasteboard compartido | iOS | No copiar datos sensibles; usar pasteboard local |
| Permisos excesivos | Ambas | Solo los necesarios, solicitados en contexto |
| IPC inseguro | Ambas | Autenticar y validar toda comunicación entre apps |
| Aplicaciones acompañantes o SDK de terceros | Ambas | Inventario de SDK; cada uno accede a lo que accede la app |

### Autenticación

| Riesgo | Control |
|---|---|
| Autorización decidida en el cliente | Toda decisión en el servidor; el cliente solo presenta |
| Tokens de larga vida sin protección | Almacenamiento en Keystore/Keychain; vidas cortas; refresh con rotación |
| Sesión no revocable | Revocación del lado servidor y en el cierre de sesión |
| Biometría como único factor local sin respaldo criptográfico | Vincular a clave del enclave |
| OAuth en WebView | Usar Custom Tabs / ASWebAuthenticationSession, con PKCE |

### Resiliencia

Estas medidas encarecen el análisis; **no protegen datos por sí solas**:

- Detección de root o jailbreak, de emulador, de depurador y de instrumentación (Frida).
- Verificación de integridad y de firma de la aplicación.
- Ofuscación de código y de cadenas.
- Atestación de la plataforma (Play Integrity, App Attest) como señal del lado servidor.

Uso correcto: enviar la señal al servidor y decidir allí (denegar, limitar, exigir verificación adicional). Bloquear solo en el cliente es evadible con un parche binario.

## Superficie del servidor

La mayoría de las brechas "de app móvil" son, en realidad, fallos de la API detrás: BOLA, autorización ausente, exceso de datos en la respuesta. Ver [owasp_api.md](../owasp_api.md). Una app móvil no puede proteger una API mal diseñada.

## Gestión de flota

| Control | Efecto |
|---|---|
| MDM/UEM con cumplimiento | Cifrado, código de acceso, versión mínima de sistema operativo, borrado remoto |
| Separación de perfil personal y de trabajo | Contiene la fuga de datos corporativos |
| Bloqueo de dispositivos rooteados o con jailbreak | Como condición de acceso, no como control absoluto |
| Distribución de apps solo desde tiendas o desde el catálogo corporativo | Evita instalación lateral de aplicaciones manipuladas |
| Acceso condicional basado en el estado del dispositivo | Integra el móvil en el modelo Zero Trust |
| Parcheo del sistema operativo | Los exploits de cadena completa contra móviles existen y se venden; la versión al día es la principal defensa |

## Amenazas específicas

| Amenaza | Descripción | Contramedida |
|---|---|---|
| Spyware comercial de grado estatal | Cadenas de exploits sin interacción; objetivo dirigido | Modo de bloqueo (Lockdown Mode) en iOS, actualizaciones inmediatas, reinicio periódico, perfil de riesgo |
| Smishing y phishing por mensajería | Vector masivo de acceso inicial | Formación, filtrado, MFA resistente a phishing |
| Aplicaciones falsas y repackaging | Copia de la app con código añadido | Vigilancia de tiendas, atestación, verificación de firma |
| Troyanos bancarios con servicios de accesibilidad | Superposición de pantallas y control remoto | Detección de superposición, atestación, educación del usuario |
| SIM swapping | Toma de control del número | No usar SMS como segundo factor |
| Redes Wi-Fi hostiles | Interceptación | TLS correcto y pinning; la VPN ayuda pero no sustituye |
| Perfiles de configuración maliciosos | iOS: instalación de CA o de restricciones | Restringir la instalación de perfiles por MDM |
