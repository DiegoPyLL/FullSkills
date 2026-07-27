---
id: playbooks/microsoft365
tipo: playbook
estabilidad: permanente
---

# Playbook — Compromiso de cuenta en Microsoft 365

Base común: [ir_base.md](ir_base.md). Para el compromiso del directorio completo, ver [entra_id.md](entra_id.md). Modelo: [azure/azure.md](../azure/azure.md).

Escenario más frecuente: **una cuenta comprometida por phishing AitM o por infostealer**, con la cookie de sesión robada. El adversario entra con una sesión válida, sin disparar el MFA.

## Señales de entrada

Inicio de sesión desde ubicación o ASN inusual; sesión reutilizada desde un dispositivo distinto sin nueva autenticación; regla de reenvío externo creada; ráfaga de correos internos desde la cuenta; descarga masiva desde OneDrive o SharePoint; registro de un método MFA nuevo; consentimiento a una aplicación con permisos amplios; aviso de un socio que recibió un correo fraudulento.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | **Revocar todas las sesiones y tokens de actualización** de la cuenta | Restablecer la contraseña **no** invalida la sesión robada. Este es el error más común |
| 2 | Restablecer la contraseña | Después de revocar, no antes |
| 3 | Revisar y eliminar métodos MFA no reconocidos | Persistencia habitual |
| 4 | Eliminar reglas de reenvío y de buzón creadas por el adversario | Incluidas las ocultas, que no aparecen en la interfaz web |
| 5 | Revisar y retirar delegaciones de buzón y permisos concedidos | |
| 6 | Revisar aplicaciones OAuth consentidas por el usuario | Mantienen acceso sin credencial |
| 7 | Bloquear temporalmente la cuenta si el impacto lo justifica | |
| 8 | Comprobar si el equipo del usuario tiene infostealer | Si lo tiene, todas sus credenciales están comprometidas |

## Evidencia específica

| Elemento | Fuente |
|---|---|
| Inicios de sesión interactivos y no interactivos | Entra ID sign-in logs |
| Acciones sobre el buzón | Unified Audit Log: `New-InboxRule`, `Set-Mailbox`, `Add-MailboxPermission`, `MailItemsAccessed` |
| Acceso a archivos | Auditoría de SharePoint y OneDrive: descargas, comparticiones creadas |
| Correos enviados | Seguimiento de mensajes: a quién escribió el adversario |
| Consentimientos y credenciales de aplicación | Entra ID audit logs |
| Cambios en métodos de autenticación | Entra ID audit logs |
| Actividad en Teams | Mensajes, archivos compartidos, invitados añadidos |
| Estado del dispositivo del usuario | Determina si el origen es un infostealer local |

Verificar la **retención disponible** al principio: depende del nivel de licencia y muchas investigaciones fracasan porque la evidencia ya expiró.

## Investigación

1. **¿Cómo entraron?** Phishing AitM (la sesión se robó), infostealer en el equipo, contraseña reutilizada, o MFA fatigue.
2. ¿Cuánto tiempo tuvieron acceso? Revisar desde el primer inicio de sesión anómalo, no desde la alerta.
3. ¿Qué correos leyeron? El registro de acceso a elementos del buzón lo indica, si está habilitado.
4. ¿Enviaron correos? Buscar fraude de transferencia (BEC), phishing interno y phishing a socios externos.
5. ¿Qué archivos descargaron o compartieron?
6. ¿Crearon persistencia? Reglas, delegaciones, aplicaciones OAuth, métodos MFA, dispositivos registrados.
7. **¿Hay más cuentas afectadas?** El phishing interno desde una cuenta legítima tiene una tasa de éxito muy alta.
8. ¿Escalaron hacia roles administrativos? Si sí, escalar a [entra_id.md](entra_id.md).

## Erradicación

- Revocación de sesiones y rotación de contraseña de todas las cuentas afectadas, a la vez.
- Eliminación de todas las reglas, delegaciones, aplicaciones consentidas y métodos MFA no legítimos.
- Retirada de dispositivos registrados por el adversario.
- Limpieza del equipo del usuario si hubo infostealer: reconstrucción, no desinfección, y rotación de todas las credenciales que hubiera en el navegador.
- Retirada de los correos maliciosos enviados desde la cuenta, en los buzones internos.
- Notificación a los destinatarios externos que recibieron correo fraudulento.
- Revisión de si hubo cambios en datos de pago o instrucciones bancarias enviadas desde la cuenta.

## Prevención

| Control | Efecto |
|---|---|
| **MFA resistente a phishing (FIDO2)** | Única defensa efectiva contra AitM |
| **Token protection** y acceso condicional por cumplimiento de dispositivo | Impide reutilizar la cookie robada desde otro equipo |
| Bloqueo de la autenticación heredada | Elimina el vector de spraying |
| Bloqueo del reenvío automático externo | Corta la exfiltración persistente |
| Alerta sobre reglas de buzón nuevas y sobre registro de MFA | Detección temprana de persistencia |
| Restricción del consentimiento de aplicaciones por usuarios | Cierra la persistencia por OAuth |
| Auditoría de acceso a elementos de buzón habilitada | Permite determinar el alcance |
| Verificación fuera de banda para cambios de datos bancarios | Único control que detiene el fraude BEC |
| Exportación de logs a un almacén propio con retención larga | Evita quedarse sin evidencia |
