---
id: privacy/privacy
tipo: modelo
estabilidad: permanente
consulta_externa: https://gdpr.eu | https://ico.org.uk/global/data-protection | https://www.aepd.es
---

# Privacidad y Protección de Datos

Marco legal y técnico para el tratamiento de datos personales. Se cruza con seguridad: la protección de datos requiere controles de seguridad, pero no toda la seguridad trata con datos personales. Este módulo cubre **qué datos se tratan, con qué base legal, con qué derechos** — complementa a `ciberseguridad` y no lo sustituye.

## Premisa

La privacidad regula **dado que el acceso está autorizado, qué se hace con los datos**. La seguridad regula **quién accede y cómo se impide el acceso no autorizado**. Ambos son necesarios; uno sin el otro deja huecos.

## Regulaciones principales

| Regulación | Alcance | Fecha clave | Sanción máxima |
|---|---|---|---|
| **GDPR** (UE) | Personas en la UE, sin importar ubicación del responsable | 25-may-2018 | 20M € o 4% del volumen de negocio global |
| **LGPD** (Brasil) | Personas en Brasil | 18-sep-2020 | 2% del ingreso (limite 50M BRL por infracción) |
| **CCPA/CPRA** (California) | Residentes de California | 01-jan-2020 / 01-jan-2023 (CPRA) | 7.500 $ por infracción intencional |
| **HIPAA** (EE.UU.) | Datos de salud (PHI) | 2003 (security rule) | 1.5M $ por categoría de infracción |
| **PIPEDA** (Canadá) | Datos personales en comercio federal/provincial | 2001 | Hasta 100K CAD por infracción |
| **LFPDPPP** (México) | Datos personales en sector privado | 21-jul-2010 | Hasta 360.000 UM (unidades de medida) |
| **LOPDGDD** (España) | Desarrollo del GDPR en España | 2018 (actualizada) | Mismo régimen GDPR con agravantes |
| **PDPA** (Tailandia) | Personas en Tailandia | 28-may-2019 | 5M THB |
| **Data Protection Act 2018** (UK) | Desarrollo del GDPR post-Brexit | 01-jan-2021 | 17.5M £ o 4% del negocio |
| **Schrems II** | Transferencias UE→EE.UU. | 16-jul-2020 | Invalidez del Privacy Shield; requiere cláusulas estándar + TIA |

## Conceptos fundamentales

| Término | Definición | Ejemplo |
|---|---|---|
| Dato personal | Cualquier info sobre persona identificable | Nombre, email, IP, cookie, IMEI, geolocalización |
| Dato especial (sensible) | Categoría especial que requiere protección reforzada | Salud, orientación sexual, opiniones políticas, biometría |
| Responsable del tratamiento | Quien decide el "por qué" y el "cómo" | La empresa que despliega la app |
| Encargado del tratamiento | Quien procesa por cuenta del responsable | El proveedor de cloud que aloja la DB |
| Tratamiento | Cualquier operación sobre datos personales | Recolección, almacenamiento, uso, transferencia, borrado |
| Minimización | Solo los datos necesarios, para el tiempo necesario | No guardar la IP más de 30 días si no es necesaria |
| Limitación del propósito | Usar los datos solo para lo que se anunció | No usar los emails de registro para marketing sin consentimiento |
| Exactitud | Mantener los datos correctos y actualizados | Permitir al usuario corregar su email |
| Integridad y confidencialidad | Seguridad técnica y organizativa | Cifrado, acceso controlado, backups |
| Responsabilización (accountability) | Demostrar el cumplimiento, no solo cumplirlo | Documentar todo el ciclo de vida del dato |

## Bases legales del tratamiento (GDPR Art. 6)

| Base legal | Cuándo aplica | Limitaciones |
|---|---|---|
| **Consentimiento** | El usuario da permiso libre, específico, informado e inequívoco | Puede retirarlo en cualquier momento; debe ser tan fácil darlo como retirarlo |
| **Ejecución de contrato** | Necesario para cumplir un contrato con el usuario | No basta con "ser útil"; debe ser imprescindible |
| **Obligación legal** | La ley exige el tratamiento | Cita la ley específica |
| **Interés vital** | Proteger la vida de alguien | Solo cuando no hay otra vía |
| **Interés público** | Función oficial o interés público | Debe estar en la ley |
| **Interés legítimo** | Legítimo y no suplanta derechos del interesado | Balance obligatorio; derecho de oposición siempre |

