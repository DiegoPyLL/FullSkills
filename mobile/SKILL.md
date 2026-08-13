---
name: mobile
description: Base de conocimiento de plataformas móviles para razonar (no solo listar) sobre iOS y Android en dos ejes. Seguridad del dispositivo: modelo de amenaza por perfil de usuario, superficie de ataque, cadenas de exploits y spyware comercial, arquitectura de mitigación y cómo se ha eludido cada una, cadena de parcheo y niveles de parche, endurecimiento con su coste real, y triage de un terminal sospechoso. Producto: restricciones de la App Store y de privacidad, ejecución en segundo plano, diseño de interfaz nativa y convenciones de plataforma, accesibilidad, trabajo sin conexión, rendimiento y energía, entrega y compatibilidad con clientes antiguos. Se invoca cuando la pregunta es sobre la seguridad de un teléfono o una tableta —si un dispositivo está comprometido, qué lo protege de verdad, qué vector aplica, qué conviene configurar y a qué precio—, cuando hay que interpretar un CVE, una campaña de spyware o un aviso de fabricante de móvil, o cuando hay que decidir un patrón de navegación, resolver un rechazo de tienda o planificar la publicación de una app móvil.
---

# Skill de Móvil — índice y protocolo

Este archivo es el enrutador. No contiene conocimiento de dominio: decide qué módulo cargar y cómo razonar con él.
Hermano de [../security/SKILL.md](../security/SKILL.md), [../backend/SKILL.md](../backend/SKILL.md) y [../seo/SKILL.md](../seo/SKILL.md); mismas convenciones de formato, dominio distinto.

**Todo lo específico de una plataforma vive en su carpeta**: [`ios/`](ios/ios.md) y [`android/`](android/android.md). Fuera de ellas solo queda lo transversal — construcción y entrega en [`practices/`](practices/practices.md), criterio de adopción en [`trends/`](trends/trends.md).

## 1. Alcance: el dispositivo y el producto, no la app por dentro

Dos ejes, con frontera limpia entre ellos y con `security/`:

| Eje | Qué cubre |
|---|---|
| **Dispositivo** | Qué aísla qué, qué entra sin que el usuario toque nada, qué mitigación existe y desde cuándo, y qué se puede afirmar sobre un terminal concreto |
| **Producto** | Qué deja construir la plataforma, cómo se diseña para ella y cómo se entrega una app que no se puede desplegar |

Lo que **no** es suyo:

| Pregunta | Dónde vive |
|---|---|
| Seguridad de la app que se construye: almacenamiento, criptografía, red, resiliencia, MASVS | [../security/mobile/mobile.md](../security/mobile/mobile.md) |
| Mecánica de ataque genérica, detección, respuesta a incidentes, forense | [../security/](../security/SKILL.md) |
| La API que hay detrás de la app | [../backend/](../backend/SKILL.md) · [../security/owasp_api.md](../security/owasp_api.md) |

La frontera con `security/` es **el objeto, no el verbo**: el dispositivo y el sistema son de aquí —incluido responder a un compromiso—; la app que se construye es de `security/mobile/`. Quien pregunta *"¿dónde guardo este token?"* va allí; quien pregunta *"¿me pueden entrar en el teléfono?"* se queda aquí.

