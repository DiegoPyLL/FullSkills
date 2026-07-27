---
id: testing/testing
tipo: modelo
estabilidad: permanente
---

# Pruebas

Qué confianza compra cada nivel de prueba y cómo evitar que la suite mienta. Los escenarios de concurrencia y fallo parcial que hay que probar están definidos en [concurrency/concurrency.md](../concurrency/concurrency.md) y [reliability/reliability.md](../reliability/reliability.md); aquí, cómo probarlos de forma determinista.

## Qué confianza compra cada nivel

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Elegir el nivel (unidad, integración, contrato, extremo a extremo) según el coste de mantenimiento frente a la señal que aporta | Cada nivel tiene un compromiso distinto; usar solo uno deja huecos que otro cubriría mejor | Toda la confianza del sistema descansa en un único nivel de prueba | La pirámide de pruebas incluye varios niveles, cada uno cubriendo lo que el otro no cubre bien |
| No confundir cobertura alta con confianza real | La cobertura mide líneas ejecutadas, no invariantes comprobadas | Se persigue un porcentaje de cobertura sin revisar si las aserciones comprueban algo significativo | Las pruebas de alta cobertura fallan cuando se introduce deliberadamente un error de negocio conocido |

## Determinismo

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Inyectar el reloj en vez de usar el reloj real | Una prueba que depende de la hora del sistema falla de forma intermitente e impredecible | La prueba compara contra la hora actual del sistema en el momento de ejecutarse | La prueba pasa igual sin importar en qué momento real se ejecute |
| Sin red real, sin orden implícito entre pruebas, sin estado compartido entre ellas | Cualquiera de estos hace que el resultado de una prueba dependa de algo fuera de su control | Una prueba depende del resultado o del orden de ejecución de otra prueba | Cada prueba pasa de forma aislada y en cualquier orden de ejecución |
| Semilla fija para todo lo aleatorio en pruebas | Sin semilla fija, un caso límite aleatorio aparece y desaparece sin que se pueda reproducir | Una prueba usa aleatoriedad sin semilla fija y falla de forma esporádica | Un fallo aleatorio en una prueba se puede reproducir de forma determinista con la misma semilla |
| Tratar un test intermitente como peor que ningún test | Un test que a veces falla sin motivo entrena al equipo a ignorar el rojo, incluidos los fallos reales | Un test intermitente conocido se deja en la suite "porque a veces pasa" | Ningún test conocido como intermitente permanece en la suite sin arreglarse o eliminarse |

## Dobles frente a dependencia real

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Reconocer cuándo el simulacro miente: el motor real tiene aislamiento, restricciones y concurrencia que el doble no reproduce | Una prueba que pasa contra un doble puede fallar contra el motor real por una diferencia de comportamiento no simulada | Se prueba una consulta compleja o una restricción de integridad solo contra un doble en memoria | El comportamiento crítico (restricciones, aislamiento, concurrencia) se prueba contra una instancia real, aunque sea efímera |
| Usar una instancia real efímera para todo lo que dependa de su comportamiento específico | Es el equilibrio entre velocidad de la suite y fidelidad de la prueba | Las pruebas de integración levantan y comparten una única instancia de larga duración entre ejecuciones | Cada ejecución de la suite parte de un estado limpio y reproducible de la dependencia real |

## Contratos, datos de prueba e invariantes

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Prueba de contrato entre servicios, para no romper a otro equipo sin desplegar los dos juntos | Permite detectar una ruptura de compatibilidad sin necesidad de un entorno integrado completo | El único momento en que se descubre una incompatibilidad de contrato es en producción | Un cambio de contrato que rompe compatibilidad falla la prueba de contrato antes de desplegarse |
| Datos de prueba construidos de forma explícita y mínima, legibles sin abrir otro fichero | Una prueba cuyos datos vienen de un fichero externo compartido es difícil de entender y de mantener | Los datos de la prueba se cargan desde una fixture compartida y difícil de rastrear | Los datos relevantes de una prueba están visibles en la propia prueba, sin tener que saltar a otro fichero |
| Nunca usar datos de producción sin enmascarar | Los datos de producción suelen contener información personal o sensible | Se copian datos reales de producción a un entorno de pruebas sin ningún tratamiento | Ningún entorno de pruebas contiene datos personales reales sin enmascarar ([appsec/appsec.md](../appsec/appsec.md)) |
| Probar la invariante, no solo el ejemplo feliz | Un ejemplo concreto puede pasar aunque la invariante general esté rota en otros casos | Solo se prueba el camino feliz con un único conjunto de datos de ejemplo | Existe al menos una prueba que intenta romper deliberadamente cada invariante declarada |
| Probar concurrencia, reintento y fallo parcial como escenarios explícitos, no como suposición | Son justamente los casos que el desarrollo secuencial normal no ejercita nunca | La suite nunca ejecuta el código bajo concurrencia real ni simula un fallo a mitad de operación | Existe al menos una prueba que ejercita concurrencia real y otra que simula un fallo a mitad de una operación con efecto secundario |

## Más allá de lo funcional y qué no probar

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Probar carga, fallo inyectado y migración ensayada sobre volumen realista | Son las condiciones bajo las que el sistema realmente falla en producción, y rara vez se ejercitan en pruebas funcionales | Solo existen pruebas funcionales sobre volúmenes pequeños de datos | Existen pruebas de carga y de fallo inyectado que se ejecutan con una cadencia definida ([performance/performance.md](../performance/performance.md)) |
| No probar el framework, el accesor trivial ni el detalle que cambiará mañana | Probar eso añade coste de mantenimiento sin aportar señal sobre el comportamiento del sistema | Existen pruebas que solo comprueban que un getter devuelve lo que se le puso | Cada prueba de la suite comprueba un comportamiento de negocio o una invariante, no un detalle trivial |

## Errores frecuentes

| Error | Corrección |
|---|---|
| Medir el éxito de la suite solo por porcentaje de cobertura | Medir por capacidad de detectar errores de negocio conocidos introducidos deliberadamente |
| Dejar tests intermitentes "porque casi siempre pasan" | Arreglarlos o eliminarlos: entrenan a ignorar fallos reales |
| Probar solo el camino feliz de cada función | Añadir al menos un caso que intente romper cada invariante declarada |
| Compartir fixtures grandes entre muchas pruebas no relacionadas | Construir datos mínimos y explícitos por prueba |
| No ejercitar nunca concurrencia real en pruebas | Incluir al menos un escenario de concurrencia real por invariante sensible a carreras |
