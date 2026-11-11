/* ============================================================
 * Vibe Coding 课程 · 数据骨架
 * 课件内容分三个文件：lessons-1.js / lessons-2.js / lessons-3.js
 * 本文件只放：课程元信息、内容块辅助函数、SVG 图示库
 * ============================================================ */

window.COURSE = {
  meta: {
    title: 'Vibe Coding 从入门到工程化',
    tagline: '不写代码也能造东西 —— 但要知道 AI 在替你做什么',
    edition: 'v1.0 · 2026',
    duration: '9 章 · 约 6 学时 · 可拆成 4 次工作坊',
    audience: '零基础 / 产品 / 设计 / 运营 / 想提效的开发者',
    principle: '清晰意图 × 上下文 × 工具 × 反馈循环 × 版本兜底'
  },
  groups: [
    { name: '开始之前', ids: ['c0'] },
    { name: '第一篇 · 先跑起来', ids: ['c1', 'c2'] },
    { name: '第二篇 · 工具三件套', ids: ['c3', 'c4', 'c5'] },
    { name: '第三篇 · 可回溯的迭代', ids: ['c6'] },
    { name: '第四篇 · 组合与工程化', ids: ['c7', 'c8'] },
    { name: '附录', ids: ['c9'] }
  ],
  chapters: []
};

/* 内容块辅助函数：让课件内容保持紧凑、易改 */
window.B = {
  p:     x => ({ t: 'p', x }),
  h:     x => ({ t: 'h', x }),
  sub:   x => ({ t: 'sub', x }),
  list:  x => ({ t: 'list', x }),
  ol:    x => ({ t: 'ol', x }),
  steps: x => ({ t: 'steps', x }),                        // [{h,x}]
  table: (h, r) => ({ t: 'table', h, r }),               // h:[], r:[[]]
  code:  (l, x, h) => ({ t: 'code', l, x, h }),          // lang, code, caption
  note:  (k, h, x) => ({ t: 'note', k, h, x }),          // kind: tip|warn|info|key
  cards: x => ({ t: 'cards', x }),                       // [{i,h,x}]
  svg:   (k, cap) => ({ t: 'svg', k, cap }),
  quiz:  (q, o, a, e) => ({ t: 'quiz', q, o, a, e }),     // options, answer index, explain
  task:  (h, x) => ({ t: 'task', h, x }),
  sum:   x => ({ t: 'sum', x }),
  play:  (h, x) => ({ t: 'play', h, x }),
  hr:    () => ({ t: 'hr' }),
  quote: (x, cite) => ({ t: 'quote', x, cite })
};

/* ------------------------------------------------------------
 * SVG 图示库：全部使用 CSS 变量，自动适配浅色/深色主题
 * ------------------------------------------------------------ */
window.SVG = {};

