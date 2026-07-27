---
id: linux/linux
tipo: modelo
estabilidad: permanente
---

# Seguridad de Linux y Unix

Modelo, controles y telemetría. Los servidores Linux suelen tener **menos EDR y menos logging** que los Windows, lo que los convierte en el punto ciego habitual de una organización.

## Modelo de seguridad

| Concepto | Qué es | Implicación |
|---|---|---|
| UID/GID | Identidad numérica del proceso | UID 0 es root; cualquier cuenta con UID 0 es root aunque se llame distinto |
| Permisos y bits especiales | rwx + SUID, SGID, sticky | Un SUID innecesario es una escalada esperando ocurrir |
| Capabilities | Fragmentación de los poderes de root | `CAP_SYS_ADMIN`, `CAP_DAC_READ_SEARCH`, `CAP_SETUID`, `CAP_SYS_PTRACE` y `CAP_SYS_MODULE` son equivalentes prácticos a root |
| Namespaces | Aislamiento de vista (PID, NET, MNT, USER, UTS, IPC, cgroup) | Base de los contenedores; no es un límite de seguridad por sí solo |
| cgroups | Límite de recursos | Aísla consumo, no privilegio |
| seccomp | Filtro de llamadas al sistema | Reduce drásticamente la superficie del kernel |
| LSM (SELinux, AppArmor) | Control de acceso obligatorio | Contiene el daño aunque el proceso sea root |
| PAM | Pila modular de autenticación | Un módulo malicioso captura toda credencial |
| systemd | Init y gestor de servicios | También es superficie de persistencia y de hardening |
| auditd | Auditoría del kernel | Principal fuente de telemetría nativa |
| eBPF | Instrumentación programable del kernel | Base de la observabilidad moderna… y también de rootkits avanzados |

## Superficie de escalada local

Checklist ordenado por frecuencia real de éxito:

| Punto | Cómo verificarlo | Cómo corregirlo |
|---|---|---|
| Reglas `sudo` con comodines, `NOPASSWD` o binarios abusables | `sudo -l`, revisar `/etc/sudoers.d/` | Reglas específicas, sin editores, intérpretes ni comodines |
| Binarios SUID/SGID innecesarios | `find / -perm -4000 -o -perm -2000 -type f 2>/dev/null` contra baseline | Retirar el bit; `nosuid` en montajes de datos |
| Capabilities asignadas | `getcap -r / 2>/dev/null` | Mínimas necesarias |
| Scripts de cron escribibles o con PATH relativo | Revisar `/etc/cron*`, `/var/spool/cron` | Permisos correctos, rutas absolutas |
| Unidades de systemd escribibles | Permisos de `/etc/systemd/system` | Solo root |
| Credenciales en archivos | Buscar en `/home`, `/opt`, `/var/www`, historiales | Gestor de secretos |
| Pertenencia a grupos peligrosos (`docker`, `lxd`, `disk`, `shadow`, `adm`) | `getent group` | Tratar `docker` y `lxd` como equivalentes a root |
| Montajes NFS con `no_root_squash` | `/etc/exports` | `root_squash` |
| Kernel sin parchear | Versión frente a avisos de la distribución | Parcheo, livepatch |
| Contenedores con configuración insegura | Ver [containers/containers.md](../containers/containers.md) | — |

## Hardening: los ajustes que más importan

| Área | Ajuste | Efecto |
|---|---|---|
| Montajes | `nodev,nosuid,noexec` en `/tmp`, `/var/tmp`, `/dev/shm`, `/home` cuando sea viable | Elimina la ejecución de payloads descargados, muy usada tras la explotación |
| Kernel | `kernel.dmesg_restrict=1`, `kernel.kptr_restrict=2`, `kernel.yama.ptrace_scope=1`, `kernel.unprivileged_bpf_disabled=1`, `user.max_user_namespaces=0` si no se usan contenedores rootless | Reduce la superficie de exploits de kernel y de inyección |
| Red | `rp_filter=1`, redirecciones ICMP desactivadas, reenvío desactivado salvo routers | Evita spoofing y pivote no deseado |
| Módulos | Firma obligatoria, `module.sig_enforce`, blacklist de módulos no usados (`usb-storage`, protocolos exóticos) | Bloquea rootkits de kernel |
| SSH | `PermitRootLogin no`, `PasswordAuthentication no`, solo claves o certificados, `AllowGroups`, `MaxAuthTries` bajo, algoritmos modernos | Elimina la fuerza bruta y el acceso directo de root |
| PAM | `pam_faillock`, calidad de contraseña, `pam_wheel` para `su` | Bloqueo y control de elevación |
| LSM | SELinux en `enforcing` o AppArmor con perfiles activos | Contención efectiva incluso con root comprometido |
| systemd | Por unidad: `NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=strict`, `ProtectHome`, `CapabilityBoundingSet`, `SystemCallFilter`, `RestrictAddressFamilies` | Sandbox de servicios sin contenedores |
| Arranque | Secure Boot, GRUB con contraseña, cifrado de disco (LUKS) | Acceso físico y bootkits |
| Superficie | Sin compiladores, sin intérpretes innecesarios, sin `curl`/`wget` en servidores que no los requieran | Reduce las herramientas disponibles al atacante |
| Auditoría | auditd con reglas curadas y reenvío remoto | Sin esto no hay detección |

