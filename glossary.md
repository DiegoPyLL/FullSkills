---
id: glossary
tipo: referencia
estabilidad: permanente
---

# Glosario operativo

Definiciones para desambiguar términos que se usan mal. Una fila = un concepto.

## Riesgo y vulnerabilidad

| Término | Definición precisa | Confusión frecuente |
|---|---|---|
| Amenaza | Actor o evento con capacidad e intención de causar daño | No es la vulnerabilidad |
| Vulnerabilidad | Debilidad explotable en diseño, implementación o configuración | Un bug sin impacto de seguridad no es vulnerabilidad |
| Exploit | Código o secuencia que convierte la vulnerabilidad en una primitiva útil | PoC ≠ exploit weaponizado |
| Riesgo | Probabilidad × impacto, sobre un activo concreto | CVSS no es riesgo: ignora exposición y valor del activo |
| Exposición | Alcanzabilidad del componente vulnerable por el atacante | Vulnerable ≠ explotable |
| Primitiva | Capacidad cruda que otorga el bug: leer/escribir archivo arbitrario, ejecución, forjar token | Es lo que determina el impacto real |
| Superficie de ataque | Conjunto de puntos de entrada alcanzables | Crece con cada dependencia y cada puerto |
| Vector de ataque | Canal por el que llega el ataque: red, adyacente, local, físico | Campo `AV` de CVSS |
| Cadena de explotación | Encadenar N vulnerabilidades para llegar al objetivo | Cada eslabón puede ser de severidad baja |
| Ventana de exposición | Tiempo entre disclosure y parche aplicado | Métrica de gestión de vulnerabilidades más útil que "nº de CVEs" |
| 0-day | Vulnerabilidad explotada sin parche disponible del fabricante | Deja de serlo al publicarse el parche, no al descubrirse |
| n-day | Vulnerabilidad con parche disponible, aún explotada masivamente | Causa la mayoría de brechas reales |

## Métricas

| Métrica | Qué mide | Rango | Uso correcto |
|---|---|---|---|
| CVSS Base | Severidad técnica intrínseca | 0.0–10.0 | Comparar bugs, no priorizar parches por sí sola |
| CVSS Temporal/Threat | Ajuste por madurez de exploit | — | Rara vez publicada |
| CVSS Environmental | Ajuste por tu entorno | — | La parte que casi nadie calcula y es la que importa |
| EPSS | Probabilidad de explotación en los próximos 30 días | 0–1 | Priorizar. Cambia a diario |
| KEV | Explotación confirmada en el mundo real (CISA) | booleano | Binario de máxima prioridad |
| SSVC | Árbol de decisión de parcheo (explotación, exposición, misión) | categórico | Alternativa a "parchear por CVSS" |
| MTTD / MTTR | Tiempo medio de detección / respuesta | tiempo | Métrica de SOC |
| Dwell time | Tiempo del atacante dentro antes de ser detectado | tiempo | Métrica de eficacia real |
| Breakout time | Tiempo desde el primer host hasta el movimiento lateral | tiempo | Define cuánto tiene el SOC para reaccionar |

## Identidad y criptografía

| Término | Definición | Nota |
|---|---|---|
| Autenticación | Probar quién eres | AuthN |
| Autorización | Determinar qué puedes hacer | AuthZ. La mayoría de fallos graves están aquí |
| MFA resistente a phishing | FIDO2/WebAuthn o certificados: la credencial está ligada al origen | OTP y push **no** lo son |
| Token de portador (bearer) | Quien lo tenga, lo usa | Robarlo salta el MFA entero |
| Token ligado a prueba de posesión | Requiere clave privada (mTLS, DPoP, Token Binding) | Mitiga robo de token |
| Kerberos TGT | Ticket que permite pedir tickets de servicio | Robarlo = suplantar al usuario |
| Kerberos TGS/ST | Ticket para un servicio concreto | Cifrado con el hash de la cuenta del servicio → Kerberoasting |
| NTLM hash | Equivalente a la contraseña para autenticarse | Por eso Pass-the-Hash funciona sin crackear |
| Salt | Valor único por credencial que impide tablas precalculadas | No sustituye a un KDF lento |
| KDF de contraseñas | Argon2id, scrypt, bcrypt, PBKDF2 | SHA-256 a secas **no** sirve para contraseñas |
| Cifrado autenticado (AEAD) | Confidencialidad + integridad: AES-GCM, ChaCha20-Poly1305 | CBC sin MAC es vulnerable a padding oracle |
| PFS | Compromiso de la clave larga no descifra tráfico pasado | ECDHE |
| HSM / KMS | Custodia de claves con no-exportabilidad | Reduce impacto del robo de claves |
| PQC | Criptografía post-cuántica: ML-KEM (Kyber), ML-DSA (Dilithium), SLH-DSA | Riesgo "harvest now, decrypt later" en datos de vida larga |

## Defensa

