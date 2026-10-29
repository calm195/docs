#!/usr/bin/env python3
"""只读校验资料广场契约、规范夹具、动作绑定和交付指纹；无业务请求。"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator, FormatChecker, ValidationError, validators
from openapi_spec_validator import validate_spec
import build
import rules

ROOT = Path(__file__).resolve().parent
DOCS = ROOT.parents[1]


def contract_text(validator, rule, value, schema):
    try:
        normalized = rules.normalize(rule["kind"], value)
        if rule["canonical"] and value != normalized:
            raise ValueError("响应文本不是规范值")
    except (TypeError, ValueError, UnicodeError) as error:
        yield ValidationError(str(error))


def invariant(validator, kind, value, schema):
    # 先让普通schema报告缺字段/类型错误；本扩展只验证有效形状的跨字段关系。
    if not isinstance(value, dict):
        return
    plain = {k: v for k, v in schema.items() if k != "x-invariant"}
    if not validator.evolve(schema=plain).is_valid(value):
        return
    try:
        rules.invariants(kind, value)
    except (KeyError, TypeError, ValueError) as error:
        yield ValidationError(str(error))


ContractValidator = validators.extend(Draft202012Validator,
    {"x-contract-text": contract_text, "x-invariant": invariant},
    type_checker=Draft202012Validator.TYPE_CHECKER.redefine("integer", lambda checker, value: type(value) is int))


def strict_json(raw):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError("重复JSON字段")
            result[key] = value
        return result
    def forbidden(value):
        raise ValueError("不接受浮点/指数/非有限JSON数字")
    return json.loads(raw, object_pairs_hook=pairs, parse_float=forbidden, parse_constant=forbidden)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-manifest", action="store_true", help="仅未固定开发期诊断，不能作为完整交付检查")
    args = parser.parse_args()
    expected = build.outputs()
    for name, data in expected.items():
        assert (ROOT / name).read_text() == build.serialized(data), "生成不一致：" + name
    spec, examples, actions = (expected[name] for name in ("openapi.json", "examples.json", "actions.json"))
    validate_spec(spec)
    schemas = spec["components"]["schemas"]
    def check(schema):
        return ContractValidator({**schema, "components": {"schemas": schemas}}, format_checker=FormatChecker())
    def named(name):
        return check(build.ref(name))
    for schema in schemas.values():
        Draft202012Validator.check_schema(schema)
    operations = {}
    for path, methods in spec["paths"].items():
        for method, op in methods.items():
            assert method in build.METHODS
            oid = op["operationId"]
            assert oid not in operations
            operations[oid] = (path, method, op)
            assert op["x-implementation-status"] == "not-implemented" and "REQ-023" in op["x-req-ids"]
            assert op["security"] == [{"AdminBearer" if op["x-principal"] == "admin" else "StudentBearer": []}]
            assert len({(p["in"], p["name"]) for p in op["parameters"]}) == len(op["parameters"])
            for response in op["responses"].values():
                assert response["headers"]["Cache-Control"]["schema"]["const"] == "no-store"
            assert set(op["responses"]) == {str(op["x-success-status"]), *op["x-error-codes"]}
            assert (method != "get") == ("x-request-schema" in op)
            assert (method != "get") == any(p["name"] == "Idempotency-Key" and p["required"] for p in op["parameters"])
            assert not any(word in path for word in ("reports", "upload", "contribution"))
    assert len(operations) == 15
    assert sum(method == "get" for _, method, _ in operations.values()) == 8

    def wire(request):
        path, method, op = operations[request["operation_id"]]
        queries = request.get("query_pairs", list(request["query"].items()))
        if len({p[0] for p in queries}) != len(queries):
            raise ValueError("重复query")
        if sum(len(k.encode("utf-8")) + len(str(v).encode("utf-8")) for k, v in queries) > 8192:
            raise ValueError("查询过长")
        query = dict(queries)
        header_pairs = request.get("header_pairs", list(request["headers"].items()))
        if len({k.lower() for k, _ in header_pairs}) != len(header_pairs):
            raise ValueError("重复header")
        headers = {k.lower(): v for k, v in header_pairs}
        if not headers.get("authorization", "").startswith("Bearer ") or not headers["authorization"][7:]:
            raise ValueError("样例缺Bearer头；不验证token真实性")
        parameters = {"query": query, "path": request["path_params"], "header": headers}
        for where in ("query", "path"):
            allowed = {p["name"] for p in op["parameters"] if p["in"] == where}
            if set(parameters[where]) - allowed:
                raise ValueError("未定义参数")
        for param in op["parameters"]:
            name = param["name"].lower() if param["in"] == "header" else param["name"]
            source = parameters[param["in"]]
            if name not in source:
                if param["required"]:
                    raise ValueError("缺参数")
                continue
            value = source[name]
            schema = param["schema"]
            if param["in"] == "query":
                if not isinstance(value, str):
                    raise ValueError("HTTP query必须是字面字符串")
                if schema.get("type") == "integer":
                    if not re.fullmatch(r"0|[1-9][0-9]*", value):
                        raise ValueError("非规范整数query")
                    value = int(value)
                if schema.get("type") == "boolean":
                    if value not in ("true", "false"):
                        raise ValueError("非规范布尔query")
                    value = value == "true"
            check(schema).validate(value)
        if "x-request-schema" in op:
            media = headers.get("content-type", "").lower().replace(" ", "")
            if media not in ("application/json", "application/json;charset=utf-8"):
                raise ValueError("媒体类型错误")
            raw = request.get("raw_body", json.dumps(request["request_body"], ensure_ascii=False))
            if len(raw.encode("utf-8")) > 65536:
                raise ValueError("请求体过长")
            named(op["x-request-schema"]).validate(strict_json(raw))
        elif request.get("request_body") is not None or request.get("raw_body"):
            raise ValueError("GET不接受body")

    def exchange_valid(exchange):
        op = operations[exchange["operation_id"]][2]
        if exchange["http_status"] != op["x-success-status"]:
            raise ValueError("成功HTTP状态不符")
        named(op["x-success-schema"]).validate(exchange["body"])
        data = exchange["body"]["data"]
        if "id" in exchange["path_params"]:
            target = data.get("resource_id", data.get("id"))
            if target != exchange["path_params"]["id"].lower():
                raise ValueError("响应目标与路径不匹配")
        if exchange["operation_id"] == "resourceDownloadInfo" and data["version"] != int(exchange["query"]["expected_version"]):
            raise ValueError("取链响应版本与请求不匹配")
        if exchange["operation_id"] == "resourceFeedbackPut" and data["content_version"] != exchange["request_body"]["expected_content_version"]:
            raise ValueError("反馈响应内容版本与请求不匹配")
    covered = set()
    for exchange in examples["exchanges"]:
        op = operations[exchange["operation_id"]][2]
        wire(exchange)
        exchange_valid(exchange)
        covered.add(exchange["operation_id"])
    assert covered == set(operations)
    for fixture in examples["exchange_fixtures"]:
        valid = True
        try:
            exchange_valid(fixture["exchange"])
        except (ValueError, TypeError, ValidationError):
            valid = False
        assert valid == fixture["valid"], fixture["name"]
    for fixture in examples["fixtures"]:
        assert named(fixture["schema"]).is_valid(fixture["value"]) == fixture["valid"], fixture["name"]
    for fixture in examples["protocol_vectors"]:
        valid = True
        try:
            wire(fixture["request"])
        except (ValueError, TypeError, UnicodeError, ValidationError):
            valid = False
        assert valid == fixture["valid"], fixture["name"]
    error_coverage = set()
    for exchange in examples["error_examples"]:
        oid, status, body = exchange["operation_id"], str(exchange["http_status"]), exchange["body"]
        op = operations[oid][2]
        check(op["responses"][status]["content"]["application/json"]["schema"]).validate(body)
        assert body["code"] == int(status)
        error_coverage.add((oid, status, body["error_code"]))
    assert error_coverage == {(oid, status, code) for oid, (_, _, op) in operations.items() for status, codes in op["x-error-codes"].items() for code in codes}
    for _, _, op in operations.values():
        for status, allowed in op["x-error-codes"].items():
            declared = schemas["Error" + status]["properties"]["error_code"]["enum"]
            for code in set(declared) - set(allowed):
                bad = {"code": int(status), "message": "请求未完成", "error_code": code, "request_id": "synthetic"}
                assert not check(op["responses"][status]["content"]["application/json"]["schema"]).is_valid(bad)
    # 各错误schema必须拒绝状态不符和携带业务资料的错误回显。
    for code in (400, 401, 403, 404, 409, 413, 415, 429, 500, 503):
        schema = "Error" + str(code)
        sample = next(x["body"] for x in examples["error_examples"] if x["http_status"] == code)
        assert not named(schema).is_valid({**sample, "code": 200})
        assert not named(schema).is_valid({**sample, "data": {"download_url": "secret"}})
    for vector in examples["text_vectors"]:
        valid, value = True, None
        try:
            value = rules.normalize(vector["kind"], vector["value"])
        except (ValueError, TypeError, UnicodeError):
            valid = False
        assert valid == vector["valid"], vector["name"]
        if valid:
            assert value == vector["normalized"], vector["name"]
    for vector in examples["search_vectors"]:
        q = rules.fold(rules.normalize("q", vector["q"]))
        match = not q or q in rules.fold(vector["title"]) or q in rules.fold(vector["description"])
        assert match == vector["match"]
    assert len(actions["operations"]) == 15 and len({x["operation_id"] for x in actions["operations"]}) == 15
    for item in actions["operations"]:
        path, method, op = operations[item["operation_id"]]
        assert (item["path"], item["method"], item["principal"]) == (path, method.upper(), op["x-principal"])
        assert item["request_schema"] == op.get("x-request-schema")
        assert item["success_schema"] == op["x-success-schema"]
        assert item["idempotency"] == (method != "get")
    projection_actions = set()
    for projections in actions["projections"].values():
        for item in projections:
            projection_actions.add(item["action"])
            op = operations[item["operation_id"]][2]
            fields = schemas[op["x-request-schema"]]["properties"] if "x-request-schema" in op else {p["name"]: p["schema"] for p in op["parameters"]}
            assert set(item["versions"]) <= set(fields)
            assert all(item["versions"].values())
    assert projection_actions == {"copy_download", "submit_feedback", "update", "publish", "offline"}
    assert set(actions["principals"]["admin"]) == {"review_operator", "super_admin"}
    for name in actions["collection_writes"] + [actions["category_write"]["operation_id"]]:
        assert name in operations and operations[name][1] != "get"
    if not args.skip_manifest:
        manifest = json.loads((ROOT / "manifest.json").read_text())
        assert manifest["contract_id"] == build.CONTRACT
        for path, digest in {**manifest["inputs"], **manifest["files"]}.items():
            assert hashlib.sha256((DOCS / path).read_bytes()).hexdigest() == digest, "指纹变化：" + path
        required = {str(p.relative_to(DOCS)) for p in ROOT.iterdir() if p.is_file() and p.name != "manifest.json"}
        assert required <= set(manifest["files"]), "包文件未纳入manifest"
    result = {"operations": len(operations), "get": 8, "writes": 7, "schemas": len(schemas),
              "success_exchanges": len(examples["exchanges"]), "exchange_fixtures": len(examples["exchange_fixtures"]), "error_examples": len(examples["error_examples"]),
              "schema_fixtures": len(examples["fixtures"]), "protocol_vectors": len(examples["protocol_vectors"]),
              "text_vectors": len(examples["text_vectors"]), "search_vectors": len(examples["search_vectors"]),
              "manifest_checked": not args.skip_manifest, "runtime_tested": False}
    print("资料广场契约静态检查通过：" + json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
