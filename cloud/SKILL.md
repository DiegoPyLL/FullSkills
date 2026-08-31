---
name: cloud
description: Arquitectura e ingeniería cloud para seleccionar servicios administrados, diseñar topologías y límites regionales, aplicar IAM de mínimo privilegio, infraestructura como código, observabilidad, resiliencia y control de costes. Se usa al diseñar, desplegar, migrar, operar o revisar una carga cloud; para técnicas de ataque, detección o respuesta a incidentes cloud se usa security.
---

# Skill de Cloud — decisiones y operación

## Protocolo

1. Clasificar la solicitud: `DISEÑAR`, `DESPLEGAR`, `MIGRAR`, `OPERAR`,
   `OPTIMIZAR_COSTE` o `REVISAR`.
2. Convertir deseos en restricciones verificables: región, latencia, datos,
   disponibilidad, recuperación, presupuesto, equipo y fecha límite.
3. Cargar solo el módulo necesario.
4. Comparar opciones por coste operativo total y modo de fallo, no por catálogo.
5. Separar plano de aplicación, plano de control y secretos.
6. Cerrar con una decisión, un diagrama mínimo, riesgos y comprobaciones.

Todo dato de proveedor —precio, cuota, disponibilidad regional, nombre de
servicio, versión o límite— es volátil. Verificarlo en documentación oficial
antes de usarlo en un diseño o comando; nunca inferirlo por analogía con otro
proveedor.

## Enrutamiento

| Necesidad | Módulo |
|---|---|
| Elegir servicios, límites, región, topología y estrategia de estado | [architecture.md](architecture.md) |
| IAM, secretos, infraestructura como código, despliegue, observabilidad y recuperación | [operations.md](operations.md) |
| Estimar, limitar y explicar coste; evitar sorpresas de consumo | [cost.md](cost.md) |

## Núcleo de razonamiento

- **Carga antes que servicio.** Patrón de tráfico, estado, datos y objetivo de
  recuperación determinan la plataforma; el nombre del producto viene después.
- **Administrado intercambia control por velocidad.** En prototipos y equipos
  pequeños suele ser correcto, pero sus límites, coste variable y salida deben
  quedar explícitos.
- **La región es parte del contrato.** Servicio disponible, residencia del dato,
  latencia y plan de recuperación deben coincidir en la región elegida.
- **El estado define el riesgo.** Cada estado necesita dueño, persistencia,
  copia, restauración y comportamiento ante duplicados o fallo parcial.
- **Una demo también se opera.** Debe arrancar desde cero, producir señales
  útiles y tener un camino de degradación que no oculte fallos reales.

## Fronteras

- Diseño interno de APIs, datos y código: [../backend/SKILL.md](../backend/SKILL.md).
- Ataque, detección, hardening profundo e incidentes:
  [../security/SKILL.md](../security/SKILL.md).
- Sistemas que incorporan modelos generativos: [../genai/SKILL.md](../genai/SKILL.md).
- No ejecutar cambios cloud, crear recursos o ampliar permisos sin autorización
  explícita sobre el comando o plan exacto.
