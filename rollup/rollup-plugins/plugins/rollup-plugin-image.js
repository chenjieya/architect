import { createFilter } from "@rollup/pluginutils";
import path from 'path'
import fs from 'fs'
import { dataToEsm } from "@rollup/pluginutils";

const miniType = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.bmp': 'image/bmp',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml'
}

export default function (options = {}) {
  const filterBoolean = createFilter(options.include, options.exclude)

	return {
		name: 'image-base64',
		async transform(code, source) {
			if(!filterBoolean(source)) return null
			if(!miniType.hasOwnProperty(path.extname(source))) return null

			const getUri = ({ miniType, base64String }) => `data:${miniType};base64,${base64String}`

			try {
				const buffter = await fs.promises.readFile(source)
				const base64 = buffter.toString('base64')

				return {
					code: dataToEsm(getUri({ miniType: miniType[path.extname(source)], base64String: base64 })),
					map: { mappings: '' }
				}
			}catch(err) {
				const message = `图片转换base64发生错误: ${source}`
				this.error({ message, cause: err, source })
				return null
			}

		}
	}
}