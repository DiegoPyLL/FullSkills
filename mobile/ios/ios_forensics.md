---
id: ios/ios_forensics
tipo: playbook
estabilidad: permanente
---

# Playbook — sospecha de compromiso de un iPhone

Escenario concreto sobre [../../security/playbooks/ir_base.md](../../security/playbooks/ir_base.md), que aporta las fases generales y no se repiten aquí. Modelo de amenaza y superficie en [ios.md](ios.md); campañas y CVE en [ios_exploits.md](ios_exploits.md).

## Premisa

Este playbook **no confirma limpieza**. Puede confirmar compromiso, o no encontrar nada — que es distinto de no haberlo. El spyware moderno borra su rastro y a menudo no persiste al reinicio: un análisis limpio es compatible con una infección terminada la semana pasada.

Quien pida una respuesta binaria («¿estoy infectado, sí o no?») necesita oír esto antes de que empiece el análisis, no después.

## Disparadores

| Disparador | Confianza | Acción |
|---|---|---|
| Notificación de amenaza de Apple | Alta sobre el *objetivo*, ninguna sobre el *compromiso* | Playbook completo |
| Perfil de riesgo — periodismo, disidencia, defensa de derechos, cargo diplomático | Estructural | Endurecer primero, analizar si hay indicio |
| Indicio concreto: perfil de configuración desconocido, dispositivo de confianza no reconocido en el Apple ID, consumo de datos anómalo | Media | Playbook completo |
| Batería, calor, lentitud, anuncios, publicidad «que parece escuchar» | **Muy baja** | Descartar causa mundana antes de nada |

La última fila es la mayoría de los casos reales. Un teléfono viejo con la batería degradada no es un teléfono intervenido, y tratar cada síntoma de desgaste como incidente agota la credibilidad para cuando haya uno de verdad.

Cuidado con el phishing que imita el disparador: los avisos de Apple no traen enlaces, no piden credenciales y no adjuntan ficheros. Un «has sido objetivo de spyware, instala esto» es el ataque, no la advertencia.

## Preservación — antes de tocar nada

Se hace en este orden, y el orden importa:

| Paso | Por qué |
|---|---|
| Modo avión | Corta el mando y control sin apagar. Preferible a apagar |
| **No apagar ni reiniciar** todavía | El reinicio puede llevarse el implante y con él la evidencia |
| **No restaurar** desde copia de seguridad | Destruye el estado y puede reintroducir la causa |
| **No actualizar** todavía | La actualización reescribe artefactos. Actualizar es la primera medida **después** de recolectar |
| No instalar «apps antispyware» | No ven nada útil desde el sandbox y añaden ruido |
| Anotar hora, versión de iOS y contexto | Sin línea temporal no hay correlación posible |

El error que más veces destruye el caso es «lo reseteo por si acaso». Borra la evidencia, no confirma nada y deja al usuario sin saber si debe cambiar sus contraseñas.

## Recolección

| Fuente | Cómo | Qué contiene | Requiere |
|---|---|---|---|
| Copia de seguridad **cifrada** local | Finder o iTunes, con contraseña de cifrado activada | Mensajes, adjuntos, historial de Safari, bases de uso de red, ajustes | Equipo de confianza y cable |
| `shutdown.log` | Se extrae del `sysdiagnose` | Procesos que retrasan el apagado en cada reinicio | Nada especial |
| `sysdiagnose` | Combinación de teclas del dispositivo, o perfil de diagnóstico | Registros del sistema, estado de procesos, red | Acceso al terminal |
| Volcado completo del sistema de ficheros | Herramienta forense especializada | Todo lo anterior más artefactos fuera de la copia | Herramienta comercial o acceso privilegiado |

Detalle que se olvida y arruina la recolección: **la copia debe cifrarse**. Sin contraseña de cifrado, iOS excluye de ella parte de los artefactos que más importan. Activar el cifrado no es opcional aquí.

## Artefactos de alto valor

