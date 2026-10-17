"""T002/REQ-001、020：从本文件生成版本化OpenAPI及合成示例，不读取密钥。"""
import json
from pathlib import Path

OUT = Path(__file__).parent
VERSION = '0.1.0'
S = {}
def ref(n): return {'$ref': '#/components/schemas/' + n}
def string(**kw): return dict(type='string', **kw)
def enum(*values): return dict(type='string', enum=list(values))
def integer(**kw): return dict(type='integer', **kw)
def array(item): return dict(type='array', items=item)
def obj(props, required=(), **kw): return dict(type='object',properties=props,required=list(required),additionalProperties=False,**kw)
def model(name,props,required=()): S[name]=obj(props,required); return ref(name)
def sample(schema):
 if '$ref' in schema:return sample(S[schema['$ref'].split('/')[-1]])
 if 'const' in schema:return schema['const']
 if 'example' in schema:return schema['example']
 if 'enum' in schema:return schema['enum'][0]
 if 'oneOf' in schema:return sample(schema['oneOf'][0])
 t=schema.get('type')
 if isinstance(t,list):t=next(x for x in t if x!='null')
 if t=='object':return {k:sample(v) for k,v in schema.get('properties',{}).items() if k in schema.get('required',[]) or k in ['expected_version','content_version','wish_expected_version','expected_write_epoch']}
 if t=='null':return None
 if t=='array':return []
 if t=='integer':return schema.get('default',schema.get('minimum',1))
 if t=='boolean':return False
 if schema.get('format')=='date-time':return '2026-10-17T00:00:00Z'
 if schema.get('format')=='binary':return '<synthetic JPEG bytes>'
 return 'synthetic-example'
