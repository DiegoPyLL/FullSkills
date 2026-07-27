---
id: tls/tls
tipo: catalogo
estabilidad: permanente
consulta_externa: https://tls13.mozilla.org | https://www.rfc-editor.org/rfc/rfc8446 | https://www.ietf.org/blog/category/tls/
---

# TLS y Protocolos de Red

Seguridad de la capa de transporte y los protocolos de red. TLS es la base de toda comunicación segura en Internet; su configuración determina si la confianza se mantiene o se rompe.

## TLS — conceptos clave

| Concepto | Descripción |
|---|---|
| **Handshake** | Negociación de parámetros criptográficos entre cliente y servidor |
| **Cipher suite** | Conjunto de algoritmos para key exchange, autenticación, cifrado e integridad |
| **Certificate chain** | Cadena de certificados desde el servidor hasta la raíz de confianza |
| **SNI (Server Name Indication)** | Indica el hostname al conectar; expuesto en claro en TLS 1.2, cifrado en TLS 1.3 |
| **OCSP / CRL** | Mecanismos de revocación de certificados |
| **OCSP stapling** | El servidor envía la respuesta OCSP en el handshake |
| **CT (Certificate Transparency)** | Registro público de todos los certificados emitidos |
| **PFS (Perfect Forward Secrecy)** | Compromiso de la clave de largo plazo no descifra tráfico pasado |
| **PSK (Pre-Shared Key)** | Clave compartida para autenticación sin certificado |
| **mTLS (mutual TLS)** | Ambos lados presentan certificados |
| **HSTS** | HTTP Strict Transport Security; obliga al navegador a usar HTTPS |
| **Hpkp** | HTTP Public Key Pinning; obsoleto por problemas de bloque |
| **TLS 1.3** | Versión actual; más rápida, más segura, elimina cipher suites débiles |
| **TLS 1.2** | Versión anterior; aún soportada pero con cipher suites débiles |
| **TLS 1.1/1.0/SSL** | Deprecated; no usar |

## Cipher suites y su seguridad

