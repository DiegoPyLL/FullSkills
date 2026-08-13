---
id: trends/trends
tipo: referencia
estabilidad: volatil
snapshot: 2026-08
consulta_externa: Notas de versión y documentación del fabricante de cada plataforma · https://developer.apple.com/documentation/ · https://developer.android.com/
---

# Tendencias de plataforma móvil

**Snapshot de agosto de 2026.** Es el módulo que antes caduca del repositorio y por eso es el más corto. Verificar antes de usarlo para justificar una decisión técnica.

Transversal a ambas plataformas: aquí va el **criterio de adopción**, que es permanente aunque la lista de tendencias no lo sea. Lo específico de cada plataforma vive en [../ios/](../ios/ios.md) y [../android/](../android/android.md).

## Cómo se usa este módulo

Una tendencia no es un argumento. Lo que decide una adopción es el **criterio**, no la novedad, y el criterio sí es permanente aunque la lista no lo sea.

| Criterio | Pregunta que responde |
|---|---|
| Parque alcanzable | ¿Qué porcentaje de **mis** usuarios lo tiene? Los datos propios, nunca los del mercado |
| Coste de reversión | Si sale mal, ¿se puede volver atrás, o queda atado al diseño? |
| Camino alternativo | ¿Funciona la app sin ello, o se convierte en requisito? |
| Señal de compromiso del fabricante | ¿Es la vía recomendada, o una de varias que conviven? |
| Coste de no adoptar | ¿Hay fecha límite de la tienda o del SDK detrás? |

Regla de adopción por defecto: **lo que el fabricante marca como camino recomendado se adopta al ritmo del parque; lo demás espera a tener un problema que resuelva.** Adoptar antes se paga en migraciones.

## Direcciones estables

Lo que lleva varios ciclos apuntando al mismo sitio, con menos riesgo de revertirse:

| Dirección | Qué implica |
|---|---|
| Interfaz declarativa como vía principal | Es donde llegan primero las capacidades nuevas. La interfaz imperativa sigue viva y conviene en casos concretos, pero deja de recibir novedades primero |
| Concurrencia estructurada en el lenguaje | Sustituye a los patrones de retrollamada; los compiladores empujan hacia ella con avisos y luego con errores |
| Procesamiento en el dispositivo | Modelos que corren local por latencia, coste y privacidad. Cambia el diseño: el trabajo pesado cabe en el cliente, con presupuesto de energía |
| Privacidad como restricción creciente | Cada ciclo estrecha permisos y añade justificaciones. Diseñar asumiendo el permiso denegado, no concedido |
| Seguridad de memoria en hardware | Eleva el coste del exploit; no cambia el diseño de app. Tabla de mitigaciones en [../ios/ios.md](../ios/ios.md) |
| Fragmentación regulatoria | La plataforma se comporta distinto según jurisdicción. En iOS, [../ios/ios_platform.md](../ios/ios_platform.md) |

## Decisiones que reaparecen

Preguntas que vuelven cada año y cuya respuesta depende del proyecto, no de la moda:

| Decisión | Cómo se resuelve |
|---|---|
| Nativo o multiplataforma | Por cuánto de la app es interfaz específica de plataforma y cuánto es lógica compartida. Con mucha interfaz específica, multiplataforma cuesta más de lo que ahorra |
| Versión mínima soportada | Con los datos de uso propios y el coste de mantener cada rama, no con el porcentaje global |
| Cuánta lógica en el cliente | La mínima que permita responder sin conexión. Todo lo demás en el servidor, que sí se puede desplegar |
| Adoptar la API nueva del ciclo | Cuando el parque llegue al umbral propio y exista camino alternativo para el resto |

## Límite

Este módulo no predice. Registra dirección observada y da criterio para decidir; cualquier afirmación sobre lo que hará el fabricante el año que viene es especulación y no entra aquí.
