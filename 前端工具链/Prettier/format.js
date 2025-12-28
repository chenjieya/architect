// 使用api的方式对代码进行格式化
const prettier = require('prettier');
const fs = require('fs');
const path = require('path');

const configFileContent = fs.readFileSync('.prettierrc', { encoding: 'utf-8' });

// 读取src目录下面的直接子文件
fs.readdir('src', (err, res) => {
  if (err) throw err;

  for (let i = 0; i < res.length; i++) {
    const sourceFilePath = path.resolve('src', res[i]);

    // 读取文件内容
    const sourceFileContent = fs.readFileSync(sourceFilePath, {
      encoding: 'utf-8'
    });

    prettier
      .format(sourceFileContent, JSON.parse(configFileContent))
      .then(res => {
        // 将格式化之后的文件，写入到原来的文件中
        fs.writeFileSync(sourceFilePath, res, { encoding: 'utf-8' });
        console.log('格式化成功');
      })
      .catch(err => {
        console.log(err);
      });
  }
});
