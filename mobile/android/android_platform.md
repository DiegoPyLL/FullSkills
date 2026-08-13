---
id: android/android_platform
tipo: referencia
estabilidad: volatil
snapshot: 2026-08
consulta_externa: https://support.google.com/googleplay/android-developer
---

# Restricciones de plataforma en Android

**Snapshot de agosto de 2026.** Las políticas de Google Play, los requisitos de nivel de API y las reglas de permisos cambian por decisión de Google y con calendario propio. Verificar en la [ayuda de Play Console](https://support.google.com/googleplay/android-developer) antes de comprometer una decisión de producto.

El equivalente de iOS está en [../ios/ios_platform.md](../ios/ios_platform.md). La seguridad del dispositivo, en [android.md](android.md).

## Premisa

Google Play se parece menos a la App Store de lo que sugiere la simetría. La revisión es más rápida y más automatizada, y la distribución fuera de la tienda existe y es legítima. Pero hay dos asimetrías que se pagan caras.

**El techo del castigo es más alto.** En iOS una infracción rechaza una versión. En Play, los usos engañosos o no declarados de datos y permisos pueden acabar en suspensión de la app y **terminación de la cuenta de desarrollador**, con todas sus aplicaciones dentro.

**Hay una puerta que caduca por calendario.** El nivel de API objetivo obliga a mantener la app aunque no se le toque una línea. Una app abandonada en iOS sigue funcionando; en Play se degrada sola.

## El nivel de API objetivo: la puerta que caduca

Es la restricción más específica de Google Play y la que más proyectos pilla por sorpresa, porque **no la dispara un fallo, la dispara el calendario**.

| Desde | Regla |
|---|---|
| 31 de agosto de 2025 | Toda app nueva o actualización debe apuntar al menos a API 35 (Android 15) |
| 31 de agosto de 2026 | Las nuevas y las actualizaciones deben apuntar a Android 16 (API 36). Las existentes deben apuntar al menos a API 35 para seguir siendo **visibles a usuarios nuevos** en dispositivos más recientes que su objetivo |
| Hasta el 1 de noviembre de 2026 | Se puede solicitar prórroga |

Este snapshot se escribe **días antes** de la fecha de agosto de 2026: conviene comprobar el estado vigente antes de planificar sobre él.

La degradación es progresiva, no un apagado: primero la app deja de admitir actualizaciones, después deja de alcanzar usuarios nuevos en dispositivos modernos, y los existentes se quedan con la última versión que pudieron instalar.

Efecto secundario que importa, y que se olvida al tratarlo como trámite: **subir `targetSdkVersion` activa endurecimientos que antes no aplicaban** — almacenamiento con ámbito, restricciones de segundo plano, tipos obligatorios de servicio en primer plano. Actualizar el objetivo no es cambiar un número, es aceptar un contrato nuevo. Ver la [arquitectura de mitigación](android.md#arquitectura-de-mitigación).

## Revisión de Google Play

Se citan **familias** de rechazo, no frases literales del reglamento: la redacción cambia y el criterio de aplicación combina automatismo y revisión humana.

| Familia | Qué la dispara | Salida |
|---|---|---|
| Permisos de alto riesgo sin declarar | Usar permisos sensibles sin el formulario de declaración de permisos | Rellenar el formulario en Play Console, o eliminar el permiso. No presentarlo puede acabar en retirada de la app |
| Visibilidad amplia de apps instaladas | Declarar `QUERY_ALL_PACKAGES` sin que la funcionalidad central lo exija | Solo se admite si la funcionalidad principal visible para el usuario la requiere; en caso contrario, consultas acotadas a paquetes concretos |
| Ubicación en segundo plano | Pedirla sin justificación de peso | Explicar por qué **una** función concreta no puede implementarse sin ella. Enumerar varias funciones para justificarla provoca rechazo |
| Sección de seguridad de los datos | Declarar menos de lo que la app recoge o comparte | Es una declaración vinculante: la discrepancia puede costar la cuenta, no solo la versión |
| Servicios en primer plano sin declarar | Usar uno sin declarar su tipo | Declararlo en el manifiesto **y** en Play Console, con descripción de la funcionalidad y un vídeo que la demuestre |

La familia de seguridad de los datos merece énfasis: no es un formulario administrativo, es la declaración con la que se compara el comportamiento real de la app.

## Permisos y privacidad

| Regla | Consecuencia de diseño |
|---|---|
| Los permisos se conceden en tiempo de ejecución | La app debe funcionar **sin** el permiso, no fallar. Pedirlo en contexto, cuando el usuario entiende para qué |
| El usuario puede revocarlos en cualquier momento | No hay estado permanente: se comprueba antes de cada uso, no una vez al arrancar |
| El sistema restablece permisos de apps sin uso prolongado | Una app estacional puede perder permisos entre usos; hay que recuperarse de eso sin romperse |
| Los permisos de alto riesgo exigen declaración | El coste de un permiso no es técnico, es de revisión y de plazo. Entra en la planificación |
| La declaración de datos debe coincidir con la realidad | Cualquier SDK de terceros que recoja datos cuenta como recogida propia. Inventario de SDK obligatorio |

La regla que resume el bloque: **cada permiso sensible tiene un coste de publicación**, y ese coste hay que pagarlo en cada revisión, no solo la primera vez.

## Ejecución en segundo plano

Android restringe el trabajo en segundo plano de forma creciente, y esta es la parte de la plataforma donde la teoría y la práctica más se separan.

| Restricción | Detalle |
|---|---|
| Tipos de servicio en primer plano | Desde Android 14 (API 34) todo servicio en primer plano **debe declarar su tipo** en el manifiesto y usar el permiso correspondiente a ese tipo |
| Tipos introducidos en Android 14 | `health`, `remoteMessaging`, `shortService`, `specialUse` y `systemExempted` |
| Declaración adicional en la tienda | Cada tipo declarado exige justificación y vídeo demostrativo en Play Console |
| Optimizaciones de batería del fabricante | **Más agresivas que AOSP, distintas entre fabricantes y sin documentación uniforme** |

La última fila es la causa real de la mayoría de los informes de «funciona en mi dispositivo y en ese no». El comportamiento de segundo plano no lo define Android, lo define la capa del fabricante, y no hay contrato que lo garantice. Cualquier función que dependa de ejecutarse en segundo plano necesita un plan para cuando **no** se ejecute: reconciliación al volver a primer plano, no confianza en el temporizador.

## Ciclo de versiones y compatibilidad

| Concepto | Qué decide |
|---|---|
| `versionCode` | Entero estrictamente creciente. Es la identidad de la versión para la tienda; no se puede reutilizar ni bajar |
| `versionName` | Cadena para humanos. No tiene efecto técnico |
| `minSdkVersion` | Qué parque de dispositivos se alcanza |
| `targetSdkVersion` | A qué reglas de comportamiento se somete la app |

`minSdkVersion` y `targetSdkVersion` se confunden a menudo y no tienen nada que ver: uno abre mercado, el otro acepta obligaciones. Subir el mínimo reduce alcance; subir el objetivo es obligatorio por calendario.

Y la consecuencia que gobierna el diseño del servidor: **los usuarios no actualizan**. Hay que sostener versiones antiguas durante años, no una versión atrás. Ver [../practices/practices.md](../practices/practices.md).

## Publicación por fases y reversión

| Mecanismo | Qué hace | Qué **no** hace |
|---|---|---|
| Despliegue por fases | Entrega la actualización a un porcentaje de usuarios, que se sube por pasos | No permite elegir a quién |
| Detener el despliegue | Deja de entregarse a usuarios nuevos | **No la retira de quien ya la instaló** |
| Publicar una versión posterior | Corrige, con `versionCode` mayor | Tarda en propagarse: depende de cuándo actualice cada usuario |

**No existe la reversión.** Una versión instalada no se le puede quitar a nadie. Detener el despliegue limita el daño futuro, no el ya causado.

De ahí la regla operativa: **lo que no se puede apagar sin publicar, no debería publicarse**. Un interruptor remoto de funcionalidad es la única reversión inmediata que existe en móvil, y hay que tenerlo *antes* del incidente.

## Distribución fuera de Google Play

Existe y es legítima: instalación directa, tiendas alternativas, distribución corporativa. Con dos consecuencias que conviene separar.

**Para quien publica:** fuera de Play no hay revisión, ni declaración de datos, ni ficha, ni las herramientas de despliegue por fases. La responsabilidad de la distribución y de la actualización pasa a ser propia.

**Para quien se defiende:** convencer al usuario de instalar fuera de la tienda es el **vector de mayor volumen** de la plataforma. Que la distribución alternativa sea legítima no la hace segura para el usuario medio: es exactamente el camino que recorre el fraude. Ver el [camino de consentimiento](android.md#anatomía-de-una-cadena).

Las dos afirmaciones conviven sin contradicción, y conviene decir las dos.

## Superficie que expone la app

Lo que la plataforma permite que una app ofrezca a otras — y por tanto lo que hay que cerrar. Es específico de Android: iOS no tiene equivalente de este modelo de componentes.

| Riesgo | Control |
|---|---|
| Componentes exportados: Activities, Services, Broadcast Receivers y Content Providers | `exported=false` salvo necesidad real; permisos propios de nivel firma; validar siempre el llamante |
| Redirección de intents | Validar el destino antes de reenviar; no propagar un intent recibido sin comprobarlo |
| WebView insegura | Deshabilitar JavaScript si no se necesita, no exponer interfaces nativas, validar la URL que se carga |
| Tráfico en claro | Configuración de seguridad de red que prohíba texto plano |
| Claves y secretos | Android Keystore con respaldo de hardware; claves no exportables |
| Enlaces profundos sin verificar | App Links verificados; validar origen y parámetros |

Los requisitos de seguridad de la app que **no** son específicos de Android —almacenamiento, criptografía, autenticación, resiliencia, MASVS— están en [../../security/mobile/mobile.md](../../security/mobile/mobile.md).

## Límites

- **Este módulo caduca.** Las políticas y las fechas cambian por decisión de Google; citar la familia y verificar la fuente antes de usarlo en un entregable.
- **El comportamiento de las capas de fabricante no está documentado de forma uniforme** y no se puede afirmar de memoria: se comprueba en el dispositivo concreto.
- **No sustituye a la política de Play.** Se cita por familia; el texto vinculante es el de Google.
- Las reglas de facturación y de contenido quedan fuera: aquí solo lo que condiciona la ingeniería y la seguridad.
