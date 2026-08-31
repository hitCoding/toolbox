const categoryNames = { all: "全部工具", favorite: "我的收藏", recent: "最近访问", ai: "AI 助手", skills: "AI Skills", developer: "开发工具", design: "设计创作", office: "办公协作", utility: "实用工具" };
const categoryStyles = {
  ai: ["sparkles", "#6f4fb3", "#f0ebfa"], developer: ["terminal-square", "#176b5b", "#e5f3ef"],
  skills: ["blocks", "#8b5a14", "#fff2d6"],
  design: ["pen-tool", "#b14d5a", "#fae9eb"], office: ["briefcase-business", "#3868a6", "#e8f0fa"],
  utility: ["wrench", "#a5651f", "#f8eee2"]
};

const defaultTools = [
  { id: "serial", name: "串口调试", url: "serial.html", description: "在浏览器中连接串口设备并收发数据", category: "developer", internal: true },
  { id: "codec", name: "数据转换", url: "codec.html", description: "Base64、HEX、Modbus CRC16 与时间戳转换", category: "utility", internal: true },
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com", description: "写作、分析、编程与创意工作的 AI 助手", category: "ai" },
  { id: "claude", name: "Claude", url: "https://claude.ai", description: "长文档阅读、推理和内容协作", category: "ai" },
  { id: "easyeda-agent", name: "嘉立创EasyEDA Agent", url: "https://github.com/zhoushoujianwork/easyeda-agent", description: "EDA / 硬件设计：用 AI 自动化绘制与检查原理图、PCB", category: "skills" },
  { id: "anthropic-skills", name: "Anthropic Skills", url: "https://github.com/anthropics/skills", description: "官方集合：文档、设计、开发与企业工作流 Skill 示例", category: "skills" },
  { id: "awesome-copilot", name: "GitHub Awesome Copilot", url: "https://github.com/github/awesome-copilot", description: "社区集合：Copilot Agents、Skills、指令与插件", category: "skills" },
  { id: "vercel-agent-skills", name: "Vercel Agent Skills", url: "https://github.com/vercel-labs/agent-skills", description: "前端开发：React、Next.js、网页设计与部署最佳实践", category: "skills" },
  { id: "superpowers", name: "Superpowers", url: "https://github.com/obra/superpowers", description: "软件工程：规划、测试、调试、评审与交付工作流", category: "skills" },
  { id: "agent-skills-collection", name: "Agent Skills 中文集合", url: "https://github.com/xcodethink/agent-skills-collection", description: "中英双语：覆盖 15 类开发流程的 200+ 精选 Skills", category: "skills" },
  { id: "embedded-skills", name: "Embedded Skills", url: "https://github.com/rovinax/embedded-skills", description: "嵌入式固件：C 规范、驱动、RTOS、ISR 与工程架构", category: "skills" },
  { id: "embedded-dev-skill", name: "嵌入式开发 Skill", url: "https://github.com/lhbsaa/embedded-dev-skill", description: "ESP32、STM32、RP2040、nRF52 开发调试与协议实现", category: "skills" },
  { id: "embedded-project-setup", name: "STM32 工程 Skill", url: "https://github.com/Victory-7291/project-scaffold-setup-skills", description: "STM32 / Cortex-M：CMake、交叉编译、烧录与调试脚手架", category: "skills" },
  { id: "kicad-agent", name: "KiCad 原理图 Agent", url: "https://github.com/Seahan1/kicad-agent", description: "硬件设计：创建、审查并验证 KiCad 原理图与封装", category: "skills" },
  { id: "kicad-mcp-pro", name: "KiCad MCP Pro", url: "https://github.com/oaslananka/kicad-mcp-pro", description: "PCB 设计：布局布线、ERC/DRC、BOM、DFM 与生产审查", category: "skills" },
  { id: "esp32-development", name: "ESP32 Development Skill", url: "https://github.com/magnus919/agent-skills/tree/main/esp32-development", description: "ESP32：构建、烧录、外设、联网、低功耗、OTA 与故障恢复", category: "skills" },
  { id: "esp32-ai-agent-skill", name: "ESP32 AI Agent Skill", url: "https://github.com/ezrover/ESP32-AI-Agent-Skill", description: "ESP-IDF / PlatformIO：芯片选型、GPIO 校验、原理图与 PCB", category: "skills" },
  { id: "esparagus", name: "ESP32 烧录诊断 Skill", url: "https://github.com/DatanoiseTV/esparagus", description: "ESP32：固件烧录、结构化日志、崩溃识别与自动诊断", category: "skills" },
  { id: "esp-dl", name: "乐鑫 ESP-DL Skill", url: "https://github.com/espressif/esp-dl", description: "ESP32 AI：开发和验证 ESP-DL 推理算子与量化实现", category: "skills" },
  { id: "github", name: "GitHub", url: "https://github.com", description: "代码托管、项目协作与自动化", category: "developer" },
  { id: "codepen", name: "CodePen", url: "https://codepen.io", description: "快速编写和分享前端代码片段", category: "developer" },
  { id: "figma", name: "Figma", url: "https://www.figma.com", description: "界面设计、原型制作与团队协作", category: "design" },
  { id: "canva", name: "Canva", url: "https://www.canva.com", description: "快速制作海报、简报和社交图片", category: "design" },
  { id: "notion", name: "Notion", url: "https://www.notion.so", description: "文档、知识库与项目管理", category: "office" },
  { id: "excalidraw", name: "Excalidraw", url: "https://excalidraw.com", description: "手绘风格的在线白板与流程图", category: "office" },
  { id: "tinypng", name: "TinyPNG", url: "https://tinypng.com", description: "在线压缩 PNG、JPEG 与 WebP 图片", category: "utility" },
  { id: "cloudconvert", name: "CloudConvert", url: "https://cloudconvert.com", description: "文档、图片、音视频格式转换", category: "utility" },
  { id: "regex101", name: "Regex101", url: "https://regex101.com", description: "编写、测试并解释正则表达式", category: "developer" },
  { id: "removebg", name: "Remove.bg", url: "https://www.remove.bg", description: "自动移除图片背景并导出透明图", category: "design" }
];