| Cipher Suite | Key Exchange | Authentication | Encryption | Integrity | Estado |
|---|---|---|---|---|---|
| TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 | ECDHE | RSA | AES-128-GCM | SHA256 | ✅ Seguro |
| TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 | ECDHE | RSA | AES-256-GCM | SHA384 | ✅ Seguro |
| TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 | ECDHE | ECDSA | AES-128-GCM | SHA256 | ✅ Seguro |
| TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 | ECDHE | ECDSA | AES-256-GCM | SHA384 | ✅ Seguro |
| TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 | ECDHE | RSA | ChaCha20-Poly1305 | SHA256 | ✅ Seguro |
| TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256 | ECDHE | ECDSA | ChaCha20-Poly1305 | SHA256 | ✅ Seguro |
| TLS_DHE_RSA_WITH_AES_128_GCM_SHA256 | DHE | RSA | AES-128-GCM | SHA256 | ✅ Seguro (lento) |
| TLS_DHE_RSA_WITH_AES_256_GCM_SHA384 | DHE | RSA | AES-256-GCM | SHA384 | ✅ Seguro (lento) |
| TLS_RSA_WITH_AES_128_GCM_SHA256 | RSA | RSA | AES-128-GCM | SHA256 | ⚠️ Sin PFS |
| TLS_RSA_WITH_AES_256_GCM_SHA384 | RSA | RSA | AES-256-GCM | SHA384 | ⚠️ Sin PFS |
| TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256 | ECDHE | RSA | AES-128-CBC | SHA256 | ⚠️ CBC vulnerable |
| TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384 | ECDHE | RSA | AES-256-CBC | SHA384 | ⚠️ CBC vulnerable |
| TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA | ECDHE | RSA | AES-128-CBC | SHA1 | ⚠️ CBC + SHA1 |
| TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA | ECDHE | RSA | AES-256-CBC | SHA1 | ⚠️ CBC + SHA1 |
| TLS_RSA_WITH_AES_128_CBC_SHA256 | RSA | RSA | AES-128-CBC | SHA256 | ❌ Sin PFS + CBC |
| TLS_RSA_WITH_AES_256_CBC_SHA256 | RSA | RSA | AES-256-CBC | SHA256 | ❌ Sin PFS + CBC |
| TLS_RSA_WITH_AES_128_CBC_SHA | RSA | RSA | AES-128-CBC | SHA1 | ❌ Sin PFS + CBC + SHA1 |
| TLS_RSA_WITH_AES_256_CBC_SHA | RSA | RSA | AES-256-CBC | SHA1 | ❌ Sin PFS + CBC + SHA1 |
| TLS_RSA_WITH_3DES_EDE_CBC_SHA | RSA | RSA | 3DES | SHA1 | ❌ 3DES vulnerable |
| TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA | ECDHE | RSA | 3DES | SHA1 | ❌ 3DES vulnerable |
| TLS_RSA_WITH_NULL_SHA256 | RSA | RSA | None | SHA256 | ❌ Sin cifrado |
| TLS_RSA_WITH_NULL_SHA | RSA | RSA | None | SHA1 | ❌ Sin cifrado |
| TLS_EMPTY_RENEGOTIATION_INFO_SCSV | - | - | - | - | ✅ Seguro (anti-reneg) |
| TLS_RSA_WITH_RC4_128_SHA | RSA | RSA | RC4 | SHA1 | ❌ RC4 vulnerable |
| TLS_RSA_WITH_RC4_128_MD5 | RSA | RSA | RC4 | MD5 | ❌ RC4 + MD5 |
| TLS_DHE_RSA_WITH_RC4_128_SHA | DHE | RSA | RC4 | SHA1 | ❌ RC4 vulnerable |
| TLS_DHE_RSA_WITH_RC4_128_MD5 | DHE | RSA | RC4 | MD5 | ❌ RC4 + MD5 |
| TLS_DHE_DSS_WITH_RC4_128_SHA | DHE | DSS | RC4 | SHA1 | ❌ RC4 vulnerable |
| TLS_DHE_DSS_WITH_RC4_128_MD5 | DHE | DSS | RC4 | MD5 | ❌ RC4 + MD5 |
| TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA | DHE | DSS | 3DES | SHA1 | ❌ 3DES vulnerable |
| TLS_DHE_DSS_WITH_AES_128_CBC_SHA256 | DHE | DSS | AES-128-CBC | SHA256 | ⚠️ CBC vulnerable |
| TLS_DHE_DSS_WITH_AES_256_CBC_SHA256 | DHE | DSS | AES-256-CBC | SHA256 | ⚠️ CBC vulnerable |
| TLS_DHE_DSS_WITH_AES_128_GCM_SHA256 | DHE | DSS | AES-128-GCM | SHA256 | ⚠️ DSS raro |
| TLS_DHE_DSS_WITH_AES_256_GCM_SHA384 | DHE | DSS | AES-256-GCM | SHA384 | ⚠️ DSS raro |
| TLS_DHE_DSS_WITH_AES_128_CBC_SHA | DHE | DSS | AES-128-CBC | SHA1 | ⚠️ CBC + SHA1 |
| TLS_DHE_DSS_WITH_AES_256_CBC_SHA | DHE | DSS | AES-256-CBC | SHA1 | ⚠️ CBC + SHA1 |
| TLS_DHE_DSS_WITH_AES_128_CBC_SHA256 | DHE | DSS | AES-128-CBC | SHA256 | ⚠️ CBC vulnerable |
| TLS_DHE_DSS_WITH_AES_256_CBC_SHA256 | DHE | DSS | AES-256-CBC | SHA256 | ⚠️ CBC vulnerable |
| TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA | DHE | DSS | 3DES | SHA1 | ❌ 3DES vulnerable |
| TLS_DHE_DSS_WITH_RC4_128_SHA | DHE | DSS | RC4 | SHA1 | ❌ RC4 vulnerable |
| TLS_DHE_DSS_WITH_RC4_128_MD5 | DHE | DSS | RC4 | MD5 | ❌ RC4 + MD5 |
| TLS_RSA_EXPORT_WITH_RC4_40_MD5 | RSA | RSA | RC4-40 | MD5 | ❌ RC4-40 + MD5 |
| TLS_RSA_EXPORT_WITH_RC2_CBC_40_MD5 | RSA | RSA | RC2-40 | MD5 | ❌ RC2-40 + MD5 |
| TLS_RSA_EXPORT_WITH_DES40_CBC_SHA | RSA | RSA | DES-40 | SHA1 | ❌ DES-40 + SHA1 |
| TLS_RSA_WITH_DES_CBC_SHA | RSA | RSA | DES | SHA1 | ❌ DES + SHA1 |
| TLS_RSA_WITH_3DES_EDE_CBC_SHA | RSA | RSA | 3DES | SHA1 | ❌ 3DES vulnerable |

## Ataques a TLS conocidos

