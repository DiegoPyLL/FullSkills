---
id: ios/ios_platform
tipo: referencia
estabilidad: volatil
snapshot: 2026-08
consulta_externa: https://developer.apple.com/app-store/review/guidelines/
---

# Restricciones de plataforma en iOS

**Snapshot de agosto de 2026.** Las reglas de revisión, los requisitos de privacidad y el marco regulatorio cambian por decisión de Apple o del legislador, a veces con pocas semanas de aviso. Verificar en las [directrices de revisión](https://developer.apple.com/app-store/review/guidelines/) antes de comprometer una decisión de producto.

Aquí van las restricciones que condicionan **qué se puede construir**. La seguridad de la plataforma está en [ios.md](ios.md); la seguridad de la app que se construye, en [../../security/mobile/mobile.md](../../security/mobile/mobile.md).

## Premisa

En iOS, la plataforma no es un entorno de ejecución: es un **regulador**. Decide qué funciones existen, cuándo se ejecutan, qué datos se leen y si la app llega a publicarse. Es una restricción de diseño, no una capa de infraestructura que se pueda abstraer.

De ahí el error más caro en producto móvil: diseñar una función asumiendo capacidades de escritorio o de servidor —trabajo continuo en segundo plano, acceso libre al sistema de ficheros, actualización silenciosa del comportamiento— y descubrir la restricción cuando ya está construida. Las restricciones se consultan **antes** de la especificación.

## Revisión de la App Store

Motivos de rechazo por familia, ordenados por frecuencia práctica. No sustituyen a las directrices oficiales, que son el texto normativo.

| Familia | Qué se rechaza | Cómo se evita |
|---|---|---|
| Funcionalidad mínima | La app es una web envuelta, o duplica algo que ya hace el sistema | Aportar función nativa real |
| Compras dentro de la app | Vender contenido digital por fuera del sistema de pago de Apple, o enlazar a ello donde no se permite | Conocer qué categorías están exentas antes de diseñar el modelo de negocio |
| Privacidad | Permisos sin justificación visible al usuario, o etiquetas de privacidad que no cuadran con el comportamiento real | Pedir el permiso en contexto y declarar con exactitud |
| Datos de cuenta | Registro obligatorio para funciones que no lo necesitan; no ofrecer borrado de cuenta desde la app | Borrado de cuenta accesible dentro de la app |
| Contenido generado por usuarios | Sin moderación, sin bloqueo, sin denuncia | Moderación y bloqueo desde la primera versión |
| Comportamiento oculto | Función que se activa tras la revisión, o código que se descarga y cambia la lógica | No hacerlo: es de las pocas causas de expulsión, no solo de rechazo |
| Metadatos | Capturas que no reflejan la app, descripción engañosa, categoría equivocada | Coherencia entre ficha y binario |
| Estabilidad | Fallos en el primer arranque, o dependencia de un servicio que no responde | Probar en dispositivo limpio, sin sesión iniciada |

Regla que ahorra semanas: **lo que se revisa es el binario y su ficha, no la intención**. Un revisor que no encuentra cómo llegar a una función asume que no existe; unas credenciales de prueba que no funcionan producen un rechazo sin más análisis.

## Privacidad y permisos

| Mecanismo | Qué controla | Consecuencia de diseño |
|---|---|---|
| Cadenas de uso obligatorias | Cada permiso exige declarar el propósito visible al usuario | Un permiso sin justificación creíble se rechaza en revisión y se deniega en uso |
| Petición en contexto | El sistema pregunta una vez, con peso real | Pedir todo al arrancar es la forma más eficaz de que lo denieguen todo |
| Transparencia de seguimiento entre apps | Rastreo entre apps y sitios de terceros | La mayoría deniega. Un modelo de negocio que depende de identificador de publicidad no se sostiene |
| Etiquetas de privacidad | Declaración pública de qué se recoge y con qué se vincula | Debe cubrir también lo que recogen los SDK incorporados |
| Permisos de alcance reducido | Fotos, contactos y ubicación aproximada en lugar de acceso completo | Diseñar para el caso parcial, no exigir el total |
| Justificación de APIs sensibles | Ciertas APIs exigen declarar el motivo de uso | Auditar también las dependencias, que pueden usarlas sin que se sepa |

El punto que más sorprende a equipos que vienen de web: **el usuario dice que no, y hay que seguir funcionando**. Una app que se rompe sin permiso de notificaciones, de ubicación o de fotos está mal diseñada, no mal permitida.

## Ejecución en segundo plano

iOS no concede ejecución continua. El sistema decide, y puede terminar la app en cualquier momento.

| Necesidad | Lo que la plataforma ofrece | Límite |
|---|---|---|
| Traer datos nuevos periódicamente | Actualización en segundo plano oportunista | El sistema decide cuándo y con qué frecuencia, según uso y batería |
| Reaccionar a un evento del servidor | Notificación push, incluida la silenciosa | Sin garantía de entrega ni de inmediatez; la silenciosa se limita con agresividad |
| Terminar una subida o descarga larga | Sesión de transferencia gestionada por el sistema | El sistema la administra; la app puede no estar viva |
| Audio, navegación, llamadas | Modos declarados en segundo plano | Solo si la app hace realmente eso; declararlos sin usarlos es motivo de rechazo |
| Trabajo pesado y diferido | Tareas de procesamiento programadas | Se ejecutan cuando el dispositivo está cargando y ocioso, o no se ejecutan |

Consecuencia arquitectónica: **la fuente de verdad no puede vivir en el cliente**. Si algo tiene que ocurrir sí o sí, ocurre en el servidor, y el cliente se sincroniza cuando puede.

## Ciclo de versiones y soporte

- Una versión mayor de iOS al año, adopción rápida —la mayoría del parque migra en meses, muy por encima de lo habitual en Android—, y correcciones intermedias frecuentes.
- Elegir versión mínima soportada es una decisión de producto con coste medible: cada versión antigua que se mantiene añade rutas de código, matriz de pruebas y superficie de fallo. Se decide con los datos de uso propios, no con los del mercado global.
- Las herramientas de desarrollo imponen su propio calendario: Apple exige compilar con versiones recientes del SDK para poder enviar a la tienda. Ese requisito llega con fecha límite y no es negociable.
- Las capacidades nuevas suelen quedar restringidas al hardware reciente. Una función que depende del SoC del año no está disponible para la mayoría del parque en su primer año.

## Distribución alternativa en la Unión Europea

La normativa europea de mercados digitales obligó a abrir la distribución fuera de la App Store en la UE: mercados alternativos, distribución web directa bajo condiciones, y motores de navegador de terceros.

| Efecto | Lectura |
|---|---|
| Más vías de instalación | Más superficie: la instalación lateral se convierte en vector de ingeniería social viable donde antes no lo era |
| Requisitos de notarización | Apple mantiene una comprobación básica, que no equivale a la revisión completa |
| Fragmentación por jurisdicción | El comportamiento de la plataforma **difiere por región**: no se puede asumir un modelo único |
| Marco en disputa | Condiciones y comisiones han cambiado varias veces por presión regulatoria y siguen abiertas |

Para producto: no dar por hecho que la App Store es la única vía en la UE. Para seguridad: revisar [ios.md](ios.md), donde la instalación lateral figura como vector.
