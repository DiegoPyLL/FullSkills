---
id: playbooks/vpn
tipo: playbook
estabilidad: permanente
---

# Playbook — Compromiso de gateway VPN

Base común: [ir_base.md](ir_base.md). Modelo: [vpn/vpn.md](../vpn/vpn.md).

Regla que define este playbook: **parchear no expulsa al adversario**. Muchas vulnerabilidades de gateway permiten robar sesiones o credenciales que siguen siendo válidas después de la actualización.

## Señales de entrada

CVE crítico publicado para el producto y versión en uso; sesión activa sin evento de autenticación correspondiente; autenticación desde ASN de VPS o proxy residencial; cuenta local nueva en el dispositivo; cambios de configuración no aprobados; actividad interna anómala desde el rango de direcciones de VPN; aviso del fabricante o de un CERT.

## Contención inmediata

| # | Acción | Detalle |
|---|---|---|
| 1 | Determinar la ventana de exposición | Desde la primera fecha de explotación conocida, no desde la publicación del parche |
| 2 | Cortar el acceso remoto o restringirlo a orígenes conocidos | Si el negocio lo permite |
| 3 | Preservar la configuración y los logs del dispositivo | Antes de parchear o reiniciar; muchos appliances los rotan agresivamente |
| 4 | Aplicar el parche o reemplazar el dispositivo | |
| 5 | **Invalidar todas las sesiones activas** | Paso crítico y frecuentemente omitido |
| 6 | Rotar credenciales del dispositivo, secretos de configuración, certificados y claves precompartidas | Asumirlos comprometidos |
| 7 | Forzar el restablecimiento de contraseñas de los usuarios de VPN | Especialmente si el producto las almacena |
| 8 | Buscar actividad posterior en la red interna | El gateway es el punto de entrada, no el objetivo |

## Evidencia específica

| Elemento | Qué aporta |
|---|---|
| Logs de autenticación y de sesión del gateway | Sesiones sin login correspondiente: indicador directo |
| Configuración completa, comparada con la última copia aprobada | Cambios introducidos por el adversario |
| Cuentas locales del dispositivo | Persistencia |
| Logs del sistema del appliance | Ejecución de comandos, acceso a shell |
| Logs de red del perímetro | Origen de las conexiones y tráfico posterior |
| Actividad en el rango de direcciones asignado a clientes VPN | Movimiento lateral del adversario |
| Integridad del firmware | Implante persistente |
| Logs de AD o del IdP | Autenticaciones originadas desde la VPN |

## Investigación

1. ¿El dispositivo estuvo expuesto y sin parchear durante la ventana de explotación conocida? Si sí, **asumir compromiso aunque no haya alerta**.
2. ¿Hay sesiones sin evento de autenticación previo? Es la firma del robo de sesión.
3. ¿Se crearon cuentas o se modificó la configuración?
4. ¿Qué credenciales pudo obtener el adversario? Algunos productos almacenan credenciales de usuarios en claro o descifrables.
5. ¿Qué hizo dentro de la red? Reconocimiento, autenticaciones, herramientas RMM instaladas, movimiento lateral.
6. ¿Se instaló un implante en el firmware? Requiere verificación específica; sobrevive a la reconfiguración.
7. ¿Hay otros dispositivos del mismo fabricante y versión en la organización?

## Erradicación

- Parche aplicado o dispositivo reemplazado.
- Todas las sesiones invalidadas y todos los secretos rotados.
- Configuración comparada con la línea base aprobada y restaurada si hay cambios.
- Cuentas locales del dispositivo revisadas.
- **Reemplazo del dispositivo** si hay cualquier indicio de implante en el firmware: la verificación de integridad en estos equipos es limitada y el coste de equivocarse es alto.
- Erradicación de la actividad interna derivada: tratar como un incidente de red completo, no como un problema del appliance.
- Si hubo credenciales de dominio implicadas, aplicar [active_directory.md](active_directory.md).

## Prevención

| Control | Efecto |
|---|---|
| **MFA resistente a phishing** en el acceso remoto | Cierra el vector de credenciales robadas |
| Interfaz de administración nunca expuesta a Internet | Cierra la vía de compromiso más directa |
| Procedimiento de parcheo que **incluye la invalidación de sesiones** | Evita el error clásico |
| Segmentación tras la VPN: el usuario remoto no llega a toda la red | Limita el daño |
| Retirada planificada de equipos en fin de soporte | Elimina vulnerabilidades sin corrección posible |
| Reenvío de logs del gateway a un SIEM externo | Sin esto no hay investigación posible |
| Alerta sobre sesiones sin autenticación correspondiente | Detecta el robo de sesión |
| Migración a ZTNA | Elimina el acceso de capa 3 y la superficie del gateway |
| Certificado de dispositivo y comprobación de postura | Liga el acceso a equipos gestionados |
