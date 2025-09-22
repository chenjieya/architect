

const env = 'development' === process.argv[2]

const htmlPlugin = () => {
	return {
		name: 'esbuild-plugin-html',
		setup(build) {

		}
	}
}


export default htmlPlugin