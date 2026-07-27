---
id: hardening/hardening
tipo: modelo
estabilidad: permanente
---

# Hardening

Reducción de superficie y endurecimiento por plataforma. Los detalles concretos viven en cada módulo; aquí está el **orden de prioridad** y lo que no está cubierto en otro sitio.

## Principios

1. **Reducir antes que configurar.** Un servicio desinstalado no necesita hardening ni parcheo.
2. **Seguro por defecto.** El estado inicial debe ser el restrictivo; la excepción se solicita y se documenta.
3. **Un cambio, una justificación.** Baselines aplicados sin entender qué rompen se revierten al primer incidente operativo.
4. **Verificable.** Un control que no se puede comprobar automáticamente se degrada en meses.
5. **Reproducible.** Configuración como código, no ajustes manuales.
6. **Medido.** Desviación respecto al baseline como métrica continua, no como auditoría anual.

## Los diez controles de mayor impacto

Válidos para la mayoría de organizaciones, ordenados por reducción de riesgo real frente a coste.

| # | Control | Qué elimina |
|---|---|---|
| 1 | **MFA resistente a phishing** en todo acceso externo y privilegiado | El vector de acceso inicial dominante |
| 2 | **Backups inmutables, offline y probados** | La consecuencia catastrófica del ransomware |
| 3 | **Parcheo priorizado por KEV en dispositivos de borde** | El segundo vector de acceso inicial |
| 4 | **Usuarios sin privilegios de administrador local** | La base de casi toda cadena de escalada |
| 5 | **LAPS** o equivalente | El movimiento lateral con credenciales locales reutilizadas |
| 6 | **Firewall de host bloqueando SMB/RPC/RDP entre estaciones** | La mayor parte del movimiento lateral en redes planas |
| 7 | **Bloqueo de macros de Internet y reglas ASR** | El vector de documento más explotado |
| 8 | **Egress denegado por defecto en servidores** | El canal de C2 en la parte crítica de la red |
| 9 | **Credential Guard y LSA Protection** | El volcado de LSASS |
| 10 | **Tiering administrativo con estaciones dedicadas** | La escalada de estación comprometida a Domain Admin |

Ninguno requiere comprar un producto nuevo en la mayoría de los entornos. Esa es exactamente la razón por la que se posponen.

## Baselines de referencia

| Fuente | Alcance | Nota |
|---|---|---|
| CIS Benchmarks | La mayoría de plataformas, con dos niveles de rigor | El más completo; verificar cada punto contra el uso real |
| Microsoft Security Baselines | Windows y Microsoft 365 | Distribuibles por GPO o Intune |
| DISA STIG | Entornos con requisitos estrictos | Muy restrictivo; útil como referencia superior |
| NIST SP 800-123 / 800-190 | Servidores y contenedores | Guía, no checklist |
| Guías del fabricante | Appliances y productos concretos | Fuente autoritativa para su producto |

Aplicación correcta: partir del baseline, evaluar cada desviación necesaria, documentarla con propietario y fecha de revisión, y automatizar la verificación continua del resto.

## Por plataforma

| Plataforma | Módulo con el detalle |
|---|---|
| Windows | [windows/windows.md](../windows/windows.md) |
| Linux | [linux/linux.md](../linux/linux.md) |
| Active Directory | [active_directory/active_directory.md](../active_directory/active_directory.md) |
| Bases de datos | [databases/databases.md](../databases/databases.md) |
| AWS / Azure / GCP | [cloud/cloud.md](../cloud/cloud.md) y los módulos por proveedor |
| Contenedores y Kubernetes | [containers/containers.md](../containers/containers.md), [kubernetes/kubernetes.md](../kubernetes/kubernetes.md) |
| Virtualización | [vmware/vmware.md](../vmware/vmware.md), [hyperv/hyperv.md](../hyperv/hyperv.md) |
| Red y perímetro | [firewalls/firewalls.md](../firewalls/firewalls.md), [vpn/vpn.md](../vpn/vpn.md) |
| Aplicaciones | [web/web.md](../web/web.md), [owasp_api.md](../owasp_api.md) |
| Móvil | [mobile/mobile.md](../mobile/mobile.md) |
| Sistemas de IA | [ai/ai.md](../ai/ai.md) |

