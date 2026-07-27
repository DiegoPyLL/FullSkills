---
id: api/api
tipo: modelo
estabilidad: permanente
---

# Contrato y API

El contrato es la superficie estable que ve el consumidor; todo lo que hay detrás puede cambiar sin avisar. La idempotencia se explica aquí y [concurrency/concurrency.md](../concurrency/concurrency.md) la referencia; el bloqueo optimista se explica en [data/data.md](../data/data.md) y aquí solo se referencia vía `If-Match`.

## Elección de estilo y modelado del contrato

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Elegir petición-respuesta o evento según quién debe quedar acoplado a la disponibilidad de quién | El estilo síncrono acopla al llamante a que el destino esté vivo en ese instante | Se usa síncrono "porque es más simple" para un flujo que el negocio ya trata como asíncrono | El llamante puede seguir funcionando si el destino está caído por un rato razonable |
| Modelar recursos e invariantes del dominio, no la tabla ni la función interna | El contrato debe sobrevivir a un cambio de esquema o de implementación | La ruta expone columnas de la base o el nombre de una función interna | Un cambio de esquema no obliga a cambiar el contrato |
| El estilo lo decide el consumidor, no la preferencia del equipo que implementa | Un contrato que nadie puede consumir cómodamente no cumple su función | Se elige RPC o GraphQL por gusto del equipo cuando el consumidor necesita caché HTTP simple | El consumidor real puede integrarse sin fricción documentada como "limitación conocida" |

## Códigos y semántica de respuesta

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| 201 con `Location` al crear, 204 sin cuerpo al no devolver nada, 202 para trabajo asíncrono | El código es el primer nivel de contrato: un cliente genérico puede reaccionar sin leer el cuerpo | Todo devuelve 200, incluidas las creaciones y los rechazos | Un cliente que solo mira el código de estado se comporta correctamente |
| 409 para conflicto de estado, 412 para precondición fallida, 422 para entidad inválida | Distinguen "tu petición está mal formada" de "tu petición es válida pero el estado no lo permite" | Todo error de negocio se devuelve como 400 | El código de error identifica sin ambigüedad la categoría del fallo |
| 429 con cabeceras de cuota y `Retry-After`; 503 con `Retry-After` cuando no se puede atender | El cliente necesita saber cuánto esperar sin adivinar | Se devuelve 429 sin ninguna cabecera de cuándo reintentar | El cliente puede programar el reintento sin sondear a ciegas |
| Marcar en el propio cuerpo o código si el error es reintentable | El cliente no puede decidir bien sin esa información | Un error transitorio y uno permanente devuelven la misma forma | El cliente puede decidir automáticamente si reintentar |
| Nunca devolver 200 con un error dentro del cuerpo | Rompe toda infraestructura genérica: caché, reintento automático, monitorización | Un fallo de negocio se envuelve en `{"success": false}` con código 200 | Ningún endpoint exitoso en el código de estado esconde un fallo en el cuerpo |

## Idempotencia

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Tratar GET, PUT y DELETE como idempotentes por definición del método | El cliente y los intermediarios confían en esa semántica para decidir si reintentar | Un PUT tiene efectos secundarios acumulativos (p. ej. incrementa un contador) | Ejecutar la misma petición dos veces produce el mismo estado final que una |
| Clave de idempotencia en las creaciones (POST), generada por el cliente y almacenada junto al resultado, con caducidad | POST no es idempotente por definición y es la operación que más se duplica con reintentos | Un reintento de creación genera un segundo recurso | El duplicado con la misma clave devuelve la respuesta original, sin efecto adicional |
| Decidir qué ocurre si dos peticiones concurrentes llegan con la misma clave | Sin esa decisión, una carrera produce dos ejecuciones antes de que la primera registre la clave | La segunda petición concurrente no ve la clave todavía registrada y ejecuta de nuevo | Bajo concurrencia real (no secuencial) con la misma clave, solo una ejecución tiene efecto |

