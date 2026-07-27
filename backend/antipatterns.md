---
id: antipatterns
tipo: catalogo
estabilidad: permanente
---

# Antipatrones transversales

Antipatrones que cruzan varias ramas de esta skill y no encajan en un único módulo. Cada uno enlaza al módulo que lo trata con detalle desde el lado de la práctica correcta.

## Contrato y datos

| Antipatrón | Síntoma observable | Módulo con la corrección |
|---|---|---|
| API con verbos en la ruta (`/crearPedido`) mezclando estilo de recursos y de procedimiento | El consumidor no puede predecir el método HTTP ni el código de estado a partir de la operación | [api/api.md](api/api.md) |
| Paginación por desplazamiento sobre una tabla con escrituras concurrentes | Elementos duplicados o ausentes al avanzar de página mientras hay inserciones o borrados | [api/api.md](api/api.md) |
| Regla de negocio que solo vive en el código de la aplicación, sin restricción en la base | Un dato inválido aparece en la base tras una escritura directa, un script o una migración con un error | [data/data.md](data/data.md) |
| Migración que combina expandir, migrar y contraer en un único despliegue | Un despliegue que falla a mitad deja el esquema en un estado que ni el código viejo ni el nuevo esperan | [data/migrations.md](data/migrations.md) |
| `SELECT *` como valor por defecto en toda consulta | Añadir una columna a una tabla cambia el tamaño de respuestas que nadie tocó a propósito | [data/data.md](data/data.md) |

## Concurrencia y fiabilidad

| Antipatrón | Síntoma observable | Módulo con la corrección |
|---|---|---|
| Reintento automático sobre una operación no idempotente | Duplicados esporádicos que no se correlacionan con ningún error visible para el usuario | [reliability/reliability.md](reliability/reliability.md) |
| Retroceso exponencial sin aleatoriedad | Picos de tráfico sincronizados hacia una dependencia justo después de que se recupera de un fallo | [reliability/reliability.md](reliability/reliability.md) |
| Ausencia de tiempo de espera en una llamada externa | Un trabajador queda ocupado indefinidamente esperando una respuesta que nunca llega | [reliability/reliability.md](reliability/reliability.md) |
| Cola sin límite de tamaño | La latencia se degrada de forma gradual hasta un agotamiento de memoria repentino | [concurrency/concurrency.md](concurrency/concurrency.md) |
| Cerrojo distribuido sin caducidad ni token de vallado | Un proceso que se congela y revive sigue actuando como si aún fuera dueño del recurso | [concurrency/concurrency.md](concurrency/concurrency.md) |
| Tarea periódica sin garantía de ejecutor único | La misma tarea se ejecuta varias veces por ciclo cuando hay más de una instancia desplegada | [concurrency/concurrency.md](concurrency/concurrency.md) |

## Rendimiento

| Antipatrón | Síntoma observable | Módulo con la corrección |
|---|---|---|
| N+1 dentro de un bucle | El número de consultas por petición crece con el tamaño de la respuesta | [data/data.md](data/data.md) |
| Caché añadida sobre una consulta sin índice, en vez de corregir el índice | El problema reaparece en cualquier ruta de acceso que no pase por la caché | [performance/performance.md](performance/performance.md) |
| Optimizar sin haber perfilado antes | El cambio no mueve la métrica que motivó la optimización | [performance/performance.md](performance/performance.md) |
| Reportar solo la latencia media | Los usuarios se quejan de lentitud mientras el panel muestra un valor saludable | [performance/performance.md](performance/performance.md) |
| Clave de partición que concentra el tráfico en un único valor | Una partición sostiene una fracción desproporcionada de la carga mientras las demás están ociosas | [performance/performance.md](performance/performance.md) |

## Seguridad aplicada

| Antipatrón | Síntoma observable | Módulo con la corrección |
|---|---|---|
| Comprobar autorización solo sobre la ruta, no sobre el objeto solicitado | Un usuario autenticado accede a un recurso ajeno cambiando el identificador en la petición | [appsec/appsec.md](appsec/appsec.md) |
| Contraseñas hasheadas con una función rápida de propósito general | Una filtración de la base permite probar miles de millones de combinaciones por segundo | [appsec/authn.md](appsec/authn.md) |
| Secreto en un fichero de configuración versionado | El secreto queda accesible en el histórico del repositorio aunque se borre después | [appsec/appsec.md](appsec/appsec.md) |
| CORS usado como si fuera control de acceso del servidor | Una petición directa sin navegador accede sin autenticación real | [api/api.md](api/api.md) |
| Multi-inquilino aplicado como filtro por consulta en vez de invariante del esquema | Una consulta nueva olvida el filtro y expone datos de otro inquilino | [appsec/appsec.md](appsec/appsec.md) |

## Observabilidad y operación

| Antipatrón | Síntoma observable | Módulo con la corrección |
|---|---|---|
| Etiqueta de métrica con identificador de usuario o de petición | La factura de observabilidad crece de forma desproporcionada al volumen de tráfico | [observability/observability.md](observability/observability.md) |
| Alertar sobre causa interna (uso de CPU) en vez de sobre síntoma del usuario | Alertas frecuentes que no se traducen en ninguna acción ni afectan al usuario final | [observability/observability.md](observability/observability.md) |
| Reconstruir el artefacto para cada entorno en vez de promover el mismo binario | Un defecto aparece solo en producción porque la construcción difiere de la que se probó | [delivery/delivery.md](delivery/delivery.md) |
| Migración destructiva o cambio irreversible aprobado con el mismo proceso que un cambio reversible | No hay camino de vuelta cuando el cambio produce un problema en producción | [delivery/delivery.md](delivery/delivery.md) |
| Partir en microservicios por un límite de dominio que ya estaba mal trazado | El número de servicios crece sin que el coste de coordinación entre equipos disminuya | [architecture/architecture.md](architecture/architecture.md) |

## Cómo se detectan desde fuera

La mayoría de estos antipatrones comparten una señal común: aparecen bajo concurrencia, bajo fallo parcial o bajo volumen — nunca en la ejecución secuencial de un único caso feliz que es lo que suele cubrir una prueba manual. Si una revisión de diseño o de código no puede responder qué pasa bajo dos peticiones simultáneas, una dependencia caída a mitad de la operación, o diez veces el volumen esperado, la revisión no ha llegado al nivel de detalle que este catálogo exige.
