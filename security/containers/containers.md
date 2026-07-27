---
id: containers/containers
tipo: modelo
estabilidad: permanente
---

# Contenedores — modelo de aislamiento y escapes

Independiente del runtime. Lo específico de Docker está en [docker/docker.md](../docker/docker.md) y lo del orquestador en [kubernetes/kubernetes.md](../kubernetes/kubernetes.md).

## Premisa fundamental

**Un contenedor no es una máquina virtual.** Comparte el kernel del host. El aislamiento lo dan namespaces (vista), cgroups (recursos), capabilities (privilegio), seccomp (llamadas al sistema) y LSM (acceso obligatorio). Si alguno de esos mecanismos se relaja o falla, el contenedor es un proceso más del host.

Corolario de diseño: **no confiar el aislamiento de cargas hostiles únicamente a los contenedores**. Para multi-inquilino real o para ejecutar código no confiable se usa una frontera de máquina virtual (Kata, Firecracker, gVisor, nodos dedicados).

## Vías de escape, por causa

| Vía | Precondición | Por qué funciona | Prevención |
|---|---|---|---|
| Contenedor privilegiado | `--privileged` | Todas las capabilities, acceso a dispositivos, sin seccomp: escape trivial montando el disco del host | Prohibirlo por política de admisión |
| Socket del runtime montado | `/var/run/docker.sock` o el socket de containerd dentro del contenedor | Permite crear otro contenedor privilegiado: equivale a root en el host | No montarlo nunca; si un agente lo necesita, aislarlo en un nodo dedicado |
| `hostPID` | Compartir el espacio de PID del host | Ver y manipular procesos del host, incluida su memoria | Prohibir |
| `hostNetwork` | Compartir la red del host | Acceso a servicios en `localhost` del nodo, incluida la metadata cloud | Prohibir salvo componentes de infraestructura |
| `hostPath` a rutas sensibles | Montar `/`, `/etc`, `/var/lib/kubelet`, `/proc` | Escritura en el host = root | Prohibir montajes de host; permitir solo rutas concretas de solo lectura |
| `CAP_SYS_ADMIN` | Capability concedida | Habilita montar sistemas de archivos, abusar de cgroups y de `/proc` | Retirar todas las capabilities y añadir solo las necesarias |
| `CAP_SYS_MODULE` | Capability concedida | Cargar un módulo de kernel | Prohibir |
| `CAP_SYS_PTRACE` + `hostPID` | Capabilities y namespace | Inyección en procesos del host | Prohibir |
| `CAP_DAC_READ_SEARCH` | Capability concedida | Lectura arbitraria del sistema de archivos del host (patrón Shocker) | Prohibir |
| `release_agent` de cgroups v1 | `CAP_SYS_ADMIN` y cgroups v1 | Ejecuta un binario como root en el host al vaciarse un cgroup | Migrar a cgroups v2, retirar la capability |
| `core_pattern` de `/proc/sys` | `/proc` del host montado como escribible | Ejecuta un binario del host ante un core dump | No montar `/proc` del host |
| Vulnerabilidad del runtime | runc, containerd o el motor sin parchear | Fuga de descriptores, condiciones de carrera, symlinks | Parcheo; ver fichas en [cve_database.md](../cve_database.md) |
| Vulnerabilidad del kernel | Kernel compartido sin parchear | El contenedor solo aísla dentro de las reglas del kernel | Parcheo, seccomp estricto, sandbox de kernel (gVisor) |
| Escritura en el sistema de archivos del nodo vía volumen | Volumen mal delimitado, symlink | Modificación de binarios o de configuración del nodo | Volúmenes de solo lectura, `subPath` validado |
| Imagen o build malicioso | Se construye o ejecuta contenido no confiable | Ejecuta con los permisos del constructor | Builders sin privilegios (Kaniko, Buildah rootless), nodos separados |

## Configuración segura de un contenedor

