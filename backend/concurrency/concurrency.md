---
id: concurrency/concurrency
tipo: modelo
estabilidad: permanente
---

# Concurrencia y trabajo diferido

Carreras, colas, semántica de entrega y consistencia entre servicios. La idempotencia que hace segura la repetición se define en [api/api.md](../api/api.md); aquí se asume y se explica cómo se apoya sobre ella el resto del diseño asíncrono.

## Modelo de concurrencia del runtime

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Conocer qué modelo de concurrencia usa el runtime (hilos, bucle de eventos, corrutinas) y qué se bloquea en cada uno | El mismo código que es correcto en un modelo tumba el servicio entero en otro | Se hace una llamada síncrona bloqueante dentro de un runtime de bucle de eventos de un solo hilo | Ninguna llamada bloqueante ocupa el hilo o el bucle que atiende otras peticiones concurrentes |
| Límite de concurrencia explícito hacia cada dependencia externa | Sin límite, una dependencia lenta permite que el número de llamadas en vuelo crezca sin control | El número de llamadas simultáneas a una dependencia no tiene tope | El número de llamadas en vuelo hacia cada dependencia está acotado y es observable |

## Carreras

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Identificar la sección crítica y su dueño único | Sin un dueño claro, dos rutas de código pueden modificar el mismo estado a la vez | Dos procesos escriben la misma estructura en memoria sin coordinación | Solo un flujo de ejecución puede modificar el estado compartido en un instante dado |
| Nunca comprobar-y-luego-actuar sin atomicidad | Entre la comprobación y la acción, otro proceso puede haber cambiado el estado | Se comprueba que un recurso no existe y luego se crea, en dos pasos separados | La comprobación y la acción ocurren como una sola operación atómica, o la acción falla si el estado cambió |
| Desconfiar del "funciona en mi máquina": puede significar solo "funciona con un proceso" | Las pruebas de desarrollo rara vez ejercitan concurrencia real | El código nunca se prueba bajo llamadas concurrentes reales antes de producción | Existe una prueba que ejercita concurrencia real sobre el mismo estado ([testing/testing.md](../testing/testing.md)) |

## Sacar trabajo del camino crítico

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Decidir con el negocio qué puede esperar y qué no | Es una decisión de producto, no una optimización técnica que se pueda tomar sola | Se decide diferir o no un trabajo solo por comodidad de implementación | La decisión de qué es síncrono y qué es diferido está documentada y acordada con el negocio |
| Dar visibilidad a lo diferido: el usuario debe poder saber si ocurrió y si falló | Un trabajo diferido sin visibilidad es indistinguible de un trabajo perdido | El usuario no tiene forma de comprobar el resultado de una acción que se procesó en segundo plano | Existe un estado consultable para todo trabajo diferido, incluido el fallo |
| Agrupar en lote lo que se repite; unificar peticiones idénticas en vuelo | Cada petición individual paga el coste fijo de un viaje de red o de un cómputo repetido | Múltiples peticiones idénticas simultáneas disparan el mismo trabajo por separado | Peticiones idénticas concurrentes comparten el resultado de una sola ejecución en curso |

## Semántica de entrega

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Elegir conscientemente entre como-mucho-una-vez, al-menos-una-vez o "exactamente una vez" | Cada una tiene un coste distinto y ninguna es gratis; "exactamente una vez" no existe de verdad en la red | Se asume "exactamente una vez" sin haber implementado deduplicación | El comportamiento observado bajo fallo de red coincide con la semántica declarada |
| Deduplicar con clave, ventana de retención y registro de lo ya procesado | Es el mecanismo real detrás de cualquier "exactamente una vez" percibido | El consumidor procesa el mismo mensaje dos veces sin detectarlo | Un mensaje entregado dos veces produce el mismo efecto que entregado una sola vez |

