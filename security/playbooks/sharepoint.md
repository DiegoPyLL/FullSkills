---
id: playbooks/sharepoint
tipo: playbook
estabilidad: permanente
---

# Playbook — SharePoint Server (on-premises)

Base común: [ir_base.md](ir_base.md). Para SharePoint Online, ver [microsoft365.md](microsoft365.md).

Particularidad crítica: varias vulnerabilidades graves de SharePoint permiten robar las **claves criptográficas del servidor** (`MachineKey` / `ValidationKey`). Con ellas, el adversario puede forjar payloads válidos indefinidamente. **Parchear no basta: hay que rotar las claves.**

## Señales de entrada

Archivos `.aspx` nuevos en `LAYOUTS` o en el webroot; procesos hijos de `w3wp.exe`; peticiones POST anómalas a endpoints de SharePoint (`ToolPane.aspx` y similares); errores de deserialización en los logs; alertas de KEV sobre SharePoint.

## Contención inmediata

| # | Acción |
|---|---|
| 1 | Buscar web shells **antes** de parchear |
| 2 | Cortar el acceso externo a la granja |
| 3 | Aplicar la actualización de seguridad correspondiente |
| 4 | **Rotar las `MachineKey` de todos los servidores de la granja** y reiniciar IIS. Este paso es el que realmente expulsa al adversario |
| 5 | Aislar los servidores comprometidos manteniéndolos encendidos |
| 6 | Revocar credenciales de las cuentas de servicio de la granja |
| 7 | Revisar los servidores de base de datos asociados |

Omitir el paso 4 es el error más frecuente en estos incidentes: el servidor queda parcheado y el adversario mantiene la capacidad de autenticarse con payloads forjados.

## Evidencia específica

| Elemento | Fuente |
|---|---|
| Archivos `.aspx` en `TEMPLATE\LAYOUTS` y en el webroot | Comparar contra instalación limpia de la misma versión |
| Logs de IIS de todos los servidores de la granja | Peticiones a endpoints de administración y de configuración |
| Logs ULS de SharePoint | Errores de deserialización y actividad anómala |
| Creación de procesos | Hijos de `w3wp.exe` |
| Estado de las `MachineKey` | Determinar si pudieron ser leídas |
| Logs de la base de datos de contenido | Acceso o exportación masiva |
| Auditoría de SharePoint | Descargas y accesos a sitios sensibles |
| Cuentas de servicio de la granja | Su uso posterior en la red |

## Investigación

1. ¿Qué versión y actualizaciones tenía la granja? ¿Qué CVEs le aplicaban?
2. ¿Se robaron las claves criptográficas? Ante la duda, asumir que sí y rotarlas.
3. ¿Hay web shells en alguno de los servidores de la granja? Revisar **todos**, no solo el que alertó.
4. ¿Qué se ejecutó desde el servidor? SharePoint corre con cuentas de servicio a menudo privilegiadas.
5. ¿Se accedió a las bases de datos de contenido? Ahí está el dato real.
6. ¿Qué documentos se descargaron y por quién? Define el alcance de datos.
7. ¿Se usó como pivote hacia AD o hacia SQL Server?

## Erradicación

- Actualización de seguridad aplicada en **todos** los servidores de la granja.
- **Rotación de las claves criptográficas** y reinicio de los servicios.
- Reconstrucción de los servidores con compromiso a nivel de sistema.
- Eliminación de web shells y verificación de integridad del contenido de `LAYOUTS`.
- Rotación de credenciales: cuentas de servicio de la granja, cuenta de acceso a la base de datos, cuentas de máquina.
- Revisión de soluciones y features desplegadas en la granja: una solución WSP maliciosa es persistencia legítima a ojos del sistema.
- Revisión de tareas programadas y de trabajos temporizados de SharePoint.
- Si SQL Server estuvo implicado, aplicar también [sql_server.md](sql_server.md).

## Prevención

| Control | Efecto |
|---|---|
| No exponer SharePoint on-premises a Internet | Elimina la superficie pre-autenticación |
| Publicar tras un proxy con autenticación previa si debe ser accesible | Reduce drásticamente el riesgo |
| Parcheo prioritario: SharePoint aparece de forma recurrente en KEV | Cierra el vector principal |
| Rotación periódica de las `MachineKey` | Limita el valor de un robo pasado |
| FIM sobre `LAYOUTS` y el webroot | Detecta web shells |
| Alerta sobre procesos hijos de `w3wp.exe` | Detección precisa |
| Cuentas de servicio con privilegios mínimos y gestionadas (gMSA) | Limita el pivote |
| Auditoría de acceso a documentos habilitada | Permite determinar el alcance de una fuga |
| Migración a SharePoint Online cuando sea viable | Traslada la superficie al proveedor |
