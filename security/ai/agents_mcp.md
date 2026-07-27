---
id: ai/agents_mcp
tipo: catalogo
estabilidad: permanente
---

# Agentes, herramientas y MCP

Un agente es un LLM con **capacidad de actuar**. Eso convierte cada debilidad de [ai/ai.md](ai.md) en un riesgo con efecto en el mundo real: no es que el modelo diga algo indebido, es que ejecuta algo indebido.

## El problema estructural: confused deputy

El agente actúa con **sus** privilegios, mientras interpreta instrucciones que pueden venir de cualquiera que controle algún dato de su contexto. Es el patrón clásico del *diputado confundido*: una entidad privilegiada engañada para usar su privilegio en beneficio de otro.

De ahí la regla que gobierna todo el diseño: **el agente nunca debe poder hacer nada que el usuario en cuyo nombre actúa no pudiera hacer por sí mismo**. Si esto se cumple, una inyección exitosa se degrada de "compromiso del sistema" a "el usuario hizo algo que ya podía hacer".

## Superficie del agente

| Componente | Riesgo | Control |
|---|---|---|
| Prompt del sistema | Fuga; contiene reglas y a veces secretos | Sin secretos; asumirlo público |
| Entrada del usuario | Inyección directa | Autorización externa; límites de agencia |
| Contenido recuperado | **Inyección indirecta**: el vector principal | Procesar sin herramientas disponibles; marcar como no confiable |
| Definiciones de herramientas | Tool poisoning: la descripción de la herramienta es texto que el modelo obedece | Revisar y fijar las definiciones; verificar su integridad |
| Resultados de herramientas | Devuelven contenido del atacante al contexto | Tratar como no confiable; validar contra esquema |
| Memoria persistente | Persistencia entre sesiones de la instrucción maliciosa | Memoria estructurada, revisable, con caducidad |
| Bucle de planificación | Ejecución no acotada, coste, acciones en cascada | Límites de iteraciones, tiempo y coste |
| Credenciales del agente | Suelen ser amplias y de larga vida | Credenciales por tarea, de vida corta, con el alcance mínimo |
| Comunicación entre agentes | Un agente comprometido manipula a otro | Autenticación entre agentes, validación de mensajes, sin confianza transitiva |

## Ataques específicos de agentes

| Ataque | Mecánica | Mitigación |
|---|---|---|
| **Tool poisoning** | La descripción de una herramienta contiene instrucciones ocultas que el modelo lee y obedece | Revisión de definiciones, fijación por hash, alerta ante cambios |
| **Rug pull** | Una herramienta legítima cambia su definición después de haber sido aprobada | Pinning de versión, verificación de integridad en cada carga |
| **Tool shadowing** | Una herramienta maliciosa altera el comportamiento del agente respecto a otra herramienta | Aislamiento entre servidores de herramientas, espacios de nombres |
| **Tool hijacking / confused deputy** | Inducir al agente a invocar una herramienta legítima con parámetros del atacante | Validación de parámetros, autorización por acción, confirmación humana |
| **Agent hijacking** | Tomar el control del objetivo del agente mediante contenido inyectado | Separación entre planificación y datos no confiables |
| **Memory poisoning** | Escribir en la memoria persistente una instrucción que se aplicará después | Memoria con esquema, sin texto libre interpretado como instrucción |
| **Excessive agency** | El agente tiene permisos o herramientas que su tarea no requiere | Mínima agencia: menos herramientas, menor alcance |
| **Cascading failure** | Una salida errónea alimenta a otro agente que actúa sobre ella | Validación entre etapas, puntos de control humanos |
| **Goal manipulation** | Alterar sutilmente el objetivo para que el agente crea que actúa correctamente | Objetivo fijado fuera del contexto manipulable; verificación de la acción contra el objetivo original |
| **Denial of wallet** | Bucle infinito o tareas costosas inducidas | Límites duros de coste, tiempo e iteraciones |
| **Exfiltración por herramienta** | Usar una herramienta legítima de red o de escritura como canal de salida | Allow-list de destinos; sin acceso a red arbitraria |
| **Robo de credenciales del agente** | Las credenciales están en su entorno de ejecución | Secretos inyectados por el orquestador, nunca visibles en el contexto del modelo |

## MCP (Model Context Protocol)

Protocolo que conecta modelos con servidores que exponen herramientas, recursos y prompts. Su superficie de seguridad:

| Riesgo | Detalle | Control |
|---|---|---|
| Servidor MCP de origen no verificado | Ejecuta código en la máquina del usuario y ve todo lo que se le pasa | Instalar solo servidores revisados; tratar cada uno como una dependencia con permisos amplios |
| Descripciones de herramientas maliciosas | Tool poisoning en el propio protocolo | Revisar las definiciones expuestas; fijarlas y detectar cambios |
| Servidor comprometido tras la aprobación | Rug pull | Verificación de integridad en cada arranque; versiones fijadas |
| Credenciales entregadas al servidor | Tokens con alcance excesivo | Un token por servidor, con el alcance mínimo y vida corta |
| Servidor con acceso al sistema de archivos o a la red | Lectura y escritura arbitrarias en nombre del usuario | Restringir rutas y destinos; ejecución en sandbox o contenedor |
| Confianza transitiva entre servidores | Un servidor devuelve contenido que otro obedece | Aislamiento y validación de resultados |
| Transporte sin autenticación | Suplantación del servidor | Autenticación y canal cifrado; en local, sockets con permisos correctos |
| Registro insuficiente | Sin traza de qué herramienta hizo qué | Log de cada invocación con argumentos y resultado |
| Elicitación y prompts del servidor | El servidor puede inyectar contenido en el contexto | Tratar todo lo que llega del servidor como no confiable |

