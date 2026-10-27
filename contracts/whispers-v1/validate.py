#!/usr/bin/env python3
"""只读校验悄悄鲤设计契约、正反样例、动作和固定交付指纹。"""
import hashlib
import json
from pathlib import Path
import sys
sys.dont_write_bytecode = True

try:
    from jsonschema import Draft202012Validator, FormatChecker
    from openapi_spec_validator import validate_spec
except ImportError as exc:
    raise SystemExit("缺少契约校验依赖：jsonschema、openapi-spec-validator==0.7.2；请使用隔离环境") from exc

import build

ROOT = Path(__file__).resolve().parent
DOCS = ROOT.parents[1]


def main():
    errors = []
    expected = build.outputs()
    for name, value in expected.items():
        if (ROOT / name).read_text() != build.serialized(value):
            errors.append("生成结果不一致：" + name)
    spec = json.loads((ROOT / "openapi.json").read_text())
    validate_spec(spec)
    schemas = spec["components"]["schemas"]
    for name, value in schemas.items():
        Draft202012Validator.check_schema(value)
    def validator(name):
        return Draft202012Validator({"$ref": "#/components/schemas/" + name,
            "components": {"schemas": schemas}}, format_checker=FormatChecker())
    operations = {}
    writes = {}
    for path, methods in spec["paths"].items():
        for method, operation in methods.items():
            name = operation["operationId"]
            if name in operations:
                errors.append("operationId重复：" + name)
            operations[name] = operation
            if not operation.get("x-requirements") or operation.get("x-implementation-status") != "not-implemented":
                errors.append("REQ或未实现标记缺失：" + name)
            if any(word in path for word in ["audio", "voice", "recording"]):
                errors.append("误纳入延期语音：" + path)
            if method != "get":
                writes[name] = operation
                if not any(p["name"] == "Idempotency-Key" and p.get("required") for p in operation["parameters"]):
                    errors.append("写操作缺幂等键：" + name)
    examples = json.loads((ROOT / "examples.json").read_text())
    covered = set()
    for example in examples["exchanges"]:
        name = example["operation_id"]
        if name not in operations:
            errors.append("样例引用未知操作：" + name)
            continue
        covered.add((name, example["direction"]))
        failures = list(validator(example["schema"]).iter_errors(example["body"]))
        errors += [name + "/" + example["direction"] + ": " + e.message for e in failures]
    for name, operation in operations.items():
        for direction, field in [("request", "x-request-schema"), ("response", "x-success-schema")]:
            if operation[field] and (name, direction) not in covered:
                errors.append("缺少操作样例：" + name + "/" + direction)
    for fixture in examples["fixtures"]:
        valid = validator(fixture["schema"]).is_valid(fixture["body"])
        if valid != fixture["valid"]:
            details = [e.message for e in validator(fixture["schema"]).iter_errors(fixture["body"])]
            errors.append("正反夹具不符：" + fixture["name"] + " " + str(details))
    actions = json.loads((ROOT / "actions.json").read_text())["writes"]
    action_ids = [a["operation_id"] for a in actions]
    if len(set(action_ids)) != len(action_ids) or set(action_ids) != set(writes):
        errors.append("写动作索引不完整或重复")
    if set(schemas["AllowedActions"]["items"]["enum"]) != set(writes):
        errors.append("允许动作枚举不等于写操作目录")
    for action in actions:
        projection = action["projection"]
        if not projection or not action["version_source"]:
            errors.append("动作来源缺失：" + action["operation_id"])
            continue
        names, field = projection.rsplit(".", 1)
        for name in names.split("/"):
            if field not in schemas.get(name, {}).get("properties", {}):
                errors.append("动作投影字段不存在：" + projection)
    manifest_path = ROOT / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        for relative, digest in {**manifest.get("base_inputs", {}), **manifest["files"]}.items():
            path = DOCS / relative
            if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
                errors.append("交付指纹不符：" + relative)
    if errors:
        raise SystemExit("\n".join(errors))
    positives = sum(f["valid"] for f in examples["fixtures"])
    print(f"契约校验通过：{len(operations)}操作，{len(schemas)}schema，{len(examples['exchanges'])}请求/响应样例，"
          f"{positives}正例/{len(examples['fixtures']) - positives}负例，{len(actions)}写动作。")
    print("范围：静态设计契约；业务接口和联合验收未执行。")


if __name__ == "__main__":
    main()
