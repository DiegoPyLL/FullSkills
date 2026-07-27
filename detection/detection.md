---
id: detection/detection
tipo: modelo
estabilidad: permanente
---

# Ingeniería de detección

Producir detecciones que funcionen en producción: alta cobertura, resistencia a evasión y ruido asumible. Las reglas concretas están en [sigma](../sigma/sigma.md), [yara](../yara/yara.md), [snort](../snort/snort.md) y [suricata](../suricata/suricata.md).

## Jerarquía de valor de una detección

| Nivel | Sobre qué detecta | Coste de evasión para el atacante | Ejemplo |
|---|---|---|---|
| 1 | Hash | Recompilar: segundos | Bloqueo por firma |
| 2 | IP o dominio | Cambiar infraestructura: minutos | Lista de bloqueo |
| 3 | Artefacto (ruta, clave, nombre de servicio) | Cambiar configuración: horas | Nombre de named pipe |
| 4 | Herramienta | Cambiar de herramienta: días | Firma de Mimikatz |
| 5 | **Comportamiento (TTP)** | Cambiar de técnica: semanas o imposible | Acceso a LSASS con permisos de lectura de memoria |

Toda detección debe aspirar al nivel 5. Los niveles 1–3 son válidos como bloqueo inmediato y complemento, nunca como estrategia.

## Requisito previo: telemetría

Una detección solo existe si existe el dato. Antes de escribir una regla hay que verificar que la fuente está recogida, llega al SIEM y se conserva el tiempo suficiente.

| Prioridad | Fuente | Sin ella no se detecta |
|---|---|---|
| 1 | Creación de proceso **con línea de comandos** | Casi nada de lo que hace un atacante |
| 2 | Autenticación (Windows, Linux, cloud, VPN, IdP) | Movimiento lateral ni compromiso de identidad |
| 3 | Red: flujos, DNS, proxy | C2 ni exfiltración |
| 4 | Cambios en archivos y registro | Persistencia |
| 5 | Logs de aplicación y de servidor web | Explotación y web shells |
| 6 | Plano de control cloud | Todo lo que ocurre en la nube |
| 7 | Auditoría de directorio (AD, IdP) | Escalada y persistencia de identidad |
| 8 | EDR / eBPF | Inyección, evasión, memoria |
| 9 | Auditoría de contenedores y orquestador | Escapes y abuso de RBAC |

Comprobaciones que fallan con frecuencia: la línea de comandos no está habilitada en 4688; los logs de Linux no salen del host; los logs de los appliances de red no se recogen; la retención es de 30 días cuando el tiempo de permanencia del atacante es mayor.

## Ciclo de vida de una detección

1. **Hipótesis**: qué comportamiento adversario se quiere ver, anclado a una técnica de ATT&CK.
2. **Fuente de datos**: verificar que existe y llega.
3. **Lógica**: escribirla de forma que capture el comportamiento, no la herramienta.
4. **Validación positiva**: ejecutar la técnica en un entorno controlado (Atomic Red Team, Caldera) y confirmar que dispara.
5. **Validación negativa**: medir el ruido contra 30 días de datos históricos reales.
6. **Ajuste**: reducir falsos positivos por contexto, no bajando la sensibilidad.
7. **Documentación**: qué detecta, por qué importa, cómo triarla, qué hacer.
8. **Despliegue** con severidad y destino definidos.
9. **Revisión periódica**: ¿sigue disparando?, ¿sigue siendo relevante?, ¿ha cambiado el entorno?
10. **Retirada** cuando pierde valor. Una regla que nadie mira es peor que ninguna.

Una detección sin los pasos 4, 5 y 7 no está terminada: no se sabe si funciona, cuánto ruido genera ni qué hacer cuando dispare.

## Detección como código

| Práctica | Beneficio |
|---|---|
| Reglas en un repositorio con control de versiones | Historial, revisión, reversión |
| Formato portable (Sigma) con conversión al backend | Independencia del SIEM |
| Pruebas automáticas con eventos de ejemplo | Evita romper reglas al modificarlas |
| Pipeline de despliegue | Cambios controlados |
| Métricas por regla (disparos, tasa de verdaderos positivos, tiempo de triaje) | Decisión objetiva sobre mantener o retirar |
| Documentación junto a la regla | El analista de guardia no tiene que adivinar |

## Reducción de falsos positivos

