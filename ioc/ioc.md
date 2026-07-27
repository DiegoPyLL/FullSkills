---
id: ioc/ioc
tipo: modelo
estabilidad: permanente
---

# IOC e inteligencia de amenazas

Cómo producir, consumir y valorar indicadores sin caer en el consumo acrítico de listas.

## Pirámide del dolor

Coste que impone al atacante cambiar el indicador que detectas. Determina dónde invertir el esfuerzo.

| Nivel | Indicador | Coste de evasión | Vida útil | Uso correcto |
|---|---|---|---|---|
| 1 | Hash | Trivial | Horas | Bloqueo inmediato y búsqueda retrospectiva |
| 2 | Dirección IP | Bajo | Días | Bloqueo temporal, con revisión |
| 3 | Dominio | Bajo-medio | Semanas | Bloqueo y detección |
| 4 | Artefacto de red o de host | Medio | Meses | Detección: rutas, claves, named pipes, cabeceras |
| 5 | Herramienta | Alto | Meses | Detección de la familia |
| 6 | **TTP** | Muy alto | Años | **Objetivo de toda detección madura** |

Aplicación: los niveles 1–3 se automatizan y caducan; el esfuerzo humano se invierte en 4–6.

## Tipos de inteligencia

| Tipo | Audiencia | Contenido | Horizonte |
|---|---|---|---|
| Estratégica | Dirección | Quién amenaza al sector y por qué; tendencias | Meses o años |
| Operativa | Responsables de seguridad | Campañas, capacidades, objetivos | Semanas o meses |
| Táctica | Ingeniería de detección | TTPs, herramientas, comportamientos | Meses |
| Técnica | Automatización | IOCs concretos | Horas o días |

Error frecuente: comprar inteligencia técnica (listas de IOCs) cuando el problema real se resuelve con inteligencia táctica (qué técnicas detectar).

## Ciclo de inteligencia

1. **Dirección**: qué preguntas hay que responder. Sin requisitos definidos, se consume ruido.
2. **Recolección**: fuentes internas (incidentes propios, la más valiosa) y externas.
3. **Procesamiento**: normalización, deduplicación, enriquecimiento.
4. **Análisis**: convertir datos en conclusiones con nivel de confianza explícito.
5. **Difusión**: al destinatario correcto y en el formato que puede usar.
6. **Retroalimentación**: ¿sirvió para algo? Si no, cambiar la fuente o los requisitos.

La fuente de mayor calidad es **la propia**: los indicadores extraídos de un incidente vivido tienen contexto, relevancia garantizada y cero ruido.

## Formatos y estándares

| Formato | Uso |
|---|---|
| STIX 2.1 | Representación estructurada de objetos de inteligencia y sus relaciones |
| TAXII | Transporte e intercambio de STIX |
| MISP | Plataforma de compartición con comunidades; formato propio ampliamente soportado |
| OpenIOC | Formato heredado, aún presente |
| Sigma | Detecciones portables sobre logs ([sigma/sigma.md](../sigma/sigma.md)) |
| YARA | Firmas sobre archivos y memoria ([yara/yara.md](../yara/yara.md)) |
| Snort / Suricata | Firmas de red ([snort](../snort/snort.md), [suricata](../suricata/suricata.md)) |
| CSV o listas planas | Simple y frágil: sin contexto ni caducidad |
| TLP (Traffic Light Protocol) | Marcado de la restricción de difusión: CLEAR, GREEN, AMBER, AMBER+STRICT, RED |

## Calidad de un IOC

Un indicador sin estos campos no debería entrar en producción:

| Campo | Por qué |
|---|---|
| Valor y tipo | Obvio, pero mal normalizado con frecuencia |
| **Contexto** | Qué campaña, qué familia, qué fase de la cadena |
| **Fecha de observación** | Un IOC de hace dos años bloquea infraestructura ya reasignada |
| **Caducidad** | Sin ella, la lista de bloqueo crece indefinidamente y acaba bloqueando servicios legítimos |
| Confianza | Alta, media o baja, con criterio explícito |
| Fuente y TLP | Trazabilidad y restricción de difusión |
| Acción recomendada | Bloquear, alertar o solo enriquecer |
| Falsos positivos conocidos | Evita incidentes operativos |

