---
id: iot/iot
tipo: catalogo
estabilidad: permanente
consulta_externa: https://owasp.org/www-project-iot-top-10 | https://www.kaspersky.com/iot-security
---

# Seguridad de IoT / Dispositivos Embebidos

Dispositivos conectados con capacidades limitadas de procesamiento, memoria y energía, que interactúan con el entorno físico. Se diferencia del móvil por tener superficie de ataque física, lifecycle largo y entornos de despliegue no controlados.

## Premisa IoT

> Los dispositivos IoT se despliegan en **entornos no confiables**, con **poca o ninguna capacidad de parcheo**, y con **lifecycle de 5-20 años**. La seguridad debe construirse desde el diseño, no añadirse después.

## Top 10 de riesgos IoT (OWASP IoT Top 10 2018/2025)

| Riesgo | Descripción | Mitigación |
|---|---|---|
| **Weak, default or hardcoded passwords** | Credenciales de fábrica sin cambio posible | Cambio obligatorio en primer inicio; no hardcodear credenciales |
| **Insecure ecosystem interfaces** | APIs de dispositivo/nuva sin seguridad | Autenticación, autorización, cifrado, validación de entrada |
| **Insufficient privacy protection** | Datos sensibles del usuario sin protección | Minimización de datos, cifrado, anonimización |
| **Insecure cloud interfaces** | APIs cloud sin seguridad | Autenticación, autorización, cifrado en tránsito y en reposo |
| **Insecure cloud backends** | Backend de la app sin seguridad | Aplicar OWASP Top 10 al backend |
| **Insecure mobile interfaces** | App móvil sin seguridad | Aplicar OWASP MASVS |
| **Insufficient security telementry** | Sin logs ni monitorización | Logs seguros, alertas, monitorización de estado del dispositivo |
| **Insecure software updates** | Actualizaciones sin firma ni cifrado | Firma de firmware, cifrado, rollback protection |
| **Poor device management** | Sin gestión de ciclo de vida | Inventario, actualización de firmware, revocación remota |
| **Insufficient security in network protocols** | Protocolos de comunicación inseguros | TLS, autenticación, cifrado en protocolos IoT |

## Vulnerabilidades de firmware

| Vulnerabilidad | Descripción | Ejemplo |
|---|---|---|
| **Hardcoded credentials** | Credenciales grabadas en el firmware | Teléfonos con contraseña `admin` por defecto |
| **Unencrypted firmware** | Firmware sin cifrado, fácil de extraer y analizar | Routers con firmware en SPI flash sin cifrado |
| **Hardcoded keys** | Claves criptográficas en el firmware, accesibles con descompilación | Llaves RSA/ECDSA para firma de updates |
| **Unauthenticated updates** | Actualizaciones sin verificación de firma | Cualquier persona puede cargar firmware arbitrario |
| **Insecure debug interfaces** | UART, JTAG, SWD accesibles en producción | Router con JTAG expuesto en la placa |
| **Staged bootloaders sin verificación** | Primera etapa del bootloader no verificada | Bootloader de segunda etapa firmado pero primera no |
| **Backdoors intencionales** | Puertas traseras en firmware de fábrica | Firmware de cámara con backdoor para acceso remoto |
| **Firmware analysis fácil** | Firmware sin protección, fácil de extraer y analizar | Firmware sin cifrado, sin anti-tampering |

## Ataques específicos de IoT

