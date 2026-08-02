---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---
## 1. Zabbix 是什么

Zabbix 是企业级开源监控平台，采用 **Server/Agent** 架构：Zabbix Server 汇总数据，Agent 安装在被监控主机上采集数据。本文以 Zabbix 6.0 + CentOS 8 + MySQL 为例。

## 2. 服务端（Zabbix Server）安装配置

### 2.1 安装仓库和组件

```bash
# a. 安装 Zabbix 官方仓库
rpm -Uvh https://repo.zabbix.com/zabbix/6.0/rhel/8/x86_64/zabbix-release-latest.el8.noarch.rpm
dnf clean all

# b. 安装 server、前端、agent（包含 nginx + php-fpm + mysql 支持）
dnf install zabbix-server-mysql zabbix-web-mysql zabbix-nginx-conf \
            zabbix-sql-scripts zabbix-selinux-policy zabbix-agent
```

### 2.2 创建数据库

先确保已装好 MySQL（5.7 或 8.0 均可）：

```bash
mysql -uroot -p
# password
mysql> create database zabbix character set utf8mb4 collate utf8mb4_bin;
mysql> create user zabbix@localhost identified by 'password';
mysql> grant all privileges on zabbix.* to zabbix@localhost;
mysql> set global log_bin_trust_function_creators = 1;   # 导入 schema 时需要
mysql> quit;
```

### 2.3 导入初始 schema

```bash
zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql --default-character-set=utf8mb4 -uzabbix -p zabbix
```

导入完成后关闭该选项：

```bash
mysql> set global log_bin_trust_function_creators = 0;
```

### 2.4 配置 zabbix_server.conf

编辑 `/etc/zabbix/zabbix_server.conf`，设置数据库密码：

```ini
DBPassword=password
```

### 2.5 配置 PHP 前端（nginx）

编辑 `/etc/nginx/conf.d/zabbix.conf`，去掉 listen 和 server_name 注释并修改：

```nginx
listen 8080;
server_name example.com;
```

### 2.6 启动服务

```bash
systemctl restart zabbix-server zabbix-agent nginx php-fpm
systemctl enable zabbix-server zabbix-agent nginx php-fpm
```

### 2.7 访问

浏览器访问 `http://IP:8080`。默认用户 **Admin**，默认密码 **zabbix**。

## 3. 客户端（Agent）安装配置

```bash
# a. 安装仓库
rpm -Uvh https://repo.zabbix.com/zabbix/6.0/rhel/8/x86_64/zabbix-release-latest.el8.noarch.rpm
dnf clean all

# b. 安装 agent
dnf install zabbix-agent

# c. 启动并设置开机自启
systemctl restart zabbix-agent
systemctl enable zabbix-agent
```

### 3.1 关键配置

修改客户端配置文件 `/etc/zabbix/zabbix_agentd.conf`：

```ini
Server=服务端IP          # 允许谁来连接（拉取数据）
ServerActive=服务端IP    # 主动模式：agent 主动上报给谁
Hostname=主机名          # 主机名要与服务端添加主机时一致
```

### 3.2 注意事项

1. 三个参数 `Server`、`ServerActive`、`Hostname` 都要指向/配合服务端
2. 确保客户端的 **selinux 和 firewalld 都关闭**（或被放行），否则连不上

## 4. 自定义监控

### 4.1 编写监控脚本

在客户端（如 31.146）上编写自定义监控脚本：

```bash
mkdir /usr/local/scripts
cd /usr/local/scripts
vim check_diy_port.sh     # 脚本内容：检查某个端口，输出 0/1 等
chmod +x check_diy_port.sh
```

### 4.2 修改 zabbix_agentd.conf

在客户端配置中加入自定义 key：

```ini
UserParameter=check_diy_port,/usr/local/scripts/check_diy_port.sh
```

> 仓库方式安装时配置文件在 `/etc/zabbix/zabbix_agentd.conf`；源码安装在 `/usr/local/zabbix/etc/zabbix_agentd.conf`。

修改后重启客户端插件：

```bash
killall zabbix_agentd
/usr/local/zabbix/sbin/zabbix_agentd    # 仓库安装用 systemctl restart zabbix-agent
```

### 4.3 服务端验证

在服务端用 `zabbix_get` 测试是否能取到数据：

```bash
/usr/local/zabbix/bin/zabbix_get -s 192.168.31.146 -k check_diy_port
```

> 仓库方式安装的需要额外安装 zabbix-get 包才有这个命令。

### 4.4 页面添加监控项与触发器

1. **添加监控项**：配置 → 主机 → 监控项 → 创建监控项，key 填 `check_diy_port`
2. **添加触发器**：为监控项设置告警条件（如返回值异常时告警），绑定到该监控项

> 数据采集到告警的完整链路：Agent 脚本 → UserParameter → zabbix_get 验证 → 监控项 → 触发器 → 通知。
