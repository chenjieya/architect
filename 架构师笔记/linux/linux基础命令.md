
关机： `poweroff`、`init 0`、`shutdown -h now/+number`、`halt`

重启：`reboot`、`init 6`、 `shutdown -r now/+number`

网卡重启： `ifdown ens34 && ifup ens34 (老版命令)`、`nmcli c down ens34 && nmcli c up ens34(新版命令)` 

查看路由表：`route`

已数字形式查看： `route -n`

查看访问某个ip，走的那个路由表：`ip route get 需要访问的ip`

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/202509081339851.png)

- 192.168.1.6： 代表要访问的路由
- via下一跳是什么 192.168.1.1
- dev: 数据是从网卡ens33出去的
- 网卡的ip是：192.168.0.110

网卡配置文件： `/etc/sysconfig/network-scripts/网卡文件`


vim编辑器：

配置文件: `用户配置文件： ~/.vimrc`、 `全局配置文件：/etc/vimrc`

浏览模式：
回到第一行： 小写的`gg`
精确制导：`:number`
回到最后一行：大写的`G`
回到某一行行头：`0`
回到某一行行尾：`$`

复制一行： `yy`
黏贴到光标所在行后面： `p`
黏贴到光标所在行前面： 大写`P`

复制多行：`y${n}y`

进入可视化模式： `v`

删除行(剪切)：`dd`
删除光标之后的： `D`

撤销： `u`

查找并替换：`:1,$ s/内容/替换成的内容/g`

将另一个文件内容写入到我当前的文件中： `:r 文件路径`

文件另存为：`:w 文件名`

保持黏贴的格式： `:set paste`



管道和常用命令：
查看该文件的最后十行： `tail -n 10 filename`
实时监控文件的最后一行： `tail -n 1 -f filename`
查看文件前十行：`head -n 10 filename`

查看文件信息：`file 对应文件名`(查看文件格式，文件、目录、还是ASII)、`stat 文件`（文件和目录详细信息）

计算大小： `du -sh  目录`
查看磁盘挂载情况： `df -h`

打包压缩：针对`.gz`、`.bz2`格式。`tar -jxvpf/-jcvpf/-zxvpf/-zcvpf  输出文件 --exlcude=sysconfig(被排除的目录或文件)  源文件或目录`
如果名字有问题，可以使用`file 文件`查看是用的那种方式打包的
解压缩： `tar -jxvpf 目标文件  -C 输出文件目录`
查看打包压缩有那些文件： `tar tvf etc.tar.bz2`
解包解压缩某一个文件出来：`tar -jxvpf etc.tar.bz2 etc/pnpm2paa.conf`

打包压缩，但是会删除原来得文件：`gzip -9 要压缩得文件`
压缩：`gzip -r 输出文件名 要压缩得文件`


管道命令： |
前方命令得输出结果，作为后放命令得参数

`grep`命令，过滤输出结果:
![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/202509101443925.png)


`grep -v` 反向选择，符合条件得结果不要。

`grep 127.0.0.1 | grep 192.168.0.1`  这是并且
`egrep "127.0.0.1 | 192.168.0.1"` 这是或者得意思

忽略大小写： `grep -i`

找内容在那个文件里面： `grep -r "内容" ./`
从文件中匹配键值对： `grep -o pass=...... 文件名`
列出命中条件的上下文： `cat xxx | grep -A 5(后五行) -B 5 abc`




