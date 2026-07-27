---
id: hardware/hardware
tipo: catalogo
estabilidad: permanente
consulta_externa: https://cve.mitre.org (filtrar por hardware), https://cisa.gov/known-exploited-vulnerabilities-catalog
---

# Seguridad de Hardware

Superficie de ataque física y electromagnética de componentes de hardware. Diferente de la seguridad de firmware/software: los vectores de hardware requieren técnicas especializadas de ataque y defensa.

## Vectores de ataque a nivel de hardware

| Vector | Descripción | Consecuencia | Detección |
|---|---|---|---|
| **JTAG/SWD debug** | Puerto de depuración on-chip sin bloqueo | Lectura/escritura de memoria, ejecución remota, extracción de firmware | Verificar JTAG/SWD bloqueado en producción; fuse de seguridad |
| **SPI flash** | Lectura directa del chip de firmware con programador | Extracción completa del firmware para análisis | FIM en la partición de firmware; verificación de hash de arranque |
| **UART/Console** | Puerto de consola serial sin autenticación | Acceso root al sistema | Autenticación en consola, deshabilitar cuando no se necesite |
| **DMA (Direct Memory Access)** | Periféricos PCIe/Thunderbolt acceden directamente a la memoria | Escalada a kernel, robo de credenciales, DMA strike | IOMMU (VT-d/AMD-Vi) habilitado, Thunderbolt security mode |
| **Side-channel (timing, power, EM)** | Medir tiempo de ejecución, consumo energético o emisión EM | Extracción de claves criptográficas, datos sensibles | Randomización de tiempo, masking de operaciones sensibles |
| **Rowhammer** | Fibrar celdas de DRAM adyacentes alterando bits | Escalada de privilegios, escape de contenedores | ECC memory, refresh rates aumentados, EDRAM |
| **Spectre/Meltdown** | Explotación de execution speculation en CPUs | Lectura de memoria arbitraria, incluso de kernel | Patches del kernel (retpoline, KAISER); mitigaciones parciales |
| **BadUSB / firmware de periféricos** | Firmware malicioso en teclado, mouse, webcam | Keylogging, inyección de comandos | Allow-list de dispositivos, firmware verificable, bloquear USB no autorizado |
| **Hardware implant** | Implante físico en la ruta de datos o alimentación | Interceptación de tráfico, extracción de datos | Inspección física de hardware, inventario de componentes |
| **Voltage/clock glitching** | Alterar alimentación o reloj del chip | Bypass de seguridad, desbordamiento de buffers | Detección de anomalías de voltaje/reloj, guardas de hardware |
| **Fault injection** | Pulsos láser, RF o de voltaje para inducir errores | Bypass de PIN, extracción de claves | Detección de falto de voltaje, sensores de temperatura |
| **Chip-off / decapping** | Deslaminar el die para lectura directa | Extracción de claves, modificación de fusibles | Detección de manipulación física, encapsulado anti-tampering |

## Seguridad de arranque

| Control | Descripción | Efecto |
|---|---|---|
| **Secure Boot (UEFI)** | Verifica la firma del bootloader y kernel antes de ejecutar | Impide bootkits y rootkits de arranque |
| **Measured Boot** | Registra hashes de cada etapa de arranque en el TPM | Permite detección post-inicio de arranque comprometido |
| **Hardware Root of Trust (RoT)** | Clave grabada en el silicon durante fabricación | Base para toda la cadena de confianza |
| **HAB (High Assurance Boot) - NXP** | Firma de bootloader con claves de fábrica | Similar a Secure Boot en SoCs NXP |
| **TrustZone (ARM)** | Aísla ejecuciones sensibles del mundo real (world) | Enclaves seguros para criptografía y claves |
| **TPM 2.0** | Chip de seguridad para almacenamiento de claves, medida de arranque, cifrado de disco | Base de BitLocker, Linux TPM2 tools, attestation |
| **Boot Guard (Intel)** | Verifica la firma del bootloader en hardware | Impide bootkits incluso si el BIOS está comprometido |
| **AMD PSP** | Procesador de seguridad integrado AMD | Equivalente al Intel ME; vector propio de ataque |
| **Apple T2 / Secure Enclave** | Chip de seguridad para cifrado de disco, Touch ID, arranque | Aislamiento criptográfico del enclave de seguridad |

## Vulnerabilidades de hardware conocidas