Regla práctica: **un servidor MCP tiene, como mínimo, los permisos del usuario que lo ejecuta**. Añadir uno equivale a instalar software con acceso a los datos de la sesión, no a añadir una función aislada.

## Diseño seguro de herramientas

| Principio | Aplicación |
|---|---|
| Alcance mínimo | Una herramienta que lee un ticket concreto, no una que ejecuta consultas arbitrarias |
| Parámetros tipados y validados | Esquema estricto; rechazar lo que no encaje, sin coerción silenciosa |
| Sin herramientas de propósito general | `ejecutar_sql`, `ejecutar_shell` o `http_request` genérico son equivalentes a dar RCE al atacante |
| Idempotencia y reversibilidad | Preferir operaciones que se puedan deshacer |
| Autorización dentro de la herramienta | La herramienta comprueba los permisos del usuario final, no confía en que el agente ya lo hizo |
| Confirmación explícita para lo irreversible | Mostrar la acción concreta, no un resumen generado por el modelo |
| Límites de tasa por herramienta | Contiene bucles y abuso |
| Registro con argumentos completos | Sin esto no hay investigación posible |
| Separación por sensibilidad | Las herramientas de lectura y las de escritura no deben estar disponibles en el mismo contexto que procesa datos no confiables |

## Aislamiento de la ejecución

Todo código generado por un modelo se ejecuta bajo estos supuestos:

| Requisito | Motivo |
|---|---|
| Contenedor o microVM efímera | El código puede ser hostil |
| Sin acceso a la red, o solo a destinos declarados | Evita exfiltración y descarga de herramientas |
| Sin credenciales en el entorno | Ni variables, ni archivos de configuración, ni metadata cloud |
| Sistema de archivos acotado y de solo lectura salvo un directorio de trabajo | Contiene el daño |
| Límites de CPU, memoria, PID y tiempo | Evita DoS y bucles |
| Destrucción tras la ejecución | Sin persistencia entre tareas |
| Registro de lo ejecutado | Trazabilidad |

Ver [containers/containers.md](../containers/containers.md) para la configuración concreta.

## Autonomía y supervisión

| Nivel | Descripción | Cuándo es aceptable |
|---|---|---|
| Sugerencia | El agente propone, el humano ejecuta | Siempre |
| Aprobación por acción | El humano aprueba cada acción con efecto | Operaciones sensibles o irreversibles |
| Aprobación por plan | El humano aprueba una secuencia completa | Tareas rutinarias de riesgo medio |
| Autónomo con límites | El agente actúa dentro de un alcance acotado y reversible | Acciones de bajo impacto, reversibles y auditadas |
| Autónomo sin límites | — | Nunca sobre sistemas de producción o datos reales |

La aprobación humana solo funciona si es **informada**: mostrar la acción real y sus parámetros, no una descripción generada por el mismo modelo que podría estar comprometido. Una confirmación que dice "¿Enviar el correo?" sin mostrar destinatario y contenido no es un control.

## Identidad de los agentes

Los agentes son identidades no humanas que actúan de forma continua y a gran escala. Requieren el mismo gobierno que cualquier otra:

- **Identidad propia y distinguible**, no credenciales de una persona.
- **Propietario responsable** y justificación documentada.
- **Alcance mínimo**, revisado periódicamente.
- **Credenciales de vida corta**, obtenidas por federación y no almacenadas.
- **Caducidad** y proceso de baja.
- **Trazabilidad de la delegación**: qué usuario originó la acción que el agente ejecutó.
- **Revocación inmediata** disponible y probada.

## Detección

| Señal | Interpretación |
|---|---|
| Invocación de una herramienta que la tarea no requiere | Inyección exitosa |
| Argumentos fuera del rango o del patrón esperado | Manipulación de parámetros |
| Cambio en la definición de una herramienta o de un servidor MCP | Rug pull o tool poisoning |
| Número de iteraciones o coste por encima del percentil habitual | Bucle o abuso |
| Acceso del agente a recursos fuera de su alcance declarado | Escalada |
| Escritura en memoria persistente con contenido con forma de instrucción | Memory poisoning |
| Salida con URLs o destinos externos no previstos | Exfiltración |
| Ejecución de código con intentos de acceso a red o a credenciales | Payload hostil en el sandbox |
| Divergencia entre el objetivo original y las acciones ejecutadas | Goal manipulation |

## Lista de verificación antes de desplegar un agente

1. ¿Qué puede hacer el agente que el usuario no podría? — La respuesta debe ser "nada".
2. ¿Qué ocurre si el contenido que procesa es hostil? — El impacto debe estar acotado y ser reversible.
3. ¿Toda acción irreversible requiere confirmación humana informada?
4. ¿Las credenciales son de vida corta, con alcance mínimo, y quedan fuera del contexto del modelo?
5. ¿El código generado se ejecuta aislado, sin red ni secretos?
6. ¿Hay límites duros de coste, tiempo e iteraciones?
7. ¿La traza completa queda registrada y es auditable?
8. ¿Las definiciones de herramientas y servidores están fijadas y verificadas?
9. ¿Existe un mecanismo de parada de emergencia probado?
10. ¿Se ha hecho red teaming con inyección indirecta sobre las fuentes reales que el agente consulta?
