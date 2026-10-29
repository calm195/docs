#!/usr/bin/env python3
"""生成资料广场模块契约；默认只读核对，--build不覆盖已固定差异。"""
import argparse
import copy
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
import rules

ROOT = Path(__file__).resolve().parent
DOCS = ROOT.parents[1]
CONTRACT = "resource-plaza/1.0.0"
METHODS = {"get", "post", "put"}


def serialized(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def ref(name):
    return {"$ref": "#/components/schemas/" + name}


def obj(properties, required=None):
    return {"type": "object", "properties": properties, "required": list(properties) if required is None else required, "additionalProperties": False}


def enum(*values):
    return {"type": "string", "enum": list(values)}


def text(kind, canonical=False, nullable=False):
    schema = {"type": ["string", "null"] if nullable else "string", "x-contract-text": {"kind": kind, "canonical": canonical},
              "description": "必须按semantics.md及rules.py规范化/校验；x-contract-text为本包强制约束，通用schema工具不能替代。"}
    if canonical and kind != "download_url":
        schema["maxLength"] = {"title": 100, "name": 30, "description": 2000, "extraction_code": 64, "reason": 500}[kind]
    return schema


def outputs():
    integer = {"type": "integer", "minimum": 0, "maximum": rules.SAFE_INTEGER}
    version = {**integer, "minimum": 1}
    identifier = {"type": "string", "format": "uuid", "pattern": "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"}
    output_id = {**identifier, "pattern": identifier["pattern"].replace("a-fA-F", "a-f")}
    timestamp = {"type": "string", "format": "date-time", "pattern": "Z$"}
    nullable_time = {**timestamp, "type": ["string", "null"]}
    cursor = {"type": "string", "minLength": 1, "maxLength": 2048}
    status = enum("draft", "published", "offline")
    def array(items, **extra):
        return {"type": "array", "items": items, **extra}
    def page(item, cap):
        return obj({"items": array(ref(item), maxItems=cap), "next_cursor": {**cursor, "type": ["string", "null"]}})
    actions = lambda *names: array(enum(*names), uniqueItems=True)
    category = obj({"id": output_id, "name": text("name", True)})
    content = {"id": output_id, "title": text("title", True), "category": ref("PublicCategory"),
               "version": version, "created_at": timestamp, "updated_at": timestamp, "published_at": timestamp}
    summary = {**content, "description_excerpt": {"type": "string", "maxLength": 120}}
    detail = {**content, "description": text("description", True), "download_url": text("download_url", True),
              "extraction_code": text("extraction_code", True, True), "content_version": version}
    feedback = obj({"resource_id": output_id, "content_version": version, "kind": enum(*rules.KINDS), "version": version, "updated_at": timestamp})
    counts = obj({"content_version": version, **{k: integer for k in rules.KINDS}, "total": integer})
    counts["x-invariant"] = "feedback_summary"
    admin_fields = {"status": status, "published_at": nullable_time, "content_version": version, "visibility_blocked": {"type": "boolean"},
                    "feedback_summary": ref("FeedbackSummary"), "allowed_actions": actions("update", "publish", "offline")}
    schemas = {
        "PublicCategory": category,
        "AdminCategory": obj({**category["properties"], "sort_order": {"type": "integer", "minimum": 0, "maximum": 9999},
                              "enabled": {"type": "boolean"}, "version": version, "created_at": timestamp, "updated_at": timestamp}),
        "ResourceSummary": obj(summary), "Feedback": feedback, "FeedbackSummary": counts,
        "ResourceDetail": {**obj({**detail, "my_feedback": {"oneOf": [ref("Feedback"), {"type": "null"}]},
                                   "allowed_actions": {"oneOf": [{"const": ["copy_download"]}, {"const": ["copy_download", "submit_feedback"]}]}}), "x-invariant": "student_detail"},
        "AdminResourceSummary": {**obj({**summary, **admin_fields}), "x-invariant": "admin_summary"},
        "AdminResourceDetail": {**obj({**detail, **admin_fields}), "x-invariant": "admin_detail"},
        "DownloadInfo": {**obj({"resource_id": output_id, "version": version, "download_url": text("download_url", True),
                                 "extraction_code": text("extraction_code", True, True), "copy_text": {"type": "string", "maxLength": 2120}}), "x-invariant": "download"},
    }
    inputs = {"title": text("title"), "category_id": identifier, "description": text("description", nullable=True),
              "download_url": text("download_url"), "extraction_code": text("extraction_code", nullable=True)}
    category_inputs = {"name": text("name"), "sort_order": {"type": "integer", "minimum": 0, "maximum": 9999}}
    schemas.update({
        "CreateResource": obj(inputs, ["title", "category_id", "download_url"]),
        "UpdateResource": obj({**inputs, "expected_version": version}),
        "PublishResource": obj({"expected_version": version}),
        "OfflineResource": obj({"expected_version": version, "reason": text("reason")}),
        "CreateCategory": obj(category_inputs, ["name"]),
        "UpdateCategory": obj({**category_inputs, "enabled": {"type": "boolean"}, "expected_version": version}),
        "PutFeedback": obj({"kind": enum(*rules.KINDS), "expected_content_version": version, "expected_feedback_version": integer}),
        "PublicCategoryPage": page("PublicCategory", 100), "AdminCategoryPage": page("AdminCategory", 100),
        "ResourcePage": page("ResourceSummary", 50), "AdminResourcePage": page("AdminResourceSummary", 50),
    })
    errors = {400: ["VALIDATION_FAILED"], 401: ["UNAUTHENTICATED"], 403: ["FORBIDDEN", "VERIFICATION_REQUIRED"],
              404: ["NOT_FOUND"], 409: ["VERSION_CONFLICT", "STATE_CONFLICT", "IDEMPOTENCY_CONFLICT", "CATEGORY_IN_USE", "CATEGORY_NAME_CONFLICT"],
              413: ["PAYLOAD_TOO_LARGE"], 415: ["UNSUPPORTED_MEDIA_TYPE"], 429: ["RATE_LIMITED"], 500: ["INTERNAL_ERROR"], 503: ["DEPENDENCY_UNAVAILABLE"]}
    for code, names in errors.items():
        schemas["Error" + str(code)] = obj({"code": {"type": "integer", "const": code}, "message": {"type": "string", "minLength": 1},
                                           "error_code": enum(*names), "request_id": {"type": "string", "minLength": 1}})
    for name in ("PublicCategoryPage", "AdminCategoryPage", "ResourcePage", "AdminResourcePage", "ResourceDetail", "AdminResourceDetail", "AdminCategory", "DownloadInfo", "Feedback"):
        schemas[name + "Envelope"] = obj({"code": {"type": "integer", "const": 0}, "message": {"type": "string"}, "data": ref(name), "request_id": {"type": "string", "minLength": 1}})
    def param(name, schema, where="query", required=False):
        return {"name": name, "in": where, "required": required, "schema": schema}
    rid = param("id", identifier, "path", True)
    key = param("Idempotency-Key", {"type": "string", "minLength": 1, "maxLength": 128, "pattern": "^[!-~]+$"}, "header", True)
    def paging(cap, default):
        return [param("limit", {"type": "integer", "minimum": 1, "maximum": cap, "default": default}), param("cursor", cursor)]
    filters = [param("category_id", identifier), param("q", text("q"))]
    defs = [
        ("resourceCategoriesList", "get", "/resource-categories", "student_read", "PublicCategoryPage", paging(100, 100), None, 200),
        ("resourcesList", "get", "/resources", "student_read", "ResourcePage", filters + paging(50, 20), None, 200),
        ("resourceDetail", "get", "/resources/{id}", "student_read", "ResourceDetail", [rid], None, 200),
        ("resourceDownloadInfo", "get", "/resources/{id}/download-info", "student_read", "DownloadInfo", [rid, param("expected_version", version, required=True)], None, 200),
        ("resourceFeedbackPut", "put", "/resources/{id}/feedback", "student_write", "Feedback", [rid], "PutFeedback", 200),
        ("adminResourcesList", "get", "/admin/resources", "admin", "AdminResourcePage", filters + [param("status", status)] + paging(50, 20), None, 200),
        ("adminResourceDetail", "get", "/admin/resources/{id}", "admin", "AdminResourceDetail", [rid], None, 200),
        ("adminResourceCreate", "post", "/admin/resources", "admin", "AdminResourceDetail", [], "CreateResource", 201),
        ("adminResourceUpdate", "put", "/admin/resources/{id}/content", "admin", "AdminResourceDetail", [rid], "UpdateResource", 200),
        ("adminResourcePublish", "post", "/admin/resources/{id}/publish", "admin", "AdminResourceDetail", [rid], "PublishResource", 200),
        ("adminResourceOffline", "post", "/admin/resources/{id}/offline", "admin", "AdminResourceDetail", [rid], "OfflineResource", 200),
        ("adminResourceCategoriesList", "get", "/admin/resource-categories", "admin", "AdminCategoryPage", [param("enabled", {"type": "boolean"})] + paging(100, 100), None, 200),
        ("adminResourceCategoryDetail", "get", "/admin/resource-categories/{id}", "admin", "AdminCategory", [rid], None, 200),
        ("adminResourceCategoryCreate", "post", "/admin/resource-categories", "admin", "AdminCategory", [], "CreateCategory", 201),
        ("adminResourceCategoryUpdate", "put", "/admin/resource-categories/{id}", "admin", "AdminCategory", [rid], "UpdateCategory", 200),
    ]
    headers = {"Cache-Control": {"required": True, "description": "所有成功/错误禁止缓存", "schema": {"type": "string", "const": "no-store"}}}
    titles = dict(zip((row[0] for row in defs), [
        "学生可见分类目录", "认证资料搜索与分页", "认证资料详情及本人反馈", "复制前重新获取下载信息", "创建或改选本人资料反馈",
        "后台资料查询", "后台资料详情", "创建完整资料草稿", "编辑未上架资料内容", "显式上架资料", "下架资料",
        "后台分类查询", "后台分类详情", "创建资料分类", "更新分类名称、顺序及启用状态",
    ]))
    def response(name, description):
        return {"description": description, "headers": headers, "content": {"application/json": {"schema": ref(name)}}}
    paths, index = {}, []
    for opid, method, path, principal, data, params, body, success in defs:
        applicable = {400: ["VALIDATION_FAILED"], 401: ["UNAUTHENTICATED"], 403: ["FORBIDDEN"], 429: ["RATE_LIMITED"], 500: ["INTERNAL_ERROR"], 503: ["DEPENDENCY_UNAVAILABLE"]}
        if principal != "admin":
            applicable[403] += ["VERIFICATION_REQUIRED"]
        if "{id}" in path:
            applicable[404] = ["NOT_FOUND"]
        if body:
            applicable[409] = ["IDEMPOTENCY_CONFLICT"] + ([] if body in ("CreateResource", "CreateCategory") else ["VERSION_CONFLICT"])
            applicable.update({413: ["PAYLOAD_TOO_LARGE"], 415: ["UNSUPPORTED_MEDIA_TYPE"]})
            if body in ("CreateResource", "UpdateResource", "PublishResource", "OfflineResource"):
                applicable[409] += ["STATE_CONFLICT"]
            if body in ("CreateCategory", "UpdateCategory"):
                applicable[409] += ["CATEGORY_NAME_CONFLICT"]
            if body == "UpdateCategory":
                applicable[409] += ["CATEGORY_IN_USE"]
        if opid == "resourceDownloadInfo":
            applicable[409] = ["VERSION_CONFLICT"]
        operation = {"operationId": opid, "summary": titles[opid], "description": "正式语义见semantics.md；接口尚未实现。", "tags": ["resource-plaza"],
                     "x-implementation-status": "not-implemented", "x-req-ids": ["REQ-023", "REQ-018", "REQ-019"],
                     "x-principal": principal, "x-success-schema": data + "Envelope", "x-success-status": success,
                     "x-error-codes": {str(k): v for k, v in applicable.items()},
                     "security": [{"AdminBearer" if principal == "admin" else "StudentBearer": []}],
                     "parameters": params + ([key] if body else []),
                     "responses": {str(success): response(data + "Envelope", "成功，重放返回当前可授权投影")}}
        for code, names in applicable.items():
            error_schema = {"allOf": [ref("Error" + str(code)), {"properties": {"error_code": {"enum": names}}}]}
            operation["responses"][str(code)] = {**response("Error" + str(code), "/".join(names)), "content": {"application/json": {"schema": error_schema}}}
        if body:
            operation["requestBody"] = {"required": True, "content": {"application/json": {"schema": ref(body)}}, "x-max-bytes": 65536}
            operation["x-request-schema"] = body
        paths.setdefault(path, {})[method] = operation
        index.append({"operation_id": opid, "method": method.upper(), "path": path, "principal": principal,
                      "request_schema": body, "success_schema": data + "Envelope", "idempotency": bool(body),
                      "implementation": "not-implemented"})
    spec = {"openapi": "3.1.0", "info": {"title": "资料广场正式模块契约", "version": "1.0.0", "description": "已固定开发输入，15接口均未实现；不代表G3或运行验收。规范扩展及语义见同包文档。"},
            "servers": [{"url": "/api/v1"}], "paths": paths,
            "components": {"securitySchemes": {name: {"type": "http", "scheme": "bearer"} for name in ("StudentBearer", "AdminBearer")}, "schemas": schemas}}
    action_index = {"contract_id": CONTRACT, "operations": index, "principals": {
        "student_read": "active且verified且有效学生会话、无ban；mute允许", "student_write": "student_read且无mute", "admin": ["review_operator", "super_admin"]},
        "projections": {
            "student_detail": [{"action": "copy_download", "operation_id": "resourceDownloadInfo", "versions": {"expected_version": "ResourceDetail.version"}},
                               {"action": "submit_feedback", "operation_id": "resourceFeedbackPut", "versions": {"expected_content_version": "ResourceDetail.content_version", "expected_feedback_version": "ResourceDetail.my_feedback.version或0"}}],
            "admin_resource": [{"action": name, "operation_id": op, "versions": {"expected_version": "AdminResourceDetail.version"}} for name, op in [("update", "adminResourceUpdate"), ("publish", "adminResourcePublish"), ("offline", "adminResourceOffline")]],
        }, "collection_writes": ["adminResourceCreate", "adminResourceCategoryCreate"],
        "category_write": {"operation_id": "adminResourceCategoryUpdate", "versions": {"expected_version": "AdminCategory.version"}},
        "forbidden_capabilities": ["report", "delete_resource", "delete_category", "upload_resource", "upload_qr", "online_contribution", "send_wechat", "read_feedback_users"]}
    return {"openapi.json": spec, "actions.json": action_index, "examples.json": examples(spec)}


def make_examples(spec):
    rid = "ac230000-0000-4000-8000-000000000001"
    cid = "ac230000-0000-4000-8000-000000000002"
    other = "ac230000-0000-4000-8000-000000000003"
    now = "2026-10-29T04:00:00Z"
    url = "https://files.example.invalid/share?id=sample#part"
    category = {"id": cid, "name": "合成学习资料"}
    admin_category = {**category, "sort_order": 0, "enabled": True, "version": 1, "created_at": now, "updated_at": now}
    summary = {"id": rid, "title": "合成高等数学期末资料", "category": category, "description_excerpt": "仅用于契约测试，不是正式资料。",
               "version": 3, "created_at": now, "updated_at": now, "published_at": now}
    mine = {"resource_id": rid, "content_version": 2, "kind": "valid", "version": 1, "updated_at": now}
    detail = {**{k: v for k, v in summary.items() if k != "description_excerpt"}, "content_version": 2, "description": summary["description_excerpt"],
              "download_url": url, "extraction_code": "Ab12", "my_feedback": mine, "allowed_actions": ["copy_download", "submit_feedback"]}
    counts = {"content_version": 2, "valid": 1, "link_invalid": 0, "outdated": 0, "incomplete": 0, "total": 1}
    admin_extra = {"status": "published", "visibility_blocked": False, "feedback_summary": counts, "allowed_actions": ["offline"]}
    admin_detail = {**{k: v for k, v in detail.items() if k not in ("my_feedback", "allowed_actions")}, **admin_extra}
    admin_summary = {**summary, "content_version": 2, **admin_extra}
    draft = {**admin_detail, "status": "draft", "version": 1, "content_version": 1, "published_at": None,
             "feedback_summary": {**{k: 0 for k in rules.KINDS}, "content_version": 1, "total": 0}, "allowed_actions": ["update", "publish"]}
    offline = {**admin_detail, "status": "offline", "version": 4, "allowed_actions": ["update", "publish"]}
    download = {"resource_id": rid, "version": 3, "download_url": url, "extraction_code": "Ab12", "copy_text": url + "\n提取码：Ab12"}
    sample_data = {
        "PublicCategoryPage": {"items": [category], "next_cursor": None}, "AdminCategoryPage": {"items": [admin_category], "next_cursor": None},
        "ResourcePage": {"items": [summary], "next_cursor": None}, "AdminResourcePage": {"items": [admin_summary], "next_cursor": None},
        "ResourceDetail": detail, "AdminResourceDetail": admin_detail, "AdminCategory": admin_category, "DownloadInfo": download, "Feedback": mine,
    }
    create = {"title": "合成高等数学期末资料", "category_id": cid, "download_url": url, "description": "仅用于契约测试，不是正式资料。", "extraction_code": "Ab12"}
    request_bodies = {"CreateResource": create, "UpdateResource": {**create, "expected_version": 4}, "PublishResource": {"expected_version": 2},
                      "OfflineResource": {"expected_version": 3, "reason": "修改资料信息"}, "CreateCategory": {"name": "合成学习资料"},
                      "UpdateCategory": {"name": "合成学习资料", "sort_order": 0, "enabled": True, "expected_version": 1},
                      "PutFeedback": {"kind": "valid", "expected_content_version": 2, "expected_feedback_version": 0}}
    exchanges, errors, fixtures = [], [], []
    def fixture(name, schema, value, valid):
        fixtures.append({"name": name, "schema": schema, "value": copy.deepcopy(value), "valid": valid})
    for path, methods in spec["paths"].items():
        for method, op in methods.items():
            body_name = op.get("x-request-schema")
            data = copy.deepcopy(sample_data[op["x-success-schema"].removesuffix("Envelope")])
            if op["operationId"] == "adminResourceCreate":
                data = draft
            if op["operationId"] in ("adminResourceUpdate", "adminResourceOffline"):
                data = offline
            exchange = {"operation_id": op["operationId"], "path_params": {"id": cid if "categories" in path else rid} if "{id}" in path else {},
                        "query": {"expected_version": "3"} if "download-info" in path else {},
                        "headers": {"Authorization": "Bearer synthetic-session-not-valid"}, "request_body": request_bodies.get(body_name),
                        "http_status": op["x-success-status"], "body": {"code": 0, "message": "成功", "data": data, "request_id": "synthetic-request"}}
            if body_name:
                exchange["headers"].update({"Idempotency-Key": "synthetic-command-" + op["operationId"], "Content-Type": "application/json"})
                fixture(body_name + "-valid", body_name, request_bodies[body_name], True)
                fixture(body_name + "-unknown-field", body_name, {**request_bodies[body_name], "admin_id": other}, False)
                required = spec["components"]["schemas"][body_name]["required"]
                for field in required:
                    fixture(body_name + "-missing-" + field, body_name, {k: v for k, v in request_bodies[body_name].items() if k != field}, False)
            exchanges.append(exchange)
            for code, names in op["x-error-codes"].items():
                for name in names:
                    errors.append({"operation_id": op["operationId"], "http_status": int(code), "body": {"code": int(code), "message": "请求未完成", "error_code": name, "request_id": "synthetic-error"}})
    for name, data in sample_data.items():
        fixture(name + "-valid", name, data, True)
        fixture(name + "-identity-leak", name, {**data, "account_id": other}, False)
    for name, data in [("draft", draft), ("offline", offline), ("held", {**offline, "visibility_blocked": True, "allowed_actions": ["update"]})]:
        fixture("admin-" + name, "AdminResourceDetail", data, True)
    fixture("muted-read-actions", "ResourceDetail", {**detail, "allowed_actions": ["copy_download"]}, True)
    fixture("no-feedback", "ResourceDetail", {**detail, "my_feedback": None}, True)
    fixture("no-code", "DownloadInfo", {**download, "extraction_code": None, "copy_text": url}, True)
    fixture("only-url-input", "CreateResource", {k: v for k, v in create.items() if k in ("title", "category_id", "download_url")}, True)
    fixture("input-normalization", "CreateResource", {**create, "title": "  资料  ", "description": None, "extraction_code": " \t"}, True)
    for field, invalid in [("title", " " * 3), ("title", "甲" * 101), ("description", "甲" * 2001), ("extraction_code", "a" * 65), ("download_url", "javascript:alert(1)")]:
        fixture("input-invalid-" + field + str(len(fixtures)), "CreateResource", {**create, field: invalid}, False)
    for value in (True, 1.0, -1, 0, rules.SAFE_INTEGER + 1, "3"):
        fixture("bad-resource-version-" + repr(value), "PublishResource", {"expected_version": value}, False)
    fixture("feedback-first-zero", "PutFeedback", request_bodies["PutFeedback"], True)
    fixture("feedback-empty-kind", "PutFeedback", {**request_bodies["PutFeedback"], "kind": ""}, False)
    fixture("feedback-invalid-kind", "PutFeedback", {**request_bodies["PutFeedback"], "kind": "report"}, False)
    fixture("feedback-wrong-target", "ResourceDetail", {**detail, "my_feedback": {**mine, "resource_id": other}}, False)
    fixture("feedback-old-content", "ResourceDetail", {**detail, "my_feedback": {**mine, "content_version": 1}}, False)
    fixture("counts-wrong-total", "FeedbackSummary", {**counts, "total": 2}, False)
    fixture("counts-old-version", "AdminResourceDetail", {**admin_detail, "feedback_summary": {**counts, "content_version": 1}}, False)
    fixture("student-report-action", "ResourceDetail", {**detail, "allowed_actions": ["copy_download", "report"]}, False)
    fixture("admin-published-edit", "AdminResourceDetail", {**admin_detail, "allowed_actions": ["update", "publish"]}, False)
    fixture("admin-held-publish", "AdminResourceDetail", {**offline, "visibility_blocked": True}, False)
    fixture("published-null-time", "AdminResourceDetail", {**admin_detail, "published_at": None}, False)
    fixture("wrong-copy-code", "DownloadInfo", {**download, "copy_text": url}, False)
    fixture("null-copy-text", "DownloadInfo", {**download, "copy_text": None}, False)
    fixture("summary-url-leak", "ResourceSummary", {**summary, "download_url": url}, False)
    fixture("admin-feedback-user-leak", "AdminResourceDetail", {**admin_detail, "feedback_users": [other]}, False)
    fixture("response-not-normalized", "ResourceDetail", {**detail, "title": " 资料 "}, False)
    fixture("response-null-description", "ResourceDetail", {**detail, "description": None}, False)
    fixture("too-many-items", "ResourcePage", {"items": [summary] * 51, "next_cursor": None}, False)
    fixture("bad-date", "ResourceDetail", {**detail, "updated_at": "yesterday"}, False)
    vectors = []
    def vector(name, kind, value, normalized=None, valid=True):
        vectors.append({"name": name, "kind": kind, "value": value, "normalized": normalized, "valid": valid})
    for kind, limit in [("title", 100), ("description", 2000), ("extraction_code", 64), ("name", 30), ("q", 100), ("reason", 500)]:
        vector(kind + "-limit", kind, "鲤" * limit, "鲤" * limit)
        vector(kind + "-over", kind, "鲤" * (limit + 1), valid=False)
    prefix = "https://files.example.invalid/"
    link = prefix + "学" * ((2048 - len(prefix)) // 3) + "a" * ((2048 - len(prefix)) % 3)
    vector("url-2048-bytes", "download_url", link, link)
    vector("url-2049-bytes", "download_url", link + "a", valid=False)
    vector("url-query-preserved", "download_url", " " + url + " ", url)
    for name, value in [("userinfo", "https://user:pass@example.invalid/a"), ("scheme", "file:///tmp/a"), ("space", "https://example.invalid/a b"), ("host", "https:///a"), ("port", "https://example.invalid:99999/a"), ("percent", "https://example.invalid/%x"), ("backslash", "https://example.invalid\\a")]:
        vector("url-" + name, "download_url", value, valid=False)
    vector("description-crlf", "description", "  第一行\r\n第二行\r ", "第一行\n第二行")
    vector("description-null", "description", None, "")
    vector("code-empty", "extraction_code", " \t\n", None)
    vector("code-case", "extraction_code", " Ab12 ", "Ab12")
    vector("emoji-codepoint", "title", "🐟" * 100, "🐟" * 100)
    vector("title-html-literal", "title", "<b>资料</b>", "<b>资料</b>")
    vector("query-blank", "q", rules.WHITE_SPACE, "")
    vector("title-internal-newline", "title", "资\n料", valid=False)
    vector("title-control", "title", "资\x00料", valid=False)
    searches = [
        {"q": "数学", "title": "高等数学", "description": "", "match": True},
        {"q": "期末", "title": "数学", "description": "期末复习", "match": True},
        {"q": "pdf", "title": "PDF手册", "description": "", "match": True},
        {"q": "%", "title": "数学", "description": "", "match": False},
        {"q": "_", "title": "数_学", "description": "", "match": True},
        {"q": "A", "title": "Ａ", "description": "", "match": False},
        {"q": "é", "title": "É", "description": "", "match": False},
        {"q": " ", "title": "数学", "description": "", "match": True},
    ]
    protocol = []
    for exchange in exchanges:
        protocol.append({"name": exchange["operation_id"] + "-wire-valid", "request": {k: copy.deepcopy(exchange[k]) for k in ("operation_id", "path_params", "query", "headers", "request_body")}, "valid": True})
    base = next(x for x in protocol if x["request"]["operation_id"] == "resourcesList")["request"]
    for name, pairs in [("duplicate-query", [["q", "a"], ["q", "b"]]), ("unknown-query", [["report", "1"]]), ("leading-zero", [["limit", "01"]]), ("signed-limit", [["limit", "+1"]]), ("empty-limit", [["limit", ""]]), ("float-limit", [["limit", "1.0"]]), ("too-large-limit", [["limit", "51"]]), ("blank-cursor", [["cursor", ""]])]:
        protocol.append({"name": name, "request": {**base, "query_pairs": pairs}, "valid": False})
    create_wire = next(x for x in protocol if x["request"]["operation_id"] == "adminResourceCreate")["request"]
    for name, raw in [("duplicate-json-key", '{"title":"a","title":"b"}'), ("non-finite-json", '{"title":NaN}'), ("invalid-json", '{'), ("unpaired-surrogate", json.dumps({**create, "title": "\ud800"}, ensure_ascii=True))]:
        protocol.append({"name": name, "request": {**create_wire, "raw_body": raw}, "valid": False})
    for name, changes in [("missing-idempotency", {"headers": {"Authorization": "Bearer synthetic", "Content-Type": "application/json"}}),
                          ("wrong-media", {"headers": {**create_wire["headers"], "Content-Type": "text/plain"}}),
                          ("oversized-body", {"raw_body": " " * 65537}),
                          ("empty-body", {"raw_body": ""})]:
        protocol.append({"name": name, "request": {**create_wire, **changes}, "valid": False})
    exchange_fixtures = []
    for operation_id in ("resourceDetail", "resourceDownloadInfo", "resourceFeedbackPut", "adminResourceDetail", "adminResourceCategoryDetail"):
        value = copy.deepcopy(next(x for x in exchanges if x["operation_id"] == operation_id))
        value["path_params"]["id"] = other
        exchange_fixtures.append({"name": operation_id + "-wrong-response-target", "exchange": value, "valid": False})
    value = copy.deepcopy(next(x for x in exchanges if x["operation_id"] == "resourceDownloadInfo"))
    value["query"]["expected_version"] = "2"
    exchange_fixtures.append({"name": "download-wrong-response-version", "exchange": value, "valid": False})
    value = copy.deepcopy(next(x for x in exchanges if x["operation_id"] == "resourceFeedbackPut"))
    value["request_body"]["expected_content_version"] = 1
    exchange_fixtures.append({"name": "feedback-wrong-response-content-version", "exchange": value, "valid": False})
    return {"contract_id": CONTRACT, "synthetic_only": True,
            "note": "所有token/链接/游标为隔离测试占位，不可用于服务认证；静态正反例不证明运行鉴权或并发。",
            "exchanges": exchanges, "exchange_fixtures": exchange_fixtures, "error_examples": errors, "fixtures": fixtures, "text_vectors": vectors,
            "search_vectors": searches, "protocol_vectors": protocol,
            "runtime_matrix": "../../design/resource-plaza-v1/delivery.md（RP-I01–18，未执行）"}


def examples(spec):
    """合成交互、正反schema夹具及协议向量；不是运行证据。"""
    return make_examples(spec)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", action="store_true", help="仅写入未固定产物；默认只读比较")
    args = parser.parse_args()
    frozen = json.loads((DOCS / "governance/frozen.json").read_text())["files"]
    pending = []
    for name, value in outputs().items():
        path, data = ROOT / name, serialized(value)
        if path.exists() and path.read_text() == data:
            continue
        if not args.build:
            raise SystemExit("生成产物不一致：" + name)
        if str(path.relative_to(DOCS)) in frozen:
            raise SystemExit("拒绝改写固定文件：" + name)
        pending.append((path, data))
    for path, data in pending:
        path.write_text(data)
    print("资料广场契约生成一致：15接口；未调用业务服务。")


if __name__ == "__main__":
    main()
