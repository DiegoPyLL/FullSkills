---
id: blockchain/blockchain
tipo: catalogo
estabilidad: permanente
---

# Seguridad Blockchain / Web3

Superficie de ataque de sistemas descentralizados: smart contracts, blockchains, DeFi, wallets y dApps. Los riesgos son distintos a los de TI tradicional porque las transacciones son inmutables y las pérdidas son irrecuperables.

## Premisa

> En Web3, **el código es la ley**. Un bug en un smart contract se convierte en una pérdida financiera irreversible. No hay "resetear contraseñas" ni "revertir transacciones" (a menos que el protocolo lo permita).

## Categorías de riesgo en Web3

### Smart Contracts

| Riesgo | Descripción | Ejemplo | Mitigación |
|---|---|---|
| **Reentrancy** | Contrato externo llama de vuelta antes de completar la operación | The DAO (2016) — $60M robados | Checks-Effects-Interactions; reentrancy guard |
| **Overflow/Underflow** | Operaciones aritméticas exceden el límite del tipo | Smart contracts sin SafeMath | Solidity ≥0.8.0 (overflow protegido) |
| **Timestamp dependence** | Depender de `block.timestamp` para lógica crítica | Juegos de apuestas basados en timestamps | No usar block.timestamp para decisiones críticas |
| **Front-running** | Minero/MEV bot observa transacción pendiente y la ejecuta antes | Sandwich attacks en DEXs | Use de oráculos verificables, commit-reveal |
| **Access control** | Falta de control de acceso en funciones críticas | Contratos con `onlyOwner` mal implementado | OpenZeppelin AccessControl; multi-sig |
| **Oracle manipulation** | Manipulación de precios de oráculos descentralizados | Beefy Finance hack — $120M | Oráculos de múltiples fuentes; TWAP |
| **Upgradeability** | Bugs en contratos proxy/upgradeables | Parity multisig hack — $31M | Patrones de proxy verificados; timelock |
| **Signature replay** | Firmas válidas reutilizadas en diferentes contextos | Firmas sin nonce/chainId | EIP-712 con nonce y chainId |
| **Delegatecall** | Llamadas delegate a contratos no verificados | Parity multisig hack — $31M | Validar la dirección de delegatecall |
| **Unchecked return values** | Ignorar el retorno de funciones críticas | Tokens que no verifican transfer | Siempre verificar retorno de funciones críticas |

### Wallets

| Riesgo | Descripción | Ejemplo | Mitigación |
|---|---|---|
| **Clave privada expuesta** | Clave privada almacenada o transmitida de forma insegura | Wallets con claves en texto plano | Hardware wallets; enclaves seguros |
| **Firma de transacciones maliciosas** | Usuario firma transacciones sin entender | Phishing de firma de transacciones | Mostrar contexto de la firma antes de firmar |
| **Approvals ilimitadas** | Tokens aprobados a contratos maliciosos | Aprobaciones excesivas a dApps | Revocar aprobaciones periódicamente |
| **Seed phrase comprometida** | Frase semilla almacenada de forma insegura | Seed phrase en la nube o fotos | Seed phrase offline; metal seed phrases |
| **Derivación de claves insegura** | Derivación de claves con entropía insuficiente | Wallets con generación de claves débil | Usar bibliotecas criptográficas verificadas |
| **Address reuse** | Reutilización de la misma dirección | Privacidad y análisis de blockchain | Usar direcciones únicas por transacción |

### DeFi (Finanzas Descentralizadas)

| Riesgo | Descripción | Ejemplo | Mitigación |
|---|---|---|
| **Flash loan attack** | Uso de préstamos flash para manipular oráculos | bZx hack — $8M | Oráculos de múltiples fuentes; TWAP |
| **Oracle manipulation** | Manipulación de precios de oráculos descentralizados | Beefy Finance hack — $120M | Oráculos de múltiples fuentes; TWAP |
| **Liquidity pool drain** | Drenado de pools de liquidez | Various — múltiples casos | Monitoreo de liquidity; circuit breakers |
| **Sybil attack** | Creación de múltiples identidades falsas | Airdrop farming; governance attacks | Sybil resistance; reputation systems |
| **Governance attack** | Toma de control del gobernanza del protocolo | Convex Finance — $20M | Timelocks; multi-sig; quorum requirements |
| **MEV (Maximal Extractable Value)** | Explotación del orden de transacciones | Sandwich attacks; front-running | MEV protection; commit-reveal schemes |
| **Sandwich attack** | Observar transacción pendiente y ejecutarse antes | Común en DEXs | Use de oráculos verificables; randomization |
| **Bridge exploit** | Explotación de puentes跨-chain | Ronin Bridge — $625M; Wormhole — $320M | Multi-sig; cryptographic verification |

### Infraestructura Web3

