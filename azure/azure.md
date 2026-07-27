---
id: azure/azure
tipo: modelo
estabilidad: permanente
---

# Azure, Entra ID y Microsoft 365

Específico del ecosistema Microsoft en la nube. El modelo transversal está en [cloud/cloud.md](../cloud/cloud.md).

## Dos planos de autorización distintos

Confundirlos es el error conceptual más común.

| Plano | Qué controla | Roles | Consecuencia |
|---|---|---|---|
| **Entra ID (directorio)** | Identidades, aplicaciones, políticas, dispositivos | Global Administrator, Privileged Role Administrator, Application Administrator… | Controla **quién es quién** en toda la organización |
| **Azure RBAC (recursos)** | Suscripciones, grupos de recursos, recursos | Owner, Contributor, User Access Administrator… | Controla la infraestructura |

Puente crítico: un Global Administrator puede **auto-otorgarse** el rol de administrador de acceso de usuario sobre todas las suscripciones (opción de elevación de acceso). Por tanto, comprometer el directorio implica comprometer los recursos, aunque no al revés.

## Rutas de escalada en el directorio

| Ruta | Precondición | Efecto | Mitigación |
|---|---|---|---|
| Consentimiento ilícito de aplicación | El usuario acepta permisos delegados | Acceso a correo, archivos y chats sin credencial ni MFA | Restringir el consentimiento de usuario; flujo de aprobación por administrador |
| Credencial añadida a un service principal | `Application Administrator` o permiso equivalente | Persistencia con la identidad de la aplicación | Auditar `Add service principal credentials`; restringir el rol |
| Permisos de aplicación con `RoleManagement.ReadWrite.Directory` | App con ese permiso comprometida | Escalada a Global Administrator | Revisar permisos de aplicación de alto impacto |
| Abuso de Entra Connect | Compromiso del servidor de sincronización | Cuenta de sincronización con privilegios muy altos; puente on-prem → nube | Tratar Entra Connect como **Tier 0** |
| Autenticación pass-through o federación manipulada | Control del agente PTA o de la clave de firma | Autenticación como cualquier usuario (patrón Golden SAML) | Proteger la clave de firma, alertar sobre cambios de dominio federado |
| Registro de un método MFA propio | Cuenta sin MFA previo o con auto-registro abierto | Persistencia y bypass | Exigir autenticación fuerte para registrar métodos; revisar registros nuevos |
| Cuenta sincronizada con rol privilegiado | Compromiso on-premises | Escalada a la nube | Roles privilegiados solo en cuentas **cloud-only** |
| Dispositivo unido y token primario de actualización robado | Infostealer en el equipo | Sesión persistente que salta el MFA | Token protection, cumplimiento de dispositivo, revocación |
| Delegación de partner (GDAP) abusada | Proveedor comprometido | Acceso al tenant del cliente | Revisar relaciones de partner, limitar roles delegados |

## Acceso condicional: la pieza central

Es el motor de política del Zero Trust en Entra. Diseño mínimo recomendado:

| Política | Contenido |
|---|---|
| MFA para todos | Sin excepciones por IP; la ubicación no es un factor de confianza |
| **MFA resistente a phishing para roles privilegiados** | FIDO2 o certificado; TOTP y push no bastan para administradores |
| Bloqueo de autenticación heredada | Los protocolos antiguos no soportan MFA y son el vector de spraying por excelencia |
| Cumplimiento del dispositivo para acceso a datos | Solo dispositivos gestionados y conformes |
| Riesgo de sesión y de usuario | Bloquear o exigir reautenticación ante riesgo alto |
| Token protection | Liga el token al dispositivo; mitiga el robo de cookies |
| Restricción de ubicaciones imposibles | Complemento, nunca control principal |
| Exclusión únicamente de cuentas de emergencia | Documentadas, monitorizadas y con MFA hardware |

Errores frecuentes: excluir "temporalmente" cuentas de servicio y no revisarlo nunca; confiar en la IP de la oficina como condición de confianza; aplicar la política solo a algunas aplicaciones, dejando el resto abierto.

## Registro y detección