| Vulnerabilidad | Año | Vector | Impacto | Mitigación |
|---|---|---|---|---|
| **Spectre (v1-v4)** | 2018 | Speculative execution | Lectura de memoria arbitraria | Patches de kernel, recompilar con retpoline |
| **Meltdown** | 2018 | Speculative execution + privilege elevation | Lectura de kernel memory desde user-space | Patches de kernel (KAISER/KPTI) |
| **Foreshadow** | 2018 | SGX speculative execution | Lectura de datos en enclaves SGX | Microcódigo de Intel, kernel patches |
| **L1TF (Fallout)** | 2018 | L1 cache timing | Lectura de memoria de VMs vecinas (hypervisor escape) | Patches de kernel, desactivar hyperthreading |
| **MDS (Microarchitectural Data Sampling)** | 2019 | Cache, store buffer, load port sampling | Fuga de datos entre procesos/VMs | Microcódigo, kernel patches, flush buffers |
| **Foreshadow-NG** | 2019 | SGX + VMX speculative execution | Multi-vecino escape de enclave | Microcódigo, kernel patches |
| **ZombieLoad** | 2020 | MTS (Microarchitectural Fill Buffer Sampling) | Fuga de datos entre procesos | Microcódigo, kernel patches |
| **Rogue Data Cache Load (RDCL)** | 2020 | Cache line fill | Fuga de datos en cache | Microcódigo |
| **GooseEgg** | 2020 | Spectre v1 variant en GPU | Lectura de GPU memory | Patches de GPU firmware |
| **Hertzbleed** | 2021 | Side-channel de frecuencia de reloj en CPUs ARM/x86 | Extracción de claves criptográficas | Frecuencia de reloj fija para operaciones sensibles |
| **CacheOut** | 2022 | MTS via cross-socket communication | Fuga de datos entre sockets CPU | Microcódigo, kernel patches |
| **Downfall** | 2022 | SGX speculative execution (variant) | Lectura de datos en enclaves SGX | Microcódigo, kernel patches |
| **Detect** | 2022 | Speculative store bypass en CPUs AMD/Intel | Escritura de datos en buffer especulativo | Microcódigo |
| **Zerolog** | 2022 | Variant de Spectre en GPUs Intel | Lectura de GPU memory | Patches de driver de GPU |
| **RSLpS (Return Stack Leak privilege escalation)** | 2023 | Predictive execution de return stack | Escalada de privilegios | Patches de microcódigo |
| **BranchScope** | 2023 | Spectre variant en branch prediction | Fuga de datos mediante predicción de ramas | Microcódigo, kernel patches |
| **Vexilla** | 2023 | Speculative execution + microcode | Fuga de datos via microcode | Microcode updates |
| **Struktur** | 2024 | Side-channel en TLB + prefetching | Lectura de datos en cache | Patches de kernel |
| **ZombieReload** | 2024 | Variant de MTS en CPUs AMD | Fuga de datos en microarquitectura | Microcódigo, kernel patches |

## Ataques a infraestructura física

| Ataque | Mecanismo | Efecto |
|---|---|---|
| **Man-in-the-middle físico** | Interceptación del cable o dispositivo intermediario | Interceptación de tráfico de red |
| **RFID cloning** | Copia de tarjeta RFID sin contacto | Suplantación de acceso físico |
| **NFC relay** | Reenvío de señal NFC a distancia | Bypass de autenticación por proximidad |
| **Bluetooth pairing attack** | Pairing forzado o bluebugging | Acceso al dispositivo |
| **GPS spoofing** | Transmisión de señales GPS falsas | Manipulación de geolocalización |
| **Cell site simulator (Stingray)** | Estación base falsa | Interceptación de tráfico móvil |
| **Jamming** | Bloqueo de señal RF | Denegación de servicio |
| **Power grid attack** | Manipulación de la red eléctrica | Daño a equipos, pérdida de datos |
| **Temperature/humidity manipulation** | Alteración ambiental de servidores | Daño físico, errores de cálculo, fallos de memoria |
| **Electromagnetic pulse (EMP)** | Generador EMP | Daño masivo a equipos electrónicos |

## Seguridad de dispositivos embebidos e IoT

| Riesgo | Descripción | Mitigación |
|---|---|---|
| **UART/JTAG sin bloqueo** | Puertos de debug accesibles en producción | Bloquear puertos de debug en producción |
| **Firmware sin firma** | Carga de firmware arbitrario | Verificación de firma en el bootloader |
| **Default credentials** | Credenciales de fábrica sin cambio | Cambio obligatorio en el primer inicio |
| **Sin actualización de firmware** | Vulnerabilidades nunca parcheadas | Mecanismo de update seguro con firma |
| **Cifrado de disco ausente** | Datos accesibles si se extrae el dispositivo | Cifrado de disco con clave derivada del TPM |
| **Logs en claro** | Datos sensibles en logs accesibles | Logs cifrados, rotación de logs |
| **Protocolo de update inseguro** | Firmware descargado sin verificación | Firma del firmware, HTTPS, pinning de certificado |
| **Debug mode en producción** | Firmware de debug habilitado en devices de campo | Deshabilitar debug en builds de producción |
| **Hardware identification exposed** | Serial numbers, MAC addresses expuestos | Rotación de identificadores, hashing |
| **Lack of hardware root of trust** | No hay base de confianza en el silicon | TPM, Secure Boot, RoT |

