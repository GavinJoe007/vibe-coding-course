# Vibe Coding 从入门到工程化 · 互动课件

> 一套**不用 PPT、直接在网页里学完**的完整课程：从「一句话生成一个网页」到「用 MCP / Skills / Harness / Git 把一个项目做成可迭代、可交接的工程」。
> 配套教学设计见 [`CURRICULUM.md`](./CURRICULUM.md)，网页课件见 [`index.html`](./index.html)。

---

## 一、怎么打开课件

**最简单**：双击 `index.html`，用浏览器打开即可。纯静态、零依赖、无需联网、无需构建、无需起服务。

如果浏览器对本地文件有限制，也可以起一个本地静态服务：

```bash
cd vibe-coding-course
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

### 网页课件里有什么

| 功能 | 说明 |
| --- | --- |
| 10 章课程 | 课程地图 → 第一个作品 → 需求表达 → MCP → Skills → Harness → Git → 组合实战 → 工程化 → 附录 |
| 由简到繁 | 每章标注难度与建议用时，四级项目阶梯贯穿全课 |
| 9 张 SVG 图示 | 五角色关系、MCP 架构、渐进式披露、Agent Loop、Git 时间线等，随主题自动换色 |
| 21 段可复制代码 | 一键复制，带轻量语法高亮；配置文件、命令、SKILL.md、JS 示例都是完整可运行的 |
| 18 道自测题 | 点选即时判分 + 解析，答题状态跨章节保留 |
| 代码 Playground | 内置「今日三件事」成品，改代码 → 点运行 → 右侧 iframe 实时预览 |
| 学习进度 | 章节底部「标记完成」，自动存本机浏览器，侧栏与顶部进度条同步 |
| 全文搜索 | `⌘K` / `Ctrl+K`，检索全部 10 章正文；↑↓ 选择、Enter 跳转 |
| 其他 | 浅色 / 深色切换、← → 翻章、移动端侧栏、URL 锚点深链（如 `index.html#c3`）、打印友好 |

---

## 二、目录结构

```
vibe-coding-course/
├── index.html                  # 课件入口（双击即可）
├── README.md                   # 本文件：怎么打开、怎么改、示例怎么跑
├── CURRICULUM.md               # 课程设计：教学目标 / 课时 / 能力矩阵 / 考核量规
├── .gitignore
├── assets/
│   ├── styles.css              # 全部样式（浅色为默认，深色走 CSS 变量）
│   ├── course-data.js          # 课程元信息 + 内容块辅助函数 B.* + SVG 图示库
│   ├── lessons-1.js            # 第 00–02 章
│   ├── lessons-2.js            # 第 03–05 章（MCP / Skills / Harness）
│   ├── lessons-3.js            # 第 06–09 章（Git / 实战 / 工程化 / 附录）
│   └── app.js                  # 渲染器与全部交互（原生 JS，无框架）
└── examples/                   # 课程里讲到的、能直接打开/运行的真实示例
    ├── hello-vibe/index.html   # 第 1 章成品：单文件「今日三件事」
    ├── AGENTS.md               # 第 2 章：给 AI 看的项目规矩模板
    ├── .gitignore              # 第 6 章：忽略清单模板
    ├── mcp/
    │   ├── mini-mcp.js         # 第 3 章：零依赖 MCP Server（stdio / JSON-RPC）
    │   └── mcp.json            # 第 3 章：MCP 配置示例
    ├── skills/weekly-report/
    │   ├── SKILL.md            # 第 4 章：周报生成 Skill
    │   └── assets/template.md  # 第 4 章：输出模板
    ├── harness/mini-harness.js # 第 5 章：最小 Agent Loop
    └── hooks/settings.json     # 第 5 章：Hooks 示意配置
```

---

## 三、示例工程怎么跑

环境：Node.js 18+（Mac/Linux/Windows 均可）。所有示例都不需要 `npm install`。

### 1）第一个作品（第 1 章）

```bash
open examples/hello-vibe/index.html          # macOS
# Windows: start examples\hello-vibe\index.html
```

### 2）手写 MCP Server（第 3 章）

