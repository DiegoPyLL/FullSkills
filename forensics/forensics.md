---
id: forensics/forensics
tipo: modelo
estabilidad: permanente
---

# Forense Digital

Metodología de adquisición, análisis y preservación de evidencia digital. Se diferencia de la respuesta a incidentes: el IR se centra en **contener y recuperar**; la forense en **comprender y preservar** para análisis y (potencialmente) procedimiento legal.

## Premisa fundamental

> Sin cadena de custodia íntegra, la evidencia carece de valor legal. Un análisis forense perfecto sobre evidencia inadmitsible no sirve.

## Principios

| Principio | Significado |
|---|---|
| Integridad | La evidencia no se altera durante la recolección; se usa write-blocker y hashes |
| Reproducibilidad | Otro forense puede repetir los pasos y obtener los mismos resultados |
| Documentación | Cada acción se registra con hora, herramienta y resultado |
| Orden de volatil | CPU/RAM → estado de red → discos → backups (misma regla que el IR) |
| Legalidad | Autorizaciones documentadas; jurisdicción aplicable |
| Separación de roles | Quien analiza no es quien contiene; conflicto de interés evita sesgo |

## Fase 1 — Preparación

| Elemento | Requisito |
|---|---|
| Kit forense | Write-blocker hardware, medios de almacenamiento con capacidad suficiente, herramientas (FTK Imager, dd, ddrescue), medios limpios, hash verifier |
| Autorizaciones | Escritas y firmadas; alcance definido |
| Cadena de custodia | Formulario con quién recogió, cuándo, dónde se almacena |
| Entorno de análisis | Máquina aislada con herramientas forenses; sin conexión a la red del incidente |
| Retención | Espacio para imágenes completas; RTO/RPO del análisis definido |

## Fase 2 — Adquisición de evidencia

**Orden de volatilidad** (priorizar lo que se pierde al apagar o apresar el sistema):

| Orden | Fuente | Método | Consideración |
|---|---|---|---|
| 1 | Memoria RAM | Volatility, WinPMEM, LiME (Linux), AVML | Contiene claves de cifrado, procesos inyectados, conexiones activas, contraseñas en claro. Apagar = perder. |
| 2 | Estado de red | `netstat`, `ss`, `lsof`, flujos de switch/IDS | Sesiones activas, C2, pivotes |
| 3 | Discos | Imagen forense bit-a-bit con write-blocker (E01, AFF4, raw+md5) | No montar el disco en escritura; write-blocker es obligatorio |
| 4 | Logs remotos | Exportación del SIEM, proxy, DNS, IdP | El log más valioso es el que no se tiene: se pide de inmediato |
| 5 | Backups | Punto conocido limpio anterior al incidente | Referencia de "estado normal" |

**Requisitos de la imagen:**
- Hash SHA-256 o MD5 antes y después de la adquisición.
- Metadata: fecha, hora, herramienta, operador, hardware destino.
- Cadena de custodia documentada desde el primer contacto.

## Fase 3 — Análisis de disco

| Área | Qué buscar | Herramientas |
|---|---|---|
| Sistema de archivos | Archivos ocultos, ADS NTFS, metadatos, $MFT, MFT mirroring | Autopsy, The Sleuth Kit, dfxml/plaso |
| Registro de Windows | Claves de logon, USB, autorun, userassist, recent, shellbags | Volatility, Registry Explorer, LAReCN |
| Prefetch / Shimcache / Amcache | Programas ejecutados, fecha primera ejecución, path | PECmd, ShimCacheParser |
| MFT (Master File Table) | Creación/modified/acceso de archivos, nombres borrados | mftParser, Autopsy |
| USN Journal | Historial de cambios de archivos | usnjrnl_parser |
| Historial de PowerShell | ScriptBlock log 4104, consola history | PowerShell, PowerShell-history-parser |
| Memoria swap/hibernación | Contenido de hiberfil.sys, pagefile.sys | FTK Imager, Volatility |
| Particiones no asignadas | Archivos borrados, fragmentos | PhotoRec, Autopsy |
| Imágenes de disco de VM | VMDK, VHDX, qcow2 | mount con write-blocker, FTK Imager |

### Artefactos de Windows de alto valor

