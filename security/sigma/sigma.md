---
id: sigma/sigma
tipo: referencia
estabilidad: permanente
---

# Sigma

Formato **portable** de reglas de detección sobre logs. Se escribe una vez y se convierte al lenguaje del SIEM que se use. Es el formato natural para detectar comportamiento, que es lo que aporta valor duradero ([detection/detection.md](../detection/detection.md)).

## Estructura

```yaml
title: Acceso sospechoso a memoria de LSASS
id: 8f1c2b4e-0000-4000-a000-000000000001
status: stable
description: Un proceso abre lsass.exe con permisos de lectura de memoria, patrón de volcado de credenciales
references:
  - https://attack.mitre.org/techniques/T1003/001/
author: equipo de detección
date: 2026-07-27
tags:
  - attack.credential_access
  - attack.t1003.001
logsource:
  product: windows
  category: process_access
detection:
  selection:
    TargetImage|endswith: '\lsass.exe'
    GrantedAccess|contains:
      - '0x1010'
      - '0x1410'
      - '0x143a'
      - '0x1438'
  filter_legitimo:
    SourceImage|startswith:
      - 'C:\Program Files\'
      - 'C:\Windows\System32\'
  condition: selection and not filter_legitimo
falsepositives:
  - Software de seguridad y de copia de seguridad que inspecciona procesos
level: high
```

## Campos obligatorios y su función

| Campo | Función |
|---|---|
| `title` | Descriptivo y accionable; es lo que ve el analista en la alerta |
| `id` | UUID estable; permite rastrear la regla entre versiones y sistemas |
| `status` | `experimental`, `test`, `stable`, `deprecated` |
| `description` | Qué detecta **y por qué importa** |
| `logsource` | Determina la conversión: `product`, `category`, `service` |
| `detection` | Selecciones, filtros y condición |
| `falsepositives` | Imprescindible para el triaje |
| `level` | `informational`, `low`, `medium`, `high`, `critical` |
| `tags` | Mapeo a ATT&CK: permite medir cobertura |

## Modificadores de campo

| Modificador | Efecto |
|---|---|
| `contains` | Subcadena |
| `startswith` / `endswith` | Prefijo o sufijo |
| `re` | Expresión regular |
| `all` | Todos los valores de la lista deben cumplirse |
| `base64` / `base64offset` | Contenido codificado |
| `windash` | Variantes de guion en argumentos (`-`, `/`, `–`) |
| `cidr` | Rango de red |
| `lt`, `lte`, `gt`, `gte` | Comparación numérica |
| `expand` | Sustitución por valores de configuración del entorno |

## Fuentes de log habituales

| `logsource` | Origen | Detecta |
|---|---|---|
| `category: process_creation` | Sysmon E1 / 4688 | Ejecución, LOLBins, comandos |
| `category: process_access` | Sysmon E10 | Volcado de credenciales |
| `category: image_load` | Sysmon E7 | Side-loading, DLL sin firmar |
| `category: network_connection` | Sysmon E3 | C2, conexiones anómalas |
| `category: dns_query` | Sysmon E22 | Túnel DNS, dominios de C2 |
| `category: file_event` | Sysmon E11 | Web shells, staging |
| `category: registry_set` | Sysmon E12-14 | Persistencia |
| `service: security` | Windows Security | Autenticación, servicios, tareas |
| `service: powershell` | 4104 | PowerShell ofuscado |
| `service: sysmon` | Todos los eventos | General |
| `product: linux`, `service: auditd` | auditd | Ejecución y acceso en Linux |
| `product: aws`, `service: cloudtrail` | CloudTrail | Plano de control AWS |
| `product: azure`, `service: signinlogs` | Entra ID | Identidad |
| `product: gcp`, `service: gcp.audit` | Audit Logs | Plano de control GCP |
| `product: kubernetes` | Audit log | RBAC y pods |

## Ejemplos de valor alto

**Proceso hijo sospechoso de Office** — una de las detecciones más rentables:

```yaml
title: Aplicación de Office lanza intérprete o LOLBin
id: 8f1c2b4e-0000-4000-a000-000000000002
status: stable
description: Un proceso de Office crea un proceso hijo típico de ejecución de payload
tags:
  - attack.execution
  - attack.t1204.002
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith:
      - '\winword.exe'
      - '\excel.exe'
      - '\powerpnt.exe'
      - '\outlook.exe'
      - '\msaccess.exe'
    Image|endswith:
      - '\cmd.exe'
      - '\powershell.exe'
      - '\pwsh.exe'
      - '\wscript.exe'
      - '\cscript.exe'
      - '\mshta.exe'
      - '\rundll32.exe'
      - '\regsvr32.exe'
      - '\msbuild.exe'
      - '\certutil.exe'
      - '\bitsadmin.exe'
  condition: selection
falsepositives:
  - Macros corporativas legítimas (deben inventariarse y excluirse por hash o ruta)
level: high
```

