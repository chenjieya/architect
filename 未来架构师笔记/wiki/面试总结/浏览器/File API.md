---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
本文主要包含以下内容：

- _File API_ 介绍
- _File_ 对象
  - 构造函数
  - 实例属性和实例方法
- _FileList_ 对象
- _FileReader_ 对象
- 综合实例

## 1. _File API_ 介绍

我们知道，_HTML_ 的 _input_ 表单控件，其 _type_ 属性可以设置为 _file_，表示这是一个上传控件。

```html
<input type="file" name="" id="" />
```

选择文件前：

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926196175_2021-12-02-022039.png" alt="image-20211202102038796" style="zoom:50%;" />

选择文件后：

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926196176_2021-12-02-022057.png" alt="image-20211202102056757" style="zoom:50%;" />

这种做法用户体验非常的差，我们无法**在客户端**对用户选取的文件进行 _validate_，无法读取文件大小，无法判断文件类型，无法预览。

如果是多文件上传，_JavaScript_ 更是回天乏力。

```html
<input type="file" name="" id="" multiple />
```

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926196177_2021-12-02-022115.png" alt="image-20211202102115626" style="zoom:50%;" />

但现在有了 _HTML5_ 提供的 _File API_，一切都不同了。该接口允许 _JavaScript_ 读取本地文件，但并不能直接访问本地文件，而是要依赖于用户行为，比如用户在 _type='file'_ 控件上选择了某个文件或者用户将文件拖拽到浏览器上。

_File Api_ 提供了以下几个接口来访问本地文件系统：

- _File_：单个文件，提供了诸如 _name、file size、mimetype_ 等只读文件属性

- _FileList_：一个类数组 _File_ 对象集合

- _FileReader_：异步读取文件的接口

- _Blob_：文件对象的二进制原始数据

## 2. _File_ 对象

_File_ 对象代表一个文件，用来读写文件信息。它继承了 _Blob_ 对象，或者说是一种特殊的 _Blob_ 对象，所有可以使用 _Blob_ 对象的场合都可以使用它。

最常见的使用场合是表单的文件上传控件（\<_input type="file"_>），用户选中文件以后，浏览器就会生成一个数组，里面是每一个用户选中的文件，它们都是 _File_ 实例对象。

```html
<input type="file" name="" id="file" />
```

```js
// 获取 DOM 元素
var file = document.getElementById('file')
file.onchange = function (event) {
  var files = event.target.files
  console.log(files)
  console.log(files[0] instanceof File)
}
```

上面代码中，_files[0]_ 是用户选中的第一个文件，它是 _File_ 的实例。

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926196177_2021-12-02-022135.png" alt="image-20211202102135071" style="zoom:50%;" />

### 2.1 构造函数

浏览器原生提供一个 _File( )_ 构造函数，用来生成 _File_ 实例对象。

```js
new File(array, name [, options])
```

_File( )_ 构造函数接受三个参数。

- _array_：一个数组，成员可以是二进制对象或字符串，表示文件的内容。

- _name_：字符串，表示文件名或文件路径。

- _options_：配置对象，设置实例的属性。该参数可选。

第三个参数配置对象，可以设置两个属性。

- _type_：字符串，表示实例对象的 _MIME_ 类型，默认值为空字符串。

- _lastModified_：时间戳，表示上次修改的时间，默认为 _Date.now( )_。

下面是一个例子。

```js
var file = new File(['foo'], 'foo.txt', {
  type: 'text/plain',
})
```

### 2.2 实例属性和实例方法

_File_ 对象有以下实例属性。

- _File.lastModified_：最后修改时间

- _File.name_：文件名或文件路径

- _File.size_：文件大小（单位字节）

- _File.type_：文件的 _MIME_ 类型

```js
var file = new File(['foo'], 'foo.txt', {
  type: 'text/plain',
})
console.log(file.lastModified) // 1638340865992
console.log(file.name) // foo.txt
console.log(file.size) // 3
console.log(file.type) // text/plain
```

在上面的代码中，我们创建了一个 _File_ 文件对象实例，并打印出了该文件对象的诸如 _lastModified、name、size、type_ 等属性信息。

_File_ 对象没有自己的实例方法，由于继承了 _Blob_ 对象，因此可以使用 _Blob_ 的实例方法 _slice( )_。