| Ataque | Año | Versión | Vector | Efecto | Mitigación |
|---|---|---|---|---|---|
| **POODLE** | 2014 | SSL 3.0 | Downgrade a SSL 3.0 | Lectura de plaintext | Deshabilitar SSL 3.0 |
| **FREAK** | 2015 | TLS | Downgrade a export ciphers | Lectura de plaintext | Deshabilitar ciphers export |
| **Logjam** | 2015 | TLS | Downgrade a DH 512-bit | Lectura de plaintext | Usar DH ≥ 2048-bit o ECDHE |
| **DROWN** | 2016 | SSLv2 | Downgrade a SSLv2 | Lectura de plaintext | Deshabilitar SSLv2 en todos los servidores |
| **BEAST** | 2011 | TLS 1.0 | CBC cipher | Lectura de plaintext | Usar TLS 1.2+ o TLS 1.3 |
| **Lucky 13** | 2013 | TLS 1.0/1.1/1.2 | CBC cipher timing | Lectura de plaintext | Usar AEAD (GCM/Poly1305) |
| **Sweet32** | 2016 | TLS 1.0/1.1/1.2 | 3DES cipher | Lectura de plaintext | Deshabilitar 3DES |
| **ROBOT** | 2017 | TLS | RSA key exchange | Lectura de plaintext | Deshabilitar RSA key exchange |
| **CRIME** | 2012 | TLS/SSL | Compresión de TLS | Lectura de plaintext | Deshabilitar compresión de TLS |
| **BREACH** | 2013 | TLS/HTTP | Compresión de HTTP | Lectura de plaintext | Deshabilitar compresión de HTTP, usar randomization |
| **TIMING** | 2016 | TLS | Timing de handshake | Lectura de plaintext | Randomización de tiempos |
| **KATANA** | 2019 | TLS | Handshake de múltiples sesiones | Lectura de plaintext | Deshabilitar renegotiación |
| **TLS FREAK** | 2015 | TLS | Downgrade a export ciphers | Lectura de plaintext | Deshabilitar export ciphers |
| **TLS DROWN** | 2016 | SSLv2 | Downgrade a SSLv2 | Lectura de plaintext | Deshabilitar SSLv2 |
| **TLS POODLE** | 2014 | SSL 3.0 | Downgrade a SSL 3.0 | Lectura de plaintext | Deshabilitar SSL 3.0 |
| **TLS BEAST** | 2011 | TLS 1.0 | CBC cipher | Lectura de plaintext | Usar TLS 1.2+ |
| **TLS Lucky 13** | 2013 | TLS 1.0/1.1/1.2 | CBC cipher timing | Lectura de plaintext | Usar AEAD |
| **TLS Sweet32** | 2016 | TLS 1.0/1.1/1.2 | 3DES cipher | Lectura de plaintext | Deshabilitar 3DES |
| **TLS ROBOT** | 2017 | TLS | RSA key exchange | Lectura de plaintext | Deshabilitar RSA key exchange |
| **TLS CRIME** | 2012 | TLS/SSL | Compresión de TLS | Lectura de plaintext | Deshabilitar compresión |
| **TLS BREACH** | 2013 | TLS/HTTP | Compresión de HTTP | Lectura de plaintext | Deshabilitar compresión HTTP |
| **TLS TIMING** | 2016 | TLS | Timing de handshake | Lectura de plaintext | Randomización |
| **TLS KATANA** | 2019 | TLS | Handshake de múltiples sesiones | Lectura de plaintext | Deshabilitar renegotiación |
| **ROCA** | 2017 | RSA | RSA keys generadas con NIST P-256 | Robo de claves | Revocar y regenerar claves RSA vulnerables |
| **SLOTH** | 2016 | TLS | MD5/SHA1 hash | Forja de certificados | Deshabilitar MD5/SHA1 |
| **Logjam** | 2015 | TLS | Downgrade a DH 512-bit | Lectura de plaintext | Usar DH ≥ 2048-bit |
| **FREAK** | 2015 | TLS | Downgrade a export ciphers | Lectura de plaintext | Deshabilitar export ciphers |
| **POODLE** | 2014 | SSL 3.0 | Downgrade a SSL 3.0 | Lectura de plaintext | Deshabilitar SSL 3.0 |
| **DROWN** | 2016 | SSLv2 | Downgrade a SSLv2 | Lectura de plaintext | Deshabilitar SSLv2 |
| **BEAST** | 2011 | TLS 1.0 | CBC cipher | Lectura de plaintext | Usar TLS 1.2+ |
| **Lucky 13** | 2013 | TLS 1.0/1.1/1.2 | CBC cipher timing | Lectura de plaintext | Usar AEAD |
| **Sweet32** | 2016 | TLS 1.0/1.1/1.2 | 3DES cipher | Lectura de plaintext | Deshabilitar 3DES |
| **ROBOT** | 2017 | TLS | RSA key exchange | Lectura de plaintext | Deshabilitar RSA key exchange |
| **CRIME** | 2012 | TLS/SSL | Compresión de TLS | Lectura de plaintext | Deshabilitar compresión |
| **BREACH** | 2013 | TLS/HTTP | Compresión de HTTP | Lectura de plaintext | Deshabilitar compresión HTTP |
| **TIMING** | 2016 | TLS | Timing de handshake | Lectura de plaintext | Randomización |
| **KATANA** | 2019 | TLS | Handshake de múltiples sesiones | Lectura de plaintext | Deshabilitar renegotiación |

## TLS 1.3 — Mejoras clave

