#!/usr/bin/env python3
"""只读校验资料广场创建幂等隐私拒绝勘误，不修改原固定输入。"""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator, FormatChecker
from openapi_spec_validator import validate_spec

ROOT = Path(__file__).resolve().parent
DOCS = ROOT.parents[1]
BASE = ROOT.parent / "resource-plaza-v1"


def main():
    subprocess.run([sys.executable, str(BASE / "validate.py")], check=True)
    before = json.loads((BASE / "openapi.json").read_text())
    expected = copy.deepcopy(before)
    expected["info"]["version"] = "1.0.1"
    operation = expected["paths"]["/admin/resources"]["post"]
    operation["responses"]["404"] = copy.deepcopy(before["paths"]["/admin/resources/{id}"]["get"]["responses"]["404"])
    operation["x-error-codes"]["404"] = ["NOT_FOUND"]
    spec = json.loads((ROOT / "openapi.json").read_text())
    assert spec == expected, "勘误超出版本号及创建404范围"
    validate_spec(spec)
    example = json.loads((ROOT / "examples.json").read_text())
    assert example["contract_id"] == "resource-plaza/1.0.1"
    assert len(example["error_examples"]) == 1
    row = example["error_examples"][0]
    assert row["operation_id"] == "adminResourceCreate" and row["http_status"] == 404
    schema = {**operation["responses"]["404"]["content"]["application/json"]["schema"], "components": spec["components"]}
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    validator.validate(row["body"])
    assert not validator.is_valid({**row["body"], "data": {}}), "错误不应带data"
    assert not validator.is_valid({**row["body"], "error_code": "STATE_CONFLICT"})
    manifest = json.loads((ROOT / "manifest.json").read_text())
    assert manifest["contract_id"] == "resource-plaza/1.0.1"
    assert manifest["base_contract_id"] == "resource-plaza/1.0.0"
    for group in ("inputs", "files"):
        for path, digest in manifest[group].items():
            assert hashlib.sha256((DOCS / path).read_bytes()).hexdigest() == digest, path
    print("资料广场1.0.1勘误校验通过：15操作/39schema；仅创建操作新增404，学生接口不变；无业务或真机调用。")


if __name__ == "__main__":
    main()
