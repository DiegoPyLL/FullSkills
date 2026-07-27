---
id: attacks/credential_access
tipo: catalogo
estabilidad: permanente
tactica: TA0006
---

# Acceso a credenciales

El punto de inflexión de toda intrusión: sin credenciales el atacante está en un host; con ellas está en la red. **Detectar aquí es más valioso que detectar en cualquier otra táctica**, porque todo lo posterior depende de este paso.

## Volcado de credenciales del sistema operativo

| Técnica | ATT&CK | Precondición | Qué obtiene | Detección | Mitigación |
|---|---|---|---|---|---|
| Volcado de LSASS | T1003.001 | Administrador local + `SeDebugPrivilege` | Hashes NTLM, tickets Kerberos, a veces contraseñas en claro | Sysmon E10: handle a `lsass.exe` con `0x1010`/`0x1410`; creación de `.dmp` | **LSA Protection (RunAsPPL)** + **Credential Guard** + regla ASR de robo de credenciales |
| Volcado de LSASS con herramienta legítima | T1003.001 | Administrador | Igual, evadiendo firmas | `comsvcs.dll MiniDump`, `procdump -ma lsass`, `rundll32` sobre lsass, `taskmgr` en servidor | Igual; alertar sobre la técnica, no sobre la herramienta |
| SAM y SYSTEM del registro | T1003.002 | Administrador local | Hashes de cuentas locales | `reg save HKLM\sam`, acceso a los hives | LAPS (hace inútil el hash local), BitLocker |
| Volcado de NTDS.dit | T1003.003 | Acceso al DC o a su backup | **Todos** los hashes del dominio | `ntdsutil ifm`, VSS en el DC, copia de `ntds.dit` | Restringir acceso al DC; cifrar y proteger backups |
| LSA Secrets | T1003.004 | SYSTEM | Contraseñas de cuentas de servicio, credenciales guardadas | Acceso a `HKLM\SECURITY\Policy\Secrets` | Cuentas de servicio gestionadas (gMSA) |
| Cached domain credentials (DCC2) | T1003.005 | Administrador local | Hashes cacheados, crackeables offline | Acceso a `HKLM\SECURITY\Cache` | Reducir `CachedLogonsCount`; sin caché en servidores |
| DCSync | T1003.006 | Derechos de replicación de directorio | Hash de cualquier cuenta, incluido `krbtgt`, **sin tocar el DC** | **4662 con GUID `DS-Replication-Get-Changes` desde un host que no es DC**: consulta de máximo valor en AD | Auditar y restringir esos derechos |
| `/etc/shadow` | T1003.008 | Root en Linux | Hashes locales | Lectura del archivo por procesos inesperados | Hash con yescrypt/sha512 y coste alto; sin reutilización |
| Keychain de macOS | T1555.001 | Usuario o root | Credenciales guardadas | `security dump-keychain` | Keychain bloqueado, FileVault |
| Proc filesystem (memoria de procesos Linux) | T1003.007 | Root o `ptrace` | Credenciales en memoria de procesos | auditd sobre `ptrace`; lecturas de `/proc/*/mem` | `yama.ptrace_scope=1` o superior |

## Kerberos

Mecánica detallada en [active_directory/active_directory.md](../active_directory/active_directory.md).

| Técnica | ATT&CK | Precondición | Qué obtiene | Detección | Mitigación |
|---|---|---|---|---|---|
| Kerberoasting | T1558.003 | Cualquier cuenta de dominio | Hash del TGS de cuentas con SPN → crackeo offline | 4769 con `Ticket Encryption Type 0x17` (RC4) en volumen; muchos SPN pedidos por una cuenta | gMSA/dMSA, AES obligatorio, retirar SPN innecesarios, cuenta señuelo |
| AS-REP Roasting | T1558.004 | Cuenta sin preautenticación | Hash crackeable sin credenciales previas | 4768 con preautenticación deshabilitada | Preautenticación obligatoria en todas las cuentas |
| Golden Ticket | T1558.001 | Hash de `krbtgt` | TGT arbitrario, cualquier usuario, larga vida | TGT con vida > política; 4769 sin 4768 correspondiente; PAC inconsistente | Doble reset de `krbtgt` tras compromiso |
| Silver Ticket | T1558.002 | Hash de la cuenta de servicio | TGS para ese servicio, sin pasar por el DC | Acceso al servicio sin 4769 en el DC | gMSA, rotación de cuentas de servicio |
| Overpass-the-Hash (pass-the-key) | T1550.002 | Hash NTLM o clave AES | TGT legítimo a partir del hash | 4768 con tipo de cifrado anómalo desde host inesperado | Credential Guard, Protected Users |
| Pass-the-Ticket | T1550.003 | Ticket robado de memoria | Uso directo del ticket | Ticket usado desde una IP distinta a la de emisión | Credential Guard, vida corta de tickets |
| Robo de tickets desde memoria | T1558 | Administrador local | TGT/TGS de los usuarios con sesión en el host | `klist`, acceso a LSASS | Protected Users (no cachea TGT delegable), no iniciar sesión de admin en estaciones |
| Unconstrained delegation harvesting | T1558 | Host con delegación irrestricta | TGT de todo el que se autentique, incluido un DC | Atributo de delegación en hosts no DC; coacción de autenticación | Eliminar delegación irrestricta; cuentas sensibles como no delegables |

