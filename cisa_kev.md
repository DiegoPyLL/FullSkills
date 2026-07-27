---
id: cisa_kev
tipo: modelo
estabilidad: volatil
consulta_externa: |
  KEV: https://www.cisa.gov/known-exploited-vulnerabilities-catalog (JSON/CSV actualizado varias veces por semana)
  EPSS: https://api.first.org/data/v1/epss (recalculado a diario)
  NVD: https://services.nvd.nist.gov/rest/json/cves/2.0
snapshot: 2026-07
---

# Priorización de vulnerabilidades: KEV, EPSS y SSVC

El contenido metodológico de este módulo es permanente. **Todo dato concreto (si un CVE está en KEV, su EPSS, su versión parcheada) debe consultarse en las fuentes de arriba antes de afirmarlo.**

## Por qué no se prioriza por CVSS

CVSS Base mide severidad técnica en el vacío. Consecuencias medidas repetidamente en la industria:

- La gran mayoría de los CVEs publicados **nunca** se explotan en el mundo real.
- Priorizar "todo lo ≥7.0" genera una cola imposible de cerrar y no correlaciona con las brechas reales.
- Los CVEs realmente explotados se concentran en un conjunto pequeño y predecible: dispositivos de borde, software de transferencia de archivos, servidores de correo, hipervisores y herramientas de administración remota.

CVSS sirve para **describir**; KEV, EPSS y exposición sirven para **decidir**.

## KEV (CISA Known Exploited Vulnerabilities)

Catálogo de vulnerabilidades con **explotación confirmada en el mundo real**.

**Criterios de inclusión** (los tres a la vez):
1. CVE asignado.
2. Evidencia fiable de explotación activa (no PoC, no escaneo).
3. Existe una acción clara de remediación (parche o mitigación definida por el fabricante).

**Campos útiles del catálogo**: `cveID`, `vendorProject`, `product`, `dateAdded`, `dueDate`, `requiredAction`, `knownRansomwareCampaignUse`, `notes`.

**Cómo usarlo**:

| Situación | Acción |
|---|---|
| CVE en KEV **y** activo expuesto a Internet | Emergencia. Parchear o desconectar hoy. Asumir compromiso previo y buscar evidencia |
| CVE en KEV **y** `knownRansomwareCampaignUse: Known` | Máxima prioridad absoluta |
| CVE en KEV, activo interno | Alta prioridad, ventana corta |
| CVE en KEV, producto no presente | Ignorar — pero solo si el inventario es fiable |
| CVE grave y **no** en KEV | No relajarse: KEV es retrospectivo. Ausencia ≠ seguridad |

**Límites**: cobertura sesgada hacia lo reportado en EE. UU. y hacia productos empresariales; existe retardo entre explotación y publicación; no cubre bien SaaS ni configuraciones inseguras (que no reciben CVE).

## EPSS

Probabilidad estimada de que un CVE sea explotado en los **próximos 30 días**. Rango 0–1, recalculado a diario a partir de señales observadas (menciones, PoC públicos, telemetría de explotación, características del CVE).

| Percentil / Score | Lectura operativa |
|---|---|
| > 0,5 | Explotación probable e inminente. Tratar como crítico aunque el CVSS sea medio |
| 0,1 – 0,5 | Vigilar; parchear en el ciclo corto |
| 0,01 – 0,1 | Ciclo normal |
| < 0,01 | Ruido salvo que el activo sea crítico y expuesto |

Reglas de uso:
- El score **cambia**. Un EPSS citado sin fecha es un dato inválido.
- EPSS estima probabilidad de explotación **global**, no de que te exploten a ti: no incorpora tu exposición.
- Combinar: `KEV` responde "¿ya pasó?", `EPSS` responde "¿va a pasar?".

## SSVC — árbol de decisión

Cuando hay que justificar la decisión ante terceros, SSVC (CMU/SEI) es preferible a un número:

| Entrada | Valores | Fuente |
|---|---|---|
| Estado de explotación | None / PoC / Active | KEV, inteligencia, EPSS |
| Exposición del sistema | Small / Controlled / Open | Inventario y topología |
| Impacto de misión | Low / Medium / High | Negocio |
| Impacto en bienestar público | Minimal / Material / Irreversible | Sector (salud, OT, energía) |
| Automatizable | Yes / No | ¿Puede un gusano encadenarlo? |

