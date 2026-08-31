---
id: cloud/architecture
tipo: modelo
estabilidad: permanente
---

# Arquitectura cloud por restricciones

## Ficha de decisión

| Restricción | Pregunta que debe quedar respondida | Evidencia |
|---|---|---|
| Región | ¿El servicio existe allí y los datos pueden residir allí? | Matriz oficial de regiones consultada con fecha |
| Tráfico | ¿Es estable, por ráfagas, síncrono o diferido? | Escenario normal y pico reproducible |
| Estado | ¿Quién escribe, cuánto se retiene y cómo se restaura? | Prueba de copia y restauración |
| Latencia | ¿Qué presupuesto consume cada salto? | Medición extremo a extremo y por dependencia |
| Disponibilidad | ¿Qué falla y cómo se degrada el flujo principal? | Ensayo del modo degradado |
| Equipo | ¿Quién puede operar cada componente durante la demo y después? | Runbook con responsable y tiempo de recuperación |

## Selección de forma de cómputo

| Forma | Encaja cuando | Coste que se acepta | Señal de mala elección |
|---|---|---|---|
| Función administrada | Eventos o peticiones cortas, carga variable y poco estado local | Arranque, límites de ejecución y mayor dependencia del proveedor | Se fuerza trabajo largo, conexiones persistentes o estado local |
| Contenedor administrado | Runtime o dependencias personalizadas con servicio de vida larga | Imagen, red, escalado y operación más visibles | La aplicación era una función simple pero se opera una plataforma completa |
| Máquina virtual | Control del sistema operativo o software no portable es requisito real | Parches, capacidad, recuperación y escalado quedan en el equipo | Se eligió por familiaridad y nadie posee su operación |
| Servicio SaaS/administrado | La capacidad no diferencia al producto y existe un contrato adecuado | Límites, precio variable y portabilidad | Se oculta una restricción crítica detrás del servicio |

## Vertical slice

Un vertical slice cruza interfaz, contrato, lógica, proveedor y telemetría con
el mínimo número de componentes. Para una demo debe incluir:

1. Un camino feliz real de extremo a extremo.
2. Un modo local determinista que no requiera credenciales.
3. Un error visible y accionable cuando falla el proveedor.
4. Una medición de latencia, resultado y modo usado.
5. Un procedimiento de arranque comprobable desde un clon limpio.

Agregar componentes que no participan en ese flujo no aumenta la calidad del
slice; solo amplía la superficie de fallo.
