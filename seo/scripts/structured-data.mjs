// Structured-data check: parse every JSON-LD block in the snapshot, validate type/property names against
// the schema.org vocabulary (pinned release, downloaded once and cached), validate key types with ajv
// against Google rich-result requirements, and report coverage per template and across the sitemap.
// Recommends schema additions; never edits the site.
// Input: seo/data/snapshot.json  Output: seo/data/checks/structured-data.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { config, seoRoot, writeJson } from './lib/common.mjs';

const SCHEMA_ORG_RELEASE = '30.1';
const vocabPath = join(seoRoot, 'data', 'raw', `schemaorg-${SCHEMA_ORG_RELEASE}.jsonld`);
if (!existsSync(vocabPath)) {
  const response = await fetch(`https://raw.githubusercontent.com/schemaorg/schemaorg/main/data/releases/${SCHEMA_ORG_RELEASE}/schemaorg-current-https.jsonld`);
  if (!response.ok) throw new Error(`schema.org vocabulary download failed: ${response.status}`);
  mkdirSync(join(seoRoot, 'data', 'raw'), { recursive: true });
  writeFileSync(vocabPath, await response.text());
}
const vocab = JSON.parse(readFileSync(vocabPath, 'utf8'))['@graph'];
const asList = value => (Array.isArray(value) ? value : value == null ? [] : [value]);
const local = id => String(id).replace(/^(https?:\/\/schema\.org\/|schema:)/, '');
const types = new Map();
const properties = new Map();
for (const node of vocab) {
  const kinds = asList(node['@type']);
  if (kinds.includes('rdfs:Class')) types.set(local(node['@id']), asList(node['rdfs:subClassOf']).map(parent => local(parent['@id'])));
  if (kinds.includes('rdf:Property')) properties.set(local(node['@id']), asList(node['schema:domainIncludes']).map(domain => local(domain['@id'])));
}
const ancestors = type => {
  const seen = new Set();
  const walk = name => { if (seen.has(name)) return; seen.add(name); for (const parent of types.get(name) ?? []) walk(parent); };
  walk(type);
  return seen;
};
// Data types (Text, URL, Number...) are valid domains for nothing here; Thing covers generic properties.

// Required = needed for the Google rich result (schema.org itself requires nothing); recommended =
// Google-recommended or useful for entity understanding. Expressed as JSON Schema for ajv.
const text = { type: 'string', minLength: 1 };
const thing = { anyOf: [text, { type: 'object' }, { type: 'array', minItems: 1 }] };
const shapes = {
  Organization: { required: ['name'], recommended: ['url', 'logo', 'sameAs', 'contactPoint'], properties: { name: text, url: text, logo: thing } },
  BreadcrumbList: {
    required: ['itemListElement'], recommended: [],
    properties: { itemListElement: { type: 'array', minItems: 1, items: { type: 'object', required: ['position', 'name'], properties: { position: { type: 'integer', minimum: 1 }, name: text } } } },
  },
  Service: { required: [], recommended: ['name', 'serviceType', 'provider', 'areaServed', 'description'], properties: { name: text } },
  Article: { required: ['headline'], recommended: ['author', 'datePublished', 'dateModified', 'image', 'publisher'], properties: { headline: { type: 'string', minLength: 1, maxLength: 110 }, datePublished: { type: 'string', format: 'date-time-or-date' } } },
  DefinedTermSet: { required: ['name', 'hasDefinedTerm'], recommended: [], properties: { hasDefinedTerm: { type: 'array', minItems: 1 } } },
  SoftwareApplication: { required: ['name'], recommended: ['applicationCategory', 'operatingSystem', 'offers'], properties: { name: text } },
  FAQPage: {
    required: ['mainEntity'], recommended: [],
    properties: { mainEntity: { type: 'array', minItems: 1, items: { type: 'object', required: ['name', 'acceptedAnswer'], properties: { acceptedAnswer: { type: 'object', required: ['text'] } } } } },
  },
};
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addFormat('date-time-or-date', value => !Number.isNaN(Date.parse(value)));
const validators = Object.fromEntries(Object.entries(shapes).map(([type, shape]) => [type, ajv.compile({ type: 'object', required: shape.required, properties: shape.properties })]));
const shapeFor = type => Object.keys(shapes).find(name => ancestors(type).has(name));

// Expected schema per template (recommendations from the brief).
const expected = {
  home: ['Organization'], service: ['Service', 'BreadcrumbList'], specialty: ['Service', 'BreadcrumbList'],
  'blog-post': ['Article', 'BreadcrumbList'], glossary: ['DefinedTermSet', 'BreadcrumbList'], tool: ['SoftwareApplication', 'BreadcrumbList'],
  'tools-index': ['BreadcrumbList'], pricing: ['BreadcrumbList'], 'payer-directory': ['BreadcrumbList'], 'free-assessment': ['BreadcrumbList'],
};

