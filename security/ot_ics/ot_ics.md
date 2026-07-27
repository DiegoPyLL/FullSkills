---
id: ot_ics/ot_ics
tipo: modelo
estabilidad: permanente
consulta_externa: https://www.nist.gov/iot (NIST IoT), https://www.kaspersky.com/iot-security (OWASP IoT Top 10), https://www.ics-cert.uscert.gov/
---

# Seguridad OT / ICS

Entornos de control industrial: PLC, DCS, SCADA, SIS, sensores, actuadores, HMIs. La prioridad está invertida respecto a TI: **seguridad física y disponibilidad preceden a la confidencialidad**. Un parche mal aplicado puede detener una planta, causar un derrame o poner vidas en riesgo.

## Premisa OT

| Principio OT | Consecuencia |
|---|---|
| La vida humana está por encima de todo | La contención puede requerir una parada controlada, no un bloqueo automático |
| La disponibilidad > confidencialidad | Un SIEM que genera latencia es peor que ninguno |
| Los ciclos de vida son de décadas | El "legacy" es la norma; muchas plataformas no reciben parches desde hace 15+ años |
| Los protocolos industriales son diseñados para fiabilidad, no seguridad | Modbus, Profinet, OPC UA, DNP3 no tenían autenticación ni cifrado cuando se diseñaron |
| El mantenimiento es caro y poco frecuente | Las ventanas de parcheo son de días al año, no horas |

## Modelo Purdue (segmentación TI/OT)

| Nivel | Componentes | Zona |
|---|---|---|
| 0 | Sensores, actuadores, PLC, RTU | Proceso físico — no tocar |
| 1 | Controladores lógicos (PLC), unidades remotas (RTU) | Zona de control directo |
| 2 | Sistemas de campo, HMI, escáneres pasivos | Zona de supervisión de campo |
| 3 | Historian, SCADA, estación de ingeniería | **Barrera crítica TI/OT (ISa-95 zona 3/4)** — diodo de datos o DMZ |
| 4 | MES, planificación | Zona de producción |
| 5 | ERP, corporativo, nube | Zona empresarial |

**Regla de segmentación:** comunicación solo zona N → zona N-1. Nunca TI (nivel 5) a nivel 2 o 1. La DMZ entre niveles 3 y 4 es la barrera más importante. El diodo de datos (unidirectional gateway) en niveles 0-2 es obligatorio en entornos críticos.

## Protocolos industriales y sus vulnerabilidades

| Protocolo | Versión | Problema de seguridad | Vector de ataque |
|---|---|---|---|
| Modbus TCP | V2 (1979) | Sin autenticación, sin cifrado, sin integridad | Lectura/escritura de registros desde cualquier host |
| Profinet | — | Descubrimino sin auth; alarmas inyeccionables; TLS opcional y raramente configurado | Lateral movement en red Ethernet industrial |
| OPC UA | 1.04 | SecureChannel con opcional TLS; los nodos de configuración no encriptan | Intercepción de comandos de control |
| DNP3 | — | Autenticación débil (0x65/0x65); no cifrado por defecto | Manipulación de estaciones de servicio, medidores |
| BACnet | — | Sin criptografía nativa; BACnet/IP sin auth | Control de HVAC, incendios, elevadores |
| IEC 60870-5-104 | — | Sin cifrado ni auth | Control de distribución eléctrica |
| SNMP | v1/v2 | Community strings en claro; v3 opcional y raramente usado | Descubrimiento de red, modificación de configuración |
| Ethernet/IP (CIP) | — | SINUMERIK/ControlNet vulnerables a replay; sin autenticación en la capa de control | Modificación de comandos a drives y VFDs |
| PROFIdrive / PROFINET | — | Sin cifrado; configuración transmitida en claro | Manipulación de variadores de frecuencia y actuadores |
| Zigbee, Z-Wave | — | Claves de red débilmente derivadas; pairing sin verificación | Control de edificios inteligentes, iluminación |

## Tácticas ATT&CK ICS específicas

| Técnica | ID | Descripción | Detección |
|---|---|---|---|
| Impair Process Control | TA0040.001 | Manipulación de la lógica de control PLC para alterar el proceso físico | Detección de escritura en lógica PLC; diff contra backup |
| Inhibit Response Function | TA0040.002 | Desactivar alarmas, paradas de emergencia o sistemas de seguridad | Cambios en configuración de SIS/HMI; desactivación de alarmas |
| Manipulate Process Value | TA0040.003 | Alterar lecturas de sensores para ocultar actividad o inducir error | Discrepancia entre lecturas redundantes; anomalías en tendencias |
| Manipulate Setpoint | TA0040.004 | Cambiar puntos de referencia de control para alterar comportamiento del proceso | Logs de cambios de setpoint por operador no autorizado |
| Program Controller | TA0040.005 | Modificar la lógica de programa del PLC (ladder logic, FBD) | Diff entre lógica en ejecución y versión verificada |
| Manipulate Monitoring System | TA0040.006 | Alterar datos del sistema de supervisión (SCADA, historian) | Inconsistencias en historial; auditoría de cambios de SCADA |
| Hijack ICS Vehicle | TA0040.007 | Secuestrar vehículos industriales (AGV, grúas) | Movimiento no programado; comandos en protocolo de control |
| Manipulate Target | TA0040.008 | Alterar objetivos de sistemas guiados (drones, robótica) | Discrepancia entre trayectoria programada y ejecutada |
| Impair Process Confidence | TA0040.009 | Alterar datos de proceso para invalidar la confianza en la operabilidad del sistema | Auditoría de integridad de datos de proceso |

