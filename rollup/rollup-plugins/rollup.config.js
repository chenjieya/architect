import { defineConfig } from 'rollup'
import clear from 'rollup-plugin-clear'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import virtualExample from './plugins/rollup-plugin-virtual.js'
import json from './plugins/rollup-plugin-json.js'
import custom from './plugins/rollup-plugin-custom.js'
import imagePlugin from './plugins/rollup-plugin-image.js'

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
		clear({
			targets: ["dist"]
		}),
		resolve({
			extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs', '.jpeg', '.svg']
		}),
		commonjs(),
		virtualExample(),
		json({
			include: './package.json',
			exclude: 'node_modules/**'
		}),
		custom({
			include: 'src/**/*.js ',
			emitFile: true
		}),
		imagePlugin({
			exclude: 'node_modules/*',
			// fileSize: 1024 * 10000,
			target: './dist/assets'
		})
	]
})

export default config