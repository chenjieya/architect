sudo 和 su

1、su 的使用

​ su - //切换到 root 用户下

​ su - Username //切换到 userame 用户下

​ su - 和 su 的区别

​ //建议使用 - 是否读入想切换的身份者的环境参数文件 -彻底转换，未加-，会保留之前的（PATH 和 pwd）

​ 退出用户用 exit

2、sudo 的使用

​ 用户执行命令的使用，在命令前面加 sudo，实现提权执行

​ 1）编辑 sudo

​ visudo 和 vim /etc/sudoers

​ 2) 配置 sudo

​ 用户或组 登录的主机 = (可切换的身份) 可执行的命令

​ 用户或组：username %groupname 或用别名 User_Alias ADMINS = jsmith,

​ 登录的主机： hostname

​ 可切换的身份系统上的用户，如果没有指定，默认是进行 root 的身份切换 。是 ALL,就是可切换成任何本机上的帐号

​ 可以执行的命令 NOPASSWD: ALL 无需输入当前用户的密码，所有命令都可执行

​ 无 NOPASSWD，就需输入当前用户的密码

​ 列子：

​ 例子 1： %wheel ALL=(ALL) ALL

​ 例子 2： wheel ALL=(ALL) NOPASSWD: ALL

​ 例子 3：

​ User_Alias ADMPW = jsmith, mikem

​ ADMPW ALL = NOPASSWD: !/usr/bin/passwd,/usr/bin/passwd [A-Za-z*],!/usr/bin/passwd root

​ 例子 4：Cmnd_Alias SOFTWARE = /bin/rpm, /usr/bin/up2date, /usr/bin/yum

​ ADMPW ALL = SOFTWARE
