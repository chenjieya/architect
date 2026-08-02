---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---

## 1. Playbook 剧本基础

### 1.1 概念

- **play**：针对清单中选定的主机运行的一组有序任务
- **playbook**：包含一个或多个按特定顺序运行的 play 的文本文件，YAML 格式，后缀 `.yml`

### 1.2 YAML 缩进规则

```text
- 同一层级的数据元素必须有相同的缩进量
- 子项缩进量必须大于父项
- 使用空格字符缩进（不能用 Tab）
```

### 1.3 基本结构

```yaml
---
- name: 剧本描述
  hosts: web # 对哪些机器操作
  tasks: # 实际执行的操作列表
    - name: 任务描述 # 建议写，方便排查
      service: # 用到的模块
        name: httpd # 模块参数
        state: started
        enabled: true
```

- playbook 按任务文件中的顺序依次执行
- `hosts` 指定目标主机（组名或主机名）
- `tasks` 下的 `name` 是任务描述，可以省略但建议写

### 1.4 运行剧本

```bash
ansible-playbook xxx.yml            # 基本运行
ansible-playbook xxx.yml --forks 1  # 指定并发数
```

## 2. 变量

### 2.1 变量优先级

```text
命令行(额外变量) > play 范围 > 主机范围
```

### 2.2 定义变量的三种方式

**方式一：playbook 开头 vars 块**

```yaml
- name: 例子
  hosts: web
  vars:
    user_name: testuser
    package: vsftpd
  tasks:
    - name: 创建用户
      user:
        name: "{{ user_name }}" # 双花括号引用
```

**方式二：vars_files 引入外部文件**

```yaml
- name: 例子
  hosts: web
  vars_files:
    - users.yml # 变量定义在外部文件
```

`users.yml`：

```yaml
users:
  - name: jim
  - name: tom
```

**方式三：命令行传入（优先级最高）**

```bash
ansible-playbook xxx.yml -e "user_name=root"
```

> 声明过的变量用 `{{ 变量名 }}` 引用，任务执行时 Ansible 会替换成对应值。

### 2.3 register 注册变量 + debug 调试

把命令输出存到变量里，再用 debug 打印出来，用于调试：

```yaml
- name: 使用 register 截获输出
  hosts: web
  tasks:
    - name: 安装 httpd
      yum:
        name: httpd
        state: present
      register: install_result # 注册变量截获输出

    - name: 打印结果
      debug:
        msg: "{{ install_result }}" # 在终端屏幕输出
```

## 3. ansible-vault 变量加密

敏感信息（密码、密钥）可以加密存储：

```bash
ansible-vault create test.yml   # 创建并加密
ansible-vault view test.yml     # 查看
ansible-vault edit test.yml     # 编辑已加密文件
ansible-vault encrypt test.yml  # 未加密 -> 加密
ansible-vault decrypt test.yml  # 已加密 -> 不加密
ansible-vault rekey test.yml    # 改密码
```

运行加密剧本时提供密码：

```bash
ansible-playbook --vault-id @prompt test.yml
ansible-playbook --ask-vault-pass test.yml
ansible-playbook --vault-passwd-file=vault-pw-file test.yml
```

## 4. 事实收集（Facts）

每个 play 在第一个任务前会自动运行 `setup` 模块收集被管机信息（新版本显示为 "Gathering Facts" 任务），这些信息叫 **ansible_facts**。

```bash
# ad-hoc 方式查看事实
ansible web -m setup
```

### 4.1 调用事实变量

```yaml
- name: 打印 IP
  hosts: web
  tasks:
    - debug:
        msg: "{{ ansible_facts['default_ipv4']['address'] }}"
        # 等价写法: {{ ansible_facts.default_ipv4.address }}
```

### 4.2 关闭事实收集（提速）

```yaml
- name: 例子
  hosts: web
  gather_facts: no # 不收集事实，加快速度、减轻受管机负载
  tasks: ...
```

> 如果剧本不涉及事实变量，建议关闭收集。关闭不影响手动运行 setup 模块。
