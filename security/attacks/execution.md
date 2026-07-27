---
id: attacks/execution
tipo: catalogo
estabilidad: permanente
tactica: TA0002
---

# Ejecución

Convertir el acceso en código corriendo. La detección de ejecución es la de mayor valor del SOC porque casi toda intrusión pasa por aquí y deja telemetría de creación de proceso.

**Telemetría imprescindible**: creación de proceso **con línea de comandos** (Sysmon E1 o 4688 con auditoría de línea de comandos activada), ScriptBlock logging de PowerShell (4104), `execve` de auditd en Linux. Sin línea de comandos, la mitad de este catálogo es indetectable.

## Intérpretes de comandos y scripting

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| PowerShell | T1059.001 | Ejecución en Windows | Ejecución en memoria, sin tocar disco | 4104 con contenido; `-enc`, `-nop`, `-w hidden`, `IEX`, `DownloadString` | Constrained Language Mode, WDAC, AMSI, firma de scripts |
| cmd.exe | T1059.003 | Ejecución en Windows | Encadenar comandos, LOLBins | Línea de comandos con `&&`, `/c`, redirecciones a rutas temporales | Application control; alertar sobre `cmd` hijo de procesos de servidor |
| Shell Unix | T1059.004 | Ejecución en Linux/macOS | Ejecución completa | auditd `execve`; `bash -i`, `curl \| sh` | Shell restringido, `noexec` en `/tmp`, eBPF |
| Python / Perl / Ruby | T1059.006 | Intérprete instalado | Payloads multiplataforma | Intérprete lanzado por un servicio web | Retirar intérpretes de servidores que no los necesitan |
| VBScript / JScript | T1059.005 / .007 | WSH habilitado | Ejecución desde archivo o HTA | `wscript`/`cscript` con archivo en `%TEMP%` | Desactivar Windows Script Host, bloquear `.js`/`.vbs` en correo |
| JavaScript en navegador | T1059.007 | XSS o página maliciosa | Ejecución en el contexto del usuario | CSP report-uri, telemetría del navegador | CSP estricta, aislamiento |
| AppleScript / osascript | T1059.002 | macOS | Automatización del sistema | `osascript` con `-e` | TCC, notarización, application control |
| Lua / AutoIt / NSIS empaquetados | T1059 | Instalador o script empaquetado | Ejecución de loader | Binario poco frecuente que lanza procesos de red | Reputación de binarios, application control |
| Cloud Shell / Cloud API | T1059.009 | Credencial cloud | Ejecución dentro del proveedor | CloudTrail/Audit logs de sesiones de shell | Restringir Cloud Shell, MFA, alertas |
| Ejecución en contenedor | T1609 | Acceso a la API del runtime | `kubectl exec`, `docker exec` | Audit log de `pods/exec` | RBAC estricto, prohibir exec en producción |

## Ejecución inducida por el usuario

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Archivo malicioso | T1204.002 | El usuario abre el archivo | Ejecución del payload | Proceso hijo de Office/lector PDF/archivador | ASR, MOTW, apertura en vista protegida |
| Enlace malicioso | T1204.001 | Clic | Descarga o robo de credencial | Descarga tras navegación a dominio nuevo | Aislamiento de navegador, proxy |
| Macro VBA | T1204.002 | Documento con macro habilitada | Ejecución con el usuario | `WINWORD.EXE` → `cmd`/`powershell`/`mshta` | Bloqueo de macros de Internet por política (control decisivo) |
| Archivos LNK | T1204.002 | Acceso directo malicioso, a menudo dentro de un ZIP/ISO | Ejecución encubierta | `.lnk` con argumentos de PowerShell; LNK en descargas | Bloquear `.lnk`, `.iso`, `.img` en correo |
| ISO / IMG / VHD montados | T1204.002 | El usuario monta la imagen | **Evade MOTW**: el contenido no hereda la marca | Evento de montaje de imagen seguido de ejecución | Bloquear montaje de imágenes por política de grupo |
| Archivos comprimidos con contraseña | T1204.002 | Contraseña en el cuerpo del correo | Evita el escaneo de contenido | Adjunto cifrado desde remitente externo | Bloqueo o cuarentena de archivos cifrados |
| ClickFix / pega-y-ejecuta | T1204.004 | La web instruye al usuario | El propio usuario ejecuta el comando | `RunMRU` en el registro; PowerShell con origen en portapapeles | Bloquear el diálogo Ejecutar por política, formación específica |
| HTML smuggling | T1027.006 | Adjunto HTML que reconstruye el binario en el navegador | Evade filtros de red y de correo | Adjunto HTML con Blob y `download` | Bloqueo de adjuntos HTML, inspección en el endpoint |

## Explotación para ejecución

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Explotación de cliente | T1203 | Documento o web con exploit | Ejecución sin interacción adicional | Crash del proceso, comportamiento anómalo de Office/navegador | Parcheo, sandbox del navegador, CET/CFG |
| Explotación de servicio remoto | T1210 | Servicio interno vulnerable | Ejecución en el host remoto | Tráfico anómalo hacia el puerto del servicio | Parcheo, segmentación |
| Explotación por deserialización | T1203 / T1190 | Sink de deserialización | RCE | Patrón de gadget, proceso hijo | Ver [web/web.md](../web/web.md) |

