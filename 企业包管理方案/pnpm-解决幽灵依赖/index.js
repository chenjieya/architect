/**
 * pnpm的 符号连接 存在node_modules下面，符号连接指向了.pnpm下面的express硬连接。 而其他的间接依赖都存在.pnpm下面
 * pnpm 的非扁平化结构
		node_modules/
		├── express -> .pnpm/express@4.18.0/node_modules/express
		└── .pnpm/
				└── express@4.18.0/
						└── node_modules/
								├── express
								└── body-parser   # 只在 express 的作用域内

		# 结果：项目无法直接访问 body-parser
		# require('body-parser') 会报错
 */

const bodyParser = require("body-parser");

/**
Error: Cannot find module 'body-parser'
 */
console.log(bodyParser);
