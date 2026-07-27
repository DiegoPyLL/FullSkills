---
id: code/code
tipo: modelo
estabilidad: permanente
---

# Código y mantenibilidad

La forma del código que hace posible razonar sobre el resto de las ramas de esta skill: si los errores no se propagan con contexto o el dominio no está aislado del framework, ni la fiabilidad de [reliability/reliability.md](../reliability/reliability.md) ni la testabilidad de [testing/testing.md](../testing/testing.md) se sostienen.

## Errores

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Tratar los errores como valor o como excepción, pero de forma coherente en todo el código base | Mezclar ambos estilos obliga a cada punto de llamada a adivinar cuál se está usando | Unas partes del código devuelven un valor de error y otras lanzan excepciones para el mismo tipo de fallo | El mecanismo de manejo de errores es predecible y coherente en todo el código base |
| Nunca capturar y tragar un error sin tratarlo | Un error tragado desaparece hasta que su efecto se manifiesta muy lejos de la causa | Un bloque captura una excepción y no hace nada, dejando que el flujo continúe como si no hubiera pasado nada | Ningún error capturado desaparece sin registrarse, propagarse o gestionarse explícitamente |
| Nunca capturar genérico sin volver a lanzar | Capturar cualquier tipo de error sin distinción esconde fallos que no se sabían manejar | Se captura la clase de excepción más genérica del lenguaje "por seguridad" | Solo se capturan los tipos de error que el código sabe tratar; el resto se propaga |
| Añadir contexto al propagar un error, sin perder la causa original | Sin contexto, un error propagado varias capas arriba es difícil de rastrear hasta su origen | El error se relanza con un mensaje genérico que no menciona qué operación estaba en curso | El error final observado incluye tanto la causa original como el contexto de dónde ocurrió |
| Distinguir el error esperado del dominio (una regla de negocio que no se cumple) del fallo del programa (un error de programación) | Se gestionan de forma distinta: uno es una respuesta prevista, el otro exige investigación y corrección | Una violación de regla de negocio se trata igual que un fallo inesperado del programa | Un error de dominio produce una respuesta controlada; un fallo del programa se registra como incidente a investigar |

## Tipos y fronteras

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Validar una vez en el borde y modelar el dato ya validado con un tipo propio | Validar en cada capa por la que pasa el dato es redundante y a veces inconsistente entre capas | El mismo dato se vuelve a validar en cada capa que lo recibe, con reglas que pueden divergir | El dato validado en el borde se representa con un tipo que garantiza que ya cumple la regla, sin revalidar |
| Si el tipo puede representar el estado inválido, no hay que comprobarlo cada vez | Un tipo que hace imposible el estado inválido elimina la necesidad de comprobarlo en cada uso | El código comprueba en múltiples lugares una condición que el tipo del dato debería garantizar de por sí | El estado inválido no es representable por el tipo, así que ningún punto de uso necesita comprobarlo |

## Núcleo puro, efectos en el borde

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Mantener el núcleo de lógica de negocio libre de efectos secundarios directos | Es lo que hace un sistema testeable sin levantar infraestructura ([testing/testing.md](../testing/testing.md), [architecture/architecture.md](../architecture/architecture.md)) | La lógica de negocio llama directamente a la base de datos o a servicios externos en medio de su cálculo | La lógica de negocio se puede ejecutar y probar sin ninguna infraestructura externa disponible |

## Dependencias

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Dependencias explícitas e inyectadas, no construidas implícitamente dentro del código que las usa | Cada dependencia añadida es superficie que hay que mantener y actualizar; ocultarla dificulta saber qué tiene realmente un componente | Un componente crea sus propias dependencias internamente, sin que se puedan sustituir desde fuera | Las dependencias de un componente son visibles en su punto de construcción y se pueden sustituir para pruebas |

## Legibilidad

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Nombres que dicen la intención; una función hace una sola cosa | El código se lee muchas más veces de las que se escribe, y el coste de leerlo mal se paga cada vez | Los nombres son genéricos o la función mezcla varias responsabilidades no relacionadas | Alguien que no escribió la función puede predecir qué hace solo por su nombre y su firma |

## Deuda explícita

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Anotar la deuda técnica con dueño y motivo en el momento de asumirla | La deuda descubierta después cuesta el triple que la declarada a tiempo | El atajo se toma sin dejar constancia de que es un atajo ni por qué se tomó | Toda deuda técnica conocida está anotada con su motivo y una persona o equipo responsable de revisarla |

## Errores frecuentes

| Error | Corrección |
|---|---|
| Capturar una excepción genérica y continuar sin registrar nada | Registrar el contexto y relanzar, o gestionar explícitamente solo los tipos conocidos |
| Validar el mismo dato en cada capa por la que pasa | Validar una vez en el borde y modelar el resultado con un tipo que ya lo garantiza |
| Lógica de negocio que llama directamente a infraestructura externa | Aislar el núcleo de negocio de los efectos secundarios, moviéndolos al borde |
| Construir dependencias dentro del componente que las usa | Inyectarlas explícitamente desde el punto de construcción |
| Tomar un atajo técnico sin anotarlo | Registrar la deuda con motivo y dueño en el momento de asumirla |
