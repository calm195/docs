#!/usr/bin/env python3
"""只读校验文档归属、迁移覆盖、固定产物及本地链接。"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REPOS = {
    "backend": "liyuanci-backend-go",
    "admin": "liyuanci-admin-vue",
    "miniprogram": "liyuanci-miniprogram-uniapp",
}


def git(repo, *args):
    """读取本地 Git 信息，不修改工作区或访问远程。"""
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="HEAD", help="核对固定清单仅追加时的 Git 基点")
    parser.add_argument("--same-branch", action="store_true", help="本次跨四仓库交付时额外核对同名分支")
    args = parser.parse_args()
    errors = []
    frozen = json.loads((ROOT / "governance/frozen.json").read_text())["files"]
    git(ROOT, "rev-parse", "--verify", args.base)
    stored = subprocess.run(
        ["git", "-C", str(ROOT), "show", f"{args.base}:governance/frozen.json"],
        capture_output=True, text=True,
    )
    # 首次治理之前没有清单；有清单时既有条目只能追加。
    previous = json.loads(stored.stdout)["files"] if stored.returncode == 0 else {}
    for name, digest in previous.items():
        if frozen.get(name) != digest:
            errors.append(f"既有固定条目被删除或修改：{name}")
    for name, digest in frozen.items():
        path = ROOT / name
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            errors.append(f"固定文件缺失或指纹变化：{name}")
    migrated = json.loads((ROOT / "governance/migration-2026-10-22.json").read_text())["records"]
    for item in migrated:
        repo = ROOT.parent / item["repository"]
        original = subprocess.check_output([
            "git", "-C", str(repo), "show", f"{item['source_commit']}:{item['source']}"
        ])
        if hashlib.sha256(original).hexdigest() != item["source_sha256"]:
            errors.append(f"迁移来源指纹不一致：{item['source']}")
        target = ROOT / item["destination"]
        if not target.is_file() or hashlib.sha256(target.read_bytes()).hexdigest() != item["destination_sha256"]:
            errors.append(f"迁移目标缺失或指纹变化：{item['destination']}")
        if item["destination"] not in frozen:
            errors.append(f"迁移目标未固定：{item['destination']}")
    for repo_name in REPOS.values():
        repo = ROOT.parent / repo_name
        items = [item for item in migrated if item["repository"] == repo_name]
        if len({item["source_commit"] for item in items}) != 1:
            errors.append(f"迁移来源提交不唯一：{repo_name}")
            continue
        source = items[0]["source_commit"]
        files = set(git(repo, "ls-tree", "-r", "--name-only", source, "docs/").splitlines())
        recorded = {item["source"] for item in items}
        if recorded != files or len(items) != len(recorded):
            errors.append(f"来源文档覆盖不完整或重复：{repo_name}")
    branch = git(ROOT, "branch", "--show-current")
    markdown = list(ROOT.rglob("*.md"))
    for end, repo_name in REPOS.items():
        repo = ROOT.parent / repo_name
        if (repo / "docs").exists():
            errors.append(f"开发仓库仍保留 docs/：{repo_name}")
        if args.same_branch and git(repo, "branch", "--show-current") != branch:
            errors.append(f"开发仓库与 docs 分支不一致：{repo_name}")
        for name in ("AGENTS.md", "README.md"):
            path = repo / name
            if f"../docs/development/{end}/README.md" not in path.read_text():
                errors.append(f"缺少本端文档入口：{repo_name}/{name}")
        markdown += list(repo.glob("README*.md")) + [repo / "AGENTS.md"]
    historical = {
        (ROOT.parent / item["repository"] / item["source"]).resolve(): ROOT / item["destination"]
        for item in migrated
    }
    historical_links = 0
    for path in markdown:
        # 只校验 Markdown 行内文件链接，不访问网络，也不验证锚点。
        text = re.sub(r"```.*?```", "", path.read_text(), flags=re.S)
        for match in re.finditer(r"\]\((<[^>]+>|[^\s)]+)", text):
            href = match.group(1).strip("<>")
            parsed = urlsplit(href)
            if parsed.scheme or not parsed.path:
                continue
            target = path.parent / unquote(parsed.path)
            fixed = path.is_relative_to(ROOT) and str(path.relative_to(ROOT)) in frozen
            if not target.exists() and fixed:
                mapped = historical.get(target.resolve())
                if mapped is not None and mapped.exists():
                    historical_links += 1
                    continue
            if not target.exists():
                errors.append(f"本地链接失效：{path.relative_to(ROOT.parent)} -> {href}")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"文档检查通过：{len(frozen)} 个固定文件，{len(migrated)} 个来源映射，当前本地链接可解析，{historical_links} 个固定契约旧链接可按迁移映射定位。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