ID=string(description='不透明资源标识；客户端不解析或由此推断身份',example='6c500000-0000-4000-8000-000000000001')
V=integer(minimum=1,description='目标当前乐观版本；不是content_version、wish_expected_version或write_epoch')
CV=integer(minimum=1)
TIME=string(format='date-time')
BODY=string(minLength=1,pattern=r'\S',description='非全空白Unicode文本；此处不新增产品字数限制，传输安全上限按部署参数')
BOOL={'type':'boolean'}
CATEGORY=enum('help','team','items','dating','skill_exchange','other')
CAMPUS=enum('wushan','university_town','international','any')
REWARD=enum('milk_tea','meal','reciprocal_gift','skill_exchange','sincere_thanks');REWARD['default']='sincere_thanks'
WSTATE=enum('draft','pending_review','ready','published','matching','realized','fulfilled','withdrawn','expired','rejected')
ASTATE=enum('pending_scan','pending_review','active','accepted','withdrawn','rejected','invalidated')
REVIEW=enum('pending','approved','rejected')
model('ReviewResult',{'decision':REVIEW,'reason':string(),'revision_suggestion':string(),'content_version':CV},['decision','content_version'])
model('ReviewDecision',{'decision':enum('approved','rejected'),'reason':string(),'revision_suggestion':string(),'expected_version':V},['decision','expected_version'])
S['ReviewDecision']['allOf']=[{'if':{'properties':{'decision':{'const':'rejected'}}},'then':{'required':['reason','revision_suggestion'],'properties':{'reason':string(minLength=1),'revision_suggestion':string(minLength=1)}}}]
model('VersionCommand',{'expected_version':V},['expected_version'])
model('ReasonCommand',{'expected_version':V,'reason':string(minLength=1)},['expected_version','reason'])
model('IdentityTags',{'campus':CAMPUS,'grade':string(),'gender':string()})
model('PublicProfile',{'id':ID,'nickname':string(),'identity_tags':ref('IdentityTags')},['id','nickname'])
model('PublicContent',{'id':ID,'body':BODY,'content_version':CV,'school_related':BOOL,'notice_codes':array(enum('UNVERIFIED_SCHOOL')),'notice_text':string(example=''),'category':CATEGORY,'campus':CAMPUS,'reward_method':REWARD,'expires_at':TIME,'author':ref('PublicProfile')},['id','body','content_version','school_related','notice_codes','notice_text','author'])
S['PublicContent']['description']='所有公开入口同一投影；涉校true必须含UNVERIFIED_SCHOOL及“未经证实”；false空提示；检测pending或privacy_hold有效时不得返回本投影。'
model('WishInput',{'category':CATEGORY,'body':string(minLength=1,maxLength=500,pattern=r'\S',description='按Unicode码点计数，拒绝全空白'),'campus':CAMPUS,'identity_tags':ref('IdentityTags'),'reward_method':REWARD,'duration_days':integer(minimum=1,maximum=30,default=7)},['category','body','campus'])
model('WishUpdate',{**S['WishInput']['properties'],'refresh_expiry':BOOL,'expected_version':V},['category','body','campus','refresh_expiry','expected_version'])
model('WishResult',{'id':ID,'version':V,'content_version':CV,'current_state':WSTATE,'allowed_actions':array(string()),'expires_at':{'type':['string','null'],'format':'date-time'},'review_result':ref('ReviewResult'),'story_review_result':ref('ReviewResult'),'privacy_review_required':BOOL,'own_content':ref('WishInput'),'public':ref('PublicContent'),'participant':ref('PublicContent')},['id','version','current_state','allowed_actions'])
S['WishResult']['description']='视图按当前权限互斥选择；屏障期间本人也不得获得旧公开正文；ready/expired不是published。'
model('Me',{'id':ID,'version':V,'nickname':string(),'verification':enum('unverified','pending','verified','rejected'),'hide_identity_tags':BOOL,'allowed_actions':array(string()),'penalty_notice':string()},['id','version','verification','allowed_actions'])
model('Session',{'token':string(description='仅本次会话返回；仅存摘要，禁止日志/持久化公开缓存'),'me':ref('Me')},['token','me'])
model('WechatLogin',{'code':string(minLength=1),'client_request_id':string(minLength=1)},['code','client_request_id'])
model('ProfileUpdate',{'nickname':string(minLength=1),'hide_identity_tags':BOOL,'expected_version':V},['nickname','hide_identity_tags','expected_version'])
model('AssetInput',{'file':string(format='binary')},['file'])
model('Asset',{'asset_id':ID,'scan_status':enum('pending','approved','rejected')},['asset_id','scan_status'])
model('VerificationInput',{'student_number':string(minLength=1),'name':string(minLength=1),'asset_id':ID,'expected_version':V},['student_number','name','asset_id','expected_version'])
model('Verification',{'request_id':ID,'version':V,'status':enum('pending','approved','rejected'),'reason':string(),'revision_suggestion':string()},['request_id','version','status'])
model('DeletionInput',{'confirmation':enum('delete_account'),'expected_version':V},['confirmation','expected_version'])
model('DeletionAccepted',{'deletion_receipt':string(description='专用高熵随机句柄；无身份和正文'),'status':enum('processing')},['deletion_receipt','status'])
model('DeletionReceipt',{'status':enum('processing','completed'),'retryable_error':string()},['status'])
model('SubmitReview',{'expected_version':V,'content_version':CV},['expected_version','content_version'])
model('Rollback',{'expected_version':V,'target':enum('matching','published'),'refresh_expiry':BOOL},['expected_version','target','refresh_expiry'])
model('ApplicationInput',{'message':string(maxLength=100),'wish_content_version':CV},['message','wish_content_version'])
model('Application',{'id':ID,'version':V,'wish_id':ID,'status':ASTATE,'review_result':ref('ReviewResult'),'applicant':ref('PublicProfile'),'message':string(maxLength=100)},['id','version','wish_id','status'])
model('AcceptInput',{'expected_version':V,'wish_expected_version':V},['expected_version','wish_expected_version'])
model('Match',{'match_id':ID,'conversation_id':ID,'wish_id':ID,'version':V},['match_id','conversation_id','wish_id','version'])
model('Conversation',{'id':ID,'version':V,'can_write':BOOL,'write_epoch':integer(minimum=0)},['id','version','can_write','write_epoch'])
model('MessageInput',{'client_message_id':string(minLength=1),'body':BODY,'expected_write_epoch':integer(minimum=0)},['client_message_id','body','expected_write_epoch'])
model('MessageAccepted',{'message_id':ID,'status':enum('pending_scan'),'delivery_seq':{'type':'null'}},['message_id','status','delivery_seq'])
model('DeliveredMessage',{'message_id':ID,'delivery_seq':integer(minimum=1),'submitted_at':TIME,'delivered_at':TIME,'body':BODY},['message_id','delivery_seq','submitted_at','delivered_at','body'])
model('MessageStatus',{'message_id':ID,'status':enum('pending','rejected','cancelled','delivered'),'delivery_seq':{'type':['integer','null'],'minimum':1},'review_result':ref('ReviewResult')},['message_id','status','delivery_seq'])
S['MessageStatus']['description']='只有delivered拥有非空delivery_seq；其余为null；pending涵盖扫描/人工待审。'
model('MessagesPage',{'items':array(ref('DeliveredMessage')),'next_after_seq':integer(minimum=0)},['items','next_after_seq'])
model('Notification',{'id':ID,'version':V,'kind':string(),'read':BOOL,'target_ref':string(),'notice':string(description='通用提示，不含私聊/身份正文')},['id','version','kind','read'])
model('StoryInput',{'body':BODY,'wish_expected_version':V},['body','wish_expected_version'])
model('StoryUpdate',{'body':BODY,'expected_version':V},['body','expected_version'])
model('StoryAccepted',{'id':ID,'version':V,'content_version':CV,'status':enum('pending_review'),'wish_state':enum('fulfilled')},['id','version','content_version','status','wish_state'])
model('ShareInput',{'target_kind':enum('wish','story'),'id':ID},['target_kind','id'])
model('ShareLink',{'ref':string(),'miniapp_route':string(description='小程序路由引用，不包含正文快照')},['ref','miniapp_route'])
model('ShareTarget',{'target_kind':enum('wish','story'),'target':ref('PublicContent')},['target_kind','target'])
model('BlockInput',{'target_user_id':ID},['target_user_id'])
model('ReportType',{'code':string(),'label':string()},['code','label'])
model('ReportInput',{'target_kind':enum('wish','application','message','story'),'id':ID,'type_code':string(minLength=1),'description':string()},['target_kind','id','type_code'])
model('Accepted',{'id':ID,'version':V,'status':enum('pending')},['id','version','status'])
model('AppealInput',{'penalty_id':ID,'body':BODY},['penalty_id','body'])
model('Appeal',{'id':ID,'version':V,'status':string(),'reason':string()},['id','version','status'])
model('Warning',{'id':ID,'version':V,'notice':string(),'first_displayed_at':{'type':['string','null'],'format':'date-time'},'confirmable_at':{'type':['string','null'],'format':'date-time'},'server_now':TIME,'remaining_seconds':integer(minimum=0,maximum=30),'acknowledged_at':{'type':['string','null'],'format':'date-time'}},['id','version','notice','first_displayed_at','confirmable_at','server_now','remaining_seconds'])
model('ModerationOutcome',{'content_decision':enum('approved','rejected'),'business_outcome':enum('published','delivered','cancelled','privacy_review_required','pending_review','ready','expired','active'),'version':V},['content_decision','business_outcome','version'])
model('CaseSummary',{'id':ID,'version':V,'status':string(),'kind':string(),'content_version':CV},['id','version','status'])
model('IdentityCase',{'id':ID,'version':V,'status':string(),'name':string(),'student_number':string(),'asset_id':ID},['id','version','status','name','student_number','asset_id'])
S['IdentityCase']['description']='仅身份审核案件详情授权，No-Store；普通列表不得返回这些明文字段。'
model('ModerationCase',{'id':ID,'version':V,'content_version':CV,'body':BODY,'school_related':BOOL,'status':string()},['id','version','content_version','body','status'])
model('PenaltyInput',{'violation_ref':ID,'content_ref':ID,'content_version':CV,'level':enum('minor','general','severe'),'reason':string(minLength=1),'expected_version':V},['violation_ref','content_ref','content_version','level','reason','expected_version'])
model('AppealDecision',{'decision':enum('uphold','revoke'),'reason':string(minLength=1),'expected_version':V},['decision','reason','expected_version'])
model('ReportDecision',{'decision':enum('confirmed','dismissed'),'reason':string(minLength=1),'expected_version':V},['decision','reason','expected_version'])
model('WordlistInput',{'kind':enum('crisis','school','ordinary_violation'),'entries':array(string(minLength=1)),'expected_version':V},['kind','entries'])
S['WordlistInput']['description']='创建独立新词库无expected_version，已有词库创建版本带当前版本；真实词条由D03交付。'
model('Wordlist',{'id':ID,'version':V,'kind':enum('crisis','school','ordinary_violation'),'status':string()},['id','version','kind','status'])
model('CrisisCase',{'id':ID,'version':V,'student_number':string(),'body':BODY,'status':string(),'timeline':array(ref('CaseSummary'))},['id','version','status'])
model('CrisisAction',{'action':string(minLength=1),'reason':string(minLength=1),'expected_version':V},['action','reason','expected_version'])
model('Evidence',{'id':ID,'version':V,'case_id':ID,'body':BODY,'student_number':string(),'status':string()},['id','version','case_id','status'])
model('Account',{'id':ID,'version':V,'roles':array(enum('review_operator','crisis_operator','super_admin')),'active':BOOL},['id','version','roles','active'])
model('RolesInput',{'roles':array(enum('review_operator','crisis_operator','super_admin')),'reason':string(minLength=1),'expected_version':V},['roles','reason','expected_version'])
model('AdminSessionResult',{'token':string(),'account':ref('Account')},['token','account'])
# D02身份提供方未交付，不能将候选密码/SSO形式冻结为业务事实。
S['AdminLoginInput']={'type':'object','description':'D02待提供后台身份方案，凭据交换形状未冻结；禁止使用模板演示密码。受影响的真实登录集成阻塞。','additionalProperties':True}
S['AccountInput']={'type':'object','description':'D02身份提供方账号绑定参数待交付；仅超管，必须有reason；不得自建默认口令。','properties':{'reason':string(minLength=1)},'required':['reason'],'additionalProperties':True}
model('WorkItem',{'id':ID,'version':V,'status':enum('pending','leased','retry_wait','completed','cancelled','attention'),'kind':string()},['id','version','status','kind'])

