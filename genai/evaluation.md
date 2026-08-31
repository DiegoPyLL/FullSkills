---
id: genai/evaluation
tipo: modelo
estabilidad: permanente
---

# Evaluación orientada a tareas

## Dataset mínimo útil

Cada caso contiene entrada, propiedades esperadas, riesgo y etiqueta de segmento.
Incluir camino feliz, ambigüedad, dato ausente, entrada hostil, límite de longitud
y un caso que deba abstenerse. Los ejemplos deben representar decisiones reales,
no frases elegidas porque el modelo ya las responde bien.

## Graders

| Tipo | Útil para | Limitación |
|---|---|---|
| Determinista | Esquema, campos, citas, palabras prohibidas, cálculo exacto | No mide calidad semántica abierta |
| Referencia/rúbrica | Contenido esperado con variación legítima | Requiere criterios observables y mantenimiento |
| Modelo juez | Volumen y criterios semánticos complejos | Puede compartir sesgos; calibrar contra revisión humana |
| Humano | Riesgo, utilidad real y preferencia | Caro, lento y variable sin rúbrica |

Combinar señales; no colapsar seguridad, corrección y estilo en una única nota.

## Regresión y lanzamiento

Comparar candidato contra baseline sobre los mismos casos y configuración. Guardar
modelo, versión del prompt, parámetros, fecha y resultados por segmento. Una media
puede ocultar que mejoró estilo y empeoró un caso crítico.

La decisión de lanzamiento declara:

1. Métrica primaria y umbral acordado antes de ejecutar.
2. Casos críticos que deben pasar todos.
3. Latencia y coste junto a calidad.
4. Cambios estadísticamente o prácticamente relevantes, no solo distintos.
5. Rollback o fallback si producción contradice la evaluación.
