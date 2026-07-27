---
id: frameworks
tipo: modelo
estabilidad: permanente
---

# Marcos y modelos: cuál usar y cuándo

Cada marco responde a **una** pregunta. Usar el equivocado produce respuestas vagas.

| Pregunta real | Marco | No usar para |
|---|---|---|
| ¿Cómo opera el adversario? | MITRE ATT&CK | Medir madurez |
| ¿Con qué lo paro? | MITRE D3FEND, CIS Controls | Describir al atacante |
| ¿Cuál es la causa raíz del bug? | CWE | Priorizar parches |
| ¿Qué patrón abstracto es? | CAPEC | Detección concreta |
| ¿Qué madurez tiene el programa? | NIST CSF 2.0, ISO 27001 | Respuesta táctica |
| ¿Qué controles implemento primero? | CIS Controls v8 (IG1→IG3) | Cumplimiento formal |
| ¿Qué parcheo hoy? | KEV + EPSS + SSVC | Auditoría |
| ¿Dónde corto la intrusión? | Cyber Kill Chain, Unified Kill Chain | Gestión de riesgo |
| ¿Cómo relaciono los elementos de un incidente? | Diamond Model | Priorizar controles |
| ¿Qué IOC duele más al atacante? | Pyramid of Pain | Cumplimiento |
| ¿Cómo modelo amenazas de un diseño? | STRIDE, PASTA, LINDDUN, attack trees | Operación diaria |
| ¿Cómo diseño la arquitectura de acceso? | Zero Trust (NIST SP 800-207) | Certificación |
| ¿Cómo desarrollo seguro? | NIST SSDF, OWASP SAMM, BSIMM | Respuesta a incidentes |
| ¿Cómo respondo a un incidente? | NIST SP 800-61, SANS PICERL | Prevención |

## Cyber Kill Chain (Lockheed Martin)

Siete fases lineales. Útil para razonar "cuanto antes cortes, más barato".

| # | Fase | Corte defensivo característico |
|---|---|---|
| 1 | Reconnaissance | Reducir exposición pública, ASM, honeypots |
| 2 | Weaponization | (fuera de tu alcance) inteligencia de amenazas |
| 3 | Delivery | Filtrado de correo, aislamiento de navegador, control de USB |
| 4 | Exploitation | Parcheo, ASLR/DEP/CFG, ASR, WDAC |
| 5 | Installation | EDR, application control, integridad de arranque |
| 6 | Command & Control | DNS/proxy con inspección, egress restringido, TLS fingerprinting |
| 7 | Actions on Objectives | DLP, backups inmutables, segmentación |

Límite: asume ataque externo y lineal. No modela bien insider, abuso de identidad cloud ni cadenas de suministro. Para eso, **Unified Kill Chain** (18 fases, incluye pivote y bucle interno) o directamente ATT&CK.

## Diamond Model

Cuatro vértices: **Adversario**, **Capacidad**, **Infraestructura**, **Víctima**. Toda evidencia toca al menos dos; cada arista es una hipótesis pivotable.

Uso práctico: dado un IOC (infraestructura), pivotar a capacidad (¿qué malware resuelve ahí?) y a otras víctimas (¿quién más contactó ese dominio?). Es el modelo de **pivoteo de inteligencia**, no de defensa.

## Pyramid of Pain

Coste para el atacante de cambiar el indicador que detectas. Detalle operativo en [ioc/ioc.md](ioc/ioc.md).

| Nivel | Indicador | Coste de evasión |
|---|---|---|
| 1 | Hash | Trivial (recompilar) |
| 2 | IP | Bajo |
| 3 | Dominio | Bajo-medio |
| 4 | Artefacto de red/host | Medio |
| 5 | Herramienta | Alto |
| 6 | **TTP** | Muy alto — objetivo de toda detección madura |

## NIST CSF 2.0

Seis funciones. **Govern** se añadió en 2.0 y es la que ancla el resto.

| Función | Contenido |
|---|---|
| Govern | Roles, política, riesgo de terceros, apetito de riesgo |
| Identify | Inventario de activos, datos, dependencias, riesgo |
| Protect | Identidad, control de acceso, formación, seguridad de datos y plataforma |
| Detect | Monitoreo continuo, análisis de eventos adversos |
| Respond | Gestión, análisis, mitigación, comunicación del incidente |
| Recover | Restauración, comunicación de recuperación |

Detalle de familias y SP en [nist.md](nist.md).

## CIS Controls v8

18 controles, tres grupos de implementación. Orden de valor real para una organización pequeña o media (IG1):

