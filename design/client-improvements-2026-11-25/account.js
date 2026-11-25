"use strict";
const byId = (id) => document.getElementById(id);
const assetDir = "../prototypes-v2/assets/illustrations/";
const profiles = [
  { name: "岸边的锦鲤", img: "profile-koi.png" },
  { name: "晚风里的荷叶", img: "entry-whisper.png" },
  { name: "听雨的小亭", img: "pavilion.png" },
  { name: "游到池中央", img: "brand-koi.png" },
];
const wxSample = { name: "小满", img: "pond.jpg" };
const types = {
  success: ["成功", "✓", "资料已保存", "已更新你的头像和昵称。", 1500],
  info: ["消息", "i", "学生卡已上传", "可稍后回来查看扫描结果。", 2000],
  progress: ["进行中", "◌", "正在检查图片", "可以先离开认证页面。", 0],
  warning: [
    "提醒",
    "!",
    "请重新选择照片",
    "新照片未通过扫描，原照片仍可使用。",
    3000,
  ],
  error: ["失败", "×", "照片暂时无法查看", "请检查网络后重试。", 3000],
  uncertain: [
    "结果待确认",
    "?",
    "保存结果待确认",
    "可在资料页继续确认本次保存。",
    4000,
  ],
};
const labels = {
  profile: "个人资料",
  verification: "身份认证",
  notices: "操作反馈",
};
const defaultDraft = () => ({
  active: null,
  candidate: null,
  submitted: false,
  seq: 0,
});
const storageKey = "liyuanci-account-prototype-v1";
let card = defaultDraft();
try {
  card = JSON.parse(localStorage.getItem(storageKey)) || card;
} catch {}
let saved = { ...profiles[0] };
let draft = { ...saved };
let staged;
let person = "";
let number = "";
let page;
let bannerTimer;
let scanTimer;
let feedbackKind = "success";
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const button = (action, label, cls = "secondary", disabled = false) =>
  '<button type="button" data-action="' +
  action +
  '" class="' +
  cls +
  '"' +
  (disabled ? " disabled" : "") +
  ">" +
  label +
  "</button>";
const row = (action, title, hint) =>
  button(
    action,
    "<strong>" + title + "</strong><small>" + hint + "　›</small>",
    "option",
  );
const artwork = (profile) =>
  '<img alt="" src="' + assetDir + profile.img + '">';
