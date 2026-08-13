---
id: android/android
tipo: modelo
estabilidad: permanente
---

# Seguridad de la plataforma Android

Seguridad **del dispositivo y del sistema**, no de la app que se construye — eso vive en [../../security/mobile/mobile.md](../../security/mobile/mobile.md). Los CVE concretos y las campañas están en [android_exploits.md](android_exploits.md), que es un snapshot fechado.

## Premisa

Android es lo contrario de iOS en las dos cosas que importan.

**Sí se puede inspeccionar.** Hay gestor de paquetes consultable, servicios que responden a `dumpsys`, registro del sistema, propiedades de arranque legibles y un informe de errores completo. A diferencia de iOS, aquí el triage tiene sentido: se puede enumerar qué apps hay, quién las instaló, qué privilegios sensibles se han concedido y en qué estado arrancó el dispositivo.

**Pero el parche puede no llegar nunca.** Google publica el boletín mensual; quien lo integra, lo firma y lo entrega es el fabricante, y por debajo el proveedor del silicio. Esa cadena tiene latencia, tiene huecos y tiene un final: el fin de soporte. En iOS el control de mayor rendimiento es actualizar; en Android, actualizar es a menudo *imposible*, y ninguna configuración sustituye a un parche de kernel que no existe.

De ahí el corolario que ordena todo lo demás: **«Android» no es un modelo de amenaza, es una familia de ellos**. Un dispositivo con nivel de parche al día y arranque bloqueado, y otro de gama baja fuera de soporte desde hace dos años, comparten el nombre comercial y casi nada más. Cualquier recomendación que no empiece preguntando por el nivel de parche real está hablando de un dispositivo imaginario.

## Modelo de amenaza por perfil

Los controles no son intercambiables entre perfiles. La diferencia con iOS está en la primera fila: en Android el perfil masivo se enfrenta a un vector que en iOS no existe, la instalación fuera de tienda.

| Perfil | Adversario | Vector dominante | Lo que de verdad importa |
|---|---|---|---|
| Masivo | Fraude financiero organizado | Instalación fuera de tienda inducida por mensaje, y abuso de accesibilidad | No instalar fuera de tienda, auditar accesibilidad y superposición, Play Protect activo |
| Dirigido | Spyware comercial de grado estatal | Cadenas sin interacción por mensajería y por análisis de imagen | Nivel de parche al día, Protección Avanzada, reducir superficie de mensajería |
| Físico-forense | Fuerzas del orden, aduanas, extracción comercial, convivencia abusiva | Acceso físico, estado del arranque, depuración por cable | Arranque bloqueado, código largo, estado en que se incauta el terminal |

En iOS el perfil masivo se defiende casi solo, porque no hay forma sencilla de instalar software arbitrario. En Android no: el vector de mayor volumen está disponible para cualquiera y no requiere ninguna vulnerabilidad.

## Superficie de ataque

Lo que procesa entrada no confiable. La columna de interacción ordena la prioridad: contra «ninguna», la formación al usuario no sirve de nada.

| Componente | Entrada | Interacción | Aislamiento |
|---|---|---|---|
| Códecs de imagen (del sistema y del fabricante) | Imágenes recibidas por mensajería, incluidos formatos exóticos como DNG | Ninguna | Parcial; los códecs propios del fabricante quedan fuera de la actualización modular |
| Extractores y códecs de medios | Audio y vídeo | Ninguna | Proceso separado desde el rediseño posterior a Stagefright |
| WebView y motor web | Contenido web dentro de cualquier app que lo incruste | Carga automática o clic | Proceso de renderizado separado; se actualiza por la tienda, no por OTA |
| Binder e IPC (Intents, Services, ContentProviders) | Otra app ya instalada | Variable | SELinux y UID por app. **Superficie entre apps que iOS no tiene** |
| Accesibilidad y superposición de pantalla | El propio usuario concediendo el permiso | Varios toques deliberados | Ninguno: es privilegio total sobre la interfaz, por diseño |
| Bluetooth | Tramas de proximidad, sin emparejar | Ninguna | Proceso propio; históricamente la superficie remota más rentable |
| Wi-Fi | Tramas de proximidad | Ninguna | Firmware del proveedor del chip, fuera de AOSP |
| NFC | Etiqueta o terminal cercano | Proximidad, a veces un toque | Servicio propio |
| Banda base | Red del operador, estación base falsa | Ninguna | Procesador separado, fuera del alcance de Android |
| Drivers de GPU y de fabricante | Cualquier app local ya en ejecución | Ninguna | **Ninguno: corren en el kernel.** Es el eslabón de escalada preferido |
| USB y depuración | Equipo conectado | Física, más autorizar la huella del equipo | Depuración desactivada por defecto |
| Apps preinstaladas del fabricante y del operador | Vienen en la imagen del sistema | Ninguna | Privilegiadas y firmadas por la plataforma; el usuario no las eligió ni puede quitarlas |
| Instalador de paquetes | APK de cualquier origen | Varios toques | Restricción de fuentes desconocidas, sorteable por el propio usuario |

