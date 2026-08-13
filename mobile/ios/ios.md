---
id: ios/ios
tipo: modelo
estabilidad: permanente
---

# Seguridad de la plataforma iOS

Seguridad **del dispositivo y del sistema**, no de la app que se construye — eso vive en [../../security/mobile/mobile.md](../../security/mobile/mobile.md). Los CVE concretos y las campañas están en [ios_exploits.md](ios_exploits.md), que es un snapshot fechado.

## Premisa

iOS es auditable solo desde fuera. No hay EDR con visibilidad de kernel, no hay lista de procesos, no hay antivirus con acceso real al sistema: la App Store no permite el nivel de privilegio que eso exige. Toda «app de seguridad para iPhone» opera dentro del mismo sandbox que cualquier otra y ve lo que le dejan ver.

De ahí la inversión respecto de Windows y Linux: **no se detecta, se reduce superficie y se parchea**. Quien planifique la defensa de un iPhone como planifica la de un portátil corporativo —agente, telemetría, cuarentena— construye una expectativa que la plataforma no puede cumplir. Lo que sí funciona es cerrar entradas y acortar la ventana entre parche y aplicación.

Corolario incómodo: la ausencia de alerta no significa nada. Un iPhone comprometido se comporta exactamente igual que uno limpio.

## Modelo de amenaza por perfil

Los controles no son intercambiables entre perfiles. Aplicar los del perfil dirigido a un usuario masivo consume atención y desplaza lo que sí le protege.

| Perfil | Adversario | Vector dominante | Lo que de verdad importa |
|---|---|---|---|
| Masivo | Oportunista, con motivación económica | Phishing, robo de cuenta, apps falsas, robo físico del terminal | Contraseña única del Apple ID, 2FA, actualizar, código de acceso largo |
| Dirigido | Spyware comercial de grado estatal | Cadenas sin interacción (*zero-click*) por mensajería | Actualizar el día del parche, modo de bloqueo, reducir superficie de mensajería |
| Físico-forense | Fuerzas del orden, aduanas, extracción comercial, convivencia abusiva | Acceso físico al terminal desbloqueado o al Apple ID | Estado del terminal al ser incautado, código largo, revisión de perfiles y de dispositivos de confianza |

La confusión más cara es tratar el perfil masivo como dirigido. La segunda más cara es lo contrario: alguien con perfil dirigido real que se conforma con 2FA.

## Superficie de ataque

Lo que procesa entrada no confiable. La columna de interacción es la que ordena la prioridad: lo que no requiere toque del usuario no admite «formación al usuario» como control.

| Componente | Entrada | Interacción | Aislamiento |
|---|---|---|---|
| ImageIO | Imágenes en cualquier formato, incluidos los exóticos (DNG, JBIG2, WebP) | Ninguna | Parcial: dentro de BlastDoor si llega por Mensajes |
| WebKit | Contenido web, también en vistas web incrustadas en otras apps | Clic o carga automática | Proceso de renderizado separado |
| CoreGraphics / analizador de PDF | PDF, y ficheros que dicen ser otra cosa | Ninguna | Parcial |
| Motor de fuentes | Fuentes incrustadas en documentos | Ninguna | Débil históricamente |
| Wallet / PassKit | Adjuntos de tarjeta o pase | Ninguna | Parcial |
| CoreAudio y códecs | Audio y vídeo entrantes | Ninguna | Proceso separado |
| Bluetooth | Emparejamiento y perfiles de dispositivo | Proximidad | Demonio propio |
| Wi-Fi y AWDL (AirDrop, AirPlay) | Tramas de proximidad | Proximidad, sin emparejar | Demonio propio, históricamente en kernel |
| Banda base | Red del operador, estación base falsa | Ninguna | Procesador separado, fuera del alcance de iOS |
| USB | Accesorio o equipo conectado | Física | Restringido tras una hora bloqueado |
| Perfiles de configuración | Fichero `.mobileconfig` | El usuario debe aceptar varios pasos | Ninguno: es configuración privilegiada por diseño |

La banda base merece una nota: corre su propio firmware en su propio procesador, y ni iOS ni el usuario tienen visibilidad sobre él. No es un componente endurecible, es un supuesto de confianza.

