"use strict";
const pages = [
  {
    route: "pages/index/index",
    title: "鲤愿池",
    id: "home",
  },
  {
    route: "pages/hot-content/index",
    title: "本周热点",
    id: "hot",
  },
  {
    route: "pages/verification/index",
    title: "学生认证",
    id: "verify",
  },
  {
    route: "pages/wish-detail/index",
    title: "心愿详情",
    id: "wish",
  },
  {
    route: "pages/wishes/index",
    title: "心愿池",
    id: "wishes",
  },
  {
    route: "pages/wishes/shortcut",
    title: "心愿池",
    id: "compose",
  },
  {
    route: "pages/applications/index",
    title: "应愿申请",
    id: "applications",
  },
  {
    route: "pages/public-profile/index",
    title: "公开主页",
    id: "public",
  },
  {
    route: "pages/inbox/index",
    title: "通知中心",
    id: "inbox",
  },
  {
    route: "pages/chat/index",
    title: "匿名聊天",
    id: "chat",
  },
  {
    route: "pages/stories/index",
    title: "还愿故事",
    id: "stories",
  },
  {
    route: "pages/story-editor/index",
    title: "我的还愿故事",
    id: "story-editor",
  },
  {
    route: "pages/settings/index",
    title: "个人资料与隐私",
    id: "settings",
  },
  {
    route: "pages/blacklist/index",
    title: "黑名单",
    id: "blacklist",
  },
  {
    route: "pages/report/index",
    title: "举报内容",
    id: "report",
  },
  {
    route: "pages/safety/index",
    title: "警告与申诉",
    id: "safety",
  },
  {
    route: "pages/care/index",
    title: "关怀与援助",
    id: "care",
  },
  {
    route: "pages/deletion/index",
    title: "账号注销",
    id: "deletion",
  },
  {
    route: "pages/whispers/index",
    title: "悄悄话",
    id: "whispers",
  },
  {
    route: "pages/whispers/detail",
    title: "树洞详情",
    id: "whisper",
  },
  {
    route: "pages/whispers/editor",
    title: "我的树洞",
    id: "whisper-editor",
  },
  {
    route: "pages/whispers/mine",
    title: "我的树洞记录",
    id: "whisper-mine",
  },
  {
    route: "pages/whispers/nickname",
    title: "树洞昵称",
    id: "nickname",
  },
  {
    route: "pages/whispers/help",
    title: "解忧与公共援助",
    id: "help",
  },
  {
    route: "pages/whispers/report",
    title: "举报树洞内容",
    id: "whisper-report",
  },
  {
    route: "pages/whispers/notifications",
    title: "悄悄鲤通知",
    id: "whisper-notices",
  },
  {
    route: "pages/capsules/index",
    title: "时光胶囊",
    id: "capsules",
  },
  {
    route: "pages/capsules/create",
    title: "写给未来的自己",
    id: "capsule-create",
  },
  {
    route: "pages/capsules/detail",
    title: "本人胶囊详情",
    id: "capsule",
  },
  {
    route: "pages/resources/index",
    title: "资料广场",
    id: "resources",
  },
  {
    route: "pages/resources/detail",
    title: "资料详情",
    id: "resource",
  },
  {
    route: "pages/profile/index",
    title: "我的",
    id: "profile",
  },
  {
    route: "pages/whispers/settings",
    title: "悄悄话设置",
    id: "whisper-settings",
  },
  {
    route: "pages/matchmaking/index",
    title: "包分配",
    id: "matchmaking",
  },
  {
    route: "pages/matchmaking/profile",
    title: "包分配资料",
    id: "match-profile",
  },
  {
    route: "pages/matchmaking/detail",
    title: "包分配活动",
    id: "match",
  },
  {
    route: "pages/favorites/index",
    title: "我的收藏",
    id: "favorites",
  },
];
const groups = [
  ["开始与发现", ["home", "hot", "verify"]],
  [
    "心愿与回响",
    [
      "wishes",
      "wish",
      "compose",
      "applications",
      "stories",
      "story-editor",
      "public",
    ],
  ],
  [
    "心事与时光",
    [
      "whispers",
      "whisper",
      "whisper-editor",
      "whisper-mine",
      "nickname",
      "whisper-settings",
      "whisper-notices",
      "help",
      "whisper-report",
      "capsules",
      "capsule-create",
      "capsule",
    ],
  ],
  [
    "遇见与分享",
    ["matchmaking", "match-profile", "match", "resources", "resource"],
  ],
  [
    "我的与消息",
    [
      "profile",
      "inbox",
      "chat",
      "favorites",
      "settings",
      "blacklist",
      "report",
      "safety",
      "care",
      "deletion",
    ],
  ],
];
const mainTabs = [
  ["home", "首页", "home"],
  ["wishes", "心愿池", "fish"],
  ["whispers", "悄悄话", "chat"],
  ["resources", "资料", "book"],
  ["profile", "我的", "user"],
];
const wishData = [
  {
    id: 1,
    name: "小满",
    initial: "满",
    category: "学习互助",
    title: "想找一个一起坚持晨读的伙伴",
    body: "图书馆门前的银杏黄了，想找一位同学，每周一起读两次英语。互相督促，也分享一点新发现。",
    time: "10 分钟前",
    campus: "大学城校区",
    likes: 24,
    comments: 6,
  },
  {
    id: 2,
    name: "橙子",
    initial: "橙",
    category: "校园搭子",
    title: "周六一起去校园里记录秋天吧",
    body: "想给校园的每一棵树拍张照片。欢迎同样喜欢散步和摄影的你，手机也可以。",
    time: "32 分钟前",
    campus: "石牌校区",
    likes: 18,
    comments: 3,
  },
  {
    id: 3,
    name: "慢慢来",
    initial: "慢",
    category: "小小心愿",
    title: "想听听大家第一次面试的故事",
    body: "下周要去第一次实习面试，有一点紧张。想向走过这段路的同学借一点勇气。",
    time: "1 小时前",
    campus: "大学城校区",
    likes: 36,
    comments: 12,
  },
];
const resourceData = [
  {
    title: "高等数学 · 期末复习思维导图",
    category: "课程学习",
    kind: "PDF",
    body: "把知识连成线，复习也可以更从容。",
    size: "2.4 MB",
    views: "126",
  },
  {
    title: "校园生活指南 · 新生篇",
    category: "校园生活",
    kind: "PDF",
    body: "从图书馆到食堂，开启你的校园地图。",
    size: "1.8 MB",
    views: "208",
  },
  {
    title: "英语六级备考计划与经验",
    category: "考试备考",
    kind: "DOC",
    body: "来自学长学姐的复习路径与资料整理。",
    size: "860 KB",
    views: "89",
  },
  {
    title: "第一份实习简历怎么写",
    category: "成长就业",
    kind: "PDF",
    body: "从经历出发，让你的亮点被看见。",
    size: "1.2 MB",
    views: "74",
  },
];
const ui = {
  page: "home",
  state: "default",
  write: "success",
  filter: "全部",
  query: "",
  step: 1,
  match: "waiting",
  capsule: "locked",
  inbox: "消息",
  favorite: "心愿",
  loggedIn: true,
  loginDestination: null,
  wishSort: "latest",
  replies: [],
  reply: null,
  replyDrafts: {},
  replyPending: {},
  cardAttachment: null,
  cardError: "",
  likes: new Set(),
  saved: new Set(),
  messages: [],
  drafts: {},
  pending: {},
  completed: {},
  read: false,
  blocked: true,
  selectedWish: 1,
  selectedResource: 0,
  traits: new Set(["慢热", "喜欢散步"]),
  history: [],
};
function go(id) {
  if (id === "login") {
    openLogin();
    return;
  }
  if (id === "comment-editor") {
    openReply("路过的一朵云");
    return;
  }
  if (
    !ui.loggedIn &&
    [
      "settings",
      "compose",
      "whisper-editor",
      "verify",
      "applications",
      "inbox",
      "chat",
      "match-profile",
      "capsule-create",
    ].includes(id)
  ) {
    openLogin(id);
    return;
  }
  if (!pages.some((p) => p.id === id)) return;
  ui.history.push(ui.page);
  location.hash = id;
}
function appearanceLabel() {
  return { system: "跟随系统", light: "浅色", dark: "深色" }[themePreference];
}
function positionMiniDialog() {
  const dialog = document.querySelector("dialog:not(#drawer)");
  if (!dialog) return;
  dialog.classList.add("mini-dialog");
  const rect = byId("device").getBoundingClientRect();
  const width = Math.min(rect.width - 28, 350, window.innerWidth - 32);
  dialog.style.width = width + "px";
  dialog.style.left =
    Math.max(
      16,
      Math.min(
        window.innerWidth - width - 16,
        rect.left + (rect.width - width) / 2,
      ),
    ) + "px";
  dialog.style.top =
    Math.max(
      16,
      Math.min(
        window.innerHeight - dialog.offsetHeight - 16,
        rect.top + (rect.height - dialog.offsetHeight) / 2,
      ),
    ) + "px";
}
function openAppearance() {
  showDialog(
    "外观",
    `<p>选择适合你的阅读方式。</p><div class="appearance-options">${[
      ["system", "跟随系统", "随设备外观自动切换"],
      ["light", "浅色", "暖白底色，轻盈明亮"],
      ["dark", "深色", "柔和暗色，适合夜间阅读"],
    ]
      .map(
        ([id, title, copy]) =>
          `<button data-appearance="${id}" aria-pressed="${themePreference === id}"><span class="appearance-swatch ${id}"></span><span><strong>${title}</strong><small>${copy}</small></span><span class="appearance-check">${themePreference === id ? "✓" : ""}</span></button>`,
      )
      .join("")}</div>`,
    () => {},
    "完成",
  );
  positionMiniDialog();
  document.querySelector(".mini-dialog .actions").hidden = true;
  const close = document.createElement("button");
  close.className = "text-btn full";
  close.textContent = "关闭";
  close.onclick = () => close.closest("dialog").close();
  document.querySelector(".mini-dialog").append(close);
}
function openLogin(destination = null) {
  ui.loginDestination = destination;
  showDialog(
    "登录鲤愿池",
    `<div class="login-prompt-art"><img src="${asset("profile-koi")}" alt="锦鲤"><h3>许愿有人应，心事有人听。</h3><p>登录后继续${destination ? "当前操作" : "探索校园里的善意"}，关闭后仍留在当前页面。</p></div><label class="check"><input id="login-consent" type="checkbox">我已阅读并同意服务与隐私说明</label><p class="form-error" id="login-error" role="alert"></p>`,
    () => {
      if (!byId("login-consent").checked) {
        byId("login-error").textContent = "请先阅读并同意服务与隐私说明";
        return false;
      }
      ui.loggedIn = true;
      const next = ui.loginDestination;
      ui.loginDestination = null;
      renderPreservingScroll();
      if (next) go(next);
      toast("已进入演示账号");
    },
    "微信登录",
  );
  document.querySelector("dialog [data-close]").textContent = "暂不登录";
  positionMiniDialog();
}
function renderPreservingScroll() {
  const scroll = byId("phone-scroll").scrollTop;
  render();
  byId("phone-scroll").scrollTop = scroll;
}
function openReply(to) {
  if (!ui.loggedIn) {
    openLogin();
    return;
  }
  if (!["wish", "whisper"].includes(ui.page)) return;
  const context = ui.page === "wish" ? "wish:" + ui.selectedWish : "whisper:1";
  const key = context + ":" + to;
  ui.reply = {
    context,
    key,
    to,
    body: ui.replyDrafts[key] || "",
    pending: ui.replyPending[key] || null,
  };
  renderPreservingScroll();
  const input = document.querySelector("[name=reply]");
  input?.focus({ preventScroll: true });
  input?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
}
function replyItems() {
  const context = ui.page === "wish" ? "wish:" + ui.selectedWish : "whisper:1";
  return ui.replies
    .filter((r) => r.context === context)
    .map(
      (r) =>
        `<div class="comment my-reply"><span class="tag warning">我的${r.to ? "回复" : "评论"} · 待审核</span>${r.to ? `<small class="muted"> 回复 ${esc(r.to)}</small>` : ""}<p>${esc(r.body)}</p></div>`,
    )
    .join("");
}
function replyComposer() {
  const r = ui.reply;
  const context = ui.page === "wish" ? "wish:" + ui.selectedWish : "whisper:1";
  if (!r || r.context !== context) return "";
  return `<form class="reply-composer" data-reply><div class="between"><strong>${r.to ? "回复 " + esc(r.to) : ui.page === "wish" ? "留下一句鼓励" : "写一句暖评"}</strong><button type="button" class="icon-btn" data-action="reply-cancel" aria-label="收起回复编辑框">×</button></div><textarea name="reply" placeholder="善意表达，认真回应…" aria-label="回复内容" maxlength="500" required ${r.pending ? "readonly" : ""}>${esc(r.body)}</textarea>${r.pending ? `<div class="notice warning"><strong>${r.pending === "unknown" ? "发送结果尚未确认" : "内容已更新，请重新核对"}</strong><p>回复与原请求均已保留。</p><button type="button" class="text-btn" data-action="reply-retry">${r.pending === "unknown" ? "核实原请求结果" : "读取最新内容并核对"}</button></div>` : ""}<p class="form-error" id="reply-error" role="alert"></p><div class="between"><span class="small muted">最多 500 字 · 审核后展示</span><button class="btn primary" ${r.pending ? "disabled" : ""}>发送</button></div></form>`;
}
function finishReply() {
  ui.replies.push({ ...ui.reply });
  delete ui.replyDrafts[ui.reply.key];
  delete ui.replyPending[ui.reply.key];
  ui.reply = null;
  renderPreservingScroll();
  toast("回复已提交审核");
}
function cardUpload() {
  const card = ui.cardAttachment;
  return `<div class="student-card-field"><div class="between"><strong>学生卡照片</strong><span class="small muted">仅用于学生身份审核</span></div><label class="student-card-upload ${card ? "has-photo" : ""}" for="student-card">${card ? `<img class="student-card-preview" src="${card.url}" alt="已选择的学生卡照片"><span class="photo-change">${icon("plus")} 点击替换照片</span>` : `<span class="student-card-outline"><span class="card-portrait">${icon("user")}</span><span class="card-lines"><i></i><i></i><i></i></span></span><strong>${icon("plus")} 上传学生卡照片</strong><small>拍照或从相册选择</small>`}<input class="visually-hidden" type="file" name="card" id="student-card" accept="image/jpeg,image/png,image/webp" aria-label="选择学生卡照片"></label>${card ? `<div class="between photo-meta"><span>${esc(card.name)} · ${card.size < 1024 * 1024 ? Math.max(1, Math.round(card.size / 1024)) + " KB" : (card.size / 1024 / 1024).toFixed(1) + " MB"}</span><button type="button" class="text-btn" data-action="remove-card">移除</button></div>` : ""}<p class="upload-hint">请完整拍摄学生卡，确保姓名、学号清晰，无反光。<br>支持 JPG、PNG、WebP，单张不超过 10 MB。</p><p class="form-error" id="card-error" role="alert">${esc(ui.cardError)}</p></div>`;
}
function readStudentCard(file) {
  if (!file) return;
  const error = !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ? "请选择 JPG、PNG 或 WebP 照片"
    : file.size > 10 * 1024 * 1024
      ? "照片超过 10 MB，请压缩后重新选择"
      : "";
  if (error) {
    ui.cardError = error;
    renderPreservingScroll();
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    ui.cardAttachment = {
      name: file.name,
      size: file.size,
      url: reader.result,
    };
    ui.cardError = "";
    renderPreservingScroll();
  };
  reader.onerror = () => {
    ui.cardError = "照片读取失败，请重新选择";
    renderPreservingScroll();
  };
  reader.readAsDataURL(file);
}