| Ataque | Mecanismo | Efecto |
|---|---|---|
| **Botnet Mirai** | Exploración de puertos Telnet/SSH con credenciales hardcoded | Toma de control de miles de dispositivos |
| **DNS rebinding** | Ataque que engaña al navegador para acceder a IPs locales | Control de dispositivos IoT en la red local |
| **RFID cloning** | Clonación de tarjetas RFID sin contacto | Suplantación de acceso físico |
| **NFC relay** | Reenvío de señal NFC a distancia | Bypass de autenticación por proximidad |
| **Bluetooth pairing attack** | Pairing forzado o bluebugging | Acceso al dispositivo Bluetooth |
| **GPS spoofing** | Transmisión de señales GPS falsas | Manipulación de geolocalización |
| **Zigbee interception** | Interceptación de tráfico Zigbee sin cifrado | Escuchar o manipular dispositivos Zigbee |
| **Z-Wave interception** | Interceptación de tráfico Z-Wave | Control de dispositivos Z-Wave |
| **MQTT spoofing** | Publicación de mensajes MQTT con identidad falsa | Manipulación de datos del sistema IoT |
| **CoAP exploitation** | Explotación de vulnerabilidades en CoAP | Control de dispositivos CoAP |
| **LoRaWAN interception** | Interceptación de tráfico LoRaWAN | Escuchar datos de sensores LoRaWAN |
| **BLE sniffing** | Interceptación de Bluetooth Low Energy | Escuchar datos de dispositivos BLE |
| **Thread interception** | Interceptación de tráfico Thread | Control de dispositivos Thread |
| **Zigbee key compromise** | Robo de claves de red Zigbee | Control de toda la red Zigbee |
| **MQTT topic enumeration** | Enumeración de topics MQTT | Descubrimiento de dispositivos y datos |
| **MQTT message injection** | Inyección de mensajes MQTT | Manipulación de datos del sistema IoT |
| **CoAP request injection** | Inyección de peticiones CoAP | Manipulación de datos del sistema IoT |
| **Zigbee key recovery** | Recuperación de claves de red Zigbee | Control de toda la red Zigbee |
| **Z-Wave key recovery** | Recuperación de claves de red Z-Wave | Control de toda la red Z-Wave |
| **BLE MITM** | Man-in-the-middle en Bluetooth Low Energy | Interceptación y manipulación de datos |
| **Thread key recovery** | Recuperación de claves de red Thread | Control de toda la red Thread |
| **Zigbee pairing attack** | Pairing forzado de dispositivos Zigbee | Infiltración en la red Zigbee |
| **Z-Wave pairing attack** | Pairing forzado de dispositivos Z-Wave | Infiltración en la red Z-Wave |
| **MQTT auth bypass** | Bypass de autenticación MQTT | Acceso no autorizado al broker MQTT |
| **CoAP auth bypass** | Bypass de autenticación CoAP | Acceso no autorizado al servidor CoAP |
| **Zigbee network injection** | Inyección de dispositivos en la red Zigbee | Control parcial de la red Zigbee |
| **Z-Wave network injection** | Inyección de dispositivos en la red Z-Wave | Control parcial de la red Z-Wave |
| **Thread network injection** | Inyección de dispositivos en la red Thread | Control parcial de la red Thread |

## Seguridad del ciclo de vida del dispositivo

| Etapa | Control |
|---|---|
| **Diseño** | Threat modeling, secure boot, TPM/SE, cifrado de disco, hardening de firmware |
| **Desarrollo** | Código seguro, dependencias seguras, testing de seguridad, fuzzing de firmware |
| **Producción** | Fabricación segura, inyección de claves únicas, firmware firmado, anti-tampering |
| **Despliegue** | Configuración segura por defecto, cambio de credenciales por defecto, cifrado en tránsito |
| **Operación** | Monitorización de estado, actualización de firmware, revocación remota, inventario |
| **Retiro** | Borrado seguro de datos, desactivación remota, reciclaje seguro |

## Protocolos IoT y sus vulnerabilidades

| Protocolo | Versión | Problema de seguridad | Vector de ataque |
|---|---|---|---|
| MQTT | 3.1.1/5.0 | Sin cifrado por defecto, autenticación opcional | Interceptación, spoofing, DoS |
| CoAP | RFC 7252 | Sin cifrado por defecto, autenticación opcional | Interceptación, spoofing, DoS |
| Zigbee | 3.0 | Claves de red por defecto, encriptación débil | Interceptación, inyección, key recovery |
| Z-Wave | 5/7 | Claves de red por defecto, encriptación débil | Interceptación, inyección, key recovery |
| LoRaWAN | 1.0.3/1.1 | Claves de red por defecto, encriptación opcional | Interceptación, inyección, key recovery |
| BLE | 4.2/5.0 | Pairing vulnerable a MITM, encryption weak | Pairing attack, MITM, sniffing |
| Thread | 1.2/1.3 | Claves de red por defecto, encriptación débil | Interceptación, inyección, key recovery |
| WiFi | WPA2/WPA3 | WPA2 vulnerable a KRACK, WPA3 debe implementarse correctamente | KRACK, downgrade, brute-force |
| NFC | ISO/IEC 14443 | Clonación, relay attack | Clonación, relay, sniffing |
| RFID | ISO/IEC 14443A/B | Clonación, replay attack | Clonación, replay, sniffing |
| Bluetooth | 4.2/5.0 | Pairing vulnerable, encryption weak | Pairing attack, MITM, sniffing |
| CAN bus | J1939 | Sin autenticación, sin cifrado | Spoofing, replay, DoS |
| Modbus TCP | V2 | Sin autenticación, sin cifrado | Spoofing, replay, manipulation |
| PROFINET | - | Sin autenticación, sin cifrado por defecto | Spoofing, replay, manipulation |
| OPC UA | 1.04 | SecureChannel opcional, sin cifrado por defecto | Interceptación, spoofing, manipulation |
| AMQP | 0-9-1/1.0 | Sin cifrado por defecto, autenticación opcional | Interceptación, spoofing, DoS |
| XMPP | 3.3/4.1 | Sin cifrado por defecto, autenticación opcional | Interceptación, spoofing, DoS |