/* 图 1：五个角色的关系 —— 贯穿全课的心智模型 */
SVG.roles = `
<svg viewBox="0 0 800 430" role="img" aria-label="Vibe Coding 五个角色关系图" style="width:100%;height:auto">
  <defs><marker id="ar1" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill="var(--muted)"/></marker></defs>
  <rect x="290" y="12" width="220" height="52" rx="14" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="400" y="34" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">你 · 意图与验收</text>
  <text x="400" y="52" text-anchor="middle" font-size="11.5" fill="var(--muted)">说清要什么 / 判断做得对不对</text>
  <line x1="400" y1="64" x2="400" y2="88" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#ar1)"/>

  <rect x="40" y="90" width="720" height="216" rx="20" fill="var(--panel)" stroke="var(--brand)" stroke-width="1.6"/>
  <text x="62" y="118" font-size="13" font-weight="700" fill="var(--brand)">HARNESS · 运行框架 / 驾驶舱</text>
  <text x="738" y="118" text-anchor="end" font-size="11" fill="var(--muted)">把「一次问答」变成「一个可治理的循环」</text>

  <rect x="66" y="136" width="200" height="98" rx="14" fill="var(--card)" stroke="var(--line)" stroke-width="1.4"/>
  <circle cx="94" cy="164" r="11" fill="#6c5ce7" opacity=".15"/><circle cx="94" cy="164" r="5" fill="#6c5ce7"/>
  <text x="113" y="169" font-size="14" font-weight="700" fill="var(--ink)">模型 = 大脑</text>
  <text x="82" y="194" font-size="11.5" fill="var(--muted)">会推理、会写，但</text>
  <text x="82" y="212" font-size="11.5" fill="var(--muted)">没手、没记忆、没权限</text>

  <rect x="300" y="136" width="200" height="98" rx="14" fill="var(--card)" stroke="var(--line)" stroke-width="1.4"/>
  <circle cx="328" cy="164" r="11" fill="#2aa876" opacity=".15"/><circle cx="328" cy="164" r="5" fill="#2aa876"/>
  <text x="347" y="169" font-size="14" font-weight="700" fill="var(--ink)">MCP = 手和感官</text>
  <text x="316" y="194" font-size="11.5" fill="var(--muted)">读文件、查网页、调 API</text>
  <text x="316" y="212" font-size="11.5" fill="var(--muted)">让模型能碰到真实世界</text>

  <rect x="534" y="136" width="200" height="98" rx="14" fill="var(--card)" stroke="var(--line)" stroke-width="1.4"/>
  <circle cx="562" cy="164" r="11" fill="#e08a3c" opacity=".18"/><circle cx="562" cy="164" r="5" fill="#e08a3c"/>
  <text x="581" y="169" font-size="14" font-weight="700" fill="var(--ink)">Skills = 岗位手册</text>
  <text x="550" y="194" font-size="11.5" fill="var(--muted)">把重复流程固化成 SOP</text>
  <text x="550" y="212" font-size="11.5" fill="var(--muted)">命中才加载，不占上下文</text>

  <rect x="66" y="248" width="668" height="42" rx="11" fill="var(--subtle)" stroke="var(--line)"/>
  <text x="400" y="274" text-anchor="middle" font-size="12" fill="var(--muted)">治理层：上下文装配 · 工具调度 · 权限闸门 · Hooks · 步数/预算 · 日志轨迹 · 失败重试</text>

  <line x1="400" y1="306" x2="400" y2="332" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#ar1)"/>
  <rect x="210" y="334" width="380" height="58" rx="14" fill="var(--card)" stroke="#d4568a" stroke-width="1.5"/>
  <text x="400" y="358" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">Git = 存档点 / 时光机</text>
  <text x="400" y="378" text-anchor="middle" font-size="11.5" fill="var(--muted)">每一次改动可看、可退、可复现 —— 敢放手让 AI 改的底气</text>
  <text x="400" y="416" text-anchor="middle" font-size="11" fill="var(--muted)">你负责「要什么」和「对不对」，工具链负责「怎么干」，Git 负责「回得去」</text>
</svg>`;

