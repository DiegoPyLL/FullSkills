#!/usr/bin/env node
// Generador del índice global del repositorio (skill `indice`).
//
//   node indice/scripts/indexar.mjs           -> reescribe indice/INDICE.md
//   node indice/scripts/indexar.mjs --check   -> no escribe; sale 1 si INDICE.md está
//                                                desactualizado o si hay enlaces rotos
//
// Sin dependencias. Solo lee ficheros .md del repositorio.
//
// El repositorio se despliega con su contenido suelto dentro del `.claude/skills/` del
// proyecto anfitrión: cada carpeta de primer nivel con SKILL.md es una skill invocable.
// De ahí que el índice viva en `indice/` y no en la raíz — un SKILL.md en la raíz
// quedaría en `.claude/skills/SKILL.md`, que no se descubre.

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SALIDA = join(ROOT, 'indice', 'INDICE.md');
const SALIDA_RUTA = 'indice/INDICE.md';
const IGNORAR = new Set(['.git', '.claude', 'node_modules', 'scripts']);
const CHECK = process.argv.includes('--check');

// Nombre legible de cada dominio de primer nivel. Los que no estén aquí se
// listan igual, con el nombre de la carpeta como título.
const DOMINIOS = {
  '.': 'Raíz',
  indice: 'Índice',
  security: 'Ciberseguridad',
  backend: 'Backend',
  seo: 'SEO',
  attacks: 'Ataques (fuera de security/)',
  ai: 'IA',
  cloud: 'Cloud',
  'frontend UX-UI': 'Frontend UX-UI',
};

// ---------------------------------------------------------------- recorrido

function listarMarkdown(dir = ROOT) {
  const salida = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(entrada.name)) continue;
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) salida.push(...listarMarkdown(ruta));
    else if (entrada.name.toLowerCase().endsWith('.md')) salida.push(ruta);
  }
  return salida;
}

const aPosix = (ruta) => relative(ROOT, ruta).split(sep).join(posix.sep);

// ---------------------------------------------------------------- parseo