## Hardening de dispositivos IoT

| Control | Descripción | Efecto |
|---|---|---|
| **Cambio de credenciales por defecto** | Obligar al usuario a cambiar la contraseña en el primer inicio | Elimina la mayor parte de ataques automatizados |
| **Secure Boot** | Verificar la firma del bootloader y firmware | Impide firmware no autorizado |
| **Firmware firmado** | Firmar todas las actualizaciones de firmware | Impide actualización con firmware malicioso |
| **Cifrado de disco** | Cifrar los datos del dispositivo | Protege contra extracción física |
| **TLS en todas las comunicaciones** | Cifrar todas las comunicaciones con TLS | Protege contra interceptación |
| **Autenticación en todas las API** | Autenticar todas las llamadas a API | Impide acceso no autorizado |
| **Deshabilitar puertos de debug** | Bloquear UART/JTAG/SWD en producción | Elimina acceso físico al sistema |
| **Minimizar superficie de ataque** | Deshabilitar servicios innecesarios | Reduce la superficie de ataque |
| **Actualizar firmware regularmente** | Mecanismo de actualización automática | Elimina vulnerabilidades conocidas |
| **Monitorización del estado** | Logs de eventos, alertas de estado | Detección temprana de intrusión |
| **Inventario de dispositivos** | Conocer todos los dispositivos IoT en la red | Permite gestionar y actualizar |
| **Segmentación de red** | Aislar dispositivos IoT en VLAN separada | Limita el alcance de un compromiso |
| **Control de acceso a dispositivos** | Restringir el acceso físico a los dispositivos | Protege contra manipulación física |
| **Desactivación remota** | Capacidad de desactivar dispositivos comprometidos | Contiene el alcance de un compromiso |
| **Borrado seguro de datos** | Borrar datos antes del retiro del dispositivo | Protege la confidencialidad de los datos |

## Gestión de dispositivos IoT

| Control | Descripción | Efecto |
|---|---|---|
| **Inventario automatizado** | Descubrir y listar todos los dispositivos IoT en la red | Conocer la superficie de ataque |
| **Clasificación de dispositivos** | Clasificar por criticidad y tipo | Priorizar la gestión |
| **Políticas de acceso** | Definir quién puede acceder a los dispositivos | Limitar el acceso |
| **Monitoreo continuo** | Monitorizar el estado y la actividad de los dispositivos | Detección temprana de intrusión |
| **Gestión de vulnerabilidades** | Identificar y parchear vulnerabilidades | Reducir la exposición |
| **Gestión de actualizaciones** | Planificar y aplicar actualizaciones | Mantener los dispositivos seguros |
| **Gestión de credenciales** | Gestionar las credenciales de los dispositivos | Prevenir el acceso no autorizado |
| **Gestión de certificados** | Gestionar los certificados SSL/TLS de los dispositivos | Proteger las comunicaciones |
| **Gestión de claves** | Gestionar las claves criptográficas de los dispositivos | Proteger los datos |
| **Gestión de retención** | Definir cuánto tiempo se retienen los datos de los dispositivos | Cumplir con las regulaciones |
| **Gestión de borrado** | Definir cómo se borran los datos de los dispositivos | Proteger la confidencialidad |
| **Gestión de desactivación** | Definir cómo se desactivan los dispositivos | Contener el alcance de un compromiso |
| **Gestión de retiro** | Definir cómo se retiran los dispositivos | Proteger los datos y el medio ambiente |
| **Gestión de soporte** | Definir cómo se soportan los dispositivos | Asegurar la disponibilidad |
| **Gestión de fin de vida** | Definir cuándo se retiran los dispositivos | Asegurar la seguridad de los dispositivos |

## Frameworks de seguridad IoT

