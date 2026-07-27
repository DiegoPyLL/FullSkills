---
id: appsec/appsec
tipo: modelo
estabilidad: permanente
---

# Seguridad aplicada al backend

Qué construir para no depender de que nadie ataque el sistema. Cómo se rompe cada cosa y cómo se detecta el ataque está en [../security/](../../security/), no aquí: [web/web.md](../../security/web/web.md), [owasp_api.md](../../security/owasp_api.md), [databases/databases.md](../../security/databases/databases.md). El hasheo de contraseñas y las sesiones tienen módulo propio: [appsec/authn.md](authn.md).

## Identidad

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Autenticar en el borde y propagar identidad hacia dentro, no credenciales | Cada servicio interno no necesita conocer ni reenviar el secreto original | Un servicio interno reenvía la contraseña o el token de origen a otro servicio interno | Ningún servicio interno recibe la credencial original del usuario, solo su identidad ya verificada |
| Servicio a servicio: identidad de carga de trabajo con credencial de vida corta | Un secreto compartido eterno entre servicios es un único punto de fallo permanente | Dos servicios se autentican entre sí con una clave estática que nunca rota | La credencial entre servicios tiene vida corta y se renueva automáticamente |
| Factor múltiple resistente a phishing para el acceso privilegiado | No todos los segundos factores resisten igual; algunos son vulnerables a interceptación en tiempo real | El segundo factor es un código que se puede reenviar a un sitio falso | El acceso privilegiado exige un factor que no se pueda reutilizar tras interceptarse ([../security/](../../security/)) |

## Autorización

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Comprobar el permiso sobre el objeto concreto, no solo sobre la ruta | Es el fallo de autorización más frecuente y más caro del backend | Cualquier usuario autenticado que conoce el identificador de un recurso ajeno puede acceder a él | Solicitar un recurso ajeno con un identificador válido pero no propio devuelve denegado, no el recurso |
| Poner la comprobación junto al acceso al dato, no en un middleware lejano | Un middleware genérico se olvida fácilmente al añadir una nueva ruta de acceso al mismo dato | Existen varias formas de llegar al mismo dato y solo algunas pasan por el middleware de autorización | Toda vía de acceso al dato, no solo la ruta principal, aplica la misma comprobación |
| Denegar por defecto; el permiso se concede explícitamente | Un sistema que permite por defecto solo es tan seguro como la exhaustividad de sus prohibiciones | Un recurso nuevo es accesible hasta que alguien recuerde añadir la restricción | Un recurso o endpoint nuevo es inaccesible hasta que se concede el permiso explícitamente |
| Elegir el modelo de autorización a conciencia: por rol, por atributo o por relación | Cada modelo encaja con una forma distinta de estructurar los permisos del dominio | Se mezclan controles ad hoc sin un modelo consistente | El modelo de autorización elegido cubre los casos reales del dominio sin excepciones ad hoc |
| Tratar el aislamiento multi-inquilino como invariante del esquema, no como filtro opcional | Un filtro que se puede olvidar en una consulta es una fuga de datos entre inquilinos esperando a ocurrir | El aislamiento entre inquilinos depende de que cada consulta recuerde añadir el filtro correspondiente | Ninguna consulta puede devolver datos de otro inquilino aunque olvide el filtro explícito ([data/data.md](../data/data.md)) |

## Entrada no confiable

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Tratar como no confiable todo lo que cruza el borde, incluido lo que viene de otro servicio propio | Un servicio interno comprometido o con un bug puede enviar datos tan hostiles como un atacante externo | Se valida la entrada del usuario final pero no la de servicios internos | Todo dato que cruza un límite de proceso se valida, sin excepción por origen interno |
| Parametrizar en vez de escapar; lista de permitidos para lo que no admite parametrización | Escapar depende de acertar con todos los casos; parametrizar elimina la clase de problema | Se construye una consulta o comando concatenando valores de entrada | Ningún valor de entrada se concatena en una consulta, comando o ruta ejecutable ([../security/databases/databases.md](../../security/databases/databases.md)) |
| Canonicalizar una sola vez y validar después de canonicalizar | Validar antes de canonicalizar deja pasar formas alternativas del mismo valor peligroso | Se valida la entrada antes de normalizar codificación o forma Unicode | El valor validado es el mismo que se usa después, sin transformación posterior que lo altere |
| Prohibir deserialización que instancia tipos arbitrarios sobre entrada externa | Permite ejecutar código arbitrario a través de un formato de datos aparentemente inocuo | Se deserializa entrada externa con un formato que permite instanciar cualquier tipo del lenguaje | El formato de deserialización usado sobre entrada externa no puede instanciar tipos arbitrarios |
| Lista de destinos permitidos para peticiones salientes construidas con datos del usuario | Sin ella, el servidor puede convertirse en proxy hacia redes internas que el usuario no debería alcanzar | Una función que hace una petición saliente acepta cualquier destino provisto por el usuario | Una petición saliente construida con datos de usuario no puede alcanzar destinos fuera de la lista permitida |
| Subida de ficheros: tipo verificado por contenido, tamaño limitado, almacenamiento fuera del árbol servido, nombre generado por el servidor | El nombre y la extensión que declara el cliente no son de fiar | Un fichero subido se guarda con el nombre y en la ruta que indica el cliente, dentro del árbol servido | El tipo de fichero se verifica por su contenido real, y el fichero subido no se sirve directamente desde su ruta de almacenamiento |