const state = {
  tools: [...defaultTools, ...readJson("toolbox-custom", [])], favorites: new Set(readJson("toolbox-favorites", [])),
  recent: readJson("toolbox-recent", []), visits: Number(localStorage.getItem("toolbox-visits") || 0), category: "all", search: "", view: localStorage.getItem("toolbox-view") || "grid"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function escapeHtml(value) { const node = document.createElement("div"); node.textContent = value; return node.innerHTML; }
function refreshIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } }); }

function filteredTools() {
  let tools = state.tools;
  if (state.category === "favorite") tools = tools.filter(tool => state.favorites.has(tool.id));
  else if (state.category === "recent") tools = state.recent.map(id => tools.find(tool => tool.id === id)).filter(Boolean);
  else if (state.category !== "all") tools = tools.filter(tool => tool.category === state.category);
  const query = state.search.trim().toLowerCase();
  return query ? tools.filter(tool => [tool.name, tool.description, categoryNames[tool.category]].join(" ").toLowerCase().includes(query)) : tools;
}

function render() {
  const tools = filteredTools();
  const grid = $("#toolGrid");
  grid.className = `tool-grid ${state.view === "list" ? "list" : ""}`;
  grid.innerHTML = tools.map(tool => {
    const [icon, color, bg] = categoryStyles[tool.category] || categoryStyles.utility;
    return `<article class="tool-card">
      <div class="tool-card-top"><span class="tool-icon" style="--icon-color:${color};--icon-bg:${bg}"><i data-lucide="${icon}"></i></span>
      <div class="tool-title"><h3>${escapeHtml(tool.name)}</h3><span>${categoryNames[tool.category]}</span></div>
      <button class="favorite-button ${state.favorites.has(tool.id) ? "active" : ""}" data-favorite="${tool.id}" aria-label="${state.favorites.has(tool.id) ? "取消收藏" : "收藏"}"><i data-lucide="star"></i></button></div>
      <p>${escapeHtml(tool.description)}</p>
      <a class="tool-link" href="${escapeHtml(tool.url)}" ${tool.internal ? "" : "target=\"_blank\" rel=\"noopener noreferrer\""} data-visit="${tool.id}"><span>打开工具</span><i data-lucide="arrow-up-right"></i></a>
    </article>`;
  }).join("");
  $("#emptyState").hidden = tools.length > 0;
  $("#sectionTitle").textContent = state.search ? "搜索结果" : categoryNames[state.category];
  $("#resultLabel").textContent = state.search ? `找到 ${tools.length} 个匹配项` : `${tools.length} 个可用入口`;
  $("#allCount").textContent = state.tools.length;
  $("#favoriteCount").textContent = state.favorites.size;
  $("#toolStat").textContent = state.tools.length;
  $("#visitStat").textContent = state.visits;
  $$(".view-switch button").forEach(button => button.classList.toggle("active", button.dataset.view === state.view));
  refreshIcons();
}