## 3. _FileList_ 对象

_FileList_ 对象是一个类似数组的对象，代表一组选中的文件，每个成员都是一个 _File_ 实例。

在最上面的那个示例中，我们就可以看到触发 _change_ 事件后，_event.target.files_ 拿到的就是一个 _FileList_ 实例对象。

它主要出现在两个场合。

- 文件控件节点（\<_input type="file"_>）的 _files_ 属性，返回一个 _FileList_ 实例。

- 拖拉一组文件时，目标区的 _DataTransfer.files_ 属性，返回一个 _FileList_ 实例。

```html
<body>
  <input type="file" name="" id="file" />
  <script>
    // 获取 DOM 元素
    var file = document.getElementById('file')
    file.onchange = function (event) {
      var files = event.target.files
      console.log(files)
      console.log(files instanceof FileList)
    }
  </script>
</body>
```

上面代码中，文件控件的 _files_ 属性是一个 _FileList_ 实例。

_FileList_ 的实例属性主要是 _length_，表示包含多少个文件。

_FileList_ 的实例方法主要是 _item( )_，用来返回指定位置的实例。它接受一个整数作为参数，表示位置的序号（从零开始）。

但是，由于 _FileList_ 的实例是一个类似数组的对象，可以直接用方括号运算符，即 _myFileList[0]_ 等同于 _myFileList.item(0)_，所以一般用不到 _item( )_ 方法。

## 4. _FileReader_ 对象

_FileReader_ 对象用于读取 _File_ 对象或 _Blob_ 对象所包含的文件内容。

浏览器原生提供一个 _FileReader_ 构造函数，用来生成 _FileReader_ 实例。

```js
var reader = new FileReader()
```

_FileReader_ 有以下的实例属性。

- _FileReader.error_：读取文件时产生的错误对象

- _FileReader.readyState_：整数，表示读取文件时的当前状态。一共有三种可能的状态，_0_ 表示尚未加载任何数据，_1_ 表示数据正在加载，_2_ 表示加载完成。

- _FileReader.result_：读取完成后的文件内容，有可能是字符串，也可能是一个 _ArrayBuffer_ 实例。

- _FileReader.onabort_：_abort_ 事件（用户终止读取操作）的监听函数。

- _FileReader.onerror_：_error_ 事件（读取错误）的监听函数。

- _FileReader.onload_：_load_ 事件（读取操作完成）的监听函数，通常在这个函数里面使用 _result_ 属性，拿到文件内容。

- _FileReader.onloadstart_：_loadstart_ 事件（读取操作开始）的监听函数。

- _FileReader.onloadend_：_loadend_ 事件（读取操作结束）的监听函数。

- _FileReader.onprogress_：_progress_ 事件（读取操作进行中）的监听函数。

下面是监听 _load_ 事件的一个例子。

```html
<body>
  <input type="file" name="" id="file" />
  <script>
    // 获取 DOM 元素
    var file = document.getElementById('file')
    file.onchange = function (event) {
      var file = event.target.files[0] // 拿到第一个文件
      var reader = new FileReader() // 创建一个 FileReader 实例对象
      // 读取文件成功后触发 load 事件
      reader.onload = function (event) {
        console.log(event.target.result)
      }
      // 读取文件
      reader.readAsText(file)
    }
  </script>
</body>
```

上面代码中，每当文件控件发生变化，就尝试读取第一个文件。如果读取成功（ _load_ 事件发生），就打印出文件内容。

_FileReader_ 有以下实例方法。

- _FileReader.abort( )_：终止读取操作，_readyState_ 属性将变成 _2_。

- _FileReader.readAsArrayBuffer( )_：以 _ArrayBuffer_ 的格式读取文件，读取完成后 _result_ 属性将返回一个 _ArrayBuffer_ 实例。

- _FileReader.readAsBinaryString( )_：读取完成后，_result_ 属性将返回原始的二进制字符串。

- _FileReader.readAsDataURL( )_：读取完成后，_result_ 属性将返回一个 _Data URL_ 格式（ _Base64_ 编码）的字符串，代表文件内容。对于图片文件，这个字符串可以用于 \<_img_> 元素的 _src_ 属性。注意，这个字符串不能直接进行 _Base64_ 解码，必须把前缀 `data:*/*;base64,` 从字符串里删除以后，再进行解码。

