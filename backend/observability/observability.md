---
id: observability/observability
tipo: modelo
estabilidad: permanente
---

# Observabilidad

Qué señal usar para cada pregunta, y cómo evitar que la propia observabilidad se convierta en el problema de coste o de ruido. Qué nunca se registra por ser sensible está en [appsec/appsec.md](../appsec/appsec.md).

## Para qué sirve cada señal

| Señal | Para qué sirve | Cuándo NO es la herramienta correcta |
|---|---|---|
| Registro | Reconstruir un evento concreto con su contexto completo | Para responder "cuánto" o "con qué frecuencia" a escala: el volumen lo hace caro e impreciso |
| Métrica | Agregados baratos de calcular y de alertar sobre ellos | Para reconstruir qué pasó en una petición concreta: pierde el detalle individual |
| Traza | Causalidad entre servicios: qué llamó a qué y cuánto tardó cada tramo | Para agregados históricos de largo plazo: su coste de almacenamiento no lo permite bien |
| Perfil | Dónde se va el coste de cómputo dentro de un proceso | Para entender interacción entre servicios: eso es trabajo de la traza |

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Elegir la señal correcta para la pregunta que se quiere responder | Usar la señal equivocada es caro: las métricas se pagan en cardinalidad, los registros en volumen | Se intenta responder "cuántas veces pasó esto en el último mes" leyendo registros en bruto | La pregunta agregada se responde con una métrica, no con un recorrido de registros |

## Correlación

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Identificador de traza que atraviesa toda la cadena, incluido lo asíncrono y lo diferido | Sin correlación, registro, métrica y traza son tres islas y depurar es adivinar | El identificador de correlación se pierde al pasar por una cola o un trabajo diferido | Un problema reportado por el usuario se puede seguir de extremo a extremo, incluida la parte asíncrona |
| Propagar el identificador en la cabecera de la petición y en los metadatos del mensaje | Es el mecanismo concreto que hace posible la correlación anterior | El identificador solo se propaga en llamadas síncronas, no en mensajes de cola | Un mensaje de cola conserva el identificador de la petición que lo originó |

## Registros

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Estructurados en clave-valor, no texto libre | El texto libre obliga a analizar con expresiones regulares frágiles cada vez que se necesita buscar algo | Los registros son líneas de texto libre concatenado | Cada campo relevante del registro se puede consultar como un campo estructurado, no extraído por patrón |
| El nivel debe significar algo: error implica que alguien tiene que actuar | Un nivel usado sin criterio entrena a ignorar todos los niveles por igual | Se registra como error algo que no requiere ninguna acción, o al revés | Cada nivel de registro usado corresponde a una acción esperada (o su ausencia) coherente |
| Registrar decisiones y bordes de entrada/salida, no el flujo línea a línea | El registro línea a línea genera volumen sin añadir señal proporcional | Se registra cada paso interno de una función, incluidos los triviales | El volumen de registro por petición es proporcional a las decisiones y los bordes, no al número de líneas de código ejecutadas |
| Sin datos personales ni secretos; muestreo de lo repetitivo | Un registro es un almacén de larga vida con menos control de acceso que la base principal | Un registro incluye datos personales o secretos porque "ayuda a depurar" | Ningún registro contiene datos personales ni secretos ([appsec/appsec.md](../appsec/appsec.md)) |

## Métricas

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Tasa, errores y duración en el borde; utilización, saturación y errores en cada recurso | Es el conjunto mínimo que permite responder "¿está sano el servicio?" y "¿está sano el recurso?" sin adivinar | Solo existen métricas de negocio, sin las de borde ni las de recurso | Un incidente de latencia o de errores se puede diagnosticar solo con el panel de estas métricas |
| Elegir el instrumento correcto: contador para lo acumulativo, medidor para lo instantáneo, histograma para lo que se va a percentilar | Un instrumento equivocado no permite hacer después la pregunta que se necesitaba | La latencia se mide con un contador en vez de con un histograma | Se puede calcular un percentil de la métrica sin haber tenido que rediseñar la instrumentación |
| Vigilar la cardinalidad: una etiqueta con identificador de usuario multiplica la serie por millones | Es el error caro más frecuente en observabilidad y suele descubrirse en la factura | Una métrica lleva como etiqueta un valor de alta cardinalidad como el identificador de usuario o de petición | Ninguna etiqueta de métrica tiene una cardinalidad no acotada de antemano ([performance/performance.md](../performance/performance.md)) |

## Trazas

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Instrumentar los bordes de entrada y salida, con atributos útiles en cada tramo | Es donde se puede atribuir el tiempo a una causa concreta (una llamada, una consulta) | Solo se traza el tramo de entrada, sin instrumentar las llamadas salientes internas | Cada llamada a una dependencia externa aparece como un tramo distinguible en la traza |
| Muestreo con sesgo hacia lo lento y lo erróneo, no aleatorio uniforme | Un muestreo uniforme descarta desproporcionadamente los casos raros que más interesa investigar | El muestreo es un porcentaje fijo aplicado por igual a peticiones rápidas y lentas | Las peticiones lentas o con error tienen mayor probabilidad de quedar registradas que las normales |

## Alertas

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Alertar sobre síntoma del usuario y consumo de presupuesto de error, no sobre causa interna | Una alerta de causa (CPU al 90%) puede no importarle a nadie si el usuario no está afectado | Existe una alerta por cada métrica de recurso, independientemente de si afecta al usuario | Cada alerta activa corresponde a un síntoma que de verdad afecta al usuario o al presupuesto de error ([reliability/reliability.md](../reliability/reliability.md)) |
| Toda alerta con una acción concreta asociada | Una alerta sin acción es un panel disfrazado de alerta | Existe una alerta configurada pero nadie sabe qué hacer cuando se dispara | Cada alerta tiene documentado el primer paso a ejecutar cuando se dispara |
| Vigilar la fatiga de alertas: la que se ignora es peor que no tenerla | Una alerta ignorada entrena a ignorar también a las que sí importan | El volumen de alertas ha crecido hasta que se silencian por costumbre | La tasa de alertas que reciben una acción real es alta, no un ruido de fondo ignorado |

## Depurabilidad

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Poder responder "¿qué le pasó a esta petición concreta?" sin desplegar código nuevo | Añadir instrumentación reactivamente durante un incidente es lento y arriesgado | Ante un reporte concreto, hay que añadir registros y desplegar para poder investigar | Un reporte de un usuario concreto se puede investigar con la instrumentación ya existente |

## Métricas que importan y métricas engañosas

| Métrica | Por qué importa | Por qué puede engañar |
|---|---|---|
| p99 de latencia en el borde | Refleja la experiencia del usuario que peor la pasa | Sin volumen suficiente de tráfico, el p99 es ruidoso y no representativo |
| Tasa de errores sobre el total de peticiones | Señal directa de salud del servicio | Un servicio con tráfico bajo puede mostrar una tasa alta por pocos casos, sin ser representativa |
| Presupuesto de error consumido | Conecta la fiabilidad con una decisión de negocio explícita | Solo tiene sentido si el SLO detrás está bien elegido; un SLO mal fijado hace la métrica inútil |
| Utilización media de un recurso | Fácil de calcular y de entender | Esconde picos de saturación breves que ya afectaron a la latencia de cola |
| Número de líneas de registro por minuto | Barata de vigilar como señal de anomalía | No distingue entre "más tráfico legítimo" y "un bucle que registra sin control" |
