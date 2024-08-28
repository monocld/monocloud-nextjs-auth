import { defineConfig } from 'tsup';
import { Options } from 'tsup';
import { name, version } from './package.json';

export default defineConfig(() => {
  const common: Options = {
    tsconfig: './tsconfig.build.json',
    entry: ['./src/**/*.{ts,tsx,js,jsx}'],
    bundle: false,
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: true,
    define: {
      SDK_NAME: `"${name}"`,
      SDK_VERSION: `"${version}"`,
      SDK_DEBUGGER_NAME: `"${name.replace('/', ':')}"`,
    },
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
    outDir: './dist/cjs',
  };

  const esm: Options = {
    ...common,
    format: 'esm',
  };

  return [cjs, esm];
});
