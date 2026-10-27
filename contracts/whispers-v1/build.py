#!/usr/bin/env python3
"""生成独立悄悄鲤设计契约；固定后只允许校验，禁止覆盖固定输入。"""
import argparse
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCHEMAS = {}
PATHS = {}
ACTIONS = []


def ref(name):
    return {"$ref": "#/components/schemas/" + name}


def obj(properties, required=None):
    return {"type": "object", "properties": properties,
            "required": list(properties) if required is None else required,
            "additionalProperties": False}


def arr(item, minimum=0):
    return {"type": "array", "items": item, "minItems": minimum}


def enum(*values):
    return {"type": "string", "enum": list(values)}


def nullable(schema):
    return {"anyOf": [schema, {"type": "null"}]}


ID = {"type": "string", "format": "uuid", "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      "description": "随机资源ID，不是作者账号ID"}
VER = {"type": "integer", "minimum": 1}
COUNT = {"type": "integer", "minimum": 0}
BOOL = {"type": "boolean"}
TEXT = {"type": "string", "minLength": 1, "maxLength": 500, "pattern": r"\S"}
NOTE = {"type": "string", "minLength": 1, "maxLength": 500, "pattern": r"\S"}
LABEL = {"type": "string", "minLength": 2, "maxLength": 20, "pattern": r"\S"}
TIME = {"type": "string", "format": "date-time", "pattern": r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$",
        "description": "RFC3339 UTC，以Z结尾，秒精度；服务端时间"}
STRING = {"type": "string"}
CURSOR = {"type": "string", "minLength": 1, "maxLength": 4096}
STATE = enum("draft", "scanning", "review_pending", "published", "rejected", "withdrawn",
             "cancelled", "restricted", "isolated", "privacy_hold", "context_changed")
KINDS = enum("whisper_post", "whisper_comment", "whisper_nickname", "whisper_capsule")


def schema(name, value):
    SCHEMAS[name] = value
    return ref(name)


schema("AllowedActions", {"type": "array", "items": STRING, "uniqueItems": True,
                         "description": "operationId白名单，服务端当前投影；不是授权凭证"})
schema("Tags", obj({"campus": enum("wushan", "university_town", "international"),
                    "grade": {"type": "string", "minLength": 1, "maxLength": 32},
                    "gender": enum("male", "female", "undisclosed")}))
schema("IdentityInput", {"oneOf": [
    obj({"mode": {"const": "anonymous"}}),
    obj({"mode": {"const": "semi"}, "tags": ref("Tags"), "dictionary_version": VER}),
    obj({"mode": {"const": "named"}, "nickname_version": VER})]})
schema("PublicIdentity", obj({"mode": enum("anonymous", "semi", "named"), "label": STRING,
                              "tags": nullable(ref("Tags")), "is_author": BOOL}))
SCHEMAS["PublicIdentity"]["allOf"] = [{"if": {"properties": {"mode": {"enum": ["anonymous", "named"]}}},
    "then": {"properties": {"tags": {"type": "null"}}},
    "else": {"properties": {"tags": ref("Tags")}}}]
schema("ReviewResult", obj({"decision": enum("pending", "approved", "rejected", "cancelled"),
                            "content_version": VER, "reason": nullable(NOTE),
                            "revision_suggestion": nullable(NOTE)}))
SCHEMAS["ReviewResult"]["allOf"] = [{"if": {"properties": {"decision": {"const": "rejected"}}},
    "then": {"properties": {"reason": NOTE, "revision_suggestion": NOTE}},
    "else": {"properties": {"reason": {"type": "null"}, "revision_suggestion": {"type": "null"}}}}]
schema("ContentRef", obj({"kind": KINDS, "id": ID, "content_version": VER}))
schema("VersionCommand", obj({"expected_version": VER}))
schema("ReasonCommand", obj({"expected_version": VER, "reason": NOTE}))
schema("HelpItem", obj({"kind": enum("school_appointment", "hotline"), "label": STRING,
                        "contact": STRING, "source_url": {"type": "string", "format": "uri"}}))
schema("HelpDirectory", obj({"status": enum("ready", "unavailable"), "version": nullable(VER),
                             "verified_at": nullable(TIME), "items": arr(ref("HelpItem"))}))
schema("ModuleConfig", obj({
    "contract_version": {"const": "whispers/1.0.0"}, "enabled": BOOL, "server_now": TIME,
    "semi_available": BOOL, "grade_dictionary": obj({"version": nullable(VER),
        "items": arr(obj({"code": STRING, "label": STRING}))}),
    "limits": obj({"text_codepoints": {"const": 500}, "nickname_min": {"const": 2},
        "nickname_max": {"const": 20}, "capsule_min_delay_seconds": {"const": 60},
        "capsule_max_delay_seconds": {"const": 31536000}, "capsule_active_limit": {"const": 20}}),
    "report_types": arr(obj({"code": STRING, "label": STRING})),
    "block_api": {"const": "opaque-v1"}}))
schema("Workspace", obj({"server_now": TIME, "verification": enum("unverified", "pending", "verified", "rejected"),
                         "write_restricted": BOOL, "allowed_actions": ref("AllowedActions")}))
schema("HugState", obj({"active": BOOL, "version": COUNT}))
common_public = {"id": ID, "version": VER, "content_version": VER, "body": TEXT,
                 "identity": ref("PublicIdentity"), "published_at": TIME,
                 "school_related": BOOL, "notice_codes": arr(enum("UNVERIFIED_SCHOOL")),
                 "notice_text": nullable({"const": "未经证实"}), "viewer_is_author": BOOL,
                 "allowed_actions": ref("AllowedActions")}
schema("PublicPost", obj({**common_public, "comments_open": BOOL, "comments_epoch": VER,
    "comment_count": COUNT, "hug_count": COUNT, "my_hug": nullable(ref("HugState"))}))
schema("PublicComment", obj({**common_public, "post_id": ID, "parent_content_version": VER}))
for public_name in ["PublicPost", "PublicComment"]:
    SCHEMAS[public_name]["allOf"] = [{"if": {"properties": {"school_related": {"const": False}}},
        "then": {"properties": {"notice_codes": {"maxItems": 0}, "notice_text": {"type": "null"}}},
        "else": {"properties": {"notice_codes": {"contains": {"const": "UNVERIFIED_SCHOOL"}},
                                "notice_text": {"const": "未经证实"}}}}]
owner_common = {"id": ID, "version": VER, "content_version": VER, "status": STATE,
    "body": nullable(TEXT), "identity_input": nullable(ref("IdentityInput")),
    "review_result": nullable(ref("ReviewResult")), "created_at": TIME, "updated_at": TIME,
    "published_at": nullable(TIME), "allowed_actions": ref("AllowedActions")}
schema("OwnerPost", obj({**owner_common, "comments_open": BOOL, "comments_epoch": VER}))
SCHEMAS["OwnerPost"]["properties"]["status"] = enum(*(s for s in STATE["enum"] if s != "context_changed"))
schema("OwnerComment", obj({**owner_common, "post_id": nullable(ID), "parent_content_version": VER,
                            "recovery_body": nullable(TEXT)}))
SCHEMAS["OwnerComment"]["properties"]["status"] = enum(*(s for s in STATE["enum"] if s != "draft"))
for owner_name in ["OwnerPost", "OwnerComment"]:
    SCHEMAS[owner_name]["allOf"] = [{"if": {"properties": {"status": {
        "enum": ["privacy_hold", "isolated", "restricted"]}}},
        "then": {"properties": {"body": {"type": "null"}, "identity_input": {"type": "null"}}}}]
SCHEMAS["OwnerComment"]["allOf"].append({"if": {"properties": {"status": {"not": {"const": "privacy_hold"}}}},
    "then": {"properties": {"recovery_body": {"type": "null"}}}})
schema("PostCreate", obj({"body": TEXT, "identity": ref("IdentityInput")}))
schema("PostUpdate", obj({"expected_version": VER, "body": TEXT, "identity": ref("IdentityInput")}))
schema("CommentCreate", obj({"expected_post_version": VER, "expected_comments_epoch": VER,
                             "body": TEXT, "identity": ref("IdentityInput")}))
schema("CommentUpdate", obj({"expected_version": VER, "expected_post_version": VER,
                             "expected_comments_epoch": VER, "body": TEXT, "identity": ref("IdentityInput")}))
schema("CommentsSetting", obj({"expected_version": VER, "comments_open": BOOL}))
schema("HugCommand", obj({"expected_post_version": VER, "expected_hug_version": COUNT, "active": BOOL}))
schema("HugResult", obj({"post_id": ID, "hug_count": COUNT, "my_hug": ref("HugState")}))
schema("NicknameState", obj({"version": VER,
    "active": nullable(obj({"nickname_version": VER, "label": LABEL})),
    "candidate": nullable(obj({"nickname_version": VER, "label": LABEL,
        "status": enum("scanning", "review_pending", "approved", "rejected", "restricted", "isolated"),
        "review_result": nullable(ref("ReviewResult"))})), "allowed_actions": ref("AllowedActions")}))
schema("NicknameCommand", obj({"expected_version": VER, "label": LABEL}))
schema("CapsuleCreate", obj({"body": TEXT, "unlock_at": TIME, "safety_notice_accepted": {"const": True}}))
capsule = obj({"id": ID, "version": VER, "status": enum("scanning", "review_pending", "locked", "unlocked",
    "rejected", "isolated", "cancelled", "deleted"), "unlock_at": TIME, "server_now": TIME,
    "created_at": TIME, "body": nullable(TEXT), "review_result": nullable(ref("ReviewResult")),
    "allowed_actions": ref("AllowedActions")})
capsule["allOf"] = [{"if": {"properties": {"status": {"not": {"const": "unlocked"}}}},
                     "then": {"properties": {"body": {"type": "null"}}},
                     "else": {"properties": {"body": TEXT}}}]
schema("Capsule", capsule)
schema("CapsuleSummary", obj({**copy.deepcopy(capsule["properties"]), "body": {"type": "null"}}))
schema("SourceRef", {"oneOf": [obj({"kind": enum("whisper_post", "whisper_comment"), "id": ID,
                                    "content_version": VER}),
    obj({"kind": {"const": "public_profile"}, "id": ID})]})
schema("BlockCreate", obj({"source": ref("SourceRef")}))
schema("BlockAck", obj({"accepted": {"const": True}}))
schema("BlockEntry", obj({"block_id": ID, "version": VER, "label": {"const": "已屏蔽对象"},
                          "allowed_actions": ref("AllowedActions")}))
schema("ReportCreate", obj({"source": obj({"kind": enum("whisper_post", "whisper_comment"),
                                            "id": ID, "content_version": VER}),
                            "type_code": {"type": "string", "minLength": 1, "maxLength": 32},
                            "description": {"type": "string", "maxLength": 500}}, ["source", "type_code"]))
schema("ReportAck", obj({"id": ID, "status": {"const": "pending"}}))
schema("Notification", obj({"id": ID, "version": VER, "kind": enum("whisper_comment", "whisper_capsule_unlocked"),
    "target_kind": enum("post", "capsule"), "target_id": ID, "comment_id": nullable(ID),
    "read": BOOL, "created_at": TIME, "notice": STRING, "allowed_actions": ref("AllowedActions")}))
schema("ReviewSummary", obj({"id": ID, "version": VER, "source": ref("ContentRef"),
    "status": enum("pending", "approved", "rejected", "cancelled"), "created_at": TIME,
    "allowed_actions": ref("AllowedActions")}))
schema("ReviewDetail", obj({**SCHEMAS["ReviewSummary"]["properties"], "body": TEXT,
    "school_related": BOOL, "privacy_recheck": BOOL}))
schema("ReviewCommand", obj({"expected_version": VER, "expected_content_version": VER,
    "decision": enum("approved", "rejected"), "reason": NOTE, "revision_suggestion": NOTE},
    ["expected_version", "expected_content_version", "decision"]))
SCHEMAS["ReviewCommand"]["allOf"] = [{"if": {"properties": {"decision": {"const": "rejected"}}},
    "then": {"required": ["reason", "revision_suggestion"]}}]
schema("ReviewOutcome", obj({"id": ID, "version": VER, "content_decision": enum("approved", "rejected"),
    "business_outcome": enum("published", "nickname_activated", "capsule_locked", "capsule_unlocked",
                              "cancelled", "rejected", "privacy_review_required")}))
schema("ContentControl", obj({"source": ref("ContentRef"), "version": VER,
    "restricted": BOOL, "state": enum(*STATE["enum"], "approved", "locked", "unlocked", "deleted"),
    "allowed_actions": ref("AllowedActions")}))
schema("RestrictionCommand", obj({"expected_version": VER, "restricted": BOOL, "reason": NOTE}))
schema("ReportSummary", obj({"id": ID, "version": VER, "source": ref("ContentRef"),
    "status": enum("pending", "confirmed", "dismissed"), "created_at": TIME,
    "allowed_actions": ref("AllowedActions")}))
schema("ReportDetail", obj({**SCHEMAS["ReportSummary"]["properties"], "type_code": STRING,
    "description": nullable(TEXT), "body": TEXT}))
schema("ReportDecision", obj({"expected_version": VER, "decision": enum("confirmed", "dismissed"), "reason": NOTE}))
schema("PenaltyCommand", obj({"expected_version": VER, "report_id": ID, "expected_report_version": VER,
                              "level": enum("minor", "general", "severe"), "reason": NOTE}))
schema("PenaltyResult", obj({"id": ID, "kind": enum("warning", "mute", "ban"),
                             "ends_at": nullable(TIME)}))
schema("CrisisSummary", obj({"id": ID, "version": VER, "source": ref("ContentRef"),
    "status": enum("open", "in_progress", "resolved", "false_positive"),
    "handoff_at": TIME, "allowed_actions": ref("AllowedActions")}))
schema("TimelineEntry", obj({"at": TIME, "action": STRING, "operator_label": STRING, "reason": nullable(NOTE)}))
schema("CrisisDetail", obj({**SCHEMAS["CrisisSummary"]["properties"], "body": TEXT,
    "student_number": nullable(STRING), "identity_status": enum("verified", "not_verified"),
    "evidence_scope_id": ID, "timeline": arr(ref("TimelineEntry")),
    "care_delivery": enum("pending", "delivered", "cancelled"),
    "staff_delivery": enum("pending", "delivered", "cancelled")}))
schema("CrisisCommand", obj({"expected_version": VER, "action": enum("take_over", "follow_up", "resolve", "retry_notification"),
                             "reason": NOTE}))
schema("EvidenceScope", obj({"id": ID, "version": VER, "state": enum("retained", "deleting"),
    "allowed_actions": ref("AllowedActions")}))
schema("EvidenceDelete", obj({"expected_version": VER, "confirmation": {"const": "DELETE_EVIDENCE_SCOPE"}, "reason": NOTE}))
schema("DeletionJob", obj({"id": ID, "status": enum("processing", "completed"),
    "scope": {"const": "evidence"}, "allowed_actions": ref("AllowedActions")}))

for item in ["PublicPost", "PublicComment", "OwnerPost", "OwnerComment", "Capsule", "BlockEntry", "Notification",
             "ReviewSummary", "ReportSummary", "CrisisSummary"]:
    schema(item + "Page", obj({"items": arr(ref(item)), "next_cursor": nullable(CURSOR)}))
SCHEMAS["CapsulePage"]["properties"]["items"]["items"] = ref("CapsuleSummary")

ERROR_CODES = ["VALIDATION_FAILED", "UNAUTHENTICATED", "VERIFICATION_REQUIRED", "FORBIDDEN", "NOT_FOUND",
               "VERSION_CONFLICT", "STATE_CONFLICT", "IDEMPOTENCY_CONFLICT", "INTERACTION_UNAVAILABLE",
               "DICTIONARY_CHANGED", "MODE_UNAVAILABLE", "NICKNAME_NOT_READY", "UNLOCK_TIME_INVALID",
               "CAPSULE_LIMIT", "RATE_LIMITED", "DEPENDENCY_UNAVAILABLE", "MODULE_UNAVAILABLE",
               "CLIENT_UPGRADE_REQUIRED", "INTERNAL_ERROR"]
schema("Error", obj({"code": {"type": "integer", "minimum": 1}, "message": STRING,
                     "error_code": enum(*ERROR_CODES), "request_id": STRING,
                     "retry_after_seconds": COUNT}, ["code", "message", "error_code", "request_id"]))


def operation(path, method, op, summary, result, request=None, auth="student", status=200,
              page=False, projection=None, version_source="不适用", reqs=None):
    params = []
    import re
    for name in re.findall(r"\{([^}]+)\}", path):
        params.append({"name": name, "in": "path", "required": True,
                       "schema": KINDS if name == "kind" else ID})
    if page:
        params += [{"name": "limit", "in": "query", "schema": {"type": "integer", "minimum": 1, "maximum": 50, "default": 20}},
                   {"name": "cursor", "in": "query", "schema": CURSOR}]
    if method != "get":
        params.append({"name": "Idempotency-Key", "in": "header", "required": True,
                       "schema": {"type": "string", "format": "uuid"}})
    headers = {"Cache-Control": {"schema": {"const": "no-store"}},
               "Pragma": {"schema": {"const": "no-cache"}},
               "X-Request-ID": {"schema": STRING}}
    response = {"description": summary + "；仅表示该操作结果", "headers": headers}
    if result:
        ename = result + "Response"
        if ename not in SCHEMAS:
            schema(ename, obj({"code": {"const": 0}, "message": STRING,
                              "data": ref(result), "request_id": STRING}))
        response["content"] = {"application/json": {"schema": ref(ename)}}
    responses = {str(status): response}
    for code in [400, 401, 403, 404, 409, 429, 500, 503]:
        responses[str(code)] = {"description": "按api.md错误表处理；不返回身份或旧正文",
            "headers": headers, "content": {"application/json": {"schema": ref("Error")}}}
    responses["429"]["headers"] = {**headers, "Retry-After": {"schema": {"type": "integer", "minimum": 1}}}
    item = {"operationId": op, "summary": summary, "parameters": params, "responses": responses,
            "security": ([{}, {"StudentBearer": []}] if auth == "optional" else
                         ([] if auth == "public" else [{"AdminBearer" if auth.startswith("admin") else "StudentBearer": []}])),
            "x-auth-scope": auth, "x-implementation-status": "not-implemented",
            "x-requirements": reqs or ["REQ-009", "REQ-010", "REQ-011", "REQ-018"],
            "x-success-schema": result, "x-request-schema": request}
    if request:
        item["requestBody"] = {"required": True, "content": {"application/json": {"schema": ref(request)}}}
    PATHS.setdefault(path, {})[method] = item
    if method != "get":
        ACTIONS.append({"operation_id": op, "projection": projection,
                        "target": path, "version_source": version_source, "auth_scope": auth})


operation("/whispers/config", "get", "whisperConfigGet", "模块配置及字典", "ModuleConfig", auth="public")
operation("/whispers/help", "get", "whisperHelpGet", "公众援助目录", "HelpDirectory", auth="public")
operation("/whispers/posts", "get", "whisperPostsList", "公开帖子列表", "PublicPostPage", auth="optional", page=True)
operation("/whispers/posts/{post_id}", "get", "whisperPostGet", "公开帖子详情", "PublicPost", auth="optional")
operation("/whispers/posts/{post_id}/comments", "get", "whisperCommentsList", "当前上下文公开评论", "PublicCommentPage", auth="optional", page=True)
operation("/me/whispers", "get", "whisperWorkspaceGet", "本人模块动作", "Workspace")
operation("/me/whispers/posts", "get", "whisperOwnPostsList", "本人帖子列表", "OwnerPostPage", page=True)
operation("/me/whispers/posts", "post", "whisperPostCreate", "创建文字草稿", "OwnerPost", "PostCreate", status=201, projection="Workspace.allowed_actions")
operation("/me/whispers/posts/{post_id}", "get", "whisperOwnPostGet", "本人帖子详情", "OwnerPost")
operation("/me/whispers/posts/{post_id}", "put", "whisperPostUpdate", "保存新草稿并隐藏旧公开版本", "OwnerPost", "PostUpdate", projection="OwnerPost.allowed_actions", version_source="OwnerPost.version")
for suffix, op, summary, status in [("submit", "whisperPostSubmit", "提交当前草稿审核", 202),
                                    ("withdraw", "whisperPostWithdraw", "撤回并取消待审", 200)]:
    operation("/me/whispers/posts/{post_id}/" + suffix, "post", op, summary, "OwnerPost", "VersionCommand",
              status=status, projection="OwnerPost.allowed_actions", version_source="OwnerPost.version")
operation("/me/whispers/posts/{post_id}/comments-setting", "put", "whisperCommentsSetting", "关闭或恢复评论", "OwnerPost", "CommentsSetting", projection="OwnerPost.allowed_actions", version_source="OwnerPost.version")
operation("/whispers/posts/{post_id}/comments", "post", "whisperCommentCreate", "提交新暖评", "OwnerComment", "CommentCreate", status=202, projection="PublicPost.allowed_actions", version_source="PublicPost.version + comments_epoch")
operation("/me/whispers/comments", "get", "whisperOwnCommentsList", "本人暖评列表", "OwnerCommentPage", page=True)
operation("/me/whispers/comments/{comment_id}", "get", "whisperOwnCommentGet", "本人暖评详情", "OwnerComment")
operation("/me/whispers/comments/{comment_id}", "put", "whisperCommentUpdate", "改稿并重提暖评", "OwnerComment", "CommentUpdate", status=202, projection="OwnerComment.allowed_actions", version_source="OwnerComment.version + 当前PublicPost.version/comments_epoch")
operation("/me/whispers/comments/{comment_id}/withdraw", "post", "whisperCommentWithdraw", "撤回暖评", "OwnerComment", "VersionCommand", projection="OwnerComment.allowed_actions", version_source="OwnerComment.version")
operation("/whispers/posts/{post_id}/hugs", "put", "whisperHugSet", "设置或取消本人抱抱", "HugResult", "HugCommand", projection="PublicPost.allowed_actions", version_source="PublicPost.version + my_hug.version，首次为0")
operation("/me/whispers/nickname", "get", "whisperNicknameGet", "本人树洞昵称状态", "NicknameState")
operation("/me/whispers/nickname", "put", "whisperNicknameSet", "提交昵称新版本审核", "NicknameState", "NicknameCommand", status=202, projection="NicknameState.allowed_actions", version_source="NicknameState.version")
operation("/me/whispers/capsules", "get", "whisperCapsulesList", "本人胶囊元数据列表", "CapsulePage", page=True)
operation("/me/whispers/capsules", "post", "whisperCapsuleCreate", "封存本人胶囊并启动扫描", "CapsuleSummary", "CapsuleCreate", status=202, projection="Workspace.allowed_actions")
operation("/me/whispers/capsules/{capsule_id}", "get", "whisperCapsuleGet", "本人按当前条件读取胶囊", "Capsule")
for suffix, op, summary in [("cancel", "whisperCapsuleCancel", "取消未解锁胶囊"), ("delete", "whisperCapsuleDelete", "删除已解锁或不可用胶囊")]:
    operation("/me/whispers/capsules/{capsule_id}/" + suffix, "post", op, summary, "CapsuleSummary", "VersionCommand", projection="Capsule/CapsuleSummary.allowed_actions", version_source="Capsule.version 或 CapsuleSummary.version")
operation("/me/interaction-blocks", "get", "interactionBlocksList", "所有来源不透明黑名单", "BlockEntryPage", page=True)
operation("/me/interaction-blocks", "post", "interactionBlockCreate", "按授权来源屏蔽作者", "BlockAck", "BlockCreate", projection="PublicPost/PublicComment/Workspace.allowed_actions")
operation("/me/interaction-blocks/{block_id}", "delete", "interactionBlockDelete", "解除本人不透明黑名单条目", None, "VersionCommand", status=204, projection="BlockEntry.allowed_actions", version_source="BlockEntry.version")
operation("/whispers/reports", "post", "whisperReportCreate", "举报当前可见帖子或暖评", "ReportAck", "ReportCreate", status=202, projection="PublicPost/PublicComment.allowed_actions")
operation("/me/whispers/notifications", "get", "whisperNotificationsList", "本人模块通知", "NotificationPage", page=True)
operation("/me/whispers/notifications/{notification_id}/read", "post", "whisperNotificationRead", "标记本人通知已读", "Notification", "VersionCommand", projection="Notification.allowed_actions", version_source="Notification.version")
operation("/admin/whispers/reviews", "get", "whisperAdminReviewsList", "树洞普通命中案件", "ReviewSummaryPage", auth="admin-review", page=True)
operation("/admin/whispers/reviews/{review_id}", "get", "whisperAdminReviewGet", "授权精确版本复核详情", "ReviewDetail", auth="admin-review")
operation("/admin/whispers/reviews/{review_id}/decision", "post", "whisperAdminReviewDecide", "普通审核决定", "ReviewOutcome", "ReviewCommand", auth="admin-review", projection="ReviewDetail.allowed_actions", version_source="ReviewDetail.version + source.content_version")
operation("/admin/whispers/reviews/{review_id}/escalate", "post", "whisperAdminReviewEscalate", "将当前案件升级危机", "CrisisSummary", "ReasonCommand", auth="admin-review-and-crisis", projection="ReviewDetail.allowed_actions", version_source="ReviewDetail.version")
operation("/admin/whispers/contents/{kind}/{content_id}", "get", "whisperAdminContentGet", "内容治理当前版本", "ContentControl", auth="admin-safety")
operation("/admin/whispers/contents/{kind}/{content_id}/restriction", "put", "whisperAdminRestrictionSet", "设置限制或解除后重新审核", "ContentControl", "RestrictionCommand", auth="admin-safety", projection="ContentControl.allowed_actions", version_source="ContentControl.version")
operation("/admin/whispers/contents/{kind}/{content_id}/penalties", "post", "whisperAdminPenaltyCreate", "依据已确认举报处罚来源主体", "PenaltyResult", "PenaltyCommand", auth="admin-safety", projection="ContentControl.allowed_actions", version_source="ContentControl.version + ReportDetail.version")
operation("/admin/whispers/reports", "get", "whisperAdminReportsList", "树洞举报列表", "ReportSummaryPage", auth="admin-safety", page=True)
operation("/admin/whispers/reports/{report_id}", "get", "whisperAdminReportGet", "树洞举报限定详情", "ReportDetail", auth="admin-safety")
operation("/admin/whispers/reports/{report_id}/decision", "post", "whisperAdminReportDecide", "确认或驳回举报", "ReportSummary", "ReportDecision", auth="admin-safety", projection="ReportDetail.allowed_actions", version_source="ReportDetail.version")
operation("/admin/whispers/reports/{report_id}/escalate", "post", "whisperAdminReportEscalate", "从授权举报升级危机", "CrisisSummary", "ReasonCommand", auth="admin-crisis", projection="ReportDetail.allowed_actions", version_source="ReportDetail.version")
operation("/admin/whispers/crises", "get", "whisperAdminCrisesList", "树洞危机案件", "CrisisSummaryPage", auth="admin-crisis", page=True)
operation("/admin/whispers/crises/{crisis_id}", "get", "whisperAdminCrisisGet", "危机限定身份与时间线", "CrisisDetail", auth="admin-crisis")
operation("/admin/whispers/crises/{crisis_id}/actions", "post", "whisperAdminCrisisAct", "危机接手跟进结案与通知重试", "CrisisDetail", "CrisisCommand", auth="admin-crisis", projection="CrisisDetail.allowed_actions", version_source="CrisisDetail.version")
operation("/admin/whispers/crises/{crisis_id}/false-positive", "post", "whisperAdminCrisisFalsePositive", "危机误报转普通复核", "CrisisDetail", "ReasonCommand", auth="admin-crisis", projection="CrisisDetail.allowed_actions", version_source="CrisisDetail.version")
operation("/admin/whispers/evidence/{evidence_id}", "get", "whisperAdminEvidenceGet", "证据范围删除所需最小元数据", "EvidenceScope", auth="admin-super")
operation("/admin/whispers/evidence/{evidence_id}/deletion-requests", "post", "whisperAdminEvidenceDelete", "受理证据范围删除", "DeletionJob", "EvidenceDelete", auth="admin-super", status=202, projection="EvidenceScope.allowed_actions", version_source="EvidenceScope.version")
operation("/admin/whispers/deletions/{job_id}", "get", "whisperAdminDeletionGet", "证据删除待办当前结果", "DeletionJob", auth="admin-super")
SCHEMAS["AllowedActions"]["items"] = enum(*(a["operation_id"] for a in ACTIONS))
projection_actions = {}
for action in ACTIONS:
    names, field = action["projection"].rsplit(".", 1)
    for name in names.split("/"):
        projection_actions.setdefault(name, []).append(action["operation_id"])
for name, value in SCHEMAS.items():
    if "allowed_actions" in value.get("properties", {}):
        names = sorted(projection_actions.get(name, []))
        value["properties"]["allowed_actions"] = ({"type": "array", "items": enum(*names), "uniqueItems": True}
            if names else {"type": "array", "items": STRING, "maxItems": 0})


def sample(value):
    """生成确定性合成样例，私密胶囊等条件由专门样例覆盖。"""
    if "$ref" in value:
        name = value["$ref"].rsplit("/", 1)[1]
        out = sample(SCHEMAS[name])
        if name in ["Capsule", "CapsuleSummary"]:
            out["body"] = None
        if name == "PublicIdentity":
            out["tags"] = None
        if name in ["PublicPost", "PublicComment"]:
            out["notice_text"] = None
        if name == "PublicPost":
            out["identity"]["is_author"] = True
        if name == "ReviewResult":
            out.update(reason=None, revision_suggestion=None)
        if name == "OwnerComment":
            out["recovery_body"] = None
        return out
    if "const" in value:
        return value["const"]
    if "enum" in value:
        return value["enum"][0]
    if "oneOf" in value or "anyOf" in value:
        return sample(value.get("oneOf", value.get("anyOf"))[0])
    t = value.get("type")
    if t == "object":
        return {k: sample(value["properties"][k]) for k in value["required"]}
    if t == "array":
        return []
    if t == "integer":
        return value.get("minimum", 0)
    if t == "boolean":
        return False
    if t == "null":
        return None
    if value.get("format") == "uuid":
        return "6c500000-0000-4000-8000-000000000001"
    if value.get("format") == "date-time":
        return "2026-10-28T04:00:00Z"
    if value.get("format") == "uri":
        return "https://example.invalid/synthetic-resource"
    return "合成文本"


def outputs():
    spec = {"openapi": "3.1.0", "info": {"title": "悄悄鲤首期模块设计契约", "version": "1.0.0",
        "description": "设计交付，所有新接口未实现；与全站0.2.1并用，语音延期。"},
        "servers": [{"url": "/api/v1"}], "paths": PATHS,
        "components": {"schemas": SCHEMAS, "securitySchemes": {
            "StudentBearer": {"type": "http", "scheme": "bearer"},
            "AdminBearer": {"type": "http", "scheme": "bearer"}}},
        "x-contract-id": "whispers/1.0.0", "x-status": "design-delivery-not-implemented"}
    examples = []
    for path, methods in PATHS.items():
        for method, op in methods.items():
            for direction, name in [("request", op["x-request-schema"]), ("response", op["x-success-schema"])]:
                if name:
                    target = name + "Response" if direction == "response" else name
                    body = sample(ref(target))
                    if direction == "response":
                        data = body["data"]
                        if name in ["Capsule", "CapsuleSummary"]:
                            data["body"] = None
                        if name == "OwnerComment":
                            data.update(status="scanning", recovery_body=None, review_result=None, published_at=None)
                        if name == "OwnerPost":
                            data.update(status="scanning" if op["operationId"] == "whisperPostSubmit" else
                                ("withdrawn" if op["operationId"] == "whisperPostWithdraw" else "draft"),
                                review_result=None, published_at=None)
                        if name == "OwnerComment" and op["operationId"] == "whisperCommentWithdraw":
                            data["status"] = "withdrawn"
                        if name in ["Capsule", "CapsuleSummary"] and op["operationId"] in ["whisperCapsuleCancel", "whisperCapsuleDelete"]:
                            data["status"] = "cancelled" if op["operationId"] == "whisperCapsuleCancel" else "deleted"
                        if name == "NicknameState" and op["operationId"] == "whisperNicknameGet":
                            data.update(active=None, candidate=None)
                    examples.append({"operation_id": op["operationId"], "direction": direction,
                        "path_template": path, "method": method.upper(), "schema": target,
                        "status": int(next(iter(op["responses"]))) if direction == "response" else None,
                        "parameters": {p["name"]: sample(p["schema"]) for p in op["parameters"]},
                        "body": body, "synthetic": True})
    fixtures = []
    for name in SCHEMAS:
        if name.endswith("Response"):
            continue
        body = sample(ref(name))
        if name == "ReviewCommand":
            body["decision"] = "rejected"
            body["reason"] = "合成驳回原因"
            body["revision_suggestion"] = "请修改合成示例内容"
        fixtures.append({"name": name, "schema": name, "body": body, "valid": True})
        if name.endswith("Page"):
            nonempty = copy.deepcopy(body)
            nonempty["items"] = [sample(SCHEMAS[name]["properties"]["items"]["items"])]
            nonempty["next_cursor"] = "synthetic-opaque-cursor"
            fixtures.append({"name": name + "-nonempty", "schema": name, "body": nonempty, "valid": True})
    for mode in SCHEMAS["IdentityInput"]["oneOf"]:
        fixtures.append({"name": "identity-" + mode["properties"]["mode"]["const"],
                         "schema": "IdentityInput", "body": sample(mode), "valid": True})
    locked = sample(ref("Capsule"))
    locked.update(status="locked", body=None)
    fixtures += [{"name": "capsule-locked", "schema": "Capsule", "body": locked, "valid": True},
        {"name": "capsule-leak", "schema": "Capsule", "body": {**locked, "body": "不得泄漏"}, "valid": False},
        {"name": "capsule-unlocked", "schema": "Capsule", "body": {**locked, "status": "unlocked", "body": "合成到期内容"}, "valid": True}]
    for name, body in [("PostCreate", {"body": "字" * 501, "identity": {"mode": "anonymous"}}),
                       ("PostCreate", {"body": "  ", "identity": {"mode": "anonymous"}}),
                       ("IdentityInput", {"mode": "anonymous", "target_user_id": "leak"}),
                       ("ReviewCommand", {"expected_version": 1, "expected_content_version": 1, "decision": "rejected"}),
                       ("VersionCommand", {"expected_version": 0}),
                       ("BlockCreate", {"target_user_id": "leak"})]:
        fixtures.append({"name": "negative-" + name + "-" + str(len(fixtures)), "schema": name, "body": body, "valid": False})
    public = sample(ref("PublicPost"))
    public["author_id"] = "6c500000-0000-4000-8000-000000000002"
    fixtures.append({"name": "public-author-leak", "schema": "PublicPost", "body": public, "valid": False})
    owner = sample(ref("OwnerPost"))
    owner["allowed_actions"] = ["whisperPostUpdate", "whisperPostSubmit", "whisperPostWithdraw"]
    fixtures.append({"name": "owner-post-draft-actions", "schema": "OwnerPost", "body": owner, "valid": True})
    owner_bad = copy.deepcopy(owner)
    owner_bad["allowed_actions"] = ["inventedAction"]
    fixtures.append({"name": "unknown-action", "schema": "OwnerPost", "body": owner_bad, "valid": False})
    cross_action = copy.deepcopy(owner)
    cross_action["allowed_actions"] = ["whisperAdminEvidenceDelete"]
    fixtures.append({"name": "cross-projection-action", "schema": "OwnerPost", "body": cross_action, "valid": False})
    for status in SCHEMAS["OwnerPost"]["properties"]["status"]["enum"]:
        body = sample(ref("OwnerPost"))
        body.update(status=status, published_at=None, review_result=None)
        if status in ["privacy_hold", "isolated", "restricted"]:
            body.update(body=None, identity_input=None)
        if status == "published":
            body["published_at"] = "2026-10-28T04:00:00Z"
        if status == "rejected":
            body["review_result"] = {"decision": "rejected", "content_version": 1,
                "reason": "合成驳回原因", "revision_suggestion": "请改写合成示例"}
        fixtures.append({"name": "owner-post-" + status, "schema": "OwnerPost", "body": body, "valid": True})
    for status in ["scanning", "review_pending", "locked", "unlocked", "rejected", "isolated", "cancelled", "deleted"]:
        body = copy.deepcopy(locked)
        body.update(status=status, body="合成到期内容" if status == "unlocked" else None)
        fixtures.append({"name": "capsule-state-" + status, "schema": "Capsule", "body": body, "valid": True})
    for mode in ["anonymous", "semi", "named"]:
        body = sample(ref("PublicPost"))
        body["identity"].update(mode=mode, tags=sample(ref("Tags")) if mode == "semi" else None)
        body.update(school_related=True, notice_codes=["UNVERIFIED_SCHOOL"], notice_text="未经证实")
        fixtures.append({"name": "public-school-" + mode, "schema": "PublicPost", "body": body, "valid": True})
    no_help = {"status": "unavailable", "version": None, "verified_at": None, "items": []}
    fixtures.append({"name": "help-unavailable", "schema": "HelpDirectory", "body": no_help, "valid": True})
    held = sample(ref("OwnerComment"))
    held.update(status="privacy_hold", post_id=None, body=None, recovery_body="合成已脱敏候选", identity_input=None,
                allowed_actions=["whisperCommentWithdraw"])
    fixtures.append({"name": "surviving-comment-redacted", "schema": "OwnerComment", "body": held, "valid": True})
    leaked_held = copy.deepcopy(held)
    leaked_held["body"] = "被屏障的旧正文"
    fixtures.append({"name": "surviving-comment-original-leak", "schema": "OwnerComment", "body": leaked_held, "valid": False})
    bad_time = sample(ref("CapsuleCreate"))
    bad_time["unlock_at"] = "2026-10-28T12:00:00+08:00"
    fixtures.append({"name": "capsule-non-utc-input", "schema": "CapsuleCreate", "body": bad_time, "valid": False})
    return {"openapi.json": spec, "examples.json": {"contract_id": "whispers/1.0.0", "exchanges": examples, "fixtures": fixtures},
            "actions.json": {"contract_id": "whispers/1.0.0", "writes": ACTIONS}}


def serialized(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--build", action="store_true", help="仅创建或更新未固定的新交付产物")
    args = p.parse_args()
    frozen = json.loads((ROOT.parents[1] / "governance/frozen.json").read_text())["files"]
    for name, value in outputs().items():
        path = ROOT / name
        expected = serialized(value)
        if path.exists() and path.read_text() == expected:
            continue
        if not args.build:
            raise SystemExit("生成一致性失败：" + name)
        if str(path.relative_to(ROOT.parents[1])) in frozen:
            raise SystemExit("禁止覆盖固定输入：" + name)
        path.write_text(expected)
    print(f"契约生成一致：{sum(map(len, PATHS.values()))}操作，{len(SCHEMAS)}schema，{len(ACTIONS)}写动作")


if __name__ == "__main__":
    main()
