---
id: ransomware/ransomware
tipo: modelo
estabilidad: permanente
---

# Ransomware

Modelo de negocio criminal, no una familia de malware. Entender el negocio explica las decisiones técnicas del atacante y, por tanto, dónde defenderse.

## El modelo RaaS

| Rol | Función | Implicación defensiva |
|---|---|---|
| Operador / desarrollador | Construye el cifrador, el portal de negociación y el sitio de filtraciones; se lleva un porcentaje | Los indicadores del cifrador cambian entre víctimas |
| Afiliado | Ejecuta la intrusión completa | **Los TTPs varían más entre afiliados que entre familias**: detectar por familia es poco fiable |
| Initial Access Broker | Vende el acceso ya conseguido | Cortar el acceso inicial rompe la cadena en su punto más barato |
| Servicios auxiliares | Negociadores, blanqueo, filtración de datos, presión a víctimas | El ecosistema es resiliente: desmantelar un operador no elimina el problema |

Consecuencia: las familias se renombran y se reconstituyen tras cada operación policial. **Defenderse de "LockBit" o de cualquier nombre concreto es un enfoque equivocado**; hay que defenderse de la cadena de intrusión, que es estable.

## Evolución de la extorsión

| Generación | Modelo | Contramedida que deja de bastar |
|---|---|---|
| Cifrado simple | Cifra y pide rescate | El backup resolvía el problema |
| Doble extorsión | Exfiltra **antes** de cifrar y amenaza con publicar | El backup ya no evita el daño reputacional ni legal |
| Triple extorsión | Añade presión sobre clientes, socios y afectados; a veces DDoS | La gestión de crisis se vuelve central |
| Solo exfiltración | Roba y extorsiona **sin cifrar nada** | Sin interrupción del servicio, la detección depende del análisis de exfiltración |
| Extorsión sobre terceros | Se explota un proveedor y se extorsiona a sus clientes | El riesgo de terceros pasa a ser riesgo propio |

Implicación operativa: **prevenir la exfiltración es hoy tan importante como poder restaurar**. Un plan de recuperación perfecto no evita la publicación de los datos.

## Cadena de intrusión típica

| Fase | Actividad | Ventana de detección |
|---|---|---|
| Acceso inicial | Credencial válida sin MFA, vulnerabilidad de borde, phishing | Días o semanas antes del cifrado |
| Establecimiento | Implante de C2, herramienta RMM | Alta: instalación de RMM no corporativo |
| Reconocimiento | Enumeración de AD, de recursos compartidos, de backups | Alta: densidad de comandos, consultas LDAP masivas |
| Credenciales | Volcado de LSASS, Kerberoasting, DCSync | **La más valiosa**: aún no hay daño |
| Movimiento lateral | RDP, SMB, PsExec, WMI | Alta: autenticación entre estaciones |
| Acceso a backups | Consola de respaldo, borrado de repositorios | Crítica: es el punto de no retorno |
| Exfiltración | Compresión con contraseña y subida a nube | Alta: `rar.exe` en servidores, volumen saliente |
| Preparación | Desactivar EDR, detener servicios, borrar copias de sombra | **Última oportunidad, minutos antes** |
| Cifrado | Despliegue por GPO, PsExec o herramienta de despliegue | Demasiado tarde |

El tiempo entre el acceso inicial y el cifrado suele medirse en días, no en minutos. **Hay tiempo para detectar**; lo que falla no es la ventana, es la telemetría o la atención.

## Objetivos preferentes del atacante

| Objetivo | Motivo |
|---|---|
| Infraestructura de backup | Elimina la alternativa al pago. Primer objetivo de un operador competente |
| Hipervisores (ESXi, Hyper-V) | Cifrar decenas de servidores a la vez sin tocar sus sistemas operativos ni sus EDR |
| Controladores de dominio | Despliegue masivo por GPO |
| Servidores de archivos y bases de datos | Máximo impacto operativo |
| Servidores de gestión (SCCM, RMM) | Distribución instantánea |
| Almacenamiento en la nube y snapshots | Elimina la recuperación en entornos cloud |

## Defensa: lo que realmente cambia el resultado

Ordenado por impacto real, no por facilidad de compra.