function parsear(rutaAbs) {
  const texto = readFileSync(rutaAbs, 'utf8');
  const ruta = aPosix(rutaAbs);
  const meta = {};

  // Cabecera YAML: `clave: valor` de primer nivel más bloques `|` / `>`, que es
  // todo lo que usan los módulos de este repositorio. El bloque se aplana a una
  // sola línea separada por ` · `.
  const cabecera = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (cabecera) {
    const lineas = cabecera[1].split(/\r?\n/);
    for (let i = 0; i < lineas.length; i++) {
      const par = lineas[i].match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
      if (!par) continue;
      const [, clave, valor] = par;
      if (valor === '|' || valor === '>' || valor === '|-' || valor === '>-') {
        const bloque = [];
        while (i + 1 < lineas.length && /^\s+\S/.test(lineas[i + 1])) bloque.push(lineas[++i].trim());
        meta[clave] = bloque.join(' · ');
      } else {
        meta[clave] = valor.trim().replace(/^["']|["']$/g, '');
      }
    }
  }

  const cuerpo = cabecera ? texto.slice(cabecera[0].length) : texto;
  const sinCodigo = cuerpo.replace(/```[\s\S]*?```/g, '');

  const h1 = sinCodigo.match(/^#\s+(.+)$/m)?.[1].trim() ?? null;
  const h2 = [...sinCodigo.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());

  // Enlaces relativos a otros ficheros del repo (se ignoran http(s), mailto y anclas puras).
  const enlaces = [...sinCodigo.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)]
    .map((m) => m[1])
    .filter((d) => !/^(https?:|mailto:|#)/.test(d));

  return {
    ruta,
    dominio: ruta.includes('/') ? ruta.slice(0, ruta.indexOf('/')) : '.',
    esRouter: /(^|\/)SKILL\.md$/.test(ruta),
    esReadme: /(^|\/)README\.md$/i.test(ruta),
    meta,
    h1,
    h2,
    enlaces,
    lineas: texto.split(/\r?\n/).length,
    bytes: Buffer.byteLength(texto),
  };
}

// ---------------------------------------------------------------- validación

function enlacesRotos(docs) {
  const rotos = [];
  for (const doc of docs) {
    const base = dirname(join(ROOT, doc.ruta));
    for (const enlace of doc.enlaces) {
      const destino = decodeURIComponent(enlace.split('#')[0]);
      if (!destino) continue;
      const abs = resolve(base, destino);
      if (existsSync(abs)) continue;
      // Un enlace a `carpeta/` vale si la carpeta existe o si tiene README.
      if (existsSync(join(abs, 'README.md'))) continue;
      rotos.push({ desde: doc.ruta, hacia: enlace });
    }
  }
  return rotos;
}

function huerfanos(docs) {
  const enlazados = new Set();
  for (const doc of docs) {
    const base = dirname(join(ROOT, doc.ruta));
    for (const enlace of doc.enlaces) {
      const destino = decodeURIComponent(enlace.split('#')[0]);
      if (!destino) continue;
      const abs = resolve(base, destino);
      if (existsSync(abs) && statSync(abs).isFile()) enlazados.add(aPosix(abs));
    }
  }
  return docs
    .filter((d) => !enlazados.has(d.ruta) && !d.esRouter && !d.esReadme && d.dominio !== '.')
    .map((d) => d.ruta);
}

// ---------------------------------------------------------------- render

// El índice vive en `indice/`, así que todo enlace a un documento de fuera sube un nivel.
const enlaceDesdeIndice = (ruta) =>
  (ruta.startsWith('indice/') ? ruta.slice('indice/'.length) : `../${ruta}`)
    .split('/')
    .map(encodeURIComponent)
    .join('/');

const escapar = (t) => String(t).replace(/\|/g, '\\|');

function resumenTemas(doc, limite = 150) {
  const temas = doc.h2.join(' · ');
  if (!temas) return '—';
  return temas.length > limite ? `${temas.slice(0, limite - 1).trimEnd()}…` : temas;
}

function render(docs, rotos, sueltos, routers) {
  const fecha = new Date().toISOString().slice(0, 10);
  const out = [];

  out.push('<!-- Generado por indice/scripts/indexar.mjs. No editar a mano: los cambios se pierden. -->');
  out.push('# Índice global del repositorio');
  out.push('');
  out.push(
    `Inventario completo de los ${docs.length} documentos del repositorio, con su tipo, su estabilidad y los temas que cubre cada uno. ` +
      'Sirve para decidir qué módulo cargar sin abrirlos todos. El enrutamiento con criterio está en [SKILL.md](SKILL.md).'
  );
  out.push('');
  out.push(`**Generado:** ${fecha} · **Regenerar:** \`node indice/scripts/indexar.mjs\``);
  out.push('');

  // Resumen por dominio.
  const porDominio = new Map();
  for (const doc of docs) {
    if (!porDominio.has(doc.dominio)) porDominio.set(doc.dominio, []);
    porDominio.get(doc.dominio).push(doc);
  }
  const dominios = [...porDominio.keys()].sort((a, b) => {
    if (a === '.') return -1;
    if (b === '.') return 1;
    return porDominio.get(b).length - porDominio.get(a).length;
  });

  out.push('## Skills invocables');
  out.push('');
  out.push(
    'Cada carpeta con `SKILL.md` es una skill invocable con `/<nombre>` una vez desplegada dentro ' +
      'del `.claude/skills/` del proyecto anfitrión. El nombre de la carpeta y el `name` de la ' +
      'cabecera deben coincidir.'
  );
  out.push('');
  out.push('| Skill | Enrutador |');
  out.push('|---|---|');
  for (const r of [...routers].sort((a, b) => a.meta.name.localeCompare(b.meta.name))) {
    out.push(`| \`/${escapar(r.meta.name)}\` | [${escapar(r.ruta)}](${enlaceDesdeIndice(r.ruta)}) |`);
  }
  out.push('');

  out.push('## Resumen');
  out.push('');
  out.push('| Dominio | Documentos | Enrutador |');
  out.push('|---|---|---|');
  for (const dom of dominios) {
    const lista = porDominio.get(dom);
    const router = lista.find((d) => d.esRouter);
    out.push(
      `| ${escapar(DOMINIOS[dom] ?? dom)} | ${lista.length} | ` +
        `${router ? `[${router.ruta}](${enlaceDesdeIndice(router.ruta)})` : '—'} |`
    );
  }
  out.push('');

  // Detalle por dominio.
  for (const dom of dominios) {
    const lista = porDominio.get(dom).sort((a, b) => a.ruta.localeCompare(b.ruta));
    out.push(`## ${DOMINIOS[dom] ?? dom}`);
    out.push('');
    out.push('| Documento | Título | Tipo | Estabilidad | Temas |');
    out.push('|---|---|---|---|---|');
    for (const doc of lista) {
      const nombre = dom === '.' ? doc.ruta : doc.ruta.slice(dom.length + 1);
      out.push(
        `| [${escapar(nombre)}](${enlaceDesdeIndice(doc.ruta)}) ` +
          `| ${escapar(doc.h1 ?? '—')} ` +
          `| ${escapar(doc.meta.tipo ?? (doc.esRouter ? 'enrutador' : doc.esReadme ? 'readme' : '—'))} ` +
          `| ${escapar(doc.meta.estabilidad ?? '—')} ` +
          `| ${escapar(resumenTemas(doc))} |`
      );
    }
    out.push('');
  }

  // Material volátil: lo que caduca y hay que verificar antes de afirmarlo.
  const volatiles = docs.filter((d) => d.meta.estabilidad === 'volatil');
  out.push('## Material volátil');
  out.push('');
  if (volatiles.length === 0) {
    out.push('Ningún módulo declara `estabilidad: volatil`.');
  } else {
    out.push('Estos módulos caducan. Verificar en la fuente antes de afirmar nada operativo.');
    out.push('');
    out.push('| Módulo | Snapshot | Fuente de verificación |');
    out.push('|---|---|---|');
    for (const doc of volatiles) {
      out.push(
        `| [${escapar(doc.ruta)}](${enlaceDesdeIndice(doc.ruta)}) | ${escapar(doc.meta.snapshot ?? '—')} ` +
          `| ${escapar(doc.meta.consulta_externa ?? '—')} |`
      );
    }
  }
  out.push('');

  // Salud del índice.
  out.push('## Salud');
  out.push('');
  out.push(`- Enlaces internos rotos: **${rotos.length}**`);
  for (const r of rotos) out.push(`  - \`${r.desde}\` → \`${r.hacia}\``);
  out.push(`- Módulos que ningún documento enlaza: **${sueltos.length}**`);
  for (const s of sueltos) out.push(`  - \`${s}\``);
  out.push('');

  return out.join('\n') + '\n';
}

// ---------------------------------------------------------------- principal

const docs = listarMarkdown()
  .map(parsear)
  .filter((d) => d.ruta !== SALIDA_RUTA);

// Requisitos para que una carpeta sea una skill descubrible al desplegarse dentro de
// `.claude/skills/`: SKILL.md de primer nivel, cabecera con `name` y `description`, y
// nombre de carpeta igual al `name`.
const routers = docs.filter((d) => d.esRouter);
const invalidos = [];
for (const d of routers) {
  const carpeta = d.ruta.includes('/') ? d.ruta.slice(0, d.ruta.indexOf('/')) : '.';
  if (!d.meta.name || !d.meta.description) {
    invalidos.push(d);
    console.error(`Enrutador sin name/description, no se descubrirá: ${d.ruta}`);
  } else if (carpeta === '.') {
    invalidos.push(d);
    console.error(`SKILL.md en la raíz: quedaría en .claude/skills/SKILL.md y no se descubre.`);
  } else if (carpeta !== d.meta.name) {
    invalidos.push(d);
    console.error(`Carpeta "${carpeta}" y name "${d.meta.name}" no coinciden: ${d.ruta}`);
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.meta.name)) {
    invalidos.push(d);
    console.error(`Nombre de skill inválido "${d.meta.name}" (solo minúsculas, dígitos y guiones): ${d.ruta}`);
  }
}

const validos = routers.filter((d) => !invalidos.includes(d));
const rotos = enlacesRotos(docs);
const sueltos = huerfanos(docs);
const contenido = render(docs, rotos, sueltos, validos);

if (CHECK) {
  const actual = existsSync(SALIDA) ? readFileSync(SALIDA, 'utf8') : '';
  // La línea de fecha cambia cada día; no cuenta como desactualización.
  const normalizar = (t) => t.replace(/^\*\*Generado:\*\*.*$/m, '');
  const desfasado = normalizar(actual) !== normalizar(contenido);
  if (desfasado) console.error('INDICE.md desactualizado: ejecuta `node indice/scripts/indexar.mjs`.');
  for (const r of rotos) console.error(`Enlace roto: ${r.desde} -> ${r.hacia}`);
  process.exit(desfasado || rotos.length > 0 || invalidos.length > 0 ? 1 : 0);
}

writeFileSync(SALIDA, contenido, 'utf8');
console.log(
  `INDICE.md: ${docs.length} documentos · ${validos.length} skills invocables · ` +
    `${rotos.length} enlaces rotos · ${sueltos.length} módulos sin enlazar`
);