| Fuente | Contenido | Uso |
|---|---|---|
| Entra ID Sign-in logs | Interactivos, no interactivos, de service principal y de identidad gestionada | Detección de spraying, AitM, uso anómalo de aplicaciones |
| Entra ID Audit logs | Cambios en directorio, roles, aplicaciones, políticas | Persistencia y escalada |
| Unified Audit Log (M365) | Exchange, SharePoint, Teams, OneDrive | Acceso a buzones y a archivos; **imprescindible para determinar el alcance** |
| Azure Activity Log | Plano de control de recursos | Cambios de infraestructura |
| Microsoft Defender XDR / Sentinel | Correlación y detección | Punto único de investigación |
| Identity Protection | Riesgo de usuario y de sesión | Señal de credenciales comprometidas |
| Defender for Cloud Apps | Comportamiento en SaaS | Descargas masivas, reglas de reenvío |

Punto crítico: **verificar la retención**. El nivel de licencia determina cuántos días se conservan los logs, y muchas investigaciones fracasan porque la evidencia ya expiró. Exportar a un almacén propio con retención larga.

## Detecciones de alta prioridad

| Señal | Interpretación |
|---|---|
| Consentimiento a una aplicación nueva con permisos amplios | Persistencia por OAuth |
| `Add service principal credentials` | Puerta trasera de aplicación |
| `Add member to role` sobre roles privilegiados | Escalada |
| Cambio de dominio federado o de configuración de autenticación | Suplantación a nivel de tenant: prioridad máxima |
| Registro de un nuevo método MFA sin autenticación fuerte previa | Toma de control de cuenta |
| Regla de reenvío de correo a dominio externo | Exfiltración y BEC |
| Sesión reutilizada desde IP y dispositivo distintos sin nueva autenticación | Robo de token (AitM o infostealer) |
| Ráfaga de fallos de autenticación heredada | Password spraying |
| Descarga masiva desde SharePoint u OneDrive | Recolección |
| Creación de aplicación con permisos de aplicación de alto impacto | Persistencia |
| Elevación de acceso de un Global Administrator sobre suscripciones | Cruce del plano de directorio al de recursos |
| Deshabilitación de políticas de acceso condicional o de auditoría | Evasión |

## Configuración base

| Área | Control |
|---|---|
| Roles privilegiados | Cloud-only, con PIM: activación temporal, justificación y aprobación; sin membresías permanentes |
| Cuentas de emergencia | Dos, excluidas del acceso condicional, con MFA hardware y alerta ante cualquier uso |
| Autenticación heredada | Bloqueada |
| Consentimiento de usuario | Restringido a aplicaciones verificadas y permisos de bajo impacto |
| Registro de aplicaciones por usuarios | Deshabilitado |
| Auto-registro de dispositivos | Controlado |
| Invitados B2B | Permisos mínimos, revisión de acceso periódica, caducidad |
| Revisiones de acceso | Periódicas sobre roles, grupos y aplicaciones |
| Entra Connect | Servidor Tier 0, sin navegación, con MFA en su administración; filtrado de sincronización que excluya cuentas privilegiadas on-prem |
| Azure RBAC | Roles integrados de mínimo privilegio; `Owner` restringido; Azure Policy como barandilla preventiva |
| Recursos | Cifrado con claves gestionadas por el cliente donde aplique; sin endpoints públicos por defecto; Private Link |
| Key Vault | Purge protection y soft delete activados; políticas de acceso restringidas y auditadas |
| Almacenamiento | Acceso público bloqueado a nivel de suscripción, claves de cuenta deshabilitadas en favor de identidad |
| Backups | Inmutabilidad y borrado protegido con MFA |

## Microsoft 365

| Superficie | Riesgo | Control |
|---|---|---|
| Exchange Online | Reglas de reenvío, delegación de buzón, exportación masiva | Bloquear reenvío externo automático, auditar permisos de buzón, alertar sobre exportaciones |
| SharePoint y OneDrive | Compartición anónima con enlaces, descargas masivas | Enlaces con caducidad y autenticación, límites de descarga, etiquetas de sensibilidad |
| Teams | Acceso externo, aplicaciones de terceros, phishing por chat | Restringir federación y aplicaciones, DLP en chat |
| Power Platform | Conectores que sacan datos fuera sin control de TI | Políticas DLP de entorno, gobierno de conectores |
| Aplicaciones OAuth de terceros | Acceso persistente a datos | Revisión periódica, restricción de consentimiento |

Respuesta específica en [playbooks/microsoft365.md](../playbooks/microsoft365.md) y [playbooks/entra_id.md](../playbooks/entra_id.md).
