import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = 'public/models/anatomy';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.encoder': await draco3d.createEncoderModule(), 'draco3d.decoder': await draco3d.createDecoderModule() });
const manifest = JSON.parse(await readFile(`${root}/manifest.json`, 'utf8'));
for (const layer of Object.keys(manifest.files)) {
  const path = `${root}/${layer}.glb`;
  const document = await io.read(path);
  await document.transform(draco({ method: 'edgebreaker', quantizePosition: 16, quantizeNormal: 10 }));
  await io.write(path, document);
  const bytes = await readFile(path);
  manifest.files[layer].bytes = bytes.length;
  manifest.files[layer].sha256 = createHash('sha256').update(bytes).digest('hex');
  console.log(layer, bytes.length, 'bytes');
}
manifest.adaptations += ' Skull composite limited to its bony elements; eye tissues retained as separate structures. Hand/foot bone groups follow their source elements. Draco compression uses 16-bit position and 10-bit normal quantization; no measurements should be taken from the reduced model.';
await writeFile(`${root}/manifest.json`, JSON.stringify(manifest, null, 2));
await writeFile(`${root}/ATTRIBUTION.txt`, `${manifest.attribution}\n${manifest.license}\nSource: ${manifest.source}\nLicense statement: ${manifest.licenseStatement}\n\n${manifest.adaptations}\n\n${manifest.reference}\n`);
await mkdir(`${root}/draco`, { recursive: true });
for (const file of ['draco_wasm_wrapper.js', 'draco_decoder.wasm', 'draco_decoder.js']) await copyFile(`node_modules/three/examples/jsm/libs/draco/gltf/${file}`, `${root}/draco/${file}`);
await writeFile(`${root}/draco/NOTICE.txt`, 'Draco decoder — Google Draco contributors, Apache License 2.0.\nhttps://github.com/google/draco\nhttps://www.apache.org/licenses/LICENSE-2.0\nDistributed from the Three.js examples package; original notices in decoder scripts retained.\n');
await mkdir('src/data', { recursive: true });
await copyFile(`${root}/manifest.json`, 'src/data/anatomyModelManifest.json');
