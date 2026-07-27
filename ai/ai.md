---
id: ai/ai
tipo: catalogo
estabilidad: permanente
consulta_externa: https://genai.owasp.org (LLM Top 10) · https://atlas.mitre.org (MITRE ATLAS) · NIST AI RMF y AI 600-1
---

# Seguridad de IA y LLM

Superficie de ataque de sistemas basados en modelos de lenguaje. Lo relativo a agentes, herramientas y MCP está en [ai/agents_mcp.md](agents_mcp.md).

## La premisa que lo explica todo

**Un LLM no distingue instrucciones de datos.** Todo lo que entra en la ventana de contexto —system prompt, mensaje del usuario, documento recuperado, resultado de una herramienta, contenido de una página web— es el mismo flujo de tokens. No existe un mecanismo equivalente a las consultas parametrizadas de SQL.

Consecuencias:

1. **La inyección de prompts no tiene solución completa.** Se mitiga por arquitectura, nunca se elimina con filtros de entrada.
2. **La confianza debe estar en el perímetro del sistema, no en el modelo.** Todo control de seguridad efectivo vive fuera del modelo: en la autorización, en el sandbox, en la validación de la salida.
3. **La salida del modelo es entrada no confiable** para cualquier componente que la consuma.

## Marcos de referencia

| Marco | Uso |
|---|---|
| OWASP Top 10 for LLM Applications | Taxonomía de riesgos de aplicación |
| MITRE ATLAS | Equivalente de ATT&CK para sistemas de IA: tácticas y técnicas del adversario |
| NIST AI RMF (AI 100-1) y perfil de IA generativa (AI 600-1) | Gestión de riesgo organizacional |
| ISO/IEC 42001 | Sistema de gestión de IA certificable |

## OWASP LLM Top 10 (edición 2025)

| ID | Riesgo | Núcleo del problema |
|---|---|---|
| LLM01 | Prompt Injection | Instrucciones del atacante interpretadas como legítimas |
| LLM02 | Sensitive Information Disclosure | El modelo revela datos de contexto, de entrenamiento o de otros usuarios |
| LLM03 | Supply Chain | Modelos, datasets, adaptadores y librerías de origen no verificado |
| LLM04 | Data and Model Poisoning | Manipulación de datos de entrenamiento, ajuste fino o RAG |
| LLM05 | Improper Output Handling | La salida se ejecuta o se renderiza sin validar |
| LLM06 | Excessive Agency | El sistema puede actuar más allá de lo necesario |
| LLM07 | System Prompt Leakage | Fuga de instrucciones y de secretos colocados en el prompt |
| LLM08 | Vector and Embedding Weaknesses | Ataques sobre el almacén vectorial y la recuperación |
| LLM09 | Misinformation | Salida incorrecta tratada como fiable |
| LLM10 | Unbounded Consumption | Coste y recursos sin límite |

## Inyección de prompts

| Variante | Vector | Ejemplo de impacto |
|---|---|---|
| **Directa** | El usuario escribe la instrucción maliciosa | Saltarse restricciones, obtener contenido prohibido |
| **Indirecta** | El contenido malicioso llega en un dato que el sistema recupera: página web, PDF, correo, ticket, repositorio, resultado de búsqueda | **La más peligrosa**: el atacante no necesita acceso al sistema, solo colocar el contenido donde el modelo lo leerá |
| Multi-turno / crescendo | Se construye el contexto a lo largo de la conversación | Erosión progresiva de las restricciones |
| Cross-session | El contenido queda en memoria persistente y afecta a sesiones futuras | Persistencia real dentro del sistema de IA |
| Multimodal | Instrucciones dentro de una imagen, audio o vídeo | Evade filtros que solo analizan texto |
| Codificada u ofuscada | Base64, homóglifos, caracteres invisibles, texto blanco sobre blanco, ROT13 | Evade filtros por palabras clave |
| En idioma minoritario o mezclado | El filtrado suele estar entrenado en inglés | Evade moderación |
| Payload split | La instrucción se reparte entre varias fuentes y se ensambla en el contexto | Ninguna fuente parece maliciosa por separado |

**Mitigaciones reales** (ninguna es completa por sí sola; hay que combinarlas):

