"""T002/REQ-001、003、020：OpenAPI结构、引用、全部示例及字段边界校验。"""
import json
from pathlib import Path
from openapi_spec_validator import validate
from jsonschema import Draft202012Validator, RefResolver

root=Path(__file__).parent
api=json.loads((root/'openapi.v0.1.0.json').read_text())
validate(api)
resolver=RefResolver.from_schema(api)
def check(schema,value):Draft202012Validator(schema,resolver=resolver).validate(value)
ops=0; samples=0; ids=set()
for path,item in api['paths'].items():
 for method,op in item.items():
  assert op['operationId'] not in ids
  ids.add(op['operationId']);ops+=1
  assert op['x-task-id'].startswith('T') and op['x-req-ids']
  assert op['x-implementation-status']=='not-implemented'
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
assert ops==80
print(f'PASS T002/REQ-001,003,020: {ops} operations; {samples} request/response examples; 5 negative boundaries; refs and OpenAPI 3.1')
