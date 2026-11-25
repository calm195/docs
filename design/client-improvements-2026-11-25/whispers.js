"use strict";

const assets = "../prototypes-v2/assets/";
const $ = (selector) => document.querySelector(selector);
const screen = $("#screen");
const dialog = $("#dialog");
const labels = { campus: "校区", grade: "年级", gender: "性别" };
const profile = { campus: "五山", grade: "大三", gender: "女生" };
const feedPosts = [
  {
    id: "library",
    title: "谢谢在图书馆门口等我的你",
    body: "晚自习结束时突然下了雨。你把伞举过来，说顺路，一路陪我走到宿舍楼下。那天没来得及好好道谢，希望你今天也遇到一件开心的小事。",
    mode: "semi",
    tags: { campus: "大学城", grade: "大二" },
    publicIdentity: {
      mode: "semi",
      label: "大学城大二",
      tags: { campus: "大学城", grade: "大二" },
    },
    hugs: 12,
    views: 38,
    comments: ["愿意在雨里多等一会儿的人，真的很温柔。"],
    mine: false,
    status: "已公开",
  },
  {
    id: "breeze",
    title: "晚跑时遇到的那阵风",
    body: "绕操场跑到第三圈的时候，晚风突然吹过来。白天想不通的那道题，好像也没那么沉了。想把这阵风分给今晚还在努力的你。",
    mode: "semi",
    tags: { campus: "五山" },
    publicIdentity: { mode: "semi", label: "五山", tags: { campus: "五山" } },
    hiddenIdentity: { mode: "anonymous", label: "小鲤鱼", tags: null },
    hugs: 6,
    views: 21,
    comments: [],
    mine: true,
    status: "已公开",
  },
  {
    id: "letter",
    title: "给明天的自己留一句话",
    body: "周末去听一场想听了很久的音乐会。把那些平时舍不得为自己做的小事，认真写进日历里。",
    mode: "anonymous",
    tags: {},
    publicIdentity: { mode: "anonymous", label: "小鲤鱼", tags: null },
    hugs: 4,
    views: 19,
    comments: [],
    mine: false,
    status: "已公开",
  },
  {
    id: "closed",
    title: "分享一个在舞室练到日落的小瞬间",
    body: "音乐停了，我们才发现窗外的云已经变成粉色。谢谢愿意陪我从第一个八拍开始数的人。",
    publicIdentity: { mode: "named", label: "池边听风", tags: null },
    hugs: 8,
    views: 16,
    comments: ["隔着窗户看到晚霞的时候，我也想起了这天。"],
    commentsOpen: false,
    mine: false,
    status: "已公开",
  },
];
const activeHugs = new Set();
const activeFavorites = new Set();
let draft,
  activePost,
  draftOrigin,
  lastRoute,
  toastTimer,
  newId = 0,
  dialogAction;
const commentPreferences = {
  verified: null,
  friend: null,
  unverified: { mode: "semi", tags: { campus: "大学城" } },
};
const commentInputs = {
  verified: new Map(),
  unverified: new Map(),
  friend: new Map(),
};
const commentNotices = {
  verified: new Map(),
  unverified: new Map(),
  friend: new Map(),
};
const unverified = () => route()[0].endsWith("-unverified");
const persona = () =>
  unverified()
    ? "unverified"
    : route()[0].endsWith("shared")
      ? "friend"
      : "verified";
const commentRoute = (page, id) => {
  const suffix = unverified()
    ? "-unverified"
    : persona() === "friend"
      ? "-shared"
      : "";
  return page + suffix + "/" + id;
};
const viewerIsAuthor = (post) => post.mine && persona() === "verified";
const interactionKey = (post) => persona() + "/" + post.id;
const currentPreference = () =>
  commentPreferences[persona()] || { mode: "anonymous", tags: {} };
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const activeHidden = () => $("#hide-tags").checked;
const route = () => (location.hash.slice(1) || "feed").split("/");
const getPost = (id) => feedPosts.find((p) => p.id === id);
const icon = (name) =>
  '<img alt="" src="' + assets + "icons/" + name + '.svg">';
