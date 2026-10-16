#!/usr/bin/env python3
"""Minimal local gate checks; not a semantic validator."""
from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
checks = {
 'G1': ['docs/requirements/original.md','docs/requirements/baseline.md','docs/reviews/requirements-review.md','docs/approvals/G1.md'],
 'G2': ['docs/approvals/G1.md','docs/design/options.md','docs/approvals/G2.md'],
 'G3': ['docs/approvals/G1.md','docs/approvals/G2.md','docs/design/architecture.md','docs/design/database.md','docs/design/api.md','docs/reviews/architecture-review.md','docs/approvals/G3.md'],
}
if len(sys.argv)!=2 or sys.argv[1] not in checks:
 print('Usage: python3 scripts/check_gate.py G1|G2|G3');sys.exit(2)
gate=sys.argv[1]; errors=[]
for name in checks[gate]:
 p=root/name
 if not p.is_file() or not p.read_text(encoding='utf-8').strip(): errors.append(f'missing/empty: {name}')
for g in ['G1','G2','G3'][:['G1','G2','G3'].index(gate)+1]:
 p=root/f'docs/approvals/{g}.md'
 if p.is_file() and '批准' not in p.read_text(encoding='utf-8'):errors.append(f'approval not explicit: {p.relative_to(root)}')
print(('PASS' if not errors else 'FAIL')+f' {gate} (structural check only)')
for e in errors: print(' -',e)
sys.exit(bool(errors))
