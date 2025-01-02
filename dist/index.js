"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => wasmModuleWorkers
});
module.exports = __toCommonJS(src_exports);
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
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
//# sourceMappingURL=index.js.map