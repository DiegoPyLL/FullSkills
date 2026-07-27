---
id: playbooks/hyperv
tipo: playbook
estabilidad: permanente
---

# Playbook — Incidente en Hyper-V

Base común: [ir_base.md](ir_base.md). Modelo: [hyperv/hyperv.md](../hyperv/hyperv.md).

Diferencia clave frente a VMware: el host es **Windows y normalmente está unido al dominio**. En la mayoría de los casos, un compromiso de Hyper-V es la consecuencia de un compromiso de Active Directory, no un incidente independiente.

## Señales de entrada

Nuevos miembros en el grupo Hyper-V Administrators; exportación, clonado o creación de VM fuera del proceso normal; `.vhdx` montado en el host o en otra máquina; apagado masivo de VM; checkpoints creados y exportados; uso de PowerShell Direct fuera de la administración habitual; inicio de sesión interactivo en el host; cambios en el switch virtual; servicios o tareas nuevas en el host.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | **Aislar la red de gestión** y bloquear las credenciales administrativas implicadas | |
| 2 | **No apagar el host** | Se pierde el estado de las VM y la evidencia volátil |
| 3 | Revocar las sesiones de las cuentas comprometidas, no solo deshabilitarlas | Un TGT válido sobrevive a la desactivación |
| 4 | Revisar y retirar miembros no legítimos de Hyper-V Administrators y de los grupos administrativos locales | |
| 5 | Desconectar los backups de la red y verificar su integridad | |
| 6 | Preservar los logs de los canales de Hyper-V antes de cualquier cambio | |
| 7 | Congelar los despliegues y las tareas del cluster | |
| 8 | **Tratar el incidente también como uno de Active Directory** | Es la ruta habitual: ver [active_directory.md](active_directory.md) |

## Evidencia específica

| Elemento | Fuente |
|---|---|
| Logs de Hyper-V | Canales `Hyper-V-VMMS`, `Hyper-V-Worker`, `Hyper-V-Compute`, `Hyper-V-VMMS-Admin` |
| Logs de seguridad y del sistema del host | Es un servidor Windows: aplica [windows/windows.md](../windows/windows.md) |
| Historial de tareas del cluster | Migraciones, creaciones, exportaciones |
| Estado y ubicación de los `.vhdx` | Montajes, copias, modificaciones |
| Checkpoints existentes | Creados por el adversario, o exportados |
| Configuración del switch virtual | Interceptación de tráfico entre VM |
| Memoria del host | Credenciales y procesos |
| Logs de los DC | El vector suele estar aquí |
| Configuración de Live Migration | Si el tráfico viajaba sin cifrar |

## Investigación

1. **¿El compromiso vino del dominio?** Es lo más probable: verificar primero si hubo compromiso de AD.
2. ¿Qué cuentas obtuvieron privilegios administrativos en el host?
3. ¿Se montaron o copiaron `.vhdx`? Equivale a acceso completo al disco de un servidor sin pasar por su sistema operativo ni por su EDR.
4. ¿Se crearon o exportaron checkpoints con memoria? Permiten extraer credenciales de las VM.
5. ¿Se exportaron VM completas? Exfiltración de servidores enteros.
6. ¿Se usó PowerShell Direct para ejecutar dentro de los invitados? No pasa por la red, así que no deja rastro en el tráfico.
7. ¿Se modificó la configuración de red virtual para interceptar tráfico entre VM?
8. ¿Qué VM deben considerarse comprometidas? Por defecto, todas las alojadas en un host comprometido.

## Erradicación

- Ejecutar la erradicación de Active Directory si el vector fue el dominio ([active_directory.md](active_directory.md)): incluye doble reset de `krbtgt` y rotación completa de credenciales.
- Retirar cuentas, servicios, tareas y accesos añadidos en el host.
- **Reconstruir el host** si hubo acceso administrativo confirmado.
- Considerar comprometidas las VM alojadas: verificar su integridad, revisar persistencia en cada una y rotar sus credenciales.
- Eliminar checkpoints y copias de `.vhdx` creadas por el adversario, tras preservarlas como evidencia.
- Revisar la configuración de red virtual y restaurarla desde la línea base.
- Revisar la infraestructura de backup como sistema potencialmente comprometido.

## Recuperación

Reconstruir el host sobre instalación limpia y restaurar las VM desde copias verificadas como anteriores al compromiso. Reintroducir por criticidad, verificando cada VM antes de reconectarla. Si el dominio fue comprometido, reconstruir primero el plano de identidad: restaurar servicios sobre un AD comprometido no aporta nada.

## Prevención

| Control | Efecto |
|---|---|
| **Hosts Hyper-V tratados como Tier 0**, administrados solo desde PAW | Corta la ruta desde una estación comprometida |
| Considerar un dominio o bosque de administración separado | Rompe la dependencia estructural con AD de producción |
| **Shielded VMs con Host Guardian Service** | El administrador del host deja de poder leer el contenido de las VM protegidas |
| Instalación mínima (Server Core) con solo el rol Hyper-V | Reduce la superficie |
| BitLocker en los volúmenes con `.vhdx` y permisos NTFS estrictos | Protege el disco de las VM |
| Red de gestión dedicada; sin acceso desde el segmento de usuarios | Cierra la vía habitual |
| Cifrado de Live Migration y red dedicada para migración | La memoria de la VM viaja por ahí |
| Grupo Hyper-V Administrators auditado como grupo privilegiado | Es equivalente a control total de las VM |
| Reenvío de los canales de Hyper-V al SIEM | Sin esto no hay detección |
| Backups fuera del dominio de producción, inmutables y probados | Garantiza la recuperación |
