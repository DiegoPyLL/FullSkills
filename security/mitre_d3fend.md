---
id: mitre_d3fend
tipo: taxonomia
estabilidad: permanente
consulta_externa: https://d3fend.mitre.org — el grafo de conocimiento y los mapeos ATT&CK↔D3FEND se amplían con cada versión
---

# MITRE D3FEND — contramedidas

Ontología de **técnicas defensivas**, contraparte de [mitre_attack.md](mitre_attack.md). Su aporte diferencial: razona sobre **artefactos digitales** (proceso, archivo, sesión de red, credencial, token) y no sobre productos. Eso permite responder "qué control específico rompe esta técnica" en vez de "compra un EDR".

## Tácticas defensivas

| Táctica | Objetivo | Ejemplos de técnicas |
|---|---|---|
| Model | Conocer lo que hay que defender | Inventario de activos, mapeo de flujo de datos, enumeración de dependencias, análisis de superficie de ataque |
| Harden | Reducir la superficie antes del ataque | Endurecimiento de credenciales, cifrado de mensajes, hardening de plataforma, verificación de arranque |
| Detect | Identificar actividad adversaria | Análisis de archivos, de red, de proceso, de identidad, de plataforma |
| Isolate | Impedir movimiento y alcance | Aislamiento de ejecución, aislamiento de red, sandbox, broker de credenciales |
| Deceive | Inducir al adversario a revelarse | Credenciales señuelo, archivos señuelo, red señuelo, sesiones señuelo |
| Evict | Expulsar al adversario | Eliminación de credenciales, terminación de proceso, eliminación de objeto |
| Restore | Recuperar el estado válido | Restauración de acceso, de objeto, de configuración, de software |

## Cómo se usa realmente

**Regla de uso:** cada técnica de ATT&CK relevante debe tener asignada al menos una contramedida `Harden` o `Isolate` (que la impide) y una `Detect` (que la ve). Solo detectar deja al SOC corriendo detrás; solo endurecer deja ciego ante el bypass.

Flujo:

1. Identificar la técnica ofensiva (ATT&CK).
2. Identificar el **artefacto digital** que la técnica manipula. Este es el paso clave: la técnica se define por lo que toca.
3. Buscar contramedidas que actúen sobre ese artefacto.
4. Elegir por orden: *elimina la precondición* > *impide la primitiva* > *detecta el efecto* > *responde*.

Ejemplo aplicado a T1003.001 (volcado de LSASS):

| Artefacto | Contramedida | Táctica D3FEND | Efecto |
|---|---|---|---|
| Memoria de proceso | LSA Protection (PPL) / Credential Guard | Harden / Isolate | Elimina la primitiva: el handle con permisos de lectura falla |
| Handle de proceso | Regla ASR de bloqueo de robo de credenciales | Isolate | Bloquea el acceso desde procesos no autorizados |
| Acceso a proceso | Sysmon E10 / alerta EDR sobre `lsass.exe` con `PROCESS_VM_READ` | Detect | Ve el intento aunque tenga éxito |
| Credencial | Cuentas de administrador con tiering, sin sesiones interactivas en estaciones | Harden | Reduce lo que hay que robar |
| Credencial | Honeytoken en memoria | Deceive | Su uso posterior delata la intrusión con FP casi nulo |
| Credencial | Rotación forzada tras compromiso, `krbtgt` doble reset | Evict | Invalida lo robado |

## Mapa rápido: técnica ofensiva → familia de contramedida

| Técnica ofensiva | Contramedida que la rompe (no que la mitiga a medias) |
|---|---|
| Phishing con credenciales (T1566) | MFA resistente a phishing (FIDO2). El filtrado de correo reduce volumen, no cierra el vector |
| Pass-the-Hash (T1550.002) | Credential Guard + restricción de logon de red para cuentas locales (`LocalAccountTokenFilterPolicy`) + LAPS |
| Kerberoasting (T1558.003) | gMSA/dMSA (contraseña de 120+ caracteres rotada por el sistema) — no "contraseñas más largas" a mano |
| Golden Ticket (T1558.001) | Doble reset de `krbtgt` + detección de TGT con vida anómala. La prevención real es evitar el compromiso del DC |
| Web shell (T1505.003) | Integridad de archivos en el webroot + ejecución denegada en directorios de subida |
| Ejecución de macro (T1204.002) | Bloqueo de macros de Internet por política (MOTW), no formación de usuarios |
| LOLBins (T1218) | Application control (WDAC/AppLocker) en modo bloqueo con lista de binarios bloqueados |
| C2 cifrado (T1573) | Egress restringido + proxy con inspección + allow-list de destinos para servidores |
| Cifrado de datos (T1486) | Backups inmutables y offline, probados. Ver [ransomware/ransomware.md](ransomware/ransomware.md) |
| Robo de token cloud (T1528/T1550.001) | Ligar token a dispositivo (acceso condicional + token protection), vidas cortas, revocación continua |
| Explotación de servicio expuesto (T1190) | Reducir exposición + parcheo priorizado por KEV ([cisa_kev.md](cisa_kev.md)) + WAF virtual patching como puente |

## Deception: la táctica infrautilizada

Relación señal/ruido casi perfecta: nadie tiene motivo legítimo para tocar un señuelo.

| Señuelo | Implementación | Dispara cuando |
|---|---|---|
| Cuenta señuelo en AD | Cuenta sin logon real, SPN atractivo, en grupo aparentemente privilegiado | Aparece en 4769 (Kerberoasting) o 4625/4624 |
| Archivo señuelo | `passwords.xlsx` en un recurso compartido, con auditoría de acceso | Evento de lectura |
| Credencial señuelo | Par usuario/clave inyectado en memoria o en un archivo de configuración | Intento de autenticación |
| Registro DNS señuelo | Nombre interno atractivo que no debería resolverse jamás | Consulta DNS |
| Canary token | URL/documento único | Petición HTTP recibida |
| Recurso compartido señuelo | SMB share visible, con auditoría | Enumeración o acceso |

Requisito: debe ser **indistinguible** de lo real y estar excluido de escáneres y backups automáticos, o genera falsos positivos propios.

## Errores al aplicar D3FEND

- Elegir la contramedida por lo que ya se tiene comprado, en vez de por el artefacto que hay que proteger.
- Contar como control algo desplegado en modo auditoría.
- Ignorar `Model`: sin inventario, ninguna contramedida es verificable.
- Olvidar `Restore`: un control que expulsa al adversario pero deja el servicio caído no cierra el incidente.
- Asumir que un mapeo ATT&CK→D3FEND implica cobertura total; el mapeo dice "es relevante", no "es suficiente en tu configuración".
