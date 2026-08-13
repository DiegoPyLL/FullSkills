---
id: android/android_forensics
tipo: playbook
estabilidad: permanente
---

# Playbook — sospecha de compromiso de un Android

Escenario concreto sobre [../../security/playbooks/ir_base.md](../../security/playbooks/ir_base.md), que aporta las fases generales y no se repiten aquí. Modelo de amenaza y superficie en [android.md](android.md); campañas y CVE en [android_exploits.md](android_exploits.md).

## Premisa

Este playbook **no confirma limpieza**, igual que su equivalente de iOS. Pero parte de dos ventajas y una desventaja que invierten el procedimiento.

**Ventaja: el dispositivo es inspeccionable.** Hay gestor de paquetes consultable, servicios que responden a `dumpsys` y propiedades de arranque legibles. A diferencia de iOS, aquí se puede enumerar en minutos qué hay instalado, quién lo instaló y qué privilegios sensibles se han concedido.

**Ventaja: lo habitual persiste.** El caso mayoritario en Android no es una cadena de exploits efímera, sino una **aplicación instalada** que sobrevive al reinicio porque no necesita explotar nada. Eso significa que la evidencia suele seguir ahí — al revés que en iOS, donde reiniciar puede llevarse el implante.

**Desventaja: activar la depuración por USB modifica el dispositivo.** Es un cambio de estado sobre lo que quizá sea evidencia. Si el caso puede acabar en denuncia, la preservación manda sobre la comodidad.

Corolario que ordena todo el playbook: **empezar por el camino de consentimiento, no por el de exploit**. Cuatro consultas de privilegios resuelven la mayoría de casos reales; la cadena de spyware dirigido es rara y se investiga después.

## Disparadores

| Disparador | Confianza | Acción |
|---|---|---|
| Movimiento financiero no reconocido, o SMS de verificación que el usuario no pidió | **Alta** | Playbook completo, y contención de cuentas **antes** que análisis |
| Aplicación instalada que el usuario no recuerda, o que no se deja desinstalar | Alta | Playbook completo; el bloqueo de desinstalación apunta a administrador de dispositivo |
| Notificación de amenaza de Google, o perfil de riesgo — periodismo, disidencia, defensa de derechos | Alta sobre el *objetivo*, ninguna sobre el *compromiso* | Endurecer primero; análisis dirigido |
| Se instaló algo fuera de la tienda tras un mensaje o una llamada | Alta | Es el vector dominante. Playbook completo |
| Superposiciones o pantallas que piden credenciales fuera de contexto | Media-alta | Revisar accesibilidad y superposición de inmediato |
| Batería, calor, lentitud, anuncios | **Muy baja** | Descartar causa mundana antes de nada |

La última fila es la mayoría de las consultas reales, igual que en iOS. La primera es la que exige invertir el orden habitual: si hay fraude en curso, **contener las cuentas es más urgente que entender el dispositivo**.

## Preservación — antes de tocar nada

| Paso | Por qué |
|---|---|
| Modo avión | Corta el mando y control y detiene la exfiltración sin apagar |
| **No desinstalar todavía** la app sospechosa | Es la evidencia principal. Y si tiene administrador de dispositivo, el intento fallará y la alertará |
| **No restablecer de fábrica** | Es el error que más casos destruye: borra la evidencia, no confirma nada y deja al usuario sin saber qué rotar |
| **No actualizar** todavía | Actualizar es la primera medida **después** de recolectar |
| Anotar hora, modelo, versión de Android y nivel de parche | Sin línea temporal no hay correlación |
| Decidir si activar la depuración por USB | Modifica el dispositivo. Si el caso es legal, preservar primero — ver [forensics.md](../../security/forensics/forensics.md) |

A diferencia de iOS, **reiniciar no suele destruir la evidencia** aquí, porque lo habitual es una app instalada. Pero tampoco cura nada: la app vuelve a arrancar.

## Recolección

Todo lo que sigue es de **solo lectura**. Requiere depuración por USB activada y el equipo autorizado en el dispositivo.

| Fuente | Cómo | Qué contiene |
|---|---|---|
| Inventario de apps de terceros con su instalador | `adb shell pm list packages -3 -i` | Qué hay instalado y **quién lo instaló** — la consulta de mayor rendimiento del playbook |
| Servicios de accesibilidad activos | `adb shell settings get secure enabled_accessibility_services` | El privilegio más abusado de la plataforma |
| Lectores de notificaciones | `adb shell settings get secure enabled_notification_listeners` | Quién puede leer los códigos de un solo uso |
| Administradores de dispositivo | `adb shell dumpsys device_policy` | Quién bloquea la desinstalación y puede borrar el terminal |
| Permisos de superposición | `adb shell dumpsys window` | Quién puede dibujar encima de otras apps |
| Nivel de parche y estado de arranque | `adb shell getprop ro.build.version.security_patch` · `adb shell getprop ro.boot.verifiedbootstate` | Exposición real y si la integridad del sistema sigue intacta |
| Informe de errores completo | `adb bugreport` | Estado del sistema, servicios, red, histórico de paquetes |
| El APK sospechoso | `adb shell pm path <paquete>` y después `adb pull` | La muestra, para analizarla fuera del dispositivo |

## Artefactos de alto valor

