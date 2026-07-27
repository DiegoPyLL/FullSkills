---
id: delivery/delivery
tipo: modelo
estabilidad: permanente
---

# Entrega y operación

Cómo pasar código de escrito a corriendo en producción sin interrupción, y qué hacer cuando falla de todas formas. Aplica directamente el modelo d de [../SKILL.md](../SKILL.md): todo cambio convive con la versión anterior. La compatibilidad de contrato durante el despliegue está en [api/api.md](../api/api.md); el patrón de migración de esquema, en [data/migrations.md](../data/migrations.md).

## Construcción reproducible

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Mismo commit produce siempre el mismo artefacto, con dependencias fijadas | Sin reproducibilidad, no se puede confiar en que lo probado sea lo que se despliega | Dos construcciones del mismo commit pueden producir artefactos distintos según cuándo se ejecuten | Reconstruir el mismo commit en otro momento produce un artefacto funcionalmente idéntico |
| Promover el mismo artefacto entre entornos, sin reconstruir para producción | Reconstruir para producción reintroduce la posibilidad de que difiera de lo probado | El artefacto de producción se compila de nuevo en vez de reutilizar el que pasó las pruebas | El artefacto que llega a producción es exactamente el mismo binario o paquete que pasó por las pruebas |

## Despliegue sin interrupción

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Despliegue progresivo, azul/verde o canario, con criterio de avance y de aborto medido | Un despliegue de todo a la vez no da margen para detectar un problema antes de que afecte a todo el tráfico | El despliegue sustituye toda la flota a la vez, sin fase intermedia observada | Un problema introducido por el despliegue se detecta y se revierte afectando solo a una fracción del tráfico |
| Compatibilidad N-1 obligatoria durante toda la ventana de despliegue | Durante el despliegue conviven dos versiones de código hablando con el mismo esquema y los mismos clientes | El código nuevo asume que ya no existe ninguna instancia de la versión anterior en el momento de desplegarse | El código nuevo funciona correctamente mientras conviven instancias de la versión anterior en producción |

## Desacoplar despliegue de activación

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Banderas de funcionalidad: desplegar el código no es lo mismo que activarlo | Permite separar el riesgo técnico del despliegue del riesgo de negocio de la nueva funcionalidad | La única forma de activar una funcionalidad nueva es desplegar código | Una funcionalidad nueva se puede activar o desactivar sin un nuevo despliegue |
| Toda bandera con dueño y fecha de retirada declarados | Las banderas que nunca se retiran se acumulan como deuda ramificada difícil de razonar | Existen banderas de funcionalidad sin dueño ni fecha prevista de retirada | Cada bandera activa tiene un dueño identificado y una fecha o condición de retirada |

## Reversibilidad

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Todo cambio con camino de vuelta probado antes de considerarse listo para producción | Un cambio sin reversión probada convierte cualquier problema post-despliegue en una emergencia sin salida rápida | La reversión de un cambio existe en teoría pero nunca se ha ejecutado de verdad | La reversión de un cambio reciente se ha ensayado con éxito contra un entorno representativo |
| Tratar distinto y aprobar distinto lo que no tiene reversión real (migración destructiva, evento ya emitido, correo ya enviado) | Estos cambios no admiten un "deshacer" técnico, así que el control tiene que ser previo, no posterior | Un cambio sin reversión posible pasa por el mismo proceso de aprobación que uno reversible | Todo cambio irreversible identificado pasa por una aprobación explícita adicional antes de ejecutarse |

## Operación

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Manual de actuación por alerta, con el primer paso ejecutable sin pensar | En el momento de un incidente, pensar desde cero cuesta minutos que importan | Una alerta se dispara y quien la atiende no tiene ningún procedimiento documentado que seguir | Cada alerta activa tiene un manual con un primer paso concreto y ejecutable de inmediato |
| Propiedad clara del servicio: quien lo escribe lo opera | Sin propiedad clara, un incidente se retrasa mientras se busca quién debe actuar | No está claro qué equipo o persona es responsable de un servicio en producción | Cada servicio tiene un dueño identificado, tanto para cambios como para incidentes |

## Aprender del fallo

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Análisis posterior sin culpa, con acción concreta, dueño y fecha | Un análisis que busca culpables desincentiva reportar y aprender de lo que realmente pasó | El análisis posterior a un incidente se centra en quién cometió el error | El análisis posterior identifica causas del sistema y produce acciones concretas con dueño y fecha, no señalamientos |

## Lista de comprobación previa al despliegue

1. El artefacto que se va a desplegar es exactamente el que pasó las pruebas, sin reconstrucción.
2. El código nuevo tolera convivir con instancias de la versión anterior durante la ventana de despliegue.
3. Cualquier cambio de contrato o de esquema sigue el patrón de compatibilidad correspondiente.
4. Existe un camino de reversión probado, o el cambio tiene la aprobación adicional que exige ser irreversible.
5. Las funcionalidades nuevas están detrás de una bandera si su activación conlleva riesgo de negocio.
6. Existe un manual de actuación para las alertas que este cambio podría disparar.
