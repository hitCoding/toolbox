const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toast(message) { const el = $("#codecToast"); el.textContent = message; el.classList.add("visible"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("visible"), 1600); }
function parseHex(value) {
  const clean = value.replace(/0x/gi, "").replace(/[\s,;:_-]+/g, "").trim();
  if (!clean) return new Uint8Array();
  if (clean.length % 2) throw new Error("HEX 数据必须包含完整字节");
  if (/[^0-9a-f]/i.test(clean)) throw new Error("HEX 数据包含无效字符");
  return new Uint8Array(clean.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}
function formatHex(bytes) { return [...bytes].map(byte => byte.toString(16).padStart(2, "0").toUpperCase()).join(" "); }
function decodeBase64(value) {
  const clean = value.replace(/\s+/g, "");
  if (!clean) return new Uint8Array();
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 === 1) throw new Error("Base64 数据格式无效");
  try { return Uint8Array.from(atob(clean), char => char.charCodeAt(0)); } catch { throw new Error("Base64 数据格式无效"); }
}
function encodeBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}
function toBytes(value, format) {
  if (format === "hex") return parseHex(value);
  if (format === "base64") return decodeBase64(value);
  return textEncoder.encode(value);
}
function fromBytes(bytes, format) {
  if (format === "hex") return formatHex(bytes);
  if (format === "base64") return encodeBase64(bytes);
  return textDecoder.decode(bytes);
}
function convertBase64() {
  try {
    const bytes = toBytes($("#sourceData").value, $("#sourceFormat").value);
    $("#targetData").value = fromBytes(bytes, $("#targetFormat").value);
    $("#sourceBytes").textContent = `${bytes.length} 字节`; $("#targetBytes").textContent = `${bytes.length} 字节`; $("#sourceError").textContent = "";
  } catch (error) { $("#sourceError").textContent = error.message; $("#targetData").value = ""; $("#targetBytes").textContent = "0 字节"; }
}
function crc16Modbus(bytes) {
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
  }
  return crc & 0xffff;
}
function calculateCrc() {
  try {
    const bytes = parseHex($("#crcInput").value);
    if (!bytes.length) throw new Error("请输入 HEX 数据");
    const crc = crc16Modbus(bytes); const low = crc & 0xff; const high = crc >>> 8;
    $("#crcValue").textContent = `0x${crc.toString(16).padStart(4, "0").toUpperCase()}`;
    $("#crcWire").textContent = formatHex(new Uint8Array([low, high]));
    $("#crcHighFirst").textContent = formatHex(new Uint8Array([high, low]));
    $("#crcAppended").textContent = formatHex(new Uint8Array([...bytes, low, high]));
    $("#crcBytes").textContent = `${bytes.length} 字节`; $("#crcError").textContent = "";
  } catch (error) { $("#crcError").textContent = error.message; }
}
function formatLocal(date) {
  const parts = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3, hour12: false }).formatToParts(date);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day} ${value.hour}:${value.minute}:${value.second}.${value.fractionalSecond}`;
}
function convertTimestamp() {
  const raw = $("#timestampInput").value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return toast("请输入有效时间戳");
  const numeric = Number(raw); const milliseconds = Math.abs(numeric) < 1e11 ? numeric * 1000 : numeric; const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) return toast("时间戳超出有效范围");
  $("#detectedUnit").textContent = Math.abs(numeric) < 1e11 ? "秒" : "毫秒";
  $("#localResult").textContent = formatLocal(date); $("#utcResult").textContent = date.toISOString();
}
function pad(value, length = 2) { return String(value).padStart(length, "0"); }
function setNow() {
  const date = new Date(); const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  $("#timestampInput").value = date.getTime(); $("#dateInput").value = local.toISOString().slice(0, 23); convertTimestamp(); convertDate();
}
function convertDate() {
  if (!$("#dateInput").value) return toast("请选择日期时间");
  const milliseconds = new Date($("#dateInput").value).getTime();
  $("#secondsResult").textContent = Math.floor(milliseconds / 1000); $("#millisecondsResult").textContent = milliseconds;
}
async function copyText(value) { if (!value || value === "--") return; await navigator.clipboard.writeText(value); toast("已复制"); }
async function pasteInto(selector) { try { $(selector).value = await navigator.clipboard.readText(); selector === "#crcInput" ? calculateCrc() : convertBase64(); } catch { toast("无法读取剪贴板"); } }

$$('[data-tab]').forEach(button => button.addEventListener("click", () => {
  $$('[data-tab]').forEach(item => item.classList.toggle("active", item === button));
  $$('.tool-pane').forEach(pane => pane.classList.toggle("active", pane.id === `${button.dataset.tab}Pane`));
}));
$("#convertButton").addEventListener("click", convertBase64);
$("#sourceData").addEventListener("input", convertBase64);
$("#sourceFormat").addEventListener("change", convertBase64);
$("#targetFormat").addEventListener("change", convertBase64);
$("#swapButton").addEventListener("click", () => { const value = $("#sourceData").value; const format = $("#sourceFormat").value; $("#sourceData").value = $("#targetData").value; $("#sourceFormat").value = $("#targetFormat").value; $("#targetData").value = value; $("#targetFormat").value = format; convertBase64(); });
$("#base64Clear").addEventListener("click", () => { $("#sourceData").value = $("#targetData").value = ""; convertBase64(); });
$("#pasteSource").addEventListener("click", () => pasteInto("#sourceData"));
$("#copyTarget").addEventListener("click", () => copyText($("#targetData").value));
$("#crcInput").addEventListener("input", () => { try { $("#crcBytes").textContent = `${parseHex($("#crcInput").value).length} 字节`; $("#crcError").textContent = ""; } catch (error) { $("#crcError").textContent = error.message; } });
$("#crcCalculate").addEventListener("click", calculateCrc);
$("#crcClear").addEventListener("click", () => { $("#crcInput").value = ""; $("#crcBytes").textContent = "0 字节"; ["crcValue", "crcAppended"].forEach(id => $(`#${id}`).textContent = id === "crcValue" ? "----" : "--"); ["crcWire", "crcHighFirst"].forEach(id => $(`#${id}`).textContent = "-- --"); });
$("#pasteCrc").addEventListener("click", () => pasteInto("#crcInput"));
$("#timestampConvert").addEventListener("click", convertTimestamp);
$("#dateConvert").addEventListener("click", convertDate);
$("#useNow").addEventListener("click", setNow);
$$('[data-copy-id]').forEach(button => button.addEventListener("click", () => copyText($(`#${button.dataset.copyId}`).textContent)));
window.addEventListener("load", () => { if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } }); convertBase64(); setNow(); });
