import { defineConfig } from "rollup";
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default defineConfig({
	input: 'src/index.js',
	output: [
		{
			dir: 'dist',
			format: 'esm',
			entryFileNames: '[name]-[hash].js',
			chunkFileNames: '[name]-[hash].js',
			manualChunks(id) {
				console.log(id)
				if(id.includes('utils')) {
					return '123'
				} else if(id.includes('lodash-es')) {
					return 'lodash-es'
				}
			}
		},
		{
			file: 'dist/bundles-cjs.js',
			format: 'cjs'
		}
	],
	plugins: [nodeResolve()]
	// external: ['lodash-es']
})