"""从明确登记的Git快照读取退役文档，不恢复工作区文件。"""
import hashlib
import json
from pathlib import PurePosixPath
import re
import subprocess


def relative_path(value):
    """只允许仓库内的规范相对文件路径。"""
    if not isinstance(value, str) or not value or any(c in value for c in "\\\n\r\0"):
        raise ValueError(f"非法历史路径：{value!r}")
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts or str(path) != value or value == ".":
        raise ValueError(f"非法历史路径：{value!r}")
    return value


def load_retirement(root):
    """读取固定快照、退役文件和明确的同路径替换项。"""
    data = json.loads((root / "governance/retired.json").read_text())
    if data.get("schema_version") != 1 or not re.fullmatch(r"[0-9a-f]{40}", data.get("source_commit", "")):
        raise ValueError("历史清单缺少有效版本或完整Git提交")
    if not isinstance(data.get("files"), dict) or not isinstance(data.get("replaced"), list):
        raise ValueError("历史清单files/replaced格式错误")
    if len(set(data["replaced"])) != len(data["replaced"]):
        raise ValueError("历史替换路径重复")
    for name, item in data["files"].items():
        relative_path(name)
        relative_path(item["replacement"])
        if not re.fullmatch(r"[0-9a-f]{64}", item.get("sha256", "")):
            raise ValueError(f"历史清单SHA-256无效：{name}")
    if not set(data["replaced"]) <= set(data["files"]):
        raise ValueError("替换项没有登记历史原文")
    return data


def read_git_files(root, commit, names):
    """批量读取blob，缺对象或非文件立即失败。"""
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("历史读取必须使用完整提交号")
    names = list(names)
    for name in names:
        relative_path(name)
    if not names:
        return {}
    request = "".join(f"{commit}:{name}\n" for name in names).encode()
    result = subprocess.run(["git", "-C", str(root), "cat-file", "--batch"], input=request,
                            capture_output=True, check=True)
    output, offset, files = result.stdout, 0, {}
    for name in names:
        end = output.index(b"\n", offset)
        header = output[offset:end].split()
        if len(header) != 3 or header[1] != b"blob":
            raise ValueError(f"历史文件不可读取：{commit}:{name}")
        size = int(header[2])
        start = end + 1
        data = output[start:start + size]
        if len(data) != size or output[start + size:start + size + 1] != b"\n":
            raise ValueError(f"历史文件读取不完整：{name}")
        files[name] = data
        offset = start + size + 1
    return files


def retirement_errors(root, retirement, historical):
    """退役不允许掩盖内容损坏、旧文件回流或失效去向。"""
    errors = []
    replaced = set(retirement["replaced"])
    for name, item in retirement["files"].items():
        content = historical.get(name)
        if content is None or hashlib.sha256(content).hexdigest() != item["sha256"]:
            errors.append(f"历史原文指纹不一致：{name}")
        path = root / name
        if name in replaced:
            if not path.is_file():
                errors.append(f"当前替换索引缺失：{name}")
        elif path.exists():
            errors.append(f"退役文件重新进入工作区：{name}")
        replacement = item["replacement"]
        if not (root / replacement).is_file() or (replacement in retirement["files"] and replacement not in replaced):
            errors.append(f"历史文件当前去向无效：{name} -> {replacement}")
    return errors
