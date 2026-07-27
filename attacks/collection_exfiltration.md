---
id: attacks/collection_exfiltration
tipo: catalogo
estabilidad: permanente
tactica: TA0009 (Collection) + TA0010 (Exfiltration)
---

# Recolección y exfiltración

La fase que convierte una intrusión en una brecha notificable. En la extorsión moderna, **la exfiltración importa más que el cifrado**: define la obligación legal, el coste reputacional y la capacidad de presión del atacante.

## Recolección

| Técnica | ATT&CK | Origen | Detección | Mitigación |
|---|---|---|---|---|
| Datos del sistema local | T1005 | Documentos, configuraciones, bases locales | Lectura masiva de archivos por un proceso inusual | Cifrado en reposo, permisos mínimos |
| Datos de unidades de red | T1039 | Recursos compartidos SMB/NFS | Un usuario que abre miles de archivos en poco tiempo | Permisos por necesidad, auditoría de acceso a archivos |
| Repositorios de información | T1213 | SharePoint, Confluence, wikis, Jira | Búsquedas por "contraseña", "vpn", "acceso"; descargas masivas | Clasificación, DLP, límites de descarga |
| Código fuente | T1213.003 | GitHub, GitLab, Bitbucket | Clonado masivo de repositorios por una cuenta | Detección de clonado anómalo, IP allow-list |
| Correo | T1114 | Buzones, PST, OST | Exportación de buzones; reglas de reenvío | Alerta ante `New-MailboxExportRequest`, bloqueo de reenvío externo |
| Almacenamiento en la nube | T1530 | S3, Blob, GCS, OneDrive, Drive | Descarga masiva; acceso desde IP nueva | Registro de acceso a datos, políticas de acceso, cifrado con claves propias |
| Base de datos | T1005 | Consultas masivas | `SELECT` de tablas completas fuera de patrón | Auditoría de consultas, límites de exportación, enmascaramiento |
| Captura de pantalla | T1113 | Sesión del usuario | API de captura por proceso inusual | EDR |
| Captura de teclado | T1056.001 | Hooks o driver | Instalación de hook global | EDR, protección de credenciales |
| Captura de audio o vídeo | T1123 / T1125 | Micrófono, cámara | Acceso a dispositivos por proceso inusual | Permisos de dispositivo, indicadores físicos |
| Portapapeles | T1115 | Contenido copiado | Lectura continua del portapapeles | EDR |
| Datos del navegador | T1185 / T1539 | Sesiones activas, historial | Acceso a los perfiles del navegador | Token protection, perfiles cifrados |
| Contenido de contenedores y secretos | T1552.007 | Manifiestos, variables, montajes | Lecturas masivas del API de secretos | RBAC, secretos externos con auditoría |

## Preparación de los datos

| Técnica | ATT&CK | Descripción | Detección |
|---|---|---|---|
| Datos preparados en un punto (staging) | T1074 | Copiar todo a un directorio o servidor antes de sacarlo | Crecimiento anómalo de un directorio; archivo grande en `C:\Windows\Temp`, `\ProgramData`, `/tmp` |
| Compresión y cifrado | T1560 | RAR, 7z, ZIP con contraseña | Ejecución de `rar.exe`/`7z.exe` con opción de contraseña en servidores; archivos `.rar` multivolumen |
| Cifrado propio antes de salir | T1560.002 | Impide la inspección de contenido | Archivos de alta entropía en rutas temporales |
| Fragmentación | T1030 | Trocear para evadir umbrales de DLP y de tamaño | Muchos archivos de tamaño idéntico; transferencias troceadas |
| Renombrado y ofuscación | T1036 | Extensiones falsas, nombres inocuos | Discrepancia entre extensión y firma de archivo |

Detección de mayor valor en esta fase: **`rar.exe`, `7z.exe` o `WinRAR` ejecutado en un servidor**, con la opción de contraseña, sobre directorios de datos. Precede a la exfiltración en una parte enorme de los incidentes reales y ocurre **antes** del daño.

## Canales de exfiltración

