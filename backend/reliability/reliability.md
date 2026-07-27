---
id: reliability/reliability
tipo: catalogo
estabilidad: permanente
---

# Fiabilidad y modos de fallo

Catálogo de controles frente a los modos en que falla el I/O ([núcleo, modelo b](../SKILL.md)). Reintentos e idempotencia se apoyan en [api/api.md](../api/api.md); la deduplicación y la reconciliación asíncrona se explican en [concurrency/concurrency.md](../concurrency/concurrency.md).

## Presupuesto de tiempo

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Tiempo de espera en toda llamada externa, sin excepción | El valor por defecto de la mayoría de los clientes es "esperar indefinidamente" | Una llamada a una dependencia no tiene tiempo de espera configurado | Ninguna llamada externa puede bloquear más allá de un límite explícito |
| Separar tiempo de espera de conexión, de lectura y total | Cada fase falla de forma distinta y necesita un límite propio | Se configura un único tiempo de espera genérico para toda la operación | Una conexión lenta y una respuesta lenta se detectan y cortan por separado |
| Propagar el plazo: el trabajo cuyo cliente ya se fue debe morir, no seguir hasta el final | Seguir trabajando para un cliente que ya no espera desperdicia recursos que otros necesitan | El servidor sigue procesando una petición después de que el cliente cortó la conexión | El trabajo se cancela cuando el plazo del cliente expira, en vez de completarse igualmente |
| El tiempo del llamante debe ser mayor que la suma de los internos, nunca al revés | Si el interno tarda más que lo que el externo va a esperar, el externo siempre corta antes de tiempo | El tiempo de espera de una llamada interna es igual o mayor que el de la petición que la originó | El presupuesto de tiempo se reparte correctamente entre las llamadas anidadas de una misma petición |

## Reintentos

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Reintentar solo lo idempotente | Reintentar una operación no idempotente duplica su efecto en silencio | Se reintenta automáticamente una creación sin clave de idempotencia | Un reintento automático nunca produce un efecto adicional al de la ejecución original |
| Retroceso exponencial con aleatoriedad (jitter) | Sin aleatoriedad, todos los clientes que fallaron a la vez vuelven a intentarlo a la vez | El retroceso es exponencial pero fijo, sin componente aleatorio | Tras un fallo masivo, los reintentos se distribuyen en el tiempo en vez de llegar todos juntos |
| Presupuesto de reintentos acotado como porcentaje del tráfico | El reintento es el amplificador que convierte una degradación parcial en una caída total | Cada cliente reintenta sin límite ante cualquier fallo | El tráfico total hacia una dependencia degradada no se multiplica sin control por los reintentos |
| No reintentar en cada capa de la cadena de llamadas | Tres capas con tres intentos cada una son veintisiete peticiones por un solo fallo de origen | Cada servicio de la cadena reintenta de forma independiente sin coordinación | El número de intentos totales contra el servicio de origen está acotado, no multiplicado por capa |
| Respetar el `Retry-After` que devuelve el servidor | El servidor sabe mejor que el cliente cuánto tiempo necesita para recuperarse | El cliente reintenta con su propio temporizador, ignorando la indicación del servidor | El siguiente reintento respeta como mínimo el tiempo indicado por el servidor |

## Aislamiento del fallo

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Interruptor (circuit breaker) que deja de llamar a una dependencia que está fallando | Seguir llamando a algo caído agrava el problema y consume recursos propios sin resultado | El servicio sigue intentando llamar a una dependencia caída en cada petición | Con la dependencia caída, las llamadas fallan rápido sin intentar la red, y se sondea la recuperación de forma controlada |
| Mamparo (bulkhead): pool o límite de concurrencia por dependencia | Una dependencia lenta no debe poder consumir todos los recursos compartidos | Todas las dependencias comparten el mismo pool de conexiones o de hilos | Una dependencia lenta agota solo su propio cupo de recursos, sin afectar a las demás |
| Declarar por escrito qué dependencias son críticas y cuáles opcionales | Sin esa declaración, cada incidente descubre la respuesta de la peor manera | Todas las dependencias se tratan como igual de críticas por defecto | Existe una lista explícita de dependencias críticas frente a opcionales, revisada |
| Degradación elegante: qué se sigue pudiendo hacer sin una dependencia opcional caída | El todo-o-nada convierte un fallo parcial y menor en una caída total innecesaria | El servicio completo falla porque una funcionalidad secundaria no está disponible | Con una dependencia opcional caída, el resto de la funcionalidad sigue disponible, con aviso |

