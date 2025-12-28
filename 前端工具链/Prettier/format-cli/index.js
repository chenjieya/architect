#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const prettier = require('prettier')

const args = process.argv.slice(2)

// 要做格式化的操作
// pnpm formatcli --write src/index.js


// 读取源码
const sourceFilePath = path.resolve(args[1])
const sourceFileContent = fs.readFileSync(sourceFilePath, { encoding: 'utf-8' })

// 读取配置文件
const option = JSON.parse(fs.readFileSync(path.resolve('.prettierrc')))
if(args.length === 0){
	console.error("请提供一个参数！");
	process.exit(1);
}
const input = args[0];
if(input === "--write" || input === "-w"){
	// 使用 prettier 的 api 对代码进行格式化操作
	prettier.format(sourceFileContent, option).then(res=>{
		// 将格式化后的 js 代码重新写回到原来的文件
		fs.writeFileSync(sourceFilePath, res, 'utf-8');
	})
	console.log("格式化操作已经完成...");
}