| Mitigación | Efecto |
|---|---|
| **Autorización fuera del modelo** | El sistema solo puede hacer lo que la identidad del usuario ya podía hacer. Convierte una inyección exitosa en un problema acotado |
| **Separación de canales** | Marcar y delimitar el contenido no confiable; usar campos distintos para instrucciones y para datos cuando la API lo permita |
| **Principio de mínima agencia** | Menos herramientas, con menos alcance y con parámetros restringidos |
| **Confirmación humana** para acciones irreversibles | Envío de correo, borrado, pago, cambio de configuración |
| **Validación de la salida** contra un esquema estricto | Impide que la salida se convierta en ejecución |
| **Aislamiento del contenido recuperado** | Procesarlo en una llamada distinta, sin acceso a herramientas |
| **Doble modelo** (uno que planifica sin ver datos no confiables, otro que resume datos sin acceso a herramientas) | Rompe la cadena entre "leer contenido hostil" y "actuar" |
| Filtros de entrada y de salida | Elevan el coste; se evaden con reformulación. Nunca como control único |
| Registro completo de prompts y de acciones | Detección e investigación |

## Manipulación de datos y del modelo

| Ataque | Momento | Efecto | Defensa |
|---|---|---|---|
| Envenenamiento de datos de entrenamiento | Preentrenamiento | Sesgo o comportamiento arbitrario; puertas traseras | Procedencia de datos, filtrado, detección de anomalías |
| Envenenamiento en ajuste fino | Fine-tuning | Puerta trasera activada por un disparador concreto | Control de acceso al pipeline, revisión de datasets, evaluación con conjuntos de prueba propios |
| Backdoor por disparador | Entrenamiento | El modelo se comporta normal salvo ante una frase específica | Muy difícil de detectar: depende de la confianza en la cadena de suministro |
| **Envenenamiento de RAG** | Operación | Insertar documentos que el recuperador devolverá, con instrucciones o desinformación | Control de escritura sobre el corpus, procedencia por documento, revisión de fuentes |
| Envenenamiento de embeddings | Indexación | Documento diseñado para ser recuperado ante muchas consultas | Detección de documentos con similitud anómalamente alta y ubicua |
| Manipulación de la memoria del agente | Operación | Instrucción persistente entre sesiones | Memoria con esquema, sin texto libre ejecutable, revisable y expirable |
| Model tampering | Distribución | Pesos modificados | Firma y verificación de artefactos, hash conocido |

## Cadena de suministro de modelos

| Riesgo | Detalle | Control |
|---|---|---|
| Formatos de serialización inseguros | Los checkpoints en `pickle` ejecutan código al cargarse | Usar `safetensors`; nunca cargar un `.pt`/`.pkl` de origen no verificado |
| Modelos de repositorios públicos | Sin garantía de procedencia ni de comportamiento | Verificar autoría, hash, licencia; evaluar antes de desplegar |
| Adaptadores LoRA y cuantizaciones de terceros | Modifican el comportamiento con muy poco código | Mismo control que un modelo completo |
| Datasets de terceros | Origen del envenenamiento | Procedencia, muestreo y revisión |
| Dependencias del ecosistema ML | Librerías con RCE en el parseo de modelos | SCA, actualización, ejecución en sandbox |
| Registro de modelos sin control de acceso | Sustitución del modelo en producción | Firma, control de acceso, inmutabilidad de versiones |
| Plugins y extensiones de terceros | Ejecutan con los permisos del sistema | Revisión, allow-list, aislamiento |

## Fuga de información

| Vía | Detalle | Control |
|---|---|---|
| System prompt leakage | El modelo revela sus instrucciones; frecuentemente contienen reglas de negocio, endpoints y a veces credenciales | **Nunca poner secretos en el prompt**: asumir que el prompt es público |
| Datos de otros usuarios en el contexto | Multi-inquilino mal aislado, caché compartida | Aislamiento estricto por inquilino en el contexto, en la caché y en el índice vectorial |
| RAG que devuelve documentos sin comprobar permisos | El recuperador ignora la autorización del usuario | **Filtrar por permisos en la consulta al índice**, no después de recuperar |
| Memorización de datos de entrenamiento | El modelo reproduce fragmentos literales | Deduplicación, privacidad diferencial, evaluación de memorización |
| Inferencia de pertenencia (membership inference) | Determinar si un registro estuvo en el entrenamiento | Regularización, privacidad diferencial |
| Inversión del modelo | Reconstruir datos de entrenamiento | Limitar la exposición de logits y de probabilidades |
| Extracción del modelo | Replicar el modelo mediante consultas masivas | Límites de tasa, marcas de agua, detección de patrones de consulta sistemáticos |
| Datos sensibles en logs de prompts | Los logs contienen todo lo que el usuario escribió | Clasificar y proteger los logs como datos personales; retención mínima |
| Salida a canales no autorizados | El modelo redacta datos internos en una respuesta pública | Clasificación de salida, DLP |

