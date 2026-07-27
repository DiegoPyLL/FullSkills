---
id: playbooks/cloud
tipo: playbook
estabilidad: permanente
---

# Playbook — Incidente en la nube (IaaS/PaaS)

Base común: [ir_base.md](ir_base.md). Modelo: [cloud/cloud.md](../cloud/cloud.md), [aws](../aws/aws.md), [azure](../azure/azure.md), [gcp](../gcp/gcp.md).

Diferencia fundamental frente a un incidente on-premises: **no se aísla una máquina, se aísla una identidad**. El adversario opera mediante llamadas a la API, no mediante presencia en un host.

## Señales de entrada

Desactivación o borrado de logs de auditoría; uso de credenciales de rol de instancia desde una IP externa al proveedor; creación de usuarios, claves o service principals; ráfaga de llamadas de enumeración; recursos en regiones no utilizadas; pico de gasto; snapshot o imagen compartida fuera de la organización; alerta del servicio de detección del proveedor.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | **Preservar los logs primero** | Exportarlos a una cuenta separada antes de cualquier acción; el adversario puede borrarlos |
| 2 | Aislar la **identidad**, no el recurso | Política de denegación explícita sobre el principal comprometido |
| 3 | **Revocar las sesiones activas**, no solo deshabilitar la credencial | Los tokens temporales siguen siendo válidos hasta que expiran |
| 4 | Deshabilitar claves de acceso comprometidas sin eliminarlas | Conserva la evidencia |
| 5 | Aislar la instancia con un grupo de seguridad sin reglas, manteniéndola en ejecución | Permite el volcado de memoria |
| 6 | Bloquear la compartición externa de recursos | Corta la exfiltración en curso |
| 7 | Verificar que el registro de auditoría sigue activo en **todas** las regiones y cuentas | Es la primera acción del adversario competente |
| 8 | Revisar el resto de cuentas y suscripciones de la organización | Rara vez se limita a una |

## Evidencia específica

| Elemento | Fuente |
|---|---|
| Plano de control | CloudTrail / Azure Activity y Audit / GCP Admin Activity — **de todas las regiones y cuentas** |
| Plano de datos | Acceso a objetos de almacenamiento, invocaciones de funciones, consultas a bases |
| Identidad | Logs de inicio de sesión del IdP, cambios de IAM, credenciales creadas |
| Red | Flow logs, logs de DNS y de balanceadores |
| Instancia | Snapshot de disco, volcado de memoria, logs del sistema operativo |
| Configuración | Histórico del servicio de configuración: qué cambió y cuándo |
| Facturación | Recursos creados por el adversario, a menudo en regiones no vigiladas |

## Investigación

1. **¿Cómo se obtuvo la credencial?** Secreto filtrado en un repositorio, SSRF a la metadata, phishing, infostealer en un equipo, clave estática antigua.
2. ¿Qué permisos efectivos tenía esa identidad? Determinar **lo que podía hacer**, no solo lo que hizo: define el alcance del riesgo.
3. ¿Escalaron privilegios? Revisar `PassRole`, suplantación de cuentas de servicio, cambios de política.
4. ¿Qué datos accedieron? Requiere los logs del plano de datos, que muchas organizaciones no tienen activados.
5. ¿Hubo exfiltración? Snapshots compartidos, copias entre regiones o cuentas, descargas masivas.
6. ¿Qué persistencia dejaron? Usuarios, claves, roles con confianza externa, funciones, reglas de eventos, políticas de recurso modificadas.
7. ¿Hay recursos creados en regiones no utilizadas? Minería o infraestructura de apoyo.

## Erradicación

- Rotar **todos** los secretos accesibles desde la identidad comprometida, no solo la credencial usada.
- Eliminar la persistencia: usuarios, claves de acceso, service principals, roles con políticas de confianza externa, funciones y reglas de eventos creadas.
- Revisar y corregir las políticas de confianza y las de recurso modificadas.
- Terminar y recrear las instancias comprometidas; no limpiarlas.
- Eliminar los recursos creados por el adversario en todas las regiones.
- Cerrar el vector inicial: rotar el secreto filtrado, corregir la SSRF, exigir IMDSv2, eliminar las claves estáticas.
- Revisar la organización completa: cuentas, suscripciones y proyectos vecinos.

## Recuperación

Reconstruir desde infraestructura como código sobre recursos nuevos, no reutilizando los comprometidos. Verificar que la configuración desplegada corresponde al repositorio y no incluye cambios del adversario. Restaurar datos desde copias verificadas como anteriores al compromiso.

## Prevención

| Control | Efecto |
|---|---|
| Eliminar las credenciales estáticas de larga vida en favor de federación OIDC | Cierra el vector dominante |
| IMDSv2 obligatorio con hop limit 1 | Cierra la SSRF a credenciales |
| Logs en cuenta separada e inmutable, con alerta ante su desactivación | Garantiza la capacidad forense |
| Logs de plano de datos activos en repositorios sensibles | Sin ellos no se puede determinar el alcance |
| Barandillas preventivas (SCP, Azure Policy, políticas de organización) | Impiden la mala configuración |
| Permissions boundaries y revisión de rutas de escalada | Corta la autoescalada de permisos |
| MFA resistente a phishing en todo acceso a consola | Cierra el phishing |
| Escaneo de secretos en repositorios y en imágenes | Corta la filtración de credenciales |
| Separación por cuentas o proyectos según entorno y criticidad | Limita el radio de explosión |
| Alertas de gasto | Delatan minería y exfiltración |
