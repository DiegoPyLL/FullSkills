---
id: cloud/cost
tipo: modelo
estabilidad: permanente
---

# Coste cloud como restricción de diseño

## Modelo antes que cifra

Descomponer el coste por unidad del producto antes de buscar precios:

```text
coste por interacción = cómputo + inferencia + almacenamiento + red + observabilidad
coste mensual esperado = coste fijo + interacciones × coste por interacción
```

Las cifras se completan únicamente con la calculadora o tarifa oficial vigente
de la región. Mantener separados supuesto, precio consultado y resultado.

## Controles

| Riesgo | Control | Verificación |
|---|---|---|
| Recurso olvidado | Etiqueta de dueño y caducidad; inventario al cerrar la sesión | No quedan recursos sin dueño ni propósito |
| Bucle o reintento explosivo | Límite de intentos, presupuesto temporal y cortacircuito | Una dependencia caída produce llamadas acotadas |
| Inferencia sin límite | Longitud de entrada/salida, cuota por actor y modelo adecuado | La peor petición admitida tiene coste estimado |
| Observabilidad excesiva | Muestreo, retención y cardinalidad deliberados | El coste de observar se puede atribuir |
| Salida de red inesperada | Flujo de datos dibujado por región y destino | Cada cruce tiene necesidad y precio verificados |

## Forma de salida

Toda recomendación de coste debe declarar:

1. Unidad funcional que se está costeando.
2. Supuestos de volumen y distribución.
3. Componentes fijos y variables.
4. Fuente y fecha de cada precio.
5. Escenario esperado y escenario adverso.
6. Alerta o límite que impide exceder el presupuesto sin señal.
