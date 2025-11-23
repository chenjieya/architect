
在日常运维或开发工作中，经常需要使用一些基础的 Linux 命令来进行系统管理、文件操作、网络调试等。本文对常见命令进行了整理，方便查阅。

## 一、系统管理

### 关机命令

```bash
poweroff                 # 立即关机 
init 0                   # 切换运行级别 0（关机） 
shutdown -h now          # 立刻关机 
shutdown -h +10          # 10 分钟后关机 
halt                     # 停止系统
```

### 重启命令

```bash
reboot                   # 立即重启 
init 6                   # 切换运行级别 6（重启） 
shutdown -r now          # 立刻重启 
shutdown -r +5           # 5 分钟后重启
```

---

## 二、网络管理

### 网卡重启

```bash
# 老版命令（基于 ifconfig） 
ifdown ens34 && ifup ens34  
# 新版命令（基于 NetworkManager） 
nmcli c down ens34 && nmcli c up ens34
```

### 查看路由表

```bash
route          # 查看路由表 
route -n       # 数字形式显示路由表
```

### 查看访问某个 IP 走的路由

`ip route get 192.168.1.6`

示例输出：

- **192.168.1.6**：要访问的 IP
    
- **via 192.168.1.1**：下一跳网关
    
- **dev ens33**：通过网卡 ens33 出口
    
- **src 192.168.0.110**：网卡的本机 IP
	

	![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/202509081339851.png)

### 网卡配置文件

`/etc/sysconfig/network-scripts/ifcfg-网卡名`

---

## 三、vim 编辑器常用命令

### 配置文件路径

- 用户配置文件：`~/.vimrc`
    
- 全局配置文件：`/etc/vimrc`
    

### 移动

- `gg` —— 回到第一行
    
- `:number` —— 跳转到指定行
    
- `G` —— 回到最后一行
    
- `0` —— 行首
    
- `$` —— 行尾
    

### 复制 / 粘贴

- `yy` —— 复制一行
    
- `y${n}y` —— 复制多行
    
- `p` —— 粘贴到光标行后
    
- `P` —— 粘贴到光标行前
    

### 删除

- `dd` —— 删除当前行（剪切）
    
- `D` —— 删除光标后的内容
    

### 可视化模式

- `v` —— 进入可视化模式
    

### 撤销

- `u` —— 撤销操作
    

### 查找替换

`:1,$ s/内容/替换成的内容/g`

### 其他

- `:r 文件路径` —— 将另一个文件内容写入到当前文件
    
- `:w 文件名` —— 文件另存为
    
- `:set paste` —— 保持粘贴的格式
    

---

## 四、文件操作与监控

### 查看文件内容

```bash
tail -n 10 filename        # 查看最后 10 行 
tail -n 1 -f filename      # 实时监控文件最后 1 行 
head -n 10 filename        # 查看前 10 行
```

### 文件信息

```bash
file 文件名                # 查看文件类型 
stat 文件名                # 查看文件详细信息
```

### 磁盘与目录大小

```bash
du -sh 目录                # 查看目录大小 
df -h                      # 查看磁盘挂载情况
```

---

## 五、压缩与解压

### 使用 tar 打包压缩

```bash
# 打包压缩（.gz 或 .bz2） 
tar -zcvpf 压缩包名.tar.gz 源文件/目录 
tar -jcvpf 压缩包名.tar.bz2 源文件/目录  

# 解压缩 
tar -zxvpf 压缩包名.tar.gz -C 输出目录 
tar -jxvpf 压缩包名.tar.bz2 -C 输出目录  

# 查看压缩包内文件 
tar tvf 压缩包.tar.bz2  

# 仅解压压缩包内的某个文件 
tar -jxvpf 压缩包.tar.bz2 etc/pnpm2paa.conf
```

### 使用 gzip 压缩

```bash
gzip -9 文件名        # 压缩文件（会删除原文件） 
gzip -r 目录名        # 递归压缩目录
```

---

## 六、管道与文本处理

### 管道符

`|`：前面命令的输出作为后面命令的输入。

### grep（过滤）

```bash
grep "关键字" 文件 
grep -v "关键字" 文件              # 反选
grep -i "关键字" 文件              # 忽略大小写 
grep -r "内容" ./                 # 在目录下递归搜索  
grep -o "pass=......" 文件名      # 匹配键值对 
cat xxx | grep -A 5 -B 5 abc     # 显示匹配结果及上下文
```

组合用法：

```bash
grep 127.0.0.1 | grep 192.168.0.1   # 并且 
egrep "127.0.0.1|192.168.0.1"       # 或者
```

### sort

```bash
sort file.txt            # 默认按字典序排序
sort -n file.txt         # 按数值大小排序
sort -r file.txt         # 逆序排序
sort -u file.txt         # 去重排序（unique）

sort -k 2 file.txt       # 按第 2 列排序
sort -t ":" -k 3 file.txt # 指定分隔符 ":"，按第 3 列排序

sort -c file.txt         # 检查是否已排序
sort -cn file.txt        # 检查排序并输出未排序行
```

### awk

`awk` 按行处理文本，并按列切分字段（默认分隔符为空格或制表符）。

```bash
awk '{print $1}' file.txt        # 打印第一列
awk '{print $1,$3}' file.txt     # 打印第1列和第3列
awk -F ":" '{print $1}' /etc/passwd  # 指定分隔符为 ":"
```

### cut

```bash
cut -c 1-5 file.txt        # 提取每行的第1到第5个字符
cut -c 3 file.txt          # 提取每行的第3个字符

cut -d ":" -f1 file.txt    # 指定分隔符 ":"，提取第1列
cut -d ":" -f1,3 file.txt  # 提取第1和第3列
cut -d ":" -f2-4 file.txt  # 提取第2到第4列
```

---

## 七、总结

本文整理了 Linux 中常用的 **系统管理、网络配置、Vim 编辑、文件操作、压缩解压、文本处理** 等命令。  
掌握这些命令，可以极大提高日常运维和开发效率。

