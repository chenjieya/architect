export default function () {
	return {
		name: 'esbuild-plugin-external-lodash',
		setup(build) {
			build.onResolve({ filter: /(^lodash)/ }, (args) => {
				console.log(args, 'args')
				return {
					path: "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm",
					external: true
				}
			})
		}
	}
}