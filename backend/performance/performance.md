---
id: performance/performance
tipo: modelo
estabilidad: permanente
---

# Rendimiento, escalado y coste

Diagnóstico y diseño frente al modelo e de [../SKILL.md](../SKILL.md): el coste real no es el big-O, está en los viajes de red y en la cola. La estampida de caché al expirar se explica en [reliability/reliability.md](../reliability/reliability.md); aquí solo la estrategia de caché en sí.

## Medir antes de tocar

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Perfilar en vez de adivinar dónde está el cuello de botella | El cuello de botella real casi nunca está donde parece a simple vista | Se optimiza la función que "parece lenta" sin haberla medido | El perfil muestra dónde se va el tiempo antes de tocar una sola línea |
| No cambiar código legible por código rápido sin haber confirmado que resuelve el problema medido | El coste de mantenimiento de código complicado solo se justifica si de verdad mejora lo que se midió | Se reescribe una función de forma más compleja sin volver a medir después | La medición posterior al cambio confirma la mejora que motivó la complejidad añadida |

## Distribución, no media

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Reportar y decidir sobre p50/p95/p99, no sobre la media | La media esconde exactamente al usuario que se queja | Los paneles y las alertas solo muestran la latencia media | Existe un panel con percentiles altos, y las alertas se basan en ellos, no en la media |
| Contar la amplificación de la cola: si una petición hace diez llamadas, el p99 de esas llamadas manda | Cuantas más llamadas dependientes tiene una petición, más probable que alguna caiga en la cola lenta | Se estima la latencia total sumando medias de cada llamada dependiente | La latencia total estimada considera la probabilidad de que al menos una llamada caiga en el percentil alto |
| No promediar percentiles entre instancias | El percentil no es una cantidad que se pueda promediar de forma válida | Se calcula "el p99 medio de todas las instancias" promediando percentiles individuales | El percentil global se calcula sobre el histograma agregado, no promediando percentiles parciales |

## Teoría de colas aplicada

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Tratar la utilización alta como señal de alarma, no de eficiencia | Cerca de la saturación, la espera crece de forma desproporcionada, no lineal | Se considera "bien aprovechado" un recurso al 90% de utilización sostenida | El tiempo de espera medido no crece de forma desproporcionada respecto a la utilización objetivo |
| Usar concurrencia = tasa × latencia (ley de Little) para dimensionar pools y trabajadores | Es la relación que conecta la carga esperada con el tamaño de recurso necesario | El tamaño de un pool se elige de forma arbitraria, sin relacionarlo con tasa y latencia esperadas | El tamaño del pool o del número de trabajadores se justifica con esta fórmula y la carga objetivo |

## El camino crítico

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Contar viajes de red en el camino crítico, no líneas de código | El coste real está dominado por la latencia de red, no por el cómputo local | Se optimiza el cómputo local mientras el camino crítico tiene varios viajes de red secuenciales evitables | El número de viajes de red por petición está contado y es el primer objetivo de optimización |
| Procesar en lote lo que se puede agrupar, en vez de un viaje por elemento | Un viaje por elemento multiplica la latencia de red por el tamaño de la colección | Se hace una llamada de red por cada elemento de una lista en vez de una llamada por lotes | El número de viajes de red no crece linealmente con el tamaño de la entrada cuando se puede evitar |
| Paralelizar lo independiente; secuenciar solo lo que depende de un resultado anterior | Secuenciar innecesariamente suma latencias que podrían solaparse | Llamadas sin dependencia entre sí se ejecutan una detrás de otra | Las llamadas sin dependencia real entre sí se ejecutan en paralelo |
| Comprimir la respuesta y eliminar campos que nadie consume | El ancho de banda transferido también es latencia, sobre todo en redes lentas o móviles | La respuesta incluye campos que ningún consumidor conocido usa | El tamaño de la respuesta está acotado a lo que los consumidores reales necesitan |

## Caché

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Empezar por la pregunta de corrección: ¿puede este dato estar obsoleto sin romper nada? | Cachear algo que no tolera obsolescencia es un error de corrección disfrazado de optimización | Se cachea un dato sensible a la actualidad sin haber decidido cuánta obsolescencia tolera el negocio | Existe una respuesta explícita de cuánta obsolescencia tolera cada dato cacheado |
| Elegir la estrategia (al lado, lectura directa, escritura directa, escritura diferida) a propósito | Cada estrategia tiene un compromiso distinto entre consistencia, latencia de escritura y complejidad | Se usa la estrategia por defecto de una librería sin haber comparado alternativas | La estrategia elegida está documentada junto al motivo de la elección |
| Caducidad e invalidación explícita, coherente entre instancias | Una caché sin invalidación clara sirve datos obsoletos de forma impredecible | La invalidación de caché no está definida para todos los caminos que modifican el dato | Todo camino que modifica el dato original invalida o actualiza la copia en caché |
| Caché negativa para resultados que no existen | Sin ella, una consulta que siempre devuelve vacío golpea el origen en cada petición | Las búsquedas sin resultado no se cachean y repiten la consulta cara cada vez | Una búsqueda repetida sin resultado no repite la consulta costosa contra el origen |
| Tratar la caché como muleta sospechosa cuando esconde un modelo de datos o un índice que faltan | Añadir caché sobre una consulta mal indexada oculta el problema en vez de resolverlo | Se añade caché para "arreglar" una consulta lenta sin revisar índice ni plan de ejecución | El plan de ejecución de la consulta original está revisado antes de decidir cachear en vez de indexar |