## Errores

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Formato de error único en toda la API: tipo, título, detalle, identificador de correlación | Un formato distinto por endpoint obliga a cada cliente a un tratamiento especial | Cada equipo devuelve su propia forma de error | El identificador de correlación permite localizar la petición exacta en los registros del servidor |
| Errores de validación por campo, accionables | El cliente necesita saber qué corregir, no solo que algo falló | El mensaje dice "solicitud inválida" sin más | El mensaje nombra el campo y la regla incumplida |
| Nunca filtrar traza, SQL, ruta interna ni versión de dependencia al cliente | Es información que ayuda a un atacante y no ayuda al consumidor legítimo | El error 500 en desarrollo se despliega tal cual en producción | Ningún mensaje de error visible desde fuera contiene una traza o una consulta |

## Evolución sin romper

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Cambios aditivos por defecto; el consumidor debe poder ignorar lo que no conoce | Es la única forma de desplegar servidor y clientes en momentos distintos ([núcleo, modelo d](../SKILL.md)) | Se añade un campo obligatorio a una petición existente | Un cliente antiguo sigue funcionando sin cambios contra la versión nueva |
| Nunca cambiar el tipo ni el significado de un campo existente; añadir uno nuevo en su lugar | Cambiar el significado rompe a todo consumidor que ya interpretaba el campo | Un campo `estado` pasa de cadena a entero para "optimizar" | Ningún cliente existente necesita cambiar para seguir interpretando el campo igual |
| Versionar solo cuando de verdad se rompe, con conciencia del coste de cada versión viva | Cada versión adicional es superficie a mantener y probar indefinidamente | Se crea una versión nueva para un cambio que podía ser aditivo | El número de versiones vivas está acotado y documentado |
| Deprecación con aviso, plazo publicado y medición de uso real antes de apagar | Apagar sin medir uso real rompe a consumidores desconocidos | Se retira un campo o endpoint sin comprobar quién lo sigue usando | El tráfico real al elemento deprecado se mide antes de la fecha de retirada |

## Colecciones

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Paginación por cursor opaco y estable | El desplazamiento (offset) duplica o salta filas cuando el conjunto cambia entre páginas | Se pagina con `offset`/`limit` sobre una tabla que recibe escrituras concurrentes | Insertar o borrar filas durante la paginación no duplica ni omite elementos |
| Límite por defecto y límite máximo obligatorios | Sin tope, una colección grande se convierte en una respuesta que no cabe en memoria | Un endpoint de listado no acepta ni impone ningún límite | Ninguna respuesta de colección puede crecer sin cota |
| Filtrado y ordenación acotados a lo que hay índice para servir | Un filtro sin índice convierte cada petición en un barrido completo | Se permite ordenar por cualquier columna arbitraria | Cada combinación de filtro/orden permitida tiene un índice que la sirve ([data/data.md](../data/data.md)) |

## Caché HTTP y peticiones condicionales

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| ETag y `Last-Modified`, con respuesta 304 cuando el recurso no cambió | Ahorra ancho de banda y cómputo en el cliente y en intermediarios | Toda petición GET devuelve el cuerpo completo aunque nada haya cambiado | Una petición condicional sin cambios recibe 304 sin cuerpo |
| `Cache-Control` explícito: público o privado, tiempo de vida, necesidad de revalidar | Sin esta cabecera, cada capa (navegador, proxy) decide por su cuenta | Se deja el comportamiento por defecto del cliente o del intermediario | Un recurso sensible nunca se sirve desde una caché compartida |
| `If-Match` para bloqueo optimista sobre el recurso, devolviendo 412 si cambió | El cliente evita sobrescribir un cambio ajeno que no vio | Un PUT sobrescribe sin comprobar la versión que el cliente creía tener | Una actualización basada en una versión obsoleta se rechaza con 412, no se aplica |

