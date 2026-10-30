#!/usr/bin/env python3
"""在临时目录补齐退役输入，校验当前契约且不恢复工作区历史文件。"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

from document_history import load_retirement, read_git_files, relative_path

ROOT = Path(__file__).resolve().parents[1]


def manifest_entries(stage):
    """同时支持模块manifest和全站动作评审指纹。"""
    paths = sorted((stage / "contracts").rglob("manifest.json"))
    paths += sorted((stage / "contracts").glob("actions-review*.json"))
    for manifest in paths:
        data = json.loads(manifest.read_text())
        for group in ("inputs", "base_inputs", "files", "hashes"):
            for name, digest in data.get(group, {}).items():
                relative_path(name)
                parent = manifest.parent if group == "hashes" else stage
                yield parent / name, digest


def main():
    # 缺少依赖立即报错，不能将跳过校验记录为通过。
    from openapi_spec_validator import validate_spec
    retirement = load_retirement(ROOT)
    subprocess.run(["git", "-C", str(ROOT), "merge-base", "--is-ancestor",
                    retirement["source_commit"], "HEAD"], check=True)
    with tempfile.TemporaryDirectory(prefix="liyuanci-contract-check-") as directory:
        stage = Path(directory)
        for name in ("contracts", "requirements", "approvals", "design", "governance"):
            shutil.copytree(ROOT / name, stage / name, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
        required = {str(path.relative_to(stage)) for path, _ in manifest_entries(stage)}
        names = [name for name in retirement["files"] if name in required]
        historical = read_git_files(ROOT, retirement["source_commit"], names)
        for name, content in historical.items():
            if hashlib.sha256(content).hexdigest() != retirement["files"][name]["sha256"]:
                raise ValueError(f"历史契约输入指纹变化：{name}")
            path = stage / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
        # 保留的版本链按各自原指纹检查；不恢复不再依赖的旧契约。
        for path, digest in manifest_entries(stage):
            if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
                raise ValueError(f"契约manifest指纹不一致：{path.relative_to(stage)}")
        environment = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}
        validators = ["contracts/validate.py", "contracts/blocks_v0_2_1.py", "contracts/whispers-v1/validate.py",
                      "contracts/admin-users-v1/validate.py", "contracts/resource-plaza-v1-r2/validate.py"]
        for validator in validators:
            subprocess.run([sys.executable, str(stage / validator)], cwd=stage, env=environment, check=True)
        validate_spec(json.loads((stage / "contracts/user-restrictions-v1/openapi.json").read_text()))
        print(f"当前契约校验通过；临时读取{len(historical)}份历史输入，工作区固定输入未生成或改写。")


if __name__ == "__main__":
    main()