def page(n):
 name=n+'Page'
 if name not in S:model(name,{'items':array(ref(n)),'next_cursor':{'type':['string','null']}},['items','next_cursor'])
 return name

# 方法 路径 请求schema 返回schema 状态 权限 任务 REQ后缀 描述
DATA='''
POST /auth/wechat-sessions WechatLogin Session 200 code T008 002,018 微信code交换身份，不授予学生认证；同code去重
DELETE /auth/session - - 204 student T008 002,018 撤销当前会话
GET /me - Me 200 student T008 002,014,018 当前资格和允许动作；受罚会话仅受限资料
PUT /me/profile ProfileUpdate Me 200 student T008 002,014,018 资料展示设置，不允许改学号或角色
POST /me/student-card-assets AssetInput Asset 202 student T011 002,015,018 图片边界检查加密存储与扫描，不返回下载URL
POST /me/verification-requests VerificationInput Verification 202 student T011 002,018 人工认证申请；asset归本人且扫描通过
GET /me/verification-request - Verification 200 student T011 002,018 本人待审或驳回状态和建议，不回显完整身份
POST /me/deletion-requests DeletionInput DeletionAccepted 202 student T031 014,018 含受罚身份；事务生效立即屏障并撤销会话
GET /deletion-receipts/{receipt} - DeletionReceipt 200 public T031 018 仅随机句柄；无身份正文，过期404
GET /wishes - PublicContentPage 200 public T014 003,004,005,008,018,021 当前可公开心愿；权威数据库过滤期限、屏障和审核
GET /wishes/{id} - WishResult 200 public T014 004,008,018 当前主体投影，无读权404
GET /users/{id}/public-profile - ProfileContents 200 public T014 008,018 公开昵称和未隐藏标签、上架心愿和已审故事
GET /me/wishes - WishResultPage 200 student T014 004,008,018,021 本人记录与review_result/story_review_result
GET /me/applications - ApplicationPage 200 student T019 006,008,015,018,021 本人申请；注销目标正文不可读
POST /wishes WishInput WishResult 201 verified T014 003,004,005 创建草稿；不自动公开
PUT /wishes/{id}/content WishUpdate WishResult 200 verified T014 003,004,015 上架先撤下，生成新content_version重新检测；匹配中先合法回退
DELETE /wishes/{id}/draft VersionCommand - 204 verified T014 004,018 仅删除本人草稿
POST /wishes/{id}/submit-review SubmitReview WishResult 202 verified T014 004,015 绑定当前内容版本提交审核
POST /wishes/{id}/publish VersionCommand WishResult 200 verified T014 004,005 当前可上架复核；published/ready/expired，不保证公开
POST /wishes/{id}/withdraw VersionCommand WishResult 200 verified T014 004,006 撤下已上架并失效旧申请
POST /wishes/{id}/rollback Rollback WishResult 200 verified T019 004,005 普通回退；B01满额拒绝；刷新期限需重审
POST /wishes/{id}/complete VersionCommand WishResult 200 verified T023 004,007 仅许愿人确认实现；关闭写入并取消待审消息
POST /wishes/{id}/exception-exit VersionCommand WishResult 200 student T026 004,014,016 合法未受罚方或拉黑方退出，withdrawn；fulfilled拒绝
POST /wishes/{id}/applications ApplicationInput Application 202 verified T019 005,006,015 非本人有效心愿；pending_scan，同人未终结去重
GET /wishes/{id}/applications - ApplicationPage 200 verified T019 006,015 仅许愿人，仅active；不展示待审正文
POST /applications/{id}/withdraw VersionCommand Application 200 verified T019 006 撤销未确定匹配申请；旧审核不得恢复
POST /applications/{id}/accept AcceptInput Match 200 verified T019 004,005,006 事务再次核验资格、唯一人、拉黑、处罚、期限
GET /me/conversations - ConversationPage 200 student T021 007,018 本人普通历史关系，无正文快照
GET /conversations/{id}/messages - MessagesPage 200 student T021 007,015,018 最终delivery_seq升序；after_seq与cursor互斥
POST /conversations/{id}/messages MessageInput MessageAccepted 202 verified T021 007,015 先待审，delivery_seq=null，不保证送达
GET /me/messages/{id}/status - MessageStatus 200 student T021 007,015,018 仅发送者；送达才有序号，驳回含修改建议
GET /me/notifications - NotificationPage 200 student T021 006,017,018 通用提示与未读；打开目标再次授权
POST /me/notifications/{id}/read VersionCommand Notification 200 student T021 006,018 仅本人标已读
POST /wishes/{id}/stories StoryInput StoryAccepted 202 verified T023 004,008,015 原子转fulfilled，故事待审不公开
PUT /wishes/{id}/story StoryUpdate StoryAccepted 202 verified T023 008,015 新版本重审，旧版下线，不回退fulfilled
POST /wishes/{id}/story/withdraw VersionCommand WishResult 200 student T023 008 故事撤回，心愿仍fulfilled
GET /stories - PublicContentPage 200 public T023 008,015,018,021 当前已审故事；有效隐私屏障禁止公开
GET /stories/{id} - PublicContent 200 public T023 008,018 仅当前可读投影，无注销应愿人身份引用
POST /share-links ShareInput ShareLink 201 student T023 008 仅可分享当前公开对象；存引用不存快照
GET /share-links/{ref} - ShareTarget 200 public T023 008,018 重读当前权威公开性，失效404
POST /me/blocks BlockInput BlockResult 200 student T026 014,016 存有向拉黑，双向未匹配申请失效和待审消息取消
DELETE /me/blocks/{target_id} VersionCommand - 204 student T026 014 仅解除自己的记录，不恢复旧申请消息
GET /report-types - ReportTypePage 200 student T026 014,019 D03实际类型待交付；示例不作为真实类型
POST /reports ReportInput Accepted 202 student T026 014,015,017 举报受理，不自动定罪或永久取证
POST /me/appeals AppealInput Accepted 202 student T026 014,016 含封禁专用权限，不授普通写权限
GET /me/appeals - AppealPage 200 student T026 014,016 本人申诉处理状态及允许披露理由
GET /me/warnings - WarningPage 200 student T026 016 未确认warning，含受限会话，不等于禁言
POST /me/warnings/{id}/display VersionCommand Warning 200 student T026 016 首次服务端display+30秒；重进不重置
POST /me/warnings/{id}/ack VersionCommand Warning 200 student T026 016 未展示或29秒返回409，30秒成功；提前失败不锁死幂等键
POST /admin/sessions AdminLoginInput AdminSessionResult 200 admin_login T008 018,019 D02后台独立身份方案未冻结，禁止模板密码
DELETE /admin/session - - 204 admin T008 018,019 撤销独立后台会话
GET /admin/identity-reviews - CaseSummaryPage 200 review T011 002,018,019 脱敏列表，无完整姓名学号或学生卡
GET /admin/identity-reviews/{id} - IdentityCase 200 review T011 002,018,019 身份案件授权后完整字段，访问留迹
GET /admin/identity-reviews/{id}/student-card - Binary 200 review T011 002,018,019 案件鉴权代理解密流，No-Store，无公开URL
POST /admin/identity-reviews/{id}/decision ReviewDecision Verification 200 review T011 002,018,019 驳回必须有原因及建议；仅当前版本
GET /admin/moderation-tasks - CaseSummaryPage 200 review T016 015,019 普通命中案件列表，无任意私聊搜索
GET /admin/moderation-tasks/{id} - ModerationCase 200 review T016 015,019 仅案件原版本命中正文
POST /admin/moderation-tasks/{id}/decision ReviewDecision ModerationOutcome 200 review T016 015,018,019 审核结果与业务执行分离，旧版本或屏障代次不符不能放行
POST /admin/contents/{kind}/{id}/offline ReasonCommand CaseSummary 200 review T016 015,019 普通违规下线
POST /admin/contents/{kind}/{id}/release-restriction ReasonCommand CaseSummary 200 review T016 015,019 解除普通限制，不自动上架不解除危机隔离
GET /admin/reports - CaseSummaryPage 200 cases T026 014,019 具体案件权限，不扩大完整身份访问
POST /admin/reports/{id}/decision ReportDecision CaseSummary 200 cases T026 014,019 举报案件处理，精确版本
POST /admin/users/{id}/penalties PenaltyInput CaseSummary 200 cases T026 014,016,019 minor=warning/general=mute七天/severe=ban永久；同违规幂等，无任意时长
GET /admin/appeals - AppealPage 200 cases T026 014,016,019 角色与案件授权
POST /admin/appeals/{id}/decision AppealDecision Appeal 200 cases T026 016,019 解罚必填理由，不复活旧匹配申请
GET /admin/wordlists - WordlistPage 200 review T016 015,019 版本化词库，真实样例D03
POST /admin/wordlists/versions WordlistInput Wordlist 201 review T016 015,019 创建版本，已存在词库需当前版本
POST /admin/wordlists/{id}/publish VersionCommand Wordlist 200 review T016 015,019 显式版本发布
GET /admin/crisis-cases - CaseSummaryPage 200 crisis T029 017,018,019 仅危机与超管，普通运营403
GET /admin/crisis-cases/{id} - CrisisCase 200 crisis T029 017,018,019 案件级完整学号及危机正文访问留迹
POST /admin/crisis-cases/{id}/actions CrisisAction CaseSummary 200 crisis T029 017,019 时间线动作，无人工首次响应SLA
POST /admin/crisis-cases/{id}/resolve-false-positive ReasonCommand CaseSummary 200 crisis T029 015,017,019 误报解除再普通审核，不直接公开
GET /admin/evidence/{id} - Evidence 200 evidence T029 017,018,019 案件限定证据；普通运营仅脱敏普通违规，不给完整学号
GET /admin/evidence/{id}/asset - Binary 200 evidence T029 017,018,019 学生卡仅本身涉案时可保留，访问留迹
DELETE /admin/evidence/{id} ReasonCommand Accepted 202 super T031 018,019 超管删全副本并持久恢复标记；不是立即已删完
GET /admin/accounts - AccountPage 200 super T008 018,019 后台账号列表
POST /admin/accounts AccountInput Account 201 super T008 018,019 D02账号绑定参数待交付，仅超管
PUT /admin/accounts/{id}/roles RolesInput Account 200 super T008 018,019 角色修改理由及版本，不允许运营自提权
GET /admin/work-items - WorkItemPage 200 work T007 006,017,018,019 超管；运营限所属普通任务脱敏技术视图
POST /admin/work-items/{id}/retry VersionCommand WorkItem 200 work T007 006,017,018,019 重驱动再次复核，cancelled不可强制重放
'''
model('BlockResult',{'target_user_id':ID,'blocked':{'type':'boolean','const':True}},['target_user_id','blocked'])
# 公共主页列表采用同一cursor流，item区分wish/story，避免两个游标含义不明。
model('ProfileItem',{'kind':enum('wish','story'),'content':ref('PublicContent')},['kind','content'])
model('ProfileContents',{'profile':ref('PublicProfile'),'items':array(ref('ProfileItem')),'next_cursor':{'type':['string','null']}},['profile','items','next_cursor'])
S['ProfileContents']['description']='技术细化：混合公开内容流按公开时间+ID倒序，cursor绑定用户及筛选。'
ERRORS={
 '400':['VALIDATION_FAILED'], '401':['UNAUTHENTICATED'], '403':['VERIFICATION_REQUIRED','FORBIDDEN'],
 '404':['NOT_FOUND'], '409':['VERSION_CONFLICT','STATE_CONFLICT','ACTIVE_WISH_LIMIT','DUPLICATE_APPLICATION','BLOCKED_INTERACTION','REVIEW_PENDING','ASSET_NOT_READY','IDEMPOTENCY_CONFLICT','WARNING_WAIT_REQUIRED'],
 '429':['RATE_LIMITED'], '500':['INTERNAL_ERROR'], '503':['DEPENDENCY_UNAVAILABLE']}
