---
id: attacks/impact
tipo: catalogo
estabilidad: permanente
tactica: TA0040
---

# Impacto

El objetivo final: destruir, cifrar, manipular o interrumpir. Es la única táctica cuyo efecto es visible para el negocio, y por eso la que se detecta cuando ya es tarde.

Principio: **casi todo impacto tiene una fase preparatoria ruidosa**. Detener servicios, borrar copias de sombra, desactivar el EDR y desplegar por GPO ocurren minutos antes del daño y son detectables con alta precisión. La ventana es corta pero existe.

## Destrucción y denegación de datos

| Técnica | ATT&CK | Mecánica | Detección temprana | Mitigación |
|---|---|---|---|---|
| Cifrado para impacto (ransomware) | T1486 | Cifrado masivo de archivos, a menudo parcial para ir más rápido | Entropía creciente en escrituras; renombrado masivo; nota de rescate creada | Backups inmutables y offline; segmentación; [ransomware/ransomware.md](../ransomware/ransomware.md) |
| Destrucción de datos (wiper) | T1485 | Sobrescritura sin posibilidad de recuperación | Escrituras masivas de patrones constantes | Backups fuera de línea; el rescate no es opción |
| Borrado de disco / MBR | T1561 | Sobrescribir el sector de arranque o la estructura del sistema de archivos | Acceso en bruto a `\\.\PhysicalDrive` | Protección de acceso directo a disco por EDR |
| Inhibición de la recuperación | T1490 | `vssadmin delete shadows`, `wbadmin delete catalog`, `bcdedit /set recoveryenabled no`, borrado de puntos de restauración y de snapshots | **Detección de máxima prioridad**: estos comandos casi no tienen uso legítimo interactivo | Alerta y bloqueo inmediato; backups fuera del alcance del dominio |
| Destrucción de backups | T1490 | Acceso a la consola de backup, borrado de repositorios, cifrado de los propios respaldos | Autenticación anómala en la infraestructura de backup | **Regla 3-2-1-1-0**: una copia inmutable y una offline; backup en dominio separado con MFA |
| Cifrado de máquinas virtuales desde el hipervisor | T1486 | Apagar VM y cifrar los `.vmdk` directamente en el datastore | Apagado masivo de VM; SSH habilitado en ESXi | [vmware/vmware.md](../vmware/vmware.md) |
| Borrado en la nube | T1485 | Eliminar buckets, snapshots, bases de datos | Eventos `Delete*` masivos en CloudTrail/Activity Log | Versionado, borrado con MFA, retención con bloqueo de objeto, cuentas separadas |
| Eliminación del acceso de cuentas | T1531 | Cambiar contraseñas del administrador, expulsar a los defensores | Cambios masivos de credenciales por una sola cuenta | Cuentas de emergencia (break-glass) fuera del flujo normal, con MFA y custodiadas |

## Interrupción de servicio

| Técnica | ATT&CK | Mecánica | Detección | Mitigación |
|---|---|---|---|---|
| Parada de servicios | T1489 | Detener bases de datos, backup, EDR para poder cifrar sus archivos abiertos | 7036 masivo, `net stop`, `sc stop`, `taskkill` sobre servicios críticos | Alerta sobre parada de servicios críticos; protección antimanipulación |
| Apagado o reinicio | T1529 | Reinicio en modo seguro para evadir el EDR | `bcdedit /set safeboot`, `shutdown /r` | Alerta sobre cambios de configuración de arranque |
| DoS de red | T1498 | Saturación volumétrica o de protocolo | Métricas de tráfico | Protección anti-DDoS del proveedor, sobreaprovisionamiento |
| DoS de endpoint | T1499 | Agotar CPU, memoria, conexiones o disco de la aplicación | Latencia, saturación de recursos | Rate limiting, cuotas, timeouts, autoescalado con límite de gasto |
| DoS de aplicación con amplificación algorítmica | T1499.004 | Consultas costosas, expresiones regulares catastróficas, zip bombs | Latencia con poco tráfico | Límites de complejidad, timeouts, validación de tamaño |
| Corte de comunicaciones | T1565 | Modificar reglas de firewall o rutas | Cambios de configuración de red no aprobados | Gestión de configuración con control de cambios |

## Manipulación y fraude

