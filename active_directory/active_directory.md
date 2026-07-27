---
id: active_directory/active_directory
tipo: modelo
estabilidad: permanente
---

# Active Directory

AD es el objetivo real de casi toda intrusión en una red corporativa: comprometerlo entrega todo lo demás. **El límite de seguridad es el bosque, no el dominio.**

## Kerberos: lo mínimo para razonar

| Paso | Mensaje | Contenido | Abuso derivado |
|---|---|---|---|
| 1 | AS-REQ / AS-REP | El cliente prueba su identidad con la marca temporal cifrada con su clave; el KDC devuelve el TGT cifrado con la clave de `krbtgt` | Sin preautenticación → **AS-REP Roasting**. Con el hash de `krbtgt` → **Golden Ticket** |
| 2 | TGS-REQ / TGS-REP | El cliente pide un ticket de servicio; el KDC lo cifra con la clave de la cuenta del servicio | Cualquier usuario puede pedirlo → **Kerberoasting**. Con la clave del servicio → **Silver Ticket** |
| 3 | AP-REQ | El cliente presenta el ticket al servicio | El servicio **no consulta al DC**: por eso el Silver Ticket es invisible en los logs del DC |

El **PAC** dentro del ticket contiene los grupos del usuario: es lo que se falsifica en un Golden Ticket.

Consecuencia operativa: comprometido el hash de `krbtgt`, el atacante puede emitir tickets válidos indefinidamente. El único remedio es **resetear `krbtgt` dos veces**, separadas por más del tiempo de replicación (y de la vida máxima de ticket), para invalidar la clave anterior y la actual.

## Rutas de escalada de dominio

Ordenadas por frecuencia en intrusiones reales.

| Ruta | Precondición | Resultado | Corrección |
|---|---|---|---|
| Kerberoasting de cuenta de servicio con contraseña débil | Cualquier cuenta de dominio | Contraseña de servicio, a menudo privilegiada | gMSA/dMSA, AES, retirar SPN sin uso |
| Abuso de ACL encadenado | Delegación mal otorgada | Reset de contraseñas, adición a grupos | Auditoría de grafo (BloodHound), delegación mínima |
| Contraseña de administrador local reutilizada | Imagen dorada común | Administrador local en toda la flota | **LAPS** |
| Volcado de LSASS en un servidor donde inició sesión un DA | Administrador local | Credencial de Tier 0 | Tiering + Credential Guard + Protected Users |
| Relay NTLM a LDAP o a AD CS | Firma no obligatoria | Escalada directa | Firma LDAP, channel binding, EPA, desactivar HTTP en la CA |
| Abuso de plantillas de AD CS (ESC1–ESC8) | Plantilla que permite indicar el SAN, o inscripción web sin protección | Certificado de autenticación como DA | Revisar plantillas, aprobación del gestor, EPA |
| Delegación irrestricta | Host con `TRUSTED_FOR_DELEGATION` | Captura del TGT de un DC mediante coacción | Eliminar la delegación irrestricta; Protected Users |
| RBCD (delegación restringida basada en recursos) | Escritura sobre `msDS-AllowedToActOnBehalfOfOtherIdentity` y `MachineAccountQuota > 0` | Suplantación como cualquier usuario | `MachineAccountQuota = 0`, revisión de permisos de escritura sobre objetos de equipo |
| GPO escribible | Permiso sobre la política | Ejecución en todos los equipos del ámbito | Delegación mínima, auditoría de SYSVOL |
| Vulnerabilidad del DC (Zerologon, noPac, PrintNightmare) | Sistema sin parchear | DA directo | Parcheo; spooler desactivado en DC |
| DCSync desde cuenta con derechos de replicación | Permiso otorgado por error o herencia | Todos los hashes, incluido `krbtgt` | Auditar los derechos de replicación |

## AD CS — la superficie más subestimada

Un certificado de autenticación **no se invalida al cambiar la contraseña**: es persistencia que dura lo que dure el certificado.

| Configuración insegura | Efecto | Corrección |
|---|---|---|
| ESC1: plantilla que permite al solicitante indicar el SAN y habilita autenticación de cliente | Solicitar un certificado "como" Domain Admin | Quitar el flag de SAN suministrable o exigir aprobación |
| ESC2/ESC3: plantillas con EKU `Any Purpose` o de agente de inscripción | Certificados para cualquier propósito o en nombre de otros | Restringir EKU y la inscripción de agentes |
| ESC4: permisos de escritura sobre la plantilla | Reconfigurarla para volverla vulnerable | ACL restrictivas sobre las plantillas |
| ESC6: flag `EDITF_ATTRIBUTESUBJECTALTNAME2` en la CA | Convierte todas las plantillas en vulnerables al SAN | Desactivar el flag |
| ESC7: permisos de gestión sobre la CA | Aprobar solicitudes propias, cambiar la configuración | Restringir roles de la CA |
| ESC8: endpoint web de inscripción sobre HTTP sin EPA | Relay NTLM → certificado de DA | Deshabilitar HTTP, exigir EPA y firma |
| Clave privada de la CA sin HSM | Falsificación de cualquier certificado del bosque | HSM; tratar la CA como Tier 0 |