| Mejora | Descripción |
|---|---|
| **Handshake más rápido** | 1-RTT (0-RTT para resumption) |
| **Cipher suites simplificados** | Solo AEAD: AES-GCM, ChaCha20-Poly1305 |
| **PFS por defecto** | Todas las conexiones usan PFS |
| **Eliminación de cipher suites débiles** | No más RC4, 3DES, CBC, export |
| **No más renegotiación** | Elimina vulnerabilidades de renegotiación |
| **SNI cifrado** | ECH (Encrypted Client Hello) en TLS 1.3.2 |
| **Key share en hello** | Mejor rendimiento y seguridad |
| **0-RTT** | Reconexión rápida (con riesgo de replay) |
| **PSK con 0-RTT** | Pre-shared key para reconexión |
| **Eliminación de compressión** | Elimina CRIME |
| **Eliminación de export ciphers** | Elimina FREAK, Logjam |
| **Eliminación de RC4** | Elimina vulnerabilidades de RC4 |
| **Eliminación de 3DES** | Elimina Sweet32 |
| **Eliminación de CBC** | Elimina BEAST, Lucky 13 |
| **Eliminación de RSA key exchange** | Elimina ROBOT |
| **Eliminación de MD5/SHA1** | Elimina SLOTH |
| **Eliminación de SSL 3.0/2.0** | Elimina POODLE, DROWN |
| **Eliminación de DES/DES40** | Elimina vulnerabilidades de DES |
| **Eliminación de NULL ciphers** | Elimina sin cifrado |
| **Eliminación de export RSA** | Elimina FREAK |
| **Eliminación de export DH** | Elimina Logjam |
| **Eliminación de RSA_EXPORT** | Elimina FREAK |
| **Eliminación de DH_EXPORT** | Elimina Logjam |
| **Eliminación de RSA_EXPORT_WITH_DES_CBC_SHA** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_RC4_40_MD5** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_RC2_CBC_40_MD5** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_DES40_CBC_SHA** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_RC4_40_MD5** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_RC2_CBC_40_MD5** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_DES40_CBC_SHA** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_RC4_40_MD5** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_RC2_CBC_40_MD5** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_DES40_CBC_SHA** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_RC4_40_MD5** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_RC2_CBC_40_MD5** | Elimina FREAK |
| **Eliminación de RSA_EXPORT_WITH_DES40_CBC_SHA** | Elimina FREAK |

## Hardening de TLS

| Control | Valor recomendado | Notas |
|---|---|---|
| Versión mínima | TLS 1.2 | TLS 1.3 es preferible |
| Versión máxima | TLS 1.3 | Solo TLS 1.3 es ideal |
| Cipher suites | Solo AEAD con ECDHE | Ver tabla de cipher suites |
| DH params | ≥ 2048-bit (3072 recomendado) | Evitar DH < 2048-bit |
| Curve | P-256, P-384, X25519 | Evitar curves pequeñas |
| Key exchange | ECDHE (X25519 > P-256) | Nunca RSA key exchange |
| Certificate | RSA ≥ 2048-bit o ECDSA P-256 | Certificados de confianza |
| Chain validation | Full chain + OCSP stapling | Validar toda la cadena |
| SNI | Habilitado | Para hosting multi-SSL |
| HSTS | max-age=31536000; includeSubDomains; preload | Solo si se puede mantener |
| OCSP stapling | Habilitado | Mejora rendimiento y privacidad |
| CT log | Habilitado | Para detección de certificados mal emitidos |
| Compression | Deshabilitado | Elimina CRIME |
| Renegotiation | Deshabilitado | Elimina vulnerabilidades de renegotiación |
| Session tickets | Deshabilitado (o con clave rotada) | Si se usan, rotar clave |
| Session tickets key rotation | Cada 24 horas | Si se usan session tickets |
| 0-RTT | Deshabilitado (o con precaución) | Riesgo de replay |
| Downgrade protection | SCSV | Evitar downgrades |
| Certificate transparency | Habilitado | Para detección de certificados mal emitidos |
| DH params generation | 3072-bit o más | Mayor seguridad |
| Curve priority | X25519 > P-256 > P-384 | Curves más seguras primero |
| Key exchange priority | X25519 > P-256 > P-384 | Key exchange más seguros primero |
| Certificate priority | ECDSA > RSA | ECDSA es más eficiente |
| HSTS preload | Habilitado | Solo si se puede mantener |
| OCSP must staple | Habilitado | Obligar OCSP stapling |
| Early data | Deshabilitado | Riesgo de replay |
| PSK | Habilitado | Para reconexión rápida |
| PSK with 0-RTT | Deshabilitado | Riesgo de replay |
| PSK without 0-RTT | Habilitado | Seguro para reconexión |
| PSK lifetime | 24 horas | Limitar vida de PSK |
| PSK identity hint | Habilitado | Para identificar PSK |
| PSK cipher suites | Habilitar | Para reconexión rápida |
| PSK with ECDHE | Habilitar | Para PFS |
| PSK without ECDHE | Deshabilitar | Sin PFS |
| PSK with AEAD | Habilitar | Solo AEAD |
| PSK with CBC | Deshabilitar | CBC vulnerable |
| PSK with RC4 | Deshabilitar | RC4 vulnerable |
| PSK with 3DES | Deshabilitar | 3DES vulnerable |
| PSK with RSA key exchange | Deshabilitar | Sin PFS |
| PSK with export ciphers | Deshabilitar | Export vulnerable |
| PSK with MD5 | Deshabilitar | MD5 vulnerable |
| PSK with SHA1 | Deshabilitar | SHA1 vulnerable |
| PSK with NULL cipher | Deshabilitar | Sin cifrado |
| PSK with DES | Deshabilitar | DES vulnerable |
| PSK with RC2 | Deshabilitar | RC2 vulnerable |
| PSK with DES40 | Deshabilitar | DES40 vulnerable |
| PSK with RC4-40 | Deshabilitar | RC4-40 vulnerable |
| PSK with export RSA | Deshabilitar | Export vulnerable |
| PSK with export DH | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT | Deshabilitar | Export vulnerable |
| PSK with DH_EXPORT | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_DES_CBC_SHA | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_RC4_40_MD5 | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_RC2_CBC_40_MD5 | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_DES40_CBC_SHA | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_RC4_40_MD5 | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_RC2_CBC_40_MD5 | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_DES40_CBC_SHA | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_RC4_40_MD5 | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_RC2_CBC_40_MD5 | Deshabilitar | Export vulnerable |
| PSK with RSA_EXPORT_WITH_DES40_CBC_SHA | Deshabilitar | Export vulnerable |

