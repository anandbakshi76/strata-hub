#!/usr/bin/env node
// The agent guard for Strata Hub. Each coding agent's hook calls this one file, so the rules live in one place.
// Usage: node scripts/agent-guard.mjs <agent> <pre|post>   (claude, codex, cursor, copilot, antigravity, devin)
// It reads the agent's JSON on stdin. To block, it writes the reason to stderr and exits with code 2.
// Each decision, allow or deny, is added to .agent-logs/guard.jsonl (not committed), with secrets masked.
// Change the rules here, and only when the person asks: this file is protected from the agent.
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";

const NO_EDIT = ["docs/INTENT.md",".env",".agent-logs/","scripts/agent-guard.mjs",".claude/settings.json"];
const NO_READ = [".env"];
const ALLOW = [".env.example"];
const COMMANDS = [
  [/\bgit\s+push\b/, "Never push. The person pushes."],
  [/--no-verify\b|\bgit\s+commit\b[^|;&]*\s-n\b/, "Never skip the pre-commit hook."],
  [/\brm\s+-\w*r\w*f|\brm\s+-\w*f\w*r|Remove-Item\b.*-Recurse/i, "No recursive deletes. Ask the person."],
  [/(^|[;&|]\s*)(printenv\b|env\s*($|[|;&>])|(Get-ChildItem|gci|dir|ls)\s+env:)/i, "Don't print the environment: it holds the secrets."],
  [/(^|[\s\/"'=])\.env\b(?!\.example)/, "Don't read secrets."]
];
const SKIPPED = /\b(it|test|describe)\.(skip|only|todo)\(|\bx(it|describe)\(|@pytest\.mark\.skip|pytest\.skip\(/;
const SECRET = /sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const SECRET_ASSIGN = /(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"'\s]{8,}["']/i;
const FORMAT = {".js":["npx","prettier","--write"],".jsx":["npx","prettier","--write"],".ts":["npx","prettier","--write"],".tsx":["npx","prettier","--write"],".css":["npx","prettier","--write"]};

const [agent, event] = process.argv.slice(2);
let raw = "";
for await (const chunk of process.stdin) raw += chunk;
let input = {};
try { input = JSON.parse(raw || "{}"); } catch { input = {}; }

// Each agent sends different JSON. Find the tool's own arguments, then the commands, paths and new text inside them.
const tool = String(input.tool_name || input.toolName || (input.toolCall && input.toolCall.name) || "");
let args = input.tool_input || input.toolArgs || (input.toolCall && input.toolCall.args) || input;
if (typeof args === "string") { try { args = JSON.parse(args); } catch { args = { text: args }; } }
const commands = [], paths = [], texts = [];
const SKIP_KEYS = /^(cwd|transcript_?path|workspacePaths|artifactDirectoryPath|session_?id|hook_event_name|old.*)$/i;
(function walk(v, key) {
  if (typeof v === "string") {
    if (/^(command|commandline|cmd)$/i.test(key)) commands.push(v);
    else if (/(path|file|targetfile)$/i.test(key)) paths.push(v);
    else texts.push(v);
    for (const m of v.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) paths.push(m[1].trim());
  } else if (v && typeof v === "object") for (const k of Object.keys(v)) if (!SKIP_KEYS.test(k)) walk(v[k], k);
})(args, "");
const root = process.cwd().replace(/\\/g, "/").toLowerCase() + "/";
const rel = (p) => { const s = String(p).replace(/\\/g, "/"); const r = s.toLowerCase().startsWith(root) ? s.slice(root.length) : s; return r.replace(/^\.\//, ""); };
const hits = (list, p) => { const r = rel(p); return !ALLOW.includes(r) && list.some((x) => r === x || r.startsWith(x) || (x === ".env" && r.startsWith(".env."))); };
const isTest = paths.some((p) => /(^|\/)(tests?|e2e|__tests__)\/|[._]test\.|\.spec\.|(^|\/)test_[^\/]*\.py$/.test(rel(p)));

// One line per decision. A target that looks like a secret is masked, and long ones are cut.
const mask = (t) => String(t).replace(new RegExp(SECRET.source, "g"), "***").replace(/((?:api[_-]?key|secret|password|token)\s*[:=]\s*)\S+/gi, "$1***").slice(0, 200);
function log(decision, rule) {
  try {
    mkdirSync(".agent-logs", { recursive: true });
    appendFileSync(".agent-logs/guard.jsonl", JSON.stringify({ time: new Date().toISOString(), agent, tool, decision, rule, target: mask(commands[0] || (paths[0] ? rel(paths[0]) : "")) }) + "\n");
  } catch { /* logging never blocks the agent */ }
}

function deny(why) {
  log("deny", why);
  if (agent === "antigravity") { process.stdout.write(JSON.stringify({ decision: "deny", reason: why })); process.exit(0); }
  process.stderr.write("Blocked by the agent guard: " + why + " If this is wrong, stop and ask the person.\n");
  process.exit(2);
}

if (event === "pre") {
  for (const c of commands) for (const [re, why] of COMMANDS) if (re.test(c)) deny(why);
  const reading = /^(read|view_file|notebook_read)$/i.test(tool);
  for (const p of paths) if (hits(reading ? NO_READ : NO_EDIT, p)) deny(rel(p) + (reading ? " is not to be read." : " is protected. Ask the person to change it."));
  for (const t of texts) {
    if (isTest && SKIPPED.test(t)) deny("Never skip, focus or empty a test. Fix the code instead.");
    if (SECRET.test(t) || (!isTest && SECRET_ASSIGN.test(t))) deny("That looks like a secret. Read it from the environment and list its name in .env.example.");
  }
  log("allow");
  if (agent === "antigravity") process.stdout.write(JSON.stringify({ decision: "allow" }));
} else if (event === "post") {
  for (const p of paths) {
    const ext = (rel(p).match(/\.\w+$/) || [""])[0], cmd = FORMAT[ext];
    if (cmd) try { execFileSync(cmd[0], cmd.slice(1).concat(rel(p)), { stdio: "ignore", shell: process.platform === "win32" }); } catch { /* the check command reports it */ }
  }
  if (agent === "antigravity") process.stdout.write("{}");
}
process.exit(0);
