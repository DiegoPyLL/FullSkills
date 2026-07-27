---
id: hyperv/hyperv
tipo: modelo
estabilidad: permanente
---

# Hyper-V

Hipervisor de Microsoft. Diferencia estructural frente a [vmware](../vmware/vmware.md): el host es **Windows y está normalmente unido al dominio**, de modo que la seguridad del hipervisor queda subordinada a la de Active Directory. Comprometer el dominio suele implicar comprometer la virtualización.

## Arquitectura y su implicación

| Elemento | Qué es | Implicación |
|---|---|---|
| Partición padre (host) | Windows Server con el rol Hyper-V | Toda la superficie de Windows aplica: ver [windows/windows.md](../windows/windows.md) |
| Particiones hijas (VM) | Sistemas invitados | Aisladas por el hipervisor, no por el sistema operativo del host |
| VMBus / servicios de integración | Canal de comunicación host-invitado | Superficie de escape entre invitado y host |
| VMMS (`vmms.exe`) | Servicio de gestión | Su compromiso equivale al control de todas las VM |
| Archivos `.vhdx` | Discos virtuales | Acceso al archivo = acceso a todo el disco del servidor |
| Generación 2 + Secure Boot | Arranque verificado del invitado | Impide bootkits en el invitado |
| VBS / HVCI | Seguridad basada en virtualización dentro del propio Windows | Base de Credential Guard |

Consecuencia clave: **quien es administrador del host es administrador efectivo de todas las VM**, porque puede montar los `.vhdx`, volcar la memoria de la VM o inyectar contenido en el disco.

## Riesgos y controles

| Riesgo | Vector | Control |
|---|---|---|
| Host unido al dominio y comprometido vía AD | Domain Admin obtiene el hipervisor | Tratar los hosts Hyper-V como **Tier 0**; considerar un dominio o bosque de administración separado |
| Acceso al `.vhdx` | Recurso compartido o backup con permisos amplios | Permisos estrictos sobre el almacenamiento, cifrado con BitLocker |
| Volcado de memoria de una VM | Snapshot con estado o volcado desde el host | Restringir permisos de snapshot; cifrado de VM blindada |
| Escape de invitado a host | Vulnerabilidad en VMBus o en dispositivos sintéticos | Parcheo del host; servicios de integración solo los necesarios |
| Gestión remota expuesta | WinRM, PowerShell Direct, consola | Gestión solo desde PAW, por red dedicada |
| PowerShell Direct | Ejecución en el invitado **sin red**, desde el host | Consecuencia lógica de administrar el host; refuerza que el host es Tier 0 |
| Live Migration sin cifrado | Memoria de la VM viaja por la red | Cifrado de migración (Kerberos/CredSSP configurado correctamente), red dedicada |
| SMB para almacenamiento de VM | Discos accesibles por red | SMB con firma y cifrado, red de almacenamiento aislada |
| Backups en el mismo dominio | Destrucción de la recuperación | Backups inmutables, credenciales e identidad separadas |
| Cluster mal segmentado | Movimiento lateral entre nodos | Redes separadas para gestión, cluster, migración y VM |

## Controles diferenciales de Hyper-V

| Control | Qué aporta |
|---|---|
| **Shielded VMs con Host Guardian Service (HGS)** | La VM solo arranca en hosts atestados y su disco está cifrado: **el administrador del host no puede leer su contenido**. Es la respuesta directa al riesgo estructural del hipervisor |
| **VM de arranque seguro (Generación 2)** | Impide arrancar código no firmado en el invitado |
| **vTPM** | Habilita BitLocker dentro de la VM |
| **Credential Guard en el invitado** | Protege las credenciales de la VM aunque el invitado sea comprometido |
| **Modo de aislamiento de núcleo / HVCI en el host** | Protege el host frente a código de kernel no firmado |
| **Adaptadores de red virtuales con protección** | Protección DHCP, ARP y de router: limita ataques entre VM del mismo host |
| **VLAN y switches virtuales segmentados** | Aísla las VM entre sí |

Shielded VMs es el control que más cambia el modelo: sin él, la confianza en el hipervisor es total e implícita.

## Hardening del host

| Área | Control |
|---|---|
| Rol | Instalación mínima (Server Core), solo el rol Hyper-V; sin otros servicios ni navegación |
| Administración | Exclusivamente desde PAW, con MFA, por red de gestión dedicada |
| Grupo Hyper-V Administrators | Es equivalente a control total de las VM: auditarlo como grupo privilegiado |
| Firewall | Reglas restrictivas; gestión solo desde orígenes autorizados |
| Almacenamiento | BitLocker en los volúmenes que alojan `.vhdx`; permisos NTFS estrictos |
| Antivirus | Exclusiones correctas para los archivos de VM, sin desactivar la protección del host |
| Parcheo | Ciclo definido; el host es un servidor Windows con toda su superficie |
| Logs | Reenvío a SIEM de los canales `Hyper-V-VMMS`, `Hyper-V-Worker`, `Hyper-V-Compute`, además de Security |
| Backups | Fuera del dominio de producción, inmutables, probados |

## Detección

| Señal | Interpretación |
|---|---|
| Creación, exportación o clonado de VM fuera del proceso normal | Exfiltración de un servidor completo |
| Montaje de un `.vhdx` en el host o en otra máquina | Acceso al disco de una VM sin pasar por su sistema operativo |
| Apagado masivo de VM | Preparación de cifrado |
| Cambios en la configuración del switch virtual | Interceptación de tráfico entre VM |
| Uso de PowerShell Direct hacia invitados | Ejecución sin red: legítimo en administración, sospechoso fuera de ella |
| Nuevos miembros en Hyper-V Administrators | Escalada |
| Checkpoints creados y exportados | Robo de memoria y de estado |
| Inicio de sesión interactivo en el host | Debería ser excepcional y solo desde PAW |
| Servicios o tareas nuevas en el host | Persistencia |
| Deshabilitación de logs de Hyper-V | Evasión |

## Respuesta

1. Aislar la red de gestión y bloquear las credenciales administrativas implicadas.
2. **No apagar el host**: se pierde el estado de las VM y evidencia volátil.
3. Recoger logs de los canales de Hyper-V, del sistema y de seguridad, más el historial de tareas del cluster.
4. Determinar si el compromiso vino del dominio: en la mayoría de los casos, sí. Eso convierte el incidente en uno de Active Directory ([playbooks/active_directory.md](../playbooks/active_directory.md)).
5. Verificar la integridad de los `.vhdx` y de los checkpoints; comprobar si hubo exportaciones.
6. Reconstruir el host si hubo acceso administrativo confirmado; las VM alojadas se consideran potencialmente comprometidas.
7. Restaurar desde backups verificados fuera del entorno afectado.

Ver [playbooks/hyperv.md](../playbooks/hyperv.md).