/* 图 2：由简到繁的学习阶梯 */
SVG.ladder = `
<svg viewBox="0 0 800 310" role="img" aria-label="由简到繁的四级项目阶梯" style="width:100%;height:auto">
  <g font-family="inherit">
  <rect x="24" y="212" width="176" height="70" rx="13" fill="var(--card)" stroke="#2aa876" stroke-width="1.6"/>
  <text x="112" y="238" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">L1 · 单文件</text>
  <text x="112" y="258" text-anchor="middle" font-size="11" fill="var(--muted)">三件事清单 / 抽签器</text>
  <text x="112" y="274" text-anchor="middle" font-size="11" fill="var(--muted)">30 分钟 · 零依赖</text>

  <rect x="216" y="164" width="176" height="118" rx="13" fill="var(--card)" stroke="#6c5ce7" stroke-width="1.6"/>
  <text x="304" y="190" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">L2 · 有状态</text>
  <text x="304" y="210" text-anchor="middle" font-size="11" fill="var(--muted)">记账本 / 打卡 + 图表</text>
  <text x="304" y="226" text-anchor="middle" font-size="11" fill="var(--muted)">数据模型 · 本地存储</text>
  <text x="304" y="248" text-anchor="middle" font-size="11" fill="var(--muted)">+ Git 迭代</text>
  <text x="304" y="268" text-anchor="middle" font-size="11" fill="var(--muted)">1 天</text>

  <rect x="408" y="112" width="176" height="170" rx="13" fill="var(--card)" stroke="#e08a3c" stroke-width="1.6"/>
  <text x="496" y="138" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">L3 · 接工具链</text>
  <text x="496" y="158" text-anchor="middle" font-size="11" fill="var(--muted)">每日简报助手</text>
  <text x="496" y="176" text-anchor="middle" font-size="11" fill="var(--muted)">+ MCP 抓数据</text>
  <text x="496" y="194" text-anchor="middle" font-size="11" fill="var(--muted)">+ Skill 定格式</text>
  <text x="496" y="212" text-anchor="middle" font-size="11" fill="var(--muted)">+ Harness 自检</text>
  <text x="496" y="236" text-anchor="middle" font-size="11" fill="var(--muted)">1–2 天</text>
  <text x="496" y="262" text-anchor="middle" font-size="11" fill="var(--muted)">打 tag v1.0</text>

  <rect x="600" y="60" width="176" height="222" rx="13" fill="var(--card)" stroke="#d4568a" stroke-width="1.6"/>
  <text x="688" y="86" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">L4 · 工程化</text>
  <text x="688" y="106" text-anchor="middle" font-size="11" fill="var(--muted)">团队共用</text>
  <text x="688" y="126" text-anchor="middle" font-size="11" fill="var(--muted)">AGENTS.md + Skills</text>
  <text x="688" y="144" text-anchor="middle" font-size="11" fill="var(--muted)">+ hooks 自动关卡</text>
  <text x="688" y="162" text-anchor="middle" font-size="11" fill="var(--muted)">+ 测试 / CI</text>
  <text x="688" y="180" text-anchor="middle" font-size="11" fill="var(--muted)">+ 分支与 PR 评审</text>
  <text x="688" y="198" text-anchor="middle" font-size="11" fill="var(--muted)">+ 发布与版本</text>
  <text x="688" y="226" text-anchor="middle" font-size="11" fill="var(--muted)">持续迭代</text>
  <text x="688" y="258" text-anchor="middle" font-size="11" fill="var(--muted)">可协作 / 可交接</text>

  <path d="M24 296 L776 296" stroke="var(--line)" stroke-width="1.5"/>
  <text x="24" y="24" font-size="12" font-weight="700" fill="var(--brand)">复杂度 →</text>
  <text x="776" y="24" text-anchor="end" font-size="11" fill="var(--muted)">每一步都建立在上一步的「可运行成品」之上</text>
  </g>
</svg>`;