| Término | Definición | Nota |
|---|---|---|
| Defensa en profundidad | Controles redundantes e independientes | Si dos controles fallan por la misma causa, es uno |
| Least privilege | Permiso mínimo para la función | Aplica a personas, servicios y tokens |
| Zero Trust | No confiar en la ubicación de red; verificar identidad, dispositivo y contexto por petición | No es un producto. Ver [frameworks.md](frameworks.md#zero-trust) |
| Segmentación / microsegmentación | Limitar alcance lateral por red o identidad | El control con mejor relación coste/impacto contra ransomware |
| Blast radius | Alcance del daño si un componente cae | Métrica de diseño |
| Fail secure vs fail open | Al fallar, denegar vs permitir | Elegir explícitamente; documentarlo |
| Detección vs prevención | Alertar vs bloquear | Prevenir sin detectar deja ciego ante bypass |
| Telemetría | Datos crudos que permiten detectar | Sin telemetría no hay detección posible |
| Baseline | Estado normal conocido | Toda anomalía se mide contra esto |
| Canary / honeytoken | Artefacto sin uso legítimo cuyo acceso implica intrusión | Altísima señal, ruido casi nulo |
| Purple team | Ejercicio colaborativo ofensiva-defensiva para validar detecciones | Mide cobertura real, no teórica |
| SBOM | Inventario de componentes de un software | Base para responder "¿me afecta?" en horas y no semanas |
| VEX | Declaración de si un CVE realmente afecta a un producto | Reduce ruido del SBOM |

## Operación de seguridad

| Término | Definición |
|---|---|
| IOC | Artefacto observable de compromiso: hash, IP, dominio, ruta, clave de registro |
| IOA | Indicador de *comportamiento* de ataque; sobrevive al cambio de infraestructura |
| TTP | Tácticas, técnicas y procedimientos: cómo opera un actor |
| Detección verdadera/falsa | TP, FP, TN, FN. El FN es el que duele; el FP mata al SOC |
| Alert fatigue | Degradación de la respuesta por exceso de alertas de bajo valor |
| Triage | Clasificar rápido: ¿es real?, ¿qué alcance?, ¿escala? |
| Contención | Detener la propagación sin destruir evidencia |
| Erradicación | Eliminar acceso persistente del atacante |
| Cadena de custodia | Registro íntegro de quién tocó qué evidencia y cuándo |
| Orden de volatilidad | Recolectar de lo más volátil a lo menos: CPU/RAM → red → disco → backups |
| Tabletop | Simulacro de incidente en sala, sin sistemas |
| Threat intel estratégica/operativa/táctica | Quién y por qué / campañas y capacidades / IOCs y firmas |

## Ecosistema de actores

| Término | Definición |
|---|---|
| APT | Actor con recursos y persistencia, normalmente estatal o patrocinado |
| Commodity threat | Malware o intrusión oportunista, masiva y no dirigida |
| IAB (Initial Access Broker) | Vende accesos ya conseguidos a otros grupos |
| RaaS | Ransomware como servicio: operador entrega el cifrador, el afiliado ejecuta |
| Doble/triple extorsión | Cifrado + filtración + presión a clientes o DDoS |
| Living off the land | Usar binarios legítimos del sistema para operar sin traer herramientas |
| Hands-on-keyboard | Operador humano interactivo dentro de la red, no automatismo |
| Insider | Amenaza con acceso legítimo: malicioso, negligente o comprometido |

## Web e infraestructura

| Término | Definición |
|---|---|
| Same-Origin Policy | Aislamiento por esquema+host+puerto en el navegador |
| CORS | Relajación controlada de SOP por parte del servidor |
| CSP | Política que restringe orígenes de script/estilo/imagen; principal defensa dura contra XSS |
| SRI | Hash que verifica la integridad de un recurso de terceros |
| HSTS | Fuerza HTTPS en el navegador; evita degradación a HTTP |
| SameSite | Atributo de cookie que limita envío cross-site; mitiga CSRF |
| WAF | Filtro de peticiones por firma/heurística; capa compensatoria, no corrección |
| Reverse proxy | Intermediario del lado servidor; origen frecuente de request smuggling si desincroniza |
| Bastión / jump host | Único punto de acceso administrativo, auditado |
| PAW | Estación de trabajo dedicada a administración privilegiada, sin correo ni navegación |

## OT / ICS

| Término | Definición | Nota |
|---|---|---|
| PLC | Controlador lógico programable | Modificar su lógica tiene efecto físico |
| SCADA | Supervisión y adquisición de datos | Interfaz entre TI y proceso |
| HMI | Interfaz humano-máquina | Objetivo típico de acceso inicial en OT |
| Historian | Base de datos de proceso | Pivote habitual TI→OT |
| Purdue Model | Niveles 0–5 de segmentación TI/OT | Base para justificar segmentación |
| Safety Instrumented System (SIS) | Sistema de parada segura | Atacarlo pone vidas en riesgo (caso TRITON) |
| Prioridad OT | Disponibilidad y seguridad física sobre confidencialidad | Invierte el CIA clásico; parchear puede ser inaceptable |