## Anatomía de una cadena

Una cadena moderna contra iOS encadena eslabones porque ninguna vulnerabilidad sola basta:

**entrada** → **ejecución en el proceso que analiza** → **escape del sandbox** → **escalada a kernel** → **anulación de las protecciones de integridad** → *persistencia, o su renuncia deliberada*

El último eslabón es el que más se malinterpreta. Buena parte del spyware moderno **no persiste al reinicio**: pagar por una vulnerabilidad de persistencia es caro y aumenta la probabilidad de ser detectado, y reinfectar es barato cuando se controla el vector de entrada. Consecuencias prácticas:

- Reiniciar tiene valor defensivo real, y es de las pocas medidas gratuitas que existen. No cura nada, pero corta la sesión en curso.
- Un análisis forense que no encuentre implante no descarta la infección: puede haberse ido con el último reinicio y haber dejado solo rastro de red.
- La reinfección repetida es la señal, no el implante.

## Arquitectura de mitigación

Qué contiene los ataques, desde cuándo, y cómo se ha sorteado. La última columna es la que impide leer esta tabla como folleto comercial.

| Mitigación | Qué rompe | Desde | Cómo se ha eludido |
|---|---|---|---|
| Sandbox de app | Acceso a datos de otras apps y del sistema | Siempre | Fallos lógicos en servicios del sistema alcanzables desde el sandbox |
| PAC (autenticación de punteros) | Reutilización de punteros de código corrompidos | A12, arm64e | Vulnerabilidades que permiten firmar punteros, o ataques que no necesitan control de flujo |
| BlastDoor | Análisis de adjuntos de Mensajes en el proceso principal | iOS 14 | Formatos que se analizan fuera del sandbox, y fallos dentro del propio BlastDoor |
| `kalloc_type` | Reutilización de memoria de kernel entre tipos distintos | iOS 15 | Técnicas de manipulación de memoria física, que no dependen del asignador |
| PPL → SPTM | Modificación de tablas de página desde el kernel | PPL previo; SPTM en iOS 17, A15+ | Registros de hardware no documentados; fallos en el propio monitor |
| Modo de bloqueo | La mayoría de superficies de entrada sin interacción | iOS 16 | Sin caso público de elusión por exploit; sí manipulación posterior al compromiso para simular que está activo |
| MIE / EMTE | Corrupción de memoria como clase, con etiquetado siempre activo | A19 y A19 Pro (iPhone 17, iPhone Air), 2025 | Demasiado reciente para tener historial; no cubre fallos lógicos ni de diseño |

Dos lecturas del conjunto. Primera: las mitigaciones no eliminan clases de fallo, **elevan el coste** — y ese coste se traduce en menos operadores capaces y en objetivos más seleccionados. Segunda: ninguna de ellas protege contra un fallo *lógico*, que no corrompe memoria y por tanto no dispara nada. Los vectores de perfil de configuración y de cuenta viven íntegramente en ese hueco.

## Vectores

| Vector | Interacción | Precondición | Reducción |
|---|---|---|---|
| Mensajes (adjunto sin interacción) | Ninguna | Conocer el identificador de contacto | Modo de bloqueo; filtrar remitentes desconocidos |
| Enlace de iCloud o contenido remoto en mensajería | Ninguna | Igual | Modo de bloqueo |
| WebKit por navegación | Visitar la página | Atraer a la víctima, o inyectar en tránsito | Actualizar; modo de bloqueo desactiva la compilación al vuelo |
| Mensajería de terceros | Ninguna o mínima | Conocer el número | Actualizar la app, no solo el sistema |
| Perfil de configuración | Varios toques deliberados | Ingeniería social o acceso físico | Revisar Ajustes → General → VPN y gestión de dispositivos; modo de bloqueo lo impide |
| MDM | Ninguna, si la inscripción ya existe | Comprometer el servidor de gestión, o inscribir el terminal | Tratar el MDM como sistema crítico; auditar quién puede publicar perfiles |
| AirDrop y proximidad | Ninguna o aceptar | Estar cerca | AirDrop en «solo contactos» o desactivado; Bluetooth apagado cuando no se usa |
| Físico / USB | Física | Tener el terminal | Código de acceso largo, no de 6 dígitos; conocer el estado en que se incauta |
| Apple ID | Ninguna en el terminal | Credenciales, o código de acceso observado | Contraseña única, 2FA, Protección de Dispositivo Robado |
| SDK de terceros dentro de apps legítimas | Instalar la app | Que la app incorpore el SDK | Inventario de apps; menos apps es menos superficie |

