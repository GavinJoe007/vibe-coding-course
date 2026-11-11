/**
 * mini-harness.js —— 约 50 行的「最小 Agent 运行框架」
 *
 * 它要说明一件事：同一个模型，聊天窗口里只能给建议，Agent 里能把活干完，
 * 差别不在模型，而在这层循环 + 治理。这里用假模型演示骨架，
 * 把 fakeModel 换成任意支持 tool_use 的 LLM SDK 即可真实运行。
 *
 * 运行：node mini-harness.js
 */

// ── 1. 工具表：真实场景里这些 schema 来自 MCP 的 tools/list ──────────────
const tools = {
  read_file: {
    description: '读取一个文本文件',
    schema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
    run: async ({ path }) => `[伪实现] 读到 ${path} 的内容：今日三件事已完成 2 件`
  },
  write_file: {
    description: '写入一个文本文件',
    schema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } } },
    run: async ({ path }) => `[伪实现] 已写入 ${path}`
  }
};

// ── 2. 假模型：第一次要读文件，读到之后给出最终答案 ─────────────────────
async function fakeModel(messages) {
  const sawToolResult = messages.some(m => m.role === 'tool');
  if (!sawToolResult) {
    return { stop: 'tool_use', toolCalls: [{ name: 'read_file', args: { path: 'notes.txt' } }] };
  }
  return { stop: 'end_turn', text: '已根据 notes.txt 生成简报：今日三件事已完成 2 件。' };
}

// ── 3. 权限闸门：真实场景里这里会弹窗问用户 ────────────────────────────
const permissions = {
  check: async (call) => call.name === 'read_file' ? 'allow' : 'ask'
};

// ── 4. Hooks：在关键节点插入确定性的自动化 ──────────────────────────────
const hooks = {
  afterTool: async (call, result) => console.log(`  [hook] ${call.name} 完成，结果已记入轨迹`)
};

// ── 5. Agent Loop：感知 → 决策 → 行动 → 观察 → 直到完成 ─────────────────
async function run(goal, { maxSteps = 8 } = {}) {
  const messages = [
    { role: 'system', content: '你是一个严谨的助理，只依据工具返回的事实回答。' },
    { role: 'user', content: goal }
  ];
  const signatures = [];

  for (let step = 1; step <= maxSteps; step++) {
    console.log(`\n— step ${step} —`);
    const res = await fakeModel(messages);                       // 决策
    if (res.stop === 'end_turn') return res.text;               // 终止条件

    for (const call of res.toolCalls) {                          // 行动
      // 死循环保护：连续 3 次同样的调用就停机
      const sig = call.name + JSON.stringify(call.args);
      signatures.push(sig);
      if (signatures.length >= 3 && signatures.slice(-3).every(s => s === sig)) {
        return '检测到重复调用，已停机，请人工接手。';
      }
      const verdict = await permissions.check(call);
      const out = verdict === 'allow'
        ? await tools[call.name].run(call.args)
        : '用户拒绝了该操作';
      await hooks.afterTool(call, out);
      messages.push({ role: 'assistant', content: `调用 ${call.name}` });
      messages.push({ role: 'tool', content: out });            // 观察回灌
    }
  }
  return '达到步数上限，已停机（预算兜底）。';
}

run('读一下今天的笔记，生成一段简报').then(text => console.log('\n✅ 最终输出：', text));
