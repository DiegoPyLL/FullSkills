---
id: art/art
tipo: modelo
estabilidad: permanente
---

# Atomic Red Team — validación de detecciones

Atomic Red Team no prueba la seguridad de la organización: **prueba la telemetría y las reglas**. La distinción no es un matiz — decide qué se concluye de cada resultado. Un test en verde significa «esta regla, ante esta implementación concreta, produjo una alerta», y nada más.

La unidad es la **prueba atómica**: una técnica, un comando, un observable esperado, un procedimiento de limpieza. Reproducible, corta y barata. Ese es su valor: cierra el bucle del ciclo de vida de una detección ([../detection/detection.md](../detection/detection.md#ciclo-de-vida-de-una-deteccion)), donde el paso que casi siempre falta es *comprobar que la regla dispara de verdad*.

Contenido metodológico: el inventario de atomics y los parámetros del ejecutor cambian con el proyecto. **No citar de memoria un número de pruebas ni un parámetro exacto** — verificar en el repositorio antes de afirmarlo.

## 1. Qué es y qué no es

| Se confunde con | Diferencia real |
|---|---|
| Pentesting | El pentest busca **acceso** y encadena fallos; el atomic busca **señal** y ejecuta una técnica aislada. Metodología en [../pentesting/pentesting.md](../pentesting/pentesting.md) |
| Red team | El red team emula a un adversario con objetivo y sigilo, y evalúa a las personas y al proceso. El atomic no evade nada: se ejecuta a plena luz |
| Emulación de adversario | La emulación reproduce la cadena completa de un actor concreto y en orden (CALDERA, planes de emulación). El atomic es una pieza suelta, sin cadena |
| BAS comercial | Producto de ejecución continua y panel propio. Atomic Red Team es un repositorio abierto de pruebas más un ejecutor; la continuidad la pone quien lo usa |
| Escaneo de vulnerabilidades | El escáner busca versiones vulnerables; el atomic ejecuta comportamiento. No se solapan |

Complementarios, no sustitutos: el atomic dice **si la regla existe y dispara**; el red team dice **si el equipo detiene una intrusión real**. Empezar por el segundo sin haber hecho el primero desperdicia el ejercicio caro descubriendo que faltaba un log.

## 2. El modelo atómico

Cada prueba se define en YAML bajo la técnica de ATT&CK a la que corresponde, con la carpeta nombrada por el identificador (`atomics/T1059.001/`). Los campos que importan al razonar:

| Campo | Para qué sirve |
|---|---|
| Técnica de ATT&CK | Ancla la prueba al marco y permite agregar cobertura. Ver [../mitre_attack.md](../mitre_attack.md) |
| Nombre y descripción | Qué procedimiento concreto implementa, que casi nunca es el único posible para esa técnica |
| Plataformas soportadas | Windows, Linux, macOS. Un verde en una plataforma no dice nada de las otras |
| Argumentos de entrada | Parámetros con valor por defecto; cambiarlos cambia el observable |
| Dependencias y su resolución | Qué debe existir antes; se comprueban y se satisfacen en pasos separados |
| Ejecutor | Intérprete que lanza el comando, o `manual` cuando requiere intervención |
| Comando de limpieza | Cómo revertir. Su ausencia es en sí una advertencia sobre el test |

El ejecutor habitual es el módulo de PowerShell `Invoke-AtomicRedTeam`, que expone la ejecución, la comprobación previa de requisitos, la resolución de dependencias, el detalle del test sin ejecutarlo y la limpieza como operaciones independientes. **Comprobar requisitos y ejecutar la limpieza son pasos propios, no automáticos**: quien los omite deja el host modificado.

## 3. Protocolo de una sesión de validación

1. **Elegir la técnica por amenaza, no por orden alfabético.** La lista sale del perfil de amenaza real de la organización — sector, actores conocidos, tecnología desplegada. Insumos: [../cti/cti.md](../cti/cti.md) y [../mitre_attack.md](../mitre_attack.md).
2. **Escribir el observable esperado *antes* de ejecutar.** Qué evento, de qué fuente, con qué campos. Este es el paso que separa la validación del teatro: si se mira el SIEM primero y se decide después qué se esperaba, siempre sale verde.
3. **Verificar que la fuente de telemetría está activa** en ese host concreto ([../detection/detection.md](../detection/detection.md#requisito-previo-telemetria)). Sin este paso no se puede distinguir «no hay regla» de «no hay log».
4. **Ejecutar en un host con autorización explícita**, dentro de la ventana acordada y con un identificador de ejecución registrado.
5. **Observar en tres puntos, no en uno**: ¿llegó el evento a la plataforma? ¿disparó la regla? ¿llegó la alerta a quien debía verla?
6. **Clasificar el resultado** con la tabla de la sección 4 y registrar la fecha.
7. **Limpiar y verificar la limpieza a mano.** El comando de limpieza puede fallar en silencio.

## 4. Los cuatro resultados posibles

Es la tabla más útil del módulo, porque obliga a separar dos fallos que los equipos suelen agregar como «no lo detectamos», cuando el arreglo es completamente distinto:

| ¿Llegó la telemetría? | ¿Disparó la regla? | Diagnóstico | Acción y prioridad |
|---|---|---|---|
| No | No | **Ciego.** Falta la fuente de log o no cubre ese host | Prioridad 1: arreglar la telemetría. Escribir reglas antes de esto no sirve de nada |
| Sí | No | **Hueco de detección.** El dato estaba, nadie preguntó por él | Escribir la regla. Es el caso barato y el más frecuente |
| Sí | Sí, pero no hubo alerta útil | **Fallo de tubería.** Enrutado, severidad, deduplicación o destino mal configurados | Arreglar el proceso, no la regla. Suele ser el fallo más caro en un incidente real |
| Sí | Sí, con alerta | **Validado en esta fecha** | Registrar fecha y versión de la regla. Caduca: ver sección 7 |

Un quinto resultado que conviene registrar aparte: **la prueba fue bloqueada**. Prevenido no es lo mismo que detectado — si el control bloquea pero no genera alerta, la organización está protegida frente a *esa* implementación y ciega frente a una variante que lo esquive.

## 5. Lo que un atomic no prueba

- **No prueba que se detectaría al adversario.** El atomic ejecuta *un* procedimiento de la técnica; el adversario usa otro. Verde en volcado de credenciales con una herramienta no dice nada sobre el mismo objetivo alcanzado por otra vía. La distinción técnica/procedimiento está en [../mitre_attack.md](../mitre_attack.md) y es la fuente número uno de conclusiones infladas.
- **Los mapas de cobertura mienten por diseño.** Pintar de verde una técnica entera en un mapa de ATT&CK porque un atomic disparó convierte una muestra en una afirmación general. La cobertura honesta se cuenta por procedimiento probado, y se anota como fracción, no como color.
- **No prueba prevención.** Ver la nota de la sección 4.
- **No prueba la respuesta humana.** Que la alerta exista no dice si alguien la triará, en cuánto tiempo y con qué criterio. Eso lo mide un ejercicio con el turno real, no un script.
- **No prueba el entorno de producción si se ejecuta en el laboratorio.** Las diferencias de configuración, de agente y de red son justamente donde fallan las detecciones.

## 6. Seguridad operativa de la ejecución

Ejecutar comportamiento ofensivo en infraestructura propia sigue siendo ejecutar comportamiento ofensivo.

| Requisito | Por qué |
|---|---|
| Autorización por escrito, con alcance y ventana | Mismo estándar que un pentest: [../pentesting/pentesting.md](../pentesting/pentesting.md#reglas-de-engagement-sow) |
| Identificador de ejecución registrado y comunicado | Para que una alerta generada por la prueba no se investigue como incidente real, ni al revés |
| Revisar el test antes de lanzarlo | Hay pruebas destructivas o que alteran configuración persistente. Leer el comando y su limpieza no es opcional |
| Nunca contra un controlador de dominio o un activo crítico sin aprobación específica | El coste de un fallo ahí no lo justifica ninguna métrica de cobertura |
| Comprobar requisitos primero, limpiar después, verificar la limpieza a mano | El estado residual de una prueba se convierte en el falso positivo del mes siguiente |
| Vigilar lo que el test descarga | Algunas pruebas traen herramientas de internet: eso cambia el perfil de riesgo y puede violar la política |
| Decidir de antemano si el SOC está avisado | Avisado mide la regla; sin avisar mide también la respuesta humana. Ambos son válidos; mezclarlos sin decidirlo no |

## 7. Métricas que sí dicen algo

| Métrica | Cómo se calcula | Qué revela |
|---|---|---|
| Técnicas con telemetría presente | Pruebas cuyo evento llegó / pruebas ejecutadas | Salud de la recolección. Es la métrica que hay que arreglar primero |
| Cobertura por procedimiento | Procedimientos que disparan regla / procedimientos probados | Cobertura honesta, sin inflar por técnica |
| Tiempo evento → alerta | Marca del evento frente a marca de la alerta | Latencia de la tubería, invisible hasta que se mide |
| **Deriva de detección** | Reglas antes en verde que fallan al reejecutar | La métrica que justifica repetir. Las reglas se rompen solas: cambia una versión, un formato de log o un agente, y nadie se entera hasta el incidente |

La deriva es el argumento entero a favor de la ejecución periódica. Una validación puntual describe un día; lo que importa es que la detección siga viva dentro de seis meses.

## Fuentes de referencia

| Recurso | Uso |
|---|---|
| [../detection/detection.md](../detection/detection.md) | Ciclo de vida de una detección, telemetría previa y falsos positivos |
| [../sigma/sigma.md](../sigma/sigma.md) | Escritura de la regla que el atomic valida |
| [../hunting/hunting.md](../hunting/hunting.md) | Hipótesis de caza que nacen de los huecos encontrados |
| [../mitre_attack.md](../mitre_attack.md) | Técnicas, procedimientos y mapas de cobertura |
| [../mitre_d3fend.md](../mitre_d3fend.md) | Contramedidas asociadas a cada técnica |
| [../pentesting/pentesting.md](../pentesting/pentesting.md) | Reglas de engagement y autorización |
| [../cti/cti.md](../cti/cti.md) | Priorización por amenaza real en lugar de por catálogo |
| [../frameworks.md](../frameworks.md) | Encaje con los marcos de control |
| [github.com/redcanaryco/atomic-red-team](https://github.com/redcanaryco/atomic-red-team) | Repositorio de pruebas atómicas |
| [github.com/redcanaryco/invoke-atomicredteam](https://github.com/redcanaryco/invoke-atomicredteam) | Ejecutor en PowerShell |
| [github.com/mitre/caldera](https://github.com/mitre/caldera) | Emulación de adversario encadenada, complemento del atomic |
