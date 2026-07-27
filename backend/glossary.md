---
id: glossary
tipo: referencia
estabilidad: permanente
---

# Glosario operativo

Definiciones para desambiguar términos que se usan mal. Una fila = un concepto.

## Rendimiento y colas

| Término | Definición precisa | Confusión frecuente |
|---|---|---|
| Latencia | Tiempo que tarda una operación individual | No es lo mismo que rendimiento (throughput) |
| Rendimiento (throughput) | Operaciones completadas por unidad de tiempo | Puede subir mientras la latencia individual empeora |
| p50 / p95 / p99 | Percentil: el valor por debajo del cual cae ese porcentaje de las observaciones | El promedio no es un percentil y esconde la cola |
| Latencia de cola | Los valores altos de la distribución, poco frecuentes pero determinantes | "Raro" no es "irrelevante": con suficientes llamadas, alguien la sufre siempre |
| Ley de Little | Concurrencia media = tasa de llegada × tiempo medio en el sistema | Se usa para dimensionar pools y trabajadores, no solo para medir |
| Utilización | Fracción del tiempo que un recurso está ocupado | Alta utilización no es eficiencia: la espera crece de forma no lineal cerca del 100% |
| Contrapresión (backpressure) | Mecanismo por el que un consumidor lento frena al productor en vez de acumular sin límite | Sin ella, la latencia se convierte en caída |

## Fiabilidad

| Término | Definición | Nota |
|---|---|---|
| SLI | Indicador de nivel de servicio: una métrica concreta y medible | Ej.: proporción de peticiones que responden en menos de 300 ms |
| SLO | Objetivo de nivel de servicio: el valor que el SLI debe alcanzar | Es una decisión de negocio, no un dato técnico |
| Presupuesto de error | 1 − SLO: cuánta indisponibilidad se puede gastar en un periodo | Se agota con incidentes y con cambios arriesgados; ambos compiten por él |
| Interruptor (circuit breaker) | Deja de llamar a una dependencia que está fallando, para no agravar el problema | No sustituye al tiempo de espera; lo complementa |
| Mamparo (bulkhead) | Aislamiento de recursos (pools, hilos) por dependencia, para que una lenta no consuma todos | Símil naval: compartimentos estancos |
| Jitter | Aleatoriedad añadida a un retroceso o a una caducidad | Sin jitter, los clientes se sincronizan y repiten el pico que causó el fallo |
| Idempotencia | Repetir la operación produce el mismo resultado que ejecutarla una vez | No es lo mismo que "segura de reintentar sin control": aun idempotente, cuesta recursos |

## Datos

| Término | Definición | Nota |
|---|---|---|
| Invariante | Propiedad que debe cumplirse siempre, la exprese o no el esquema | El objetivo de toda restricción, transacción y validación |
| Aislamiento (isolation) | Grado en que las transacciones concurrentes se ven entre sí | Niveles: lectura confirmada, repetible, serializable, entre otros; ninguno es gratis |
| Actualización perdida (lost update) | Dos escrituras concurrentes; la segunda sobrescribe la primera sin saber que existió | El bug más común del CRUD sin control de concurrencia |
| Sesgo de escritura (write skew) | Dos transacciones leen un estado válido, cada una escribe algo válido por separado, pero juntas violan una invariante | Sobrevive a "lectura confirmada"; necesita bloqueo explícito o serializable |
| Expandir/contraer | Patrón de migración en tres fases que mantiene el esquema compatible con el código viejo y el nuevo a la vez | No es opcional cuando el despliegue no es atómico |
| N+1 | Una consulta para la lista, más una consulta por cada elemento de la lista | Aparece con carga perezosa dentro de un bucle |

## Concurrencia y mensajería

| Término | Definición | Nota |
|---|---|---|
| Carrera (race condition) | El resultado depende del orden de ejecución entre procesos concurrentes | No siempre es visible en pruebas de un solo hilo |
| Al menos una vez | El mensaje se entrega una o más veces, nunca cero | Exige idempotencia en quien procesa |
| Como mucho una vez | El mensaje se entrega cero o una vez, nunca duplicado | Puede perder mensajes; rara vez es lo que se quiere |
| Exactamente una vez | Entrega garantizada exactamente una vez | No existe de verdad en una red; se emula con al-menos-una-vez más deduplicación |
| Cola de mensajes fallidos (DLQ) | Destino para los mensajes que agotaron sus reintentos | Sin ella, un mensaje envenenado bloquea a los que le siguen |
| Bandeja de salida transaccional (outbox) | Patrón que escribe el dato y el evento a publicar en la misma transacción | Resuelve la doble escritura entre base de datos y sistema de mensajería |
| Saga | Secuencia de transacciones locales coordinadas con pasos de compensación | La compensación deshace el efecto de negocio, no es un rollback técnico |

## API

| Término | Definición | Nota |
|---|---|---|
| Clave de idempotencia | Identificador generado por el cliente que permite al servidor reconocer una repetición | Se almacena junto al resultado, con caducidad |
| Cursor | Puntero opaco a una posición en una colección ordenada | Estable frente a inserciones y borrados; el desplazamiento (offset) no lo es |
| Cambio aditivo | Cambio de contrato que un consumidor existente puede ignorar sin romperse | Añadir campo sí; cambiar tipo o significado de uno existente no |
| Compatibilidad N-1 | El servidor nuevo sigue funcionando con clientes de la versión anterior durante el despliegue | Obligatoria mientras no existe el despliegue atómico |
| Cubo de fichas (token bucket) | Algoritmo de limitación de tasa que permite ráfagas hasta el tamaño del cubo | Distinto de ventana fija, que no permite ráfaga entre ventanas |

## Seguridad aplicada

| Término | Definición | Nota |
|---|---|---|
| Sal (salt) | Valor aleatorio único por credencial, combinado antes de aplicar la función de hasheo | No es secreta; impide las tablas precalculadas, no el ataque dirigido a una cuenta |
| Pimienta (pepper) | Secreto adicional del servidor, fuera de la base de datos, aplicado a todos los hasheos | Complementa la sal; su compromiso no invalida las sales individuales |
| Factor de coste | Parámetro que regula cuánto tiempo o memoria consume una función de hasheo | Se revisa con el tiempo; demasiado bajo, se vuelve barato de romper por fuerza bruta |
| Autorización a nivel de objeto | Comprobar que el sujeto autenticado tiene permiso sobre ESE recurso concreto, no solo sobre la ruta | Su ausencia es el fallo de autorización más frecuente en API |
| Token de vallado (fencing token) | Número creciente emitido junto a un cerrojo distribuido, que invalida a un dueño anterior que revive | Sin él, un proceso que se congela y despierta puede seguir actuando como dueño |

## Arquitectura

| Término | Definición | Nota |
|---|---|---|
| Acoplamiento | Cuánto depende un componente de los detalles internos de otro | La propiedad que más predice el coste de mantenimiento a largo plazo |
| Cohesión | Cuánto pertenecen entre sí las responsabilidades agrupadas en un componente | Alta cohesión y bajo acoplamiento son objetivos complementarios, no sinónimos |
| Límite de dominio (bounded context) | Frontera dentro de la cual un modelo y su vocabulario son consistentes | Se traza por razón de cambio, no por capa técnica |
| Bandera de funcionalidad (feature flag) | Interruptor en tiempo de ejecución que decide si una funcionalidad está activa | Desacopla el despliegue del lanzamiento |