## Correo: el hardening más rentable que se olvida

| Control | Efecto |
|---|---|
| SPF, DKIM y **DMARC en `p=reject`** | Impide la suplantación del propio dominio. La mayoría se queda en `p=none` y no protege nada |
| Bloqueo de tipos de adjunto ejecutables y de contenedores (`.iso`, `.img`, `.vhd`, `.lnk`) | Corta vectores de entrega y el bypass de MOTW |
| Cuarentena de archivos cifrados con contraseña | Evade el escaneo por diseño |
| Reescritura y análisis de URLs en el momento del clic | El enlace puede armarse después de la entrega |
| Bloqueo de reenvío automático externo | Corta la exfiltración persistente y el BEC |
| Alerta sobre reglas de buzón nuevas | Persistencia habitual tras el compromiso de cuenta |
| Marcado visible de correo externo | Reduce la suplantación de compañeros |
| Verificación fuera de banda para cambios de datos bancarios | El único control que detiene el fraude de transferencia |

## Estaciones de trabajo

| Control | Nota |
|---|---|
| Usuario sin privilegios administrativos | Con proceso de elevación puntual para lo que lo requiera |
| Cifrado de disco con TPM y PIN | Protege ante robo y acceso físico |
| Application control en modo bloqueo | El control más potente y el más costoso de implantar |
| Reglas ASR en bloqueo | Alta relación beneficio/coste |
| Actualización automática de sistema operativo y aplicaciones | El navegador y sus complementos son la superficie principal |
| EDR con protección antimanipulación | Y verificación de que el agente sigue vivo |
| Navegador gestionado por política | Extensiones controladas, sin guardado de contraseñas |
| Sin acceso administrativo a servidores desde la estación diaria | Base del tiering |

## OT / ICS

Prioridad invertida: la disponibilidad y la seguridad física preceden a la confidencialidad. Parchear puede ser inaceptable; el control real es la arquitectura.

| Control | Motivo |
|---|---|
| Segmentación según el modelo Purdue, con diodo de datos o zona desmilitarizada industrial entre TI y OT | Elimina la ruta directa desde la red corporativa |
| Ningún acceso directo desde TI a la red de control | El pivote TI→OT es la vía habitual |
| Acceso remoto de proveedores mediado y supervisado, con activación bajo demanda | Vector recurrente de intrusión |
| Sistema instrumentado de seguridad (SIS) aislado físicamente | Su compromiso implica riesgo para las personas |
| Inventario de activos por medios pasivos | El escaneo activo puede tumbar equipos industriales |
| Monitorización pasiva de protocolos industriales | Detección sin riesgo operativo |
| Control de cambios sobre la lógica de los controladores | Detecta manipulación del proceso |
| Copias de la lógica y de la configuración, verificadas | Recuperación tras manipulación o destrucción |
| Gestión de medios extraíbles con estación de descontaminación | Vía de entrada clásica en redes aisladas |

## Verificación continua

| Método | Qué comprueba |
|---|---|
| Escaneo de configuración contra el baseline | Desviaciones acumuladas |
| Detección de drift respecto a la infraestructura como código | Cambios manuales no aprobados |
| Escaneo de vulnerabilidades autenticado | Estado real de parcheo |
| Gestión de superficie externa | Qué ve realmente un atacante desde fuera |
| Simulación de adversario (Atomic Red Team, Caldera) | Si los controles bloquean lo que dicen bloquear |
| Purple team | Cobertura real de prevención y detección |
| Pentesting | Encadenamiento de debilidades que un escáner no ve |

Diferencia importante: un escáner dice que el control **está configurado**; una simulación dice que el control **funciona**. Solo lo segundo es evidencia.

## Gestión de excepciones

Toda excepción documenta: qué control se omite, por qué, qué mitigación compensatoria existe, quién es el propietario y **cuándo se revisa**. Sin fecha de revisión, una excepción es deuda permanente y silenciosa. El inventario de excepciones vigentes es, en la práctica, el mapa de la superficie de ataque aceptada por la organización.
