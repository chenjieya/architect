const time = () => {
	return {
		name: 'esbuild-plugin-time',
		setup(build) {
			let time;
			build.onStart(() => {
				console.log('---- build start ----')
				time = Date.now()
			})

			build.onEnd(() => {
				console.log(`🚀 build time: ${Date.now() - time}ms`)
				console.log('---- build end ----')
			})

			build.onDispose(() => {
				console.log('---- build dispose ----')
			})
		}
	}
}

export default time