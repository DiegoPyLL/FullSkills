---
id: mitre_attack
tipo: taxonomia
estabilidad: permanente
consulta_externa: https://attack.mitre.org — los IDs son estables, pero se añaden técnicas y se renombran sub-técnicas en cada versión (~2/año)
---

# MITRE ATT&CK — estructura y uso

Base de conocimiento del **comportamiento** adversario observado. Describe cómo opera el atacante; no dice cómo defenderse (eso es [mitre_d3fend.md](mitre_d3fend.md)) ni cuál es la causa del bug (eso es [cwe.md](cwe.md)).

## Jerarquía

`Táctica` (el **por qué**, el objetivo) → `Técnica` (el **cómo**) → `Sub-técnica` (variante concreta) → `Procedimiento` (implementación observada de un actor).

Objetos relacionados: `Groups` (G####, actores), `Software` (S####, malware y herramientas), `Campaigns` (C####), `Mitigations` (M####), `Data Sources` (DS####) y `Detections`.

## Matrices

| Matriz | Plataformas | Cuándo usarla |
|---|---|---|
| Enterprise | Windows, Linux, macOS, Network Devices, Containers, IaaS, SaaS, Office/Identity Provider, ESXi | Caso general de TI |
| Mobile | Android, iOS | Ver [mobile/mobile.md](mobile/mobile.md) |
| ICS | Sistemas de control industrial | Prioriza efecto físico y disponibilidad; tácticas propias como *Impair Process Control* e *Inhibit Response Function* |

Trampa: usar la matriz Enterprise para un incidente OT ignora las tácticas que importan (manipulación de la lógica de control, pérdida de vista del operador).

## Tácticas Enterprise y ruta al catálogo

| ID | Táctica | Objetivo del adversario | Módulo con las técnicas |
|---|---|---|---|
| TA0043 | Reconnaissance | Recolectar información de la víctima | [attacks/discovery.md](attacks/discovery.md#reconocimiento-externo) |
| TA0042 | Resource Development | Construir infraestructura y capacidades | [attacks/command_control.md](attacks/command_control.md#infraestructura-del-adversario) |
| TA0001 | Initial Access | Entrar | [attacks/initial_access.md](attacks/initial_access.md) |
| TA0002 | Execution | Ejecutar código | [attacks/execution.md](attacks/execution.md) |
| TA0003 | Persistence | Sobrevivir a reinicios y cambios de credencial | [attacks/persistence.md](attacks/persistence.md) |
| TA0004 | Privilege Escalation | Obtener permisos mayores | [attacks/privilege_escalation.md](attacks/privilege_escalation.md) |
| TA0005 | Defense Evasion | No ser detectado ni bloqueado | [attacks/defense_evasion.md](attacks/defense_evasion.md) |
| TA0006 | Credential Access | Robar credenciales | [attacks/credential_access.md](attacks/credential_access.md) |
| TA0007 | Discovery | Entender el entorno | [attacks/discovery.md](attacks/discovery.md) |
| TA0008 | Lateral Movement | Moverse a otros sistemas | [attacks/lateral_movement.md](attacks/lateral_movement.md) |
| TA0009 | Collection | Reunir datos de interés | [attacks/collection_exfiltration.md](attacks/collection_exfiltration.md) |
| TA0011 | Command and Control | Controlar los sistemas comprometidos | [attacks/command_control.md](attacks/command_control.md) |
| TA0010 | Exfiltration | Sacar los datos | [attacks/collection_exfiltration.md](attacks/collection_exfiltration.md#exfiltracion) |
| TA0040 | Impact | Destruir, cifrar, manipular, interrumpir | [attacks/impact.md](attacks/impact.md) |

Las tácticas **no** son secuenciales. Un operador itera Discovery → Credential Access → Lateral Movement decenas de veces. Persistence y Defense Evasion son continuas, no fases.

## Cómo mapear correctamente

1. **Un evento, una técnica.** "Usó PowerShell para volcar LSASS" son dos: T1059.001 (Execution) y T1003.001 (Credential Access).
2. **Mapear lo observado, no lo supuesto.** Si no hay evidencia de exfiltración, no se mapea T1041.
3. **Bajar a sub-técnica siempre que se pueda.** T1003 es casi inútil para detección; T1003.001 (LSASS) y T1003.003 (NTDS) exigen telemetría y controles distintos.
4. **La técnica no implica al actor.** Cientos de grupos usan T1566. El solapamiento de TTPs no es atribución.
5. **Anotar la plataforma.** T1053.005 (Scheduled Task) y T1053.003 (cron) son la misma técnica y detecciones completamente distintas.

## Uso 1 — evaluación de cobertura (heat map)

Producir una matriz con estado por técnica y **evidencia**, no opinión:

| Estado | Criterio de asignación |
|---|---|
| Sin visibilidad | No existe la fuente de datos necesaria |
| Visibilidad sin detección | El log existe pero nadie lo consulta ni alerta |
| Detección | Hay regla y ha sido validada con una prueba real |
| Prevención | El control bloquea la técnica (WDAC, ASR, LSA Protection) |

Errores clásicos:
- **Contar técnicas cubiertas.** ATT&CK tiene cientos; muchas son irrelevantes para el entorno. Cobertura del 100 % no es objetivo válido.
- **Marcar cubierto sin validar.** Solo cuenta si se ejecutó la técnica (Atomic Red Team, Caldera, purple team) y la alerta disparó.
- **Ignorar el peso.** T1003.001 y T1486 valen más que una técnica de descubrimiento cualquiera. Priorizar por lo que usan los actores relevantes al sector.

## Uso 2 — priorización dirigida por amenaza

1. Definir los actores relevantes (sector, geografía, tipo de dato).
2. Extraer las técnicas que usan (páginas de Groups, o metodología **Top ATT&CK Techniques** de MITRE, que pondera por prevalencia, viabilidad de detección y elección del adversario).
3. Intersectar con la superficie propia.
4. Cerrar primero las técnicas de alto impacto y alta prevalencia — típicamente: T1566 phishing, T1078 cuentas válidas, T1190 explotación de servicio expuesto, T1059 intérpretes, T1003 volcado de credenciales, T1021 servicios remotos, T1486 cifrado, T1490 destrucción de recuperación.

## Uso 3 — comunicación de un incidente

Narrar por tácticas en orden temporal, con evidencia por paso: `[timestamp] · [táctica] · [técnica ID] · [artefacto observado] · [host/identidad]`. Esto hace la línea de tiempo comparable entre analistas y reutilizable como caso de detección.

## Fuentes de datos (DS) — el eslabón que se olvida

Una detección solo existe si la fuente de datos existe. Antes de escribir la regla, verificar la fuente.

| Fuente de datos | Origen típico | Técnicas que habilita |
|---|---|---|
| Process creation | Sysmon E1, Windows 4688 con línea de comandos, EDR, auditd `execve` | Casi todas las de Execution, gran parte de Discovery |
| Command execution | ScriptBlock logging (PS 4104), bash history, EDR | T1059.* |
| Process access | Sysmon E10, EDR | T1003.001 (acceso a LSASS) |
| Image load | Sysmon E7 | T1574.002 side-loading, T1055 |
| File creation/modification | Sysmon E11, auditd, FIM | Web shells, persistencia, staging |
| Registry key modification | Sysmon E12-14 | T1547.001, T1112, T1546 |
| Network traffic content/flow | NetFlow, Zeek, Suricata, proxy | C2, exfiltración, escaneo lateral |
| DNS query | Sysmon E22, resolvers, Zeek | T1071.004, T1568.002 |
| Logon session | 4624/4625/4648, 4768/4769 | Movimiento lateral, spraying, Kerberoasting |
| Active Directory object modification | 5136, 4662, 4738 | DCSync, DCShadow, ACL abuse, ADCS |
| Cloud service / API activity | CloudTrail, Entra ID sign-in y audit, GCP Audit Logs | T1078.004, T1098, T1526, T1530 |
| Container/orchestrator | runtime logs, K8s audit log, Falco | T1610, T1611, T1613 |

Detalle de configuración en [detection/detection.md](detection/detection.md).

## Límites conocidos

- **Sesgo de observación**: solo contiene lo reportado públicamente. Ausencia en ATT&CK ≠ inexistencia.
- **No modela severidad**: todas las técnicas parecen iguales; no lo son.
- **Granularidad desigual**: T1059.001 es muy específica; T1190 engloba miles de vulnerabilidades distintas.
- **Débil en abuso de lógica de negocio y en identidad pura**; para SaaS/IdP conviene complementar con la matriz de Identity Provider y con [cloud/cloud.md](cloud/cloud.md).
- **No es un marco de cumplimiento**: no sirve para declarar madurez ante un auditor.