Regla dura, común a todo el repositorio: **nunca inventar** un identificador CVE, una versión de corrección, un nombre de campaña, una regla de revisión de tienda ni una atribución a un actor. Si el dato no está en el módulo, se dice y se nombra la fuente. Un CVE mal atribuido es peor que ninguna respuesta — hay un catálogo de los que circulan mal en [android_exploits.md](android/android_exploits.md#identificadores-que-circulan-mal-atribuidos) y en [ios_exploits.md](ios/ios_exploits.md#identificadores-que-circulan-mal-atribuidos).

## 2. Protocolo de respuesta

1. **Clasificar la intención** en uno de estos modos y responder con la forma de salida que le corresponde.

**Seguridad del dispositivo**

| Modo | Pregunta típica | Forma de salida |
|---|---|---|
| `PERFILAR` | "¿Qué me protege a mí?" | Determinar el perfil —masivo, dirigido, físico-forense— **antes** de recomendar nada. Sin perfil no hay recomendación, hay lista |
| `EVALUAR_DISPOSITIVO` | "¿Este teléfono es seguro?" | Plataforma → versión → nivel de parche real → estado del arranque → ¿sigue con soporte? → veredicto |
| `TRIAR` | "Creo que me han comprometido el móvil" | Preservar antes de tocar → consultas de solo lectura → qué es anómalo → **qué no permite descartar** |
| `EXPLICAR_VECTOR` | "¿Cómo entra el spyware?" | Entrada → interacción requerida → aislamiento que atraviesa → qué lo reduce |
| `ENDURECER` | "¿Qué activo?" | Controles priorizados por perfil, cada uno **con su coste**. Un control sin coste declarado es un control que el usuario revertirá |
| `ANALIZAR_CVE` | "¿Me afecta esta vulnerabilidad?" | Componente → interacción → alcance verificado → si existe parche **para ese dispositivo**, que no es lo mismo que si existe corrección |

**Producto**

| Modo | Pregunta típica | Forma de salida |
|---|---|---|
| `DISEÑAR` | "¿Pestañas o pila para esta navegación?" | Patrón, cuándo falla y qué cuesta. Convención de plataforma antes que preferencia |
| `PUBLICAR` | "Me rechazaron la app" | Familia de rechazo concreta y alternativa viable, no una lectura literal del reglamento |
| `EVALUAR_TENDENCIA` | "¿Adopto esto ya?" | Criterio de adopción sobre datos propios de parque, no sobre novedad |

2. **Enrutar** con la tabla de la sección 4. Cargar solo los módulos necesarios: el permanente para razonar, el volátil solo si hace falta un CVE o una campaña concreta.
3. **Cerrar con acción**: qué configurar, qué comprobar, qué no se puede afirmar. Nunca terminar en "depende".

## 3. Núcleo de razonamiento

Un agente que solo enumera vulnerabilidades móviles falla. Estos seis modelos son lo que hay que aplicar:

**a) El perfil manda, y equivocarlo es caro en las dos direcciones.** Los controles no son intercambiables: aplicar los del perfil dirigido a un usuario masivo consume atención y desplaza lo que sí le protege; conformarse con los del masivo cuando el perfil es dirigido deja abierta la superficie que de verdad se usa contra esa persona. La primera pregunta nunca es qué configurar, sino contra quién.

**b) La interacción ordena la prioridad.** Un vector que no requiere que el usuario toque nada no admite «formación al usuario» como control — y esa es la clase que usan las cadenas dirigidas. A la inversa, el vector de mayor volumen en Android sí requiere interacción, y ahí la formación es exactamente el control que funciona.

**c) La mitigación es una propiedad del dispositivo, no del sistema operativo.** Que una protección exista «en Android 13» o «en iOS 16» no dice nada sobre el terminal que se tiene delante: importa si ese dispositivo la recibió, si sigue recibiendo parches y qué nivel declara. En Android esto es determinante; en iOS lo es el modelo de silicio.

**d) La ausencia de alerta no significa nada.** No hay antivirus con visibilidad real en ninguna de las dos plataformas. Un triage que no encuentra nada descarta las clases que sus consultas cubren, no el compromiso. Decir lo contrario es el error más frecuente al cerrar un caso.

**e) Todo control tiene coste, y el que se revierte no protege.** Recomendar sin declarar qué se rompe produce configuraciones que duran una semana. El coste es parte de la recomendación, no una nota al pie.

**f) La app móvil se distribuye, no se despliega.** La versión anterior sigue viva en los dispositivos durante años y nadie puede forzar la actualización. De ahí se deriva casi toda la ingeniería del eje de producto: el servidor no puede romper clientes antiguos, las migraciones locales deben funcionar desde cualquier versión, un fallo en producción tarda días en corregirse, y por eso **no se publica lo que no se puede apagar** — el interruptor remoto es la única reversión inmediata que existe.

## 4. Mapa de enrutamiento

**Plataformas.** Cada una tiene un par: el módulo permanente para razonar y el catálogo volátil, fechado, para los datos que caducan.

| Plataforma | Modelo (`permanente`) | Campañas y CVE (`volatil`) |
|---|---|---|
| iOS | [ios/ios.md](ios/ios.md) | [ios/ios_exploits.md](ios/ios_exploits.md) |
| Android | [android/android.md](android/android.md) | [android/android_exploits.md](android/android_exploits.md) |

**Sospecha de compromiso.** Playbook por plataforma; el método forense general y el marco de IR están abajo.

| Plataforma | Playbook |
|---|---|
| iOS | [ios/ios_forensics.md](ios/ios_forensics.md) |
| Android | [android/android_forensics.md](android/android_forensics.md) |

**Producto**

