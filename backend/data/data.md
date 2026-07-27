---
id: data/data
tipo: modelo
estabilidad: permanente
---

# Datos y persistencia

Modelado, tipos, índices, transacciones, concurrencia sobre el dato y ciclo de vida. Las migraciones tienen módulo propio: [data/migrations.md](migrations.md). La mecánica de inyección y explotación de motores de base de datos está en [../security/databases/databases.md](../../security/databases/databases.md).

## Elegir el motor por patrón de acceso

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Elegir el motor por cómo se lee, cómo se escribe, cuánto crece y qué consistencia exige | Cada familia de motor está optimizada para un patrón; usarla fuera de él cuesta en rendimiento o en corrección | Se elige un motor por moda o porque el equipo ya lo conoce, no por el patrón de acceso | El patrón de acceso dominante (lectura, escritura, tamaño, consistencia) está escrito antes de elegir |
| Relacional por defecto; desviarse exige justificar con un patrón concreto | La mayoría de los dominios de negocio tienen invariantes relacionales que un motor no relacional no aplica solo | Se adopta un motor especializado "porque escala mejor" sin haber medido que el relacional no basta | La justificación cita el patrón de acceso concreto que el relacional no sirve bien |
| Contar el coste real de operar un motor más: copias de seguridad, monitorización, conocimiento del equipo | Un motor adicional no es solo una decisión técnica, es una obligación operativa permanente | Se añade un motor nuevo sin plan de copia, alerta ni nadie que lo conozca a fondo | El motor nuevo tiene copia de seguridad probada y una persona de guardia que sabe operarlo |

## Modelado y restricciones

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Normalizar por defecto; desnormalizar solo con medición | La normalización evita anomalías de actualización; desnormalizar sin medir cambia un problema por otro | Se desnormaliza "por rendimiento" sin haber medido el coste de la forma normalizada | La decisión de desnormalizar cita una medición concreta, no una intuición |
| Que el esquema haga imposible el dato imposible: `NOT NULL`, `UNIQUE`, `CHECK`, clave foránea | La base es el último guardián y no es la única que escribe en ella | La regla de negocio vive solo en el código de la aplicación | Insertar directamente en la base un dato que viola la regla falla, sin pasar por la aplicación |
| Identificador ordenable en el tiempo en vez de aleatorio puro para claves que se indexan | Un identificador aleatorio fragmenta el índice físico y degrada la localidad de escritura | La clave primaria es un valor aleatorio de alta entropía sin componente temporal | El índice de la clave primaria no sufre fragmentación creciente con el volumen de inserciones |
| Enumeraciones como valor estable almacenado, nunca el ordinal del lenguaje de programación | El ordinal cambia si alguien reordena o inserta un valor en el código; el dato almacenado no lo sabe | Se guarda el índice numérico de un enum del lenguaje | Reordenar los valores del enum en el código no cambia el significado de los datos ya almacenados |

## Tipos que se eligen mal una y otra vez

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Dinero como decimal exacto o entero en la unidad mínima; nunca coma flotante | La coma flotante binaria no puede representar exactamente la mayoría de las cantidades decimales | Un campo de precio se guarda como `float`/`double` | Sumar muchas cantidades pequeñas no produce error de redondeo acumulado |
| Fecha y hora como instante en UTC, con la zona guardada aparte si el negocio la necesita | Una cita futura no es un instante fijo: es una hora local más una zona, y la zona puede cambiar sus reglas | Se guarda solo un instante UTC para un evento que el usuario espera ver a una hora local fija | Un cambio de regla de huso horario no desplaza la hora local percibida por el usuario |
| Texto en UTF-8, normalizado antes de comparar, con colación consciente del idioma | Dos cadenas visualmente iguales pueden tener representaciones Unicode distintas | Se compara texto sin normalizar y "el mismo" nombre no coincide en una búsqueda | Dos representaciones Unicode equivalentes del mismo texto se tratan como iguales |
| Booleano de tres estados cuando el valor puede ser desconocido, no un booleano de dos | Forzar un desconocido a verdadero o falso inventa información que no existe | Un campo que puede no tener respuesta se modela como booleano obligatorio | El estado "no informado" es distinguible de "informado como falso" |

