---
id: attacks/discovery
tipo: catalogo
estabilidad: permanente
tactica: TA0043 (Reconnaissance) + TA0007 (Discovery)
---

# Reconocimiento y descubrimiento

Dos fases distintas que conviene no confundir: el **reconocimiento externo** (TA0043) ocurre antes de entrar y es casi indetectable desde dentro; el **descubrimiento interno** (TA0007) ocurre ya dentro y **sí** deja una firma muy característica: ráfagas de comandos de enumeración en pocos minutos.

Señal defensiva clave: un usuario normal no ejecuta `whoami`, `net group "domain admins" /domain` y `nltest /dclist` en el mismo minuto. La **densidad temporal** de comandos de descubrimiento es una de las mejores detecciones de intrusión temprana.

## Reconocimiento externo

| Técnica | ATT&CK | Qué obtiene | Detección posible | Reducción de exposición |
|---|---|---|---|---|
| Registros DNS y subdominios | T1590.002 | Superficie olvidada, entornos de staging | Consultas a registros de transparencia de certificados | Wildcard prudente, sin nombres descriptivos, retirar registros huérfanos |
| Transparencia de certificados | T1596.003 | Todo nombre para el que se emitió un certificado | Monitorización propia de CT logs | Asumir público; usar certificados wildcard cuando aplique |
| Escaneo de puertos y servicios | T1595.001 | Servicios expuestos y sus versiones | Logs de firewall, honeypots | Cerrar lo innecesario; superficie mínima |
| Escaneo de vulnerabilidades | T1595.002 | Versiones vulnerables | Firmas de escáner en logs web | Parcheo; ocultar banners no es defensa real |
| Motores de búsqueda de dispositivos (Shodan, Censys) | T1596.005 | Inventario expuesto sin tocar la víctima | Monitorizar la propia huella en esos servicios | Gestión de superficie de ataque externa (ASM) |
| Recolección de identidades | T1589 | Nombres, correos, cargos, formato de usuario | No detectable | Minimizar información de contacto pública |
| Credenciales filtradas en brechas | T1589.001 | Contraseñas reutilizadas | Monitorización de filtraciones | MFA, bloqueo de contraseñas comprometidas |
| Repositorios públicos y pastes | T1593 | Secretos, rutas internas, nombres de host | Escaneo continuo de GitHub y pastes | Escaneo de secretos, formación |
| Metadatos de documentos públicos | T1592 | Usuarios, rutas, software y versiones | — | Limpiar metadatos antes de publicar |
| Información organizacional | T1591 | Estructura, proveedores, ubicaciones | — | Prudencia en comunicación pública sobre tecnología usada |

## Descubrimiento del host

| Técnica | ATT&CK | Comando característico | Detección |
|---|---|---|---|
| Información del sistema | T1082 | `systeminfo`, `hostname`, `uname -a`, `wmic os get` | Ejecución por procesos no interactivos |
| Descubrimiento de usuario | T1033 | `whoami`, `whoami /priv`, `id`, `$env:USERNAME` | `whoami` es raro fuera de administración |
| Procesos en ejecución | T1057 | `tasklist`, `ps aux`, `Get-Process` | Enumeración desde procesos de servicio |
| Software instalado | T1518 | `wmic product get`, `dpkg -l`, `rpm -qa` | Consulta costosa y poco habitual |
| **Software de seguridad** | T1518.001 | Buscar procesos y servicios de EDR/AV | **Alta señal**: enumerar productos de seguridad casi nunca es legítimo |
| Archivos y directorios | T1083 | `dir /s`, `find`, `tree`, búsqueda de `*password*` | Búsquedas masivas por patrones sensibles |
| Configuración de red del host | T1016 | `ipconfig /all`, `route print`, `ip a`, `arp -a` | Ráfaga junto a otros comandos |
| Conexiones de red | T1049 | `netstat -ano`, `ss -tulpn` | Ídem |
| Descubrimiento de drivers | T1652 | `driverquery`, `lsmod` | Preludio de BYOVD |
| Descubrimiento de virtualización | T1497 | Comprobar MAC, drivers, DMI | Indica malware con anti-análisis |
| Directivas de contraseña | T1201 | `net accounts`, `Get-ADDefaultDomainPasswordPolicy` | Preludio de spraying |

## Descubrimiento de red y dominio