## Escalado horizontal, particionado y réplicas

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Identificar qué impide escalar horizontalmente: estado local, afinidad de sesión, fichero en disco local, tarea única, cerrojo global | Cada uno de estos convierte una instancia adicional en inútil o en fuente de inconsistencia | Se añaden instancias asumiendo que reparten carga, sin haber revisado qué estado local retienen | Añadir una instancia reparte carga real sin generar inconsistencia por el estado que retenía la anterior |
| Usar el escalado vertical como puente honesto, no como derrota permanente | A veces es la respuesta correcta a corto plazo mientras se resuelve lo que impide escalar horizontalmente | Se descarta el escalado vertical por principio, incluso cuando resuelve el problema inmediato con menos riesgo | La decisión entre vertical y horizontal está justificada por el problema real, no por dogma |
| Elegir con cuidado la clave de partición, vigilando puntos calientes | Una clave mal elegida concentra el tráfico en una sola partición, anulando el beneficio de particionar | Se particiona por una clave donde un solo valor (un inquilino grande) concentra la mayoría del tráfico | La carga está repartida entre particiones sin que una sola concentre una fracción desproporcionada |
| Contar con el retardo de réplica: leer la propia escritura desde una réplica puede no verla todavía | Ignorar el retardo de réplica produce comportamientos confusos justo después de escribir | El usuario escribe un dato y la siguiente lectura, servida por una réplica, no lo refleja todavía | Una lectura inmediatamente posterior a una escritura del mismo usuario ve su propio cambio |
| Elegir bien la clave de partición desde el principio: redistribuir datos es la operación más cara que existe | Cambiar la clave de partición después implica mover y reindexar todo el volumen ya almacenado | La clave de partición se elige sin proyectar el crecimiento y el patrón de acceso a futuro | La clave de partición sigue siendo adecuada bajo el crecimiento proyectado del sistema |

## Recursos finitos y capacidad

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Identificar qué recurso finito se agota primero (memoria, descriptores, conexiones, hilos) | Ese recurso, no la CPU, suele definir el límite real de capacidad del servicio | Se dimensiona la capacidad solo mirando el uso de CPU | El recurso limitante real está identificado y monitorizado, no asumido |
| Vigilar el crecimiento monótono de memoria entre reinicios como señal de fuga | Una fuga de memoria se confunde con "necesita más recursos" hasta que se hace evidente en un incidente | El uso de memoria crece de forma sostenida sin que nadie lo note hasta el agotamiento | El uso de memoria vuelve a una línea base estable tras el pico de carga, sin crecimiento entre ciclos |
| Probar con carga de forma realista: mezcla de operaciones, datos con volumen de producción | Una prueba de una sola llamada en bucle no revela cómo se comporta el sistema con tráfico real | La prueba de carga usa una única petición repetida, sin la mezcla real de operaciones | La prueba de carga reproduce la mezcla de operaciones y el volumen de datos esperados en producción |
| Decidir de antemano el comportamiento en saturación: degradar o rechazar | Sin decisión previa, el comportamiento en saturación es el que resulte por accidente | El sistema no tiene definido qué hacer cuando la demanda supera la capacidad | Bajo sobrecarga, el sistema se comporta según lo decidido de antemano, no de forma impredecible |

## Coste como restricción de diseño

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Conocer el coste por petición y por usuario, incluidos almacenamiento y tráfico de salida | Un diseño que escala técnicamente pero no se puede pagar no es una solución | El coste marginal de servir un usuario o una petición adicional no se ha calculado | El coste por unidad de uso está calculado y forma parte de la decisión de diseño |
| Vigilar la cardinalidad de métricas y el volumen de registros como partida de coste | Es habitual que la factura de observabilidad sorprenda más que la de cómputo | Se instrumenta sin considerar el coste de almacenar y consultar lo instrumentado | El coste de observabilidad está presupuestado y revisado, no descubierto en la factura ([observability/observability.md](../observability/observability.md)) |

## Procedimiento de diagnóstico de latencia

1. Confirmar el síntoma con percentiles reales (p95/p99), no con la media ni con una anécdota.
2. Determinar si el problema está en el camino crítico (número de viajes de red) o en un recurso saturado (utilización cercana al límite).
3. Perfilar antes de tocar código: identificar dónde se va el tiempo, no dónde se supone que se va.
4. Revisar el plan de ejecución de cualquier consulta implicada antes de considerar cachear.
5. Aplicar el cambio mínimo que ataque la causa medida, y volver a medir con la misma metodología.
6. Si la causa es estructural (clave de partición, modelo de datos), documentarlo como decisión pendiente en vez de parchear con caché.