## Telemetría

| Fuente | Qué aporta | Configuración clave |
|---|---|---|
| auditd | Ejecución, acceso a archivos, cambios de identidad | Reglas sobre `execve`, `/etc/passwd`, `/etc/shadow`, `/etc/sudoers`, `/etc/pam.d`, `ld.so.preload`, `authorized_keys`, `ptrace`, carga de módulos |
| journald / rsyslog | Logs de servicios y de autenticación | **Reenvío remoto inmediato**: el atacante con root borra los locales |
| eBPF (Falco, Tetragon, herramientas del EDR) | Visibilidad profunda con bajo coste | Reglas de ejecución anómala, escritura en rutas sensibles, conexiones inesperadas |
| Sysmon for Linux | Formato homologado con Windows | Facilita reglas unificadas |
| Netflow / Zeek | C2 y exfiltración | Especialmente útil donde no hay agente |
| FIM (AIDE, Tripwire, agente del EDR) | Cambios en binarios y configuración | Base de datos firmada y almacenada fuera del host |

Reglas de auditd de mayor valor: ejecución de `pkexec`, `sudo` y shells por cuentas de servicio; escritura en `~/.ssh/authorized_keys` de cualquier usuario; cambios en `/etc/ld.so.preload`; `insmod`/`modprobe`; `ptrace` entre procesos; y creación de archivos ejecutables en `/tmp` y `/dev/shm`.

## Indicadores de compromiso característicos

| Indicador | Por qué importa |
|---|---|
| Proceso ejecutándose desde `/tmp`, `/dev/shm` o `/var/tmp` | Ruta típica del payload; con `noexec` no debería ser posible |
| Proceso cuyo binario ha sido borrado (`/proc/PID/exe` apunta a `(deleted)`) | Malware que se autoelimina tras ejecutarse: señal muy fiable |
| `/etc/ld.so.preload` no vacío | Casi siempre es un rootkit de userland |
| Entrada con UID 0 distinta de `root` en `/etc/passwd` | Puerta trasera |
| Clave nueva en cualquier `authorized_keys` | Persistencia que sobrevive al cambio de contraseña |
| Módulo de kernel no presente en la baseline | Rootkit |
| Discrepancia entre `ps`, `/proc` y las conexiones vistas desde la red | Ocultación en kernel |
| Cuenta de servicio con shell interactivo | Nunca es legítimo |
| Historial vaciado o `HISTFILE` sin definir | Evasión |
| Cron o timer añadido fuera de la gestión de configuración | Persistencia |
| Conexión saliente sostenida desde un servidor que no debería iniciarla | C2 |

## Triaje en vivo

Orden recomendado, capturando la salida fuera del host:

1. Estado volátil: procesos con su línea de comandos y ruta real (`/proc/*/exe`, `/proc/*/cwd`), conexiones con proceso asociado, sockets en escucha, módulos cargados, usuarios con sesión.
2. Persistencia: cron de todos los usuarios, timers y unidades de systemd, `rc.local`, perfiles de shell, `authorized_keys`, PAM, `ld.so.preload`.
3. Identidad: `/etc/passwd`, `/etc/shadow`, `/etc/group`, `sudoers`, últimas autenticaciones (`last`, `lastb`, `auth.log`).
4. Sistema de archivos: archivos modificados recientemente, SUID contra baseline, archivos borrados aún abiertos (`lsof +L1`).
5. Memoria: volcado con LiME o AVML si el caso lo justifica; con rootkit de kernel es la única evidencia fiable.

Precaución: en un host con rootkit, **los comandos del sistema mienten**. Usar binarios estáticos propios, montar el disco desde un sistema limpio o trabajar sobre el volcado de memoria.