## Arquitectura defensiva OT

| Control | Dónde se aplica | Efecto |
|---|---|---|
| **Segmentación Purdue estricta** | Nivel 3/4 (DMZ) y 2/3 (diodo) | Elimina la ruta TI→OT |
| **Monitorización pasiva** | Zona OT, con sniffer industrial | Detecta sin riesgo de tumbar equipos |
| **Allow-list de protocolos** | En el firewall OT | Solo las funciones permitidas entre zonas |
| **Control de cambios de lógica** | PLC programadores con revisión | Detecta alteración del proceso |
| **Inventario por medios pasivos** | OT, sin escaneo activo | Conocer todos los activos sin riesgo |
| **Redundancia de instrumentación** | SIS/HMI independiente | El operador tiene visión fiable |
| **Control manual de respaldo** | Válvulas manuales, arranque mecánico | El operador puede actuar si el sistema digital falla |
| **Gestión de medios extraíbles** | Estación de descontaminación OT | La vía de entrada clásica en redes aisladas |
| **Hardening de HMI** | Consolas de operación | Sin navegador, sin USB, sin acceso a OS |
| **Backup de lógica y configuración** | Offsite, verificada | Recuperación tras manipulación o destrucción |

## Incidentes de referencia

| Incidente | Mecanismo | Lección |
|---|---|---|
| **Stuxnet (2010)** | Cadena de 4 zero-days → firmware de PLC S7-300 → alteración de centrifugadoras | Supply chain; air-gapped networks pueden ser comprometidas; el efecto físico existe |
| **TRITON/Trisis (2017)** | PLC de seguridad Triconex manipulado vía HMI comprometida | SIS no está aislado; el compromiso del SIS pone vidas en riesgo |
| **Colonial Pipeline (2021)** | Ransomware vía VPN de proveedor → MES → SCADA → parada de pipeline | Segmentación TI/OT insuficiente; proveedor sin JIT |
| **Babcock Power (2016)** | Email phishing → workstation → HMI → operación anómala | Una workstation en zona HMI es un punto de entrada al proceso |
| **Saudi Aramco (Shamoon, 2012)** | Wiper vía imagen maliciosa → borrado masivo | Backups fuera del alcance; segmentación por dominios |
| **JouleX (2021)** | Acceso a SCADA de utilities → potencial para manipular proceso físico | Utilities son objetivo recurrente; el riesgo es real, no solo teórico |

## Respuesta a incidente OT

El playbook específico es distinto al de TI porque los controles de respuesta pueden tener efecto físico:

| Acción | Riesgo OT | Consideración |
|---|---|---|
| Aislar de red | Detener supervisión de proceso; posible pérdida de vista del operador | Aislar solo el segmento; mantener HMI operativa |
| Desactivar cuenta | Puede bloquear acceso remoto de mantenimiento | Coordinar con operadores antes de revocar |
| Escanear la red OT | Puede tumbar PLC o RTU antiguos | Medio pasivo únicamente (sniffer) |
| Parchear | Puede requerir parada de planta | Solo en ventanas programadas; backup de lógica antes |
| Reiniciar PLC | Puede detener el proceso físico | Coordinar con ingeniería de procesos |
| Restaurar lógica desde backup | Requiere verificación de integridad | El backup debe estar en un medio físicamente separado |

## Fuentes de amenazas OT

| Fuente | Contenido |
|---|---|
| [mitre_attack.md](../mitre_attack.md#matrices) | Matriz ICS (no Enterprise) con tácticas propias |
| [attacks/impact.md](../attacks/impact.md#impacto-fisico-ot-ics) | Técnicas de impacto físico OT |
| [hardening/hardening.md#ot-ics](../hardening/hardening.md) | Controles de hardening OT/ICS |
| [ioc/ioc.md](../ioc/ioc.md) | IOC específicos de entornos industriales |
| [cisa_kev.md](../cisa_kev.md) | CVEs de productos OT/ICS (plataformas SCADA, HMIs, PLCs) |
| [references/references.md](../references/references.md) | ISAC sectoriales (E-ISAC, AMIA-ISAC), CISA ICS, IEC 62443 |
| [playbooks/ir_base.md](../playbooks/ir_base.md) | IR base con adaptaciones OT |
