/* 第二篇：MCP / Skills / Harness —— 工具三件套 */

COURSE.chapters.push(

/* ================= 03 MCP ================= */
{
  id: 'c3', no: '03', group: '第二篇 · 工具三件套', title: 'MCP：给 AI 装上双手',
  sub: '从「配置一个现成的」到「自己手写 30 行」',
  minutes: 60, level: '进阶 · 需读一点 JS',
  goals: [
    '说清 MCP 解决什么问题、Host/Client/Server 分别是什么',
    '会配置现成 MCP Server，并知道配置文件在哪',
    '理解 JSON-RPC 报文，能自己写一个最小 MCP Server 并手工调试'
  ],
  blocks: [
    B.h('一、痛点：模型只有嘴，没有手'),
    B.p('让聊天窗口里的模型「读一下我今天的会议记录」，它只能说「请把内容贴给我」。因为模型本身**碰不到你的文件系统、打不开网页、查不了实时数据**。就算它知道答案，也没有执行的通道。'),
    B.p('**MCP（Model Context Protocol）** 是 Anthropic 在 2024 年 11 月开源的一套协议，现在已是事实标准。它的类比是 **USB-C**：以前每个 AI 应用要为每个数据源写一套专用插件，现在只要大家都说同一种协议，一个 Server 写一次，任何 Host 都能插上。'),
    B.svg('mcp', '图 3-1　MCP 架构：Host 持有 Client，Client 通过 JSON-RPC 与 Server 通信'),
    B.table(
      ['概念', '是什么', '例子'],
      [
        ['Host', 'AI 应用本体', 'Claude Code、Cursor、WorkBuddy、你自己写的 Agent'],
        ['Client', 'Host 内部为每个连接建立的会话', '一个连接对应一个 Client'],
        ['Server', '一个独立进程，暴露能力', '文件系统 Server、数据库 Server、你自己写的脚本'],
        ['Tools', '**做事**，有入参、有返回', 'read_file / fetch_url / run_sql'],
        ['Resources', '**读数据**，用 URI 标识', 'file:///notes/today.md、数据库表结构'],
        ['Prompts', '预置的**任务模板**', '「代码审查」「写周报」的标准话术'],
        ['Transport', '消息怎么传', 'stdio（本地进程）/ Streamable HTTP（远程服务）']
      ]
    ),
    B.note('key', '一句话记住', '**MCP 不是工具，是工具与 AI 之间的「接口约定」。** 真正干活的是 Server 里的代码；MCP 只规定「怎么发现能力、怎么调用、结果怎么回」。'),

    B.h('二、L1：先用现成的（10 分钟）'),
    B.p('绝大多数时候你不需要写 Server，社区已有大量现成实现。以「让 AI 能读我的笔记 + 抓网页」为例，把下面这段写进配置文件：'),
    B.code('json', `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/绝对路径/我的笔记"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}`, 'mcp.json · 完整可复制（记得把路径换成你自己的绝对路径）'),
    B.table(
      ['工具', '配置文件位置'],
      [
        ['WorkBuddy', '~/.workbuddy/mcp.json'],
        ['Claude Desktop', '~/Library/Application Support/Claude/claude_desktop_config.json（macOS）'],
        ['Claude Code', '项目根目录 .mcp.json 或 ~/.claude.json'],
        ['Cursor', '项目 .cursor/mcp.json 或 ~/.cursor/mcp.json'],
        ['VS Code / 其他', '查各自文档的 MCP 配置项']
      ]
    ),
    B.p('配置好重启 Host，然后试着说：「**读一下我笔记目录里今天的文件，用三条要点总结；再抓一下 <某个网页> 的标题**」。如果 AI 真的读到了本地文件，说明手已经装上了。'),
    B.note('warn', '五个高频踩坑', '① 路径必须用**绝对路径**；② `npx -y` 首次拉包会慢，耐心等；③ Windows 下命令常需写成 `cmd /c npx ...`；④ **stdio 模式下 stdout 只能输出协议消息**，调试日志一律走 stderr，否则协议会被打乱；⑤ 只授权必要的目录，别把整个主目录交出去。'),

    B.h('三、L2：看懂协议，破除神秘感'),
    B.p('MCP 的本地传输其实非常朴素：**Server 是一个子进程，stdin 收一行 JSON，stdout 回一行 JSON**，消息格式是 JSON-RPC 2.0。一次典型交互就三组报文：'),
    B.code('jsonc', `// ① 握手：客户端问版本，服务端声明能力
--> {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"demo","version":"1.0"}}}
<-- {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-06-18","capabilities":{"tools":{}},"serverInfo":{"name":"mini-mcp","version":"1.0.0"}}}

// ② 发现：这个 Server 有哪些工具？
--> {"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
<-- {"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"now","description":"返回当前本地时间","inputSchema":{"type":"object","properties":{}}}]}}

// ③ 调用：真的执行
--> {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"now","arguments":{}}}
<-- {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"2026/11/10 10:49:09"}]}}

// 通知（notifications/initialized 等）没有 id，不需要回复`, '图 3-2　一次完整交互的原始报文'),
    B.p('注意 `tools/list` 返回的 `inputSchema` 是标准 JSON Schema —— **模型就是靠这段描述决定「什么时候调、传什么参数」的**。所以工具描述写得含糊，模型就会乱调。这和写 Prompt 是同一门手艺。'),

    B.h('四、L3：自己写一个（零依赖，30 行）'),
    B.p('理解了「一行进、一行出」，就可以完全不装 SDK 写一个 Server。下面这个只提供 `now` 和 `add` 两个工具，是本课程最推荐的动手实验 —— 跑通它，MCP 就再也不神秘了。'),
    B.code('javascript', `#!/usr/bin/env node
// mini-mcp.js —— 零依赖最小 MCP Server（stdio / JSON-RPC 2.0）
const readline = require('node:readline');

const TOOLS = [
  { name: 'now', description: '返回当前本地时间',
    inputSchema: { type: 'object', properties: {} } },
  { name: 'add', description: '把两个数相加',
    inputSchema: { type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b'] } }
];

function reply(id, result) {
  // 关键：stdout 只输出协议，一行一个 JSON
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\\n');
}
function log(...a) { console.error('[mini]', ...a); }   // 日志走 stderr

function handle(msg) {
  const { id, method, params = {} } = msg;
  if (method === 'notifications/initialized') return;  // 通知不回复
  if (method === 'initialize') return reply(id, {
    protocolVersion: '2025-06-18',
    capabilities: { tools: {} },
    serverInfo: { name: 'mini-mcp', version: '1.0.0' }
  });
  if (method === 'tools/list') return reply(id, { tools: TOOLS });
  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params;
    const text = name === 'now' ? new Date().toLocaleString('zh-CN')
               : name === 'add' ? String(Number(args.a) + Number(args.b))
               : '未知工具';
    return reply(id, { content: [{ type: 'text', text }] });
  }
}

readline.createInterface({ input: process.stdin })
  .on('line', line => { try { handle(JSON.parse(line)); } catch (e) { log(e.message); } });`, 'examples/mcp/mini-mcp.js · 已在本地跑通'),
    B.h('手工调试（不装任何 AI 工具也能验证）'),
    B.code('bash', `cd examples/mcp
printf '%s\\n' \\
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \\
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \\
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"add","arguments":{"a":2,"b":40}}}' \\
  | node mini-mcp.js`, '终端 · 你会看到 initialize / tools/list / 42 三行回复'),
    B.p('把它接进 Host，只需在 `mcp.json` 里加一项：'),
    B.code('json', `{
  "mcpServers": {
    "mini": {
      "command": "node",
      "args": ["/绝对路径/vibe-coding-course/examples/mcp/mini-mcp.js"]
    }
  }
}`, '重启 Host 后，问它「现在几点」就会调用你的 now 工具'),
    B.note('tip', '把「确定的活」交给代码', '这个 `add` 工具没有让模型算加法，而是让 JS 算。**模型负责决定调哪个工具、传什么参数；代码负责给出确定结果。** 这条分工是后面 Skills 与 Harness 设计的共同基础。'),

    B.h('五、L4：往复杂走'),
    B.table(
      ['下一步', '要加什么', '难度'],
      [
        ['带参数的工具', '在 inputSchema 里声明 properties / required，并校验入参', '⭐'],
        ['暴露 Resources', '实现 resources/list 与 resources/read，让 AI 直接读文件', '⭐⭐'],
        ['用官方 SDK', '@modelcontextprotocol/sdk（TS/Python），省掉协议细节、自带校验', '⭐⭐'],
        ['远程服务', '换成 Streamable HTTP 传输，加鉴权、超时、限流', '⭐⭐⭐'],
        ['健壮性', '错误处理（JSON-RPC error）、结构化日志、幂等、并发', '⭐⭐⭐'],
        ['安全边界', '只读目录白名单、禁止任意 shell、敏感信息脱敏、人工确认危险操作', '⭐⭐⭐']
      ]
    ),
    B.note('warn', '安全是 MCP 的第一课', 'MCP Server 是**以你的用户权限在跑的进程**。不要给「能执行任意命令」的工具开自动允许；不要把它直接暴露到公网；第三方 Server 先读一遍源码再装。第 5 章的权限闸门、第 8 章的最小权限原则都由此而来。'),

    B.task('动手 · 让 MCP 为你干一件事', [
      '配好一个现成的 filesystem Server，让 AI 真实读取你本地一个文件并总结。',
      '照着 `printf | node mini-mcp.js` 手工跑通三组报文，把输出截图。',
      '给 mini-mcp 加一个新工具 `wordcount`：传入 text，返回字符数（提示：改 TOOLS、加一个分支即可）。',
      '把 `console.error` 改成 `console.log` 跑一次，观察协议为什么会被破坏 —— 这是最经典的一个坑。'
    ]),
    B.quiz('MCP 中 `tools/list` 返回的 `inputSchema` 主要作用是什么？',
      ['给 Server 做性能优化', '让模型知道工具叫什么、什么时候用、该传什么参数', '定义日志格式', '决定用 stdio 还是 HTTP'],
      1,
      '模型依据 name / description / inputSchema 做工具选择并生成参数，描述写含糊就会乱调。'),
    B.quiz('stdio 传输下，Server 里想打调试日志应该怎么办？',
      ['用 console.log 输出即可', '完全不能打日志', '写到 stderr（console.error），stdout 只留协议消息', '写进 stdout 的注释行'],
      2,
      'stdout 是协议通道，任何非 JSON 内容都会让 Client 解析失败。日志必须走 stderr。'),
    B.sum([
      'MCP = **AI 应用与工具之间的接口约定**，类比 USB-C；解决「模型碰不到真实世界」。',
      '架构：**Host → Client → Server**；能力三种：**Tools（做事）/ Resources（读数据）/ Prompts（模板）**。',
      '本地传输就是 **stdin/stdout 上换行分隔的 JSON-RPC 2.0**：initialize → tools/list → tools/call。',
      '路径由简到繁：配现成的 → 看懂报文 → 手写 30 行 Server → SDK / 远程 / 安全。'
    ])
  ]
},

/* ================= 04 Skills ================= */
{
  id: 'c4', no: '04', group: '第二篇 · 工具三件套', title: 'Skills：把经验写成手册',
  sub: '别每次都重新交代一遍，把 SOP 存成文件',
  minutes: 45, level: '进阶',
  goals: [
    '分清 Prompt / 规则 / Skill / MCP 各自管什么',
    '会写一个包含 frontmatter、步骤、约束、示例的 SKILL.md',
    '理解渐进式披露，知道把什么放进 scripts/ 与 references/'
  ],
  blocks: [
    B.h('一、痛点：重复的交代，越聊越长的 Prompt'),
    B.p('你有没有写过这种东西：每次让 AI 写周报，都要重新说一遍「用中文、别编造、每条一句话、按三类分、不要写客户名……」。说少了它跑偏，说多了 Prompt 越来越长，而且换个会话就全忘了。'),
    B.p('**Skill 就是把这套「怎么做某类事」的知识，存成一个文件夹**：一份 `SKILL.md` 说明书，外加可选的脚本、模板、参考资料。Agent 在索引里看到它的简介，判断这次任务用得上，才把正文读进上下文。'),
    B.svg('disclosure', '图 4-1　渐进式披露：装 100 个 Skill 也不会撑爆上下文'),
    B.note('key', '一句话记住', '**MCP 给 AI 增加「能力」，Skill 教 AI「按什么流程使用能力」。** 前者是工具，后者是作业指导书。'),

    B.h('二、先分清四个容易混的概念'),
    B.table(
      ['概念', '管什么', '何时生效', '例子'],
      [
        ['Prompt', '这一轮的具体任务', '说一次，管一轮', '「把按钮改成圆角」'],
        ['规则 / AGENTS.md', '项目级硬约束', '常驻，每次会话都读', '「不许装 npm 依赖」'],
        ['**Skill**', '某类任务的**流程与经验**', '命中描述才加载', '「写周报」的完整 SOP'],
        ['MCP', '可用的**工具能力**', '连接后一直可调用', 'read_file / fetch_url'],
        ['Harness', '上述一切怎么被**调度与治理**', '运行时', '循环、权限、hooks（第 5 章）']
      ]
    ),
    B.p('一个好用的判断法：**「能不能做」看 MCP，「该怎么做」看 Skill，「不许做什么」看规则，「这次做什么」看 Prompt。**'),

    B.h('三、SKILL.md 长什么样'),
    B.code('markdown', `---
name: weekly-report
description: 当用户要求写周报、周总结、本周工作汇报时使用。基于 git 提交历史生成结构化周报，不编造未发生的工作。
---

# 周报生成器

## 何时使用
- 用户说「写周报」「总结一下这周」「同步进展」
- **不要**在用户只是问某个具体提交内容时使用

## 步骤
1. 运行 git log --since="7 days ago" --pretty=format:"%s" 收集本周提交
2. 若提交为空，明确告知「本周没有提交记录」，不要编造
3. 按「已完成 / 进行中 / 风险与下周」三类归并
4. 读取 assets/template.md，按模板填充输出
5. 问一句「需要我写成文件吗？」，得到确认才写

## 输出约束
- 每条一句话，不超过 25 个汉字，动词开头
- 只写 git log 里能找到的事实，不写人名、客户名、密钥
- 用中文，不用 emoji，不加客套话

## 示例
输入：feat: 增加一键清空 / fix: 刷新后状态丢失
输出：## 已完成\\n- 增加一键清空功能\\n- 修复刷新后状态丢失`, 'examples/skills/weekly-report/SKILL.md · 核心结构'),
    B.p('目录结构（一个 Skill = 一个文件夹）：'),
    B.code('text', `# 用户级（个人跨项目可用）
~/.workbuddy/skills/weekly-report/
├── SKILL.md                 ← 必需：说明书
├── assets/template.md       ← 可选：输出模板
├── scripts/collect.sh       ← 可选：确定性的活交给脚本
└── references/examples.md   ← 可选：长资料，用到才读

# 项目级（团队共享，可以进 git）
<项目>/.workbuddy/skills/weekly-report/`, 'Skill 的标准目录'),
    B.note('tip', 'description 是整个文件最重要的 20 个字', '它常驻索引，是 Agent 唯一的「要不要用我」依据。要写**「什么时候用」**（触发场景、关键词、用户会怎么说），而不是「这是什么」。写成「周报相关功能」就太含糊了。'),

    B.h('四、写好 Skill 的五条'),
    B.steps([
      { h: '① 触发条件写具体', x: '列出用户真实会说的词，以及**反例**（什么时候别用）。' },
      { h: '② 步骤可执行、可验证', x: '写「运行 git log …」而不是「了解本周情况」。每步都有明确产出。' },
      { h: '③ 给输入 / 输出示例', x: '一个正例顶三段解释，能极大降低模型自由发挥的空间。' },
      { h: '④ 写清「不要做什么」', x: '别编造、别写敏感信息、别自动发消息、别自作主张提交 —— 边界比流程更重要。' },
      { h: '⑤ 把确定性的活交给脚本', x: '格式转换、数据抓取、校验放 `scripts/`；判断、归类、措辞留给模型。**长资料放 `references/`，别塞进正文**，用到才读。' }
    ]),

    B.h('五、由简单到复杂'),
    B.table(
      ['级别', '形态', '适合练手'],
      [
        ['L1', '纯文本 SOP：一个 SKILL.md，几步规则', '「代码审查清单」「会议纪要格式」'],
        ['L2', '带模板 + 脚本：模板定格式，脚本干确定的活', '「周报生成器」（本课示例）'],
        ['L3', '调 MCP 工具 + 多步骤 + 失败兜底', '「抓三篇文档 → 去重 → 生成简报」'],
        ['L4', '团队共享：进 git、版本号、评审、测试样例', '团队统一的「提交前自检」「发布检查」']
      ]
    ),
    B.note('info', 'Skill 与 Git 的化学反应', '把项目级 Skill、AGENTS.md、hooks 配置一起提交进仓库，等于**把「这个团队怎么和 AI 协作」也纳入了版本管理**：新人 clone 下来就自带同一套规矩，改规矩也要走 PR 评审。第 8 章会展开。'),

    B.task('动手 · 写你的第一个 Skill', [
      '新建 `~/.workbuddy/skills/pre-commit-check/SKILL.md`（或项目级目录），描述写清触发场景。',
      '步骤设计成：跑 `git status` → 看 `git diff` → 检查是否含敏感信息 → 生成一条 `type: ...` 格式的 commit message 建议（**只建议，不自动提交**）。',
      '加一条「不要做什么」：不要自动 commit / push，不要改动任何源文件。',
      '连续两天用它，把跑偏的地方补回 SKILL.md —— 这就是 Skill 的迭代。'
    ]),
    B.quiz('下面哪句更适合作为 Skill 的 description？',
      ['周报相关功能', '一个用来生成报告的工具', '当用户要求写周报、周总结、同步本周进展时使用；基于 git log 生成结构化周报', '最好的周报生成器 v2'],
      2,
      'description 是 Agent 判断「要不要加载」的唯一依据，必须写清触发场景与关键词。'),
    B.quiz('「格式转换、抓取数据」这类确定性工作，放在哪里最合适？',
      ['全部塞进 SKILL.md 正文', '每次让模型临时生成代码', '放进 scripts/ 由脚本执行，Skill 里只写什么时候调用', '写在 references/ 里'],
      2,
      '模型负责判断与措辞，脚本负责确定性结果。这样更省 token、更可靠、也更容易测试。'),
    B.sum([
      '**Skill = 一个文件夹 = 一项可复用能力**，核心是 `SKILL.md`（frontmatter + 何时用 + 步骤 + 约束 + 示例）。',
      '**渐进式披露**三层：frontmatter 常驻 → 正文命中才加载 → 脚本/资料用到才读。',
      '分工口诀：**能不能做看 MCP，该怎么做看 Skill，不许做看规则，这次做看 Prompt**。',
      '把 Skill 放进 git，团队就共享了同一套 AI 协作规范。'
    ])
  ]
},

/* ================= 05 Harness ================= */
{
  id: 'c5', no: '05', group: '第二篇 · 工具三件套', title: 'Harness：看懂 Agent 怎么跑起来',
  sub: '同一个模型，为什么在聊天窗口只能给建议，在 Agent 里能把活干完',
  minutes: 50, level: '进阶 · 需读一点 JS',
  goals: [
    '说清 Harness 与模型、Agent 的区别',
    '能读懂并改写一个最小 agent loop',
    '知道权限、hooks、预算、上下文装配各自解决什么问题'
  ],
  blocks: [
    B.h('一、差别不在模型，在那层「壳」'),
    B.p('把同一个模型放进聊天网页，你问「帮我修这个 bug」，它回一段代码让你自己粘贴；放进编码 Agent，它会自己读文件、改文件、跑测试、看报错、再改一次，直到通过。**模型没变，变的是外面那层运行时**。'),
    B.p('这层运行时就叫 **Harness（运行框架 / 脚手架 / 驾驶舱）**：它把「一次问答」变成「一个可治理的循环」，并负责上下文、工具、权限、错误和终止条件。'),
    B.svg('loop', '图 5-1　Agent Loop：感知 → 决策 → 行动 → 观察，直到完成或触到边界'),
    B.code('javascript', `// 最小 Harness 的核心（完整可运行版见 examples/harness/mini-harness.js）
async function run(goal, { maxSteps = 8 } = {}) {
  const messages = [
    { role: 'system', content: '只依据工具返回的事实回答。' },   // 上下文装配
    { role: 'user',   content: goal }
  ];

  for (let step = 1; step <= maxSteps; step++) {                  // 预算兜底
    const res = await model.chat({ messages, tools: tools.schemas() }); // 决策
    if (res.stop === 'end_turn') return res.text;                // 终止条件

    for (const call of res.toolCalls) {                          // 行动
      const ok = await permissions.check(call);                  // 权限闸门
      const out = ok ? await tools.run(call) : '用户拒绝了该操作';
      await hooks.afterTool(call, out);                          // Hooks 关卡
      messages.push({ role: 'assistant', content: '调用 ' + call.name });
      messages.push({ role: 'tool', content: out });             // 观察回灌
    }
  }
  return '达到步数上限，请人工接手';
}`, '一个 Agent 的骨架，其实就这么点'),
    B.p('四个关键位置值得盯住：`messages` 是**上下文**、`tools.schemas()` 通常来自 **MCP 的 tools/list**、`permissions.check` 是**安全边界**、`maxSteps` 是**预算**。`res.stop === "end_turn"` 是唯一的正常出口。'),
    B.note('key', '把「观察回灌」看懂了，就懂了 Agent', '模型说「我要读 notes.txt」不算读完；**工具返回的内容被塞回 messages，下一轮模型才真正「看见」结果**。没有这一步，循环就断了。'),

    B.h('二、Harness 的六个部件'),
    B.table(
      ['部件', '解决什么', '具体形态'],
      [
        ['① 上下文装配', '模型每轮看到什么', '系统提示 + AGENTS.md + 相关文件 + 历史摘要 + 工具结果；太长会压缩'],
        ['② 工具注册与调度', '把能力变成可调用的函数', '把 MCP 的 tools/list 转成模型的 tool schema，执行 tools/call'],
        ['③ 权限与安全', '哪些动作要人点头', '只读自动放行 / 写文件需确认 / 危险命令拦截 / 目录白名单'],
        ['④ Hooks', '在关键节点插入确定性自动化', 'PreToolUse 拦截、PostToolUse 自动格式化、Stop 时跑测试'],
        ['⑤ 循环控制与预算', '防止跑飞、卡死、烧钱', 'maxSteps / token 上限 / 超时 / 失败重试 / 重复调用检测'],
        ['⑥ 可观测与恢复', '出事能查、能接着跑', '轨迹日志、diff 展示、检查点、中断续跑']
      ]
    ),
    B.h('Hooks 示例：让「确定的活」自动发生'),
    B.code('jsonc', `{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash(git push*)",
        "command": "echo '推送属于外部动作，必须人工确认' && exit 1" }
    ],
    "PostToolUse": [
      { "matcher": "Write(*.js)|Edit(*.js)",
        "command": "npx prettier --write \\"$FILE\\"" }
    ],
    "Stop": [
      { "command": "npm test -- --silent" }
    ]
  }
}`, 'examples/hooks/settings.json · 字段因工具而异，示意思路'),
    B.p('这三条分别是：**拦住外部动作**、**每次改完 JS 自动格式化**、**收工前自动跑测试**。注意它们都是脚本，不是「请模型记得格式化」—— 确定性关卡不要交给概率。'),

    B.h('三、三层对比：从聊天到可治理'),
    B.table(
      ['形态', '有没有循环', '能不能用工具', '有没有治理', '典型表现'],
      [
        ['Chatbot', '❌ 一问一答', '❌', '❌', '给你一段建议，你自己执行'],
        ['Agent', '✅ 有循环', '✅', '△ 有基本权限', '能自己把活做完，但可能跑飞'],
        ['**Harness**', '✅ 有循环', '✅ 统一注册', '✅ 权限/预算/hooks/轨迹', '能自己干完，且可控、可查、可中断']
      ]
    ),

    B.h('四、Vibe Coder 为什么要懂它'),
    B.cards([
      { i: '🔍', h: '会诊断「AI 卡住了」', x: '是循环到步数上限？权限被拦？工具报错？还是上下文被压缩后忘了目标？看轨迹就能分辨。' },
      { i: '📄', h: '知道规矩要写进文件', x: '上下文会被压缩，对话里说一次的话可能「不在场」。所以 AGENTS.md 和 Skill 才那么重要（第 2、4 章）。' },
      { i: '🛡️', h: '会设安全闸门', x: '把「改之前给我看 diff」「不许自动 push」变成 hook 或权限规则，而不是靠祈祷。' },
      { i: '♻️', h: '会加死循环保护', x: '连续几次相同调用就停机，避免 AI 反复改同一处还烧 token。' }
    ]),
    B.code('javascript', `// 给 loop 加一道「连续 3 次相同调用就停机」的保护
const signatures = [];
// ... 在每次工具调用前：
const sig = call.name + JSON.stringify(call.args);
signatures.push(sig);
if (signatures.length >= 3 && signatures.slice(-3).every(s => s === sig)) {
  return '检测到重复调用，已停机，请人工接手。';
}`, 'examples/harness/mini-harness.js 里已经实现了这段'),
    B.h('AI 反复失败时的调试清单'),
    B.ol([
      '**看轨迹**：它到底调了哪些工具、传入什么参数？',
      '**看工具返回**：是真的执行了，还是报错被当成结果吞掉了？',
      '**缩上下文**：新开会话，把结论写进 AGENTS.md，别在糊掉的长对话里死磕。',
      '**拆小任务**：一次只让它做一件可验证的事（回到第 2 章）。',
      '**给反例**：贴上「不要这样」的具体输出，比反复说「再改改」有效。',
      '**查预算/权限**：是不是 maxSteps 到顶，或某个动作一直被拒？'
    ]),
    B.p('可以直接运行 `node examples/harness/mini-harness.js` 看一遍两轮循环的输出；把里面的 `fakeModel` 换成任意支持 tool_use 的 LLM SDK，这段骨架就是真的 Agent。'),

    B.task('动手 · 给 Harness 加一道关卡', [
      '运行 `node examples/harness/mini-harness.js`，看清楚两轮循环与 hook 的打印顺序。',
      '把 `maxSteps` 改成 1，观察「预算兜底」的返回。',
      '给 `permissions.check` 加一条：`write_file` 一律返回 `ask`，看循环怎么表现。',
      '加一个新 hook：工具返回内容超过 200 字时打印「结果过长，建议截断」—— 这就是上下文管理的雏形。'
    ]),
    B.quiz('同一个模型在聊天窗口与编码 Agent 里表现差异巨大，主要原因是？',
      ['Agent 用了更大的模型', 'Agent 外面有一层 Harness：循环 + 工具 + 权限 + 上下文治理', '聊天窗口被限速了', 'Agent 联网了'],
      1,
      '模型没变，变的是运行时。Harness 把一次问答变成可治理的循环，才让「自己把活干完」成为可能。'),
    B.quiz('「每次改完 JS 自动格式化」「收工前自动跑测试」，最该用哪种机制实现？',
      ['在 Prompt 里叮嘱模型记得做', '写一个 Skill 让它自己想起来', '用 Hooks 在固定节点执行确定性脚本', '提高 maxSteps'],
      2,
      '确定性关卡要交给脚本，不要交给概率。Hooks 就是为此存在的。'),
    B.sum([
      '**Harness = 包裹模型的运行时**，把一次问答变成循环，并治理上下文、工具、权限、预算、轨迹。',
      'Agent Loop 四拍：**感知 → 决策 → 行动 → 观察回灌**，直到完成或触到边界。',
      '六个部件：上下文装配 / 工具调度 / 权限 / Hooks / 循环预算 / 可观测。',
      '懂 harness 才能诊断「卡住」、把规矩写进文件、把安全变成闸门。'
    ])
  ]
}

);