/* 图 3：MCP 架构 */
SVG.mcp = `
<svg viewBox="0 0 800 330" role="img" aria-label="MCP 架构：Host、Client、Server 与三种能力" style="width:100%;height:auto">
  <defs><marker id="ar3" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill="var(--muted)"/></marker></defs>
  <rect x="24" y="90" width="196" height="150" rx="16" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.6"/>
  <text x="122" y="122" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">Host（AI 应用）</text>
  <text x="122" y="146" text-anchor="middle" font-size="11.5" fill="var(--muted)">Claude Code / Cursor</text>
  <text x="122" y="164" text-anchor="middle" font-size="11.5" fill="var(--muted)">WorkBuddy / 你的 Agent</text>
  <line x1="52" y1="184" x2="196" y2="184" stroke="var(--line)"/>
  <text x="122" y="208" text-anchor="middle" font-size="11" fill="var(--muted)">内部持有 1 个 Client / 连接</text>

  <line x1="220" y1="165" x2="286" y2="165" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ar3)"/>
  <text x="253" y="144" text-anchor="middle" font-size="10.5" fill="var(--muted)">JSON-RPC</text>
  <text x="253" y="157" text-anchor="middle" font-size="10.5" fill="var(--muted)">stdio / HTTP</text>

  <rect x="290" y="106" width="150" height="118" rx="14" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
  <text x="365" y="140" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">MCP Client</text>
  <text x="365" y="164" text-anchor="middle" font-size="11" fill="var(--muted)">建立连接、协商版本</text>
  <text x="365" y="184" text-anchor="middle" font-size="11" fill="var(--muted)">转发 tools/list</text>
  <text x="365" y="204" text-anchor="middle" font-size="11" fill="var(--muted)">tools/call</text>

  <line x1="440" y1="165" x2="500" y2="165" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ar3)"/>

  <rect x="504" y="46" width="272" height="238" rx="16" fill="var(--panel)" stroke="#2aa876" stroke-width="1.6"/>
  <text x="640" y="74" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">MCP Server（一个进程）</text>
  <rect x="524" y="90" width="232" height="50" rx="10" fill="var(--card)" stroke="var(--line)"/>
  <text x="536" y="110" font-size="12" font-weight="700" fill="var(--ink)">Tools</text>
  <text x="536" y="128" font-size="11" fill="var(--muted)">做事：read_file / now / query_db</text>
  <rect x="524" y="148" width="232" height="50" rx="10" fill="var(--card)" stroke="var(--line)"/>
  <text x="536" y="168" font-size="12" font-weight="700" fill="var(--ink)">Resources</text>
  <text x="536" y="186" font-size="11" fill="var(--muted)">读数据：文件 / 配置 / 记录</text>
  <rect x="524" y="206" width="232" height="50" rx="10" fill="var(--card)" stroke="var(--line)"/>
  <text x="536" y="226" font-size="12" font-weight="700" fill="var(--ink)">Prompts</text>
  <text x="536" y="244" font-size="11" fill="var(--muted)">模板：预置的任务话术</text>
  <text x="640" y="274" text-anchor="middle" font-size="11" fill="var(--muted)">背后接：本地文件 / 数据库 / 浏览器 / SaaS API</text>
  <text x="400" y="312" text-anchor="middle" font-size="11.5" fill="var(--muted)">类比：USB-C —— 一次定义接口，任何工具都能插上任何 AI 应用</text>
</svg>`;

/* 图 4：Skills 渐进式披露 */
SVG.disclosure = `
<svg viewBox="0 0 800 300" role="img" aria-label="Skills 渐进式披露三层加载" style="width:100%;height:auto">
  <rect x="40" y="34" width="720" height="66" rx="14" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="62" y="60" font-size="13" font-weight="700" fill="var(--ink)">第 1 层 · frontmatter</text>
  <text x="62" y="82" font-size="11.5" fill="var(--muted)">name + description，几十个字，常驻在索引里 —— 只用来判断「这次要不要用我」</text>
  <text x="738" y="70" text-anchor="end" font-size="11" fill="var(--brand)">永远加载</text>

  <line x1="400" y1="100" x2="400" y2="120" stroke="var(--muted)" stroke-width="1.5"/>
  <rect x="76" y="120" width="648" height="66" rx="14" fill="var(--card)" stroke="#e08a3c" stroke-width="1.5"/>
  <text x="98" y="146" font-size="13" font-weight="700" fill="var(--ink)">第 2 层 · SKILL.md 正文</text>
  <text x="98" y="168" font-size="11.5" fill="var(--muted)">何时使用 / 步骤 / 约束 / 输入输出示例 —— 命中之后才读进上下文</text>
  <text x="702" y="156" text-anchor="end" font-size="11" fill="#e08a3c">命中加载</text>

  <line x1="400" y1="186" x2="400" y2="206" stroke="var(--muted)" stroke-width="1.5"/>
  <rect x="112" y="206" width="576" height="66" rx="14" fill="var(--card)" stroke="#2aa876" stroke-width="1.5"/>
  <text x="134" y="232" font-size="13" font-weight="700" fill="var(--ink)">第 3 层 · scripts/ assets/ references/</text>
  <text x="134" y="254" font-size="11.5" fill="var(--muted)">确定性的活交给脚本，长资料按需查阅 —— 真正用到才读</text>
  <text x="666" y="242" text-anchor="end" font-size="11" fill="#2aa876">用到才读</text>
  <text x="400" y="292" text-anchor="middle" font-size="11.5" fill="var(--muted)">好处：装 100 个 Skill 也不会把上下文撑爆</text>
</svg>`;

