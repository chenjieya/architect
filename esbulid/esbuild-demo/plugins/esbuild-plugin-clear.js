import { existsSync } from 'fs'
import { rimraf } from 'rimraf'

const clear = () => {
	return {
		name: 'esbuild-plugin-clear',
		setup(build) {

			build.onStart(() => {
				const options = build.initialOptions
				const { outdir, outfile } = options;

				// 1. 校验文件输出文件夹是否存在
				if(outdir && existsSync(outdir)) {
					rimraf.sync(outdir)
				}

				// 2. 校验输出文件是否存在
				if(outfile && existsSync(outfile)) {
					rimraf.sync(outfile)
				}
			})
		}
	}
}

export default clear