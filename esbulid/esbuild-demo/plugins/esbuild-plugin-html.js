
import path from 'path'
import fs from "fs/promises"
const env = 'development' === process.argv[2]



// 创建script
const createScript = (src) => `<script type="module" src="${src}"></script>` 
// 创建link
const createLink = (src) => `<link rel="stylesheet" href="${src}">`
// 生成html
const genternHTML = (scripts, links) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  ${links.join('\n')}
</head>
<body>
  <div id="root"></div>
</body>
${scripts.join('\n')}
${env ? `
	<script>
  	new EventSource('/esbuild').addEventListener('change',()=>location.reload());
	</script>
	` :
	''
}
</html>
`


const htmlPlugin = () => {
	return {
		name: 'esbuild-plugin-html',
		setup(build) {
			build.onEnd(async (result) => {
				if(result.errors.length) return

				const { metafile } = result

				// 收集scripts
				const scripts = []
				// 收集link
				const links = []

				if(metafile) {
					const { outputs } = metafile

					// 1. 解析路径
					const paths = Object.keys(outputs)
					
					paths.forEach(item => {
						// 获取文件名字（包含后缀）
						item = item.substring(item.lastIndexOf('/') + 1)


						// 2. js or css
						if(item.endsWith('.js')) {
							scripts.push(createScript(item))
						} else if(item.endsWith('.css')) {
							links.push(createLink(item))
						}

					})
				}

				
				// 3. 生成html
				const templateHTML = genternHTML(scripts, links)

				// 4. 写入
				const basePath = build.initialOptions.outdir ? 
													build.initialOptions.outdir :  
													build.initialOptions.outfile ? 
													build.initialOptions.outfile : 
													process.cwd()

				const templatePath = path.join(basePath, "index.html")

				await fs.writeFile(templatePath, templateHTML)
			})
		}
	}
}


export default htmlPlugin