/* 图 5：Harness Agent Loop */
SVG.loop = `
<svg viewBox="0 0 800 340" role="img" aria-label="Harness 的 Agent Loop 循环" style="width:100%;height:auto">
  <defs><marker id="ar5" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill="#6c5ce7"/></marker></defs>
  <circle cx="400" cy="168" r="66" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.8"/>
  <text x="400" y="162" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">Harness</text>
  <text x="400" y="183" text-anchor="middle" font-size="11" fill="var(--muted)">循环 + 治理</text>

  <g font-size="13" font-weight="700" text-anchor="middle" fill="var(--ink)">
    <rect x="70" y="42" width="160" height="52" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
    <text x="150" y="74" >① 感知 Gather</text>
    <rect x="570" y="42" width="160" height="52" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
    <text x="650" y="74">② 决策 Think</text>
    <rect x="570" y="244" width="160" height="52" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
    <text x="650" y="276">③ 行动 Act</text>
    <rect x="70" y="244" width="160" height="52" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
    <text x="150" y="276">④ 观察 Observe</text>
  </g>
  <g font-size="10.5" fill="var(--muted)" text-anchor="middle">
    <text x="150" y="110">目标 / 文件 / 历史 / 规则</text>
    <text x="650" y="110">模型产出下一步动作</text>
    <text x="650" y="312">调用工具（MCP）</text>
    <text x="150" y="312">把结果回灌进上下文</text>
  </g>

  <path d="M240 68 L560 68" stroke="#6c5ce7" stroke-width="2" marker-end="url(#ar5)"/>
  <path d="M660 100 L660 236" stroke="#6c5ce7" stroke-width="2" marker-end="url(#ar5)"/>
  <path d="M560 270 L240 270" stroke="#6c5ce7" stroke-width="2" marker-end="url(#ar5)"/>
  <path d="M140 236 L140 100" stroke="#6c5ce7" stroke-width="2" marker-end="url(#ar5)"/>

  <g font-size="10.5" fill="var(--muted)">
    <text x="400" y="20" text-anchor="middle">直到：模型说「完成」 / 达到步数预算 / 权限被拒 / 检测到死循环</text>
  </g>
  <g font-size="11" fill="var(--muted)">
    <text x="248" y="152" text-anchor="end">上下文装配</text>
    <text x="552" y="152">权限闸门</text>
    <text x="248" y="196" text-anchor="end">Hooks 关卡</text>
    <text x="552" y="196">日志与重试</text>
  </g>
</svg>`;

