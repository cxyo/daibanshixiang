# 滴答待办

一个类似「滴答清单」的纯前端待办事项管理网页应用，支持任务增删改查、截止时间、重复提醒、四象限分类，移动端自适应，可安装为 PWA。

## 功能特性

- ✅ 任务的增删改查
- 📅 截止日期与提醒时间设置
- 🔄 按天 / 周 / 月 / 年重复
- 🎯 四象限分类视图（重要 & 紧急）
- 📌 置顶任务
- 🏷️ 标签管理
- 📱 手机端底部导航，桌面端侧边栏
- 💾 数据本地存储（IndexedDB）
- 📥 数据导入 / 导出备份
- 🔔 浏览器通知提醒（需授权）
- 📲 支持 PWA，可添加到主屏幕

## 技术栈

- React 19 + TypeScript + Vite
- TailwindCSS 4
- react-router-dom v6
- Zustand（状态管理）
- Dexie.js（IndexedDB）
- @dnd-kit（拖拽）
- dayjs（日期处理）
- vite-plugin-pwa

## 快速开始

```bash
# 进入项目目录
cd todo-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器默认运行在 http://localhost:5173，手机和电脑在同一局域网时可用手机浏览器访问该地址。

## 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录，可部署到任意静态托管服务（GitHub Pages、Vercel、Netlify、Cloudflare Pages 等）。

## 使用说明

1. **添加任务**：点击右下角蓝色加号，填写标题、描述、截止时间、提醒时间、重复规则、优先级、标签等信息。
2. **完成任务**：点击任务左侧圆圈标记完成；重复任务完成后会自动生成下一次提醒。
3. **编辑任务**：点击任务卡片即可编辑。
4. **四象限**：在「更多」页面点击「四象限视图」，拖拽任务到不同象限即可分类。
5. **备份数据**：在「更多」页面导出 JSON 备份；换设备或浏览器时可通过导入恢复。

## 注意事项

- 所有数据保存在浏览器本地（IndexedDB），清除浏览器数据会导致丢失，请定期导出备份。
- 浏览器通知仅在网页打开或处于后台标签页时生效，关闭浏览器后无法保证准时提醒。

## 项目结构

```
todo-app/
├── public/              # 静态资源与 PWA 图标
├── src/
│   ├── components/      # 页面组件
│   ├── db/              # Dexie 数据库
│   ├── lib/             # 工具函数（日期、四象限、重复规则、通知）
│   ├── pages/           # 页面
│   ├── store/           # Zustand 状态管理
│   ├── types/           # TypeScript 类型
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── index.html
├── package.json
└── vite.config.ts
```

## License

MIT