## Manejo inseguro de la salida

La salida del LLM es **entrada no confiable**. Los fallos aquí son vulnerabilidades web clásicas con un nuevo origen.

| Consumo de la salida | Vulnerabilidad resultante | Control |
|---|---|---|
| Renderizado como HTML | XSS | Escapado por contexto, CSP |
| Renderizado como Markdown con imágenes | **Exfiltración**: una imagen con la URL `https://atacante/?d=<datos>` filtra el contexto al renderizarse | Bloquear la carga de imágenes externas; allow-list de dominios en Markdown |
| Ejecución como código | RCE | Sandbox sin red ni credenciales; nunca `eval` |
| Consulta a base de datos | Inyección SQL | Parametrización; el modelo elige valores, no estructura |
| Comando de sistema | Inyección de comandos | Allow-list de comandos y argumentos |
| Llamada a API | SSRF, abuso de la API | Allow-list de destinos, validación de parámetros |
| Enlaces mostrados al usuario | Phishing con confianza prestada | Validar y marcar los enlaces generados |
| Decisión automática | Manipulación del proceso de negocio | Revisión humana en decisiones con impacto |

## Consumo y coste

| Riesgo | Control |
|---|---|
| Denial of wallet: consultas caras a escala | Límites por usuario, por clave y globales; presupuesto con alerta y corte |
| Contexto inflado a propósito | Límite de tamaño de entrada y de documentos recuperados |
| Bucles de agente sin fin | Límite de iteraciones, de tiempo y de coste por tarea |
| Abuso de la clave de API robada | Rotación, restricción por origen, cuotas, alerta ante uso anómalo |
| Ataques de agotamiento sobre el modelo | Rate limiting, colas, degradación controlada |

## Shadow AI

Uso de herramientas de IA fuera del control de la organización. Riesgo principal: **datos corporativos enviados a servicios de terceros** sin acuerdo de tratamiento ni control de retención.

Gestión: inventario del uso real (a través del proxy y del CASB), oferta de una alternativa aprobada y usable (prohibir sin alternativa solo mueve el uso a canales invisibles), política clara sobre qué datos pueden salir, y DLP sobre los destinos de IA generativa.

## Detección y monitorización

| Señal | Interpretación |
|---|---|
| Patrones de inyección conocidos en la entrada o en el contenido recuperado | Intento de manipulación |
| Salida que contiene el system prompt o fragmentos de él | Fuga en curso |
| Volumen de consultas sistemático y exhaustivo desde una misma clave | Extracción de modelo |
| Llamadas a herramientas fuera del patrón esperado para la tarea | Inyección exitosa |
| Recuperación repetida del mismo documento ante consultas dispares | Envenenamiento de embeddings |
| Salida con URLs a dominios externos no esperados | Intento de exfiltración por renderizado |
| Pico de coste o de tokens por usuario | Abuso o bucle |
| Fallos de validación de esquema en la salida | El modelo está siendo empujado fuera de su formato |

Requisito previo: **registrar la traza completa** —prompt, contenido recuperado, llamadas a herramientas con sus argumentos, salida— con la protección de datos que ese registro implica. Sin traza no hay investigación posible.

## Arquitectura defensiva

Diseño que resiste una inyección exitosa:

1. **La identidad del usuario propaga hasta el recurso.** El sistema de IA nunca actúa con más permisos que quien lo invoca.
2. **Autorización en el recurso, no en el prompt.** Ninguna instrucción del sistema puede sustituir a un control de acceso.
3. **Contenido no confiable procesado en un contexto sin herramientas.**
4. **Salida validada contra esquema** antes de que cualquier componente la consuma.
5. **Acciones irreversibles con confirmación humana** que muestre exactamente qué se va a hacer.
6. **Sandbox sin red ni credenciales** para toda ejecución de código generado.
7. **Límites de coste, de tiempo y de iteraciones** en todo bucle autónomo.
8. **Traza completa auditable** de prompts, herramientas y decisiones.
9. **Evaluación adversaria continua** (red teaming de IA) como parte del ciclo, no como auditoría puntual.
10. **Asumir que el modelo será manipulado** y diseñar para que el daño esté acotado cuando ocurra.
