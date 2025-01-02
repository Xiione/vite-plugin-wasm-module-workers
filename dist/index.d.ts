import { Plugin } from 'vite';

declare function wasmModuleWorkers(): Plugin;

export { wasmModuleWorkers as default };
