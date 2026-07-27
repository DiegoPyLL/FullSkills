# Skill de Backend

Base de conocimiento de buenas prácticas de backend estructurada como **Skill** para agentes (Claude Code y compatibles). Agnóstica de tecnología: nombra algoritmos y patrones, no frameworks ni versiones. Hermana de [../security/](../security/README.md), mismas convenciones de formato.

## Cómo funciona

El punto de entrada es [SKILL.md](SKILL.md), que actúa como enrutador: no contiene conocimiento de dominio, sino que define el protocolo de razonamiento y decide qué módulos cargar según la pregunta.

- **Núcleo de razonamiento**: cinco modelos — contrato → invariante → violación; las cinco formas en que falla el I/O; el estado es lo caro y el cómputo es barato; todo cambio convive con la versión anterior; el coste real no es el big-O.
- **Siete modos de respuesta**: `DISEÑAR`, `MODELAR_DATOS`, `DIAGNOSTICAR`, `REVISAR`, `ELEGIR`, `EVOLUCIONAR`, `OPERAR`, cada uno con su forma de salida esperada.
- **Anclaje obligatorio**: cada práctica declara qué invariante protege y con qué señal se observa rota. Si una práctica no se puede verificar, no entra — es el equivalente a que `security/` ancle cada afirmación a ATT&CK/CWE/D3FEND.
- **Filtro permanente/volátil invertido**: al ser agnóstica de tecnología, la skill es casi enteramente permanente. La regla es: si una afirmación depende de la versión de una herramienta, no entra. Excepción única: recomendaciones de algoritmo (qué función de derivación de clave, con qué coste), marcadas con `consulta_externa`.

## Estructura del repositorio

| Carpeta / archivo | Contenido |
|---|---|
| `SKILL.md` | Enrutador y protocolo de razonamiento (léelo primero) |
| `glossary.md` | Vocabulario y métricas |
| `api/` | Contrato de API: estilo, códigos, idempotencia, paginación, caché HTTP, límites de tasa |
| `data/` | Modelado, tipos, índices, transacciones, concurrencia sobre el dato, migraciones |
| `concurrency/` | Concurrencia, colas, semántica de entrega, coordinación distribuida |
| `reliability/` | Tiempos de espera, reintentos, interruptor, mamparo, fallo parcial |
| `performance/` | Percentiles, teoría de colas, caché, escalado, particionado, coste |
| `appsec/` | Identidad, autorización, autenticación, secretos, datos sensibles |
| `observability/` | Registros, métricas, trazas, alertas, depurabilidad |
| `architecture/` | Acoplamiento, límites de dominio, monolito modular, configuración |
| `testing/` | Determinismo, dobles, contratos, invariantes |
| `delivery/` | Construcción reproducible, despliegue, banderas, reversibilidad |
| `code/` | Errores, tipos y fronteras, dependencias, legibilidad |
| `antipatterns.md` | Antipatrones que cruzan varias ramas |
| `ARBOL.md` | Documento de diseño: la taxonomía completa antes de convertirse en módulos |

## Convenciones de los módulos

- Cabecera YAML con `id`, `tipo`, `estabilidad`, y `consulta_externa` si depende de una guía externa.
- Las prácticas se documentan en tablas con columnas fijas: `Práctica | Por qué | Cómo se viola | Cómo se verifica`.
- Sin introducciones ni repetición entre módulos: el conocimiento vive en un solo lugar y el resto enlaza a él.

## Límites

- No genera código de producción sin conocer las restricciones reales del sistema.
- No recomienda microservicios sin que el coste organizativo esté justificado.
- La mecánica de ataque, detección y respuesta a incidentes vive en [../security/](../security/), no aquí.

## Uso

Este directorio está pensado para usarse como Skill dentro de un agente compatible: el agente carga `SKILL.md` y, según la intención detectada, navega al módulo correspondiente siguiendo el mapa de enrutamiento de la sección 4.
