---
id: playbooks/ir_base
tipo: playbook
estabilidad: permanente
---

# Playbook base de respuesta a incidentes

Procedimiento común a **todos** los incidentes. Los playbooks específicos añaden solo lo que es propio de su escenario y dan por hecho todo lo de aquí.

## Principios que se incumplen con más frecuencia

1. **Aislar, no apagar.** Apagar destruye la memoria, que contiene claves de cifrado, procesos inyectados y conexiones activas. Desconectar de la red conserva ambas cosas.
2. **Contener a la vez, no por partes.** Aislar hosts uno a uno avisa al adversario y provoca que acelere o que active persistencias de reserva.
3. **Documentar desde el minuto cero.** La línea de tiempo se reconstruye mal a posteriori; lo que no se anota se pierde.
4. **Preservar antes de remediar.** Sin evidencia no se conoce el vector de entrada y la reconstrucción se vuelve a comprometer.
5. **Asumir que el adversario observa.** Si tiene acceso al correo o al chat corporativo, lee la coordinación de la respuesta. Canal fuera de banda desde el principio.
6. **No confundir "aislado" con "erradicado".** El acceso persistente puede estar en identidad, no en el host.
7. **Determinar el alcance antes de declarar el cierre.** Un incidente cerrado en falso reaparece en semanas.

## Fase 0 — Preparación (antes del incidente)

| Elemento | Requisito |
|---|---|
| Equipo y roles | Coordinador, técnicos, comunicación, legal, negocio; con suplentes |
| Autorizaciones previas | Quién puede aislar un servidor, desactivar una cuenta, cortar el acceso remoto — **decidido de antemano** |
| Canal fuera de banda | Mensajería y telefonía independientes del entorno corporativo |
| Herramientas | Recolección forense, captura de memoria, análisis, listas para desplegar |
| Telemetría | Fuentes recogidas y retención suficiente ([detection/detection.md](../detection/detection.md)) |
| Inventario | Activos, propietarios, criticidad, dependencias |
| Contactos | Proveedores, retainer de IR, aseguradora, autoridades competentes |
| Backups | Inmutables, offline y **con restauración probada** |
| Playbooks | Escritos y ensayados en simulacro |

Sin la fase 0, todas las demás se improvisan y se alargan por un factor de varias veces.

## Fase 1 — Detección y triaje

Preguntas iniciales, en orden:

1. ¿Qué se observó exactamente y cuál es la evidencia concreta?
2. ¿Es un verdadero positivo? Descartarlo mal es tan grave como perderlo.
3. ¿Qué sistemas, identidades y datos están implicados?
4. ¿Hay indicios de **operador humano** o es actividad automatizada? Cambia toda la respuesta.
5. ¿Qué fase de la cadena de ataque parece ser? Determina la urgencia.
6. ¿Está en curso ahora mismo?

Clasificación por impacto (NIST SP 800-61): impacto funcional, impacto sobre la información y **recuperabilidad**. La recuperabilidad es la que suele determinar la prioridad real.

Documentar desde aquí: hora de cada acción, quién la hizo, qué se observó y qué se decidió. En zona horaria única y explícita.

## Fase 2 — Contención

| Tipo | Cuándo | Cómo |
|---|---|---|
| Inmediata | Daño activo o en minutos | Aislamiento de red del host, bloqueo de cuenta, corte del acceso remoto |
| Coordinada | Intrusión con operador presente | Preparar todas las acciones y ejecutarlas simultáneamente |
| Con observación | Se necesita entender el alcance y el riesgo es controlable | Monitorizar sin actuar, con criterio de salida definido de antemano |

Decisión clave: **contener ya o seguir observando**. Contener antes de conocer el alcance deja persistencias sin descubrir; observar demasiado permite que el daño avance. Regla práctica: si hay riesgo de cifrado, destrucción o exfiltración masiva, se contiene inmediatamente; si el atacante está en fase de reconocimiento y la telemetría es buena, puede compensar observar unas horas con un plan de corte listo.

Acciones habituales: aislamiento de red conservando el host encendido; desactivación de cuentas comprometidas y **revocación de sus sesiones y tokens** (desactivar sin revocar no corta el acceso); bloqueo de indicadores en perímetro; corte del acceso remoto; segmentación de emergencia.

## Fase 3 — Recolección de evidencia

Orden de volatilidad: **memoria → estado de red y procesos → registro y logs → disco → backups**.

| Origen | Qué recoger |
|---|---|
| Host | Volcado de memoria, procesos y conexiones, logs de eventos completos, artefactos de ejecución, imagen de disco si procede |
| Red | Flujos, DNS, proxy, alertas del IDS, capturas si existen |
| Identidad | Autenticaciones, cambios de cuentas y de permisos, registros de MFA |
| Cloud | Logs del plano de control **de todas las regiones y cuentas**, plano de datos si está activo |
| Aplicación | Logs del servidor web, de la base de datos, de la aplicación |
| Backups | Estado, integridad, fecha del último punto conocido como limpio |