| Control | Efecto |
|---|---|
| **Backups inmutables y offline, con restauración probada** | Convierte una crisis existencial en una interrupción. Ningún otro control se le acerca |
| **Backup fuera del dominio de producción**, con identidad y MFA propias | Impide que el compromiso de AD arrastre la recuperación |
| **MFA resistente a phishing en todo acceso remoto** | Cierra el vector de acceso inicial dominante |
| **Parcheo prioritario de dispositivos de borde** | Cierra el segundo vector |
| **Segmentación de red y de identidad** | Limita el radio de explosión; determina si se cifran 20 o 2.000 servidores |
| **LAPS y tiering administrativo** | Rompe el movimiento lateral con credenciales locales y de dominio |
| **EDR con protección antimanipulación y respuesta automatizada** | Aprovecha la ventana de los últimos minutos |
| **Restricción del acceso al hipervisor** | Evita el escenario de máximo daño |
| **Detección y bloqueo de herramientas RMM no autorizadas** | Uno de los indicadores más fiables de intrusión en curso |
| **Plan de respuesta y de comunicación probado**, con canal fuera de banda | Si el correo y el directorio están cifrados, hay que poder coordinar igual |

## Detecciones críticas

Cada una debe generar alerta de máxima prioridad con respuesta automatizada; en esta fase el tiempo se mide en minutos.

| Señal | Fase |
|---|---|
| `vssadmin delete shadows`, `wbadmin delete catalog`, `bcdedit /set recoveryenabled no` | Preparación |
| Parada masiva de servicios de base de datos, backup o seguridad | Preparación |
| Pérdida de heartbeat del EDR en hosts que siguen activos | Evasión |
| Reinicio en modo seguro (`bcdedit /set safeboot`) | Evasión |
| SSH habilitado en un host ESXi | Preparación de cifrado de hipervisor |
| Apagado masivo de máquinas virtuales | Ídem |
| Autenticación anómala contra la consola de backup | Punto de no retorno |
| Creación de GPO o modificación de SYSVOL fuera de ventana de cambios | Distribución |
| `rar.exe` o `7z.exe` con contraseña en servidores de datos | Exfiltración previa |
| Volumen saliente anómalo hacia almacenamiento personal | Exfiltración |
| Herramienta RMM no corporativa instalada | Establecimiento |
| Ejecución simultánea del mismo binario en muchos hosts | Cifrado en curso |

## Respuesta inmediata

Detalle completo en [playbooks/ransomware.md](../playbooks/ransomware.md). Principios que se equivocan con más frecuencia:

1. **Aislar, no apagar.** Apagar destruye la memoria, que contiene claves y evidencia. Desconectar de la red conserva ambas.
2. **Contener a la vez, no por partes.** Aislar hosts uno a uno alerta al atacante y acelera el cifrado del resto.
3. **Preservar evidencia antes de restaurar.** Sin ella no se sabe cómo entraron y la reconstrucción se vuelve a comprometer.
4. **No confiar en la red comprometida** para coordinar: canal fuera de banda preparado de antemano.
5. **Determinar el alcance de la exfiltración**, no solo el del cifrado: define las obligaciones legales.
6. **Erradicar antes de restaurar.** Restaurar en una red donde el atacante sigue presente lleva a un segundo cifrado, escenario documentado con frecuencia.
7. **Rotar todas las credenciales** antes de reconectar, incluida la doble rotación de `krbtgt` si hubo compromiso de dominio.

## Sobre el pago

Decisión de negocio, legal y ética, no técnica. Elementos que el análisis debe aportar:

- Pagar **no garantiza** la recuperación: los descifradores suelen ser lentos, defectuosos o incompletos.
- Pagar **no garantiza** que los datos no se publiquen ni se revendan; existen casos documentados de doble extorsión tras el pago.
- Puede haber **restricciones legales** según la jurisdicción y según el grupo implicado (sanciones internacionales). Requiere asesoría legal específica; este análisis no la sustituye.
- Financia la operación y aumenta la probabilidad de reincidencia, en el sector y en la propia organización.
- Antes de considerarlo, verificar el estado real de los backups: la decisión cambia por completo según sean recuperables o no.
- Comprobar si existe un descifrador público para la familia (iniciativas como No More Ransom) antes de negociar.

## Después del incidente

| Acción | Motivo |
|---|---|
| Análisis de causa raíz hasta el vector inicial | Sin él, la reincidencia es probable |
| Reconstrucción del plano de identidad si hubo compromiso de dominio | La confianza en AD no se restaura parcialmente |
| Cierre de la brecha de detección: qué señales existían y no se vieron | Convertir el incidente en detecciones |
| Prueba de restauración completa, no parcial | Muchos planes fallan solo en el momento real |
| Revisión de la exposición de terceros y notificaciones | Obligaciones legales y contractuales |
| Ejercicio de simulación con la dirección | La decisión bajo presión mejora si ya se ensayó |