function nodesOf(value, out = []) {
  if (Array.isArray(value)) value.forEach(item => nodesOf(item, out));
  else if (value && typeof value === 'object') {
    if (value['@type']) out.push(value);
    for (const [key, child] of Object.entries(value)) if (key !== '@context') nodesOf(child, out);
  }
  return out;
}

function validatePage(page) {
  const problems = [];
  const found = new Set();
  page.jsonLd.forEach((raw, block) => {
    let data;
    try { data = JSON.parse(raw); } catch (error) { problems.push({ severity: 'error', block, message: `Invalid JSON: ${error.message}` }); return; }
    for (const top of asList(data)) {
      const context = JSON.stringify(top['@context'] ?? '');
      if (!/schema\.org/.test(context)) problems.push({ severity: 'error', block, message: '@context is not schema.org' });
    }
    for (const node of nodesOf(data)) {
      for (const type of asList(node['@type'])) {
        if (!types.has(type)) { problems.push({ severity: 'error', block, type, message: `Unknown schema.org type "${type}"` }); continue; }
        ancestors(type).forEach(name => found.add(name));
        const lineage = ancestors(type);
        for (const key of Object.keys(node).filter(key => !key.startsWith('@'))) {
          if (!properties.has(key)) problems.push({ severity: 'error', block, type, message: `Unknown property "${key}"` });
          else if (!properties.get(key).some(domain => lineage.has(domain))) problems.push({ severity: 'warning', block, type, message: `"${key}" is not expected on ${type}` });
        }
        const shape = shapeFor(type);
        if (shape && !validators[shape](node)) {
          for (const error of validators[shape].errors) problems.push({ severity: 'error', block, type, message: `${shape}${error.instancePath} ${error.message}` });
        }
        if (shape) for (const field of shapes[shape].recommended) if (!(field in node)) problems.push({ severity: 'recommendation', block, type, message: `Add recommended "${field}"` });
      }
    }
  });
  return { found, problems };
}

const snapshot = JSON.parse(readFileSync(join(seoRoot, 'data', 'snapshot.json'), 'utf8'));
// Error responses are reported by the sitemap audit; they must not count as "no structured data".
const htmlPages = snapshot.pages.filter(page => page.status === 200 && Array.isArray(page.jsonLd));
const templates = config.templates.map(({ template, path }) => {
  const page = htmlPages.find(entry => entry.path === path);
  if (!page) return { template, path, missingFromSnapshot: true };
  const { found, problems } = validatePage(page);
  return {
    template, path, blocks: page.jsonLd.length, types: [...found].filter(name => name !== 'Thing').sort(),
    missingRecommendedTypes: (expected[template] ?? []).filter(type => !found.has(type)),
    problems,
  };
});

const coverage = htmlPages.map(page => ({ path: page.path, blocks: page.jsonLd.length, ...(({ found, problems }) => ({
  types: [...found].filter(name => name !== 'Thing'),
  errors: problems.filter(problem => problem.severity === 'error').length,
}))(validatePage(page)) }));
const sitewideOrganization = coverage.filter(page => page.types.includes('Organization')).length;
const section = path => '/' + (path.split('/')[1] || '') + (path.split('/')[1] ? '/' : '');
const bySection = {};
for (const page of coverage) {
  const key = section(page.path);
  bySection[key] ??= { pages: 0, withJsonLd: 0, withErrors: 0 };
  bySection[key].pages += 1;
  if (page.blocks) bySection[key].withJsonLd += 1;
  if (page.errors) bySection[key].withErrors += 1;
}

const result = {
  generatedAt: new Date().toISOString(), schemaOrgRelease: SCHEMA_ORG_RELEASE, base: snapshot.base,
  templates,
  summary: {
    pagesChecked: coverage.length,
    pagesWithoutStructuredData: coverage.filter(page => !page.blocks).length,
    pagesWithErrors: coverage.filter(page => page.errors).length,
    pagesWithOrganization: sitewideOrganization,
    pagesWithBreadcrumbs: coverage.filter(page => page.types.includes('BreadcrumbList')).length,
  },
  bySection,
  pagesWithoutStructuredData: coverage.filter(page => !page.blocks).map(page => page.path),
  pagesWithErrors: coverage.filter(page => page.errors).map(page => ({ path: page.path, errors: page.errors })),
};
await writeJson(join(seoRoot, 'data', 'checks', 'structured-data.json'), result);
console.log(`structured-data: ${result.summary.pagesChecked} pages, ${result.summary.pagesWithoutStructuredData} without JSON-LD, ${result.summary.pagesWithErrors} with errors`);
for (const entry of templates) console.log(`  ${entry.template}: ${entry.types?.join(', ') || 'none'}${entry.missingRecommendedTypes?.length ? ` | missing: ${entry.missingRecommendedTypes.join(', ')}` : ''}`);
