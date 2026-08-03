---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

_WebSQL_ 数据库 _API_ 并不是 _HTML5_ 规范的一部分，但是它是一个独立的规范，引入了一组使用 _SQL_ 操作客户端数据库的 _APIs_。

如果你之前接触过诸如像 _MySQL_ 这样的关系型数据库，学习过 _SQL_ 语言，那么 _WebSQL_ 对于你来讲没有任何的难度。

最新版的 _Safari, Chrome_ 和 _Opera_ 浏览器都支持 _WebSQL_。

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926327961_2021-12-01-015120.png" alt="image-20211130142613099" style="zoom:50%;" />

在 _WebSQL_ 中，有 _3_ 个核心方法：

- _openDatabase_：这个方法使用现有的数据库或者新建的数据库创建一个数据库对象。

- _transaction_：这个方法让我们能够控制一个事务，以及基于这种情况执行提交或者回滚。

- _executeSql_：这个方法用于执行实际的 _SQL_ 查询。

## 1. 打开数据库

我们可以使用 _openDatabase( )_ 方法来打开已存在的数据库，如果数据库不存在，则会创建一个新的数据库，使用代码如下：

```js
var db = openDatabase("mydb", "1.0", "Test DB", 2 * 1024 * 1024);
```

在上面的代码中，我们尝试打开一个名为 _mydb_ 的数据库，因为第一次不存在此数据库，所以会创建该数据库，版本号为 _1.0_，大小为 _2M_。

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926327961_2021-12-01-015135.png" alt="image-20211130142639596" style="zoom:50%;" />

_openDatabase( )_ 方法对应的 _5_ 个参数：

- 数据库名称

- 版本号

- 描述文本

- 数据库大小

- 创建回调

第 _5_ 个参数，创建回调会在创建数据库后被调用。

## 2. 执行操作

执行操作使用 _database.transaction( )_ 函数：

```js
var db = openDatabase("mydb", "1.0", "Test DB", 2 * 1024 * 1024);
db.transaction(function (tx) {
  tx.executeSql("CREATE TABLE IF NOT EXISTS LOGS (id unique, log)");
});
```

上面的语句执行后会在 '_mydb_' 数据库中创建一个名为 _LOGS_ 的表。

该表存在 _2_ 个字段 _id_ 和 _log_，其中 _id_ 是唯一的。

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926327962_2021-12-01-015142.png" alt="image-20211130142711069" style="zoom:50%;" />

## 3. 插入数据

在执行上面的创建表语句后，我们可以插入一些数据：

```js
var db = openDatabase("mydb", "1.0", "Test DB", 2 * 1024 * 1024);
db.transaction(function (tx) {
  tx.executeSql("CREATE TABLE IF NOT EXISTS STU (id unique, name, age)");
  tx.executeSql('INSERT INTO STU (id, name, age) VALUES (1, "张三", 18)');
  tx.executeSql('INSERT INTO STU (id, name, age) VALUES (2, "李四", 20)');
});
```

在上面的代码中，我们创建了一张名为 _STU_ 的表，该表存在 _3_ 个字段 _id，name_ 和 _age_。

之后我们往这张表中插入了 _2_ 条数据。

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926327963_2021-12-01-15151.png" alt="image-20211130142729393" style="zoom:67%;" />

我们也可以使用动态值来插入数据：

```js
var stuName = "谢杰";
var stuAge = 18;
var db = openDatabase("mydb", "1.0", "Test DB", 2 * 1024 * 1024);
db.transaction(function (tx) {
  tx.executeSql("CREATE TABLE IF NOT EXISTS STU (id unique, name, age)");
  // tx.executeSql('INSERT INTO STU (id, name, age) VALUES (1, "张三", 18)');
  // tx.executeSql('INSERT INTO STU (id, name, age) VALUES (2, "李四", 20)');
  tx.executeSql("INSERT INTO STU (id, name, age) VALUES (3, ?, ?)", [
    stuName,
    stuAge,
  ]);
});
```

在上面的代码中，我们使用动态值的方式插入了一条数据，实例中的 _stuName_ 和 _stuAge_ 是外部变量，_executeSql_ 会映射数组参数中的每个条目给 "?"。

> 注意：由于上一次操作已经插入了 _id_ 为 _1_ 和 _2_ 的数据，所以这一次插入内容时，要将前面两次插入语句注释调，否则插入操作不会成功。因为这里是一个事务，前面失败了会导致后面也失败。