**Dato especial (GDPR Art. 9):** prohibido por defecto. Solo con bases adicionales del Art. 9(2): consentimiento explícito, obligación laboral, interés vital, fundación sin ánimo de lucro, datos manifiestamente públicos, reclamo legal, interés público en salud, archiving en interés público.

## Derechos del interesado (GDPR Arts. 15-22)

| Derecho | Plazo | Qué implica |
|---|---|---|
| Acceso | 30 días | "¿qué datos tienes de mí?" + copia completa |
| Rectificación | 30 días | Corregir datos inexactos |
| Supresión ("derecho al olvido") | 30 días | Borra todos los datos salvo base legal para retener |
| Portabilidad | 30 días | Datos en formato estructurado, máquina-legible, transferible |
| Oposición | Inmediato | Detener tratamiento por interés legítimo o marketing |
| Limitación del tratamiento | 30 días | Congelar datos mientras se resuelve la disputa |
| No ser objeto de decisión automatizada | Inmediato | Incluye profiling con efecto legal o significativo |

## DPIA — Evaluación de Impacto de Protección de Datos

Requida cuando el tratamiento es de **alto riesgo**: uso sistemático y evaluado a gran escala de datos especiales, vigilancia sistemática a gran escala, tecnología nueva, procesamiento que combine conjuntos de datos grandes.

| Fase | Acción |
|---|---|
| 1. Descripción del tratamiento | Finalidad, datos, plazos, destinatarios, flujos transfronterizos |
| 2. Necesidad y proporcionalidad | ¿Los datos son necesarios? ¿Hay forma menos intrusiva? |
| 3. Evaluación de riesgos | Riesgo para derechos y libertades de las personas |
| 4. Medidas de mitigación | Controles técnicos y organizativos |
| 5. Consulta previa | Si el riesgo residual sigue siendo alto, consultar a la AEPD |
| 6. Seguimiento | Revisar la DPIA al menos anualmente o ante cambios significativos |

## Transferencias internacionales

| Mecanismo | Cuándo | Limitaciones |
|---|---|---|
| Decisiones de adecuación | La Comisión UE determina que el país ofrece nivel adecuado | Japón, Corea del Sur, Argentina, Israel, Suiza... lista actualizada |
| Cláusulas contractuales estándar (SCC) | No hay decisión de adecuación | Obligatorio + Transfer Impact Assessment (TIA) |
| Bindings corporativos (BCR) | Multinacionales | Aprobación por autoridades; costo y tiempo elevados |
| Excepciones Art. 49 | Caso por caso | Solo para situaciones específicas; no para procesamiento regular |

**Schrems II** requirió que el exportador evalúe si el derecho local del país de destino permite vigilancia gubernamental sobre los datos. Si es así, se necesitan medidas suplementarias (cifrado extremo a extremo con clave en la UE, fragmentación).

## Privacy by Design (Annex I, ISO 27701)

| Principio | Implementación |
|---|---|
| Proactivo, no reactivo | Anticipar riesgos, no reaccionar tras la brecha |
| Privacidad por defecto | El usuario no tiene que hacer nada; los datos se protegen automáticamente |
| Privacidad integrada en el diseño | No añadir privacidad después como parche |
| Funcionalidad completa | No sacrificar seguridad por privacidad ni viceversa |
| Visibilidad y transparencia | Las partes pueden verificar el cumplimiento |
| Respeto a la privacidad del usuario | Interés del usuario por encima del responsable |

## Implementación técnica de privacidad

