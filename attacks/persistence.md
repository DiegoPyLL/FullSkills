---
id: attacks/persistence
tipo: catalogo
estabilidad: permanente
tactica: TA0003
---

# Persistencia

Sobrevivir a reinicios, cambios de contraseña y a la propia respuesta a incidentes. **Regla de erradicación**: un atacante competente instala varias persistencias de tipos distintos. Encontrar una y detenerse es el error más caro de un IR.

Clasificación por resistencia: la persistencia en **identidad** (credenciales, tokens, ACL, certificados) sobrevive a la reinstalación del sistema operativo. La de **firmware** sobrevive al formateo. Ambas se buscan al final y son las que devuelven al atacante.

## Windows — arranque y sesión

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Claves Run / RunOnce | T1547.001 | Escritura en HKCU o HKLM | Ejecución al iniciar sesión | Sysmon E13 sobre `...\CurrentVersion\Run*` | FIM del registro; el valor legítimo cambia poco |
| Carpeta de inicio | T1547.001 | Escritura en el perfil | Ejecución al iniciar sesión | Creación de archivo en `Startup` | FIM |
| Servicio de Windows | T1543.003 | Administrador local | Ejecución como SYSTEM al arrancar | 7045, 4697; binario en ruta inusual, servicio sin descripción | Auditar creación de servicios; WDAC |
| Tarea programada | T1053.005 | Administrador o usuario | Ejecución periódica o por evento | 4698/4702; tareas ocultas (sin valor `SD`) | Auditoría de tareas; comparar contra baseline |
| Suscripción a evento WMI | T1546.003 | Administrador local | Ejecución sin archivo, disparada por condición | Sysmon E19/20/21; consultar `__EventFilter`, `__EventConsumer`, `__FilterToConsumerBinding` | Auditoría periódica del repositorio WMI |
| Winlogon Helper (`Userinit`, `Shell`) | T1547.004 | Escritura en HKLM | Ejecución en el logon | Cambios en esos valores | FIM del registro |
| DLL de AppInit | T1546.010 | Escritura en HKLM | Carga en cada proceso GUI | Valor `AppInit_DLLs` no vacío | Desactivado con Secure Boot; auditar |
| IFEO / Debugger | T1546.012 | Escritura en HKLM | Ejecuta un binario al lanzarse otro | Valor `Debugger` bajo Image File Execution Options | FIM del registro |
| Accessibility features (sethc, utilman) | T1546.008 | Administrador local | Shell SYSTEM desde la pantalla de bloqueo | Sustitución de binarios en `System32`; IFEO sobre `sethc.exe` | Integridad de archivos del sistema |
| Netsh helper DLL | T1546.007 | Administrador | Carga al ejecutarse `netsh` | Clave `NetSh` con DLL nueva | FIM |
| Screensaver | T1546.002 | Escritura en HKCU | Ejecución tras inactividad | Valor `SCRNSAVE.EXE` anómalo | Política de GPO |
| Proveedor de seguridad (SSP/LSA) | T1547.005 | Administrador | Carga en LSASS; captura credenciales | Cambios en `Security Packages` | LSA Protection (PPL) |
| Port monitor / Print processor | T1547.010 / T1547.012 | Administrador | Carga por el spooler como SYSTEM | Nuevas DLL registradas en el spooler | Desactivar spooler donde no se use |
| Extensión COM hijack | T1546.015 | Escritura en HKCU\Software\Classes\CLSID | Carga en procesos que instancian ese CLSID | CLSID de usuario que enmascara uno de máquina | Auditoría de CLSID en HKCU |
| Extensión de navegador | T1176 | Instalación de extensión | Robo de sesión y datos, persistencia | Inventario de extensiones; permisos amplios | Allow-list de extensiones por política |
| BITS job | T1197 | Usuario | Descarga y ejecución diferida, poco monitorizada | `bitsadmin /list`; log de BITS-Client | Auditar trabajos BITS de larga duración |
| Modificación de accesos directos | T1547.009 | Escritura en el perfil | Ejecución al usar un acceso directo habitual | `.lnk` cuyo destino no coincide con el nombre | FIM del escritorio y del menú inicio |