model('Error',{'code':integer(minimum=1,description='非零技术码；客户端分支使用error_code'),'message':string(),'error_code':enum(*sum(ERRORS.values(),[])),'request_id':string(),'remaining_seconds':integer(minimum=0,maximum=30)},['code','message','error_code','request_id'])
parameters={
 'IdempotencyKey':{'name':'Idempotency-Key','in':'header','required':True,'schema':string(minLength=1,maxLength=128),'description':'T006：身份+方法+规范路径+键绑定请求摘要；不同摘要409，同成功重试重新授权，只返最小引用。技术上限128字符。'},
 'Cursor':{'name':'cursor','in':'query','schema':string(),'description':'不透明签名游标，绑定账号/筛选/目标；不得跨用。'},
 'Limit':{'name':'limit','in':'query','schema':integer(minimum=1,maximum=50,default=20),'description':'聊天默认50，其余20；最大50。'},
}
security={a:[{a:[]}] for a in ['StudentSession','AdminSession']}
ROLE={'public':'公开投影或随机回执句柄','code':'微信code交换，仅获得身份','student':'本人会话；受限动作按账号状态复核','verified':'已认证且当前允许交互；对象关系逐次核验','admin_login':'D02后台身份提供方独立登录','admin':'活跃后台会话','review':'review_operator或super_admin，限定案件','cases':'review_operator/crisis_operator/super_admin，限定案件','crisis':'crisis_operator或super_admin，限定案件','evidence':'按案件字段授权：完整身份限危机/超管，普通运营仅脱敏违规证据','super':'仅super_admin','work':'super_admin；运营仅所属普通任务脱敏视图'}
paths={};examples={};mapping=[]
for line in DATA.strip().splitlines():
 method,path,req,res,status,auth,task,reqs,desc=line.split(' ',8)
 if res.endswith('Page'):page(res[:-4])
 opid=method.lower()+''.join(x.title() for x in path.replace('{','').replace('}','').replace('-','/').split('/'))
 op={'operationId':opid,'summary':desc,'description':desc+'。权限：'+ROLE[auth]+'。参见语义约束与验收映射。','tags':['admin' if path.startswith('/admin') else path.split('/')[1]],'x-task-id':task,'x-req-ids':['REQ-'+r for r in reqs.split(',')],'x-implementation-status':'not-implemented','x-resource-mode':'contract-only','parameters':[], 'responses':{}}
 op['security']=[] if auth in ['public','code','admin_login'] else security['AdminSession' if path.startswith('/admin') else 'StudentSession']
 import re
 for name in re.findall(r'{([^}]+)}',path):op['parameters'].append({'name':name,'in':'path','required':True,'schema':ID})
 if method=='GET' and (res.endswith('Page') or res in ['MessagesPage','ProfileContents']):
  op['parameters'] += [{'$ref':'#/components/parameters/Cursor'},{'$ref':'#/components/parameters/Limit'}]
 if path=='/conversations/{id}/messages' and method=='GET':
  op['parameters'][-1]={'name':'limit','in':'query','schema':integer(minimum=1,maximum=50,default=50)}
  op['parameters'].append({'name':'after_seq','in':'query','schema':integer(minimum=0,default=0),'description':'与cursor二选一，均未传从0；空页不推进。'})
 for key,sch in ({'category':CATEGORY,'campus':CAMPUS} if path=='/wishes' and method=='GET' else {'state':WSTATE} if path=='/me/wishes' else {'status':ASTATE} if path=='/me/applications' else {}).items():op['parameters'].append({'name':key,'in':'query','schema':sch})
 if method!='GET' and path not in ['/auth/wechat-sessions','/admin/sessions']:
  op['parameters'].append({'$ref':'#/components/parameters/IdempotencyKey'})
 if req!='-':
  mime='multipart/form-data' if req=='AssetInput' else 'application/json'
  op['requestBody']={'required':True,'content':{mime:{'schema':ref(req)}}}
  if req not in ['AdminLoginInput','AccountInput']:op['requestBody']['content'][mime]['example']=sample(ref(req))
 headers={'X-Request-ID':{'schema':string(),'description':'技术请求关联标识'},'Cache-Control':{'schema':string(),'description':'no-store：本人、案件、身份、会话、回执等敏感响应'}}
 if res=='-':op['responses'][status]={'description':'成功，无响应体','headers':headers}
 elif res=='Binary':op['responses'][status]={'description':'授权代理解密流；No-Store','headers':headers,'content':{'application/octet-stream':{'schema':string(format='binary')}}}
 else:
  envelope_name=res+'Envelope'
  if envelope_name not in S:model(envelope_name,{'code':{'type':'integer','const':0},'message':string(),'data':ref(res),'request_id':string()},['code','message','data','request_id'])
  response={'code':0,'message':'已持久接收' if status=='202' else '成功','data':sample(ref(res)),'request_id':'synthetic-request-id'}
  data=response['data']
  if res=='Warning':
   data.update(first_displayed_at='2026-10-17T00:00:00Z',confirmable_at='2026-10-17T00:00:30Z',server_now='2026-10-17T00:00:00Z',remaining_seconds=30)
   if path.endswith('/ack'):data.update(server_now='2026-10-17T00:00:30Z',remaining_seconds=0,acknowledged_at='2026-10-17T00:00:30Z')
  if res=='Notification' and path.endswith('/read'):data['read']=True
  if res=='MessageStatus':data['delivery_seq']=None
  if res=='WishResult':
   desired='draft'
   if path.endswith('/submit-review'):desired='pending_review'
   elif path.endswith('/publish'):desired='ready'
   elif path.endswith('/withdraw') or path.endswith('/exception-exit'):desired='withdrawn'
   elif path.endswith('/complete'):desired='realized'
   elif path.endswith('/rollback'):desired='matching'
   elif path.endswith('/story/withdraw'):desired='fulfilled'
   data['current_state']=desired
  if res=='ModerationOutcome':data.update(content_decision='approved',business_outcome='cancelled')
  op['responses'][status]={'description':'已持久接收，未完成公开/送达/删除' if status=='202' else '成功，按返回状态展示','headers':headers,'content':{'application/json':{'schema':ref(envelope_name),'example':response}}}
 for code,errors in ERRORS.items():
  op['responses'][code]={'description':' / '.join(errors),'content':{'application/json':{'schema':ref('Error'),'example':{'code':int(code),'message':'请求未完成','error_code':errors[0],'request_id':'synthetic-request-id'}}},'headers':headers}
 if req in ['AdminLoginInput','AccountInput']:op['x-blocked-by']='D02'
 paths.setdefault(path,{})[method.lower()]=op
 examples[opid]={'task_id':task,'req_ids':op['x-req-ids'],'mode':'synthetic-contract-example','request':{'headers':({'Idempotency-Key':'synthetic-command-key'} if method!='GET' and path not in ['/auth/wechat-sessions','/admin/sessions'] else {}),'method':method,'path':'/api/v1'+path,'body':None if req=='-' else sample(ref(req))},'response':{'status':int(status),'body':None if res in ['-','Binary'] else response}}
 mapping.append((opid,method,path,task,','.join(op['x-req-ids'])))