| Control | Qué protege | Implementación |
|---|---|---|
| Anonimización | Convierte dato personal en no-personal | Agregación, generalización, k-anonimidad, differential privacy |
| Seudonimización | Reversible solo con clave adicional | Tokenización, hashing con sal, cifrado de campos |
| Minimización | No almacenar más de lo necesario | Data retention policy, truncado automático, job de purga |
| Consentimiento gestionado | Base legal para el tratamiento | CMP (Consent Management Platform), log de consentimientos |
| Gestión de derechos del interesado (DSAR) | Ejercer acceso, rectificación, borrado | Portal auto-servicio, flujo automatizado de verificación |
| Data classification | Saber qué datos son sensibles | Clasificación automática y manual por tipo y criticidad |
| Encryption at rest | Confidencialidad de datos en almacenamiento | AES-256, claves gestionadas por el cliente |
| Encryption in transit | Confidencialidad durante la transmisión | TLS 1.2+, mTLS para servicio a servicio |
| Audit logging | Trazabilidad de accesos a datos personales | Logs inmutables, con identidad de quien accede y cuándo |
| DLP (Data Loss Prevention) | Evitar salida no autorizada de datos | Reglas por patrón (número de tarjeta, email, SSN) |

## Incidente de protección de datos

| Requisito GDPR | Plazo / Acción |
|---|---|
| Notificar a la autoridad | 72 horas desde que se tiene conocimiento |
| Notificar al interesado | Sin dilación indebida, si el riesgo es alto |
| Registrar el incidente | Libro interno del responsable, con detalles y medidas |
| Evaluar el riesgo | Alcance, naturaleza, impacto, probabilidad para los interesados |

## Mapeo con seguridad

| Área de privacidad | Equivalente de seguridad |
|---|---|
| Confidencialidad | Cifrado, acceso controlado, DLP |
| Integridad | FIM, firma, hash, control de cambios |
| Disponibilidad | Backups, redundancia, DR |
| Minimización | Clasificación, retención, purga |
| Consentimiento | Políticas de acceso, auditoría de accesos |
| Derechos del interesado | DSAR automation, data map, data inventory |
| Accountability | Documentación, auditorías, certificaciones |
| Transferencia internacional | SCC + TIA, localización de datos, cifrado con clave en UE |

## Registros de actividades de tratamiento (GDPR Art. 30)

| Información | Responsable | Encargado |
|---|---|---|
| Nombre y datos de contacto | Sí | Sí |
| Finalidades del tratamiento | Sí | — |
| Categorías de datos | Sí | Sí |
| Categorías de interesados | Sí | Sí |
| Destinatarios de los datos | Sí | Sí |
| Transferencias a terceros países | Sí | — |
| Plazos de eliminación | Sí | — |
| Medidas de seguridad descriptivas | Sí | Sí |

## Auditoría de privacidad

| Elemento | Pregunta |
|---|---|
| Data inventory | ¿Qué datos personales se tienen y dónde están? |
| Lawful basis | ¿Cuál es la base legal para cada tratamiento? |
| Retention | ¿Se eliminan los datos cuando ya no son necesarios? |
| Third-party | ¿Qué proveedores procesan datos personales y cómo se supervisan? |
| Rights | ¿Se puede ejercer acceso/rectificación/borrado en 30 días? |
| DPIA | ¿Se ha hecho DPIA para los tratamientos de alto riesgo? |
| Breach response | ¿Se notifica en 72h si hay brecha? |
| Training | ¿El personal sabe las políticas de privacidad? |

## Fuentes de referencia

| Recurso | Uso |
|---|---|
| [frameworks.md](../frameworks.md) | Marcos de gobernanza (NIST CSF incluye Govern) |
| [nist.md](../nist.md) | SP 800-53, SP 800-114 (privacy controls) |
| [ciberseguridad](../SKILL.md) | Seguridad como prerequisito de privacidad |
| GDPR.eu | Textos legales y guías de las AEPD |
| ICO (ico.org.uk) | Guías de cumplimiento GDPR/UK GDPR |
| AEPD (aepd.es) | Agencia Española de Protección de Datos |
| ENISA Privacy Guidelines | Guías técnicas de privacidad de la UE |
| ISO/IEC 27701 | Extensión de 27001 para gestión de privacidad |
| NIST Privacy Framework | Framework de privacidad NIST (version 1.0) |