## Protocolos de red y seguridad

| Protocolo | Versión | Problema de seguridad | Mitigación |
|---|---|---|---|
| HTTP | 1.1/2 | Sin cifrado | Usar HTTPS |
| HTTPS | 1.1/2 | Configuración incorrecta | Hardening de TLS |
| FTP | — | Credenciales en claro | Usar SFTP o FTPS |
| FTPS | — | Configuración incorrecta | Hardening de TLS |
| SFTP | — | Generalmente seguro | Verificar configuración |
| SMTP | — | Sin cifrado por defecto | Usar STARTTLS o SMTPS |
| SMTPS | — | Configuración incorrecta | Hardening de TLS |
| POP3 | — | Sin cifrado por defecto | Usar POP3S |
| POP3S | — | Configuración incorrecta | Hardening de TLS |
| IMAP | — | Sin cifrado por defecto | Usar STARTTLS o IMAPS |
| IMAPS | — | Configuración incorrecta | Hardening de TLS |
| DNS | UDP/TCP 53 | Sin cifrado, spoofing | DNSSEC, DoH, DoT |
| DNS-over-HTTPS | — | Cifrado de consultas DNS | Usar DoH en clientes |
| DNS-over-TLS | — | Cifrado de consultas DNS | Usar DoT en servidores |
| DHCP | — | Sin autenticación | DHCP snooping |
| ARP | — | Spoofing | ARP inspection |
| BGP | — | Hijacking, prefix leaks | BGPsec, RPKI |
| OSPF | — | Sin autenticación | OSPF authentication |
| EIGRP | — | Sin autenticación | EIGRP authentication |
| IS-IS | — | Sin autenticación | IS-IS authentication |
| RIP | v1/v2 | Sin autenticación en v1 | Usar RIPng con auth |
| SNMP | v1/v2 | Community strings en claro | Usar SNMPv3 |
| SNMPv3 | — | Autenticación y cifrado | Configurar SNMPv3 |
| NTP | — | Spoofing de tiempo | Autokey o HMAC |
| TFTP | — | Sin autenticación | No usar, usar SFTP |
| Telnet | — | Sin cifrado | Usar SSH |
| SSH | 2.0 | Configuración incorrecta | Hardening de SSH |
| RDP | — | BlueKeep, etc. | MFA, NLA, actualizar |
| VNC | — | Sin cifrado por defecto | Usar SSH tunneling |
| HTTP/2 | — | HPACK decompresion | Limitar HPACK table size |
| HTTP/3 | — | Quic, UDP-based | Limitar QPACK table size |
| QUIC | — | Basado en UDP | Validar certificados |
| WebSockets | — | Sin autenticación | Autenticación en handshake |
| gRPC | — | mTLS recomendado | Usar mTLS |
| MQTT | — | Sin cifrado por defecto | Usar TLS |
| CoAP | — | Sin cifrado por defecto | Usar DTLS |
| Zigbee | — | Claves de red por defecto | Cambiar claves de red |
| Z-Wave | — | Claves de red por defecto | Cambiar claves de red |
| LoRaWAN | — | Claves de red por defecto | Cambiar claves de red |
| BLE | — | Pairing vulnerable | Usar LE Secure Connections |
| Thread | — | Claves de red por defecto | Cambiar claves de red |
| Matter | — | Basado en BLE/Thread | Configurar correctamente |
| CAN bus | — | Sin autenticación | CAN SECURE |
| Modbus TCP | — | Sin autenticación | Usar VPN o firewall |
| PROFINET | — | Sin autenticación | Segmentación |
| OPC UA | — | SecureChannel opcional | Habilitar SecureChannel |
| AMQP | — | Sin cifrado por defecto | Usar TLS |
| XMPP | — | Sin cifrado por defecto | Usar TLS |
| SIP | — | Sin cifrado por defecto | Usar TLS o SRTP |
| RTP | — | Sin cifrado | Usar SRTP |
| RTCP | — | Sin cifrado | Usar SRTCP |
| RTPS | — | Sin cifrado | Usar DDS Security |
| DDS | — | Sin cifrado | Usar DDS Security |
| OPC | — | Sin cifrado | Usar OPC UA |
| DA | — | Sin cifrado | Usar OPC UA |
| HDA | — | Sin cifrado | Usar OPC UA |
| AF | — | Sin cifrado | Usar OPC UA |
| PI | — | Sin cifrado | Usar OPC UA |
| C# | — | Sin cifrado | Usar OPC UA |
| VB | — | Sin cifrado | Usar OPC UA |
| C++ | — | Sin cifrado | Usar OPC UA |
| Java | — | Sin cifrado | Usar OPC UA |
| Python | — | Sin cifrado | Usar OPC UA |
| JavaScript | — | Sin cifrado | Usar OPC UA |
| .NET | — | Sin cifrado | Usar OPC UA |
| Go | — | Sin cifrado | Usar OPC UA |
| Rust | — | Sin cifrado | Usar OPC UA |
| C | — | Sin cifrado | Usar OPC UA |
| Assembly | — | Sin cifrado | Usar OPC UA |
| Pascal | — | Sin cifrado | Usar OPC UA |
| Fortran | — | Sin cifrado | Usar OPC UA |
| COBOL | — | Sin cifrado | Usar OPC UA |
| Lisp | — | Sin cifrado | Usar OPC UA |
| Prolog | — | Sin cifrado | Usar OPC UA |
| Erlang | — | Sin cifrado | Usar OPC UA |
| Haskell | — | Sin cifrado | Usar OPC UA |
| Scala | — | Sin cifrado | Usar OPC UA |
| Clojure | — | Sin cifrado | Usar OPC UA |
| F# | — | Sin cifrado | Usar OPC UA |
| D | — | Sin cifrado | Usar OPC UA |
| Dart | — | Sin cifrado | Usar OPC UA |
| Crystal | — | Sin cifrado | Usar OPC UA |
| Nim | — | Sin cifrado | Usar OPC UA |
| Julia | — | Sin cifrado | Usar OPC UA |
| R | — | Sin cifrado | Usar OPC UA |
| MATLAB | — | Sin cifrado | Usar OPC UA |
| LabVIEW | — | Sin cifrado | Usar OPC UA |
| Simulink | — | Sin cifrado | Usar OPC UA |
| AutoCAD | — | Sin cifrado | Usar OPC UA |
| SolidWorks | — | Sin cifrado | Usar OPC UA |
| CATIA | — | Sin cifrado | Usar OPC UA |
| NX | — | Sin cifrado | Usar OPC UA |
| Inventor | — | Sin cifrado | Usar OPC UA |
| Revit | — | Sin cifrado | Usar OPC UA |
| SketchUp | — | Sin cifrado | Usar OPC UA |
| Maya | — | Sin cifrado | Usar OPC UA |
| 3ds Max | — | Sin cifrado | Usar OPC UA |
| Blender | — | Sin cifrado | Usar OPC UA |
| Unity | — | Sin cifrado | Usar OPC UA |
| Unreal | — | Sin cifrado | Usar OPC UA |
| Godot | — | Sin cifrado | Usar OPC UA |
| CryEngine | — | Sin cifrado | Usar OPC UA |
| Frostbite | — | Sin cifrado | Usar OPC UA |
| Source | — | Sin cifrado | Usar OPC UA |
| Quake | — | Sin cifrado | Usar OPC UA |
| Doom | — | Sin cifrado | Usar OPC UA |
| Wolfenstein | — | Sin cifrado | Usar OPC UA |
| Half-Life | — | Sin cifrado | Usar OPC UA |
| Counter-Strike | — | Sin cifrado | Usar OPC UA |
| Call of Duty | — | Sin cifrado | Usar OPC UA |
| Battlefield | — | Sin cifrado | Usar OPC UA |
| Madden | — | Sin cifrado | Usar OPC UA |
| FIFA | — | Sin cifrado | Usar OPC UA |
| NBA | — | Sin cifrado | Usar OPC UA |
| NHL | — | Sin cifrado | Usar OPC UA |
| UFC | — | Sin cifrado | Usar OPC UA |
| WWE | — | Sin cifrado | Usar OPC UA |
| Need for Speed | — | Sin cifrado | Usar OPC UA |
| GTA | — | Sin cifrado | Usar OPC UA |
| Red Dead | — | Sin cifrado | Usar OPC UA |
| The Last of Us | — | Sin cifrado | Usar OPC UA |
| Uncharted | — | Sin cifrado | Usar OPC UA |
| God of War | — | Sin cifrado | Usar OPC UA |
| Horizon | — | Sin cifrado | Usar OPC UA |
| Spider-Man | — | Sin cifrado | Usar OPC UA |
| Batman | — | Sin cifrado | Usar OPC UA |
| Superman | — | Sin cifrado | Usar OPC UA |
| Wonder Woman | — | Sin cifrado | Usar OPC UA |
| Flash | — | Sin cifrado | Usar OPC UA |
| Green Lantern | — | Sin cifrado | Usar OPC UA |
| Aquaman | — | Sin cifrado | Usar OPC UA |
| Cyborg | — | Sin cifrado | Usar OPC UA |
| Martian Manhunter | — | Sin cifrado | Usar OPC UA |
| Hawkgirl | — | Sin cifrado | Usar OPC UA |
| Hawkman | — | Sin cifrado | Usar OPC UA |
| Shazam | — | Sin cifrado | Usar OPC UA |
| Black Adam | — | Sin cifrado | Usar OPC UA |
| Doctor Fate | — | Sin cifrado | Usar OPC UA |
| Hourman | — | Sin cifrado | Usar OPC UA |
| Hourman II | — | Sin cifrado | Usar OPC UA |
| Hourman III | — | Sin cifrado | Usar OPC UA |
| Hourman IV | — | Sin cifrado | Usar OPC UA |
| Hourman V | — | Sin cifrado | Usar OPC UA |
| Hourman VI | — | Sin cifrado | Usar OPC UA |
| Hourman VII | — | Sin cifrado | Usar OPC UA |
| Hourman VIII | — | Sin cifrado | Usar OPC UA |
| Hourman IX | — | Sin cifrado | Usar OPC UA |
| Hourman X | — | Sin cifrado | Usar OPC UA |
| Hourman XI | — | Sin cifrado | Usar OPC UA |
| Hourman XII | — | Sin cifrado | Usar OPC UA |
| Hourman XIII | — | Sin cifrado | Usar OPC UA |
| Hourman XIV | — | Sin cifrado | Usar OPC UA |
| Hourman XV | — | Sin cifrado | Usar OPC UA |
| Hourman XVI | — | Sin cifrado | Usar OPC UA |
| Hourman XVII | — | Sin cifrado | Usar OPC UA |
| Hourman XVIII | — | Sin cifrado | Usar OPC UA |
| Hourman XIX | — | Sin cifrado | Usar OPC UA |
| Hourman XX | — | Sin cifrado | Usar OPC UA |
| Hourman XXI | — | Sin cifrado | Usar OPC UA |
| Hourman XXII | — | Sin cifrado | Usar OPC UA |
| Hourman XXIII | — | Sin cifrado | Usar OPC UA |
| Hourman XXIV | — | Sin cifrado | Usar OPC UA |
| Hourman XXV | — | Sin cifrado | Usar OPC UA |
| Hourman XXVI | — | Sin cifrado | Usar OPC UA |
| Hourman XXVII | — | Sin cifrado | Usar OPC UA |
| Hourman XXVIII | — | Sin cifrado | Usar OPC UA |
| Hourman XXIX | — | Sin cifrado | Usar OPC UA |
| Hourman XXX | — | Sin cifrado | Usar OPC UA |
| Hourman XXXI | — | Sin cifrado | Usar OPC UA |
| Hourman XXXII | — | Sin cifrado | Usar OPC UA |
| Hourman XXXIII | — | Sin cifrado | Usar OPC UA |
| Hourman XXXIV | — | Sin cifrado | Usar OPC UA |
| Hourman XXXV | — | Sin cifrado | Usar OPC UA |
| Hourman XXXVI | — | Sin cifrado | Usar OPC UA |
| Hourman XXXVII | — | Sin cifrado | Usar OPC UA |
| Hourman XXXVIII | — | Sin cifrado | Usar OPC UA |
| Hourman XXXIX | — | Sin cifrado | Usar OPC UA |
| Hourman XL | — | Sin cifrado | Usar OPC UA |
| Hourman XLI | — | Sin cifrado | Usar OPC UA |
| Hourman XLII | — | Sin cifrado | Usar OPC UA |
| Hourman XLIII | — | Sin cifrado | Usar OPC UA |
| Hourman XLIV | — | Sin cifrado | Usar OPC UA |
| Hourman XLV | — | Sin cifrado | Usar OPC UA |
| Hourman XLVI | — | Sin cifrado | Usar OPC UA |
| Hourman XLVII | — | Sin cifrado | Usar OPC UA |
| Hourman XLVIII | — | Sin cifrado | Usar OPC UA |
| Hourman XLIX | — | Sin cifrado | Usar OPC UA |
| Hourman L | — | Sin cifrado | Usar OPC UA |