Detección: emisiones con SAN que no corresponde al solicitante; autenticaciones Kerberos por certificado inusuales; eventos de la CA con plantillas sensibles.

## Configuración de referencia

| Ajuste | Valor | Motivo |
|---|---|---|
| `MachineAccountQuota` | 0 | Impide RBCD y noPac con cuentas de máquina creadas por el atacante |
| Firma LDAP + channel binding | Obligatorios | Bloquea el relay a LDAP |
| Firma SMB | Obligatoria | Bloquea el relay a SMB |
| LLMNR / NBT-NS / mDNS | Desactivados | Elimina la captura de NetNTLM |
| Print Spooler en DC | Desactivado | PrintNightmare y coacción de autenticación |
| Preautenticación Kerberos | Obligatoria en todas las cuentas | Elimina AS-REP Roasting |
| Cifrado Kerberos | AES; RC4 desactivado | Dificulta el crackeo de tickets |
| Delegación irrestricta | Eliminada; cuentas privilegiadas marcadas como no delegables | Evita la captura de TGT |
| Grupo Protected Users | Todas las cuentas administrativas | Sin caché, sin NTLM, sin delegación |
| Cuentas de servicio | gMSA/dMSA | Elimina el Kerberoasting efectivo |
| SID filtering en trusts | Activo | Impide la inyección de SID History entre dominios |
| Papelera de AD | Habilitada | Recuperación de objetos borrados durante un incidente |
| Auditoría avanzada | Habilitada con SACL en objetos sensibles | Sin esto no hay detección posible |

## Detecciones prioritarias en AD

| Detección | Evento | Por qué es de alto valor |
|---|---|---|
| DCSync desde host no DC | 4662 con `DS-Replication-Get-Changes` / `-All` | Precede al Golden Ticket; casi sin falsos positivos |
| Kerberoasting | 4769 con cifrado RC4 en volumen anómalo por una cuenta | Detecta la fase de robo antes del crackeo |
| AS-REP Roasting | 4768 sobre cuentas sin preautenticación | Ídem |
| Cambios en grupos privilegiados | 4728, 4732, 4756 | Persistencia y escalada |
| Cambios en ACL de objetos sensibles | 5136 sobre `nTSecurityDescriptor` | Abuso de ACL y AdminSDHolder |
| Cambio de contraseña de cuenta de máquina de un DC | 4742 | Zerologon |
| Creación o renombrado de cuentas de máquina | 4741, 4781 | noPac, RBCD |
| Registro de un nuevo DC | Creación de objeto `nTDSDSA` | DCShadow |
| Modificación de GPO | 5136 sobre objetos de política; cambios en SYSVOL | Despliegue masivo de ransomware |
| Autenticación NTLM hacia el DC desde hosts inesperados | 4624 tipo 3 con NTLM | Relay |
| Emisión anómala de certificados | Logs de la CA | AD CS |
| Ticket con vida superior a la política | 4769/4770 | Golden Ticket |

## Higiene: qué revisar periódicamente

1. **Rutas de ataque con análisis de grafo** (BloodHound o equivalente), no permisos aislados. Objetivo: reducir a cero los caminos de usuario normal a DA.
2. **Cuentas privilegiadas**: membresías, antigüedad de contraseñas, último uso, cuentas huérfanas y de servicio con privilegios excesivos.
3. **SPN registrados**: cada uno es un objetivo de Kerberoasting.
4. **Delegaciones**: irrestricta (eliminar), restringida y RBCD (justificar cada una).
5. **Plantillas de AD CS** contra el catálogo ESC.
6. **Trusts**: dirección, transitividad, SID filtering, necesidad real.
7. **SYSVOL**: contraseñas heredadas en GPP, scripts modificables.
8. **Objetos obsoletos**: equipos y usuarios inactivos, que amplían superficie sin aportar valor.
9. **Antigüedad de la contraseña de `krbtgt`**: rotación planificada, no solo tras un incidente.
10. **Cuentas señuelo** con SPN atractivo, para detectar Kerberoasting con falso positivo cero.

## Recuperación tras compromiso del dominio

Un dominio comprometido a nivel de `krbtgt` o de DA no se "limpia" host por host. Ver [playbooks/active_directory.md](../playbooks/active_directory.md) para el procedimiento completo. Puntos irrenunciables:

- Doble reset de `krbtgt`, con intervalo suficiente entre ambos.
- Rotación de **todas** las contraseñas: usuarios, cuentas de servicio, cuentas de máquina críticas, cuentas locales, credenciales de aplicaciones.
- Revisión de la clave de respaldo de DPAPI del dominio.
- Revocación de certificados emitidos durante el periodo de compromiso y evaluación de la clave de la CA.
- Auditoría completa de ACL, membresías, GPO, tareas en DC y delegaciones.
- Evaluar si procede reconstruir el bosque: si el atacante tuvo control prolongado del plano de identidad, la reconstrucción puede ser más barata y más segura que la validación exhaustiva.