Dos filas merecen nota. **Los drivers del fabricante** son la diferencia estructural con iOS: corren en el kernel, los escribe quien fabrica el silicio, y son a la vez el objetivo preferido para escalar y la parte de la cadena de parcheo que peor funciona. **Las apps preinstaladas** son superficie impuesta: están firmadas por la plataforma, alcanzan privilegios que ninguna app de tienda obtiene, y no se desinstalan.

## La cadena de parcheo

Es la parte más específica de Android y la que más se malinterpreta. En iOS no existe equivalente.

El nivel de parche se lee en `ro.build.version.security_patch` y tiene forma de fecha. **El día importa tanto como el mes.** Cada boletín publica dos niveles, y en palabras de la propia documentación de Android, esto existe *«para que los socios de Android tengan la flexibilidad de corregir más rápido un subconjunto de vulnerabilidades que son similares en todos los dispositivos»*:

| Nivel | Qué incluye |
|---|---|
| `AAAA-MM-01` | El subconjunto común: framework y componentes de sistema de AOSP |
| `AAAA-MM-05` | Todo lo anterior **más** lo específico de fabricante y de silicio: kernel, drivers y componentes cerrados |

Consecuencia operativa: un dispositivo que declara `-01` **no ha recibido las correcciones de kernel y de driver de ese mes**, que es exactamente donde vive la escalada a root. Leer solo el mes y dar por bueno el parche es el error de lectura más frecuente. No todos los meses se publican ambos niveles.

Por encima del OTA hay varias vías paralelas, con dueños distintos y modos de fallo distintos:

| Mecanismo | Qué actualiza | Quién lo entrega | Por qué falla |
|---|---|---|---|
| OTA completa | Sistema, kernel, drivers, firmware | Fabricante | Latencia de meses; se acaba con el fin de soporte |
| Módulos del sistema (Mainline / APEX) | Subsistemas de AOSP: medios, códecs, resolutor DNS, criptografía y otros según versión | Google, por la tienda, sin OTA | El fabricante puede sustituir módulos por los suyos; no cubre kernel ni drivers |
| WebView y navegador | El motor web de **todas** las apps que lo incrusten | Google, por la tienda | Requiere una tienda funcional y actualizada |
| Servicios de Google Play | Capa de seguridad, Play Protect, verificación de integridad | Google | Los dispositivos sin servicios de Google quedan fuera por completo |
| Firmware de módem y de radio | Banda base y chips inalámbricos | Fabricante y proveedor de silicio | Opaco, sin calendario público ni forma de auditarlo |

La pregunta operativa correcta no es «¿qué versión de Android tiene?», sino **«¿qué nivel de parche, con qué día, y hay actualización pendiente sin instalar?»**. Un dispositivo con versión mayor antigua y parche al día está mejor que uno con versión reciente y parche de hace ocho meses.

## Anatomía de una cadena

En Android hay **dos caminos**, y confundirlos lleva a defender el que no toca.

**Camino de exploit**, el de las cadenas dirigidas:

**entrada** → **ejecución en el proceso que analiza** → **escape del sandbox** → **escalada a kernel, casi siempre por un driver del fabricante** → **anulación de la integridad del sistema** → *persistencia, o su renuncia deliberada*

**Camino de consentimiento**, el del fraude masivo:

**mensaje** → **instalación fuera de tienda** → **el usuario concede accesibilidad** → **lectura de pantalla, inyección de toques, captura de notificaciones y de códigos de un solo uso**

El segundo no explota **ninguna** vulnerabilidad. No hay CVE que lo describa, ningún parche lo cierra y ninguna mitigación de memoria interviene. Es, con diferencia, el que produce más víctimas. Un informe de amenazas de Android que solo enumere vulnerabilidades está describiendo la mitad minoritaria del problema.

Sobre la persistencia, la asimetría con iOS: aquí es **barata**. Quien consigue instalar una app y convertirla en administrador de dispositivo no necesita cadena de kernel para sobrevivir a un reinicio. Por eso el reinicio periódico, que en iOS es una medida defensiva con valor real, aquí vale mucho menos.