## Linux / Unix

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Cron / at | T1053.003 | Usuario o root | Ejecución periódica | FIM sobre `/etc/cron*`, `/var/spool/cron` | Auditoría, allow-list de cron |
| Unidad y timer de systemd | T1543.002 | Root o usuario (unidades de usuario) | Servicio persistente | Unidades nuevas; `systemctl list-timers` | FIM sobre rutas de unidades |
| Scripts de perfil (`.bashrc`, `.profile`, `/etc/profile.d`) | T1546.004 | Escritura en el perfil | Ejecución en cada login | FIM sobre esos archivos | Perfiles gestionados por configuración |
| Módulo PAM malicioso | T1556.003 | Root | Captura credenciales y puerta trasera de login | Cambios en `/etc/pam.d` y módulos en `/lib/security` | FIM, firma de módulos |
| Clave SSH autorizada | T1098.004 | Escritura en `~/.ssh/authorized_keys` | Acceso permanente que sobrevive al cambio de contraseña | FIM sobre `authorized_keys` de todos los usuarios | Claves centralizadas, `AuthorizedKeysFile` de solo lectura |
| `LD_PRELOAD` / `/etc/ld.so.preload` | T1574.006 | Root | Inyección en todos los procesos | Contenido no vacío en `ld.so.preload` | FIM, alerta inmediata |
| Módulo de kernel (LKM rootkit) | T1547.006 | Root | Ocultación total y persistencia | `lsmod` contra baseline; `dmesg` de carga de módulos | Firma obligatoria de módulos, Secure Boot, `module.sig_enforce` |
| `rc.local` e init scripts | T1037.004 | Root | Ejecución al arranque | FIM | Configuración gestionada |
| Cuenta con UID 0 añadida | T1136 | Root | Acceso administrativo persistente | Cualquier entrada de `/etc/passwd` con UID 0 distinta de `root` | Auditoría periódica, alerta |
| Binario setuid plantado | T1548.001 | Root | Reescalada instantánea desde usuario normal | Inventario de setuid contra baseline | Montajes `nosuid`, auditoría |
| Trampa en `git hooks` / herramientas de dev | T1546 | Escritura en el repositorio | Ejecución en la máquina del desarrollador | Revisión de hooks | Hooks gestionados, `core.hooksPath` controlado |

## Persistencia de identidad (la que sobrevive al formateo)

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Golden Ticket | T1558.001 | Hash de `krbtgt` | TGT forjado para cualquier usuario, válido años | TGT con vida anómala; 4769 sin 4768 previo | Doble reset de `krbtgt`; ver [active_directory](../active_directory/active_directory.md) |
| Silver Ticket | T1558.002 | Hash de la cuenta de servicio | Acceso a un servicio sin pasar por el DC | Ausencia de 4769 en el DC para un acceso observado | Rotación de cuentas de servicio, gMSA |
| Diamond / Sapphire Ticket | T1558.001 | Hash de `krbtgt` | TGT legítimo modificado: más difícil de detectar que el Golden | Anomalías en atributos de PAC | Igual que Golden Ticket |
| Skeleton Key | T1556.001 | Administrador en el DC | Contraseña maestra que funciona para todos | `lsass` con módulo inyectado; reinicio del DC lo elimina | LSA Protection, Credential Guard, monitorizar el DC |
| Cuenta creada o promovida | T1136 / T1098 | Privilegios de administración | Acceso legítimo permanente | 4720, 4728, 4732, 4756 | Alerta sobre cambios en grupos privilegiados |
| ACL / ACE maliciosa en AD | T1098 | Permisos de escritura sobre el objeto | Puede reasignarse privilegios cuando quiera | 5136 sobre `nTSecurityDescriptor`; auditoría de ACL con BloodHound | Revisión periódica de rutas de ataque en AD |
| AdminSDHolder | T1098 | Escritura sobre el objeto | Reaplica permisos cada hora sobre grupos protegidos | 5136 sobre AdminSDHolder | Auditoría específica de ese objeto |
| DCShadow | T1207 | Privilegios de DA | Registra un DC falso e inyecta cambios sin generar logs de modificación normales | Registro de nuevos objetos `nTDSDSA`; tráfico de replicación desde un host no DC | Restringir quién puede registrar DC; monitorizar replicación |
| Certificado de AD CS robado o emitido | T1649 | Plantilla mal configurada o robo de la CA | Autenticación como cualquier usuario durante la vida del certificado; **no lo invalida el cambio de contraseña** | Emisiones anómalas en la CA; autenticación por certificado inesperada | Revisar plantillas (ESC1-ESC8), proteger la clave de la CA, revocación |
| Credencial adicional en aplicación cloud | T1098.001 | Permisos sobre la app | Acceso permanente vía service principal | Auditoría de Entra ID: `Add service principal credentials` | Revisión de credenciales de aplicación, vidas cortas |
| Federación maliciosa / Golden SAML | T1606.002 | Clave de firma del IdP | Suplantación de cualquier usuario en todos los SP federados | Cambios en dominios federados; aserciones sin autenticación previa | Proteger la clave de firma (HSM), alertar sobre cambios de federación |
| Delegación de permisos OAuth | T1098.002 | Consentimiento del usuario o del admin | Acceso al correo y a los archivos sin credencial | Consentimientos nuevos con permisos amplios | Restringir consentimiento de usuario, revisión de apps |
| Token de larga vida / clave de API | T1098 | Acceso a la consola | Acceso persistente que evade MFA | Inventario de tokens y su antigüedad | Vidas cortas, rotación, OIDC en vez de claves estáticas |
| Reglas de reenvío de correo | T1114.003 | Acceso al buzón | Exfiltración continua tras perder el acceso | Reglas de reenvío externo, reglas ocultas | Bloquear reenvío externo automático, alertar |