1. Inventario de activos y software (CIS 1–2) — sin esto ningún otro control es verificable.
2. Configuración segura (CIS 4) y gestión de cuentas/accesos (CIS 5–6).
3. Gestión de vulnerabilidades continua (CIS 7).
4. Registro y auditoría (CIS 8) — sin logs no hay detección.
5. Protección de correo y navegador (CIS 9), anti-malware (CIS 10).
6. **Recuperación de datos (CIS 11)** — el control que decide si un ransomware es incidente o quiebra.
7. Gestión de red (CIS 12–13), formación (CIS 14).
8. Proveedores (CIS 15), software seguro (CIS 16), respuesta (CIS 17), pentesting (CIS 18).

## ISO/IEC 27001:2022

SGSI certificable. Anexo A reorganizado en 4 temas: Organizacional (37), Personas (8), Físico (14), Tecnológico (34). Controles nuevos relevantes: 5.7 threat intelligence, 5.23 seguridad en servicios cloud, 8.9 gestión de configuración, 8.10 borrado de información, 8.11 enmascaramiento, 8.12 DLP, 8.16 actividades de monitoreo, 8.23 filtrado web, 8.28 codificación segura.

Diferencia con NIST CSF: ISO certifica un **sistema de gestión**; CSF describe **resultados**. No compiten; se mapean.

## Zero Trust

NIST SP 800-207. Principio: la ubicación en la red no otorga confianza. Cada acceso se evalúa por sesión.

**Los siete tenets, en forma accionable:**

| Tenet | Implementación concreta |
|---|---|
| Todo recurso es un recurso protegido | Nada "interno" queda sin autenticación |
| Toda comunicación se asegura sin importar la ubicación | mTLS / cifrado también dentro del datacenter |
| Acceso por sesión, no permanente | Tokens de vida corta, JIT/JEA, elevación temporal |
| Acceso por política dinámica | Señales: identidad, salud del dispositivo, ubicación, riesgo, sensibilidad del dato |
| Se monitorea la integridad de los activos | Postura del dispositivo como condición de acceso |
| Autenticación y autorización estrictas y dinámicas | MFA resistente a phishing, reevaluación continua |
| Se recolecta todo para mejorar la política | Telemetría alimenta la decisión |

**Componentes**: PEP (punto de aplicación) ← PDP (motor de política: PE + PA) ← fuentes de señal (IdP, MDM, CTI, SIEM, PKI).

**Errores frecuentes**: comprar un producto "Zero Trust" sin definir políticas; aplicar ZT solo al acceso remoto y dejar la red plana por dentro; ignorar identidades no humanas (service principals, tokens CI/CD), que hoy superan en número a las humanas.

**Orden de adopción realista**: MFA resistente a phishing en administradores → inventario y clasificación → ZTNA sustituye VPN plana → microsegmentación de servidores críticos → acceso privilegiado JIT → política basada en señales.

## Modelado de amenazas

**STRIDE** (por componente del diagrama de flujo de datos):

| Letra | Amenaza | Propiedad violada | Control base |
|---|---|---|---|
| S | Spoofing | Autenticación | MFA, mTLS, firma |
| T | Tampering | Integridad | Hash, firma, AEAD, control de acceso |
| R | Repudiation | No repudio | Logs firmados, auditoría |
| I | Information disclosure | Confidencialidad | Cifrado, autorización, minimización |
| D | Denial of service | Disponibilidad | Rate limit, cuotas, autoescalado |
| E | Elevation of privilege | Autorización | Least privilege, validación de entrada, sandbox |

**Cuándo usar cada uno**: STRIDE para diseño de software; **PASTA** cuando se necesita alinear con riesgo de negocio; **LINDDUN** para privacidad (GDPR/DPIA); **attack trees** para un objetivo concreto ("comprometer el DC"); **ATT&CK-based threat modeling** cuando ya se conoce al adversario relevante.

**Las cuatro preguntas** (Shostack) que estructuran cualquier sesión: ¿Qué estamos construyendo? ¿Qué puede salir mal? ¿Qué hacemos al respecto? ¿Lo hicimos bien?

## Desarrollo seguro

| Marco | Uso |
|---|---|
| NIST SSDF (SP 800-218) | Prácticas: PO (preparar), PS (proteger el software), PW (producir bien), RV (responder a vulnerabilidades). Exigido en contratación pública US |
| OWASP SAMM 2 | Medir madurez en 5 funciones de negocio, 15 prácticas |
| BSIMM | Observacional: qué hacen de facto otras organizaciones |
| OWASP ASVS | Requisitos verificables por nivel (L1/L2/L3). El mejor checklist técnico de una app web |
| SLSA | Niveles de integridad de la cadena de build. Ver [web/web.md](web/web.md#supply-chain) |

## Respuesta a incidentes

| Marco | Fases |
|---|---|
| NIST SP 800-61 | Preparación → Detección y análisis → Contención, erradicación y recuperación → Actividad post-incidente |
| SANS PICERL | Preparation, Identification, Containment, Eradication, Recovery, Lessons learned |

Ambos equivalen. Flujo operativo unificado en [playbooks/ir_base.md](playbooks/ir_base.md).
