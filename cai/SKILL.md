---
name: cai
description: Guía operativa del framework CAI (Cybersecurity AI de Alias Robotics, paquete cai-framework) para orquestar agentes IA que resuelven retos CTF. Se invoca cuando hay que instalar, configurar o conducir CAI, elegir agente o modelo, usar los comandos del REPL, controlar coste y guardarraíles, o entender su arquitectura (agents, tools, handoffs, patterns, turns, tracing, guardrails, HITL) y cómo encajarlo en el flujo de un reto. No es conocimiento de ataque: para romper cripto, web, stego o pwn, ir a /security.
---

# Skill de CAI — enrutador y protocolo

Este archivo enruta y fija el protocolo. El conocimiento operativo vive en [operacion.md](operacion.md). No lo dupliques aquí.
Hermano de [../security/SKILL.md](../security/SKILL.md): CAI es herramienta, `/security` es el dominio.

## 1. Regla de oro: CAI es apoyo, no oráculo

El proyecto está **archivado** y el agente puede alucinar. Toda salida — flag, comando, identificador, writeup — la **verifica un humano** antes de enviarla o puntuar. Nunca enviar una flag sin comprobarla contra el reto. Nunca ejecutar un comando que no se entiende.

Regla dura: **nunca inventar** una clave de agente, una variable de entorno, un comando del REPL ni un número de versión. Si el dato no está en [operacion.md](operacion.md), decir que hay que confirmarlo en el REPL (`/help`, `/env`) o en el repositorio.

## 2. Protocolo de respuesta

1. **Clasificar la intención:**

| Modo | Pregunta típica | Forma de salida |
|---|---|---|
| `ENTENDER` | "¿Cómo funciona CAI?" | Los 8 pilares y el bucle ReAct, sin marketing. |
| `INSTALAR` | "¿Cómo lo dejo listo?" | venv + `pip install cai-framework` + `.env` mínimo. |
| `CONFIGURAR` | "¿Qué agente/modelo/variable uso?" | Clave concreta + por qué, desde las tablas de operación. |
| `CONDUCIR` | "Lánzalo contra este reto" | Flujo CTF: vars `CTF_*`, agente, comandos del REPL, verificación humana. |
| `CONTROLAR` | "¿Cómo limito gasto/riesgo?" | Guardarraíles: `CAI_PRICE_LIMIT`, `CAI_MAX_*`, `CAI_GUARDRAILS`, HITL. |

2. **Enrutar** a la sección de [operacion.md](operacion.md) y cargar solo lo necesario.
3. **Cerrar con acción concreta:** el comando o la variable exactos, y qué debe verificar el humano después.

## 3. Mapa de enrutamiento

Todo apunta a [operacion.md](operacion.md).

| Tema | Sección |
|---|---|
| Qué es, estado del proyecto, licencia | [Qué es y estado](operacion.md#qué-es-y-estado) |
| Arquitectura: agents, tools, handoffs, patterns, turns, tracing, guardrails, HITL | [Los 8 pilares](operacion.md#arquitectura-los-8-pilares) |
| Agentes registrados y `flag_discriminator` | [Agentes registrados](operacion.md#agentes-registrados) |
| Instalación y `.env`, variables `CTF_*`, contenedor | [Flujo para un reto CTF](operacion.md#flujo-para-un-reto-ctf) |
| Comandos del REPL | [Comandos del REPL](operacion.md#comandos-del-repl) |
| Coste, límites y guardarraíles | [Guardarraíles y coste](operacion.md#guardarraíles-y-coste) |
| Ética y límites de uso | [Límites y ética](operacion.md#límites-y-ética) |

## 4. Cruces con otros skills

| Tema | Aquí | El otro lado |
|---|---|---|
| Riesgo de agentes IA (confused deputy, inyección indirecta, tool poisoning) | Cómo conducir CAI con seguridad | [../security/ai/agents_mcp.md](../security/ai/agents_mcp.md) |
| Resolver el reto en sí (cripto, web, stego, reversing, pwn, forense) | — | [../security/SKILL.md](../security/SKILL.md) |

## 5. Límites

- Solo contra los objetivos del CTF autorizado; CAI ejecuta comandos reales.
- Las versiones, claves de agente y comandos caducan: el proyecto está archivado. Reconfirmar en el REPL antes de la competición.
- Este skill no sustituye el conocimiento de ataque: CAI es el conductor, `/security` el mapa.
