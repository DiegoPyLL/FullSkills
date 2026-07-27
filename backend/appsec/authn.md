---
id: appsec/authn
tipo: modelo
estabilidad: permanente
consulta_externa: Las recomendaciones de algoritmo y de parámetros de coste se revisan con el tiempo según el hardware disponible para un atacante; verificar la guía vigente (p. ej. OWASP Password Storage Cheat Sheet) antes de fijar un parámetro concreto en producción
---

# Autenticación: contraseñas, sesiones y tokens

Cómo se rompe una mala implementación de esto (fuerza bruta, relleno de credenciales, robo de sesión) está en [../security/](../../security/); aquí solo qué construir. La autorización sobre el recurso ya autenticado está en [appsec/appsec.md](appsec.md).

## Contraseñas: hasheo y almacenamiento

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Hasheo con función lenta y factor de coste ajustable: Argon2id de preferencia, scrypt o bcrypt como alternativa, PBKDF2 solo si lo exige el cumplimiento | Una función de hash rápida (pensada para integridad, no para contraseñas) permite probar miles de millones de combinaciones por segundo si la base se filtra | La contraseña se hashea con una función de propósito general como SHA-256 sin factor de coste | La función usada para almacenar contraseñas es deliberadamente lenta y tiene un parámetro de coste ajustable |
| Nunca cifrado reversible ni texto plano para la contraseña | Un cifrado reversible implica que existe una clave capaz de recuperar la contraseña original | La contraseña se guarda cifrada con una clave que el sistema puede usar para descifrarla | No existe ningún mecanismo en el sistema capaz de recuperar la contraseña original a partir de lo almacenado |
| Sal única por contraseña, de generador criptográficamente seguro, almacenada junto al hash | La sal impide que un atacante precompute tablas de hashes válidas para muchas cuentas a la vez | Todas las contraseñas se hashean con la misma sal global, o sin sal | Dos usuarios con la misma contraseña tienen hashes almacenados distintos |
| Pimienta opcional: secreto del servidor, fuera de la base de datos, aplicado a todos los hasheos | Añade una capa que sobrevive a la filtración de la base de datos por sí sola | El único secreto que protege las contraseñas está en la misma base que se podría filtrar | Filtrar solo la base de datos, sin el secreto del servidor, no es suficiente para atacar los hashes |
| Factor de coste calibrado al hardware actual, revisado con el tiempo, con rehasheo transparente al iniciar sesión | El hardware de ataque mejora con los años; un factor de coste fijado hace una década ya no protege igual | El factor de coste se fijó al lanzar el sistema y nunca se ha revisado | Existe un mecanismo que rehashea con el factor de coste vigente en el siguiente inicio de sesión correcto |
| Comparación en tiempo constante para todo lo que sea secreto | Una comparación que corta en el primer carácter distinto filtra información por temporización | El hash o el token se compara con una comparación de cadenas estándar que corta en la primera diferencia | El tiempo de comparación no varía de forma medible según cuántos caracteres iniciales coinciden |
| Longitud mínima generosa y máxima alta, sin reglas de composición absurdas; contraste contra listas de contraseñas filtradas | Las reglas de composición forzada empujan a patrones predecibles; las contraseñas ya filtradas son las primeras que se prueban | Se exige una combinación arbitraria de mayúsculas, símbolos y números, pero se admite "Contraseña1!" sin comprobar si está filtrada | Una contraseña presente en listas conocidas de filtraciones se rechaza al registrarse o cambiarla |

## Restablecimiento y protección de la cuenta

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Token de restablecimiento de un solo uso, aleatorio, de vida corta, almacenado hasheado | Un token reutilizable o de vida larga amplía la ventana de ataque si se filtra | El token de restablecimiento sigue siendo válido después de usarse, o no caduca | El token deja de ser válido tras su primer uso y tras un tiempo corto desde su emisión |
| Invalidar todas las sesiones activas al cambiar la contraseña | Si una sesión ya estaba comprometida, cambiar la contraseña sin cerrarla no protege nada | Cambiar la contraseña no afecta a las sesiones ya abiertas en otros dispositivos | Tras cambiar la contraseña, cualquier sesión previa deja de ser válida |
| Respuesta y tiempo uniformes en inicio de sesión y en restablecimiento, exista o no la cuenta | Una respuesta distinta según exista la cuenta permite enumerar usuarios registrados | El sistema responde "usuario no encontrado" solo cuando la cuenta no existe | La respuesta y el tiempo de respuesta no revelan si una cuenta concreta existe en el sistema |
| Limitación de intentos por cuenta y por origen, con retroceso creciente | Sin límite, una cuenta o un origen puede probar credenciales sin restricción | No hay ningún límite al número de intentos de inicio de sesión fallidos | El número de intentos fallidos permitidos en un periodo está acotado, con coste creciente por origen y por cuenta |
| La contraseña nunca se registra, nunca se devuelve en una respuesta, nunca se envía por correo | Cualquiera de estos canales retiene la contraseña en texto plano en un sistema que no debería tenerla | Un registro de depuración incluye el cuerpo completo de la petición de inicio de sesión | Ningún registro, respuesta ni notificación contiene la contraseña en texto plano |

## Sesiones y credenciales de acceso

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Elegir con estado (revocable) o autocontenido (escala) sabiendo que el intercambio real es revocación frente a escala | Un token autocontenido no se puede invalidar antes de su caducidad sin infraestructura adicional | Se elige un token autocontenido de larga duración asumiendo que se puede revocar como una sesión con estado | El mecanismo de revocación elegido corresponde a lo que el tipo de credencial realmente permite |
| Identificador de sesión con entropía suficiente, regenerado al elevar privilegio | Un identificador predecible o reutilizado tras elevar privilegio facilita la fijación de sesión | El identificador de sesión no cambia al iniciar sesión sobre una sesión anónima previa | El identificador de sesión se regenera en cada cambio de nivel de privilegio, incluido el inicio de sesión |
| Vida corta más credencial de renovación, con rotación y detección de reutilización | Limita la ventana de uso de una credencial robada sin forzar reautenticación constante | La credencial de acceso tiene una vida larga y la de renovación nunca rota | Usar una credencial de renovación ya usada anteriormente invalida toda la cadena de sesión asociada |
| Si el token es autocontenido: validar firma, algoritmo, emisor, audiencia y caducidad, sin excepción | Aceptar cualquiera de estos sin validar abre una vía de falsificación | El algoritmo de verificación se toma del propio token en vez de estar fijado por el verificador | El verificador rechaza un token que declare un algoritmo distinto al que el verificador tiene configurado |
| Cierre de sesión que invalida de verdad en el servidor | Un cierre de sesión que solo borra la cookie del cliente deja el token válido si alguien lo capturó antes | El cierre de sesión solo elimina la credencial del lado del cliente | Un token capturado antes del cierre de sesión deja de ser válido después de cerrarla |

## Verificación mínima antes de aceptar credenciales de usuario

1. La función de hasheo es lenta, con sal única por credencial y factor de coste revisable.
2. Ningún camino del sistema puede recuperar la contraseña original.
3. El restablecimiento usa un token de un solo uso, de vida corta, y cierra las sesiones existentes.
4. La respuesta ante intento fallido no distingue si la cuenta existe.
5. Existe límite de intentos con retroceso creciente, por cuenta y por origen.
6. Si hay tokens autocontenidos, el verificador fija el algoritmo esperado y nunca lo toma del propio token.
