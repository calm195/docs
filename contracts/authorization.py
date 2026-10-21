"""T002/B07：生成和校验正式静态动作索引，不执行运行时授权或业务。"""
import json
from pathlib import Path

ROOT = Path(__file__).parent


def operation_index(api):
    result = {}
    for path, methods in api['paths'].items():
        for method, operation in methods.items():
            schema = {}
            if 'requestBody' in operation:
                schema = next(iter(operation['requestBody']['content'].values()))['schema']
                if '$ref' in schema:
                    schema = api['components']['schemas'][schema['$ref'].split('/')[-1]]
            # 归属仅用于带动作的写入提示；GET不是可执行的写动作。
            projection = None
            if method != 'get' and (path.startswith('/me/') and '{' not in path or path in ['/auth/session', '/wishes']):
                projection = 'Me'
            if path.startswith('/wishes/{id}') and method != 'get':
                projection = 'WishResult'
            result[operation['operationId']] = {
                'method': method.upper(), 'path': '/api/v1' + path,
                'implementation': operation['x-implementation-status'],
                'projection': projection,
                'path_targets': [part[1:-1] for part in path.split('/') if part.startswith('{')],
                'version_fields': [name for name in schema.get('properties', {}) if name in ['expected_version', 'wish_expected_version', 'expected_write_epoch', 'expected_head_version', 'content_version']],
                'req_ids': operation['x-req-ids'],
            }
    return result


def artifacts(api):
    actions = operation_index(api)
    registry = {
        'base_contract': '0.2.0', 'revision': 4,
        'mode': 'static-protocol-index-not-authorization',
        'action_identifier': 'OpenAPI operationId（区分大小写，无事件名别名）',
        'missing_or_unknown': 'deny',
        'resource_binding': '动作必须属于当前投影/当前目标；不跨账号、案件或内容复用',
        'actions': actions,
        'role_refresh': {
            'bootstrap': 'postAdminSessions.data.account.roles',
            'refresh': '显式重新登录postAdminSessions；不增加GET或refresh端点',
            '401': '清除会话及角色快照，重新登录',
            '403': '拒绝当前操作，不重试；不能从403推导新角色或认定会话失效',
            'role_change': '服务端逐次查当前角色；前端不乐观提权，需更新菜单时显式重登',
            'password_change_204': '清除当前会话，重新登录',
            'ttl': None,
        },
    }
    return registry


def build(api):
    # 只生成正式静态词表；审核扩展由独立设计评审，不作为生成或校验依赖。
    (ROOT / 'actions.v0.2.0.json').write_text(
        json.dumps(artifacts(api), ensure_ascii=False, indent=2) + '\n')


def validate(api):
    registry = artifacts(api)
    assert json.loads((ROOT / 'actions.v0.2.0.json').read_text()) == registry
    assert len(registry['actions']) == 83
    assert registry['role_refresh']['ttl'] is None

    def permits(projection, supplied, action, current_target=None, command_target=None):
        # 合成消费判定同时校验投影和目标；此处不代替服务端当前授权。
        return (isinstance(supplied, list) and action in supplied
                and action in registry['actions']
                and projection is not None
                and registry['actions'][action]['projection'] == projection
                and current_target == command_target)

    assert permits('Me', ['postWishes'], 'postWishes', 'student-a', 'student-a')
    assert permits('WishResult', ['postWishesIdPublish'], 'postWishesIdPublish', 'wish-a', 'wish-a')
    for supplied in [None, [], {}, ['content.scan']]:
        assert not permits('Me', supplied, 'postWishes')
    for args in [('Me', ['content.scan'], 'content.scan'),
                 ('Me', ['postWishesIdPublish'], 'postWishesIdPublish'),
                 ('WishResult', ['postWishes'], 'postWishes'),
                 (None, ['postAdminAccounts'], 'postAdminAccounts')]:
        assert not permits(*args)
    assert not permits('WishResult', ['postWishesIdPublish'], 'postWishesIdPublish', 'wish-a', 'wish-b')
    assert not permits('Me', ['postWishes'], 'postWishes', 'student-a', 'student-b')
    for action in ['getAdminModerationTasksId', 'postAdminModerationTasksIdDecision',
                   'postAdminContentsKindIdOffline', 'postAdminContentsKindIdReleaseRestriction']:
        assert registry['actions'][action]['implementation'] == 'not-implemented'
    print('PASS T002/B07: 83 actions; missing/unknown/wrong projection/cross-target deny; no moderation extension dependency')
