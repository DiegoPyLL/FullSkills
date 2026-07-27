---
id: data/migrations
tipo: modelo
estabilidad: permanente
---

# Migraciones

Cómo cambiar un esquema en producción sin bloquearla y sin romper al código que todavía no se ha desplegado. Aplica el modelo d de [../SKILL.md](../SKILL.md): todo cambio convive con la versión anterior. El modelado y las restricciones que se migran están en [data/data.md](data.md).

## Gobierno de las migraciones

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Migraciones versionadas, en control de versiones, aplicadas siempre en el mismo orden | Sin orden garantizado, dos entornos pueden divergir en qué cambios tienen aplicados | Las migraciones se aplican a mano, en el orden que a cada persona le parece | El estado del esquema es reproducible a partir del histórico de migraciones, en cualquier entorno |
| Nunca editar una migración después de haberse aplicado en algún entorno compartido | Editarla rompe la reproducibilidad: un entorno la aplicó con el contenido viejo | Se corrige un error editando la migración ya fusionada en vez de añadir una nueva | El contenido de una migración aplicada es idéntico en el histórico y en todos los entornos que la aplicaron |
| Migración y despliegue de código son dos eventos separados, nunca simultáneos por definición | Si dependen el uno del otro, no hay forma de revertir uno sin el otro ni de tener margen de comprobación | El script de despliegue aplica la migración y despliega el código en el mismo paso atómico | Se puede aplicar la migración y verificar el esquema antes de que el código nuevo empiece a usarlo |

## Expandir → migrar → contraer

| Fase | Qué ocurre | Qué código convive con ella |
|---|---|---|
| Expandir | Se añade la columna, tabla o índice nuevo, siempre anulable o con valor por defecto | El código viejo, que no lo conoce, sigue funcionando sin cambios |
| Migrar (doble escritura) | El código empieza a escribir en el campo nuevo además del viejo | Código viejo y nuevo conviven; ambos ven datos consistentes |
| Relleno por lotes | Se rellena el campo nuevo para las filas existentes, en lotes pequeños y reanudables | El código sigue sirviendo tráfico sin bloqueo largo durante el relleno |
| Cambiar la lectura | El código empieza a leer del campo nuevo | El campo viejo sigue actualizado por si hay que revertir la lectura |
| Hacerlo obligatorio | Se añade la restricción `NOT NULL` u otra, ahora que todas las filas la cumplen | Ya no hay código que dependa de que el campo pueda faltar |
| Contraer | Se deja de escribir en el campo viejo y, más tarde, se elimina | Solo se llega aquí cuando ya no queda ningún desplegado que lo use |

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Cada fase en un despliegue distinto, nunca combinadas en uno | Combinarlas reintroduce el acoplamiento entre migración y despliegue que el patrón intenta evitar | Se añade la columna y se hace obligatoria en el mismo cambio | Cada fase se puede desplegar, observar y, si hace falta, revertir de forma independiente |
| Renombrar una columna es siempre añadir, copiar y eliminar; nunca un renombrado directo | Un renombrado directo rompe instantáneamente a cualquier código desplegado que use el nombre viejo | Se ejecuta `RENAME COLUMN` como cambio único en producción | El nombre viejo sigue existiendo y sirviendo mientras haya código desplegado que lo espere |
| Relleno por lotes, reanudable, con pausa entre lotes, sin bloqueo largo de tabla | Un `UPDATE` masivo de una sola vez bloquea la tabla y compite con el tráfico real | El relleno se hace con una sola sentencia sobre toda la tabla | El relleno puede pausarse y reanudarse sin perder progreso, y no degrada el tráfico en curso |

## Reversibilidad

| Práctica | Por qué | Cómo se viola | Cómo se verifica |
|---|---|---|---|
| Toda migración con un camino de vuelta probado antes de aplicarse en producción | Sin reversión probada, un problema post-despliegue no tiene salida rápida | El script de reversión existe pero nunca se ha ejecutado contra una copia real | La reversión se ha ejecutado con éxito contra un entorno con datos representativos |
| Tratar de forma distinta y con aprobación distinta las migraciones sin reversión posible (destructivas) | Una eliminación de columna o de tabla con datos no tiene vuelta atrás una vez ejecutada | Una migración destructiva se trata con el mismo proceso que una migración aditiva | Toda migración irreversible pasa por una aprobación explícita adicional antes de aplicarse |
| Backup previo o snapshot verificado antes de una migración destructiva | Es la única red de seguridad real cuando no hay reversión aplicativa | Se confía en que la migración "no debería" fallar | Existe una copia restaurable inmediatamente anterior a la migración destructiva |

## Regla de diseño ante un fallo parcial de migración

Toda migración de relleno por lotes debe responder, antes de ejecutarse: si el proceso muere a mitad de un lote, ¿el siguiente intento retoma desde donde quedó sin duplicar ni perder trabajo? Si la respuesta no es un "sí" verificado, la migración no está lista para producción — es la misma pregunta del modelo b de [../SKILL.md](../SKILL.md) aplicada a un proceso de un solo uso en vez de a una petición.