/* 图 6：Git 分支时间线 */
SVG.git = `
<svg viewBox="0 0 800 290" role="img" aria-label="Git 主干与实验分支时间线" style="width:100%;height:auto">
  <defs><marker id="ar6" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill="var(--muted)"/></marker></defs>
  <text x="24" y="30" font-size="12" font-weight="700" fill="var(--brand)">main（主干 · 永远能跑）</text>
  <line x1="70" y1="92" x2="730" y2="92" stroke="#6c5ce7" stroke-width="3"/>
  <g fill="var(--card)" stroke="#6c5ce7" stroke-width="2.5">
    <circle cx="110" cy="92" r="9"/><circle cx="270" cy="92" r="9"/><circle cx="640" cy="92" r="9"/><circle cx="720" cy="92" r="9"/>
  </g>
  <g font-size="11" fill="var(--ink)" text-anchor="middle" font-weight="600">
    <text x="110" y="72">v0.1</text><text x="270" y="72">加清空</text><text x="640" y="72">merge</text><text x="720" y="72">v1.0</text>
  </g>
  <g font-size="10.5" fill="var(--muted)" text-anchor="middle">
    <text x="110" y="118">init 初版</text><text x="270" y="118">feat</text><text x="640" y="118">合并实验</text><text x="720" y="118">tag</text>
  </g>
  <rect x="88" y="132" width="46" height="20" rx="6" fill="var(--brand-soft)" stroke="var(--brand)"/>
  <text x="111" y="146" text-anchor="middle" font-size="10" fill="var(--brand)">tag</text>

  <text x="24" y="192" font-size="12" font-weight="700" fill="#e08a3c">try-dark（实验分支 · 改崩也不怕）</text>
  <path d="M400 92 C440 92 430 214 470 214 L700 214" fill="none" stroke="#e08a3c" stroke-width="2.5"/>
  <path d="M640 214 C620 214 630 100 640 92" fill="none" stroke="#e08a3c" stroke-width="2.5" stroke-dasharray="5 4" marker-end="url(#ar6)"/>
  <g fill="var(--card)" stroke="#e08a3c" stroke-width="2.5">
    <circle cx="470" cy="214" r="8"/><circle cx="560" cy="214" r="8"/><circle cx="660" cy="214" r="8"/>
  </g>
  <g font-size="10.5" fill="var(--muted)" text-anchor="middle">
    <text x="470" y="240">试深色模式</text><text x="560" y="240">改样式</text><text x="660" y="240">验收通过</text>
  </g>
  <text x="400" y="272" text-anchor="middle" font-size="11.5" fill="var(--muted)">不想要这次实验？git switch main —— 主干一点没变，实验分支随时可以丢掉</text>
</svg>`;

/* 图 7：Git 黄金节奏 */
SVG.rhythm = `
<svg viewBox="0 0 800 250" role="img" aria-label="AI 协作的提交节奏" style="width:100%;height:auto">
  <defs><marker id="ar7" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill="var(--muted)"/></marker></defs>
  <g font-size="12" font-weight="700" text-anchor="middle" fill="var(--ink)">
    <rect x="16" y="46" width="132" height="60" rx="12" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.5"/>
    <text x="82" y="72">① 干净存档</text><text x="82" y="92" font-size="10.5" font-weight="400" fill="var(--muted)">git commit</text>
    <rect x="176" y="46" width="132" height="60" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
    <text x="242" y="72">② AI 动手改</text><text x="242" y="92" font-size="10.5" font-weight="400" fill="var(--muted)">一次只提一件事</text>
    <rect x="336" y="46" width="132" height="60" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
    <text x="402" y="72">③ 看 diff</text><text x="402" y="92" font-size="10.5" font-weight="400" fill="var(--muted)">它到底改了啥</text>
    <rect x="496" y="46" width="132" height="60" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
    <text x="562" y="72">④ 人工验收</text><text x="562" y="92" font-size="10.5" font-weight="400" fill="var(--muted)">清单过一遍</text>
    <rect x="656" y="46" width="128" height="60" rx="12" fill="var(--card)" stroke="#2aa876" stroke-width="1.5"/>
    <text x="720" y="72" fill="#2aa876">⑤ 提交</text><text x="720" y="92" font-size="10.5" font-weight="400" fill="var(--muted)">feat: ...</text>
  </g>
  <g stroke="var(--muted)" stroke-width="1.5" marker-end="url(#ar7)">
    <line x1="148" y1="76" x2="172" y2="76"/><line x1="308" y1="76" x2="332" y2="76"/>
    <line x1="468" y1="76" x2="492" y2="76"/><line x1="628" y1="76" x2="652" y2="76"/>
  </g>
  <path d="M562 106 L562 158 L242 158 L242 110" fill="none" stroke="#d4568a" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#ar7)"/>
  <rect x="292" y="168" width="216" height="34" rx="9" fill="var(--card)" stroke="#d4568a" stroke-width="1.3"/>
  <text x="400" y="190" text-anchor="middle" font-size="11.5" fill="var(--ink)">✕ 不满意 → git restore . 一键回档重来</text>
  <text x="400" y="228" text-anchor="middle" font-size="12" font-weight="700" fill="var(--brand)">口诀：改之前有存档 · 改之后看 diff · 验收完再提交</text>
</svg>`;

