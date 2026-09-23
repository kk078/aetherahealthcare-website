# Anatomy model provenance and rebuild

The committed models use the official BodyParts3D PART-OF 4.0 99% polygon-reduction archive. The publisher's current reuse statement is CC BY 4.0 (updated February 27, 2025), superseding the historical BY-SA 2.1 text in OBJ headers. Keep the attribution, adaptation notes and original identifiers with reused models.

Download these files from https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html into an input directory:

- `partof_BP3D_4.0_obj_99.zip`
- `partof_parts_list_e.txt`
- `partof_element_parts.txt`

From the repository root, run:

```sh
python3 scripts/build-anatomy-models.py /path/to/input public/models/anatomy
node scripts/compress-anatomy-models.mjs
npm run test:unit
```

The converter does not sculpt anatomy. It converts source coordinates (mm, Z-up) to meters/Y-up, computes normals, groups source elements, and records each element's provenance. The compressor applies Draco 16-bit position and 10-bit normal quantization and updates file hashes, sizes and the client manifest. Do not infer real-world measurements from the reduced meshes.

The skull aggregate is restricted to its bony elements. Hand/foot groups contain bones, with source carpal elements included. Only the clean vitreous-body eye elements are used: some source right-eye composites contain cross-midline outliers. The spinal-cord aggregate is excluded because this archive contains only a short central-canal fragment. The complete cord must not be claimed as rendered. Anatomical regions are learning groups, not strict compartment boundaries (e.g., kidneys are grouped with pelvis but are retroperitoneal above it).

The browser loads the committed local GLBs and a local Apache-2.0 Draco decoder. No external model API or runtime account is required. `wasm-unsafe-eval` permits WebAssembly decoding without enabling JavaScript string evaluation; the existing blob worker policy supports the decoder workers.

Before changing assets, inspect individual structures and verify laterality, labels and region/layer selection in the actual viewer, including desktop, mobile, reduced-motion and loading-failure states. Automated geometry/hash checks cannot certify clinical accuracy.
