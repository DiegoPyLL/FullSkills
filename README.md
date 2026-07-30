# FullSkills

Bases de conocimiento propias, escritas como **skills** para Claude Code y agentes compatibles. Cada carpeta de primer nivel con un `SKILL.md` es una skill invocable.

| Skill | Enrutador | Dominio |
|---|---|---|
| `/indice` | [indice/SKILL.md](indice/SKILL.md) | Enrutador maestro entre skills + inventario del repositorio |
| `/security` | [security/SKILL.md](security/SKILL.md) | Ciberseguridad ofensiva, defensiva, forense, IR, cloud, IA |
| `/backend` | [backend/SKILL.md](backend/SKILL.md) | Diseño de APIs, datos, fiabilidad, rendimiento, entrega |
| `/seo` | [seo/SKILL.md](seo/SKILL.md) | Auditoría de SEO técnico |

`ai/`, `cloud/` y `frontend UX-UI/` están reservadas y todavía vacías: sin `SKILL.md`, no se descubren como skill.

## Despliegue

El contenido de este repositorio se coloca **suelto dentro del `.claude/skills/` del proyecto anfitrión**, de modo que cada carpeta quede en `.claude/skills/<nombre>/SKILL.md`, que es donde Claude Code descubre las skills.

```
proyecto-anfitrion/
└── .claude/skills/
    ├── indice/SKILL.md
    ├── security/SKILL.md
    ├── backend/SKILL.md
    └── seo/SKILL.md
```

Condiciones para que una carpeta se descubra: `SKILL.md` en su primer nivel, cabecera con `name` y `description`, y nombre de carpeta idéntico al `name` (minúsculas, dígitos y guiones). Un `SKILL.md` en la raíz de este repositorio **no** se descubriría — por eso el índice vive en `indice/`.

### Como submódulo

Si el proyecto anfitrión agrega este repositorio como submódulo de Git en lugar de copiar el contenido:

```
git submodule add https://github.com/DiegoPyLL/FullSkills.git .claude/skills
```

Para traer los cambios más recientes del submódulo:

```
git submodule update --remote --merge .claude/skills
```

Al clonar el proyecto anfitrión por primera vez, o si el submódulo aparece vacío:

```
git submodule update --init --recursive
```

## Mantenimiento

```
node indice/scripts/indexar.mjs           # regenera indice/INDICE.md
node indice/scripts/indexar.mjs --check   # falla si está desfasado, hay enlaces rotos
                                          # o alguna skill no se descubriría
```

[indice/INDICE.md](indice/INDICE.md) es el inventario generado de todos los documentos: título, tipo, estabilidad y temas de cada uno, más una sección de salud con enlaces rotos y módulos huérfanos. No se edita a mano.

## Convenciones

- Cada módulo lleva cabecera YAML con `id`, `tipo` y `estabilidad` (`permanente` o `volatil`; los volátiles añaden `consulta_externa` y `snapshot`).
- El conocimiento vive en un solo lugar; el resto enlaza. Sin introducciones ni repetición entre módulos.
- Los `SKILL.md` enrutan y definen el protocolo de razonamiento; no contienen conocimiento de dominio.