不装任何 AI 工具也能验证协议 —— 直接往 stdin 喂三行 JSON-RPC：

```bash
cd examples/mcp
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"add","arguments":{"a":2,"b":40}}}' \
  | node mini-mcp.js
```

会依次返回握手信息、工具清单、以及 `42`。要接进真实的 AI 工具，把 `mcp.json` 里的 `/绝对路径` 换成你自己的路径，再把配置合并到对应工具的 MCP 配置文件里（不同工具的位置见课件第 3 章表格），重启工具后问它「现在几点」即可。

> 注意：stdio 模式下 `stdout` 只能输出协议消息，调试日志走 `stderr`。

### 3）最小 Harness（第 5 章）

```bash
node examples/harness/mini-harness.js
```

会打印两轮 Agent Loop、一次 hook、以及最终输出。把里面的 `fakeModel` 换成任意支持 tool_use 的 LLM SDK，这段骨架就是真 Agent。

### 4）使用 Skill（第 4 章）

把 `examples/skills/weekly-report/` 整个文件夹复制到你的用户级 skills 目录（如 `~/.workbuddy/skills/`，具体路径以你所用工具的文档为准），或复制到某个项目的 `.workbuddy/skills/` 下作为项目级 Skill。

### 5）Hooks 配置

`examples/hooks/settings.json` 是**示意思路**，字段名各家工具不同，请以你所用 Agent 的官方文档为准，不要直接照抄路径。

---

## 四、怎么二次编辑这套课件

课件内容是**数据驱动**的：改内容只动 `assets/lessons-1.js` ~ `assets/lessons-3.js`，不用碰 HTML/CSS。

`course-data.js` 里提供了一组极简内容块函数：

```js
B.p('段落，支持 **加粗** 和 `行内代码`')
B.h('二级标题')                      B.sub('三级标题')
B.list(['要点 1', '要点 2'])         B.ol(['步骤 1', '步骤 2'])
B.steps([{ h: '步骤名', x: '说明' }])
B.table(['列1','列2'], [['a','b']])
B.code('javascript', 'const a = 1', '代码说明')
B.note('key', '标题', '正文')        // kind: key | tip | warn | info
B.cards([{ i: '🧠', h: '标题', x: '说明' }])
B.svg('mcp', '图注')                 // 对应 window.SVG 里的键
B.quiz('题目？', ['A','B','C','D'], 1, '解析')
B.task('动手练习', ['任务 1', '任务 2'])
B.sum(['要点 1', '要点 2'])
B.play('Playground 标题', '说明')
B.quote('引用', '出处')
```

新增一章：在对应 `lessons-*.js` 的 `COURSE.chapters.push(...)` 里加一个章节对象，并在 `course-data.js` 的 `COURSE.groups` 里把章节 id 加进某个分组即可（侧栏会自动生成）。
新增一张图：在 `course-data.js` 的 `window.SVG` 里加一个键，SVG 里用 `var(--ink)` / `var(--card)` / `var(--line)` 等变量，就能自动适配深浅色。

---

## 五、这个仓库本身就是第 6 章的演示

本项目已用课程里教的方式初始化了 Git 并提交首个版本。可以照着练：

```bash
git log --oneline --graph --decorate   # 看初始提交
git status                             # 改课件前先看状态
# 按上面「二次编辑」改一段内容
git diff                               # 逐行看 AI / 你改了什么
git add -A && git commit -m "docs: 调整第 3 章 MCP 示例"
git switch -c try-new-color            # 想试大胆改动就开分支
git tag v1.1                           # 可用版本打里程碑
```

**黄金节奏**：改之前有存档 → 改之后看 diff → 验收完再提交 → 不满意 `git restore .` 回档。

---

## 六、环境要求与许可

- 浏览器：Chrome / Edge / Safari / Firefox 近两年版本（用到 `color-mix`、CSS 变量，已加降级声明）
- 运行示例：Node.js 18+；`hello-vibe` 只需浏览器
- 内容可自由用于教学、内部分享与二次改编；第三方产品名与协议名归各自所有者
