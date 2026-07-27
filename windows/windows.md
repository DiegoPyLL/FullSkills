---
id: windows/windows
tipo: modelo
estabilidad: permanente
---

# Seguridad de Windows

Modelo interno, controles y telemetría. Las técnicas ofensivas están en los catálogos de `attacks/` ([credenciales](../attacks/credential_access.md), [escalada](../attacks/privilege_escalation.md), [evasión](../attacks/defense_evasion.md), [lateral](../attacks/lateral_movement.md)); aquí está **por qué funcionan** y **qué las bloquea**.

## Modelo de seguridad

| Concepto | Qué es | Implicación de seguridad |
|---|---|---|
| SID | Identificador único de principal | Los SID conocidos importan: `S-1-5-18` SYSTEM, `S-1-5-32-544` Administradores, RID 500 administrador integrado, RID 512 Domain Admins |
| Token de acceso | Identidad + grupos + privilegios de un proceso | Robar o suplantar un token equivale a suplantar al usuario sin conocer su contraseña |
| Nivel de integridad | Low / Medium / High / System | Un proceso no puede escribir en objetos de integridad superior. Base del sandbox del navegador |
| Descriptor de seguridad (DACL/SACL) | Quién puede hacer qué / qué se audita | DACL mal puesta en un servicio o carpeta es la vía de escalada más común |
| Privilegios | Derechos por cuenta (`SeDebugPrivilege`, `SeImpersonatePrivilege`, `SeBackupPrivilege`) | Varios equivalen a SYSTEM de facto |
| UAC | Separación de token elevado y no elevado del mismo usuario | **No es un límite de seguridad** según Microsoft: existen bypasses. Ser administrador local es el problema real |
| Protected Process Light (PPL) | Nivel de protección que impide abrir el proceso | Base de LSA Protection y de la antimanipulación del EDR |
| LSASS | Proceso que custodia credenciales y tickets | Objetivo número uno de toda intrusión |
| SAM / NTDS.dit | Base de cuentas locales / del dominio | Su volcado es el paso previo al movimiento lateral |
| DPAPI | Cifrado de secretos por usuario o máquina | La clave de respaldo de DPAPI del dominio es material Tier 0: descifra secretos de todos los usuarios |

## Controles de credenciales (los que más reducen riesgo)

| Control | Qué impide | Requisito |
|---|---|---|
| **Credential Guard** | Extracción de hashes NTLM y TGT de LSASS: Pass-the-Hash y Pass-the-Ticket dejan de tener material que robar | Virtualización, Secure Boot, UEFI. Incompatible con NTLMv1, MS-CHAPv2 sin más y con delegación irrestricta |
| **LSA Protection (RunAsPPL)** | Que un proceso no protegido abra LSASS | Comprobar drivers de terceros que se inyecten en LSASS |
| **Windows LAPS** | Reutilización de la contraseña de administrador local en toda la flota | Integrado en Windows moderno; también con Entra ID |
| **Protected Users** | Que las credenciales del usuario queden cacheadas o sean delegables; fuerza Kerberos AES | No usar con cuentas de servicio |
| **Cuentas gestionadas (gMSA/dMSA)** | Kerberoasting eficaz y Silver Tickets: contraseña de 120+ caracteres rotada automáticamente | Requiere adaptar los servicios |
| **Remote Credential Guard / Restricted Admin (RDP)** | Que la credencial del administrador quede en el host remoto al conectarse | Configuración en cliente y servidor |
| **Deshabilitar NTLM** (por fases: auditar → restringir → bloquear) | La familia completa de relay y Pass-the-Hash | Requiere inventario de aplicaciones dependientes |

## Controles de ejecución

| Control | Cobertura | Coste |
|---|---|---|
| **WDAC (Windows Defender Application Control)** | Control de aplicaciones a nivel de kernel, por firmante, hash o ruta; aplicable también a drivers | Alto: requiere fase de auditoría y gestión del ciclo de vida de la política |
| **AppLocker** | Más sencillo, menos robusto (evadible por varias vías) | Medio |
| **Reglas ASR** | Bloques concretos y muy rentables: procesos hijo de Office, ejecución desde correo, robo de credenciales de LSASS, ejecutables ofuscados, USB no confiable | Bajo: activar primero en auditoría |
| **Lista de bloqueo de drivers vulnerables de Microsoft** | BYOVD | Bajo |
| **HVCI / Integridad de código protegida por hipervisor** | Código de kernel sin firmar | Medio: verificar compatibilidad de drivers |
| **Constrained Language Mode de PowerShell** | Payloads en memoria basados en .NET | Medio |
| **Bloqueo de macros con MOTW** | El vector de documento más explotado | Bajo |
| **Bloqueo de montaje de ISO/IMG por política** | Bypass de MOTW | Bajo |
| **SmartScreen y MOTW** | Descargas no reputadas | Bajo |

## Telemetría: qué recoger y por qué

Sin esta configuración, la mayoría de las detecciones de este skill no son implementables.

