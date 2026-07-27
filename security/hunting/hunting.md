---
id: hunting/hunting
tipo: modelo
estabilidad: permanente
---

# Threat hunting

Búsqueda **proactiva** de actividad adversaria que las detecciones existentes no han visto. Se distingue de la respuesta a alertas: aquí no hay alerta, hay hipótesis.

Premisa de partida: **asumir compromiso**. La pregunta no es "¿tenemos alertas?", sino "si estuvieran dentro, ¿dónde lo vería?".

## Tipos de caza

| Tipo | Punto de partida | Cuándo usarlo |
|---|---|---|
| Dirigida por hipótesis | "Si un atacante hiciera X, dejaría Y" | El más productivo; base del programa |
| Dirigida por inteligencia | Un informe describe TTPs de un actor relevante | Cuando hay CTI aplicable al sector |
| Dirigida por TTP (ATT&CK) | Técnicas sin cobertura de detección | Cierra huecos sistemáticamente |
| Analítica / anomalía | Desviaciones estadísticas de la línea base | Requiere datos maduros; complementa |
| Por agrupamiento (stack counting) | Frecuencia de valores en una población | Lo raro suele ser lo interesante |
| Reactiva ampliada | Tras un incidente, buscar la misma actividad en el resto | Obligatoria después de cada incidente |

## Método

1. **Hipótesis concreta y falsable.** "¿Hay malware?" no sirve. "Un atacante con acceso administrativo local habría accedido a LSASS desde un proceso no habitual en las últimas 30 días" sí.
2. **Identificar la fuente de datos** y confirmar que existe y cubre el periodo.
3. **Definir qué es normal** en ese entorno concreto antes de buscar lo anormal.
4. **Consultar**, empezando por lo amplio y refinando.
5. **Investigar los resultados**: cada uno se explica o se escala.
6. **Documentar**, incluidos los resultados negativos: "no encontrado" es información valiosa y evita repetir el trabajo.
7. **Convertir en detección** todo lo que resulte útil: la caza que no genera detecciones no escala.
8. **Registrar los huecos de datos** encontrados: suelen ser el hallazgo más importante.

Regla de oro: **una caza que no termina en una detección automatizada, en un control nuevo o en un hueco de telemetría documentado ha sido tiempo perdido**, aunque no encontrara nada.

## Catálogo de hipótesis por táctica

| Táctica | Hipótesis | Dónde buscar |
|---|---|---|
| Acceso inicial | Existen sesiones de VPN sin evento de autenticación correspondiente | Logs del gateway |
| Acceso inicial | Hay web shells en directorios de aplicaciones web | Archivos `.aspx`/`.jsp`/`.php` creados o modificados fuera de despliegues |
| Ejecución | Procesos de Office o de servidor web han lanzado intérpretes | Creación de proceso con relación padre-hijo |
| Persistencia | Existen tareas programadas, servicios o unidades no presentes en la línea base | Inventario comparado |
| Persistencia | Hay claves SSH autorizadas que nadie reconoce | `authorized_keys` de toda la flota |
| Persistencia | Existen suscripciones WMI no estándar | Repositorio WMI |
| Escalada | Hay binarios SUID fuera de baseline en servidores Linux | Inventario comparado |
| Credenciales | Algún proceso no habitual ha abierto LSASS | Sysmon E10 / EDR |
| Credenciales | Alguna cuenta que no es DC ha usado derechos de replicación | 4662 |
| Descubrimiento | Algún host ejecutó una ráfaga de comandos de enumeración | Creación de proceso agrupada por ventana temporal |
| Descubrimiento | Alguien ha consultado el directorio completo por LDAP | Auditoría de consultas costosas en el DC |
| Movimiento lateral | Existen autenticaciones entre estaciones de trabajo | 4624 tipo 3 con origen y destino en el rango de usuarios |
| Movimiento lateral | Alguna cuenta se autenticó contra muchos hosts en poco tiempo | Agregación por cuenta |
| C2 | Hay conexiones periódicas y regulares a un mismo destino externo | Análisis de deltas temporales en logs de proxy o de flujo |
| C2 | Algún host consulta un dominio con muchísimos subdominios distintos | Logs DNS |
| C2 | Hay túneles a servicios de exposición (ngrok y similares) | Proxy y DNS |
| Exfiltración | Algún host sube mucho más de lo que descarga | Flujos con relación subida/bajada |
| Exfiltración | Se ha ejecutado compresión con contraseña en servidores | Creación de proceso |
| Evasión | Hay huecos en la telemetría de algún host activo | Continuidad de eventos por host |
| Evasión | Se han cargado drivers de la lista de vulnerables | Carga de imagen en kernel |
| Cloud | Alguna credencial de rol de instancia se usó desde fuera del proveedor | Logs del plano de control |
| Cloud | Hay recursos en regiones que no se usan | Inventario |
| Identidad | Se registraron métodos MFA nuevos sin autenticación fuerte previa | Auditoría del IdP |
| Identidad | Hay aplicaciones OAuth con permisos amplios consentidas recientemente | Auditoría del IdP |