| Método | Cuándo usarlo |
|---|---|
| Enriquecer con contexto (usuario, activo, criticidad, horario) | Siempre: la misma acción es normal en un administrador y anómala en un usuario |
| Excepción por proceso padre concreto y ruta | Preferible a excluir por nombre de archivo |
| Umbrales y agregación temporal | Cuando el evento aislado es normal pero la ráfaga no |
| Correlación de varias señales débiles | Convierte tres indicios ruidosos en una alerta fiable |
| Línea base por host o por usuario | Detección de novedad |
| Lista de exclusión con propietario y caducidad | Nunca exclusiones permanentes y sin dueño |

Antipatrones: excluir un directorio completo; excluir por nombre de usuario privilegiado (que es exactamente el que el atacante roba); reducir la severidad en vez de arreglar la lógica; desactivar la regla y no documentarlo.

## Detecciones de mayor rendimiento

Si solo se pudieran implementar veinte reglas, estas serían las candidatas. Todas son de comportamiento y de bajo ruido.

| # | Detección | Táctica |
|---|---|---|
| 1 | Proceso hijo de Office, PDF o navegador que sea intérprete o LOLBin | Ejecución |
| 2 | Proceso hijo de servidor web (`w3wp`, `httpd`, `nginx`, `java`) que sea shell | Web shell / explotación |
| 3 | Acceso a `lsass.exe` con permisos de lectura de memoria | Credenciales |
| 4 | 4662 con derechos de replicación de directorio desde host que no es DC | DCSync |
| 5 | 4769 con RC4 en volumen anómalo por una cuenta | Kerberoasting |
| 6 | Autenticación entre estaciones de trabajo | Movimiento lateral |
| 7 | Una cuenta autenticándose contra muchos hosts en poco tiempo | Movimiento lateral |
| 8 | Creación de servicio con nombre aleatorio (7045) | PsExec y variantes |
| 9 | `wsmprovhost.exe` o `WmiPrvSE.exe` con procesos hijo | Ejecución remota |
| 10 | Borrado de copias de sombra o de catálogos de backup | Preparación de impacto |
| 11 | Parada de servicios de seguridad o de backup | Preparación de impacto |
| 12 | 1102 (registro de seguridad limpiado) | Evasión |
| 13 | Pérdida de heartbeat del EDR en host activo | Evasión |
| 14 | Carga de driver de la lista de vulnerables conocidos | BYOVD |
| 15 | Herramienta RMM no corporativa instalada | Acceso remoto del atacante |
| 16 | Densidad de comandos de descubrimiento en una ventana corta | Reconocimiento |
| 17 | Beaconing: conexiones regulares al mismo destino | C2 |
| 18 | Compresión con contraseña en servidores de datos | Exfiltración |
| 19 | Desactivación o borrado de logs en la nube | Evasión cloud |
| 20 | Uso de credencial de rol de instancia desde IP externa al proveedor | Robo de credenciales cloud |

## Arquitectura de la plataforma

| Componente | Función | Consideración |
|---|---|---|
| Recolección | Agentes y reenvío | Verificar cobertura real: los huecos son invisibles hasta que hacen falta |
| Normalización | Esquema común (OCSF, ECS o propio) | Sin esquema estable, las reglas se rompen con cada cambio |
| Almacenamiento caliente | Búsqueda rápida | 30–90 días |
| Almacenamiento frío | Retención larga y barata | 12+ meses: el tiempo de permanencia lo exige |
| Motor de detección | Reglas en tiempo casi real | Latencia medida y controlada |
| Enriquecimiento | Activos, identidades, inteligencia | Convierte eventos en contexto |
| Casos y respuesta | Gestión del ciclo del incidente | Trazabilidad |
| Automatización | Respuesta a señales de alta confianza | Necesaria en la ventana de minutos previa al ransomware |

## Métricas que importan

| Métrica | Qué revela |
|---|---|
| Cobertura de ATT&CK **validada** | No cuántas técnicas se mapean, sino cuántas se probaron y dispararon |
| Tiempo medio de detección | Eficacia real |
| Tasa de verdaderos positivos por regla | Calidad de la detección |
| Alertas por analista y por turno | Sostenibilidad del SOC |
| Porcentaje de incidentes detectados internamente | La métrica más honesta: lo contrario es enterarse por un tercero |
| Huecos de telemetría conocidos | Riesgo aceptado de forma consciente |

Métrica engañosa: el número total de alertas. Más alertas no es mejor detección; suele ser lo contrario.
