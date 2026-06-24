# Vercel 部署指南

## 🚀 快速部署（推荐）

### 方法一：通过 Vercel CLI

1. **安装 Vercel CLI**
```bash
npm i -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
cd D:\lib\ai-drama-studio
vercel
```

4. **按照提示操作**
- Set up and deploy? → Y
- Which scope? → 选择你的账号
- Link to existing project? → N
- Project name? → ai-drama-studio
- Directory where code is located? → ./
- Override settings? → N

5. **部署完成！**
会显示类似：`https://ai-drama-studio-xxxx.vercel.app`

---

### 方法二：通过 GitHub + Vercel（推荐长期维护）

1. **上传代码到 GitHub**
```bash
cd D:\lib\ai-drama-studio
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/ai-drama-studio.git
git push -u origin main
```

2. **在 Vercel 导入项目**
   - 访问 https://vercel.com
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库
   - 点击 "Deploy"

3. **自动部署**
   - 每次推送代码到 GitHub，Vercel 会自动重新部署

---

## 📋 部署后配置

### 1. 环境变量（如果需要）

在 Vercel 项目设置中添加环境变量：
- `VITE_API_KEY` → 你的 API Key

### 2. 自定义域名（可选）

在 Vercel 项目设置 → Domains 中添加你的域名。

### 3. API 代理配置

`vercel.json` 已配置好 API 代理：
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://open.hongniaoai.com/api/$1"
    }
  ]
}
```

这样前端请求 `/api/xxx` 会自动代理到红鸟AI API。

---

## 💰 价格说明

### Vercel 免费版（Hobby）

| 项目 | 额度 |
|------|------|
| 带宽 | 100 GB/月 |
| 构建时间 | 6000 分钟/月 |
| Serverless Functions | 100 GB-小时/月 |
| 项目数量 | 无限 |
| 自定义域名 | 无限 |

**对于个人项目完全够用！**

### Vercel Pro 版（$20/月）

| 项目 | 额度 |
|------|------|
| 带宽 | 1 TB/月 |
| 构建时间 | 24000 分钟/月 |
| Serverless Functions | 1000 GB-小时/月 |

---

## 🔧 常见问题

### Q: 部署后 API 请求失败？
A: 检查 `vercel.json` 中的代理配置是否正确。

### Q: 如何更新部署？
A: 
- 方法一：重新运行 `vercel`
- 方法二：推送到 GitHub，自动部署

### Q: 如何查看部署日志？
A: 在 Vercel Dashboard → 项目 → Deployments → 点击具体部署

---

## 📱 分享给朋友

部署完成后，把链接发给朋友即可：
```
https://你的项目名.vercel.app
```

朋友打开后需要自己配置 API Key 才能使用生成功能。