## 4. 读取数据

以下实例演示了如何读取数据库中已经存在的数据：

```html
<div id="status"></div>
```

```js
var stuName = "谢杰";
var stuAge = 18;
// 打开数据库
var db = openDatabase("mydb", "1.0", "Test DB", 2 * 1024 * 1024);
// 插入数据
db.transaction(function (tx) {
  tx.executeSql("CREATE TABLE IF NOT EXISTS STU (id unique, name, age)");
  tx.executeSql('INSERT INTO STU (id, name, age) VALUES (1, "张三", 18)');
  tx.executeSql('INSERT INTO STU (id, name, age) VALUES (2, "李四", 20)');
  tx.executeSql("INSERT INTO STU (id, name, age) VALUES (3, ?, ?)", [
    stuName,
    stuAge,
  ]);
});

// 读取操作
db.transaction(function (tx) {
  tx.executeSql(
    "SELECT * FROM STU",
    [],
    function (tx, results) {
      var len = results.rows.length,
        i;
      msg = "<p>查询记录条数: " + len + "</p>";
      document.querySelector("#status").innerHTML += msg;

      for (i = 0; i < len; i++) {
        msg =
          "<p><b>" +
          results.rows.item(i).name +
          ":" +
          results.rows.item(i).age +
          "</b></p>";
        document.querySelector("#status").innerHTML += msg;
      }
    },
    null
  );
});
```

在上面的代码中，第二个部分是读取数据的操作。这里我们仍然是使用的 _executeSql( )_ 方法来执行的 _SQL_ 命令，但是用法又不一样了。是时候来看一下完整的 _executeSql( )_ 方法是什么样了。

```js
executeSql(sqlStatement, arguments, callback, errorCallback);
```

该方法完整的语法实际上是接收 _4_ 个参数，分别是：

- _SQL_ 语句
- 参数
- 执行 _SQL_ 语句后的回调
- 错误回调

因此在上面的示例中，我们 _executeSql( )_ 的第三个参数就是执行了 _SQL_ 语句后的回调。我们在回调中可以通过 _results.rows_ 拿到该表中的数据，之后对数据进行业务需求的操作即可。

<img src="https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1771926327962_2021-12-01-015159.png" alt="image-20211130142755739" style="zoom:50%;" />

## 5. 删除数据

删除数据也是使用 _SQL_ 中的语法，同样也支持动态指定的方式。

```js
var stuID = 2;
// 删除操作
db.transaction(function (tx) {
  tx.executeSql("DELETE FROM STU  WHERE id=1");
  tx.executeSql("DELETE FROM STU WHERE id=?", [stuID]);
});
```

在上面的代码中，我们删除了 _id_ 为 _1_ 和 _2_ 的两条数据，其中第二条是动态指定的。

## 6. 修改数据

要修改数据也是使用 _SQL_ 中的语法，同样也支持动态指定的方式。

```js
var stuID = 3;
// 更新操作
db.transaction(function (tx) {
  tx.executeSql("UPDATE STU SET name='王羲之' WHERE id=3");
  tx.executeSql("UPDATE STU SET age=21 WHERE id=?", [stuID]);
});
```

在上面的代码中，我们修改了 _id_ 为 _3_ 的学生，名字修改为“王羲之”，年龄修改为 _21_。

## 7. 总结

目前来看，_WebSQL_ 已经不再是 _W3C_ 推荐规范，官方也已经不再维护了。原因说的很清楚，当前的 _SQL_ 规范采用 _SQLite_ 的 _SQL_ 方言，而作为一个标准，这是不可接受的。

另外，_WebSQL_ 使用 _SQL_ 语言来进行操作，更像是一个关系型数据库，而 _[[IndexedDB]]_ 则更像是一个 _NoSQL_ 数据库， 这也是目前 _W3C_ 强推的浏览端数据库解决方案。

所以本文不再对 _WebSQL_ 做过多的介绍。

如果有兴趣的同学，可以参阅下面的资料进行扩展阅读：

- _View Web SQL data_：*https://developer.chrome.com/docs/devtools/storage/websql/?utm_source=devtools#run*（需要搭梯子）
- _CSDN WebSQL_ 最全详解：*https://blog.csdn.net/weixin_45389633/article/details/107308968*

---

-_EOF_-