## Ejecución por servicios y planificadores

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Tarea programada | T1053.005 | Privilegio suficiente | Ejecución diferida y persistente | 4698; `schtasks /create`; tareas con binario en ruta de usuario | Auditar creación de tareas; restringir a administradores |
| Cron | T1053.003 | Acceso al sistema | Ejecución periódica | Cambios en `/etc/cron*`, `crontab -e` | FIM sobre rutas de cron |
| systemd timer | T1053.006 | Root o usuario con unidad propia | Ejecución periódica menos vigilada que cron | Unidades nuevas en `/etc/systemd/system` y `~/.config/systemd` | FIM, revisión de unidades |
| Creación de servicio | T1543.003 | Administrador local | Ejecución como SYSTEM | 7045, 4697; servicio con binario inusual | Auditar creación de servicios |
| WMI | T1047 | Credencial administrativa | Ejecución local o remota sin dejar binario | `wmic process call create`; `WmiPrvSE.exe` como padre | Restringir WMI remoto, monitorizar `WmiPrvSE` |
| DCOM | T1021.003 | Credencial administrativa | Ejecución remota vía objetos COM | `MMC20.Application`, `ShellWindows`; `mmc.exe` con hijos | Endurecer permisos DCOM, firewall |
| Herramienta de despliegue de software | T1072 | Acceso a SCCM/Intune/RMM | Ejecución masiva simultánea | Despliegue de paquete no aprobado | MFA y aprobación dual en la consola; segmentar el servidor de despliegue |
| GPO | T1484.001 | Permisos de escritura sobre la GPO | Ejecución en todos los equipos del ámbito | 5136 sobre objetos de política; scripts nuevos en SYSVOL | Delegación mínima sobre GPO, auditoría de SYSVOL |

## Ejecución sin proceso nuevo (la más difícil de ver)

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| API nativa | T1106 | Código propio | Evita `CreateProcess` y los ganchos habituales | Llamadas directas a syscall; discrepancia entre pila y módulo | EDR con telemetría de kernel; ETW-Ti |
| Módulos compartidos | T1129 | Capacidad de carga de DLL | Ejecución dentro de un proceso legítimo | Sysmon E7 con DLL sin firmar en ruta inusual | WDAC, firma obligatoria de DLL |
| Carga reflexiva de código | T1620 | Ejecución previa | Nunca toca disco | Memoria RX privada en proceso sin módulo respaldado | Escaneo de memoria, YARA en memoria ([yara/yara.md](../yara/yara.md)) |
| Inyección en proceso | T1055 | Handle sobre el proceso destino | Ejecuta bajo la identidad de otro proceso | Sysmon E8/E10; `CreateRemoteThread` | ASR, protección de procesos críticos |
| Ejecución solo en memoria de .NET | T1620 | Assembly cargado en memoria | Sin artefacto en disco | AMSI para .NET, ETW de CLR | AMSI habilitado, WDAC |

## Detecciones de alto valor (ordenadas por rendimiento)

1. **Relación padre-hijo anómala**: `winword.exe`/`excel.exe`/`outlook.exe` → `cmd`, `powershell`, `mshta`, `wscript`, `rundll32`, `regsvr32`. Casi ningún uso legítimo.
2. **`w3wp.exe` / `httpd` / `nginx` / `java` → shell**: web shell o explotación en curso. Prácticamente sin falsos positivos.
3. **PowerShell codificado u ofuscado**: `-enc`, `-e`, `FromBase64String`, concatenación de caracteres, `IEX` con descarga.
4. **Ejecución desde rutas de escritura de usuario**: `%TEMP%`, `%APPDATA%`, `C:\Users\Public`, `/tmp`, `/dev/shm`.
5. **LOLBins con argumentos de red**: `certutil -urlcache`, `bitsadmin /transfer`, `curl`/`wget` en servidores que no los usan. Ver [attacks/defense_evasion.md](defense_evasion.md#lolbins).
6. **Intérprete lanzado por un servicio que no debería tenerlo**: base de datos, servidor de impresión, appliance.

## Controles preventivos por orden de eficacia

| Control | Qué elimina | Coste de implantación |
|---|---|---|
| Application control (WDAC / AppLocker en bloqueo) | La mayoría de la ejecución no autorizada, incluidos LOLBins | Alto: requiere inventario y fases de auditoría |
| Bloqueo de macros con MOTW | El vector de documento más usado históricamente | Bajo |
| Reglas ASR | Procesos hijos de Office, ejecución desde correo, robo de credenciales | Bajo-medio |
| PowerShell en Constrained Language Mode | Payloads en memoria basados en .NET | Medio |
| `noexec` en `/tmp`, `/dev/shm`, `/var/tmp` | Payloads descargados en Linux | Bajo |
| Retirada de intérpretes en servidores | Superficie completa de scripting | Bajo, si se planifica |