| Artefacto | Señal que aporta |
|---|---|
| `shutdown.log` | Procesos que impiden un apagado limpio. El mismo proceso sospechoso repetido a lo largo de varios reinicios |
| `DataUsage.sqlite` | Procesos con tráfico de red, incluidos los que no deberían tenerlo |
| `netusage.sqlite` | Lo mismo con otra granularidad; se contrastan entre sí |
| Historial y cachés de Safari y WebKit | Redirecciones hacia servidores de instalación |
| Adjuntos y base de datos de Mensajes | Adjuntos cuya extensión no corresponde al contenido real; remitentes desconocidos alrededor de la fecha sospechosa |
| `ConfigurationProfiles/` | Perfiles instalados, certificados de CA añadidos, inscripción en MDM no reconocida |
| Registros de fallos | Caídas repetidas de los procesos que analizan entrada no confiable — el servicio de BlastDoor, el de medios, el de fuentes |

Los fallos repetidos merecen énfasis: **un exploit que falla deja más rastro que uno que funciona**. Una racha de caídas del mismo servicio en fechas próximas es de las señales más útiles que existen.

## Herramientas

| Herramienta | Para qué | Cómo se lee |
|---|---|---|
| `mvt-ios` (Mobile Verification Toolkit, Amnistía Internacional) | Analiza copia cifrada o volcado contra indicadores en formato STIX2 | Coincidencia de dominio o de ruta = **indicio**, no veredicto |
| Indicadores de Amnistía Internacional y de Citizen Lab | Alimentan a `mvt` | Envejecen: la infraestructura rota constantemente |
| `iShutdown` (Kaspersky) | Analiza `shutdown.log` de forma aislada | Comprobación ligera, buen primer paso |

Ninguna de las tres detecta lo desconocido. Todas comparan contra lo ya documentado, y por eso un resultado limpio significa «no coincide con lo que ya sabemos», nunca «está limpio».

## Interpretación

Reglas que evitan las dos conclusiones erróneas habituales:

- **Un resultado negativo no es limpieza.** Es ausencia de coincidencia con indicadores conocidos y envejecidos.
- **Una coincidencia aislada no es confirmación.** Un dominio en una base de uso de red puede ser un redirector reutilizado. Se busca **convergencia**: varios artefactos independientes apuntando a la misma ventana temporal.
- **Formular con nivel de confianza.** «Compromiso confirmado por convergencia de tres artefactos», «indicio único sin corroborar», «sin hallazgos, con las limitaciones del método». Nunca sí o no.
- **La reinfección repetida es la señal fuerte.** Si el terminal vuelve a mostrar indicios tras limpiarse, hay un vector abierto que no se ha cerrado — habitualmente la cuenta, no el dispositivo.

## Contención y recuperación

En este orden, y **desde otro dispositivo que se considere limpio**:

| Paso | Detalle |
|---|---|
| Rotar credenciales | Empezando por el Apple ID. Desde otro equipo: si el terminal está comprometido, la nueva contraseña también lo estará |
| Revisar dispositivos de confianza del Apple ID | Expulsar los no reconocidos; verificar los números de teléfono de confianza |
| Revisar perfiles e inscripción MDM | Eliminar todo lo que no se reconozca |
| Revisar reenvíos y reglas de correo | Persistencia habitual, y sobrevive al cambio de terminal |
| Actualizar el sistema | Ahora sí, ya recolectada la evidencia |
| Endurecer según perfil | Tabla de endurecimiento en [ios.md](ios.md) |
| Sustituir el terminal | Si el modelo es A11 o anterior y el modelo de amenaza incluye acceso físico, o si hay reinfección tras limpiar |

Restaurar «de fábrica» y recuperar después desde la copia reintroduce el estado anterior. Si se restaura, se configura como nuevo.

## Escalado

Analizar en solitario tiene dos problemas: el sesgo de quien ya sospecha, y la pérdida del valor colectivo de los indicadores. Derivar a un laboratorio con experiencia en spyware mercenario —Security Lab de Amnistía Internacional, línea de ayuda de Access Now, Citizen Lab— cuando haya convergencia real o el perfil de riesgo lo justifique.

Preservar la evidencia tal cual y documentar la cadena de custodia si el caso puede acabar en denuncia. Ver [../../security/forensics/forensics.md](../../security/forensics/forensics.md).