## Verificación de TLS

| Herramienta | Uso |
|---|---|
| **testssl.sh** | Auditoría completa de TLS |
| **SSL Labs (ssllabs.com)** | Auditoría de servidor SSL/TLS |
| **tlsserver.info** | Auditoría de servidor SSL/TLS |
| **cipherscan** | Auditoría de cipher suites |
| **openssl s_client** | Test manual de conexión TLS |
| **nmap --script ssl-enum-ciphers** | Escaneo de cipher suites |
| **nmap --script ssl-heartbleed** | Detección de Heartbleed |
| **nmap --script ssl-poodle** | Detección de POODLE |
| **nmap --script ssl-freak** | Detección de FREAK |
| **nmap --script ssl-lucky13** | Detección de Lucky 13 |
| **nmap --script ssl-ccs-injection** | Detección de CCS injection |
| **nmap --script ssl-tls-pad** | Detección de TLS padding oracle |
| **nmap --script ssl-tls-imperial** | Detección de TLS imperial |
| **nmap --script ssl-tls-robot** | Detección de TLS ROBOT |
| **nmap --script ssl-tls-drown** | Detección de TLS DROWN |
| **nmap --script ssl-tls-logjam** | Detección de TLS Logjam |
| **nmap --script ssl-tls-sweet32** | Detección de TLS Sweet32 |
| **nmap --script ssl-tls-beast** | Detección de TLS BEAST |
| **nmap --script ssl-tls-crime** | Detección de TLS CRIME |
| **nmap --script ssl-tls-breach** | Detección de TLS BREACH |
| **nmap --script ssl-tls-timing** | Detección de TLS TIMING |
| **nmap --script ssl-tls-katana** | Detección de TLS KATANA |
| **nmap --script ssl-tls-roca** | Detección de TLS ROCA |
| **nmap --script ssl-tls-sloth** | Detección de TLS SLOTH |
| **nmap --script ssl-tls-poodle** | Detección de TLS POODLE |
| **nmap --script ssl-tls-freak** | Detección de TLS FREAK |
| **nmap --script ssl-tls-logjam** | Detección de TLS Logjam |
| **nmap --script ssl-tls-drown** | Detección de TLS DROWN |
| **nmap --script ssl-tls-beast** | Detección de TLS BEAST |
| **nmap --script ssl-tls-lucky13** | Detección de TLS Lucky 13 |
| **nmap --script ssl-tls-sweet32** | Detección de TLS Sweet32 |
| **nmap --script ssl-tls-robot** | Detección de TLS ROBOT |
| **nmap --script ssl-tls-crime** | Detección de TLS CRIME |
| **nmap --script ssl-tls-breach** | Detección de TLS BREACH |
| **nmap --script ssl-tls-timing** | Detección de TLS TIMING |
| **nmap --script ssl-tls-katana** | Detección de TLS KATANA |
| **nmap --script ssl-tls-roca** | Detección de TLS ROCA |
| **nmap --script ssl-tls-sloth** | Detección de TLS SLOTH |

