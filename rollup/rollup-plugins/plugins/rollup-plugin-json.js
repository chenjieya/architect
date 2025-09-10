import { createFilter, dataToEsm } from '@rollup/pluginutils'
import path from 'path'

export default function (options = {}) {
	const filterBoolean = createFilter(options.include, options.exclude)

  return {
		name: 'first-plugin-json',
		transform: {
			order: 'pre',
			handler(code, id) {
				console.log(id, 'id')
				if(!filterBoolean(id) || path.extname(id) !== '.json') {
					// 不处理
					return null
				}
				

				try {
					const parseData = JSON.parse(code)

					return {
						code: dataToEsm(parseData),
						map: { mappings: '' }
					}
				}catch(err) {
					const message = `不能转换的JSON: ${id}`
					this.error({ message, cause: err, id })
					return null
				}


			}
		}
	}
}