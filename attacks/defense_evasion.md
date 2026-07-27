---
id: attacks/defense_evasion
tipo: catalogo
estabilidad: permanente
tactica: TA0005
---

# Evasión de defensas

La táctica con más técnicas de ATT&CK, porque cada control genera su propia evasión. Principio defensivo: **el intento de evasión es en sí mismo la señal de mayor calidad**. Nadie desactiva legítimamente el registro de eventos ni borra los logs de seguridad.

## Desactivar o cegar los controles

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Desactivar o modificar herramientas de seguridad | T1562.001 | Administrador local | EDR/AV apagado | Servicio de seguridad detenido; heartbeat perdido en la consola | Protección antimanipulación, alerta por pérdida de agente |
| Desinstalación por BYOVD | T1562.001 + T1068 | Administrador | Terminar procesos protegidos desde el kernel | Carga de driver vulnerable conocido | Lista de bloqueo de drivers, HVCI |
| Desactivar el registro de eventos | T1562.002 | Administrador | Ceguera del SIEM | 1102 (log limpiado), servicio EventLog detenido, hueco en la telemetría | Reenvío inmediato de logs fuera del host |
| Bypass de AMSI | T1562.001 | Ejecución de PowerShell/.NET | El contenido no se escanea | Errores de AMSI, patrones de parcheo en memoria | ScriptBlock logging (registra aunque AMSI caiga), WDAC |
| Bypass de ETW | T1562.006 | Ejecución en el proceso | El EDR pierde eventos | Discrepancia entre fuentes de telemetría | ETW-Ti (protegido), telemetría de kernel |
| Modificar el firewall del host | T1562.004 | Administrador | Abrir puertos o permitir salida | 4946-4948, cambios en reglas | Reglas gestionadas por GPO, alerta ante cambios |
| Bloqueo de indicadores (hosts file, DNS) | T1562.006 | Administrador | Bloquear la comunicación con la nube del EDR | Cambios en `hosts`, resoluciones fallidas del EDR | FIM sobre `hosts`, monitorizar conectividad del agente |
| Arranque en modo seguro | T1562.009 | Administrador | El EDR no carga; usado antes de cifrar | `bcdedit /set safeboot`, reinicio inesperado | Alerta sobre cambios en `bcdedit` |
| Detener servicios de seguridad y backup | T1489 | Administrador | Prepara el impacto | 7036 masivo, `net stop`, `taskkill` | Alerta sobre parada de servicios críticos |

## Borrado y manipulación de evidencia

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Limpiar registros de eventos | T1070.001 | Administrador | Elimina la línea de tiempo | **1102** — evento de altísimo valor; hueco temporal | Reenvío en tiempo real; el log ya está fuera cuando se borra |
| Borrado de archivos y herramientas | T1070.004 | Ejecución | Elimina artefactos | MFT, USN journal, `$LogFile` | Forense de disco; telemetría de EDR ya recogida |
| Timestomping | T1070.006 | Ejecución | Falsea fechas de archivo | Discrepancia entre `$STANDARD_INFORMATION` y `$FILE_NAME` en la MFT | Análisis forense de MFT |
| Borrado del historial de comandos | T1070.003 | Ejecución | Oculta la actividad interactiva | `HISTFILE` sin definir, `history -c`, tamaño 0 | Reenvío de shell logging, auditd |
| Vaciado de la papelera y de copias de sombra | T1490 | Administrador | Impide recuperación | `vssadmin delete shadows`, `wbadmin delete` | Alerta inmediata sobre esos comandos |
| Manipulación de logs en la nube | T1562.008 | Permisos sobre el servicio de logging | Ceguera en el proveedor | `StopLogging`, `DeleteTrail`, cambios en diagnóstico | Logs en cuenta separada e inmutables, alerta obligatoria |

## Ofuscación y empaquetado

| Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación |
|---|---|---|---|---|---|
| Ofuscación de scripts | T1027 | Script | Evade firmas de contenido | Entropía alta, concatenación, `-join`, `char[]` | Logging que registra el bloque **desofuscado** (4104) |
| Empaquetado de binarios | T1027.002 | Binario | Evade firmas estáticas | Alta entropía de sección, pocas importaciones | Detección conductual, desempaquetado en sandbox |
| Codificación en base64 / XOR | T1027 | Payload | Evita coincidencias literales | `-enc`, cadenas largas base64 | Decodificación en la regla de detección |
| Resolución dinámica de API | T1027.007 | Código propio | Sin importaciones sospechosas en la tabla | Hashing de nombres de API en memoria | YARA en memoria |
| Payload en esteganografía | T1027.003 | Canal de entrega | Payload dentro de una imagen | Anomalía de tamaño y entropía | Análisis de contenido, egress restringido |
| Archivos comprimidos o cifrados | T1027 | Entrega | Evita el escaneo en tránsito | Adjunto cifrado desde remitente externo | Política de correo |
| Bypass de Mark-of-the-Web | T1553.005 | ISO/IMG/7z como contenedor | El contenido no hereda MOTW | Montaje de imagen seguido de ejecución | Bloquear montaje de imágenes, bloquear extensiones de contenedor en correo |
| Firma de código robada o falsa | T1553.002 | Certificado comprometido | Parece software legítimo | Certificado válido con reputación baja o emisor inusual | Reputación de firmante, application control por publicador conocido |

## Vivir de la tierra (LOLBins)

Binarios legítimos y firmados del sistema, usados con fines maliciosos. Ninguno se puede bloquear sin más: se controla el **contexto** de uso.

| Binario | Abuso característico | ATT&CK | Señal de alerta |
|---|---|---|---|
| `rundll32.exe` | Ejecutar una DLL o JavaScript | T1218.011 | Argumento con ruta de usuario o `javascript:` |
| `regsvr32.exe` | Ejecutar scriptlet remoto ("Squiblydoo") | T1218.010 | `/i:http`, `scrobj.dll` |
| `mshta.exe` | Ejecutar HTA local o remoto | T1218.005 | URL como argumento |
| `certutil.exe` | Descargar y decodificar base64 | T1105 | `-urlcache`, `-decode` |
| `bitsadmin.exe` | Descarga diferida y persistente | T1197 | `/transfer` con destino en `%TEMP%` |
| `msiexec.exe` | Instalar MSI remoto | T1218.007 | `/i http…`, `/q` |
| `msbuild.exe` | Compilar y ejecutar C# inline | T1127.001 | Ejecución fuera de un entorno de desarrollo |
| `installutil.exe`, `regasm`, `regsvcs` | Ejecutar .NET evadiendo application control | T1218 | Uso fuera de instalación de software |
| `wmic.exe` | Ejecución local y remota | T1047 | `process call create`, `/node:` |
| `forfiles`, `pcalua`, `conhost` | Proxy de ejecución de comandos | T1202 | Padre de un proceso inesperado |
| `mavinject.exe` | Inyección de DLL | T1055.001 | Cualquier uso |
| `odbcconf.exe` | Cargar DLL | T1218.008 | `/a {regsvr}` |
| `cmstp.exe` | Ejecutar INF, bypass de UAC | T1218.003 | `/s /ns` con INF local |
| `wuauclt`, `dfsvc`, `presentationhost` | Proxy de ejecución poco vigilado | T1218 | Padre anómalo |
| `powershell.exe` sin `powershell.exe` | Ejecutar PowerShell vía `System.Management.Automation.dll` | T1059.001 | Proceso que carga esa DLL sin ser PowerShell |
| `curl`, `wget`, `scp` (Linux/Windows moderno) | Descarga de herramientas | T1105 | Uso en servidores que no lo requieren |
| `bash`, `python`, `perl` en servidores | Ejecución | T1059 | Presencia innecesaria |
| `at`, `crontab`, `systemd-run` | Ejecución diferida | T1053 | Creación fuera de gestión de configuración |

Estrategia defensiva: **WDAC/AppLocker en modo bloqueo con la lista de binarios bloqueados recomendada por Microsoft**, más detección por relación padre-hijo y por argumentos de red. Bloquear todos los LOLBins es imposible; bloquear su uso desde procesos de servidor web u Office es viable y muy rentable.

## Inyección y ejecución encubierta en procesos