## Seguridad de red física

| Control | Descripción | Efecto |
|---|---|---|
| **Access control (2FA)** | Control de acceso físico con dos factores | Impide acceso no autorizado al datacenter |
| **CCTV y logging** | Monitoreo de cámaras y registro de accesos | Disuasión y evidencia |
| **Mantrap / airlock** | Puerta de seguridad con dos cámaras | Impide tailgating |
| **Security guard** | Guardia de seguridad 24/7 | Disuasión humana, respuesta inmediata |
| **Faraday cage** | Jaula de Faraday para sala de servidores | Aísla de señales EM externas |
| **Intrusion detection** | Sensores de movimiento, apertura de puertas | Alerta de intrusión física |
| **Asset tagging** | Etiquetas RFID/QR en todos los activos | Inventario y detección de movimiento no autorizado |
| **Cable management** | Racks organizados, cables etiquetados | Detección de intercepción física |
| **Network tap security** | Taps de red en lugar de hubs/switches | Detección de taps no autorizados |
| **Fiber optic monitoring** | Monitoreo de fibra óptica con OTDR | Detección de intercepción de fibra |

## Seguridad de componentes de red

| Componente | Riesgo | Mitigación |
|---|---|---|
| **Switch** | Port mirroring no autorizado, DHCP spoofing | 802.1X, DHCP snooping, port security |
| **Router** | Routing protocol attacks (BGP hijack, OSPF spoofing) | BGPsec, OSPF authentication, route filtering |
| **Firewall** | Misconfiguración, firmware comprometido | Hardening, actualizaciones, FIM |
| **Load balancer** | Misconfiguración, firmware comprometido | Hardening, actualizaciones, FIM |
| **DNS server** | DNS cache poisoning, zone transfer no autorizado | DNSSEC, restrict zone transfers, bind to loopback |
| **DHCP server** | Rogue DHCP server, DHCP starvation | DHCP snooping, dynamic ARP inspection |
| **WAP** | Rogue AP, evil twin, weak encryption | 802.1X, WPA3, monitorización de RF |

## Seguridad de datacenter

| Control | Descripción | Efecto |
|---|---|---|
| **Air gap físico** | Separación física de redes de distintos niveles de seguridad | Aísla de redes externas |
| **Cage / room security** | Jaula o sala de servidores con acceso controlado | Limita acceso físico |
| **UPS and generators** | Fuente de alimentación ininterrumpida | Previene pérdida de datos por apagado |
| **Climate control** | Control de temperatura y humedad | Previene daños por condiciones ambientales |
| **Fire suppression** | Sistema de extinción de incendios | Protege contra incendios |
| **Water detection** | Sensores de agua en el piso | Alerta temprana de fugas |
| **Dual power feeds** | Alimentación desde dos fuentes distintas | Tolerancia a fallos de alimentación |
| **RAID** | Redundancia de discos | Prevención de pérdida de datos por fallo de disco |
| **Biometric access** | Acceso biométrico a salas de servidores | Autenticación fuerte de acceso |
| **Visitor management** | Registro de visitantes con escolta | Supervisión de acceso físico |

## Fuentes de referencia

| Fuente | Uso |
|---|---|
| [cve_database.md](../cve_database.md) | CVEs de vulnerabilidades de hardware |
| [cisa_kev.md](../cisa_kev.md) | CVEs de hardware en explotación activa |
| [hardening/hardening.md](../hardening/hardening.md) | Hardening de hardware y dispositivos |
| [attacks/physical.md](../attacks/physical.md) | Tácticas de ataque físico (ATT&CK) |
| [iot/iot.md](../iot/iot.md) | Seguridad de dispositivos IoT/embebidos |
| [mitre_attack.md](../mitre_attack.md) | Tácticas de ataque físico y de infraestructura |
| CWE-613 | Weakness: Insufficient session uniqueness |
| CWE-614 | Weakness: Sensitive cookie without 'Secure' attribute |
| CWE-16 | Weakness: Configuration |
| CWE-250 | Weakness: Ownership error |
| CWE-251 | Weakness: Not enforcing write-minimum |
| CWE-252 | Weakness: Unchecked return for write |
| CWE-253 | Weakness: Incorrect check of exception type |
| CWE-254 | Weakness: Security features not implemented |
| CWE-255 | Weakness: Function calls with unexpectedly different values |
| CWE-256 | Weakness: Unprotected credential data |
| CWE-257 | Weakness: Storing passwords in reversible form |
| CWE-258 | Weakness |
