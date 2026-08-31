---
id: genai/operations
tipo: modelo
estabilidad: permanente
---

# Operación de inferencia

## Camino crítico

Medir por separado cola, conexión, tiempo al primer token, generación total y
postprocesado. Streaming mejora percepción, no necesariamente tiempo total. Un
timeout debe dejar margen al caller y nunca provocar reintentos ilimitados sobre
una generación que quizá ya consumió cuota.

## Telemetría mínima

| Señal | Uso |
|---|---|
| Proveedor, modelo y versión de prompt | Reproducir y comparar comportamiento |
| Modo `live`, `mock` o fallback | No confundir evidencia real con simulación |
| Latencia total y primer token | Experiencia y diagnóstico |
| Unidades de entrada y salida cuando el proveedor las entrega | Coste y anomalías |
| Resultado clasificado y código del proveedor | Fiabilidad sin registrar secretos |
| Evaluación o feedback asociado | Detectar degradación de calidad |

Prompts y respuestas pueden contener datos sensibles. Registrar contenido solo con
base explícita, minimización, retención y acceso definidos; por defecto usar hashes,
longitudes, identificadores y métricas.

## Fallbacks honestos

- `mock`: elegido antes de la petición y visible en la interfaz; sirve para demo y
  desarrollo, no prueba integración real.
- Modelo alternativo: conserva contrato, pero se evalúa por separado.
- Respuesta degradada: ofrece una capacidad menor y explica la limitación.
- Error accionable: preferible a inventar éxito cuando no hay alternativa segura.

No cambiar silenciosamente de `live` a `mock`: ocultaría la señal más importante
de una demostración cloud, que el proveedor real no respondió.
