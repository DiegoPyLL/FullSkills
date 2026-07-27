---
id: architecture/architecture
tipo: modelo
estabilidad: permanente
---

# Arquitectura y límites

Dónde se trazan los límites de un sistema y qué se paga al cruzarlos o al moverlos. La comunicación entre servicios se apoya en los modelos de [reliability/reliability.md](../reliability/reliability.md) (una cadena síncrona es un producto de disponibilidades) y de [concurrency/concurrency.md](../concurrency/concurrency.md) (consistencia entre servicios).

## Acoplamiento y cohesión

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Tratar el acoplamiento como la propiedad que más predice el coste a cinco años | Un sistema poco acoplado se puede cambiar por partes; uno muy acoplado obliga a cambiar todo junto | Las decisiones de diseño se evalúan solo por velocidad de entrega inmediata, sin mirar el acoplamiento que dejan | Un cambio típico en un componente no obliga a modificar componentes que no tienen relación de negocio con él |

## Límites por dominio

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Separar por razón de cambio, no por capa técnica | Agrupar por razón de cambio hace que un cambio de negocio toque un solo lugar | El sistema se organiza en capas técnicas (controladores, servicios, repositorios) transversales a todos los dominios | Un cambio en una regla de negocio concreta se concentra en un módulo, no se dispersa por varias capas técnicas |
| Comprobar que un límite bien puesto no se cruza en los cambios habituales | Es la señal observable de que el límite está en el sitio correcto | Los cambios habituales cruzan sistemáticamente el mismo límite de módulo | La mayoría de los cambios recientes se han quedado dentro de un solo módulo de dominio |

## Dirección de las dependencias

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Las dependencias apuntan hacia dentro: el dominio no conoce el framework, ni el motor, ni el transporte | Permite cambiar la infraestructura sin tocar las reglas de negocio | El código de dominio importa directamente tipos del framework web o del motor de base de datos | El núcleo de dominio se puede compilar y probar sin depender de ningún framework de infraestructura |
| Adaptadores en el borde, con la testabilidad sin infraestructura como consecuencia | Si el dominio no depende de infraestructura, se puede probar sin levantarla | Las pruebas del dominio necesitan una base de datos o un servidor real para ejecutarse | El núcleo de dominio se prueba sin levantar infraestructura externa ([testing/testing.md](../testing/testing.md)) |

## Monolito modular primero

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Empezar con monolito modular; microservicios cuando el coste organizativo lo justifique | Partir prematuramente añade coste de red, consistencia y despliegue sin el beneficio organizativo que lo justifica | Se diseña en microservicios desde el inicio porque "así escalan mejor", sin equipos independientes que lo requieran | La decisión de partir en servicios independientes cita una razón organizativa concreta, no solo técnica |
| Contar el coste real de partir: red, consistencia, despliegue coordinado, depuración distribuida | Partir no es gratis; cambia problemas de un tipo por problemas de otro tipo | Se decide partir en servicios sin haber presupuestado ese coste adicional | El coste adicional de operar servicios separados está reconocido y asumido explícitamente |
| No partir por un límite mal puesto | Partir multiplica el problema de un límite equivocado en vez de resolverlo | Se convierte en servicio independiente un módulo cuyo límite de dominio ya estaba mal trazado | El límite entre los servicios resultantes coincide con un límite de dominio ya validado como correcto |

## Comunicación entre servicios y propiedad del dato

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Saber que síncrono acopla disponibilidad y asíncrono acopla esquema | Cada estilo traslada un tipo de riesgo distinto al resto del sistema | Se elige el estilo de comunicación sin considerar qué tipo de acoplamiento introduce | El estilo de comunicación elegido corresponde al tipo de acoplamiento que el sistema puede tolerar |
| Calcular la disponibilidad de una cadena de llamadas síncronas como el producto de sus disponibilidades | Cinco dependencias al 99,9% dan una disponibilidad compuesta de 99,5%, no de 99,9% | Se asume que la disponibilidad del sistema es la de su componente más fiable | La disponibilidad esperada de un flujo con varias llamadas síncronas se calcula como producto, no se asume optimista |
| Un dato tiene un único dueño; ninguna base se comparte directamente entre servicios | Una base compartida es un contrato sin especificar que ningún servicio puede cambiar sin coordinar con todos los demás | Dos servicios leen y escriben directamente en la misma base de datos | Cada tabla o colección tiene un único servicio que la escribe; el resto accede a través de su API |

## Configuración y entorno

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Mismo artefacto en todos los entornos, distinta configuración externa | Reconstruir por entorno introduce la posibilidad de que lo probado no sea lo que se despliega | Se compila una versión distinta del artefacto para cada entorno | El mismo artefacto binario o empaquetado se promueve sin cambios entre entornos ([delivery/delivery.md](../delivery/delivery.md)) |
| Configuración validada al arrancar, no la primera vez que se usa | Un error de configuración descubierto tarde en producción es más caro que uno descubierto al arrancar | Un valor de configuración inválido solo produce un fallo cuando por fin se usa, en producción | El proceso rechaza arrancar si la configuración es inválida, en vez de fallar más tarde al usarla |
| Mantener paridad razonable entre entornos | Lo que solo falla en producción suele ser justamente lo que solo existe allí | El entorno de pruebas difiere de producción en aspectos que sí importan (versión de motor, topología de red) | Los aspectos que importan al comportamiento del sistema son equivalentes entre el entorno de pruebas y producción |

## Señales de que un límite está mal puesto

1. Los cambios de negocio habituales cruzan sistemáticamente el mismo límite de módulo o de servicio.
2. Dos componentes necesitan desplegarse juntos para que un cambio funcione.
3. Dos servicios escriben en la misma tabla o base de datos.
4. Entender un flujo de negocio completo obliga a leer código de más de dos o tres módulos no relacionados por dominio.
5. El coste de coordinación entre equipos es mayor que el coste de escribir el código en sí.
