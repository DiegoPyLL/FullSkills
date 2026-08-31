---
id: cloud/operations
tipo: modelo
estabilidad: permanente
---

# Operación cloud reproducible

## Identidad y secretos

| Práctica | Por qué | Cómo se verifica |
|---|---|---|
| Usuario o identidad dedicada por entorno y carga | Limita impacto y permite revocar sin afectar cuentas personales | La demo funciona sin credenciales de propietario de cuenta |
| Permisos derivados de acciones reales, no roles amplios por conveniencia | Reduce la capacidad accidental y el radio de impacto | Cada permiso se relaciona con una llamada o recurso requerido |
| Secretos fuera del repositorio, imagen, URL y frontend | El historial y el cliente no son almacenes revocables | Escaneo del artefacto y prueba de que el navegador nunca recibe la clave |
| Rotación antes que ocultación cuando un secreto se expone | Borrar una copia no invalida las demás | La credencial anterior deja de autenticar |

## Infraestructura y despliegue

- Declarar recursos, políticas y configuración no secreta como código cuando se
  espera recrearlos o compartirlos.
- Separar `plan` de `apply`; revisar región, identidad, recursos públicos y
  operaciones destructivas antes de aplicar.
- Promover el mismo artefacto entre entornos y variar configuración externa.
- Diseñar rollback del artefacto y roll-forward de datos; una migración de datos
  no siempre se puede revertir junto con el código.

## Señales mínimas

| Señal | Pregunta que responde |
|---|---|
| Identificador de petición | ¿Qué ocurrió en esta interacción concreta? |
| Latencia total y por dependencia | ¿Dónde se consumió el tiempo? |
| Resultado clasificado | ¿Fue éxito, rechazo del cliente, límite o fallo del proveedor? |
| Consumo atribuible | ¿Qué operación o usuario produjo el coste? |
| Modo y versión desplegada | ¿La respuesta vino de producción, fallback o simulación? |

No registrar prompts, respuestas o cabeceras completas por defecto: pueden
contener secretos o datos personales. Registrar metadatos y permitir contenido
solo mediante una decisión explícita de privacidad.

## Recuperación verificable

Una copia sin restauración probada es una esperanza. El runbook debe indicar
disparador, responsable, orden de recuperación, dato que puede perderse y señal
que confirma que el servicio volvió. En demos, añadir un fallback explícito;
nunca presentar una respuesta simulada como si viniera del proveedor real.
