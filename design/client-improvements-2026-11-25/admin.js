'use strict'

const byId = (id) => document.getElementById(id)
function element(tag, value, className) {
  const node = document.createElement(tag)
  if (value !== undefined) node.textContent = value
  if (className) node.className = className
  return node
}
const navigation = [
  ['用户管理', 'user', ['平台用户', '身份审核', '身份审核历史']],
  ['包分配', 'heart', ['特质标签', '活动维护', '每日任务库']],
  ['资料管理', 'book', ['资料列表', '资料分类']],
  ['内容管理', 'chat', ['心愿管理', '悄悄话管理']],
  ['内容治理', 'shield', ['内容审核', '树洞审核', ['词库管理', '内置词库', '发布记录']]],
  [
    '安全治理',
    'notice',
    ['树洞举报', '举报管理', '处罚管理', '申诉管理', '树洞危机', '危机工作台'],
  ],
  ['隐私管理', 'lock', ['树洞证据', '证据删除', '回执查询']],
  ['系统管理', 'settings', ['举报类型', '展示字典', '本人改密', '模块使用说明', '后台账号管理']],
]
const subjects = [
  ['高数复习提纲', '课程学习', '极限、导数与积分的知识梳理'],
  ['图书馆借阅指南', '校园生活', '借阅、续借与馆际互借'],
  ['线性代数习题集', '课程学习', '矩阵运算与方程组练习'],
  ['社团招新日历', '社团活动', '各学生社团招新时间与地点'],
  ['校园自习空间', '校园生活', '教学区与公共自习室的开放时间'],
  ['英语写作练习', '语言学习', '常见题型与写作素材'],
  ['高数错题手册', '课程学习', '按章节整理的易错题'],
  ['志愿服务手册', '社团活动', '活动报名与服务时数登记'],
  ['实习面试准备', '求职实习', '面试前的资料与常见问题'],
  ['研究方法入门', '学术研究', '检索文献与记录研究过程'],
  ['交换学习申请指南', '语言学习', '校际交换的申请材料'],
  ['职业探索工作坊', '求职实习', '行业介绍与实践体验'],
]
const names = [
  '课程学习',
  '校园生活',
  '语言学习',
  '社团活动',
  '求职实习',
  '学术研究',
  '校园出行',
  '工具软件',
  '升学交流',
  '竞赛项目',
  '体育健康',
  '艺术设计',
  '志愿服务',
]
const editions = ['秋季版', '春季版', '上学期', '下学期']
const statuses = ['已上架', '草稿', '已上架', '已下架', '已上架']
const resources = Array.from({ length: 47 }, (_, i) => {
  const [title, category, description] = subjects[i % subjects.length]
  const edition = editions[Math.floor(i / subjects.length)]
  const date = new Date(Date.UTC(2026, 10, 25 - i)).toISOString().slice(0, 10)
  return {
    name: title + ' · ' + edition,
    description,
    category,
    status: statuses[i % statuses.length],
    updated: date,
  }
})
const versions = ['普通违规', '涉校', '危机', '内置词库']
const catalog = {
  资料列表: {
    group: '资料管理',
    rows: resources,
    columns: [
      ['name', '资料名称'],
      ['category', '分类'],
      ['status', '状态'],
      ['updated', '更新时间'],
    ],
    filters: [
      ['query', '关键词', '搜索标题或简介'],
      ['category', '分类', names],
      ['status', '状态', ['已上架', '草稿', '已下架']],
    ],
  },
  资料分类: {
    group: '资料管理',
    rows: names.map((name, i) => ({
      name,
      sort: String((i + 1) * 10),
      status: i % 6 === 5 ? '停用' : '启用',
    })),
    columns: [
      ['name', '分类名称'],
      ['sort', '排序'],
      ['status', '启用状态'],
    ],
    filters: [['status', '启用状态', ['启用', '停用']]],
  },
  发布记录: {
    group: '内容治理 / 词库管理',
    rows: Array.from({ length: 34 }, (_, i) => ({
      name: versions[i % versions.length],
      status: i < versions.length ? '已发布' : '已归档',
      version: String(35 - i),
    })),
    columns: [
      ['name', '词库'],
      ['status', '状态'],
      ['version', '资源版本'],
    ],
    filters: [['name', '词库', versions]],
  },
}
const state = { screen: '资料列表', page: 1, size: 10, rows: [], timer: null, composing: false }
function makeIcon(name) {
  const image = document.createElement('img')
  image.alt = ''
  image.src = '../prototypes-v2/assets/icons/' + name + '.svg'
  return image
}
function appendLeaf(holder, title) {
  if (!Object.hasOwn(catalog, title)) {
    holder.append(element('span', title, 'nav-text'))
    return
  }
  const button = element('button', title, 'leaf')
  button.type = 'button'
  button.dataset.route = title
  button.addEventListener('click', () => openScreen(title))
  holder.append(button)
}
function buildMenu() {
  const home = element('span', '', 'nav-home')
  home.append(makeIcon('home'), document.createTextNode('首页'))
  byId('menu').append(home)
  for (const [title, icon, leaves] of navigation) {
    const group = element('details', undefined, 'group')
    group.open = !['包分配', '隐私管理'].includes(title)
    const summary = element('summary')
    summary.append(makeIcon(icon), document.createTextNode(title))
    const holder = element('div', undefined, 'leaves')
    for (const leaf of leaves) {
      if (typeof leaf === 'string') {
        appendLeaf(holder, leaf)
        continue
      }
      const subgroup = element('details', undefined, 'subgroup')
      subgroup.open = true
      subgroup.append(element('summary', leaf[0]))
      const children = element('div', undefined, 'leaves')
      leaf.slice(1).forEach((child) => appendLeaf(children, child))
      subgroup.append(children)
      holder.append(subgroup)
    }
    group.append(summary, holder)
    byId('menu').append(group)
  }
}
function renderFilters() {
  const panel = byId('conditions')
  panel.replaceChildren()
  for (const [key, labelText, choices] of catalog[state.screen].filters) {
    const label = element('label', labelText)
    let field
    if (typeof choices === 'string') {
      label.className = 'search'
      field = document.createElement('input')
      field.type = 'search'
      field.placeholder = choices
      field.autocomplete = 'off'
      field.addEventListener('compositionstart', () => {
        state.composing = true
        clearTimeout(state.timer)
      })
      field.addEventListener('compositionend', () => {
        state.composing = false
        schedule()
      })
      field.addEventListener('input', (event) => {
        if (!state.composing && !event.isComposing) schedule()
      })
    } else {
      field = element('select')
      field.add(new Option('全部' + (labelText === '启用状态' ? '状态' : labelText), ''))
      choices.forEach((choice) => field.add(new Option(choice, choice)))
      field.addEventListener('change', applyFilters)
    }
    field.name = key
    label.append(field)
    panel.append(label)
  }
}
function schedule() {
  clearTimeout(state.timer)
  state.timer = setTimeout(applyFilters, 300)
}
function applyFilters() {
  clearTimeout(state.timer)
  const filters = Object.fromEntries(new FormData(byId('filters')))
  state.rows = catalog[state.screen].rows.filter((row) =>
    Object.entries(filters).every(([key, raw]) => {
      const value = raw.trim().toLocaleLowerCase()
      if (!value) return true
      if (key === 'query')
        return [row.name, row.description].join(' ').toLocaleLowerCase().includes(value)
      return row[key] === raw
    }),
  )
  state.page = 1
  renderPage()
}
function pill(value) {
  let kind = ''
  if (['已上架', '启用', '已发布'].includes(value)) kind = 'good'
  if (value === '草稿') kind = 'pending'
  return element('span', value, 'pill ' + kind)
}
function showDetail(row) {
  byId('detail-title').textContent = row.name
  const list = byId('detail-body')
  list.replaceChildren()
  const columns = catalog[state.screen].columns.slice(1)
  if (row.description) columns.unshift(['description', '简介'])
  for (const [key, title] of columns) list.append(element('dt', title), element('dd', row[key]))
  byId('detail').showModal()
}
function pageCount() {
  return Math.ceil(state.rows.length / state.size)
}
function renderPage() {
  const columns = catalog[state.screen].columns
  const head = document.createElement('tr')
  for (const title of [...columns.map((column) => column[1]), '操作']) {
    const th = element('th', title)
    th.scope = 'col'
    head.append(th)
  }
  byId('columns').replaceChildren(head)
  const body = byId('rows')
  body.replaceChildren()
  const start = (state.page - 1) * state.size
  for (const row of state.rows.slice(start, start + state.size)) {
    const tr = element('tr')
    for (const [key] of columns) {
      const td = element('td')
      if (key === 'name') {
        td.append(element('span', row.name, 'name'))
        if (row.description) td.append(element('span', row.description, 'sub'))
      } else if (key === 'status') td.append(pill(row.status))
      else td.textContent = row[key]
      tr.append(td)
    }
    const action = element('td')
    const button = element('button', '查看', 'link')
    button.setAttribute('aria-label', '查看' + row.name)
    button.addEventListener('click', () => showDetail(row))
    action.append(button)
    tr.append(action)
    body.append(tr)
  }
  const pages = pageCount()
  byId('total').textContent = '共 ' + state.rows.length + ' 条'
  byId('position').textContent = pages ? '第 ' + state.page + ' / ' + pages + ' 页' : '0 页'
  byId('prev').disabled = state.page <= 1
  byId('next').disabled = state.page >= pages
  byId('jump').disabled = byId('go').disabled = !pages
  byId('jump').value = ''
  byId('jump').removeAttribute('aria-invalid')
  byId('jump-error').textContent = ''
  byId('empty').hidden = !!pages
}
function resetFilters() {
  HTMLFormElement.prototype.reset.call(byId('filters'))
  state.composing = false
  applyFilters()
}
function mobileMenu(open) {
  document.body.classList.toggle('open', open)
  byId('open-menu').setAttribute('aria-expanded', String(open))
  if (open) byId('close-menu').focus()
  else if (window.matchMedia('(max-width:760px)').matches) byId('open-menu').focus()
}
function openScreen(title) {
  clearTimeout(state.timer)
  const config = catalog[title]
  state.screen = title
  state.size = 10
  state.composing = false
  byId('size').value = 10
  byId('trail').textContent = config.group
  byId('leaf').textContent = byId('heading').textContent = title
  document.title = title + ' · 鲤源池管理端'
  for (const link of document.querySelectorAll('[data-route]')) {
    if (link.dataset.route === title) {
      link.setAttribute('aria-current', 'page')
      for (let node = link.parentElement; node; node = node.parentElement) {
        if (node.tagName === 'DETAILS') node.open = true
      }
    } else link.removeAttribute('aria-current')
  }
  mobileMenu(false)
  byId('content').scrollTop = 0
  renderFilters()
  applyFilters()
}
byId('filters').addEventListener('submit', (event) => {
  event.preventDefault()
  if (!state.composing) applyFilters()
})
byId('reset').addEventListener('click', resetFilters)
byId('clear-empty').addEventListener('click', resetFilters)
byId('refresh').addEventListener('click', () => {
  applyFilters()
  byId('total').textContent += ' · 已刷新'
})
byId('prev').addEventListener('click', () => {
  if (state.page > 1) {
    state.page--
    renderPage()
  }
})
byId('next').addEventListener('click', () => {
  if (state.page < pageCount()) {
    state.page++
    renderPage()
  }
})
byId('size').addEventListener('change', () => {
  state.size = Number(byId('size').value)
  applyFilters()
})
byId('jump-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const raw = byId('jump').value.trim()
  const target = Number(raw)
  if (!/^\d+$/u.test(raw) || !Number.isSafeInteger(target) || target < 1 || target > pageCount()) {
    byId('jump-error').textContent = '请输入 1 至 ' + pageCount() + ' 之间的整数。'
    byId('jump').setAttribute('aria-invalid', 'true')
    byId('jump').focus()
    return
  }
  state.page = target
  renderPage()
})
byId('open-menu').addEventListener('click', () => mobileMenu(true))
byId('close-menu').addEventListener('click', () => mobileMenu(false))
byId('backdrop').addEventListener('click', () => mobileMenu(false))
byId('close-detail').addEventListener('click', () => byId('detail').close())
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('open')) mobileMenu(false)
  if (event.key === 'Tab' && document.body.classList.contains('open')) {
    const items = [...byId('side').querySelectorAll('button, summary')].filter(
      (node) => node.getClientRects().length,
    )
    const edge = event.shiftKey ? items[0] : items[items.length - 1]
    if (document.activeElement === edge) {
      event.preventDefault()
      ;(event.shiftKey ? items[items.length - 1] : items[0]).focus()
    }
  }
})
buildMenu()
openScreen('资料列表')
