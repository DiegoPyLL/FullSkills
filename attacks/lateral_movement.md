---
id: attacks/lateral_movement
tipo: catalogo
estabilidad: permanente
tactica: TA0008
---

# Movimiento lateral

Pasar del primer host a los que importan. El objetivo casi nunca es el equipo comprometido inicialmente: es el controlador de dominio, el servidor de archivos, el hipervisor o la consola de backup.

**Métrica clave**: *breakout time*, el tiempo desde el primer host hasta el primer salto lateral. Define cuánto margen real tiene el SOC. En operaciones competentes se mide en decenas de minutos.

## Uso de material de autenticación alternativo

Ninguna de estas técnicas necesita conocer la contraseña.

| Técnica | ATT&CK | Requiere | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Pass-the-Hash | T1550.002 | Hash NTLM | Autenticación como el usuario en cualquier host que acepte NTLM | 4624 tipo 3 con NTLM desde host inusual; misma cuenta en muchos destinos | Credential Guard, Protected Users, `LocalAccountTokenFilterPolicy`, LAPS, desactivar NTLM |
| Pass-the-Ticket | T1550.003 | TGT o TGS robado | Autenticación Kerberos sin contraseña | Ticket usado desde IP distinta a la de emisión | Credential Guard, vida corta de tickets |
| Overpass-the-Hash | T1550.002 | Hash o clave AES | Convierte el hash en TGT legítimo | 4768 con tipo de cifrado inconsistente con el cliente | Igual que arriba |
| Golden / Silver Ticket | T1558.001/.002 | Hash de `krbtgt` o de la cuenta de servicio | Acceso arbitrario y persistente | Ver [credential_access.md](credential_access.md#kerberos) | Doble reset de `krbtgt`, gMSA |
| Token de sesión web robado | T1550.004 | Cookie de sesión | Acceso a SaaS saltando el MFA | Sesión desde nueva IP/dispositivo sin nueva autenticación | Token protection, acceso condicional por dispositivo, vidas cortas |
| Token de acceso de aplicación | T1550.001 | Token OAuth o clave de API | Acceso a la API con la identidad de la app | Uso de token desde origen inesperado | Vidas cortas, ligado a dispositivo, revocación continua |

## Servicios remotos

| Técnica | ATT&CK | Puerto | Huella que deja | Detección | Mitigación |
|---|---|---|---|---|---|
| RDP | T1021.001 | 3389 | 4624 tipo 10, `mstsc`, `bitmap cache` | Login RDP entre estaciones (nunca legítimo en la mayoría de redes) | Restringir RDP a jump hosts; MFA; Remote Credential Guard |
| SMB / recursos administrativos | T1021.002 | 445 | 5140, acceso a `ADMIN$`/`C$`, servicio creado | Acceso a `ADMIN$` desde estaciones; 7045 en el destino | Firewall de host bloqueando SMB entre estaciones |
| WinRM / PowerShell Remoting | T1021.006 | 5985/5986 | 4624 tipo 3, `wsmprovhost.exe` como padre | `wsmprovhost.exe` con procesos hijo | Restringir WinRM a hosts de administración, JEA |
| DCOM | T1021.003 | 135 + dinámicos | `mmc.exe`/`excel.exe` como padre de procesos remotos | Instanciación remota de objetos COM | Endurecer permisos DCOM, filtrado RPC |
| WMI | T1047 | 135 + dinámicos | `WmiPrvSE.exe` como padre | Proceso hijo de `WmiPrvSE` | Restringir WMI remoto por firewall |
| SSH | T1021.004 | 22 | Logs de `sshd`, `authorized_keys` | Login SSH desde origen inusual; uso de claves nuevas | Claves gestionadas, bastión, MFA, allow-list |
| VNC y escritorio remoto de terceros | T1021.005 | Varios | Instalación del servicio | Software de acceso remoto no aprobado | Application control |
| Servicios de nube (SSM, Run Command, Serial Console) | T1021.007 | API | Ejecución sin tocar la red | CloudTrail: `SendCommand`, `RunCommand` | Restringir por IAM, requerir aprobación |

## Herramientas de ejecución remota

| Herramienta | Mecánica | Huella | Detección |
|---|---|---|---|
| PsExec (y variantes de Impacket) | Copia el servicio a `ADMIN$`, lo crea y lo ejecuta | 7045 con nombre de servicio aleatorio; `PSEXESVC` | Creación de servicio con binario recién copiado |
| `wmiexec` | WMI + salida por SMB | `WmiPrvSE` como padre de `cmd` | Padre anómalo |
| `smbexec` | Servicio temporal por cada comando | 7045 repetido | Ráfaga de creación y borrado de servicios |
| `atexec` | Tarea programada remota | 4698 remoto | Tareas creadas desde red |
| `dcomexec` | DCOM | `mmc`/`excel` como padre | Padre anómalo |
| `sc.exe \\host` | Servicio remoto | 7045 | Ídem |
| `schtasks /s host` | Tarea remota | 4698 | Ídem |
| PowerShell Remoting | WinRM | `wsmprovhost` | Ídem |
| Herramientas RMM (AnyDesk, ScreenConnect, Atera, TeamViewer) | Instalación legítima usada por el atacante | Servicio nuevo, tráfico a la nube del proveedor | **Allow-list de la herramienta RMM corporativa y alerta ante cualquier otra**: control de altísimo valor |

## Movimiento por infraestructura compartida

| Técnica | ATT&CK | Precondición | Efecto | Mitigación |
|---|---|---|---|---|
| Despliegue por GPO | T1484.001 | Permiso de escritura sobre una GPO | Ejecución simultánea en todo el ámbito: vector clásico de despliegue de ransomware | Delegación mínima sobre GPO, auditoría de SYSVOL (5136) |
| Herramientas de despliegue (SCCM, Intune, Ansible, Puppet) | T1072 | Acceso a la consola | Ejecución masiva instantánea | Tratar la consola como Tier 0: MFA, aprobación dual, segmentación |
| Contaminación de contenido compartido | T1080 | Escritura en un recurso compartido | Infecta a quien abra el archivo | Permisos mínimos, FIM en shares |
| Spearphishing interno | T1534 | Buzón comprometido | Alta credibilidad | Detección de correo interno anómalo; no confiar por ser interno |
| Explotación de servicio remoto interno | T1210 | Servicio interno vulnerable | Ejecución en el destino | Parcheo interno, segmentación |
| Copia de herramientas | T1570 | Acceso al destino | Traslada el arsenal | Transferencias SMB de ejecutables entre hosts |
| Secuestro de sesión remota | T1563 | SYSTEM en el host | Tomar la sesión de otro sin credenciales | Cerrar sesiones desconectadas |
| Movimiento vía hipervisor | T1021 | Acceso a vCenter/ESXi | Control de todas las VM a la vez | [vmware/vmware.md](../vmware/vmware.md) |
| Movimiento vía consola de backup | T1078 | Acceso al servidor de backup | Acceso a los datos y capacidad de destruir la recuperación | Backup en dominio separado, MFA, inmutabilidad |

## Movimiento lateral en la nube y entre planos

| Técnica | ATT&CK | Ruta | Mitigación |
|---|---|---|---|
| On-premises → nube | T1078.004 | Compromiso de Entra Connect, ADFS o de una cuenta sincronizada privilegiada | Cuentas cloud-only para roles privilegiados; Entra Connect tratado como Tier 0 |
| Nube → on-premises | T1021.007 | Agentes de gestión (Intune, SSM, Arc) que ejecutan en servidores internos | Restringir quién puede ejecutar comandos vía agente |
| Entre cuentas / suscripciones | T1078.004 | Roles con confianza cruzada, políticas de recurso permisivas | Condiciones estrictas en las políticas de confianza, SCP |
| Entre tenants | T1199 | Colaboración B2B, aplicaciones multi-tenant, delegación de partner | Revisar acceso de partners (GDAP), restringir colaboración externa |
| Pod → nodo → cluster | T1611 | Escape de contenedor y robo de tokens del nodo | [kubernetes/kubernetes.md](../kubernetes/kubernetes.md) |
| CI/CD → producción | T1195 | El pipeline tiene credenciales de despliegue | OIDC de vida corta, entornos con aprobación, separación de deber |

## Detección: las señales que realmente funcionan

| Señal | Por qué funciona |
|---|---|
| **Autenticación entre estaciones de trabajo** | En una red bien diseñada, una estación nunca se autentica contra otra. Casi cero falsos positivos |
| **Una cuenta autenticándose contra N hosts en poco tiempo** | Patrón de abanico; el humano legítimo no lo hace |
| **Cuenta de administrador local usada en varios hosts** | Indica contraseña compartida (y ausencia de LAPS) |
| **4624 tipo 3 con NTLM hacia hosts que deberían usar Kerberos** | Indicio directo de Pass-the-Hash |
| **7045 con nombre de servicio aleatorio** | Firma de PsExec y variantes |
| **`wsmprovhost.exe` o `WmiPrvSE.exe` con procesos hijo** | Ejecución remota |
| **Herramienta RMM no corporativa instalada** | Uno de los indicadores más fiables de intrusión actual |
| **Cuenta de servicio autenticándose de forma interactiva** | Las cuentas de servicio nunca deberían tener sesión interactiva |
| **Ticket Kerberos usado desde una IP distinta a la de emisión** | Pass-the-Ticket |

## Contención del movimiento lateral

Ordenado por reducción de riesgo frente a coste:

1. **Firewall de host que bloquea SMB, RPC y RDP entre estaciones de trabajo.** Elimina la mayor parte del movimiento lateral en redes planas. Coste bajo, impacto muy alto.
2. **LAPS**: cada equipo con contraseña de administrador local única.
3. **Modelo de tiering**: las credenciales de Tier 0 solo se usan desde estaciones de administración dedicadas (PAW).
4. **Restringir el logon de red de cuentas locales** (`LocalAccountTokenFilterPolicy`, grupos `Deny access from network`).
5. **Segmentación por función**, no solo por ubicación. Servidores, estaciones, OT, gestión y backup en zonas distintas.
6. **MFA en el acceso administrativo interno**, no solo en el perímetro.
7. **Protected Users y Credential Guard** para que no quede material reutilizable en memoria.
