import { createFilter } from "@rollup/pluginutils";
import path from 'path'

export default function (options = {}) {
  const filterBoolean = createFilter(options.include, options.exclude)

	return {
		name: 'custom-plugin',
		transform(code, id) {
			if(!filterBoolean(id)) return null

			const source = `${code} \n\n ${JSON.stringify(this.parse(code), null, 2)}`

			const filename = path.basename(id, path.extname(id))

			if(options.emitFile) {
				this.emitFile({
					type: 'asset',
					name: filename + '.txt',
					source
				})
			}

			return null
		}
	}
}