Cadena de custodia: hash de cada elemento, registro de quién lo recogió y cuándo, almacenamiento con acceso controlado. Si el incidente puede acabar en un procedimiento legal, esto deja de ser una formalidad.

## Fase 4 — Análisis

Objetivo: reconstruir la línea de tiempo completa y responder a seis preguntas.

| Pregunta | Por qué importa |
|---|---|
| **¿Por dónde entraron?** | Sin esto, la reconstrucción se vuelve a comprometer |
| ¿Cuándo? | Define el periodo a revisar en todos los logs |
| ¿Qué hicieron y en qué orden? | Determina el alcance real |
| ¿Qué credenciales obtuvieron? | Determina qué hay que rotar |
| ¿Qué datos accedieron o exfiltraron? | Determina las obligaciones legales |
| ¿Qué persistencia dejaron? | Determina si la erradicación será completa |

Método: partir del indicador conocido y expandir hacia atrás y hacia adelante; toda actividad se contrasta con la línea base; se buscan los mismos artefactos en el resto de la flota (raramente hay un solo sistema afectado); se mapea a ATT&CK para comunicar y para generar detecciones.

Regla: **la ausencia de evidencia en una fuente que no se recoge no es evidencia de ausencia**. Documentar los huecos de telemetría como parte del resultado.

## Fase 5 — Erradicación

Solo comienza cuando el alcance está determinado. Se ejecuta **de forma coordinada y simultánea**.

| Ámbito | Acciones |
|---|---|
| Identidad | Rotación de credenciales de usuarios, servicios, aplicaciones y cuentas de máquina; revocación de sesiones, tokens y claves de API; revisión de MFA registrado; doble reset de `krbtgt` si hubo compromiso de dominio; revisión de certificados emitidos |
| Persistencia en host | Tareas, cron, servicios, unidades, WMI, registro, perfiles, módulos, claves SSH — comparados contra línea base |
| Acceso remoto | Reglas de firewall añadidas, túneles, herramientas RMM, reglas de reenvío de correo |
| Cloud e identidad federada | Roles, políticas de confianza, service principals, aplicaciones consentidas, federación, funciones |
| Sistemas | Reconstrucción de todo host con compromiso a nivel administrativo. **Un host con acceso SYSTEM o root comprometido no se limpia: se reconstruye** |
| Vector inicial | Cerrado y verificado antes de reconectar nada |

## Fase 6 — Recuperación

| Paso | Criterio |
|---|---|
| Restaurar desde un punto **anterior al compromiso** | Verificado, no supuesto |
| Reconstruir sobre infraestructura limpia | No sobre la comprometida |
| Reintroducir por fases, empezando por lo crítico | Con monitorización reforzada |
| Verificar integridad y funcionalidad antes de abrir al negocio | Validación técnica y funcional |
| Monitorización intensificada durante semanas | El retorno del adversario es un escenario documentado |
| Declarar el cierre solo con criterios definidos | Sin actividad anómala, vector cerrado, persistencia erradicada, credenciales rotadas |

## Fase 7 — Post-incidente

Revisión en menos de dos semanas, **sin buscar culpables**. Contenido mínimo:

1. Línea de tiempo definitiva.
2. Causa raíz, no solo el vector técnico: por qué existía esa condición.
3. Qué funcionó y qué no, en detección y en respuesta.
4. Huecos de telemetría identificados.
5. Acciones concretas con propietario y fecha: cada hallazgo se convierte en un control, una detección o un cambio de proceso.
6. Actualización de los playbooks con lo aprendido.

Métrica de calidad del proceso: cuántos hallazgos del informe se convirtieron en cambios verificados noventa días después.

## Comunicación

| Audiencia | Contenido | Cadencia |
|---|---|---|
| Equipo técnico | Estado, hallazgos, siguientes pasos | Continua |
| Dirección | Impacto en el negocio, decisiones necesarias, previsión | Definida y sostenida |
| Legal y cumplimiento | Alcance de datos, obligaciones de notificación | Desde el inicio si hay indicio de acceso a datos |
| Usuarios | Qué se ve afectado y qué deben hacer | Cuando afecte a su trabajo |
| Externos (clientes, autoridades, terceros) | Según obligación legal y contractual | **Los plazos varían por jurisdicción y sector: consultar con legal, no asumir** |

Reglas: no comunicar hipótesis como hechos; no minimizar antes de conocer el alcance; usar el canal fuera de banda mientras el compromiso no esté acotado.

## Errores que más alargan un incidente

| Error | Efecto |
|---|---|
| Apagar los sistemas afectados | Pérdida de la memoria y de la evidencia más valiosa |
| Remediar sin analizar | Reinfección |
| Contener por fases | El adversario reacciona |
| Restaurar sin erradicar | Segundo cifrado o segunda intrusión |
| Buscar solo en el host que alertó | Alcance subestimado |
| Rotar credenciales parcialmente | El adversario mantiene el acceso |
| Coordinar por el correo comprometido | El adversario conoce el plan |
| Declarar cierre sin criterios | Falsa sensación de resolución |
| No documentar | Imposible aprender y difícil sostener legalmente |
