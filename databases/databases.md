---
id: databases/databases
tipo: modelo
estabilidad: permanente
---

# Seguridad de bases de datos

La base de datos es donde está el dato: el objetivo final de la mayoría de las intrusiones con motivación económica. Dos superficies distintas: **la inyección desde la aplicación** (ver [web/web.md](../web/web.md)) y **el motor mismo como servicio de red**.

## Riesgos transversales

| Riesgo | Manifestación | Control |
|---|---|---|
| Exposición a Internet | Puerto de la base accesible desde fuera | Nunca exponer; acceso solo desde la capa de aplicación o por bastión |
| Credenciales por defecto o débiles | `sa`, `postgres`, `root` sin contraseña o con contraseña trivial | Autenticación integrada con el directorio o IAM; sin contraseñas estáticas |
| Cuenta de aplicación con permisos de administrador | Una SQLi se convierte en compromiso total del servidor | Usuario de aplicación con permisos mínimos, sin DDL ni acceso a otras bases |
| Ausencia de cifrado en tránsito | Credenciales y datos en claro en la red | TLS obligatorio, con verificación de certificado en el cliente |
| Ausencia de cifrado en reposo | Robo del archivo o del backup entrega todo | Cifrado a nivel de volumen o del motor; cifrado de columna para datos sensibles |
| Backups desprotegidos | El backup es una copia completa sin controles de acceso | Cifrado, permisos, inmutabilidad, pruebas de restauración |
| Sin auditoría de consultas | Imposible determinar el alcance de una brecha | Auditoría de acceso a tablas sensibles, con retención suficiente |
| Datos de producción en entornos de prueba | Copia sin controles y con acceso amplio | Enmascaramiento o datos sintéticos |
| Exportación masiva sin límite | Exfiltración indistinguible del uso normal | Límites de resultado, alertas por volumen |

## SQL Server

| Superficie | Riesgo | Control |
|---|---|---|
| `xp_cmdshell` | Ejecución de comandos del sistema desde SQL: convierte SQLi en RCE | Deshabilitado; si es imprescindible, restringido y auditado |
| Procedimientos OLE Automation, `sp_OACreate` | Ejecución de código | Deshabilitados |
| CLR integration | Ensamblados `UNSAFE` ejecutando código arbitrario | Deshabilitado o solo ensamblados firmados |
| Linked servers | Movimiento lateral entre instancias, a veces con credenciales almacenadas | Inventariar, minimizar, sin credenciales elevadas |
| Suplantación (`EXECUTE AS`, `TRUSTWORTHY`) | Escalada dentro del motor | `TRUSTWORTHY OFF`; revisar cadenas de suplantación |
| Cuenta de servicio con privilegios de dominio | Compromiso del servicio = compromiso del dominio | Cuenta gestionada, sin privilegios de dominio |
| `SeImpersonatePrivilege` de la cuenta de servicio | Escalada local a SYSTEM en el host | Ver [attacks/privilege_escalation.md](../attacks/privilege_escalation.md) |
| Autenticación mixta | Cuentas SQL con contraseñas débiles y sin bloqueo | Autenticación de Windows/Entra, políticas de contraseña activadas |
| Puerto y SQL Browser expuestos | Descubrimiento y ataque directo | Firewall; SQL Browser desactivado |

Telemetría: SQL Server Audit sobre inicios de sesión fallidos, cambios de permisos, ejecución de procedimientos peligrosos y consultas sobre tablas sensibles. Ver [playbooks/sql_server.md](../playbooks/sql_server.md).

## PostgreSQL

| Superficie | Riesgo | Control |
|---|---|---|
| `COPY ... FROM PROGRAM` | Ejecución de comandos como el usuario del servicio | Solo para superusuarios; que la cuenta de aplicación no lo sea |
| Extensiones no confiables | Código nativo en el servidor | Instalación restringida; extensiones firmadas |
| `pg_hba.conf` con `trust` | Autenticación sin contraseña | `scram-sha-256`; nunca `trust` fuera de un socket local controlado |
| `postgres` como usuario de aplicación | Una SQLi da el motor completo | Roles con permisos mínimos, `search_path` fijado |
| Row Level Security ausente en multi-tenant | Fuga entre inquilinos | RLS con políticas verificadas por pruebas |
| `SECURITY DEFINER` con `search_path` mutable | Escalada dentro del motor | Fijar `search_path` en la función |
| Replicación mal protegida | Copia completa del dato | Autenticación y TLS en la replicación |