## Índices

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Un índice sirve a una forma de consulta concreta, respetando el orden de columnas | Un índice compuesto solo sirve consultas que respetan su prefijo izquierdo | Se crea un índice esperando que sirva cualquier combinación de sus columnas | El plan de ejecución de la consulta objetivo usa el índice, no un barrido |
| Comprobar la selectividad antes de indexar | Un índice sobre una columna con pocos valores distintos no reduce el trabajo de búsqueda | Se indexa una columna booleana o de estado con dos o tres valores posibles | El índice reduce de forma medible las filas examinadas frente al barrido |
| Índice único como expresión de una regla de negocio, no solo como optimización | La restricción de unicidad es una invariante, no un detalle de rendimiento | La unicidad se comprueba solo en el código de la aplicación | Dos inserciones concurrentes con el mismo valor único: una falla en la base, no en la aplicación |
| Contar el coste de escritura de cada índice añadido | Todo índice se actualiza en cada inserción, actualización y borrado sobre esa tabla | Se añaden índices sin medir el impacto en el rendimiento de escritura | El rendimiento de escritura tras añadir el índice sigue dentro del presupuesto aceptado |
| Revisar periódicamente índices no usados y consultas frecuentes sin índice | Ambos son la misma negligencia vista desde dos lados | Nadie revisa qué índices sirven consultas reales | Existe un proceso periódico que identifica índices sin uso y consultas costosas sin índice |

## Transacciones y aislamiento

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Conocer qué anomalía permite el nivel de aislamiento realmente configurado, no el que se asume | El nivel por defecto del motor rara vez es serializable, y cada nivel permite anomalías distintas | Se asume aislamiento serializable sin haber comprobado la configuración real | El nivel de aislamiento configurado está documentado junto a las anomalías que permite |
| Transacciones cortas; nunca I/O externo (HTTP, cola, correo) dentro de una transacción | Una transacción larga retiene bloqueos y bloquea a otras mientras espera algo ajeno a la base | Se llama a un servicio externo dentro de una transacción abierta | Ninguna transacción abierta espera una respuesta de un sistema externo |
| Adquirir los bloqueos siempre en el mismo orden; reintentar el perdedor de un interbloqueo | El interbloqueo aparece cuando dos transacciones adquieren los mismos recursos en orden distinto | Distintas rutas de código bloquean las mismas tablas en órdenes diferentes | La tasa de interbloqueos detectados por el motor es próxima a cero y se reintenta automáticamente |
| El alcance de la transacción debe coincidir con el alcance de la invariante que protege | Una transacción más corta que la invariante deja una ventana donde el estado es inconsistente | Se divide en dos transacciones una operación que debe ser atómica | No existe un estado observable desde fuera en el que la invariante esté momentáneamente rota |

## Concurrencia sobre el dato

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Control optimista con columna de versión y actualización condicionada a ella | Permite alta concurrencia de lectura sin bloqueos, detectando el conflicto solo al escribir | Se lee, se modifica en memoria y se escribe sin comprobar si el valor cambió mientras tanto | Dos escrituras concurrentes sobre el mismo registro: la segunda detecta el conflicto y no sobrescribe en silencio |
| Control pesimista con bloqueo de fila explícito y tiempo de espera acotado, para conflictos frecuentes | El optimismo falla mal cuando el conflicto es la norma, no la excepción | Se usa optimismo en un recorrido con alta tasa de conflicto y los reintentos se disparan | La tasa de reintentos por conflicto está dentro de lo esperado para el patrón elegido |
| Escritura condicional o inserción-o-actualización atómica en vez de leer-modificar-escribir | El patrón leer-modificar-escribir tiene una ventana de carrera entre la lectura y la escritura | El código lee un valor, lo incrementa en memoria y escribe el resultado | Bajo concurrencia real, el resultado final es igual a aplicar todas las operaciones en algún orden serial |
| Incrementar contadores en el motor, no en memoria de la aplicación | Un incremento en memoria pierde actualizaciones concurrentes de otras instancias | Un contador de visitas se lee, se suma uno en la aplicación y se guarda | El valor final del contador coincide con el número real de incrementos bajo carga concurrente |