function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("visible"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("visible"), 1800); }
function closeMenu() { $("#sidebar").classList.remove("open"); $("#overlay").hidden = true; }

document.addEventListener("click", event => {
  const favorite = event.target.closest("[data-favorite]");
  if (favorite) {
    const id = favorite.dataset.favorite;
    state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
    localStorage.setItem("toolbox-favorites", JSON.stringify([...state.favorites])); render(); return;
  }
  const visit = event.target.closest("[data-visit]");
  if (visit) {
    state.recent = [visit.dataset.visit, ...state.recent.filter(id => id !== visit.dataset.visit)].slice(0, 8);
    state.visits += 1; localStorage.setItem("toolbox-recent", JSON.stringify(state.recent)); localStorage.setItem("toolbox-visits", state.visits); render();
  }
});

$$(".nav-item[data-category]").forEach(button => button.addEventListener("click", () => {
  state.category = button.dataset.category; $$(".nav-item[data-category]").forEach(item => item.classList.toggle("active", item === button)); closeMenu(); render();
}));
$("#searchInput").addEventListener("input", event => { state.search = event.target.value; render(); });
document.addEventListener("keydown", event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#searchInput").focus(); } });
$$(".view-switch button").forEach(button => button.addEventListener("click", () => { state.view = button.dataset.view; localStorage.setItem("toolbox-view", state.view); render(); }));
$("#addButton").addEventListener("click", () => $("#toolDialog").showModal());
$$("[data-close-dialog]").forEach(button => button.addEventListener("click", () => $("#toolDialog").close()));
$("#toolForm").addEventListener("submit", event => {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  const custom = readJson("toolbox-custom", []); const tool = { id: `custom-${Date.now()}`, name: form.get("name").trim(), url: form.get("url").trim(), description: form.get("description").trim(), category: form.get("category") };
  custom.push(tool); state.tools.push(tool); localStorage.setItem("toolbox-custom", JSON.stringify(custom)); event.currentTarget.reset(); $("#toolDialog").close(); render(); toast("工具已添加");
});
$("#menuButton").addEventListener("click", () => { $("#sidebar").classList.add("open"); $("#overlay").hidden = false; });
$("#overlay").addEventListener("click", closeMenu);
$("#exportButton").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ customTools: readJson("toolbox-custom", []), favorites: [...state.favorites] }, null, 2)], { type: "application/json" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "toolbox-config.json"; link.click(); URL.revokeObjectURL(link.href); toast("配置已导出");
});

const date = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
$("#dateLabel").textContent = date; render();
