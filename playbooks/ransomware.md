---
id: playbooks/ransomware
tipo: playbook
estabilidad: permanente
---

# Playbook — Ransomware

Base común obligatoria: [ir_base.md](ir_base.md). Contexto del adversario: [ransomware/ransomware.md](../ransomware/ransomware.md).

## Señales de entrada

Nota de rescate; archivos renombrados en masa; servicios caídos simultáneamente; alertas de borrado de copias de sombra; parada masiva de servicios; VM apagadas en bloque; aviso de un tercero.

## Primeros 60 minutos

| # | Acción | Detalle |
|---|---|---|
| 1 | **Activar canal fuera de banda** | Asumir correo y chat corporativos comprometidos |
| 2 | **Aislar en bloque, no por partes** | Cortar segmentos completos si es necesario; **no apagar** los sistemas |
| 3 | **Proteger los backups antes que nada** | Desconectarlos de la red y verificar su integridad. Si el adversario aún no los alcanzó, esta acción decide el desenlace |
| 4 | Bloquear el acceso remoto y la VPN | Corta la reentrada |
| 5 | Deshabilitar cuentas privilegiadas comprometidas y **revocar sus sesiones** | Desactivar sin revocar no corta el acceso |
| 6 | Congelar cambios y despliegues | GPO, herramientas de despliegue, RMM |
| 7 | Preservar memoria de al menos un host cifrado y de uno no cifrado | La clave puede residir en memoria; el host limpio muestra la fase previa |
| 8 | Notificar a dirección, legal y aseguradora | Los plazos contractuales corren desde el conocimiento |
| 9 | Registrar todo con hora y responsable | Desde el minuto uno |

**No hacer**: apagar equipos, reinstalar antes de recolectar, restaurar antes de erradicar, pagar sin decisión formal, comunicar por los canales comprometidos.

## Evidencia específica

| Elemento | Motivo |
|---|---|
| Nota de rescate y extensión de los archivos cifrados | Identifica la familia y posibles descifradores públicos |
| Muestra del cifrador si está disponible | Análisis y detección |
| Memoria de un host afectado | Claves, procesos, conexiones |
| Muestra de archivos cifrados de tamaños distintos | Determina si el cifrado es parcial |
| Logs del servidor de backup | Determina si accedieron y qué destruyeron |
| Logs de los DC y de la herramienta de despliegue | Ruta de distribución |
| Logs de firewall y proxy de las semanas previas | **Alcance de la exfiltración**, que define las obligaciones legales |
| Logs del hipervisor | Si el cifrado fue a nivel de datastore |

## Preguntas de la investigación

1. ¿Cuál fue el vector inicial y hace cuánto tiempo entraron? (Habitualmente días o semanas antes del cifrado.)
2. ¿Cómo se distribuyó el cifrador: GPO, PsExec, herramienta de despliegue, hipervisor?
3. ¿Qué credenciales obtuvieron? ¿Llegaron a Domain Admin?
4. ¿**Hubo exfiltración**, qué datos y qué volumen? Se determina con logs propios, no con la lista del atacante.
5. ¿Qué backups quedan intactos y hasta qué fecha son limpios?
6. ¿Qué persistencias dejaron para volver?
7. ¿Están afectados terceros o clientes?

## Erradicación

Además de lo indicado en [ir_base.md](ir_base.md#fase-5--erradicacion):

- Rotación **completa** de credenciales del dominio, incluido el doble reset de `krbtgt`, cuentas de servicio, cuentas locales y credenciales de aplicaciones.
- Revisión de GPO, tareas en los DC, delegaciones y ACL modificadas.
- Reconstrucción de todo sistema con compromiso administrativo confirmado.
- Cierre verificado del vector inicial antes de reconectar.
- Revisión del entorno de virtualización y de la infraestructura de backup, que suelen ser objetivo directo.

## Recuperación

| Paso | Criterio |
|---|---|
| Reconstruir primero el plano de identidad | Restaurar servicios sobre un AD comprometido no tiene sentido |
| Restaurar por orden de criticidad de negocio | Con lista priorizada acordada con negocio, no con TI en solitario |
| Restaurar sobre infraestructura limpia | Nunca sobre los sistemas comprometidos |
| Verificar cada sistema restaurado antes de reconectarlo | Integridad y ausencia de persistencia |
| Monitorización reforzada durante semanas | El retorno del adversario está documentado |
| Comprobar si existe descifrador público para la familia | Antes de cualquier negociación |

## Decisión sobre el pago

Es una decisión de negocio, legal y ética, no técnica. El equipo técnico debe aportar: estado real y verificado de los backups, alcance del cifrado, alcance de la exfiltración, estimación de tiempo de recuperación por vía propia, y existencia o no de descifrador público. Las restricciones legales (incluidas posibles sanciones asociadas al grupo) requieren asesoría jurídica específica que este análisis no sustituye. Ver [ransomware/ransomware.md](../ransomware/ransomware.md#sobre-el-pago).

## Prevención posterior

Prioridades tras un incidente de ransomware, en este orden: backups inmutables y offline con restauración probada; MFA resistente a phishing en todo acceso remoto y privilegiado; segmentación de red y de identidad; tiering administrativo y LAPS; respuesta automatizada ante las señales de preparación de impacto; y detección específica de las técnicas observadas en este incidente.
