## 1. ELK 是什么

ELK = **E**lasticsearch（搜索存储） + **L**ogstash（日志采集处理） + **K**ibana（可视化），用于日志的集中采集、分析、检索和展示。

## 2. 安装 JDK（源代码方式）

```bash
cd /usr/local/src
tar -zxvpf jdk-8u161-linux-x64.tar.gz
mv jdk1.8.0_161 /usr/local/jdk
```

配置环境变量（`/etc/profile` 末尾）：

```bash
#JDK
export JAVA_HOME=/usr/local/jdk
export JAVA_BIN=/usr/local/jdk/bin
export PATH=$PATH:$JAVA_HOME/bin
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME JAVA_BIN PATH CLASSPATH
```

```bash
source /etc/profile
java -version   # 验证版本
```

> 也可以用 `yum install java-1.8.0-openjdk.x86_64` 快速安装。

## 3. 安装 Elasticsearch

```bash
cd /usr/local/src
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.2.4.rpm
rpm -ivh elasticsearch-6.2.4.rpm

systemctl daemon-reload
systemctl enable elasticsearch.service
systemctl start elasticsearch.service
```

### 3.1 修改配置

编辑 `/etc/elasticsearch/elasticsearch.yml`，去掉以下行的注释：

```yaml
bootstrap.memory_lock: true    # 锁住内存，防止 JVM swapping 降低效率
http.port: 9200                # 对外端口
```

> 锁内存前提：`ulimit -l unlimited`，并保证机器有足够内存。

```bash
systemctl restart elasticsearch.service
netstat -ntupl | grep :9200    # 确认端口已开
```

### 3.2 常见坑：OOM

机器内存太小（如 1G）时 elasticsearch 会被 OOM killer 杀掉（`dmesg` 可见 oom 输出）。调整 JVM 内存：

```bash
vim /etc/elasticsearch/jvm.options
# -Xms1g
# -Xmx1g
# 改成 512m（生产环境不建议调小，内存够用可以调大）
-Xms512m
-Xmx512m
```

## 4. 安装 Kibana

```bash
rpm -ivh kibana-6.2.4-x86_64.rpm
vim /etc/kibana/kibana.yml    # 去掉 2、7、21 行的注释

systemctl enable kibana.service
systemctl start kibana.service
netstat -ntpl | grep :5601    # kibana 默认 5601
```

## 5. 安装 Logstash

```bash
rpm -ivh logstash-6.2.4.rpm
systemctl enable logstash.service
systemctl start logstash.service
```

## 6. Nginx 反向代理 + 认证

用 nginx 代理 es/kibana 对外提供服务，kibana 加 basic 认证：

```nginx
# /usr/local/nginx/conf/conf.d/elasticsearch.conf（代理 ES，端口 81）
server {
    listen 81;
    server_name e.example.com;
    location / {
        proxy_pass http://localhost:9200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```nginx
# /usr/local/nginx/conf/conf.d/kibana.conf（代理 kibana，加密码认证）
server {
    listen 80;
    server_name elk.example.com;
    auth_basic "Restricted Access";
    auth_basic_user_file /usr/local/nginx/.kibana-user;
    location / {
        proxy_pass http://localhost:5601;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
htpasswd -c /usr/local/nginx/.kibana-user admin   # 生成认证用户
service nginx restart
```

> 配置前需把主配置 nginx.conf 中默认的 server 段去掉。验证：客户端绑定 `192.168.31.146 elk.example.com / e.example.com` 后访问。

## 7. Logstash 三大组件

Logstash 管道由 Input → Filter → Output 组成。

### 7.1 Input（输入）

| 输入方式 | 说明 |
| --- | --- |
| Filebeat | 轻量级采集器，采集本地文件、容器、远程主机日志 |
| Beats | 支持 Docker、K8s 等来源 |
| TCP/UDP Socket | 基于 TCP/UDP 的日志传输 |
| Grok | 基于正则匹配日志字段 |
| Kafka | 分布式消息队列，适合实时传输 |
| Redis PubSub | 基于 Redis 发布订阅 |

### 7.2 Filter（过滤解析）

| 过滤插件 | 作用 |
| --- | --- |
| grok | 正则匹配字段（最常用） |
| mutate | 修改字段值、增删字段 |
| date | 解析日期格式 |
| split | 按分隔符切割日志 |
| json | 解析 JSON 日志 |
| geoip | 地理位置解析 |
| ruby | 调用 ruby 脚本做复杂处理 |

### 7.3 Output（输出）

Elasticsearch（默认）、Kafka、AMQP、HDFS、InfluxDB、JDBC 等。

### 7.4 常见架构

```text
日志源 -> Filebeat -> Logstash -> Elasticsearch -> Kibana
                             \-> Kafka（缓存削峰）-> 其他存储
```

## 8. Logstash 采集日志配置

### 8.1 采集系统日志

```ruby
input {
    file {
        path => "/var/log/messages"
        type => "systemlog"
        start_position => "beginning"
        stat_interval => "3"
    }
    file {
        path => "/var/log/secure"
        type => "securelog"
        start_position => "beginning"
        stat_interval => "3"
    }
}

output {
    if [type] == "systemlog" {
        elasticsearch {
            hosts => ["localhost:9200"]
            index => "system_log_%{+YYYY.MM.dd}"
        }
    }
    if [type] == "securelog" {
        elasticsearch {
            hosts => ["localhost:9200"]
            index => "secure_log_%{+YYYY.MM.dd}"
        }
    }
}
```

### 8.2 采集 nginx 日志

```ruby
input {
  file {
    path => "/usr/local/nginx/logs/access.log"
  }
}
output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "nginxlog-%{+YYYY.MM.dd}"
  }
  stdout { codec => rubydebug }    # 同时把抓到的数据显示在终端
}
```

### 8.3 启动 logstash

```bash
cd /usr/share/logstash
./bin/logstash -f example/nginx.conf -t    # -t 语法检查
./bin/logstash -f example/nginx.conf       # 启动
```

> 启动方式：nohup+&、screen、systemd、supervisord、脚本方式。**一台机器不能同时开多个 logstash**。
