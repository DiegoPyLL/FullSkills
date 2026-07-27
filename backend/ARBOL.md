# Árbol de buenas prácticas de backend

Documento de diseño de la skill `backend`. No es un módulo de conocimiento: es la taxonomía previa que decide qué módulos existen, qué contiene cada uno y con qué criterio se admite o se rechaza una práctica.

Alcance: **agnóstico de tecnología**. Se nombran algoritmos y patrones (cubo de fichas, Argon2id, ETag, expandir/contraer); no se nombran frameworks, ORMs ni librerías. La línea es *algoritmo y patrón sí, producto no*.

Criterio de admisión: una práctica entra solo si puede declarar **qué invariante protege** y **cómo se observa que está rota**. Es el equivalente al anclaje a ATT&CK/CWE/D3FEND de [../security/SKILL.md](../security/SKILL.md): convierte la afirmación en verificable en vez de dogmática.

## Núcleo de razonamiento

Cinco modelos. Todo el árbol se deriva de ellos.

**a) Contrato → invariante → violación.** Todo componente publica un contrato y sostiene invariantes que el contrato no dice en voz alta ("un pedido no se cobra dos veces", "el saldo nunca es negativo"). Un bug de backend es casi siempre una invariante rota. Pregunta permanente: *¿qué invariante sostiene esto, y qué la rompe — concurrencia, fallo parcial, reintento, entrada hostil?*

**b) Todo I/O falla, y falla de cinco formas.** Lento · agotado el tiempo · error · duplicado · desordenado. Un diseño no está terminado hasta que responde qué pasa en cada caso. El caso que siempre se olvida es *"funcionó, pero el cliente no se enteró"*: de ahí sale toda la teoría de idempotencia y reintentos.

**c) El estado es lo caro; el cómputo es barato.** Lo sin estado escala solo. Cada pieza de estado (sesión, caché, cola, tabla, índice) obliga a decidir dueño, durabilidad, consistencia y qué pasa cuando se pierde. Escalar es casi siempre mover, particionar o eliminar estado, no añadir máquinas.

**d) Todo cambio convive con la versión anterior.** No existe el despliegue atómico. Durante la ventana de cambio hay dos versiones de código contra un esquema, y clientes viejos llamando a servidores nuevos. De aquí salen expandir/contraer, compatibilidad N-1, cambios aditivos y banderas. Es el modelo que más se ignora y el que más incidentes causa.

**e) El coste real no es el big-O.** Está en los viajes de red, en la espera en cola y en la cola de la distribución. Un `O(n²)` sobre 50 elementos en memoria es gratis; un `O(n)` con una consulta por elemento es un incidente. Y la media miente: el usuario que se queja vive en el p99.

## 1. Contrato y API — `api/`

