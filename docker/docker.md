---
id: docker/docker
tipo: modelo
estabilidad: permanente
---

# Docker

Específico del motor y del flujo de trabajo de Docker. El modelo de aislamiento y los escapes están en [containers/containers.md](../containers/containers.md).

## El daemon es la superficie crítica

El daemon de Docker corre como **root** en el host. Todo lo que pueda hablar con él tiene, en la práctica, control total del host.

| Vía de acceso al daemon | Riesgo | Control |
|---|---|---|
| Pertenencia al grupo `docker` | Equivale a root: `docker run -v /:/host --privileged` da el host en un comando | Tratar el grupo `docker` como equivalente a `sudo` sin contraseña; no otorgarlo casualmente |
| Socket `/var/run/docker.sock` montado en un contenedor | Escape inmediato | No montarlo; si un agente lo requiere, aislarlo y considerar un proxy con filtro de API |
| API TCP expuesta (2375 sin TLS) | **RCE remoto sin autenticación**; escaneada masivamente en Internet | Nunca exponer; si se necesita acceso remoto, mTLS con certificados de cliente o túnel SSH |
| API TCP con TLS pero sin verificación de cliente | Acceso de cualquiera que alcance el puerto | `--tlsverify` con CA propia |

Regla operativa: en un servidor con Docker, **la lista de miembros del grupo `docker` es una lista de administradores del sistema**. Auditarla como tal.

## Alternativas que reducen el riesgo estructural

| Opción | Ventaja | Coste |
|---|---|---|
| **Rootless mode** | El daemon corre como usuario sin privilegios; un escape no da root del host | Limitaciones con puertos bajos, algunos sistemas de archivos y redes |
| **Podman** | Sin daemon, rootless por defecto, compatible con la CLI de Docker | Diferencias de comportamiento puntuales |
| **User namespaces** (`userns-remap`) | Root del contenedor mapeado a un UID sin privilegios | Complica volúmenes compartidos |
| **containerd/CRI directo** | Menos superficie que el motor completo | Menos ergonomía para desarrollo |

## Configuración del daemon

`/etc/docker/daemon.json` con al menos:

| Ajuste | Valor | Motivo |
|---|---|---|
| `icc` | `false` | Deshabilita la comunicación libre entre todos los contenedores de la red por defecto |
| `no-new-privileges` | `true` | Anula SUID dentro de los contenedores |
| `userns-remap` | `default` | Rompe la equivalencia root-contenedor / root-host |
| `live-restore` | `true` | Los contenedores sobreviven al reinicio del daemon |
| `userland-proxy` | `false` | Reduce superficie de red |
| `log-driver` y límites de rotación | Definidos | Evita llenar el disco y conserva evidencia |
| `default-ulimits` | Definidos | Evita agotamiento de recursos |
| Auditoría | Reglas de auditd sobre `/usr/bin/dockerd`, `/var/lib/docker`, `/etc/docker`, el socket | Telemetría mínima |

## Ejecución segura de un contenedor

```
docker run \
  --user 10001:10001 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --security-opt seccomp=/ruta/perfil.json \
  --security-opt apparmor=perfil \
  --pids-limit 200 \
  --memory 512m --cpus 1 \
  --network app-net \
  imagen@sha256:...
```

Puntos que importan más de lo que parece: referenciar la imagen **por digest** (no por tag), `--read-only` con `tmpfs` explícito, y `--cap-drop ALL` antes de añadir lo estrictamente necesario.

Banderas prohibidas en producción: `--privileged`, `--pid=host`, `--net=host`, `--ipc=host`, `-v /var/run/docker.sock`, `-v /:/host`, `--cap-add SYS_ADMIN`, `--security-opt seccomp=unconfined`.

## Dockerfile: errores frecuentes

| Error | Consecuencia | Corrección |
|---|---|---|
| Ejecutar como root | Escalada trivial tras una RCE en la aplicación | `USER` con UID numérico no root |
| Secretos en `ARG`, `ENV` o en una capa | Quedan en el historial de la imagen aunque se borren después | Secretos de build (`--mount=type=secret`), nunca en capas |
| `FROM imagen:latest` | Build no reproducible; base cambiante | Fijar por digest |
| `ADD` con URL remota | Descarga sin verificación de integridad | `COPY` local, o descarga con verificación de hash |
| `curl \| sh` en el build | Ejecución de código no verificado | Descargar, verificar hash, ejecutar |
| Imagen con shell, compiladores y herramientas de red | Post-explotación cómoda para el atacante | Build multi-etapa, imagen final distroless |
| `chmod 777` en directorios | Escritura por cualquier proceso | Permisos mínimos |
| Sin `HEALTHCHECK` ni límites | Contenedor zombi indetectable | Definirlos |
| Copiar todo el contexto (`COPY . .`) | `.git`, `.env` y claves acaban en la imagen | `.dockerignore` estricto |

## Redes

| Riesgo | Control |
|---|---|
| Red `bridge` por defecto con comunicación libre entre contenedores | `icc=false` y redes definidas por aplicación |
| Publicación de puertos en `0.0.0.0` | Vincular a `127.0.0.1` cuando el acceso deba ser local; usar un proxy delante |
| Reglas de Docker que **saltan** el firewall del host | Docker escribe sus propias reglas de iptables: `ufw` o `firewalld` pueden no aplicarse a los puertos publicados. Verificar explícitamente la exposición real con un escaneo externo |
| Acceso a la metadata cloud desde contenedores | Bloquear `169.254.169.254` por regla de red |
| DNS interno para descubrimiento | Aceptable, pero implica que un contenedor comprometido enumera los demás: complementar con políticas de red |

## Detección y respuesta

| Señal | Interpretación |
|---|---|
| Contenedor creado con `--privileged` o con el socket montado | Escape en preparación o mala práctica grave |
| Contenedor lanzado fuera del proceso de despliegue | Persistencia del atacante |
| Imagen procedente de un registro no aprobado | Cadena de suministro comprometida |
| `docker exec` en producción | Acceso manual: debería ser excepcional y auditado |
| Puerto 2375/2376 abierto | Exposición crítica del daemon |
| Contenedor con consumo sostenido de CPU | Criptominería |
| Cambios en `/etc/docker/daemon.json` o en el socket | Manipulación del entorno |

Respuesta: **no borrar el contenedor**. Pausar o desconectar de la red, exportar el sistema de archivos (`docker export`) y los logs (`docker logs`), inspeccionar la configuración (`docker inspect`), capturar la memoria del proceso desde el host y conservar la imagen por digest. Eliminar el contenedor destruye la mayor parte de la evidencia. Ver [playbooks/docker.md](../playbooks/docker.md).

## Docker Compose

| Riesgo | Control |
|---|---|
| Secretos en `environment` o en el propio `docker-compose.yml` versionado | Usar `secrets` con archivos externos; nunca commitear credenciales |
| `privileged: true` o montaje del socket en algún servicio | Revisión obligatoria en el pull request |
| Puertos publicados sin restricción de interfaz | Especificar `127.0.0.1:puerto:puerto` |
| Imágenes por tag mutable | Fijar por digest |
| Ausencia de límites de recursos | Definir `deploy.resources` o `mem_limit`/`cpus` |
| Red por defecto compartida entre todos los servicios | Redes segmentadas por función |
