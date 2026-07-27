---
id: vpn/vpn
tipo: modelo
estabilidad: permanente
---

# VPN y acceso remoto

Los gateways de VPN son, de forma sostenida, **una de las principales puertas de entrada a redes corporativas**: están expuestos por diseño, concentran credenciales y sesiones, y su parcheo tiene impacto operativo.

## Por qué fallan

| Factor | Consecuencia |
|---|---|
| Portal web expuesto a Internet | Vulnerabilidades pre-autenticación con alcance masivo |
| Código heredado en los portales SSL-VPN | Recurrencia histórica de path traversal, desbordamientos e inyecciones |
| Guardan sesiones y credenciales en memoria o en disco | Una lectura de memoria equivale a robo de sesión (patrón CitrixBleed) |
| Parche que no invalida sesiones | Actualizar sin terminar sesiones deja al atacante dentro |
| Acceso de capa 3 a la red interna | Una vez dentro, el usuario remoto ve la red plana |
| MFA ausente o basado en factores débiles | Credenciales robadas bastan |
| Equipos en fin de soporte en producción | Sin corrección posible |

**Regla de respuesta ante un CVE de VPN**: parchear **y a continuación** invalidar todas las sesiones y rotar credenciales, secretos del dispositivo y certificados. El parche cierra la puerta; no expulsa a quien ya entró.

## Tipos y sus riesgos

| Tecnología | Riesgo característico | Control |
|---|---|---|
| SSL-VPN con portal web | Superficie web pre-autenticación; histórico de CVEs críticos | Parcheo prioritario; deshabilitar el portal si solo se usa el cliente |
| IPsec IKEv2 | Configuración con grupos débiles; PSK compartida | Certificados o EAP-TLS en vez de PSK; grupos DH modernos |
| IPsec con PSK de grupo (IKEv1 agresivo) | Hash de la PSK obtenible y crackeable offline | No usar modo agresivo; migrar a certificados |
| L2TP/PPTP | PPTP está criptográficamente roto | Retirar |
| WireGuard | Superficie muy pequeña; sin gestión de identidad integrada | Combinar con un plano de identidad y de política |
| OpenVPN | Sólido si se configura bien; TLS mal configurado lo degrada | Certificados de cliente, `tls-crypt`, cifrados modernos |
| ZTNA / acceso por aplicación | Sustituye el acceso de red por acceso por aplicación | Modelo objetivo; ver abajo |
| RDP directo expuesto | Vector recurrente de acceso inicial y ransomware | **Nunca exponer RDP a Internet** |
| Herramientas RMM como acceso remoto | Acceso privilegiado con superficie propia | Allow-list, MFA, segmentación |

## Configuración de referencia

| Área | Control |
|---|---|
| Autenticación | **MFA resistente a phishing** (FIDO2 o certificado de cliente). TOTP y push son vulnerables a AitM y a fatiga |
| Certificado de dispositivo | Exigirlo: liga el acceso al equipo gestionado, no solo al usuario |
| Postura del cliente | Comprobar parcheo, cifrado de disco y presencia del EDR antes de conceder acceso |
| Autorización | Por grupo y por aplicación; **nunca acceso completo a la red por defecto** |
| Split tunneling | Decidido conscientemente: sin él todo el tráfico pasa por la organización (más visibilidad, más carga); con él se pierde inspección del tráfico del usuario |
| Segmentación tras la VPN | El usuario remoto llega a una zona con las mismas restricciones que un usuario interno, o más |
| Sesiones | Vida limitada, reautenticación periódica, cierre por inactividad |
| Cuentas locales del dispositivo | Ninguna sin MFA; administración solo desde red interna |
| Interfaz de administración | Jamás expuesta a Internet |
| Registro | Reenvío a SIEM: autenticaciones, sesiones, cambios de configuración |
| Parcheo | Ciclo corto, con procedimiento que incluya la invalidación de sesiones |
| Fin de soporte | Plan de reemplazo antes de la fecha, no después |

## Detección

| Señal | Interpretación |
|---|---|
| Sesión activa sin evento de autenticación correspondiente | Sesión robada: indicador directo de explotación tipo CitrixBleed |
| Misma cuenta desde dos geografías incompatibles | Credencial compartida o robada |
| Autenticación desde ASN de VPS, proxy residencial o hosting | Origen anómalo para un empleado |
| Ráfaga de fallos de autenticación distribuidos por muchas cuentas | Password spraying contra el portal |
| Ráfaga de push denegados seguida de una aprobación | MFA fatigue |
| Cuenta que nunca usó VPN conectándose por primera vez | Novedad como señal |
| Conexión fuera del horario habitual del usuario | Correlacionar con otras señales |
| Cambios de configuración en el gateway | Persistencia del atacante |
| Cuenta local nueva en el dispositivo | Persistencia |
| Tráfico interno anómalo desde el rango de direcciones de VPN | Movimiento lateral del atacante remoto |
| Descarga masiva desde recursos internos por un usuario remoto | Exfiltración |

## Migración a ZTNA

La VPN tradicional concede **acceso a la red**; ZTNA concede **acceso a una aplicación concreta**, evaluando identidad, dispositivo y contexto en cada sesión.

| Aspecto | VPN clásica | ZTNA |
|---|---|---|
| Unidad de acceso | Red o subred | Aplicación |
| Confianza | Implícita tras autenticarse | Evaluada continuamente |
| Visibilidad del atacante | Ve toda la red alcanzable | Ve solo lo autorizado |
| Superficie expuesta | Gateway público | Conector saliente, sin puertos entrantes |
| Movimiento lateral | Posible desde el rango de VPN | Bloqueado por diseño |

Ruta realista de adopción: MFA resistente a phishing primero → segmentar lo que hay detrás de la VPN → publicar por ZTNA las aplicaciones web y de administración → reducir la VPN a los casos que requieren acceso de capa 3 → retirarla. Migrar todo de golpe no suele ser viable.

## Respuesta ante compromiso del gateway

1. **Asumir compromiso** si el dispositivo estuvo expuesto y sin parchear durante la ventana de explotación conocida, aunque no haya alerta.
2. Aislar o desconectar el acceso remoto mientras dure el análisis.
3. Parchear o reemplazar el dispositivo.
4. **Invalidar todas las sesiones activas** y revocar tokens.
5. Rotar: credenciales de usuarios, cuentas locales del dispositivo, secretos de configuración, certificados y claves precompartidas.
6. Revisar la configuración en busca de cambios: usuarios nuevos, rutas añadidas, políticas modificadas, túneles adicionales.
7. Analizar los logs desde la primera fecha de explotación conocida, no desde la fecha del parche.
8. Buscar la actividad posterior en la red interna: reconocimiento, autenticaciones anómalas, herramientas RMM instaladas.
9. Verificar la integridad del firmware; si hay indicios de implante, reemplazar el equipo.

Ver [playbooks/vpn.md](../playbooks/vpn.md).
