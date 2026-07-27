---
id: playbooks/sql_server
tipo: playbook
estabilidad: permanente
---

# Playbook — SQL Server

Base común: [ir_base.md](ir_base.md). Modelo técnico: [databases/databases.md](../databases/databases.md).

Dos escenarios distintos que requieren respuestas distintas: **exfiltración de datos** (el objetivo es el contenido) y **uso del motor como plataforma de ejecución** (el objetivo es el host y la red).

## Señales de entrada

Errores de SQL en volumen desde la aplicación; ejecución de `xp_cmdshell`; procesos hijos de `sqlservr.exe`; inicios de sesión fallidos masivos o desde orígenes nuevos; consultas que devuelven tablas completas; creación de usuarios o cambios de permisos; conexiones al motor desde hosts que no son el servidor de aplicación.

## Contención inmediata

| # | Acción |
|---|---|
| 1 | Aislar el servidor de la red, **sin apagarlo** ni detener el servicio |
| 2 | Cortar el acceso desde la aplicación vulnerable si la inyección sigue explotable |
| 3 | Deshabilitar `xp_cmdshell`, OLE Automation y CLR no firmado |
| 4 | Deshabilitar las cuentas comprometidas y rotar sus credenciales |
| 5 | Revisar y desactivar linked servers no justificados |
| 6 | Revisar trabajos del Agente SQL creados o modificados recientemente |
| 7 | Preservar memoria y logs antes de cualquier cambio de configuración |

## Evidencia específica

| Elemento | Qué aporta |
|---|---|
| SQL Server Error Log y logs del Agente | Inicios de sesión, errores, trabajos ejecutados |
| SQL Server Audit o trazas | Consultas ejecutadas y por quién |
| Logs de la aplicación web | Origen de la inyección |
| Creación de procesos en el host | Hijos de `sqlservr.exe`: ejecución de comandos |
| Configuración del servidor | Opciones peligrosas habilitadas y cuándo |
| Metadatos del motor | Usuarios, roles, procedimientos, ensamblados, disparadores y trabajos creados |
| Archivos en el sistema | Escrituras desde el motor (`bcp`, `OPENROWSET`) |
| Flujos de red del servidor | Exfiltración y movimiento lateral |
| Backups y su historial | Copias creadas o restauradas por el adversario |

## Investigación

1. **¿Cuál fue el vector?** Inyección SQL desde la aplicación, credenciales robadas, exposición directa del puerto o movimiento lateral desde otro host.
2. ¿Con qué privilegios operaron dentro del motor? ¿Alcanzaron `sysadmin`?
3. ¿Ejecutaron comandos del sistema? Si sí, el incidente es también del host.
4. ¿Qué privilegios tenía la cuenta de servicio del motor en el dominio? Suele ser el pivote hacia AD.
5. ¿Qué datos se consultaron o exportaron? Define el alcance de la brecha.
6. ¿Se usaron linked servers para saltar a otras instancias?
7. ¿Dejaron persistencia: usuarios, disparadores, procedimientos, ensamblados CLR, trabajos del Agente?

## Erradicación

- Corregir la vulnerabilidad de la aplicación si el vector fue inyección; sin ello, todo lo demás es temporal.
- Eliminar objetos creados por el adversario: usuarios, roles, procedimientos, disparadores, ensamblados, trabajos.
- Deshabilitar de forma permanente las funciones peligrosas que no se usen.
- Rotar credenciales: cuentas SQL, cuenta de servicio del motor, cadenas de conexión de todas las aplicaciones, cuentas de linked servers.
- **Reconstruir el host** si hubo ejecución de comandos del sistema.
- Restaurar la base desde un punto anterior al compromiso si hubo manipulación de datos; verificar integridad si no.
- Revisar el resto de instancias alcanzables por linked servers o por las credenciales comprometidas.

## Prevención

| Control | Efecto |
|---|---|
| El motor nunca accesible desde Internet ni desde la red de usuarios | Elimina el acceso directo |
| Cuenta de aplicación sin `sysadmin`, sin DDL y sin acceso a otras bases | Una inyección deja de ser compromiso total |
| `xp_cmdshell`, OLE Automation y CLR `UNSAFE` deshabilitados | Elimina la ruta de SQL a RCE |
| Cuenta de servicio gestionada, sin privilegios de dominio | Elimina el pivote a AD |
| Consultas parametrizadas en toda la aplicación | Cierra el vector de inyección en origen |
| Autenticación integrada, sin contraseñas estáticas | Reduce el robo de credenciales |
| Cifrado en tránsito y en reposo | Limita el valor del robo de archivos y de backups |
| Auditoría de acceso a tablas sensibles | Permite determinar el alcance |
| Alerta sobre procesos hijos de `sqlservr.exe` | Detección precisa y sin apenas ruido |
| Backups cifrados, inmutables y fuera del alcance de las credenciales de producción | Recuperación garantizada |
