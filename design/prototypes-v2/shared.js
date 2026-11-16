"use strict";
const asset = (name) => `assets/illustrations/${name}.png`;
const icon = (name, cls = "") =>
  `<img class="icon ${cls}" src="assets/icons/${name}.svg" alt="">`;
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const byId = (id) => document.getElementById(id);
let toastTimer;
function toast(message) {
  document.querySelector(".toast")?.remove();
  clearTimeout(toastTimer);
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.innerHTML = `<span>${esc(message)}</span><button aria-label="关闭提示">×</button>`;
  document.body.append(el);
  el.querySelector("button").onclick = () => el.remove();
  toastTimer = setTimeout(() => el.remove(), 5000);
}
const themeMedia =
  typeof matchMedia === "function"
    ? matchMedia("(prefers-color-scheme: dark)")
    : null;
let themePreference = "system";
function applyTheme() {
  document.documentElement.classList.toggle(
    "dark",
    themePreference === "dark" ||
      (themePreference === "system" && !!themeMedia?.matches),
  );
  document.documentElement.dataset.appearance = themePreference;
  window.dispatchEvent(new Event("prototype-theme-change"));
}
function setTheme(value) {
  themePreference =
    typeof value === "boolean" ? (value ? "dark" : "light") : value;
  if (!["system", "light", "dark"].includes(themePreference))
    themePreference = "system";
  try {
    sessionStorage.setItem("prototype-theme", themePreference);
  } catch {}
  applyTheme();
}
try {
  themePreference = sessionStorage.getItem("prototype-theme") || "system";
} catch {}
applyTheme();
themeMedia?.addEventListener("change", () => {
  if (themePreference === "system") applyTheme();
});
function toggleTheme() {
  setTheme(!document.documentElement.classList.contains("dark"));
}
function showDialog(title, body, action, label = "确认") {
  let old = document.querySelector("dialog:not(#drawer)");
  old?.remove();
  const previous = document.activeElement;
  const dialog = document.createElement("dialog");
  dialog.innerHTML = `<h2>${esc(title)}</h2>${body}<div class="actions"><button class="btn" data-close>取消</button><button class="btn primary" data-confirm>${esc(label)}</button></div>`;
  document.body.append(dialog);
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.querySelector("[data-confirm]").onclick = () => {
    if (action?.(dialog) !== false) dialog.close();
  };
  dialog.addEventListener("close", () => {
    dialog.remove();
    previous?.focus();
  });
  dialog.showModal();
}
function stateMarkup(state) {
  if (state === "loading")
    return '<div role="status" aria-label="正在加载"><div class="skeleton short"></div><div class="skeleton"></div><div class="skeleton"></div><p class="muted small">正在打捞新消息…</p></div>';
  const data = {
    empty: ["还没有内容", "留一点空白，等下一份美好发生。", "返回默认示例"],
    error: ["暂时没能加载", "网络开了个小差，你可以再试一次。", "重新加载"],
    restricted: [
      "这个入口暂不可用",
      "当前身份没有访问权限，已隐藏相关内容。",
      "返回可用页面",
    ],
  };
  const d = data[state];
  return d
    ? `<div class="empty"><img src="${asset("entry-wish")}" alt=""><h3>${d[0]}</h3><p>${d[1]}</p><button class="btn" data-action="reset-state">${d[2]}</button></div>`
    : "";
}
