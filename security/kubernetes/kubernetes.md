---
id: kubernetes/kubernetes
tipo: modelo
estabilidad: permanente
---

# Kubernetes

Específico del orquestador. El aislamiento del contenedor está en [containers/containers.md](../containers/containers.md).

## Superficies de ataque

| Superficie | Riesgo | Control |
|---|---|---|
| API server expuesto | Punto de control de todo el cluster | Nunca público sin restricción; acceso por red privada o bastión; autenticación fuerte |
| kubelet (10250) | Ejecución en el nodo si permite acceso anónimo | `--anonymous-auth=false`, autorización por webhook, no exponer |
| etcd (2379/2380) | **Contiene todos los secretos en claro si no está cifrado**; acceso = cluster completo | mTLS, red dedicada, cifrado en reposo, backups cifrados |
| Dashboard | Acceso administrativo por interfaz web | No desplegar; si es imprescindible, con autenticación y RBAC estricto |
| Registro de imágenes | Cadena de suministro | Registro propio, firma, política de admisión |
| Servicios expuestos por error (`type: LoadBalancer`, `NodePort`) | Exposición no intencionada | Política que restrinja los tipos de servicio; revisión de IaC |
| Metadata cloud desde pods | Robo de credenciales del nodo | Bloqueo por política de red; identidad por pod |
| CI/CD con credenciales de cluster | Despliegue arbitrario | OIDC de vida corta, entornos con aprobación |

## RBAC: permisos que equivalen a cluster-admin

Auditar explícitamente quién tiene estos permisos; conceder cualquiera de ellos es conceder el cluster.

| Permiso | Por qué escala |
|---|---|
| `create pods` (sin restricción de política) | Se puede montar `hostPath`, usar `privileged`, montar el token de cualquier ServiceAccount del namespace |
| `create pods/exec`, `pods/attach` | Ejecución dentro de cualquier pod, incluidos los privilegiados |
| `get/list secrets` | Todos los secretos del ámbito, incluidos tokens |
| `create serviceaccounts/token` | Impersonar cualquier ServiceAccount |
| `impersonate` sobre usuarios o grupos | Actuar como cualquier identidad, incluido `system:masters` |
| `escalate` o `bind` en RBAC | Concederse permisos por encima de los propios |
| `create/update` de `mutatingwebhookconfigurations` | Inyectar en todos los pods nuevos |
| `patch nodes` | Manipular el planificador y la programación de cargas |
| `create` de `clusterrolebindings` | Autoconcesión de cluster-admin |
| Acceso a `persistentvolumes` con `hostPath` | Montar el sistema de archivos del nodo |

Errores frecuentes: usar `cluster-admin` "temporalmente"; comodines (`*`) en `verbs`, `resources` o `apiGroups`; conceder permisos a nivel de cluster cuando bastaría un namespace; dejar el `default` ServiceAccount con `automountServiceAccountToken` activo en pods que no llaman a la API.

## Cadena de ataque típica

```
Pod comprometido (vulnerabilidad en la aplicación)
  → Token de ServiceAccount montado en /var/run/secrets/...
  → Enumeración de permisos (kubectl auth can-i --list)
  → Lectura de secretos o creación de pods
  → Pod privilegiado o con hostPath → escape al nodo
  → Credenciales del nodo (kubelet, identidad cloud)
  → Movimiento a otros nodos / al plano de control
  → Impacto: minería, exfiltración, borrado
```

Puntos de corte, en orden de eficacia: no montar el token si no se usa → RBAC mínimo → política de admisión que impida pods privilegiados → política de red que impida alcanzar la metadata y el API server → identidad por pod en vez de identidad de nodo.

## Controles de admisión

| Control | Qué impone |
|---|---|
| **Pod Security Admission** (perfil `restricted`) | Sin privilegios, sin `hostPath`/`hostPID`/`hostNetwork`, usuario no root, `allowPrivilegeEscalation: false`, seccomp `RuntimeDefault`, capabilities descartadas |
| **Políticas a medida** (Kyverno, OPA Gatekeeper) | Registro permitido, firma verificada, etiquetas obligatorias, límites de recursos, prohibición de `latest`, prohibición de `LoadBalancer` |
| **Verificación de firma de imágenes** | Solo se ejecuta lo que se firmó en el pipeline |
| **ValidatingAdmissionPolicy (CEL)** | Reglas nativas sin webhook externo |

Aplicar el perfil `restricted` por defecto en todos los namespaces y documentar cada excepción con propietario y caducidad. Los webhooks de admisión son también un punto de fallo: si el webhook cae y la política es `Fail`, se bloquean los despliegues; si es `Ignore`, se pierde el control. Decidirlo conscientemente.

## Red