| Fuente | Configuración necesaria | Habilita |
|---|---|---|
| Creación de proceso | 4688 **con línea de comandos habilitada** (por defecto está desactivada) o Sysmon E1 | Casi toda la detección de ejecución |
| PowerShell | ScriptBlock logging (4104) y Module logging; transcripción en hosts críticos | Detección de PowerShell ofuscado, incluso si AMSI se evade |
| Sysmon | Configuración curada (base tipo SwiftOnSecurity/Olaf) | E1 proceso, E3 red, E7 carga de imagen, E8 hilo remoto, E10 acceso a proceso, E11 archivo, E12-14 registro, E19-21 WMI, E22 DNS |
| Autenticación | 4624, 4625, 4648, 4672, 4768, 4769, 4771 | Movimiento lateral, spraying, Kerberoasting |
| Servicios y tareas | 7045, 4697, 4698, 4702 | Persistencia |
| Directorio (en DC) | 4662 con SACL, 5136, 4738, 4728/4732/4756 | DCSync, abuso de ACL, cambios en grupos privilegiados |
| Integridad | 1102 (log limpiado), 104 | Evasión |
| WMI | Eventos de suscripción de WMI | Persistencia sin archivo |
| Firewall del host | 5156/5157 (con cuidado por volumen) | Conexiones anómalas |
| DNS del cliente | Sysmon E22 o servidor DNS con logging | C2 y túnel DNS |

**Reenvío inmediato fuera del host** (WEF o agente): el atacante borra los logs locales; si ya salieron, el 1102 solo confirma la intrusión en vez de ocultarla.

## Puntos de configuración con mayor impacto

| Ajuste | Valor recomendado | Motivo |
|---|---|---|
| SMBv1 | Desinstalado | Protocolo obsoleto, base de EternalBlue |
| Firma SMB | Obligatoria en cliente y servidor | Bloquea el relay NTLM a SMB |
| LLMNR, NBT-NS, mDNS | Desactivados | Elimina la captura de hashes en el segmento local |
| WPAD | Registro DNS fijado, autodetección desactivada | Evita proxy malicioso |
| `LocalAccountTokenFilterPolicy` | 0 (valor por defecto, no cambiarlo) | Impide el logon de red con cuentas locales |
| Cuentas locales en grupos "Denegar acceso" | Denegar acceso desde red y por servicios de escritorio remoto | Corta el movimiento lateral con credenciales locales |
| `CachedLogonsCount` | 0–2 en servidores, bajo en estaciones | Reduce hashes cacheados crackeables |
| Print Spooler | Desactivado en servidores y **siempre en los DC** | PrintNightmare y coacción de autenticación |
| PowerShell v2 | Desinstalado | Evade el logging moderno |
| WDigest | Desactivado (por defecto en versiones modernas; verificar) | Evita contraseñas en claro en memoria |
| RDP | NLA obligatorio, sin exposición a Internet, MFA | Vector de acceso inicial recurrente |
| BitLocker | Con TPM + PIN en equipos portátiles | Protege contra ataques con acceso físico |
| Secure Boot + UEFI con contraseña | Activado | Bootkits y arranque desde medio externo |
| Windows Firewall | Activo en todos los perfiles, bloqueando SMB/RPC/RDP entrante entre estaciones | El control con mejor relación coste/beneficio contra el movimiento lateral |

## Modelo de tiering administrativo

El error estructural más frecuente en redes Windows: un administrador de dominio inicia sesión en una estación comprometida y su credencial queda en memoria.

| Tier | Contenido | Regla |
|---|---|---|
| **Tier 0** | Controladores de dominio, AD CS, ADFS/Entra Connect, servidores de backup, hipervisores, consolas de gestión (SCCM, Intune) | Sus credenciales **solo** se usan desde PAW dedicadas y **nunca** en Tier 1 o 2 |
| **Tier 1** | Servidores de aplicación y de datos | Administradores propios, sin acceso a Tier 0 |
| **Tier 2** | Estaciones de trabajo y usuarios | Administración de escritorio, sin acceso a servidores |

Complementos: cuentas administrativas separadas de la cuenta diaria, sin correo ni navegación; PAW sin acceso a Internet; elevación temporal (JIT) en vez de membresía permanente; grupo Protected Users para las cuentas de Tier 0.

## Forense rápido en un host Windows

Orden de volatilidad: memoria → estado de red y procesos → registro y logs → sistema de archivos → backups.

| Paso | Qué obtener | Con qué |
|---|---|---|
| 1 | Volcado de memoria completo | Herramienta forense, **antes** de apagar o aislar si es viable |
| 2 | Procesos, conexiones, handles, servicios, tareas | Recolección en vivo |
| 3 | Logs de eventos completos (no solo Security) | Exportación de todos los canales |
| 4 | Hives del registro, `Amcache`, `ShimCache`, `Prefetch`, `SRUM`, `UserAssist`, `ShellBags` | Evidencia de ejecución y de acceso |
| 5 | MFT, USN journal, `$LogFile` | Línea de tiempo del sistema de archivos, incluidos archivos borrados |
| 6 | Copia forense del disco si el caso lo requiere | Con hash y cadena de custodia |

Artefactos de ejecución especialmente útiles: `Prefetch` (qué se ejecutó y cuántas veces), `Amcache`/`ShimCache` (binarios presentes aunque ya se hayan borrado), `SRUM` (consumo de red por aplicación: delata exfiltración), `BAM/DAM` (ejecución por usuario).