## Persistencia de bajo nivel

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Bootkit | T1542.003 | Administrador y acceso al arranque | Ejecución antes del sistema operativo | Medición de arranque (TPM), verificación de la partición EFI | Secure Boot, UEFI con contraseña, atestación remota |
| Implante en firmware UEFI | T1542.001 | Escritura en la SPI flash | Sobrevive al formateo y al cambio de disco | Volcado y comparación de firmware; atestación | Protección de escritura de la flash, actualizaciones firmadas, Boot Guard |
| Firmware de dispositivo (BMC/iLO, NIC, disco) | T1542.005 | Acceso al plano de gestión | Persistencia invisible al sistema operativo | Red de gestión aislada y auditada | BMC en red dedicada, credenciales propias, firmware actualizado |
| Rootkit de kernel | T1014 | Root/SYSTEM | Oculta procesos, archivos y conexiones | Discrepancias entre vistas del sistema y forense de memoria | Firma de drivers, HVCI, Secure Boot |
| Driver vulnerable firmado (BYOVD) | T1068 + T1014 | Administrador | Acceso a kernel con un driver legítimo | Carga de drivers de la lista de bloqueo conocida | Lista de bloqueo de drivers vulnerables de Microsoft, HVCI |
| Persistencia en hipervisor o en la imagen base | T1542 | Acceso al plano de virtualización | Reaparece en cada VM nueva | Integridad de plantillas e imágenes doradas | Firma y verificación de plantillas |

## Persistencia en cloud, contenedores y CI/CD

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Rol IAM con confianza externa | T1098.003 | Permisos IAM | Acceso desde una cuenta del atacante | Revisión de `AssumeRolePolicy` con principales externos | Condiciones de `ExternalId`, revisión de políticas de confianza |
| Función serverless con backdoor | T1546 | Permisos de despliegue | Ejecución programada o disparada por evento | Funciones nuevas o modificadas fuera de IaC | Despliegue solo por pipeline; detección de drift |
| Snapshot o AMI compartida | T1537 | Permisos sobre el recurso | Copia de los datos en la cuenta del atacante | Alertas de compartición pública o cross-account | SCP que prohíba compartir fuera de la organización |
| CronJob / DaemonSet malicioso en Kubernetes | T1053.007 | Permisos en el namespace | Ejecución en todos los nodos | Comparación contra GitOps; admission controller | GitOps con reconciliación, políticas de admisión |
| Mutating admission webhook | T1554 | Permisos de cluster-admin | Inyecta un sidecar en cada pod nuevo | Inventario de webhooks | RBAC estricto, revisión de webhooks |
| Runner de CI comprometido | T1195 | Acceso al pipeline | Ejecuta en cada build con acceso a secretos | Runners auto-hospedados no registrados; cambios en workflows | Runners efímeros, workflows protegidos, revisión obligatoria |
| Backdoor en imagen base | T1195.002 | Control del registro o del Dockerfile | Se propaga a todo despliegue | Firma de imagen, escaneo, comparación con el build | Imágenes firmadas y reproducibles |

## Procedimiento de erradicación

No se declara erradicado un incidente hasta haber cubierto, en este orden:

1. **Identidad**: rotación de contraseñas de servicio y de administradores, doble reset de `krbtgt`, revocación de tokens y sesiones, revisión de credenciales de aplicaciones y de certificados emitidos.
2. **Ejecución programada**: tareas, cron, timers, servicios, WMI, comparados contra una línea base.
3. **Autoarranque**: registro, unidades, perfiles, módulos.
4. **Red y acceso remoto**: reglas de firewall añadidas, túneles, herramientas RMM, claves SSH autorizadas, reglas de reenvío de correo.
5. **Cloud e identidad federada**: roles, políticas de confianza, service principals, aplicaciones consentidas, federación.
6. **Bajo nivel**: drivers, módulos de kernel, firmware, imágenes doradas — solo si la evidencia lo justifica, porque su verificación es cara.

Cierre correcto: **cortar todas las persistencias a la vez**. Erradicar por partes avisa al atacante y provoca que reactive la que quedó oculta.