**Inhibición de la recuperación** — precede al cifrado:

```yaml
title: Borrado de copias de sombra o de catálogos de backup
id: 8f1c2b4e-0000-4000-a000-000000000003
status: stable
description: Comandos de eliminación de mecanismos de recuperación, previos a ransomware
tags:
  - attack.impact
  - attack.t1490
logsource:
  category: process_creation
  product: windows
detection:
  selection_vss:
    Image|endswith: '\vssadmin.exe'
    CommandLine|contains|all:
      - 'delete'
      - 'shadows'
  selection_wmic:
    Image|endswith: '\wmic.exe'
    CommandLine|contains|all:
      - 'shadowcopy'
      - 'delete'
  selection_wbadmin:
    Image|endswith: '\wbadmin.exe'
    CommandLine|contains|all:
      - 'delete'
      - 'catalog'
  selection_bcdedit:
    Image|endswith: '\bcdedit.exe'
    CommandLine|contains:
      - 'recoveryenabled no'
      - 'ignoreallfailures'
  condition: 1 of selection_*
falsepositives:
  - Mantenimiento planificado de copias de seguridad (ventana conocida)
level: critical
```

**Proceso hijo de servidor web** — web shell o explotación en curso:

```yaml
title: Servidor web lanza un intérprete de comandos
id: 8f1c2b4e-0000-4000-a000-000000000004
status: stable
description: Un proceso de servidor web crea un shell, indicio de web shell o de explotación
tags:
  - attack.persistence
  - attack.t1505.003
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith:
      - '\w3wp.exe'
      - '\httpd.exe'
      - '\nginx.exe'
      - '\tomcat.exe'
      - '\java.exe'
      - '\php-cgi.exe'
    Image|endswith:
      - '\cmd.exe'
      - '\powershell.exe'
      - '\net.exe'
      - '\whoami.exe'
      - '\net1.exe'
  condition: selection
falsepositives:
  - Aplicaciones que ejecutan comandos por diseño (deben documentarse y excluirse)
level: critical
```

**Uso de credenciales cloud fuera del proveedor**:

```yaml
title: Credencial de rol de instancia usada desde IP externa
id: 8f1c2b4e-0000-4000-a000-000000000005
status: experimental
description: Un rol de instancia se usa desde una IP que no pertenece al proveedor, lo que indica robo de credenciales
tags:
  - attack.credential_access
  - attack.t1552.005
logsource:
  product: aws
  service: cloudtrail
detection:
  selection:
    userIdentity.type: 'AssumedRole'
    userIdentity.arn|contains: ':assumed-role/'
  filter_interno:
    sourceIPAddress|cidr:
      - '10.0.0.0/8'
      - '172.16.0.0/12'
  filter_servicio:
    sourceIPAddress|endswith: '.amazonaws.com'
  condition: selection and not 1 of filter_*
falsepositives:
  - Acceso legítimo desde oficinas o VPN corporativa (añadir sus rangos al filtro)
level: high
```

## Buenas prácticas

| Práctica | Motivo |
|---|---|
| Un comportamiento por regla | Reglas que detectan cinco cosas son imposibles de triar y de ajustar |
| Filtros en bloque separado con nombre descriptivo | Legibilidad y mantenimiento |
| `falsepositives` siempre relleno | El analista de guardia necesita saber qué es normal |
| Etiquetas ATT&CK correctas | Permiten medir cobertura de forma agregada |
| Probar la conversión al backend real | La semántica de la conversión no siempre es la esperada |
| Validar con ejecución real de la técnica | Sin esto, la regla no está terminada |
| Medir el ruido contra datos históricos | Antes de desplegar, no después |
| Versionar en repositorio con revisión | Detección como código |
| Preferir `endswith: '\proceso.exe'` a igualdad exacta de ruta | Robusto ante ubicaciones distintas, y evita el bypass por renombrado de directorio |

## Errores frecuentes

| Error | Consecuencia |
|---|---|
| Detectar el nombre de la herramienta (`mimikatz.exe`) | Se evade renombrando el archivo |
| Filtrar por nombre de proceso sin ruta | Se evade con un binario homónimo en otra carpeta |
| Excluir rutas completas y amplias | Se crea un punto ciego permanente y explotable |
| Escribir la regla sin verificar que la fuente de log existe | Regla que nunca disparará |
| Copiar reglas públicas sin ajustarlas al entorno | Ruido inasumible y desconfianza en el sistema |
| No documentar el motivo del filtro | Nadie sabe si sigue siendo válido |
| Usar Sigma para detectar contenido de archivos | Eso es YARA ([yara/yara.md](../yara/yara.md)) |