| Técnica | ATT&CK | Mecánica | Detección |
|---|---|---|---|
| Inyección de DLL clásica | T1055.001 | `VirtualAllocEx` + `WriteProcessMemory` + `CreateRemoteThread` | Sysmon E8; handle con `PROCESS_VM_WRITE` |
| Inyección de DLL reflexiva | T1055 | La DLL se mapea sin pasar por el cargador | Memoria RX privada sin módulo respaldado |
| Process hollowing | T1055.012 | Crear proceso suspendido, vaciar su imagen, reemplazarla | Imagen en memoria distinta del archivo en disco |
| Process doppelgänging / herpaderping | T1055.013 | Transacciones NTFS o modificación tras el mapeo | Discrepancia disco-memoria |
| Inyección por APC | T1055.004 | `QueueUserAPC` sobre un hilo en espera alertable | Telemetría de kernel |
| Thread execution hijacking | T1055.003 | Suspender hilo, cambiar el contexto | `SetThreadContext` sobre proceso ajeno |
| Module stomping | T1055 | Sobrescribir el `.text` de una DLL legítima ya cargada | Hash de sección distinto del archivo |
| Inyección en Linux (`ptrace`, `/proc/pid/mem`) | T1055.008/.009 | Escritura en memoria de otro proceso | auditd sobre `ptrace`; `yama.ptrace_scope` |

## Enmascaramiento e identidad falsa

| Técnica | ATT&CK | Ejemplo | Detección |
|---|---|---|---|
| Nombre o ruta legítima | T1036.005 | `svch0st.exe`, `lsass.exe` en `%TEMP%` | Binario del sistema fuera de `System32` |
| Extensión doble o RTLO | T1036.002 | `factura.pdf.exe`, caracteres Unicode de inversión | Nombres con caracteres de control |
| Suplantación de proceso padre (PPID spoofing) | T1134.004 | El proceso aparenta ser hijo de `explorer.exe` | Discrepancia entre padre reportado y creador real |
| Suplantación de línea de comandos | T1564 | La línea real difiere de la registrada | Telemetría de EDR frente a 4688 |
| Metadatos y firma imitados | T1036.001 | Recursos de versión copiados de un binario legítimo | Firma inválida con metadatos válidos |

## Ocultación de artefactos

| Técnica | ATT&CK | Mecánica | Detección |
|---|---|---|---|
| Archivos y directorios ocultos | T1564.001 | Atributo oculto, prefijo `.` en Unix | Enumeración forzada |
| Flujos de datos alternativos NTFS | T1564.004 | Payload en `archivo.txt:oculto` | `dir /r`, escaneo de ADS |
| Ventana oculta | T1564.003 | `-WindowStyle Hidden` | Argumento en la línea de comandos |
| Cuenta oculta | T1564.002 | Nombre terminado en `$`, exclusión de la pantalla de login | Enumeración de cuentas vía API, no vía UI |
| Rootkit | T1014 | Ocultación en kernel | Comparación de vistas; forense de memoria |
| Sistema de archivos virtual del malware | T1564 | Contenedor cifrado propio | Archivos grandes de alta entropía |
| Partición o espacio no asignado | T1564 | Datos fuera del sistema de archivos | Forense de disco completo |

## Evasión del análisis

| Técnica | ATT&CK | Mecánica | Contramedida |
|---|---|---|---|
| Detección de máquina virtual y sandbox | T1497 | Comprobar drivers, MAC, número de CPU, tiempo de actividad | Sandbox endurecido; análisis en hardware real |
| Detección de depurador | T1622 | `IsDebuggerPresent`, temporización, PEB | Depuración con anti-anti-debug |
| Retardo de ejecución | T1497.003 | Dormir horas antes de actuar | Sandbox con aceleración de tiempo, análisis prolongado |
| Ejecución condicionada al entorno | T1480 | Clave derivada del dominio, idioma o nombre de host | Análisis con el contexto correcto; el payload no se descifra en sandbox |
| Comprobación de geografía o idioma | T1480 | No ejecuta en determinados países | Indicio de origen, no de seguridad |

## Prioridades de detección

Estas cinco señales, bien implementadas, cubren la mayor parte de la evasión real:

1. **1102** (registro de seguridad limpiado) y detención del servicio de eventos.
2. **Pérdida de heartbeat del EDR** en un host que sigue vivo en la red.
3. **Carga de drivers de la lista de vulnerables conocidos**.
4. **`vssadmin delete shadows` / `wbadmin delete` / `bcdedit /set safeboot`** — preludio casi seguro de ransomware.
5. **LOLBin con argumento de red lanzado por un proceso de servidor u Office**.
