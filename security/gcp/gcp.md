---
id: gcp/gcp
tipo: modelo
estabilidad: permanente
---

# Google Cloud

Específico de GCP. El modelo transversal está en [cloud/cloud.md](../cloud/cloud.md).

## Jerarquía y herencia

`Organización → Carpetas → Proyectos → Recursos`. Los permisos **se heredan hacia abajo y se acumulan**: no existe deny por defecto en IAM básico. Consecuencias:

- Un rol concedido en la organización aplica a todos los proyectos, presentes y futuros.
- El **proyecto** es la unidad natural de aislamiento y de radio de explosión.
- Para denegar hay que usar **IAM Deny Policies** o restricciones de la organización, no ausencia de concesión.

## IAM: rutas de escalada

| Permiso | Escalada | Mitigación |
|---|---|---|
| `iam.serviceAccounts.actAs` + despliegue (Compute, Cloud Run, Functions, Composer) | Ejecutar código como una cuenta de servicio más privilegiada | Restringir `actAs` por cuenta de servicio concreta |
| `iam.serviceAccounts.getAccessToken` / `signJwt` / `signBlob` | Obtener credenciales de otra identidad sin desplegar nada | Rol `Service Account Token Creator` restringido y auditado |
| `iam.serviceAccountKeys.create` | Clave estática permanente de una cuenta de servicio | Prohibir claves de cuenta de servicio por política de organización |
| `iam.roles.update` sobre un rol personalizado en uso | Ampliar permisos de forma silenciosa | Restringir la administración de roles |
| `resourcemanager.projects.setIamPolicy` | Autoconcesión de `Owner` | Separar la administración de IAM; usar Deny Policies |
| `cloudbuild.builds.create` | Cloud Build ejecuta con una cuenta de servicio históricamente muy privilegiada | Cuenta de build dedicada y mínima |
| `deploymentmanager.deployments.create` | Despliegue con la cuenta de servicio del servicio | Restringir |
| `compute.instances.setMetadata` | Añadir claves SSH o un script de arranque a una VM existente | Bloquear claves SSH a nivel de proyecto, usar OS Login |
| `container.clusters.get` + credenciales de GKE | Acceso al cluster | Ver [kubernetes/kubernetes.md](../kubernetes/kubernetes.md) |
| Roles primitivos (`Owner`, `Editor`, `Viewer`) | `Editor` incluye permisos suficientes para escalar en la mayoría de proyectos | **No usarlos**: roles predefinidos o personalizados |

La cuenta de servicio por defecto de Compute Engine, con el rol `Editor` y ámbito amplio, es históricamente una de las escaladas más fáciles: desactivar su concesión automática por política de organización.

## Políticas de organización (barandillas preventivas)

Equivalente a las SCP: impiden la configuración insegura antes de que ocurra.

| Restricción | Efecto |
|---|---|
| Deshabilitar la creación de claves de cuenta de servicio | Elimina las credenciales estáticas, principal fuente de filtración |
| Deshabilitar la concesión automática de roles a cuentas de servicio por defecto | Corta la escalada más común |
| Restringir el uso de IP externas en VM | Reduce la exposición |
| Restringir el intercambio de dominios (`allowedPolicyMemberDomains`) | Impide conceder acceso a cuentas externas |
| Exigir OS Login | Elimina las claves SSH por metadata |
| Restringir el acceso público a buckets y a la asignación pública de IAM | Evita exposición de datos |
| Restringir regiones permitidas | Evita despliegues en zonas no vigiladas |
| Exigir Shielded VM | Protege el arranque |

## Registro y detección

| Log | Contenido | Nota |
|---|---|---|
| Admin Activity | Cambios de configuración y de IAM | Siempre activo, sin coste, retención por defecto limitada |
| Data Access | Lecturas y escrituras de datos | **Desactivado por defecto salvo BigQuery**: activarlo en servicios sensibles es imprescindible para el análisis forense |
| System Event | Acciones del sistema | Automático |
| Policy Denied | Accesos denegados por política | Muy útil para detectar reconocimiento |
| VPC Flow Logs | Flujos de red | Activar en subredes relevantes |
| Cloud DNS logging | Consultas DNS | C2 y túnel |
| Security Command Center | Postura, vulnerabilidades y amenazas | Punto único |

Exportar mediante un **sink agregado a nivel de organización** hacia un proyecto de seguridad separado, con bucket bloqueado. Sin esa separación, quien compromete el proyecto borra sus propios logs.

## Detecciones de alta prioridad

| Señal | Interpretación |
|---|---|
| `SetIamPolicy` que concede roles amplios o a principales externos | Escalada o persistencia |
| Creación de clave de cuenta de servicio | Persistencia con credencial estática |
| `generateAccessToken` / `signJwt` fuera de patrón | Suplantación de identidad |
| Modificación de metadata de instancia (claves SSH, startup script) | Persistencia y ejecución |
| Deshabilitación de logs o borrado de sinks | Evasión: prioridad máxima |
| Creación de recursos en regiones no utilizadas | Minería |
| Buckets con `allUsers` o `allAuthenticatedUsers` | Exposición de datos |
| Exportación masiva de BigQuery o copia entre proyectos | Exfiltración |
| Uso de credenciales de cuenta de servicio desde fuera de GCP | Credencial robada |
| Cambios en reglas de firewall que abren `0.0.0.0/0` | Exposición |
| Concesión de acceso a un dominio externo | Persistencia de terceros |

## Configuración base

| Área | Control |
|---|---|
| Estructura | Carpetas por entorno y unidad; proyecto por carga de trabajo y entorno |
| Identidad humana | SSO con MFA resistente a phishing; grupos como unidad de concesión, nunca usuarios individuales |
| Identidad de máquina | Workload Identity Federation (sin claves); dentro de GKE, Workload Identity |
| Roles | Predefinidos o personalizados de mínimo privilegio; roles primitivos prohibidos |
| Red | VPC compartida, subredes privadas, Private Google Access, Cloud NAT con egress controlado, firewall con etiquetas o cuentas de servicio |
| Perímetro | VPC Service Controls alrededor de los datos sensibles: mitiga la exfiltración incluso con credenciales válidas |
| Cifrado | CMEK con Cloud KMS para datos sensibles; separación de administración de claves y de datos |
| Secretos | Secret Manager con rotación; nunca en metadata ni en variables |
| Almacenamiento | Acceso uniforme a nivel de bucket, sin acceso público, versionado y retención bloqueada donde aplique |
| Cómputo | Shielded VM, OS Login, sin IP pública, confidential computing si el dato lo requiere |
| Backups | Copias en proyecto separado con retención bloqueada |

## Diferencias que importan frente a AWS y Azure

| Aspecto | GCP | Implicación |
|---|---|---|
| Herencia de IAM | Descendente y acumulativa, sin deny implícito por defecto | Un rol en la organización es mucho más peligroso que su equivalente en otros proveedores |
| Unidad de aislamiento | El proyecto | Diseñar la granularidad de proyectos es una decisión de seguridad, no administrativa |
| Logs de acceso a datos | Desactivados por defecto | Sin activarlos no hay forense de datos |
| Suplantación de cuentas de servicio | Mecanismo de primera clase (`actAs`, `getAccessToken`) | Es la ruta de escalada dominante: auditarla explícitamente |
| VPC Service Controls | Perímetro alrededor de servicios gestionados | No tiene equivalente directo; muy eficaz contra la exfiltración |
| Claves de cuenta de servicio | Credenciales estáticas fáciles de crear | Prohibirlas por política es una de las decisiones de mayor impacto |