## MySQL / MariaDB

| Superficie | Riesgo | Control |
|---|---|---|
| Funciones definidas por el usuario (UDF) | Carga de una biblioteca nativa → RCE | `secure_file_priv` restringido, sin privilegio `FILE` |
| `LOAD_FILE` e `INTO OUTFILE` | Lectura y escritura arbitraria de archivos | Retirar el privilegio `FILE` de la cuenta de aplicación |
| Usuarios anónimos o `%` como host | Acceso desde cualquier origen | Eliminar usuarios anónimos, acotar el host |
| `mysql` como root del sistema | Escritura de archivos como root | Servicio con usuario dedicado sin privilegios |

## NoSQL y almacenes en memoria

| Motor | Riesgo característico | Control |
|---|---|---|
| MongoDB | Instancias sin autenticación expuestas (causa histórica de miles de fugas); inyección de operadores (`$where`, `$ne`) desde JSON | Autenticación y autorización obligatorias, bind solo interno, validación de tipos en la aplicación |
| Redis | Sin autenticación por defecto en despliegues antiguos; `CONFIG SET` permite escribir archivos arbitrarios → claves SSH o cron → RCE | `requirepass`/ACL, `rename-command` para comandos peligrosos, bind local, nunca expuesto |
| Elasticsearch / OpenSearch | Índices sin autenticación; consultas costosas; exposición de datos completos | Seguridad habilitada, TLS, control de acceso por índice |
| Memcached | Sin autenticación; amplificación de DDoS | Solo interno, UDP deshabilitado |
| Cassandra, CouchDB, Neo4j | Credenciales por defecto, interfaces de administración expuestas | Cambio de credenciales, red interna, TLS |

Patrón común: estos motores **priorizaron facilidad de despliegue sobre seguridad por defecto**. La regla es asumir que el estado inicial es inseguro y verificar autenticación, red y cifrado explícitamente.

## Detección

| Señal | Qué indica |
|---|---|
| Errores de SQL en volumen desde la aplicación | Fuzzing de inyección en curso |
| Consultas con `UNION SELECT`, `information_schema`, `sleep()`, `benchmark()` | Explotación de SQLi |
| Ejecución de procedimientos peligrosos (`xp_cmdshell`, `COPY FROM PROGRAM`, `CONFIG SET`) | Intento de RCE desde el motor |
| Login fallido masivo o desde origen nuevo | Fuerza bruta o credencial robada |
| Cuenta de aplicación consultando tablas fuera de su patrón | Movimiento del atacante con la credencial de la app |
| `SELECT` de tablas completas o exportación masiva | Exfiltración |
| Creación de usuarios o cambios de permisos | Persistencia |
| Conexión al motor desde un host que no es el servidor de aplicación | Acceso directo del atacante |
| Acceso fuera de horario a datos sensibles | Insider o intrusión |

## Diseño defensivo

1. **Segmentación**: la base solo acepta conexiones de la capa de aplicación y del bastión de administración. Es el control con mejor relación coste/impacto.
2. **Mínimo privilegio real**: usuario de aplicación sin DDL, sin acceso a otras bases, sin privilegios de archivo ni de ejecución de comandos.
3. **Identidad sin contraseñas estáticas**: autenticación integrada con IAM o con el directorio, con credenciales de vida corta.
4. **Cifrado en tránsito y en reposo**, con claves gestionadas fuera del motor.
5. **Minimización y retención**: lo que no se guarda no se filtra. Aplica especialmente a datos personales y a históricos.
6. **Auditoría de acceso a datos**, no solo de autenticación: sin ella no se puede determinar el alcance de una brecha.
7. **Backups cifrados, inmutables y probados**, fuera del alcance de las credenciales de producción.
8. **Pruebas de autorización a nivel de fila** en aplicaciones multi-inquilino: es donde aparecen las fugas silenciosas.
