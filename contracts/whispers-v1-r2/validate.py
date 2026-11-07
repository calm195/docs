"""只读校验体验版悄悄鲤契约、合成夹具与精确指纹。"""
import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator
from openapi_spec_validator import validate

root = Path(__file__).resolve().parent
spec = json.loads((root / "openapi.json").read_text())
examples = json.loads((root / "examples.json").read_text())
manifest = json.loads((root / "manifest.json").read_text())
validate(spec)


def valid(schema_name, value):
    schema = {
        "$ref": "#/components/schemas/" + schema_name,
        "components": spec["components"],
    }
    return Draft202012Validator(schema).is_valid(value)


for fixture in examples["fixtures"]:
    assert valid(fixture["schema"], fixture["body"]) == fixture["valid"], fixture["name"]
for exchange in examples["exchanges"]:
    if exchange.get("schema"):
        assert valid(exchange["schema"], exchange["body"]), exchange["operation_id"]
for name, expected in manifest["files"].items():
    actual = hashlib.sha256((root / Path(name).name).read_bytes()).hexdigest()
    assert actual == expected, name
print("体验版悄悄鲤契约、正反夹具和指纹校验通过")