| Tema | Módulo |
|---|---|
| iOS — revisión de la App Store, permisos y privacidad, segundo plano, ciclo de versiones, distribución alternativa | [ios/ios_platform.md](ios/ios_platform.md) · *volátil* |
| iOS — convenciones de plataforma, navegación, interacción táctil, estados, accesibilidad, adaptación | [ios/ios_design.md](ios/ios_design.md) |
| Android — nivel de API objetivo, revisión de Play, permisos, segundo plano, publicación por fases, superficie que expone la app | [android/android_platform.md](android/android_platform.md) · *volátil* |
| Android — retroceso del sistema, navegación, interacción táctil, cambios de configuración, accesibilidad, adaptación | [android/android_design.md](android/android_design.md) |
| Transversal — contrato con el servidor, red y sin conexión, rendimiento y energía, datos locales, observabilidad, entrega | [practices/practices.md](practices/practices.md) |
| Transversal — criterio de adopción y direcciones de plataforma | [trends/trends.md](trends/trends.md) · *volátil* |

**Cruces frecuentes hacia otros skills**

| Tema | Módulo |
|---|---|
| Seguridad de la app que se construye (MASVS) | [../security/mobile/mobile.md](../security/mobile/mobile.md) |
| Preservación de evidencia y análisis forense | [../security/forensics/forensics.md](../security/forensics/forensics.md) |
| Marco de respuesta a incidentes | [../security/playbooks/ir_base.md](../security/playbooks/ir_base.md) |
| Priorización de vulnerabilidades: KEV, EPSS, SLA de parcheo | [../security/cisa_kev.md](../security/cisa_kev.md) |
| Causa raíz de una vulnerabilidad | [../security/cwe.md](../security/cwe.md) |
| Canal lateral, arranque seguro, entornos de ejecución confiables | [../security/hardware/hardware.md](../security/hardware/hardware.md) |
| Spyware y familias de malware en general | [../security/malware/malware.md](../security/malware/malware.md) |
| Diseño del contrato de la API | [../backend/api/api.md](../backend/api/api.md) |
| Fiabilidad del lado servidor | [../backend/reliability/reliability.md](../backend/reliability/reliability.md) |
| Web móvil, no app nativa | [../seo/seo-master.md](../seo/seo-master.md) |

## 5. Convenciones de los módulos

- Cabecera YAML con `id`, `tipo` y `estabilidad`. Los volátiles añaden `snapshot` y `consulta_externa`.
- **Un par por plataforma** en el eje de seguridad: un módulo permanente con el modelo, y un catálogo volátil con campañas y CVE. Los identificadores concretos viven **solo** en el volátil; el permanente no cita ninguno y por eso no caduca.
- Tablas con columnas fijas, y la última columna siempre es la incómoda:
  - superficie → `Componente | Entrada | Interacción | Aislamiento`
  - mitigaciones → `Mitigación | Qué rompe | Desde | Cómo se ha eludido`
  - endurecimiento → `Control | Perfil | Qué cierra | Qué cuesta`
  - vectores → `Vector | Interacción | Precondición | Reducción`
  - patrones de diseño → `Patrón | Cuándo | Cuándo no | Coste`
  - prácticas → `Práctica | Por qué | Cómo se viola | Cómo se verifica`
- Cada catálogo volátil incluye una sección de **identificadores mal atribuidos**: los errores que circulan en informes de segunda mano, verificados contra fuente primaria.
- Títulos `##` autodescriptivos. Sin introducciones ni repetición entre módulos: se enlaza.

## 6. Límites

- **No se puede declarar limpio un dispositivo.** Ningún procedimiento disponible en iOS o Android lo permite. Se puede decir qué se ha descartado y con qué cobertura.
- **No se atribuye una campaña a un actor** por parecido de comportamiento: «consistente con» y exigir evidencia publicada.
- **No se generan exploits** ni cadenas funcionales. Sí mecánica, detección, mitigación y triage.
- **Las «apps de seguridad» móviles operan dentro del mismo sandbox** que cualquier otra: pueden aportar señal, no visibilidad de sistema. Recomendarlas como si fueran un EDR es vender una expectativa que la plataforma no cumple.
- **Un caso con implicaciones legales exige preservar antes de tocar.** El triage técnico contamina evidencia; ver [../security/forensics/forensics.md](../security/forensics/forensics.md).
- **Ambas plataformas tienen los dos ejes cubiertos**, pero el material común del eje de producto —contexto de uso, catálogo de estados de pantalla, criterios de accesibilidad— se redactó dentro de [ios/ios_design.md](ios/ios_design.md) y [android/android_design.md](android/android_design.md) lo enlaza en vez de duplicarlo. Al responder sobre Android puede hacer falta cargar los dos.
- No sustituye la documentación oficial del fabricante ni las directrices de revisión de las tiendas: se citan por familia y se enlaza a la fuente normativa.
- La seguridad de la aplicación que se desarrolla no es tarea de este skill: para eso está [../security/mobile/mobile.md](../security/mobile/mobile.md).
