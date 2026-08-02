---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---
## 1. 任务失败与异常处理

默认情况下任务失败时，ansible 会在该主机上中止 play 的其余部分。可以通过以下方式自定义行为。

### 1.1 ignore_errors：忽略错误继续执行

```yaml
---
- name: 忽略错误继续后续任务
  hosts: web
  tasks:
    - name: 重启服务（故意写错也没关系）
      service:
        name: htttp
        state: stopped
      ignore_errors: yes    # 即使失败也继续

    - name: 重启 ftp 服务
      service:
        name: vsftpd
        state: restarted
```

### 1.2 force_handlers：失败也执行处理程序

任务失败中止 play 时，之前任务 notify 的 handler 默认**不会执行**；设 `force_handlers: yes` 会强制执行：

```yaml
---
- name: 设置 force_handlers
  hosts: web
  force_handlers: yes
  tasks:
    - name: 重启 httpd
      service:
        name: httpd
        state: restarted
      notify: restart vsftpd

    - name: 故意失败的命令
      command: dateee

  handlers:
    - name: restart vsftpd
      service:
        name: vsftpd
        state: restarted
```

### 1.3 failed_when：自定义失败条件

默认命令返回非 0 才算失败，用 `failed_when` 可以自定义失败条件：

```yaml
---
- name: 测试 failed_when
  hosts: web
  tasks:
    - name: 关闭 ftp 服务
      service:
        name: vsftpd
        state: stopped

    - name: 判断端口是否关了
      shell: /usr/local/scripts/port.sh 21
      register: port_result
      failed_when: "'port is not exist' in port_result.stdout"   # 输出包含该字符串则判定失败
```

### 1.4 changed_when：控制何时报告"已更改"

```yaml
---
- name: 测试 changed_when
  hosts: web
  tasks:
    - name: 判断端口是否关了
      shell: /usr/local/scripts/port.sh 21
      register: port_result
      changed_when: "'port is exist' in port_result.stdout"
      notify:
        - restart_http

  handlers:
    - name: restart_http
      service:
        name: httpd
        state: restarted
```

## 2. 条件 when

`when` 可以对任务/块加条件，满足才执行：

```yaml
---
- name: block and when example
  hosts: web
  tasks:
    - name: block when
      block:
        - name: 写一行到文件
          lineinfile:
            dest: /tmp/d.log
            line: tttttt
            state: present

        - name: 下载文件
          get_url:
            url: ftp://192.168.31.147/pub/url.txt
            dest: /tmp/new.txt

      when: ansible_distribution == "Redhat"   # 系统是 Redhat 才执行整个块
```

## 3. 块结构：block / rescue / always

类似编程语言的 try/catch/finally：

- `block`：正常执行的任务组
- `rescue`：block 中**有任务失败**时执行
- `always`：**无论成败**都会执行

```yaml
---
- name: block rescue always example
  hosts: web
  tasks:
    - name: block when
      block:
        - name: shell-1
          shell:
            cmd: shell-1

      rescue:
        - name: rescue（失败时执行）
          shell:
            cmd: echo "rescue `date`" >> /tmp/bra.log

      always:
        - name: always（总是执行）
          shell:
            cmd: echo "always `date`" >> /tmp/bra.log
```

## 4. 模板 Template（Jinja2）

模板用于生成要下发到受管机的配置文件，比 lineinfile/blockinfile 更强大。模板文件用 `.j2` 后缀，Ansible 用 **Jinja2 模板系统**，变量和表达式在渲染时被替换为对应值。

### 4.1 基础例子

```yaml
---
- name: 模板模块的使用例子
  hosts: web
  vars:
    ssh_port: 222
  tasks:
    - name: 使用 template 下发文件
      template:
        src: ./template.j2     # src 不指定路径时，会在当前路径的 templates 目录下找
        dest: /tmp/test.txt
```

`template.j2`（模板里引用变量和事实）：

```jinja
Port {{ ssh_port }}
ListenAddress {{ ansible_facts['default_ipv4']['address'] }}
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
```

### 4.2 模板中 for 循环

```yaml
vars:
  users:
    - jim
    - tom
    - root
```

`template_user.j2`：

```jinja
{# 演示 for 循环，排除 root #}
{% for myuser in users if not myuser == "root" %}
user number {{ loop.index }} - {{ myuser }}
{% endfor %}
```

JSON 格式输出：

```jinja
{% for myuser in users if not myuser == "root" %}
{{ myuser | to_json }}
{% endfor %}
```

## 5. 角色 Role

角色把 playbook 按职责拆分复用（tasks/handlers/vars/templates 等）。剧本引用角色：

```yaml
---
- name: 利用角色安装 redis
  hosts: web
  roles:
    - role: redis
      rpmdir: /usr/local/src/ttt    # 向角色传参
```

## 6. 并发与串行

**forks**：并行执行的主机数（默认 5）。

```ini
# ansible.cfg 的 [defaults] 段
forks=1
```

```bash
ansible-playbook forks.yml --forks 1   # 或运行时指定，可对比耗时感受并行
```

**serial**：分批执行，每批多少台（滚动发布常用）：

```yaml
---
- name: 测试 serial 参数
  hosts: haproxy
  serial: 1        # 一次只处理一台（逐台滚动）
  tasks:
    - name: 关闭服务
      service:
        name: httpd
        state: stopped
    - name: 开启服务
      service:
        name: httpd
        state: started
```