```
1.1 Elección de estilo
    · Petición-respuesta vs. evento: quién queda acoplado a la disponibilidad de quién
    · Recurso vs. procedimiento vs. consulta declarativa; el estilo lo decide el consumidor
1.2 Modelado del contrato
    · Modelar recursos e invariantes del dominio, no la tabla ni la función interna
    · Nombres del dominio; plural coherente; sin verbos en la ruta si el estilo es de recursos
    · El contrato es la superficie estable; lo de dentro puede cambiar, esto no
1.3 Códigos y semántica de respuesta
    · Usar el código correcto: 201 con Location al crear · 202 para asíncrono · 204 sin cuerpo
      409 conflicto de estado · 412 precondición fallida · 422 entidad inválida
      429 límite excedido · 503 con Retry-After para no disponible
    · 200 con un error dentro del cuerpo es el antipatrón más extendido
    · Distinguir "reintentable" de "no reintentable" en la propia respuesta
1.4 Idempotencia
    · GET/PUT/DELETE idempotentes por definición; POST no lo es y ahí está el problema
    · Clave de idempotencia: generada por el cliente, almacenada junto al resultado, con
      caducidad; el duplicado devuelve la respuesta original, no reejecuta
    · Qué hacer con dos peticiones concurrentes que traen la misma clave
1.5 Errores
    · Formato uniforme y único en toda la API: tipo, título, detalle, identificador de correlación
    · Accionable: qué hizo mal y qué hacer ahora; errores de validación por campo
    · Nunca filtrar traza, SQL, ruta interna ni versión de dependencia al cliente
1.6 Evolución sin romper
    · Aditivo por defecto; el consumidor debe ignorar los campos que no conoce
    · Nunca cambiar el tipo ni el significado de un campo existente; añadir uno nuevo
    · Versionar solo cuando se rompe de verdad; cada versión viva se paga
    · Deprecación: aviso, plazo publicado, medición de uso real antes de apagar
1.7 Colecciones
    · Cursor opaco y estable; el desplazamiento (offset) duplica y salta filas cuando el
      conjunto cambia entre páginas
    · Límite por defecto y límite máximo obligatorios; nunca devolver "todo"
    · Filtrado y ordenación acotados a lo que hay índice para servir
1.8 Caché HTTP y peticiones condicionales
    · ETag y Last-Modified; 304 para ahorrar ancho de banda y cómputo
    · Cache-Control explícito: público/privado, tiempo de vida, revalidación
    · If-Match para bloqueo optimista sobre el recurso → 412 si cambió (ver 2.6)
1.9 Límites, cuotas y protección de carga
    · Limitación de tasa: ventana fija · ventana deslizante · cubo de fichas (permite ráfaga)
      · cubo con fuga (suaviza)
    · Por identidad autenticada, no por IP a secas: NAT y proxies rompen el reparto
    · Comunicar el límite: cuota restante, momento de reinicio, Retry-After en el 429
    · Límite de ráfaga (protege al servidor) ≠ cuota de facturación (protege el negocio)
    · Limitar por coste, no solo por número: una consulta cara vale por muchas baratas
    · Dónde: en el borde lo barato, en la aplicación lo que necesita identidad
    · Límite de tamaño de cuerpo, de profundidad de anidamiento y de número de elementos
    · Tiempo de espera del propio servidor: la petición que nadie corta consume un trabajador
1.10 Operaciones largas
     · Aceptar y devolver un recurso de estado consultable, cancelable y con caducidad
     · Nunca mantener la conexión abierta esperando ni hacer trabajo pesado en la petición
1.11 Callbacks salientes
     · Firma de la carga útil con secreto compartido y marca de tiempo contra repetición
     · Reintentos con retroceso desde el emisor; idempotencia obligatoria en el receptor
     · Entrega al menos una vez y posiblemente desordenada: el receptor debe tolerarlo
1.12 Superficie del navegador
     · CORS explícito y restrictivo; entender qué dispara la petición previa
     · CORS no es control de acceso: es una política del navegador, no del servidor
1.13 Contrato como artefacto verificable
     · Especificación viva generada o validada contra el código, no documento aparte
     · Prueba de compatibilidad hacia atrás en integración continua
```

## 2. Datos y persistencia — `data/`

```
2.1 Elegir el motor por patrón de acceso
    · Cómo se lee, cómo se escribe, cuánto crece, qué consistencia exige
    · Relacional por defecto; desviarse exige justificar con un patrón concreto
    · El coste real de operar un motor más: copias, monitorización, conocimiento del equipo
2.2 Modelado y restricciones
    · Normalizar por defecto; desnormalizar con medición, no por intuición
    · Que el esquema haga imposible el dato imposible: NOT NULL, UNIQUE, CHECK, clave foránea
    · Las restricciones van en la base, no solo en el código: la base es el último guardián y
      el código no es el único que escribe
    · Clave sustituta vs. natural; identificadores ordenables en el tiempo frente a aleatorios,
      que fragmentan el índice
    · Enumeraciones: valor estable almacenado, nunca el ordinal del lenguaje
2.3 Tipos que se eligen mal una y otra vez
    · Dinero: decimal exacto o entero en la unidad mínima. Nunca coma flotante
    · Fecha y hora: instante en UTC; la zona aparte si el negocio la necesita — una cita futura
      no es un instante, es una hora local más una zona
    · Texto: UTF-8, normalización Unicode antes de comparar, colación consciente
    · Booleano de tres estados: si puede ser desconocido, no es un booleano
2.4 Índices
    · Un índice sirve a una forma de consulta: orden de columnas y regla del prefijo izquierdo
    · Selectividad: un índice sobre una columna con tres valores distintos no sirve de nada
    · Índice único como expresión de una regla de negocio, no solo como optimización
    · Índice parcial y de cobertura: cuándo compensan
    · Todo índice se paga en cada escritura; índices no usados y consultas sin índice son las
      dos caras del mismo descuido
    · Creación de índice sin bloquear la tabla en producción
2.5 Transacciones y aislamiento
    · Qué anomalía permite cada nivel: lectura sucia · lectura no repetible · fantasmas ·
      sesgo de escritura, el que sobrevive a "lectura confirmada" y nadie espera
    · El nivel por defecto del motor rara vez es el que el desarrollador cree
    · Transacción corta; nunca I/O externo dentro de una transacción
    · Interbloqueo: adquirir bloqueos siempre en el mismo orden; reintentar el perdedor
    · Alcance de la transacción = alcance de la invariante
2.6 Concurrencia sobre el dato
    · Actualización perdida: el bug silencioso más común de todo CRUD
    · Optimista: columna de versión y actualización condicionada a ella
    · Pesimista: bloqueo de fila explícito al leer, con tiempo de espera acotado
    · Escritura condicional o inserción-o-actualización atómica en vez de leer-modificar-escribir
    · Un contador se incrementa en el motor, no en memoria de la aplicación
2.7 Consultas
    · N+1: aparece como carga perezosa dentro de un bucle; se detecta contando consultas por petición
    · Proyección mínima; `SELECT *` es deuda que rompe al añadir una columna
    · Leer el plan de ejecución antes de optimizar; filas estimadas frente a filas reales
    · Sentencias preparadas: rendimiento e inmunidad a inyección en el mismo gesto
    · Consulta sin límite = incidente latente
2.8 Conexiones
    · El pool se dimensiona contra el límite del motor, no contra el número de instancias
    · Tiempo de espera de adquisición: agotar el pool debe fallar rápido, no colgar
    · Fuga de conexiones: el síntoma es "todo lento", la causa es una
    · Pooler externo cuando hay muchas instancias pequeñas contra un motor con límite bajo
2.9 Migraciones
    · Versionadas, en control de versiones, en orden, nunca editadas después de aplicarse
    · Expandir → migrar → contraer, en despliegues distintos: añadir columna anulable →
      escribir en ambas → rellenar por lotes → leer de la nueva → hacerla obligatoria →
      dejar de escribir la vieja → eliminarla
    · Relleno por lotes, reanudable, con pausa, sin bloqueo largo
    · Renombrar una columna es añadir, copiar y eliminar. Nunca un renombrado directo
    · Migración y despliegue de código son dos eventos separados
2.10 Ciclo de vida del dato
     · Retención declarada, archivado, borrado real frente a lógico
     · Toda tabla que solo crece es una bomba de relojería: particionar o purgar desde el día uno
2.11 Verdad y copias
     · Una sola fuente de verdad, declarada por dato
     · Caché, índice de búsqueda, réplica de lectura y almacén analítico: todos eventuales
     · Cómo se reconstruye cada copia desde la verdad, y cuánto tarda
2.12 Copias de seguridad
     · Una copia que nunca se ha restaurado no es una copia
     · Punto y tiempo objetivo de recuperación declarados; restauración ensayada con periodicidad
     · Copia inmutable y fuera de línea: la que sobrevive a un borrado accidental o a un cifrado
```

