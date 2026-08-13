---
id: android/android_design
tipo: modelo
estabilidad: permanente
---

# Diseño de interfaz en Android

Criterio de diseño para app nativa de Android. Las restricciones de plataforma que condicionan qué se puede construir están en [android_platform.md](android_platform.md); lo transversal a ambas plataformas —red, rendimiento, entrega— en [../practices/practices.md](../practices/practices.md).

El contexto de uso móvil —de pie, con una mano, con interrupciones— y el catálogo de **estados de pantalla** son comunes a las dos plataformas y no se repiten aquí: están en [../ios/ios_design.md](../ios/ios_design.md#estados). Este módulo cubre lo que es propio de Android.

## Premisa

En iOS el diseñador conoce el dispositivo. En Android **no**, y esa es la premisa que ordena todo lo demás: la diversidad de pantallas, densidades, versiones, capas de fabricante y tamaños de fuente no es un caso extremo que se atiende al final, es el requisito desde el primer boceto.

De ahí la regla que más decisiones resuelve: **se diseña por rangos y por reglas, no por maquetas**. Una maqueta a un tamaño concreto no es una especificación en Android; es un ejemplo. Lo que hay que definir es cómo se comporta el contenido cuando cambia el ancho, la densidad, el tamaño del texto y la orientación — porque las cuatro cosas van a cambiar.

Corolario incómodo: si un diseño solo se ha visto en un dispositivo, no se ha visto.

## Por qué no se copia el diseño de iOS

Las dos plataformas han convergido en capacidades y divergen en convenciones. Portar sin adaptar produce apps que se sienten defectuosas sin que el usuario sepa decir por qué.

| Aspecto | Convención de Android | Qué pasa si se trae la de iOS |
|---|---|---|
| Volver | **Retroceso del sistema**, por gesto desde cualquiera de los dos bordes o por botón | Es lo más grave que se puede ignorar: no es un control de la app, es un contrato del sistema. Una app que no lo respeta se siente rota |
| Subir de nivel | *Up* dentro de la jerarquía, distinto del retroceso cronológico | Confundir ambos deja al usuario en un sitio que no esperaba |
| Navegación principal | Barra inferior de navegación, panel lateral o raíl según el ancho | Copiar las pestañas de iOS sin contemplar el panel deja fuera los anchos grandes |
| Acción principal | Botón de acción flotante | En Android **sí** es la convención nativa; evitarlo por parecer «de Android» es corregir en la dirección equivocada |
| Área táctil mínima | En torno a 48 dp | Usar los 44 pt de iOS deja objetivos por debajo del mínimo de la plataforma |
| Unidades | Densidad independiente (`dp`) y escalables para texto (`sp`) | Píxeles fijos rompen en cuanto cambia la densidad, que es siempre |
| Color y tema | Tema claro y oscuro, y color dinámico derivado del fondo de pantalla | Una paleta rígida convive mal con el color dinámico del sistema |

Regla práctica, la misma que en iOS: **la navegación y los gestos se respetan siempre; la identidad de marca vive en el contenido**, no en reinventar los controles del sistema.

## El retroceso es un contrato, no un botón

Es la diferencia estructural con iOS y la fuente de la mayoría de los defectos de navegación en apps portadas.

| Regla | Detalle |
|---|---|
| El retroceso siempre hace algo predecible | Cerrar el diálogo, deshacer el último paso de navegación, o salir. Nunca ignorarlo |
| *Back* y *Up* no son lo mismo | *Back* deshace el orden cronológico de lo que el usuario hizo; *Up* sube en la jerarquía de contenido. Coinciden a menudo, y por eso el caso en que no coinciden se descuida |
| Entrar por un enlace profundo altera la pila | Quien llega directo a un detalle no tiene historial. Hay que **sintetizar** la pila hacia arriba, o el retroceso lo saca de la app |
| Un formulario a medias no se descarta en silencio | Confirmar la pérdida, o guardar el borrador |
| Las versiones recientes anticipan el retroceso | El sistema puede previsualizar el destino antes de completar el gesto, lo que exige declarar el comportamiento en lugar de interceptarlo a mano |

El error más caro: interceptar el retroceso para hacer algo distinto de volver. Rompe el único gesto que el usuario de Android ejecuta sin pensar.

## Patrones de navegación

| Patrón | Cuándo | Cuándo no | Coste |
|---|---|---|---|
| Barra inferior de navegación | De tres a cinco secciones estables del mismo nivel | Jerarquía, o más de cinco destinos | Ocupa espacio permanente; en pantallas anchas desaprovecha el ancho |
| Raíl de navegación | Anchos medios y grandes: tabletas, plegable abierto, ventana dividida | Teléfono en vertical | Obliga a diseñar dos disposiciones |
| Panel lateral | Muchos destinos secundarios de acceso poco frecuente | Como navegación principal de una app con pocas secciones | Oculta: lo que está dentro se usa mucho menos |
| Pila jerárquica | Recorrido lista → detalle → subdetalle | Como sustituto de la navegación principal | Se pierde contexto si crece; obliga a cuidar la pila en enlaces profundos |
| Diálogo | Decisión corta que bloquea el avance | Contenido que se consulta, o formularios | Interrumpe; el retroceso debe cerrarlo |
| Hoja inferior | Acción o detalle sin perder el contexto | Flujos de varios pasos | Espacio vertical limitado; compite con el teclado |

Los dos errores frecuentes son los mismos que en iOS —navegación principal para contenido jerárquico, y diálogos para consultar— más uno propio: **mantener la barra inferior como única navegación en pantallas anchas**, que desperdicia el ancho y delata que solo se diseñó para teléfono.

## Interacción táctil

| Regla | Criterio | Por qué |
|---|---|---|
| Área táctil mínima | En torno a **48 dp** de lado, con independencia del tamaño del icono | Es el mínimo de la plataforma; el dedo no tiene la precisión del cursor |
| Unidades escalables para el texto | `sp` para texto, `dp` para todo lo demás | El texto debe crecer con la preferencia del usuario; los espaciados no |
| Separación entre destinos | Suficiente para no acertar el vecino | Los toques erróneos se leen como fallo de la app |
| Zona de alcance | Lo frecuente abajo; lo destructivo, lejos de lo frecuente | La parte superior de una pantalla grande no se alcanza con una mano |
| Todo gesto con alternativa visible | Un control equivalente para cada gesto | Un gesto no se descubre solo |
| Respuesta inmediata | Toda pulsación confirma al instante, aunque el resultado tarde | Sin respuesta, el usuario vuelve a pulsar |
| Nada destructivo sin salida | Confirmar, o deshacer | La confirmación constante entrena a aceptar sin leer; deshacer suele ser mejor |

## Cambios de configuración: el estado se pierde

Propio de Android y sin equivalente directo en iOS. Rotar la pantalla, cambiar el idioma, el tamaño de fuente, el tema o desplegar un plegable puede **recrear la pantalla desde cero**. Y por debajo, el sistema puede eliminar el proceso en segundo plano en cualquier momento.

| Situación | Qué debe sobrevivir | Error habitual |
|---|---|---|
| Rotación o cambio de tamaño | Texto escrito, posición de desplazamiento, selección, paso del formulario | Guardar el estado en memoria del proceso y darlo por seguro |
| Vuelta tras estar en segundo plano | El estado de la pantalla y el contenido ya cargado | Recargar todo desde la red y perder lo que el usuario había hecho |
| Proceso eliminado por el sistema | Lo suficiente para reconstruir la pantalla donde estaba | Asumir que la app siempre vuelve viva |
| Cambio de tema o de tamaño de fuente | Todo, sin parpadeos ni recortes | Probar solo con los valores por defecto |

Regla: **el estado de la interfaz se guarda y se restaura de forma explícita**, y se prueba rotando y provocando la eliminación del proceso, no solo navegando.

## Accesibilidad

Los criterios sustantivos son comunes a las dos plataformas y están en [../ios/ios_design.md](../ios/ios_design.md#accesibilidad). Lo propio de Android:

| Requisito | Criterio | Cómo se verifica |
|---|---|---|
| Escalado de texto | El texto crece con la preferencia del sistema sin recortarse ni solaparse | Probar con la escala máxima, y también con el ajuste de tamaño de pantalla |
| Lector de pantalla | Todo control tiene descripción con significado; el orden de recorrido es el lógico; lo decorativo se marca como tal | Recorrer la pantalla con el lector activado, sin mirar |
| Agrupación semántica | Los elementos relacionados se anuncian juntos, no uno a uno | El lector no debe leer una tarjeta como seis fragmentos sueltos |
| Objetivos táctiles | Los 48 dp de la sección anterior | Cumple accesibilidad y usabilidad a la vez |
| Contraste y color | Suficiente contraste, y el color nunca como único indicador | Escala de grises y herramienta de contraste |

Prueba barata que detecta la mayoría de fallos: **texto al máximo, escala de grises y lector de pantalla activado**. Lo que sobreviva está razonablemente bien.

## Adaptación a la diversidad real

- **Diseñar por clases de ancho**, no por dispositivos: teléfono, tableta o plegable abierto, y escritorio. La lista de modelos caduca; los rangos no.
- **Los plegables cambian de tamaño en caliente**, y con ellos la disposición y el estado. Es el caso que mejor detecta si el diseño respeta la sección anterior.
- **Ventana dividida y multiventana**: la app puede no tener la pantalla entera. Anclar al alto completo produce recortes.
- **Dibujado de borde a borde**: las versiones recientes lo imponen a las apps que apuntan a niveles de API actuales. Lo que se ancle al borde físico sin respetar los márgenes del sistema acaba bajo la barra de estado o el indicador de navegación. Conecta con la puerta de `targetSdkVersion` de [android_platform.md](android_platform.md#el-nivel-de-api-objetivo-la-puerta-que-caduca): subir el objetivo puede cambiar la disposición sin tocar el diseño.
- **El teclado tapa entre un tercio y la mitad de la pantalla.** Un formulario diseñado sin el teclado a la vista está diseñado sin la mitad de su contexto.
- **Los permisos se revocan en cualquier momento**, y el sistema los restablece en apps sin uso prolongado. La pantalla debe funcionar sin el permiso y explicar qué se pierde, no romperse ni insistir. Ver [android_platform.md](android_platform.md#permisos-y-privacidad).
