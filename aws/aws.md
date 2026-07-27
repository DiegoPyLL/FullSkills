---
id: aws/aws
tipo: modelo
estabilidad: permanente
---

# AWS

Específico de AWS. El modelo transversal está en [cloud/cloud.md](../cloud/cloud.md).

## Modelo de permisos

La autorización resulta de evaluar, en este orden: **deny explícito** en cualquier política gana siempre → SCP de la organización → límite de permisos (permissions boundary) → política de sesión → política de identidad o de recurso. Una acción se permite solo si **todas** las capas aplicables la permiten y ninguna la deniega.

| Tipo de política | Alcance | Uso defensivo |
|---|---|---|
| Identity-based | Usuario, grupo o rol | Permisos de la identidad |
| Resource-based | Bucket, cola, clave KMS, función | Permite acceso cross-account sin rol asumido: revisar siempre |
| SCP (Service Control Policy) | Cuenta u OU | **Barandilla que ni el administrador de la cuenta puede saltar**: el control preventivo más potente |
| Permissions boundary | Identidad | Techo de permisos delegable |
| Session policy | Sesión temporal | Reducción puntual |

## Rutas de escalada en IAM

Casi toda escalada en AWS es una de estas. Auditarlas explícitamente.

| Permiso peligroso | Escalada | Mitigación |
|---|---|---|
| `iam:PassRole` + `ec2:RunInstances` | Lanzar una instancia con un rol administrativo y leer sus credenciales desde la metadata | Condición sobre qué roles se pueden pasar |
| `iam:PassRole` + `lambda:CreateFunction` + `lambda:InvokeFunction` | Ejecutar código con un rol privilegiado | Ídem |
| `iam:CreatePolicyVersion` / `SetDefaultPolicyVersion` | Reescribir la propia política | Permissions boundary, SCP |
| `iam:PutUserPolicy` / `PutRolePolicy` / `AttachUserPolicy` | Añadirse permisos | Ídem |
| `iam:CreateAccessKey` sobre otro usuario | Suplantar a un usuario privilegiado | Restringir a administración de identidad |
| `iam:UpdateAssumeRolePolicy` | Permitirse asumir un rol privilegiado | Ídem |
| `iam:CreateLoginProfile` / `UpdateLoginProfile` | Asignar contraseña de consola a otra identidad | Ídem |
| `sts:AssumeRole` con confianza laxa | Acceso desde una cuenta externa | Condiciones de `ExternalId` y de `PrincipalOrgID` |
| `ssm:SendCommand` | Ejecución de comandos en cualquier instancia gestionada | Restringir por etiquetas, requerir aprobación |
| `ec2:ModifyInstanceAttribute` (user data) | Ejecución al reiniciar la instancia | Restringir |
| `cloudformation` con rol de servicio privilegiado | Despliegue de cualquier recurso | Roles de servicio acotados |
| `glue`, `sagemaker`, `datapipeline` con `PassRole` | Servicios que ejecutan código con un rol | Condiciones en `PassRole` |
| `kms:*` sobre claves ajenas | Descifrado o denegación por borrado de clave | Políticas de clave separadas de IAM |

Auditar el permiso `iam:PassRole` sin condición es, en la práctica, la revisión de mayor rendimiento en una cuenta AWS.

## Registro y detección

| Servicio | Qué aporta | Configuración imprescindible |
|---|---|---|
| CloudTrail | Todas las llamadas al plano de control | Trail de organización, multi-región, log file validation, destino en cuenta de seguridad separada |
| CloudTrail data events | Acceso a objetos S3, invocaciones Lambda | Activar en buckets sensibles: sin esto no se puede probar qué se leyó |
| VPC Flow Logs | Flujos de red | Necesario para exfiltración y movimiento lateral |
| GuardDuty | Detección gestionada sobre CloudTrail, DNS, VPC, EKS, S3, malware en EBS | Activar en todas las cuentas y regiones, incluidas las no usadas |
| Config | Estado e histórico de configuración | Detección de drift y evidencia forense |
| Security Hub | Agregación de hallazgos | Punto único de postura |
| IAM Access Analyzer | Recursos accesibles desde fuera de la cuenta u organización | Revisión continua de exposición |
| Route 53 Resolver query logs | DNS | C2 y túnel DNS |

**Regiones no usadas**: son el escondite favorito. Denegar por SCP las regiones no aprobadas y monitorizar igualmente las demás.

## Detecciones de alta prioridad