## Secretos, configuración sensible y datos sensibles

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Secretos fuera del repositorio, con alcance mínimo, rotables y auditados | Un secreto en el repositorio queda en el histórico para siempre, incluso si se borra después | Una credencial se escribe directamente en un fichero de configuración versionado | Ningún secreto aparece en el repositorio ni en su histórico; cada uno tiene alcance y rotación definidos |
| Gestor de secretos en vez de variables de entorno para lo más sensible | Las variables de entorno acaban filtrándose en volcados de proceso y en registros | Los secretos más sensibles viven solo en variables de entorno sin control adicional | Los secretos de mayor sensibilidad se recuperan de un gestor dedicado, no solo de variables de entorno |
| Escanear el repositorio y su histórico en busca de secretos filtrados | Un secreto puede llevar filtrado mucho tiempo sin que nadie lo note | No existe ningún escaneo automático de secretos en el flujo de integración continua | El flujo de integración continua incluye un escaneo de secretos que bloquea el envío si encuentra uno |
| Rotar, no solo borrar del commit, un secreto que se ha filtrado | Un secreto que estuvo expuesto sigue siendo válido hasta que se rota, aunque desaparezca del código | Se elimina un secreto filtrado del historial sin invalidarlo en el sistema que lo usa | El secreto filtrado deja de funcionar tras el incidente, independientemente de si se limpió el historial |
| Clasificar y minimizar el dato sensible que se guarda | El dato que no se guarda no se puede filtrar | Se guardan más campos sensibles de los que el negocio realmente necesita | Cada campo sensible almacenado tiene una justificación de negocio explícita |
| Cifrado en tránsito siempre; en reposo según clasificación; por campo para lo más crítico | El nivel de protección debe ser proporcional a la sensibilidad real del dato | Todo el tráfico y todo el almacenamiento se tratan con el mismo nivel de protección, sin distinción | El nivel de cifrado aplicado corresponde a la clasificación declarada del dato |
| Generador criptográficamente seguro para todo lo aleatorio con valor de seguridad | El generador aleatorio por defecto del lenguaje casi nunca es apto para valores de seguridad | Un token o identificador de sesión se genera con el generador aleatorio de propósito general | Todo valor aleatorio usado con fines de seguridad procede de un generador criptográficamente seguro |
| Declarar qué nunca se registra: credenciales, tokens, medios de pago, datos personales | Un dato sensible en un registro de aplicación suele sobrevivir mucho más tiempo del que se cree | Los registros de aplicación incluyen el cuerpo completo de peticiones sin filtrar campos sensibles | Ningún registro de aplicación contiene credenciales, tokens ni datos personales en claro |

## Rastro auditable y cadena de suministro

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Registrar quién hizo qué, cuándo y sobre qué, de forma suficiente para una investigación | Sin rastro auditable, un incidente no se puede reconstruir después de ocurrido | Las acciones administrativas o sensibles no dejan un registro separado de auditoría | Toda acción sensible queda registrada con actor, momento y objeto, de forma independiente del registro de aplicación |
| El rastro auditable es inmutable y está separado de los registros de aplicación | Un rastro modificable no sirve como evidencia | El registro de auditoría se guarda en el mismo sistema y con el mismo nivel de acceso que los registros normales | El registro de auditoría no puede modificarse ni borrarse por quien tiene acceso operativo normal |
| Fichero de bloqueo con versiones fijadas y construcción reproducible | Sin versiones fijadas, el mismo código puede construirse con dependencias distintas en momentos distintos | El proyecto no fija versiones exactas de sus dependencias | Dos construcciones del mismo commit producen exactamente las mismas versiones de dependencias |
| Escaneo de vulnerabilidades conocidas en integración continua | Una dependencia con una vulnerabilidad conocida es una puerta de entrada que no requiere descubrir nada nuevo | No existe ningún escaneo automático de vulnerabilidades en las dependencias | El flujo de integración continua reporta vulnerabilidades conocidas en las dependencias antes de desplegar |
| Tratar cada dependencia añadida como superficie de ataque y de mantenimiento, no como gratis | Cuantas más dependencias, mayor la superficie que hay que vigilar y mantener actualizada | Se añaden dependencias sin considerar su coste de mantenimiento y su superficie de exposición | Cada dependencia añadida tiene una justificación que pesa su beneficio frente a su coste de superficie |

## Verificación mínima antes de exponer un servicio

1. Toda comprobación de autorización actúa sobre el objeto solicitado, no solo sobre la ruta.
2. Ningún secreto aparece en el repositorio, en su histórico ni en un registro de aplicación.
3. Toda entrada externa —incluida la que viene de otro servicio propio— se valida y se parametriza.
4. Existe un rastro auditable, inmutable y separado, para las acciones sensibles.
5. Las dependencias están fijadas por versión y se escanean por vulnerabilidad conocida en integración continua.
6. Las credenciales de usuario siguen lo definido en [appsec/authn.md](authn.md); ninguna se guarda ni se compara sin las prácticas allí descritas.
