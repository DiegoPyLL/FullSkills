---
id: genai/architecture
tipo: modelo
estabilidad: permanente
---

# Arquitectura de una capacidad GenAI

## Contrato de tarea

Antes del modelo, escribir:

| Campo | Pregunta |
|---|---|
| Usuario | ¿Quién decide o actúa con la salida? |
| Entrada | ¿Qué datos mínimos necesita la tarea? |
| Salida | ¿Texto libre, estructura validable, clasificación o acción? |
| Calidad | ¿Qué errores son tolerables y cuáles invalidan el resultado? |
| Tiempo | ¿Cuándo deja de ser útil una respuesta correcta? |
| Escalamiento | ¿Cuándo debe abstenerse o pedir intervención humana? |

## Límite del proveedor

El núcleo de la aplicación depende de un contrato propio y pequeño. Un adaptador
traduce mensajes, parámetros, streaming, uso y errores. Las pruebas del dominio
usan un doble determinista; una prueba de contrato separada valida el proveedor
real. Cambiar de modelo no debe reescribir la interfaz ni la lógica de negocio.

## Escalera de complejidad

1. Prompt con ejemplos y salida explícita.
2. Salida estructurada validada y reparación acotada.
3. Contexto recuperado cuando el conocimiento externo es la causa demostrada.
4. Herramientas deterministas cuando el modelo necesita datos o acciones.
5. Flujo agente solo si la secuencia no puede fijarse de antemano.
6. Fine-tuning cuando evaluación y datos muestran una brecha estable que las
   capas anteriores no resuelven.

No saltar niveles por novedad. Cada escalón debe demostrar una mejora sobre el
baseline en el dataset de evaluación.

## RAG

Separar recuperación de generación. Medir si se recuperó evidencia relevante
antes de juzgar la redacción del modelo. Conservar procedencia, limitar contexto
y permitir responder “no encontrado”. Un modelo no convierte una recuperación
incorrecta en una respuesta fundamentada.
