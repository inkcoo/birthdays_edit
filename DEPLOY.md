# Cloudflare Pages 部署完整指南

## 目录

1. [前期准备](#1-前期准备)
2. [生成管理员密码哈希](#2-生成管理员密码哈希)
3. [创建 KV 命名空间](#3-创建-kv-命名空间)
4. [部署到 Cloudflare Pages](#4-部署到-cloudflare-pages)
5. [配置环境变量和 KV 绑定](#5-配置环境变量和-kv-绑定)
6. [初始化生日数据](#6-初始化生日数据)
7. [首次登录和使用](#7-首次登录和使用)

---

## 1. 前期准备

### 1.1 确认 GitHub 仓库已推送

代码应该已经推送到：https://github.com/inkcoo/birthdays_edit

如果没有，执行以下命令：

```bash
cd E:\birthday_edit
git remote add origin https://github.com/inkcoo/birthdays_edit.git
git push -u origin master
```

### 1.2 注册/登录 Cloudflare 账号

访问 https://dash.cloudflare.com/sign-up 注册账号（免费套餐即可）

---

## 2. 生成管理员密码哈希

管理员密码需要使用 **bcrypt** 算法进行哈希处理后存储。

### 方法一：使用在线工具（推荐）

访问：https://qr9.net/bcrypt

**操作步骤：**

1. 打开网站后，在 **Bcrypt 加密** 区域
2. **原密码**：输入你想要设置的管理员密码（例如：`MyBirthday2024!`）
3. **轮数（Salt Rounds）**：输入 `10`（默认值，安全性与性能的平衡）
4. 点击 **加密** 按钮
5. 复制 **加密结果** 区域的哈希值（以 `$2a$10$` 或 `$2b$10$` 开头）

**示例：**
```
原密码：MyPassword123
轮数：10
加密结果：$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

> ⚠️ **重要提示**：
> - 轮数必须设置为 **10**，与代码中的 `SALT_ROUNDS = 10` 一致
> - 妥善保存你的原密码，哈希值不可逆
> - 该网站生成的哈希值格式为 `$2a$10$...` 或 `$2b$10$...`，都是有效的 bcrypt 格式

### 方法二：使用本地命令行工具

```bash
# 安装 bcrypt-cli
npm install -g bcrypt-cli

# 生成密码哈希（轮数 10）
bcrypt-cli hash -s 10 "你的密码"
```

### 方法三：使用 Node.js 脚本

创建 `generate-hash.js`：

```javascript
const bcrypt = require('bcryptjs');

const password = '你的密码';
const hash = bcrypt.hashSync(password, 10);

console.log('密码哈希:', hash);
```

运行：`node generate-hash.js`

---

## 3. 创建 KV 命名空间

### 3.1 通过 Cloudflare Dashboard 创建

1. 登录 https://dash.cloudflare.com/
2. 左侧菜单选择 **Workers & Pages** → **KV**
3. 点击 **Create a namespace**
4. 输入名称：`birthday-manager-kv`（或任意你喜欢的名称）
5. 点击 **Add** 完成创建
6. **记录 Namespace ID**（一串类似 `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` 的字符串）

### 3.2 通过 Wrangler CLI 创建（可选）

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 KV 命名空间
wrangler kv:namespace create "BIRTHDAYS_KV"
```

输出示例：
```
🌀 Creating namespace with title "birthday-manager-BIRTHDAYS_KV".
✨ Success!
Add the following to your wrangler.toml to configure this namespace:

[[kv_namespaces]]
binding = "BIRTHDAYS_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 4. 部署到 Cloudflare Pages

### 4.1 创建 Pages 项目

1. 访问 https://dash.cloudflare.com/
2. 左侧菜单选择 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签
5. 点击 **Connect to Git**

### 4.2 连接 GitHub 仓库

1. 如果首次连接，点击 **Authorize Cloudflare** 授权访问 GitHub
2. 在仓库列表中找到并选择 `inkcoo/birthdays_edit`
3. 点击 **Begin setup**

### 4.3 配置构建设置

在 **Build settings** 页面配置：

| 配置项 | 值 |
|--------|-----|
| **Framework preset** | `Next.js` |
| **Build command** | `npm run build` |
| **Build output directory** | `.next` |
| **Root directory** | 留空（默认） |
| **Environment variables** | 先跳过，稍后配置 |

> ⚠️ **注意**：不要勾选 "Direct Upload"，使用 Git 自动部署

### 4.4 开始部署

1. 点击 **Save and Deploy**
2. 等待部署完成（约 1-2 分钟）
3. 部署成功后会显示预览 URL（如 `https://birthday-manager.xxxxx.pages.dev`）

---

## 5. 配置环境变量和 KV 绑定

### 5.1 进入项目设置

1. 在 Pages 项目页面，点击你的项目名称
2. 点击顶部 **Settings** 标签
3. 在左侧选择 **Functions**

### 5.2 配置 KV 命名空间绑定

1. 找到 **KV namespace bindings** 部分
2. 点击 **Add binding**
3. 填写：
   - **Variable name**: `BIRTHDAYS_KV`（必须与代码中一致）
   - **KV namespace**: 选择第 3 步创建的命名空间
4. 点击 **Save**

### 5.3 配置环境变量

1. 找到 **Environment variables** 部分
2. 点击 **Add variable**
3. 添加以下变量：

| Variable name | Value | Production | Preview |
|---------------|-------|------------|---------|
| `ADMIN_PASSWORD_HASH` | 第 2 步生成的 bcrypt 哈希值 | ✅ | ✅ |
| `JWT_SECRET` | 任意随机字符串（如 `birthday-secret-2024`） | ✅ | ✅ |

4. 点击 **Save** 保存

> ⚠️ **重要**：
> - `ADMIN_PASSWORD_HASH` 必须完全复制 bcrypt 哈希值，不要有多余空格
> - 如果使用在线工具生成的哈希，确保复制完整（通常 60 个字符）

### 5.4 重新触发部署

配置完成后，需要重新部署使配置生效：

1. 进入项目 **Deployments** 标签
2. 点击 **Retry deployment** 或 **Create new deployment**
3. 或者在 GitHub 推送一个空提交触发自动部署：
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

---

## 6. 初始化生日数据

### 6.1 通过 Dashboard 添加初始数据

1. 返回 Cloudflare Dashboard
2. 左侧菜单选择 **Workers & Pages** → **KV**
3. 点击你创建的 KV 命名空间（如 `birthday-manager-kv`）
4. 点击 **Create key**
5. 填写：
   - **Key**: `birthdays.txt`（必须完全一致）
   - **Value**: 初始生日记录，例如：
   ```
   张三 -05-15-a-技术部
   李四 -08-20-b-市场部
   王五 -1990-12-01-a
   ```
   - **Expiration**: 留空（永不过期）
6. 点击 **Save**

### 6.2 数据格式说明

支持以下四种格式：

```
# 格式 1: 姓名 - 年 - 月-日-类型 (带年份不带部门)
张三 -1990-05-15-a

# 格式 2: 姓名 - 月-日-类型 (不带年份不带部门)
李四 -08-20-a

# 格式 3: 姓名 - 月-日-类型-部门 (不带年份带部门)
王五 -03-12-b-技术部

# 格式 4: 姓名 - 年 - 月-日-类型-部门 (带年份带部门)
赵六 -1985-12-01-a-市场部
```

**类型说明：**
- `a` = 公历（阳历）
- `b` = 农历（阴历）

---

## 7. 首次登录和使用

### 7.1 访问管理后台

1. 在 Pages 项目页面，点击你的预览 URL（如 `https://birthday-manager.xxxxx.pages.dev`）
2. 点击 **管理后台** 或访问 `/admin`
3. 输入你设置的管理员密码（第 2 步的原密码，不是哈希值）
4. 点击 **登录**

### 7.2 生成 API 密钥

1. 登录成功后，点击顶部 **API 密钥** 标签
2. 点击 **生成密钥** 按钮
3. 系统会生成一个 16 位随机密钥
4. 复制完整的 API 端点 URL，例如：
   ```
   /api/public/birthdays?m=Ab3dEf7hIj9kLm2n
   ```

### 7.3 测试公开 API

使用浏览器或 curl 测试：

```bash
# 替换为你的域名和密钥
curl https://birthday-manager.xxxxx.pages.dev/api/public/birthdays?m=Ab3dEf7hIj9kLm2n
```

应该返回 `birthdays.txt` 的纯文本内容。

### 7.4 Python 对接示例

```python
import requests

# 配置
DOMAIN = "https://birthday-manager.xxxxx.pages.dev"
API_KEY = "Ab3dEf7hIj9kLm2n"  # 替换为你的密钥

# 获取生日数据
url = f"{DOMAIN}/api/public/birthdays?m={API_KEY}"
response = requests.get(url)

if response.status_code == 200:
    # 解析数据
    for line in response.text.strip().split('\n'):
        parts = line.split('-')
        name = parts[0]
        month = parts[-3] if len(parts) >= 4 else parts[1]
        day = parts[-2] if len(parts) >= 4 else parts[2]
        print(f"{name}: {month}月{day}日")
else:
    print(f"请求失败：{response.status_code}")
    print(response.text)
```

---

## 常见问题排查

### Q1: 登录时提示"服务器配置错误"

**原因**：`ADMIN_PASSWORD_HASH` 环境变量未配置或配置错误

**解决**：
1. 检查 Pages Settings → Functions → Environment variables
2. 确认 `ADMIN_PASSWORD_HASH` 已配置且值正确
3. 重新部署项目

### Q2: 获取生日记录失败

**原因**：KV 绑定未配置或 `birthdays.txt` 键不存在

**解决**：
1. 检查 KV namespace binding 是否配置为 `BIRTHDAYS_KV`
2. 在 KV 存储中创建 `birthdays.txt` 键
3. 确认 KV namespace ID 正确

### Q3: API 密钥验证失败

**原因**：密钥未生成或 KV 中无存储

**解决**：
1. 登录管理后台
2. 进入 API 密钥标签页
3. 点击生成密钥
4. 确认 KV 中有 `api_secret_key` 键

### Q4: 密码哈希校验不通过

**可能原因**：
1. 在线工具使用的轮数不是 10
2. 复制哈希值时有多余字符
3. 使用了不兼容的 bcrypt 变体

**验证方法**：
- 确认 https://qr9.net/bcrypt 网站轮数设置为 `10`
- 哈希值应以 `$2a$10$` 或 `$2b$10$` 开头
- 重新生成哈希并更新环境变量

---

## 安全建议

1. **密码强度**：管理员密码建议至少 12 位，包含大小写字母、数字和特殊字符
2. **API 密钥**：定期重置 API 密钥，避免泄露
3. **环境变量**：不要在代码中硬编码任何敏感信息
4. **访问控制**：不要公开分享管理后台链接

---

## 部署完成检查清单

- [ ] GitHub 仓库已推送
- [ ] Cloudflare Pages 项目已创建
- [ ] KV 命名空间已创建并绑定
- [ ] `ADMIN_PASSWORD_HASH` 环境变量已配置
- [ ] `birthdays.txt` 初始数据已添加到 KV
- [ ] 能够成功登录管理后台
- [ ] API 密钥已生成
- [ ] 公开 API 可以正常访问

完成以上所有步骤后，你的生日记录管理平台就部署完成了！🎉
