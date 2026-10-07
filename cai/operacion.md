---
id: cai/operacion
tipo: operacion
estabilidad: volatil
consulta_externa: https://github.com/aliasrobotics/cai
---

# CAI (Cybersecurity AI) — operación en CTF

Snapshot: 2026-10-07. Verificado contra el árbol de fuentes de `aliasrobotics/cai`. El proyecto está **archivado**: las versiones, claves de agente y comandos de abajo pueden haber cambiado respecto a la copia instalada. Confirmar con `/help` y `/env` dentro del REPL antes de depender de un dato.

## Qué es y estado

CAI es un framework de orquestación de **agentes IA** para tareas ofensivas, defensivas y forenses. Paquete PyPI `cai-framework`.

| Dato | Valor |
|---|---|
| Repositorio | `github.com/aliasrobotics/cai` (archivado, read-only) |
| Versión Pro | `1.1.5` |
| Versión pública (PyPI) | `0.5.10` |
| Licencia | MIT (componentes de `openai-agents-python`) + propietaria (uso de investigación) |
| Sucesor comercial | CSI (Cybersecurity Superintelligence) |
| API subyacente | Chat Completions — **stateless** entre llamadas |
| Enrutado de modelos | LiteLLM (300+ modelos: OpenAI, Anthropic, DeepSeek, Mistral, Ollama local, etc.) |

Al estar archivado no recibe parches. Úsalo como **apoyo**, no como oráculo: la flag y el writeup los valida un humano.

## Arquitectura: los 8 pilares

| Pilar | Qué es |
|---|---|
| `Agent` | LLM con capacidad de actuar. Implementa el bucle **ReAct**: razonar (inferencia) → actuar (tool). |
| `Tools` | Interfaces para ejecutar acciones. Agrupadas por kill chain: reconocimiento, explotación, escalada, movimiento lateral, exfiltración, C2. |
| `Handoffs` | Transferencia de una tarea de un agente a otro (`H: A × T → A`). |
| `Patterns` | Marco de coordinación: `Swarm`, `Hierarchical`, `Chain-of-Thought`, `Auction-Based`, `Recursive`, `Parallelization`. |
| `Turns` | Un *turn* = ciclo de una o más *interactions*; termina cuando el agente devuelve `None`. Una *interaction* = una inferencia + una acción. |
| `Tracing` | Observabilidad vía OpenTelemetry (`CAI_TRACING`). |
| `Guardrails` | Defensa frente a prompt injection (modelo de cuatro capas). `CAI_GUARDRAILS`. |
| `HITL` | Human-in-the-loop: puntos de intervención humana sobre los turns. |

El riesgo conceptual de los agentes (confused deputy, inyección indirecta, tool poisoning) está en [../security/ai/agents_mcp.md](../security/ai/agents_mcp.md); aquí solo la operación.

## Agentes registrados

Clave de `CAI_AGENT_TYPE` → uso:

| Clave | Uso |
|---|---|
| `orchestration_agent` | **Default** del CLI. Reparte en amplitud y lanza especialistas vía tools. |
| `selection_agent` | Router más ligero: solo handoffs. |
| `redteam_agent` | Ofensiva: reconocimiento, explotación, post-explotación. |
| `blueteam_agent` | Defensa: detección, hardening. |
| `bug_bounter_agent` | Descubrimiento de vulnerabilidades y reporte. |
| `compliance_agent` | Cumplimiento. |
| `continuous_ops_agent` | Operación continua. |
| `one_tool_agent` | Agente mínimo de una sola herramienta. |
| `meta_agent` | Meta/depuración. |

Para CTF existe además `flag_discriminator`, un agente que extrae la flag de la salida y decide si hay que seguir investigando.

## Flujo para un reto CTF

```bash
# 1. Entorno aislado (Python 3.12 recomendado)
python3.12 -m venv cai_env && source cai_env/bin/activate
pip install cai-framework

# 2. Arranque del REPL (primer inicio ~30 s)
cai
```

`.env` mínimo en el directorio de trabajo:

```bash
CAI_MODEL="claude-sonnet-4.5"        # o gpt-4o, deepseek-reasoner, ollama/qwen2.5:72b
ANTHROPIC_API_KEY="sk-ant-..."       # o OPENAI_API_KEY / DEEPSEEK_API_KEY / OLLAMA
CAI_AGENT_TYPE="orchestration_agent" # agente por defecto al arrancar
CAI_PRICE_LIMIT="1"                  # tope de gasto en USD (ver guardarraíles)
```

Variables específicas de CTF (contenedorizado):

| Variable | Para qué |
|---|---|
| `CTF_NAME` | Nombre del reto a cargar (p. ej. `picoctf_static_flag`). |
| `CTF_CHALLENGE` | Sub-reto concreto dentro del CTF. |
| `CTF_SUBNET` | Subred del contenedor del reto. |
| `CTF_IP` | IP del contenedor del reto. |
| `CTF_INSIDE` | `true` = el agente opera **dentro** del contenedor. |
| `CAI_ACTIVE_CONTAINER` | ID de contenedor Docker donde ejecutar los comandos. Se autoajusta al arrancar un reto. |
| `CAI_STATE` | `true` = agente de estado que rastrea red y flags halladas. |

## Comandos del REPL

| Comando | Función |
|---|---|
| `/agent` | Seleccionar o cambiar el agente activo. |
| `/model` | Elegir modelo/proveedor en caliente. |
| `/config`, `/settings`, `/env` | Ver/ajustar configuración y variables de entorno vivas. |
| `/history` | Historial de la conversación. |
| `/compact` | Comprimir el estado de memoria (resumen). |
| `/graph` | Visualizar el grafo de razonamiento del agente. |
| `/memory` | Inspeccionar estado interno. |
| `/parallel` | Ejecutar instancias en paralelo. |
| `/cost` | Gasto acumulado de la sesión. |
| `/workspace`, `/shell` | Directorio de trabajo y comandos de shell. |
| `/mcp` | Servidores MCP conectados. |
| `/help` (`/h`) | Ayuda y tablas de referencia (incluye `/help var VARIABLE`). |
| `/exit` | Salir. |

Descubrir variables sin salir: `/env list` (valores vivos) y `/help var CAI_MODEL` (ayuda larga de una variable).

## Guardarraíles y coste

| Variable | Efecto |
|---|---|
| `CAI_PRICE_LIMIT` | Tope de gasto en USD; superado, solo se permiten comandos CLI. |
| `CAI_MAX_TURNS` | Máximo de turns por interacción de agente. |
| `CAI_MAX_INTERACTIONS` | Máximo de interacciones (tool calls, acciones) por sesión. |
| `CAI_GUARDRAILS` | `true` = aplica validación de entradas/salidas (anti prompt injection). |
| `CAI_TRACING` | `true` = traza el flujo con OpenTelemetry. |
| `CAI_TOOL_TIMEOUT` / `CAI_IDLE_TIMEOUT` | Límites de tiempo por comando y de inactividad (útil con nmap y escaneos largos). |

HITL es el control real: el agente propone, el humano aprueba. En competición, **nunca envíes una flag sin verificarla** ni ejecutes un comando que no entiendas.

## Límites y ética

- Usar **solo** contra los objetivos del CTF autorizado. CAI puede ejecutar comandos reales contra la red que le indiques.
- No tratar la salida del agente como verdad: puede alucinar un comando, una flag o un identificador. Cotejar siempre.
- Las afirmaciones de versión y de estado del proyecto caducan: reconfirmar antes de operar en la competición.
