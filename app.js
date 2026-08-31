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
  { id: "easyeda-agent", name: "嘉立创EDA EasyEDA Agent", url: "https://github.com/zhoushoujianwork/easyeda-agent", description: "EDA / 硬件设计：用 AI 自动化绘制与检查原理图、PCB", category: "skills" },
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
