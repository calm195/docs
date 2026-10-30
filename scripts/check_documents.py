#!/usr/bin/env python3
"""校验当前三端文档、历史原文、固定输入、迁移覆盖和Markdown链接。"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit

from document_history import load_retirement, read_git_files, retirement_errors

ROOT = Path(__file__).resolve().parents[1]
REPOS = {"backend": "liyuanci-backend-go", "admin": "liyuanci-admin-vue", "miniprogram": "liyuanci-miniprogram-uniapp"}
CURRENT_FILES = {"README.md", "defects.md", "plan.md"}


def git(repo, *args):
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()


def document_layout_errors(root):
    errors = []
    for end in REPOS:
        folder = root / "development" / end
        actual = {str(path.relative_to(folder)) for path in folder.rglob("*") if path.is_file()}
        if actual != CURRENT_FILES:
            errors.append(f"三端文档必须只有现状/缺陷/计划：{end}；缺少{sorted(CURRENT_FILES - actual)}，多余{sorted(actual - CURRENT_FILES)}")
    return errors


def fixed_errors(root, frozen, historical):
    errors = []
    for name, digest in frozen.items():
        path = root / name
        content = historical[name] if name in historical else path.read_bytes() if path.is_file() else None
        if content is None or hashlib.sha256(content).hexdigest() != digest:
            errors.append(f"固定文件缺失或指纹变化：{name}")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="HEAD", help="核对既有固定条目与历史登记不可变的基点")
    parser.add_argument("--same-branch", action="store_true", help="额外核对四仓库同名分支")
    args = parser.parse_args()
    git(ROOT, "rev-parse", "--verify", args.base)
    workspace = Path(git(ROOT, "rev-parse", "--path-format=absolute", "--git-common-dir")).parent.parent
    frozen = json.loads((ROOT / "governance/frozen.json").read_text())["files"]
    retirement = load_retirement(ROOT)
    snapshot = retirement["source_commit"]
    subprocess.run(["git", "-C", str(ROOT), "merge-base", "--is-ancestor", snapshot, "HEAD"], check=True)
    historical = read_git_files(ROOT, snapshot, retirement["files"])
    errors = retirement_errors(ROOT, retirement, historical) + document_layout_errors(ROOT)
    errors += fixed_errors(ROOT, frozen, historical)
    for name in ("frozen.json", "retired.json"):
        previous = subprocess.run(["git", "-C", str(ROOT), "show", f"{args.base}:governance/{name}"], capture_output=True, text=True)
        if previous.returncode:
            if name == "frozen.json":
                errors.append("无法读取既有固定清单")
            continue
        old = json.loads(previous.stdout)
        current = {"files": frozen} if name == "frozen.json" else retirement
        for path, entry in old["files"].items():
            if current["files"].get(path) != entry:
                errors.append(f"既有{name}条目被修改或删除：{path}")
        if name == "retired.json" and any(current[key] != old[key] for key in ("source_commit", "replaced")):
            errors.append("既有历史快照或替换范围被改写")
    migrated = json.loads((ROOT / "governance/migration-2026-10-22.json").read_text())["records"]
    for item in migrated:
        original = subprocess.check_output(["git", "-C", str(workspace / item["repository"]), "show", f"{item['source_commit']}:{item['source']}"])
        if hashlib.sha256(original).hexdigest() != item["source_sha256"]:
            errors.append(f"迁移来源指纹不一致：{item['source']}")
        name = item["destination"]
        path = ROOT / name
        content = historical[name] if name in historical else path.read_bytes() if path.is_file() else None
        if content is None or hashlib.sha256(content).hexdigest() != item["destination_sha256"]:
            errors.append(f"迁移目标指纹不一致：{name}")
        if name not in frozen:
            errors.append(f"迁移目标未固定：{name}")
    markdown = list(ROOT.rglob("*.md"))
    if (workspace / "README.md").is_file():
        markdown.append(workspace / "README.md")
    branch = git(ROOT, "branch", "--show-current")
    for end, repo_name in REPOS.items():
        repo = workspace / repo_name
        items = [item for item in migrated if item["repository"] == repo_name]
        sources = {item["source_commit"] for item in items}
        if len(sources) != 1:
            errors.append(f"迁移来源提交不唯一：{repo_name}")
        else:
            files = set(git(repo, "ls-tree", "-r", "--name-only", next(iter(sources)), "docs/").splitlines())
            if {item["source"] for item in items} != files or len(items) != len(files):
                errors.append(f"来源文档覆盖不完整或重复：{repo_name}")
        if (repo / "docs").exists():
            errors.append(f"开发仓库仍保留docs目录：{repo_name}")
        if args.same_branch and git(repo, "branch", "--show-current") != branch:
            errors.append(f"开发仓库与docs分支不一致：{repo_name}")
        for name in ("AGENTS.md", "README.md"):
            if f"../docs/development/{end}/README.md" not in (repo / name).read_text():
                errors.append(f"缺少本端文档入口：{repo_name}/{name}")
        markdown += list(repo.glob("README*.md")) + [repo / "AGENTS.md"]
    migration_links = {(base / item["repository"] / item["source"]).resolve(): (ROOT / item["destination"]).resolve()
                       for item in migrated for base in (ROOT.parent, workspace)}
    retired_paths = {(ROOT / name).resolve() for name in historical}
    historical_links = 0
    for path in markdown:
        data = path.read_bytes()
        relative = str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else None
        fixed = relative in frozen and relative not in retirement["files"] and hashlib.sha256(data).hexdigest() == frozen[relative]
        text = re.sub(r"```.*?```", "", data.decode(), flags=re.S)
        for match in re.finditer(r"\]\((<[^>]+>|[^\s)]+)", text):
            parsed = urlsplit(match.group(1).strip("<>"))
            if parsed.scheme or not parsed.path:
                continue
            target = (path.parent / unquote(parsed.path)).resolve()
            if not target.exists() and path.is_relative_to(ROOT) and target.is_relative_to(ROOT.parent):
                relative_target = target.relative_to(ROOT.parent)
                if relative_target.parts and relative_target.parts[0] in REPOS.values():
                    target = workspace / relative_target
            if target.exists():
                continue
            mapped = migration_links.get(target, target)
            if fixed and (mapped in retired_paths or mapped != target and mapped.exists()):
                historical_links += 1
                continue
            errors.append(f"本地链接失效：{path} -> {match.group(1)}")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    archived_fixed = len(set(frozen) & set(historical))
    print(f"文档检查通过：9份三端文档；{len(frozen) - archived_fixed}个当前/{archived_fixed}个历史固定输入；{len(historical)}份退役原文；{len(migrated)}个迁移来源；{historical_links}个固定文档历史链接。")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as error:
        print(f"文档检查失败：{error}", file=sys.stderr)
        sys.exit(1)