| Técnica | ATT&CK | Mecánica | Detección | Mitigación |
|---|---|---|---|---|
| Manipulación de datos almacenados | T1565.001 | Alterar registros, saldos, resultados | Auditoría de integridad, hashes de referencia | Registros de solo anexado, firma de registros críticos |
| Manipulación de datos en tránsito | T1565.002 | Alterar transacciones al vuelo | Verificación extremo a extremo | Firma e integridad de mensajes |
| Manipulación en tiempo de ejecución | T1565.003 | Alterar lo que ve el operador | Comparación con la fuente de verdad | Separación de deber; verificación fuera de banda |
| Defacement | T1491 | Cambiar contenido público o interno | FIM en el webroot, monitorización externa | Despliegue inmutable, integridad de contenido |
| Fraude de transferencia (BEC) | T1565 | Alterar datos bancarios de un proveedor | Cambios en datos de pago; correo con dominio similar | Verificación fuera de banda obligatoria para cambios de cuenta bancaria |
| Secuestro de recursos (criptominería) | T1496 | Consumo de CPU/GPU o de cuota cloud | Uso de CPU sostenido; coste cloud anómalo | Límites de cuota, alertas de gasto, detección de procesos de minería |
| Abuso de recursos para proxy o spam | T1496 | Vender el ancho de banda del host | Tráfico saliente anómalo | Egress restringido |
| Envenenamiento de datos de IA | T1565 | Alterar datos de entrenamiento o de RAG | Validación de procedencia | [ai/ai.md](../ai/ai.md) |

## Impacto físico (OT/ICS)

Prioridad invertida respecto a TI: **seguridad de las personas y disponibilidad por encima de la confidencialidad**. Un parche que puede detener una planta puede ser inaceptable; la mitigación real es la segmentación.

| Técnica | Efecto | Mitigación |
|---|---|---|
| Manipulación de la lógica de control (PLC) | Alteración física del proceso | Segmentación Purdue, control de cambios en la lógica, detección de escritura en PLC |
| Denegación de vista al operador | El operador no percibe el estado real | Redundancia de instrumentación, HMI independiente |
| Denegación de control | El operador no puede actuar | Control manual de respaldo |
| Manipulación del sistema instrumentado de seguridad (SIS) | Riesgo directo para la vida | SIS aislado físicamente del resto, sin conectividad de gestión |
| Parada de emergencia inducida | Pérdida de producción y riesgo de arranque | Autenticación en comandos críticos |

## Secuencia previa al impacto: la ventana de detección

En un despliegue de ransomware típico, los últimos minutos siguen este orden:

1. Obtención de privilegios de dominio o de hipervisor.
2. **Desactivación del EDR y del registro** (T1562) — señal 1.
3. **Parada de servicios de base de datos y de backup** (T1489) — señal 2.
4. **Borrado de copias de sombra y catálogos de backup** (T1490) — señal 3, la de mayor precisión.
5. Distribución del cifrador (GPO, PsExec, herramienta de despliegue) — señal 4.
6. Cifrado (T1486).

Cualquiera de las señales 1–4 debe generar una alerta de máxima prioridad con **respuesta automatizada** (aislamiento del host, bloqueo de la cuenta). En este punto el tiempo se mide en minutos: una alerta que espera revisión humana llega tarde.

## Reducción de impacto: lo que decide el resultado

| Control | Efecto real |
|---|---|
| **Backups inmutables y offline, probados en restauración** | Convierte un ransomware en una interrupción en vez de una crisis existencial. El control más importante, sin discusión |
| **Backup fuera del dominio de producción**, con credenciales e identidad propias y MFA | Impide que el compromiso de AD arrastre la recuperación |
| **Segmentación de red y de identidad** | Limita el radio de explosión: cifrar 20 servidores es recuperable, cifrar 2.000 no |
| **Restricción del acceso al hipervisor** | Evita el escenario de máximo daño con mínimo esfuerzo |
| **Respuesta automatizada ante señales 1–4** | Aprovecha la única ventana disponible |
| **Plan de recuperación probado, con RTO/RPO reales** | La diferencia entre restaurar en días o en meses. Un backup no probado no es un backup |
| **Comunicación fuera de banda preparada** | Si el correo y el directorio están cifrados, hay que poder coordinar igual |