| Riesgo | Descripción | Mitigación |
|---|---|---|
| **Node compromise** | Compromiso de nodos de la red | Hardening de nodos; monitoreo |
| **RPC endpoint abuse** | Abuso de puntos de enlace RPC | Rate limiting; autenticación |
| **MEV extraction** | Extracción de valor máximo extraíble | MEV protection; commit-reveal schemes |
| **Smart contract verification** | Verificación incorrecta de contratos | Verificar bytecode; source verification |
| **Dependency supply chain** | Vulnerabilidades en dependencias de contratos | Auditoría de dependencias; versiones verificadas |
| **Development tool compromise** | Compromiso de herramientas de desarrollo | Verificar herramientas; sandboxes |
| **CI/CD pipeline compromise** | Compromiso del pipeline de integración continua | Hardening de CI/CD; autenticación |
| **Release signing** | Firma incorrecta de releases | Multi-sig; verificación de firmas |
| **Team anonymity** | Equipo anónimo sin accountability | Identidad verificada; KYC |
| **Liquidity lock** | Liquidez no bloqueada | Timelocks; multi-sig para liquidez |
| **Contract ownership** | Propiedad del contrato centralizada | Ownership renounced; multi-sig |
| **Admin key compromise** | Compromiso de la clave de admin | Multi-sig; cold storage para claves |
| **Multi-sig compromise** | Compromiso de multi-sig | Multi-sig con signers distribuidos |
| **Governance attack** | Toma de control de la gobernanza | Timelocks; multi-sig; quorum requirements |
| **Voting manipulation** | Manipulación de la votación | Verificación de identidad; sybil resistance |
| **Proposal manipulation** | Manipulación de propuestas | Verificar propuestas; audits |
| **Upgrade mechanism abuse** | Abuso de mecanismos de upgrade | Timelocks; multi-sig para upgrades |
| **Proxy vulnerability** | Vulnerabilidad en el patrón proxy | Verificar proxies; audits |
| **Storage layout** | Disposición incorrecta de almacenamiento | Layout correcto; documentado |
| **Code quality** | Calidad del código | Code quality; audits |
| **Static analysis** | Análisis estático | Static analysis; audits |
| **Dynamic analysis** | Análisis dinámico | Dynamic analysis; audits |
| **Fuzzing** | Fuzzing de contratos | Fuzzing; audits |
| **Formal verification** | Verificación formal | Formal verification; audits |
| **Penetration testing** | Pruebas de penetración | Penetration testing; audits |
| **Bug bounty** | Programa de bug bounty | Bug bounty; audits |
| **Incident response** | Respuesta a incidentes | Incident response; audits |
| **Monitoring** | Monitoreo de contratos | Monitoring; audits |

## Incidentes notables en Web3

| Incidente | Fecha | Pérdida | Mecanismo | Lección |
|---|---|---|
| **The DAO** | 2016 | $60M | Reentrancy | Auditoría de contratos |
| **Parity Multisig** | 2017 | $31M | Contract initialization bug | Auditoría de inicialización de contratos |
| **Ronin Bridge** | 2022 | $625M | Compromiso de 5/9 signers | Multi-sig con signers distribuidos |
| **Wormhole** | 2022 | $320M | Falta de verificación en bridge | Verificación cross-chain |
| **Poly Network** | 2021 | $611M | Vulnerabilidad en bridge | Auditoría de bridges cross-chain |
| **Bancor** | 2017 | $20M | Bug en el mecanismo de precio | Pruebas exhaustivas de mecanismos de precio |
| **Cream Finance** | 2021 | $18M | Oracle manipulation | Oráculos de múltiples fuentes |
| **Venus Protocol** | 2022 | $20M | Oracle manipulation | Oráculos de múltiples fuentes |
| **Harvest Finance** | 2020 | $33M | Flash loan attack | Mecanismos de protección contra flash loans |
| **Alchemix** | 2021 | $11M | Oracle manipulation | Oráculos de múltiples fuentes |
| **Terra/Luna** | 2022 | $40B+ | Collapse of algorithmic stablecoin | Due diligence de stablecoins algorítmicas |
| **FTX** | 2022 | $8B+ | Fraud; commingling funds | Due diligence de exchanges |

## Herramientas de seguridad Web3

| Herramienta | Uso |
|---|---|
| **Mythril** | Análisis estático y dinámico de smart contracts |
| **Slither** | Analyzer estático de Solidity |
| **Manticore** | Symbolic execution de smart contracts |
| **Echidna** | Fuzzer de smart contracts |
| **Solhint** | Linter de Solidity |
| **Oyente** | Análisis de vulnerabilidades en smart contracts |
| **Securify** | Verificación automática de vulnerabilidades |
| **DeFiLlama** | Tracking de protocolos DeFi y vulnerabilidades |
| **Rekt News** | Notificaciones de exploits DeFi |
| **ImmuneFi** | Programa de bug bounty para DeFi |
| **OpenZeppelin** | Bibliotecas seguras de smart contracts |
| **Consensys Diligence** | Auditoría de smart contracts |
| **Trail of Bits** | Auditoría de smart contracts |
| **Certik** | Auditoría de smart contracts |
| **Hacken** | Auditoría de smart contracts |
| **PeckShield** | Auditoría de smart contracts |
| **Quantstamp** | Auditoría de smart contracts |

## Fuentes de referencia

| Recurso | Uso |
|---|---|
| [owasp.md](../owasp.md) | OWASP Top 10 de seguridad web |
| [owasp_api.md](../owasp_api.md) | OWASP API Top 10 |
| [cve_database.md](../cve_database.md) | CVEs de smart contracts y DeFi |
| [cisa_kev.md](../cisa_kev.md) | CVEs de Web3 en explotación activa |
| [attacks/network.md](../attacks/network.md) | Tácticas de ataque a redes |
| [attacks/impact.md](../attacks/impact.md) | Técnicas de impacto |
| [mitre_attack.md](../mitre_attack.md) | Tácticas de ATT&CK |
| [references/references.md](../references/references.md) | Fuentes de referencia |
| Rekt.news | Notificaciones de exploits DeFi |
| DeFiLlama | Analytics de protocolos DeFi |
| OpenZeppelin | Bibliotecas de smart contracts |
