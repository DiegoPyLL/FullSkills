---
id: nist
tipo: referencia
estabilidad: permanente
consulta_externa: https://csrc.nist.gov/publications — las publicaciones se revisan; verificar la revisión vigente antes de citar
---

# NIST — publicaciones aplicables

Mapa de "qué documento responde a qué pregunta". El error habitual es citar el marco equivocado: CSF describe resultados, 800-53 aporta controles, ISO certifica un sistema de gestión.

| Publicación | Responde | Cuándo usarla |
|---|---|---|
| CSF 2.0 | ¿Qué resultados de seguridad debo lograr? | Gobierno, comunicación con dirección, evaluación de madurez |
| SP 800-53 Rev.5 | ¿Qué controles concretos implemento? | Catálogo detallado; base de acreditaciones federales |
| SP 800-53A | ¿Cómo evalúo si el control funciona? | Auditoría técnica |
| SP 800-37 (RMF) | ¿Cómo gestiono el riesgo del sistema completo? | Autorización a operar |
| SP 800-30 | ¿Cómo evalúo el riesgo? | Metodología de análisis |
| SP 800-61 | ¿Cómo respondo a un incidente? | Base de [playbooks/ir_base.md](playbooks/ir_base.md) |
| SP 800-171 / 172 | ¿Cómo protejo información no clasificada en un tercero? | Cadena de suministro, contratistas |
| SP 800-207 | ¿Cómo diseño Zero Trust? | Arquitectura de acceso ([frameworks.md](frameworks.md#zero-trust)) |
| SP 800-218 (SSDF) | ¿Cómo desarrollo software seguro? | Requisito contractual creciente |
| SP 800-190 | ¿Cómo aseguro contenedores? | [containers/containers.md](containers/containers.md) |
| SP 800-63-4 | ¿Qué nivel de identidad y autenticación exijo? | Diseño de login |
| SP 800-88 | ¿Cómo destruyo datos de forma segura? | Baja de activos |
| SP 800-40 | ¿Cómo gestiono parches? | Programa de vulnerabilidades |
| SP 800-92 | ¿Cómo gestiono logs? | Diseño de SIEM |
| SP 800-160 | ¿Cómo diseño sistemas ciber-resilientes? | Arquitectura de sistemas críticos |
| SP 800-82 | ¿Cómo aseguro OT/ICS? | Entornos industriales |
| FIPS 140-3 | ¿Es válido este módulo criptográfico? | Requisitos regulados |
| FIPS 203/204/205 | ¿Qué algoritmos post-cuánticos uso? | ML-KEM, ML-DSA, SLH-DSA |

## CSF 2.0 — funciones y categorías

| Función | Categorías | Pregunta que responde |
|---|---|---|
| **GOVERN (GV)** | Contexto organizacional, Estrategia de riesgo, Roles y responsabilidades, Política, Supervisión, Riesgo de cadena de suministro | ¿Quién decide, con qué apetito de riesgo y qué política? |
| **IDENTIFY (ID)** | Gestión de activos, Evaluación de riesgo, Mejora | ¿Qué tengo y qué lo amenaza? |
| **PROTECT (PR)** | Gestión de identidad y acceso, Concienciación, Seguridad de datos, Resiliencia de plataforma, Seguridad de infraestructura tecnológica | ¿Cómo lo protejo? |
| **DETECT (DE)** | Monitoreo continuo, Análisis de eventos adversos | ¿Cómo me entero? |
| **RESPOND (RS)** | Gestión del incidente, Análisis, Reporte y comunicación, Mitigación | ¿Qué hago cuando pasa? |
| **RECOVER (RC)** | Ejecución del plan de recuperación, Comunicación de recuperación | ¿Cómo vuelvo a operar? |

Novedad clave de 2.0: `GOVERN` como función transversal y la gestión de riesgo de **terceros** elevada a categoría propia (GV.SC). El CSF ya no aplica solo a infraestructura crítica.

Uso: definir perfil **actual** vs. **objetivo** por categoría, y el plan de acción es la diferencia. Los Tiers (1 Parcial → 4 Adaptativo) describen el rigor del proceso de gestión de riesgo, **no** son un nivel de certificación.

## SP 800-53 Rev.5 — familias de control

| Familia | Contenido | Familia | Contenido |
|---|---|---|---|
| AC | Control de acceso | IR | Respuesta a incidentes |
| AT | Concienciación y formación | MA | Mantenimiento |
| AU | Auditoría y rendición de cuentas | MP | Protección de medios |
| CA | Evaluación y autorización | PE | Protección física |
| CM | Gestión de configuración | PL | Planificación |
| CP | Planificación de contingencia | PM | Gestión del programa |
| IA | Identificación y autenticación | PS | Seguridad del personal |
| PT | Tratamiento y transparencia de PII | RA | Evaluación de riesgo |
| SA | Adquisición de sistemas y servicios | SC | Protección de sistemas y comunicaciones |
| SI | Integridad de sistemas e información | SR | Cadena de suministro |

Rev.5 introduce controles neutros respecto al operador (aplican a organización y a proveedor), integra privacidad (PT) y añade la familia SR de cadena de suministro.

## SP 800-61 — ciclo de respuesta

| Fase | Contenido crítico |
|---|---|
| Preparación | Equipo, canales fuera de banda, herramientas forenses, retención de logs suficiente, autorizaciones previas para aislar, contratos de retainer, playbooks probados |
| Detección y análisis | Priorizar por impacto funcional, impacto informacional y recuperabilidad; documentar desde el minuto cero |
| Contención, erradicación y recuperación | Contener sin destruir evidencia; erradicar todo el acceso a la vez, no por partes; recuperar con validación |
| Post-incidente | Lecciones aprendidas en menos de dos semanas, sin buscar culpables; convertir cada hallazgo en un control o una detección |

La priorización por **impacto y recuperabilidad** (y no por número de sistemas) es lo que hace utilizable esta guía. Flujo operativo en [playbooks/ir_base.md](playbooks/ir_base.md).

## SP 800-63-4 — niveles de identidad

| Nivel | Significado | Ejemplo |
|---|---|---|
| IAL1 | Sin verificación de identidad | Registro con email |
| IAL2 | Verificación remota o presencial con evidencia | Documento + prueba de vida |
| IAL3 | Verificación presencial supervisada | Trámites de alto valor |
| AAL1 | Un factor | Solo contraseña |
| AAL2 | Dos factores, resistencia a replay | TOTP, push |
| AAL3 | Autenticador hardware **resistente a phishing**, prueba de posesión | FIDO2/WebAuthn, PIV |
| FAL1-3 | Robustez de la aserción federada | FAL3 exige prueba de posesión de la clave ligada a la aserción |

Consecuencia práctica: solo **AAL3** protege contra AitM de credenciales. SMS y push no alcanzan AAL2 de forma robusta (SMS está desaconsejado por interceptación y SIM swap).

## SSDF (SP 800-218) — grupos de práctica

| Grupo | Práctica | Traducción operativa |
|---|---|---|
| PO | Preparar la organización | Requisitos de seguridad definidos, roles, toolchain con seguridad integrada |
| PS | Proteger el software | Firmar releases, proteger el código y el pipeline, verificar integridad de artefactos |
| PW | Producir software bien asegurado | Diseño con modelado de amenazas, revisión de código, pruebas de seguridad, configuración segura por defecto |
| RV | Responder a vulnerabilidades | Canal de disclosure, análisis de causa raíz, corrección de la clase completa |

`RV.1.3` (analizar causa raíz y corregir la clase, no la instancia) es la práctica que más reduce reincidencia: conecta directamente con el uso de [cwe.md](cwe.md).
