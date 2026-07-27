---
id: playbooks/vmware
tipo: playbook
estabilidad: permanente
---

# Playbook — Incidente en VMware vSphere / ESXi

Base común: [ir_base.md](ir_base.md). Modelo: [vmware/vmware.md](../vmware/vmware.md).

Escenario de máximo impacto por unidad de esfuerzo del adversario: desde el hipervisor se apagan y cifran cientos de servidores sin tocar sus sistemas operativos y **sin que ningún EDR invitado lo observe**.

## Señales de entrada

SSH habilitado en un host ESXi; inicio de sesión SSH en el hipervisor; apagado masivo de máquinas virtuales; VIB instalado; usuarios locales nuevos en ESXi; cambio del modo de bloqueo o del firewall del host; exportación o clonado masivo de VM; inicio de sesión en vCenter desde origen inusual; procesos desconocidos en el host; VM que no arrancan y datastore con archivos renombrados.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | **Aislar la red de gestión** | Cortar el acceso al plano de control antes que nada |
| 2 | **No apagar los hosts** | Se pierde el estado y, si hay cifrado en curso, puede agravar la inconsistencia |
| 3 | Deshabilitar SSH y ESXi Shell en todos los hosts | Vía principal del adversario |
| 4 | Activar el modo de bloqueo (Lockdown Mode) | Impide la gestión directa del host |
| 5 | Revocar y rotar las credenciales de vCenter y de los hosts | Incluidas las cuentas de servicio |
| 6 | Desconectar los backups de la red y verificar su integridad | Si aún están intactos, esta acción decide el desenlace |
| 7 | Preservar logs de ESXi y de vCenter | Exportarlos antes de cualquier reconfiguración |
| 8 | Revisar si el vector fue Active Directory | Habitual: la autenticación de vCenter suele estar integrada |

## Evidencia específica

| Elemento | Ruta o fuente |
|---|---|
| Logs de ESXi | `/var/log/hostd.log`, `vmkernel.log`, `auth.log`, `shell.log`, `vobd.log`, `esxcli` de sesiones |
| Logs de vCenter | Tareas, eventos, `vpxd.log`, logs de autenticación del SSO |
| VIB instalados | `esxcli software vib list`: persistencia en el hipervisor |
| Usuarios locales de ESXi | Persistencia |
| Claves SSH autorizadas en el host | Persistencia |
| Estado del datastore | Archivos cifrados, `.vmdk` alterados, binarios extraños |
| Histórico de tareas de vCenter | Apagados, clonados, exportaciones, snapshots |
| Logs de red del segmento de gestión | Origen de las conexiones |
| Logs de AD | Si la autenticación estaba integrada |

Si los logs no se reenvían a un SIEM externo —situación frecuente— la evidencia disponible será mucho más limitada. Recogerla cuanto antes.

## Investigación

1. **¿Cómo obtuvieron acceso al plano de gestión?** Credenciales de vCenter (a menudo desde AD comprometido), vulnerabilidad del appliance, red de gestión alcanzable desde el segmento de usuarios.
2. ¿Qué versión tenían vCenter y ESXi, y qué CVEs les aplicaban?
3. ¿Se habilitó SSH y cuándo? Es el marcador temporal más útil.
4. ¿Se instalaron VIB o se crearon usuarios locales? Persistencia dentro del hipervisor.
5. ¿Hubo exportación o clonado de VM? Sería exfiltración de servidores completos.
6. ¿Se tomaron snapshots con memoria? Permiten extraer credenciales de las VM.
7. ¿Qué VM resultaron afectadas y cuáles conservan copias válidas?
8. ¿El adversario alcanzó también la infraestructura de backup?

## Erradicación

- Cerrar el vector: parchear vCenter y ESXi, aislar la red de gestión, desacoplar la autenticación de AD o exigir MFA con cuentas dedicadas.
- Eliminar VIB no legítimos, usuarios locales y claves SSH autorizadas.
- **Reconstruir los hosts ESXi** con acceso confirmado del adversario; la reinstalación desde medio verificado es preferible a la limpieza.
- Rotar todas las credenciales del entorno virtual y, si estaba integrado, las del dominio ([active_directory.md](active_directory.md)).
- Verificar la integridad de las plantillas y de las imágenes doradas: una plantilla comprometida reintroduce el problema en cada VM nueva.
- Revisar la infraestructura de backup como sistema potencialmente comprometido.

## Recuperación

Restaurar sobre **infraestructura reconstruida**, no sobre los hosts afectados. Orden: plano de identidad primero, después los servicios por criticidad de negocio. Verificar cada VM restaurada antes de reconectarla. Monitorización reforzada del plano de gestión durante semanas.

## Prevención

| Control | Efecto |
|---|---|
| **Red de gestión inalcanzable desde el segmento de usuarios** | Cierra la vía de acceso más común |
| **Backups fuera del entorno virtual**, inmutables y probados | Si el backup vive en el mismo cluster, no existe |
| Autenticación de vCenter desacoplada de AD, o con MFA y cuentas dedicadas | Evita que el compromiso del dominio entregue la virtualización |
| SSH y ESXi Shell deshabilitados; Lockdown Mode activo | Elimina la ruta de ejecución directa |
| Alerta inmediata sobre habilitación de SSH y sobre apagado masivo de VM | Aprovecha la única ventana disponible |
| Parcheo prioritario de vCenter y ESXi | Aparecen de forma recurrente en KEV |
| Reenvío de logs a un SIEM externo | Sin esto, la investigación es casi imposible |
| Nivel de aceptación de VIB restrictivo y Secure Boot | Impide la persistencia en el hipervisor |
| Cifrado de VM para cargas sensibles | Anula el robo del `.vmdk` |