| Artefacto | Señal que aporta |
|---|---|
| Instalador de cada paquete | Un instalador que **no es una tienda** —navegador, cliente de mensajería, o ninguno— es el indicador más directo del vector dominante |
| Servicio de accesibilidad concedido a una app que no lo necesita | Control total de la interfaz: leer pantalla, inyectar toques, rellenar formularios. Es el privilegio que convierte una app en un troyano bancario |
| Administrador de dispositivo no reconocido | Persistencia: impide la desinstalación. Hay que revocarlo antes de poder quitar la app |
| Lector de notificaciones no reconocido | Interceptación de códigos de un solo uso, sin tocar el SMS |
| Permiso de superposición fuera de contexto | Base técnica de la pantalla falsa sobre la app del banco |
| Estado de arranque distinto de `green` | `orange` es arranque desbloqueado; la integridad del sistema no está garantizada |
| Nivel de parche muy atrasado, o `-01` frente a un boletín con `-05` | Contexto de exposición: qué cadenas eran viables en esa ventana |
| El APK: firma, permisos declarados, carga dinámica de código | Comparar la firma con la de la app legítima que dice ser |

Detalle que se olvida: **el nombre visible y el icono no identifican una app**. Se identifica por nombre de paquete y por firma. Suplantar ambos a la vista es trivial.

## Herramientas

| Herramienta | Para qué | Cómo se lee |
|---|---|---|
| `mvt-android` (Mobile Verification Toolkit, Amnistía Internacional) | Trabaja sobre la conexión `adb`: enumera paquetes, descarga los APK y procesa el informe de errores, contrastando contra indicadores publicados | Coincidencia = **indicio**, no veredicto |
| Indicadores de Amnistía Internacional y de Citizen Lab | Alimentan a `mvt` | Envejecen: la infraestructura rota constantemente |
| Play Protect | Análisis bajo demanda contra firmas conocidas | Detecta lo catalogado. Estar desactivado es en sí una señal |
| Análisis estático del APK y servicios de reputación | Permisos, firma, cadenas, comportamiento declarado | Útil para confirmar suplantación de una app legítima |

Ninguna detecta lo desconocido: todas comparan contra lo ya documentado. Un resultado limpio significa «no coincide con lo que ya sabemos», nunca «está limpio».

## Interpretación

- **Un resultado negativo no es limpieza.** Es ausencia de coincidencia con indicadores conocidos.
- **Pero aquí un resultado positivo suele ser concluyente.** A diferencia de iOS, un servicio de accesibilidad concedido a una app instalada desde un navegador no es un indicio ambiguo: es el patrón completo del fraude, y basta para actuar.
- **Buscar convergencia en los casos dirigidos**: varios artefactos independientes en la misma ventana temporal.
- **Formular con nivel de confianza.** «Compromiso confirmado por app con accesibilidad instalada fuera de tienda», «indicio único sin corroborar», «sin hallazgos, con las limitaciones del método». Nunca sí o no.
- **La reinfección repetida señala un vector abierto**, y en Android suele ser el propio usuario reinstalando lo mismo, o una cuenta comprometida que restaura las apps.

## Contención y recuperación

En este orden, y **desde otro dispositivo que se considere limpio**:

| Paso | Detalle |
|---|---|
| Contener las cuentas primero, si hay fraude en curso | Banco y cuenta de Google. Antes que cualquier análisis: el dinero no espera |
| Rotar credenciales | Desde otro equipo: si el terminal está comprometido, la nueva contraseña también lo estará |
| Revocar accesibilidad, superposición y lectura de notificaciones | Corta la capacidad operativa de la app antes de tocarla |
| Revocar el administrador de dispositivo | **Obligatorio antes de desinstalar**: mientras esté activo, la desinstalación falla |
| Desinstalar la app, conservando la muestra | Guardar el APK antes de borrar |
| Revisar sesiones y dispositivos de la cuenta de Google | Expulsar los no reconocidos; revisar reenvíos y reglas de correo, que sobreviven al cambio de terminal |
| Revisar las apps con acceso concedido a la cuenta | Persistencia que no vive en el dispositivo |
| Actualizar el sistema | Ahora sí, ya recolectada la evidencia |
| Endurecer según perfil | Tabla de endurecimiento en [android.md](android.md#endurecimiento-por-perfil) |
| Reinstalar el firmware oficial, o sustituir el terminal | Si hay indicio de compromiso a nivel de sistema, si el arranque está desbloqueado, o si el dispositivo está fuera de soporte |

Dos avisos. **Restablecer de fábrica y restaurar después desde la copia reintroduce las mismas apps**: si se restablece, se configura como nuevo. Y **un dispositivo fuera de soporte no se recupera**, se sustituye: no habrá parche para la vía de entrada.

## Escalado

Derivar a un laboratorio con experiencia en spyware mercenario —Security Lab de Amnistía Internacional, línea de ayuda de Access Now, Citizen Lab— cuando el perfil de riesgo lo justifique o haya convergencia real de artefactos.

Si hay fraude financiero, la vía es la denuncia y el procedimiento del banco, con la evidencia preservada. Documentar la cadena de custodia si el caso puede acabar en sede judicial: ver [../../security/forensics/forensics.md](../../security/forensics/forensics.md).
