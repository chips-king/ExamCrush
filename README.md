# ExamCrush 期末刷题网站

轻量化在线刷题系统，适合期末复习：课程、章节、题目浏览，查看答案解析，收藏题目，加入错题本，以及后台 PDF 导入题库。

## 功能

- 前台课程列表、章节列表、题目列表
- 题目按 `single`、`blank`、`short`、`code` 筛选
- 做题页支持单选、填空、简答、编程文本作答
- 点击后查看参考答案和解析
- 收藏、错题本、作答进度保存在浏览器 LocalStorage
- 后台通过 `ADMIN_PASSWORD` 做简单保护
- 后台课程、章节、题目新增和删除
- 后台题目编辑
- 电子版 PDF 上传后调用 DeepSeek 转为结构化题库
- 导入预览可编辑，确认后写入数据库

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- Vercel Postgres
- DeepSeek v4
- Vercel

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

```bash
cp .env.example .env
```

填入：

```env
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4
ADMIN_PASSWORD=
```

3. 生成 Prisma Client：

```bash
npm run prisma:generate
```

4. 执行数据库迁移：

```bash
npm run prisma:migrate
```

5. 启动开发环境：

```bash
npm run dev
```

访问 `http://localhost:3000`。

## 部署到 Vercel

1. 在 Vercel 创建项目并连接 GitHub 仓库。
2. 创建或绑定 Vercel Postgres 数据库。
3. 在 Vercel Project Settings -> Environment Variables 配置：

```env
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4
ADMIN_PASSWORD=
```

4. Build Command 建议使用：

```bash
npm run prisma:generate && npm run build
```

5. 首次部署前或部署后执行数据库迁移：

```bash
npm run prisma:migrate
```

如果使用 Vercel CLI，可在拉取环境变量后执行：

```bash
vercel env pull .env.local
npm run prisma:migrate
vercel --prod
```

## API

- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/[id]`
- `DELETE /api/courses/[id]`
- `POST /api/chapters`
- `DELETE /api/chapters/[id]`
- `POST /api/questions`
- `GET /api/questions/[id]`
- `PUT /api/questions/[id]`
- `DELETE /api/questions/[id]`
- `POST /api/import/pdf`
- `POST /api/import/confirm`

写操作需要请求头：

```http
x-admin-password: ADMIN_PASSWORD
```

## 注意

- 第一版只支持电子版 PDF，不支持扫描版 OCR。
- 不包含用户登录系统。
- 不做 AI 自动评分。
- 不运行编程题。
- 不包含复杂权限系统。