## 3. Concurrencia y trabajo diferido — `concurrency/`

```
3.1 Modelo de concurrencia del runtime
    · Hilos vs. bucle de eventos vs. corrutinas: qué se bloquea y qué no
    · Bloquear el hilo equivocado con una llamada síncrona tumba el servicio entero
    · Límite de concurrencia explícito hacia cada dependencia
3.2 Carreras
    · Sección crítica y dueño único del dato
    · Leer-modificar-escribir sin atomicidad; comprobar-y-luego-actuar
    · El "funciona en mi máquina" que en realidad es "funciona con un solo proceso"
3.3 Sacar trabajo del camino crítico
    · Qué puede esperar y qué no: la decisión es de producto, no técnica
    · Lo diferido necesita visibilidad: el usuario debe poder saber si ocurrió y si falló
    · Agrupar en lote lo repetido; unificar peticiones idénticas en vuelo
3.4 Semántica de entrega
    · Como mucho una vez · al menos una vez · "exactamente una vez"
    · Exactamente-una-vez no existe en la red: se emula con al-menos-una-vez más idempotencia
    · Deduplicación: clave, ventana de retención, registro de lo ya procesado
3.5 Colas
    · Siempre acotadas: una cola sin límite convierte latencia en caída
    · Contrapresión: rechazar rápido es mejor que aceptar y morir
    · Cola de mensajes fallidos: qué entra, quién la vigila, cómo se reprocesa
    · Mensaje envenenado: el que falla siempre y bloquea a los demás; límite de intentos
    · Tiempo de visibilidad mayor que el tiempo real de proceso, o el mensaje se duplica solo
    · Prefetch alto: un consumidor lento acapara trabajo que otros podrían hacer
3.6 Orden
    · Cuándo importa de verdad: casi nunca globalmente, a menudo por entidad
    · Partición por clave como forma barata de orden local
    · Orden global = un solo consumidor = sin escalado. Es un coste, no un valor por defecto
3.7 Tareas periódicas
    · Un solo ejecutor: qué pasa si dos instancias lanzan la misma tarea
    · Solapamiento: bloquear o saltar. Ejecución perdida: recuperar o ignorar. Pero decidido
    · Elección de líder o bloqueo consultivo con caducidad
3.8 Coordinación distribuida
    · Cerrojo distribuido: por qué casi nunca es la respuesta correcta
    · Si es inevitable: caducidad obligatoria, renovación, token de vallado
    · El caso que rompe todo: el dueño del cerrojo se congela y revive creyéndose dueño
3.9 Consistencia entre servicios
    · Bandeja de salida transaccional: dato y evento en la misma transacción, publicados
      después por un relé. Resuelve la doble escritura
    · Saga con compensación; la compensación no es un rollback y a veces no existe
    · Por qué el compromiso en dos fases casi nunca compensa
```

