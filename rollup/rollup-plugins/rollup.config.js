import { defineConfig } from 'rollup'
import virtualExample from './plugins/rollup-plugin-virtual.js'
import json from './plugins/rollup-plugin-json.js'

const config = defineConfig({
	input: 'src/index.js',
	output: {
		dir: 'dist',
		format: 'esm',
		sourcemap: true,
		entryFileNames: 'input/[name]-[hash].js',
		chunkFileNames: 'output/[name]-[hash].js'
	},
	plugins: [
		virtualExample(),
		json({
			exclude: 'node_modules/**'
		})
	]
})

export default config