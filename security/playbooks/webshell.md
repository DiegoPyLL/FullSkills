---
id: playbooks/webshell
tipo: playbook
estabilidad: permanente
---

# Playbook — Web shell

Base común: [ir_base.md](ir_base.md).

Una web shell implica **ejecución de código ya lograda en el servidor**. Es consecuencia, no causa: encontrarla y borrarla sin hallar la vulnerabilidad de entrada garantiza que vuelva.

## Señales de entrada

Archivo `.aspx`/`.jsp`/`.php`/`.ashx` nuevo o modificado en el webroot; proceso hijo de `w3wp.exe`, `httpd`, `nginx`, `php-fpm` o `java` que sea un shell; peticiones POST repetidas a un único archivo poco habitual; alerta de FIM en directorios web; tráfico saliente desde el servidor web.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | Aislar el servidor de la red, **sin apagarlo** | Conserva memoria y procesos |
| 2 | **Copiar la web shell antes de tocarla** | Con hash; es la evidencia principal |
| 3 | No borrarla todavía | Borrarla avisa al adversario y elimina la posibilidad de ver su uso posterior |
| 4 | Bloquear el acceso externo al servicio | Si el negocio lo permite, o publicar una versión estática |
| 5 | Revisar si hay más servidores con el mismo patrón | Raramente hay uno solo |
| 6 | Revocar credenciales y certificados presentes en el servidor | Asumirlos comprometidos |

## Evidencia específica

| Elemento | Qué aporta |
|---|---|
| El archivo de la web shell | Capacidades, autor, posible familia |
| Logs del servidor web completos | Peticiones al archivo: **desde cuándo se usa y desde qué IP** |
| Logs de aplicación y de errores | La explotación inicial suele aparecer aquí |
| Memoria del proceso del servidor web | Payloads en memoria y actividad reciente |
| Timeline del sistema de archivos (MFT, USN) | Qué más se creó o modificó en la misma ventana |
| Creación de procesos del servidor | Qué se ejecutó desde la shell |
| Flujos de red del servidor | Exfiltración y movimiento lateral |
| Inventario completo del webroot contra una instalación limpia | Suele haber más de una shell |

## Investigación

1. **¿Cómo se subió?** Explotación de una vulnerabilidad conocida, subida de archivos sin validar, credenciales de despliegue robadas, compromiso de la cadena de suministro.
2. ¿Desde cuándo existe? La fecha del archivo puede estar falseada: contrastar con logs del servidor web y con la MFT.
3. ¿Qué comandos se ejecutaron desde ella? Buscar procesos hijos del servidor web en todo el periodo.
4. ¿Escalaron privilegios en el host?
5. ¿Se movieron lateralmente? El servidor web suele estar unido al dominio.
6. ¿Qué datos había accesibles desde ese servidor y desde sus credenciales?
7. ¿Hay más shells, con otros nombres o dentro de archivos legítimos modificados?

Buscar especialmente shells insertadas **dentro de archivos existentes legítimos**: son mucho más difíciles de encontrar que un archivo nuevo, y un inventario por fecha de creación no las detecta.

## Erradicación

- Corregir la vulnerabilidad de entrada. Sin este paso, todo lo demás es temporal.
- **Reconstruir el servidor desde una imagen limpia** y volver a desplegar la aplicación desde el repositorio, no restaurar el sistema de archivos comprometido.
- Rotar todas las credenciales del servidor: cuentas de servicio, cadenas de conexión, claves de API, certificados, cuenta de máquina.
- Revisar persistencia adicional: tareas, servicios, cuentas locales, claves SSH, módulos del servidor web, filtros ISAPI, `web.config` modificado.
- Verificar que no se plantaron shells en otros servidores del mismo grupo.

## Prevención

| Control | Efecto |
|---|---|
| Ejecución denegada en directorios de subida | La shell puede subirse pero no ejecutarse |
| Webroot de solo lectura, despliegue inmutable | La escritura deja de ser posible |
| FIM sobre el webroot con alerta inmediata | Detección en minutos |
| Alerta sobre cualquier proceso hijo del servidor web | Detección de altísima precisión y casi sin ruido |
| Servidor web con la cuenta de menor privilegio | Limita lo que la shell puede hacer |
| Egress denegado desde servidores | Impide el canal de control |
| Parcheo prioritario de aplicaciones expuestas | Cierra el vector más común |
| WAF con reglas de subida y de acceso a rutas anómalas | Capa compensatoria, no sustituto del parche |
