// Validate the final optimized binary, including the externref table that old
// Binaryen versions silently corrupt. No browser shims or dependencies needed.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const module = await WebAssembly.compile(await readFile(process.argv[2]));
const imports = {};
for (const entry of WebAssembly.Module.imports(module)) {
  assert.equal(entry.kind, 'function');
  (imports[entry.module] ??= {})[entry.name] = () => null;
}
const instance = await WebAssembly.instantiate(module, imports);
const table = instance.exports.__wbindgen_externrefs;
assert.ok(table instanceof WebAssembly.Table);
assert.ok(table.length >= 1028);
for (const [index, value] of [undefined, null, true, false].entries()) {
  table.set(1024 + index, value);
  assert.equal(table.get(1024 + index), value);
}
console.log('Optimized WASM compiles and preserves the JavaScript externref table');