- _FileReader.readAsText( )_：读取完成后，_result_ 属性将返回文件内容的文本字符串。该方法的第一个参数是代表文件的 _Blob_ 实例，第二个参数是可选的，表示文本编码，默认为 _UTF-8_。

下面是一个读取图片文件的例子。

```html
<input type="file" name="" id="file" /> <img src="" alt="" width="200" />
```

```js
// 获取 DOM 元素
var file = document.getElementById('file')
file.onchange = function () {
  var preview = document.querySelector('img')
  var file = document.querySelector('input[type=file]').files[0]
  var reader = new FileReader()

  reader.addEventListener(
    'load',
    function () {
      preview.src = reader.result
    },
    false,
  )

  if (file) {
    reader.readAsDataURL(file)
  }
}
```

上面代码中，用户选中图片文件以后，脚本会自动读取文件内容，然后作为一个 _Data URL_ 赋值给 \<_img_> 元素的 _src_ 属性，从而把图片展示出来。

## 5. 综合实例

最后，我们通过一个综合实例来贯穿上面所学的内容。

_HTML_

```html
<label>
  <input type="file" name="" id="file" />
  <div class="uploadImg">
    <!-- 制作中间的十字架 -->
    <div class="cross"></div>
  </div>
</label>
```

_CSS_

```css
.uploadImg {
  width: 150px;
  height: 150px;
  border: 1px dashed skyblue;
  border-radius: 30px;
  position: relative;
  cursor: pointer;
}

.cross {
  width: 30px;
  height: 30px;
  position: absolute;
  left: calc(50% - 15px);
  top: calc(50% - 15px);
}

.cross::before {
  content: '';
  width: 30px;
  height: 2px;
  background-color: skyblue;
  position: absolute;
  top: calc(50% - 1px);
}

.cross::after {
  content: '';
  width: 30px;
  height: 2px;
  background-color: skyblue;
  position: absolute;
  left: calc(50% - 15px);
  top: calc(50% - 1px);
  transform: rotate(90deg);
}

input[type='file'] {
  display: none;
}
```

_JS_

```js
var file = document.querySelector('#file')
var div = document.querySelector('.uploadImg')
var cross = document.querySelector('.cross')
console.log(div.firstChild)
file.onchange = function () {
  // 创建 filereader 用来读取文件
  var reader = new FileReader()
  // 获取到文件内容
  var content = file.files[0]
  if (content) {
    reader.readAsDataURL(content)
  }
  reader.onload = function () {
    // 设置 div 背景图像从而实现预览效果
    div.style.background = `url(${reader.result}) center/cover no-repeat`
    cross.style.opacity = 0
  }
}
```

## 6. _File System Access API_

看上去上面的 _File API_ 还不错，能够读取到本地的文件，但是它和离线存储有啥关系？

我们要的是离线存储功能，能够将数据存储到本地。

嗯，确实 _File API_ 只能够做读取的工作，但是有一套新的 _API_ 规范又推出来了，叫做 _File System Access API_。

是的，你没有听错，这是**两套规范**，千万没弄混淆了。

- _File API_ 规范：*https://w3c.github.io/FileAPI/*

- _File System Access API_ 规范：*https://wicg.github.io/file-system-access/*

关于 _File System Access API_，这套方案应该是未来的主角。它提供了比较稳妥的本地文件交互模式，即保证了实用价值，又保障了用户的数据安全。

这个 _API_ 对前端来说意义不小。有了这个功能，_Web_ 可以提供更完整的功能链路，从打开、到编辑、到保存，一套到底。不过遗憾的是目前只有 _Chrome_ 支持。

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926197347_2021-12-02-022204.png" alt="image-20211202102203944" style="zoom:50%;" />

（图为该 _API_ 目前在各大浏览器的支持情况，可以看到全线飙红）

目前针对该 _API_ 的相关资料，无论是中文还是英文都比较少，如果对该 API 感兴趣的同学，下面给出两个扩展阅读资料（英文）

- _MDN_：*https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API*

- _web.dev_：*https://web.dev/file-system-access/*

---

-_EOF_-