Antipatrones destructivos: bloquear IPs de proveedores de nube compartidos (afecta a servicios legítimos); consumir listas sin caducidad; importar miles de indicadores sin contexto y saturar el SIEM; tratar un IOC de baja confianza como prueba de compromiso.

## Uso operativo

| Uso | Descripción |
|---|---|
| Bloqueo | Alta confianza, con caducidad automática y proceso de excepción |
| Alerta | Confianza media; se investiga, no se bloquea |
| Enriquecimiento | Añade contexto a alertas existentes sin generar alertas propias |
| **Búsqueda retrospectiva** | Aplicar el IOC nuevo contra los datos históricos: el uso de mayor valor y el más olvidado |
| Priorización | El mismo evento pesa más si el destino está en inteligencia |

La búsqueda retrospectiva responde a la pregunta que importa: *"¿esto ya pasó y no lo vimos?"*.

## Recolección desde un incidente

Qué extraer, en orden de durabilidad creciente:

1. Hashes de los artefactos.
2. Infraestructura: IP, dominios, URLs, certificados, ASN.
3. Artefactos de host: rutas, nombres de archivo, claves de registro, servicios, tareas, mutex, named pipes.
4. Artefactos de red: User-Agent, cabeceras, patrones de URI, JA3/JA4, JARM, intervalos de beaconing.
5. Configuración extraída del malware: claves, identificadores de campaña, dominios de reserva.
6. **TTPs mapeados a ATT&CK**, con la evidencia que los sustenta.
7. Reglas de detección derivadas: Sigma para comportamiento, YARA para familia.

Los puntos 6 y 7 son los que evitan que el mismo adversario vuelva a entrar de la misma forma.

## Fuentes

| Categoría | Ejemplos | Consideración |
|---|---|---|
| Gubernamentales | CISA, ENISA, CERT nacionales y sectoriales | Gratuitas, fiables, a veces tardías |
| Comunitarias | MISP, comunidades sectoriales, ISAC | Muy relevantes por sector; requieren participación |
| Comerciales | Proveedores de CTI | Contexto y análisis; coste; evaluar la relevancia real para el propio sector |
| Abiertas | Repositorios de IOC, blogs de investigación, informes de proveedores | Calidad muy variable; verificar |
| Internas | Incidentes propios, honeypots, señuelos | **La de mayor valor**: cero ruido, contexto completo |
| Fuentes de vulnerabilidad | NVD, KEV, EPSS, avisos de fabricante | Ver [cisa_kev.md](../cisa_kev.md) |

## Honeypots y señuelos

Producen inteligencia propia con relación señal/ruido casi perfecta. Ver también [mitre_d3fend.md](../mitre_d3fend.md#deception-la-tactica-infrautilizada).

| Tipo | Qué detecta | Coste |
|---|---|---|
| Canary token (URL, documento, credencial) | Acceso a algo que nadie debería tocar | Muy bajo |
| Cuenta señuelo en el directorio | Enumeración, Kerberoasting, spraying | Bajo |
| Recurso compartido señuelo | Descubrimiento y movimiento lateral | Bajo |
| Servicio señuelo en la red interna | Escaneo interno | Medio |
| Honeypot de interacción alta | TTPs completos del adversario | Alto; requiere aislamiento cuidadoso |

Requisitos: indistinguible de lo real, excluido de escáneres y de backups automáticos, y con alerta directa a quien pueda actuar. Un señuelo que genera falsos positivos propios pierde toda su ventaja.

## Errores de interpretación frecuentes

| Error | Corrección |
|---|---|
| Tratar el solapamiento de infraestructura como atribución | Los actores comparten VPS, dominios y herramientas |
| Asumir que un IOC implica compromiso | Puede ser una conexión legítima al mismo proveedor |
| Ignorar la fecha del indicador | La infraestructura se reasigna constantemente |
| Bloquear sin evaluar el impacto operativo | Bloquear un CDN o un proveedor de correo rompe el negocio |
| Consumir sin requisitos | Se acumula ruido que nadie usa |
| Confundir "sin alertas" con "sin compromiso" | La ausencia de detección no es evidencia de ausencia |
| No documentar la confianza | El destinatario no puede calibrar la decisión |