| Control | Efecto |
|---|---|
| NetworkPolicy **deny-by-default** por namespace, tanto de entrada como de salida | Sin esto, cualquier pod habla con cualquier pod: la red del cluster es plana por defecto |
| Bloqueo explícito de `169.254.169.254` y del rango del plano de control | Evita el robo de credenciales de nodo desde un pod |
| Egress controlado hacia Internet | Corta C2 y exfiltración |
| mTLS entre servicios (service mesh o mTLS nativo) | Autenticación de carga a carga |
| Separación de nodos por sensibilidad (taints, tolerations, node selectors) | Evita que una carga no confiable comparta nodo con una crítica |
| Ingress con WAF y TLS terminado correctamente | Superficie externa |

## Secretos

Los `Secret` de Kubernetes están **codificados en base64, no cifrados** en la definición. Requisitos mínimos:

1. Cifrado en reposo de etcd con proveedor KMS externo.
2. Acceso a `secrets` restringido por RBAC y auditado.
3. Preferir secretos externos (proveedor de nube, Vault) con inyección por CSI o por operador, para que el material no viva en etcd.
4. Nunca en variables de entorno: aparecen en `describe`, en logs y en volcados. Montar como archivos.
5. Rotación automatizada y tokens proyectados de vida corta con audiencia acotada.
6. Backups de etcd cifrados y con el mismo control de acceso que el cluster.

## Auditoría y detección

Requisito previo: **habilitar el audit log del API server** con una política que registre metadata de todas las peticiones y cuerpo de las sensibles, y enviarlo fuera del cluster.

| Señal | Interpretación |
|---|---|
| `pods/exec` o `pods/attach` en producción | Acceso manual: debería ser excepcional |
| Creación de pod privilegiado, con `hostPath` o con `hostNetwork` | Intento de escape |
| `get`/`list` masivo de `secrets` | Recolección |
| Creación de `clusterrolebinding` o de `serviceaccounts/token` | Escalada o persistencia |
| Creación o modificación de webhooks de admisión | Persistencia de alto impacto |
| Peticiones anónimas (`system:anonymous`) aceptadas | Configuración insegura del API server |
| `kubectl auth can-i --list` desde un pod | Reconocimiento tras compromiso |
| Pod que contacta con la metadata cloud | Robo de credenciales |
| Imagen desde un registro no aprobado | Cadena de suministro |
| DaemonSet o CronJob creado fuera de GitOps | Persistencia |
| Consumo de CPU sostenido en pods nuevos | Criptominería |
| Errores 403 masivos desde una identidad | Enumeración de permisos |

Complemento en tiempo de ejecución: Falco o equivalente basado en eBPF para ver lo que el audit log no ve (ejecución dentro del contenedor, escrituras, conexiones).

## Configuración base de un cluster

| Área | Control |
|---|---|
| API server | Sin acceso anónimo, sin acceso público, autenticación OIDC, audit log activo, `NodeRestriction` habilitado |
| etcd | mTLS, red dedicada, cifrado en reposo con KMS, backups cifrados y probados |
| kubelet | Sin autenticación anónima, autorización por webhook, rotación de certificados, `readOnlyPort` deshabilitado |
| Nodos | Sistema operativo mínimo e inmutable si es posible, parcheo automatizado, sin acceso SSH directo |
| Identidad de carga | Identidad federada por pod (IRSA, Workload Identity, Managed Identity), nunca la identidad del nodo |
| Namespaces | Separación por equipo y entorno, con cuotas, límites y políticas propias |
| GitOps | Todo el estado declarado en repositorio con revisión; el drift es una alerta de seguridad |
| Actualización | Kubernetes tiene un ciclo de soporte corto: planificar la actualización como proceso continuo, no como proyecto |
| Backups | etcd y estado de la aplicación, cifrados, fuera del cluster, con restauración probada |

## Respuesta a un incidente

1. **Aislar sin destruir**: aplicar una NetworkPolicy que corte todo el tráfico del pod; no eliminarlo.
2. Capturar: manifiesto del pod, logs, imagen por digest, sistema de archivos del contenedor, y — si procede — memoria del proceso desde el nodo.
3. Marcar el nodo (`cordon`) para evitar nuevas cargas; no drenarlo hasta haber recogido evidencia.
4. Revisar el audit log del periodo completo: qué hizo el token comprometido, no solo qué se detectó.
5. Rotar el ServiceAccount afectado, los secretos accesibles desde él y las credenciales del nodo si hubo escape.
6. Buscar persistencia: DaemonSets, CronJobs, webhooks, RoleBindings, imágenes alteradas, contenedores lanzados fuera del orquestador.
7. Reconstruir el nodo si hubo escape confirmado: un nodo comprometido no se limpia.

Ver [playbooks/kubernetes.md](../playbooks/kubernetes.md).
