LVM 磁盘管理

1、LVM 概念
1）与物理磁盘分区相比，逻辑卷管理为管理磁盘空间提供了更灵活的方式。
2）物理磁盘分区中的原始磁盘空间能够合并在一起或者分为若干个名为“逻辑卷”的虚拟分区。
3）可以实现很多强大的功能，例如创建大于任何一个磁盘的文件系统，将一个磁盘分为 14 个以上的文件系统，以及轻松扩展现有文件系统使其具有更大空间而无需对其重新格式化。 4) lvm 组成
物理卷（Physical Volume）：标记为 LVM 的可用空间的分区。在 MBR 磁盘上，用分区类型 0x8e 标记。
卷组（Volume Group）：一个或多个物理卷的集合。可以将其想象成一个虚拟磁盘驱动器
逻辑卷（Logical Volume）：可以将其想象成卷组的虚拟分区。使用文件系统对其格式化，用法如同分区一样。
物理区域（Physical Extent）：每一个物理卷被划分为大小相等的可用于分配的最小存储单元。卷组，逻辑卷是由一个或多个物理卷的物理区域的集合。

​2、LVM 创建
1）创建新物理分区
编辑新分区将其类型更改为 linux lvm（0x8e）
2）建立物理卷
pvcreate /dev/sdb1 /dev/sdc1
pvscan 和 pvdisplay pvremove
3）创建卷组
vgcreate vgname pv //-s 设置 PE 大小默认 4M
vgdisplay vgscan
vgreduce vg0 /dev/test1 将/dev/test1 从 vg0 里剔除
4）创建逻辑卷
lvcreate -L 800M -n data0 exam ----> 从 VG：exam 里建立名称 为 data0 容量为 800M 的逻辑卷
lvcreate -l 200 -n data0 exam //200 个 PE，容量为 200\*4M
lvdisplay 和 lvscan
5）格式化逻辑卷文件系统
mkfs.ext4 /dev/exam/data0
6）进行文件系统挂载
mkdir /data0
mount /dev/exam/data0 /data0
df -h
3、扩展 lvm 1) 验证已挂载文件系统/data0 的当前大小 # df -h /data0 2) 验证“可用物理区块” 是否够用 # vgdisplay vgname
如果不够用，应先增加 pv,然后再扩大 vg,例如：
pvcreate /dev/sdc1
vgextend exam /dev/sdc1 3) 使用部分或全部可用区块扩展逻辑卷 # lvextend -l +20 /dev/vgname/lvname  
 注意：无+号意味着增加到，+表示增加了 4) 扩展在/data0 上挂载的文件系统 # resize2fs -p /dev/vgname/lvname //ext 文件系统
如果是 xfs 文件系统的话，要用 xfs_growfs
如果是 8 版本的系统，要用：xfs_growfs 挂载点（不要用分区，要不然会报错：is not a mounted XFS filesystem） 5) 验证已挂载文件系统/data0 的新的大小 # df -h /data0

4、缩小 lvm 1) 在脱机下进行减少 ext4 文件系统。 # umount /data0 解除挂载要减少的文件系统 2) 在进行大小调整之前验证所有文件系统数据结构是否都已得到清理
#e2fsck -f /dev/vg1/lvm1 3) 将文件系统大小调整为 512MB，假设逻辑卷大于 512MB。 # resize2fs -p /dev/mapper/vgname-lvname 512M 4) 将逻辑卷减少到 512MB。 # lvreduce -L 512M /dev/mapper/vgname-lvname 5) 重新挂载 /etc/fstab 中列出的所有文件系统

5、快照 lvm
1）创建/dev/vgname/lvname 的名为 snaplvname ，大小为 20MB 的新快照卷 # lvcreate -s -n snaplvname -L 20M /dev/vgname/lvname
2）如果备份软件要求，请挂载该快照 # mkdir /snapmount # mount -o ro /dev/vgname/snaplvname /snapmount
3）验证快照逻辑卷的状态： # lvs /dev/vgname/snaplvname
4）不再使用快照时，请解除挂载并删除它： # umount /snapmount # lvremove /dev/vgname/snaplvname
