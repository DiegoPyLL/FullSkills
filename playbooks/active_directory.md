---
id: playbooks/active_directory
tipo: playbook
estabilidad: permanente
---

# Playbook — Compromiso de Active Directory

Base común: [ir_base.md](ir_base.md). Modelo técnico: [active_directory/active_directory.md](../active_directory/active_directory.md).

El compromiso de AD no se remedia host por host: **está comprometido el plano de identidad completo**. Toda credencial del dominio debe considerarse conocida por el adversario.

## Señales de entrada

Evento 4662 con derechos de replicación desde un host que no es DC (DCSync); creación de un objeto `nTDSDSA` inesperado (DCShadow); cambio de contraseña de la cuenta de máquina de un DC (Zerologon); tickets Kerberos con vida anómala (Golden Ticket); cambios no autorizados en grupos privilegiados; emisiones anómalas en la CA; volcado de `NTDS.dit`.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | Activar canal fuera de banda | El adversario tiene acceso al directorio y, probablemente, al correo |
| 2 | Preservar antes de actuar | Volcados de memoria de los DC y logs completos |
| 3 | Aislar los DC comprometidos de la red de usuarios, **no apagarlos** | Conserva evidencia y evita romper la replicación de forma incontrolada |
| 4 | Bloquear el acceso remoto y la VPN | Corta la reentrada |
| 5 | Deshabilitar cuentas privilegiadas comprometidas y **revocar sus sesiones** | Un TGT válido sobrevive a la desactivación de la cuenta |
| 6 | Congelar cambios de GPO y de herramientas de despliegue | Vía habitual de despliegue masivo |
| 7 | Proteger los backups, incluidos los de estado del sistema de los DC | Necesarios para la recuperación |
| 8 | Preparar toda la erradicación para ejecutarla de golpe | Actuar por partes avisa al adversario |

## Evidencia específica

| Elemento | Qué revela |
|---|---|
| Logs de seguridad completos de **todos** los DC | Línea de tiempo del compromiso |
| 4662 con GUID de replicación | DCSync: quién y cuándo |
| 4768, 4769, 4770 | Emisión y uso de tickets; anomalías de cifrado y de vida |
| 4720, 4728, 4732, 4756, 4738 | Cuentas y grupos manipulados |
| 5136 sobre `nTSecurityDescriptor` | ACL modificadas, incluida AdminSDHolder |
| 4741, 4781 | Cuentas de máquina creadas o renombradas (noPac, RBCD) |
| Logs de la CA de AD CS | Certificados emitidos durante el periodo |
| Estado de `krbtgt` | Antigüedad de la contraseña |
| Volcado de memoria de los DC | Módulos inyectados, Skeleton Key |
| SYSVOL | Scripts y GPO modificadas |
| Exportación del directorio y de las ACL | Comparación con el estado previo conocido |

## Investigación

1. ¿Cuál fue el vector inicial y cuándo comenzó? Retroceder hasta el origen, no hasta la primera alerta.
2. ¿Qué nivel alcanzaron: administrador local, administrador de dominio, administrador de empresa?
3. ¿Hubo **DCSync o volcado de NTDS.dit**? Si sí, todos los hashes del dominio están comprometidos, incluido `krbtgt`.
4. ¿Se emitieron certificados desde AD CS? Sobreviven al cambio de contraseña y son persistencia de larga duración.
5. ¿Se modificaron ACL, delegaciones, GPO o AdminSDHolder?
6. ¿Existen cuentas nuevas o cuentas legítimas con permisos añadidos?
7. ¿Se comprometió la clave de respaldo de DPAPI del dominio?
8. ¿El alcance es un dominio o todo el bosque? **El límite de seguridad es el bosque.**

## Erradicación

Ejecutar de forma coordinada, no incremental.

| Paso | Detalle |
|---|---|
| 1 | Cerrar el vector inicial y aislar los sistemas comprometidos |
| 2 | **Doble reset de `krbtgt`**, con intervalo superior al tiempo de replicación y a la vida máxima de ticket. Invalida los Golden Tickets |
| 3 | Rotar **todas** las contraseñas: usuarios, administradores, cuentas de servicio, cuentas de máquina críticas, cuentas locales, credenciales de aplicaciones y de dispositivos integrados |
| 4 | Revisar y revocar los certificados emitidos durante el periodo; evaluar el compromiso de la clave de la CA |
| 5 | Revisar la clave de respaldo de DPAPI del dominio |
| 6 | Auditar y corregir ACL, delegaciones, membresías de grupos privilegiados, AdminSDHolder y GPO |
| 7 | Eliminar cuentas y objetos creados por el adversario |
| 8 | Reconstruir los DC comprometidos; no limpiarlos |
| 9 | Revisar trusts y aplicar SID filtering |
| 10 | Verificar persistencia en hosts: tareas, servicios, WMI, claves SSH, RMM |

## Cuándo reconstruir el bosque

Si el adversario mantuvo control administrativo del directorio durante un periodo prolongado, la validación exhaustiva de cada objeto, ACL y credencial puede ser **más cara y menos fiable** que reconstruir. Indicadores a favor de la reconstrucción: compromiso de la CA, persistencia sofisticada en el directorio, actor con recursos, imposibilidad de determinar el alcance con certeza, o pérdida de confianza en la integridad del propio directorio.

Es una decisión de semanas de trabajo: debe tomarse conscientemente y con respaldo de dirección, no por defecto ni por omisión.

## Recuperación

Reconstruir el plano de identidad **antes** de restaurar servicios. Restaurar aplicaciones sobre un AD comprometido no aporta nada. Reintroducir por fases con monitorización reforzada, y verificar que las detecciones de DCSync, de cambios de ACL y de emisión de certificados están activas antes de reabrir.

## Prevención

Tiering administrativo con estaciones dedicadas; MFA resistente a phishing para todo acceso privilegiado; Credential Guard y Protected Users; LAPS; `MachineAccountQuota = 0`; firma LDAP y SMB obligatorias; LLMNR y NBT-NS desactivados; gMSA para cuentas de servicio; revisión periódica de rutas de ataque con análisis de grafo; auditoría de derechos de replicación; y revisión de las plantillas de AD CS contra el catálogo ESC.
