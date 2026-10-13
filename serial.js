const elements = Object.fromEntries([
  "connectButton", "disconnectButton", "connectionState", "baudRate", "dataBits", "stopBits", "parity", "flowControl",
  "dtr", "rts", "rxBytes", "txBytes", "receiveMode", "timestamp", "autoScroll", "exportLog", "clearLog", "terminalOutput",
  "sendForm", "sendInput", "sendMode", "lineEnding", "sendButton", "unsupported", "serialToast"
].map(id => [id, document.getElementById(id)]));

let port = null;
let reader = null;
let keepReading = false;
let receiveMode = "text";
let sendMode = "text";
let rxCount = 0;
let txCount = 0;
let decoder = new TextDecoder();
const maxLogLines = 5000;

function refreshIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } }); }
function toast(message) { elements.serialToast.textContent = message; elements.serialToast.classList.add("visible"); clearTimeout(toast.timer); toast.timer = setTimeout(() => elements.serialToast.classList.remove("visible"), 1800); }
function formatBytes(bytes) { return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`; }
function now() { return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3, hour12: false }).format(new Date()); }
function hex(bytes) { return [...bytes].map(byte => byte.toString(16).padStart(2, "0").toUpperCase()).join(" "); }

function appendLine(type, content) {
  const line = document.createElement("div");
  if (type === "system" || type === "error") {
    line.className = type === "error" ? "error-line" : "system-line";
    line.textContent = content;
  } else {
    line.className = "terminal-line";
    if (elements.timestamp.checked) { const time = document.createElement("span"); time.className = "terminal-time"; time.textContent = now(); line.append(time); }
    const direction = document.createElement("span"); direction.className = `terminal-direction ${type}`; direction.textContent = type === "tx" ? "TX" : "RX";
    const data = document.createElement("span"); data.textContent = content; line.append(direction, data);
  }
  elements.terminalOutput.append(line);
  while (elements.terminalOutput.childElementCount > maxLogLines) elements.terminalOutput.firstElementChild.remove();
  if (elements.autoScroll.checked) elements.terminalOutput.scrollTop = elements.terminalOutput.scrollHeight;
}

function setConnected(connected) {
  elements.connectionState.classList.toggle("connected", connected);
  elements.connectionState.querySelector("b").textContent = connected ? "已连接" : "未连接";
  elements.connectButton.disabled = connected;
  elements.disconnectButton.disabled = !connected;
  elements.sendInput.disabled = !connected;
  elements.sendButton.disabled = !connected;
  [elements.baudRate, elements.dataBits, elements.stopBits, elements.parity, elements.flowControl].forEach(input => input.disabled = connected);
}

async function connect() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: Number(elements.baudRate.value), dataBits: Number(elements.dataBits.value), stopBits: Number(elements.stopBits.value), parity: elements.parity.value, flowControl: elements.flowControl.value });
    await updateSignals(); setConnected(true); appendLine("system", `串口已连接 · ${elements.baudRate.value} baud`); keepReading = true; readLoop();
  } catch (error) {
    if (error.name !== "NotFoundError") appendLine("error", `连接失败：${error.message}`);
  }
}

async function readLoop() {
  while (port?.readable && keepReading) {
    reader = port.readable.getReader();
    try {
      while (keepReading) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) { rxCount += value.byteLength; elements.rxBytes.textContent = formatBytes(rxCount); appendLine("rx", receiveMode === "hex" ? hex(value) : decoder.decode(value, { stream: true })); }
      }
    } catch (error) { if (keepReading) appendLine("error", `读取失败：${error.message}`); }
    finally { reader.releaseLock(); reader = null; }
  }
}

async function disconnect() {
  keepReading = false;
  if (reader) { try { await reader.cancel(); } catch {} }
  if (port) { try { await port.close(); } catch {} }
  port = null; setConnected(false); appendLine("system", "串口已断开");
}

async function updateSignals() {
  if (!port) return;
  try { await port.setSignals({ dataTerminalReady: elements.dtr.checked, requestToSend: elements.rts.checked }); }
  catch (error) { toast(`控制信号设置失败：${error.message}`); }
}

function parseHex(value) {
  const clean = value.replace(/0x/gi, "").replace(/[\s,]+/g, "").trim();
  if (!clean || clean.length % 2 || /[^0-9a-f]/i.test(clean)) throw new Error("HEX 数据必须由完整的十六进制字节组成");
  return new Uint8Array(clean.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}

async function send(event) {
  event.preventDefault();
  if (!port?.writable || !elements.sendInput.value) return;
  try {
    let data;
    if (sendMode === "hex") data = parseHex(elements.sendInput.value);
    else {
      const endings = { none: "", lf: "\n", cr: "\r", crlf: "\r\n" };
      data = new TextEncoder().encode(elements.sendInput.value + endings[elements.lineEnding.value]);
    }
    const writer = port.writable.getWriter();
    try { await writer.write(data); } finally { writer.releaseLock(); }
    txCount += data.byteLength; elements.txBytes.textContent = formatBytes(txCount); appendLine("tx", sendMode === "hex" ? hex(data) : elements.sendInput.value); elements.sendInput.value = "";
  } catch (error) { appendLine("error", `发送失败：${error.message}`); }
}

function bindSegmented(container, callback) {
  container.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    container.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button)); callback(button.dataset.mode);
  }));
}

elements.connectButton.addEventListener("click", connect);
elements.disconnectButton.addEventListener("click", disconnect);
elements.sendForm.addEventListener("submit", send);
elements.sendInput.addEventListener("keydown", event => { if (event.ctrlKey && event.key === "Enter") elements.sendForm.requestSubmit(); });
[elements.dtr, elements.rts].forEach(input => input.addEventListener("change", updateSignals));
bindSegmented(elements.receiveMode, mode => receiveMode = mode);
bindSegmented(elements.sendMode, mode => { sendMode = mode; elements.lineEnding.disabled = mode === "hex"; });
elements.clearLog.addEventListener("click", () => { elements.terminalOutput.innerHTML = ""; appendLine("system", "日志已清空"); });
elements.exportLog.addEventListener("click", () => {
  const blob = new Blob([elements.terminalOutput.innerText], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `serial-${new Date().toISOString().replace(/[:.]/g, "-")}.log`; link.click(); URL.revokeObjectURL(link.href);
});
window.addEventListener("beforeunload", () => { if (port) disconnect(); });
if ("serial" in navigator) navigator.serial.addEventListener("disconnect", event => { if (event.target === port) disconnect(); });
else elements.unsupported.hidden = false;
window.addEventListener("load", refreshIcons);