## 4. Fiabilidad y modos de fallo — `reliability/`

```
4.1 Presupuesto de tiempo
    · Tiempo de espera en TODA llamada externa; el valor por defecto suele ser "infinito"
    · Separar espera de conexión, de lectura y total
    · Plazo que se propaga: el trabajo cuyo cliente ya se fue debe morir, no terminar
    · El tiempo del llamante debe ser mayor que la suma de los internos, no al revés
4.2 Reintentos
    · Solo lo idempotente; reintentar lo que no lo es es duplicar en silencio
    · Retroceso exponencial CON aleatoriedad: sin jitter, todos los clientes vuelven a la vez
    · Presupuesto de reintentos: el reintento es el amplificador que convierte una degradación
      en una caída total
    · No reintentar en cada capa: tres capas con tres intentos son veintisiete peticiones
    · Respetar el Retry-After que devuelve el servidor
4.3 Aislamiento del fallo
    · Interruptor: dejar de llamar a lo que está caído; estado semiabierto para sondear la
      recuperación sin avalancha
    · Mamparo: pool o límite de concurrencia por dependencia, para que una lenta no consuma
      todos los trabajadores
    · Dependencia crítica frente a opcional, declarada por escrito
    · Degradación elegante: qué se sigue pudiendo hacer sin X; respuesta parcial con aviso
4.4 Fallo parcial
    · La escritura que quizá ocurrió: cómo se resuelve la duda sin adivinar
    · "¿Y si el proceso muere justo aquí?" en cada paso con efecto secundario
    · Reconciliación periódica como mecanismo de primera clase, no como script de rescate
4.5 Ciclo de vida del proceso
    · Arranque: validar la configuración y no aceptar tráfico antes de estar listo
    · Sonda de vivo frente a sonda de listo: confundirlas provoca reinicios en cascada bajo carga
    · Apagado ordenado: recibir la señal, dejar de aceptar, drenar del balanceador, terminar lo
      empezado dentro del período de gracia, cerrar recursos
4.6 Efectos de rebaño
    · Estampida de caché al expirar una clave caliente: caducidad con jitter, refresco
      anticipado, o un solo hilo repuebla mientras el resto sirve lo viejo
    · Reintentos sincronizados; arranque en frío simultáneo de toda la flota
4.7 Objetivos explícitos
    · Indicador y objetivo de nivel de servicio; presupuesto de error como moneda de cambio
    · La fiabilidad se decide y se paga; no se desea
4.8 Recuperación ante desastre
    · Qué se pierde y cuánto se tarda, con número; ensayo real, no documento
```

## 5. Rendimiento, escalado y coste — `performance/`

```
5.1 Medir antes de tocar
    · Perfilar, no adivinar; el cuello de botella nunca está donde parece
    · Optimizar sin medir es cambiar código legible por código que no era el problema
5.2 Distribución, no media
    · p50 / p95 / p99: el promedio esconde exactamente al usuario que se queja
    · Latencia de cola amplificada: si una petición hace diez llamadas, manda el p99 de ellas
    · Percentiles sobre histogramas; promediar percentiles entre instancias es falso
5.3 Teoría de colas aplicada
    · Utilización alta → espera desproporcionada; el 90% de uso no es "bien aprovechado"
    · Concurrencia = tasa × latencia: el número que dimensiona pools y trabajadores
5.4 El camino crítico
    · Contar viajes de red, no líneas de código
    · Lote frente a un viaje por elemento; paralelizar lo independiente, secuenciar solo lo dependiente
    · Compresión y campos que nadie usa: el ancho de banda también es latencia
5.5 Caché
    · La primera pregunta es de corrección, no de velocidad: ¿puede este dato estar obsoleto?
    · Estrategias: al lado · lectura directa · escritura directa · escritura diferida
    · Nivel: cliente · red de distribución · aplicación · motor. Cada uno con su invalidación
    · Caducidad, invalidación explícita, coherencia entre instancias
    · Caché negativa para no martillear con consultas que no devuelven nada
    · La caché como muleta que esconde un modelo de datos o un índice que faltan
5.6 Escalado horizontal
    · Qué lo impide: estado local en memoria, afinidad de sesión, fichero en disco local,
      tarea periódica única, cerrojo global
    · Vertical como puente honesto, no como derrota
5.7 Particionado y réplicas
    · Clave de partición y puntos calientes: el inquilino que es el 80% del tráfico
    · Retardo de réplica: leer tu propia escritura desde una réplica y no verla
    · Redistribuir datos es la operación más cara que existe: elegir bien la clave la primera vez
5.8 Recursos finitos
    · Memoria, presión del recolector de basura, descriptores de fichero, conexiones, hilos
    · Cuál se agota primero define el límite real del servicio
    · Fuga de memoria: crecimiento monótono entre reinicios como señal
5.9 Carga y capacidad
    · Prueba de carga con forma realista — mezcla de operaciones, datos con volumen de
      producción — no una única llamada en bucle
    · Comportamiento en saturación: degradar o rechazar, pero decidido de antemano
5.10 Coste como restricción de diseño
     · Coste por petición y por usuario; almacenamiento, tráfico de salida, consultas analíticas
     · Cardinalidad de métricas y volumen de registros: la factura de observabilidad sorprende
     · El diseño que escala pero no se puede pagar no escala
```

