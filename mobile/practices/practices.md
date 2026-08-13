---
id: practices/practices
tipo: modelo
estabilidad: permanente
---

# Buenas prácticas de construcción y entrega móvil

Agnóstico de lenguaje y de framework. Lo que decide la plataforma está en [../ios/ios_platform.md](../ios/ios_platform.md); el criterio de interfaz, en [../ios/ios_design.md](../ios/ios_design.md); la seguridad de la app, en [../../security/mobile/mobile.md](../../security/mobile/mobile.md).

## La diferencia estructural con el backend

Un backend se despliega: la versión anterior deja de existir cuando se quiere. Una app móvil **se distribuye**, y la versión anterior sigue viva en los dispositivos de quien no actualiza, durante años, sin que nadie pueda forzarlo.

Todo lo demás se deriva de ahí:

- Un fallo en producción no se arregla en minutos: hay revisión de tienda y hay adopción. La ventana se mide en días o semanas.
- El contrato con el servidor tiene que aguantar clientes antiguos. Un cambio incompatible rompe usuarios que no hicieron nada mal. Ver [../../backend/api/api.md](../../backend/api/api.md).
- Los datos locales tienen historia: la migración debe funcionar desde cualquier versión anterior, no solo desde la última.
- Por eso el interruptor remoto vale más que la corrección rápida: poder **apagar** una función sin publicar es la única contención inmediata que existe.

## Contrato con el servidor

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| El servidor nunca rompe clientes antiguos | El cliente viejo no se puede retirar | Quitar un campo, cambiar su tipo, estrechar un valor admitido | Pruebas de contrato contra las versiones aún en uso |
| El cliente tolera campos desconocidos | Permite que el servidor evolucione | Analizadores estrictos que fallan ante un campo nuevo | Responder con campos añadidos y comprobar que no rompe |
| Versión mínima exigible desde el servidor | Alguna vez hay que cortar | No tener el mecanismo, y descubrirlo cuando hace falta | Probar la pantalla de actualización obligatoria antes de necesitarla |
| Errores accionables por el cliente | El usuario necesita saber si reintentar | Devolver un genérico para todo | Recorrer los casos de error de la interfaz |
| Escrituras idempotentes | La red móvil duplica peticiones | Reintentar un cobro sin clave de idempotencia | Repetir la petición y comprobar un solo efecto. Ver [../../backend/reliability/reliability.md](../../backend/reliability/reliability.md) |

## Red y trabajo sin conexión

La red móvil no es una red lenta: es una red **intermitente**, que cambia de tipo a mitad de petición y que a veces acepta la conexión y no entrega nada.

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Tiempo de espera en toda petición | Sin él, la app se queda colgada indefinidamente | Confiar en el valor por defecto de la librería | Simular red que acepta y no responde |
| Reintento con espera creciente y aleatoria | Evita la avalancha coordinada al volver la cobertura | Reintentar en bucle cerrado | Poner el dispositivo en avión y devolverlo a la red |
| La interfaz manda sobre el estado local | El usuario espera ver su acción de inmediato | Bloquear la pantalla hasta que responda el servidor | Ejecutar la acción sin cobertura |
| Cola persistente de acciones pendientes | El cierre de la app no debe perder trabajo | Guardar la cola solo en memoria | Matar la app con acciones sin enviar |
| Resolución de conflictos definida | Dos dispositivos editan lo mismo | «El último gana» por omisión, sin decidirlo | Editar en dos dispositivos sin conexión y sincronizar |
| Portales cautivos contemplados | El wifi de hotel responde 200 a todo | Asumir que hay conexión si hay wifi | Probar en una red con portal |

## Rendimiento y energía

Lo que se mide en un dispositivo de gama alta cargado y en wifi no se parece a lo que vive el usuario.

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Medir el arranque en frío, no el caliente | Es la primera impresión y la que se recuerda | Medir con la app ya en memoria | Reinicio del dispositivo y primer arranque |
| Nada bloqueante en el arranque | Cada SDK que se inicializa antes de la primera pantalla lo retrasa | Inicializar todo por comodidad | Perfilado del arranque, SDK por SDK |
| Rendimiento percibido antes que el medido | El usuario juzga la respuesta, no el total | Optimizar el tiempo total y dejar la pantalla en blanco | Grabar la pantalla y contar hasta el primer contenido útil |
| Presupuesto de energía y datos | La app que gasta batería se desinstala | No mirarlo nunca | Perfilado de energía y de red en sesión larga |
| Imágenes al tamaño que se muestran | Es el consumo dominante de memoria y de datos | Servir la original y escalar en el cliente | Inspeccionar tamaños descargados frente a los mostrados |
| Probar en el dispositivo más flojo soportado | Es el que define la experiencia mínima | Probar solo en el equipo de desarrollo | Dispositivo antiguo, batería baja, red degradada |

## Datos locales

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Migración probada desde toda versión anterior | El usuario puede saltar varias versiones de una vez | Probar solo desde la inmediatamente anterior | Instalar una versión antigua, generar datos, actualizar |
| Migración fallida sin pérdida de datos | Un fallo aquí es irreversible para el usuario | Borrar la base local al fallar la migración | Provocar el fallo y comprobar qué queda |
| Caché con política de expiración y tamaño | Crece hasta que el sistema la borra en el peor momento | Cachear sin límite | Sesión larga y comprobación de tamaño |
| Distinguir caché de dato del usuario | El sistema puede borrar la caché sin avisar | Guardar en caché lo que no se puede regenerar | Vaciar la caché y comprobar que no se pierde nada propio |

Los secretos y los datos sensibles no entran en esta tabla: van en [../../security/mobile/mobile.md](../../security/mobile/mobile.md).

## Observabilidad

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Informe de fallos con símbolos resueltos | Un rastro sin resolver no sirve para nada | No subir los símbolos en cada publicación | Provocar un fallo en una compilación de publicación |
| Métricas por versión de app y de sistema | Los problemas se concentran en combinaciones concretas | Agregar todo junto | Segmentar un incidente real |
| Telemetría mínima y declarada | Debe cuadrar con lo declarado en la tienda | Recoger «por si acaso» | Auditar lo que se envía, incluido lo de cada SDK |
| Vigilar la tasa de sesiones sin fallo | Es la señal de salud que correlaciona con la valoración | Mirar solo el número absoluto de fallos | Panel por versión. Ver [../../backend/observability/observability.md](../../backend/observability/observability.md) |

## Entrega

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Publicación por fases | Limita el daño de un fallo que no se vio | Publicar al cien por cien de golpe | Comprobar que se puede pausar a mitad |
| Interruptor remoto en toda función nueva | Es la única contención que no depende de la tienda | Depender de una corrección rápida | Apagar la función en producción sin publicar |
| Criterio de reversión definido antes de publicar | Con el incidente encima no se decide bien | Improvisar el umbral | Escribir el umbral en la nota de la versión |
| Compilación reproducible y versionada | Hay que poder atar un fallo a un commit | Publicar desde una máquina local | Publicar solo desde integración continua |
| Prueba con usuarios internos antes de cada versión | Detecta lo que la automatización no ve | Saltárselo por prisa | Que la versión candidata sea la que se publica |

Regla que resume la sección: **no se publica lo que no se puede apagar.** En una plataforma donde revertir cuesta días, el interruptor es la reversión.