## Arquitectura de mitigación

La última columna es la que impide leer esta tabla como folleto.

| Mitigación | Qué rompe | Desde | Cómo se ha eludido |
|---|---|---|---|
| Sandbox con UID por app | Acceso a datos de otras apps | Siempre | Servicios del sistema alcanzables desde el sandbox; componentes exportados sin protección |
| SELinux en modo obligatorio | Movimiento del proceso comprometido hacia el resto del sistema | Android 5 | Dominios laxos añadidos por el fabricante; fallos en drivers que ya corren en el kernel |
| Arranque verificado y dm-verity | Modificación persistente del sistema | Obligatorio desde Android 6 | Desbloqueo del arranque por el propio usuario; fallos en la cadena de arranque del fabricante |
| Cifrado basado en ficheros | Lectura del almacenamiento con el terminal apagado | Android 7 | Extracción con el dispositivo ya desbloqueado desde el arranque |
| Rediseño de medios tras Stagefright | RCE por mensaje multimedia con un único proceso privilegiado | Android 7 | Códecs propios del fabricante, que quedaron fuera del rediseño |
| Módulos del sistema (Mainline) | La dependencia total del OTA del fabricante | Android 10 | No alcanza al kernel ni a los drivers, que es donde está la escalada |
| Almacenamiento con ámbito | Lectura del almacenamiento compartido entre apps | Android 10–11 | Rutas heredadas en apps que declaran un `targetSdkVersion` antiguo |
| Ajustes restringidos | Accesibilidad y administración de dispositivo para apps instaladas fuera de tienda | Android 13 | **El propio usuario puede levantarlo** desde la ficha de la app; y no aplica a instaladores por sesión, que es lo que usan las tiendas alternativas |
| Etiquetado de memoria (MTE, Armv9) | La corrupción de memoria como clase | Pixel 8 y Android 14 | **Es una opción de desarrollador, desactivada por defecto.** No es una mitigación desplegada, es una herramienta de prueba |
| Protección Avanzada | Superficie sin interacción, y la posibilidad de degradar los ajustes de seguridad | Android 16 | Demasiado reciente para tener historial; exige dispositivo compatible |
| Play Protect e integridad de la plataforma | Malware conocido y clientes manipulados | Continuo | Ofuscación y carga dinámica de código; los dispositivos sin servicios de Google quedan fuera |

Dos lecturas. **Primera:** en Android una mitigación no es una propiedad de «Android», sino de *una versión concreta en un dispositivo concreto que la recibió*. La columna «desde» no describe el parque instalado. **Segunda, y más incómoda:** ninguna fila de esta tabla interviene en el camino de consentimiento. El contraste con Apple es nítido en la fila de etiquetado de memoria — la mitigación técnicamente más ambiciosa de Android viaja desactivada por defecto, mientras el equivalente de Apple va activo de fábrica.

## Vectores

| Vector | Interacción | Precondición | Reducción |
|---|---|---|---|
| Instalación fuera de tienda inducida por SMS o mensajería | Instalar y conceder permisos | Convencer al usuario | No instalar fuera de tienda; no levantar los ajustes restringidos |
| Aplicación cuentagotas en tienda oficial | Instalar | Superar la revisión de la tienda | Menos apps; revisar permisos después de cada actualización |
| Accesibilidad y superposición | Conceder el permiso | Que la app ya esté instalada | Auditar los servicios activos y retirar los que no se reconozcan |
| Mensajería con análisis de imagen | Ninguna | Conocer el número | Actualizar app y sistema; Protección Avanzada |
| WebView incrustada en app de terceros | Abrir contenido | Atraer a la víctima o inyectar en tránsito | Mantener el motor web y la tienda al día |
| Bluetooth | Ninguna | Proximidad | Apagarlo cuando no se usa; nivel de parche al día |
| NFC | Proximidad, a veces un toque | Cercanía física | Desactivarlo cuando no se usa |
| Banda base y estación base falsa | Ninguna | Equipo especializado y cercanía | Fuera del alcance del usuario |
| USB y depuración | Física | Depuración activada y equipo autorizado | Depuración desactivada; no autorizar equipos ajenos |
| Administrador de dispositivo o gestión corporativa | Conceder, o inscripción ya existente | Ingeniería social, o servidor de gestión comprometido | Auditar administradores; tratar el MDM como sistema crítico |
| App preinstalada del fabricante o del operador | Ninguna | Viene en la imagen | Se decide al elegir el dispositivo; después no se puede quitar |
| SDK de terceros dentro de apps legítimas | Instalar la app | Que la app lo incorpore | Inventario de apps: menos apps es menos superficie |
| Arranque desbloqueado | Física | Desbloqueo previo | Mantenerlo bloqueado y verificar el estado |

