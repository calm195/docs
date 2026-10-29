#!/usr/bin/env python3
"""资料广场契约的文本规范对照器；仅用于静态夹具，不调用业务服务。"""
import re
from urllib.parse import urlsplit

WHITE_SPACE = "\t\n\v\f\r " + "\u0085\u00a0\u1680" + "".join(chr(x) for x in range(0x2000, 0x200B)) + "\u2028\u2029\u202f\u205f\u3000"
SAFE_INTEGER = 9007199254740991
KINDS = {"valid": "有效", "link_invalid": "链接失效", "outdated": "年代久远", "incomplete": "不全"}


def fold(value):
    """仅折叠ASCII，不使用语言或数据库locale相关的大小写规则。"""
    return value.translate(str.maketrans("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"))


def normalize(kind, value):
    """返回规范文本；无效值抛ValueError，不静默截断。"""
    if value is None and kind in ("description", "extraction_code"):
        value = ""
    if not isinstance(value, str):
        raise ValueError("文本类型错误")
    if any(0xD800 <= ord(c) <= 0xDFFF for c in value):
        raise ValueError("不接受孤立代理码点")
    if kind == "description":
        value = value.replace("\r\n", "\n").replace("\r", "\n")
    value = value.strip(WHITE_SPACE)
    if kind == "download_url":
        if not value or len(value.encode("utf-8")) > 2048:
            raise ValueError("链接长度错误")
        if any(c in WHITE_SPACE or ord(c) < 32 or 127 <= ord(c) <= 159 for c in value):
            raise ValueError("链接含空白或控制字符")
        if re.search(r"%(?![0-9a-fA-F]{2})", value) or "\\" in value:
            raise ValueError("链接编码或分隔符错误")
        try:
            parsed = urlsplit(value)
            port = parsed.port
            if parsed.scheme.lower() not in ("http", "https") or not parsed.hostname or "@" in parsed.netloc:
                raise ValueError("链接协议、主机或userinfo错误")
            if port is not None and not 1 <= port <= 65535:
                raise ValueError("端口错误")
            if parsed.netloc.endswith(":"):
                raise ValueError("空端口")
        except ValueError as error:
            raise ValueError("链接结构错误") from error
        return value
    limits = {"title": (1, 100), "name": (1, 30), "description": (0, 2000),
              "extraction_code": (0, 64), "q": (0, 100), "reason": (1, 500)}
    if kind not in limits:
        raise ValueError("未知文本规范")
    low, high = limits[kind]
    if not low <= len(value) <= high:
        raise ValueError("规范化后码点长度错误")
    multiline = kind in ("description", "reason")
    for c in value:
        if (ord(c) < 32 or 127 <= ord(c) <= 159 or c in "\u2028\u2029") and not (multiline and c in "\n\t"):
            raise ValueError("文本含非法控制字符或换行")
    if kind == "extraction_code" and not value:
        return None
    return value


def invariants(kind, value):
    """跨字段相等/求和/动作约束；不能由普通JSON Schema单独表达。"""
    if kind == "download":
        expected = value["download_url"]
        if value["extraction_code"] is not None:
            expected += "\n提取码：" + value["extraction_code"]
        if value["copy_text"] != expected:
            raise ValueError("copy_text与链接/提取码不一致")
    if kind == "feedback_summary":
        if value["total"] != sum(value[k] for k in KINDS):
            raise ValueError("反馈汇总不等于四项之和")
    if kind in ("student_detail", "admin_detail", "admin_summary"):
        if value["content_version"] > value["version"]:
            raise ValueError("内容版本大于资源版本")
    if kind == "student_detail":
        own = value["my_feedback"]
        if own is not None and (own["resource_id"] != value["id"] or own["content_version"] != value["content_version"]):
            raise ValueError("本人反馈绑定不匹配")
    if kind in ("admin_detail", "admin_summary"):
        if value["feedback_summary"]["content_version"] != value["content_version"]:
            raise ValueError("汇总内容版本不匹配")
        expected = ["offline"] if value["status"] == "published" else ["update"] + ([] if value["visibility_blocked"] else ["publish"])
        if value["allowed_actions"] != expected:
            raise ValueError("后台动作与状态/屏障不匹配")
        if value["status"] == "published" and (value["published_at"] is None or value["visibility_blocked"]):
            raise ValueError("上架状态不满足投影约束")
        if value["status"] == "draft" and value["published_at"] is not None:
            raise ValueError("草稿不能有上架时间")
