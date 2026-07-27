---
id: attacks/privilege_escalation
tipo: catalogo
estabilidad: permanente
tactica: TA0004
---

# Escalada de privilegios

De usuario a administrador local, de administrador local a dominio, de dominio a bosque, de tenant a tenant. En intrusiones reales, la escalada rara vez usa un exploit de kernel: usa **configuración incorrecta**.

Orden de probabilidad real: credenciales encontradas > configuración débil > abuso de privilegio asignado > exploit.

## Windows — local

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Servicio con permisos débiles | T1574.011 | ACL de servicio escribible | Cambiar el binario → SYSTEM | Cambios en la configuración de servicios (4670, 7040) | Auditar ACL de servicios (`accesschk`) |
| Ruta de servicio sin comillas | T1574.009 | Ruta con espacios y sin comillas | Plantar `C:\Program.exe` | Inventario de servicios con esa condición | Corregir el registro del servicio |
| Permisos débiles en el binario o su carpeta | T1574.010 | Escritura sobre el ejecutable | Sustituirlo | FIM sobre `Program Files` | Permisos correctos por defecto |
| DLL hijacking / search order | T1574.001 | Escritura en una ruta de búsqueda | Cargar DLL propia en un proceso privilegiado | Sysmon E7: DLL sin firma en ruta inusual | `SafeDllSearchMode`, rutas absolutas, WDAC |
| DLL side-loading | T1574.002 | Binario legítimo que carga una DLL por nombre | Ejecución bajo un proceso firmado | DLL con nombre legítimo en directorio del usuario | WDAC con reglas de ruta y firmante |
| `AlwaysInstallElevated` | T1548.002 | Política habilitada | MSI ejecutado como SYSTEM | Valor de registro presente en HKLM y HKCU | Nunca habilitar |
| Bypass de UAC | T1548.002 | Usuario en el grupo de administradores | Elevación sin prompt (fodhelper, eventvwr, cmstp, sdclt) | Proceso elevado con padre no elevado; claves de registro efímeras | UAC al máximo; el usuario diario sin ser administrador local |
| Abuso de privilegios de token (`SeImpersonate`, `SeAssignPrimaryToken`) | T1134.001 | Cuenta de servicio (`IIS APPPOOL`, `mssql`) | Familia "Potato": suplantar a SYSTEM | Servicio web que lanza procesos SYSTEM | Retirar privilegios innecesarios; cuentas de servicio gestionadas |
| `SeBackupPrivilege` / `SeRestorePrivilege` | T1134 | Operador de backup | Lectura de SAM/NTDS, escritura arbitraria | Uso de esos privilegios fuera de ventana de backup | Restringir el grupo Operadores de copia |
| `SeDebugPrivilege` | T1134 | Asignado a la cuenta | Acceso a memoria de cualquier proceso | Uso fuera de herramientas conocidas | Revisar asignación de derechos de usuario |
| Credenciales en `unattend.xml`, GPP, scripts | T1552.001 / .006 | Lectura del archivo o de SYSVOL | Contraseña local o de dominio | Acceso a `Groups.xml` en SYSVOL | Eliminar archivos heredados; LAPS |
| Contraseña de administrador local reutilizada | T1078.003 | Imagen dorada común | Un solo hash abre toda la flota | Mismo hash en muchos hosts | **LAPS / Windows LAPS**: control decisivo |
| BYOVD (driver vulnerable firmado) | T1068 | Administrador local | Kernel: desactivar el EDR | Carga de drivers conocidos vulnerables | Lista de bloqueo de drivers de Microsoft, HVCI |
| Exploit de kernel | T1068 | Sistema sin parchear | SYSTEM | Crash, comportamiento anómalo | Parcheo; muchos son de KEV |
| Tarea programada escribible | T1053.005 | Permisos sobre la tarea o su binario | Ejecución con el usuario de la tarea | Modificación de tareas existentes | ACL correctas |
| Secuestro de sesión RDP | T1563.002 | SYSTEM en el host | Tomar la sesión de otro usuario sin su contraseña | `tscon` ejecutado por SYSTEM | Cerrar sesiones desconectadas; no dejar sesiones de admin abiertas |

