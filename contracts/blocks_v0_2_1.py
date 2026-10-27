"""生成并校验黑名单增量契约，保留已固定的旧版本和工具输出。"""
import argparse
import copy
import hashlib
import json
from pathlib import Path

from authorization import operation_index

ROOT = Path(__file__).parent
OUTPUTS = ('openapi.v0.2.1.json', 'examples.v0.2.1.json', 'actions.v0.2.1.json')


def artifacts():
    """仅在旧正式契约上补齐既有黑名单读取和准确动作归属。"""
    api = json.loads((ROOT / 'openapi.v0.2.0.json').read_text())
    api['info']['version'] = '0.2.1'
    api['x-contract-revision'] = 6
    api['x-revision-scope'] = '黑名单既有读取投影和动作归属；其他实现元数据继承历史revision 5'
    schemas = api['components']['schemas']
    schemas['BlockEntry'] = {
        'type': 'object', 'additionalProperties': False,
        'properties': {
            'target_user_id': copy.deepcopy(schemas['BlockInput']['properties']['target_user_id']),
            'version': {'type': 'integer', 'minimum': 1, 'description': '本条有向拉黑记录的版本；不是Me.version'},
        },
        'required': ['target_user_id', 'version'],
    }
    schemas['BlockPage'] = {
        'type': 'object', 'additionalProperties': False,
        'properties': {
            'items': {'type': 'array', 'items': {'$ref': '#/components/schemas/BlockEntry'}},
            'next_cursor': {'type': ['string', 'null']},
        },
        'required': ['items', 'next_cursor'],
    }
    schemas['BlockPageEnvelope'] = copy.deepcopy(schemas['AppealPageEnvelope'])
    schemas['BlockPageEnvelope']['properties']['data'] = {'$ref': '#/components/schemas/BlockPage'}
    listing = copy.deepcopy(api['paths']['/me/appeals']['get'])
    listing.update(operationId='getMeBlocks', summary='读取本人黑名单及条目版本',
                   description='有效本人学生会话；当前禁言或封禁403。按created_at和target_id倒序，游标签名绑定账号与读取用途。省略cursor读首页；篡改、跨账号、跨用途或格式无效400。合法历史游标可继续向后读，无时间到期承诺。删除造成空页合法；终页next_cursor为null。',
                   **{'x-task-id': 'T026', 'x-req-ids': ['REQ-014', 'REQ-018']})
    listing['responses']['200']['content']['application/json'] = {
        'schema': {'$ref': '#/components/schemas/BlockPageEnvelope'},
        'example': {'code': 0, 'message': '成功', 'data': {
            'items': [{'target_user_id': '6c500000-0000-4000-8000-000000000001', 'version': 2}],
            'next_cursor': None}, 'request_id': 'synthetic-request-id'},
    }
    api['paths']['/me/blocks']['get'] = listing
    for path, method in [('/me/blocks', 'get'), ('/me/blocks', 'post'), ('/me/blocks/{target_id}', 'delete')]:
        operation = api['paths'][path][method]
        operation['x-implementation-status'] = 'implemented-opt-in'
        operation['x-resource-mode'] = 'postgres-isolated-synthetic-validation'
        operation['x-backend-evidence'] = '../development/backend/milestones/2026-10-27-blocks-contract-r1.md'
    deletion = api['paths']['/me/blocks/{target_id}']['delete']
    deletion['description'] += ' expected_version必须来自GET /me/blocks的对应条目；旧版本409 VERSION_CONFLICT；不存在或不归本人404。同键成功重放不重复解除，新一轮拉黑的记录不因旧请求复活或删除。'
    schemas['Me']['description'] = schemas['Me'].get('description', '') + ' 安全模块已启用且当前普通资料动作可用时，解除提示仅为deleteMeBlocksTarget_Id；当前账号绑定仍由Me.id确定，具体目标和版本来自本人BlockEntry。'
    examples = json.loads((ROOT / 'examples.v0.2.0.json').read_text())
    examples['deleteMeBlocksTarget_Id']['request']['body']['expected_version'] = 2
    deletion['requestBody']['content']['application/json']['example']['expected_version'] = 2
    examples['getMeBlocks'] = {
        'task_id': 'T026', 'req_ids': ['REQ-014', 'REQ-018'], 'mode': 'synthetic-contract-example',
        'request': {'headers': {}, 'method': 'GET', 'path': '/api/v1/me/blocks?limit=20'},
        'response': {'status': 200, 'body': listing['responses']['200']['content']['application/json']['example']},
        'empty_response': {'code': 0, 'message': '成功', 'data': {'items': [], 'next_cursor': None}, 'request_id': 'synthetic-request-id'},
    }
    actions = operation_index(api)
    actions['deleteMeBlocksTarget_Id'].update(projection='Me', version_source='BlockEntry.version', target_source='BlockEntry.target_user_id')
    registry = json.loads((ROOT / 'actions.v0.2.0.json').read_text())
    registry.update(base_contract='0.2.1', revision=6, actions=actions)
    registry['legacy_aliases'] = {'deleteMeBlocks': {'accepted_by_new_server': False, 'static_index_action': False, 'migration': '后端仅发正式名；已核对小程序可消费正式名，其他消费者升级前核对'}}
    return dict(zip(OUTPUTS, (api, examples, registry)))


