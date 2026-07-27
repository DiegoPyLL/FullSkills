---
id: playbooks/firewalls
tipo: playbook
estabilidad: permanente
---

# Playbook — Compromiso de firewall o dispositivo de red

Base común: [ir_base.md](ir_base.md). Modelo: [firewalls/firewalls.md](../firewalls/firewalls.md).

Particularidad: estos dispositivos **no tienen EDR, tienen logs limitados y su forense es difícil**. Además, un firewall comprometido ve y puede alterar todo el tráfico que lo atraviesa, incluida la propia telemetría de seguridad.

## Señales de entrada

CVE crítico para el modelo y versión en uso; regla nueva que abre un servicio al exterior; cuenta administrativa nueva; cambios de configuración fuera de la ventana de cambios; autenticación administrativa desde origen inusual; tráfico anómalo originado por el propio dispositivo; comportamiento errático o reinicios; aviso del fabricante o de un CERT.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | **Preservar la configuración y los logs antes de tocar nada** | Se pierden con el reinicio o el reemplazo |
| 2 | Cortar el acceso de administración desde cualquier origen no imprescindible | |
| 3 | Evaluar si el dispositivo puede seguir en línea | Si es el único perímetro, sustituirlo tiene impacto operativo: planificar |
| 4 | Comparar la configuración actual con la última copia aprobada | Revela los cambios del adversario |
| 5 | Revertir las reglas y objetos añadidos | Solo después de documentarlos |
| 6 | Rotar todas las credenciales del dispositivo, claves API, secretos SNMP, claves precompartidas y certificados | |
| 7 | Revisar los túneles VPN y las sesiones activas | Ver [vpn.md](vpn.md) si el equipo también hace de gateway |
| 8 | Buscar actividad interna derivada | El dispositivo es la puerta, no el destino |

## Evidencia específica

| Elemento | Qué aporta |
|---|---|
| Configuración completa exportada | Reglas, cuentas, rutas, túneles añadidos |
| Diferencia contra la copia aprobada | Lo que cambió y cuándo |
| Logs del sistema y de administración | Accesos, comandos, cambios |
| Logs de tráfico del periodo | Qué permitió pasar el adversario |
| Cuentas locales y claves SSH autorizadas | Persistencia |
| Versión de firmware y su integridad | Implante persistente |
| Logs del servidor de autenticación (RADIUS, TACACS, AD) | Autenticaciones administrativas |
| Copias de configuración automáticas | Línea de tiempo de los cambios |

Si el dispositivo reenvía logs a un SIEM externo, esa es la fuente fiable. Los logs locales pueden haber sido manipulados.

## Investigación

1. ¿El dispositivo estuvo expuesto y sin parchear durante la ventana de explotación conocida?
2. ¿La interfaz de administración era accesible desde Internet o desde la red de usuarios? Suele ser la causa.
3. ¿Qué cambios se introdujeron en la configuración? Reglas de acceso, NAT, rutas, túneles, servidores de autenticación.
4. ¿Se crearon cuentas o se añadieron claves SSH?
5. ¿Se utilizó el dispositivo para interceptar o redirigir tráfico?
6. ¿Hay indicios de implante en el firmware? Comportamiento anómalo, tamaño o hash de imagen inesperado, procesos desconocidos.
7. ¿Qué accesos permitió hacia la red interna y durante cuánto tiempo?
8. ¿Hay otros dispositivos del mismo fabricante y versión?

## Erradicación

- Parche aplicado o dispositivo reemplazado.
- Configuración restaurada desde una copia **anterior al compromiso** y verificada línea a línea, no simplemente recargada.
- Todas las credenciales, claves y certificados rotados.
- **Reemplazo del equipo ante cualquier indicio de implante en el firmware.** La verificación de integridad en estos dispositivos es limitada; la reinstalación del sistema operativo no garantiza la eliminación de un implante persistente.
- Revisión de la actividad interna derivada como un incidente de red completo.
- Revisión de los dispositivos vecinos y del resto de la infraestructura de red.

## Recuperación

Reintroducir el dispositivo con configuración reconstruida desde la copia aprobada, con las credenciales nuevas y con la administración restringida a la red de gestión. Verificar la política real con un escaneo externo, no solo con la lectura de la configuración. Monitorización reforzada del tráfico originado por el propio dispositivo durante semanas.

## Prevención

| Control | Efecto |
|---|---|
| **Interfaz de administración jamás expuesta a Internet** | Cierra la causa directa más frecuente |
| Administración solo desde bastiones en red de gestión dedicada | Reduce la superficie a un origen controlado |
| MFA y cuentas nominales en la administración | Elimina credenciales compartidas |
| Parcheo prioritario, tratando estos equipos como sistemas críticos | Cierra el vector de explotación |
| Configuración versionada y comparada periódicamente | Detecta cambios no aprobados |
| Reenvío de logs a un SIEM externo | Única fuente fiable tras un compromiso |
| Retirada planificada de equipos en fin de soporte | Elimina vulnerabilidades sin corrección |
| Alerta sobre cambios de configuración fuera de ventana | Detección temprana |
| Verificación periódica de la exposición real desde fuera | La configuración y la realidad divergen con el tiempo |