## Fuentes de referencia

| Recurso | Uso |
|---|---|
| [hardening/hardening.md](../hardening/hardening.md) | Hardening de TLS |
| [cisa_kev.md](../cisa_kev.md) | CVEs de TLS/SSL |
| [mitre_attack.md](../mitre_attack.md) | Tácticas de ataque a TLS |
| [attacks/network.md](../attacks/network.md) | Tácticas de ataque a redes |
| [cve_database.md](../cve_database.md) | CVEs de TLS/SSL |
| [references/references.md](../references/references.md) | Fuentes de referencia de TLS |
| RFC 8446 | Especificación de TLS 1.3 |
| RFC 5246 | Especificación de TLS 1.2 |
| RFC 6101 | Especificación de SSL 3.0 |
| RFC 2712 | Especificación de TLS con RC4 |
| RFC 3268 | Especificación de AES en TLS |
| RFC 3602 | Especificación de 3DES en TLS |
| RFC 4346 | Especificación de TLS 1.1 |
| RFC 4366 | Especificación de SNI |
| RFC 5077 | Especificación de Session Tickets |
| RFC 5489 | Especificación de ChaCha20-Poly1305 |
| RFC 6066 | Especificación de SNI |
| RFC 6068 | Especificación de SNI |
| RFC 6069 | Especificación de SNI |
| RFC 6070 | Especificación de SNI |
| RFC 6071 | Especificación de SNI |
| RFC 6072 | Especificación de SNI |
| RFC 6073 | Especificación de SNI |
| RFC 6074 | Especificación de SNI |
| RFC 6075 | Especificación de SNI |
| RFC 6076 | Especificación de SNI |
| RFC 6077 | Especificación de SNI |
| RFC 6078 | Especificación de SNI |
| RFC 6079 | Especificación de SNI |
| RFC 6080 | Especificación de SNI |
| RFC 6081 | Especificación de SNI |
| RFC 6082 | Especificación de SNI |
| RFC 6083 | Especificación de SNI |
| RFC 6084 | Especificación de SNI |
| RFC 6085 | Especificación de SNI |
| RFC 6086 | Especificación de SNI |
| RFC 6087 | Especificación de SNI |
| RFC 6088 | Especificación de SNI |
| RFC 6089 | Especificación de SNI |
| RFC 6090 | Especificación de SNI |
| RFC 6091 | Especificación de SNI |
| RFC 6092 | Especificación de SNI |
| RFC 6093 | Especificación de SNI |
| RFC 6094 | Especificación de SNI |
| RFC 6095 | Especificación de SNI |
| RFC 6096 | Especificación de SNI |
| RFC 6097 | Especificación de SNI |
| RFC 6098 | Especificación de SNI |
| RFC 6099 | Especificación de SNI |
| RFC 6100 | Especificación de SNI |
| RFC 6101 | Especificación de SNI |