def review_manifest():
    """登记新版本文件和生成输入，避免重算或覆盖旧指纹。"""
    names = list(OUTPUTS) + ['blocks_v0_2_1.py', 'blocks.v0.2.1.md', 'openapi.v0.2.0.json', 'actions.v0.2.0.json', 'authorization.py']
    return {
        'base_commit': '2ce12b1105b7acac8f50b002ac6d418eabe3f2ff',
        'contract': '0.2.1', 'index_revision': 6,
        'scope': '既有黑名单读取、条目版本和正式解除动作；不扩展业务权限',
        'hashes': {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in names},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--build', action='store_true', help='写入尚未固定的新版本；已存在且不同则拒绝覆盖')
    args = parser.parse_args()
    expected = artifacts()
    if args.build:
        for name, value in expected.items():
            path = ROOT / name
            if path.exists() and json.loads(path.read_text()) != value:
                raise RuntimeError('拒绝覆盖已存在且不同的新版本：' + name)
            if not path.exists():
                path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
        path = ROOT / 'actions-review.v0.2.1-r6.json'
        if path.exists() and json.loads(path.read_text()) != review_manifest():
            raise RuntimeError('拒绝覆盖已存在且不同的指纹清单')
        if not path.exists():
            path.write_text(json.dumps(review_manifest(), ensure_ascii=False, indent=2) + '\n')
    from openapi_spec_validator import validate
    from jsonschema import Draft202012Validator, RefResolver
    for name, value in expected.items():
        assert json.loads((ROOT / name).read_text()) == value, name
    assert json.loads((ROOT / 'actions-review.v0.2.1-r6.json').read_text()) == review_manifest()
    api, examples, registry = (expected[name] for name in OUTPUTS)
    validate(api)
    resolver = RefResolver.from_schema(api)
    def check(schema, value):
        Draft202012Validator(schema, resolver=resolver).validate(value)
    samples = 0
    for path, methods in api['paths'].items():
        for method, operation in methods.items():
            for media in operation.get('requestBody', {}).get('content', {}).values():
                if 'example' in media:
                    check(media['schema'], media['example']); samples += 1
            for response in operation['responses'].values():
                for media in response.get('content', {}).values():
                    if 'example' in media:
                        check(media['schema'], media['example']); samples += 1
    page = {'$ref': '#/components/schemas/BlockPageEnvelope'}
    check(page, examples['getMeBlocks']['response']['body'])
    check(page, examples['getMeBlocks']['empty_response'])
    for name, value in [('BlockEntry', {'target_user_id': 'synthetic'}),
                        ('BlockEntry', {'target_user_id': 'synthetic', 'version': 0}),
                        ('BlockEntry', {'target_user_id': 'synthetic', 'version': 1, 'nickname': '不允许扩展私有投影'}),
                        ('BlockPage', {'items': []}),
                        ('VersionCommand', {'expected_version': 0})]:
        assert list(Draft202012Validator({'$ref': '#/components/schemas/' + name}, resolver=resolver).iter_errors(value)), name
    assert len(registry['actions']) == 84 and 'deleteMeBlocks' not in registry['actions']
    delete = registry['actions']['deleteMeBlocksTarget_Id']
    assert delete['projection'] == 'Me' and delete['version_source'] == 'BlockEntry.version'
    assert registry['actions']['getMeBlocks']['projection'] is None
    old = json.loads((ROOT / 'openapi.v0.2.0.json').read_text())
    changed = {('/me/blocks', 'post'), ('/me/blocks/{target_id}', 'delete')}
    for path, methods in old['paths'].items():
        for method, operation in methods.items():
            if (path, method) not in changed:
                assert api['paths'][path][method] == operation
    print(f'契约0.2.1/revision 6校验通过：84操作，{samples}个媒体示例；黑名单正反例、动作归属、条目版本及旧版本保留检查通过')


if __name__ == '__main__':
    main()
