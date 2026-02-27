# Cloudflare Pages + GitHub 部署指南

## 方式一：通过 GitHub 自动部署（推荐）

### 1. 创建 GitHub 仓库并推送代码

```bash
# 初始化 git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: birthday manager"

# 在 GitHub 创建新仓库后，执行以下命令
# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/birthday-manager.git
git branch -M main
git push -u origin main
```

### 2. 在 Cloudflare 创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**
4. 选择 `birthday-manager` 仓库
5. 配置构建设置：
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
6. 点击 **Save and Deploy**

### 3. 配置环境变量和 KV

1. 部署完成后，进入项目页面
2. 点击 **Settings** → **Functions**
3. **KV namespace bindings**:
   - 点击 **Add binding**
   - **Variable name**: `BIRTHDAYS_KV`
   - 选择或创建 KV namespace
4. **Environment variables**:
   - 点击 **Add variable**
   - `ADMIN_PASSWORD_HASH`: 你的 bcrypt 密码哈希
   - `JWT_SECRET`: 可选，随机字符串

### 4. 初始化数据

1. 进入 **Workers & Pages** → 你的项目
2. 点击 **Storage** → **KV**
3. 选择绑定的 KV namespace
4. 添加键值对：
   - **Key**: `birthdays.txt`
   - **Value**: 初始生日记录（可以为空）

### 5. 生成管理员密码哈希

```bash
npm install -g bcrypt-cli
bcrypt-cli hash "你的密码"
```

保存输出的哈希值到 Cloudflare 环境变量。

---

## 方式二：使用 Wrangler CLI 直接部署

### 1. 安装 Wrangler

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 KV 命名空间

```bash
wrangler kv:namespace create "BIRTHDAYS_KV"
```

记录输出的 `id`，更新 `wrangler.toml` 文件。

### 4. 配置环境变量

在项目根目录创建 `.dev.vars` 文件（仅本地开发）：
```
ADMIN_PASSWORD_HASH=你的密码哈希
JWT_SECRET=随机密钥
```

生产环境变量在 Cloudflare Dashboard 设置。

### 5. 部署

```bash
npm run deploy
```

---

## 首次使用配置

1. 访问 `https://your-project.pages.dev/admin`
2. 使用设置的密码登录
3. 进入 **API 密钥** 标签页
4. 生成 API 密钥
5. 开始管理生日记录

---

## 公开 API 使用

获取密钥后，API 端点格式：
```
https://your-project.pages.dev/api/public/birthdays?m=你的 16 位密钥
```

Python 示例：
```python
import requests

API_KEY = "你的密钥"
url = f"https://your-project.pages.dev/api/public/birthdays?m={API_KEY}"
response = requests.get(url)
print(response.text)
```