## Colas

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Colas siempre acotadas | Una cola sin límite convierte un pico de latencia en una caída por agotamiento de memoria | La cola acepta encolar sin ningún límite de tamaño | Al superar el límite, la cola rechaza o aplica contrapresión en vez de crecer sin fin |
| Contrapresión: rechazar rápido antes que aceptar y morir | Aceptar más de lo que se puede procesar solo retrasa el fallo y lo hace más grande | El productor sigue encolando aunque el consumidor no da abasto | Bajo sobrecarga sostenida, el sistema rechaza con un error claro en vez de degradarse sin control |
| Cola de mensajes fallidos, con dueño que la vigila y procedimiento de reproceso | Sin ella, un mensaje que falla repetidamente bloquea a los que le siguen | Los mensajes fallidos se pierden o bloquean la cola principal indefinidamente | Los mensajes fallidos aparecen en un destino separado, visible y con un procedimiento definido |
| Límite de intentos para el mensaje envenenado que falla siempre | Sin límite, un solo mensaje malformado puede consumir reintentos indefinidamente y bloquear al resto | Un mensaje que siempre falla se reintenta sin límite, bloqueando la cola | Tras el número máximo de intentos, el mensaje se mueve a la cola de fallidos y deja de bloquear |
| Tiempo de visibilidad mayor que el tiempo real de procesamiento | Si el tiempo de visibilidad expira antes de terminar, otro consumidor toma el mismo mensaje y lo duplica | El tiempo de visibilidad se configura sin medir cuánto tarda realmente el procesamiento | Ningún procesamiento normal expira su tiempo de visibilidad antes de completarse |
| Prefetch acotado por consumidor | Un consumidor lento con prefetch alto acapara trabajo que otros consumidores libres podrían hacer | Un solo consumidor reserva un lote grande de mensajes y los procesa uno a uno lentamente | El trabajo pendiente se reparte entre los consumidores disponibles, no se acumula en uno solo |

## Orden

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Exigir orden solo donde de verdad importa, casi siempre por entidad, no globalmente | El orden global exige un único consumidor y elimina el escalado horizontal | Se exige orden global "por si acaso" sin que el negocio lo requiera | El requisito de orden está limitado exactamente al ámbito (por entidad, por clave) que el negocio necesita |
| Partición por clave como forma barata de orden local | Permite escalar con varios consumidores manteniendo el orden dentro de cada clave | Los mensajes de una misma entidad se reparten entre consumidores sin partición por clave | Los eventos de una misma entidad siempre los procesa el mismo consumidor, en orden |

## Tareas periódicas

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Garantizar un solo ejecutor por tarea periódica | Sin coordinación, cada instancia desplegada dispara su propia copia de la misma tarea | Una tarea programada se ejecuta en cada instancia de la aplicación de forma independiente | Con N instancias desplegadas, la tarea se ejecuta exactamente una vez por ciclo |
| Decidir explícitamente qué hacer ante solapamiento (bloquear o saltar) y ante ejecución perdida (recuperar o ignorar) | Sin decisión, el comportamiento por defecto suele ser el peor de los dos casos | Nadie ha decidido qué pasa si la tarea sigue corriendo cuando toca la siguiente ejecución | El comportamiento ante solapamiento y ante ejecución perdida está documentado y probado |
| Elección de líder o bloqueo consultivo con caducidad para coordinar el ejecutor único | Sin caducidad, un ejecutor caído deja la tarea sin ejecutarse indefinidamente | El bloqueo que designa al ejecutor no tiene tiempo de vida | Si el ejecutor actual falla, otro toma el relevo tras la caducidad, sin intervención manual |

## Coordinación distribuida y consistencia entre servicios

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Evitar el cerrojo distribuido salvo que sea la única opción real | Casi siempre hay una alternativa (partición, idempotencia) más simple y con menos modos de fallo | Se introduce un cerrojo distribuido para un problema que la partición por clave ya resolvía | El cerrojo distribuido, si existe, protege algo que de verdad no se puede resolver sin coordinación exclusiva |
| Si es inevitable: caducidad obligatoria, renovación y token de vallado | Sin caducidad, un dueño que se congela bloquea el recurso para siempre; sin vallado, puede revivir y actuar igualmente | El cerrojo no caduca o no invalida a un dueño anterior que revive tarde | Un dueño que se congela y revive tarde no puede actuar como si siguiera siendo el dueño legítimo |
| Bandeja de salida transaccional para que el dato y el evento se escriban en la misma transacción | Escribir el dato y publicar el evento por separado deja una ventana donde pueden discrepar | El evento se publica después de confirmar la transacción, en un paso separado que puede fallar | Si el proceso muere tras confirmar la transacción, el evento se publica igualmente, sin perderse |
| Saga con compensación quien necesite una operación de negocio que cruza varios servicios sin transacción global | El compromiso en dos fases casi nunca compensa: bloquea recursos y no escala bien entre servicios independientes | Se intenta simular una transacción global mediante bloqueo distribuido entre servicios | Cada paso de la saga tiene definido su paso de compensación y se ejecuta si un paso posterior falla |

## Regla de diseño ante un fallo parcial

Ante cada paso con efecto secundario dentro de un flujo asíncrono, responder por escrito: *si el proceso muere justo después de este paso y antes del siguiente, ¿qué ve el resto del sistema, y cómo se reconcilia?* Si no hay respuesta, el diseño no está terminado — es la aplicación directa del modelo b de [../SKILL.md](../SKILL.md): el caso que siempre se olvida es que la operación funcionó pero nadie se enteró.