| Técnica | ATT&CK | Comando característico | Detección |
|---|---|---|---|
| Sistemas remotos | T1018 | `net view /domain`, `nltest /dclist`, escaneo del rango | Un host que contacta con muchos otros en poco tiempo |
| Servicios de red | T1046 | Escaneo de puertos interno | Conexiones a muchos puertos y hosts: patrón de abanico |
| Cuentas | T1087.002 | `net user /domain`, `Get-ADUser -Filter *` | Consultas LDAP masivas desde host no administrativo |
| Grupos de permisos | T1069.002 | `net group "Domain Admins" /domain` | **Consulta de altísimo valor**: casi siempre es un atacante o un pentester |
| Confianzas de dominio | T1482 | `nltest /domain_trusts`, `Get-ADTrust` | Preludio de movimiento entre dominios |
| Descubrimiento de GPO | T1615 | `gpresult`, `Get-GPO -All` | Preludio de abuso de GPO |
| Enumeración masiva de AD (BloodHound/SharpHound) | T1087 + T1069 + T1482 | Recolección LDAP y SMB de todo el dominio | **La detección más rentable en AD**: volumen de consultas LDAP anómalo, sesiones SMB a todos los hosts, consultas a `objectClass=*` |
| Recursos compartidos de red | T1135 | `net share`, `net view \\host`, `smbclient -L` | Enumeración de shares en muchos hosts |
| Sniffing de red | T1040 | Captura de tráfico | Interfaz en modo promiscuo |
| Descubrimiento de la nube | T1580 / T1526 | `aws ec2 describe-*`, `az resource list`, `gcloud asset search` | Ráfaga de llamadas `Describe`/`List` desde una identidad que no suele hacerlo |
| Descubrimiento de contenedores | T1613 | `kubectl get pods --all-namespaces`, API del runtime | Audit log de Kubernetes con `list` masivos |
| Descubrimiento de repositorios de información | T1213 | Buscar en SharePoint, Confluence, wikis | Búsquedas por términos como "contraseña", "acceso", "vpn" |
| Descubrimiento de buzones y libreta de direcciones | T1087.003 | Enumerar la GAL | Descargas completas de la libreta global |

## Descubrimiento en la nube

| Técnica | ATT&CK | Qué revela | Detección |
|---|---|---|---|
| Enumeración de permisos propios | T1087.004 | Qué puede hacer la identidad robada | `GetCallerIdentity`, `SimulatePrincipalPolicy`, `az role assignment list` |
| Inventario de recursos | T1580 | Superficie completa del entorno | Ráfaga de llamadas de tipo `Describe`/`List` |
| Descubrimiento de almacenamiento | T1619 | Dónde están los datos | `ListBuckets`, enumeración de contenedores |
| Enumeración de tenants y federación | T1526 | Relaciones de confianza entre organizaciones | Consultas a endpoints de descubrimiento de tenant |
| Enumeración de identidades y roles | T1069.003 | Rutas de escalada | Lecturas masivas de IAM |
| Descubrimiento de red virtual | T1016 | Topología, peering, rutas hacia on-premises | Lecturas de configuración de red |

## Patrones de detección de alto valor

**1. Densidad de comandos de descubrimiento.** Contar ejecuciones de un conjunto (`whoami`, `net`, `nltest`, `systeminfo`, `tasklist`, `ipconfig`, `arp`, `quser`) en una ventana de 10 minutos por host. Umbral bajo, precisión alta. Es la detección más rentable de esta táctica.

**2. Comandos de descubrimiento con padre anómalo.** `net.exe` como hijo de `w3wp.exe`, de `winword.exe` o de un proceso de servicio.

**3. Volumen LDAP anómalo.** Habilitar la auditoría de consultas LDAP costosas e ineficientes en los DC y alertar sobre hosts que consultan el directorio completo. Detecta SharPound/BloodHound antes del movimiento lateral.

**4. Abanico de conexiones.** Un host que abre conexiones a más de N destinos distintos en el mismo puerto (445, 3389, 22, 5985) en pocos minutos. Precede siempre al movimiento lateral.

**5. Enumeración de grupos privilegiados.** Consultas a `Domain Admins`, `Enterprise Admins`, `Backup Operators`. Un usuario normal jamás las hace.

**6. Cuentas y equipos señuelo.** Un objeto de AD atractivo pero inexistente en producción: cualquier consulta sobre él es intrusión. Ver [mitre_d3fend.md](../mitre_d3fend.md#deception-la-tactica-infrautilizada).

## Por qué se descuida esta táctica

El descubrimiento no causa daño directo, así que suele ignorarse. Es un error: es la **última fase barata de detectar antes de que el atacante tenga credenciales y opciones**. Un incidente detectado en Discovery se resuelve en horas; el mismo detectado en Impact cuesta semanas y dinero.