## 6. Seguridad aplicada al backend — `appsec/`

Este bloque dice **qué construir**. Cómo se rompe y cómo se detecta está en [../security/web/web.md](../security/web/web.md), [../security/owasp_api.md](../security/owasp_api.md) y [../security/databases/databases.md](../security/databases/databases.md).

```
6.1 Identidad
    · Autenticar en el borde; propagar identidad, no credenciales, hacia dentro
    · Servicio a servicio: identidad de carga de trabajo con credencial de vida corta,
      no un secreto compartido eterno
    · Factor múltiple: qué es resistente a phishing y qué no
6.2 Contraseñas y credenciales de usuario
    · Hasheo con función lenta, con sal y con factor de coste ajustable: Argon2id de preferencia;
      scrypt o bcrypt como alternativas; PBKDF2 solo si lo exige el cumplimiento.
      Nunca SHA-256/SHA-1/MD5 a secas. Nunca cifrado reversible
    · Sal única por contraseña, de generador criptográficamente seguro; no es secreta y se
      almacena junto al hash. La sal impide las tablas precalculadas, no el ataque dirigido
    · Pimienta — secreto del servidor, fuera de la base — como capa adicional opcional
    · Factor de coste calibrado al hardware actual y revisado con el tiempo; rehasheo
      transparente en el siguiente inicio de sesión correcto
    · Comparación en tiempo constante en todo lo que sea secreto
    · Longitud mínima generosa y máxima alta; sin reglas de composición absurdas;
      contraste contra listas de contraseñas ya filtradas
    · Restablecimiento: token de un solo uso, aleatorio, de vida corta, almacenado hasheado;
      invalidar todas las sesiones al cambiar la contraseña
    · Enumeración de usuarios: respuesta y tiempo uniformes exista o no la cuenta
    · Limitación de intentos por cuenta y por origen, con retroceso creciente
    · La contraseña nunca se registra, nunca se devuelve, nunca se envía por correo
6.3 Sesiones y credenciales de acceso
    · Con estado (revocable, requiere consulta) frente a autocontenido (escala, difícil de
      revocar): el intercambio real es revocación frente a escala
    · Identificador de sesión con entropía suficiente, regenerado al elevar privilegio
    · Vida corta más credencial de renovación con rotación y detección de reutilización
    · Si el token es autocontenido: validar firma Y algoritmo Y emisor Y audiencia Y caducidad.
      Nunca aceptar el algoritmo que indica el propio token
    · Cierre de sesión que realmente invalida en el servidor
6.4 Autorización
    · Sobre el objeto, no sobre la ruta: el fallo más frecuente y más caro del backend
    · La comprobación vive junto al acceso al dato, no en un middleware lejano que se olvida
    · Denegar por defecto; el permiso se concede explícitamente
    · Modelo elegido a conciencia: por rol · por atributo · por relación
    · Multi-inquilino: el aislamiento es una invariante del esquema, no un filtro que se puede
      olvidar en una consulta
6.5 Entrada no confiable
    · Todo lo que cruza el borde, incluido lo que viene de otro servicio propio
    · Parametrizar, no escapar; lista de permitidos para lo que no se puede parametrizar,
      como nombres de columna, criterios de orden o rutas
    · Canonicalizar una sola vez y validar después
    · Deserialización que instancia tipos arbitrarios: prohibida sobre entrada externa
    · Peticiones salientes construidas con datos del usuario: lista de destinos permitidos
    · Subida de ficheros: tipo verificado por contenido, tamaño limitado, almacenamiento fuera
      del árbol servido, nombre generado por el servidor
6.6 Secretos y configuración sensible
    · Fuera del repositorio, con alcance mínimo, rotables y auditados
    · Gestor de secretos frente a variables de entorno: las variables acaban en volcados y registros
    · Escaneo de secretos en el repositorio y en su histórico
    · Un secreto filtrado se rota; no basta con borrarlo del commit
6.7 Datos sensibles
    · Clasificar y minimizar: el dato que no se guarda no se filtra
    · Cifrado en tránsito siempre; en reposo según clasificación; por campo para lo crítico
    · Generador criptográficamente seguro para todo lo aleatorio con valor de seguridad —
      tokens, identificadores de sesión, claves. El generador por defecto del lenguaje no lo es
    · Firma o código de autenticación de mensaje para lo que viaja fuera del sistema
    · Qué nunca se registra: credenciales, tokens, medios de pago, datos personales
6.8 Rastro auditable
    · Quién hizo qué, cuándo y sobre qué; suficiente para una investigación posterior
    · Inmutable y separado de los registros de aplicación
6.9 Dependencias y cadena de suministro
    · Fichero de bloqueo con versiones fijadas; construcción reproducible
    · Escaneo de vulnerabilidades conocidas en integración continua
    · Cada dependencia añadida es superficie de ataque y de mantenimiento
```