## Coacción de autenticación y relay

| Técnica | ATT&CK | Precondición | Qué obtiene | Detección | Mitigación |
|---|---|---|---|---|---|
| LLMNR/NBT-NS/mDNS poisoning | T1557.001 | Presencia en el segmento | Hashes NetNTLMv2 de quien resuelva mal un nombre | Respuestas a consultas LLMNR desde un host cualquiera | **Desactivar LLMNR, NBT-NS y mDNS**: control barato y muy eficaz |
| Relay NTLM a SMB | T1557.001 | Firma SMB no obligatoria | Ejecución en el destino como la víctima | Autenticación desde un host hacia muchos otros | **SMB signing obligatorio** |
| Relay NTLM a LDAP / LDAPS | T1557.001 | Firma LDAP o channel binding no obligatorios | Modificación de AD, RBCD, escalada | Autenticación NTLM anómala al DC | Firma LDAP y channel binding obligatorios |
| Relay a AD CS (ESC8) | T1557.001 + T1649 | Endpoint web de inscripción sobre HTTP | Certificado de autenticación como la víctima | Emisión de certificados desde relay | Deshabilitar HTTP en la CA, EPA, firma requerida |
| Coacción vía PetitPotam / PrinterBug / ShadowCoerce | T1187 | Acceso RPC al destino | Fuerza al DC a autenticarse contra el atacante | Llamadas RPC a `EfsRpc*`, `RpcRemoteFindFirstPrinterChangeNotification` | Filtrado RPC, parcheo, desactivar el spooler en DC |
| Forced authentication vía documento o UNC | T1187 | Archivo o correo con ruta UNC | Hash NetNTLM al abrir | Conexiones SMB salientes a Internet | Bloquear SMB saliente (445, 139) en el perímetro |
| Ataque de retransmisión WPAD | T1557 | WPAD resoluble | Proxy controlado por el atacante | Consultas a `wpad` | Registro DNS `wpad` fijado, desactivar autodetección |

## Almacenes de credenciales

| Técnica | ATT&CK | Dónde | Qué obtiene | Mitigación |
|---|---|---|---|---|
| Credenciales del navegador | T1555.003 | Bases SQLite de Chrome/Edge/Firefox + DPAPI | Contraseñas y **cookies de sesión** (saltan el MFA) | Prohibir el guardado por política, App-Bound Encryption, token protection |
| Windows Credential Manager | T1555.004 | Bóveda de Windows | Credenciales de RDP, recursos compartidos, servicios | Limitar el guardado de credenciales |
| Gestores de contraseñas | T1555.005 | Base local o extensión | Todo el conjunto de credenciales del usuario | Bloqueo automático, MFA en el gestor, detección de acceso al archivo de bóveda |
| Claves DPAPI | T1555 | Master keys del usuario y del dominio | Descifra todo lo protegido con DPAPI, incluso offline | Proteger la clave de respaldo de DPAPI del dominio (es material Tier 0) |
| Llavero y perfiles de nube | T1555 | `~/.aws/credentials`, `~/.kube/config`, `.azure`, `gcloud` | Acceso directo a la nube | Credenciales de vida corta (SSO/OIDC), nunca claves estáticas en disco |
| Bóvedas mal protegidas (Vault, secrets de CI) | T1552 | Servicio de secretos | Todo el conjunto de secretos | Autenticación fuerte al vault, políticas por servicio, auditoría de lecturas |

## Credenciales desprotegidas

