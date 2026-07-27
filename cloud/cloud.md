---
id: cloud/cloud
tipo: modelo
estabilidad: permanente
---

# Seguridad en la nube — modelo transversal

Lo común a AWS, Azure y GCP. Los módulos específicos ([aws](../aws/aws.md), [azure](../azure/azure.md), [gcp](../gcp/gcp.md)) solo contienen lo que difiere.

## Los cuatro cambios de modelo mental

1. **El perímetro es la identidad.** No hay red que proteger: hay credenciales que se usan desde cualquier lugar. Una clave filtrada equivale a acceso físico al datacenter.
2. **Todo es una llamada a API.** No hay "servidor comprometido" sin más: hay permisos usados. El log de la API es la fuente forense principal, y su ausencia deja ciego el análisis.
3. **El plano de control y el de datos son distintos.** Se puede robar el contenido de una base sin tocar la base: basta con un snapshot compartido a otra cuenta.
4. **La configuración es el vector dominante.** La mayoría de los incidentes cloud no involucran ningún CVE: son permisos excesivos, almacenamiento abierto, credenciales estáticas y logs desactivados.

## Modelo de responsabilidad compartida

| Capa | IaaS | PaaS | SaaS |
|---|---|---|---|
| Datos y clasificación | Cliente | Cliente | Cliente |
| Identidad y accesos | Cliente | Cliente | Cliente |
| Configuración de la aplicación | Cliente | Cliente | Cliente |
| Sistema operativo y parcheo | Cliente | Proveedor | Proveedor |
| Runtime y middleware | Cliente | Proveedor | Proveedor |
| Red virtual | Compartido | Proveedor | Proveedor |
| Infraestructura física | Proveedor | Proveedor | Proveedor |

Invariante: **identidad, datos y configuración son siempre del cliente**. Ahí ocurren prácticamente todos los incidentes.

## Cadena de ataque característica en la nube

```
Credencial obtenida (secreto filtrado, SSRF a metadata, phishing, infostealer)
  → Enumeración de permisos propios
  → Escalada por permisos IAM excesivos (PassRole, modificación de política, suplantación)
  → Persistencia (usuario o clave nueva, rol con confianza externa, función serverless)
  → Recolección (snapshots, buckets, bases, secretos)
  → Exfiltración (compartir snapshot con la cuenta del atacante, copia entre regiones)
  → Impacto (borrado, cifrado, minería, extorsión)
```

Cada flecha es un punto de detección con un evento de API asociado. Cortar la primera —la obtención de credenciales— es lo más rentable.

## IAM: los errores que causan incidentes

| Error | Consecuencia | Corrección |
|---|---|---|
| Credenciales estáticas de larga vida | Se filtran en repositorios, portátiles y logs; no caducan | Federación OIDC/SSO, roles temporales, cero claves estáticas |
| Comodines en las políticas (`*` en acción o recurso) | Permiso efectivo desconocido | Políticas explícitas; revisión con análisis de permisos efectivos |
| Permisos que permiten modificar permisos | Autoescalada a administrador | Permissions boundaries, SCP/políticas de organización |
| Rol de servicio sobreprivilegiado | Un compromiso de la aplicación entrega la cuenta | Un rol por función, con permisos mínimos |
| Confianza demasiado abierta entre cuentas | Acceso desde fuera de la organización | Condiciones estrictas (identificador externo, origen de la organización) |
| MFA ausente en cuentas privilegiadas | Phishing suficiente para tomar el control | MFA resistente a phishing obligatorio |
| Cuenta raíz o global admin de uso cotidiano | Un solo compromiso lo entrega todo | Uso exclusivo de emergencia, custodiada, con MFA hardware |
| Permisos permanentes en vez de temporales | Superficie constante | Elevación JIT con aprobación y caducidad |
| Identidades no humanas sin gobierno | Suelen superar en número a las humanas y nadie las revisa | Inventario, propietario, caducidad y rotación por cada identidad de servicio |

## Metadata del instance: el vector de SSRF a credencial

Toda instancia de cómputo expone un endpoint local (`169.254.169.254`) que devuelve credenciales del rol asociado. Una SSRF en la aplicación se convierte en credenciales de nube.

Mitigaciones, en orden:

1. **Exigir la versión con sesión** del servicio de metadata (IMDSv2 en AWS y equivalentes), que requiere un `PUT` previo y una cabecera, lo que la hace inalcanzable mediante SSRF simple.
2. **Hop limit 1**, para que un contenedor no pueda alcanzar la metadata del nodo.
3. **Bloquear la IP de metadata** desde contenedores y cargas que no la necesiten.
4. **Rol mínimo por instancia**, para que la credencial robada valga poco.
5. **Alertar sobre uso de credenciales de rol de instancia desde fuera del proveedor**: si aparece una IP externa usando el rol, es exfiltración confirmada.

## Almacenamiento

| Riesgo | Detección | Control |
|---|---|---|
| Bucket o contenedor público | Escaneo continuo de configuración; los proveedores ofrecen bloqueo a nivel de cuenta | Bloqueo de acceso público a nivel de organización, sin excepciones sin aprobación |
| ACL heredadas permisivas | Auditoría de políticas de objeto | Deshabilitar ACL, usar solo políticas |
| Compartición cross-account o pública de snapshots e imágenes | Eventos de modificación de permisos del recurso | Política de organización que lo prohíba |
| Cifrado con claves gestionadas por el proveedor sin control del cliente | El proveedor descifra; el borrado de clave no está bajo control | Claves gestionadas por el cliente para datos sensibles |
| Sin versionado ni bloqueo de objetos | Borrado o cifrado irreversible por ransomware | Versionado, retención con bloqueo (WORM), MFA para borrado |
| Logs de acceso a datos desactivados | Imposible determinar el alcance de una brecha | Registro de acceso a nivel de objeto en repositorios sensibles |

## Registro y detección

| Requisito | Motivo |
|---|---|
| Log del plano de control **en todas las regiones y cuentas** | El atacante opera en regiones que nadie mira |
| Logs enviados a una **cuenta separada e inmutable** | Impide que el compromiso de la cuenta borre su propia evidencia |
| Alerta obligatoria sobre desactivación o modificación del logging | Es la primera acción de un atacante competente |
| Log del plano de datos en almacenes sensibles | Sin él no se puede probar qué se leyó |
| Retención suficiente (mínimo 12 meses para lo crítico) | El tiempo de permanencia medio supera con creces los 90 días por defecto |
| Detecciones de identidad: uso de credencial desde IP nueva, país nuevo, ráfaga de `Describe`/`List`, cambios en IAM | Cubre la cadena de ataque completa |

## Detecciones transversales de mayor valor

| Señal | Interpretación |
|---|---|
| Desactivación o borrado del registro de auditoría | Intrusión en curso, prioridad máxima |
| Credencial de rol de instancia usada desde una IP fuera del proveedor | Exfiltración de credenciales confirmada |
| Creación de usuario, clave de acceso o service principal por una identidad que nunca lo hace | Persistencia |
| Cambio en políticas de confianza o federación | Persistencia de alto impacto |
| Ráfaga de llamadas de enumeración desde una identidad | Reconocimiento tras el compromiso |
| Snapshot o imagen compartida fuera de la organización | Exfiltración |
| Recursos creados en regiones no utilizadas | Minería o infraestructura del atacante |
| Pico de gasto | Minería, o exfiltración con coste de transferencia |
| Consentimiento de aplicación con permisos amplios | Persistencia en el plano de identidad |
| Acceso a secretos fuera de patrón | Recolección |

## Postura y prevención

| Práctica | Efecto |
|---|---|
| **Infraestructura como código con revisión** | La configuración deja de ser manual y se vuelve auditable |
| **Detección de drift** | Todo cambio fuera de IaC es sospechoso por definición |
| **Barandillas preventivas** (SCP, Azure Policy, políticas de organización) | Impiden la mala configuración en vez de detectarla después |
| **CSPM / CIEM** | Detección continua de configuración y de permisos efectivos |
| **Separación por cuentas o suscripciones** por entorno y criticidad | Limita el radio de explosión; es la microsegmentación de la nube |
| **Escaneo de secretos en repositorios y en imágenes** | Corta el vector de credencial filtrada |
| **Presupuesto con alertas y límites** | Contiene el "denial of wallet" y delata la minería |

## Cuentas de emergencia

Diseñar antes del incidente: al menos dos cuentas de acceso total, excluidas del SSO y de las políticas de acceso condicional, con MFA hardware, credenciales custodiadas en sobres sellados o en una bóveda física, y monitorización que alerte ante **cualquier** uso. Sin ellas, un compromiso o un fallo del proveedor de identidad deja a la organización sin capacidad de responder.
