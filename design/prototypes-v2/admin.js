"use strict";
const adminPages = [
  ["dashboard", "数据总览", "/", "总览", "all", "dashboard", "home"],
  ["users", "平台用户", "/users", "用户管理", "all", "users", "user"],
  [
    "identity",
    "身份审核",
    "/identity",
    "用户管理",
    "review",
    "review",
    "shield",
  ],
  [
    "identity-history",
    "身份审核历史",
    "/identity/history",
    "用户管理",
    "review",
    "review",
    "clock",
  ],
  [
    "matchmaking",
    "活动维护",
    "/matchmaking",
    "包分配",
    "review",
    "activities",
    "heart",
  ],
  [
    "traits",
    "特质标签",
    "/matchmaking/traits",
    "包分配",
    "review",
    "traits",
    "star",
  ],
  [
    "tasks",
    "每日任务库",
    "/matchmaking/task-library",
    "包分配",
    "review",
    "tasks",
    "check",
  ],
  [
    "resources",
    "资料列表",
    "/resources",
    "资料管理",
    "review",
    "resources",
    "book",
  ],
  [
    "categories",
    "资料分类",
    "/resource-categories",
    "资料管理",
    "review",
    "settings",
    "book",
  ],
  [
    "wishes",
    "心愿管理",
    "/content/wishes",
    "内容管理",
    "review",
    "content",
    "fish",
  ],
  [
    "whispers",
    "悄悄话管理",
    "/content/whispers",
    "内容管理",
    "review",
    "content",
    "chat",
  ],
  [
    "moderation",
    "内容审核",
    "/moderation",
    "内容治理",
    "review",
    "review",
    "check",
  ],
  [
    "whisper-reviews",
    "树洞审核",
    "/whispers/reviews",
    "内容治理",
    "review",
    "review",
    "chat",
  ],
  [
    "wordlists",
    "词库管理",
    "/wordlists",
    "内容治理",
    "review",
    "words",
    "book",
  ],
  [
    "builtin",
    "内置词库",
    "/wordlists/builtin",
    "内容治理",
    "review",
    "words",
    "book",
  ],
  [
    "word-history",
    "发布记录",
    "/wordlists/history",
    "内容治理",
    "review",
    "words",
    "clock",
  ],
  [
    "reports",
    "举报管理",
    "/safety/reports",
    "安全治理",
    "all",
    "safety",
    "shield",
  ],
  [
    "penalties",
    "处罚管理",
    "/safety/penalties",
    "安全治理",
    "all",
    "safety",
    "notice",
  ],
  [
    "appeals",
    "申诉管理",
    "/safety/appeals",
    "安全治理",
    "all",
    "safety",
    "chat",
  ],
  [
    "whisper-reports",
    "树洞举报",
    "/whispers/reports",
    "安全治理",
    "all",
    "safety",
    "chat",
  ],
  ["crisis", "危机工作台", "/crisis", "安全治理", "crisis", "crisis", "heart"],
  [
    "whisper-crises",
    "树洞危机",
    "/whispers/crises",
    "安全治理",
    "crisis",
    "crisis",
    "leaf",
  ],
  [
    "whisper-evidence",
    "树洞证据",
    "/whispers/evidence",
    "隐私管理",
    "super",
    "query",
    "lock",
  ],
  [
    "evidence",
    "证据删除",
    "/evidence-deletion",
    "隐私管理",
    "super",
    "query",
    "shield",
  ],
  [
    "receipts",
    "回执查询",
    "/deletion-receipts",
    "隐私管理",
    "super",
    "query",
    "search",
  ],
  [
    "accounts",
    "后台账号",
    "/accounts",
    "系统管理",
    "super",
    "accounts",
    "user",
  ],
  [
    "report-types",
    "举报类型",
    "/report-types",
    "系统管理",
    "super",
    "settings",
    "notice",
  ],
  [
    "dictionaries",
    "展示字典",
    "/dictionaries",
    "系统管理",
    "super",
    "settings",
    "book",
  ],
  [
    "guide",
    "模块使用说明",
    "/module-guide",
    "系统管理",
    "super",
    "editor",
    "book",
  ],
  ["password", "本人改密", "/password", "系统管理", "all", "password", "lock"],
  ["login", "后台登录", "/login", "公共页面", "all", "login", "user"],
  ["forbidden", "无访问权限", "/403", "公共页面", "all", "forbidden", "lock"],
  [
    "not-found",
    "页面不存在",
    "/:pathMatch(.*)*",
    "公共页面",
    "all",
    "not-found",
    "search",
  ],
].map(([id, title, route, group, role, family, ic]) => ({
  id,
  title,
  route,
  group,
  role,
  family,
  ic,
}));
const app = {
  page: "dashboard",
  role: "super",
  state: "default",
  write: "success",
  query: "",
  status: "全部状态",
  pageNumber: 1,
  range: "month",
  detail: false,
  activityTab: "活动设置",
  pairStep: 0,
  cloud: false,
  expandedLeaves: new Set(),
  deleted: new Set(),
  enabled: {},
  firstTask: 0,
  activity: {
    title: "秋日来信 · 七天认识一个新朋友",
    description:
      "从一句你好开始，分享日常、交换故事。不必预设答案，把认识彼此的过程交给时间。",
    days: "7",
    registration_opens_at: "2026-11-10T09:00",
    registration_closes_at: "2026-11-17T22:00",
    results_at: "2026-11-18T10:00",
    starts_at: "2026-11-18T12:00",
    ends_at: "2026-11-24T23:59",
  },
  wordLibrary: "school",
  wordEditing: false,
  wordEditSnapshot: null,
  wordQuery: "",
  wordEntries: {},
  wordDirty: {},
  wordVersions: {},
  wordDrafts: {},
  guideModule: "心愿池",
  guideEditing: false,
  guidePublished: {},
  guideDrafts: {},
  overrides: {},
  edited: {},
  created: {},
  pending: null,
  activityRecords: {},
  activityIndex: 0,
  queryResult: false,
  drafts: {},
  expanded: new Set(),
};
const contentNames = [
  "想找一个一起坚持晨读的伙伴",
  "周六一起记录校园的秋天",
  "想听听大家第一次面试的故事",
  "寻找愿意一起晨跑的同学",
  "谢谢那个帮我撑伞的同学",
  "图书馆里的小小善意",
  "一起准备下个月的英语考试",
  "给明年的自己留下一点期待",
];
const subPages = new Set(["builtin", "word-history"]);
function current() {
  return adminPages.find((p) => p.id === app.page) || adminPages[0];
}
function allowed(p) {
  return app.role === "super" || p.role === "all" || p.role === app.role;
}
function nav(id) {
  location.hash = id;
}
function navButton(id, label, cls = "text-btn") {
  return `<button class="${cls}" data-go="${id}">${label}</button>`;
}
function badge(value) {
  const warning = /待|审核中|跟进中/.test(value);
  const neutral = /下架|停用|取消|驳回|已结束/.test(value);
  return `<span class="tag ${warning ? "warning" : neutral ? "neutral" : ""}">${esc(value)}</span>`;
}
function heading(title, description, action = "") {
  return `<section class="page-heading"><div><div class="eyebrow">LI YUAN CHI / WORKSPACE</div><h1>${title}</h1><p>${description}</p></div><div class="heading-actions">${action}</div></section>`;
}
const rowFamilies = {
  users: {
    columns: ["用户", "认证状态", "账号状态", "注册时间", "操作"],
    names: [
      "小满",
      "橙子",
      "慢慢来",
      "秋日的风",
      "路过的同学",
      "一颗栗子",
      "山间来信",
      "小岛",
    ],
    states: ["已认证", "待认证"],
    secondary: "校园用户",
  },
  review: {
    columns: ["案件 / 内容", "内容类型", "审核状态", "提交时间", "操作"],
    names: contentNames,
    states: ["待审核", "待审核", "已通过", "已驳回"],
    secondary: "内容版本 v3 · 案件版本 v2",
  },
  content: {
    columns: ["内容标题", "分类", "发布状态", "互动数据", "更新时间", "操作"],
    names: contentNames,
    states: ["已发布", "已发布", "已下架"],
    secondary: "校园里的小小期待",
  },
  resources: {
    columns: [
      "资料名称",
      "分类",
      "上架状态",
      "当前版本反馈",
      "更新时间",
      "操作",
    ],
    names: [
      "高等数学 · 期末复习思维导图",
      "校园生活指南 · 新生篇",
      "英语六级备考计划与经验",
      "第一份实习简历怎么写",
      "大学物理复习笔记",
      "校园图书馆使用指南",
      "毕业答辩准备手册",
      "校园活动场地说明",
    ],
    states: ["已上架", "已上架", "已下架"],
    secondary: "PDF · 2.4 MB · 当前版本 v2",
  },
  activities: {
    columns: ["活动名称", "活动状态", "报名人数", "已配对", "报名截止", "操作"],
    names: [
      "秋日来信 · 七天认识一个新朋友",
      "冬日暖阳 · 校园相遇计划",
      "九月序章 · 新学期的相遇",
      "一起走进这个春天",
      "把日常写成一封信",
      "夏日里的小小遇见",
    ],
    states: ["报名中", "草稿", "已结束"],
    secondary: "7 天活动 · 双方自愿参与",
  },
  traits: {
    columns: ["词条", "用途", "审核状态", "启用状态", "选用人数", "操作"],
    names: [
      "慢热",
      "喜欢散步",
      "电影爱好者",
      "开朗",
      "细心",
      "喜欢阅读",
      "爱运动",
      "认真生活",
    ],
    states: ["已通过", "待审核", "已通过"],
    secondary: "性格与兴趣",
  },
  tasks: {
    columns: ["任务名称", "任务类型", "最早天数", "状态", "更新时间", "操作"],
    names: [
      "分享今天的一件小事",
      "交换一首喜欢的歌",
      "聊聊最喜欢的校园角落",
      "一起完成一次散步",
      "分享一本书",
      "写下想对对方说的话",
    ],
    states: ["已启用", "已启用", "已停用"],
    secondary: "内容仅用于活动引导",
  },
  settings: {
    columns: ["名称 / 代码", "排序", "状态", "版本", "更新时间", "操作"],
    names: [
      "课程学习",
      "考试备考",
      "校园生活",
      "成长就业",
      "其他资料",
      "校园互助",
    ],
    states: ["已启用", "已启用", "已停用"],
    secondary: "可运营展示名称",
  },
  words: {
    columns: ["词库名称", "词条数", "状态", "生效版本", "更新时间", "操作"],
    names: [
      "校园内容规则词库",
      "通用风险提示词库",
      "匿名社区规则词库",
      "安全关怀提示词库",
      "公共内容规范词库",
      "校园名称词库",
    ],
    states: ["已发布", "草稿"],
    secondary: "词条与匹配规则",
  },
  safety: {
    columns: [
      "案件 / 内容",
      "案件类型",
      "处理状态",
      "关联版本",
      "更新时间",
      "操作",
    ],
    names: contentNames,
    states: ["待处理", "已确认", "已驳回"],
    secondary: "来自用户提交的内容反馈",
  },
  crisis: {
    columns: [
      "案件编号",
      "来源类型",
      "跟进状态",
      "当前待办",
      "更新时间",
      "操作",
    ],
    names: [
      "校园内容关怀案件",
      "树洞内容关怀案件",
      "关怀复核案件",
      "已投递关怀案件",
      "待跟进内容案件",
      "历史关怀案件",
    ],
    states: ["待接手", "跟进中", "已完成"],
    secondary: "仅展示岗位授权的案件信息",
  },
  accounts: {
    columns: ["后台账号", "岗位角色", "账号状态", "版本", "创建时间", "操作"],
    names: [
      "review_demo",
      "crisis_demo",
      "admin_demo",
      "review_backup",
      "review_two",
      "crisis_backup",
    ],
    states: ["正常"],
    secondary: "演示管理账号",
  },
};
function records(p = current()) {
  const f = rowFamilies[p.family] || rowFamilies.settings;
  const names =
    p.id === "identity" || p.id === "identity-history"
      ? [
          "同学甲 · DEMO1001",
          "同学乙 · DEMO1002",
          "同学丙 · DEMO1003",
          "同学丁 · DEMO1004",
          "同学戊 · DEMO1005",
          "同学己 · DEMO1006",
        ]
      : p.id === "report-types"
        ? ["骚扰与冒犯", "不实信息", "侵犯隐私", "其他问题"]
        : p.id === "dictionaries"
          ? ["大学城校区", "石牌校区", "本科", "研究生", "学习互助", "校园搭子"]
          : f.names;
  return [
    ...names.map((title, i) => ({
      id: `DEMO-${String(i + 1).padStart(4, "0")}`,
      title: app.edited[p.id + ":" + i]?.title || title,
      status:
        app.overrides[
          `${p.id.startsWith("identity") ? "identity" : p.id}:${i}`
        ] || f.states[i % f.states.length],
      index: i,
    })),
    ...(app.created[p.id] || []),
  ].filter(
    (r) =>
      !app.deleted.has(p.id + ":" + r.index) &&
      (p.id === "identity"
        ? r.status === "待审核"
        : p.id === "identity-history"
          ? r.status !== "待审核"
          : true),
  );
}
function filteredRows() {
  return records().filter(
    (r) =>
      (r.title + r.id).toLowerCase().includes(app.query.toLowerCase()) &&
      (app.status === "全部状态" || r.status === app.status),
  );
}
function cells(row) {
  const p = current(),
    i = row.index;
  const simple = ["settings", "tasks", "accounts"].includes(p.family);
  const title = `<button class="table-name" ${simple ? `data-row-edit="${i}"` : `data-detail="${i}"`}>${esc(row.title)}<small>${row.id} · ${p.id.startsWith("identity") ? "学生认证申请 · 材料 v3" : rowFamilies[p.family]?.secondary || "配置项"}</small></button>`;
  const date = `<span class="small muted">2026.11.${String(16 - i).padStart(2, "0")}<br>10:${String(28 + i).padStart(2, "0")}</span>`;
  const detailAction = `<button class="text-btn" data-detail="${i}">${p.id === "identity-history" ? "查看记录" : p.family === "review" || p.family === "safety" ? "查看处理" : p.family === "activities" ? "管理活动" : "查看详情"}</button>`;
  const togglable = ["settings", "tasks", "accounts", "traits"].includes(
    p.family,
  );
  const active =
    app.enabled[p.id + ":" + i] ??
    (p.family === "traits"
      ? i !== 4
      : !["已停用", "已禁用"].includes(row.status));
  const toggle = `<button class="row-switch" role="switch" aria-checked="${active}" aria-label="启用 ${esc(row.title)}" data-row-toggle="${i}"><span></span></button><span class="small muted">${active ? "启用" : "停用"}</span>`;
  const action = `<div class="row-actions">${simple ? `<button class="text-btn" data-row-edit="${i}">编辑</button>` : detailAction}${["resources", "content"].includes(p.family) ? `<button class="text-btn" data-row-state="${i}">${/下架/.test(row.status) ? "上架" : "下架"}</button>` : ""}${["settings", "tasks", "traits"].includes(p.family) ? `<button class="text-btn danger-text" data-row-delete="${i}">删除</button>` : ""}</div>`;
  switch (p.family) {
    case "users":
      return [
        title,
        badge(row.status),
        badge(i === 3 ? "限制中" : "正常"),
        date,
        action,
      ];
    case "review":
      return [
        title,
        p.id.startsWith("identity")
          ? "学生身份"
          : p.id === "whisper-reviews"
            ? "匿名树洞"
            : "心愿",
        badge(row.status),
        date,
        action,
      ];
    case "content":
      return [
        title,
        p.id === "wishes" ? "学习互助" : "匿名心事",
        badge(row.status),
        `<span class="small muted">${24 + i * 3} 支持 · ${6 + i} 评论<br>${128 + i * 8} 浏览</span>`,
        date,
        action,
      ];
    case "resources":
      return [
        title,
        ["课程学习", "校园生活", "考试备考", "成长就业"][i % 4],
        badge(row.status),
        `${18 + i} 有帮助 / ${i % 3} 待改进`,
        date,
        action,
      ];
    case "activities":
      return [
        title,
        badge(row.status),
        128 - i * 11,
        48 - i * 6,
        i === 0 ? "2026.11.17 22:00" : "2026.12.01 22:00",
        action,
      ];
    case "traits":
      return [
        title,
        i % 2 ? "理想型" : "个人特质",
        badge(row.status),
        `<div class="row">${toggle}</div>`,
        36 + i * 8,
        action,
      ];
    case "tasks":
      return [
        title,
        i % 2 ? "话题交流" : "日常分享",
        `第 ${taskInfo(row).minDay || 1} 天起`,
        `<div class="row">${toggle}</div>`,
        date,
        action,
      ];
    case "words":
      return [
        title,
        128 + i * 32,
        badge(row.status),
        `v${12 - i}`,
        date,
        action,
      ];
    case "safety":
      return [
        title,
        p.id === "appeals"
          ? "用户申诉"
          : p.id === "penalties"
            ? "已确认举报"
            : "内容举报",
        badge(row.status),
        "正文 v3 / 案件 v2",
        date,
        action,
      ];
    case "crisis":
      return [
        title,
        i % 2 ? "匿名树洞" : "校园心愿",
        badge(row.status),
        i % 2 ? "核实投递结果" : "人工关怀复核",
        date,
        action,
      ];
    case "accounts":
      return [
        title,
        ["审核岗位", "危机岗位", "超级管理员"][i % 3],
        `<div class="row">${toggle}</div>`,
        "v2",
        date,
        action,
      ];
    default:
      return [
        title,
        i * 10,
        togglable ? `<div class="row">${toggle}</div>` : badge(row.status),
        "v3",
        date,
        action,
      ];
  }
}
function tableMarkup(rows = filteredRows(), compact = false) {
  const p = current();
  const columns =
    p.id === "identity-history"
      ? ["申请人 / 编号", "认证类型", "审核结果", "审核时间", "操作"]
      : p.id === "identity"
        ? ["申请人 / 编号", "认证类型", "审核状态", "提交时间", "操作"]
        : rowFamilies[p.family]?.columns || rowFamilies.settings.columns;
  const total = rows.length;
  const pageRows = compact
    ? rows
    : rows.slice((app.pageNumber - 1) * 5, app.pageNumber * 5);
  return `<div class="table-summary"><span>共 <strong>${total}</strong> 条记录${app.query ? " · 已应用查询条件" : ""}</span><span>数据时间 · 2026.11.16 10:30</span></div><div class="table-scroll"><table class="data-table"><thead><tr>${columns.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>${
    pageRows.length
      ? pageRows
          .map(
            (row) =>
              `<tr>${cells(row)
                .map((c) => `<td>${c}</td>`)
                .join("")}</tr>`,
          )
          .join("")
      : `<tr><td colspan="${columns.length}" class="table-empty">没有符合条件的记录。<button class="text-btn" data-action="clear-filter">清空筛选</button></td></tr>`
  }</tbody></table></div>${!compact ? `<div class="table-footer"><span>每页 5 条 · 当前第 ${app.pageNumber} 页</span><div class="pagination"><button data-action="prev-page" aria-label="上一页" ${app.pageNumber === 1 ? "disabled" : ""}>‹</button>${Array.from({ length: Math.max(1, Math.ceil(total / 5)) }, (_, i) => `<button class="${app.pageNumber === i + 1 ? "active" : ""}" data-page="${i + 1}" aria-label="第 ${i + 1} 页">${i + 1}</button>`).join("")}<button data-action="next-page" aria-label="下一页" ${app.pageNumber * 5 >= total ? "disabled" : ""}>›</button></div></div>` : ""}`;
}
function listPage() {
  const p = current();
  const descriptions = {
    users: "查看校园用户、认证与账号限制情况。",
    review: "先读完整上下文，再给出有依据的审核结论。",
    content: "查看公开内容与互动情况，让善意的流动清晰可见。",
    resources: "统一维护共享资料，清楚管理每一次上架与更新。",
    activities: "从活动设置到配对公布，按阶段有序推进。",
    traits: "区分词条审核与启用状态，保留选用数据。",
    tasks: "维护用于活动引导的每日任务与最早可用天数。",
    settings: "维护可运营的显示名称、顺序与启停状态。",
    words: "管理匹配规则、草稿与生效版本。",
    safety: "结合案件依据处理举报、处罚与申诉。",
    crisis: "聚焦当前待办，记录每一次关怀与跟进。",
    accounts: "为不同岗位配置必要权限。",
  };
  let action = [
    "resources",
    "activities",
    "traits",
    "tasks",
    "settings",
    "accounts",
  ].includes(p.family)
    ? '<button class="btn primary" data-action="create">＋ ' +
      (p.family === "activities"
        ? "新建活动"
        : p.family === "accounts"
          ? "新增账号"
          : "新增" +
            (p.family === "resources"
              ? "资料"
              : p.family === "traits"
                ? "词条"
                : "条目")) +
      "</button>"
    : "";
  if (p.family === "words") action = navButton("wordlists", "返回词库", "btn");
  if (p.id === "identity")
    action = navButton("identity-history", "查看身份审核历史", "btn");
  if (p.id === "identity-history")
    action = navButton("identity", "返回待审核申请", "btn");
  let intro = "";
  if (p.id === "traits")
    intro = `<div class="between" style="margin-bottom:20px"><span class="small muted">审核结论与启用状态分别管理。</span><div class="segmented"><button class="${!app.cloud ? "active" : ""}" data-view="table">列表</button><button class="${app.cloud ? "active" : ""}" data-view="cloud">词云</button></div></div>`;
  if (p.id === "whispers")
    intro =
      '<div class="inline-note">公开内容视图不提供匿名作者身份反查。</div>';
  if (p.id === "penalties")
    intro =
      '<div class="inline-note">本页从已确认举报进入处罚流程；完整处罚历史请到平台用户详情查看。</div>';
  if (p.family === "words")
    intro = `<div class="tabs">${[
      ["wordlists", "全部词库"],
      ["builtin", "内置词库"],
      ["word-history", "发布记录"],
    ]
      .map(
        ([id, t]) =>
          `<button class="${p.id === id ? "active" : ""}" data-go="${id}">${t}</button>`,
      )
      .join("")}</div>`;
  const states = [...new Set(records().map((x) => x.status))];
  return (
    heading(
      p.title,
      p.id === "identity"
        ? "仅展示待处理的学生认证申请，审核完成后移入历史记录。"
        : p.id === "identity-history"
          ? "查看已完成的认证结果与审核依据，历史记录只读。"
          : descriptions[p.family] || "管理当前配置与版本。",
      action,
    ) +
    intro +
    `<section class="table-panel"><form class="filter-bar" data-filter><label class="search-field">关键词<input name="query" placeholder="输入名称、标题或编号" value="${esc(app.query)}"></label><label>状态<select name="status">${["全部状态", ...states].map((s) => `<option ${app.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label><button class="btn primary">查询</button><button type="button" class="btn" data-action="clear-filter">重置</button></form>${
      p.id === "traits" && app.cloud
        ? `<div class="cloud">${filteredRows()
            .map(
              (r, i) =>
                `<button style="--word-size:${16 + (i % 4) * 7}px" data-detail="${r.index}">${esc(r.title)}</button>`,
            )
            .join("")}</div>`
        : tableMarkup()
    }</section>`
  );
}
const metrics = [
  ["注册用户", "2,486", "user", "累计注册"],
  ["认证用户", "2,102", "shield", "已通过学生认证"],
  ["近一月新增", "128", "plus", "最近一月新增用户"],
  ["共享资料", "86", "book", "资料累计数"],
  ["心愿数目", "736", "fish", "累计发布"],
  ["达成愿望", "428", "heart", "让善意有回响"],
];
function chart() {
  const year = app.range === "year";
  const line = year
    ? "45,190 90,170 135,180 180,145 225,150 270,115 315,125 360,78 405,90 450,55 495,65 540,32"
    : "45,190 90,186 135,160 180,167 225,130 270,142 315,105 360,120 405,87 450,95 495,53 540,42";
  return `<svg class="chart" viewBox="0 0 580 250" role="img" aria-label="${year ? "最近一年" : "最近一月"}用户与认证用户增长示意，合成数据"><title>用户总量趋势 · 合成数据</title>${[45, 95, 145, 195].map((y, i) => `<line class="chart-grid" x1="40" y1="${y}" x2="550" y2="${y}"/><text x="3" y="${y + 4}">${3000 - i * 800}</text>`).join("")}<polygon class="chart-area" points="45,210 ${line} 540,210"/><polyline class="chart-line" points="${line}"/><polyline points="45,202 90,198 135,185 180,184 225,165 270,168 315,147 360,151 405,127 450,120 495,100 540,80" fill="none" stroke="var(--teal)" stroke-width="2" stroke-dasharray="5 4"/>${[45, 145, 245, 345, 445, 540].map((x, i) => `<text x="${x}" y="237" text-anchor="middle">${year ? ["1月", "3月", "5月", "7月", "9月", "11月"][i] : ["10.17", "10.23", "10.29", "11.04", "11.10", "11.16"][i]}</text>`).join("")}</svg>`;
}
function dashboard() {
  return (
    heading(
      "把善意，照顾得更好。",
      "你好，校园运营。这里是今天的校园概况。",
      `<span class="small muted">2026年11月16日 · 星期一</span><button class="btn" data-action="refresh">${icon("clock")} 刷新数据</button>`,
    ) +
    `<section class="metric-grid">${metrics.map(([t, n, ic, s]) => `<article class="metric"><span class="metric-icon">${icon(ic)}</span><h2>${t}</h2><b>${n}</b><p>${s}</p></article>`).join("")}</section><div class="dashboard-main"><section class="panel"><div class="panel-title"><div><h2>用户增长趋势</h2><p>期末累计用户数 · 北京时间</p></div><div class="segmented"><button class="${app.range === "month" ? "active" : ""}" data-range="month">最近一月</button><button class="${app.range === "year" ? "active" : ""}" data-range="year">最近一年</button></div></div>${chart()}<div class="chart-key"><span>注册用户</span><span>认证用户</span></div><details style="margin-top:16px"><summary class="small muted">查看图表数据说明</summary><p class="small muted">趋势为合成示例。开发时沿用 dashboard 的 period 与 timezone；注册、认证、资料、心愿和达成数使用期末累计值，新增用户按期统计。</p></details></section><section class="panel work-panel"><div class="panel-title"><div><h2>常用工作入口</h2><p>有序处理每一次期待</p></div>${icon("check")}</div>${[
      ["identity", "学生身份审核", "核对材料，守护校园身份", "shield"],
      ["moderation", "校园内容审核", "结合原文与规则给出结论", "check"],
      ["matchmaking", "包分配活动", "报名、配对与结果公布", "heart"],
      ["resources", "共享资料管理", "维护资料与可用状态", "book"],
    ]
      .filter(([id]) => allowed(adminPages.find((p) => p.id === id)))
      .map(
        ([id, t, s, ic]) =>
          `<button class="work-shortcut" data-go="${id}"><span class="shortcut-icon">${icon(ic)}</span><div><strong>${t}</strong><p>${s}</p></div><span>↗</span></button>`,
      )
      .join("")}</section></div><div class="dashboard-bottom">${[
      ["心愿热点", "wishes", "许愿有人应"],
      ["悄悄话热点", "whispers", "心事有人听"],
    ]
      .map(
        ([t, id, sub]) =>
          `<section class="panel"><div class="panel-title"><div><h2>${t} <span class="tag neutral">TOP 10</span></h2><p>${sub}</p></div>${allowed(adminPages.find((p) => p.id === id)) ? navButton(id, "查看全部 ↗") : ""}</div>${contentNames
            .slice(id === "wishes" ? 0 : 3, id === "wishes" ? 4 : 7)
            .map(
              (name, i) =>
                `<button class="hot-row" data-hot="${id}" data-row="${i}"><span class="hot-rank">0${i + 1}</span><div>${name}<p>${24 - i * 3} 支持 · ${6 + i} 条评论</p></div><span class="heat">${128 - i * 17}</span></button>`,
            )
            .join("")}</section>`,
      )
      .join("")}</div>`
  );
}
const activityDates = [
  ["registration_opens_at", "开始报名"],
  ["registration_closes_at", "截止报名"],
  ["results_at", "最早发布结果"],
  ["starts_at", "首日任务开始"],
  ["ends_at", "活动结束"],
];
function activityFields(values = app.activity) {
  return `<label class="field">活动天数<input name="days" type="number" min="1" max="30" value="${esc(values.days || 7)}" required></label><div class="notice" style="margin-bottom:20px">所有时间均为北京时间，可逐项自定义。最早发布结果时间不代表已发布配对结果。</div><div class="two-col">${activityDates.map(([key, label]) => `<label class="field">${label}（北京时间）<input type="datetime-local" name="${key}" value="${esc(values[key] || "")}" required></label>`).join("")}</div>`;
}
function activityError(values) {
  const dates = activityDates.map(([key]) => values[key]);
  if (dates.some((d) => !d)) return "请填写全部五个活动时间";
  if (!(
    dates[0] < dates[1] &&
    dates[1] <= dates[2] &&
    dates[2] <= dates[3] &&
    dates[3] < dates[4]
  ))
    return "请按开始报名 < 截止报名 ≤ 最早发布结果 ≤ 首日任务开始 < 活动结束设置时间";
  return "";
}
function taskInfo(row) {
  const edit = app.edited["tasks:" + row.index] || {};
  return {
    ...row,
    body: edit.description || row.title,
    minDay: Number(edit.minDay ?? (row.index < 2 ? 1 : row.index + 1)),
    enabled: app.enabled["tasks:" + row.index] ?? row.status !== "已停用",
  };
}
function taskLibrary() {
  return records(adminPages.find((p) => p.id === "tasks")).map(taskInfo);
}
function chooseTask() {
  openDrawer(
    "从任务库选择首日任务",
    `<div class="notice">仅可选择已启用、且第 1 天可用的任务。任务正文统一在任务库维护。</div><div class="task-options">${taskLibrary()
      .map(
        (t) =>
          `<label class="task-option ${!t.enabled || t.minDay > 1 ? "unavailable" : ""}"><input type="radio" name="library-task" value="${t.index}" ${app.firstTask === t.index ? "checked" : ""} ${!t.enabled || t.minDay > 1 ? "disabled" : ""}><span><strong>${esc(t.title)}</strong><small>${t.enabled ? "已启用" : "已停用"} · 第 ${t.minDay || 1} 天起${t.minDay > 1 ? " · 首日不可选" : ""}</small></span></label>`,
      )
      .join("")}</div><p class="form-error" id="task-error"></p>`,
    '<button class="btn primary" data-action="choose-task-save">确认选择</button>',
  );
}
function activityDetail() {
  return (
    heading(
      app.activity.title,
      "独立活动工作区，保留列表的筛选与翻页状态。",
      `<button class="btn" data-action="back-list">← 返回活动列表</button><button class="btn primary" data-action="activity-save">保存活动</button>`,
    ) +
    `<section class="detail-banner"><div class="between"><span class="tag">报名中</span><span class="mono">ACT-DEMO-001</span></div><h2>从一句你好，开始一段相遇。</h2><p>${esc(app.activity.starts_at.replace("T", " "))} — ${esc(app.activity.ends_at.replace("T", " "))} · 双方自愿参与</p><div class="detail-facts"><span>报名人数<strong>128</strong></span><span>已审核<strong>112</strong></span><span>配对数量<strong>${app.pairStep >= 2 ? "56" : "48"}</strong></span><span>活动天数<strong>${esc(app.activity.days)}</strong></span></div></section><div class="tabs">${["活动设置", "报名审核", "配对结果", "每日任务"].map((t) => `<button class="${app.activityTab === t ? "active" : ""}" data-activity-tab="${t}">${t}</button>`).join("")}</div>${activityTab()}`
  );
}
function activityTab() {
  if (app.activityTab === "活动设置")
    return `<div class="detail-layout"><form class="panel editor-panel" data-editor data-activity-settings><h3 style="margin-bottom:24px">基本设置</h3><label class="field">活动名称<input name="title" value="${esc(app.activity.title)}" required></label><label class="field">活动说明<textarea name="description" required>${esc(app.activity.description)}</textarea></label>${activityFields()}<p class="form-error" id="activity-error" role="alert"></p><button class="btn primary">保存设置</button></form><section class="panel"><h3 style="font-size:14px;margin-bottom:25px">已保存的时间安排</h3><div class="timeline">${activityDates.map(([key, label]) => `<article>${label}<small>${esc(app.activity[key].replace("T", " "))}</small></article>`).join("")}</div></section></div>`;
  if (app.activityTab === "报名审核")
    return `<div class="table-panel"><div class="table-summary">报名名单 · 待审 16 人</div><div class="table-scroll"><table class="data-table"><thead><tr><th>报名人</th><th>资料状态</th><th>报名时间</th><th>操作</th></tr></thead><tbody>${["小满", "橙子", "秋日的风"].map((n, i) => `<tr><td>${n}<small class="muted"> · DEMO-${i + 1}</small></td><td>${badge(app.overrides["signup:" + i] || "待审核")}</td><td>2026.11.16 10:28</td><td><button class="text-btn" data-signup="${i}">查看报名资料</button></td></tr>`).join("")}</tbody></table></div></div>`;
  if (app.activityTab === "每日任务") {
    const first = taskLibrary().find((t) => t.index === app.firstTask);
    return `<section class="panel"><div class="panel-title"><div><h2>每日任务设置</h2><p>从任务库选择固定首日任务，任务内容统一维护。</p></div>${navButton("tasks", "管理任务库 ↗")}</div><div class="task-plan"><span class="tag">DAY 1 · 固定任务</span><h3>${esc(first?.title || "尚未选择任务")}</h3><p>${esc(first?.body || "从已启用且首日可用的任务中选择一项。")}</p>${first && (!first.enabled || first.minDay > 1) ? '<p class="form-error">当前任务已不可用，请重新选择。</p>' : ""}<button class="btn primary" data-action="choose-task">${first ? "更换首日任务" : "从任务库选择"}</button></div><div class="notice" style="margin-top:20px"><strong>第 2 天起 · 按任务库规则分配</strong><p>从当日已启用且满足最早天数的任务中无放回抽取；不重复固定首日任务。任务不足时应先补充任务库。</p></div></section>`;
  }
  return `<section class="panel"><div class="panel-title"><div><h2>配对方案与发布</h2><p>按阶段核对，应用草稿后再发布结果。</p></div><span class="tag ${app.pairStep === 3 ? "" : "warning"}">${["尚未生成", "方案已生成", "草稿已应用", "结果已发布"][app.pairStep]}</span></div><div class="workflow-steps">${["生成方案", "核对方案", "应用草稿", "发布结果"].map((s, i) => `<span class="${i <= app.pairStep ? "active" : ""}">${i + 1} · ${s}</span>`).join("")}</div>${app.pairStep ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>配对对象 A</th><th>配对对象 B</th><th>推荐分</th><th>状态</th></tr></thead><tbody><tr><td>小满</td><td>秋日的风</td><td>86</td><td>${badge(app.pairStep === 3 ? "已发布" : "待核对")}</td></tr><tr><td>橙子</td><td>山间来信</td><td>82</td><td>${badge(app.pairStep === 3 ? "已发布" : "待核对")}</td></tr></tbody></table></div><div class="notice" style="margin:20px 0">推荐分用于辅助核对，不代表匹配概率。结果未发布前，小程序仍显示等待公布。</div>` : '<div class="empty"><h3>先生成一份配对方案</h3><p>方案生成后可以核对对象，再应用到草稿。</p></div>'}<button class="btn primary" data-action="pair-next" ${app.pairStep === 3 ? "disabled" : ""}>${["生成自动配对方案", "核对并应用草稿", "发布配对结果", "已完成发布"][app.pairStep]}</button></section>`;
}
const wordLibraries = [
  ["school", "学校词库", "校园名称与学校规则"],
  ["ordinary_violation", "普通违规词库", "公共内容规范"],
  ["crisis", "危机词库", "关怀识别与提示"],
];
function wordKey() {
  return app.page === "builtin" ? "builtin" : app.wordLibrary;
}
function wordEntries() {
  const key = wordKey();
  return (app.wordEntries[key] ??= (
    key === "school"
      ? ["演示大学", "校园名称", "示例校区"]
      : key === "crisis"
        ? ["关怀示例词", "支持提示", "援助示例"]
        : ["演示词条", "示例提示", "规则样例"]
  ).map((text, i) => ({ text, enabled: i !== 2 })));
}
function editWord(index) {
  if (!app.wordEditing) return;
  const key = wordKey(),
    entry = wordEntries()[index];
  showDialog(
    entry ? "编辑词条" : "新增词条",
    `<form id="word-entry-form"><label class="field">词条内容<input id="word-text" value="${esc(entry?.text || "")}" maxlength="1000" required></label><p class="form-error" id="word-error"></p></form>`,
    () => {
      const f = byId("word-entry-form");
      if (!f.reportValidity()) return false;
      const value = byId("word-text").value.trim();
      if (
        !value ||
        app.wordEntries[key].some((e, i) => i !== index && e.text === value)
      ) {
        byId("word-error").textContent = "请填写不重复的词条";
        return false;
      }
      if (entry) entry.text = value;
      else app.wordEntries[key].push({ text: value, enabled: true });
      app.wordDirty[key] = true;
      render();
    },
    "加入草稿",
  );
}
function beginWordEdit() {
  app.wordEditSnapshot = {
    key: wordKey(),
    entries: wordEntries().map((entry) => ({ ...entry })),
    dirty: !!app.wordDirty[wordKey()],
  };
  app.wordEditing = true;
  render();
}
function leaveWordEdit(after = () => render()) {
  if (!app.wordEditing) {
    after();
    return;
  }
  const snapshot = app.wordEditSnapshot;
  const finish = () => {
    if (snapshot) {
      app.wordEntries[snapshot.key] = snapshot.entries;
      app.wordDirty[snapshot.key] = snapshot.dirty;
    }
    app.wordEditing = false;
    app.wordEditSnapshot = null;
    after();
  };
  if (
    snapshot &&
    JSON.stringify(app.wordEntries[snapshot.key]) !==
      JSON.stringify(snapshot.entries)
  ) {
    showDialog(
      "放弃未保存的词单修改？",
      "<p>当前编辑尚未保存。继续编辑可保留修改，放弃后恢复进入编辑前的词单。</p>",
      finish,
      "放弃修改",
    );
    document.querySelector("dialog:not(#drawer) [data-close]").textContent =
      "继续编辑";
  } else finish();
}
function wordsPage() {
  const builtin = app.page === "builtin",
    key = wordKey(),
    entries = wordEntries(),
    editing = app.wordEditing;
  const name = builtin
    ? "内置词库"
    : wordLibraries.find((l) => l[0] === key)[1];
  return (
    heading(
      current().title,
      "先选择词库查看词单，点击编辑后维护词条；保存草稿后再发布。",
      navButton("word-history", "发布记录", "btn"),
    ) +
    `<div class="word-workspace"><aside class="panel word-choices"><h2>选择词库</h2>${wordLibraries.map(([id, label, description]) => `<button class="word-library ${!builtin && key === id ? "active" : ""}" data-word-library="${id}" aria-pressed="${!builtin && key === id}"><strong>${label}</strong><span>${description}</span><small>生效 v${app.wordVersions[id] || 12}${app.wordDirty[id] ? " · 未保存修改" : app.wordDrafts[id] ? " · 有待发布草稿" : ""}</small></button>`).join("")}<div class="divider"></div>${navButton("builtin", "内置词库 ↗", "btn full")}</aside><section class="panel word-detail"><div class="panel-title"><div><h2>${name}</h2><p>生效版本 v${app.wordVersions[key] || 12} · ${entries.length} 个词条</p></div><span class="tag ${editing ? "warning" : ""}">${editing ? "正在编辑" : app.wordDirty[key] ? "未保存修改" : app.wordDrafts[key] ? "草稿待发布" : "当前生效版"}</span></div><form class="filter-bar" data-word-search><label class="search-field">搜索词条<input name="query" value="${esc(app.wordQuery)}" placeholder="输入词条关键词"></label><button class="btn">搜索</button></form><div class="word-toolbar">${editing ? `${!builtin ? '<button class="btn" data-action="word-add">＋ 新增词条</button>' : '<span class="small muted">内置词条原文只读，可调整启用状态。</span>'}<button class="btn primary" data-action="word-save" ${app.wordDirty[key] ? "" : "disabled"}>保存草稿</button><button class="btn" data-action="word-cancel-edit">取消编辑</button>` : `<button class="btn primary" data-action="word-start-edit">编辑词单</button>${app.wordDrafts[key] ? '<button class="btn" data-action="word-publish">发布草稿</button>' : '<span class="small muted">选择词库后，在这里编辑当前词单。</span>'}`}</div><div class="table-scroll"><table class="data-table"><thead><tr><th>词条</th><th>状态</th>${editing && !builtin ? "<th>操作</th>" : ""}</tr></thead><tbody>${
      entries
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => entry.text.includes(app.wordQuery))
        .map(
          ({ entry, index }) =>
            `<tr><td><strong>${esc(entry.text)}</strong></td><td>${editing ? `<div class="row"><button class="row-switch" role="switch" aria-label="启用 ${esc(entry.text)}" aria-checked="${entry.enabled}" data-word-toggle="${index}"><span></span></button><span>${entry.enabled ? "启用" : "停用"}</span></div>` : badge(entry.enabled ? "已启用" : "已停用")}</td>${editing && !builtin ? `<td><div class="row-actions"><button class="text-btn" data-word-edit="${index}">编辑</button><button class="text-btn danger-text" data-word-delete="${index}">删除</button></div></td>` : ""}</tr>`,
        )
        .join("") ||
      `<tr><td colspan="${editing && !builtin ? 3 : 2}" class="table-empty">没有匹配词条</td></tr>`
    }</tbody></table></div></section></div>`
  );
}
const guideDefaults = {
  心愿池: {
    title: "把小小心愿，交给大大的善意",
    body: "在这里写下你的心愿，也可以回应别人的期待。\n\n发布心愿\n写清希望得到的帮助、时间与地点。审核通过后，心愿会出现在心愿池。\n\n回应善意\n找到感兴趣的心愿后，填写应愿留言，等待对方接受，再开启交流。\n\n保护彼此\n请尊重彼此，避免公开联系方式和其他个人信息。",
  },
  悄悄话: {
    title: "有些话，轻轻说就好",
    body: "使用独立的匿名昵称分享心事，也可以用暖评回应他人。\n\n保持善意\n尊重每个人的感受，遇到不适内容可以举报。",
  },
  包分配: {
    title: "给相遇留一个机会",
    body: "完善交友资料后报名活动。审核通过后等待配对结果公布。\n\n每日任务\n活动开始后查看当日任务，彼此自愿参与，慢慢认识。",
  },
  资料广场: {
    title: "让经验与知识流动起来",
    body: "按分类或关键词寻找需要的资料。\n\n分享反馈\n使用后可以反馈是否有帮助，帮助更多同学发现优质内容。",
  },
};
function guideValue(module = app.guideModule) {
  return app.guidePublished[module] || { ...guideDefaults[module], version: 3 };
}
function guidePage() {
  const published = guideValue(),
    draft = app.guideDrafts[app.guideModule] || published;
  const modules = [
    ["心愿池", "fish", "心愿与善意"],
    ["悄悄话", "chat", "匿名心事与回响"],
    ["包分配", "heart", "活动与每日任务"],
    ["资料广场", "book", "资料与共享"],
  ];
  const selector = `<div class="guide-modules" role="group" aria-label="切换说明模块">${modules.map(([name, ic, description]) => `<button class="guide-module ${app.guideModule === name ? "active" : ""}" data-guide-module="${name}" aria-pressed="${app.guideModule === name}"><span class="guide-module-icon">${icon(ic)}</span><span class="guide-module-copy"><strong>${name}</strong><small>${description}</small></span><span class="guide-module-check">${app.guideModule === name ? "✓" : ""}</span></button>`).join("")}</div>`;
  if (app.guideEditing)
    return (
      heading(
        "编辑模块使用说明",
        "保存草稿供继续修改，发布后更新当前可读版本。",
        '<button class="btn" data-action="guide-cancel">← 返回当前版本</button>',
      ) +
      selector +
      `<form class="panel editor-panel guide-editor" data-guide-editor><span class="tag warning">${app.guideModule} · 编辑草稿</span><label class="field">标题<input name="title" value="${esc(draft.title)}" required></label><label class="field">说明正文<textarea name="body" rows="14" required>${esc(draft.body)}</textarea></label><div class="row"><button class="btn">保存草稿</button><button class="btn primary" type="button" data-action="guide-publish">核对并发布</button></div></form>`
    );
  return (
    heading(
      "模块使用说明",
      "当前已发布、可供用户阅读的版本。",
      '<button class="btn primary" data-action="guide-edit">编辑说明</button>',
    ) +
    selector +
    `<article class="panel guide-reading"><div class="between"><span class="tag">当前可读版本 · v${published.version}</span><span class="small muted">${app.guideModule}${app.guideDrafts[app.guideModule] ? " · 已保留编辑草稿" : ""}</span></div><h2>${esc(published.title)}</h2>${published.body
      .split(/\n\n/)
      .map((text) => `<p>${esc(text).replaceAll("\n", "<br>")}</p>`)
      .join("")}</article>`
  );
}

function queryPage() {
  const p = current();
  return (
    heading(p.title, "按精确编号读取授权范围，保留处理回执。") +
    `<section class="panel query-panel"><h2>${p.id === "receipts" ? "查询处理进度" : "读取证据元信息"}</h2><p>${p.id === "receipts" ? "使用任务编号或用户主动提供的回执号查询。" : "仅在授权范围内展示元信息，删除前核对案件状态和范围。"}</p><form class="filter-bar" data-query style="padding:0;border:0"><label class="search-field">${p.id === "receipts" ? "任务 / 回执编号" : "证据编号"}<input name="id" placeholder="例如 DEMO-0001" required></label><button class="btn primary">查询</button><button type="button" class="btn" data-action="clear-query">清空</button></form>${app.queryResult ? `<div class="query-result"><div class="notice">已找到本地示例记录 · ${esc(app.queryId)}</div><dl class="definition-grid"><div><dt>当前状态</dt><dd>${p.id === "receipts" ? "处理完成" : "可核对范围"}</dd></div><div><dt>版本</dt><dd>v2</dd></div><div><dt>关联案件</dt><dd>DEMO-CASE-001</dd></div><div><dt>数据范围</dt><dd>指定证据快照与关联附件</dd></div></dl>${p.id !== "receipts" ? '<label class="field">处理理由<textarea id="deletion-reason" placeholder="说明删除依据与处理理由"></textarea></label><button class="btn danger" data-action="delete-evidence">核对范围并申请删除</button>' : '<div class="notice">演示回执已完成，可关闭或继续查询。</div>'}</div>` : ""}</section>`
  );
}
function loginPage() {
  return `<section class="login-layout"><div class="login-poster"><span class="brand-mark">鲤</span><div><h2>照顾每一份期待，<br>守护每一次相遇。</h2><p style="margin-top:24px">鲤源池 · 校园运营管理平台</p></div><span class="small muted">LI YUAN CHI / ADMINISTRATION</span></div><form class="login-form" data-login><h1>欢迎回来</h1><p>登录工作台，开始今天的校园运营。</p><label class="field">账号<input name="account" placeholder="请输入演示账号" required autocomplete="off"></label><label class="field">口令<input name="password" type="password" placeholder="仅使用演示值" required autocomplete="off"></label><button class="btn primary">登录工作台</button><p class="small muted" style="margin-top:20px">本地原型，无需真实账号或口令。</p></form></section>`;
}
function passwordPage() {
  return (
    heading("本人改密", "更新口令后，实际应用需要重新登录。") +
    `<form class="panel editor-panel" data-password><div class="inline-note">原型仅演示字段与校验，请使用任意演示值。</div><label class="field">当前口令<input name="old" type="password" required autocomplete="off"></label><label class="field">新口令<input name="new" type="password" minlength="8" required autocomplete="off"></label><label class="field">确认新口令<input name="repeat" type="password" minlength="8" required autocomplete="off"></label><p class="form-error" id="password-error"></p><button class="btn primary">确认修改</button></form>`
  );
}
function renderNav() {
  const children = {
    wordlists: ["builtin", "word-history"],
  };
  const groups = [
    ...new Set(
      adminPages.filter((p) => p.group !== "公共页面").map((p) => p.group),
    ),
    "状态参考",
  ];
  byId("navigation").innerHTML = groups
    .map((g, i) => {
      const ps = adminPages.filter(
        (p) =>
          (g === "状态参考"
            ? ["forbidden", "not-found"].includes(p.id)
            : p.group === g && !subPages.has(p.id)) && allowed(p),
      );
      if (!ps.length) return "";
      const expanded = g === "总览" || app.expanded.has(g);
      return `<section class="nav-section">${g === "总览" ? "" : `<button class="nav-group-toggle" data-nav-group="${g}" aria-expanded="${expanded}" aria-controls="nav-group-${i}"><span>${g}</span><span class="nav-chevron">${expanded ? "⌄" : "›"}</span></button>`}<div id="nav-group-${i}" ${expanded ? "" : "hidden"}>${ps
        .map((p) => {
          const active =
            app.page === p.id || children[p.id]?.includes(app.page);
          const open = app.expandedLeaves.has(p.id);
          return `<div class="nav-parent"><button class="nav-item ${active ? "active" : ""}" data-go="${p.id}">${icon(p.ic)}<span>${p.title}</span>${p.id === "moderation" ? '<span class="nav-count">12</span>' : ""}</button>${children[p.id] ? `<button class="nav-leaf-toggle" data-nav-leaf="${p.id}" aria-label="${open ? "收起" : "展开"}${p.title}子菜单" aria-expanded="${open}" aria-controls="nav-leaf-${p.id}">${open ? "⌄" : "›"}</button>` : ""}</div>${children[p.id] ? `<div class="subnav" id="nav-leaf-${p.id}" ${open ? "" : "hidden"}>${children[p.id].map((id) => navButton(id, adminPages.find((p) => p.id === id).title, `nav-item ${app.page === id ? "active" : ""}`)).join("")}</div>` : ""}`;
        })
        .join("")}</div></section>`;
    })
    .join("");
}

function render() {
  const p = current();
  renderNav();
  byId("breadcrumb").textContent =
    `${p.group} / ${p.title}${app.detail ? " / 活动详情" : ""}`;
  byId("account-role").textContent = {
    super: "超级管理员",
    review: "审核岗位",
    crisis: "危机岗位",
  }[app.role];
  byId("route-note").textContent = p.route;
  byId("page-state").value = app.state;
  let html = "";
  if (!allowed(p) || app.state === "restricted" || p.family === "forbidden")
    html =
      heading("当前账号没有访问权限", "请返回已授权的工作入口。") +
      stateMarkup("restricted");
  else if (app.state !== "default")
    html = heading(p.title, "当前展示页面状态样例。") + stateMarkup(app.state);
  else if (p.family === "dashboard") html = dashboard();
  else if (p.family === "login") html = loginPage();
  else if (p.family === "password") html = passwordPage();
  else if (p.family === "not-found")
    html =
      heading("这个页面暂时找不到了", "入口可能已经更新，请返回工作台继续。") +
      navButton("dashboard", "返回工作台", "btn primary");
  else if (p.family === "words" && p.id !== "word-history") html = wordsPage();
  else if (p.id === "guide") html = guidePage();
  else if (p.family === "query") html = queryPage();
  else if (p.family === "activities" && app.detail) html = activityDetail();
  else html = listPage();
  byId("content").innerHTML =
    (app.pending
      ? `<div class="pending-command" role="status"><strong>${app.pending.type === "unknown" ? "操作结果尚未确认" : "读取版本发生变化"}</strong><p>${app.pending.type === "unknown" ? "保留原请求与内容，核实后再继续。" : "请重新读取并核对内容，避免覆盖最新修改。"}</p><span class="mono">${app.pending.key}</span><button data-action="retry-command">${app.pending.type === "unknown" ? "核实原请求结果" : "读取最新版本并重新核对"}</button></div>`
      : "") + html;
  const form = byId("content").querySelector("[data-editor]");
  const draft = app.drafts["editor:" + app.page + ":" + app.activityTab];
  if (form && draft)
    Object.entries(draft).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (field) field.value = value;
    });
  document.title = `${p.title} · 管理端原型`;
}
function decisionBlock(row) {
  return `<section class="decision-form"><h3>处理意见</h3><div class="decision-options"><label><input type="radio" name="decision" value="已通过" checked>通过 / 确认</label><label><input type="radio" name="decision" value="已驳回">驳回</label></div><label class="field">审核理由<textarea id="decision-reason" placeholder="说明判断依据；驳回时必填" maxlength="500">${esc(app.drafts[app.page + row.index]?.reason || "")}</textarea></label><label class="field">修改建议<textarea id="decision-suggestion" placeholder="给对方明确、可操作的修改建议" maxlength="500">${esc(app.drafts[app.page + row.index]?.suggestion || "")}</textarea></label><p class="form-error" id="decision-error" role="alert"></p></section>`;
}
let drawerTrigger = null;
let drawerSnapshot = "";
function drawerValues() {
  return JSON.stringify(
    [...byId("drawer").querySelectorAll("input,select,textarea")].map((el) => [
      el.name || el.id,
      el.type === "checkbox" || el.type === "radio" ? el.checked : el.value,
    ]),
  );
}
function openDrawer(title, body, footer) {
  drawerTrigger = document.activeElement;
  const drawer = byId("drawer");
  drawer.innerHTML = `<header class="drawer-head"><div><span class="eyebrow">DETAIL / WORKSPACE</span><h2 id="drawer-title">${esc(title)}</h2></div><button class="icon-btn" data-action="close-drawer" aria-label="关闭详情">×</button></header><div class="drawer-body">${body}</div><footer class="drawer-foot"><button class="btn" data-action="close-drawer">关闭</button>${footer || ""}</footer>`;
  drawerSnapshot = drawerValues();
  drawer.showModal();
}
function closeDrawer(force = false, after) {
  const drawer = byId("drawer");
  if (!force && drawer.open && drawerValues() !== drawerSnapshot) {
    showDialog(
      "放弃未保存的修改？",
      "<p>抽屉内的修改尚未保存。继续编辑可保留当前输入；放弃后将关闭抽屉。</p>",
      () => closeDrawer(true, after),
      "放弃修改并关闭",
    );
    document.querySelector("dialog:not(#drawer) [data-close]").textContent =
      "继续编辑";
    return false;
  }
  drawer.close();
  drawerTrigger?.focus();
  after?.();
  return true;
}

function detail(index) {
  if (current().family === "activities") {
    app.activityIndex = index;
    app.activity = app.activityRecords[index] || {
      ...app.activity,
      title:
        records().find((r) => r.index === index)?.title || app.activity.title,
    };
    app.drafts["editor:matchmaking:活动设置"] = { ...app.activity };
    app.detail = true;
    render();
    return;
  }
  const row = records().find((r) => r.index === index);
  if (!row) return;
  const p = current();
  app.selected = index;
  const review =
    ["review", "safety"].includes(p.family) && p.id !== "identity-history";
  const identity = p.id.startsWith("identity");
  let body = `<div class="between">${badge(row.status)}<span class="mono">${row.id} / v3</span></div>`;
  let foot = "";
  if (identity) {
    body += `<dl class="definition-grid"><div><dt>申请人</dt><dd>${esc(row.title)}</dd></div><div><dt>学校</dt><dd>演示大学</dd></div><div><dt>学号</dt><dd>${esc(row.title.split(" · ")[1] || row.id)}</dd></div><div><dt>提交时间</dt><dd>2026.11.16 10:28</dd></div></dl><h3>身份材料</h3><div class="review-evidence" style="padding:35px;text-align:center"><span class="tag neutral">合成材料占位</span><h3>学生卡资料区域</h3><p>实际开发按授权接口展示图片，离开案件后清除材料。</p></div>`;
    if (p.id === "identity-history")
      body += `<section class="review-evidence"><h3>已完成的审核记录</h3><p>审核结果：${esc(row.status)} · 审核人：校园运营</p><p>审核理由：${esc(app.drafts["identity" + row.index]?.reason || (row.status === "已驳回" ? "学生卡信息不清晰，请重新提交。" : "姓名、学号与学生卡材料一致。"))}</p><p>审核时间：2026.11.16 10:28</p><p>本记录只读，新申请将在身份审核中单独处理。</p></section>`;
  } else if (p.family === "users") {
    body += `<dl class="definition-grid"><div><dt>公开昵称</dt><dd>${esc(row.title)}</dd></div><div><dt>认证</dt><dd>${row.status}</dd></div><div><dt>账号限制</dt><dd>当前无生效限制</dd></div><div><dt>注册日期</dt><dd>2026.11.10</dd></div></dl><h3>处罚与限制记录</h3><div class="review-evidence"><p>暂无生效中的限制。新限制需要提供依据、范围和理由。</p></div>`;
    if (app.role === "super")
      foot =
        '<button class="btn primary" data-action="restrict-user">设置限制</button>';
  } else if (p.family === "crisis") {
    body += `<h3>当前待办</h3><div class="notice warning">核对关怀投递与人工跟进记录。</div><h3>跟进时间线</h3><div class="timeline"><article>案件进入关怀流程<small>2026.11.16 10:20</small></article><article>关怀消息已投递<small>2026.11.16 10:25</small><p>投递结果：已受理，等待核实阅读状态。</p></article><article>等待岗位跟进<small>当前待办</small></article></div><label class="field">跟进说明<textarea id="follow-up" placeholder="记录本次处理依据与下一步"></textarea></label><p class="form-error" id="follow-error"></p>`;
    foot =
      '<button class="btn primary" data-action="follow-up">记录跟进</button>';
  } else if (["settings", "traits", "tasks", "accounts"].includes(p.family)) {
    body += `<dl class="definition-grid"><div><dt>名称</dt><dd>${esc(row.title)}</dd></div><div><dt>读取版本</dt><dd>v3</dd></div><div><dt>${p.family === "accounts" ? "岗位角色" : "启用状态"}</dt><dd>${p.family === "accounts" ? "审核岗位" : "已启用"}</dd></div><div><dt>更新时间</dt><dd>2026.11.16 10:28</dd></div></dl>`;
    if (p.family === "traits")
      body += `<div class="review-stats"><div><strong>36</strong>选用人数</div><div><strong>18</strong>男性选用</div><div><strong>18</strong>女性选用</div><div><strong>0</strong>未知</div></div><div class="review-evidence">审核结论：${row.status}。审核通过与启用分别管理。</div>`;
    foot = `<button class="btn primary" data-action="edit-record">${p.family === "accounts" ? "调整岗位" : "编辑条目"}</button>`;
  } else if (p.family === "words") {
    body += `<dl class="definition-grid"><div><dt>词库版本</dt><dd>v12</dd></div><div><dt>词条数</dt><dd>128</dd></div></dl><h3>版本说明</h3><p>本版本维护校园内容中的示例匹配规则，支持查看快照与试跑。</p>`;
    foot =
      '<button class="btn primary" data-go="wordlists" data-action="close-drawer">返回词库查看词单</button>';
  } else {
    body += `<h3>${esc(row.title)}</h3><p>图书馆门前的银杏黄了，想找一位同学，每周一起读两次英语。互相督促，也分享一点新发现。</p><p style="margin-top:14px">时间可以一起商量，不用给彼此太大压力。希望我们都能在平凡的日子里，积攒一点小小的进步。</p><dl class="definition-grid"><div><dt>来源</dt><dd>${p.id.includes("whisper") ? "匿名树洞" : "校园心愿"}</dd></div><div><dt>发布时间</dt><dd>2026.11.16 10:28</dd></div></dl>`;
    if (p.family === "resources") {
      body = `<div class="between">${badge(row.status)}<span class="mono">${row.id} / v2</span></div><h3 style="margin-top:24px">${esc(row.title)}</h3><p>提供知识梳理、学习路径与重点提示。资料内容与上传文件需在上架前核对。</p><dl class="definition-grid"><div><dt>分类</dt><dd>课程学习</dd></div><div><dt>文件</dt><dd>PDF · 2.4 MB</dd></div><div><dt>当前版本反馈</dt><dd>18 有帮助 / 0 待改进</dd></div><div><dt>更新时间</dt><dd>2026.11.16</dd></div></dl><div class="notice">${row.status === "已上架" ? "已上架资料需先下架，再进行编辑。" : "当前可编辑资料并提交上架。"}</div>`;
      foot = `<button class="btn primary" data-action="resource-state">${row.status === "已上架" ? "下架资料" : "上架资料"}</button>${row.status !== "已上架" ? '<button class="btn" data-action="edit-record">编辑资料</button>' : ""}`;
    } else if (p.family === "content") {
      body += `<div class="review-stats"><div><strong>24</strong>支持</div><div><strong>6</strong>评论</div><div><strong>3</strong>应愿</div><div><strong>128</strong>浏览</div></div><h3>评论与作者补充</h3><div class="review-evidence"><strong>橙子</strong><p>我也在准备六级，我们可以一起！</p><div class="divider"></div><strong>作者补充</strong><p>周二、周四的早上都可以，时间再一起商量。</p></div>`;
      foot =
        '<button class="btn primary" data-action="export-content">导出 Markdown 草稿</button>';
    } else
      body += `<h3>审核依据</h3><div class="review-evidence"><p>正文版本：v3 · 案件版本：v2</p><p>规则命中：未发现示例词条。仍需人工结合完整上下文判断。</p></div>`;
  }
  if (review) {
    body += decisionBlock(row);
    foot =
      '<button class="btn primary" data-action="review-confirm">核对处理结果</button>';
  }
  openDrawer(
    identity
      ? "学生身份详情"
      : p.family === "crisis"
        ? "关怀案件详情"
        : "查看详情",
    body,
    foot,
  );
}
function mutate(operation, apply) {
  if (app.write !== "success") {
    app.pending = {
      type: app.write,
      key: "DEMO-CMD-" + operation.replaceAll(" ", "-") + "-001",
      operation,
      apply,
    };
    closeDrawer(true);
    render();
    return;
  }
  apply();
  closeDrawer(true);
  render();
  toast(operation + "完成（本地演示）");
}
function recordEditor(edit = false) {
  const p = current();
  const row = edit ? records().find((r) => r.index === app.selected) : null;
  const name = edit ? row?.title : "";
  const restoreFields = () => {
    if (!row) return;
    const values = { ...app.edited[p.id + ":" + row.index] };
    if (["settings", "tasks", "traits"].includes(p.family)) {
      const enabled =
        app.enabled[p.id + ":" + row.index] ?? row.status !== "已停用";
      values.state = enabled ? "已启用" : "已停用";
    }
    if (p.family === "tasks") values.description = taskInfo(row).body;
    Object.entries(values).forEach(([key, value]) => {
      const field = byId("record-form").elements.namedItem(key);
      if (field) field.value = value;
    });
    drawerSnapshot = drawerValues();
  };
  const body = `<form id="record-form"><label class="field">${p.family === "accounts" ? "账号名称" : "名称"}<input name="title" value="${esc(name || "")}" ${edit && p.family === "accounts" ? "readonly" : ""} required placeholder="请输入名称"></label>${p.family === "accounts" ? `<label class="field">岗位角色<select name="role"><option>审核岗位</option><option>危机岗位</option><option>超级管理员</option></select></label>` : p.family === "activities" ? `<label class="field">活动说明<textarea name="description" placeholder="说明活动范围与参与方式" required></textarea></label>${activityFields()}` : `<label class="field">${p.family === "resources" ? "分类" : "启用状态"}<select name="state">${p.family === "resources" ? "<option>课程学习</option><option>校园生活</option><option>考试备考</option>" : "<option>已启用</option><option>已停用</option>"}</select></label><label class="field">${p.family === "resources" ? "资料简介" : "说明"}<textarea name="description" placeholder="补充必要说明"></textarea></label>`}${p.family === "tasks" ? `<label class="field">最早可用天数<input name="minDay" type="number" min="0" max="30" value="${row ? taskInfo(row).minDay : 1}" required></label>` : ""}${p.family === "traits" ? '<label class="field">用途<select name="usage"><option>个人特质</option><option>理想型</option></select></label>' : ""}<div class="notice">${edit ? "携带读取版本 v3 保存。" : "保存后会在本地示例列表中显示。"}</div><p class="form-error" id="record-error"></p></form>`;
  if (["settings", "tasks", "accounts"].includes(p.family)) {
    showDialog(
      (edit ? "编辑" : "新增") + "条目",
      body,
      () => {
        const form = byId("record-form");
        if (!form.reportValidity()) return false;
        handleAction("save-record", { dataset: { edit: String(edit) } });
      },
      "保存",
    );
    restoreFields();
    return;
  }
  if (byId("drawer").open) closeDrawer(true);
  openDrawer(
    (edit ? "编辑" : "新增") +
      (p.family === "activities"
        ? "活动"
        : p.family === "accounts"
          ? "账号"
          : "条目"),
    body,
    `<button class="btn primary" data-action="save-record" data-edit="${edit}">保存</button>`,
  );
  restoreFields();
}
function handleAction(action, el) {
  switch (action) {
    case "menu":
      byId("sidebar").classList.toggle("open");
      break;
    case "theme":
      toggleTheme();
      break;
    case "reset-state":
      app.state = "default";
      if (!allowed(current())) nav("dashboard");
      else render();
      break;
    case "refresh":
      toast("数据已刷新（合成示例）");
      break;
    case "clear-filter":
      app.query = "";
      app.status = "全部状态";
      app.pageNumber = 1;
      render();
      break;
    case "prev-page":
      app.pageNumber = Math.max(1, app.pageNumber - 1);
      render();
      break;
    case "next-page":
      app.pageNumber++;
      render();
      break;
    case "close-drawer":
      closeDrawer();
      break;
    case "choose-task":
      chooseTask();
      break;
    case "choose-task-save": {
      const chosen = byId("drawer").querySelector(
        "[name=library-task]:checked:not(:disabled)",
      );
      if (!chosen) {
        byId("task-error").textContent = "请选择一项首日可用任务";
        break;
      }
      const index = Number(chosen.value);
      mutate("首日任务设置", () => (app.firstTask = index));
      break;
    }
    case "guide-edit":
      app.guideEditing = true;
      render();
      break;
    case "guide-cancel":
      app.guideEditing = false;
      render();
      break;
    case "guide-publish": {
      const f = document.querySelector("[data-guide-editor]");
      if (!f.reportValidity()) break;
      const values = Object.fromEntries(new FormData(f));
      const module = app.guideModule;
      showDialog(
        "发布模块说明",
        `<p>将更新「${esc(module)}」当前可读版本，确认内容无误后发布。</p>`,
        () =>
          mutate("模块说明发布", () => {
            app.guidePublished[module] = {
              ...values,
              version: guideValue(module).version + 1,
            };
            app.guideDrafts[module] = values;
            app.guideEditing = false;
          }),
        "确认发布",
      );
      break;
    }
    case "word-start-edit":
      beginWordEdit();
      break;
    case "word-cancel-edit":
      leaveWordEdit();
      break;
    case "word-add":
      editWord();
      break;
    case "word-save": {
      const key = wordKey();
      mutate("词库草稿保存", () => {
        app.wordDirty[key] = false;
        app.wordDrafts[key] = true;
        app.wordEditing = false;
        app.wordEditSnapshot = null;
      });
      break;
    }
    case "word-publish": {
      const key = wordKey();
      showDialog(
        "发布词库草稿",
        "<p>发布后更新生效版本，已完成扫描的案件仍保留原快照。</p>",
        () =>
          mutate("词库发布", () => {
            app.wordVersions[key] = (app.wordVersions[key] || 12) + 1;
            app.wordDrafts[key] = false;
          }),
        "确认发布",
      );
      break;
    }
    case "create":
      recordEditor();
      break;
    case "edit-record":
      recordEditor(true);
      break;
    case "save-record": {
      const f = byId("record-form");
      if (!f.reportValidity()) break;
      const values = Object.fromEntries(new FormData(f));
      if (current().family === "activities" && activityError(values)) {
        byId("record-error").textContent = activityError(values);
        break;
      }
      const p = current();
      const editing = el.dataset.edit === "true";
      mutate("保存条目", () => {
        if (editing) {
          const row = records().find((r) => r.index === app.selected);
          if (row) {
            app.edited[p.id + ":" + row.index] = values;
            const existing = app.created[p.id]?.find(
              (x) => x.index === row.index,
            );
            if (existing) existing.title = values.title;
            if (values.state && p.family !== "resources") {
              if (p.family !== "traits")
                app.overrides[p.id + ":" + row.index] = values.state;
              app.enabled[p.id + ":" + row.index] = values.state === "已启用";
            }
          }
        } else {
          app.created[p.id] ??= [];
          app.created[p.id].unshift({
            id: "DEMO-NEW-" + (app.created[p.id].length + 1),
            title: values.title,
            status:
              p.family === "activities"
                ? "草稿"
                : p.family === "resources"
                  ? "已下架"
                  : values.state || "已启用",
            index: 100 + app.created[p.id].length,
          });
        }
        if (!editing) {
          const added = app.created[p.id][0];
          app.edited[p.id + ":" + added.index] = { ...values };
          if (p.family === "activities")
            app.activityRecords[added.index] = { ...values };
        }
        app.query = values.title;
        app.status = "全部状态";
        app.pageNumber = 1;
      });
      break;
    }
    case "review-confirm": {
      const decision = byId("drawer").querySelector(
        "[name=decision]:checked",
      ).value;
      const reason = byId("decision-reason").value.trim();
      const suggestion = byId("decision-suggestion").value.trim();
      if (decision === "已驳回" && !reason) {
        byId("decision-error").textContent = "驳回时请填写审核理由";
        byId("decision-reason").focus();
        break;
      }
      app.drafts[app.page + app.selected] = { reason, suggestion };
      showDialog(
        "确认处理结果",
        `<p>案件：DEMO-${String(app.selected + 1).padStart(4, "0")} · 正文 v3</p><div class="notice" style="margin:16px 0">处理结论：${decision}</div><p>理由：${esc(reason || "内容符合发布规范")}</p>`,
        () =>
          mutate("审核处理", () => {
            app.overrides[app.page + ":" + app.selected] = decision;
          }),
        "确认提交",
      );
      break;
    }
    case "resource-state": {
      const row = records().find((r) => r.index === app.selected);
      const next = row.status === "已上架" ? "已下架" : "已上架";
      showDialog(
        "确认" + (next === "已上架" ? "上架" : "下架") + "资料",
        `<p>${esc(row.title)}</p><p>操作后资料状态将更新为${next}。</p>`,
        () =>
          mutate("资料状态更新", () => {
            app.overrides[app.page + ":" + app.selected] = next;
          }),
      );
      break;
    }
    case "follow-up":
      if (!byId("follow-up").value.trim()) {
        byId("follow-error").textContent = "请填写本次跟进说明";
        break;
      }
      mutate(
        "关怀跟进",
        () => (app.overrides[app.page + ":" + app.selected] = "跟进中"),
      );
      break;
    case "restrict-user":
      showDialog(
        "设置账号限制",
        '<label class="field">限制范围<select id="restriction"><option>禁止发布内容</option><option>禁止发起应愿</option></select></label><label class="field">处理理由<textarea id="restriction-reason"></textarea></label><p class="form-error" id="restriction-error"></p>',
        () => {
          if (!byId("restriction-reason").value.trim()) {
            byId("restriction-error").textContent = "请填写限制依据";
            return false;
          }
          mutate(
            "账号限制",
            () => (app.overrides[app.page + ":" + app.selected] = "限制中"),
          );
        },
        "确认限制",
      );
      break;
    case "export-content": {
      const row = records().find((r) => r.index === app.selected);
      const blob = new Blob(
        [
          `# ${row.title}\n\n本地合成原型示例，供版式参考。\n\n图书馆门前的银杏黄了，想找一位同学一起晨读。`,
        ],
        { type: "text/markdown;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "鲤源池-合成内容草稿.md";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("示例 Markdown 已导出");
      break;
    }
    case "back-list":
      app.detail = false;
      render();
      break;
    case "activity-save": {
      const f = document.querySelector("[data-editor]");
      if (f) f.requestSubmit();
      else toast("当前活动状态已保留（本地演示）");
      break;
    }
    case "pair-next":
      showDialog(
        ["生成配对方案", "应用配对草稿", "发布配对结果"][app.pairStep],
        `<p>${["生成后请核对对象与推荐依据。", "确认已核对配对对象，将当前方案应用为草稿。", "发布后小程序可见配对结果，请确认活动与对象无误。"][app.pairStep]}</p>`,
        () => {
          app.pairStep++;
          render();
          toast("配对流程已更新（本地演示）");
        },
      );
      break;
    case "clear-query":
      app.queryResult = false;
      app.queryId = "";
      render();
      break;
    case "delete-evidence":
      if (!byId("deletion-reason").value.trim()) {
        toast("请填写处理理由");
        break;
      }
      showDialog(
        "核对删除范围",
        `<p>证据：${esc(app.queryId)}</p><p>范围：指定证据快照与关联附件。演示操作不删除真实数据。</p>`,
        () => {
          app.queryResult = false;
          render();
          toast("演示删除请求已受理，回执 DEMO-RECEIPT-001");
        },
        "提交删除申请",
      );
      break;
    case "retry-command":
      if (app.pending) {
        if (app.pending.type === "conflict") {
          app.pending = null;
          app.write = "success";
          byId("write-state").value = "success";
          render();
          toast("已读取演示最新版本，请重新核对后操作");
        } else {
          app.pending.apply();
          app.pending = null;
          render();
          toast("原演示请求结果已核实：操作完成");
        }
      }
      break;
  }
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("button,a");
  if (!el) return;
  if (el.dataset.navGroup) {
    const key = el.dataset.navGroup;
    app.expanded.has(key) ? app.expanded.delete(key) : app.expanded.add(key);
    renderNav();
  }
  if (el.dataset.navLeaf) {
    const key = el.dataset.navLeaf;
    app.expandedLeaves.has(key)
      ? app.expandedLeaves.delete(key)
      : app.expandedLeaves.add(key);
    renderNav();
  }
  if (el.dataset.rowEdit !== undefined) {
    app.selected = Number(el.dataset.rowEdit);
    recordEditor(true);
  }
  if (el.dataset.rowToggle !== undefined) {
    const p = current(),
      i = Number(el.dataset.rowToggle),
      row = records().find((r) => r.index === i),
      key = p.id + ":" + i;
    const active = el.getAttribute("aria-checked") === "true";
    mutate("启用状态更新", () => {
      app.enabled[key] = !active;
      if (p.family !== "traits")
        app.overrides[key] = active ? "已停用" : "已启用";
    });
  }
  if (el.dataset.rowState !== undefined || el.dataset.rowDelete !== undefined) {
    const p = current(),
      i = Number(el.dataset.rowState ?? el.dataset.rowDelete),
      row = records().find((r) => r.index === i),
      key = p.id + ":" + i;
    const deleting = el.dataset.rowDelete !== undefined,
      next = /下架/.test(row.status)
        ? p.family === "content"
          ? "已发布"
          : "已上架"
        : "已下架";
    showDialog(
      deleting ? "删除条目" : next === "已下架" ? "下架内容" : "上架内容",
      `<p>${esc(row.title)}</p><p>${deleting ? "删除后此条目将从列表移除。" : "确认后更新列表中的发布状态。"}</p>`,
      () =>
        mutate(deleting ? "删除条目" : "发布状态更新", () => {
          if (deleting) {
            app.deleted.add(key);
            app.pageNumber = 1;
          } else app.overrides[key] = next;
        }),
    );
  }
  if (el.dataset.guideModule) {
    app.guideModule = el.dataset.guideModule;
    app.guideEditing = false;
    render();
  }
  if (el.dataset.wordLibrary) {
    leaveWordEdit(() => {
      app.wordLibrary = el.dataset.wordLibrary;
      app.wordQuery = "";
      if (app.page === "builtin") nav("wordlists");
      else render();
    });
  }
  if (app.wordEditing && el.dataset.wordToggle !== undefined) {
    const entry = wordEntries()[Number(el.dataset.wordToggle)];
    entry.enabled = !entry.enabled;
    app.wordDirty[wordKey()] = true;
    render();
  }
  if (el.dataset.wordEdit !== undefined) editWord(Number(el.dataset.wordEdit));
  if (app.wordEditing && el.dataset.wordDelete !== undefined) {
    const key = wordKey(),
      index = Number(el.dataset.wordDelete);
    showDialog(
      "删除词条",
      `<p>从草稿中删除「${esc(wordEntries()[index].text)}」？</p>`,
      () => {
        app.wordEntries[key].splice(index, 1);
        app.wordDirty[key] = true;
        render();
      },
    );
  }
  if (el.dataset.action) handleAction(el.dataset.action, el);
  if (el.dataset.go) {
    if (byId("drawer").open) closeDrawer(false, () => nav(el.dataset.go));
    else if (app.wordEditing && el.dataset.go !== app.page)
      leaveWordEdit(() => nav(el.dataset.go));
    else nav(el.dataset.go);
  }
  if (el.dataset.detail !== undefined) detail(Number(el.dataset.detail));
  if (el.dataset.page) {
    app.pageNumber = Number(el.dataset.page);
    render();
  }
  if (el.dataset.range) {
    app.range = el.dataset.range;
    render();
  }
  if (el.dataset.view) {
    app.cloud = el.dataset.view === "cloud";
    render();
  }
  if (el.dataset.activityTab) {
    app.activityTab = el.dataset.activityTab;
    render();
  }
  if (el.dataset.hot) {
    const target = adminPages.find((p) => p.id === el.dataset.hot);
    if (!allowed(target)) {
      toast("当前岗位无法查看该内容详情");
      return;
    }
    nav(el.dataset.hot);
  }
  if (el.dataset.signup !== undefined) {
    app.signupIndex = Number(el.dataset.signup);
    openDrawer(
      "报名资料核对",
      '<span class="tag warning">待审核</span><dl class="definition-grid"><div><dt>报名人</dt><dd>小满</dd></div><div><dt>校区</dt><dd>大学城校区</dd></div><div><dt>基本资料</dt><dd>20岁 / 168cm / 110斤</dd></div><div><dt>特质</dt><dd>慢热、喜欢散步</dd></div></dl><p>喜欢散步和看电影，希望认识认真生活的你。</p><div class="notice" style="margin-top:20px">报名快照 v2 · 当前资料审核通过</div>',
      '<button class="btn primary" data-signup-approve>通过报名</button>',
    );
  }
  if (el.hasAttribute("data-signup-approve")) {
    app.overrides["signup:" + app.signupIndex] = "已通过";
    closeDrawer();
    render();
    toast("报名审核通过（本地演示）");
  }
});
document.addEventListener("input", (e) => {
  const guide = e.target.closest("[data-guide-editor]");
  if (guide)
    app.guideDrafts[app.guideModule] = Object.fromEntries(new FormData(guide));
  const f = e.target.closest("[data-editor]");
  if (f)
    app.drafts["editor:" + app.page + ":" + app.activityTab] =
      Object.fromEntries(new FormData(f));
});
document.addEventListener("change", (e) => {
  if (e.target.id === "role") {
    app.role = e.target.value;
    if (byId("drawer").open) closeDrawer();
    app.pending = null;
    render();
  }
  if (e.target.id === "page-state") {
    app.state = e.target.value;
    render();
  }
  if (e.target.id === "write-state") app.write = e.target.value;
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const values = Object.fromEntries(new FormData(form));
  if (form.hasAttribute("data-word-search")) {
    app.wordQuery = values.query.trim();
    render();
  }
  if (form.hasAttribute("data-guide-editor")) {
    const module = app.guideModule;
    mutate("说明草稿保存", () => (app.guideDrafts[module] = values));
  }
  if (form.hasAttribute("data-filter")) {
    app.query = values.query.trim();
    app.status = values.status;
    app.pageNumber = 1;
    render();
  }
  if (form.hasAttribute("data-query")) {
    app.queryResult = true;
    app.queryId = values.id;
    render();
  }
  if (form.hasAttribute("data-editor")) {
    app.drafts["editor:" + app.page + ":" + app.activityTab] = values;
    if (form.hasAttribute("data-activity-settings")) {
      const error = activityError(values);
      if (error) {
        byId("activity-error").textContent = error;
        return;
      }
      mutate("活动设置保存", () => {
        app.activity = { ...values };
        app.activityRecords[app.activityIndex] = { ...values };
        app.edited["matchmaking:" + app.activityIndex] = { ...values };
      });
      return;
    }
    if (app.write === "success") toast("草稿已保存（本地演示）");
    else {
      app.pending = {
        type: app.write,
        key: "DEMO-EDITOR-001",
        apply: () => {},
      };
      render();
    }
  }
  if (form.hasAttribute("data-login")) {
    nav("dashboard");
    toast("已进入演示账号");
  }
  if (form.hasAttribute("data-password")) {
    if (values.new !== values.repeat) {
      byId("password-error").textContent = "两次输入的新口令不一致";
      return;
    }
    nav("login");
    toast("演示修改完成，请重新登录");
  }
});
function routeAdmin() {
  const id = location.hash.slice(1) || "dashboard";
  if (id !== app.page) {
    app.wordEditing = false;
    app.wordEditSnapshot = null;
  }
  app.page = adminPages.some((p) => p.id === id) ? id : "not-found";
  app.state = "default";
  app.query = "";
  app.status = "全部状态";
  app.pageNumber = 1;
  app.detail = false;
  app.queryResult = false;
  byId("sidebar").classList.remove("open");
  render();
}
window.addEventListener("hashchange", routeAdmin);
byId("drawer").addEventListener("close", () => drawerTrigger?.focus());
byId("drawer").addEventListener("cancel", (e) => {
  e.preventDefault();
  closeDrawer();
});
let backdropDown = false;
function outsideDrawer(e) {
  const r = byId("drawer").getBoundingClientRect();
  return (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  );
}
byId("drawer").addEventListener("pointerdown", (e) => {
  backdropDown = e.target === byId("drawer") && outsideDrawer(e);
});
byId("drawer").addEventListener("click", (e) => {
  if (backdropDown && e.target === byId("drawer") && outsideDrawer(e))
    closeDrawer();
  backdropDown = false;
});
routeAdmin();