const stamp = (value) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
function persistCard() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(card));
  } catch {}
}
function makeCard(record) {
  return (
    '<div class="stub ' +
    (record.seq % 2 === 0 ? "alt" : "") +
    '"><h4>学生卡</h4><small>校园卡面样张 ' +
    record.seq +
    "</small><small>姓名 ···　学号 ····</small></div>"
  );
}
function closeBanner() {
  clearTimeout(bannerTimer);
  byId("floating").replaceChildren();
}
function banner(kind, title = types[kind][2], description = types[kind][3]) {
  closeBanner();
  const [, icon, , , delay] = types[kind];
  byId("floating").innerHTML =
    '<div class="banner ' +
    kind +
    '" role="' +
    (kind === "error" ? "alert" : "status") +
    '"><span class="mark" aria-hidden="true">' +
    icon +
    "</span><div><strong>" +
    esc(title) +
    "</strong><small>" +
    esc(description) +
    "</small></div>" +
    button(
      "dismiss",
      '<span aria-hidden="true">×</span><span class="visually-hidden">关闭提示</span>',
      "",
    ) +
    "</div>";
  if (delay) bannerTimer = setTimeout(closeBanner, delay);
}
function sheet(title, html) {
  byId("sheet-title").textContent = title;
  byId("sheet-body").innerHTML = html;
  if (!byId("dialog").open) byId("dialog").showModal();
}
function hideSheet() {
  byId("dialog").close();
  byId("sheet-body").replaceChildren();
}
function changed() {
  return draft.img !== saved.img || draft.name.trim() !== saved.name;
}
function profilePage() {
  return (
    '<h2>个人资料</h2><div class="card hero">' +
    artwork(draft) +
    "<div><strong>" +
    esc(draft.name.trim() || "填写昵称") +
    '</strong><span class="meta">' +
    (changed() ? "待保存" : "当前头像与昵称") +
    "</span></div></div>" +
    '<div class="card"><h3>头像与昵称</h3>' +
    row("wechat", "使用微信头像和昵称", "微信资料") +
    row("random", "系统随机头像和昵称", "换一组") +
    row("manual", "自选头像", "相册或相机") +
    row("default", "恢复默认头像", "") +
    '<label class="field">昵称<input id="nickname" maxlength="40" value="' +
    esc(draft.name) +
    '"></label></div>' +
    button("save", "保存资料", "solid full", !changed() || !draft.name.trim())
  );
}
function wechatSheet() {
  sheet(
    "使用微信资料",
    '<div class="card hero">' +
      artwork(staged) +
      "<strong>" +
      esc(staged.name || "填写昵称") +
      "</strong></div>" +
      row("wx-avatar", "选择微信头像", "选择") +
      '<label class="field">昵称<input id="wx-name" maxlength="40" value="' +
      esc(staged.name) +
      '"></label>' +
      button("wx-name", "填入键盘推荐的昵称「小满」", "secondary full") +
      '<div class="actions">' +
      button("close", "取消") +
      button("apply-wx", "使用所选资料", "solid") +
      "</div>",
  );
}
function settleScan() {
  clearTimeout(scanTimer);
  const candidate = card.candidate;
  if (!candidate || candidate.status !== "pending") return;
  if (candidate.readyAt > Date.now()) {
    scanTimer = setTimeout(settleScan, candidate.readyAt - Date.now());
    return;
  }
  candidate.status = candidate.result;
  candidate.at = Date.now();
  if (candidate.status === "approved") {
    card.active = { seq: candidate.seq, at: candidate.at };
    card.candidate = null;
  }
  persistCard();
  if (page === "verification") render();
}
function cardActions() {
  const current = card.active,
    candidate = card.candidate;
  let html = '<div class="card"><h3>学生卡照片</h3>';
  if (current)
    html +=
      makeCard(current) +
      '<span class="state">安全扫描通过</span><p class="help">' +
      stamp(current.at) +
      ' · 已保存，可下次继续使用</p><div class="actions">' +
      button("preview", "查看照片与记录") +
      button(
        "upload",
        "替换照片",
        "secondary",
        candidate?.status === "pending",
      ) +
      "</div>";
  else
    html +=
      '<p class="help">上传清晰的本人学生卡，支持 JPG 或 PNG。</p>' +
      button(
        "upload",
        candidate ? "重新选择照片" : "选择学生卡照片",
        "secondary full",
        candidate?.status === "pending",
      );
  if (candidate?.status === "pending") {
    html +=
      '<p class="form-status">新照片正在扫描。可离开页面，稍后回来查看。</p>';
    if (current)
      html += button(
        "cancel-replacement",
        "取消替换，继续使用原照片",
        "secondary full",
      );
  }
  if (candidate?.status === "rejected")
    html +=
      '<p class="form-status">新照片未通过安全扫描。' +
      (current ? "原照片仍可使用。" : "请选择清晰、完整的本人学生卡照片。") +
      "</p>";
  return html + "</div>";
}
function verifyPage() {
  if (card.submitted)
    return '<h2>身份认证</h2><div class="card"><span class="state warn">待人工审核</span><h3>申请已提交</h3><p class="help">你可以在这里查看审核结果。</p></div>';
  return (
    "<h2>身份认证</h2>" +
    cardActions() +
    '<div class="card"><h3>学生信息</h3>' +
    '<label class="field">姓名<input id="person" autocomplete="off" placeholder="请输入学生卡上的姓名" value="' +
    esc(person) +
    '"></label>' +
    '<label class="field">学号<input id="number" autocomplete="off" inputmode="numeric" maxlength="12" placeholder="填写 12 位学号" value="' +
    esc(number) +
    '"></label><p class="help">照片仅用于学生资格审核。离开后，姓名和学号需重新填写。</p></div>' +
    button("submit", "提交认证申请", "solid full", !canSubmit())
  );
}
function canSubmit() {
  return (
    !!card.active &&
    card.candidate?.status !== "pending" &&
    !!person.trim() &&
    /^[1-9][0-9]{11}$/.test(number)
  );
}
function noticesPage() {
  const [, , title, message] = types[feedbackKind];
  const retry = feedbackKind === "error" || feedbackKind === "uncertain";
  return (
    '<h2>个人资料</h2><div class="card hero">' +
    artwork(saved) +
    "<div><strong>" +
    esc(saved.name) +
    '</strong><span class="meta">当前头像与昵称</span></div></div>' +
    '<div class="card"><h3>最近操作</h3><p>' +
    esc(title) +
    '</p><p class="help">' +
    esc(message) +
    "</p>" +
    (retry
      ? button(
          "resolve-feedback",
          feedbackKind === "uncertain" ? "确认保存结果" : "重试查看",
        )
      : "") +
    "</div>"
  );
}
function render() {
  byId("surface").innerHTML =
    page === "verification"
      ? verifyPage()
      : page === "notices"
        ? noticesPage()
        : profilePage();
  for (const link of document.querySelectorAll("nav a")) {
    if (link.hash === "#" + page) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  byId("scan-tools").hidden = page !== "verification";
  byId("notice-tools").hidden = page !== "notices";
  byId("notice-kinds").innerHTML = Object.entries(types)
    .map(
      ([key, spec]) =>
        '<button data-feedback="' +
        key +
        '" aria-pressed="' +
        (key === feedbackKind) +
        '">' +
        spec[0] +
        "</button>",
    )
    .join("");
}
function navigate() {
  if (byId("dialog").open) hideSheet();
  closeBanner();
  const hash = location.hash.slice(1);
  page = Object.hasOwn(labels, hash) ? hash : "profile";
  person = "";
  number = "";
  draft = { ...saved };
  settleScan();
  render();
  if (page === "notices") banner(feedbackKind);
}
function startScan() {
  hideSheet();
  const result = document.querySelector(
    "input[name=scan-result]:checked",
  ).value;
  card.seq++;
  card.candidate = {
    seq: card.seq,
    status: "pending",
    result,
    readyAt: Date.now() + 1800,
  };
  persistCard();
  settleScan();
  render();
  banner("info");
}
function pickRandom() {
  const others = profiles.filter((item) => item.img !== draft.img);
  draft = { ...others[Math.floor(Math.random() * others.length)] };
  render();
}
function handleAction(action) {
  switch (action) {
    case "close":
      hideSheet();
      break;
    case "dismiss":
      closeBanner();
      break;
    case "wechat":
      staged = { ...draft };
      wechatSheet();
      break;
    case "wx-avatar":
      staged.img = wxSample.img;
      wechatSheet();
      break;
    case "wx-name":
      staged.name = wxSample.name;
      wechatSheet();
      break;
    case "apply-wx":
      if (!staged.name.trim()) {
        byId("wx-name").focus();
        break;
      }
      draft = { ...staged };
      hideSheet();
      render();
      break;
    case "random":
      pickRandom();
      break;
    case "manual":
      sheet(
        "自选头像",
        "<p>选择一张照片作为头像。</p>" +
          button("apply-manual", "选择相册里的池塘照片", "secondary full"),
      );
      break;
    case "apply-manual":
      draft.img = "pond.jpg";
      hideSheet();
      render();
      break;
    case "default":
      draft.img = "profile-koi.png";
      render();
      break;
    case "save":
      saved = { ...draft, name: draft.name.trim() };
      draft = { ...saved };
      render();
      banner("success");
      break;
    case "upload":
      sheet(
        "选择学生卡照片",
        makeCard({ seq: card.seq + 1 }) +
          '<div class="actions">' +
          button("close", "取消") +
          button("start-scan", "使用这张照片", "solid") +
          "</div>",
      );
      break;
    case "start-scan":
      startScan();
      break;
    case "cancel-replacement":
      clearTimeout(scanTimer);
      card.candidate = null;
      persistCard();
      render();
      banner("info", "已取消替换", "原照片仍可用于认证。");
      break;
    case "preview":
      sheet(
        "照片与扫描记录",
        makeCard(card.active) +
          "<h3>安全扫描通过</h3><p>" +
          stamp(card.active.at) +
          " · 本张照片可用于本次认证</p>" +
          button(
            "remove-photo",
            "移除照片",
            "secondary full",
            card.candidate?.status === "pending",
          ),
      );
      break;
    case "remove-photo":
      sheet(
        "移除学生卡照片",
        '<p>下次提交认证前需要重新上传照片。</p><div class="actions">' +
          button("close", "保留照片") +
          button("confirm-remove", "移除照片", "solid") +
          "</div>",
      );
      break;
    case "confirm-remove":
      hideSheet();
      card.active = null;
      card.candidate = null;
      persistCard();
      render();
      banner("info", "照片已移除", "可以重新选择学生卡照片。");
      break;
    case "submit":
      if (canSubmit()) {
        card.submitted = true;
        persistCard();
        person = "";
        number = "";
        render();
        banner("success", "认证申请已提交", "等待人工审核。");
      }
      break;
    case "resolve-feedback":
      feedbackKind = "success";
      render();
      banner("success", "操作已确认", "已获取本次操作的结果。");
      break;
    case "reset-example":
      card = defaultDraft();
      person = "";
      number = "";
      closeBanner();
      persistCard();
      render();
      break;
  }
}
byId("dialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  hideSheet();
});
document.addEventListener("click", (event) => {
  const clicked = event.target.closest("button");
  if (!clicked || clicked.disabled) return;
  if (clicked.dataset.feedback) {
    feedbackKind = clicked.dataset.feedback;
    render();
    banner(feedbackKind);
    return;
  }
  if (clicked.dataset.action) handleAction(clicked.dataset.action);
});
document.addEventListener("input", (event) => {
  const input = event.target;
  if (input.id === "wx-name") {
    staged.name = input.value;
  }
  if (input.id === "nickname") {
    draft.name = input.value;
    document.querySelector(".hero strong").textContent =
      draft.name.trim() || "填写昵称";
    document.querySelector(".hero .meta").textContent = changed()
      ? "待保存"
      : "当前头像与昵称";
    document.querySelector('[data-action="save"]').disabled =
      !changed() || !draft.name.trim();
  }
  if (input.id === "number" || input.id === "person") {
    if (input.id === "number") number = input.value;
    else person = input.value;
    document.querySelector('[data-action="submit"]').disabled = !canSubmit();
  }
});
window.addEventListener("hashchange", navigate);
navigate();