## Fallo parcial

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Resolver sin adivinar la duda de "la escritura que quizá ocurrió" | Adivinar (asumir éxito o asumir fallo) produce corrupción de datos en el caso contrario | Ante una respuesta ambigua (tiempo agotado, conexión cortada) se asume que la operación falló y se reintenta sin comprobar | Antes de reintentar una operación de dudoso resultado, se comprueba el estado real en vez de asumir |
| Preguntar en cada paso con efecto secundario: "¿y si el proceso muere justo aquí?" | Es la única forma sistemática de encontrar las ventanas de inconsistencia antes de que ocurran en producción | El diseño no contempla qué pasa si el proceso se interrumpe entre dos efectos secundarios relacionados | Cada paso con efecto secundario tiene una respuesta explícita a esa pregunta |
| Reconciliación periódica como mecanismo de primera clase | Detecta y corrige las discrepancias que el mejor diseño no puede evitar del todo | La reconciliación solo se hace de forma manual y reactiva cuando alguien nota un problema | Existe un proceso periódico automático que detecta y corrige discrepancias conocidas |

## Ciclo de vida del proceso

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| No aceptar tráfico antes de validar la configuración y estar listo | Aceptar tráfico antes de estar listo produce errores evitables en el arranque | El proceso empieza a aceptar conexiones antes de haber completado su inicialización | Ninguna petición llega al proceso antes de que complete sus comprobaciones de arranque |
| Distinguir sonda de "vivo" de sonda de "listo" | Confundirlas provoca que un orquestador reinicie procesos sanos pero temporalmente ocupados | El proceso responde "vivo" y "listo" con la misma comprobación | Bajo carga alta pero sana, el proceso se reporta vivo aunque momentáneamente no listo, sin reinicios en cascada |
| Apagado ordenado: dejar de aceptar, drenar del balanceador, terminar lo empezado, cerrar recursos | Un apagado abrupto corta trabajo en curso y deja conexiones a medio terminar | El proceso se apaga en cuanto recibe la señal, sin drenar el trabajo en curso | Al apagarse, el trabajo en curso termina dentro del período de gracia antes de que el proceso desaparezca |

## Efectos de rebaño

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Caducidad con jitter para evitar la estampida al expirar una clave de caché caliente | Si todos los datos caducan a la vez, todas las peticiones golpean el origen a la vez | Todas las entradas de caché se cargan con el mismo tiempo de vida fijo | Las caducidades de claves relacionadas están distribuidas, no sincronizadas |
| Refresco anticipado o un único proceso repuebla mientras el resto sirve el valor antiguo | Evita que múltiples procesos reconstruyan el mismo valor caro a la vez | Cada petición que encuentra la caché expirada dispara su propia reconstrucción | Solo una reconstrucción está en curso a la vez para la misma clave caliente |
| Anticipar reintentos sincronizados y arranques en frío simultáneos de toda la flota | Un evento que afecta a todas las instancias a la vez (despliegue, caída de dependencia) las sincroniza sin querer | Todas las instancias reintentan o arrancan exactamente al mismo ritmo tras un evento común | El tráfico generado por un evento que afecta a toda la flota está distribuido en el tiempo, no concentrado |

## Objetivos explícitos y recuperación ante desastre

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Indicador y objetivo de nivel de servicio declarados, con presupuesto de error | Sin objetivo explícito, "fiable" no significa nada medible ni permite decidir cuánto riesgo asumir | No existe ningún objetivo de disponibilidad o latencia declarado para el servicio | El servicio tiene SLI/SLO documentados y el presupuesto de error se consulta antes de asumir riesgo |
| Recuperación ante desastre con número: qué se pierde y cuánto se tarda | Un plan de recuperación sin número no es un plan, es una esperanza | El plan de recuperación describe pasos pero no compromete un tiempo ni un punto de recuperación | El objetivo de tiempo y de punto de recuperación están declarados y se han ensayado ([data/data.md](../data/data.md)) |

## Los seis controles que más reducen la indisponibilidad

1. Tiempo de espera en toda llamada externa, sin excepción.
2. Interruptor por dependencia, con estado semiabierto de sondeo.
3. Reintentos con retroceso exponencial, jitter y presupuesto acotado.
4. Mamparo de recursos por dependencia.
5. Apagado ordenado con drenado y período de gracia.
6. Presupuesto de error declarado, consultado antes de cada cambio de riesgo.
