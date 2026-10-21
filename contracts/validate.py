"""T002/REQ-001、003、020：OpenAPI结构、引用、全部示例及字段边界校验。"""
import json
from pathlib import Path
from openapi_spec_validator import validate
from jsonschema import Draft202012Validator, RefResolver

root=Path(__file__).parent
api=json.loads((root/'openapi.v0.2.0.json').read_text())
validate(api)
resolver=RefResolver.from_schema(api)
def check(schema,value):Draft202012Validator(schema,resolver=resolver).validate(value)
ops=0; samples=0; ids=set()
for path,item in api['paths'].items():
 for method,op in item.items():
  assert op['operationId'] not in ids
  ids.add(op['operationId']);ops+=1
  assert op['x-task-id'].startswith('T') and op['x-req-ids']
  expected_implemented=(method,path) in {('post','/admin/accounts'),('post','/admin/sessions'),('post','/admin/password'),('delete','/admin/session')}
  assert op['x-implementation-status']==('implemented-opt-in' if expected_implemented else 'not-implemented')
  if expected_implemented:assert op['x-resource-mode']=='postgres-redis-opt-in' and op['x-backend-evidence'].endswith('/phase-05.md')
  if method!='get' and path not in ['/auth/wechat-sessions','/admin/sessions']:
   assert any(p.get('$ref','').endswith('/IdempotencyKey') for p in op['parameters'])
  if 'requestBody' in op:
   for c in op['requestBody']['content'].values():
    if 'example' in c:check(c['schema'],c['example']);samples+=1
  for response in op['responses'].values():
   for c in response.get('content',{}).values():
    if 'example' in c:check(c['schema'],c['example']);samples+=1
# 基线Unicode码点和期限边界；不把静态校验声称为服务端已实现。
base={'category':'team','body':'鲤'*500,'campus':'any'}
check({'$ref':'#/components/schemas/WishInput'},base)
negative=[('WishInput',{**base,'body':'鲤'*501}),('WishInput',{**base,'duration_days':0}),('WishInput',{**base,'duration_days':31}),('WishInput',{**base,'duration_days':1.5}),('ReviewDecision',{'decision':'rejected','expected_version':1,'reason':'合成原因'})]
for name,value in negative:
 assert list(Draft202012Validator({'$ref':'#/components/schemas/'+name},resolver=resolver).iter_errors(value)),name
# T002/B04/B05/B07，REQ-002、015、018、019：批准边界的静态回归，不能替代真实授权验收。
card=api['paths']['/admin/identity-reviews/{id}/student-card']['get']
assert card['security']==[{'AdminSession':[]}]
card_response=card['responses']['200']
assert set(card_response['content'])=={'application/octet-stream'}
assert card_response['content']['application/octet-stream']['schema']=={'type':'string','format':'binary'}
assert 'no-store' in card_response['headers']['Cache-Control']['description'].lower()
summary=api['components']['schemas']['CaseSummary']
assert not {'name','student_number','asset_id','body'} & set(summary['properties'])
assert summary['additionalProperties'] is False
for field in ('name','student_number','asset_id'):
 assert field in api['components']['schemas']['IdentityCase']['required']
assert not api['components']['schemas']['IdentityTags']['required']
assert 'identity_tags' not in api['components']['schemas']['WishInput']['required']
assert set(api['components']['schemas']['ModerationOutcome']['required'])=={'content_decision','business_outcome','version'}
# 用户2026-10-21确认后的字段正反例；不把静态校验当成登录/词库已实现。
schemas=api['components']['schemas']
for schema in ('AdminLoginInput','AccountInput','AdminPasswordInput'):
 assert schemas[schema]['additionalProperties'] is False
assert 'x-blocked-by' not in api['paths']['/admin/sessions']['post']
assert api['paths']['/admin/password']['post']['security']==[{'AdminSession':[]}]
assert api['paths']['/admin/accounts']['post']['security']==[{'AdminSession':[]}]
assert 'password' not in schemas['Account']['properties']
for gender in ('male','female','undisclosed'):
 check({'$ref':'#/components/schemas/IdentityTags'},{'gender':gender})
check({'$ref':'#/components/schemas/IdentityTags'}, {})
check({'$ref':'#/components/schemas/IdentityTags'},{'grade':'合成年级'})
for schema,value in [
 ('IdentityTags',{'gender':'unknown'}),
 ('AdminLoginInput',{'login_name':'synthetic','password':'synthetic','roles':['super_admin']}),
 ('AccountInput',{'login_name':'synthetic','roles':[],'reason':'合成','password':'synthetic'}),
 ('AdminPasswordInput',{'new_password':'synthetic'}),
 ('WordlistInput',{'kind':'school','entries':['合成']}),
 ('WordlistPublish',{'expected_version':1}),
 ('Wordlist',{'id':'synthetic','version':1,'kind':'school','status':'active','base_effective_id':None})]:
 assert list(Draft202012Validator({'$ref':'#/components/schemas/'+schema},resolver=resolver).iter_errors(value)),schema
check({'$ref':'#/components/schemas/VerificationInput'},{'student_number':'合成','name':'合成','asset_id':'synthetic'})
check({'$ref':'#/components/schemas/VerificationInput'},{'student_number':'合成','name':'合成','asset_id':'synthetic','expected_version':3})
check({'$ref':'#/components/schemas/WordlistInput'},{'kind':'school','entries':['合成'],'expected_version':1})
check({'$ref':'#/components/schemas/WordlistPublish'},{'expected_version':1,'expected_head_version':2})
asset=api['paths']['/me/student-card-assets/{id}']['get']
assert asset['security']==[{'StudentSession':[]}]
assert set(schemas['Asset']['properties']['scan_status']['enum'])=={'pending','approved','rejected'}
bad_heads={'items':[],'next_cursor':None,'heads':[{'kind':'school','version':1,'effective_id':None}]*3}
assert list(Draft202012Validator({'$ref':'#/components/schemas/WordlistPage'},resolver=resolver).iter_errors(bad_heads))
assert ops==83
print(f'PASS T002/REQ-001,003,020: {ops} operations; {samples} request/response examples; 5 negative boundaries; refs and OpenAPI 3.1; B02/B03/B04/B05/B06/B07 static boundaries; 8 new negative cases')