| Artefacto | Ruta | Información |
|---|---|---|
| LNK files | `%APPDATA%\Microsoft\Windows\Recent`, `C:\Users\*\Links` | Programas/archivos abiertos, paths, timestamps |
| Jump lists | `%APPDATA%\Microsoft\Windows\Recent\AutomaticDestinations` | Archivos abiertos por aplicación, usuario |
| ShimCache | `SYSTEM\CurrentControlSet\Control\Session Manager\AppCompatCache` | Programas ejecutados en el sistema |
| Amcache | `Amcache.hve` | Versiones de software, paths, SHA-1 de binarios |
| Prefetch | `C:\Windows\Prefetch` | Cantidad y timestamp de ejecuciones de .exe |
| USB history | `Enum\USBSTOR`, `MTPDevices` | Dispositivos USB conectados, vendor/product ID |
| Lsass crash dumps | `C:\Windows\Minidump`, `C:\Windows\MEMORY.DMP` | Volcado de credenciales LSASS |
| Browser artifacts | Chrome: `History`, `Login Data`, `Login Data-journal` | Historial, cookies, contraseñas guardadas |
| Recent docs | `C:\Users\*\AppData\Local\Microsoft\Windows\Explorer` | Icon cache de accesos recientes |

### Artefactos de Linux de alto valor

| Artefacto | Ruta | Información |
|---|---|---|
| Bash history | `~/.bash_history`, `~/.zsh_history` | Comandos ejecutados por el usuario |
| Auth logs | `/var/log/auth.log`, `/var/log/secure` | Login exitoso/fallido, sudo, su |
| Syslog | `/var/log/syslog`, `/var/log/messages` | Eventos del sistema, inicio/fin de servicios |
| Journalctl | `journalctl -u <servicio> --since ... --until ...` | Logs de systemd de cualquier servicio |
| Wtmp/btmp | `/var/log/wtmp`, `/var/log/btmp` | Logins exitosos/fallidos (historial binario) |
| Sudo log | `/var/log/sudo_logsrvd/` o `/var/log/sudo` | Comandos ejecutados con sudo |
| Crontab | `/var/spool/cron/crontabs/*` | Tareas programadas por usuario |
| SSH config | `~/.ssh/authorized_keys`, `/etc/ssh/sshd_config` | Acceso SSH autorizado, configuración del servicio |

## Fase 4 — Análisis de memoria

| Área | Qué buscar | Herramientas |
|---|---|---|
| Procesos | Lista completa vs `/proc`, procesos ocultos por rootkit | Volatility (pslist, psscan, psxview), MemProcFS |
| Conexiones de red | Sesiones activas, C2, pivotes | Volatility (netscan, conns, socket descriptors) |
| DLLs cargadas | Módulos inyectados, side-loading, module stomping | Volatility (dlllist, modscan, hivelist) |
| Claves de cifrado | AES keys, session keys, passwords | Volatility (dumpcreds, keydump, lsadump) |
| Memoria de procesos sospechosos | Dump de memoria individual de un proceso | Volatility (memdump), Procdump |
| Claves de registro en memoria | Credenciales, configuraciones, GPP, LSA secrets | Volatility (hashdump, lsa_info, getkeys) |
| Scripts en memoria | PowerShell en claro antes de ofuscación | Volatility (pscmdline), strings de memoria |
| Redes de contenedores | Namespaces, fd descriptors, cgroup | Volatility (containers, netns) |

## Fase 5 — Análisis de red

| Fuente | Qué aporta | Formato |
|---|---|---|
| PCAP | Contenido de paquetes, flujos, protocolo | .pcap, .pcapng |
| Flujos de red (NetFlow/IPFIX) | Topología de comunicación, volumen, timing | NetFlow v9, IPFIX |
| Logs del IDS/IPS | Alertas generadas, firmas disparadas | SIEM, Suricata EVE, Snort |
| Proxy logs | URLs visitadas, transferencia de datos | NCSA, Common Log Format |
| DNS logs | Consultas resoluidas, dominios DGA | Zeek, BIND query log, Windows DNS |
| Capturas de VPN | Tráfico cifrado, metadata de túnel | PCAP de interfaz VPN, NetFlow |

**Análisis forense de red:**
- Reconstruir sesiones: TCP stream reassembly, HTTP request/response, DNS query/response.
- Extraer ficheros de tráfico: `tshark -T extract`, `tcpflow`, `pdml2pcap`.
- Identificar C2: beaconing (periodicidad regular), DNS tunneling (longitud de query), HTTP POST voluminoso.
- Exfiltración: patrones de transferencia anómalos (subida > bajada, horarios no laborables).

