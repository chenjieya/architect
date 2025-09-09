
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



