import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import manifest from '../../src/data/anatomyModelManifest.json';
import { ATLAS_CODES, ATLAS_SPECIALTIES, ATLAS_SOURCES, REGIONS, ATLAS_QUIZ } from '../../src/data/anatomyEducation';

test('atlas educational links and specialty examples resolve without silently losing lessons', () => {
  const codes = new Set(ATLAS_CODES.map(code => code.code));
  assert.equal(codes.size, ATLAS_CODES.length);
  const regions = new Set(REGIONS.map(region => region.id));
  for (const specialty of ATLAS_SPECIALTIES) {
    assert.ok(regions.has(specialty.region));
    for (const code of specialty.examples) assert.ok(codes.has(code), `${specialty.name}: ${code}`);
  }
  for (const code of ATLAS_CODES) {
    assert.match(ATLAS_SOURCES[code.source].url, /^https:\/\//);
    code.regions.forEach(region => assert.ok(regions.has(region)));
  }
  for (const question of ATLAS_QUIZ) assert.ok(question.answers[question.correct]);
});

test('served atlas files match attribution manifest and contain actual compressed geometry for every listed structure', () => {
  assert.deepEqual(JSON.parse(readFileSync('public/models/anatomy/manifest.json', 'utf8')), manifest);
  const ids = new Set<string>();
  for (const [layer, file] of Object.entries(manifest.files)) {
    const bytes = readFileSync(`public${file.path}`);
    assert.equal(bytes.length, file.bytes);
    assert.ok(bytes.length < 25 * 1024 * 1024, 'Cloudflare per-file limit');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
    assert.equal(bytes.readUInt32LE(0), 0x46546c67);
    assert.equal(bytes.readUInt32LE(4), 2);
    assert.equal(bytes.readUInt32LE(8), bytes.length);
    const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
    for (const node of json.nodes) {
      const structure = manifest.structures.find(s => s.id === node.name);
      assert.ok(structure, node.name);
      assert.equal(structure.layer, layer);
      assert.ok(!ids.has(node.name)); ids.add(node.name);
      const primitive = json.meshes[node.mesh].primitives[0];
      assert.ok(primitive.extensions.KHR_draco_mesh_compression);
      assert.ok(json.accessors[primitive.attributes.POSITION].count > 20);
      assert.ok(json.accessors[primitive.indices].count > 60);
    }
  }
  assert.equal(ids.size, manifest.structures.length);
  const attribution = readFileSync('public/models/anatomy/ATTRIBUTION.txt', 'utf8');
  assert.ok(attribution.includes(manifest.attribution));
  assert.ok(attribution.includes(manifest.licenseStatement));
});

test('curated models preserve patient laterality and omit known misleading source composites', () => {
  for (const structure of manifest.structures) {
    if (structure.name.startsWith('right ')) assert.ok(structure.bounds[1][0] < .01, structure.name);
    if (structure.name.startsWith('left ')) assert.ok(structure.bounds[0][0] > -.01, structure.name);
    assert.notEqual(structure.id, 'FMA7647', 'incomplete cord must not be labelled as a full cord');
    assert.notEqual(structure.id, 'FMA12514', 'right-eye composite has cross-midline outliers');
  }
});