/* 图 8：组合实战的迭代流水线 */
SVG.pipeline = `
<svg viewBox="0 0 800 270" role="img" aria-label="组合实战六个迭代" style="width:100%;height:auto">
  <defs><marker id="ar8" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill="var(--muted)"/></marker></defs>
  <g font-size="12">
    <rect x="14" y="40" width="116" height="112" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
    <text x="30" y="64" font-weight="700" fill="var(--brand)">I0 立项</text><text x="30" y="86" font-size="10.5" fill="var(--muted)">README</text><text x="30" y="104" font-size="10.5" fill="var(--muted)">AGENTS.md</text><text x="30" y="122" font-size="10.5" fill="var(--muted)">git init</text><text x="30" y="140" font-size="10.5" fill="var(--muted)">chore:</text>
    <rect x="146" y="40" width="116" height="112" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/>
    <text x="162" y="64" font-weight="700" fill="var(--brand)">I1 手动版</text><text x="162" y="86" font-size="10.5" fill="var(--muted)">单文件 HTML</text><text x="162" y="104" font-size="10.5" fill="var(--muted)">手写 3 条内容</text><text x="162" y="122" font-size="10.5" fill="var(--muted)">能打开就算赢</text><text x="162" y="140" font-size="10.5" fill="var(--muted)">feat:</text>
    <rect x="278" y="40" width="116" height="112" rx="12" fill="var(--card)" stroke="#2aa876" stroke-width="1.7"/>
    <text x="294" y="64" font-weight="700" fill="#2aa876">I2 接 MCP</text><text x="294" y="86" font-size="10.5" fill="var(--muted)">fetch 抓网页</text><text x="294" y="104" font-size="10.5" fill="var(--muted)">filesystem 读源</text><text x="294" y="122" font-size="10.5" fill="var(--muted)">只读权限</text><text x="294" y="140" font-size="10.5" fill="var(--muted)">feat:</text>
    <rect x="410" y="40" width="116" height="112" rx="12" fill="var(--card)" stroke="#e08a3c" stroke-width="1.7"/>
    <text x="426" y="64" font-weight="700" fill="#e08a3c">I3 写 Skill</text><text x="426" y="86" font-size="10.5" fill="var(--muted)">固定格式</text><text x="426" y="104" font-size="10.5" fill="var(--muted)">去重规则</text><text x="426" y="122" font-size="10.5" fill="var(--muted)">进 git 共享</text><text x="426" y="140" font-size="10.5" fill="var(--muted)">feat:</text>
    <rect x="542" y="40" width="116" height="112" rx="12" fill="var(--card)" stroke="#6c5ce7" stroke-width="1.7"/>
    <text x="558" y="64" font-weight="700" fill="#6c5ce7">I4 装 Harness</text><text x="558" y="86" font-size="10.5" fill="var(--muted)">hooks 自检</text><text x="558" y="104" font-size="10.5" fill="var(--muted)">步数预算</text><text x="558" y="122" font-size="10.5" fill="var(--muted)">拒绝自动推送</text><text x="558" y="140" font-size="10.5" fill="var(--muted)">feat:</text>
    <rect x="674" y="40" width="116" height="112" rx="12" fill="var(--card)" stroke="#d4568a" stroke-width="1.7"/>
    <text x="690" y="64" font-weight="700" fill="#d4568a">I5 发布</text><text x="690" y="86" font-size="10.5" fill="var(--muted)">定时生成</text><text x="690" y="104" font-size="10.5" fill="var(--muted)">静态页上线</text><text x="690" y="122" font-size="10.5" fill="var(--muted)">tag v1.0</text><text x="690" y="140" font-size="10.5" fill="var(--muted)">chore:</text>
  </g>
  <g stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ar8)">
    <line x1="130" y1="96" x2="142" y2="96"/><line x1="262" y1="96" x2="274" y2="96"/>
    <line x1="394" y1="96" x2="406" y2="96"/><line x1="526" y1="96" x2="538" y2="96"/>
    <line x1="658" y1="96" x2="670" y2="96"/>
  </g>
  <line x1="14" y1="180" x2="790" y2="180" stroke="var(--line)" stroke-width="1.5"/>
  <text x="400" y="208" text-anchor="middle" font-size="12" font-weight="700" fill="var(--brand)">每完成一个迭代 = 一次对话 + 一次验收 + 一个 commit</text>
  <text x="400" y="232" text-anchor="middle" font-size="11" fill="var(--muted)">整条流水线任何一环出问题，都可以回到上一个 commit 重来</text>
  <text x="400" y="258" text-anchor="middle" font-size="11" fill="var(--muted)">用到的能力：意图表达 → MCP → Skills → Harness → Git → 发布</text>
</svg>`;