Dos matices que suelen faltar. **AirDrop**: el problema documentado no es tanto la ejecución de código como la identificación del remitente — el mecanismo de descubrimiento intercambia valores derivados del teléfono y del correo que se han demostrado reversibles en la práctica. **Apple ID**: no necesita ninguna vulnerabilidad. Quien observa el código de acceso y después roba el terminal puede cambiar la contraseña de la cuenta y expulsar al dueño legítimo; Protección de Dispositivo Robado existe exactamente para eso, imponiendo biometría y retardo para las operaciones sensibles fuera de ubicaciones conocidas.

## Endurecimiento por perfil

Ningún control es gratis. Recomendar sin la columna de coste produce configuraciones que el usuario revierte a la semana.

| Control | Perfil | Qué cierra | Qué cuesta |
|---|---|---|---|
| Actualizar el día del parche | Todos | La ventana de explotación conocida, que es donde ocurre casi todo | Nada. Es el control de mayor rendimiento y el más incumplido |
| 2FA y contraseña única del Apple ID | Todos | Toma de control de la cuenta, que no requiere exploit | Fricción mínima |
| Código de acceso alfanumérico largo | Todos, crítico en físico-forense | Fuerza bruta en extracción física | Molestia real y diaria |
| Protección de Dispositivo Robado | Todos | Bloqueo del dueño tras robo con código observado | Retardo en cambios sensibles fuera de casa o trabajo |
| Reinicio periódico | Dirigido | Sesiones de implantes no persistentes | Trivial |
| Modo de bloqueo | Dirigido | La mayor parte de la superficie sin interacción | Alto: rompe adjuntos, vistas previas de enlaces, llamadas de desconocidos, perfiles y accesorios por cable |
| AirDrop en «solo contactos» o desactivado | Todos | Proximidad e identificación del remitente | Bajo |
| Protección de Datos Avanzada | Dirigido, y quien lo entienda | Cifrado de extremo a extremo de casi toda la copia de iCloud | **Irreversible si se pierde la clave de recuperación**: Apple no puede recuperar la cuenta |
| Menos apps instaladas | Todos | Superficie de SDK y de permisos | Comodidad |

Protección de Datos Avanzada merece un aviso explícito antes de recomendarla: traslada al usuario el riesgo de pérdida total y definitiva de sus datos. Recomendarla sin decirlo es imprudente. Su disponibilidad depende además de la jurisdicción, y ha sido retirada de algún mercado por presión regulatoria.

## Notificaciones de amenaza

Apple avisa a usuarios que cree objetivo de spyware mercenario. Cómo tratarlo:

- La notificación llega por correo, por iMessage al identificador de la cuenta y como aviso al iniciar sesión en la web de la cuenta. **Nunca contiene enlaces ni pide credenciales, ni adjunta ficheros ni pide instalar nada.** Cualquier mensaje que sí lo haga es phishing que imita el formato.
- Es una señal de alta confianza sobre el *objetivo*, no una confirmación de compromiso.
- Recibirla activa el playbook de [ios_forensics.md](ios_forensics.md), y en ese orden: preservar antes de tocar.

## Límites

- **La cuenta no es el dispositivo.** Un Apple ID comprometido entrega copias, fotos y ubicación sin tocar el terminal, y ninguna mitigación del sistema interviene.
- **La coacción legal existe.** Lo que esté en iCloud sin Protección de Datos Avanzada es entregable mediante requerimiento.
- **La banda base queda fuera.** iOS no la audita ni la contiene.
- **El acceso físico prolongado gana casi siempre**, sobre todo si el terminal se incauta desbloqueado o ya usado desde el último arranque.
- **El hardware antiguo no se arregla con parches.** Los fallos en la ROM de arranque no son parcheables por software; en los modelos afectados son permanentes.
