// src/index.ts
import * as path from "path";
import * as fs from "fs";
function wasmModuleWorkers() {
  const postfix = ".wasm?module";
  let isDev = false;
  return {
    name: "vite:wasm-helper",
    configResolved(config) {
      isDev = config.command === "serve";
    },
    config() {
      return { build: { rollupOptions: { external: /.+\.wasm?url$/i } } };
    },
    renderChunk(code) {
      if (isDev)
        return;
      if (!/.*\?module.*/g.test(code))
        return;
      let final = code.replaceAll(/(const\s+(\w+))(.*\.wasm.*)/gm, (s) => {
        return s.replace(/const\s+(\w+)\s*=\s*"(.*)"/, 'import $1 from ".$2"');
      });
      final = final.replaceAll(/const\n*.*{\n*.*default:(\n|.)*?(;)/gm, (s) => {
        return s.replace(
          /[\s\S]*?(?=:\s):\s(\w+)[\s\S]*?(?=\{){(.*?)}[\s\S]*?(?:\);*)/gm,
          `const $1 = $2`
        );
      });
      return { code: final };
    },
    load(id) {
      if (!id.endsWith(postfix)) {
        return null;
      }
      const filePath = id.slice(0, -1 * "?module".length);
      if (isDev) {
        return `
            import fs from "fs"
    
            const wasmModule = new WebAssembly.Module(fs.readFileSync("${filePath}"));
            export default wasmModule;
            `;
      }
      const assetId = this.emitFile({
        type: "asset",
        name: path.basename(filePath),
        source: fs.readFileSync(filePath)
      });
      return `
          import init from "__WASM_ASSET__${assetId}.wasm"
          export default init
          `;
    }
  };
}
export {
  wasmModuleWorkers as default
};
//# sourceMappingURL=index.mjs.map