## 7. Observabilidad — `observability/`

```
7.1 Para qué sirve cada señal
    · Registro = evento concreto · Métrica = agregado barato · Traza = causalidad entre servicios
      · Perfil = dónde se va el coste
    · Usar la equivocada es caro: las métricas se pagan en cardinalidad, los registros en volumen
7.2 Correlación
    · Identificador de traza que atraviesa todo, incluido lo asíncrono y lo diferido: en la
      cabecera de la petición y en los metadatos del mensaje
    · Sin correlación, tres señales son tres islas y depurar es adivinar
7.3 Registros
    · Estructurados en clave-valor, no texto libre que luego hay que analizar con expresiones regulares
    · El nivel debe significar algo: error = alguien tiene que actuar
    · Registrar decisiones y bordes de I/O, no el flujo línea a línea
    · Sin datos personales ni secretos; muestreo de lo repetitivo
7.4 Métricas
    · Tasa, errores y duración en el borde; utilización, saturación y errores en cada recurso
    · Instrumento correcto: contador para lo acumulativo, medidor para lo instantáneo,
      histograma para lo que se va a percentilar
    · Cardinalidad: una etiqueta con el identificador de usuario multiplica la serie por millones.
      Es el error caro más frecuente
7.5 Trazas
    · Instrumentar los bordes de entrada y salida; atributos útiles en el tramo
    · Muestreo con sesgo hacia lo lento y lo erróneo, no aleatorio uniforme
7.6 Alertas
    · Sobre síntoma del usuario y consumo de presupuesto de error, no sobre causa: avisar de
      "CPU al 90%" es avisar de algo que quizá no le importa a nadie
    · Toda alerta con acción concreta; si no la hay, es un panel, no una alerta
    · Fatiga: la alerta que se ignora es peor que no tenerla
7.7 Depurabilidad
    · Poder responder "¿qué le pasó a ESTA petición concreta?" sin desplegar código nuevo
```

## 8. Arquitectura y límites — `architecture/`

```
8.1 Acoplamiento y cohesión
    · La única propiedad que predice el coste a cinco años
8.2 Límites por dominio
    · Separar por razón de cambio, no por capa técnica
    · Un límite bien puesto se nota porque los cambios habituales no lo cruzan
8.3 Dirección de las dependencias
    · Hacia dentro: el dominio no conoce el framework, ni el motor, ni el transporte
    · Adaptadores en el borde; la testabilidad sin infraestructura es la consecuencia
8.4 Monolito modular primero
    · Microservicios cuando el coste organizativo lo justifique, no antes
    · Qué se paga al partir: red, consistencia, despliegue coordinado, depuración distribuida
    · Partir por un límite mal puesto multiplica el problema en vez de resolverlo
8.5 Comunicación entre servicios
    · Síncrono acopla disponibilidad; asíncrono acopla esquema
    · Cadena de llamadas síncronas = producto de disponibilidades: cinco al 99,9% dan 99,5%
8.6 Dato por dueño
    · Una base compartida entre servicios es un contrato sin especificar que nadie puede cambiar
8.7 Configuración y entorno
    · Mismo artefacto, distinta configuración; nada de ramas ni compilaciones por entorno
    · Configuración validada al arrancar, no la primera vez que se usa
    · Paridad razonable entre entornos: lo que solo falla en producción es lo que solo existe allí
```

## 9. Pruebas — `testing/`