| Evento | Interpretación |
|---|---|
| `StopLogging`, `DeleteTrail`, `PutEventSelectors` restrictivo | Cegado del registro: máxima prioridad |
| `DeleteFlowLogs`, `DisassociateMemberAccount` de GuardDuty | Ídem |
| Uso de credenciales de rol de instancia desde una IP externa al proveedor | Credenciales exfiltradas y usadas fuera |
| `CreateUser`, `CreateAccessKey`, `CreateLoginProfile` fuera del proceso normal | Persistencia |
| `AttachUserPolicy` con `AdministratorAccess` | Escalada |
| `ModifySnapshotAttribute` / `ModifyImageAttribute` con `all` o cuenta externa | Exfiltración de datos |
| `PutBucketPolicy` o `PutBucketAcl` que abre acceso público | Exposición de datos |
| `GetSecretValue` / `GetParameter` masivo | Recolección de secretos |
| `AssumeRole` desde una cuenta desconocida | Acceso cross-account no autorizado |
| Ráfaga de `Describe*` / `List*` desde una identidad | Reconocimiento |
| `RunInstances` de tipos con GPU o en regiones inusuales | Criptominería |
| Actividad de la cuenta raíz | Debe ser excepcional y siempre alertada |
| `DeleteDBInstance`, `DeleteBucket`, borrado de snapshots | Impacto destructivo |

## Configuración base de una cuenta

| Control | Detalle |
|---|---|
| Organización con OU por entorno | Producción, no producción, seguridad, sandbox |
| SCP de barandilla | Prohibir desactivar CloudTrail/GuardDuty/Config, prohibir regiones no aprobadas, prohibir compartir snapshots fuera de la organización, prohibir borrar logs |
| Cuenta raíz | Sin claves de acceso, MFA hardware, credenciales custodiadas, alerta ante cualquier uso |
| Acceso humano | Exclusivamente por IAM Identity Center (SSO) con MFA; cero usuarios IAM con contraseña |
| Acceso de máquinas y CI | Roles con OIDC federado; cero claves de acceso estáticas |
| S3 | Block Public Access a nivel de cuenta, cifrado por defecto, versionado, Object Lock en repositorios críticos |
| EC2 | IMDSv2 obligatorio con hop limit 1, EBS cifrado por defecto, sin IP pública salvo necesidad |
| VPC | Subredes privadas por defecto, endpoints de VPC para servicios internos, egress controlado por NAT y firewall |
| KMS | Claves gestionadas por el cliente para datos sensibles, políticas de clave revisadas, rotación activa |
| Secretos | Secrets Manager o Parameter Store cifrado con rotación; nunca en variables de entorno de la definición |
| Backups | AWS Backup con vault bloqueado (inmutable) en cuenta separada |

## Servicios con superficie propia

| Servicio | Riesgo característico | Control |
|---|---|---|
| S3 | Exposición pública; políticas de bucket permisivas; buckets de logs escribibles | Block Public Access, Access Analyzer, políticas explícitas |
| Lambda | Variables de entorno con secretos; rol excesivo; capas de terceros no verificadas | Secretos gestionados, rol por función, revisión de capas |
| API Gateway | Endpoints sin autorizador; CORS abierto | Autorizador obligatorio, throttling, WAF |
| EKS | RBAC y `aws-auth` mal configurados; roles de nodo excesivos | Ver [kubernetes/kubernetes.md](../kubernetes/kubernetes.md); IRSA en vez de rol de nodo |
| ECR | Imágenes públicas; tags mutables | Escaneo, inmutabilidad de tags, firma |
| SSM | Ejecución remota en toda la flota | Restringir `SendCommand` por etiquetas, registrar sesiones |
| RDS | Instancias públicas; snapshots compartidos | Sin acceso público, cifrado, snapshots privados |
| Cognito | Registro abierto; atributos escribibles por el usuario | Verificación, atributos de solo lectura del lado servidor |
| CloudFront / WAF | Origen accesible directamente saltando el WAF | Restringir el origen a la CDN mediante OAC y cabecera secreta |
| STS | Tokens de larga duración | Duración mínima de sesión, revisión de `AssumeRole` |

## Respuesta a un incidente en AWS

1. **No borrar nada.** Aislar la identidad, no el recurso: adjuntar una política de deny explícito a la identidad comprometida y revocar las sesiones activas (política con condición sobre la fecha de emisión del token).
2. Desactivar claves de acceso comprometidas en vez de eliminarlas, para conservar la evidencia.
3. Aislar la instancia mediante un grupo de seguridad sin reglas, conservando la instancia en ejecución hasta obtener el volcado de memoria si procede.
4. Tomar snapshot de los volúmenes EBS para análisis forense.
5. Recolectar CloudTrail del periodo completo — recordando que las llamadas de la cadena pueden estar en otras regiones y cuentas.
6. Enumerar lo que la identidad comprometida podía hacer, no solo lo que hizo: define el alcance real.
7. Rotar todos los secretos accesibles desde esa identidad.
8. Revisar persistencia: usuarios, claves, roles con confianza externa, funciones Lambda, reglas de EventBridge, políticas de recurso modificadas.

Ver [playbooks/cloud.md](../playbooks/cloud.md).