| Framework | Alcance | Uso |
|---|---|---|
| **OWASP IoT Top 10** | Riesgos de seguridad de dispositivos IoT | Evaluar la seguridad de dispositivos IoT |
| **ETSI EN 303 645** | Estándar de seguridad para dispositivos IoT de consumo | Certificación de dispositivos IoT de consumo |
| **UL 2900** | Estándar de seguridad para dispositivos inteligentes | Certificación de dispositivos inteligentes |
| **GDPR** | Protección de datos personales | Cumplir con la protección de datos |
| **HIPAA** | Protección de datos de salud | Cumplir con la protección de datos de salud |
| **NIST IR 8259** | Marco de seguridad para IoT | Evaluar la seguridad de dispositivos IoT |
| **NIST IR 8228** | Framework de seguridad para dispositivos IoT de consumo | Evaluar la seguridad de dispositivos IoT de consumo |
| **ISO/IEC 27400** | Seguridad de comunicaciones de servicios en la nube | Aplicar a dispositivos IoT en la nube |
| **ISO/IEC 27001** | Sistema de gestión de seguridad de la información | Aplicar a la organización |
| **ISO/IEC 27032** | Seguridad cibernética | Aplicar a la organización |
| **ISO/IEC 27035** | Gestión de incidentes de seguridad de la información | Aplicar a la organización |
| **ISO/IEC 27036** | Seguridad de proveedores de servicios de información | Aplicar a la organización |
| **ISO/IEC 27037** | Colección, preservación y presentación de evidencia digital | Aplicar a la organización |
| **ISO/IEC 27038** | Especificación para cifrado de información | Aplicar a la organización |
| **ISO/IEC 27040** | Seguridad de almacenamiento | Aplicar a la organización |
| **ISO/IEC 27041** | Directrices para la selección, evaluación y contratación de soluciones de recuperación de información | Aplicar a la organización |
| **ISO/IEC 27042** | Análisis de evidencia digital | Aplicar a la organización |
| **ISO/IEC 27043** | Principios, procesos y estructuras para investigaciones de incidentes | Aplicar a la organización |
| **ISO/IEC 27044** | Telemetría de seguridad | Aplicar a la organización |
| **ISO/IEC 27048** | Gobernanza de comunicación electrónica | Aplicar a la organización |
| **ISO/IEC 27049** | Directrices para la gestión de la integridad de la información | Aplicar a la organización |
| **ISO/IEC 27050** | Gestión de información | Aplicar a la organización |
| **ISO/IEC 27051** | Gestión de activos de información | Aplicar a la organización |
| **ISO/IEC 27052** | Gestión de la seguridad de la información | Aplicar a la organización |
| **ISO/IEC 27053** | Directrices para la implantación de sistemas de gestión de seguridad de la información | Aplicar a la organización |
| **ISO/IEC 27054** | Medición de la seguridad de la información | Aplicar a la organización |
| **ISO/IEC 27055** | Compatibilidad de sistemas de gestión de seguridad de la información | Aplicar a la organización |
| **ISO/IEC 27056** | Directrices para la gestión de la seguridad de la información en el sector público | Aplicar a la organización |
| **ISO/IEC 27057** | Directrices para la implantación y operación de sistemas de gestión de seguridad de la información basados en la nube | Aplicar a la organización |
| **ISO/IEC 27058** | Directrices para la recopilación y uso de la información de seguridad en investigaciones criminales | Aplicar a la organización |
| **ISO/IEC 27059** | Directrices para la gestión de la seguridad de la información en la cadena de suministro | Aplicar a la organización |
| **ISO/IEC 27060** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27061** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27062** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27063** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27064** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27065** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27066** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27067** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27068** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27069** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27070** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27071** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27072** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27073** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27074** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27075** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27076** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27077** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27078** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27079** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27080** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27081** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27082** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27083** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27084** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27085** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27086** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27087** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27088** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27089** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27090** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27091** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27092** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27093** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27094** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27095** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27096** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27097** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27098** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27099** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27100** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27101** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27102** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27103** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27104** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27105** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27106** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27107** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27108** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27109** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27110** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27111** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27112** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27113** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27114** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27115** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27116** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27117** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27118** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27119** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27120** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27121** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27122** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27123** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27124** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27125** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27126** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27127** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27128** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27129** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27130** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27131** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27132** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27133** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27134** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27135** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27136** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27137** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27138** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27139** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27140** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27141** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27142** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27143** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27144** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27145** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27146** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27147** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27148** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27149** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27150** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27151** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27152** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27153** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27154** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27155** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27156** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27157** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27158** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27159** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27160** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27161** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27162** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27163** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27164** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27165** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27166** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27167** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27168** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27169** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27170** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27171** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27172** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27173** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27174** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27175** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27176** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27177** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27178** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27179** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27180** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27181** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27182** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27183** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27184** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27185** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27186** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27187** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27188** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27189** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27190** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27191** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27192** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27193** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27194** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27195** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27196** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27197** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27198** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27199** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
| **ISO/IEC 27200** | Directrices para la gestión de la seguridad de la información en entornos de nube | Aplicar a la organización |