| Ajuste | Valor | Efecto |
|---|---|---|
| Usuario | UID no root, explícito en la imagen y en el manifiesto | Elimina una clase entera de escapes |
| `readOnlyRootFilesystem` | `true` | Impide plantar binarios; obliga a declarar los volúmenes escribibles |
| `allowPrivilegeEscalation` | `false` (`no-new-privileges`) | Anula el efecto de binarios SUID dentro del contenedor |
| Capabilities | `drop: ALL`, añadir solo lo imprescindible | Reduce el privilegio al mínimo |
| seccomp | Perfil `RuntimeDefault` como mínimo; a medida si es posible | Recorta la superficie del kernel drásticamente |
| AppArmor o SELinux | Perfil activo | Contención aunque haya root dentro |
| User namespaces | Habilitados (root del contenedor mapeado a un UID sin privilegios en el host) | Rompe la equivalencia root-en-contenedor = root-en-host |
| Límites de recursos | CPU, memoria, PID, almacenamiento efímero | Evita DoS del nodo por un solo contenedor |
| Red | Sin `hostNetwork`; políticas de red deny-by-default | Limita movimiento lateral |
| Metadata cloud | Bloqueada desde el contenedor | Evita el robo de credenciales del nodo |
| Secretos | Montados como archivos efímeros, no como variables de entorno | Las variables aparecen en `inspect`, en logs y en volcados |
| Sistema de archivos temporal | `noexec` donde sea viable | Impide ejecutar lo descargado |

## Seguridad de la imagen

| Práctica | Motivo |
|---|---|
| Imagen base mínima (distroless, `scratch`, Alpine cuando aplique) | Menos paquetes = menos CVEs y menos herramientas para el atacante |
| Sin shell ni gestor de paquetes en producción | Elimina la post-explotación cómoda |
| Compilación multi-etapa | Deja fuera compiladores y dependencias de build |
| Etiquetas inmutables y referencia por digest | Evita que cambie el contenido bajo el mismo tag |
| Firma y verificación (cosign / Sigstore) | Garantiza procedencia |
| SBOM por imagen | Permite responder "¿me afecta este CVE?" en minutos |
| Escaneo continuo, no solo en el build | Los CVEs aparecen después de publicar la imagen |
| Sin secretos en capas | Una capa borrada sigue en el historial de la imagen |
| Reconstrucción periódica | Una imagen "estable" acumula vulnerabilidades del sistema base |
| Registro propio con control de acceso | Evita depender de registros públicos y del `latest` mutable |

## Detección en tiempo de ejecución

| Señal | Interpretación |
|---|---|
| Shell interactivo dentro de un contenedor de producción | Casi nunca legítimo: alerta directa |
| Ejecución de un binario que no forma parte de la imagen | Herramienta descargada por el atacante |
| Escritura en el sistema de archivos raíz cuando debería ser de solo lectura | Compromiso |
| Acceso a rutas del host (`/proc`, `/host`, `/var/lib/kubelet`) | Intento de escape |
| Contacto con la metadata cloud desde un contenedor | Robo de credenciales |
| Cambio de UID a 0 dentro del contenedor | Escalada |
| Carga de módulo de kernel o `mount` desde un contenedor | Escape en curso |
| Conexión saliente a destinos no declarados | C2 o exfiltración |
| Proceso de minería o consumo sostenido de CPU | Secuestro de recursos |
| Contenedor lanzado fuera del orquestador | Persistencia del atacante |

Herramientas: Falco y agentes basados en eBPF proporcionan esta telemetría con bajo coste. Sin visibilidad de sistema de archivos y de llamadas al sistema por contenedor, la detección se limita a la red.

## Cadena de suministro de contenedores

Riesgo específico: la imagen es un artefacto binario que se despliega miles de veces. Controles, en orden de valor:

1. **Registro propio** con imágenes revisadas; prohibir el despliegue desde registros arbitrarios mediante política de admisión.
2. **Firma y verificación obligatoria** en el momento del despliegue, no solo en el build.
3. **Builds reproducibles** y procedencia (SLSA) para poder demostrar de qué código salió el binario.
4. **Escaneo con umbral de bloqueo** definido y aplicado; un escaneo cuyo resultado nunca bloquea nada no es un control.
5. **Rotación de imágenes base** planificada.
6. **Aislamiento del entorno de build**: quien controla el build controla todo lo que se despliega. Runners efímeros, sin credenciales de producción.

## Cuándo el contenedor no basta

| Escenario | Frontera necesaria |
|---|---|
| Ejecutar código de clientes o de terceros | MicroVM (Kata, Firecracker) o gVisor |
| Multi-inquilino con separación regulatoria | Clusters o cuentas separadas |
| Cargas con datos de distinta clasificación | Nodos dedicados por clasificación |
| Ejecución de artefactos de build no confiables | Nodos efímeros y aislados de la red interna |
| Requisito de cumplimiento estricto | Aislamiento a nivel de máquina virtual, documentado |
