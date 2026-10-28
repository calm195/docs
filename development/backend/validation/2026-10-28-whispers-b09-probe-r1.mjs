import assert from 'node:assert/strict'
import { readFileSync,writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { loadRuntime } from '/Users/kurous/code/liyuanci/liyuanci-miniprogram-uniapp/tests/support/page-runtime.ts'
import { whisperOperations,whisperSchemas } from '/Users/kurous/code/liyuanci/liyuanci-miniprogram-uniapp/src/utils/whispers-contract.ts'
import { matchesSchema } from '/Users/kurous/code/liyuanci/liyuanci-miniprogram-uniapp/src/utils/whispers-schema.ts'
const root='/Users/kurous/code/liyuanci/'
const address=process.env.JOINT_ADDRESS
assert.match(address,/^http:\/\/127\.0\.0\.1:\d+$/)
const cases=[],requests=[]
const read=(p)=>readFileSync(root+p,'utf8')
const delay=(ms)=>new Promise(r=>setTimeout(r,ms))
let currentToken=process.env.JOINT_ACTOR_TOKEN,epoch=1
const session={getToken:()=>currentToken,getEpoch:()=>epoch,clear:()=>{currentToken='';epoch++}}
const use=(t)=>{currentToken=t;epoch++}
const transport=async(url,init)=>{
 const response=await fetch(url,init)
 requests.push({method:init?.method??'GET',path:new URL(url).pathname.replace(/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/g,'{id}'),status:response.status,request_id:response.headers.get('x-request-id')??null})
 return response
}
const uni={
 $emit:()=>{},showToast:()=>{},
 request(options){
  transport(options.url,{method:options.method??'GET',headers:options.header,body:options.data===undefined?undefined:JSON.stringify(options.data)})
   .then(async r=>options.success({statusCode:r.status,data:r.status===204?undefined:await r.json()})).catch(()=>options.fail())
 }
}
const requestModule=await loadRuntime(read('liyuanci-miniprogram-uniapp/src/utils/request.ts'),{config:{isDev:true,useMock:false,apiBaseUrl:address+'/api/v1'},session,uni})
const api=await loadRuntime(read('liyuanci-miniprogram-uniapp/src/api/whispers.ts'),{request:requestModule.request,RequestError:requestModule.RequestError,session,whisperOperations,whisperSchemas,matchesSchema})
const adminTypes=await loadRuntime(read('liyuanci-admin-vue/src/types/admin.ts'),{})
const boundary=await loadRuntime(read('liyuanci-admin-vue/src/services/whispers/boundary.ts'),{record:adminTypes.record})
const parsers=await loadRuntime(read('liyuanci-admin-vue/src/services/whispers/parsers.ts'),boundary)
const common=await loadRuntime(read('liyuanci-admin-vue/src/services/admin.ts'),{})
const adminModule=await loadRuntime(read('liyuanci-admin-vue/src/services/whispers/index.ts'),{ApiError:common.ApiError,P:parsers,...boundary})
const admin=(token)=>adminModule.createWhispersClient(token,()=>true,(p,i)=>transport(address+p,i))
const reviewer=admin(process.env.JOINT_REVIEW_TOKEN),crisis=admin(process.env.JOINT_CRISIS_TOKEN),superAdmin=admin(process.env.JOINT_SUPER_TOKEN)
const signal=()=>new AbortController().signal
const call=(op,input={})=>api.callWhisper(op,input)
const write=(op,data,path={})=>call(op,{data,...(Object.keys(path).length?{path}:{}),key:randomUUID()})
const get=(op,path)=>call(op,path?{path}:{})
const wait=async(fn,limit=15000)=>{const end=Date.now()+limit;while(Date.now()<end){const v=await fn();if(v)return v;await delay(180)}throw Error('等待本地真实状态超时')}
let activeCase='初始化';
async function check(name,fn){activeCase=name;await fn();cases.push({name,result:'passed'});console.log('PASS '+name)}
try{
 let config,post,publicPost,comment,capsule
 await check('WI-17 配置、字典缺失及公共援助不可用',async()=>{config=await get('whisperConfigGet');assert.equal(config.enabled,true);assert.equal(config.semi_available,false);assert.equal((await get('whisperHelpGet')).status,'unavailable');await get('whisperWorkspaceGet')})
 await check('WI-01 小程序实际客户端保存、提交及worker公开',async()=>{post=await write('whisperPostCreate',{body:'本地隔离联调文字',identity:{mode:'anonymous'}});assert.equal(post.status,'draft');post=await write('whisperPostSubmit',{expected_version:post.version},{post_id:post.id});post=await wait(async()=>{const p=await get('whisperOwnPostGet',{post_id:post.id});return p.status==='published'?p:null});publicPost=await get('whisperPostGet',{post_id:post.id});assert.equal('account_id' in publicPost,false)})
 await check('WI-08 管理端真实客户端审核并由小程序观察公开',async()=>{let p=await write('whisperPostCreate',{body:'人工联调合成文本',identity:{mode:'anonymous'}});p=await write('whisperPostSubmit',{expected_version:p.version},{post_id:p.id});const summary=await wait(async()=>{const list=await reviewer.whisperAdminReviewsList(null,signal());return list.items.find(x=>x.source.id===p.id)});const d=await reviewer.whisperAdminReviewGet(summary.id,signal());const result=await reviewer.whisperAdminReviewDecide(d.id,{expected_version:d.version,expected_content_version:d.source.content_version,decision:'approved'},randomUUID(),signal());assert.equal(result.business_outcome,'published');assert.equal((await get('whisperPostGet',{post_id:p.id})).id,p.id)})
 await check('WI-16 真实服务端拒绝危机专岗普通审核读取',async()=>{await assert.rejects(crisis.whisperAdminReviewsList(null,signal()),e=>e.status===403)})
 use(process.env.JOINT_PEER_TOKEN)
 await check('WI-03 未认证账号不能发帖但能发表暖评',async()=>{await assert.rejects(write('whisperPostCreate',{body:'不应创建',identity:{mode:'anonymous'}}),e=>e.statusCode===403);comment=await write('whisperCommentCreate',{body:'未认证账号的合成暖评',identity:{mode:'anonymous'},expected_post_version:publicPost.version,expected_comments_epoch:publicPost.comments_epoch},{post_id:post.id});await wait(async()=>{const c=await get('whisperOwnCommentGet',{comment_id:comment.id});return c.status==='published'?c:null})})
 await check('WI-05 抱抱目标态与取消',async()=>{let p=await get('whisperPostGet',{post_id:post.id});const a=await write('whisperHugSet',{expected_post_version:p.version,expected_hug_version:p.my_hug.version,active:true},{post_id:post.id});assert.equal(a.my_hug.active,true);const b=await write('whisperHugSet',{expected_post_version:p.version,expected_hug_version:a.my_hug.version,active:false},{post_id:post.id});assert.equal(b.my_hug.active,false)})
 await check('WI-07 opaque黑名单创建、读取、解除及旧路由退出',async()=>{await write('interactionBlockCreate',{source:{kind:'whisper_post',id:post.id,content_version:publicPost.content_version}});const list=await get('interactionBlocksList');assert.equal(list.items.length,1);assert.equal('target_user_id' in list.items[0],false);await call('interactionBlockDelete',{path:{block_id:list.items[0].block_id},data:{expected_version:list.items[0].version},key:randomUUID()});const r=await transport(address+'/api/v1/me/blocks',{headers:{Authorization:'Bearer '+currentToken}});assert.equal(r.status,409);assert.equal((await r.json()).error_code,'CLIENT_UPGRADE_REQUIRED')})
 await check('WI-10 胶囊封存、元数据列表与提前读取无正文',async()=>{config=await get('whisperConfigGet');capsule=await write('whisperCapsuleCreate',{body:'本地隔离本人胶囊',unlock_at:new Date(Date.parse(config.server_now)+65000).toISOString().replace('.000Z','Z'),safety_notice_accepted:true});assert.equal(capsule.body,null);const list=await get('whisperCapsulesList');assert.ok(list.items.every(c=>c.body===null));assert.equal((await get('whisperCapsuleGet',{capsule_id:capsule.id})).body,null)})
 await check('WI-12 未认证胶囊危机、岗位隔离与接手',async()=>{const c=await write('whisperCapsuleCreate',{body:'危机联调合成文本',unlock_at:new Date(Date.parse((await get('whisperConfigGet')).server_now)+3600000).toISOString().replace('.000Z','Z'),safety_notice_accepted:true});const entry=await wait(async()=>{const l=await crisis.whisperAdminCrisesList(null,signal());return l.items.find(x=>x.source.id===c.id)});const d=await crisis.whisperAdminCrisisGet(entry.id,signal());assert.equal(d.student_number,null);assert.equal(d.identity_status,'not_verified');await assert.rejects(reviewer.whisperAdminCrisisGet(d.id,signal()),e=>e.status===403);const taken=await crisis.whisperAdminCrisisAct(d.id,{expected_version:d.version,action:'take_over',reason:'本地隔离合成接手'},randomUUID(),signal());assert.equal(taken.status,'in_progress');await superAdmin.whisperAdminEvidenceGet(d.evidence_scope_id,signal())})
 await check('WI-16 他人无法读取私密胶囊',async()=>{use(process.env.JOINT_ACTOR_TOKEN);await assert.rejects(get('whisperCapsuleGet',{capsule_id:capsule.id}),e=>e.statusCode===404);use(process.env.JOINT_PEER_TOKEN)})
 await check('WI-10/11 等待真实服务端到期、解锁读取与删除',async()=>{const c=await wait(async()=>{const c=await get('whisperCapsuleGet',{capsule_id:capsule.id});return c.status==='unlocked'?c:null},80000);assert.equal(c.body,'本地隔离本人胶囊');const deleted=await write('whisperCapsuleDelete',{expected_version:c.version},{capsule_id:c.id});assert.equal(deleted.body,null);assert.equal(deleted.status,'deleted')})
 use(process.env.JOINT_ACTOR_TOKEN)
 await check('WI-06 评论首次公开通知与已读',async()=>{const page=await get('whisperNotificationsList');const item=page.items.find(x=>x.kind==='whisper_comment');assert.ok(item);await write('whisperNotificationRead',{expected_version:item.version},{notification_id:item.id})})
 await check('WI-01 撤回后公共详情不可读',async()=>{const p=await get('whisperOwnPostGet',{post_id:post.id});await write('whisperPostWithdraw',{expected_version:p.version},{post_id:p.id});await assert.rejects(get('whisperPostGet',{post_id:p.id}),e=>e.statusCode===404)})
 await check('WA-05 实际后台列表响应严格解析',async()=>{await superAdmin.whisperAdminReportsList(null,signal());await superAdmin.whisperAdminCrisesList(null,signal())})
}catch(e){cases.push({name:activeCase,result:'failed',error:e.message.split('\n')[0].slice(0,250),actual:e.actual,expected:e.expected});console.error('FAIL '+cases.at(-1).error);process.exitCode=1}
finally{writeFileSync('/tmp/liyuanci-whispers-joint-20261028-r1/joint-results.json',JSON.stringify({boundary:'本地真实HTTP、源码客户端、PG/Redis与实际进程；平台桥、账号、KMS/扫描/清理/通知为隔离合成；非微信真机或页面联调',cases,requests},null,2))}