const button = (action, label, css = "btn", extra = "") =>
  '<button type="button" class="' +
  css +
  '" data-action="' +
  action +
  '" ' +
  extra +
  ">" +
  label +
  "</button>";
const heading = (title, desc = "") =>
  '<div class="heading"><h2>' +
  escape(title) +
  "</h2>" +
  (desc ? "<p>" + escape(desc) + "</p>" : "") +
  "</div>";
const badge = (label) => '<span class="tag">' + escape(label) + "</span>";
function say(message) {
  const node = $("#message");
  clearTimeout(toastTimer);
  node.textContent = message;
  node.hidden = false;
  toastTimer = setTimeout(() => {
    node.hidden = true;
  }, 2000);
}
function go(path) {
  if (location.hash === "#" + path) render();
  else location.hash = path;
}
function postIdentity(post) {
  if (post.mode === "named") return "池边听风";
  if (
    post.mode === "semi" &&
    (post.mine === false || !activeHidden()) &&
    Object.values(post.tags).length
  )
    return Object.values(post.tags).join(" · ");
  return "小鲤鱼";
}
function visibleIdentity(post) {
  return post.mine && activeHidden() && post.hiddenIdentity
    ? post.hiddenIdentity
    : post.publicIdentity;
}
function cardTags(post) {
  const identity = visibleIdentity(post);
  const values = viewerIsAuthor(post)
    ? ["帖主"]
    : identity?.mode === "semi"
      ? ["campus", "grade", "gender"]
          .map((key) => identity.tags?.[key])
          .filter((value) => typeof value === "string" && value.trim())
      : [];
  return values.length
    ? '<span class="public-tags">' + values.map(badge).join("") + "</span>"
    : "";
}
function hugControl(post) {
  const lit = activeHugs.has(interactionKey(post));
  const label = icon(lit ? "heart-active" : "heart") + "抱抱 " + post.hugs;
  if (viewerIsAuthor(post))
    return '<span class="tool hug-readonly">' + label + "</span>";
  return button(
    "hug",
    label,
    "tool" + (lit ? " is-on" : ""),
    'data-id="' + post.id + '" aria-pressed="' + lit + '"',
  );
}
function card(post) {
  const id = 'data-id="' + post.id + '"';
  const link = button(
    "open",
    '<span class="title-row"><strong>' +
      escape(post.title) +
      "</strong>" +
      cardTags(post) +
      '</span><span class="excerpt">' +
      escape(post.body) +
      "</span>",
    "open-post",
    id,
  );
  return (
    '<article class="card">' +
    link +
    '<div class="toolbar">' +
    hugControl(post) +
    button("open", icon("chat") + "暖评 " + post.comments.length, "tool", id) +
    '<span class="tool">' +
    icon("eye") +
    post.views +
    "</span>" +
    button("share", icon("send") + "分享", "tool share", id) +
    "</div></article>"
  );
}
function feed() {
  return (
    '<div class="hero"><div><h2>悄悄话</h2><p>有些话，轻轻说就好。</p></div><img alt="" src="' +
    assets +
    'illustrations/entry-whisper.png"></div><div class="actions-row">' +
    button("mine", icon("book") + "我的心事", "tool") +
    button("new", "＋ 写心事", "tool") +
    "</div>" +
    feedPosts
      .filter((p) => p.status === "已公开")
      .map(card)
      .join("")
  );
}
function mine() {
  const list = feedPosts
    .filter((p) => p.mine)
    .map((post) => {
      const target =
        post.status === "已公开"
          ? "own"
          : post.status === "草稿"
            ? "edit"
            : "owner";
      return (
        '<article class="card">' +
        button(
          target,
          '<span class="title-row"><strong>' +
            escape(post.title) +
            "</strong>" +
            badge("帖主") +
            '</span><span class="excerpt">' +
            escape(post.body) +
            '</span><span class="mine-meta caption"><span>' +
            escape(post.status) +
            "</span><span>查看心事 ›</span></span>",
          "open-post",
          'data-id="' + post.id + '"',
        ) +
        "</article>"
      );
    })
    .join("");
  return (
    heading("我的心事") +
    list +
    '<article class="card"><span class="tag neutral">内容受限</span><p class="metadata">这条心事暂时无法查看。</p></article>' +
    button("new", "＋ 写心事", "btn primary full")
  );
}
function postActions(post) {
  const id = 'data-id="' + post.id + '"';
  const saved = activeFavorites.has(interactionKey(post));
  return (
    '<div class="detail-actions">' +
    hugControl(post) +
    button(
      "view-comments",
      icon("chat") + "评论 " + post.comments.length,
      "tool",
      id + ' aria-controls="comments"',
    ) +
    button(
      "favorite",
      icon(saved ? "star-active" : "star") + (saved ? "已收藏" : "收藏"),
      "tool favorite" + (saved ? " is-on" : ""),
      id + ' aria-pressed="' + saved + '"',
    ) +
    "</div>"
  );
}
function commentSection(post) {
  const comments = post.comments.length
    ? post.comments
        .map(
          (line) =>
            '<div class="comment"><span class="metadata">小鲤鱼</span><p>' +
            escape(line) +
            "</p></div>",
        )
        .join("")
    : '<p class="metadata">还没有暖评。</p>';
  const opened = route()[0].startsWith("comment");
  const form =
    post.commentsOpen === false
      ? '<p class="metadata">评论已关闭，已公开的暖评仍可查看。</p>'
      : opened
        ? composeComment(post)
        : "";
  return (
    '<section class="card" id="comments" tabindex="-1" aria-labelledby="comments-heading"><div class="heading-line"><h3 id="comments-heading">暖评与回复</h3>' +
    (!opened && post.commentsOpen !== false
      ? button(
          "comment",
          "写暖评",
          "tool write-comment",
          'data-id="' + post.id + '"',
        )
      : "") +
    "</div>" +
    comments +
    form +
    (commentNotices[persona()].has(post.id)
      ? '<p class="metadata">你的暖评已提交审核。</p>'
      : "") +
    "</section>"
  );
}
function detail(post, own) {
  if (!post || (post.status !== "已公开" && !(own && viewerIsAuthor(post)))) {
    return (
      '<article class="card"><h2>这条心事暂时无法查看。</h2></article>' +
      button("feed", "返回悄悄话列表", "btn full")
    );
  }
  const published = post.status === "已公开";
  const identity = visibleIdentity(post);
  const byline = published ? identity?.label : post.status;
  return (
    '<article class="card post-detail"><h2>' +
    escape(post.title) +
    "</h2>" +
    (byline ? '<p class="metadata">' + escape(byline) + "</p>" : "") +
    '<p class="full-body">' +
    escape(post.body) +
    "</p>" +
    (published ? postActions(post) : "") +
    "</article>" +
    (published ? commentSection(post) : "") +
    (viewerIsAuthor(post) && post.status !== "审核中"
      ? button("edit", "编辑心事", "btn full", 'data-id="' + post.id + '"')
      : "")
  );
}
function editor(isNew, id, entering) {
  const record = isNew ? null : getPost(id || "breeze");
  if (!isNew && (!record?.mine || record.status === "审核中"))
    return detail(record, true);
  if (!draft || entering || draftOrigin !== (record?.id || "new")) {
    draft = record
      ? { ...record, tags: { ...record.tags } }
      : { title: "", body: "", mode: "anonymous", tags: {} };
    draft.semiSeen = record?.mode === "semi";
    draftOrigin = record?.id || "new";
  }
  const fields =
    '<div class="card"><label class="field">标题<input id="draft-title" value="' +
    escape(draft.title) +
    '" placeholder="给心事起个名字"></label><label class="field">正文<textarea id="draft-body" placeholder="写下想说的话">' +
    escape(draft.body) +
    '</textarea></label><span class="caption" id="count">' +
    Array.from(draft.body).length +
    " / 500</span></div>";
  return (
    heading(
      isNew ? "写心事" : "编辑心事",
      record ? "当前状态 · " + record.status : "",
    ) +
    fields +
    identityForm() +
    button("save", "保存草稿", "btn primary full") +
    (record?.status === "草稿" ? button("submit", "提交审核", "btn full") : "")
  );
}
function identityForm() {
  const modes = { anonymous: "完全匿名", semi: "半匿名", named: "树洞昵称" };
  const buttons = Object.entries(modes)
    .map(([value, label]) =>
      button(
        "mode",
        label,
        "",
        'data-mode="' +
          value +
          '" aria-pressed="' +
          (draft.mode === value) +
          '"',
      ),
    )
    .join("");
  let selector = "";
  if (draft.mode === "semi") {
    selector =
      (unverified()
        ? '<p class="caption">选择希望展示的项目。</p>'
        : '<p class="caption">来自个人资料，可选择展示的项目。</p>') +
      Object.entries(
        unverified()
          ? { campus: "大学城", grade: "大二", gender: "女生" }
          : profile,
      )
        .map(
          ([key, value]) =>
            '<label class="switch-row"><span>' +
            labels[key] +
            "<small>" +
            escape(draft.tags[key] || value) +
            '</small></span><input aria-label="展示' +
            labels[key] +
            '" type="checkbox" data-tag="' +
            key +
            '" ' +
            (draft.tags[key] ? "checked" : "") +
            "></label>",
        )
        .join("");
    if (!Object.keys(draft.tags).length)
      selector += '<p class="form-error">保留至少一项，或选择完全匿名。</p>';
    if (activeHidden())
      selector +=
        '<p class="caption">全局隐藏已开启，其他人看不到这些标签。</p>';
  }
  return (
    '<section class="card"><h3>身份展示</h3><div class="choice">' +
    buttons +
    "</div>" +
    selector +
    '<div class="preview"><strong>公开预览</strong><span>' +
    escape(postIdentity(draft)) +
    "</span></div></section>"
  );
}
function preferencePage(entering, id) {
  if (entering || !draft) {
    const saved = currentPreference();
    draft = {
      mode: saved.mode,
      tags: { ...saved.tags },
      semiSeen: saved.mode === "semi",
    };
    draftOrigin = "comment-preference";
  }
  return (
    heading("评论身份", "用于这台设备上你之后发送的暖评。") +
    identityForm() +
    button(
      "save-preference",
      "保存评论身份",
      "btn primary full",
      'data-id="' + id + '"',
    )
  );
}
function composeComment(post) {
  const identity = currentPreference();
  const text = commentInputs[persona()].get(post.id) || "";
  const modeNames = {
    anonymous: "完全匿名",
    semi: "半匿名",
    named: "树洞昵称",
  };
  return (
    '<section class="composer"><label class="field">写暖评<textarea id="comment-body" placeholder="写下想对帖主说的话">' +
    escape(text) +
    '</textarea></label><p class="caption">本条暖评身份 · ' +
    modeNames[identity.mode] +
    '</p><div class="preview"><strong>公开预览</strong><span>' +
    escape(postIdentity(identity)) +
    '</span></div><div class="actions-row">' +
    button("preferences", "调整身份", "tool", 'data-id="' + post.id + '"') +
    button("send-comment", "发送暖评", "tool", 'data-id="' + post.id + '"') +
    "</div></section>"
  );
}
function showDialog(html, action) {
  $("#dialog-inner").innerHTML = html;
  dialogAction = action;
  if (!dialog.open) dialog.showModal();
}
function render() {
  const [view, id] = route();
  const here = view + "/" + (id || "");
  const moved = lastRoute !== here;
  activePost = getPost(
    id || (view === "edit" || view === "own" ? "breeze" : "library"),
  );
  let html;
  if (view === "mine") html = mine();
  else if (view === "new" || view === "edit")
    html = editor(view === "new", id, moved);
  else if (
    ["preferences", "preferences-unverified", "preferences-shared"].includes(
      view,
    )
  )
    html = preferencePage(moved, id || "library");
  else if (
    [
      "detail",
      "own",
      "shared",
      "comment",
      "comment-unverified",
      "comment-shared",
    ].includes(view)
  )
    html = detail(activePost, view === "own");
  else html = feed();
  screen.innerHTML = html;
  if (moved) {
    screen.scrollTop = 0;
    $("#message").hidden = true;
  }
  $("#back").hidden = view === "feed";
  document.querySelectorAll("[data-view]").forEach((a) => {
    if (
      a.dataset.view === view ||
      (a.dataset.view === "detail" && ["own", "shared"].includes(view))
    )
      a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  lastRoute = here;
  if (moved && view.startsWith("comment")) $("#comment-body")?.focus();
}
function save() {
  const original = getPost(draftOrigin);
  if (
    original &&
    original.title === draft.title &&
    original.body === draft.body &&
    original.mode === draft.mode &&
    Object.keys(labels).every((k) => original.tags[k] === draft.tags[k])
  ) {
    say("内容没有变化");
    return;
  }
  if (
    !draft.title.trim() ||
    Array.from(draft.title).length > 40 ||
    !draft.body.trim() ||
    Array.from(draft.body).length > 500
  ) {
    say("请填写 1 至 40 字标题和 1 至 500 字正文");
    return;
  }
  if (draft.mode === "semi" && !Object.keys(draft.tags).length) {
    say("请选择至少一个公开标签，或使用完全匿名");
    return;
  }
  const commit = () => {
    const post = original || {
      id: "draft-" + ++newId,
      mine: true,
      hugs: 0,
      views: 0,
      comments: [],
    };
    Object.assign(post, {
      title: draft.title,
      body: draft.body,
      mode: draft.mode,
      tags: draft.mode === "semi" ? { ...draft.tags } : {},
      status: "草稿",
    });
    if (!original) feedPosts.unshift(post);
    go("mine");
  };
  if (original?.status === "已公开")
    showDialog(
      "<h2>保存为草稿？</h2><p>保存后，这条心事和原评论将暂时撤下。重新提交审核并通过后，心事会再次公开。</p>" +
        button("confirm", "保存为草稿", "btn primary full"),
      commit,
    );
  else commit();
}
function activate(action, id, mode) {
  const post = getPost(id);
  switch (action) {
    case "feed":
    case "new":
    case "mine":
      go(action);
      break;
    case "view-comments":
      if (post?.status === "已公开") {
        $("#comments")?.focus({ preventScroll: true });
        $("#comments")?.scrollIntoView({ block: "nearest" });
      }
      break;
    case "comment":
      if (post?.status === "已公开" && post.commentsOpen !== false) {
        go(commentRoute("comment", id));
        $("#comment-body")?.focus();
      }
      break;
    case "preferences":
      go(commentRoute(action, id || "library"));
      break;
    case "save-preference":
      if (draft.mode === "semi" && !Object.keys(draft.tags).length) {
        say("请选择至少一项，或使用完全匿名");
        break;
      }
      commentPreferences[persona()] = {
        mode: draft.mode,
        tags: draft.mode === "semi" ? { ...draft.tags } : {},
      };
      go(commentRoute("comment", id));
      break;
    case "send-comment": {
      const body = commentInputs[persona()].get(id) || "";
      if (!body.trim() || Array.from(body).length > 500) {
        say("请填写 1 至 500 字暖评");
        break;
      }
      if (!post || post.status !== "已公开" || post.commentsOpen === false)
        break;
      commentInputs[persona()].delete(id);
      commentNotices[persona()].set(id, true);
      render();
      say("暖评已提交审核");
      break;
    }
    case "open":
      go("detail/" + id);
      break;
    case "edit":
      go("edit/" + id);
      break;
    case "own":
    case "owner":
      go("own/" + id);
      break;
    case "hug": {
      if (!post || viewerIsAuthor(post) || post.status !== "已公开") break;
      const key = interactionKey(post);
      const lit = !activeHugs.has(key);
      if (lit) activeHugs.add(key);
      else activeHugs.delete(key);
      post.hugs += lit ? 1 : -1;
      render();
      say(lit ? "已送出抱抱" : "已取消抱抱");
      break;
    }
    case "favorite": {
      if (!post || post.status !== "已公开") break;
      const key = interactionKey(post);
      const saved = !activeFavorites.has(key);
      if (saved) activeFavorites.add(key);
      else activeFavorites.delete(key);
      render();
      say(saved ? "已收藏" : "已取消收藏");
      break;
    }
    case "share":
      if (!post || post.status !== "已公开") break;
      showDialog(
        '<h2>分享给微信好友</h2><div class="share-preview"><img alt="鲤愿池分享封面" src="' +
          assets +
          'share-cover.png"><strong>鲤愿池 · 一条悄悄话</strong></div>' +
          button("confirm", "预览好友打开的页面", "btn primary full"),
        () => go("shared/" + id),
      );
      break;
    case "mode":
      draft.mode = mode;
      if (mode === "semi" && !draft.semiSeen) {
        draft.semiSeen = true;
        draft.tags = unverified() ? {} : { ...profile };
      }
      render();
      break;
    case "save":
      save();
      break;
    case "submit": {
      const p = getPost(draftOrigin);
      if (!p || p.status !== "草稿") break;
      if (
        p.title !== draft.title ||
        p.body !== draft.body ||
        p.mode !== draft.mode ||
        (p.mode === "semi" &&
          Object.keys(labels).some((k) => p.tags[k] !== draft.tags[k]))
      ) {
        say("请先保存更改，再提交审核");
        break;
      }
      showDialog(
        "<h2>提交这条心事？</h2><p>审核通过后将自动公开。</p>" +
          button("confirm", "提交审核", "btn primary full"),
        () => {
          p.status = "审核中";
          go("mine");
        },
      );
      break;
    }
    case "confirm": {
      const run = dialogAction;
      dialog.close();
      run?.();
      break;
    }
  }
}
document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (target)
    activate(target.dataset.action, target.dataset.id, target.dataset.mode);
});
screen.addEventListener("input", (event) => {
  if (event.target.id === "comment-body" && activePost)
    commentInputs[persona()].set(activePost.id, event.target.value);
  if (event.target.id === "draft-title") draft.title = event.target.value;
  if (event.target.id === "draft-body") {
    draft.body = event.target.value;
    $("#count").textContent = Array.from(draft.body).length + " / 500";
  }
});
screen.addEventListener("change", (event) => {
  const key = event.target.dataset.tag;
  if (!key || !Object.hasOwn(labels, key)) return;
  if (event.target.checked)
    draft.tags[key] = unverified()
      ? { campus: "大学城", grade: "大二", gender: "女生" }[key]
      : profile[key];
  else delete draft.tags[key];
  render();
  screen
    .querySelector('[data-tag="' + key + '"]')
    ?.focus({ preventScroll: true });
});
$("#hide-tags").addEventListener("change", render);
$("#dismiss").addEventListener("click", () => dialog.close());
$("#back").addEventListener("click", () => {
  const [view] = route();
  go(view === "edit" || view === "own" ? "mine" : "feed");
});
window.addEventListener("hashchange", render);
render();
