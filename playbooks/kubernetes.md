---
id: playbooks/kubernetes
tipo: playbook
estabilidad: permanente
---

# Playbook — Incidente en Kubernetes

Base común: [ir_base.md](ir_base.md). Modelo: [kubernetes/kubernetes.md](../kubernetes/kubernetes.md).

Particularidad: el estado es declarativo y **el orquestador recrea lo que se elimina**. Borrar un pod comprometido no contiene nada: el ReplicaSet lo vuelve a crear. Hay que actuar sobre la declaración, no sobre la instancia.

## Señales de entrada

Pod privilegiado o con `hostPath` creado fuera de GitOps; `pods/exec` en producción; lectura masiva de secretos; creación de `clusterrolebinding` o de tokens de ServiceAccount; webhook de admisión nuevo; imagen desde un registro no aprobado; pod contactando con la metadata cloud; consumo de CPU sostenido en pods nuevos; peticiones anónimas aceptadas por el API server.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | **Aislar el pod con una NetworkPolicy que corte todo el tráfico**, sin eliminarlo | Contiene sin destruir evidencia ni disparar la recreación |
| 2 | Escalar a cero el Deployment si es necesario detenerlo | Actuar sobre la declaración, no sobre el pod |
| 3 | `cordon` del nodo afectado | Evita que se programen nuevas cargas; **no drenar todavía** |
| 4 | Revocar el token de la ServiceAccount comprometida | Rotar y forzar la reemisión |
| 5 | Exportar el audit log del API server del periodo completo | Antes de que rote |
| 6 | Revisar y bloquear los cambios de RBAC no legítimos | |
| 7 | Revisar webhooks de admisión, DaemonSets y CronJobs | Persistencia de alto impacto |
| 8 | Comparar el estado del cluster con el repositorio GitOps | Todo lo que difiera es sospechoso |

## Evidencia específica

| Elemento | Qué aporta |
|---|---|
| **Audit log del API server** | Fuente principal: qué identidad hizo qué petición y cuándo |
| Manifiesto del pod (`kubectl get pod -o yaml`) | Configuración: privilegios, montajes, imagen |
| Logs del contenedor | Salida de la aplicación |
| Imagen por digest | Determina si venía comprometida |
| Sistema de archivos del contenedor | Desde el runtime en el nodo |
| Telemetría de runtime (Falco, eBPF) | Lo que el audit log no ve: ejecución, escrituras, conexiones |
| Logs del kubelet en el nodo | Actividad local |
| Estado del nodo y su memoria | Si hubo escape |
| Secretos accesibles desde el namespace | Alcance del compromiso |
| Diferencia contra GitOps | Objetos creados o modificados por el adversario |

## Investigación

1. **¿Cuál fue el vector?** Vulnerabilidad en la aplicación, imagen comprometida, credencial de CI/CD robada, API server o kubelet expuesto, o RBAC excesivo.
2. ¿Qué permisos tenía la ServiceAccount comprometida? Determinar el alcance efectivo, no solo lo usado.
3. ¿Leyeron secretos? En Kubernetes los `Secret` están codificados, no cifrados, salvo que se haya configurado el cifrado en etcd.
4. ¿**Hubo escape al nodo**? Pod privilegiado, `hostPath`, `hostPID`, vulnerabilidad del runtime.
5. Si hubo escape: ¿accedieron a los tokens de **todos** los pods del nodo y a la identidad cloud del nodo?
6. ¿Crearon persistencia? DaemonSets, CronJobs, webhooks de admisión, RoleBindings, cuentas de servicio.
7. ¿Se movieron a otros namespaces o al plano de control?
8. ¿Alcanzaron etcd? Sería el compromiso total del cluster.

## Erradicación

| Paso | Detalle |
|---|---|
| 1 | Cerrar el vector: parchear la aplicación, corregir RBAC, retirar la imagen comprometida |
| 2 | Restaurar el estado desde GitOps y eliminar todo objeto no declarado |
| 3 | Rotar los tokens de ServiceAccount afectados y los secretos accesibles desde el namespace |
| 4 | Eliminar webhooks, DaemonSets, CronJobs y RoleBindings creados por el adversario |
| 5 | **Recrear el nodo si hubo escape**; no limpiarlo |
| 6 | Rotar las credenciales cloud del nodo y las de los pods que alojaba |
| 7 | Reconstruir las imágenes desde código verificado |
| 8 | Revisar el pipeline de CI/CD si el vector fue la cadena de suministro |
| 9 | Si el plano de control estuvo comprometido, considerar la reconstrucción del cluster |

## Recuperación

Reconstruir sobre nodos nuevos y desplegar desde GitOps verificado. Verificar que las políticas de admisión (`restricted`), las NetworkPolicy deny-by-default y el audit log están activos **antes** de reabrir el tráfico. Monitorización reforzada durante semanas, con especial atención a la creación de objetos fuera de GitOps.

## Prevención

| Control | Efecto |
|---|---|
| Pod Security Admission en perfil `restricted` por defecto | Elimina pods privilegiados y montajes de host |
| RBAC mínimo; auditoría de los permisos equivalentes a cluster-admin | Cierra la escalada dentro del cluster |
| `automountServiceAccountToken: false` cuando no se use la API | Elimina el token que el adversario roba primero |
| NetworkPolicy deny-by-default, con bloqueo de la metadata y del plano de control | Corta el movimiento lateral y el robo de credenciales del nodo |
| Cifrado de etcd con KMS y secretos externos | Reduce el valor de comprometer el almacén |
| Verificación de firma de imágenes en admisión | Cierra la cadena de suministro |
| GitOps con reconciliación: el drift es una alerta de seguridad | Detección de persistencia |
| Audit log activo, con política adecuada y enviado fuera del cluster | Sin él la investigación es imposible |
| Telemetría de runtime (Falco o equivalente) | Ve lo que el audit log no ve |
| Identidad federada por pod en vez de identidad de nodo | Limita el impacto de un escape |
