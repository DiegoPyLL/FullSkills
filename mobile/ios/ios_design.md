---
id: ios/ios_design
tipo: modelo
estabilidad: permanente
---

# Diseño de interfaz en iOS

Criterio de diseño para app nativa de iOS. Las restricciones de plataforma que condicionan qué se puede construir están en [ios_platform.md](ios_platform.md); lo transversal a ambas plataformas —red, rendimiento, entrega— en [../practices/practices.md](../practices/practices.md).

## Premisa

Una app móvil se usa **de pie, con una mano, con interrupciones y con poca atención**. Ese contexto, no la estética, es lo que decide el diseño: si una tarea exige concentración sostenida y precisión, el móvil es el soporte equivocado o la tarea está mal descompuesta.

De ahí la regla que más decisiones resuelve: el móvil no es una pantalla pequeña de escritorio. No se reduce una interfaz de escritorio, se **rediseña el recorrido** eligiendo qué cabe.

## Por qué no se copia el diseño de Android

iOS y Android han convergido en capacidades y divergen en convenciones. Portar una interfaz sin adaptarla produce apps que se sienten defectuosas sin que el usuario sepa decir por qué: los reflejos aprendidos dejan de funcionar.

| Aspecto | Convención de iOS | Qué pasa si se trae la de Android |
|---|---|---|
| Volver | Deslizar desde el borde izquierdo, más botón de retroceso en la barra de navegación | Sin el gesto de borde se rompe el reflejo más automático que tiene el usuario de iOS |
| Navegación principal | Barra de pestañas inferior | El panel lateral esconde la navegación: lo que está dentro se usa mucho menos |
| Acción principal | En la barra de navegación, o dentro del contenido | El botón de acción flotante delata una app portada sin adaptar, y tapa contenido |
| Confirmar algo destructivo | Hoja de acciones desde abajo | Menor. Lo grave es no confirmar, no el envoltorio |
| Tipografía | Tipo dinámico del sistema | Tamaños fijos rompen la accesibilidad en ambas plataformas |

Regla práctica: **la navegación y los gestos se respetan siempre; la identidad de marca vive en el contenido**, no en reinventar los controles del sistema.

## Patrones de navegación

| Patrón | Cuándo | Cuándo no | Coste |
|---|---|---|---|
| Pestañas | De tres a cinco secciones estables, de nivel similar, entre las que se alterna | Secciones jerárquicas, o más de cinco | Ocupa espacio permanente en pantalla |
| Pila | Recorrido jerárquico: lista → detalle → subdetalle | Como sustituto de pestañas | Se pierde el contexto si la pila crece |
| Modal | Tarea con principio y fin que hay que terminar o cancelar | Para navegar; para contenido que se consulta | Corta el hilo; anidar modales desorienta |
| Panel lateral | Muchos destinos secundarios de acceso poco frecuente | Como navegación principal | Oculta: lo que está dentro se usa mucho menos |
| Hoja parcial | Detalle o acción sin perder de vista el contexto | Formularios largos o flujos de varios pasos | Espacio vertical limitado |

Los dos errores frecuentes: pestañas para contenido jerárquico —que obliga a duplicar navegación— y modales para consultar, que deja al usuario buscando cómo salir.

## Interacción táctil

| Regla | Criterio | Por qué |
|---|---|---|
| Área táctil mínima | En torno a 44 puntos de lado, independientemente del tamaño del icono | El dedo no tiene la precisión del cursor |
| Separación entre destinos | Suficiente para no acertar el vecino | Los toques erróneos se leen como fallo de la app |
| Zona de alcance | Lo frecuente y lo destructivo, lejos entre sí; lo frecuente, abajo | La parte superior de una pantalla grande no se alcanza con una mano |
| Gesto con alternativa visible | Todo gesto tiene un control equivalente | Un gesto no se descubre solo, y sin alternativa la función no existe para quien no lo conoce |
| Respuesta inmediata | Toda pulsación confirma al instante, aunque el resultado tarde | Sin respuesta, el usuario vuelve a pulsar |
| Nada destructivo sin salida | Confirmación o deshacer, uno de los dos | La confirmación constante entrena a aceptar sin leer; a menudo deshacer es mejor |

## Estados

Los estados no son excepciones: son parte del diseño y se especifican junto al camino feliz. Una pantalla sin ellos está a medio diseñar.

| Estado | Qué debe hacer | Error habitual |
|---|---|---|
| Vacío por primera vez | Explicar qué aparecerá y ofrecer la acción que lo llena | Mostrar una lista vacía sin más |
| Vacío por filtro o búsqueda | Decir qué se buscó y cómo ampliar | Confundirlo con el vacío inicial |
| Cargando | Estructura provisional del contenido si se espera que llegue; indicador si no se sabe | Girador a pantalla completa que oculta lo ya disponible |
| Error recuperable | Qué pasó, qué hacer, y reintentar sin perder lo escrito | «Algo salió mal» |
| Sin conexión | Mostrar lo que hay en local y marcar lo pendiente | Bloquear la app entera |
| Parcial | Mostrar lo que llegó y señalar lo que falta | Tratar todo o nada |
| Permiso denegado | Seguir funcionando con lo que se pueda, y explicar qué se pierde | Insistir, o romperse |

La última fila conecta con [ios_platform.md](ios_platform.md): en iOS el permiso se pide **una vez y con peso real**. Diseñar asumiendo el permiso concedido es diseñar para la mitad de los usuarios.

## Accesibilidad

No es una capa que se añade al final: condiciona el diseño desde el primer boceto.

| Requisito | Criterio | Cómo se verifica |
|---|---|---|
| Tipo dinámico | El texto crece hasta los tamaños grandes de accesibilidad sin recortarse ni solaparse | Probar con el tamaño máximo, no con el que viene por defecto |
| Contraste | Suficiente para texto y para elementos de interfaz | Herramienta de contraste, no criterio visual |
| Lector de pantalla | Todo control tiene etiqueta con significado; el orden de recorrido es el lógico | Recorrer la pantalla con el lector activado |
| El color nunca solo | Estado, error y selección se señalan también por forma o texto | Ver la pantalla en escala de grises |
| Movimiento reducido | Respetar la preferencia del sistema | Activarla y comprobar que nada esencial desaparece |
| Objetivos táctiles | Los mínimos de la sección anterior | Cumple accesibilidad y usabilidad a la vez |

Prueba barata que detecta la mayoría de fallos: **usar la app con el texto al máximo, en escala de grises y con el lector de pantalla activado.** Lo que sobreviva a eso está razonablemente bien.

## Adaptación

- Diseñar por **rango**, no por dispositivo: la lista de tamaños de pantalla caduca y la app dura más que el modelo del año.
- Respetar las áreas seguras — muesca, isla dinámica, indicador inferior, esquinas redondeadas. Lo que se ancla al borde físico acaba tapado.
- Contemplar orientación, ventanas divididas y tamaños de iPad antes de que el diseño esté cerrado: readaptar después cuesta más que preverlo.
- El teclado tapa entre un tercio y la mitad de la pantalla. Un formulario diseñado sin el teclado a la vista está diseñado sin la mitad de su contexto.
