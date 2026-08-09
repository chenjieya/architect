---
author: ai
ai_editable: true
summary: '本笔记讲 GitLab 平台本身（安装、项目/用户/协同）。git 基础命令（提交、分支、暂存、远程）见 git从入门到精通。'
refs:
  pages:
    - 'git从入门到精通'
  raw:
    - path: 'raw/operations-devops/1. gitlab/1.1、gitlab.md'
      sha256: 5bf75ce76161adda8f8f255f0c5394811350e865756c7f8f2fd2931e4521333b
    - path: 'raw/operations-devops/1. gitlab/2.1 gitlab.readme1.md'
      sha256: 9c3adf90e78f47f841234af37a1a0fe219d7b32dc0ad04e73db0f6bda7cbb212
    - path: 'raw/operations-devops/1. gitlab/2.2 gitlab.readme2.md'
      sha256: 1e5c6bfd814c9e6172593644c963bc059eebc94f83df606c3544ed60fbc06435
updated_by: ai
updated: 2026-08-03
---

> 本笔记讲 **GitLab 平台本身**（安装、项目/用户/协同）。git 基础命令（提交、分支、暂存、远程）见 [[git从入门到精通]]。

## 1. GitLab 与 GitHub 的区别

|          | GitHub                   | GitLab                                  |
| -------- | ------------------------ | --------------------------------------- |
| 定位     | 全球最大代码开源社区     | 类似 GitHub，但**可部署到自己的服务器** |
| 私有仓库 | 免费用户建私有仓库需付费 | 免费且开源（MIT 协议）                  |
| 数据归属 | 数据在 GitHub 服务器     | 数据库等一切掌握在自己手里              |
| 适用场景 | 开源项目                 | **团队内部协作开发**                    |

> 简单说：**GitLab 是"个人版的 GitHub"**，适合把团队内部代码托管在自己的服务器上。

### 1.1 发布系统架构

```text
gitlab + docker/k8s + jenkins + ansible
```

一套标准的 CI/CD 发布系统：**git 负责代码托管，[[【Jenkins】安装配置与发布策略|Jenkins]] 和 [[【Ansible】安装配置与常用模块|Ansible]] 负责发布，docker 作为微服务部署的承载体**。

## 2. GitLab 安装

### 2.1 硬件要求

至少 **2 个 CPU、4G 内存**以上，存储尽量用 SSD，大小按项目而定。

### 2.2 方式一：yum 仓库安装

在 `/etc/yum.repos.d/` 下配置仓库：

```ini
[gitlab-ce]
name=GitLab CE Repository
baseurl=https://packages.gitlab.com/gitlab/gitlab-ce/el/8/x86_64/
enabled=1
#gpgcheck=1
#gpgkey=https://packages.gitlab.com/gitlab/gitlab-ce/gpgkey
```

```bash
yum install gitlab-ce --nogpgcheck
```

### 2.3 方式二：rpm 包安装

```bash
yum download gitlab-ce.x86_64 --downloadonly   # 包下载到当前目录
yum install perl -y                             # 安装依赖
# 关闭 selinux 和防火墙
rpm -ivh gitlab-ce-17.3.1-ce.0.el8.x86_64.rpm
```

### 2.4 启动服务

```bash
gitlab-ctl reconfigure   # 第一次初始化（成功后会提示初始密码位置）
gitlab-ctl start         # 以后启动用这个

# 初始管理员密码
cat /etc/gitlab/initial_root_password
```

> 第一次访问平台会提示账户注册方式（开放注册还是管理员注册）。

## 3. 创建项目并提交代码

### 3.1 建组、建项目

1. 在 GitLab 平台上建立一个**组（Group）**
2. 在该组下创建项目（Project），如 `http://192.168.122.51/dev/dypro.git`

### 3.2 克隆并提交

```bash
git clone http://192.168.122.51/dev/dypro.git
cd dypro

# 不配置用户名邮箱，commit 时会提醒
git config --global user.email "root@example.com"
git config --global user.name "root"

echo "ttttt" >> 11111.test
git add .
git commit -m "test"
git push
```

### 3.3 每次提交都让输用户名密码怎么办

**方法一：SSH 密钥方式（推荐）**

SSH 免密登录的原理与配置详解见 [[【SSH】Linux SSH 服务管理与配置详解]]：

```bash
# 生成密钥对
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# 生成的 id_rsa.pub 公钥添加到 GitLab 的 SSH Keys 设置页

# 修改远程 URL 为 SSH 形式
git remote set-url origin git@192.168.122.51:dev/dypro.git
```

**方法二：git 凭据存储**

```bash
git config --global credential.helper store
```

### 3.4 清理 git 配置

```bash
git config --global --unset user.name
git config --global --unset user.email
# 或直接删掉配置文件
rm -f ~/.gitconfig
```

## 4. 用户与权限管理

### 4.1 创建用户

平台底部 Admin 进入管理后台，创建用户（regular 用户）。

**坑**：新建的普通用户**没加入项目前 push 会提示没权限**（`not found or you don't have permission`）。

### 4.2 把用户加入项目

1. 进入对应项目 → 右侧栏 **Manage → Members**
2. 点击 **Invite members**
3. 用户名选刚建的用户，角色选 `developer`，过期时间随意
4. 再次 push 即可

**另一个坑**：刚开通的账号**必须先登录一次**，否则 push 报 `HTTP Basic: Access denied`。

> GitLab 常用角色：Guest（访客）、Reporter（只读）、Developer（开发）、Maintainer（维护）、Owner（拥有者）。

## 5. push 被拒（rejected）的处理

**做 git push 之前，先做 git pull**。

如果远程被别人改过，直接 push 会报：

```text
! [rejected] main -> main (fetch first)
```

正确处理：

```bash
git pull
git push
```

## 6. 分支协同（配合 gitlab）

```bash
git branch          # 查看分支
git checkout -b file1   # 基于当前状态切出新分支
git switch main     # 切换分支（新命令，等价于 git checkout 分支名）

# 把分支同步到 gitlab
git push --set-upstream origin file1
```

> 分支的意义：实验性修改不污染稳定版本；方便多模块并行开发互不影响。切换分支时 **stage 和 unstage 状态会一起切换，注意先用 git stash 保存**。
> 只想回退某个文件到之前的版本：`git checkout <commit_id> -- <file_path>`。
