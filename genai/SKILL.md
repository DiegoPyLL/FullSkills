---
name: genai
description: "Ingeniería de aplicaciones con LLM y modelos generativos: selección y encapsulamiento de modelos, prompts y contexto, RAG, herramientas, salidas estructuradas, streaming, evaluaciones, latencia, coste, observabilidad y fallbacks. Se usa al diseñar, implementar, evaluar u operar una experiencia GenAI; para prompt injection, exfiltración o seguridad ofensiva de agentes se usa security."
---

# Skill de GenAI — producto probabilístico verificable

## Protocolo

1. Clasificar la solicitud: `DISEÑAR`, `IMPLEMENTAR`, `EVALUAR`, `DEPURAR`,
   `OPERAR` o `ELEGIR_MODELO`.
2. Definir primero la tarea del usuario y un ejemplo de resultado aceptable.
3. Establecer el baseline más simple antes de añadir RAG, agentes o fine-tuning.
4. Cargar solo el módulo necesario.
5. Separar comportamiento del producto, adaptador del proveedor y evaluación.
6. Cerrar con criterio de aceptación, medición y modo de fallo.

Versiones, disponibilidad, precios, límites, parámetros y capacidades de modelos
son volátiles. Verificarlos en fuentes oficiales para la región y cuenta reales.

## Enrutamiento

| Necesidad | Módulo |
|---|---|
| Límite del modelo, prompts, contexto, RAG, herramientas y adaptadores | [architecture.md](architecture.md) |
| Dataset, graders, regresión y decisión de lanzamiento | [evaluation.md](evaluation.md) |
| Streaming, latencia, coste, telemetría, errores y fallback | [operations.md](operations.md) |

## Núcleo de razonamiento

- **La unidad es la tarea, no el prompt.** Se optimiza que el usuario complete
  una tarea, no que una respuesta aislada parezca convincente.
- **Lo probabilístico necesita evaluación.** Una mejora sin casos repetibles es
  una impresión; una demo sin medición es frágil.
- **Contexto es presupuesto.** Cada token debe justificar relevancia, latencia y
  coste; más contexto también puede distraer.
- **El modelo es una dependencia reemplazable.** El dominio no conoce URLs,
  payloads ni errores del proveedor.
- **Agente es una escalada de complejidad.** Añadir herramientas o autonomía solo
  cuando un flujo determinista no resuelve la tarea y el valor compensa el riesgo.

## Fronteras

- API, persistencia, concurrencia y fiabilidad general:
  [../backend/SKILL.md](../backend/SKILL.md).
- Infraestructura, región, IAM y coste cloud: [../cloud/SKILL.md](../cloud/SKILL.md).
- Prompt injection, abuso de herramientas y seguridad de agentes:
  [../security/ai/ai.md](../security/ai/ai.md) y
  [../security/ai/agents_mcp.md](../security/ai/agents_mcp.md).
- No usar datos reales sensibles para probar prompts ni ejecutar herramientas con
  efectos externos sin autorización explícita.
