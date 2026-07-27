---
id: references/references
tipo: referencia
estabilidad: volatil
consulta_externa: Las URL y los nombres de producto cambian; verificar antes de citar en un entregable
---

# Fuentes externas

Dónde verificar lo que este skill marca como `volatil`, y dónde ampliar. Uso: **consultar la fuente autoritativa antes de afirmar un dato operativo**, nunca citar de memoria.

## Vulnerabilidades

| Fuente | Qué aporta | Cuándo consultarla |
|---|---|---|
| NVD (nvd.nist.gov) | CVE, CVSS, CWE, referencias | Datos base de un CVE |
| CVE Program (cve.org) | Registro autoritativo del identificador | Confirmar que el CVE existe |
| **CISA KEV** | Explotación confirmada en el mundo real | **Siempre, antes de priorizar** |
| **EPSS (FIRST)** | Probabilidad de explotación a 30 días | Priorización; cambia a diario |
| Aviso del fabricante | **Versiones afectadas y corregidas** | Fuente autoritativa: NVD suele ir por detrás |
| OSV / GitHub Advisory | Vulnerabilidades de dependencias por ecosistema | SCA y SBOM |
| Exploit-DB, Metasploit | Disponibilidad de exploit público | Evaluar explotabilidad real |
| CERT nacionales y sectoriales | Avisos con contexto local | Alertas dirigidas al propio país o sector |

## Taxonomías y marcos

| Fuente | Contenido |
|---|---|
| MITRE ATT&CK | Técnicas del adversario, grupos, software, mitigaciones, fuentes de datos |
| MITRE D3FEND | Contramedidas y ontología de artefactos digitales |
| MITRE CWE | Clases de debilidad; Top 25 anual |
| MITRE CAPEC | Patrones de ataque |
| MITRE ATLAS | Tácticas y técnicas contra sistemas de IA |
| MITRE Engage | Marco de deception y engagement |
| NIST CSRC | CSF, SP 800-53, 800-61, 800-207, 800-218, FIPS |
| CIS | Benchmarks y Controls |
| ISO/IEC | 27001, 27002, 42001 |
| OWASP | Top 10, ASVS, WSTG, MASVS/MASTG, API Top 10, LLM Top 10, Cheat Sheets |
| FIRST | EPSS, CVSS, guías de CSIRT |
| CMU/SEI | SSVC, guías de respuesta |

## Detección y reglas

| Fuente | Contenido |
|---|---|
| SigmaHQ | Reglas Sigma de la comunidad |
| Sigma specification | Sintaxis y modificadores |
| Elastic detection rules | Reglas abiertas de alta calidad |
| Sysmon y su documentación | Configuración de la telemetría base de Windows |
| Configuraciones curadas de Sysmon (SwiftOnSecurity, Olaf) | Puntos de partida probados |
| Atomic Red Team | Pruebas de técnicas para validar detecciones |
| MITRE Caldera | Emulación de adversario |
| LOLBAS | Binarios legítimos de Windows abusables |
| GTFOBins | Binarios de Unix abusables |
| LOLDrivers | Drivers vulnerables usados en BYOVD |
| WADComs | Herramientas para entornos Windows y AD |
| Emerging Threats | Reglas Suricata y Snort |
| YARA-Rules y repositorios de investigadores | Reglas YARA de referencia |

## Inteligencia de amenazas

| Fuente | Uso |
|---|---|
| CISA (alertas y advisories) | Campañas activas con IOCs y mitigaciones |
| MISP | Plataforma e intercambio comunitario |
| ISAC sectoriales | Inteligencia relevante para el propio sector |
| Blogs de investigación de proveedores | Análisis técnico de campañas y malware |
| Ransomwatch y seguimiento de sitios de filtración | Actividad de grupos de extorsión |
| Have I Been Pwned | Exposición de credenciales |
| Shodan, Censys | Superficie externa propia y ajena |
| crt.sh y logs de transparencia de certificados | Descubrimiento de subdominios propios |
| VirusTotal, MalwareBazaar, Hybrid Analysis | Análisis de muestras — **nunca subir muestras sensibles** |
| Tria.ge, ANY.RUN | Sandbox interactiva |

## Herramientas de análisis

| Categoría | Herramientas de referencia |
|---|---|
| Forense de disco | Autopsy, The Sleuth Kit, plaso/log2timeline |
| Forense de memoria | Volatility, MemProcFS; AVML y LiME para captura en Linux |
| Recolección en vivo | KAPE, Velociraptor, UAC |
| Análisis de red | Wireshark, Zeek, Suricata, Arkime |
| Análisis de malware | Ghidra, IDA, x64dbg, PE-bear, CAPA, FLOSS, dnSpy |
| Análisis de AD | BloodHound, PingCastle, PurpleKnight, ADeleg |
| Cloud | ScoutSuite, Prowler, CloudSploit, Cartography, Stormspotter |
| Contenedores | Trivy, Grype, kube-bench, kube-hunter, Falco, Kubescape |
| Aplicación | Burp Suite, ZAP, Semgrep, CodeQL, nuclei |
| Secretos | gitleaks, trufflehog, detect-secrets |
| SBOM | Syft, CycloneDX, SPDX, Dependency-Track |
| Firma y procedencia | Sigstore/cosign, in-toto, SLSA |

## Formación y validación

| Recurso | Uso |
|---|---|
| Atomic Red Team | Validar detecciones técnica a técnica |
| DetectionLab, GOAD, AD lab kits | Laboratorio de práctica en AD |
| CyberDefenders, LetsDefend, Blue Team Labs | Ejercicios defensivos |
| HackTheBox, TryHackMe, PortSwigger Web Security Academy | Práctica ofensiva y web |
| Rangeforce, purple team exercises | Validación conjunta |
| Malware Traffic Analysis, DFIR datasets públicos | Casos reales para análisis |

## Cómo citar en un entregable

1. Verificar el dato en la fuente autoritativa el mismo día que se escribe el informe.
2. Indicar **fecha de consulta** para todo lo volátil: CVSS, EPSS, KEV, versiones parcheadas, atribución.
3. Distinguir entre lo que dice el fabricante, lo que dice un investigador y lo que se ha observado directamente.
4. Nunca citar un identificador (CVE, CWE, CAPEC, técnica de ATT&CK) sin haberlo verificado: un identificador erróneo invalida la credibilidad del documento completo.
5. Marcar el nivel de confianza cuando la fuente sea única o el análisis sea indirecto.
