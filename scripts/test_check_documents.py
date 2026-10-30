"""验证历史归档例外不能掩盖当前内容损坏或新增过程文档。"""
import hashlib
from pathlib import Path
import tempfile
import unittest

from check_documents import document_layout_errors, fixed_errors
from document_history import relative_path, retirement_errors


class DocumentIntegrityTests(unittest.TestCase):
    def test_missing_live_fixed_file_is_not_covered_by_other_archive(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            archived = b"old evidence"
            digest = hashlib.sha256(archived).hexdigest()
            errors = fixed_errors(root, {"live.md": digest, "old.md": digest}, {"old.md": archived})
            self.assertEqual(errors, ["固定文件缺失或指纹变化：live.md"])

    def test_tampered_archive_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "README.md").write_text("current")
            record = {"files": {"old.md": {"sha256": hashlib.sha256(b"original").hexdigest(), "replacement": "README.md"}}, "replaced": []}
            self.assertIn("历史原文指纹不一致：old.md", retirement_errors(root, record, {"old.md": b"changed"}))

    def test_archive_cannot_return_or_point_to_missing_replacement(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "old.md").write_text("original")
            record = {"files": {"old.md": {"sha256": hashlib.sha256(b"original").hexdigest(), "replacement": "missing.md"}}, "replaced": []}
            errors = retirement_errors(root, record, {"old.md": b"original"})
            self.assertTrue(any("重新进入" in error for error in errors))
            self.assertTrue(any("去向无效" in error for error in errors))

    def test_replaced_index_still_requires_current_file(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            record = {"files": {"README.md": {"sha256": hashlib.sha256(b"old index").hexdigest(), "replacement": "README.md"}}, "replaced": ["README.md"]}
            self.assertTrue(any("当前替换索引缺失" in error for error in retirement_errors(root, record, {"README.md": b"old index"})))
            (root / "README.md").write_text("new index")
            self.assertEqual(retirement_errors(root, record, {"README.md": b"old index"}), [])

    def test_path_escape_or_batch_injection_is_rejected(self):
        for name in ("../secret", "/outside", "nested/../../secret", "old.md\nHEAD:other.md", "a\\b", "a/./b"):
            with self.subTest(name=name), self.assertRaises(ValueError):
                relative_path(name)

    def test_only_three_documents_per_end(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for end in ("backend", "admin", "miniprogram"):
                folder = root / "development" / end
                folder.mkdir(parents=True)
                for name in ("README.md", "defects.md", "plan.md"):
                    (folder / name).write_text("current")
            self.assertEqual(document_layout_errors(root), [])
            extra = root / "development/admin/validation/new-log.txt"
            extra.parent.mkdir()
            extra.write_text("new process artifact")
            self.assertTrue(any("多余" in error for error in document_layout_errors(root)))


if __name__ == "__main__":
    unittest.main()
