---
id: vmware/vmware
tipo: modelo
estabilidad: permanente
---

# VMware vSphere y ESXi

El hipervisor es un objetivo de **máximo rendimiento para el atacante**: cifrar los datastores desde ESXi apaga y cifra cientos de servidores en minutos, sin necesidad de desplegar nada dentro de los sistemas operativos invitados y sin EDR que lo vea.

## Por qué es objetivo prioritario

| Factor | Consecuencia |
|---|---|
| Concentración | Un solo host equivale a decenas de servidores |
| Ausencia de EDR | ESXi no admite agentes de endpoint convencionales | 
| Parcheo tardío | Requiere ventanas de mantenimiento y migración de cargas |
| Gestión frecuentemente en la misma red plana | vCenter alcanzable desde estaciones de trabajo |
| Credenciales integradas con AD | Comprometer el dominio suele entregar el hipervisor |
| Backups alojados en el mismo entorno | El atacante destruye la recuperación junto con la producción |

## Rutas de compromiso

| Ruta | Precondición | Efecto | Mitigación |
|---|---|---|---|
| Vulnerabilidad de vCenter sin parchear | vCenter alcanzable | RCE en el plano de gestión completo | Parcheo prioritario (histórico recurrente en KEV), red de gestión aislada |
| Vulnerabilidad de ESXi (servicios como OpenSLP o el heartbeat de servicios) | Host alcanzable en la red | Ejecución en el hipervisor | Deshabilitar servicios no usados, parchear, aislar |
| Credenciales de AD con permisos en vCenter | Compromiso del dominio | Control total del entorno virtual | **Desacoplar vCenter de AD** o usar cuentas dedicadas y MFA |
| SSH y ESXi Shell habilitados | Acceso administrativo | Ejecución directa en el host, cifrado de datastores | Deshabilitados por defecto; habilitación temporal y auditada |
| vSphere Installation Bundle malicioso | Acceso administrativo | Persistencia dentro del hipervisor | Nivel de aceptación de VIB restrictivo, Secure Boot |
| Acceso al datastore | Cualquier vía anterior | Cifrado o robo de los `.vmdk` completos | Segmentación, cifrado de VM, backups fuera del entorno |
| Copia o clonado de VM | Permisos en vCenter | Exfiltración de un servidor entero, incluido su disco | Auditoría de exportaciones y clonados |
| Snapshot de memoria | Permisos en vCenter | Extracción de credenciales desde la memoria de una VM | Restringir permisos de snapshot |
| Backups alojados en el mismo cluster | Diseño habitual | Destrucción de la recuperación | Copia inmutable fuera del entorno virtual |

## Hardening

| Área | Control |
|---|---|
| Red de gestión | VLAN dedicada, sin acceso desde estaciones de usuario, solo desde bastiones; nunca expuesta a Internet |
| Acceso administrativo | Cuentas dedicadas, MFA en vCenter, sin integración directa con AD para los roles críticos |
| Modo de bloqueo (Lockdown Mode) | Activado en ESXi: impide la gestión directa del host fuera de vCenter |
| SSH y ESXi Shell | Deshabilitados; habilitación temporal con registro y con expiración automática |
| Secure Boot y TPM | Activados; atestación del host |
| Nivel de aceptación de VIB | Solo módulos firmados por VMware o por partners certificados |
| Servicios innecesarios | Deshabilitados (incluido CIM y cualquier servicio de descubrimiento no requerido) |
| Firewall del host ESXi | Reglas restrictivas por servicio y por origen |
| Cifrado de VM y vSAN | Para cargas sensibles; el vector de robo del `.vmdk` deja de servir |
| Aislamiento de VM | Deshabilitar funciones de copiado y pegado y dispositivos innecesarios |
| Parcheo | Ciclo definido con ventanas planificadas; los CVEs de vCenter aparecen con frecuencia en KEV |
| Segmentación de tráfico | Gestión, vMotion, almacenamiento y VM en redes separadas — el tráfico de vMotion transporta memoria de VM |

## Detección

Requisito previo: **reenviar los logs de ESXi y de vCenter a un SIEM externo**. Un atacante con acceso al host borra los locales, y en muchos entornos estos logs sencillamente no se recogen.

| Señal | Interpretación |
|---|---|
| SSH habilitado en un host ESXi | Preludio casi seguro de cifrado; alerta de máxima prioridad |
| Inicio de sesión SSH en ESXi | Acceso directo al hipervisor |
| Apagado masivo de máquinas virtuales | Preparación del cifrado de los `.vmdk` |
| Instalación de un VIB | Persistencia en el hipervisor |
| Creación de usuarios locales en ESXi | Persistencia |
| Cambio del modo de bloqueo o del firewall del host | Evasión |
| Exportación, clonado o descarga masiva de VM | Exfiltración |
| Inicio de sesión en vCenter desde un origen inusual | Compromiso del plano de gestión |
| Cambios en permisos de vCenter | Escalada |
| Borrado de snapshots o de trabajos de backup | Inhibición de la recuperación |
| Procesos desconocidos en el host ESXi | Cifrador desplegado |

## Ransomware sobre ESXi

Patrón consolidado: el atacante obtiene credenciales de vCenter (a menudo desde AD), habilita SSH, sube un binario ELF, apaga todas las VM y cifra los `.vmdk` en el datastore. Todo el proceso puede completarse en menos de una hora y **ningún EDR del sistema operativo invitado lo observa**.

Defensas que realmente cambian el resultado:

1. **Backups fuera del entorno virtual**, inmutables y probados. Si el backup vive en el mismo cluster, no existe.
2. **Desacoplar la autenticación del hipervisor de Active Directory**, o al menos exigir MFA y cuentas dedicadas.
3. **Red de gestión inalcanzable** desde el segmento de usuarios.
4. **Alerta inmediata sobre la habilitación de SSH y sobre el apagado masivo de VM**, con respuesta automatizada.
5. **Lockdown Mode** activo.
6. **Parcheo prioritario** de vCenter y ESXi, tratándolos como sistemas de borde.

## Respuesta

1. Aislar la red de gestión: cortar el acceso al plano de control antes que nada.
2. **No apagar los hosts**: se pierde el estado y, si el cifrado está en curso, apagar puede empeorar la consistencia de los datos.
3. Recoger `/var/log` de ESXi (`hostd`, `vmkernel`, `auth`, `shell`, `vobd`), los logs de vCenter y el histórico de tareas y eventos.
4. Determinar la vía de entrada: credenciales de vCenter, vulnerabilidad del appliance o acceso desde el dominio comprometido. Sin esto, la reconstrucción se vuelve a comprometer.
5. Revisar VIB instalados, usuarios locales de ESXi, tareas programadas y claves SSH autorizadas.
6. Restaurar desde backups verificados **fuera** del entorno afectado, sobre una infraestructura reconstruida.
7. Rotar todas las credenciales del entorno virtual y las del dominio si estaban integradas.

Ver [playbooks/vmware.md](../playbooks/vmware.md) y [ransomware/ransomware.md](../ransomware/ransomware.md).