## Consultas

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Detectar N+1: una consulta por la lista más una consulta por cada elemento | Multiplica el número de viajes de red por el tamaño de la lista | Se recorre una lista y se hace una consulta relacionada dentro del bucle | El número de consultas por petición no crece con el tamaño de la respuesta |
| Proyección mínima; evitar seleccionar todas las columnas por defecto | Traer columnas que no se usan cuesta ancho de banda y memoria, y una columna nueva rompe expectativas implícitas | El código selecciona todas las columnas "por si acaso" | Añadir una columna a la tabla no cambia el tamaño de las respuestas existentes |
| Leer el plan de ejecución antes de optimizar una consulta lenta | La causa real casi nunca es la que parece a simple vista | Se añade un índice o se reescribe la consulta sin haber mirado el plan | El plan de ejecución después del cambio confirma la mejora esperada, no solo el tiempo total |
| Sentencias preparadas con parámetros, no concatenación de valores en la consulta | Da rendimiento (reutilización del plan) e inmunidad a inyección en el mismo gesto | Se construye la consulta concatenando valores directamente | Ningún valor de entrada del usuario se concatena en el texto de la consulta ([../security/](../../security/)) |
| Límite explícito en toda consulta que devuelve una colección | Una consulta sin límite es un incidente latente cuando la tabla crece | La consulta no impone ningún tope de filas | Ninguna consulta puede devolver un número de filas no acotado |

## Conexiones

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Dimensionar el pool contra el límite de conexiones del motor, no contra el número de instancias de la aplicación | Sumar los pools de todas las instancias puede superar lo que el motor admite | Cada instancia abre un pool grande sin coordinar con el total de instancias desplegadas | La suma de conexiones posibles de todas las instancias no supera el límite del motor |
| Tiempo de espera de adquisición del pool, para fallar rápido en vez de colgarse | Sin tiempo de espera, agotar el pool bloquea indefinidamente a quien pide una conexión | Una petición espera sin límite a que se libere una conexión | Con el pool agotado, una nueva petición falla rápido en vez de esperar sin fin |
| Vigilar fugas de conexión: conexiones adquiridas y nunca devueltas | El síntoma visible es "todo lento"; la causa real es un pool agotado por fugas | Una ruta de error no libera la conexión que había adquirido | El número de conexiones activas vuelve a su línea base tras un pico de tráfico |
| Usar un agrupador (pooler) externo cuando hay muchas instancias pequeñas contra un motor con límite bajo | Cada instancia con su propio pool multiplica las conexiones reales contra el motor | Muchas instancias pequeñas mantienen pools propios contra un motor con pocas conexiones permitidas | El número de conexiones físicas contra el motor es independiente del número de instancias |

## Ciclo de vida del dato, verdad y copias

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Declarar retención, archivado y si el borrado es real o lógico | Sin decisión explícita, cada parte del sistema asume algo distinto | Nadie ha decidido qué pasa con un dato tras dejar de ser útil | Existe una política de retención escrita y aplicada, no solo una intención |
| Particionar o purgar desde el diseño toda tabla que solo crece | Una tabla sin límite de crecimiento es una bomba de relojería para el rendimiento y las copias | La tabla de eventos o auditoría no tiene estrategia de retención desde el día uno | El tamaño de la tabla tiene una trayectoria acotada, no crecimiento indefinido sin control |
| Declarar una única fuente de verdad por dato | Sin una fuente de verdad clara, dos copias que discrepan no tienen forma de resolverse | Dos sistemas se consideran ambos "la verdad" para el mismo dato | Ante una discrepancia, está escrito cuál de las copias gana |
| Documentar cómo se reconstruye cada copia (caché, índice de búsqueda, réplica) desde la fuente de verdad | Una copia que no se puede reconstruir es en realidad una segunda fuente de verdad no declarada | Nadie sabe cómo repoblar el índice de búsqueda si se pierde | La copia se puede reconstruir por completo desde la fuente de verdad, y el procedimiento está probado |
| Copia de seguridad con objetivo de punto de recuperación y de tiempo de recuperación, restauración ensayada | Una copia nunca restaurada no es una copia, es una suposición | La copia de seguridad existe pero nunca se ha restaurado de verdad | Un simulacro de restauración reciente cumplió el objetivo de tiempo declarado |

## Las siete preguntas antes de crear una tabla

1. ¿Qué invariante del negocio debe sostener el esquema, y qué restricción de la base la expresa?
2. ¿Qué patrón de acceso (lectura, escritura, crecimiento) va a servir esta tabla?
3. ¿Qué columnas necesitan índice, y con qué orden de columnas?
4. ¿Qué nivel de aislamiento necesita cada operación que la toca?
5. ¿Quién es el dueño de este dato, y quién más lo va a copiar (caché, búsqueda, analítica)?
6. ¿Cuál es su política de retención y cómo se purga o archiva?
7. ¿Cómo se migra esta tabla sin bloquear producción cuando cambie el esquema? ([data/migrations.md](migrations.md))