## Fase 6 — Análisis forense de AD

| Artefacto | Dónde | Qué revela |
|---|---|---|
| NTDS.dit | DC en `C:\Windows\NTDS\ntds.dit` | Todos los hashes, cuentas, GRP, ACL |
| SYSVOL | DFS R, copia del DC | GPP, scripts de logon, políticas heredadas |
| Kerberos TGT/TGS | KCC, ticket-granting | Tickets emitidos, vida, servicio objetivo |
| LSA secrets | Registro del DC (HKEY_LOCAL_MACHINE\SECURITY\Policy\Secrets) | Credenciales de cuentas de servicio |
| Security logs | 4624/4625/4768/4769/4662/4742 | Autenticaciones, cambios de contraseña, replicación |
| Event ID 4732/4756 | Miembros de grupos de seguridad | Quién fue añadido a Domain Admins, etc. |
| DFSR logs | `C:\Windows\DFSR` | Replicación de archivos entre DCs |
| LDAP audit | `dsget`/`dsquery` logs | Consultas al directorio |

## Fase 7 — Cadena de custodia

| Elemento | Formato | Responsable |
|---|---|---|
| Recogida | Ficha con fecha/hora/herramienta/hash/operador | Técnic@ de campo |
| Transporte | Contenedor sellado, registro de quién lo maneja | Courier/transporte seguro |
| Almacenamiento | Armario blindado, acceso controlado, inventario | Responsable de evidencia |
| Acceso | Registro de quién accede, cuándo y por qué | Responsable de evidencia |
| Transferencia legal | Documento de cesión de custodia con firma | Responsable legal |
| Destrucción | Certificado de destrucción con fecha y testigos | Responsable de evidencia |

## Fases de un informe forense

| Sección | Contenido |
|---|---|
| Executive summary | Qué pasó, en lenguaje no técnico, con impacto en el negocio |
| Alcance | Sistemas investigados, período de tiempo, evidencia analizada |
| Cronología | Línea de tiempo detallada de eventos del incidente |
| Metodología | Herramientas, métodos, cadenas de custodia |
| Hallazgos | Artefactos encontrados, con hash y contexto |
| Interpretación | Qué significan los hallazgos, TTP del adversario |
| Conclusiones | Vector de entrada, alcance, persistencia, datos comprometidos |
| Recomendaciones | Controles a implementar, basados en hallazgos |
| Anexo técnico | Comandos ejecutados, hashes, capturas de pantalla de hallazgos |
| Cadena de custodia | Documentación completa de evidencia |

## Errores forenses más frecuentes

| Error | Consecuencia | Corrección |
|---|---|---|
| Montar el disco en modo lectura/escritura | Alterar la evidencia original | Write-blocker siempre |
| Usar `cp` o `copy` en vez de herramienta forense | Modificar timestamps de los archivos copiados | `dd`, FTK Imager, `dcfldd` |
| No calcular hashes | Evidencia no admisible legalmente | SHA-256 antes y después |
| No documentar la cadena de custodia | Pérdida de admisibilidad legal | Formulario estandarizado desde minuto 0 |
| Analizar en el mismo sistema del incidente | Contaminación cruzada | Entorno de análisis aislado |
| No preservar la memoria | Pérdida de evidencia volátil irreemplazable | Prioridad 1; antes de apagar |
| Confundiar correlación con causalidad | Informe incorrecto | Criterios de evidencia múltiples |
| No validar herramientas contra evidencia conocida | Resultados erróneos | Calibrar contra samples conocidos |

## Recursos y fuentes

| Recurso | Uso |
|---|---|
| [playbooks/ir_base.md](../playbooks/ir_base.md) | IR base complementario |
| [detection/detection.md](../detection/detection.md) | Telemría para alimentación forense |
| [ioc/ioc.md](../ioc/ioc.md) | IOC como punto de partida |
| [references/references.md#herramientas](../references/references.md) | Lista de herramientas forenses |
| NIST SP 800-86 | Guía de integración de técnicas forenses |
| SANS FORENSIC tracks | Metodología y mejores prácticas |
| DFIR.org, DFIRSC | Datasets públicos, formación |
