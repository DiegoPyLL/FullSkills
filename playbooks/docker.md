---
id: playbooks/docker
tipo: playbook
estabilidad: permanente
---

# Playbook — Incidente en Docker

Base común: [ir_base.md](ir_base.md). Modelo: [docker/docker.md](../docker/docker.md) y [containers/containers.md](../containers/containers.md).

Error específico de este escenario: **eliminar el contenedor destruye casi toda la evidencia**. Un contenedor es efímero por diseño; hay que preservarlo antes de actuar.

## Señales de entrada

Contenedor con consumo sostenido de CPU (minería); proceso ejecutándose dentro de un contenedor que no forma parte de su imagen; escritura en un sistema de archivos que debería ser de solo lectura; contenedor lanzado fuera del proceso de despliegue; imagen de un registro no aprobado; puerto 2375 o 2376 abierto; acceso a la metadata cloud desde un contenedor; `docker exec` en producción.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | **No eliminar el contenedor** | `docker rm` destruye la evidencia |
| 2 | Desconectar el contenedor de la red o pausarlo | `docker network disconnect` o `docker pause` conservan el estado |
| 3 | Preservar: `docker inspect`, `docker logs`, `docker diff`, `docker export` | Configuración, salida, cambios en el sistema de archivos y contenido |
| 4 | Capturar la memoria del proceso desde el host | Si el caso lo justifica |
| 5 | Verificar si el daemon está expuesto por TCP | De ser así, cerrarlo de inmediato |
| 6 | Evaluar si hubo escape al host | Determina si el incidente es del contenedor o del servidor |
| 7 | Revisar el resto de contenedores del mismo host y de la misma imagen | Rara vez es uno solo |
| 8 | Rotar los secretos accesibles desde el contenedor | Variables de entorno, volúmenes montados, credenciales de la aplicación |

## Evidencia específica

| Comando o fuente | Qué aporta |
|---|---|
| `docker inspect <id>` | Configuración completa: montajes, capabilities, red, variables de entorno |
| `docker logs <id>` | Salida estándar del proceso principal |
| `docker diff <id>` | **Archivos añadidos, modificados o borrados respecto a la imagen**: revela lo que trajo el adversario |
| `docker export <id>` | Sistema de archivos completo para análisis offline |
| Imagen por digest | Determina si la imagen ya venía comprometida |
| Logs del daemon en el host | Contenedores creados, ejecuciones, cambios |
| auditd del host | Ejecuciones, montajes, accesos al socket |
| Telemetría de runtime (Falco, eBPF) | Llamadas al sistema, escrituras, conexiones |
| Flujos de red del host | C2, minería, exfiltración |

`docker diff` es la herramienta más infravalorada en este escenario: muestra en segundos todo lo que difiere de la imagen original.

## Investigación

1. **¿Cuál fue el vector?** Vulnerabilidad en la aplicación del contenedor, imagen comprometida, daemon expuesto, credencial de registro robada, o `Dockerfile` malicioso construido en el host.
2. ¿El contenedor tenía configuración insegura? `--privileged`, socket montado, `hostPath`, capabilities excesivas.
3. ¿**Hubo escape al host**? Buscar accesos a rutas del host, montajes nuevos, procesos del adversario fuera del namespace del contenedor.
4. ¿Qué secretos eran accesibles desde el contenedor?
5. ¿Alcanzó la metadata cloud? Si sí, las credenciales del nodo están comprometidas.
6. ¿Se movió a otros contenedores? La red por defecto de Docker permite comunicación entre todos ellos.
7. ¿La imagen procede del registro aprobado y coincide con el digest esperado?

## Erradicación

- Cerrar el vector: parchear la aplicación, corregir la configuración del contenedor, cerrar el daemon expuesto o retirar la imagen comprometida del registro.
- Reconstruir la imagen desde el código fuente verificado y volver a desplegar; no "limpiar" el contenedor.
- **Si hubo escape: reconstruir el host completo.** Un host con root comprometido no se limpia.
- Rotar todos los secretos accesibles desde el contenedor y desde el host: credenciales de la aplicación, tokens del registro, credenciales de nube del nodo.
- Revisar y corregir la configuración de todos los contenedores del entorno con los mismos defectos.
- Revisar el pipeline de build si la imagen estaba comprometida en origen.

## Prevención

| Control | Efecto |
|---|---|
| Daemon nunca expuesto por TCP; grupo `docker` tratado como equivalente a root | Cierra el acceso directo al control del host |
| Contenedores con usuario no root, `--read-only`, `--cap-drop ALL`, `no-new-privileges`, seccomp | Elimina la mayoría de las vías de escape |
| Modo rootless o Podman | Un escape ya no otorga root del host |
| Imágenes por digest desde un registro propio, firmadas y escaneadas | Cierra la cadena de suministro |
| Secretos como archivos efímeros, nunca como variables de entorno | Deja de exponerlos en `inspect` y en logs |
| Redes segmentadas por aplicación, con `icc=false` | Limita el movimiento entre contenedores |
| Bloqueo del acceso a la metadata cloud | Impide el robo de credenciales del nodo |
| Telemetría de runtime con alerta sobre shell y binarios ajenos a la imagen | Detección temprana y precisa |
| Verificación real de la exposición de puertos desde fuera | Docker puede saltarse las reglas del firewall del host |