```
9.1 Qué confianza compra cada nivel
    · Unidad, integración, contrato, extremo a extremo: coste de mantenimiento frente a señal
    · Cobertura alta no es confianza: mide líneas ejecutadas, no invariantes comprobadas
9.2 Determinismo
    · Sin reloj real — inyectarlo —, sin red real, sin orden implícito, sin estado compartido
    · Semilla fija para lo aleatorio
    · Un test intermitente es peor que ningún test: entrena al equipo a ignorar el rojo
9.3 Dobles frente a dependencia real
    · Cuándo el simulacro miente: el motor real tiene aislamiento, restricciones y concurrencia
      que el doble no reproduce
    · Motor real efímero para todo lo que dependa de su comportamiento
9.4 Contratos entre servicios
    · La prueba que evita romper a otro equipo sin tener que desplegar los dos juntos
9.5 Datos de prueba
    · Construcción explícita y mínima; el test debe leerse sin abrir otro fichero
    · Nunca datos de producción sin enmascarar
9.6 Invariantes y propiedades
    · Probar la invariante, no el ejemplo
    · Concurrencia, reintento y fallo parcial como escenarios de prueba, no como suposición
9.7 Más allá de lo funcional
    · Carga, fallo inyectado, migración ensayada sobre volumen realista
9.8 Qué no probar
    · El framework, el accesor trivial, el detalle de implementación que cambiará mañana
```

## 10. Entrega y operación — `delivery/`

```
10.1 Construcción reproducible
     · Mismo commit → mismo artefacto; dependencias fijadas; artefacto inmutable y versionado
     · Se promueve el mismo artefacto entre entornos; no se reconstruye para producción
10.2 Despliegue sin interrupción
     · Progresivo, azul/verde o canario, con criterio de avance y de aborto medido
     · Compatibilidad N-1 obligatoria: durante el despliegue conviven dos versiones
10.3 Desacoplar despliegue de activación
     · Banderas de funcionalidad: desplegar no es lanzar
     · Toda bandera con dueño y fecha de retirada; las banderas viejas son deuda ramificada
10.4 Reversibilidad
     · Todo cambio con camino de vuelta probado
     · El que no lo tiene — migración destructiva, evento ya emitido, correo ya enviado — se
       trata distinto y se aprueba distinto
10.5 Operación
     · Manual de actuación por alerta, con el primer paso ejecutable
     · Propiedad clara del servicio: quien lo escribe lo opera
10.6 Aprender del fallo
     · Análisis posterior sin culpa, con acción concreta, dueño y fecha
```

## 11. Código y mantenibilidad — `code/`

```
11.1 Errores
     · Como valor o como excepción, pero coherente en todo el código base
     · Nunca capturar y tragar; nunca capturar genérico sin volver a lanzar
     · Añadir contexto al propagar sin perder la causa original
     · Distinguir error esperado del dominio de fallo del programa: se tratan distinto
11.2 Tipos y fronteras
     · Validar una vez en el borde y modelar el dato ya validado con un tipo propio
     · Si el tipo no puede representar el estado inválido, no hay que comprobarlo cada vez
11.3 Núcleo puro, efectos en el borde
     · Lo que hace un sistema testeable sin levantar infraestructura
11.4 Dependencias
     · Explícitas e inyectadas; cada una añadida es superficie que hay que mantener y actualizar
11.5 Legibilidad
     · Nombres que dicen la intención; la función hace una cosa
     · Se lee muchas más veces de las que se escribe
11.6 Deuda explícita
     · Anotada, con dueño y motivo; la deuda descubierta cuesta el triple que la declarada
```

## Mapeo rama → módulo

Todo módulo cierra con una sección accionable, nunca con otra tabla. Es la regla más consistente de [../security/SKILL.md](../security/SKILL.md): *"Nunca terminar en depende"*. La última columna la fija por adelantado.

| # | Rama | Módulo | `tipo` | Sección de cierre |
|---|---|---|---|---|
| — | Enrutador y protocolo | `SKILL.md` | — | Límites |
| — | Vocabulario y métricas | `glossary.md` | `referencia` | — |
| 1 | Contrato y API | `api/api.md` | `modelo` | Verificación mínima antes de publicar un contrato |
| 2 | Datos y persistencia | `data/data.md` | `modelo` | Las siete preguntas antes de crear una tabla |
| 3 | Concurrencia y trabajo diferido | `concurrency/concurrency.md` | `modelo` | Regla de diseño ante un fallo parcial |
| 4 | Fiabilidad y modos de fallo | `reliability/reliability.md` | `catalogo` | Los seis controles que más reducen la indisponibilidad |
| 5 | Rendimiento, escalado y coste | `performance/performance.md` | `modelo` | Procedimiento de diagnóstico de latencia |
| 6 | Seguridad aplicada al backend | `appsec/appsec.md` | `modelo` | Verificación mínima antes de exponer un servicio |
| 7 | Observabilidad | `observability/observability.md` | `modelo` | Métricas que importan y métricas engañosas |
| 8 | Arquitectura y límites | `architecture/architecture.md` | `modelo` | Señales de que un límite está mal puesto |
| 9 | Pruebas | `testing/testing.md` | `modelo` | Errores frecuentes |
| 10 | Entrega y operación | `delivery/delivery.md` | `modelo` | Lista de comprobación previa al despliegue |
| 11 | Código y mantenibilidad | `code/code.md` | `modelo` | Errores frecuentes |
| — | Antipatrones transversales | `antipatterns.md` | `catalogo` | Cómo se detectan desde fuera |
| — | Diagnóstico por síntoma | `playbooks/*.md` | `playbook` | Prevención |

