#!/usr/bin/env python3
"""用户管理设计契约生成器；默认只读核对，固定文件禁止覆盖。"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DOCS = ROOT.parents[1]
CONTRACT = "admin-users/1.0.0"


def serialized(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def obj(properties):
    return {"type": "object", "properties": properties, "required": list(properties), "additionalProperties": False}


def ref(name):
    return {"$ref": "#/components/schemas/" + name}


def array(items):
    return {"type": "array", "items": items}


def outputs():
    text = {"type": "string"}
    identifier = {"type": "string", "format": "uuid"}
    timestamp = {"type": "string", "format": "date-time"}
    nullable_time = {"type": ["string", "null"], "format": "date-time"}
    version = {"type": "integer", "minimum": 1}
    def enum(*values):
        return {"type": "string", "enum": list(values)}
    def page(item):
        return obj({"items": array(ref(item)), "next_cursor": {"type": ["string", "null"], "minLength": 1}})
    summary = {
        "id": identifier, "display_name": {"type": ["string", "null"]},
        "verification": enum("unverified", "pending", "verified", "rejected"),
        "restriction": enum("normal", "muted", "banned"), "muted_until": nullable_time,
        "created_at": timestamp, "as_of": timestamp,
    }
    active = obj({"id": identifier, "kind": enum("mute", "ban"), "starts_at": timestamp, "ends_at": nullable_time})
    link = {"oneOf": [obj({"kind": enum("ordinary_report", "ordinary_review"), "id": identifier}), {"type": "null"}]}
    penalty = obj({
        "id": identifier, "level": enum("minor", "general", "severe"), "kind": enum("warning", "mute", "ban"),
        "status": enum("active", "expired", "revoked"), "starts_at": timestamp,
        "ends_at": nullable_time, "revoked_at": nullable_time, "reason": {"type": ["string", "null"]},
        "case_link": link, "appeal_id": {"type": ["string", "null"], "format": "uuid"},
    })
    detail = obj({**summary, "account_version": version, "active_penalties": array(ref("ActivePenalty")),
                  "allowed_actions": {**array(enum("view_penalties", "open_case_workspace", "open_appeal_workspace")), "uniqueItems": True}})
    schemas = {"UserSummary": obj(summary), "ActivePenalty": active, "UserDetail": detail,
               "UserPenalty": penalty, "UserPage": page("UserSummary"), "UserPenaltyPage": page("UserPenalty")}
    restriction_rule = {"if": {"properties": {"restriction": {"const": "muted"}}},
                        "then": {"properties": {"muted_until": {"type": "string", "format": "date-time"}}},
                        "else": {"properties": {"muted_until": {"type": "null"}}}}
    schemas["UserSummary"]["allOf"] = [restriction_rule]
    schemas["UserDetail"]["allOf"] = [restriction_rule]
    penalty["allOf"] = []
    for level, kind in [("minor", "warning"), ("general", "mute"), ("severe", "ban")]:
        penalty["allOf"].append({"if": {"properties": {"level": {"const": level}}}, "then": {"properties": {"kind": {"const": kind}}}})
    penalty["allOf"].append({"if": {"properties": {"kind": {"const": "mute"}}},
                              "then": {"properties": {"ends_at": {"type": "string", "format": "date-time"}}},
                              "else": {"properties": {"ends_at": {"type": "null"}}}})
    penalty["allOf"].append({"if": {"properties": {"status": {"const": "revoked"}}},
                              "then": {"properties": {"revoked_at": {"type": "string", "format": "date-time"}}},
                              "else": {"properties": {"revoked_at": {"type": "null"}}}})
    penalty["allOf"].append({"if": {"properties": {"status": {"const": "expired"}}}, "then": {"properties": {"kind": {"const": "mute"}}}})
    for data in ("UserPage", "UserDetail", "UserPenaltyPage"):
        schemas[data + "Envelope"] = obj({"code": {"type": "integer", "const": 0}, "message": text,
                                             "data": ref(data), "request_id": {"type": "string", "minLength": 1}})
    schemas["Error"] = obj({"code": {"type": "integer", "minimum": 1}, "message": text,
                            "error_code": enum("VALIDATION_FAILED", "UNAUTHENTICATED", "FORBIDDEN", "NOT_FOUND", "RATE_LIMITED", "INTERNAL_ERROR", "DEPENDENCY_UNAVAILABLE"),
                            "request_id": {"type": "string", "minLength": 1}})
    def parameter(name, schema, description, where="query", required=False):
        return {"name": name, "in": where, "required": required, "description": description, "schema": schema}
    paging = [parameter("limit", {"type": "integer", "minimum": 1, "maximum": 50, "default": 20}, "页大小；省略20，空值非法"),
              parameter("cursor", {"type": "string", "minLength": 1}, "服务端不透明游标；首请求省略，30分钟过期；后续完整回传原筛选")]
    filters = [parameter("user_id", identifier, "当前普通账号UUID，精确查找；与其他条件AND"),
               parameter("nickname", text, "首尾按semantics.md规定去空白，非空最多50码点；普通昵称字面包含，仅ASCII大小写不敏感；空词无筛选。此参数值必须从访问日志中屏蔽"),
               parameter("verification", summary["verification"], "省略表示全部；不接受all或空字符串"),
               parameter("restriction", summary["restriction"], "省略表示全部；按同一as_of计算，有效ban优先于mute")]
    headers = {"Cache-Control": {"required": True, "schema": {"type": "string", "const": "no-store"}, "description": "禁止缓存"},
               "X-Request-ID": {"required": True, "schema": {"type": "string", "minLength": 1}, "description": "请求关联标识"}}
    errors = {400: "VALIDATION_FAILED", 401: "UNAUTHENTICATED", 403: "FORBIDDEN", 404: "NOT_FOUND", 429: "RATE_LIMITED", 500: "INTERNAL_ERROR", 503: "DEPENDENCY_UNAVAILABLE"}
    def operation(name, title, schema, parameters, target=False):
        responses = {"200": {"description": "成功；空列表也是200", "headers": headers, "content": {"application/json": {"schema": ref(schema)}}}}
        for status, code in errors.items():
            if status == 404 and not target:
                continue
            responses[str(status)] = {"description": code, "headers": headers, "content": {"application/json": {"schema": ref("Error")}}}
        return {"operationId": name, "summary": title, "description": "规范语义见同包semantics.md。所有响应字段白名单，不含身份/匿名关联/案件正文。",
                "tags": ["admin-users"], "x-req-ids": ["REQ-022", "REQ-018", "REQ-019"],
                "x-implementation-status": "not-implemented", "x-success-schema": schema,
                "security": [{"AdminBearer": []}], "parameters": parameters, "responses": responses}
    path_id = parameter("id", identifier, "当前普通用户ID；不存在和deleting均404", "path", True)
    paths = {
        "/admin/users": {"get": operation("adminUsersList", "现存小程序用户查询，含昵称包含搜索", "UserPageEnvelope", filters + paging)},
        "/admin/users/{id}": {"get": operation("adminUserDetail", "脱敏详情及目标账号版本", "UserDetailEnvelope", [path_id], True)},
        "/admin/users/{id}/penalties": {"get": operation("adminUserPenaltiesList", "权限过滤后的用户处罚历史", "UserPenaltyPageEnvelope", [path_id] + paging, True)},
    }
    spec = {"openapi": "3.1.0", "info": {"title": "平台用户管理独立设计契约", "version": "1.0.0", "description": "设计交付，三个新增GET尚未实现；不覆盖0.2.1和whispers/1.0.0，不声明G3或运行验收。"},
            "servers": [{"url": "/api/v1"}], "paths": paths,
            "components": {"securitySchemes": {"AdminBearer": {"type": "http", "scheme": "bearer"}}, "schemas": schemas}}
    uid = "ac220000-0000-4000-8000-000000000001"
    uid2 = "ac220000-0000-4000-8000-000000000002"
    pid = "ac220000-0000-4000-8000-000000000011"
    rid = "ac220000-0000-4000-8000-000000000021"
    aid = "ac220000-0000-4000-8000-000000000031"
    now, end = "2026-10-29T04:00:00Z", "2026-11-05T03:00:00Z"
    user = {"id": uid, "display_name": "校园小鲤鱼", "verification": "verified", "restriction": "muted", "muted_until": end, "created_at": "2026-10-01T00:00:00Z", "as_of": now}
    other = {**user, "id": uid2, "restriction": "normal", "muted_until": None, "created_at": "2026-09-30T00:00:00Z"}
    detail_body = {**user, "account_version": 7, "active_penalties": [{"id": pid, "kind": "mute", "starts_at": "2026-10-29T03:00:00Z", "ends_at": end}],
                   "allowed_actions": ["view_penalties", "open_case_workspace", "open_appeal_workspace"]}
    history = {"id": pid, "level": "general", "kind": "mute", "status": "active", "starts_at": "2026-10-29T03:00:00Z", "ends_at": end, "revoked_at": None,
               "reason": "一般违规处置", "case_link": {"kind": "ordinary_report", "id": rid}, "appeal_id": aid}
    def envelope(data):
        return {"code": 0, "message": "成功", "data": data, "request_id": "synthetic-user-management-request"}
    exchanges = []
    def exchange(name, query, body, path=None):
        exchanges.append({"operation_id": name, "path_params": path or {}, "query": query, "status": 200, "body": envelope(body)})
    exchange("adminUsersList", {"nickname": "小鲤", "limit": 1}, {"items": [user], "next_cursor": "synthetic-opaque-page-2"})
    exchange("adminUsersList", {"nickname": "小鲤", "limit": 1, "cursor": "synthetic-opaque-page-2"}, {"items": [other], "next_cursor": None})
    exchange("adminUsersList", {"nickname": "无命中"}, {"items": [], "next_cursor": None})
    exchange("adminUserDetail", {}, detail_body, {"id": uid})
    exchange("adminUserPenaltiesList", {"limit": 20}, {"items": [history], "next_cursor": None}, {"id": uid})
    fixtures = []
    def fixture(name, schema, body, valid):
        fixtures.append({"name": name, "schema": schema, "body": body, "valid": valid})
    fixture("detail-valid", "UserDetail", detail_body, True)
    fixture("penalty-valid", "UserPenalty", history, True)
    fixture("nullable-name", "UserSummary", {**other, "display_name": None}, True)
    fixture("empty-page", "UserPage", {"items": [], "next_cursor": None}, True)
    for key in ("student_number", "student_card_url", "openid", "whisper_nickname", "body", "crisis_count"):
        fixture("reject-private-" + key, "UserDetail", {**detail_body, key: "forbidden"}, False)
    fixture("missing-account-version", "UserDetail", {k: v for k, v in detail_body.items() if k != "account_version"}, False)
    fixture("wrong-action", "UserDetail", {**detail_body, "allowed_actions": ["delete_user"]}, False)
    fixture("duplicate-action", "UserDetail", {**detail_body, "allowed_actions": ["view_penalties", "view_penalties"]}, False)
    fixture("bad-restriction", "UserSummary", {**user, "restriction": "online"}, False)
    fixture("muted-without-end", "UserSummary", {**user, "muted_until": None}, False)
    fixture("normal-with-mute-end", "UserSummary", {**user, "restriction": "normal"}, False)
    fixture("penalty-level-kind-mismatch", "UserPenalty", {**history, "level": "severe"}, False)
    fixture("revoked-without-time", "UserPenalty", {**history, "status": "revoked"}, False)
    fixture("bad-date", "UserSummary", {**user, "created_at": "yesterday"}, False)
    fixture("reason-not-body", "UserPenalty", {**history, "body": "forbidden"}, False)
    error_examples = []
    for status, code in errors.items():
        body = {"code": status, "message": "请求未完成", "error_code": code, "request_id": "synthetic-error-request"}
        error_examples.append({"http_status": status, "body": body})
    search_cases = [
        {"name": "middle", "nickname": "小鲤", "stored": "校园小鲤鱼", "match": True},
        {"name": "ascii-case", "nickname": "fish", "stored": "LiFish", "match": True},
        {"name": "literal-percent", "nickname": "%", "stored": "小鲤%", "match": True},
        {"name": "percent-no-wildcard", "nickname": "%", "stored": "小鲤", "match": False},
        {"name": "underscore-no-wildcard", "nickname": "_", "stored": "小鲤", "match": False},
        {"name": "spaces", "nickname": "  小鲤  ", "stored": "校园小鲤鱼", "match": True},
        {"name": "blank-unset", "nickname": " \t\n", "stored": None, "match": True},
        {"name": "no-placeholder-match", "nickname": "未设置", "stored": None, "match": False},
        {"name": "no-nfkc", "nickname": "A", "stored": "Ａ", "match": False},
        {"name": "no-unicode-fold", "nickname": "é", "stored": "É", "match": False},
        {"name": "quote-literal", "nickname": "' OR 1=1", "stored": "小鲤", "match": False},
        {"name": "backslash-literal", "nickname": "\\", "stored": "小\\鲤", "match": True},
    ]
    examples = {"contract_id": CONTRACT, "synthetic_only": True, "note": "opaque游标仅为schema/Mock占位，不是后端有效签名令牌。语义向量不代表真实数据库检查。",
                "exchanges": exchanges, "error_examples": error_examples, "fixtures": fixtures, "search_vectors": search_cases}
    actions = {"contract_id": CONTRACT, "new_writes": [],
               "navigation": [{"action": "view_penalties", "target": "GET /admin/users/{id}/penalties"},
                              {"action": "open_case_workspace", "target": "原有案件工作台选择当前目标的授权案件；不是命令"},
                              {"action": "open_appeal_workspace", "target": "原有申诉工作台；不是命令"}],
               "reused_writes": [
                   {"contract": "../openapi.v0.2.1.json", "operation_id": "postAdminUsersIdPenalties", "path": "/admin/users/{id}/penalties", "method": "POST",
                    "version_source": "UserDetail.account_version（public.accounts.version）；提交前重读，409重新确认", "idempotency": "Idempotency-Key", "precondition": "普通授权违规案件、目标作者及内容版本匹配；不得以树洞/危机案件调用此入口"},
                   {"contract": "../openapi.v0.2.1.json", "operation_id": "postAdminAppealsIdDecision", "path": "/admin/appeals/{id}/decision", "method": "POST",
                    "version_source": "原申诉详情version（public.appeals.version），禁止使用account_version", "idempotency": "Idempotency-Key", "precondition": "原申诉工作台当前授权与状态；revoke只撤关联处罚"},
                   {"contract": "../whispers-v1/openapi.json", "operation_id": "whisperAdminPenaltyCreate", "path": "/admin/whispers/contents/{kind}/{content_id}/penalties", "method": "POST",
                    "version_source": "ContentControl.version + ReportDetail.version（expected_report_version）", "idempotency": "Idempotency-Key", "precondition": "只在原树洞举报/治理工作台使用，不带回用户页形成作者关联"}],
               "forbidden": ["direct_revoke", "delete_user", "edit_profile", "bulk_penalty", "export", "arbitrary_user_penalty"]}
    return {"openapi.json": spec, "examples.json": examples, "actions.json": actions}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", action="store_true", help="仅首次生成未固定产物")
    args = parser.parse_args()
    frozen = json.loads((DOCS / "governance/frozen.json").read_text())["files"]
    for name, value in outputs().items():
        path = ROOT / name
        data = serialized(value)
        if path.exists() and path.read_text() == data:
            continue
        if not args.build:
            raise SystemExit("生成产物不一致：" + name)
        if str(path.relative_to(DOCS)) in frozen:
            raise SystemExit("拒绝覆盖固定产物：" + name)
        path.write_text(data)
    print("用户管理契约生成结果一致")


if __name__ == "__main__":
    main()
