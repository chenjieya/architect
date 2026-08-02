## 1. 完整发布线路（CI/CD）

```text
获取代码 --> 编译构建 --> 运行测试 --> 部署前备份 --> 部署
```

| 环节 | 说明 |
| --- | --- |
| 获取代码 | git(jenkins) → gitlab/github |
| 编译构建 | 在 jenkins 所在服务器完成编译，产出容器镜像；有些代码（php/python）不用编译可直接发布 |
| 运行测试 | 功能测试、压力测试、安全测试 |
| 部署前备份 | 配置（系统级服务配置文件）和数据（RDS）的备份 |
| 部署 | 部署策略：暴力发布、滚动发布、蓝绿发布等 |

**部署方法：**

- jenkins + ssh 无密码
- jenkins + ansible 自动化
- jenkins + rsync

> 与 gitlab/docker/ansible 的关系见 [[【GitLab】GitLab 安装与协同使用]]。

## 2. 部署策略对比

| 策略 | 做法 | 特点 |
| --- | --- | --- |
| 暴力发布 | 停旧版，直接上新版 | 简单，但有停机时间 |
| 滚动发布 | 逐台/分批更新（配合 ansible serial） | 无停机，但新旧版本混跑 |
| 蓝绿发布 | 准备两套环境，一键切换流量 | 秒级切换、回滚快，但资源双倍 |

## 3. 关于回滚

- **代码回滚**：git 回退到上一个稳定版本，重新构建发布
- **数据回滚**：用部署前备份的数据（RDS）恢复

## 4. 安装与配置

系统要求 CentOS 7（7.5~7.9 均可）。

### 4.1 安装步骤

```bash
# 1）关闭 selinux 和防火墙

# 2）卸载系统原有的 java 版本

# 3）安装 OpenJDK 17
rpm -ivh openlogic-openjdk-17.0.12+7-linux-x64-el.rpm

# 4）安装 jenkins（执行启动脚本）
sh start.sh

# 5）确认端口是否监听（默认 9095）
netstat -ntpl | grep 9095
# 启动失败可看启动脚本同目录的 stdout.log
```

### 4.2 注册开机自启脚本

把 jenkins 脚本放到 `/etc/init.d/` 目录：

```bash
chmod a+x /etc/init.d/jenkins
chkconfig --add jenkins
chkconfig jenkins on
```

> 修改启动脚本后记得 `systemctl daemon-reload` 使修改生效。

## 5. 发布与回滚实验（jenkins + ansible + k8s）

### 5.1 实验环境

```text
192.168.122.52  centos7   (jenkins + ansible)
k8s 集群：master 192.168.122.93，node 192.168.122.94 / 192.168.122.92
```

### 5.2 ansible 配置

`/etc/ansible/hosts`：

```ini
[k8s]
192.168.122.93

[k8s-w]
192.168.122.94
192.168.122.92
```

`/etc/ansible/ansible.cfg`：

```ini
[defaults]
inventory = ./hosts
remote_user = root
ask_pass = false
deprecation_warnings=false

[privilege_escalation]
become = true
become_method = sudo
become_user = root
become_ask_pass = false
```

### 5.3 发布任务脚本（打时间戳版本号）

```bash
cd /etc/ansible
t=`date +"%Y%m%d%H%M%S"`    # 时间戳作为镜像版本号
echo $t

# ① 构建镜像：把 yaml 模板里的镜像版本号替换成新时间戳
[ -f mkdir_scp_bulid.yaml ] && rm -vf mkdir_scp_bulid.yaml
cp mkdir_scp_bulid.yaml_orig mkdir_scp_bulid.yaml
sed -i 's/nginx:v20241016/nginx:v'$t'/g' mkdir_scp_bulid.yaml
/usr/local/bin/ansible-playbook mkdir_scp_bulid.yaml

# ② 导入镜像到 k8s 节点（save + scp + load）
[ -f save_scp_load.yml ] && rm -vf save_scp_load.yml
cp save_scp_load.yml_orig save_scp_load.yml
sed -i 's/nginx:v20241016/nginx:v'$t'/g' save_scp_load.yml
sed -i 's/nginx_v20241016/nginx_v'$t'/g' save_scp_load.yml
/usr/local/bin/ansible-playbook save_scp_load.yml

# ③ 启动 k8s 服务
[ -f k8s_yaml/nginx_dep.yml ] && rm -vf k8s_yaml/nginx_dep.yml
cp k8s_yaml/nginx_dep_orig.yml k8s_yaml/nginx_dep.yml
sed -i 's/nginx:v20241016/nginx:v'$t'/g' k8s_yaml/nginx_dep.yml
/usr/local/bin/ansible-playbook start_k8s_svc.yaml
```

### 5.4 回滚任务脚本

```bash
cd /etc/ansible
/usr/local/bin/ansible-playbook rollout.yml
```

> 涉及的 yaml 模板和 dockerfile 放在实验附件中，部署好 ansible 后整体拷贝到对应目录即可实验。
> k8s 相关概念见 [[【K8s】Kubernetes 概念详解]]。
