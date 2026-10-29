import sys,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
HERE=Path(__file__).resolve().parent
from urllib.parse import urlsplit
sys.dont_write_bytecode=True
sys.path.insert(0,str(ROOT/'contracts/resource-plaza-v1'))
from validate import ContractValidator,FormatChecker
spec=json.load(open(ROOT/'contracts/resource-plaza-v1-r2/openapi.json'))
rows=json.load(open(HERE/'http-responses.json'));ops=set()
for row in rows:
 path=urlsplit(row['path']).path
 for p,methods in spec['paths'].items():
  if re.fullmatch(p.replace('{id}','[^/]+'),path) and row['method'].lower() in methods:
   op=methods[row['method'].lower()];break
 else:raise Exception(path)
 status=str(row['status']);assert status in op['responses'],(path,status)
 schema=op['responses'][status]['content']['application/json']['schema']
 ContractValidator({**schema,'components':spec['components']},format_checker=FormatChecker()).validate(row['body'])
 if row['status']<300:ops.add(op['operationId'])
print(json.dumps({'http_responses':len(rows),'success_operations':len(ops),'schema_and_text_invariants':'passed'}))