## Técnicas analíticas

| Técnica | Uso |
|---|---|
| **Stack counting** | Agrupar por un valor y ordenar por frecuencia: lo que aparece una sola vez en toda la flota merece revisión |
| **Detección de novedad** | Primera vez que un host, usuario o proceso hace algo | 
| **Análisis temporal** | Actividad fuera del horario propio del usuario o del servidor |
| **Agrupamiento por similitud** | Hosts con comportamiento anómalamente parecido: despliegue coordinado |
| **Análisis de cadena de procesos** | Árboles de proceso completos en vez de eventos aislados |
| **Comparación con línea base dorada** | Diferencia contra un sistema recién instalado |
| **Búsqueda de ausencias** | Un host que deja de enviar logs sigue vivo en la red: eso es una señal |
| **Enriquecimiento con criticidad del activo** | La misma anomalía no vale lo mismo en un portátil que en un DC |

## Errores frecuentes

| Error | Corrección |
|---|---|
| Buscar IOCs en vez de comportamientos | Los IOCs son para el SIEM automático, no para la caza |
| Hipótesis demasiado amplia | Acotar a una técnica y a una fuente concreta |
| No definir lo normal antes de buscar lo anormal | Sin línea base, todo parece sospechoso |
| No documentar los resultados negativos | Se repite el mismo trabajo |
| No convertir hallazgos en detecciones | La caza no escala |
| Cazar sin conocer el entorno | Se pierde tiempo en falsos positivos evidentes para quien conoce la red |
| Ignorar los huecos de datos | Son el hallazgo más accionable |
| Confundir caza con revisión de alertas | Son actividades distintas con objetivos distintos |

## Madurez del programa

| Nivel | Características |
|---|---|
| 0 | Sin caza; solo respuesta a alertas |
| 1 | Cazas puntuales y reactivas, sin método |
| 2 | Cazas por hipótesis documentadas, con calendario |
| 3 | Cazas rutinarias que alimentan sistemáticamente el catálogo de detecciones |
| 4 | Automatización de las cazas repetibles; el equipo se dedica a las nuevas |

Requisitos mínimos para empezar: telemetría de creación de proceso, de autenticación y de red, con retención de al menos 90 días, y una persona con tiempo dedicado. Sin retención, la caza solo ve el presente, y el presente ya está cubierto por las alertas.

## Relación con el resto del programa

| Entrada | Salida |
|---|---|
| Inteligencia de amenazas ([ioc/ioc.md](../ioc/ioc.md)) | Detecciones nuevas ([detection/detection.md](../detection/detection.md)) |
| Huecos de cobertura de ATT&CK ([mitre_attack.md](../mitre_attack.md)) | Controles nuevos ([hardening/hardening.md](../hardening/hardening.md)) |
| Lecciones de incidentes previos ([playbooks/ir_base.md](../playbooks/ir_base.md)) | Requisitos de telemetría documentados |
| Cambios en el entorno | Reducción del tiempo de permanencia del adversario |
