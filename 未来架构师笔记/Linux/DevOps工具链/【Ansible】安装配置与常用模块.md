## 1. Ansible 是什么

Ansible 是**基于 SSH** 的批量自动化运维工具，无需在被管机器上安装 agent。一个主控机（控制节点）通过 SSH 就能批量管理几百台机器，常用于批量部署、配置管理、CI/CD 发布。

## 2. 安装

```bash
# yum 方式（推荐，会自动创建 /etc/ansible 目录和配置文件）
yum install ansible
```

**pip 方式**（可指定版本，但需手动创建 /etc/ansible）：

```bash
mkdir ~/.pip
vim ~/.pip/pip.conf
# [global]
# index-url = https://mirrors.aliyun.com/pypi/simple/
# [install]
# trusted-host = mirrors.aliyun.com

pip3 install ansible
pip3 install ansible==2.6.2   # 指定版本
```

> 提醒：pip 方式安装后需**自行创建** `/etc/ansible` 目录及 hosts/ansible.cfg 等文件；yum 方式会自动创建。

## 3. 清单文件（Inventory）

清单文件定义要管理哪些机器。默认静态清单是 `/etc/ansible/hosts`；也可以放到任何路径，运行时用 `-i 路径` 指定。

```ini
[web]
web1.example.com
web2.example.com

[db]
db1.example.com
db2.example.com

[webdb:children]     # 嵌套组：通过 :children 后缀定义
web
db
```

**批量简化写法**（连续编号）：

```ini
[web]
web[1:2].example.com

[db]
db[1:2].example.com

[webdb:children]
web
db
```

**清单验证：**

```bash
ansible web --list            # 列出 web 组
ansible all --list-hosts      # 查看所有机器列表（不含本地）
ansible all -i /tmp/inventory --list-hosts   # 指定清单文件
ansible localhost --list-hosts               # 本地机器（清单中不用写）
```

## 4. 配置文件

### 4.1 优先级（从高到低）

```text
ANSIBLE_CONFIG 环境变量 > 当前目录(ansible.cfg) > 用户主目录(~/.ansible.cfg) > /etc/ansible/ansible.cfg
```

### 4.2 配置例子

```ini
[defaults]
inventory = ./inventory       # 清单文件
remote_user = testuser        # 远程登录用户
ask_pass = false              # 不询问密码（用 ssh 免密）
deprecation_warnings=false

[privilege_escalation]        # 特权升级配置（怎么提权）
become = true                 # 是否提权
become_method = sudo
become_user = root
become_ask_pass = false
```

### 4.3 SSH 免密与 sudo

```bash
# 主控机生成密钥，并把公钥拷到受控机
ssh-keygen
ssh-copy-id -i /root/.ssh/id_rsa.pub 远程用户@受控机器
# 提醒：远程用户必须在受控机上存在
```

受控机上配 sudo 免密（在 `/etc/sudoers.d/` 下建一个文件，比如 `testuser`）：

```ini
testuser ALL=(ALL) NOPASSWD:ALL
```

> **注意**：如果不写 `NOPASSWD`，配置里 `become_ask_pass` 无论设什么都会提示输入密码。
> 如果没有配置文件，则默认用**主控机当前用户**远程登录。

## 5. 常用模块（ad-hoc 临时命令）

```bash
ansible-doc -l          # 查看有哪些模块
ansible-doc 模块名       # 查看模块使用说明
```

### 5.1 执行命令

```bash
# command：简单命令（不支持管道/重定向）
ansible web -m command -a 'date'

# shell：用到管道等复杂命令时用 shell
ansible web -m shell -a 'echo 123 | passwd --stdin user1'
```

### 5.2 服务管理 service

```bash
# 启动 httpd 并设置开机自启
ansible web -m service -a 'enabled=true name=httpd state=started'
# state 常用值：started/stopped/restarted
```

### 5.3 软件包 yum

```bash
ansible web -m yum -a 'name=vsftpd state=present'   # 安装
ansible web -m yum -a 'name=vsftpd state=absent'    # 卸载
# state: present 安装，absent 卸载，latest 最新版
```

### 5.4 文件属性 file

```bash
ansible web -m file -a 'owner=test group=test mode=644 path=/tmp/1.file'
```

### 5.5 文件复制 copy

```bash
# content：直接写内容到目标文件
ansible web -m copy -a 'content="12121212" dest=/tmp/1 owner=root mode=660'

# src：复制本地文件到远端；remote_src=yes 表示 src 是远端机器上的路径
ansible web -m copy -a 'src=/tmp/1 dest=/tmp/2 remote_src=yes owner=root mode=660'
```

### 5.6 创建用户 user

```bash
ansible web -m user -a 'name="user1"'                 # 创建用户
ansible web -m user -a 'name="user1" state=absent'    # 删除用户
ansible web -m command -a 'id user1'                  # 验证
```

### 5.7 周期性任务 cron

```bash
# 每 10 分钟执行一次 echo hello
ansible web -m cron -a 'minute="*/10" job="/bin/echo hello" name="test cron job"'
# 删除该任务（state=absent，name 要对应上）
ansible web -m cron -a 'name="test cron job" state=absent'
```

### 5.8 单行文本管理 lineinfile

确保指定的一行存在于文件中；不存在则默认在**文件末尾**插入；多行匹配正则时只替换**最后一个**匹配行。

```bash
# 追加一行
ansible web -m lineinfile -a 'path=/tmp/1.file line="0000"'

# 按正则匹配替换（把以 12 开头的行改成 #12）
ansible web -m lineinfile -a 'path=/tmp/1.file regexp="^12" line="#12"'

# 删除指定行
ansible web -m lineinfile -a 'path=/tmp/1.file regexp="^000" state=absent'
```

> `backrefs=yes`：正则没匹配到任何行时**不做任何操作**，保持文件不变。
