#!/usr/bin/env python3
"""只读验证用户管理契约、合成夹具、复用动作及交付指纹。无服务调用。"""
import hashlib
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator, FormatChecker
from openapi_spec_validator import validate_spec
import build

ROOT = Path(__file__).resolve().parent
DOCS = ROOT.parents[1]


def main():
    expected = build.outputs()
    for name, data in expected.items():
        assert (ROOT / name).read_text() == build.serialized(data), "生成不一致：" + name
    spec, examples, actions = (expected[name] for name in ("openapi.json", "examples.json", "actions.json"))
    validate_spec(spec)
    schemas = spec["components"]["schemas"]
    def validator(name):
        return Draft202012Validator({"$ref": "#/components/schemas/" + name, "components": {"schemas": schemas}}, format_checker=FormatChecker())
    for schema in schemas.values():
        Draft202012Validator.check_schema(schema)
    operations = {}
    for path, methods in spec["paths"].items():
        assert set(methods) == {"get"}, "模块不应新增写操作"
        op = methods["get"]
        assert op["operationId"] not in operations
        assert op["x-implementation-status"] == "not-implemented"
        assert "REQ-022" in op["x-req-ids"]
        assert op["security"] == [{"AdminBearer": []}]
        assert op["responses"]["200"]["headers"]["Cache-Control"]["schema"]["const"] == "no-store"
        operations[op["operationId"]] = op
    assert len(operations) == 3
    covered = set()
    for exchange in examples["exchanges"]:
        op = operations[exchange["operation_id"]]
        covered.add(exchange["operation_id"])
        validator(op["x-success-schema"]).validate(exchange["body"])
        for param in op["parameters"]:
            params = exchange["path_params"] if param["in"] == "path" else exchange["query"]
            assert not param.get("required") or param["name"] in params
            if param["name"] in params:
                Draft202012Validator(param["schema"], format_checker=FormatChecker()).validate(params[param["name"]])
    assert covered == set(operations)
    for fixture in examples["fixtures"]:
        assert validator(fixture["schema"]).is_valid(fixture["body"]) == fixture["valid"], fixture["name"]
    for example in examples["error_examples"]:
        validator("Error").validate(example["body"])
        assert example["body"]["code"] == example["http_status"]
    # 仅核验规范向量自洽，不模拟或证明应用SQL实现。
    whitespace = "\t\n\v\f\r " + "\u0085\u00a0\u1680" + "".join(chr(x) for x in range(0x2000, 0x200B)) + "\u2028\u2029\u202f\u205f\u3000"
    def fold(value):
        return value.translate(str.maketrans("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"))
    for vector in examples["search_vectors"]:
        keyword = vector["nickname"].strip(whitespace)
        match = not keyword or (vector["stored"] is not None and fold(keyword) in fold(vector["stored"]))
        assert match == vector["match"], vector["name"]
    assert not actions["new_writes"]
    assert set(schemas["UserDetail"]["properties"]["allowed_actions"]["items"]["enum"]) == {a["action"] for a in actions["navigation"]}
    for action in actions["reused_writes"]:
        old = json.loads((ROOT / action["contract"]).read_text())
        operation = old["paths"][action["path"]][action["method"].lower()]
        assert operation["operationId"] == action["operation_id"], action["operation_id"]
        assert action["version_source"] and action["idempotency"]
    manifest = json.loads((ROOT / "manifest.json").read_text())
    for path, digest in {**manifest["inputs"], **manifest["files"]}.items():
        assert hashlib.sha256((DOCS / path).read_bytes()).hexdigest() == digest, "指纹变化：" + path
    print(f"用户管理契约通过：3个GET、{len(examples['exchanges'])}个成功交互、{len(examples['fixtures'])}个正反schema夹具、{len(examples['search_vectors'])}个搜索规范向量、3项原动作引用及交付指纹；非运行验证。")


if __name__ == "__main__":
    main()
