import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default [{
  input: 'src/index.tsx',
  output: [
    { file: 'dist/index.js', format: 'cjs', sourcemap: true },
    { file: 'dist/index.esm.js', format: 'esm', sourcemap: true }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({ extensions }),
    commonjs(),
    postcss({
      extract: true, // <--- esto genera un dist/index.css
      modules: false,
      use: ['sass'],
    }),
    babel({
      extensions,
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    })
  ],
  external: ['react', 'react-dom'],
},
{
  input: 'src/index.tsx',
  output: { file: 'dist/index.d.ts', format: 'es' },
  plugins: [
    {
      name: 'ignore-css',
      resolveId(source) {
        if (source.endsWith('.css')) return source;
        return null;
      },
      load(id) {
        if (id.endsWith('.css')) return '';
        return null;
      }
    },
    dts(),
  ],
}
]