Dos matices que suelen faltar. **Desbloquear el arranque borra el dispositivo**, lo que lo protege del desbloqueo oportunista tras un robo; pero un terminal que *ya circula* desbloqueado no ofrece ninguna garantía de integridad, y eso incluye a buena parte del mercado de segunda mano. **La restricción de fuentes desconocidas no es una barrera técnica sino un diálogo**: quien convence al usuario de instalar, lo convence de aceptarlo, y en Android 13 y posteriores también de levantar los ajustes restringidos desde la ficha de la app.

## Endurecimiento por perfil

Ningún control es gratis. Recomendar sin la columna de coste produce configuraciones que el usuario revierte a la semana.

| Control | Perfil | Qué cierra | Qué cuesta |
|---|---|---|---|
| Comprobar el nivel de parche y el compromiso de soporte **antes de comprar** | Todos | Años enteros de exposición sin corrección posible | Condiciona la compra; es la decisión de seguridad más importante del ciclo de vida |
| Actualizar el día que llega la actualización | Todos | La ventana de explotación conocida | Nada, cuando llega |
| No instalar fuera de la tienda | Masivo, crítico | El vector de mayor volumen | Renunciar a apps que solo existen fuera |
| Auditar accesibilidad, superposición y lectura de notificaciones | Todos | El camino de consentimiento, que ninguna mitigación cubre | Una revisión periódica de dos minutos |
| Arranque bloqueado, y verificar su estado | Todos, crítico en físico-forense | Modificación persistente del sistema | Impide ROMs alternativas y root |
| Código de bloqueo largo, no patrón | Todos, crítico en físico-forense | Fuerza bruta en extracción física | Molestia real y diaria |
| Depuración por USB desactivada | Todos | Acceso por cable | Ninguno, salvo que se desarrolle |
| Radios apagadas cuando no se usan | Dirigido | Superficie de proximidad | Comodidad |
| Protección Avanzada | Dirigido | Superficie sin interacción, y que alguien degrade los ajustes después de entrar | Reinicio automático tras inactividad, restricciones de USB y de aplicaciones |
| Perfil de trabajo separado | Corporativo | Fuga entre datos personales y corporativos | Dos espacios que mantener |
| Menos apps instaladas | Todos | Superficie de SDK y de permisos | Comodidad |

## Inspeccionabilidad: la ventaja frente a iOS

Aquí sí se puede preguntar al dispositivo, y esa es la diferencia operativa más útil de la plataforma. Con la depuración por USB activada y en modo de **solo lectura** se responde en minutos qué apps hay y quién las instaló, qué servicios de accesibilidad están activos, quién lee las notificaciones, quién puede dibujar encima de otras apps, qué administradores de dispositivo existen, qué nivel de parche declara el terminal y en qué estado arrancó.

Ese puñado de consultas cubre el camino de consentimiento entero, que es donde está la mayoría de los casos reales. En iOS no hay equivalente.

Dos advertencias antes de usarlo. **Activar la depuración por USB modifica el dispositivo**, y eso importa si el caso puede acabar en sede judicial. Y **no encontrar nada no descarta el compromiso**: solo descarta las clases que esas consultas cubren.

El procedimiento completo —preservación, recolección, artefactos, interpretación y contención— está en [android_forensics.md](android_forensics.md).

## Límites

- **El fabricante manda.** Sin su parche no hay corrección para kernel ni drivers, y ninguna configuración lo sustituye.
- **La banda base queda fuera**, igual que en iOS: firmware propio, procesador propio, sin visibilidad.
- **El camino de consentimiento no lo cubre ninguna mitigación de memoria.** Sandbox, SELinux y etiquetado de memoria son irrelevantes cuando el usuario concede.
- **Sin servicios de Google no hay Play Protect, ni verificación de integridad, ni buena parte de la actualización modular.** Es una decisión con consecuencias, no un detalle.
- **El root voluntario anula el modelo entero.** Sandbox, arranque verificado y SELinux dejan de ser garantías desde el momento en que el usuario los desactiva.
- **El fin de soporte es el final.** Un dispositivo fuera de soporte no se endurece: se sustituye.
