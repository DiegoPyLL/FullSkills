---
id: playbooks/entra_id
tipo: playbook
estabilidad: permanente
---

# Playbook — Compromiso de Entra ID (tenant)

Base común: [ir_base.md](ir_base.md). Para una sola cuenta comprometida, ver [microsoft365.md](microsoft365.md). Modelo: [azure/azure.md](../azure/azure.md).

Escenario de máximo impacto: el adversario controla el **plano de identidad completo**. Puede suplantar a cualquier usuario, acceder a todos los datos y elevarse sobre todas las suscripciones de Azure.

## Señales de entrada

Rol privilegiado asignado fuera del proceso normal; credencial añadida a un service principal; cambio en la configuración de federación o en un dominio federado; aplicación con permisos de aplicación de alto impacto consentida por un administrador; elevación de acceso de un Global Administrator sobre las suscripciones; desactivación de políticas de acceso condicional; actividad anómala del servidor de Entra Connect.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | **Activar canal fuera de banda** | El adversario controla el correo corporativo |
| 2 | Exportar los logs de Entra ID y el Unified Audit Log | Antes de cualquier cambio; la retención es limitada |
| 3 | Identificar y bloquear las cuentas administrativas comprometidas, **revocando sus sesiones** | Los tokens siguen válidos tras deshabilitar la cuenta |
| 4 | Revisar y revertir los cambios de federación | Máxima prioridad: una federación manipulada permite suplantar a cualquiera |
| 5 | Eliminar credenciales añadidas a service principals y a registros de aplicación | Persistencia silenciosa |
| 6 | Revisar las asignaciones de roles privilegiados y retirar las no legítimas | |
| 7 | Verificar el estado de las cuentas de emergencia | Deben estar intactas y son la vía de recuperación |
| 8 | Aislar el servidor de Entra Connect si está implicado | Es el puente con on-premises |

## Evidencia específica

| Elemento | Fuente |
|---|---|
| Cambios de directorio | Entra ID audit logs: roles, aplicaciones, políticas, dominios |
| Inicios de sesión, incluidos los de service principal e identidades gestionadas | Sign-in logs (los no interactivos suelen ser los que revelan la persistencia) |
| Consentimientos y permisos de aplicación | Audit logs |
| Cambios en acceso condicional | Audit logs |
| Registro de métodos de autenticación | Audit logs |
| Actividad en las suscripciones | Azure Activity Log |
| Estado de Entra Connect | Logs del servidor y de la cuenta de sincronización |
| Relaciones de partner (GDAP) | Configuración del tenant |
| Aplicaciones y service principals | Inventario con sus credenciales y fechas |

## Investigación

1. **¿Cómo obtuvieron privilegios?** Phishing a un administrador sin MFA resistente a phishing, consentimiento ilícito, compromiso de Entra Connect, escalada desde una aplicación con permisos excesivos, o compromiso de un partner.
2. ¿Qué roles llegaron a controlar y desde cuándo?
3. ¿Manipularon la federación o la autenticación? Es la persistencia más grave: permite suplantar sin credenciales.
4. ¿Añadieron credenciales a aplicaciones o service principals? Sobreviven al restablecimiento de contraseñas.
5. ¿Se elevaron sobre las suscripciones de Azure? Revisar el Activity Log.
6. ¿Qué datos accedieron? Correo, SharePoint, Teams: define el alcance legal.
7. ¿Alcanzaron el entorno on-premises a través de Entra Connect?
8. ¿Modificaron políticas de acceso condicional para facilitar su reentrada?

## Erradicación

Coordinada y simultánea:

| Paso | Detalle |
|---|---|
| 1 | Restablecer credenciales y **revocar sesiones** de todas las cuentas privilegiadas |
| 2 | Revisar y eliminar **todas** las credenciales de service principals y de registros de aplicación no reconocidas |
| 3 | Restaurar la configuración de federación y **rotar la clave de firma** si pudo estar comprometida |
| 4 | Revisar y restaurar las políticas de acceso condicional |
| 5 | Retirar asignaciones de roles no legítimas y las aplicaciones consentidas indebidamente |
| 6 | Revisar métodos MFA y dispositivos registrados en cuentas privilegiadas |
| 7 | Revisar y reducir las relaciones de partner (GDAP) |
| 8 | Reconstruir el servidor de Entra Connect si estuvo implicado, y rotar la cuenta de sincronización |
| 9 | Si hay conexión con AD on-premises comprometido, ejecutar también [active_directory.md](active_directory.md) |
| 10 | Renovar las cuentas de emergencia y verificar su exclusión de las políticas |

## Recuperación

Restablecer contraseñas de todos los usuarios si el compromiso fue prolongado. Reintroducir el acceso por fases, empezando por las funciones críticas, con monitorización reforzada. Verificar que las alertas sobre cambios de federación, asignación de roles y credenciales de aplicación están activas antes de reabrir.

## Prevención

| Control | Efecto |
|---|---|
| **MFA resistente a phishing obligatorio para todos los roles privilegiados** | Cierra el vector principal |
| Roles privilegiados en cuentas **cloud-only** | Impide la escalada desde on-premises |
| PIM: activación temporal con aprobación, sin membresías permanentes | Reduce la superficie a minutos al día |
| Consentimiento de usuario restringido y registro de aplicaciones deshabilitado | Cierra la persistencia por OAuth |
| Alertas sobre cambios de federación, de roles y de credenciales de aplicación | Detección de lo más grave |
| Cuentas de emergencia con MFA hardware y alerta ante cualquier uso | Garantiza la recuperación |
| Entra Connect tratado como Tier 0, con filtrado que excluya cuentas privilegiadas | Corta el puente on-prem → nube |
| Revisiones de acceso periódicas sobre roles, aplicaciones e invitados | Reduce la acumulación de permisos |
| Exportación de logs con retención larga | Sin ella, la investigación es imposible |