## Límites, cuotas y protección de carga

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Limitación de tasa por identidad autenticada, no por IP a secas | NAT y proxies compartidos hacen que muchos usuarios legítimos compartan IP | El límite se aplica solo por dirección IP de origen | Dos identidades detrás de la misma IP no se penalizan entre sí |
| Cubo de fichas cuando se debe permitir ráfaga; cubo con fuga cuando se debe suavizar la tasa de salida | Cada algoritmo resuelve un problema distinto; una ventana fija permite doblar la tasa en el borde de dos ventanas | Se usa ventana fija asumiendo que impide ráfagas, y no es cierto en el límite entre ventanas | La tasa efectiva medida coincide con la política elegida, incluida su tolerancia a ráfaga |
| Comunicar cuota restante, momento de reinicio y `Retry-After` en el 429 | El cliente necesita esa información para comportarse bien sin sondear | El 429 no lleva ninguna cabecera informativa | Un cliente puede autorregularse solo con las cabeceras de la respuesta |
| Limitar por coste de la operación, no solo por número de peticiones | Una consulta cara puede agotar recursos con muy pocas llamadas | Una consulta que agrega millones de filas cuenta como una petición más | El límite refleja el coste real medido, no solo el recuento de llamadas |
| Límite de tamaño de cuerpo, de profundidad de anidamiento y de número de elementos por petición | Sin ellos, una única petición puede agotar memoria o CPU del servidor | Un endpoint acepta un cuerpo o una consulta anidada de tamaño arbitrario | Una petición diseñada para agotar recursos se rechaza antes de procesarse |
| Tiempo de espera en el propio servidor para cada petición entrante | Una petición sin corte consume un trabajador indefinidamente | El servidor no impone ningún límite de tiempo por petición | Ninguna petición individual puede bloquear un trabajador de forma indefinida |

## Operaciones largas, callbacks salientes y superficie del navegador

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Aceptar con 202 y devolver un recurso de estado consultable, cancelable y con caducidad | Mantener la conexión abierta esperando consume recursos y es frágil ante cortes de red | El endpoint bloquea la petición hasta que termina un proceso largo | El cliente puede consultar el estado por separado y la conexión original ya se cerró |
| Firmar la carga útil de un webhook y sellarla con marca de tiempo contra repetición | El receptor debe poder confirmar que el mensaje viene de quien dice y no es una repetición capturada | El webhook se acepta sin verificar firma ni antigüedad | Un envío repetido o alterado se rechaza en la verificación de firma |
| El receptor de un webhook debe tolerar entrega al menos una vez y desordenada | El emisor reintenta ante cualquier duda, así que el duplicado es esperable | El receptor asume que cada entrega ocurre exactamente una vez y en orden | Recibir el mismo webhook dos veces no duplica el efecto ([concurrency/concurrency.md](../concurrency/concurrency.md)) |
| CORS explícito y restrictivo; nunca usarlo como control de acceso | CORS es una política que aplica el navegador, no una barrera del lado del servidor | Se asume que una API es segura porque CORS bloquea el navegador | Una petición directa sin navegador (curl, otro servidor) sigue exigiendo autenticación y autorización |

## Contrato como artefacto verificable

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Especificación generada o validada contra el código, no un documento aparte | Un documento desincronizado es peor que ninguno: miente con autoridad | La documentación se actualiza "cuando haya tiempo" tras el cambio de código | La especificación y el comportamiento real del servicio nunca divergen en integración continua |
| Prueba de compatibilidad hacia atrás en integración continua | Sin ella, un cambio que rompe a un consumidor solo se descubre en producción | Los cambios de contrato solo se revisan manualmente | Un cambio que rompe compatibilidad falla la build antes de desplegarse |

## Verificación mínima antes de publicar un contrato

1. Cada operación de escritura no idempotente tiene mecanismo de idempotencia.
2. Cada código de error usado está documentado y es distinguible por el cliente sin leer prosa.
3. Ninguna colección se puede listar sin límite.
4. El plan de evolución del contrato (qué es aditivo, cuándo se versiona) está escrito, no improvisado.
5. Los límites de tasa y de tamaño están definidos y se comunican en la propia respuesta.
6. Existe una prueba automática de compatibilidad hacia atrás.
