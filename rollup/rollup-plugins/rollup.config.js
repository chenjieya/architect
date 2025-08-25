import { defineConfig } from 'rollup'
import virtualExample from './plugins/rollup-plugin-virtual.js'

const config = defineConfig({
	input: 'src/index.js',
	output: {
		dir: 'dist',
		format: 'esm',
		entryFileNames: 'input/[name]-[hash].js',
		chunkFileNames: 'output/[name]-[hash].js'
	},
	plugins: [
		virtualExample()
	]
})

export default config