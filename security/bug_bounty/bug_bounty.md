---
id: bug_bounty/bug_bounty
tipo: modelo
estabilidad: permanente
---

# Bug Bounty / Vulnerability Disclosure

Programas organizados para identificar vulnerabilidades mediante la participación de investigadores externos. Complementa al pentesting al ofrecer cobertura continua y diversidad de perspectivas.

## Tipos de programas

| Tipo | Descripción | Cuándo usar |
|---|---|---|
| **Bug bounty** | Recompensa económica por vulnerabilidades encontradas | Cuando se quiere cobertura continua y amplia |
| **Vulnerability Disclosure (VDP)** | Proceso formal para recibir reportes sin recompensa | Como mínimo; cualquier organización debe tenerlo |
| **Responsible disclosure** | El investigador contacta al fabricante de forma confidencial | Para programas sin bounty |
| **Coordinated disclosure** | Se revela públicamente tras dar tiempo para el parche | Estándar de la industria |
| **Full disclosure** | Se revela públicamente inmediatamente | Último recurso; daña a la organización y a los usuarios |
| **Bug crowdsource** | Plataforma con múltiples investigadores (HackerOne, Bugcrowd) | Cuando se quiere acceso a una comunidad de investigadores |
| **Private bounty** | Invitación a investigadores seleccionados | Para programas maduros o sensibles |
| **Public bounty** | Cualquiera puede participar | Para programas abiertos |

## Plataformas principales

| Plataforma | Características |
|---|---|
| **HackerOne** | La más grande; integraciones con SIEM, Jira, Slack; programas públicos y privados |
| **Bugcrowd** | Segunda más grande; plataformas de seguridad integradas |
| **YesWeHack** | Europa; programas públicos y privados |
| **Synack** | Investigadores verificados; programas privados solo |
| **OpenBugBounty** | Sin recompensa; enfoque en responsible disclosure |
| **Intigriti** | Europa; programa de bug bounty y VDP |
| **Cobalt** | Plataforma de pentesting y bug bounty; integraciones con DevSecOps |
| **Tango** | Plataforma de bug bounty; enfoque en programas privados |

## Estructura de un programa

| Elemento | Descripción |
|---|---|
| **Scope** | Qué está dentro del alcance (dominios, IPs, apps). Ser específico. |
| **Out of scope** | Qué está fuera del alcance (subdominios no incluidos, APIs internas) |
| **Rules of engagement** | Reglas para los investigadores (qué técnicas están permitidas/prohibidas) |
| **Severity matrix** | Clasificación de severidad de vulnerabilidades con ejemplos |
| **Rewards** | Recompensas por vulnerabilidad (basada en severidad) |
| **Reporting process** | Cómo reportar vulnerabilidades (formulario, email, plataforma) |
| **Response SLA** | Tiempo de respuesta prometido (triage, validación, remediación) |
| **Triage team** | Equipo que revisa y valida reportes |
| **Dispute process** | Proceso de disputa para investigadores |
| **Hall of fame** | Lista de investigadores destacados |

## Severidad y rango de recompensas

| Severidad | Descripción | Rango típico |
|---|---|---|
| **Critical** | RCE, auth bypass completo, SQLi con impacto grave, XSS con impacto grave | $5,000 – $50,000+ |
| **High** | SQLi, XSS, CSRF, auth bypass parcial, info disclosure grave | $1,000 – $10,000 |
| **Medium** | XSS menor, info disclosure menor, SSRF, IDOR | $250 – $2,500 |
| **Low** | XSS menor, info disclosure menor, CSRF menor | $50 – $500 |
| **Informational** | Issues menores, recomendaciones | Sin recompensa o swag |
| **N/A** | No es una vulnerabilidad, out of scope | Sin recompensa |
| **Duplicate** | Reporte duplicado | Sin recompensa |
| **Invalid** | Reporte inválido | Sin recompensa |
| **Not Reproducible** | No se puede reproducir | Sin recompensa |
| **Won't Fix** | No se va a corregir | Sin recompensa |

## Reglas de engagement (ejemplo)

| Acción | Permitido | Notas |
|---|---|---|
| Pruebas automatizadas | Sí | Con tasa de solicitud razonable |
| Fuerza bruta | No | Puede bloquear cuentas legítimas |
| Phishing de usuarios | No | Necesita autorización explícita |
| Ingeniería social | No | Fuera del alcance |
| Denegación de servicio | No | Puede afectar a otros usuarios |
| Exploración de redes de terceros | No | Fuera del scope |
| Pruebas de APIs públicas | Sí | Dentro del scope |
| Pruebas de apps móviles | Sí | Dentro del scope |
| Pruebas de dominio | Sí | Dentro del scope |
| Pruebas de subdominios | Depende del scope | Verificar antes de probar |

## Métricas del programa

| Métrica | Qué mide |
|---|---|
| Vulnerabilidades reportadas | Total de reportes recibidos |
| Vulnerabilidades aceptadas | % de reportes válidos |
| Vulnerabilidades pagadas | % de reportes con recompensa |
| Vulnerabilidades duplicadas | % de reportes duplicados |
| Tiempo medio de triaje | Velocidad de validación |
| Tiempo medio de remediación | Velocidad de corrección |
| Severidad media | Calidad de los hallazgos |
| Investigadores activos | Participación del programa |
| Costo por vulnerabilidad | ROI del programa |

## Cómo comparar con pentesting

| Aspecto | Bug bounty | Pentesting |
|---|---|---|
| Cobertura | Continua, amplia | Periódica, acotada |
| Perspectiva | Diversa, externa | Planificada, interna |
| Profundidad | Limitada por el alcance | Profunda y controlada |
| Coste | Pago por hallazgo | Pago por tiempo |
| Legalidad | Basado en reglas del programa | Contrato definido |
| Reporting | Variable según el investigador | Estructurado y consistente |
| Mejora continua | Sí, descubrimiento constante | No, puntuación en un momento |
| Lo que no cubre | Profundidad, auth interna, testing físico | Cobertura continua, diversidad |

## Fuentes de referencia

| Recurso | Uso |
|---|---|
| [cve_database.md](../cve_database.md) | CVEs de productos del scope |
| [cisa_kev.md](../cisa_kev.md) | Priorización de vulnerabilidades |
| [owasp.md](../owasp.md) | Categorías de vulnerabilidades web |
| [owasp_api.md](../owasp_api.md) | Categorías de vulnerabilidades API |
| [references/references.md](../references/references.md) | Herramientas y fuentes |
| HackerOne HackerDB | Datos de programas de bug bounty |
| Bugcrowd CrowdShake | Inteligencia de campañas |
| OWASP Vulnerability Disclosure | Guías de VDP |
| NIST SP 800-115 | Técnicas de prueba de seguridad |
| PTES | Estándar de pentesting |
| OSSTMM | Estándar de testing de seguridad |
