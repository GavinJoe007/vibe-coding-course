#!/usr/bin/env node
/**
 * mini-mcp.js —— 零依赖的最小 MCP Server
 * 协议：JSON-RPC 2.0，传输：stdio，消息：每行一个 JSON（换行分隔）
 *
 * 手动测试：
 *   printf '%s\n' \
 *     '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
 *     '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
 *     '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"now","arguments":{}}}' \
 *     | node mini-mcp.js
 *
 * ⚠️ 关键约定：stdout 只准输出协议消息，日志一律走 stderr，否则会破坏协议。
 */
const readline = require('node:readline');

const TOOLS = [
  {
    name: 'now',
    description: '返回当前本地时间',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'add',
    description: '把两个数相加',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b']
    }
  }
];

function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}
function error(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}
function log(...args) { console.error('[mini-mcp]', ...args); } // 调试信息走 stderr

function handle(msg) {
  const { id, method, params = {} } = msg;

  // 通知（notification）没有 id，不需要回复
  if (method === 'notifications/initialized' || method === 'notifications/cancelled') return;

  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: '2025-06-18',
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: 'mini-mcp', version: '1.0.0' }
    });
  }
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') return reply(id, { tools: TOOLS });

  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params;
    let text;
    if (name === 'now') {
      text = new Date().toLocaleString('zh-CN');
    } else if (name === 'add') {
      text = String(Number(args.a) + Number(args.b));
    } else {
      return error(id, -32602, `未知工具: ${name}`);
    }
    return reply(id, { content: [{ type: 'text', text }], isError: false });
  }

  return error(id, -32601, `不支持的方法: ${method}`);
}

log('server started, waiting on stdin...');
readline.createInterface({ input: process.stdin, crlfDelay: Infinity })
  .on('line', line => {
    if (!line.trim()) return;
    try { handle(JSON.parse(line)); }
    catch (e) { log('bad message:', e.message); }
  });