api={'openapi':'3.1.0','info':{'title':'鲤源池首发共享接口契约','version':VERSION,'description':'T002，批准api.md v0.2细化；所有业务端点尚未实现，不代表真实或模拟服务已启动。D02登录供应商参数不冻结。'},'servers':[{'url':'/api/v1','description':'两端共同前缀；当前后端仅/healthz与/readyz，不可将此地址当业务可用'}],'paths':paths,'components':{'schemas':S,'parameters':parameters,'securitySchemes':{'StudentSession':{'type':'http','scheme':'bearer','bearerFormat':'opaque student session'},'AdminSession':{'type':'http','scheme':'bearer','bearerFormat':'opaque independent admin session'}}},'x-task-id':'T002','x-contract-mode':'definition-only','x-design-version':'G3 ff882ab0c8bdb59d3509e0782c7b13ec77e5c7e4'}
(OUT/'openapi.v0.1.0.json').write_text(json.dumps(api,ensure_ascii=False,indent=2)+'\n')
(OUT/'examples.v0.1.0.json').write_text(json.dumps(examples,ensure_ascii=False,indent=2)+'\n')
(OUT/'operations.md').write_text('# T002 接口→任务→REQ 索引\n\n版本0.1.0；所有行仅契约，功能未实现。验收用例见acceptance.md。\n\n| operationId | 方法及相对路径 | 实现任务 | REQ |\n| --- | --- | --- | --- |\n'+''.join(f'| {o} | {m} `{p}` | {t} | {r} |\n' for o,m,p,t,r in mapping))
(OUT/'errors.md').write_text('# T002 错误码 v0.1.0\n\n所有错误有非零code、message、稳定error_code与request_id；不含底层异常、凭据、身份或正文。\n\n| HTTP | error_code |\n| --- | --- |\n'+''.join(f'| {c} | {", ".join(v)} |\n' for c,v in ERRORS.items())+'\nIDEMPOTENCY_CONFLICT是同键异摘要的技术命名补全；WARNING_WAIT_REQUIRED返回remaining_seconds，提前失败不阻止之后同键重试。INTERNAL_ERROR为异常恢复兜底，不是业务错误。503不允许安全能力失败时直通；404用于不可读对象避免枚举。ready为成功处理业务结果，不用ACTIVE_WISH_LIMIT；后者用于B01满额回退。\n')
print(f'{len(mapping)} operations, {len(S)} schemas generated')