## Linux — local

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Binario SUID/SGID abusable | T1548.001 | SUID innecesario presente | Root vía GTFOBins | Inventario de SUID contra baseline | Retirar SUID; `nosuid` en montajes |
| `sudo` mal configurado | T1548.003 | Regla `NOPASSWD` o comodín | Root directo | Auditar `/etc/sudoers` y `sudoers.d` | Reglas específicas, sin comodines, sin editores ni intérpretes |
| Capabilities peligrosas | T1548 | `cap_setuid`, `cap_dac_read_search`, `cap_sys_admin` en un binario | Equivalente a root | `getcap -r /` contra baseline | Capabilities mínimas |
| Cron escribible o con PATH relativo | T1053.003 | Script de cron modificable | Ejecución como el dueño del cron | FIM sobre scripts de cron | Permisos correctos, rutas absolutas |
| `PATH` con directorio escribible | T1574.007 | Script privilegiado que llama a comandos sin ruta | Sustitución del comando | Revisión de scripts | Rutas absolutas en scripts privilegiados |
| `LD_PRELOAD` / `LD_LIBRARY_PATH` vía sudo | T1574.006 | `env_keep` mal configurado | Carga de biblioteca propia como root | Auditar `env_reset` | `env_reset` activo (por defecto) |
| Exploit de kernel (Dirty COW, Dirty Pipe, etc.) | T1068 | Kernel sin parchear | Root | auditd, crash | Parcheo; kernel livepatching |
| PwnKit y similares en binarios setuid del sistema | T1068 | Paquete vulnerable | Root | Ejecución de `pkexec` desde contextos no interactivos | Parcheo; ver [cve_database.md](../cve_database.md) |
| Docker/LXD group | T1611 | Usuario en el grupo `docker` | Root del host de forma trivial | Membresía del grupo | Tratar `docker` como equivalente a root: no otorgarlo |
| NFS con `no_root_squash` | T1548.001 | Export mal configurado | Crear un SUID desde el cliente | Revisión de `/etc/exports` | `root_squash` siempre |
| Escritura en `/etc/passwd` o `/etc/shadow` | T1098 | Permisos incorrectos | Cuenta root nueva | FIM | Permisos por defecto verificados |

## Active Directory — de usuario de dominio a Domain Admin

Detalle mecánico en [active_directory/active_directory.md](../active_directory/active_directory.md).

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Kerberoasting | T1558.003 | Cualquier usuario de dominio + cuenta con SPN | Contraseña de la cuenta de servicio si es débil | 4769 con cifrado RC4 en volumen anómalo | gMSA/dMSA; retirar SPN innecesarios; AES |
| AS-REP Roasting | T1558.004 | Cuenta sin preautenticación Kerberos | Hash offline crackeable | 4768 sin preautenticación | Preautenticación obligatoria en todas las cuentas |
| Abuso de ACL (GenericAll, WriteDACL, WriteOwner) | T1098 | Permiso delegado erróneamente | Reset de contraseña, adición a grupo, delegación | 5136, 4738, 4728 | Auditoría de rutas de ataque (BloodHound), delegación mínima |
| Delegación no restringida | T1558 | Host con delegación irrestricta | Captura de TGT de quien se autentique, incluido un DC | Atributo `TRUSTED_FOR_DELEGATION` en hosts no DC | Eliminarla; marcar cuentas sensibles como "no delegable"; Protected Users |
| Delegación restringida (constrained/RBCD) | T1134.003 | Escritura sobre `msDS-AllowedToActOnBehalfOfOtherIdentity` | Suplantar a cualquier usuario contra el servicio | 5136 sobre ese atributo | Restringir quién puede unir equipos (`MachineAccountQuota = 0`) |
| Abuso de AD CS (ESC1–ESC8) | T1649 | Plantilla que permite indicar el SAN, o relay al endpoint web de la CA | Certificado de autenticación como Domain Admin | Emisiones con SAN inesperado; autenticación por certificado anómala | Revisar plantillas, exigir aprobación del gestor, deshabilitar HTTP en la CA, EPA |
| noPac (sAMAccountName spoofing) | T1068 | `MachineAccountQuota > 0` y sistema sin parchear | Domain Admin desde usuario normal | Cuentas de máquina renombradas; 4741/4781 | Parcheo + `MachineAccountQuota = 0` |
| PrintNightmare | T1068 | Spooler activo en el DC | RCE como SYSTEM en el DC | Carga de drivers de impresión desde rutas remotas | Desactivar el spooler en los DC |
| Relay NTLM a LDAP/ADCS | T1557.001 | Firma LDAP no obligatoria | Autenticación relayed a privilegios | Autenticación NTLM anómala hacia el DC | Firma LDAP y binding de canal obligatorios; SMB signing; desactivar NTLM |
| Abuso de trust entre dominios | T1482 | Trust configurado | Movimiento entre dominios; SID history | 4769 entre dominios inesperados | SID filtering, trusts selectivos, evaluar límites de seguridad |
| Inyección de SID History | T1134.005 | DA en un dominio del bosque | Privilegios en otro dominio | 4765/4766 | SID filtering; recordar que **el bosque, no el dominio, es el límite de seguridad** |
| DCSync | T1003.006 | Derechos de replicación | Todos los hashes del dominio | 4662 con GUID de replicación desde host no DC | Auditoría de esos derechos; solo DC y cuentas de sincronización |