| Técnica | ATT&CK | Dónde buscar | Mitigación |
|---|---|---|---|
| Credenciales en archivos | T1552.001 | `web.config`, `.env`, `appsettings.json`, scripts, `unattend.xml`, notas | Gestor de secretos; escaneo periódico del sistema de archivos |
| Group Policy Preferences | T1552.006 | `SYSVOL\...\Groups.xml` (`cpassword` con clave pública conocida) | Eliminar archivos heredados; nunca almacenar contraseñas en GPP |
| Historial de comandos | T1552.003 | `.bash_history`, `ConsoleHost_history.txt`, historial de PowerShell | Excluir comandos con secretos; formación |
| Claves privadas | T1552.004 | `.ssh/id_*`, certificados con clave exportable, `.pem` | Claves con passphrase, almacenamiento en TPM/HSM, claves no exportables |
| Metadata de instancia cloud | T1552.005 | `169.254.169.254` alcanzable desde la aplicación | IMDSv2, hop limit 1, egress restringido |
| Repositorios de código | T1552.008 | Historial de git, issues, wikis, CI logs | Escaneo de secretos en pre-commit y en el historial completo; rotación inmediata al detectar |
| Credenciales en logs | T1552 | Logs de aplicación y de proxy | Enmascaramiento, revisión de lo que se registra |
| Variables de entorno de contenedores | T1552.007 | `docker inspect`, manifiestos, API del runtime | Secretos montados como ficheros efímeros, no como variables |

## Ataques por fuerza y por adivinación

| Técnica | ATT&CK | Característica | Detección | Mitigación |
|---|---|---|---|---|
| Password guessing | T1110.001 | Muchas contraseñas contra una cuenta | Ráfaga de 4625 sobre una cuenta | Bloqueo por umbral |
| Password cracking offline | T1110.002 | Sin ruido en la red; solo requiere el hash | No detectable: por eso importa impedir el volcado | Contraseñas largas, algoritmos lentos, AES en Kerberos |
| Password spraying | T1110.003 | Una contraseña contra muchas cuentas, espaciada | 4625 de muchas cuentas distintas con poca frecuencia individual; correlacionar por IP de origen | Lista de contraseñas prohibidas, MFA, bloqueo inteligente |
| Credential stuffing | T1110.004 | Pares de otra brecha | Alta tasa de fallo desde IP distribuidas | MFA, detección de bots, comprobación contra corpus de comprometidas |

## Modificación del proceso de autenticación

| Técnica | ATT&CK | Efecto | Detección |
|---|---|---|---|
| Skeleton Key | T1556.001 | Contraseña maestra universal en el DC | Módulo inyectado en LSASS del DC |
| Módulo PAM malicioso | T1556.003 | Captura y puerta trasera en Linux | FIM sobre `/etc/pam.d` y `/lib/security` |
| Proveedor de red o SSP malicioso | T1556.002 | Captura de credenciales en el logon | Cambios en proveedores registrados |
| Interceptación o bypass de MFA | T1556.006 | Registro de un segundo factor propio en la cuenta de la víctima | Registro de nuevo método MFA sin autenticación fuerte previa |
| Manipulación de identidad híbrida | T1556.007 | Suplantación entre on-prem y nube | Cambios en Entra Connect, agentes PTA |

## Los seis controles que más reducen esta táctica

| Control | Qué elimina |
|---|---|
| **Credential Guard + LSA Protection** | El volcado de LSASS, que es el paso más frecuente de toda intrusión en Windows |
| **LAPS** | El valor de robar el hash del administrador local |
| **MFA resistente a phishing (FIDO2)** | El valor de robar la contraseña, y también el AitM |
| **Desactivar LLMNR/NBT-NS + SMB signing + LDAP signing** | La familia completa de captura y relay NTLM |
| **gMSA / dMSA para cuentas de servicio** | Kerberoasting con éxito y Silver Tickets |
| **Auditoría de 4662 con derechos de replicación** | Detecta DCSync, el paso previo al Golden Ticket |

## Regla de respuesta

Cualquier evidencia de acceso a credenciales convierte el incidente en **compromiso de identidad**. Aislar el host no basta: hay que asumir que toda credencial que estuvo en memoria en ese host está comprometida y rotarla, incluidas cuentas de servicio, y — si hubo acceso a un DC — el doble reset de `krbtgt`. Ver [playbooks/active_directory.md](../playbooks/active_directory.md).