function heading(title, subtitle, art = "") {
  return `<section class="module-heading"><div class="eyebrow">LI YUAN CHI</div><h1>${title}</h1><p>${subtitle}</p>${art ? `<img src="${asset(art)}" alt="">` : ""}</section>`;
}
function link(label, to, cls = "text-btn") {
  return `<button type="button" class="${cls}" data-go="${to}">${label}</button>`;
}
function section(title, label, to) {
  return `<div class="section-heading"><h2>${title}</h2>${to ? link(label + " ›", to) : ""}</div>`;
}
function menu(label, to, ic = "chevron", value = "") {
  return `<button type="button" class="menu-item" data-go="${to}">${icon(ic)}<span>${label}</span><span class="menu-value">${value}</span><span class="chevron">›</span></button>`;
}
function search(placeholder) {
  return `<form class="search" data-search>${icon("search")}<input class="input" name="search" aria-label="${placeholder}" placeholder="${placeholder}" value="${esc(ui.query)}"><button>搜索</button></form>`;
}
function chips(items) {
  return `<div class="chips">${items.map((c) => `<button class="chip ${ui.filter === c ? "active" : ""}" data-filter="${c}" aria-pressed="${ui.filter === c}">${c}</button>`).join("")}</div>`;
}
function author(w = wishData[0]) {
  return `<div class="author"><span class="avatar ${w.id === 2 ? "warm" : ""}">${w.initial}</span><div><strong>${w.name}</strong><small>${w.campus} · ${w.time}</small></div><span class="tag warm">${w.category}</span></div>`;
}
function wishCard(w) {
  return `<article class="wish-card">${author(w)}<button class="card-title" data-wish="${w.id}">${w.title}</button><p class="card-summary">${w.body}</p><div class="card-footer"><button data-like="${w.id}" aria-label="${ui.likes.has(w.id) ? "取消支持" : "支持"} ${w.title}">${icon(ui.likes.has(w.id) ? "heart-active" : "heart")}${w.likes + (ui.likes.has(w.id) ? 1 : 0)}</button><button data-wish="${w.id}">${icon("chat")}${w.comments}</button><button class="go" data-wish="${w.id}">去应愿 ↗</button></div></article>`;
}
function whisperCard(i = 0) {
  return `<article class="wish-card whisper-card"><div class="between"><span class="small muted">${i ? "路过的一朵云" : "夜航的小鱼"} · ${i ? "1 小时前" : "25 分钟前"}</span><span class="tag">匿名心事</span></div><div class="quote-mark">“</div><button class="card-title" data-go="whisper">${i ? "允许自己偶尔停下来，也是一种前进" : "今天被一个陌生人的善意，轻轻接住了"}</button><p class="card-summary">${i ? "慢一点也没关系。每个人，都有自己的季节。" : "下雨忘记带伞，旁边的同学把伞往我这里挪了一点。原来很小的事，也能让一整天亮起来。"}</p><div class="card-footer"><button data-like="${100 + i}">${icon(ui.likes.has(100 + i) ? "heart-active" : "heart")}${18 + i * 7 + (ui.likes.has(100 + i) ? 1 : 0)} 个抱抱</button><button data-go="whisper">${icon("chat")}4 条暖评</button></div></article>`;
}
function home() {
  return `<div class="between mini-greeting"><span class="row">${icon("sun")}嗨，小满，今天也有好运气</span>${link("消息 · 2", "inbox")}</div><section class="pond-hero"><img src="assets/illustrations/pond.jpg" alt="原版水彩锦鲤池塘"><div class="pond-copy"><div class="eyebrow">每个心愿，都值得被听见</div><h1>把小小心愿<br>交给大大的善意</h1><p>总有一条锦鲤，为你而来。</p><button data-go="compose">许个心愿 <span>↗</span></button></div></section><div class="quick-grid">${[
    ["entry-wish", "许个心愿", "让善意发生", "compose"],
    ["entry-whisper", "说说心事", "这里有人在听", "whisper-editor"],
    ["entry-buddy", "找个搭子", "遇见同路的人", "wishes"],
  ]
    .map(
      (x) =>
        `<button class="quick-entry" data-go="${x[3]}"><img src="${asset(x[0])}" alt=""><strong>${x[1]}</strong><span>${x[2]}</span></button>`,
    )
    .join(
      "",
    )}</div><button class="buddy-strip" data-go="matchmaking"><img src="${asset("entry-buddy")}" alt=""><div><strong>这个秋天，认识一个新朋友</strong><small>包分配 · 把期待写成一封来信</small></div><span class="arrow">↗</span></button>${section("池塘里的新心愿", "去捞一捞", "wishes")}${wishCard(wishData[0])}${section("听见一点小心事", "去听听", "whispers")}${whisperCard()}${section("本周的温暖回响", "更多热点", "hot")}<div class="menu-list">${menu("第一次独立完成一场校园演出", "stories", "star", "32 个祝福")}${menu("有一群一起晨读的朋友真好", "stories", "sun", "18 个祝福")}</div><p class="mini-foot">许愿有人应，心事有人听。</p>`;
}
function wishList() {
  const filtered = wishData.filter(
    (w) =>
      (ui.filter === "全部" || w.category === ui.filter) &&
      (w.title + w.body).includes(ui.query),
  );
  filtered.sort((a, b) =>
    ui.wishSort === "hot"
      ? b.likes + b.comments - (a.likes + a.comments)
      : a.id - b.id,
  );
  return (
    heading("心愿池", "投下一份期待，也捞起一份善意。", "entry-wish") +
    search("搜一搜心愿") +
    chips(["全部", "学习互助", "校园搭子", "小小心愿"]) +
    `<div class="between small muted" style="margin:5px 0 18px"><span>${filtered.length} 个心愿，等一个回响</span>${`<div class="segmented wish-sort" aria-label="心愿排序"><button class="${ui.wishSort === "latest" ? "active" : ""}" data-sort="latest" aria-pressed="${ui.wishSort === "latest"}">最新</button><button class="${ui.wishSort === "hot" ? "active" : ""}" data-sort="hot" aria-pressed="${ui.wishSort === "hot"}">最热</button></div>`}</div>` +
    (filtered.length ? filtered.map(wishCard).join("") : stateMarkup("empty")) +
    `<button class="action-float" data-go="compose">＋ 许个心愿</button>`
  );
}
function wishDetail() {
  const w = wishData.find((x) => x.id === ui.selectedWish) || wishData[0];
  return `<div class="wish-card" style="padding:0;border:0;background:transparent">${author(w)}<h1 class="detail-title">${w.title}</h1><span class="tag">进行中</span><div class="detail-body">${w.body}<br><br>时间可以一起商量，不用给彼此太大压力。希望我们都能在平凡的日子里，积攒一点小小的进步。</div><div class="notice">${icon("gift")} 一点心意：结束后请你喝一杯热可可。</div><div class="detail-info"><span>发布于 2026.11.16</span><span>截止 2026.11.30</span></div><div class="detail-stats"><span><b>${w.likes + (ui.likes.has(w.id) ? 1 : 0)}</b>支持</span><span><b>${w.comments}</b>评论</span><span><b>3</b>应愿</span><span><b>128</b>浏览</span></div><div class="row">${link("公开主页", "public")}${link("分享", "wish", "text-btn share-action")}${link("举报", "report")}</div></div>${section("心愿下的回响", "", "")}<div class="comment"><div class="row"><span class="avatar">橙</span><strong>橙子</strong><span class="small muted">12 分钟前</span></div><p>我也在准备六级！周二、周四早上都可以。</p><div class="reply"><b>小满 · 作者</b> 太好了，我们可以一起！</div><button class="text-btn" data-reply-to="橙子">回复</button></div>${replyItems()}${replyComposer()}<button class="inline-reply-trigger" data-reply-to="">${icon("chat")} 留下一句鼓励…</button><div class="sticky-actions"><button class="btn" data-save="wish">${icon(ui.saved.has("wish") ? "star-active" : "star")} ${ui.saved.has("wish") ? "已收藏" : "收藏"}</button><button class="btn primary" data-action="apply">我想应愿 ↗</button></div>`;
}
function resourceCard(r, i) {
  return `<article class="resource-card"><span class="file-icon ${i % 2 ? "warm" : ""}">${icon("book")}${r.kind}</span><button data-resource="${i}"><h3>${r.title}</h3><p>${r.body}</p><div class="resource-meta">${r.category} · ${r.size} · ${r.views} 次浏览</div></button></article>`;
}
function resources() {
  const filtered = resourceData
    .map((r, i) => [r, i])
    .filter(
      ([r]) =>
        (ui.filter === "全部" || r.category === ui.filter) &&
        (r.title + r.body).includes(ui.query),
    );
  return (
    heading("资料广场", "把走过的路，分享给后来的人。", "pavilion") +
    search("搜索课程、考试与校园资料") +
    chips(["全部", "课程学习", "考试备考", "校园生活", "成长就业"]) +
    `<div class="notice">${icon("shield")} 校园共享资料，帮助彼此少走一点弯路。</div>` +
    section("值得收藏的好资料", "", "") +
    (filtered.length
      ? filtered.map(([r, i]) => resourceCard(r, i)).join("")
      : stateMarkup("empty")) +
    `<button class="btn mint full" style="margin-top:24px" data-action="contribute">${icon("plus")} 我也想贡献资料</button>`
  );
}
function resourceDetail() {
  const r = resourceData[ui.selectedResource];
  return `<div class="caption-line">${icon("book")} ${r.category}</div><h1 class="detail-title">${r.title}</h1><div class="detail-info">更新于 2026.11.12 · ${r.views} 次浏览</div><div class="detail-body">${r.body}<br><br>这份资料整理了常用知识、重点提示和学习方法。愿它陪你把复杂的事情，一点点理清楚。</div><div class="panel row"><span class="file-icon">${icon("book")}${r.kind}</span><div><strong class="small">${r.title}</strong><p class="small muted">${r.kind} 文件 · ${r.size}</p></div></div><div class="notice" style="margin:20px 0">资料仅供学习交流，下载前请确认你的学生认证已通过。</div><div class="two-col"><button class="btn" data-save="resource">${ui.saved.has("resource") ? "已收藏" : "收藏资料"}</button><button class="btn" data-action="resource-feedback">资料反馈</button></div><button class="btn primary full" style="margin-top:16px" data-action="download">${icon("book")} 下载资料</button><p class="mini-foot">下载演示文件，不包含真实课程内容。</p>`;
}
function whispers() {
  return (
    heading("悄悄话", "有些话，轻轻说就好。", "entry-whisper") +
    `<div class="whisper-shortcuts">${[
      ["我的心事", "whisper-mine", "chat"],
      ["我的回响", "whisper-notices", "bell"],
      ["时光胶囊", "capsules", "clock"],
    ]
      .map(
        ([name, id, ic]) =>
          `<button data-go="${id}">${icon(ic)}<span>${name}</span></button>`,
      )
      .join("")}</div>` +
    search("找一找共鸣") +
    section("在这里，被温柔听见", "", "") +
    (ui.query && !"善意今天陌生人允许自己心事".includes(ui.query)
      ? stateMarkup("empty")
      : whisperCard() + whisperCard(1)) +
    `<div class="menu-list">${menu("需要的时候，援助一直在", "help", "leaf")}</div><button class="action-float" data-go="whisper-editor">＋ 写下心事</button>`
  );
}
function whisperDetail() {
  return `<div class="caption-line">${icon("leaf")} 夜航的小鱼 · 25 分钟前</div><h1 class="detail-title">今天被一个陌生人的善意，轻轻接住了</h1><div class="detail-body">下雨忘记带伞，旁边的同学把伞往我这里挪了一点。<br><br>一路上没有说太多话，只在分别时互相说了声谢谢。原来很小的事，也能让一整天亮起来。<br><br>如果你也有点累，希望这份小小的善意，也能传到你这里。</div><button class="btn mint full" data-like="100">${icon("heart")} ${ui.likes.has(100) ? "已送出抱抱" : "给你一个抱抱"} · ${18 + (ui.likes.has(100) ? 1 : 0)}</button><div class="between">${link("举报内容", "whisper-report")}<button class="text-btn" data-save="whisper">${ui.saved.has("whisper") ? "已收藏" : "收藏心事"}</button></div>${section("暖评 · 4", "", "")}<div class="comment"><div class="row"><span class="avatar">云</span><strong>路过的一朵云</strong></div><p>谢谢你把温暖分享出来，我也被治愈了一点点。</p><button class="text-btn" data-reply-to="路过的一朵云">回复这份温柔</button></div>${replyItems()}${replyComposer()}<div class="sticky-actions"><button class="btn primary full" data-reply-to="">写一句暖评</button></div>`;
}
function profile() {
  if (!ui.loggedIn)
    return `<button type="button" class="profile-head profile-entry" data-go="settings" aria-label="登录后查看个人资料"><img src="${asset("profile-koi")}" alt="锦鲤"><span class="profile-entry-copy"><strong class="profile-name">你好，同学</strong><span class="profile-entry-hint">登录后，查看个人资料</span></span><span class="profile-entry-arrow" aria-hidden="true">›</span></button><button class="btn primary full" data-action="login-prompt">登录鲤愿池</button><div class="menu-list"><button class="menu-item" data-action="theme">${icon("sun")}<span>外观</span><span class="menu-value">${appearanceLabel()}</span><span>›</span></button></div>`;
  return `<button type="button" class="profile-head profile-entry" data-go="settings" aria-label="查看和编辑个人资料"><img src="${asset("profile-koi")}" alt="原版锦鲤头像"><span class="profile-entry-copy"><strong class="profile-name">小满</strong><span class="tag">${icon("check")} 已通过学生认证</span><span class="profile-entry-hint">查看与编辑个人资料</span></span><span class="profile-entry-arrow" aria-hidden="true">›</span></button><div class="profile-stats">${[
    ["6", "我的心愿", "wishes"],
    ["3", "我的应愿", "applications"],
    ["12", "我的收藏", "favorites"],
    ["2", "消息", "inbox"],
  ]
    .map((x) => `<button data-go="${x[2]}"><b>${x[0]}</b>${x[1]}</button>`)
    .join(
      "",
    )}</div><div class="navy-banner"><h3>每一点善意，都有回响</h3><p>记录被接住的心愿，也分享属于你的故事。</p><button data-go="stories">看看还愿故事 ↗</button></div><div class="menu-list">${menu("我的悄悄话", "whisper-mine", "chat")}${menu("时光胶囊", "capsules", "clock", "1 封等待开启")}${menu("包分配资料", "match-profile", "heart", "资料已完善")}${menu("学生认证", "verify", "shield", "已认证")}</div><div class="menu-list">${menu("个人资料与隐私", "settings", "user")}${menu("屏蔽管理", "blacklist", "shield")}${menu("警告与申诉", "safety", "notice")}${menu("关怀与援助", "care", "leaf")}<button class="menu-item" data-action="theme">${icon("sun")}<span>外观</span><span class="menu-value">${appearanceLabel()}</span><span>›</span></button></div><p class="mini-foot">愿每一次相遇，都刚刚好。</p>`;
}
function inbox() {
  const notices = ui.inbox === "通知";
  return (
    heading("消息与回响", "你的每一份期待，我们都认真送达。") +
    `<div class="tabs"><button class="${!notices ? "active" : ""}" data-inbox="消息">会话 · 2</button><button class="${notices ? "active" : ""}" data-inbox="通知">通知 · ${ui.read ? 0 : 2}</button></div>` +
    (notices
      ? `<button class="text-btn" data-action="read-all">全部标为已读</button>`
      : "") +
    [
      [
        "橙",
        notices ? "心愿有了新的应愿" : "橙子",
        notices ? "有人想陪你一起坚持晨读。" : "那就周二早上七点半见！",
        "wish",
      ],
      [
        "鲤",
        notices ? "你的资料审核通过了" : "秋日来信",
        notices
          ? "去看看可以参加的包分配活动吧。"
          : "你好，很高兴在这里认识你。",
        "match",
      ],
    ]
      .map(
        (m, i) =>
          `<button class="message-row" data-go="${notices ? m[3] : "chat"}"><span class="avatar ${i ? "warm" : ""}">${m[0]}</span><div><h3>${m[1]}</h3><p>${m[2]}</p></div><div><span class="small muted">${i ? "昨天" : "10:28"}</span>${!ui.read ? '<div class="unread-dot"></div>' : ""}</div></button>`,
      )
      .join("")
  );
}
function chat() {
  return `<div class="notice">围绕这份心愿慢慢聊，彼此尊重，保护个人隐私。</div><div class="chat-time">2026年11月16日 10:28</div><div class="bubble-row"><span class="avatar">橙</span><div class="bubble">你好呀！看到你的晨读心愿，我也想一起坚持。</div></div><div class="bubble-row mine"><div class="bubble">太好了！我们周二早上图书馆门口见？</div></div><div class="bubble-row"><span class="avatar">橙</span><div class="bubble">没问题，七点半见！</div></div>${ui.messages.map((m) => `<div class="bubble-row mine"><div class="bubble">${esc(m)}<div class="small muted">待审核</div></div></div>`).join("")}<form class="chat-input" data-chat><input class="input" name="message" placeholder="说点什么…" aria-label="聊天内容" maxlength="500" required><button class="btn primary">发送</button></form>${link("举报会话内容", "report")}`;
}
function capsules() {
  return (
    heading("时光胶囊", "把此刻的自己，寄给未来。", "entry-whisper") +
    `<article class="capsule">${icon("lock")}<h3>一封写给春天的信</h3><p>封存于 2026.11.16</p><div class="divider"></div><div class="between"><span class="tag">等待开启</span>${link("查看胶囊", "capsule")}</div><p>预约开启时间 · 2027.03.01 09:00</p></article><article class="capsule"><span class="tag warm">已开启</span><h3>给开学时有点紧张的自己</h3><p>谢谢你没有放弃，也希望你继续勇敢。</p><button class="text-btn" data-action="opened-capsule">打开这封信 ↗</button></article>${link("写给未来的自己", "capsule-create", "btn primary full")}<p class="mini-foot">胶囊仅自己可见，是否可读以服务端状态为准。</p>`
  );
}
function capsuleDetail() {
  return `<div class="receipt"><img src="${asset("entry-whisper")}" alt="信封插画"><span class="tag">${ui.capsule === "locked" ? "等待开启" : "已开启"}</span><h2>${ui.capsule === "locked" ? "有一份期待，正在路上" : "你好，未来的自己"}</h2><p>预约开启时间<br>2027年3月1日 09:00</p></div>${ui.capsule === "locked" ? '<div class="notice">此刻的心事已经妥善封存。等到服务端确认开启时，再来读读这封信吧。</div>' : '<article class="capsule"><p>希望春天的你，已经慢慢习惯新的生活。也希望你仍然会为一朵花停下来，会为小小的进步开心。<br><br>不用太着急，你已经走了很远。</p></article>'}<div class="menu-list">${menu("另写一封信", "capsule-create", "plus")}</div><button class="btn full" data-action="cancel-capsule">${ui.capsule === "locked" ? "取消这封胶囊" : "删除这封胶囊"}</button>`;
}
function matchmaking() {
  return (
    heading("包分配", "在平凡日常里，遇见新的可能。", "entry-buddy") +
    `<div class="activity-cover"><img src="${asset("entry-buddy")}" alt=""><span class="tag">报名中</span><h2>秋日来信<br>七天，认识一个新朋友</h2><p>11.18 — 11.24 · 校园交友活动</p></div><p class="card-summary">从一句你好开始，分享日常、交换故事。不必预设答案，把认识彼此的过程交给时间。</p><div class="detail-stats" style="margin-top:20px"><span><b>7</b>活动天数</span><span><b>128</b>已报名</span><span><b>48</b>已配对</span><span><b>11.17</b>报名截止</span></div>${link("查看活动", "match", "btn primary full")}<div class="menu-list">${menu("我的交友资料", "match-profile", "user", "已完善")}</div>`
  );
}
function match() {
  const states = {
    unregistered: [
      "报名中",
      "给相遇留一个机会",
      "填写一份认真的资料，开始认识新朋友。",
    ],
    review: [
      "报名待审核",
      "你的来信，已经收到",
      "审核通过后，将进入等待公布阶段。",
    ],
    waiting: [
      "等待公布",
      "好事值得，慢慢等待",
      "资料已审核通过，配对结果由活动统一公布。",
    ],
    paired: ["已配对", "这封来信，有了回音", "你好，很高兴在这个秋天认识你。"],
    unmatched: [
      "结果已公布",
      "这次先和自己，好好相处",
      "没有匹配到合适的人，也值得期待下一次相遇。",
    ],
    ended: [
      "活动已结束",
      "谢谢你，认真赴约",
      "愿这段相遇，成为日常里的一点温暖。",
    ],
  };
  const d = states[ui.match];
  return `<div class="activity-cover"><img src="${asset("entry-buddy")}" alt=""><span class="tag">${d[0]}</span><h2>${d[1]}</h2><p>${d[2]}</p></div>${
    ui.match === "paired"
      ? `<div class="panel"><div class="row"><span class="avatar warm">秋</span><div><h3>秋日的风</h3><p class="small muted">大学城校区 · INFJ</p></div></div><p class="card-summary">喜欢散步、电影和不赶时间的周末。</p><div class="chips"><span class="tag">温和</span><span class="tag">电影爱好者</span><span class="tag">喜欢散步</span></div>${link("和 TA 打个招呼", "chat", "btn primary full")}</div>${section("今天，从一句你好开始", "", "")}<div class="panel"><span class="eyebrow">DAY 01</span><h3 style="margin:10px 0">分享今天的一件小事</h3><p class="small muted">愿意的话，可以聊聊今天让你开心的一瞬间。</p><button class="text-btn" data-action="task">查看今日任务 ↗</button></div>`
      : `${section("活动时间线", "", "")}<div class="timeline">${[
          ["报名截止", "11月17日 22:00"],
          ["结果公布", "11月18日 12:00"],
          ["活动开始", "11月18日 12:00"],
          ["活动结束", "11月24日 23:59"],
        ]
          .map((x) => `<article>${x[0]}<small>${x[1]}</small></article>`)
          .join("")}</div>`
  }<div style="margin-top:24px">${ui.match === "unregistered" ? `<label class="check"><input type="checkbox" id="match-consent">我已阅读活动说明，同意按规则展示我的报名资料。</label><button class="btn primary full" data-action="join-match">确认报名</button>` : ui.match === "ended" || ui.match === "unmatched" ? link("看看其他活动", "matchmaking", "btn primary full") : link("查看我的报名资料", "match-profile", "btn full")}</div>${ui.match === "waiting" || ui.match === "review" ? '<button class="text-btn" data-action="withdraw-match">撤回本次报名</button>' : ""}`;
}
function field(label, name, kind = "text", placeholder = "", value = "") {
  const draft = kind === "file" ? "" : (ui.drafts[ui.page]?.[name] ?? value);
  return `<label class="field">${label}${
    kind === "textarea"
      ? `<textarea name="${name}" placeholder="${placeholder}" maxlength="500" required>${esc(draft)}</textarea>`
      : kind.startsWith("select:")
        ? `<select name="${name}">${kind
            .slice(7)
            .split("|")
            .map(
              (x) => `<option ${draft === x ? "selected" : ""}>${x}</option>`,
            )
            .join("")}</select>`
        : `<input name="${name}" type="${kind}" placeholder="${placeholder}" value="${esc(draft)}" ${kind === "file" ? "" : "required"} ${kind === "number" ? 'min="1" max="250"' : ""} ${kind === "password" ? 'minlength="8"' : ""}>`
  }</label>`;
}
function miniForm(title, subtitle, body, label = "提交审核") {
  const pending = ui.pending[ui.page];
  return `<form class="mini-form" data-form="${ui.page}"><h2>${title}</h2><p>${subtitle}</p>${body}${pending ? `<div class="notice ${pending.type === "unknown" ? "warning" : "error"}"><strong>${pending.type === "unknown" ? "结果尚未确认" : "资料版本发生变化"}</strong><p>${pending.type === "unknown" ? "请保留当前内容，使用原请求核实结果，避免重复提交。" : "请重新核对内容后再提交。你的输入仍然保留。"}</p><code>${pending.key}</code><br><button type="button" class="text-btn" data-action="retry-write">${pending.type === "unknown" ? "核实原请求结果" : "读取最新版本并核对"}</button></div>` : ""}<p class="form-error" id="form-error" role="alert"></p><button class="btn primary full" ${pending ? "disabled" : ""}>${label}</button></form>`;
}
function matchProfile() {
  const step = ui.step;
  let body = `<div class="stepper">${["关于我", "我的期待", "确认资料"].map((s, i) => `<span class="${i + 1 <= step ? "active" : ""}">${i + 1}. ${s}</span>`).join("")}</div>`;
  if (step === 1)
    body += `<div class="notice" style="margin-bottom:20px">大学城校区 · 本科 · 大二 · 身份信息来自已认证资料</div><div class="two-col">${field("年龄", "age", "number", "", "20")}${field("身高（cm）", "height", "number", "", "168")}</div>${field("体重（斤）", "weight", "number", "", "110")}<label class="field">我的特质 <small>可多选，最多 10 个</small></label><div class="trait-cloud">${["慢热", "开朗", "喜欢散步", "电影爱好者", "热爱运动", "细心", "音乐", "阅读"].map((t) => `<button type="button" class="${ui.traits.has(t) ? "active" : ""}" aria-pressed="${ui.traits.has(t)}" data-trait="${t}">${t}</button>`).join("")}</div>${field("介绍一下自己", "intro", "textarea", "从你喜欢的一件小事说起…", "喜欢散步和看电影，希望认识认真生活的你。")}`;
  else if (step === 2)
    body += `${field("期待年龄范围", "age-range", "text", "", "18 — 24 岁")}${field("期待身高范围（cm）", "height-range", "text", "", "160 — 185")}${field("期待体重范围（斤）", "weight-range", "text", "", "95 — 160")}${field("校区偏好", "campus", "select:不限校区|大学城校区|石牌校区")}${field("MBTI 偏好", "mbti", "select:不限|INFJ|ENFP|INTJ|ISFJ")}${field("我期待的相遇", "expectation", "textarea", "", "能分享日常，也尊重彼此的节奏。")}`;
  else {
    const d = ui.drafts["match-profile"] || {};
    body += `<div class="panel"><span class="eyebrow">关于我</span><h3 style="margin:12px 0">${esc(d.age || 20)} 岁 · ${esc(d.height || 168)} cm · ${esc(d.weight || 110)} 斤</h3><p class="small muted">${esc(d.intro || "喜欢散步和看电影，希望认识认真生活的你。")}</p><div class="chips">${[...ui.traits].map((t) => `<span class="tag">${t}</span>`).join("")}</div><div class="divider"></div><span class="eyebrow">我的期待</span><p class="small" style="margin-top:12px">${esc(d.expectation || "能分享日常，也尊重彼此的节奏。")}</p><p class="small muted">${esc(d["age-range"] || "18 — 24 岁")} · ${esc(d.campus || "不限校区")}</p></div><label class="check"><input name="consent" type="checkbox" required>我确认资料真实，并理解活动中的资料展示范围。</label>`;
  }
  return (
    miniForm(
      "先从认识你开始",
      "认真写下自己，也给惊喜留一点空间。",
      body,
      step === 3 ? "保存资料" : "下一步",
    ) +
    (step > 1
      ? '<button class="text-btn" data-action="previous-step">← 上一步</button>'
      : "")
  );
}
function formPage() {
  switch (ui.page) {
    case "compose":
      return miniForm(
        "投下一份小小期待",
        "认真写下你的心愿，让合适的人找到你。",
        field("心愿标题", "title", "text", "例如：找一个一起晨读的伙伴") +
          field("心愿分类", "category", "select:学习互助|校园搭子|小小心愿") +
          field("心愿内容", "body", "textarea", "说说你想做什么、时间和地点…") +
          field("截止日期", "date", "date", "", "2026-11-30") +
          field(
            "一点报答（可写无）",
            "reward",
            "text",
            "一杯热可可，或一句真诚的谢谢",
          ) +
          '<div class="notice" style="margin-bottom:20px">公开内容审核通过后，才会出现在心愿池。</div>',
        "发布心愿",
      );
    case "whisper-editor":
      return miniForm(
        "把心事，轻轻放在这里",
        "不必组织好语言，这里有人愿意听。",
        `<div class="notice" style="margin-bottom:20px">匿名身份：夜航的小鱼 · 不关联你的公开主页</div>` +
          field("一个小标题", "title", "text", "此刻，最想说的一句话") +
          field("我的心事", "body", "textarea", "慢慢说，不着急。") +
          `<div class="between">${link("更换匿名昵称", "nickname")}${link("解忧与援助", "help")}</div>`,
        "送出心事",
      );
    case "capsule-create":
      return miniForm(
        "写给未来的自己",
        "有些话，可以留给未来慢慢读。",
        field("想对未来说的话", "body", "textarea", "未来的你，你好…") +
          field(
            "预约开启时间",
            "date",
            "datetime-local",
            "",
            "2027-03-01T09:00",
          ) +
          '<label class="check"><input name="consent" type="checkbox" required>我已阅读安全告知，理解到期前无法查看正文，实际开启以服务端状态为准。</label>',
        "封存这份期待",
      );
    case "nickname":
      return miniForm(
        "一个只属于树洞的名字",
        "通过审核后生效，与你的公开昵称分开。",
        `<div class="notice" style="margin-bottom:20px">当前匿名昵称 · 夜航的小鱼</div>` +
          field("新匿名昵称", "nickname", "text", "2—12 个字"),
        "提交昵称",
      );
    case "story-editor":
      return miniForm(
        "记录这份善意的回响",
        "你的故事，也会成为另一个人的勇气。",
        field("关联心愿", "wish", "select:想找一个一起坚持晨读的伙伴") +
          field("故事标题", "title", "text", "给这段回忆起个名字") +
          field("还愿故事", "body", "textarea", "那天发生了什么…"),
        "发布故事",
      );
    case "verify":
      return miniForm(
        "让相遇，多一份安心",
        "学生认证用于确认校园身份，材料仅用于审核。",
        `<div class="notice" style="margin-bottom:20px">当前示例：尚未认证。选择材料后演示待审核状态。</div>` +
          field("姓名", "name", "text", "填写与学生卡一致的姓名") +
          field("学号", "student", "text", "请填写有效学号") +
          cardUpload() +
          `<label class="check"><input name="consent" type="checkbox" required ${ui.drafts.verify?.consent ? "checked" : ""}>我同意将此材料用于学生身份审核。</label>`,
        "提交认证",
      );
    case "settings":
      return miniForm(
        "个人资料与隐私",
        "决定怎样介绍自己，也决定分享多少。",
        field("公开昵称", "nickname", "text", "", "小满") +
          field("校区", "campus", "select:大学城校区|石牌校区") +
          field("入学年份", "year", "number", "", "2025").replace(
            'max="250"',
            'max="2030"',
          ) +
          field("MBTI", "mbti", "select:暂不展示|INFJ|ENFP|INTJ|ISFJ") +
          '<label class="check"><input type="checkbox" checked name="public">在公开主页展示学校与年级</label>' +
          `<div class="menu-list">${menu("匿名身份与偏好", "whisper-settings", "chat")}${menu("账号注销", "deletion", "shield")}</div>`,
        "保存资料",
      );
    case "report":
    case "whisper-report":
      return miniForm(
        "让这里继续温柔",
        "请说明你遇到的问题，我们会认真核查。",
        `<div class="notice" style="margin-bottom:20px">举报对象：${ui.page === "report" ? "想找一个一起坚持晨读的伙伴" : "今天被一个陌生人的善意，轻轻接住了"}</div>` +
          field(
            "举报类型",
            "type",
            "select:请选择|骚扰与冒犯|不实信息|侵犯隐私|其他问题",
          ) +
          field(
            "情况说明",
            "body",
            "textarea",
            "请描述具体问题，不需要提供无关个人信息。",
          ),
        "提交举报",
      );
    default:
      return "";
  }
}
function otherPages() {
  switch (ui.page) {
    case "applications":
      return (
        heading("我的应愿", "每一次回应，都是善意的开始。") +
        chips(["全部", "待处理", "已接受"]) +
        `<div class="wish-card"><span class="tag">${ui.completed.application ? "已接受" : "待处理"}</span><h3 style="margin:14px 0">一起坚持晨读</h3><p class="card-summary">橙子：我也想准备六级，周二、周四都方便。我们可以一起。</p><div class="row" style="margin-top:16px">${link("查看心愿", "wish", "btn")}${ui.completed.application ? link("去聊天", "chat", "btn primary") : '<button class="btn primary" data-action="accept-application">接受应愿</button>'}</div></div>`
      );
    case "stories":
      return (
        heading("还愿故事", "被接住的心愿，都会留下回响。", "entry-wish") +
        `<article class="wish-card"><span class="tag warm">善意有回音</span><h2 class="detail-title">从一个人的晨读，<br>到一群人的早晨。</h2><p class="card-summary">刚开始只想找个人一起坚持，没想到认识了一群有趣的朋友。现在，晨读成了每天最期待的事。</p><div class="card-footer"><span>小满 · 11月15日</span>${link("查看心愿", "wish")}</div></article>${link("写下我的还愿故事", "story-editor", "btn primary full")}`
      );
    case "public":
      return `<section class="profile-head"><img src="${asset("profile-koi")}" alt="锦鲤头像"><div><h1>小满</h1><span class="tag">校园认证</span><p class="small muted">慢一点，也没关系。</p></div></section>${section("TA 的公开心愿", "", "")}${wishCard(wishData[0])}${link("查看还愿故事", "stories", "btn full")}<div class="row">${link("举报主页", "report")}<button class="text-btn" data-action="block">屏蔽此人</button></div>`;
    case "favorites":
      return (
        heading("我的收藏", "把喜欢的，留在身边。") +
        chips(["全部", "心愿", "心事", "资料"]) +
        (ui.filter === "全部" || ui.filter === "心愿"
          ? wishCard(wishData[0])
          : "") +
        (ui.filter === "全部" || ui.filter === "心事" ? whisperCard() : "") +
        (ui.filter === "全部" || ui.filter === "资料"
          ? resourceCard(resourceData[0], 0)
          : "")
      );
    case "hot":
      return (
        heading("本周热点", "这一周，大家在关心什么。", "entry-wish") +
        chips(["全部", "心愿", "悄悄话"]) +
        (ui.filter !== "悄悄话"
          ? wishData
              .map(
                (w, i) =>
                  `<div class="caption-line">0${i + 1} / 热门心愿</div>${wishCard(w)}`,
              )
              .join("")
          : "") +
        (ui.filter !== "心愿" ? whisperCard() : "")
      );
    case "whisper-mine":
      return (
        heading("我的心事", "说过的话，都好好放在这里。") +
        `<span class="tag">已公开</span>${whisperCard()}${link("再写一点心事", "whisper-editor", "btn primary full")}`
      );
    case "whisper-notices":
      return (
        heading("悄悄鲤通知", "你说的话，有人听见。") +
        `<button class="message-row" data-go="whisper"><span class="avatar">云</span><div><h3>你的心事收到一条暖评</h3><p>“谢谢你分享这份温暖。”</p></div><span class="unread-dot"></span></button><button class="message-row" data-go="capsule"><span class="avatar warm">信</span><div><h3>你的时光胶囊正在等待开启</h3><p>预约时间：2027.03.01 09:00</p></div></button>`
      );
    case "whisper-settings":
      return (
        heading("悄悄话设置", "在这里，安心做自己。") +
        `<div class="menu-list">${menu("树洞昵称", "nickname", "user", "夜航的小鱼")}${menu("我的心事", "whisper-mine", "chat")}${menu("我的回响", "whisper-notices", "bell")}</div><div class="notice">匿名身份只用于树洞展示，不关联你的公开主页。</div>`
      );
    case "blacklist":
      return (
        heading("屏蔽管理", "给自己留一片安静的空间。") +
        (ui.blocked
          ? `<div class="message-row"><span class="avatar">路</span><div><h3>路过的同学</h3><p>屏蔽于 2026.11.10</p></div><button class="text-btn" data-action="unblock">解除屏蔽</button></div>`
          : stateMarkup("empty"))
      );
    case "safety":
      return (
        heading("警告与申诉", "了解处理依据，也保留申诉的权利。") +
        `<div class="panel"><span class="tag neutral">暂无生效中的限制</span><h3 style="margin:18px 0 8px">一起守护校园里的善意</h3><p class="small muted">当前没有需要确认的警告。若后续出现相关记录，你可以在这里查看详情并提交申诉。</p></div>`
      );
    case "care":
    case "help":
      return (
        heading(
          "需要时，我们都在",
          "你不必独自面对所有事情。",
          "entry-whisper",
        ) +
        `<div class="notice">如果此刻需要陪伴，可以联系你信任的人，或查阅学校公布的援助渠道。</div><div class="menu-list"><button class="menu-item" data-action="care-detail">${icon("leaf")}<span>校园心理支持渠道</span><span class="menu-value">查看信息</span><span>›</span></button>${menu("我的关怀通知", "inbox", "bell")}</div><p class="mini-foot">此处为目录结构示例，实际渠道、来源和核验日期由服务端提供。</p>`
      );
    case "deletion":
      return miniForm(
        "离开之前，再确认一次",
        "注销会启动账号与相关数据的处理流程，请仔细阅读。",
        `<div class="notice warning">账号注销后，可能无法恢复原有身份、记录与服务。实际范围以资格检查和确认页为准。</div><label class="check"><input name="consent" type="checkbox" required>我已了解注销影响，并确认提出申请。</label>${field("输入“确认注销”", "confirm", "text", "确认注销")}`,
        "申请注销",
      );
    default:
      return stateMarkup("empty");
  }
}
function receipt() {
  return `<div class="receipt"><img src="${asset("entry-wish")}" alt=""><h2>${ui.page === "match-profile" ? "资料已保存" : "已收到你的提交"}</h2><p>${ui.page === "deletion" ? "注销申请已受理，可通过回执查询处理进度。" : "内容正在等待审核。审核结果会通过消息通知你。"}</p><div class="notice">本地演示回执<br><code>DEMO-${ui.page.toUpperCase()}-001</code></div><div style="margin-top:24px">${link("前往消息中心", "inbox", "btn primary full")}</div><button class="text-btn" data-action="edit-again">返回编辑</button></div>`;
}
function render() {
  const p = pages.find((x) => x.id === ui.page) || pages[0];
  byId("page-nav").innerHTML = groups
    .map(
      ([g, ids]) =>
        `<div class="nav-group-title">${g}</div>${ids
          .map((id) => {
            const page = pages.find((p) => p.id === id);
            return `<button class="page-link ${id === ui.page ? "active" : ""}" data-go="${id}" aria-current="${id === ui.page ? "page" : "false"}"><span>${page.title}${id === "compose" ? " · 发布" : ""}</span><small>${String(pages.indexOf(page) + 1).padStart(2, "0")}</small></button>`;
          })
          .join("")}`,
    )
    .join("");
  const isMain = mainTabs.some(([id]) => id === ui.page);
  byId("tabbar").hidden = !isMain;
  byId("tabbar").innerHTML = mainTabs
    .map(
      ([id, title, ic]) =>
        `<button class="${ui.page === id ? "active" : ""}" data-go="${id}" aria-current="${ui.page === id ? "page" : "false"}">${icon(ic + (ui.page === id ? "-active" : ""))}${title}</button>`,
    )
    .join("");
  let html = "";
  if (ui.state !== "default") html = stateMarkup(ui.state);
  else if (ui.completed[ui.page]) html = receipt();
  else {
    const views = {
      home,
      wishes: wishList,
      wish: wishDetail,
      resources,
      resource: resourceDetail,
      whispers,
      whisper: whisperDetail,
      profile,
      inbox,
      chat,
      capsules,
      capsule: capsuleDetail,
      matchmaking,
      match,
      "match-profile": matchProfile,
    };
    html = views[ui.page]?.() || formPage() || otherPages();
  }
  byId("screen").innerHTML = html;
  byId("note-title").textContent = p.title;
  byId("note-copy").textContent =
    ui.page === "home"
      ? "保留水彩锦鲤主视觉。问候、愿景、快捷入口、活动与内容信息流依次展开。"
      : ui.page === "match-profile"
        ? "将长资料拆为三个步骤。前后切换保留草稿，提交前汇总资料与展示范围。"
        : ui.page === "wish"
          ? "正文优先，统计与评论分层。底部操作随滚动保持可达，评论错误不影响正文。"
          : ui.page === "resources"
            ? "用文件类型、分类和更新信息帮助快速判断资料价值。搜索和分类可组合。"
            : "沿用提交版的配色与图标，统一页头、信息层级、表单间距和结果反馈。";
  byId("route-note").textContent = p.route;
  byId("view-state").value = ui.state;
  byId("auth-state").value = ui.loggedIn ? "signed-in" : "guest";
  byId("context-controls").innerHTML =
    ui.page === "match"
      ? `<label class="field">活动状态<select id="match-state">${[
          ["unregistered", "未报名"],
          ["review", "报名待审核"],
          ["waiting", "等待公布"],
          ["paired", "已配对"],
          ["unmatched", "已公布未配对"],
          ["ended", "活动已结束"],
        ]
          .map(
            ([v, t]) =>
              `<option value="${v}" ${ui.match === v ? "selected" : ""}>${t}</option>`,
          )
          .join("")}</select></label>`
      : ui.page === "capsule"
        ? `<label class="field">胶囊状态<select id="capsule-state"><option value="locked" ${ui.capsule === "locked" ? "selected" : ""}>未到期 · 正文不可见</option><option value="opened" ${ui.capsule === "opened" ? "selected" : ""}>服务端已确认开启</option></select></label>`
        : "";
  document.title = `${p.title} · 小程序原型`;
  filterNav();
}
function filterNav() {
  const q = byId("page-search").value;
  document
    .querySelectorAll(".page-link")
    .forEach((el) => (el.hidden = !el.textContent.includes(q)));
}
function saveDraft(form) {
  if (!form) return;
  ui.drafts[ui.page] = {
    ...ui.drafts[ui.page],
    ...Object.fromEntries(new FormData(form)),
  };
  form
    .querySelectorAll("input[type=checkbox][name]")
    .forEach((el) => (ui.drafts[ui.page][el.name] = el.checked));
}
function submitLocal(page) {
  if (ui.write !== "success") {
    ui.pending[page] = {
      type: ui.write,
      key: ui.pending[page]?.key || `DEMO-${page}-001`,
    };
    render();
    return;
  }
  ui.completed[page] = true;
  delete ui.pending[page];
  render();
  byId("phone-scroll").scrollTop = 0;
  toast("演示提交已受理");
}
function handleAction(action) {
  switch (action) {
    case "theme":
      openAppearance();
      break;
    case "login-prompt":
      openLogin();
      break;
    case "remove-card":
      ui.cardAttachment = null;
      ui.cardError = "";
      render();
      break;
    case "reply-cancel":
      ui.reply = null;
      renderPreservingScroll();
      break;
    case "reply-retry":
      if (ui.reply?.pending === "conflict") {
        ui.reply.pending = null;
        delete ui.replyPending[ui.reply.key];
        ui.write = "success";
        byId("write-state").value = "success";
        renderPreservingScroll();
        toast("已重新读取，请核对保留的回复后发送");
      } else if (ui.reply) finishReply();
      break;
    case "back":
      location.hash = ui.history.pop() || "home";
      break;
    case "reset-state":
      ui.state = "default";
      ui.query = "";
      ui.filter = "全部";
      render();
      break;
    case "apply":
      showDialog(
        "给心愿一个回应",
        `<p>告诉小满，你能提供怎样的帮助。</p><label class="field" style="margin-top:16px">应愿留言<textarea id="apply-message" placeholder="你好，我也想一起坚持晨读…" maxlength="500"></textarea></label><p class="form-error" id="apply-error"></p>`,
        () => {
          if (!byId("apply-message").value.trim()) {
            byId("apply-error").textContent = "请先写下一句应愿留言。";
            return false;
          }
          toast("应愿已提交，等待对方回应");
          go("applications");
        },
        "发送应愿",
      );
      break;
    case "accept-application":
      ui.completed.application = true;
      render();
      toast("已接受应愿，可以开始聊天了");
      break;
    case "contribute":
      showDialog(
        "把好资料分享出来",
        '<p>我们会先核对资料内容与来源。</p><label class="field">资料名称<input id="contribution-title" placeholder="填写资料名称"></label><label class="field">来源说明<textarea id="contribution-source" placeholder="说明资料来源或作者授权情况"></textarea></label><p class="form-error" id="contribution-error"></p>',
        () => {
          if (
            !byId("contribution-title").value.trim() ||
            !byId("contribution-source").value.trim()
          ) {
            byId("contribution-error").textContent = "请填写名称和来源说明";
            return false;
          }
          toast("资料贡献意向已记录（本地演示）");
        },
        "提交意向",
      );
      break;
    case "download": {
      const blob = new Blob(
        ["鲤愿池原型演示文件\n仅用于演示下载行为，不包含真实课程资料。"],
        { type: "text/plain;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "鲤愿池-资料下载演示.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("演示文件已下载");
      break;
    }
    case "resource-feedback":
      showDialog(
        "这份资料有帮助吗？",
        '<label class="field">你的反馈<textarea id="resource-comment" placeholder="有帮助的部分，或需要修正的地方…"></textarea></label><p class="form-error" id="feedback-error"></p>',
        () => {
          if (!byId("resource-comment").value.trim()) {
            byId("feedback-error").textContent = "请填写反馈内容";
            return false;
          }
          toast("感谢反馈，已记录（本地演示）");
        },
        "提交反馈",
      );
      break;
    case "read-all":
      ui.read = true;
      render();
      toast("通知已全部标为已读");
      break;
    case "opened-capsule":
      ui.capsule = "opened";
      go("capsule");
      break;
    case "cancel-capsule":
      showDialog(
        "确认处理这封胶囊？",
        "<p>此操作在原型中仅展示确认与回执，不影响任何真实内容。</p>",
        () => {
          toast("胶囊处理申请已受理（演示）");
          go("capsules");
        },
      );
      break;
    case "join-match":
      if (!byId("match-consent").checked) {
        toast("请先阅读并同意资料展示说明");
        break;
      }
      ui.match = "review";
      render();
      toast("报名已提交审核");
      break;
    case "withdraw-match":
      showDialog(
        "撤回本次报名",
        '<label class="field">撤回原因<textarea id="withdraw-reason" placeholder="请简单说明原因"></textarea></label><p class="form-error" id="withdraw-error"></p>',
        () => {
          if (!byId("withdraw-reason").value.trim()) {
            byId("withdraw-error").textContent = "请填写撤回原因";
            return false;
          }
          ui.match = "unregistered";
          render();
          toast("报名已撤回");
        },
        "确认撤回",
      );
      break;
    case "task":
      showDialog(
        "第一天 · 从一句你好开始",
        '<p>分享今天的一件小事。可以是早餐、一首歌，或在路上看见的一片落叶。</p><div class="notice" style="margin-top:16px">查看任务不会标记为已完成。</div>',
        () => go("chat"),
        "去聊天",
      );
      break;
    case "previous-step":
      saveDraft(document.querySelector("[data-form]"));
      ui.step--;
      render();
      break;
    case "retry-write":
      if (ui.pending[ui.page]?.type === "conflict") {
        delete ui.pending[ui.page];
        ui.write = "success";
        byId("write-state").value = "success";
        render();
        toast("已读取最新版本，请核对保留的输入后提交");
      } else {
        ui.completed[ui.page] = true;
        delete ui.pending[ui.page];
        render();
        toast("原演示请求已核实，结果为受理成功");
      }
      break;
    case "edit-again":
      delete ui.completed[ui.page];
      render();
      break;
    case "block":
      ui.blocked = true;
      toast("已加入屏蔽列表（本地演示）");
      break;
    case "unblock":
      showDialog("解除屏蔽", "<p>解除后，将恢复该对象的内容展示。</p>", () => {
        ui.blocked = false;
        render();
        toast("已解除屏蔽");
      });
      break;
    case "care-detail":
      showDialog(
        "校园心理支持渠道",
        '<p>实际页面展示：渠道名称、服务时间、联系方式、来源与最近核验日期。</p><div class="notice" style="margin-top:16px">当前为结构示例，未填入未经核验的联系方式。</div>',
        () => {},
        "我知道了",
      );
      break;
  }
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("button,a");
  if (!el) return;
  if (el.classList.contains("share-action")) {
    e.preventDefault();
    showDialog(
      "分享这份心愿",
      `<p>复制此原型详情链接，方便一起对照查看。</p><input class="input" readonly value="${esc(location.href)}" aria-label="原型链接">`,
      () => toast("可选中链接复制"),
      "完成",
    );
    return;
  }
  if (el.dataset.go) {
    if (document.querySelector("[data-form]"))
      saveDraft(document.querySelector("[data-form]"));
    go(el.dataset.go);
  }
  if (el.dataset.sort) {
    ui.wishSort = el.dataset.sort;
    render();
  }
  if (el.hasAttribute("data-reply-to")) openReply(el.dataset.replyTo);
  if (el.dataset.appearance) {
    setTheme(el.dataset.appearance);
    document.querySelector("dialog.mini-dialog")?.close();
    renderPreservingScroll();
  }
  if (el.dataset.action) handleAction(el.dataset.action);
  if (el.dataset.width) {
    byId("device").style.width = el.dataset.width + "px";
    document
      .querySelectorAll("[data-width]")
      .forEach((b) => b.classList.toggle("active", b === el));
  }
  if (el.dataset.filter) {
    ui.filter = el.dataset.filter;
    render();
  }
  if (el.dataset.wish) {
    ui.selectedWish = Number(el.dataset.wish);
    go("wish");
  }
  if (el.dataset.resource !== undefined) {
    ui.selectedResource = Number(el.dataset.resource);
    go("resource");
  }
  if (el.dataset.like) {
    const id = Number(el.dataset.like);
    ui.likes.has(id) ? ui.likes.delete(id) : ui.likes.add(id);
    render();
  }
  if (el.dataset.save) {
    const id = el.dataset.save;
    ui.saved.has(id) ? ui.saved.delete(id) : ui.saved.add(id);
    render();
    toast(ui.saved.has(id) ? "已收藏" : "已取消收藏");
  }
  if (el.dataset.trait) {
    saveDraft(document.querySelector("[data-form]"));
    ui.traits.has(el.dataset.trait)
      ? ui.traits.delete(el.dataset.trait)
      : ui.traits.add(el.dataset.trait);
    render();
  }
  if (el.dataset.inbox) {
    ui.inbox = el.dataset.inbox;
    render();
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "page-search") filterNav();
  if (e.target.name === "reply" && ui.reply) {
    ui.reply.body = e.target.value;
    ui.replyDrafts[ui.reply.key] = e.target.value;
  }
  const f = e.target.closest("[data-form]");
  if (f) saveDraft(f);
});
document.addEventListener("change", (e) => {
  if (e.target.id === "auth-state") {
    ui.loggedIn = e.target.value === "signed-in";
    render();
  }
  if (e.target.id === "student-card") readStudentCard(e.target.files[0]);
  if (e.target.id === "view-state") {
    ui.state = e.target.value;
    render();
  }
  if (e.target.id === "write-state") ui.write = e.target.value;
  if (e.target.id === "match-state") {
    ui.match = e.target.value;
    render();
  }
  if (e.target.id === "capsule-state") {
    ui.capsule = e.target.value;
    render();
  }
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  if (form.hasAttribute("data-reply")) {
    const body = new FormData(form).get("reply").trim();
    if (!body) {
      byId("reply-error").textContent = "请填写回复内容";
      return;
    }
    ui.reply.body = body;
    ui.replyDrafts[ui.reply.key] = body;
    if (ui.write !== "success") {
      ui.reply.pending = ui.write;
      ui.replyPending[ui.reply.key] = ui.write;
      renderPreservingScroll();
      return;
    }
    finishReply();
  } else if (form.hasAttribute("data-search")) {
    ui.query = new FormData(form).get("search").trim();
    render();
  } else if (form.hasAttribute("data-chat")) {
    const message = new FormData(form).get("message").trim();
    if (!message) {
      toast("请填写消息内容");
      return;
    }
    ui.messages.push(message);
    render();
    toast("消息已提交审核");
  } else if (form.hasAttribute("data-form")) {
    saveDraft(form);
    if (ui.page === "match-profile" && ui.step < 3) {
      ui.step++;
      render();
      byId("phone-scroll").scrollTop = 0;
      return;
    }
    if (ui.page === "deletion" && ui.drafts.deletion.confirm !== "确认注销") {
      byId("form-error").textContent = "请输入“确认注销”后再继续";
      return;
    }
    if (ui.drafts[ui.page].type === "请选择") {
      byId("form-error").textContent = "请选择举报类型";
      return;
    }
    if (ui.page === "verify" && !ui.cardAttachment) {
      byId("form-error").textContent = "请选择学生卡材料";
      return;
    }
    submitLocal(ui.page);
  }
});
function route() {
  const id = location.hash.slice(1) || "home";
  if (id === "login" || id === "comment-editor") {
    const destination = id === "login" ? "home" : "whisper";
    history.replaceState(null, "", "#" + destination);
    ui.page = destination;
    render();
    if (id === "login") openLogin();
    else openReply("");
    return;
  }
  ui.page = pages.some((p) => p.id === id) ? id : "home";
  ui.state = "default";
  ui.filter = "全部";
  ui.query = "";
  render();
  byId("phone-scroll").scrollTop = 0;
}
window.addEventListener("hashchange", route);
route();
