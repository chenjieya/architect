import { minify } from 'uglify-js'
export default function ugfily() {

    return {
      name: 'ugfily',
			renderChunk(code) {
				const result = minify(code)
				if(result.error) {
					this.error({
						message: `压缩代码报错: ${result.error}`,
					})
				}

				return {
					code: result.code,
        	map: {mapping: ""}
				}
			}
    }
}