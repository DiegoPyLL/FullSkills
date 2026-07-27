---
id: playbooks/exchange
tipo: playbook
estabilidad: permanente
---

# Playbook — Microsoft Exchange (on-premises)

Base común: [ir_base.md](ir_base.md). Ficha de la cadena ProxyShell en [cve_database.md](../cve_database.md#ficha-4--proxyshell).

Exchange es un objetivo prioritario: está expuesto, corre como SYSTEM, está unido al dominio, conserva permisos históricamente amplios sobre AD y contiene el correo de toda la organización.

## Señales de entrada

Archivos `.aspx` nuevos en directorios virtuales; procesos hijos de `w3wp.exe`; peticiones anómalas a Autodiscover, OWA o ECP en los logs de IIS; exportaciones de buzón no solicitadas; reglas de reenvío externas; alertas de KEV sobre CVEs de Exchange.

## Contención inmediata

| # | Acción |
|---|---|
| 1 | **Buscar web shells antes de parchear**: el parche no elimina la puerta trasera ya instalada |
| 2 | Aislar el servidor de la red manteniéndolo encendido, o cortar solo el acceso externo si el correo es crítico |
| 3 | Revocar las credenciales de servicio y la cuenta de máquina del servidor |
| 4 | Deshabilitar Exchange PowerShell remoto para usuarios no administrativos |
| 5 | Revisar y desactivar reglas de reenvío externo creadas recientemente |
| 6 | Revisar delegaciones de buzón y permisos de aplicación añadidos |
| 7 | Bloquear el acceso externo a ECP si no es imprescindible |

## Evidencia específica

| Elemento | Ruta o fuente |
|---|---|
| Web shells | `FrontEnd\HttpProxy\owa\auth\`, `ecp\auth\`, `aspnet_client\`, `OAB\` |
| Logs de IIS | Peticiones a `/autodiscover/autodiscover.json`, `/ecp/`, `/powershell/` con parámetros anómalos |
| Logs del proxy HTTP de Exchange | `HttpProxy\Autodiscover`, `HttpProxy\Ecp`, `HttpProxy\Owa` |
| Logs de administración de Exchange | Cmdlets ejecutados: buscar `New-MailboxExportRequest`, `New-ManagementRoleAssignment`, `Set-InboxRule` |
| Archivos PST en rutas inusuales | Indicio directo de exportación masiva de buzones |
| Creación de procesos | Hijos de `w3wp.exe`: `cmd`, `powershell`, `csc`, `net` |
| Logs de autenticación | Acceso a buzones desde IP inesperadas |
| Auditoría de buzones | Accesos por delegados y por aplicaciones |

## Investigación

1. ¿Qué versión y nivel de actualización acumulativa tenía el servidor, y qué CVEs conocidos le afectaban?
2. ¿Hay web shells? Comparar todo el contenido de los directorios virtuales con una instalación limpia de la misma CU.
3. ¿Se exportaron buzones? Revisar `New-MailboxExportRequest` y la presencia de archivos PST.
4. ¿Se crearon reglas de reenvío o delegaciones? Es la persistencia más común y la más silenciosa.
5. ¿Se volcaron credenciales en el servidor? Exchange corre como SYSTEM y suele tener credenciales privilegiadas en memoria.
6. ¿Se usó Exchange como pivote hacia AD? Revisar autenticaciones desde el servidor hacia los DC.
7. ¿Qué buzones fueron accedidos y por quién? Define el alcance de datos y las obligaciones legales.

## Erradicación

- Aplicar la actualización acumulativa y la de seguridad vigentes. Exchange requiere estar en una CU soportada para poder recibir parches.
- **Reconstruir el servidor** si hubo ejecución como SYSTEM; limpiar un Exchange comprometido no es fiable.
- Eliminar todas las web shells encontradas y verificar la integridad de los directorios virtuales.
- Rotar credenciales de servicio, cuenta de máquina y contraseñas de los usuarios cuyos buzones fueron accedidos.
- Revisar y limpiar reglas de buzón, delegaciones, permisos de aplicación y asignaciones de roles de administración.
- Si Exchange tenía permisos amplios sobre AD y hubo compromiso, tratar el incidente también como uno de Active Directory ([active_directory.md](active_directory.md)).

## Prevención

| Control | Efecto |
|---|---|
| No exponer OWA y ECP directamente; publicar tras un proxy con autenticación previa | Elimina la superficie pre-autenticación |
| Mantener la CU al día como requisito para poder parchear | Evita quedar sin ruta de actualización |
| Alerta sobre cualquier proceso hijo de `w3wp.exe` | Detección de altísima precisión |
| FIM sobre los directorios virtuales de Exchange | Detecta web shells en minutos |
| Reducir los permisos heredados de Exchange sobre AD | Limita el pivote a Domain Admin |
| Bloquear el reenvío automático externo y alertar sobre reglas nuevas | Corta la exfiltración persistente |
| Auditoría de buzones habilitada con retención suficiente | Permite determinar el alcance |
| Migrar fuera de Exchange on-premises cuando sea viable | Elimina la superficie por completo |