## Cloud

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| `iam:PassRole` + servicio de cómputo | T1548 | Permiso de pasar roles | Ejecutar con un rol más privilegiado | CloudTrail: `PassRole` con roles administrativos | Condiciones en `PassRole`, límites de permisos |
| Modificación de política propia (`iam:PutUserPolicy`, `CreatePolicyVersion`) | T1098 | Permiso sobre IAM | Autoescalada a administrador | Cambios de política por principales no administrativos | Permissions boundaries, SCP |
| Suplantación de cuenta de servicio (GCP `serviceAccountTokenCreator`) | T1548 | Permiso de generar tokens | Actuar como una identidad más privilegiada | Audit log de `generateAccessToken` | Revisar quién tiene ese rol |
| Asignación de rol privilegiado en Entra ID | T1098.003 | Permiso de gestión de roles | Global Administrator | Audit log: `Add member to role` | PIM con aprobación, alertas sobre roles críticos |
| Metadata del instance (IMDS) | T1552.005 | SSRF o ejecución en la instancia | Credenciales del rol de la instancia | Peticiones a `169.254.169.254` desde procesos web | IMDSv2 obligatorio, hop limit 1 |
| Abuso de identidad administrada sobreprivilegiada | T1078.004 | Recurso con identidad amplia | Acceso mucho más allá de la función | Uso de la identidad fuera de su patrón normal | Least privilege por recurso, revisión periódica |
| Consentimiento OAuth malicioso | T1528 | Usuario acepta el consentimiento | Acceso a correo y archivos con permiso delegado | Consentimientos nuevos con permisos amplios | Restringir el consentimiento de usuario |
| Escalada desde el nodo al plano de control (K8s) | T1611 | Compromiso del nodo | Tokens de todos los pods del nodo | Audit log de uso de tokens de nodo | NodeRestriction, tokens proyectados de vida corta |

## Contenedores

Detalle en [containers/containers.md](../containers/containers.md).

| Técnica | ATT&CK | Precondición | Efecto |
|---|---|---|---|
| Contenedor privilegiado | T1611 | `--privileged` | Root del host, trivial |
| Socket de Docker montado | T1610 | `/var/run/docker.sock` en el contenedor | Crear un contenedor privilegiado → host |
| `hostPID` / `hostNetwork` / `hostPath` | T1611 | Configuración del pod | Acceso a procesos, red o archivos del host |
| Capabilities excesivas (`CAP_SYS_ADMIN`, `CAP_SYS_PTRACE`) | T1611 | Configuración del contenedor | Escape por múltiples vías |
| Escape por vulnerabilidad del runtime | T1611 | runc/containerd sin parchear | Escape al host |
| Abuso de `release_agent` de cgroups v1 | T1611 | `CAP_SYS_ADMIN` y cgroups v1 | Ejecución como root en el host |

## Principios defensivos

1. **Los administradores locales son un privilegio, no un estado por defecto.** La mayoría de las cadenas empieza porque el usuario diario es administrador de su equipo.
2. **LAPS elimina una clase entera de movimiento lateral** (contraseña local reutilizada). Coste bajo, impacto alto.
3. **Modelo de tiering**: las credenciales de Tier 0 (DC, ADCS, backup, hipervisor) nunca se usan en Tier 1/2. La mayoría de las escaladas a DA se producen porque un administrador de dominio inició sesión en una estación comprometida.
4. **Auditar rutas de ataque, no permisos individuales.** Un permiso inocuo encadenado con otros dos da DA; solo un análisis de grafo lo ve.
5. **Los privilegios de token de Windows y las capabilities de Linux se otorgan y se olvidan.** Revisarlos periódicamente contra una línea base.