/* 图 9：上下文分层 */
SVG.context = `
<svg viewBox="0 0 800 250" role="img" aria-label="项目记忆的分层" style="width:100%;height:auto">
  <rect x="60" y="20" width="680" height="42" rx="10" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.4"/>
  <text x="80" y="46" font-size="12.5" font-weight="700" fill="var(--ink)">常驻 · AGENTS.md / 规则文件</text>
  <text x="720" y="46" text-anchor="end" font-size="11" fill="var(--muted)">项目是什么、怎么跑、哪些不能碰</text>
  <rect x="60" y="70" width="680" height="42" rx="10" fill="var(--card)" stroke="var(--line)" stroke-width="1.4"/>
  <text x="80" y="96" font-size="12.5" font-weight="700" fill="var(--ink)">按需 · Skills</text>
  <text x="720" y="96" text-anchor="end" font-size="11" fill="var(--muted)">命中任务才加载的流程手册</text>
  <rect x="60" y="120" width="680" height="42" rx="10" fill="var(--card)" stroke="var(--line)" stroke-width="1.4"/>
  <text x="80" y="146" font-size="12.5" font-weight="700" fill="var(--ink)">现场 · 报错 / 截图 / diff / 数据结构</text>
  <text x="720" y="146" text-anchor="end" font-size="11" fill="var(--muted)">这一轮对话里临时贴进去</text>
  <rect x="60" y="170" width="680" height="42" rx="10" fill="var(--card)" stroke="var(--line)" stroke-width="1.4"/>
  <text x="80" y="196" font-size="12.5" font-weight="700" fill="var(--ink)">历史 · commit message / CHANGELOG</text>
  <text x="720" y="196" text-anchor="end" font-size="11" fill="var(--muted)">做过什么、为什么改，人和 AI 都能查</text>
  <text x="400" y="238" text-anchor="middle" font-size="11.5" fill="var(--muted)">结论写进文件，不要只在对话里说一次 —— 上下文会被压缩，文件不会</text>
</svg>`;