Salida: `Defer` → `Scheduled` → `Out-of-Cycle` → `Immediate`. La ventaja es que la decisión queda auditada y es reproducible.

## Fórmula operativa de priorización

```
Prioridad = Explotabilidad × Exposición × Valor_del_activo × (1 − Compensatorios)

Explotabilidad  : KEV=1,0 | EPSS>0,5=0,8 | PoC público=0,5 | solo teórica=0,2
Exposición      : Internet sin auth=1,0 | Internet con auth=0,7 | interno alcanzable=0,4 | segmentado=0,1
Valor_del_activo: DC/hipervisor/backup=1,0 | producción=0,7 | soporte=0,4 | laboratorio=0,1
Compensatorios  : WAF con regla específica, MFA, egress bloqueado, exploit requiere config no presente
```

Ejemplo de lectura correcta: un CVSS 9.8 en un servicio interno segmentado y sin exploit conocido puede quedar por debajo de un CVSS 6.5 en KEV sobre el portal VPN.

## SLA de remediación recomendado

| Clase | Interno | Expuesto a Internet |
|---|---|---|
| KEV con uso en ransomware | 24–48 h | Inmediato / desconectar |
| KEV | 7 días | 24–72 h (o el `dueDate` de CISA si es menor) |
| EPSS > 0,5 sin KEV | 14 días | 7 días |
| Crítico sin evidencia de explotación | 30 días | 14 días |
| Alto | 60 días | 30 días |
| Medio/Bajo | Ciclo trimestral | 90 días |

Si el SLA no se puede cumplir, la excepción se documenta con: motivo, mitigación compensatoria, propietario y fecha de revisión. Una excepción sin fecha es deuda permanente.

## Familias de producto con explotación recurrente

Superficie que concentra históricamente los CVEs de KEV. Un inventario que priorice estas categorías cubre la mayor parte del riesgo real de acceso inicial:

| Categoría | Por qué se explota | Módulo |
|---|---|---|
| VPN y gateways SSL (Ivanti, Fortinet, Citrix, Palo Alto, Cisco, SonicWall, Check Point) | Expuestos por diseño, difíciles de parchear, guardan sesiones y credenciales | [vpn/vpn.md](vpn/vpn.md) |
| Transferencia gestionada de archivos (MOVEit, GoAnywhere, Accellion FTA, CrushFTP, Cleo) | Contienen datos masivos; objetivo predilecto de extorsión sin cifrado | [ransomware/ransomware.md](ransomware/ransomware.md) |
| Correo y colaboración (Exchange, SharePoint, Confluence, Zimbra) | Alto valor, superficie enorme, expuestos | [playbooks/exchange.md](playbooks/exchange.md), [playbooks/sharepoint.md](playbooks/sharepoint.md) |
| Herramientas de administración remota (ScreenConnect, AnyDesk, TeamViewer, RMM) | Acceso privilegiado a muchos clientes de una vez | [attacks/lateral_movement.md](attacks/lateral_movement.md) |
| Hipervisores y gestión (vCenter, ESXi) | Un fallo compromete todas las VM a la vez | [vmware/vmware.md](vmware/vmware.md) |
| Servidores de aplicaciones y frameworks Java (Log4j, Struts, WebLogic, Spring, ActiveMQ) | Deserialización y expresión dinámica; muy extendidos | [web/web.md](web/web.md) |
| Dispositivos de red y perímetro (routers, balanceadores, NAS) | Sin EDR, sin logs, fin de soporte frecuente | [firewalls/firewalls.md](firewalls/firewalls.md) |
| Gestión de identidad y directorio (AD CS, ADFS, Entra Connect) | Compromete la identidad, no un servidor | [active_directory/active_directory.md](active_directory/active_directory.md) |

## Qué hacer además de parchear

Un CVE en KEV explotado durante días implica **posible compromiso previo**. El parche no expulsa al atacante:

1. Parchear o aislar.
2. **Invalidar credenciales y sesiones** del sistema afectado (tokens, cookies, claves de API, certificados de máquina). Muchas explotaciones de borde roban sesiones que sobreviven al parche.
3. Buscar persistencia: web shells, cuentas nuevas, tareas programadas, binarios modificados, túneles salientes.
4. Revisar logs desde la **fecha de primera explotación conocida**, no desde la fecha del parche.
5. Si hay evidencia, activar [playbooks/ir_base.md](playbooks/ir_base.md).