| Técnica | ATT&CK | Canal | Detección | Mitigación |
|---|---|---|---|---|
| Sobre el canal de C2 | T1041 | El mismo canal de control | Volumen saliente anómalo hacia el destino del C2 | Egress restringido; alertas por volumen |
| Servicio web / nube pública | T1567.002 | Dropbox, Drive, MEGA, WeTransfer, `file.io` | Subidas grandes a servicios de almacenamiento personal | Bloqueo de almacenamiento personal, CASB, DLP |
| Repositorio de código | T1567.001 | Push a un repositorio del atacante | Push saliente desde servidores | Allow-list de destinos git |
| Protocolo alternativo | T1048 | FTP, SFTP, SMB, correo | Tráfico de protocolo inusual desde el segmento | Egress por protocolo |
| Túnel DNS | T1048.003 | Datos codificados en subdominios | Volumen y entropía de consultas; un dominio con miles de subdominios únicos | Resolver interno con análisis, límite de tasa |
| Medio físico | T1052 | USB, disco externo | Eventos de montaje y copia masiva | Control de dispositivos, bloqueo de escritura en USB |
| Transferencia programada | T1029 | Envíos en horario de bajo ruido | Actividad nocturna sostenida | Análisis de línea base horaria |
| Límite de tamaño por transferencia | T1030 | Trocear para no disparar umbrales | Muchas transferencias del mismo tamaño | Umbrales acumulativos, no por transferencia |
| Servicio de mensajería | T1567 | Telegram, Discord como canal de salida | Tráfico a APIs de mensajería desde servidores | Allow-list por rol |
| Exfiltración desde la nube | T1537 | Copiar snapshots o buckets a la cuenta del atacante | Compartición cross-account, copia masiva entre regiones | SCP que impida compartir fuera de la organización |
| Correo saliente | T1048 | Reenvío automático o envío masivo | Reglas de reenvío externo; volumen de adjuntos | Bloqueo de reenvío automático externo, DLP en correo |

## Detección: qué buscar realmente

| Señal | Por qué funciona |
|---|---|
| **Volumen saliente anómalo por host frente a su propia línea base** | El dato absoluto no sirve; la desviación respecto al propio historial sí |
| **Relación asimétrica de subida/bajada** | Una estación que sube mucho más de lo que baja es anómala por definición |
| **Acceso a un número inusual de archivos por una cuenta** | Precede a la recolección; se detecta con auditoría de acceso a objetos |
| **Compresión con contraseña en servidores** | Ver arriba; muy alta precisión |
| **Primera vez que un host contacta con un servicio de almacenamiento personal** | La novedad es la señal |
| **Transferencia fuera de horario laboral desde un servidor** | Los servidores tienen patrones estables |
| **Uso de un canal por un proceso que nunca lo usó** | `powershell.exe` subiendo a Drive no tiene explicación legítima |

## Prevención: qué reduce realmente el impacto

1. **Minimización del dato.** Lo que no se conserva no se puede exfiltrar. Política de retención aplicada de verdad, especialmente en plataformas de transferencia de archivos y en buzones.
2. **Clasificación y cifrado con claves que la aplicación no posea.** Si el atacante saca un blob cifrado cuyo KMS no controla, el impacto se reduce drásticamente.
3. **Egress restringido y categorizado**, con bloqueo de almacenamiento personal y de servicios de transferencia anónima.
4. **DLP centrada en pocos tipos de dato de alto valor.** La DLP que intenta cubrir todo genera ruido y termina desactivada.
5. **Auditoría de acceso a datos en repositorios críticos**, no solo autenticación.
6. **Segmentación**, para que la recolección no pueda abarcar toda la organización desde un solo punto.

## Consecuencia legal y de negocio

Confirmada la exfiltración, el incidente cambia de naturaleza: activa obligaciones de notificación (con plazos que varían por jurisdicción y sector), afecta a terceros cuyos datos estuvieran en el alcance, y otorga al atacante capacidad de presión aunque se recupere todo desde backup.

Por eso, en la respuesta, **determinar el alcance exacto de lo exfiltrado es una prioridad equiparable a la contención**: sin ese alcance no se puede notificar correctamente ni evaluar el riesgo real. Se determina con logs de red, registros de acceso a datos y el inventario de lo que residía en los sistemas afectados — no con la lista que publique el atacante. Ver [playbooks/ir_base.md](../playbooks/ir_base.md).
