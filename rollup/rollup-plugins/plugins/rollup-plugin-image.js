import { createFilter } from "@rollup/pluginutils";
import { basename, extname, normalize, relative, resolve, sep } from 'path'
import fs from 'fs'
import { dataToEsm } from "@rollup/pluginutils";

const defaultOpts = {
	include: null,
	exclude: null,
	fileSize: 1024 * 40,
	target: './dist'
}

const miniType = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.bmp': 'image/bmp',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml'
}

// 辅助函数-创建文件夹
async function creatDir(dirPath) {
	try {
		// 1. 检查文件是否存在
		await fs.promises.access(dirPath)
		return true
	}catch {
		try {
			// 2. 创建文件
			await fs.promises.mkdir(dirPath, { recursive: true })
			return true
		} catch(err) {
			const message = `创建文件所在文件夹出错: ${dirPath}`
			this.error({
				message, cause: err, source: dirPath
			})
			return false
		}
	}
}

export default function (opts = {}) {
	// 整理配置
	const options = Object.assign({}, defaultOpts, opts)
  const filterBoolean = createFilter(options.include, options.exclude)

	return {
		name: 'image-base64',
		async transform(_code, source) {
			// 1. 校验： 不符合条件不处理
			if(!filterBoolean(source)) return null
			if(!miniType.hasOwnProperty(extname(source))) return null


			// 辅助： 整理base64格式
			const getUri = ({ miniType, base64String }) => `data:${miniType};base64,${base64String}`

			// 获取文件大小
			const fileStat = await fs.promises.stat(source)
			const fileSize = fileStat.size

			try {

				if(fileSize >= options.fileSize) {
					// 目标存储路径
					const assetsPath = resolve(process.cwd(), options.target)

					const fileName = basename(source)

					// 目标路径
					const filePath = resolve(assetsPath, fileName)

					// 相对于包根目录的路径
					let relativePath = normalize(relative(process.cwd(), filePath))
					relativePath = relativePath.substring(relativePath.indexOf(sep) + 1)

					// 1. 创建文件所在文件夹
					const isDirExist = await creatDir(assetsPath)
					// 2. 拷贝文件
					isDirExist && await fs.promises.copyFile(source, filePath)

					return {
						code: dataToEsm(relativePath),
						map: { mappings: '' }
					}
				}
				const buffter = await fs.promises.readFile(source)
				const base64 = buffter.toString('base64')

				return {
					code: dataToEsm(getUri({ miniType: miniType[extname(source)], base64String: base64 })),
					map: { mappings: '' }
				}
			}catch(err) {
				const message = `图片转换发生错误: ${source}`
				this.error({ message, cause: err, source })
				return null
			}

		}
	}
}