Carpeta epónima para el área técnica que puede subdividirse; archivo suelto en la raíz para lo transversal cerrado. Con este árbol, `data/` y `appsec/` se salen del rango de tamaño habitual: al escribirlos se parten como hace `security/ai/`, en `data/data.md` + `data/migrations.md` y `appsec/appsec.md` + `appsec/authn.md`.

## Modos de respuesta del enrutador

| Modo | Pregunta típica | Forma de salida |
|---|---|---|
| `DISEÑAR` | "¿Cómo estructuro X?" | Requisitos → invariantes en juego → opciones con coste → recomendación → qué se rompe primero |
| `MODELAR_DATOS` | "¿Cómo guardo esto?" | Patrón de acceso → motor → esquema y restricciones → índices → plan de migración |
| `DIAGNOSTICAR` | "Va lento / falla a veces" | Síntoma → qué medir → hipótesis → confirmación → causa → arreglo y prevención |
| `REVISAR` | "Revisa este diseño o este código" | Invariantes en riesgo, por severidad, cada una con escenario de fallo concreto |
| `ELEGIR` | "¿A o B?" | Restricciones reales → criterio de decisión → recomendación. Nunca un catálogo neutral |
| `EVOLUCIONAR` | "Cambiar esto sin romper nada" | Estado actual → pasos de expandir y contraer → compatibilidad → punto de retorno |
| `OPERAR` | "Está caído en producción" | Mitigar antes que entender: estabilizar → contener → causa raíz después |

## Formato de las tablas

Equivalente a `Técnica | ATT&CK | Precondición | Efecto | Detección | Mitigación` de `security/`. Una fila = una unidad recuperable por sí sola.

| Tipo de bloque | Columnas |
|---|---|
| Práctica | `Práctica \| Por qué \| Cómo se viola \| Cómo se verifica` |
| Decisión | `Opción \| Cuándo encaja \| Qué cuesta \| Cuándo NO` |
| Modo de fallo | `Modo de fallo \| Síntoma observable \| Causa habitual \| Mitigación de diseño` |

La columna **"Cómo se verifica"** es la que impide que el árbol degenere en dogma: si una práctica no se puede comprobar, no entra.

## Reglas duras

- **Anclaje obligatorio**: cada práctica declara qué invariante protege y con qué señal se observa rota.
- **Filtro de admisión**: si una afirmación depende de la versión de una herramienta, no entra. La excepción admitida son las recomendaciones de algoritmo — qué función de derivación de clave usar, con qué parámetros de coste —: el algoritmo es agnóstico pero la recomendación caduca, así que va con `consulta_externa` a la guía vigente.
- **Nunca inventar**: ni un número de rendimiento, ni un límite de un servicio, ni un parámetro de coste concreto, ni un valor por defecto de configuración. Si no se sabe, se dice y se nombra dónde se verifica.
- **Sin duplicación**: el conocimiento vive en un módulo y los demás enlazan. La idempotencia se explica en `concurrency/`, y `api/` y `reliability/` enlazan a ella. La limitación de tasa se explica en `api/`, y `reliability/` la referencia como control de sobrecarga.
- **Enlace cruzado con `security/`**: `appsec/` no reexplica ataques; enlaza.

## Decisiones pendientes

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| 1 | Carpeta `api/` en la raíz del repo, hermana de `backend/` | Borrarla, o reservarla para una skill de API que enlace a `backend/api/` | Borrarla: el contrato es inseparable del núcleo de razonamiento de backend |
| 2 | Frontera entre `appsec/` y `security/` | `appsec/` fino que delega casi todo, o `appsec/` con las decisiones de diseño | `appsec/` dice qué construir, `security/` dice cómo se rompe y cómo se detecta |
| 3 | Rama 11, `code/` | Mantener, fusionar con `architecture/`, o descartar | Pendiente: es la más cercana a estilo y la más discutible en una skill agnóstica |
| 4 | `playbooks/` de diagnóstico por síntoma | En esta versión o después | Después: primero los once módulos |
| 5 | Movimiento a `security/` sin commitear | Commitear el movimiento antes de añadir `backend/` | Sí, para que el histórico registre un movimiento y no un borrado masivo de 81 ficheros |
| 6 | Nombre del repositorio | `Skills-de-Ciberseguridad` frente a un nombre de monorepo multi-skill | Pendiente |
