---
id: attacks/reconnaissance_external
tipo: catalogo
estabilidad: permanente
tactica: TA0043
---

# Reconocimiento externo — técnicas adicionales

Técnicas de reconocimiento que **no están** en [discovery.md](discovery.md) pero que existen en MITRE ATT&CK Enterprise.

## Recolección de información pasiva

| Técnica | ATT&CK | Descripción | Detección | Reducción de exposición |
|---|---|---|---|---|
| Registros DNS y subdominios | T1590.002 | Enumerar subdominios mediante fuentes como crt.sh, DNS zone transfers, passive DNS | Consultas a registros de transparencia de certificados | Wildcard prudente, retirar registros huérfanos |
| Transparencia de certificados | T1596.003 | Consultar CT logs para descubrir nombres de dominio certificados | Monitorización propia de CT logs | Asumir público; usar certificados wildcard |
| Motores de búsqueda de dispositivos | T1596.005 | Buscar dispositivos expuestos en Shodan, Censys, ZoomEye | Monitorizar la propia huella en esos servicios | Gestión de superficie de ataque externa (ASM) |
| Recolección de identidades | T1589 | Nombres, correos, cargos, formato de usuario desde LinkedIn, directorios públicos | No detectable desde dentro | Minimizar información de contacto pública |
| Credenciales filtradas en brechas | T1589.001 | Contraseñas reutilizadas de volcados públicos | Monitorización de filtraciones (HaveIBeenPwned, etc.) | MFA, bloqueo de contraseñas comprometidas |
| Repositorios públicos y pastes | T1593 | Secretos, rutas internas, nombres de host en GitHub, Pastebin, forums | Escaneo continuo de GitHub y pastes | Escaneo de secretos, formación |
| Metadatos de documentos públicos | T1592 | Usuarios, rutas, software y versiones en documentos publicados | — | Limpiar metadatos antes de publicar |
| Información organizacional | T1591 | Estructura, proveedores, ubicaciones, tecnología usada | — | Prudencia en comunicación pública sobre tecnología |
| Buscar en sitios propios de la víctima | T1594 | Crawling de sitios web de la víctima para encontrar información sensible | — | Auditoría periódica de lo que es público |

## Reconocimiento activo

| Técnica | ATT&CK | Descripción | Detección | Reducción de exposición |
|---|---|---|---|---|
| Escaneo de puertos y servicios | T1595.001 | Escaneo de bloques IP para descubrir servicios | Logs de firewall, honeypots | Cerrar lo innecesario; superficie mínima |
| Escaneo de vulnerabilidades | T1595.002 | Versiones vulnerables detectadas mediante escáner | Firmas de escáner en logs web | Parcheo; ocultar banners no es defensa real |
| Wordlist scanning | T1595.003 | Probar nombres de directorio, archivos, parámetros con listas | Logs web con patrones de fuzzing | WAF, rate limiting |

## Cómo priorizar defensivamente

El reconocimiento externo es **indetectable desde dentro** de la red. La defensa es:

1. **Minimizar la superficie expuesta**: inventario de lo alcanzable desde Internet.
2. **Monitorizar la propia huella** en Shodan, CT logs, GitHub, pastes.
3. **Limpiar metadatos** de documentos públicos.
4. **Minimizar información de contacto pública** en LinkedIn y directorios.
